/**
 * Status Code Mapper
 *
 * Provides utilities for mapping between @grpc/grpc-js status codes
 * and our GrpcStatusCode enum, as well as converting native gRPC errors
 * to GrpcError instances.
 */

import * as grpc from '@grpc/grpc-js';
import { GrpcError, type GrpcErrorDetails } from './GrpcError';
import { GrpcStatusCode } from './StatusCodes';
import { Metadata } from '../types';
import { MetadataConverter } from '../metadata';

/**
 * Map @grpc/grpc-js status code to GrpcStatusCode
 *
 * The numeric values of grpc.status and GrpcStatusCode are identical
 * by design, but this function provides explicit mapping and validation.
 *
 * @param grpcStatus - Native gRPC status code from @grpc/grpc-js
 * @returns Corresponding GrpcStatusCode enum value
 *
 * @example
 * ```typescript
 * const code = mapGrpcStatus(grpc.status.NOT_FOUND);
 * // Returns: GrpcStatusCode.NOT_FOUND (5)
 * ```
 */
export function mapGrpcStatus(grpcStatus: grpc.status): GrpcStatusCode {
  // The numeric values are identical, so we can safely cast
  // This is by design to maintain compatibility with gRPC specification
  return grpcStatus as unknown as GrpcStatusCode;
}

/**
 * Map GrpcStatusCode to @grpc/grpc-js status code
 *
 * Reverse mapping for when we need to use native gRPC status codes.
 *
 * @param statusCode - Our GrpcStatusCode enum value
 * @returns Corresponding grpc.status enum value
 *
 * @example
 * ```typescript
 * const grpcCode = mapToGrpcStatus(GrpcStatusCode.NOT_FOUND);
 * // Returns: grpc.status.NOT_FOUND (5)
 * ```
 */
export function mapToGrpcStatus(statusCode: GrpcStatusCode): grpc.status {
  // The numeric values are identical, so we can safely cast
  return statusCode as unknown as grpc.status;
}

/**
 * Check if a value is a valid grpc.status code
 *
 * @param value - Value to check
 * @returns true if value is a valid grpc.status code
 */
export function isValidGrpcStatus(value: any): value is grpc.status {
  return (
    typeof value === 'number' &&
    value >= grpc.status.OK &&
    value <= grpc.status.UNAUTHENTICATED
  );
}

/**
 * Convert native gRPC ServiceError to GrpcError
 *
 * Extracts all relevant information from a @grpc/grpc-js ServiceError
 * and creates a structured GrpcError instance with:
 * - Mapped status code
 * - Error message and details
 * - Metadata (if present)
 * - Original error reference
 *
 * @param error - Native gRPC ServiceError
 * @param methodName - Name of the method that failed
 * @returns GrpcError instance
 *
 * @example
 * ```typescript
 * try {
 *   // gRPC call...
 * } catch (error) {
 *   const grpcError = convertGrpcError(error, 'GetUser');
 *   console.log(grpcError.code); // GrpcStatusCode.NOT_FOUND
 *   console.log(grpcError.message); // "User not found"
 * }
 * ```
 */
export function convertGrpcError(
  error: grpc.ServiceError,
  methodName: string
): GrpcError {
  // Map status code (default to UNKNOWN if not present)
  const statusCode = mapGrpcStatus(error.code ?? grpc.status.UNKNOWN);

  // Extract error message
  // Priority: error.message > error.details > default message
  const message =
    error.message || error.details || 'Unknown gRPC error occurred';

  // Convert metadata if present
  let metadata: Metadata | undefined;
  if (error.metadata) {
    try {
      metadata = MetadataConverter.fromGrpcMetadata(error.metadata);
    } catch (metadataError) {
      // If metadata conversion fails, continue without it
      // Log error for debugging but don't throw
      console.error(
        '[StatusCodeMapper] Failed to convert metadata:',
        metadataError
      );
    }
  }

  // Create error details with original error reference
  const details: GrpcErrorDetails = {
    originalError: error,
    code: error.code,
    context: {
      details: error.details,
    },
  };

  // Create and return GrpcError
  return new GrpcError(message, statusCode, methodName, metadata, details);
}

/**
 * Convert any error to GrpcError
 *
 * Handles conversion of various error types:
 * - grpc.ServiceError: Full conversion with metadata
 * - GrpcError: Returns as-is
 * - Error: Converts to GrpcError with UNKNOWN status
 * - Other: Converts to GrpcError with UNKNOWN status
 *
 * This is useful for error handling in adapter methods where
 * the error type might vary.
 *
 * @param error - Error of any type
 * @param methodName - Name of the method that failed
 * @returns GrpcError instance
 *
 * @example
 * ```typescript
 * try {
 *   // Some operation...
 * } catch (error) {
 *   // Safely convert any error to GrpcError
 *   const grpcError = toGrpcError(error, 'ProcessData');
 *   throw grpcError;
 * }
 * ```
 */
export function toGrpcError(error: any, methodName: string): GrpcError {
  // Already a GrpcError - return as-is
  if (error instanceof GrpcError) {
    return error;
  }

  // Native gRPC ServiceError - full conversion
  if (isGrpcServiceError(error)) {
    return convertGrpcError(error, methodName);
  }

  // Regular Error - convert to UNKNOWN status
  if (error instanceof Error) {
    const details: GrpcErrorDetails = {
      originalError: error,
      context: {
        errorType: error.constructor.name,
      },
    };

    return new GrpcError(
      error.message || 'Unknown error occurred',
      GrpcStatusCode.UNKNOWN,
      methodName,
      undefined,
      details
    );
  }

  // Unknown error type - convert to string message
  const message =
    typeof error === 'string'
      ? error
      : error?.toString?.() || 'Unknown error occurred';

  const details: GrpcErrorDetails = {
    context: {
      errorType: typeof error,
      errorValue: error,
    },
  };

  return new GrpcError(message, GrpcStatusCode.UNKNOWN, methodName, undefined, details);
}

/**
 * Type guard to check if an error is a grpc.ServiceError
 *
 * @param error - Error to check
 * @returns true if error is a grpc.ServiceError
 *
 * @example
 * ```typescript
 * if (isGrpcServiceError(error)) {
 *   console.log('gRPC error code:', error.code);
 *   console.log('gRPC metadata:', error.metadata);
 * }
 * ```
 */
export function isGrpcServiceError(error: any): error is grpc.ServiceError {
  return !!(
    error &&
    typeof error === 'object' &&
    'code' in error &&
    'details' in error &&
    typeof error.code === 'number' &&
    typeof error.details === 'string'
  );
}

/**
 * Extract error details from gRPC ServiceError
 *
 * Provides a structured object with all available error information.
 * Useful for logging and debugging.
 *
 * @param error - gRPC ServiceError
 * @returns Structured error details
 *
 * @example
 * ```typescript
 * const details = extractErrorDetails(serviceError);
 * console.log('Status:', details.statusName);
 * console.log('Message:', details.message);
 * console.log('Metadata:', details.metadata);
 * ```
 */
export function extractErrorDetails(error: grpc.ServiceError): {
  code: grpc.status;
  statusName: string;
  message: string;
  details: string;
  metadata?: Record<string, string[]>;
} {
  const code = error.code ?? grpc.status.UNKNOWN;
  const statusName = grpc.status[code] || `UNKNOWN(${code})`;

  let metadata: Record<string, string[]> | undefined;
  if (error.metadata) {
    try {
      const converted = MetadataConverter.fromGrpcMetadata(error.metadata);
      metadata = converted.getMap();
    } catch {
      // Ignore metadata conversion errors
    }
  }

  return {
    code,
    statusName,
    message: error.message || 'Unknown error',
    details: error.details || '',
    metadata,
  };
}
