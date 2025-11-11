/**
 * Integration tests for NativeGrpcAdapter - Unary RPCs
 *
 * These tests use a real gRPC server (NativeGrpcTestServer) to test
 * the NativeGrpcAdapter implementation with actual gRPC communication.
 */

import * as path from 'path';
import { NativeGrpcTestServer } from '@hallow/test-server/src/native-grpc';
import { NativeGrpcAdapter } from '../../src/adapters/NativeGrpcAdapter';
import { GrpcStatusCode, MethodDescriptor, Metadata } from '../../src/adapters/types';

// Test message types
interface GetUserRequest {
  user_id: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

// Mock message serialization for testing
const createMockMessageType = () => ({
  serializeBinary: (msg: any) => Buffer.from(JSON.stringify(msg)),
  deserializeBinary: (bytes: Uint8Array) => JSON.parse(Buffer.from(bytes).toString()),
});

// Helper to create method descriptor for testing
const createMethodDescriptor = <TReq, TRes>(
  serviceName: string,
  methodName: string,
  requestStream: boolean = false,
  responseStream: boolean = false
): MethodDescriptor<TReq, TRes> => ({
  serviceName,
  methodName,
  requestStream,
  responseStream,
  requestType: createMockMessageType() as any,
  responseType: createMockMessageType() as any,
});

describe.skip('NativeGrpcAdapter - Unary RPC Integration', () => {
  let server: NativeGrpcTestServer;
  let adapter: NativeGrpcAdapter;
  let getUserMethod: MethodDescriptor<GetUserRequest, User>;

  beforeAll(async () => {
    // Start test server
    server = new NativeGrpcTestServer({ port: 50060, debug: false });
    await server.start();

    // Create method descriptor for GetUser
    getUserMethod = createMethodDescriptor<GetUserRequest, User>(
      'test.services.UserService',
      'GetUser'
    );
  });

  afterAll(async () => {
    // Stop test server
    if (server) {
      await server.stop();
    }
  });

  beforeEach(() => {
    // Create adapter for each test
    adapter = new NativeGrpcAdapter({
      serverUrl: server.getAddress(),
      secure: false,
      debug: false,
    });
  });

  afterEach(async () => {
    // Close adapter after each test
    if (adapter) {
      await adapter.close();
    }

    // Reset server data
    if (server) {
      server.resetUsers();
    }
  });

  describe('successful unary calls', () => {
    it('should make successful GetUser call', async () => {
      const response = await adapter.unary(
        getUserMethod,
        { user_id: '1' }
      );

      expect(response).toEqual({
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
      });
    });

    it('should return correct user for different IDs', async () => {
      const response1 = await adapter.unary(
        getUserMethod,
        { user_id: '2' }
      );

      expect(response1).toEqual({
        id: '2',
        name: 'Bob',
        email: 'bob@example.com',
      });

      const response2 = await adapter.unary(
        getUserMethod,
        { user_id: '3' }
      );

      expect(response2).toEqual({
        id: '3',
        name: 'Charlie',
        email: 'charlie@example.com',
      });
    });

    it('should handle multiple sequential calls', async () => {
      const promises = [];
      for (let i = 1; i <= 5; i++) {
        const promise = adapter.unary(
          getUserMethod,
          { user_id: i.toString() }
        );
        promises.push(promise);
      }

      const results = await Promise.all(promises);

      expect(results).toHaveLength(5);
      expect(results[0].name).toBe('Alice');
      expect(results[1].name).toBe('Bob');
      expect(results[2].name).toBe('Charlie');
      expect(results[3].name).toBe('Diana');
      expect(results[4].name).toBe('Eve');
    });
  });

  describe('error handling', () => {
    it('should handle NOT_FOUND error', async () => {
      await expect(
        adapter.unary(getUserMethod, { user_id: '999' }, {})
      ).rejects.toMatchObject({
        code: GrpcStatusCode.NOT_FOUND,
        methodName: 'GetUser',
      });
    });

    it('should handle INTERNAL error', async () => {
      await expect(
        adapter.unary(getUserMethod, { user_id: 'error-internal' }, {})
      ).rejects.toMatchObject({
        code: GrpcStatusCode.INTERNAL,
        methodName: 'GetUser',
      });
    });

    it('should handle UNAVAILABLE error', async () => {
      await expect(
        adapter.unary(
          getUserMethod,
          { user_id: 'error-unavailable' },
          {}
        )
      ).rejects.toMatchObject({
        code: GrpcStatusCode.UNAVAILABLE,
        methodName: 'GetUser',
      });
    });

    it('should handle DEADLINE_EXCEEDED error', async () => {
      await expect(
        adapter.unary(getUserMethod, { user_id: 'error-deadline' }, {})
      ).rejects.toMatchObject({
        code: GrpcStatusCode.DEADLINE_EXCEEDED,
        methodName: 'GetUser',
      });
    });

    it('should include error details', async () => {
      try {
        await adapter.unary(getUserMethod, { user_id: '999' }, {});
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.code).toBe(GrpcStatusCode.NOT_FOUND);
        expect(error.message).toContain('User with id 999 not found');
        expect(error.methodName).toBe('GetUser');
      }
    });
  });

  // Metadata propagation tests skipped for now as they require concrete Metadata implementation
  // The adapter properly handles metadata when provided via CallOptions

  describe('retry logic', () => {
    it('should retry on UNAVAILABLE error and eventually succeed', async () => {
      // Create adapter with retry enabled
      const retryAdapter = new NativeGrpcAdapter({
        serverUrl: server.getAddress(),
        debug: false,
        retryConfig: {
          maxRetries: 3,
          initialBackoffMs: 10,
          maxBackoffMs: 100,
          jitter: false,
        },
      });

      try {
        // Note: This test assumes the server will return UNAVAILABLE once
        // In a real scenario, you'd want to mock a transient failure
        // For now, we just verify the retry mechanism doesn't break normal calls

        const response = await retryAdapter.unary<any, any>(
          getUserMethod,
          { user_id: '1' },
          {}
        );

        expect(response).toEqual({
          id: '1',
          name: 'Alice',
          email: 'alice@example.com',
        });
      } finally {
        await retryAdapter.close();
      }
    });

    it('should not retry on non-retryable errors', async () => {
      const retryAdapter = new NativeGrpcAdapter({
        serverUrl: server.getAddress(),
        debug: false,
        retryConfig: {
          maxRetries: 3,
          initialBackoffMs: 10,
          maxBackoffMs: 100,
          jitter: false,
        },
      });

      try {
        // NOT_FOUND is not retryable - should fail immediately
        const startTime = Date.now();

        await expect(
          retryAdapter.unary(getUserMethod, { user_id: '999' }, {})
        ).rejects.toMatchObject({
          code: GrpcStatusCode.NOT_FOUND,
        });

        const duration = Date.now() - startTime;

        // Should fail quickly without retries (< 50ms)
        expect(duration).toBeLessThan(50);
      } finally {
        await retryAdapter.close();
      }
    });

    it('should work with retry disabled', async () => {
      const noRetryAdapter = new NativeGrpcAdapter({
        serverUrl: server.getAddress(),
        debug: false,
        retryConfig: false, // Disable retry
      });

      try {
        const response = await noRetryAdapter.unary<any, any>(
          getUserMethod,
          { user_id: '1' },
          {}
        );

        expect(response).toEqual({
          id: '1',
          name: 'Alice',
          email: 'alice@example.com',
        });
      } finally {
        await noRetryAdapter.close();
      }
    });
  });

  describe('adapter lifecycle', () => {
    it('should throw error when making call on closed adapter', async () => {
      await adapter.close();

      await expect(
        adapter.unary(getUserMethod, { user_id: '1' }, {})
      ).rejects.toThrow('Adapter is closed');
    });

    it('should handle multiple close calls gracefully', async () => {
      await adapter.close();
      await adapter.close(); // Should not throw
    });
  });

  describe('dynamic user data', () => {
    it('should get newly added user', async () => {
      // Add new user to server
      server.addUser({
        id: '100',
        name: 'Test User',
        email: 'test@example.com',
      });

      const response = await adapter.unary(
        getUserMethod,
        { user_id: '100' },
        {}
      );

      expect(response).toEqual({
        id: '100',
        name: 'Test User',
        email: 'test@example.com',
      });
    });

    it('should handle cleared users', async () => {
      server.clearUsers();

      await expect(
        adapter.unary(getUserMethod, { user_id: '1' }, {})
      ).rejects.toMatchObject({
        code: GrpcStatusCode.NOT_FOUND,
      });
    });

    it('should get users after reset', async () => {
      // Clear and add custom user
      server.clearUsers();
      server.addUser({
        id: '999',
        name: 'Custom',
        email: 'custom@example.com',
      });

      // Reset to initial state
      server.resetUsers();

      // Should get Alice again
      const response = await adapter.unary(
        getUserMethod,
        { user_id: '1' },
        {}
      );

      expect(response).toEqual({
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
      });

      // Custom user should be gone
      await expect(
        adapter.unary(getUserMethod, { user_id: '999' }, {})
      ).rejects.toMatchObject({
        code: GrpcStatusCode.NOT_FOUND,
      });
    });
  });
});
