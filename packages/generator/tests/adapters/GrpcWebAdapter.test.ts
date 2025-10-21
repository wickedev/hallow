/**
 * Unit tests for GrpcWebAdapter - Unary RPC Logic
 *
 * Task 3.2: Implement Unary RPC Logic
 *
 * This test suite validates:
 * - Unary RPC method implementation
 * - Request/response handling via grpc.unary()
 * - Error handling and GrpcError creation
 * - Promise-based API
 * - Metadata support
 * - Debug mode functionality
 */

import { GrpcWebAdapter, GrpcError, isGrpcError, GrpcClientOptions, MethodDescriptor } from '../../src/adapters/GrpcWebAdapter';
import { grpc } from '@improbable-eng/grpc-web';

// Mock @improbable-eng/grpc-web
jest.mock('@improbable-eng/grpc-web', () => ({
  grpc: {
    unary: jest.fn(),
    invoke: jest.fn(),
    Code: {
      OK: 0,
      Cancelled: 1,
      Unknown: 2,
      InvalidArgument: 3,
      DeadlineExceeded: 4,
      NotFound: 5,
      AlreadyExists: 6,
      PermissionDenied: 7,
      ResourceExhausted: 8,
      FailedPrecondition: 9,
      Aborted: 10,
      OutOfRange: 11,
      Unimplemented: 12,
      Internal: 13,
      Unavailable: 14,
      DataLoss: 15,
      Unauthenticated: 16,
    },
    Metadata: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      has: jest.fn(),
    })),
  },
}));

describe('GrpcWebAdapter - Unary RPC', () => {
  let adapter: GrpcWebAdapter;
  const baseUrl = 'https://api.example.com';

  // Mock method descriptor
  const mockMethodDescriptor: MethodDescriptor = {
    methodName: 'GetUser',
    service: { serviceName: 'UserService' },
    requestStream: false,
    responseStream: false,
    requestType: 'GetUserRequest',
    responseType: 'GetUserResponse',
  };

  // Mock request and response
  const mockRequest = { userId: '123' };
  const mockResponse = { id: '123', name: 'Test User', email: 'test@example.com' };

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new GrpcWebAdapter(baseUrl);
  });

  describe('constructor', () => {
    it('should create adapter with base URL', () => {
      expect(adapter.getBaseUrl()).toBe(baseUrl);
    });

    it('should create adapter with default options', () => {
      const options = adapter.getOptions();
      expect(options.timeout).toBeUndefined();
      expect(options.metadata).toBeUndefined();
      expect(options.debug).toBe(false);
    });

    it('should create adapter with custom options', () => {
      const customOptions: GrpcClientOptions = {
        timeout: 5000,
        debug: true,
      };
      const customAdapter = new GrpcWebAdapter(baseUrl, customOptions);
      const options = customAdapter.getOptions();

      expect(options.timeout).toBe(5000);
      expect(options.debug).toBe(true);
    });
  });

  describe('unary() - Success Cases', () => {
    it('should make successful unary RPC call', async () => {
      // Mock grpc.unary to call onEnd with successful response
      (grpc.unary as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd({
            status: grpc.Code.OK,
            statusMessage: 'Success',
            message: mockResponse,
            headers: {},
            trailers: {},
          });
        }, 0);
      });

      const response = await adapter.unary(mockMethodDescriptor, mockRequest);

      expect(response).toEqual(mockResponse);
      expect(grpc.unary).toHaveBeenCalledWith(
        expect.objectContaining(mockMethodDescriptor),
        expect.objectContaining({
          host: baseUrl,
          request: mockRequest,
        })
      );
    });

    it('should pass request to grpc.unary', async () => {
      (grpc.unary as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd({
            status: grpc.Code.OK,
            statusMessage: 'Success',
            message: mockResponse,
            headers: {},
            trailers: {},
          });
        }, 0);
      });

      await adapter.unary(mockMethodDescriptor, mockRequest);

      const callArgs = (grpc.unary as jest.Mock).mock.calls[0][1];
      expect(callArgs.request).toEqual(mockRequest);
    });

    it('should pass base URL as host', async () => {
      (grpc.unary as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd({
            status: grpc.Code.OK,
            statusMessage: 'Success',
            message: mockResponse,
            headers: {},
            trailers: {},
          });
        }, 0);
      });

      await adapter.unary(mockMethodDescriptor, mockRequest);

      const callArgs = (grpc.unary as jest.Mock).mock.calls[0][1];
      expect(callArgs.host).toBe(baseUrl);
    });

    it('should include metadata in request if provided', async () => {
      const mockMetadata = new grpc.Metadata();
      const adapterWithMetadata = new GrpcWebAdapter(baseUrl, { metadata: mockMetadata });

      (grpc.unary as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd({
            status: grpc.Code.OK,
            statusMessage: 'Success',
            message: mockResponse,
            headers: {},
            trailers: {},
          });
        }, 0);
      });

      await adapterWithMetadata.unary(mockMethodDescriptor, mockRequest);

      const callArgs = (grpc.unary as jest.Mock).mock.calls[0][1];
      expect(callArgs.metadata).toBe(mockMetadata);
    });
  });

  describe('unary() - Error Handling', () => {
    it('should reject with GrpcError on NotFound status', async () => {
      (grpc.unary as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd({
            status: grpc.Code.NotFound,
            statusMessage: 'User not found',
            message: null,
            headers: {},
            trailers: {},
          });
        }, 0);
      });

      await expect(adapter.unary(mockMethodDescriptor, mockRequest))
        .rejects
        .toThrow(GrpcError);

      try {
        await adapter.unary(mockMethodDescriptor, mockRequest);
      } catch (error) {
        expect(isGrpcError(error)).toBe(true);
        if (isGrpcError(error)) {
          expect(error.code).toBe(grpc.Code.NotFound);
          expect(error.message).toBe('User not found');
          expect(error.methodName).toBe('GetUser');
        }
      }
    });

    it('should reject with GrpcError on Internal status', async () => {
      (grpc.unary as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd({
            status: grpc.Code.Internal,
            statusMessage: 'Internal server error',
            message: null,
            headers: {},
            trailers: {},
          });
        }, 0);
      });

      await expect(adapter.unary(mockMethodDescriptor, mockRequest))
        .rejects
        .toThrow(GrpcError);

      try {
        await adapter.unary(mockMethodDescriptor, mockRequest);
      } catch (error) {
        if (isGrpcError(error)) {
          expect(error.code).toBe(grpc.Code.Internal);
          expect(error.message).toBe('Internal server error');
        }
      }
    });

    it('should reject with GrpcError on Unavailable status', async () => {
      (grpc.unary as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd({
            status: grpc.Code.Unavailable,
            statusMessage: 'Service unavailable',
            message: null,
            headers: {},
            trailers: {},
          });
        }, 0);
      });

      await expect(adapter.unary(mockMethodDescriptor, mockRequest))
        .rejects
        .toThrow(GrpcError);

      try {
        await adapter.unary(mockMethodDescriptor, mockRequest);
      } catch (error) {
        if (isGrpcError(error)) {
          expect(error.code).toBe(grpc.Code.Unavailable);
        }
      }
    });

    it('should reject with GrpcError on PermissionDenied status', async () => {
      (grpc.unary as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd({
            status: grpc.Code.PermissionDenied,
            statusMessage: 'Permission denied',
            message: null,
            headers: {},
            trailers: {},
          });
        }, 0);
      });

      await expect(adapter.unary(mockMethodDescriptor, mockRequest))
        .rejects
        .toThrow(GrpcError);
    });

    it('should include trailers in GrpcError', async () => {
      const mockTrailers = new grpc.Metadata();

      (grpc.unary as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd({
            status: grpc.Code.InvalidArgument,
            statusMessage: 'Invalid argument',
            message: null,
            headers: {},
            trailers: mockTrailers,
          });
        }, 0);
      });

      try {
        await adapter.unary(mockMethodDescriptor, mockRequest);
      } catch (error) {
        if (isGrpcError(error)) {
          expect(error.metadata).toBe(mockTrailers);
        }
      }
    });

    it('should handle exceptions during grpc.unary call', async () => {
      (grpc.unary as jest.Mock).mockImplementation(() => {
        throw new Error('Network error');
      });

      await expect(adapter.unary(mockMethodDescriptor, mockRequest))
        .rejects
        .toThrow('Network error');
    });
  });

  describe('unary() - Debug Mode', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should log request in debug mode', async () => {
      const debugAdapter = new GrpcWebAdapter(baseUrl, { debug: true });

      (grpc.unary as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd({
            status: grpc.Code.OK,
            statusMessage: 'Success',
            message: mockResponse,
            headers: {},
            trailers: {},
          });
        }, 0);
      });

      await debugAdapter.unary(mockMethodDescriptor, mockRequest);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[GrpcWebAdapter] Unary call to GetUser'),
        mockRequest
      );
    });

    it('should log response in debug mode', async () => {
      const debugAdapter = new GrpcWebAdapter(baseUrl, { debug: true });

      (grpc.unary as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd({
            status: grpc.Code.OK,
            statusMessage: 'Success',
            message: mockResponse,
            headers: {},
            trailers: {},
          });
        }, 0);
      });

      await debugAdapter.unary(mockMethodDescriptor, mockRequest);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[GrpcWebAdapter] Unary call succeeded:'),
        mockResponse
      );
    });

    it('should log errors in debug mode', async () => {
      const debugAdapter = new GrpcWebAdapter(baseUrl, { debug: true });

      (grpc.unary as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd({
            status: grpc.Code.NotFound,
            statusMessage: 'Not found',
            message: null,
            headers: {},
            trailers: {},
          });
        }, 0);
      });

      try {
        await debugAdapter.unary(mockMethodDescriptor, mockRequest);
      } catch (error) {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          expect.stringContaining('[GrpcWebAdapter] Unary call failed:'),
          expect.any(GrpcError)
        );
      }
    });

    it('should not log when debug mode is disabled', async () => {
      (grpc.unary as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd({
            status: grpc.Code.OK,
            statusMessage: 'Success',
            message: mockResponse,
            headers: {},
            trailers: {},
          });
        }, 0);
      });

      await adapter.unary(mockMethodDescriptor, mockRequest);

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('GrpcError', () => {
    it('should create GrpcError with all properties', () => {
      const error = new GrpcError(
        'Test error',
        grpc.Code.InvalidArgument,
        'TestMethod'
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe(grpc.Code.InvalidArgument);
      expect(error.methodName).toBe('TestMethod');
      expect(error.name).toBe('GrpcError');
    });

    it('should check status code with isCode()', () => {
      const error = new GrpcError(
        'Not found',
        grpc.Code.NotFound,
        'GetUser'
      );

      expect(error.isCode(grpc.Code.NotFound)).toBe(true);
      expect(error.isCode(grpc.Code.OK)).toBe(false);
      expect(error.isCode(grpc.Code.Internal)).toBe(false);
    });

    it('should generate user-friendly message', () => {
      const error = new GrpcError(
        'Resource not found',
        grpc.Code.NotFound,
        'GetUser'
      );

      const userMessage = error.toUserMessage();
      expect(userMessage).toContain('gRPC');
      expect(userMessage).toContain('GetUser');
      expect(userMessage).toContain('Resource not found');
    });

    it('should preserve stack trace', () => {
      const error = new GrpcError(
        'Test error',
        grpc.Code.Internal,
        'TestMethod'
      );

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('GrpcError');
    });
  });

  describe('isGrpcError type guard', () => {
    it('should return true for GrpcError instance', () => {
      const error = new GrpcError(
        'Test',
        grpc.Code.Internal,
        'TestMethod'
      );

      expect(isGrpcError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Regular error');
      expect(isGrpcError(error)).toBe(false);
    });

    it('should return false for non-error values', () => {
      expect(isGrpcError(null)).toBe(false);
      expect(isGrpcError(undefined)).toBe(false);
      expect(isGrpcError({})).toBe(false);
      expect(isGrpcError('error')).toBe(false);
      expect(isGrpcError(123)).toBe(false);
    });
  });

  describe('Type Safety', () => {
    interface TestRequest {
      userId: string;
    }

    interface TestResponse {
      id: string;
      name: string;
      email: string;
    }

    it('should maintain generic type parameters', async () => {
      const typedRequest: TestRequest = { userId: '123' };
      const typedResponse: TestResponse = {
        id: '123',
        name: 'Test User',
        email: 'test@example.com',
      };

      (grpc.unary as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd({
            status: grpc.Code.OK,
            statusMessage: 'Success',
            message: typedResponse,
            headers: {},
            trailers: {},
          });
        }, 0);
      });

      const response = await adapter.unary<TestRequest, TestResponse>(
        mockMethodDescriptor,
        typedRequest
      );

      // TypeScript should infer response as TestResponse
      expect(response.id).toBe('123');
      expect(response.name).toBe('Test User');
      expect(response.email).toBe('test@example.com');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null message in successful response', async () => {
      (grpc.unary as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd({
            status: grpc.Code.OK,
            statusMessage: 'Success',
            message: null,
            headers: {},
            trailers: {},
          });
        }, 0);
      });

      const response = await adapter.unary(mockMethodDescriptor, mockRequest);
      expect(response).toBeNull();
    });

    it('should handle empty request object', async () => {
      (grpc.unary as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd({
            status: grpc.Code.OK,
            statusMessage: 'Success',
            message: {},
            headers: {},
            trailers: {},
          });
        }, 0);
      });

      const response = await adapter.unary(mockMethodDescriptor, {});
      expect(response).toEqual({});
    });

    it('should handle empty base URL', () => {
      const emptyAdapter = new GrpcWebAdapter('');
      expect(emptyAdapter.getBaseUrl()).toBe('');
    });
  });
});

/**
 * Unit tests for GrpcWebAdapter - Server Streaming RPC Logic
 *
 * Task 3.3: Implement Server Streaming Logic
 *
 * This test suite validates:
 * - Server streaming RPC method implementation
 * - grpc.invoke() usage for streaming
 * - Observable conversion and event handling
 * - Stream completion and error handling
 * - Message emission via observer.next()
 * - Cancellation support and resource cleanup
 */
describe('GrpcWebAdapter - Server Streaming RPC', () => {
  let adapter: GrpcWebAdapter;
  const baseUrl = 'https://api.example.com';

  // Mock streaming method descriptor
  const mockStreamingDescriptor: MethodDescriptor = {
    methodName: 'ListUsers',
    service: { serviceName: 'UserService' },
    requestStream: false,
    responseStream: true,
    requestType: 'ListUsersRequest',
    responseType: 'ListUsersResponse',
  };

  // Mock request and responses
  const mockRequest = { pageSize: 10, pageToken: '' };
  const mockResponses = [
    { users: [{ id: '1', name: 'User 1' }], nextPageToken: 'token1' },
    { users: [{ id: '2', name: 'User 2' }], nextPageToken: 'token2' },
    { users: [{ id: '3', name: 'User 3' }], nextPageToken: '' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new GrpcWebAdapter(baseUrl);
  });

  describe('serverStream() - Success Cases', () => {
    it('should create Observable stream from grpc.invoke', (done) => {
      const messages: any[] = [];

      // Mock grpc.invoke to emit multiple messages
      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          mockResponses.forEach(response => options.onMessage(response));
          options.onEnd(grpc.Code.OK, 'Success', {});
        }, 0);

        return { close: jest.fn() };
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);

      stream.subscribe({
        next: (message) => messages.push(message),
        error: (err) => done(err),
        complete: () => {
          expect(messages).toEqual(mockResponses);
          expect(messages.length).toBe(3);
          done();
        }
      });
    });

    it('should call grpc.invoke with correct parameters', (done) => {
      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd(grpc.Code.OK, 'Success', {});
        }, 0);

        return { close: jest.fn() };
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);

      stream.subscribe({
        complete: () => {
          expect(grpc.invoke).toHaveBeenCalledWith(
            expect.objectContaining(mockStreamingDescriptor),
            expect.objectContaining({
              host: baseUrl,
              request: mockRequest,
            })
          );
          done();
        }
      });
    });

    it('should emit each message via observer.next()', (done) => {
      const receivedMessages: any[] = [];
      let messageCount = 0;

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          mockResponses.forEach(response => options.onMessage(response));
          options.onEnd(grpc.Code.OK, 'Success', {});
        }, 0);

        return { close: jest.fn() };
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);

      stream.subscribe({
        next: (message) => {
          messageCount++;
          receivedMessages.push(message);
        },
        complete: () => {
          expect(messageCount).toBe(3);
          expect(receivedMessages).toEqual(mockResponses);
          done();
        }
      });
    });

    it('should complete stream when onEnd called with OK status', (done) => {
      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onMessage(mockResponses[0]);
          options.onEnd(grpc.Code.OK, 'Success', {});
        }, 0);

        return { close: jest.fn() };
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      let completeCalled = false;

      stream.subscribe({
        next: () => {},
        complete: () => {
          completeCalled = true;
          expect(completeCalled).toBe(true);
          done();
        }
      });
    });

    it('should pass metadata to grpc.invoke if provided', (done) => {
      const mockMetadata = new grpc.Metadata();
      const adapterWithMetadata = new GrpcWebAdapter(baseUrl, { metadata: mockMetadata });

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd(grpc.Code.OK, 'Success', {});
        }, 0);

        return { close: jest.fn() };
      });

      const stream = adapterWithMetadata.serverStream(mockStreamingDescriptor, mockRequest);

      stream.subscribe({
        complete: () => {
          const callArgs = (grpc.invoke as jest.Mock).mock.calls[0][1];
          expect(callArgs.metadata).toBe(mockMetadata);
          done();
        }
      });
    });
  });

  describe('serverStream() - Error Handling', () => {
    it('should emit error when onEnd called with non-OK status', (done) => {
      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd(grpc.Code.NotFound, 'Users not found', {});
        }, 0);

        return { close: jest.fn() };
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);

      stream.subscribe({
        next: () => {},
        error: (error) => {
          expect(isGrpcError(error)).toBe(true);
          if (isGrpcError(error)) {
            expect(error.code).toBe(grpc.Code.NotFound);
            expect(error.message).toBe('Users not found');
            expect(error.methodName).toBe('ListUsers');
          }
          done();
        }
      });
    });

    it('should emit error on Internal status', (done) => {
      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onMessage(mockResponses[0]);
          options.onEnd(grpc.Code.Internal, 'Internal server error', {});
        }, 0);

        return { close: jest.fn() };
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);

      stream.subscribe({
        next: () => {},
        error: (error) => {
          if (isGrpcError(error)) {
            expect(error.code).toBe(grpc.Code.Internal);
            expect(error.message).toBe('Internal server error');
          }
          done();
        }
      });
    });

    it('should emit error on Unavailable status', (done) => {
      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd(grpc.Code.Unavailable, 'Service unavailable', {});
        }, 0);

        return { close: jest.fn() };
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);

      stream.subscribe({
        next: () => {},
        error: (error) => {
          if (isGrpcError(error)) {
            expect(error.code).toBe(grpc.Code.Unavailable);
          }
          done();
        }
      });
    });

    it('should include trailers in GrpcError', (done) => {
      const mockTrailers = new grpc.Metadata();

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd(grpc.Code.PermissionDenied, 'Access denied', mockTrailers);
        }, 0);

        return { close: jest.fn() };
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);

      stream.subscribe({
        next: () => {},
        error: (error) => {
          if (isGrpcError(error)) {
            expect(error.metadata).toBe(mockTrailers);
          }
          done();
        }
      });
    });

    it('should handle exceptions during grpc.invoke call', (done) => {
      (grpc.invoke as jest.Mock).mockImplementation(() => {
        throw new Error('Network error');
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);

      stream.subscribe({
        next: () => {},
        error: (error) => {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe('Network error');
          done();
        }
      });
    });
  });

  describe('serverStream() - Cancellation and Resource Management', () => {
    it('should close gRPC client on unsubscribe', (done) => {
      const mockClient = { close: jest.fn() };

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        // Don't call onEnd immediately to allow unsubscribe test
        return mockClient;
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({
        next: () => {},
      });

      // Unsubscribe immediately
      subscription.unsubscribe();

      // Wait a bit to ensure close was called
      setTimeout(() => {
        expect(mockClient.close).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should not emit messages after unsubscribe', (done) => {
      const mockClient = { close: jest.fn() };
      const messages: any[] = [];
      let onMessageCallback: any;

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        onMessageCallback = options.onMessage;
        return mockClient;
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({
        next: (message) => messages.push(message),
      });

      // Emit first message
      setTimeout(() => {
        onMessageCallback(mockResponses[0]);
      }, 10);

      // Unsubscribe after first message
      setTimeout(() => {
        subscription.unsubscribe();
      }, 20);

      // Try to emit second message after unsubscribe
      setTimeout(() => {
        onMessageCallback(mockResponses[1]);
      }, 30);

      // Verify only first message was received
      setTimeout(() => {
        expect(messages.length).toBe(1);
        expect(messages[0]).toEqual(mockResponses[0]);
        done();
      }, 50);
    });

    it('should prevent memory leaks by clearing cancellation callbacks', (done) => {
      const mockClient = { close: jest.fn() };

      (grpc.invoke as jest.Mock).mockImplementation(() => mockClient);

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({
        next: () => {},
      });

      subscription.unsubscribe();

      // Verify cleanup happened (close was called)
      setTimeout(() => {
        expect(mockClient.close).toHaveBeenCalledTimes(1);

        // Multiple unsubscribes should not cause issues
        subscription.unsubscribe();
        subscription.unsubscribe();

        expect(mockClient.close).toHaveBeenCalledTimes(1);
        done();
      }, 10);
    });

    it('should handle concurrent stream subscriptions', (done) => {
      const mockClient1 = { close: jest.fn() };
      const mockClient2 = { close: jest.fn() };
      let callCount = 0;

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        callCount++;
        if (callCount === 1) {
          setTimeout(() => {
            options.onMessage(mockResponses[0]);
            options.onEnd(grpc.Code.OK, 'Success', {});
          }, 10);
          return mockClient1;
        } else {
          setTimeout(() => {
            options.onMessage(mockResponses[1]);
            options.onEnd(grpc.Code.OK, 'Success', {});
          }, 15);
          return mockClient2;
        }
      });

      const stream1 = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const stream2 = adapter.serverStream(mockStreamingDescriptor, mockRequest);

      const messages1: any[] = [];
      const messages2: any[] = [];
      let completed = 0;

      stream1.subscribe({
        next: (msg) => messages1.push(msg),
        complete: () => {
          completed++;
          if (completed === 2) {
            expect(messages1).toEqual([mockResponses[0]]);
            expect(messages2).toEqual([mockResponses[1]]);
            done();
          }
        }
      });

      stream2.subscribe({
        next: (msg) => messages2.push(msg),
        complete: () => {
          completed++;
          if (completed === 2) {
            expect(messages1).toEqual([mockResponses[0]]);
            expect(messages2).toEqual([mockResponses[1]]);
            done();
          }
        }
      });
    });
  });

  describe('serverStream() - Debug Mode', () => {
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });

    it('should log stream start in debug mode', (done) => {
      const debugAdapter = new GrpcWebAdapter(baseUrl, { debug: true });

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd(grpc.Code.OK, 'Success', {});
        }, 0);

        return { close: jest.fn() };
      });

      const stream = debugAdapter.serverStream(mockStreamingDescriptor, mockRequest);

      stream.subscribe({
        complete: () => {
          expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('[GrpcWebAdapter] Server stream to ListUsers'),
            mockRequest
          );
          done();
        }
      });
    });

    it('should log each message in debug mode', (done) => {
      const debugAdapter = new GrpcWebAdapter(baseUrl, { debug: true });

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onMessage(mockResponses[0]);
          options.onMessage(mockResponses[1]);
          options.onEnd(grpc.Code.OK, 'Success', {});
        }, 0);

        return { close: jest.fn() };
      });

      const stream = debugAdapter.serverStream(mockStreamingDescriptor, mockRequest);

      stream.subscribe({
        complete: () => {
          expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('[GrpcWebAdapter] Stream message received:'),
            mockResponses[0]
          );
          expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('[GrpcWebAdapter] Stream message received:'),
            mockResponses[1]
          );
          done();
        }
      });
    });

    it('should log stream completion in debug mode', (done) => {
      const debugAdapter = new GrpcWebAdapter(baseUrl, { debug: true });

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd(grpc.Code.OK, 'Success', {});
        }, 0);

        return { close: jest.fn() };
      });

      const stream = debugAdapter.serverStream(mockStreamingDescriptor, mockRequest);

      stream.subscribe({
        complete: () => {
          expect(consoleLogSpy).toHaveBeenCalledWith(
            expect.stringContaining('[GrpcWebAdapter] Stream completed successfully')
          );
          done();
        }
      });
    });

    it('should log stream errors in debug mode', (done) => {
      const debugAdapter = new GrpcWebAdapter(baseUrl, { debug: true });

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd(grpc.Code.Internal, 'Internal error', {});
        }, 0);

        return { close: jest.fn() };
      });

      const stream = debugAdapter.serverStream(mockStreamingDescriptor, mockRequest);

      stream.subscribe({
        next: () => {},
        error: (error) => {
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('[GrpcWebAdapter] Stream ended with error:'),
            expect.any(GrpcError)
          );
          done();
        }
      });
    });

    it('should log cancellation in debug mode', (done) => {
      const debugAdapter = new GrpcWebAdapter(baseUrl, { debug: true });
      const mockClient = { close: jest.fn() };

      (grpc.invoke as jest.Mock).mockImplementation(() => mockClient);

      const stream = debugAdapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({ next: () => {} });

      subscription.unsubscribe();

      setTimeout(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('[GrpcWebAdapter] Stream cancelled')
        );
        done();
      }, 10);
    });

    it('should not log when debug mode is disabled', (done) => {
      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onMessage(mockResponses[0]);
          options.onEnd(grpc.Code.OK, 'Success', {});
        }, 0);

        return { close: jest.fn() };
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);

      stream.subscribe({
        complete: () => {
          expect(consoleLogSpy).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('CancellationToken Integration', () => {
    it('should use CancellationToken for cleanup', (done) => {
      const mockClient = { close: jest.fn() };

      (grpc.invoke as jest.Mock).mockImplementation(() => mockClient);

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({ next: () => {} });

      subscription.unsubscribe();

      setTimeout(() => {
        // Verify client.close was called through cancellation token
        expect(mockClient.close).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should check isCancelled before emitting messages', (done) => {
      const mockClient = { close: jest.fn() };
      let onMessageCallback: any;
      const messages: any[] = [];

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        onMessageCallback = options.onMessage;
        return mockClient;
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({
        next: (msg) => messages.push(msg),
      });

      // Unsubscribe immediately
      subscription.unsubscribe();

      // Try to emit message after cancellation
      setTimeout(() => {
        onMessageCallback(mockResponses[0]);
      }, 10);

      // Verify no messages were emitted after cancellation
      setTimeout(() => {
        expect(messages.length).toBe(0);
        done();
      }, 20);
    });
  });

  describe('Type Safety - Server Streaming', () => {
    interface TestStreamRequest {
      pageSize: number;
      pageToken: string;
    }

    interface TestStreamResponse {
      users: Array<{ id: string; name: string }>;
      nextPageToken: string;
    }

    it('should maintain generic type parameters for streaming', (done) => {
      const typedRequest: TestStreamRequest = { pageSize: 10, pageToken: '' };
      const typedResponse: TestStreamResponse = {
        users: [{ id: '1', name: 'User 1' }],
        nextPageToken: 'token1',
      };

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onMessage(typedResponse);
          options.onEnd(grpc.Code.OK, 'Success', {});
        }, 0);

        return { close: jest.fn() };
      });

      const stream = adapter.serverStream<TestStreamRequest, TestStreamResponse>(
        mockStreamingDescriptor,
        typedRequest
      );

      stream.subscribe({
        next: (response) => {
          // TypeScript should infer response as TestStreamResponse
          expect(response.users).toBeDefined();
          expect(response.users[0].id).toBe('1');
          expect(response.nextPageToken).toBe('token1');
        },
        complete: () => done()
      });
    });
  });
});
