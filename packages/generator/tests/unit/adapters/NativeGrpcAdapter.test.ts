/**
 * Unit tests for NativeGrpcAdapter
 *
 * Tests the native gRPC adapter implementation:
 * - Constructor and configuration
 * - Unary RPC calls (success and error scenarios)
 * - Metadata handling
 * - Timeout and deadline support
 * - Serialization/deserialization
 * - Error conversion and handling
 * - Resource cleanup
 */

import * as grpc from '@grpc/grpc-js';
import {
  NativeGrpcAdapter,
  NativeGrpcAdapterConfig,
} from '../../../src/adapters/NativeGrpcAdapter';
import {
  MethodDescriptor,
  MessageType,
  GrpcStatusCode,
  GrpcError,
} from '../../../src/adapters/types';

// Mock @grpc/grpc-js
jest.mock('@grpc/grpc-js');

// Mock message types for testing
class MockRequest {
  constructor(public userId: string) {}

  serializeBinary(): Uint8Array {
    return new Uint8Array(Buffer.from(JSON.stringify({ userId: this.userId })));
  }

  static deserializeBinary(bytes: Uint8Array): MockRequest {
    const data = JSON.parse(Buffer.from(bytes).toString());
    return new MockRequest(data.userId);
  }
}

class MockResponse {
  constructor(
    public userId: string,
    public name: string
  ) {}

  serializeBinary(): Uint8Array {
    return new Uint8Array(
      Buffer.from(JSON.stringify({ userId: this.userId, name: this.name }))
    );
  }

  static deserializeBinary(bytes: Uint8Array): MockResponse {
    const data = JSON.parse(Buffer.from(bytes).toString());
    return new MockResponse(data.userId, data.name);
  }
}

// Mock message type
const mockRequestType: MessageType<MockRequest> = {
  serializeBinary: (msg: MockRequest) => msg.serializeBinary(),
  deserializeBinary: (bytes: Uint8Array) => MockRequest.deserializeBinary(bytes),
};

const mockResponseType: MessageType<MockResponse> = {
  serializeBinary: (msg: MockResponse) => msg.serializeBinary(),
  deserializeBinary: (bytes: Uint8Array) => MockResponse.deserializeBinary(bytes),
};

// Mock method descriptor
const mockMethodDescriptor: MethodDescriptor<MockRequest, MockResponse> = {
  serviceName: 'user.UserService',
  methodName: 'GetUser',
  requestStream: false,
  responseStream: false,
  requestType: mockRequestType,
  responseType: mockResponseType,
};

describe('NativeGrpcAdapter', () => {
  let mockChannel: jest.Mocked<grpc.Channel>;
  let mockClient: jest.Mocked<grpc.Client>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Channel
    mockChannel = {
      close: jest.fn(),
    } as any;

    // Mock Client
    mockClient = {
      close: jest.fn(),
      makeUnaryRequest: jest.fn(),
    } as any;

    // Mock grpc module constructors
    (grpc.Channel as any) = jest.fn(() => mockChannel);
    (grpc.Client as any) = jest.fn(() => mockClient);
    (grpc.credentials.createInsecure as jest.Mock) = jest.fn(
      () => ({} as grpc.ChannelCredentials)
    );
    (grpc.credentials.createSsl as jest.Mock) = jest.fn(
      () => ({} as grpc.ChannelCredentials)
    );
    (grpc.Metadata as any) = class MockMetadata {
      private data: Map<string, string[]> = new Map();

      set(key: string, value: string): void {
        this.data.set(key.toLowerCase(), [value]);
      }

      add(key: string, value: string): void {
        const existing = this.data.get(key.toLowerCase()) || [];
        this.data.set(key.toLowerCase(), [...existing, value]);
      }

      get(key: string): string[] | undefined {
        return this.data.get(key.toLowerCase());
      }

      remove(key: string): void {
        this.data.delete(key.toLowerCase());
      }

      getMap(): Record<string, string | string[]> {
        const map: Record<string, string | string[]> = {};
        this.data.forEach((value, key) => {
          map[key] = value;
        });
        return map;
      }
    };
  });

  describe('constructor', () => {
    it('should create adapter with insecure credentials', () => {
      const config: NativeGrpcAdapterConfig = {
        serverUrl: 'localhost:50051',
        secure: false,
      };

      const adapter = new NativeGrpcAdapter(config);

      expect(grpc.credentials.createInsecure).toHaveBeenCalled();
      expect(grpc.Channel).toHaveBeenCalledWith(
        'localhost:50051',
        expect.any(Object),
        expect.objectContaining({
          'grpc.max_receive_message_length': -1,
          'grpc.max_send_message_length': -1,
        })
      );
      expect(grpc.Client).toHaveBeenCalledWith(
        'localhost:50051',
        expect.any(Object),
        {}
      );

      adapter.close();
    });

    it('should create adapter with secure credentials', () => {
      const config: NativeGrpcAdapterConfig = {
        serverUrl: 'api.example.com:443',
        secure: true,
      };

      const adapter = new NativeGrpcAdapter(config);

      expect(grpc.credentials.createSsl).toHaveBeenCalled();

      adapter.close();
    });

    it('should remove protocol prefix from server URL', () => {
      const testCases = [
        { input: 'grpc://localhost:50051', expected: 'localhost:50051' },
        { input: 'grpcs://api.example.com:443', expected: 'api.example.com:443' },
        { input: 'http://localhost:8080', expected: 'localhost:8080' },
        { input: 'https://api.example.com', expected: 'api.example.com' },
        { input: 'localhost:50051', expected: 'localhost:50051' },
      ];

      testCases.forEach(({ input, expected }) => {
        const adapter = new NativeGrpcAdapter({ serverUrl: input });
        expect(grpc.Channel).toHaveBeenCalledWith(
          expected,
          expect.any(Object),
          expect.any(Object)
        );
        adapter.close();
        jest.clearAllMocks();
      });
    });

    it('should throw error for invalid server URL', () => {
      expect(() => {
        new NativeGrpcAdapter({ serverUrl: '' });
      }).toThrow('serverUrl is required');

      expect(() => {
        new NativeGrpcAdapter({ serverUrl: '   ' });
      }).toThrow('serverUrl is required');
    });

    it('should throw error when serverUrl is missing', () => {
      expect(() => {
        new NativeGrpcAdapter({} as any);
      }).toThrow('serverUrl is required');
    });

    it('should apply custom channel options', () => {
      const config: NativeGrpcAdapterConfig = {
        serverUrl: 'localhost:50051',
        channelOptions: {
          'grpc.keepalive_time_ms': 10000,
          'grpc.keepalive_timeout_ms': 5000,
        },
      };

      const adapter = new NativeGrpcAdapter(config);

      expect(grpc.Channel).toHaveBeenCalledWith(
        'localhost:50051',
        expect.any(Object),
        expect.objectContaining({
          'grpc.max_receive_message_length': -1,
          'grpc.max_send_message_length': -1,
          'grpc.keepalive_time_ms': 10000,
          'grpc.keepalive_timeout_ms': 5000,
        })
      );

      adapter.close();
    });
  });

  describe('close', () => {
    it('should close client and channel', () => {
      const adapter = new NativeGrpcAdapter({
        serverUrl: 'localhost:50051',
      });

      adapter.close();

      expect(mockClient.close).toHaveBeenCalled();
      expect(mockChannel.close).toHaveBeenCalled();
    });

    it('should not throw when closing multiple times', () => {
      const adapter = new NativeGrpcAdapter({
        serverUrl: 'localhost:50051',
      });

      adapter.close();
      expect(() => adapter.close()).not.toThrow();
    });

    it('should prevent new calls after close', async () => {
      const adapter = new NativeGrpcAdapter({
        serverUrl: 'localhost:50051',
      });

      adapter.close();

      await expect(
        adapter.unary(mockMethodDescriptor, new MockRequest('123'))
      ).rejects.toThrow('Adapter is closed');
    });
  });

  describe('unary', () => {
    let adapter: NativeGrpcAdapter;

    beforeEach(() => {
      adapter = new NativeGrpcAdapter({
        serverUrl: 'localhost:50051',
      });
    });

    afterEach(() => {
      adapter.close();
    });

    it('should make successful unary call', async () => {
      const request = new MockRequest('123');
      const expectedResponse = new MockResponse('123', 'Test User');

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          metadata: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          // Simulate successful response
          setImmediate(() => {
            callback(null, expectedResponse);
          });
          return {} as any;
        }
      );

      const response = await adapter.unary(mockMethodDescriptor, request);

      expect(response).toBe(expectedResponse);
      expect(mockClient.makeUnaryRequest).toHaveBeenCalledWith(
        '/user.UserService/GetUser',
        expect.any(Function),
        expect.any(Function),
        request,
        expect.any(Object),
        expect.objectContaining({ deadline: undefined }),
        expect.any(Function)
      );
    });

    it('should handle NOT_FOUND error', async () => {
      const request = new MockRequest('nonexistent');

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          metadata: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          const error: grpc.ServiceError = {
            name: 'NOT_FOUND',
            message: 'User not found',
            code: grpc.status.NOT_FOUND,
            details: 'User with ID nonexistent not found',
            metadata: new grpc.Metadata() as any,
          };
          setImmediate(() => callback(error));
          return {} as any;
        }
      );

      await expect(adapter.unary(mockMethodDescriptor, request)).rejects.toThrow(
        GrpcError
      );

      try {
        await adapter.unary(mockMethodDescriptor, request);
      } catch (error) {
        expect(error).toBeInstanceOf(GrpcError);
        expect((error as GrpcError).code).toBe(GrpcStatusCode.NOT_FOUND);
        expect((error as GrpcError).message).toContain('User not found');
        expect((error as GrpcError).methodName).toBe('GetUser');
      }
    });

    it('should handle INVALID_ARGUMENT error', async () => {
      const request = new MockRequest('');

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          metadata: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          const error: grpc.ServiceError = {
            name: 'INVALID_ARGUMENT',
            message: 'Invalid user ID',
            code: grpc.status.INVALID_ARGUMENT,
            details: 'User ID cannot be empty',
            metadata: new grpc.Metadata() as any,
          };
          setImmediate(() => callback(error));
          return {} as any;
        }
      );

      await expect(adapter.unary(mockMethodDescriptor, request)).rejects.toThrow(
        GrpcError
      );

      try {
        await adapter.unary(mockMethodDescriptor, request);
      } catch (error) {
        expect(error).toBeInstanceOf(GrpcError);
        expect((error as GrpcError).code).toBe(GrpcStatusCode.INVALID_ARGUMENT);
      }
    });

    it('should handle INTERNAL error', async () => {
      const request = new MockRequest('123');

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          metadata: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          const error: grpc.ServiceError = {
            name: 'INTERNAL',
            message: 'Internal server error',
            code: grpc.status.INTERNAL,
            details: 'Database connection failed',
            metadata: new grpc.Metadata() as any,
          };
          setImmediate(() => callback(error));
          return {} as any;
        }
      );

      await expect(adapter.unary(mockMethodDescriptor, request)).rejects.toThrow(
        GrpcError
      );

      try {
        await adapter.unary(mockMethodDescriptor, request);
      } catch (error) {
        expect(error).toBeInstanceOf(GrpcError);
        expect((error as GrpcError).code).toBe(GrpcStatusCode.INTERNAL);
      }
    });

    it('should handle DEADLINE_EXCEEDED error', async () => {
      const request = new MockRequest('123');

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          metadata: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          const error: grpc.ServiceError = {
            name: 'DEADLINE_EXCEEDED',
            message: 'Deadline exceeded',
            code: grpc.status.DEADLINE_EXCEEDED,
            details: 'Request took too long to complete',
            metadata: new grpc.Metadata() as any,
          };
          setImmediate(() => callback(error));
          return {} as any;
        }
      );

      await expect(adapter.unary(mockMethodDescriptor, request)).rejects.toThrow(
        GrpcError
      );

      try {
        await adapter.unary(mockMethodDescriptor, request);
      } catch (error) {
        expect(error).toBeInstanceOf(GrpcError);
        expect((error as GrpcError).code).toBe(GrpcStatusCode.DEADLINE_EXCEEDED);
      }
    });

    it('should handle UNAVAILABLE error', async () => {
      const request = new MockRequest('123');

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          metadata: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          const error: grpc.ServiceError = {
            name: 'UNAVAILABLE',
            message: 'Service unavailable',
            code: grpc.status.UNAVAILABLE,
            details: 'Server is temporarily unavailable',
            metadata: new grpc.Metadata() as any,
          };
          setImmediate(() => callback(error));
          return {} as any;
        }
      );

      await expect(adapter.unary(mockMethodDescriptor, request)).rejects.toThrow(
        GrpcError
      );

      try {
        await adapter.unary(mockMethodDescriptor, request);
      } catch (error) {
        expect(error).toBeInstanceOf(GrpcError);
        expect((error as GrpcError).code).toBe(GrpcStatusCode.UNAVAILABLE);
      }
    });

    it('should handle error with no response', async () => {
      const request = new MockRequest('123');

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          metadata: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          // Simulate success but no response (edge case)
          setImmediate(() => callback(null, undefined));
          return {} as any;
        }
      );

      await expect(adapter.unary(mockMethodDescriptor, request)).rejects.toThrow(
        GrpcError
      );

      try {
        await adapter.unary(mockMethodDescriptor, request);
      } catch (error) {
        expect(error).toBeInstanceOf(GrpcError);
        expect((error as GrpcError).code).toBe(GrpcStatusCode.UNKNOWN);
        expect((error as GrpcError).message).toContain('No response received');
      }
    });

    it('should attach request metadata', async () => {
      const request = new MockRequest('123');
      const metadata = {
        authorization: 'Bearer token123',
        'request-id': 'uuid-456',
      };

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          meta: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          // Verify metadata was attached
          expect(meta.get('authorization')).toEqual(['Bearer token123']);
          expect(meta.get('request-id')).toEqual(['uuid-456']);
          callback(null, new MockResponse('123', 'Test User'));
          return {} as any;
        }
      );

      await adapter.unary(mockMethodDescriptor, request, { metadata });
    });

    it('should use timeout for deadline', async () => {
      const request = new MockRequest('123');
      const timeout = 5000;
      const startTime = Date.now();

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          metadata: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          // Verify deadline is set correctly (approximately)
          expect(options.deadline).toBeDefined();
          expect(options.deadline).toBeGreaterThanOrEqual(startTime + timeout);
          expect(options.deadline).toBeLessThanOrEqual(
            startTime + timeout + 100
          ); // Allow 100ms tolerance
          callback(null, new MockResponse('123', 'Test User'));
          return {} as any;
        }
      );

      await adapter.unary(mockMethodDescriptor, request, { timeout });
    });

    it('should use explicit deadline', async () => {
      const request = new MockRequest('123');
      const deadline = Date.now() + 10000;

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          metadata: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          expect(options.deadline).toBe(deadline);
          callback(null, new MockResponse('123', 'Test User'));
          return {} as any;
        }
      );

      await adapter.unary(mockMethodDescriptor, request, { deadline });
    });

    it('should use default timeout from config', async () => {
      const adapterWithTimeout = new NativeGrpcAdapter({
        serverUrl: 'localhost:50051',
        defaultTimeout: 3000,
      });

      const request = new MockRequest('123');
      const startTime = Date.now();

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          metadata: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          expect(options.deadline).toBeDefined();
          expect(options.deadline).toBeGreaterThanOrEqual(startTime + 3000);
          callback(null, new MockResponse('123', 'Test User'));
          return {} as any;
        }
      );

      await adapterWithTimeout.unary(mockMethodDescriptor, request);

      adapterWithTimeout.close();
    });

    it('should serialize request correctly', async () => {
      const request = new MockRequest('123');

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          metadata: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          // Test serialization
          const serialized = serialize(req);
          expect(serialized).toBeInstanceOf(Buffer);

          // Should be able to deserialize back
          const deserialized = MockRequest.deserializeBinary(
            new Uint8Array(serialized)
          );
          expect(deserialized.userId).toBe('123');

          callback(null, new MockResponse('123', 'Test User'));
          return {} as any;
        }
      );

      await adapter.unary(mockMethodDescriptor, request);
    });

    it('should deserialize response correctly', async () => {
      const request = new MockRequest('123');
      const responseData = new MockResponse('123', 'Test User');

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          metadata: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          // Test deserialization
          const serialized = Buffer.from(responseData.serializeBinary());
          const deserialized = deserialize(serialized);
          expect(deserialized.userId).toBe('123');
          expect(deserialized.name).toBe('Test User');

          callback(null, responseData);
          return {} as any;
        }
      );

      const response = await adapter.unary(mockMethodDescriptor, request);
      expect(response.userId).toBe('123');
      expect(response.name).toBe('Test User');
    });

    it('should include error metadata in GrpcError', async () => {
      const request = new MockRequest('123');
      const errorMetadata = new grpc.Metadata() as any;
      errorMetadata.set('error-code', 'USER_NOT_FOUND');
      errorMetadata.set('retry-after', '60');

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          metadata: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          const error: grpc.ServiceError = {
            name: 'NOT_FOUND',
            message: 'User not found',
            code: grpc.status.NOT_FOUND,
            details: 'User not found',
            metadata: errorMetadata,
          };
          setImmediate(() => callback(error));
          return {} as any;
        }
      );

      try {
        await adapter.unary(mockMethodDescriptor, request);
        fail('Should have thrown GrpcError');
      } catch (error) {
        expect(error).toBeInstanceOf(GrpcError);
        const grpcError = error as GrpcError;
        expect(grpcError.metadata).toBeDefined();
        expect(grpcError.metadata?.get('error-code')).toEqual(['USER_NOT_FOUND']);
        expect(grpcError.metadata?.get('retry-after')).toEqual(['60']);
      }
    });
  });

  describe('edge cases', () => {
    let adapter: NativeGrpcAdapter;

    beforeEach(() => {
      adapter = new NativeGrpcAdapter({
        serverUrl: 'localhost:50051',
      });
    });

    afterEach(() => {
      adapter.close();
    });

    it('should handle very large request', async () => {
      const largeUserId = 'x'.repeat(10000);
      const request = new MockRequest(largeUserId);

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          metadata: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          callback(null, new MockResponse(largeUserId, 'Test User'));
          return {} as any;
        }
      );

      const response = await adapter.unary(mockMethodDescriptor, request);
      expect(response.userId).toBe(largeUserId);
    });

    it('should handle very large response', async () => {
      const request = new MockRequest('123');
      const largeName = 'x'.repeat(10000);

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          metadata: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          callback(null, new MockResponse('123', largeName));
          return {} as any;
        }
      );

      const response = await adapter.unary(mockMethodDescriptor, request);
      expect(response.name).toBe(largeName);
    });

    it('should handle concurrent requests', async () => {
      const requests = Array.from({ length: 10 }, (_, i) =>
        new MockRequest(`user-${i}`)
      );

      (mockClient.makeUnaryRequest as any).mockImplementation(
        (
          path: string,
          serialize: (value: any) => Buffer,
          deserialize: (value: Buffer) => any,
          req: any,
          metadata: grpc.Metadata,
          options: grpc.CallOptions,
          callback: grpc.requestCallback<any>
        ) => {
          setImmediate(() => {
            callback(null, new MockResponse(req.userId, `User ${req.userId}`));
          });
          return {} as any;
        }
      );

      const promises = requests.map((request) =>
        adapter.unary(mockMethodDescriptor, request)
      );

      const responses = await Promise.all(promises);

      responses.forEach((response, i) => {
        expect(response.userId).toBe(`user-${i}`);
        expect(response.name).toBe(`User user-${i}`);
      });
    });
  });
});
