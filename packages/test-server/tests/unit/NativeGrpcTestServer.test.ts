/**
 * Unit tests for NativeGrpcTestServer
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import { NativeGrpcTestServer } from '../../src/native-grpc/NativeGrpcTestServer';

describe('NativeGrpcTestServer', () => {
  let server: NativeGrpcTestServer;

  afterEach(async () => {
    if (server && server.isListening()) {
      await server.stop();
    }
  });

  describe('constructor', () => {
    it('should create server with default configuration', () => {
      server = new NativeGrpcTestServer();

      expect(server.getPort()).toBe(50051);
      expect(server.getAddress()).toBe('127.0.0.1:50051');
      expect(server.isListening()).toBe(false);
    });

    it('should create server with custom configuration', () => {
      server = new NativeGrpcTestServer({
        port: 50052,
        host: 'localhost',
        debug: true,
      });

      expect(server.getPort()).toBe(50052);
      expect(server.getAddress()).toBe('localhost:50052');
    });
  });

  describe('lifecycle', () => {
    it('should start and stop server', async () => {
      server = new NativeGrpcTestServer({ port: 50053 });

      expect(server.isListening()).toBe(false);

      await server.start();
      expect(server.isListening()).toBe(true);

      await server.stop();
      expect(server.isListening()).toBe(false);
    });

    it('should throw when starting already running server', async () => {
      server = new NativeGrpcTestServer({ port: 50054 });

      await server.start();
      await expect(server.start()).rejects.toThrow('Server is already running');

      await server.stop();
    });

    it('should not throw when stopping non-running server', async () => {
      server = new NativeGrpcTestServer({ port: 50055 });

      await expect(server.stop()).resolves.toBeUndefined();
    });

    it('should force shutdown server', async () => {
      server = new NativeGrpcTestServer({ port: 50056 });

      await server.start();
      expect(server.isListening()).toBe(true);

      server.forceShutdown();
      expect(server.isListening()).toBe(false);
    });
  });

  describe('GetUser RPC', () => {
    let client: any;

    beforeEach(async () => {
      server = new NativeGrpcTestServer({ port: 50057 });
      await server.start();

      // Create gRPC client
      const PROTO_PATH = path.join(__dirname, '../../src/proto/service.proto');
      const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      const protoDescriptor = grpc.loadPackageDefinition(
        packageDefinition
      ) as any;
      const UserService = protoDescriptor.test.services.UserService;

      client = new UserService(
        server.getAddress(),
        grpc.credentials.createInsecure()
      );
    });

    afterEach(async () => {
      if (client) {
        client.close();
      }
      if (server) {
        await server.stop();
      }
    });

    it('should return existing user', (done) => {
      client.GetUser({ user_id: '1' }, (error: any, response: any) => {
        expect(error).toBeNull();
        expect(response).toEqual({
          id: '1',
          name: 'Alice',
          email: 'alice@example.com',
        });
        done();
      });
    });

    it('should return NOT_FOUND for non-existent user', (done) => {
      client.GetUser({ user_id: '999' }, (error: any, response: any) => {
        expect(error).not.toBeNull();
        expect(error.code).toBe(grpc.status.NOT_FOUND);
        expect(error.message).toContain('User with id 999 not found');
        done();
      });
    });

    it('should return NOT_FOUND for error-not-found userId', (done) => {
      client.GetUser(
        { user_id: 'error-not-found' },
        (error: any, response: any) => {
          expect(error).not.toBeNull();
          expect(error.code).toBe(grpc.status.NOT_FOUND);
          expect(error.message).toContain('User with id error-not-found not found');
          done();
        }
      );
    });

    it('should return INTERNAL for error-internal userId', (done) => {
      client.GetUser(
        { user_id: 'error-internal' },
        (error: any, response: any) => {
          expect(error).not.toBeNull();
          expect(error.code).toBe(grpc.status.INTERNAL);
          expect(error.message).toContain('Simulated internal error');
          done();
        }
      );
    });

    it('should return UNAVAILABLE for error-unavailable userId', (done) => {
      client.GetUser(
        { user_id: 'error-unavailable' },
        (error: any, response: any) => {
          expect(error).not.toBeNull();
          expect(error.code).toBe(grpc.status.UNAVAILABLE);
          expect(error.message).toContain('Simulated unavailability');
          done();
        }
      );
    });

    it('should return DEADLINE_EXCEEDED for error-deadline userId', (done) => {
      client.GetUser(
        { user_id: 'error-deadline' },
        (error: any, response: any) => {
          expect(error).not.toBeNull();
          expect(error.code).toBe(grpc.status.DEADLINE_EXCEEDED);
          expect(error.message).toContain('Simulated deadline exceeded');
          done();
        }
      );
    });
  });

  describe('ListUsers RPC', () => {
    let client: any;

    beforeEach(async () => {
      server = new NativeGrpcTestServer({ port: 50058 });
      await server.start();

      // Create gRPC client
      const PROTO_PATH = path.join(__dirname, '../../src/proto/service.proto');
      const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      const protoDescriptor = grpc.loadPackageDefinition(
        packageDefinition
      ) as any;
      const UserService = protoDescriptor.test.services.UserService;

      client = new UserService(
        server.getAddress(),
        grpc.credentials.createInsecure()
      );
    });

    afterEach(async () => {
      if (client) {
        client.close();
      }
      if (server) {
        await server.stop();
      }
    });

    it('should stream all users with page_size=10', (done) => {
      const call = client.ListUsers({ page_size: 10 });
      const responses: any[] = [];

      call.on('data', (response: any) => {
        responses.push(response);
      });

      call.on('end', () => {
        expect(responses.length).toBe(1); // All 5 users in one chunk
        expect(responses[0].users).toHaveLength(5);
        expect(responses[0].next_page_token).toBe('');
        done();
      });

      call.on('error', (error: any) => {
        done(error);
      });
    });

    it('should stream users in chunks with page_size=2', (done) => {
      const call = client.ListUsers({ page_size: 2 });
      const responses: any[] = [];

      call.on('data', (response: any) => {
        responses.push(response);
      });

      call.on('end', () => {
        expect(responses.length).toBe(3); // 2+2+1 users
        expect(responses[0].users).toHaveLength(2);
        expect(responses[0].next_page_token).toBe('page_1');
        expect(responses[1].users).toHaveLength(2);
        expect(responses[1].next_page_token).toBe('page_2');
        expect(responses[2].users).toHaveLength(1);
        expect(responses[2].next_page_token).toBe('');
        done();
      });

      call.on('error', (error: any) => {
        done(error);
      });
    });

    it('should return INVALID_ARGUMENT for page_size=-1', (done) => {
      const call = client.ListUsers({ page_size: -1 });
      let errorReceived = false;

      call.on('data', () => {
        done(new Error('Should not receive data'));
      });

      call.on('end', () => {
        if (!errorReceived) {
          done(new Error('Should not end without error'));
        }
      });

      call.on('error', (error: any) => {
        errorReceived = true;
        expect(error.code).toBe(grpc.status.INVALID_ARGUMENT);
        expect(error.message).toContain('Page size must be positive');
        done();
      });
    });

    it('should return UNAVAILABLE for page_size=-2', (done) => {
      const call = client.ListUsers({ page_size: -2 });
      let errorReceived = false;

      call.on('data', () => {
        done(new Error('Should not receive data'));
      });

      call.on('end', () => {
        if (!errorReceived) {
          done(new Error('Should not end without error'));
        }
      });

      call.on('error', (error: any) => {
        errorReceived = true;
        expect(error.code).toBe(grpc.status.UNAVAILABLE);
        expect(error.message).toContain('Simulated unavailability');
        done();
      });
    });
  });

  describe('data management', () => {
    beforeEach(() => {
      server = new NativeGrpcTestServer({ port: 50059 });
    });

    it('should add user', async () => {
      await server.start();

      server.addUser({
        id: '100',
        name: 'Test User',
        email: 'test@example.com',
      });

      // Create client to verify
      const PROTO_PATH = path.join(__dirname, '../../src/proto/service.proto');
      const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      const protoDescriptor = grpc.loadPackageDefinition(
        packageDefinition
      ) as any;
      const UserService = protoDescriptor.test.services.UserService;

      const client = new UserService(
        server.getAddress(),
        grpc.credentials.createInsecure()
      );

      await new Promise<void>((resolve, reject) => {
        client.GetUser({ user_id: '100' }, (error: any, response: any) => {
          if (error) {
            reject(error);
          } else {
            expect(response).toEqual({
              id: '100',
              name: 'Test User',
              email: 'test@example.com',
            });
            client.close();
            resolve();
          }
        });
      });

      await server.stop();
    });

    it('should clear all users', async () => {
      await server.start();

      server.clearUsers();

      // Create client to verify
      const PROTO_PATH = path.join(__dirname, '../../src/proto/service.proto');
      const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      const protoDescriptor = grpc.loadPackageDefinition(
        packageDefinition
      ) as any;
      const UserService = protoDescriptor.test.services.UserService;

      const client = new UserService(
        server.getAddress(),
        grpc.credentials.createInsecure()
      );

      await new Promise<void>((resolve, reject) => {
        const call = client.ListUsers({ page_size: 10 });
        const responses: any[] = [];

        call.on('data', (response: any) => {
          responses.push(response);
        });

        call.on('end', () => {
          // When there are no users, no data is streamed (empty stream)
          expect(responses.length).toBe(0);
          client.close();
          resolve();
        });

        call.on('error', reject);
      });

      await server.stop();
    });

    it('should reset to initial users', async () => {
      await server.start();

      // Clear first
      server.clearUsers();

      // Add custom user
      server.addUser({
        id: '999',
        name: 'Custom',
        email: 'custom@example.com',
      });

      // Reset
      server.resetUsers();

      // Create client to verify
      const PROTO_PATH = path.join(__dirname, '../../src/proto/service.proto');
      const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      const protoDescriptor = grpc.loadPackageDefinition(
        packageDefinition
      ) as any;
      const UserService = protoDescriptor.test.services.UserService;

      const client = new UserService(
        server.getAddress(),
        grpc.credentials.createInsecure()
      );

      await new Promise<void>((resolve, reject) => {
        const call = client.ListUsers({ page_size: 10 });
        const responses: any[] = [];

        call.on('data', (response: any) => {
          responses.push(response);
        });

        call.on('end', () => {
          expect(responses.length).toBe(1);
          expect(responses[0].users).toHaveLength(5); // Back to 5 initial users
          expect(responses[0].users[0].name).toBe('Alice');
          client.close();
          resolve();
        });

        call.on('error', reject);
      });

      await server.stop();
    });
  });
});
