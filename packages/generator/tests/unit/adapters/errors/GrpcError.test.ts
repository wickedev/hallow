/**
 * Unit tests for GrpcError class
 */

import {
  GrpcError,
  isGrpcError,
  type GrpcErrorDetails,
} from '../../../../src/adapters/errors/GrpcError';
import { GrpcStatusCode } from '../../../../src/adapters/errors/StatusCodes';
import { Metadata } from '../../../../src/adapters/types';

// Mock metadata for testing
const createMockMetadata = (data: Record<string, string[]>): Metadata => ({
  get: jest.fn((key: string) => data[key]),
  set: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
  getMap: jest.fn(() => data),
});

describe('GrpcError', () => {
  describe('constructor', () => {
    it('should create error with required fields', () => {
      const error = new GrpcError(
        'Not found',
        GrpcStatusCode.NOT_FOUND,
        'GetUser'
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(GrpcError);
      expect(error.message).toBe('Not found');
      expect(error.code).toBe(GrpcStatusCode.NOT_FOUND);
      expect(error.methodName).toBe('GetUser');
      expect(error.name).toBe('GrpcError');
    });

    it('should create error with metadata', () => {
      const metadata = createMockMetadata({
        'request-id': ['123'],
        'retry-after': ['60'],
      });

      const error = new GrpcError(
        'Service unavailable',
        GrpcStatusCode.UNAVAILABLE,
        'CreateUser',
        metadata
      );

      expect(error.metadata).toBe(metadata);
      expect(error.metadata?.getMap()).toEqual({
        'request-id': ['123'],
        'retry-after': ['60'],
      });
    });

    it('should create error with details', () => {
      const details: GrpcErrorDetails = {
        originalError: new Error('Connection refused'),
        code: 14,
        context: { attempt: 3, maxRetries: 5 },
      };

      const error = new GrpcError(
        'Connection failed',
        GrpcStatusCode.UNAVAILABLE,
        'ListUsers',
        undefined,
        details
      );

      expect(error.details).toBe(details);
      expect(error.details?.originalError?.message).toBe('Connection refused');
      expect(error.details?.code).toBe(14);
      expect(error.details?.context?.attempt).toBe(3);
    });

    it('should maintain stack trace', () => {
      const error = new GrpcError(
        'Test error',
        GrpcStatusCode.INTERNAL,
        'TestMethod'
      );

      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('GrpcError');
    });
  });

  describe('is', () => {
    it('should return true for matching status code', () => {
      const error = new GrpcError(
        'Not found',
        GrpcStatusCode.NOT_FOUND,
        'GetUser'
      );

      expect(error.is(GrpcStatusCode.NOT_FOUND)).toBe(true);
    });

    it('should return false for non-matching status code', () => {
      const error = new GrpcError(
        'Not found',
        GrpcStatusCode.NOT_FOUND,
        'GetUser'
      );

      expect(error.is(GrpcStatusCode.INTERNAL)).toBe(false);
      expect(error.is(GrpcStatusCode.OK)).toBe(false);
    });
  });

  describe('isAnyOf', () => {
    it('should return true if code matches any in array', () => {
      const error = new GrpcError(
        'Not found',
        GrpcStatusCode.NOT_FOUND,
        'GetUser'
      );

      expect(
        error.isAnyOf([
          GrpcStatusCode.NOT_FOUND,
          GrpcStatusCode.ALREADY_EXISTS,
        ])
      ).toBe(true);

      expect(
        error.isAnyOf([
          GrpcStatusCode.INTERNAL,
          GrpcStatusCode.NOT_FOUND,
          GrpcStatusCode.UNAVAILABLE,
        ])
      ).toBe(true);
    });

    it('should return false if code does not match any in array', () => {
      const error = new GrpcError(
        'Not found',
        GrpcStatusCode.NOT_FOUND,
        'GetUser'
      );

      expect(
        error.isAnyOf([GrpcStatusCode.INTERNAL, GrpcStatusCode.UNAVAILABLE])
      ).toBe(false);

      expect(error.isAnyOf([])).toBe(false);
    });
  });

  describe('getStatusName', () => {
    it('should return correct status name', () => {
      const error1 = new GrpcError(
        'Not found',
        GrpcStatusCode.NOT_FOUND,
        'GetUser'
      );
      expect(error1.getStatusName()).toBe('NOT_FOUND');

      const error2 = new GrpcError(
        'Internal error',
        GrpcStatusCode.INTERNAL,
        'ProcessData'
      );
      expect(error2.getStatusName()).toBe('INTERNAL');

      const error3 = new GrpcError('OK', GrpcStatusCode.OK, 'Success');
      expect(error3.getStatusName()).toBe('OK');
    });
  });

  describe('getDescription', () => {
    it('should return detailed description for status code', () => {
      const error = new GrpcError(
        'Not found',
        GrpcStatusCode.NOT_FOUND,
        'GetUser'
      );

      const description = error.getDescription();
      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(10);
      expect(description).toContain('not found');
    });

    it('should return different descriptions for different codes', () => {
      const error1 = new GrpcError(
        'Error 1',
        GrpcStatusCode.INTERNAL,
        'Method1'
      );
      const error2 = new GrpcError(
        'Error 2',
        GrpcStatusCode.UNAVAILABLE,
        'Method2'
      );

      expect(error1.getDescription()).not.toBe(error2.getDescription());
    });
  });

  describe('isRetryable', () => {
    it('should return true for retryable errors', () => {
      const unavailableError = new GrpcError(
        'Service unavailable',
        GrpcStatusCode.UNAVAILABLE,
        'GetData'
      );
      expect(unavailableError.isRetryable()).toBe(true);

      const deadlineError = new GrpcError(
        'Deadline exceeded',
        GrpcStatusCode.DEADLINE_EXCEEDED,
        'SlowOperation'
      );
      expect(deadlineError.isRetryable()).toBe(true);

      const resourceError = new GrpcError(
        'Resource exhausted',
        GrpcStatusCode.RESOURCE_EXHAUSTED,
        'RateLimited'
      );
      expect(resourceError.isRetryable()).toBe(true);

      const abortedError = new GrpcError(
        'Aborted',
        GrpcStatusCode.ABORTED,
        'Transaction'
      );
      expect(abortedError.isRetryable()).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      const notFoundError = new GrpcError(
        'Not found',
        GrpcStatusCode.NOT_FOUND,
        'GetUser'
      );
      expect(notFoundError.isRetryable()).toBe(false);

      const invalidError = new GrpcError(
        'Invalid',
        GrpcStatusCode.INVALID_ARGUMENT,
        'CreateUser'
      );
      expect(invalidError.isRetryable()).toBe(false);

      const permissionError = new GrpcError(
        'Permission denied',
        GrpcStatusCode.PERMISSION_DENIED,
        'DeleteUser'
      );
      expect(permissionError.isRetryable()).toBe(false);
    });
  });

  describe('isClientError', () => {
    it('should return true for client errors', () => {
      const notFoundError = new GrpcError(
        'Not found',
        GrpcStatusCode.NOT_FOUND,
        'GetUser'
      );
      expect(notFoundError.isClientError()).toBe(true);

      const invalidError = new GrpcError(
        'Invalid',
        GrpcStatusCode.INVALID_ARGUMENT,
        'CreateUser'
      );
      expect(invalidError.isClientError()).toBe(true);

      const permissionError = new GrpcError(
        'Permission denied',
        GrpcStatusCode.PERMISSION_DENIED,
        'DeleteUser'
      );
      expect(permissionError.isClientError()).toBe(true);
    });

    it('should return false for server errors', () => {
      const internalError = new GrpcError(
        'Internal',
        GrpcStatusCode.INTERNAL,
        'Process'
      );
      expect(internalError.isClientError()).toBe(false);

      const unavailableError = new GrpcError(
        'Unavailable',
        GrpcStatusCode.UNAVAILABLE,
        'GetData'
      );
      expect(unavailableError.isClientError()).toBe(false);
    });
  });

  describe('isServerError', () => {
    it('should return true for server errors', () => {
      const internalError = new GrpcError(
        'Internal',
        GrpcStatusCode.INTERNAL,
        'Process'
      );
      expect(internalError.isServerError()).toBe(true);

      const unavailableError = new GrpcError(
        'Unavailable',
        GrpcStatusCode.UNAVAILABLE,
        'GetData'
      );
      expect(unavailableError.isServerError()).toBe(true);

      const unimplementedError = new GrpcError(
        'Not implemented',
        GrpcStatusCode.UNIMPLEMENTED,
        'NewFeature'
      );
      expect(unimplementedError.isServerError()).toBe(true);
    });

    it('should return false for client errors', () => {
      const notFoundError = new GrpcError(
        'Not found',
        GrpcStatusCode.NOT_FOUND,
        'GetUser'
      );
      expect(notFoundError.isServerError()).toBe(false);

      const invalidError = new GrpcError(
        'Invalid',
        GrpcStatusCode.INVALID_ARGUMENT,
        'CreateUser'
      );
      expect(invalidError.isServerError()).toBe(false);
    });
  });

  describe('toUserMessage', () => {
    it('should format user-friendly message', () => {
      const error = new GrpcError(
        'User not found',
        GrpcStatusCode.NOT_FOUND,
        'GetUser'
      );

      const message = error.toUserMessage();
      expect(message).toContain('GetUser');
      expect(message).toContain('User not found');
      expect(message).toContain('NOT_FOUND');
    });

    it('should include all relevant information', () => {
      const error = new GrpcError(
        'Database connection failed',
        GrpcStatusCode.UNAVAILABLE,
        'ListUsers'
      );

      const message = error.toUserMessage();
      expect(message).toContain('ListUsers');
      expect(message).toContain('Database connection failed');
      expect(message).toContain('UNAVAILABLE');
      expect(message).toContain('gRPC');
    });
  });

  describe('toDebugMessage', () => {
    it('should format detailed debug message', () => {
      const error = new GrpcError(
        'User not found',
        GrpcStatusCode.NOT_FOUND,
        'GetUser'
      );

      const message = error.toDebugMessage();
      expect(message).toContain('GrpcError');
      expect(message).toContain('User not found');
      expect(message).toContain('NOT_FOUND');
      expect(message).toContain('GetUser');
      expect(message).toContain('Description:');
    });

    it('should include metadata in debug message', () => {
      const metadata = createMockMetadata({
        'request-id': ['123'],
      });

      const error = new GrpcError(
        'Error',
        GrpcStatusCode.INTERNAL,
        'Method',
        metadata
      );

      const message = error.toDebugMessage();
      expect(message).toContain('Metadata:');
      expect(message).toContain('request-id');
    });

    it('should include details in debug message', () => {
      const details: GrpcErrorDetails = {
        originalError: new Error('Original error'),
        context: { attempt: 3 },
      };

      const error = new GrpcError(
        'Error',
        GrpcStatusCode.INTERNAL,
        'Method',
        undefined,
        details
      );

      const message = error.toDebugMessage();
      expect(message).toContain('Details:');
      expect(message).toContain('Original Error:');
      expect(message).toContain('Original error');
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON object', () => {
      const error = new GrpcError(
        'User not found',
        GrpcStatusCode.NOT_FOUND,
        'GetUser'
      );

      const json = error.toJSON();
      expect(json.name).toBe('GrpcError');
      expect(json.message).toBe('User not found');
      expect(json.code).toBe(GrpcStatusCode.NOT_FOUND);
      expect(json.statusName).toBe('NOT_FOUND');
      expect(json.methodName).toBe('GetUser');
      expect(json.isRetryable).toBe(false);
      expect(json.isClientError).toBe(true);
      expect(json.isServerError).toBe(false);
    });

    it('should include metadata in JSON', () => {
      const metadata = createMockMetadata({
        'request-id': ['123'],
      });

      const error = new GrpcError(
        'Error',
        GrpcStatusCode.INTERNAL,
        'Method',
        metadata
      );

      const json = error.toJSON();
      expect(json.metadata).toEqual({ 'request-id': ['123'] });
    });

    it('should include details in JSON', () => {
      const details: GrpcErrorDetails = {
        code: 13,
        context: { attempt: 3 },
      };

      const error = new GrpcError(
        'Error',
        GrpcStatusCode.INTERNAL,
        'Method',
        undefined,
        details
      );

      const json = error.toJSON();
      expect(json.details).toBe(details);
    });

    it('should be JSON serializable', () => {
      const error = new GrpcError(
        'Test error',
        GrpcStatusCode.INTERNAL,
        'TestMethod'
      );

      expect(() => JSON.stringify(error.toJSON())).not.toThrow();
      const serialized = JSON.stringify(error.toJSON());
      expect(serialized).toContain('Test error');
      expect(serialized).toContain('INTERNAL');
    });
  });

  describe('toString', () => {
    it('should format concise string representation', () => {
      const error = new GrpcError(
        'User not found',
        GrpcStatusCode.NOT_FOUND,
        'GetUser'
      );

      const str = error.toString();
      expect(str).toContain('GrpcError');
      expect(str).toContain('User not found');
      expect(str).toContain('NOT_FOUND');
      expect(str).toContain('GetUser');
    });
  });

  describe('isGrpcError type guard', () => {
    it('should return true for GrpcError instances', () => {
      const error = new GrpcError(
        'Test',
        GrpcStatusCode.INTERNAL,
        'TestMethod'
      );

      expect(isGrpcError(error)).toBe(true);
    });

    it('should return false for regular Error instances', () => {
      const error = new Error('Regular error');
      expect(isGrpcError(error)).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isGrpcError(null)).toBe(false);
      expect(isGrpcError(undefined)).toBe(false);
    });

    it('should return false for non-error objects', () => {
      expect(isGrpcError({})).toBe(false);
      expect(isGrpcError('error')).toBe(false);
      expect(isGrpcError(123)).toBe(false);
    });

    it('should enable type narrowing in TypeScript', () => {
      const error: unknown = new GrpcError(
        'Test',
        GrpcStatusCode.INTERNAL,
        'TestMethod'
      );

      if (isGrpcError(error)) {
        // TypeScript should know error is GrpcError here
        expect(error.code).toBe(GrpcStatusCode.INTERNAL);
        expect(error.methodName).toBe('TestMethod');
        expect(error.getStatusName()).toBe('INTERNAL');
      }
    });
  });
});
