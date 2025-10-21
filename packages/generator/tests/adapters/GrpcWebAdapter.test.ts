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
