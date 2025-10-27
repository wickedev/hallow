/**
 * Unit Tests: TestGrpcServer
 *
 * Tests server lifecycle management including:
 * - Server start and stop
 * - Port conflict detection
 * - Health check verification
 * - Resource cleanup
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { TestGrpcServer, TestGrpcServerOptions } from '../src/TestGrpcServer';
import * as net from 'net';

describe('TestGrpcServer', () => {
  let server: TestGrpcServer;

  afterEach(async () => {
    // Always clean up server after each test
    if (server) {
      try {
        await server.stop();
      } catch (error) {
        // Ignore cleanup errors in tests
      }
    }
  });

  describe('constructor', () => {
    it('should create server with default options', () => {
      server = new TestGrpcServer();

      expect(server).toBeDefined();
      expect(server.getHttpPort()).toBe(3000);
      expect(server.getGrpcPort()).toBe(50051);
    });

    it('should create server with custom ports', () => {
      server = new TestGrpcServer({
        httpPort: 4000,
        grpcPort: 50052,
      });

      expect(server.getHttpPort()).toBe(4000);
      expect(server.getGrpcPort()).toBe(50052);
    });
  });

  describe('start', () => {
    it('should start server successfully with default options', async () => {
      server = new TestGrpcServer({ debug: false });

      await expect(server.start()).resolves.not.toThrow();

      // Verify server is healthy
      const healthy = await server.isHealthy();
      expect(healthy).toBe(true);
    }, 30000);

    it('should start server on custom ports', async () => {
      server = new TestGrpcServer({
        httpPort: 3001,
        grpcPort: 50052,
        debug: false,
      });

      await expect(server.start()).resolves.not.toThrow();

      const healthy = await server.isHealthy();
      expect(healthy).toBe(true);
    }, 30000);

    it('should throw error if HTTP port is already in use', async () => {
      // Create a server to occupy the port
      const blockingServer = net.createServer();
      await new Promise<void>(resolve => {
        blockingServer.listen(3002, resolve);
      });

      try {
        server = new TestGrpcServer({
          httpPort: 3002,
          grpcPort: 50053,
          debug: false,
        });

        await expect(server.start()).rejects.toThrow(/HTTP port 3002 is already in use/);
      } finally {
        blockingServer.close();
      }
    }, 30000);

    it('should throw error if gRPC port is already in use', async () => {
      // Create a server to occupy the port
      const blockingServer = net.createServer();
      await new Promise<void>(resolve => {
        blockingServer.listen(50054, resolve);
      });

      try {
        server = new TestGrpcServer({
          httpPort: 3003,
          grpcPort: 50054,
          debug: false,
        });

        await expect(server.start()).rejects.toThrow(/gRPC port 50054 is already in use/);
      } finally {
        blockingServer.close();
      }
    }, 30000);
  });

  describe('stop', () => {
    it('should stop server successfully', async () => {
      server = new TestGrpcServer({
        httpPort: 3004,
        grpcPort: 50055,
        debug: false,
      });

      await server.start();

      // Verify server is running
      expect(await server.isHealthy()).toBe(true);

      // Stop server
      await server.stop();

      // Verify server is stopped
      expect(await server.isHealthy()).toBe(false);
    }, 30000);

    it('should allow starting server again after stop', async () => {
      server = new TestGrpcServer({
        httpPort: 3005,
        grpcPort: 50056,
        debug: false,
      });

      // Start and stop cycle 1
      await server.start();
      expect(await server.isHealthy()).toBe(true);
      await server.stop();
      expect(await server.isHealthy()).toBe(false);

      // Start and stop cycle 2
      await server.start();
      expect(await server.isHealthy()).toBe(true);
      await server.stop();
      expect(await server.isHealthy()).toBe(false);
    }, 60000);
  });

  describe('isHealthy', () => {
    it('should return false when server is not started', async () => {
      server = new TestGrpcServer({
        httpPort: 3006,
        grpcPort: 50057,
      });

      const healthy = await server.isHealthy();
      expect(healthy).toBe(false);
    });

    it('should return true when server is running', async () => {
      server = new TestGrpcServer({
        httpPort: 3007,
        grpcPort: 50058,
        debug: false,
      });

      await server.start();

      const healthy = await server.isHealthy();
      expect(healthy).toBe(true);
    }, 30000);

    it('should return false after server is stopped', async () => {
      server = new TestGrpcServer({
        httpPort: 3008,
        grpcPort: 50059,
        debug: false,
      });

      await server.start();
      expect(await server.isHealthy()).toBe(true);

      await server.stop();
      expect(await server.isHealthy()).toBe(false);
    }, 30000);
  });

  describe('getters', () => {
    it('should return correct HTTP URL', () => {
      server = new TestGrpcServer({
        httpPort: 3009,
        grpcPort: 50060,
      });

      expect(server.getHttpUrl()).toBe('http://localhost:3009');
    });

    it('should return correct gRPC URL', () => {
      server = new TestGrpcServer({
        httpPort: 3010,
        grpcPort: 50061,
      });

      expect(server.getGrpcUrl()).toBe('localhost:50061');
    });

    it('should return correct ports', () => {
      server = new TestGrpcServer({
        httpPort: 3011,
        grpcPort: 50062,
      });

      expect(server.getHttpPort()).toBe(3011);
      expect(server.getGrpcPort()).toBe(50062);
    });
  });

  describe('resource cleanup', () => {
    it('should clean up resources even if stop fails', async () => {
      server = new TestGrpcServer({
        httpPort: 3012,
        grpcPort: 50063,
        debug: false,
      });

      await server.start();

      // Stopping twice should not throw
      await server.stop();
      await expect(server.stop()).resolves.not.toThrow();
    }, 30000);
  });
});
