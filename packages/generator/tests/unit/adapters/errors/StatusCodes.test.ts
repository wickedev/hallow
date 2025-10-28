/**
 * Unit tests for StatusCodes module
 */

import {
  GrpcStatusCode,
  STATUS_CODE_DESCRIPTIONS,
  getStatusName,
  getStatusDescription,
  isRetryableStatusCode,
  isClientError,
  isServerError,
} from '../../../../src/adapters/errors/StatusCodes';

describe('StatusCodes', () => {
  describe('GrpcStatusCode enum', () => {
    it('should have correct numeric values matching gRPC spec', () => {
      expect(GrpcStatusCode.OK).toBe(0);
      expect(GrpcStatusCode.CANCELLED).toBe(1);
      expect(GrpcStatusCode.UNKNOWN).toBe(2);
      expect(GrpcStatusCode.INVALID_ARGUMENT).toBe(3);
      expect(GrpcStatusCode.DEADLINE_EXCEEDED).toBe(4);
      expect(GrpcStatusCode.NOT_FOUND).toBe(5);
      expect(GrpcStatusCode.ALREADY_EXISTS).toBe(6);
      expect(GrpcStatusCode.PERMISSION_DENIED).toBe(7);
      expect(GrpcStatusCode.RESOURCE_EXHAUSTED).toBe(8);
      expect(GrpcStatusCode.FAILED_PRECONDITION).toBe(9);
      expect(GrpcStatusCode.ABORTED).toBe(10);
      expect(GrpcStatusCode.OUT_OF_RANGE).toBe(11);
      expect(GrpcStatusCode.UNIMPLEMENTED).toBe(12);
      expect(GrpcStatusCode.INTERNAL).toBe(13);
      expect(GrpcStatusCode.UNAVAILABLE).toBe(14);
      expect(GrpcStatusCode.DATA_LOSS).toBe(15);
      expect(GrpcStatusCode.UNAUTHENTICATED).toBe(16);
    });

    it('should have all status codes in description mapping', () => {
      Object.values(GrpcStatusCode)
        .filter((value) => typeof value === 'number')
        .forEach((code) => {
          const codeValue = code as GrpcStatusCode;
          expect(STATUS_CODE_DESCRIPTIONS[codeValue]).toBeDefined();
          expect(STATUS_CODE_DESCRIPTIONS[codeValue]).toBeTruthy();
          expect(typeof STATUS_CODE_DESCRIPTIONS[codeValue]).toBe('string');
        });
    });
  });

  describe('getStatusName', () => {
    it('should return correct status name for valid codes', () => {
      expect(getStatusName(GrpcStatusCode.OK)).toBe('OK');
      expect(getStatusName(GrpcStatusCode.NOT_FOUND)).toBe('NOT_FOUND');
      expect(getStatusName(GrpcStatusCode.INTERNAL)).toBe('INTERNAL');
      expect(getStatusName(GrpcStatusCode.UNAUTHENTICATED)).toBe(
        'UNAUTHENTICATED'
      );
    });

    it('should handle unknown status codes', () => {
      const unknownCode = 999 as GrpcStatusCode;
      expect(getStatusName(unknownCode)).toBe('UNKNOWN(999)');
    });

    it('should work with numeric values', () => {
      expect(getStatusName(0 as GrpcStatusCode)).toBe('OK');
      expect(getStatusName(5 as GrpcStatusCode)).toBe('NOT_FOUND');
      expect(getStatusName(13 as GrpcStatusCode)).toBe('INTERNAL');
    });
  });

  describe('getStatusDescription', () => {
    it('should return correct description for valid codes', () => {
      const okDesc = getStatusDescription(GrpcStatusCode.OK);
      expect(okDesc).toContain('successfully');

      const notFoundDesc = getStatusDescription(GrpcStatusCode.NOT_FOUND);
      expect(notFoundDesc).toContain('not found');

      const internalDesc = getStatusDescription(GrpcStatusCode.INTERNAL);
      expect(internalDesc).toContain('Internal');
    });

    it('should handle unknown status codes', () => {
      const unknownCode = 999 as GrpcStatusCode;
      const description = getStatusDescription(unknownCode);
      expect(description).toContain('Unknown status code');
    });

    it('should provide meaningful descriptions for all codes', () => {
      Object.values(GrpcStatusCode)
        .filter((value) => typeof value === 'number')
        .forEach((code) => {
          const description = getStatusDescription(code as GrpcStatusCode);
          expect(description).toBeTruthy();
          expect(description.length).toBeGreaterThan(10);
        });
    });
  });

  describe('isRetryableStatusCode', () => {
    it('should identify retryable status codes', () => {
      expect(isRetryableStatusCode(GrpcStatusCode.UNAVAILABLE)).toBe(true);
      expect(isRetryableStatusCode(GrpcStatusCode.DEADLINE_EXCEEDED)).toBe(
        true
      );
      expect(isRetryableStatusCode(GrpcStatusCode.RESOURCE_EXHAUSTED)).toBe(
        true
      );
      expect(isRetryableStatusCode(GrpcStatusCode.ABORTED)).toBe(true);
    });

    it('should identify non-retryable status codes', () => {
      expect(isRetryableStatusCode(GrpcStatusCode.OK)).toBe(false);
      expect(isRetryableStatusCode(GrpcStatusCode.INVALID_ARGUMENT)).toBe(
        false
      );
      expect(isRetryableStatusCode(GrpcStatusCode.NOT_FOUND)).toBe(false);
      expect(isRetryableStatusCode(GrpcStatusCode.PERMISSION_DENIED)).toBe(
        false
      );
      expect(isRetryableStatusCode(GrpcStatusCode.INTERNAL)).toBe(false);
      expect(isRetryableStatusCode(GrpcStatusCode.UNIMPLEMENTED)).toBe(false);
      expect(isRetryableStatusCode(GrpcStatusCode.DATA_LOSS)).toBe(false);
    });
  });

  describe('isClientError', () => {
    it('should identify client errors', () => {
      expect(isClientError(GrpcStatusCode.INVALID_ARGUMENT)).toBe(true);
      expect(isClientError(GrpcStatusCode.NOT_FOUND)).toBe(true);
      expect(isClientError(GrpcStatusCode.ALREADY_EXISTS)).toBe(true);
      expect(isClientError(GrpcStatusCode.PERMISSION_DENIED)).toBe(true);
      expect(isClientError(GrpcStatusCode.FAILED_PRECONDITION)).toBe(true);
      expect(isClientError(GrpcStatusCode.OUT_OF_RANGE)).toBe(true);
      expect(isClientError(GrpcStatusCode.UNAUTHENTICATED)).toBe(true);
    });

    it('should not identify server errors as client errors', () => {
      expect(isClientError(GrpcStatusCode.INTERNAL)).toBe(false);
      expect(isClientError(GrpcStatusCode.UNAVAILABLE)).toBe(false);
      expect(isClientError(GrpcStatusCode.UNIMPLEMENTED)).toBe(false);
      expect(isClientError(GrpcStatusCode.DATA_LOSS)).toBe(false);
    });

    it('should not identify other errors as client errors', () => {
      expect(isClientError(GrpcStatusCode.OK)).toBe(false);
      expect(isClientError(GrpcStatusCode.CANCELLED)).toBe(false);
      expect(isClientError(GrpcStatusCode.UNKNOWN)).toBe(false);
      expect(isClientError(GrpcStatusCode.DEADLINE_EXCEEDED)).toBe(false);
    });
  });

  describe('isServerError', () => {
    it('should identify server errors', () => {
      expect(isServerError(GrpcStatusCode.UNIMPLEMENTED)).toBe(true);
      expect(isServerError(GrpcStatusCode.INTERNAL)).toBe(true);
      expect(isServerError(GrpcStatusCode.UNAVAILABLE)).toBe(true);
      expect(isServerError(GrpcStatusCode.DATA_LOSS)).toBe(true);
    });

    it('should not identify client errors as server errors', () => {
      expect(isServerError(GrpcStatusCode.INVALID_ARGUMENT)).toBe(false);
      expect(isServerError(GrpcStatusCode.NOT_FOUND)).toBe(false);
      expect(isServerError(GrpcStatusCode.PERMISSION_DENIED)).toBe(false);
      expect(isServerError(GrpcStatusCode.UNAUTHENTICATED)).toBe(false);
    });

    it('should not identify other errors as server errors', () => {
      expect(isServerError(GrpcStatusCode.OK)).toBe(false);
      expect(isServerError(GrpcStatusCode.CANCELLED)).toBe(false);
      expect(isServerError(GrpcStatusCode.DEADLINE_EXCEEDED)).toBe(false);
      expect(isServerError(GrpcStatusCode.ABORTED)).toBe(false);
    });
  });

  describe('error classification consistency', () => {
    it('should not have overlapping client and server errors', () => {
      Object.values(GrpcStatusCode)
        .filter((value) => typeof value === 'number')
        .forEach((code) => {
          const codeValue = code as GrpcStatusCode;
          const isClient = isClientError(codeValue);
          const isServer = isServerError(codeValue);

          // A code should not be both client and server error
          expect(isClient && isServer).toBe(false);
        });
    });

    it('should classify all non-OK codes as either client, server, or special', () => {
      const specialCodes = [
        GrpcStatusCode.OK,
        GrpcStatusCode.CANCELLED,
        GrpcStatusCode.UNKNOWN,
        GrpcStatusCode.DEADLINE_EXCEEDED,
        GrpcStatusCode.RESOURCE_EXHAUSTED,
        GrpcStatusCode.ABORTED,
      ];

      Object.values(GrpcStatusCode)
        .filter((value) => typeof value === 'number')
        .forEach((code) => {
          const codeValue = code as GrpcStatusCode;
          const isClient = isClientError(codeValue);
          const isServer = isServerError(codeValue);
          const isSpecial = specialCodes.includes(codeValue);

          // Every code should be client, server, or special
          expect(isClient || isServer || isSpecial).toBe(true);
        });
    });
  });
});
