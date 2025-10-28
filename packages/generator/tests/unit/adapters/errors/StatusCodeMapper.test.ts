/**
 * Unit tests for StatusCodeMapper
 */

import * as grpc from '@grpc/grpc-js';
import {
  mapGrpcStatus,
  mapToGrpcStatus,
  isValidGrpcStatus,
  convertGrpcError,
  toGrpcError,
  isGrpcServiceError,
  extractErrorDetails,
} from '../../../../src/adapters/errors/StatusCodeMapper';
import {
  GrpcError,
  GrpcStatusCode,
  isGrpcError,
} from '../../../../src/adapters/errors';
import { MetadataConverter } from '../../../../src/adapters/metadata';

describe('StatusCodeMapper', () => {
  describe('mapGrpcStatus', () => {
    it('should map grpc.status to GrpcStatusCode', () => {
      expect(mapGrpcStatus(grpc.status.OK)).toBe(GrpcStatusCode.OK);
      expect(mapGrpcStatus(grpc.status.CANCELLED)).toBe(
        GrpcStatusCode.CANCELLED
      );
      expect(mapGrpcStatus(grpc.status.UNKNOWN)).toBe(GrpcStatusCode.UNKNOWN);
      expect(mapGrpcStatus(grpc.status.INVALID_ARGUMENT)).toBe(
        GrpcStatusCode.INVALID_ARGUMENT
      );
      expect(mapGrpcStatus(grpc.status.DEADLINE_EXCEEDED)).toBe(
        GrpcStatusCode.DEADLINE_EXCEEDED
      );
      expect(mapGrpcStatus(grpc.status.NOT_FOUND)).toBe(
        GrpcStatusCode.NOT_FOUND
      );
      expect(mapGrpcStatus(grpc.status.ALREADY_EXISTS)).toBe(
        GrpcStatusCode.ALREADY_EXISTS
      );
      expect(mapGrpcStatus(grpc.status.PERMISSION_DENIED)).toBe(
        GrpcStatusCode.PERMISSION_DENIED
      );
      expect(mapGrpcStatus(grpc.status.RESOURCE_EXHAUSTED)).toBe(
        GrpcStatusCode.RESOURCE_EXHAUSTED
      );
      expect(mapGrpcStatus(grpc.status.FAILED_PRECONDITION)).toBe(
        GrpcStatusCode.FAILED_PRECONDITION
      );
      expect(mapGrpcStatus(grpc.status.ABORTED)).toBe(GrpcStatusCode.ABORTED);
      expect(mapGrpcStatus(grpc.status.OUT_OF_RANGE)).toBe(
        GrpcStatusCode.OUT_OF_RANGE
      );
      expect(mapGrpcStatus(grpc.status.UNIMPLEMENTED)).toBe(
        GrpcStatusCode.UNIMPLEMENTED
      );
      expect(mapGrpcStatus(grpc.status.INTERNAL)).toBe(
        GrpcStatusCode.INTERNAL
      );
      expect(mapGrpcStatus(grpc.status.UNAVAILABLE)).toBe(
        GrpcStatusCode.UNAVAILABLE
      );
      expect(mapGrpcStatus(grpc.status.DATA_LOSS)).toBe(
        GrpcStatusCode.DATA_LOSS
      );
      expect(mapGrpcStatus(grpc.status.UNAUTHENTICATED)).toBe(
        GrpcStatusCode.UNAUTHENTICATED
      );
    });

    it('should preserve numeric values', () => {
      expect(mapGrpcStatus(grpc.status.NOT_FOUND)).toBe(5);
      expect(mapGrpcStatus(grpc.status.INTERNAL)).toBe(13);
      expect(mapGrpcStatus(grpc.status.UNAVAILABLE)).toBe(14);
    });
  });

  describe('mapToGrpcStatus', () => {
    it('should map GrpcStatusCode to grpc.status', () => {
      expect(mapToGrpcStatus(GrpcStatusCode.OK)).toBe(grpc.status.OK);
      expect(mapToGrpcStatus(GrpcStatusCode.NOT_FOUND)).toBe(
        grpc.status.NOT_FOUND
      );
      expect(mapToGrpcStatus(GrpcStatusCode.INTERNAL)).toBe(
        grpc.status.INTERNAL
      );
      expect(mapToGrpcStatus(GrpcStatusCode.UNAVAILABLE)).toBe(
        grpc.status.UNAVAILABLE
      );
    });

    it('should be inverse of mapGrpcStatus', () => {
      const grpcCode = grpc.status.NOT_FOUND;
      const mapped = mapGrpcStatus(grpcCode);
      const inverseMapped = mapToGrpcStatus(mapped);
      expect(inverseMapped).toBe(grpcCode);
    });
  });

  describe('isValidGrpcStatus', () => {
    it('should return true for valid grpc.status codes', () => {
      expect(isValidGrpcStatus(grpc.status.OK)).toBe(true);
      expect(isValidGrpcStatus(grpc.status.NOT_FOUND)).toBe(true);
      expect(isValidGrpcStatus(grpc.status.INTERNAL)).toBe(true);
      expect(isValidGrpcStatus(grpc.status.UNAUTHENTICATED)).toBe(true);
    });

    it('should return true for numeric values in valid range', () => {
      expect(isValidGrpcStatus(0)).toBe(true); // OK
      expect(isValidGrpcStatus(5)).toBe(true); // NOT_FOUND
      expect(isValidGrpcStatus(13)).toBe(true); // INTERNAL
      expect(isValidGrpcStatus(16)).toBe(true); // UNAUTHENTICATED
    });

    it('should return false for invalid status codes', () => {
      expect(isValidGrpcStatus(-1)).toBe(false);
      expect(isValidGrpcStatus(17)).toBe(false);
      expect(isValidGrpcStatus(999)).toBe(false);
    });

    it('should return false for non-numeric values', () => {
      expect(isValidGrpcStatus('NOT_FOUND')).toBe(false);
      expect(isValidGrpcStatus(null)).toBe(false);
      expect(isValidGrpcStatus(undefined)).toBe(false);
      expect(isValidGrpcStatus({})).toBe(false);
    });
  });

  describe('isGrpcServiceError', () => {
    it('should return true for grpc.ServiceError-like objects', () => {
      const error: grpc.ServiceError = {
        name: 'Error',
        message: 'Not found',
        code: grpc.status.NOT_FOUND,
        details: 'User not found',
        metadata: new grpc.Metadata(),
      };

      expect(isGrpcServiceError(error)).toBe(true);
    });

    it('should return true for minimal ServiceError', () => {
      const error = {
        code: grpc.status.INTERNAL,
        details: 'Internal error',
        message: 'Internal error',
      };

      expect(isGrpcServiceError(error)).toBe(true);
    });

    it('should return false for regular errors', () => {
      const error = new Error('Regular error');
      expect(isGrpcServiceError(error)).toBe(false);
    });

    it('should return false for objects missing required fields', () => {
      expect(isGrpcServiceError({ code: 5 })).toBe(false);
      expect(isGrpcServiceError({ details: 'Error' })).toBe(false);
      expect(isGrpcServiceError({ code: 5, message: 'Error' })).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isGrpcServiceError(null)).toBe(false);
      expect(isGrpcServiceError(undefined)).toBe(false);
    });
  });

  describe('convertGrpcError', () => {
    it('should convert grpc.ServiceError to GrpcError', () => {
      const serviceError: grpc.ServiceError = {
        name: 'Error',
        message: 'User not found',
        code: grpc.status.NOT_FOUND,
        details: 'User with id 123 not found',
        metadata: new grpc.Metadata(),
      };

      const grpcError = convertGrpcError(serviceError, 'GetUser');

      expect(isGrpcError(grpcError)).toBe(true);
      expect(grpcError.message).toBe('User not found');
      expect(grpcError.code).toBe(GrpcStatusCode.NOT_FOUND);
      expect(grpcError.methodName).toBe('GetUser');
    });

    it('should use default message if message is missing', () => {
      const serviceError: grpc.ServiceError = {
        name: 'Error',
        message: '',
        code: grpc.status.INTERNAL,
        details: 'Internal server error',
        metadata: new grpc.Metadata(),
      };

      const grpcError = convertGrpcError(serviceError, 'ProcessData');

      expect(grpcError.message).toBe('Internal server error');
    });

    it('should use fallback message if both message and details are missing', () => {
      const serviceError: grpc.ServiceError = {
        name: 'Error',
        message: '',
        code: grpc.status.UNKNOWN,
        details: '',
        metadata: new grpc.Metadata(),
      };

      const grpcError = convertGrpcError(serviceError, 'UnknownMethod');

      expect(grpcError.message).toBe('Unknown gRPC error occurred');
    });

    it('should default to UNKNOWN status if code is missing', () => {
      const serviceError: Partial<grpc.ServiceError> = {
        name: 'Error',
        message: 'Error message',
        details: 'Details',
      };

      const grpcError = convertGrpcError(
        serviceError as grpc.ServiceError,
        'TestMethod'
      );

      expect(grpcError.code).toBe(GrpcStatusCode.UNKNOWN);
    });

    it('should include metadata if present', () => {
      const metadata = new grpc.Metadata();
      metadata.set('request-id', '123');
      metadata.set('retry-after', '60');

      const serviceError: grpc.ServiceError = {
        name: 'Error',
        message: 'Service unavailable',
        code: grpc.status.UNAVAILABLE,
        details: 'Service temporarily down',
        metadata,
      };

      const grpcError = convertGrpcError(serviceError, 'GetData');

      expect(grpcError.metadata).toBeDefined();
      const metadataMap = grpcError.metadata?.getMap();
      expect(metadataMap?.['request-id']).toEqual(['123']);
      expect(metadataMap?.['retry-after']).toEqual(['60']);
    });

    it('should include original error in details', () => {
      const serviceError: grpc.ServiceError = {
        name: 'Error',
        message: 'Connection failed',
        code: grpc.status.UNAVAILABLE,
        details: 'Network error',
        metadata: new grpc.Metadata(),
      };

      const grpcError = convertGrpcError(serviceError, 'Connect');

      expect(grpcError.details?.originalError).toBe(serviceError);
      expect(grpcError.details?.code).toBe(grpc.status.UNAVAILABLE);
    });

    it('should handle metadata conversion errors gracefully', () => {
      const metadata = new grpc.Metadata();

      // Mock console.error to suppress error logs during test
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Mock a metadata that will fail conversion
      const fromGrpcMetadataSpy = jest
        .spyOn(MetadataConverter, 'fromGrpcMetadata')
        .mockImplementation(() => {
          throw new Error('Conversion failed');
        });

      const serviceError: grpc.ServiceError = {
        name: 'Error',
        message: 'Test error',
        code: grpc.status.INTERNAL,
        details: 'Test',
        metadata,
      };

      // Should not throw, just continue without metadata
      expect(() =>
        convertGrpcError(serviceError, 'TestMethod')
      ).not.toThrow();

      const grpcError = convertGrpcError(serviceError, 'TestMethod');
      expect(grpcError.metadata).toBeUndefined();

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalled();

      jest.restoreAllMocks();
    });
  });

  describe('toGrpcError', () => {
    it('should return GrpcError as-is', () => {
      const originalError = new GrpcError(
        'Test error',
        GrpcStatusCode.INTERNAL,
        'TestMethod'
      );

      const result = toGrpcError(originalError, 'AnotherMethod');

      expect(result).toBe(originalError); // Same instance
      expect(result.methodName).toBe('TestMethod'); // Original method name
    });

    it('should convert grpc.ServiceError to GrpcError', () => {
      const serviceError: grpc.ServiceError = {
        name: 'Error',
        message: 'Not found',
        code: grpc.status.NOT_FOUND,
        details: 'Resource not found',
        metadata: new grpc.Metadata(),
      };

      const result = toGrpcError(serviceError, 'GetResource');

      expect(isGrpcError(result)).toBe(true);
      expect(result.code).toBe(GrpcStatusCode.NOT_FOUND);
      expect(result.methodName).toBe('GetResource');
    });

    it('should convert regular Error to GrpcError with UNKNOWN status', () => {
      const error = new Error('Regular error message');

      const result = toGrpcError(error, 'SomeMethod');

      expect(isGrpcError(result)).toBe(true);
      expect(result.code).toBe(GrpcStatusCode.UNKNOWN);
      expect(result.message).toBe('Regular error message');
      expect(result.methodName).toBe('SomeMethod');
      expect(result.details?.originalError).toBe(error);
    });

    it('should convert string to GrpcError', () => {
      const result = toGrpcError('String error message', 'StringMethod');

      expect(isGrpcError(result)).toBe(true);
      expect(result.code).toBe(GrpcStatusCode.UNKNOWN);
      expect(result.message).toBe('String error message');
      expect(result.methodName).toBe('StringMethod');
    });

    it('should convert arbitrary objects to GrpcError', () => {
      const errorObj = { custom: 'error', value: 123 };

      const result = toGrpcError(errorObj, 'ObjectMethod');

      expect(isGrpcError(result)).toBe(true);
      expect(result.code).toBe(GrpcStatusCode.UNKNOWN);
      expect(result.methodName).toBe('ObjectMethod');
      expect(result.details?.context?.errorValue).toBe(errorObj);
    });

    it('should handle null and undefined', () => {
      const nullResult = toGrpcError(null, 'NullMethod');
      expect(isGrpcError(nullResult)).toBe(true);
      expect(nullResult.code).toBe(GrpcStatusCode.UNKNOWN);

      const undefinedResult = toGrpcError(undefined, 'UndefinedMethod');
      expect(isGrpcError(undefinedResult)).toBe(true);
      expect(undefinedResult.code).toBe(GrpcStatusCode.UNKNOWN);
    });
  });

  describe('extractErrorDetails', () => {
    it('should extract all error details from ServiceError', () => {
      const metadata = new grpc.Metadata();
      metadata.set('request-id', '123');

      const serviceError: grpc.ServiceError = {
        name: 'Error',
        message: 'User not found',
        code: grpc.status.NOT_FOUND,
        details: 'User with id 123 not found',
        metadata,
      };

      const details = extractErrorDetails(serviceError);

      expect(details.code).toBe(grpc.status.NOT_FOUND);
      expect(details.statusName).toBe('NOT_FOUND');
      expect(details.message).toBe('User not found');
      expect(details.details).toBe('User with id 123 not found');
      expect(details.metadata).toBeDefined();
      expect(details.metadata?.['request-id']).toEqual(['123']);
    });

    it('should handle missing optional fields', () => {
      const serviceError: Partial<grpc.ServiceError> = {
        name: 'Error',
        code: grpc.status.INTERNAL,
        details: '',
      };

      const details = extractErrorDetails(serviceError as grpc.ServiceError);

      expect(details.code).toBe(grpc.status.INTERNAL);
      expect(details.statusName).toBe('INTERNAL');
      expect(details.message).toBe('Unknown error');
      expect(details.details).toBe('');
      expect(details.metadata).toBeUndefined();
    });

    it('should handle metadata conversion errors', () => {
      const metadata = new grpc.Metadata();
      jest
        .spyOn(MetadataConverter, 'fromGrpcMetadata')
        .mockImplementationOnce(() => {
          throw new Error('Conversion failed');
        });

      const serviceError: grpc.ServiceError = {
        name: 'Error',
        message: 'Test error',
        code: grpc.status.INTERNAL,
        details: 'Test',
        metadata,
      };

      const details = extractErrorDetails(serviceError);

      expect(details.metadata).toBeUndefined();

      jest.restoreAllMocks();
    });

    it('should handle unknown status codes', () => {
      const serviceError: grpc.ServiceError = {
        name: 'Error',
        message: 'Unknown error',
        code: 999 as grpc.status,
        details: 'Unknown',
        metadata: new grpc.Metadata(),
      };

      const details = extractErrorDetails(serviceError);

      expect(details.code).toBe(999);
      expect(details.statusName).toBe('UNKNOWN(999)');
    });
  });
});
