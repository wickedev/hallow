/**
 * Unit tests for NativeGrpcAdapter client streaming support
 *
 * Tests cover:
 * - Successful streaming with single and multiple requests
 * - Stream completion and response handling
 * - Stream cancellation
 * - Error handling (various status codes)
 * - Timeout/deadline handling
 * - Edge cases (closed adapter, write after end, etc.)
 * - Method descriptor validation
 */

import * as grpc from '@grpc/grpc-js';
import { EventEmitter } from 'events';
import { NativeGrpcAdapter } from '../../../src/adapters/NativeGrpcAdapter';
import { MethodDescriptor, GrpcStatusCode } from '../../../src/adapters/types';

/**
 * Mock ClientWritableStream that extends EventEmitter
 */
class MockClientWritableStream extends EventEmitter {
  private writtenRequests: any[] = [];
  private cancelled = false;
  private ended = false;
  private callback: ((error: grpc.ServiceError | null, response?: any) => void) | null = null;

  constructor(callback: (error: grpc.ServiceError | null, response?: any) => void) {
    super();
    this.callback = callback;
  }

  write(data: any): void {
    if (this.cancelled || this.ended) {
      throw new Error('Stream is not writable');
    }
    this.writtenRequests.push(data);
  }

  end(): void {
    if (!this.cancelled && !this.ended) {
      this.ended = true;
      this.emit('finish');
    }
  }

  cancel(): void {
    if (!this.cancelled) {
      this.cancelled = true;
      this.emit('cancelled');
    }
  }

  isCancelled(): boolean {
    return this.cancelled;
  }

  isEnded(): boolean {
    return this.ended;
  }

  getWrittenRequests(): any[] {
    return this.writtenRequests;
  }

  // Simulate server response
  sendResponse(response: any): void {
    if (this.callback && !this.cancelled) {
      this.callback(null, response);
    }
  }

  // Simulate server error
  sendError(error: grpc.ServiceError): void {
    if (this.callback && !this.cancelled) {
      this.callback(error);
    }
  }
}

describe('NativeGrpcAdapter - Client Streaming', () => {
  let adapter: NativeGrpcAdapter;
  let mockClient: any;
  let mockChannel: any;
  let currentMockStream: MockClientWritableStream | null = null;

  // Test message types
  interface TestRequest {
    name: string;
    email: string;
  }

  interface TestResponse {
    users: Array<{ id: string; name: string; email: string }>;
    count: number;
  }

  // Mock message serialization
  const mockRequestType = {
    serializeBinary: (req: TestRequest) => Buffer.from(JSON.stringify(req)),
    deserializeBinary: (bytes: Uint8Array) => JSON.parse(Buffer.from(bytes).toString()),
  };

  const mockResponseType = {
    serializeBinary: (res: TestResponse) => Buffer.from(JSON.stringify(res)),
    deserializeBinary: (bytes: Uint8Array) => JSON.parse(Buffer.from(bytes).toString()),
  };

  // Test method descriptor (client streaming)
  const testMethodDescriptor: MethodDescriptor<TestRequest, TestResponse> = {
    serviceName: 'test.TestService',
    methodName: 'CreateUsers',
    requestStream: true,
    responseStream: false,
    requestType: mockRequestType as any,
    responseType: mockResponseType as any,
  };

  beforeEach(() => {
    // Reset mock stream
    currentMockStream = null;

    // Mock grpc.Channel
    mockChannel = {
      close: jest.fn(),
    };

    // Mock grpc.Client
    mockClient = {
      close: jest.fn(),
      makeClientStreamRequest: jest.fn((
        path: string,
        serialize: Function,
        deserialize: Function,
        metadata: grpc.Metadata,
        options: any,
        callback: (error: grpc.ServiceError | null, response?: any) => void
      ) => {
        currentMockStream = new MockClientWritableStream(callback);
        return currentMockStream;
      }),
    };

    // Mock grpc module constructors
    jest.spyOn(grpc, 'Channel').mockImplementation(() => mockChannel);
    jest.spyOn(grpc, 'Client').mockImplementation(() => mockClient);

    // Create adapter
    adapter = new NativeGrpcAdapter({
      serverUrl: 'localhost:50051',
      secure: false,
      debug: false,
    });
  });

  afterEach(() => {
    adapter.close();
    jest.restoreAllMocks();
  });

  describe('Basic Client Streaming', () => {
    it('should send single request and receive response', async () => {
      const call = adapter.clientStream(testMethodDescriptor);

      expect(call.writable).toBe(true);

      // Write single request
      call.write({ name: 'Alice', email: 'alice@example.com' });

      // End stream
      call.end();

      expect(call.writable).toBe(false);

      // Simulate server response
      setTimeout(() => {
        const response: TestResponse = {
          users: [{ id: '1', name: 'Alice', email: 'alice@example.com' }],
          count: 1,
        };
        currentMockStream!.sendResponse(response);
      }, 10);

      // Wait for response
      const response = await call.getResponse();

      expect(response.users).toHaveLength(1);
      expect(response.users[0].name).toBe('Alice');
      expect(response.count).toBe(1);
      expect(currentMockStream!.getWrittenRequests()).toHaveLength(1);
    });

    it('should send multiple requests and receive aggregated response', async () => {
      const call = adapter.clientStream(testMethodDescriptor);

      // Write multiple requests
      call.write({ name: 'Alice', email: 'alice@example.com' });
      call.write({ name: 'Bob', email: 'bob@example.com' });
      call.write({ name: 'Charlie', email: 'charlie@example.com' });

      // End stream
      call.end();

      // Simulate server response
      setTimeout(() => {
        const response: TestResponse = {
          users: [
            { id: '1', name: 'Alice', email: 'alice@example.com' },
            { id: '2', name: 'Bob', email: 'bob@example.com' },
            { id: '3', name: 'Charlie', email: 'charlie@example.com' },
          ],
          count: 3,
        };
        currentMockStream!.sendResponse(response);
      }, 10);

      // Wait for response
      const response = await call.getResponse();

      expect(response.users).toHaveLength(3);
      expect(response.count).toBe(3);
      expect(currentMockStream!.getWrittenRequests()).toHaveLength(3);
    });

    it('should handle empty stream (end without writing)', async () => {
      const call = adapter.clientStream(testMethodDescriptor);

      // End stream immediately
      call.end();

      // Simulate server response
      setTimeout(() => {
        const response: TestResponse = {
          users: [],
          count: 0,
        };
        currentMockStream!.sendResponse(response);
      }, 10);

      // Wait for response
      const response = await call.getResponse();

      expect(response.users).toHaveLength(0);
      expect(response.count).toBe(0);
      expect(currentMockStream!.getWrittenRequests()).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle INTERNAL error', async () => {
      const call = adapter.clientStream(testMethodDescriptor);

      call.write({ name: 'Alice', email: 'alice@example.com' });
      call.end();

      // Simulate server error
      setTimeout(() => {
        const grpcError: grpc.ServiceError = {
          name: 'Error',
          message: 'Internal server error',
          code: grpc.status.INTERNAL,
          details: 'Internal server error',
          metadata: new grpc.Metadata(),
        };
        currentMockStream!.sendError(grpcError);
      }, 10);

      // Wait for error
      await expect(call.getResponse()).rejects.toMatchObject({
        code: GrpcStatusCode.INTERNAL,
        message: expect.stringContaining('Internal server error'),
        methodName: 'CreateUsers',
      });
    });

    it('should handle INVALID_ARGUMENT error', async () => {
      const call = adapter.clientStream(testMethodDescriptor);

      call.write({ name: '', email: 'invalid' });
      call.end();

      // Simulate server error
      setTimeout(() => {
        const grpcError: grpc.ServiceError = {
          name: 'Error',
          message: 'Invalid request data',
          code: grpc.status.INVALID_ARGUMENT,
          details: 'Invalid request data',
          metadata: new grpc.Metadata(),
        };
        currentMockStream!.sendError(grpcError);
      }, 10);

      // Wait for error
      await expect(call.getResponse()).rejects.toMatchObject({
        code: GrpcStatusCode.INVALID_ARGUMENT,
        methodName: 'CreateUsers',
      });
    });

    it('should handle UNAVAILABLE error', async () => {
      const call = adapter.clientStream(testMethodDescriptor);

      call.write({ name: 'Alice', email: 'alice@example.com' });
      call.end();

      // Simulate server error
      setTimeout(() => {
        const grpcError: grpc.ServiceError = {
          name: 'Error',
          message: 'Service unavailable',
          code: grpc.status.UNAVAILABLE,
          details: 'Service unavailable',
          metadata: new grpc.Metadata(),
        };
        currentMockStream!.sendError(grpcError);
      }, 10);

      // Wait for error
      await expect(call.getResponse()).rejects.toMatchObject({
        code: GrpcStatusCode.UNAVAILABLE,
      });
    });

    it('should throw error when writing after stream is ended', () => {
      const call = adapter.clientStream(testMethodDescriptor);

      call.write({ name: 'Alice', email: 'alice@example.com' });
      call.end();

      expect(() => {
        call.write({ name: 'Bob', email: 'bob@example.com' });
      }).toThrow('stream is not writable');
    });

    it('should throw error when writing to cancelled stream', async () => {
      const call = adapter.clientStream(testMethodDescriptor);

      call.write({ name: 'Alice', email: 'alice@example.com' });

      // Catch the rejection before cancel
      const responsePromise = call.getResponse().catch(() => {
        // Expected to be cancelled
      });

      call.cancel();

      expect(() => {
        call.write({ name: 'Bob', email: 'bob@example.com' });
      }).toThrow('stream is not writable');

      // Wait for promise to resolve
      await responsePromise;
    });
  });

  describe('Cancellation', () => {
    it('should cancel stream successfully', async () => {
      const call = adapter.clientStream(testMethodDescriptor);

      call.write({ name: 'Alice', email: 'alice@example.com' });

      // Cancel the stream
      call.cancel();

      expect(call.writable).toBe(false);
      expect(currentMockStream!.isCancelled()).toBe(true);

      // getResponse should reject with CANCELLED error
      await expect(call.getResponse()).rejects.toMatchObject({
        code: GrpcStatusCode.CANCELLED,
        methodName: 'CreateUsers',
      });
    });

    it('should handle early cancellation (before writing)', async () => {
      const call = adapter.clientStream(testMethodDescriptor);

      // Cancel immediately
      call.cancel();

      expect(call.writable).toBe(false);
      expect(currentMockStream!.isCancelled()).toBe(true);

      // getResponse should reject
      await expect(call.getResponse()).rejects.toMatchObject({
        code: GrpcStatusCode.CANCELLED,
      });
    });

    it('should allow multiple cancel calls (idempotent)', async () => {
      const call = adapter.clientStream(testMethodDescriptor);

      // Catch the rejection
      const responsePromise = call.getResponse().catch(() => {
        // Expected to be cancelled
      });

      call.cancel();
      expect(call.writable).toBe(false);

      // Second cancel should not throw
      expect(() => call.cancel()).not.toThrow();

      // Wait for promise to resolve
      await responsePromise;
    });

    it('should allow end after cancel (no-op)', async () => {
      const call = adapter.clientStream(testMethodDescriptor);

      // Catch the rejection
      const responsePromise = call.getResponse().catch(() => {
        // Expected to be cancelled
      });

      call.cancel();

      // End should not throw but should be no-op
      expect(() => call.end()).not.toThrow();

      // Wait for promise to resolve
      await responsePromise;
    });
  });

  describe('Method Descriptor Validation', () => {
    it('should throw error for non-client-streaming method (unary)', () => {
      const unaryDescriptor: MethodDescriptor<TestRequest, TestResponse> = {
        ...testMethodDescriptor,
        requestStream: false,
        responseStream: false,
      };

      expect(() => {
        adapter.clientStream(unaryDescriptor);
      }).toThrow('is not a client streaming RPC');
    });

    it('should throw error for server streaming method', () => {
      const serverStreamDescriptor: MethodDescriptor<TestRequest, TestResponse> = {
        ...testMethodDescriptor,
        requestStream: false,
        responseStream: true,
      };

      expect(() => {
        adapter.clientStream(serverStreamDescriptor);
      }).toThrow('is not a client streaming RPC');
    });

    it('should throw error for bidirectional streaming method', () => {
      const bidiStreamDescriptor: MethodDescriptor<TestRequest, TestResponse> = {
        ...testMethodDescriptor,
        requestStream: true,
        responseStream: true,
      };

      expect(() => {
        adapter.clientStream(bidiStreamDescriptor);
      }).toThrow('is not a client streaming RPC');
    });
  });

  describe('Timeout and Deadline', () => {
    it('should pass timeout as deadline', () => {
      const timeout = 5000;

      adapter.clientStream(testMethodDescriptor, { timeout });

      expect(mockClient.makeClientStreamRequest).toHaveBeenCalledTimes(1);

      const callArgs = mockClient.makeClientStreamRequest.mock.calls[0];
      const options = callArgs[4];

      expect(options.deadline).toBeDefined();
      expect(typeof options.deadline).toBe('number');
    });

    it('should pass explicit deadline', () => {
      const deadline = Date.now() + 10000;

      adapter.clientStream(testMethodDescriptor, { deadline });

      const callArgs = mockClient.makeClientStreamRequest.mock.calls[0];
      const options = callArgs[4];

      expect(options.deadline).toBe(deadline);
    });

    it('should handle DEADLINE_EXCEEDED error', async () => {
      const call = adapter.clientStream(testMethodDescriptor, { timeout: 100 });

      call.write({ name: 'Alice', email: 'alice@example.com' });
      call.end();

      // Simulate deadline exceeded immediately (before test ends)
      const grpcError: grpc.ServiceError = {
        name: 'Error',
        message: 'Deadline exceeded',
        code: grpc.status.DEADLINE_EXCEEDED,
        details: 'Deadline exceeded',
        metadata: new grpc.Metadata(),
      };

      // Send error in next tick to ensure call is set up
      process.nextTick(() => {
        currentMockStream!.sendError(grpcError);
      });

      await expect(call.getResponse()).rejects.toMatchObject({
        code: GrpcStatusCode.DEADLINE_EXCEEDED,
      });
    });
  });

  describe('Edge Cases', () => {
    it('should throw error if adapter is closed', () => {
      adapter.close();

      expect(() => {
        adapter.clientStream(testMethodDescriptor);
      }).toThrow('Adapter is closed');
    });

    it('should handle makeClientStreamRequest being called with correct parameters', () => {
      const customMetadata: Record<string, string> = {
        authorization: 'Bearer token',
        'x-request-id': 'req-123',
      };

      adapter.clientStream(testMethodDescriptor, {
        timeout: 5000,
        metadata: customMetadata,
      });

      expect(mockClient.makeClientStreamRequest).toHaveBeenCalledTimes(1);

      const callArgs = mockClient.makeClientStreamRequest.mock.calls[0];
      expect(callArgs[0]).toBe('/test.TestService/CreateUsers');
      expect(typeof callArgs[1]).toBe('function'); // serialize
      expect(typeof callArgs[2]).toBe('function'); // deserialize
      expect(callArgs[3]).toBeInstanceOf(grpc.Metadata);
      expect(callArgs[4].deadline).toBeDefined();
      expect(typeof callArgs[5]).toBe('function'); // callback
    });

    it('should return same response promise on multiple getResponse calls', () => {
      const call = adapter.clientStream(testMethodDescriptor);

      const promise1 = call.getResponse();
      const promise2 = call.getResponse();

      expect(promise1).toBe(promise2);
    });
  });

  describe('Backpressure Scenarios', () => {
    it('should handle rapid sequential writes', () => {
      const call = adapter.clientStream(testMethodDescriptor);

      // Write many requests rapidly
      for (let i = 0; i < 100; i++) {
        call.write({ name: `User${i}`, email: `user${i}@example.com` });
      }

      call.end();

      expect(currentMockStream!.getWrittenRequests()).toHaveLength(100);
    });

    it('should maintain writable state correctly during writes', () => {
      const call = adapter.clientStream(testMethodDescriptor);

      expect(call.writable).toBe(true);

      call.write({ name: 'Alice', email: 'alice@example.com' });
      expect(call.writable).toBe(true);

      call.write({ name: 'Bob', email: 'bob@example.com' });
      expect(call.writable).toBe(true);

      call.end();
      expect(call.writable).toBe(false);
    });
  });
});
