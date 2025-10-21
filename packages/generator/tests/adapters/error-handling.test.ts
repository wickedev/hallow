/**
 * Comprehensive Error Handling Tests
 *
 * Phase 5 - Task 5.1: Implement GrpcError Classes
 * Phase 5 - Task 5.4: Testing
 *
 * This test suite validates all error classes and type guards for:
 * - GrpcError (gRPC communication errors)
 * - SerializationError (serialization/deserialization errors)
 * - ValidationError (request validation errors)
 *
 * Requirements Coverage:
 * - FR-7 AC 1-10: Error handling and resilience
 * - NFR-3 AC 1-3: Test coverage >95%
 */

// Mock @improbable-eng/grpc-web with TypeScript enum-style reverse mapping
// This must be defined before jest.mock() call
const createMockCode = () => {
  const code: any = {
    OK: 0,
    Canceled: 1,
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
  };

  // Add reverse mapping (number -> name) like TypeScript enums
  Object.keys(code).forEach(key => {
    const value = code[key];
    code[value] = key;
  });

  return code;
};

jest.mock('@improbable-eng/grpc-web', () => ({
  grpc: {
    Code: createMockCode(),
    Metadata: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      set: jest.fn(),
    })),
  },
}));

import { grpc } from '@improbable-eng/grpc-web';
import { GrpcError, isGrpcError } from '../../src/adapters/GrpcWebAdapter';
import {
  SerializationError,
  ValidationError,
  isSerializationError,
  isValidationError,
} from '../../src/adapters/SerializationAdapter';

describe('Error Handling - Phase 5', () => {
  describe('GrpcError', () => {
    describe('constructor', () => {
      it('should create GrpcError with all required properties', () => {
        const error = new GrpcError(
          'User not found',
          grpc.Code.NotFound,
          'GetUser'
        );

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(GrpcError);
        expect(error.message).toBe('User not found');
        expect(error.code).toBe(grpc.Code.NotFound);
        expect(error.methodName).toBe('GetUser');
        expect(error.name).toBe('GrpcError');
      });

      it('should create GrpcError with metadata', () => {
        const metadata = new grpc.Metadata();
        const error = new GrpcError(
          'Internal error',
          grpc.Code.Internal,
          'CreateUser',
          metadata
        );

        expect(error.metadata).toBe(metadata);
      });

      it('should create GrpcError without metadata', () => {
        const error = new GrpcError(
          'Service unavailable',
          grpc.Code.Unavailable,
          'ListUsers'
        );

        expect(error.metadata).toBeUndefined();
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

      it('should handle all gRPC status codes', () => {
        const statusCodes = [
          grpc.Code.Canceled,
          grpc.Code.Unknown,
          grpc.Code.InvalidArgument,
          grpc.Code.DeadlineExceeded,
          grpc.Code.NotFound,
          grpc.Code.AlreadyExists,
          grpc.Code.PermissionDenied,
          grpc.Code.ResourceExhausted,
          grpc.Code.FailedPrecondition,
          grpc.Code.Aborted,
          grpc.Code.OutOfRange,
          grpc.Code.Unimplemented,
          grpc.Code.Internal,
          grpc.Code.Unavailable,
          grpc.Code.DataLoss,
          grpc.Code.Unauthenticated,
        ];

        statusCodes.forEach(code => {
          const error = new GrpcError('Test', code, 'TestMethod');
          expect(error.code).toBe(code);
        });
      });
    });

    describe('isCode()', () => {
      it('should return true for matching status code', () => {
        const error = new GrpcError(
          'Not found',
          grpc.Code.NotFound,
          'GetUser'
        );

        expect(error.isCode(grpc.Code.NotFound)).toBe(true);
      });

      it('should return false for non-matching status code', () => {
        const error = new GrpcError(
          'Not found',
          grpc.Code.NotFound,
          'GetUser'
        );

        expect(error.isCode(grpc.Code.OK)).toBe(false);
        expect(error.isCode(grpc.Code.Internal)).toBe(false);
        expect(error.isCode(grpc.Code.Unavailable)).toBe(false);
      });

      it('should handle all status codes correctly', () => {
        const error = new GrpcError(
          'Permission denied',
          grpc.Code.PermissionDenied,
          'UpdateUser'
        );

        expect(error.isCode(grpc.Code.PermissionDenied)).toBe(true);
        expect(error.isCode(grpc.Code.Unauthenticated)).toBe(false);
      });
    });

    describe('toUserMessage()', () => {
      it('should generate user-friendly error message', () => {
        const error = new GrpcError(
          'User not found in database',
          grpc.Code.NotFound,
          'GetUser'
        );

        const userMessage = error.toUserMessage();

        expect(userMessage).toContain('gRPC');
        expect(userMessage).toContain('GetUser');
        expect(userMessage).toContain('User not found in database');
        expect(userMessage).toContain('NotFound');
      });

      it('should include status code name in user message', () => {
        const error = new GrpcError(
          'Server error',
          grpc.Code.Internal,
          'ProcessData'
        );

        const userMessage = error.toUserMessage();

        expect(userMessage).toMatch(/Internal/i);
      });

      it('should format message consistently', () => {
        const error1 = new GrpcError('Error 1', grpc.Code.Unknown, 'Method1');
        const error2 = new GrpcError('Error 2', grpc.Code.Internal, 'Method2');

        const msg1 = error1.toUserMessage();
        const msg2 = error2.toUserMessage();

        // Both should follow same format: "gRPC {method} failed: {message} (code: {code})"
        expect(msg1).toMatch(/^gRPC .+ failed: .+ \(code: .+\)$/);
        expect(msg2).toMatch(/^gRPC .+ failed: .+ \(code: .+\)$/);
      });
    });
  });

  describe('isGrpcError type guard', () => {
    it('should return true for GrpcError instance', () => {
      const error = new GrpcError(
        'Test error',
        grpc.Code.Internal,
        'TestMethod'
      );

      expect(isGrpcError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Regular error');
      expect(isGrpcError(error)).toBe(false);
    });

    it('should return false for SerializationError', () => {
      const error = new SerializationError('Serialization failed');
      expect(isGrpcError(error)).toBe(false);
    });

    it('should return false for ValidationError', () => {
      const error = new ValidationError(
        'Validation failed',
        'userId',
        'required'
      );
      expect(isGrpcError(error)).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isGrpcError(null)).toBe(false);
      expect(isGrpcError(undefined)).toBe(false);
    });

    it('should return false for non-error values', () => {
      expect(isGrpcError({})).toBe(false);
      expect(isGrpcError('error')).toBe(false);
      expect(isGrpcError(123)).toBe(false);
      expect(isGrpcError([])).toBe(false);
      expect(isGrpcError({ message: 'fake error' })).toBe(false);
    });

    it('should enable type narrowing in TypeScript', () => {
      const error: Error = new GrpcError(
        'Test',
        grpc.Code.NotFound,
        'TestMethod'
      );

      if (isGrpcError(error)) {
        // TypeScript should allow accessing GrpcError properties
        expect(error.code).toBe(grpc.Code.NotFound);
        expect(error.methodName).toBe('TestMethod');
        expect(error.isCode(grpc.Code.NotFound)).toBe(true);
      }
    });
  });

  describe('SerializationError', () => {
    describe('constructor', () => {
      it('should create SerializationError with message only', () => {
        const error = new SerializationError('Failed to serialize message');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(SerializationError);
        expect(error.message).toBe('Failed to serialize message');
        expect(error.name).toBe('SerializationError');
        expect(error.field).toBeUndefined();
        expect(error.value).toBeUndefined();
      });

      it('should create SerializationError with field name', () => {
        const error = new SerializationError(
          'Invalid bytes field',
          'avatarImage'
        );

        expect(error.field).toBe('avatarImage');
        expect(error.value).toBeUndefined();
      });

      it('should create SerializationError with field and value', () => {
        const invalidValue = { invalid: 'data' };
        const error = new SerializationError(
          'Cannot serialize object',
          'metadata',
          invalidValue
        );

        expect(error.field).toBe('metadata');
        expect(error.value).toEqual(invalidValue);
      });

      it('should preserve stack trace', () => {
        const error = new SerializationError('Test error');

        expect(error.stack).toBeDefined();
        expect(error.stack).toContain('SerializationError');
      });

      it('should handle various value types', () => {
        const testCases = [
          { value: null, expected: null },
          { value: undefined, expected: undefined },
          { value: 123, expected: 123 },
          { value: 'string', expected: 'string' },
          { value: { obj: 'test' }, expected: { obj: 'test' } },
          { value: [1, 2, 3], expected: [1, 2, 3] },
        ];

        testCases.forEach(({ value, expected }) => {
          const error = new SerializationError('Test', 'field', value);
          expect(error.value).toEqual(expected);
        });
      });
    });
  });

  describe('isSerializationError type guard', () => {
    it('should return true for SerializationError instance', () => {
      const error = new SerializationError('Test error');
      expect(isSerializationError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Regular error');
      expect(isSerializationError(error)).toBe(false);
    });

    it('should return false for GrpcError', () => {
      const error = new GrpcError('Test', grpc.Code.Internal, 'TestMethod');
      expect(isSerializationError(error)).toBe(false);
    });

    it('should return false for ValidationError', () => {
      const error = new ValidationError(
        'Validation failed',
        'field',
        'constraint'
      );
      expect(isSerializationError(error)).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isSerializationError(null)).toBe(false);
      expect(isSerializationError(undefined)).toBe(false);
    });

    it('should return false for non-error values', () => {
      expect(isSerializationError({})).toBe(false);
      expect(isSerializationError('error')).toBe(false);
      expect(isSerializationError(123)).toBe(false);
    });

    it('should enable type narrowing in TypeScript', () => {
      const error: Error = new SerializationError(
        'Test',
        'testField',
        'testValue'
      );

      if (isSerializationError(error)) {
        // TypeScript should allow accessing SerializationError properties
        expect(error.field).toBe('testField');
        expect(error.value).toBe('testValue');
      }
    });
  });

  describe('ValidationError', () => {
    describe('constructor', () => {
      it('should create ValidationError with all properties', () => {
        const error = new ValidationError(
          'User ID is required',
          'userId',
          'required'
        );

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ValidationError);
        expect(error.message).toBe('User ID is required');
        expect(error.field).toBe('userId');
        expect(error.constraint).toBe('required');
        expect(error.name).toBe('ValidationError');
      });

      it('should preserve stack trace', () => {
        const error = new ValidationError(
          'Invalid value',
          'email',
          'format'
        );

        expect(error.stack).toBeDefined();
        expect(error.stack).toContain('ValidationError');
      });

      it('should handle various constraint types', () => {
        const constraints = [
          'required',
          'minLength',
          'maxLength',
          'pattern',
          'min',
          'max',
          'email',
          'url',
          'custom',
        ];

        constraints.forEach(constraint => {
          const error = new ValidationError(
            `Validation failed: ${constraint}`,
            'testField',
            constraint
          );

          expect(error.constraint).toBe(constraint);
        });
      });

      it('should provide clear error messages', () => {
        const testCases = [
          {
            message: 'Email is required',
            field: 'email',
            constraint: 'required',
          },
          {
            message: 'Password must be at least 8 characters',
            field: 'password',
            constraint: 'minLength',
          },
          {
            message: 'Invalid email format',
            field: 'email',
            constraint: 'format',
          },
        ];

        testCases.forEach(({ message, field, constraint }) => {
          const error = new ValidationError(message, field, constraint);

          expect(error.message).toBe(message);
          expect(error.field).toBe(field);
          expect(error.constraint).toBe(constraint);
        });
      });
    });
  });

  describe('isValidationError type guard', () => {
    it('should return true for ValidationError instance', () => {
      const error = new ValidationError('Test', 'field', 'constraint');
      expect(isValidationError(error)).toBe(true);
    });

    it('should return false for regular Error', () => {
      const error = new Error('Regular error');
      expect(isValidationError(error)).toBe(false);
    });

    it('should return false for GrpcError', () => {
      const error = new GrpcError('Test', grpc.Code.Internal, 'TestMethod');
      expect(isValidationError(error)).toBe(false);
    });

    it('should return false for SerializationError', () => {
      const error = new SerializationError('Test');
      expect(isValidationError(error)).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isValidationError(null)).toBe(false);
      expect(isValidationError(undefined)).toBe(false);
    });

    it('should return false for non-error values', () => {
      expect(isValidationError({})).toBe(false);
      expect(isValidationError('error')).toBe(false);
      expect(isValidationError(123)).toBe(false);
    });

    it('should enable type narrowing in TypeScript', () => {
      const error: Error = new ValidationError(
        'Test',
        'testField',
        'testConstraint'
      );

      if (isValidationError(error)) {
        // TypeScript should allow accessing ValidationError properties
        expect(error.field).toBe('testField');
        expect(error.constraint).toBe('testConstraint');
      }
    });
  });

  describe('Error Discrimination', () => {
    it('should distinguish between all error types', () => {
      const grpcErr = new GrpcError('Test', grpc.Code.Internal, 'Method');
      const serializationErr = new SerializationError('Test');
      const validationErr = new ValidationError('Test', 'field', 'constraint');
      const regularErr = new Error('Test');

      // GrpcError
      expect(isGrpcError(grpcErr)).toBe(true);
      expect(isSerializationError(grpcErr)).toBe(false);
      expect(isValidationError(grpcErr)).toBe(false);

      // SerializationError
      expect(isGrpcError(serializationErr)).toBe(false);
      expect(isSerializationError(serializationErr)).toBe(true);
      expect(isValidationError(serializationErr)).toBe(false);

      // ValidationError
      expect(isGrpcError(validationErr)).toBe(false);
      expect(isSerializationError(validationErr)).toBe(false);
      expect(isValidationError(validationErr)).toBe(true);

      // Regular Error
      expect(isGrpcError(regularErr)).toBe(false);
      expect(isSerializationError(regularErr)).toBe(false);
      expect(isValidationError(regularErr)).toBe(false);
    });

    it('should enable proper error handling flow', () => {
      function handleError(error: Error): string {
        if (isGrpcError(error)) {
          return `gRPC Error (${error.code}): ${error.message}`;
        } else if (isSerializationError(error)) {
          return `Serialization Error on field '${error.field || 'unknown'}': ${error.message}`;
        } else if (isValidationError(error)) {
          return `Validation Error on field '${error.field}' (${error.constraint}): ${error.message}`;
        } else {
          return `Unknown Error: ${error.message}`;
        }
      }

      const grpcErr = new GrpcError('Not found', grpc.Code.NotFound, 'GetUser');
      const serErr = new SerializationError('Bad data', 'userId');
      const valErr = new ValidationError('Required', 'email', 'required');
      const regErr = new Error('Generic');

      expect(handleError(grpcErr)).toContain('gRPC Error');
      expect(handleError(serErr)).toContain('Serialization Error');
      expect(handleError(valErr)).toContain('Validation Error');
      expect(handleError(regErr)).toContain('Unknown Error');
    });
  });

  describe('Error Scenarios - Integration', () => {
    it('should handle network timeout error scenario', () => {
      const error = new GrpcError(
        'Request timeout',
        grpc.Code.DeadlineExceeded,
        'SlowMethod'
      );

      expect(error.isCode(grpc.Code.DeadlineExceeded)).toBe(true);
      expect(error.toUserMessage()).toContain('timeout');
    });

    it('should handle authentication error scenario', () => {
      const error = new GrpcError(
        'Missing auth token',
        grpc.Code.Unauthenticated,
        'GetProtectedResource'
      );

      expect(error.isCode(grpc.Code.Unauthenticated)).toBe(true);
    });

    it('should handle resource not found error scenario', () => {
      const error = new GrpcError(
        'User with ID 123 not found',
        grpc.Code.NotFound,
        'GetUser'
      );

      expect(error.isCode(grpc.Code.NotFound)).toBe(true);
      expect(error.message).toContain('123');
    });

    it('should handle serialization failure scenario', () => {
      const error = new SerializationError(
        'Cannot encode Uint8Array to JSON',
        'profileImage',
        new Uint8Array([1, 2, 3])
      );

      expect(error.field).toBe('profileImage');
      expect(error.value).toBeInstanceOf(Uint8Array);
    });

    it('should handle validation failure scenario', () => {
      const error = new ValidationError(
        'Email must match pattern: ^[a-z]+@[a-z]+\\.[a-z]+$',
        'email',
        'pattern'
      );

      expect(error.constraint).toBe('pattern');
      expect(error.message).toContain('pattern');
    });
  });
});
