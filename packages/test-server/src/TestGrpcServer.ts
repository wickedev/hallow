/**
 * TestGrpcServer: Lifecycle management for gRPC test server
 *
 * Provides programmatic control over the NestJS gRPC server for integration tests.
 * Supports:
 * - Configurable port and services
 * - Health check endpoint for readiness verification
 * - Proper cleanup on shutdown
 * - Port conflict detection and clear error messages
 */

import { NestFactory } from '@nestjs/core';
import { INestApplication, INestMicroservice } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ReflectionService } from '@grpc/reflection';
import { join } from 'path';
import * as net from 'net';

/**
 * Configuration options for TestGrpcServer
 */
export interface TestGrpcServerOptions {
  /**
   * HTTP port for health checks and REST endpoints (default: 3000)
   */
  httpPort?: number;

  /**
   * gRPC port for gRPC services (default: 50051)
   */
  grpcPort?: number;

  /**
   * Path to proto files (default: src/proto)
   */
  protoPath?: string;

  /**
   * Enable verbose logging (default: false)
   */
  debug?: boolean;

  /**
   * Services to register (default: all services)
   */
  services?: string[];

  /**
   * Module to use for bootstrapping (default: AppModule)
   */
  module?: any;
}

/**
 * TestGrpcServer manages the lifecycle of a gRPC test server
 */
export class TestGrpcServer {
  private app?: INestApplication;
  private grpcApp?: INestMicroservice;
  private httpPort: number;
  private grpcPort: number;
  private debug: boolean;
  private protoPath: string;

  constructor(private options: TestGrpcServerOptions = {}) {
    this.httpPort = options.httpPort || 3000;
    this.grpcPort = options.grpcPort || 50051;
    this.debug = options.debug || false;
    this.protoPath = options.protoPath || join(__dirname, 'proto');
  }

  /**
   * Start the test server with HTTP and gRPC services
   */
  async start(): Promise<void> {
    try {
      // Check if ports are available before starting
      await this.checkPortAvailable(this.httpPort, 'HTTP');
      await this.checkPortAvailable(this.grpcPort, 'gRPC');

      if (this.debug) {
        console.log('🔧 Starting TestGrpcServer...');
        console.log(`   HTTP Port: ${this.httpPort}`);
        console.log(`   gRPC Port: ${this.grpcPort}`);
        console.log(`   Proto Path: ${this.protoPath}`);
      }

      // Dynamically import AppModule to avoid circular dependencies
      const { AppModule, grpcClientOptions } = await import('./app.module');
      const moduleToUse = this.options.module || AppModule;

      // Create hybrid application (HTTP + gRPC)
      this.app = await NestFactory.create(moduleToUse, {
        logger: this.debug ? ['log', 'error', 'warn', 'debug'] : ['error'],
      });

      // Configure gRPC microservice with reflection
      const grpcOptionsWithReflection: MicroserviceOptions = {
        ...grpcClientOptions,
        options: {
          ...grpcClientOptions.options,
          url: `0.0.0.0:${this.grpcPort}`,
          onLoadPackageDefinition: (pkg, server) => {
            // Add reflection service to the gRPC server
            new ReflectionService(pkg).addToServer(server);
          },
        },
      };

      this.grpcApp = this.app.connectMicroservice<MicroserviceOptions>(grpcOptionsWithReflection);

      // Start both HTTP and gRPC servers
      await this.app.startAllMicroservices();
      await this.app.listen(this.httpPort);

      // Wait for server to be ready
      await this.waitForReady();

      if (this.debug) {
        console.log('✅ TestGrpcServer started successfully');
        console.log(`   - HTTP: http://localhost:${this.httpPort}`);
        console.log(`   - gRPC: localhost:${this.grpcPort}`);
        console.log(`   - Health: http://localhost:${this.httpPort}/health`);
      }
    } catch (error) {
      if (this.debug) {
        console.error('❌ Failed to start TestGrpcServer:', error);
      }
      await this.cleanup();
      throw error;
    }
  }

  /**
   * Stop the test server and clean up resources
   */
  async stop(): Promise<void> {
    try {
      if (this.debug) {
        console.log('🛑 Stopping TestGrpcServer...');
      }

      await this.cleanup();

      if (this.debug) {
        console.log('✅ TestGrpcServer stopped successfully');
      }
    } catch (error) {
      if (this.debug) {
        console.error('❌ Error stopping TestGrpcServer:', error);
      }
      throw error;
    }
  }

  /**
   * Check if the server is healthy and ready to accept requests
   */
  async isHealthy(): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:${this.httpPort}/health`);
      if (!response.ok) {
        return false;
      }

      const health = await response.json();
      return health.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for the server to become ready
   */
  private async waitForReady(maxAttempts = 30, delayMs = 200): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      if (await this.isHealthy()) {
        return;
      }
      await this.sleep(delayMs);
    }

    throw new Error(
      `TestGrpcServer failed to become ready after ${(maxAttempts * delayMs) / 1000}s`,
    );
  }

  /**
   * Check if a port is available
   */
  private async checkPortAvailable(port: number, label: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const server = net.createServer();

      server.once('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          reject(
            new Error(
              `${label} port ${port} is already in use. Please ensure no other server is running on this port, or configure a different port in TestGrpcServerOptions.`,
            ),
          );
        } else {
          reject(err);
        }
      });

      server.once('listening', () => {
        server.close();
        resolve();
      });

      server.listen(port);
    });
  }

  /**
   * Clean up server resources
   */
  private async cleanup(): Promise<void> {
    const errors: Error[] = [];

    // Close gRPC microservice
    if (this.grpcApp) {
      try {
        await this.grpcApp.close();
        this.grpcApp = undefined;
      } catch (error) {
        errors.push(error as Error);
      }
    }

    // Close HTTP application
    if (this.app) {
      try {
        await this.app.close();
        this.app = undefined;
      } catch (error) {
        errors.push(error as Error);
      }
    }

    if (errors.length > 0) {
      throw new Error(`Errors during cleanup: ${errors.map(e => e.message).join(', ')}`);
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get the HTTP port
   */
  getHttpPort(): number {
    return this.httpPort;
  }

  /**
   * Get the gRPC port
   */
  getGrpcPort(): number {
    return this.grpcPort;
  }

  /**
   * Get the HTTP URL
   */
  getHttpUrl(): string {
    return `http://localhost:${this.httpPort}`;
  }

  /**
   * Get the gRPC URL
   */
  getGrpcUrl(): string {
    return `localhost:${this.grpcPort}`;
  }
}
