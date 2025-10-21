/**
 * Test Server Helper Utilities
 *
 * Provides utilities for managing the test gRPC server in integration tests
 */

import { ChildProcess, spawn } from 'child_process';
import * as path from 'path';

export interface ServerConfig {
  httpPort: number;
  grpcPort: number;
  startupTimeout: number; // milliseconds
}

export class TestServerHelper {
  private serverProcess: ChildProcess | null = null;
  private readonly config: ServerConfig;
  private readonly testServerPath: string;

  constructor(config?: Partial<ServerConfig>) {
    this.config = {
      httpPort: config?.httpPort || 3000,
      grpcPort: config?.grpcPort || 50051,
      startupTimeout: config?.startupTimeout || 10000,
    };

    // Resolve path to test-server package
    this.testServerPath = path.resolve(__dirname, '../../../../test-server');
  }

  /**
   * Start the test gRPC server
   */
  async start(): Promise<void> {
    if (this.serverProcess) {
      console.warn('Server is already running');
      return;
    }

    return new Promise((resolve, reject) => {
      const startTimeout = setTimeout(() => {
        reject(new Error('Server startup timeout'));
      }, this.config.startupTimeout);

      // Start server process
      this.serverProcess = spawn('yarn', ['start:prod'], {
        cwd: this.testServerPath,
        stdio: 'pipe',
        env: {
          ...process.env,
          HTTP_PORT: String(this.config.httpPort),
          GRPC_PORT: String(this.config.grpcPort),
        },
      });

      // Capture server output
      this.serverProcess.stdout?.on('data', (data) => {
        const output = data.toString();
        console.log('[Test Server]:', output);

        // Check for startup completion message
        if (output.includes('NestJS gRPC Test Server is running')) {
          clearTimeout(startTimeout);
          resolve();
        }
      });

      this.serverProcess.stderr?.on('data', (data) => {
        console.error('[Test Server Error]:', data.toString());
      });

      this.serverProcess.on('error', (error) => {
        clearTimeout(startTimeout);
        reject(error);
      });

      this.serverProcess.on('exit', (code) => {
        if (code !== 0 && code !== null) {
          clearTimeout(startTimeout);
          reject(new Error(`Server exited with code ${code}`));
        }
      });
    });
  }

  /**
   * Stop the test gRPC server
   */
  async stop(): Promise<void> {
    if (!this.serverProcess) {
      return;
    }

    return new Promise((resolve) => {
      if (!this.serverProcess) {
        resolve();
        return;
      }

      this.serverProcess.on('exit', () => {
        this.serverProcess = null;
        resolve();
      });

      // Send SIGTERM
      this.serverProcess.kill('SIGTERM');

      // Force kill after timeout
      setTimeout(() => {
        if (this.serverProcess) {
          this.serverProcess.kill('SIGKILL');
          this.serverProcess = null;
          resolve();
        }
      }, 5000);
    });
  }

  /**
   * Check if server is healthy and responsive
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`http://localhost:${this.config.httpPort}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for server to be ready
   */
  async waitForReady(maxAttempts: number = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      const isHealthy = await this.healthCheck();
      if (isHealthy) {
        return;
      }
      await this.delay(1000);
    }
    throw new Error('Server did not become ready in time');
  }

  /**
   * Get server base URL for gRPC-web
   */
  getBaseUrl(): string {
    return `http://localhost:${this.config.httpPort}`;
  }

  /**
   * Get server gRPC address
   */
  getGrpcAddress(): string {
    return `localhost:${this.config.grpcPort}`;
  }

  /**
   * Check if server is currently running
   */
  isRunning(): boolean {
    return this.serverProcess !== null && !this.serverProcess.killed;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Singleton instance for tests
 */
let serverInstance: TestServerHelper | null = null;

/**
 * Get or create server helper instance
 */
export function getServerHelper(config?: Partial<ServerConfig>): TestServerHelper {
  if (!serverInstance) {
    serverInstance = new TestServerHelper(config);
  }
  return serverInstance;
}

/**
 * Setup server for test suite (beforeAll)
 */
export async function setupTestServer(config?: Partial<ServerConfig>): Promise<TestServerHelper> {
  const server = getServerHelper(config);

  if (!server.isRunning()) {
    await server.start();
    await server.waitForReady();
  }

  return server;
}

/**
 * Teardown server after test suite (afterAll)
 */
export async function teardownTestServer(): Promise<void> {
  if (serverInstance) {
    await serverInstance.stop();
    serverInstance = null;
  }
}

/**
 * Check if test server is already running (external process)
 */
export async function isExternalServerRunning(port: number = 3000): Promise<boolean> {
  try {
    const response = await fetch(`http://localhost:${port}/health`);
    return response.ok;
  } catch (error) {
    return false;
  }
}
