/**
 * Integration tests for NativeGrpcAdapter client streaming
 *
 * Tests the adapter against a real NativeGrpcTestServer to verify
 * end-to-end functionality of client streaming RPCs.
 *
 * Tests cover:
 * - Single and multiple request streaming
 * - Receiving aggregated response
 * - Error scenarios with real server
 * - Timeout and cancellation
 * - Connection management
 */

import { NativeGrpcAdapter } from '../../src/adapters/NativeGrpcAdapter';
import { MethodDescriptor, GrpcStatusCode } from '../../src/adapters/types';
import { NativeGrpcTestServer } from '@hallow/test-server';

describe('NativeGrpcAdapter - Client Streaming Integration', () => {
  let server: NativeGrpcTestServer;
  let adapter: NativeGrpcAdapter;

  // Test message types matching proto definitions
  interface CreateUserRequest {
    name: string;
    email: string;
  }

  interface User {
    id: string;
    name: string;
    email: string;
  }

  interface ListUsersResponse {
    users: User[];
    next_page_token: string;
  }

  // Mock message serialization (would be generated from proto)
  const mockCreateUserRequestType = {
    serializeBinary: (req: CreateUserRequest) => Buffer.from(JSON.stringify(req)),
    deserializeBinary: (bytes: Uint8Array) => JSON.parse(Buffer.from(bytes).toString()),
  };

  const mockListUsersResponseType = {
    serializeBinary: (res: ListUsersResponse) => Buffer.from(JSON.stringify(res)),
    deserializeBinary: (bytes: Uint8Array) => JSON.parse(Buffer.from(bytes).toString()),
  };

  // Method descriptor for CreateUsers (client streaming)
  const createUsersDescriptor: MethodDescriptor<CreateUserRequest, ListUsersResponse> = {
    serviceName: 'test.services.UserService',
    methodName: 'CreateUsers',
    requestStream: true,
    responseStream: false,
    requestType: mockCreateUserRequestType as any,
    responseType: mockListUsersResponseType as any,
  };

  beforeAll(async () => {
    // Start test server
    server = new NativeGrpcTestServer({
      port: 50052,
      host: '127.0.0.1',
      debug: false,
    });

    await server.start();
  });

  afterAll(async () => {
    // Stop test server
    await server.stop();
  });

  beforeEach(() => {
    // Create adapter for each test
    adapter = new NativeGrpcAdapter({
      serverUrl: '127.0.0.1:50052',
      secure: false,
      debug: false,
      retryConfig: false, // Disable retries for predictable tests
    });
  });

  afterEach(() => {
    // Clean up adapter
    adapter.close();
  });

  describe('Successful Client Streaming', () => {
    it('should create single user via client streaming', async () => {
      const call = adapter.clientStream(createUsersDescriptor);

      // Send single user
      call.write({ name: 'Alice', email: 'alice@test.com' });
      call.end();

      // Wait for response
      const response = await call.getResponse();

      expect(response.users).toHaveLength(1);
      expect(response.users[0].name).toBe('Alice');
      expect(response.users[0].email).toBe('alice@test.com');
      expect(response.users[0].id).toBeDefined();
    });

    it('should create multiple users via client streaming', async () => {
      const call = adapter.clientStream(createUsersDescriptor);

      // Send multiple users
      call.write({ name: 'Alice', email: 'alice@test.com' });
      call.write({ name: 'Bob', email: 'bob@test.com' });
      call.write({ name: 'Charlie', email: 'charlie@test.com' });
      call.end();

      // Wait for response
      const response = await call.getResponse();

      expect(response.users).toHaveLength(3);
      expect(response.users[0].name).toBe('Alice');
      expect(response.users[1].name).toBe('Bob');
      expect(response.users[2].name).toBe('Charlie');

      // Verify all have IDs
      response.users.forEach((user) => {
        expect(user.id).toBeDefined();
      });
    });

    it('should handle empty stream (no users)', async () => {
      const call = adapter.clientStream(createUsersDescriptor);

      // End without sending any users
      call.end();

      // Wait for response
      const response = await call.getResponse();

      expect(response.users).toHaveLength(0);
    });

    it('should handle large batch of users', async () => {
      const call = adapter.clientStream(createUsersDescriptor);

      // Send 50 users
      for (let i = 0; i < 50; i++) {
        call.write({
          name: `User${i}`,
          email: `user${i}@test.com`,
        });
      }
      call.end();

      // Wait for response
      const response = await call.getResponse();

      expect(response.users).toHaveLength(50);
      expect(response.users[0].name).toBe('User0');
      expect(response.users[49].name).toBe('User49');
    });
  });

  describe('Error Handling', () => {
    it('should handle server error during streaming', async () => {
      const call = adapter.clientStream(createUsersDescriptor);

      // Send valid user
      call.write({ name: 'Alice', email: 'alice@test.com' });

      // Send user that triggers error
      call.write({ name: 'error', email: 'error@test.com' });

      call.end();

      // Should receive error
      await expect(call.getResponse()).rejects.toMatchObject({
        code: GrpcStatusCode.INVALID_ARGUMENT,
        message: expect.stringContaining('error'),
      });
    });

    it('should handle connection failure', async () => {
      // Create adapter with wrong port
      const badAdapter = new NativeGrpcAdapter({
        serverUrl: '127.0.0.1:60000',
        secure: false,
        debug: false,
        retryConfig: false,
      });

      try {
        const call = badAdapter.clientStream(createUsersDescriptor);

        call.write({ name: 'Alice', email: 'alice@test.com' });
        call.end();

        // Should receive unavailable error
        await expect(call.getResponse()).rejects.toMatchObject({
          code: GrpcStatusCode.UNAVAILABLE,
        });
      } finally {
        badAdapter.close();
      }
    });
  });

  describe('Cancellation', () => {
    it('should cancel client stream', async () => {
      const call = adapter.clientStream(createUsersDescriptor);

      // Start sending
      call.write({ name: 'Alice', email: 'alice@test.com' });

      // Cancel before ending
      call.cancel();

      // Response should be rejected
      await expect(call.getResponse()).rejects.toMatchObject({
        code: GrpcStatusCode.CANCELLED,
      });
    });

    it('should not allow writes after cancellation', () => {
      const call = adapter.clientStream(createUsersDescriptor);

      call.write({ name: 'Alice', email: 'alice@test.com' });
      call.cancel();

      // Should throw when trying to write after cancel
      expect(() => {
        call.write({ name: 'Bob', email: 'bob@test.com' });
      }).toThrow('not writable');
    });
  });

  describe('Timeout Handling', () => {
    it('should handle timeout during streaming', async () => {
      // Create adapter with very short timeout
      const timeoutAdapter = new NativeGrpcAdapter({
        serverUrl: '127.0.0.1:50052',
        secure: false,
        debug: false,
        retryConfig: false,
      });

      try {
        const call = timeoutAdapter.clientStream(createUsersDescriptor, {
          timeout: 10, // 10ms timeout
        });

        // Send users and wait longer than timeout
        call.write({ name: 'Alice', email: 'alice@test.com' });

        // Wait before ending to trigger timeout
        await new Promise((resolve) => setTimeout(resolve, 50));

        call.end();

        // Should receive deadline exceeded error
        await expect(call.getResponse()).rejects.toMatchObject({
          code: GrpcStatusCode.DEADLINE_EXCEEDED,
        });
      } finally {
        timeoutAdapter.close();
      }
    }, 10000);
  });

  describe('Multiple Sequential Calls', () => {
    it('should handle multiple sequential client streaming calls', async () => {
      // First call
      const call1 = adapter.clientStream(createUsersDescriptor);
      call1.write({ name: 'Alice', email: 'alice@test.com' });
      call1.end();
      const response1 = await call1.getResponse();
      expect(response1.users).toHaveLength(1);

      // Second call
      const call2 = adapter.clientStream(createUsersDescriptor);
      call2.write({ name: 'Bob', email: 'bob@test.com' });
      call2.write({ name: 'Charlie', email: 'charlie@test.com' });
      call2.end();
      const response2 = await call2.getResponse();
      expect(response2.users).toHaveLength(2);

      // Third call
      const call3 = adapter.clientStream(createUsersDescriptor);
      call3.write({ name: 'Diana', email: 'diana@test.com' });
      call3.end();
      const response3 = await call3.getResponse();
      expect(response3.users).toHaveLength(1);
    });
  });

  describe('Concurrent Calls', () => {
    it('should handle multiple concurrent client streaming calls', async () => {
      // Start three concurrent streams
      const call1 = adapter.clientStream(createUsersDescriptor);
      const call2 = adapter.clientStream(createUsersDescriptor);
      const call3 = adapter.clientStream(createUsersDescriptor);

      // Write to all streams
      call1.write({ name: 'Alice1', email: 'alice1@test.com' });
      call2.write({ name: 'Bob1', email: 'bob1@test.com' });
      call2.write({ name: 'Bob2', email: 'bob2@test.com' });
      call3.write({ name: 'Charlie1', email: 'charlie1@test.com' });

      // End all streams
      call1.end();
      call2.end();
      call3.end();

      // Wait for all responses
      const [response1, response2, response3] = await Promise.all([
        call1.getResponse(),
        call2.getResponse(),
        call3.getResponse(),
      ]);

      expect(response1.users).toHaveLength(1);
      expect(response2.users).toHaveLength(2);
      expect(response3.users).toHaveLength(1);
    });
  });

  describe('Metadata', () => {
    it('should send custom metadata with client streaming call', async () => {
      const metadata = {
        'authorization': 'Bearer test-token',
        'x-request-id': 'test-123',
      };

      const call = adapter.clientStream(createUsersDescriptor, { metadata });

      call.write({ name: 'Alice', email: 'alice@test.com' });
      call.end();

      const response = await call.getResponse();
      expect(response.users).toHaveLength(1);
    });
  });

  describe('Edge Cases', () => {
    it('should throw error when writing after end', () => {
      const call = adapter.clientStream(createUsersDescriptor);

      call.write({ name: 'Alice', email: 'alice@test.com' });
      call.end();

      expect(() => {
        call.write({ name: 'Bob', email: 'bob@test.com' });
      }).toThrow('not writable');
    });

    it('should allow multiple end calls (idempotent)', () => {
      const call = adapter.clientStream(createUsersDescriptor);

      call.write({ name: 'Alice', email: 'alice@test.com' });
      call.end();

      // Second end should not throw
      expect(() => call.end()).not.toThrow();
    });
  });
});
