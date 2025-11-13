/**
 * Status Code Mapper
 *
 * Provides utilities for mapping between @grpc/grpc-js status codes
 * and our GrpcStatusCode enum, as well as converting native gRPC errors
 * to GrpcError instances.
 */
import * as grpc from '@grpc/grpc-js';
import { GrpcError } from './GrpcError';
import { GrpcStatusCode } from './StatusCodes';
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
export declare function mapGrpcStatus(grpcStatus: grpc.status): GrpcStatusCode;
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
export declare function mapToGrpcStatus(statusCode: GrpcStatusCode): grpc.status;
/**
 * Check if a value is a valid grpc.status code
 *
 * @param value - Value to check
 * @returns true if value is a valid grpc.status code
 */
export declare function isValidGrpcStatus(value: any): value is grpc.status;
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
export declare function convertGrpcError(error: grpc.ServiceError, methodName: string): GrpcError;
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
export declare function toGrpcError(error: any, methodName: string): GrpcError;
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
export declare function isGrpcServiceError(error: any): error is grpc.ServiceError;
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
export declare function extractErrorDetails(error: grpc.ServiceError): {
    code: grpc.status;
    statusName: string;
    message: string;
    details: string;
    metadata?: Record<string, string[]>;
};
//# sourceMappingURL=StatusCodeMapper.d.ts.map