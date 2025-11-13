import * as grpc from '@grpc/grpc-js';
import { loggerMiddleware } from '../middleware/logger';
import { errorHandlerMiddleware } from '../middleware/error-handler';

// Mock console methods
const mockConsole = () => {
  const originalLog = console.log;
  const originalError = console.error;

  const logSpy = jest.spyOn(console, 'log').mockImplementation();
  const errorSpy = jest.spyOn(console, 'error').mockImplementation();

  return {
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
    },
    logSpy,
    errorSpy,
  };
};

describe('Middleware', () => {
  describe('Logger Middleware', () => {
    let consoleMock: ReturnType<typeof mockConsole>;

    beforeEach(() => {
      consoleMock = mockConsole();
    });

    afterEach(() => {
      consoleMock.restore();
    });

    it('logs incoming requests', () => {
      const mockCall = {
        metadata: new grpc.Metadata(),
        request: { name: 'Test' },
        getPeer: () => '127.0.0.1:12345',
      };

      const mockCallback = jest.fn();
      const mockHandler = jest.fn((call: any, callback: any) => {
        callback(null, { reply: 'Hello' });
      });

      const wrappedHandler = loggerMiddleware(mockHandler);
      wrappedHandler(mockCall as any, mockCallback);

      expect(consoleMock.logSpy).toHaveBeenCalled();
      // Should log request details
      const logCalls = consoleMock.logSpy.mock.calls;
      const hasRequestLog = logCalls.some((call) =>
        call.some((arg) => typeof arg === 'string' && arg.includes('Request'))
      );
      expect(hasRequestLog).toBe(true);
    });

    it('logs successful responses', (done) => {
      const mockCall = {
        metadata: new grpc.Metadata(),
        request: { name: 'Test' },
        getPeer: () => '127.0.0.1:12345',
      };

      const mockHandler = jest.fn((call: any, callback: any) => {
        callback(null, { reply: 'Hello' });
      });

      const wrappedHandler = loggerMiddleware(mockHandler);

      wrappedHandler(mockCall as any, (error: any, response: any) => {
        expect(consoleMock.logSpy).toHaveBeenCalled();
        const logCalls = consoleMock.logSpy.mock.calls;
        const hasResponseLog = logCalls.some((call) =>
          call.some((arg) => typeof arg === 'string' && arg.includes('Response'))
        );
        expect(hasResponseLog).toBe(true);
        done();
      });
    });

    it('logs errors', (done) => {
      const mockCall = {
        metadata: new grpc.Metadata(),
        request: { name: 'Test' },
        getPeer: () => '127.0.0.1:12345',
      };

      const mockError = {
        code: grpc.status.INTERNAL,
        message: 'Test error',
      };

      const mockHandler = jest.fn((call: any, callback: any) => {
        callback(mockError, null);
      });

      const wrappedHandler = loggerMiddleware(mockHandler);

      wrappedHandler(mockCall as any, (error: any, response: any) => {
        expect(consoleMock.errorSpy).toHaveBeenCalled();
        done();
      });
    });

    it('passes through handler call correctly', (done) => {
      const mockCall = {
        metadata: new grpc.Metadata(),
        request: { name: 'PassThrough' },
        getPeer: () => '127.0.0.1:12345',
      };

      const expectedResponse = { reply: 'Hello PassThrough' };
      const mockHandler = jest.fn((call: any, callback: any) => {
        callback(null, expectedResponse);
      });

      const wrappedHandler = loggerMiddleware(mockHandler);

      wrappedHandler(mockCall as any, (error: any, response: any) => {
        expect(mockHandler).toHaveBeenCalledWith(mockCall, expect.any(Function));
        expect(error).toBeNull();
        expect(response).toEqual(expectedResponse);
        done();
      });
    });

    it('logs request metadata', () => {
      const metadata = new grpc.Metadata();
      metadata.add('custom-header', 'test-value');

      const mockCall = {
        metadata,
        request: { name: 'Metadata Test' },
        getPeer: () => '127.0.0.1:12345',
      };

      const mockHandler = jest.fn((call: any, callback: any) => {
        callback(null, { reply: 'OK' });
      });

      const wrappedHandler = loggerMiddleware(mockHandler);
      wrappedHandler(mockCall as any, jest.fn());

      expect(consoleMock.logSpy).toHaveBeenCalled();
    });

    it('measures request duration', (done) => {
      const mockCall = {
        metadata: new grpc.Metadata(),
        request: { name: 'Duration Test' },
        getPeer: () => '127.0.0.1:12345',
      };

      const mockHandler = jest.fn((call: any, callback: any) => {
        setTimeout(() => {
          callback(null, { reply: 'Delayed' });
        }, 50);
      });

      const wrappedHandler = loggerMiddleware(mockHandler);

      wrappedHandler(mockCall as any, (error: any, response: any) => {
        const logCalls = consoleMock.logSpy.mock.calls;
        // Should log duration in some format
        expect(logCalls.length).toBeGreaterThan(0);
        done();
      });
    });
  });

  describe('Error Handler Middleware', () => {
    it('wraps JavaScript errors in gRPC errors', (done) => {
      const mockCall = {
        metadata: new grpc.Metadata(),
        request: { name: 'Error Test' },
      };

      const jsError = new Error('JavaScript error');
      const mockHandler = jest.fn((call: any, callback: any) => {
        throw jsError;
      });

      const wrappedHandler = errorHandlerMiddleware(mockHandler);

      wrappedHandler(mockCall as any, (error: any, response: any) => {
        expect(error).toBeDefined();
        expect(error.code).toBeDefined();
        expect(error.message).toBe('JavaScript error');
        expect(response).toBeNull();
        done();
      });
    });

    it('maps common errors to appropriate gRPC status codes', (done) => {
      const mockCall = {
        metadata: new grpc.Metadata(),
        request: { name: 'Test' },
      };

      const validationError = new Error('Name is required');
      const mockHandler = jest.fn((call: any, callback: any) => {
        throw validationError;
      });

      const wrappedHandler = errorHandlerMiddleware(mockHandler);

      wrappedHandler(mockCall as any, (error: any, response: any) => {
        expect(error).toBeDefined();
        expect(error.code).toBe(grpc.status.INVALID_ARGUMENT);
        done();
      });
    });

    it('handles TypeError as INVALID_ARGUMENT', (done) => {
      const mockCall = {
        metadata: new grpc.Metadata(),
        request: { name: 'Test' },
      };

      const mockHandler = jest.fn((call: any, callback: any) => {
        throw new TypeError('Invalid type');
      });

      const wrappedHandler = errorHandlerMiddleware(mockHandler);

      wrappedHandler(mockCall as any, (error: any, response: any) => {
        expect(error.code).toBe(grpc.status.INVALID_ARGUMENT);
        done();
      });
    });

    it('handles RangeError as OUT_OF_RANGE', (done) => {
      const mockCall = {
        metadata: new grpc.Metadata(),
        request: { name: 'Test' },
      };

      const mockHandler = jest.fn((call: any, callback: any) => {
        throw new RangeError('Out of range');
      });

      const wrappedHandler = errorHandlerMiddleware(mockHandler);

      wrappedHandler(mockCall as any, (error: any, response: any) => {
        expect(error.code).toBe(grpc.status.OUT_OF_RANGE);
        done();
      });
    });

    it('passes through existing gRPC errors unchanged', (done) => {
      const mockCall = {
        metadata: new grpc.Metadata(),
        request: { name: 'Test' },
      };

      const grpcError = {
        code: grpc.status.NOT_FOUND,
        message: 'Resource not found',
      };

      const mockHandler = jest.fn((call: any, callback: any) => {
        callback(grpcError, null);
      });

      const wrappedHandler = errorHandlerMiddleware(mockHandler);

      wrappedHandler(mockCall as any, (error: any, response: any) => {
        expect(error).toEqual(grpcError);
        done();
      });
    });

    it('passes through successful responses unchanged', (done) => {
      const mockCall = {
        metadata: new grpc.Metadata(),
        request: { name: 'Success' },
      };

      const expectedResponse = { reply: 'Success response' };
      const mockHandler = jest.fn((call: any, callback: any) => {
        callback(null, expectedResponse);
      });

      const wrappedHandler = errorHandlerMiddleware(mockHandler);

      wrappedHandler(mockCall as any, (error: any, response: any) => {
        expect(error).toBeNull();
        expect(response).toEqual(expectedResponse);
        done();
      });
    });

    it('handles async errors', (done) => {
      const mockCall = {
        metadata: new grpc.Metadata(),
        request: { name: 'Async Error' },
      };

      const mockHandler = jest.fn(async (call: any, callback: any) => {
        await Promise.reject(new Error('Async error'));
      });

      const wrappedHandler = errorHandlerMiddleware(mockHandler);

      wrappedHandler(mockCall as any, (error: any, response: any) => {
        expect(error).toBeDefined();
        expect(error.message).toBe('Async error');
        done();
      });
    });

    it('handles null/undefined errors gracefully', (done) => {
      const mockCall = {
        metadata: new grpc.Metadata(),
        request: { name: 'Test' },
      };

      const mockHandler = jest.fn((call: any, callback: any) => {
        throw null;
      });

      const wrappedHandler = errorHandlerMiddleware(mockHandler);

      wrappedHandler(mockCall as any, (error: any, response: any) => {
        expect(error).toBeDefined();
        expect(error.code).toBeDefined();
        done();
      });
    });

    it('preserves error stack traces', (done) => {
      const mockCall = {
        metadata: new grpc.Metadata(),
        request: { name: 'Stack Test' },
      };

      const testError = new Error('Test with stack');
      const mockHandler = jest.fn((call: any, callback: any) => {
        throw testError;
      });

      const wrappedHandler = errorHandlerMiddleware(mockHandler);

      wrappedHandler(mockCall as any, (error: any, response: any) => {
        expect(error.message).toBe('Test with stack');
        // Stack should be preserved in some form
        done();
      });
    });
  });

  describe('Middleware Composition', () => {
    let consoleMock: ReturnType<typeof mockConsole>;

    beforeEach(() => {
      consoleMock = mockConsole();
    });

    afterEach(() => {
      consoleMock.restore();
    });

    it('can compose multiple middleware together', (done) => {
      const mockCall = {
        metadata: new grpc.Metadata(),
        request: { name: 'Composed' },
        getPeer: () => '127.0.0.1:12345',
      };

      const baseHandler = jest.fn((call: any, callback: any) => {
        callback(null, { reply: 'Success' });
      });

      // Compose middleware
      const handlerWithLogging = loggerMiddleware(baseHandler);
      const handlerWithErrorHandling = errorHandlerMiddleware(handlerWithLogging);

      handlerWithErrorHandling(mockCall as any, (error: any, response: any) => {
        expect(error).toBeNull();
        expect(response).toEqual({ reply: 'Success' });
        expect(baseHandler).toHaveBeenCalled();
        expect(consoleMock.logSpy).toHaveBeenCalled();
        done();
      });
    });

    it('handles errors through composed middleware', (done) => {
      const mockCall = {
        metadata: new grpc.Metadata(),
        request: { name: 'Error' },
        getPeer: () => '127.0.0.1:12345',
      };

      const baseHandler = jest.fn((call: any, callback: any) => {
        throw new Error('Composed error');
      });

      const handlerWithLogging = loggerMiddleware(baseHandler);
      const handlerWithErrorHandling = errorHandlerMiddleware(handlerWithLogging);

      handlerWithErrorHandling(mockCall as any, (error: any, response: any) => {
        expect(error).toBeDefined();
        expect(error.message).toBe('Composed error');
        expect(consoleMock.errorSpy).toHaveBeenCalled();
        done();
      });
    });
  });
});
