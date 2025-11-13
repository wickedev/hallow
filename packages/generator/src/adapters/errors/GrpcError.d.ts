/**
 * gRPC Error Classes
 *
 * Provides structured error handling for gRPC operations with detailed
 * status codes, metadata, and debugging information.
 */
import { Metadata } from '../types';
import { GrpcStatusCode } from './StatusCodes';
/**
 * Additional details that can be attached to gRPC errors
 */
export interface GrpcErrorDetails {
    /**
     * Original error from the underlying transport (if any)
     */
    originalError?: Error;
    /**
     * Raw status code from the transport layer
     */
    code?: number;
    /**
     * Additional context or debugging information
     */
    context?: Record<string, any>;
    /**
     * Stack trace from where the error originated
     */
    stack?: string;
}
/**
 * gRPC error class with status code and metadata
 *
 * Thrown by transport adapters when RPC calls fail.
 * Provides structured error information for proper error handling.
 *
 * @example
 * ```typescript
 * try {
 *   const response = await stub.getUser({ id: '123' });
 * } catch (error) {
 *   if (isGrpcError(error)) {
 *     if (error.is(GrpcStatusCode.NOT_FOUND)) {
 *       console.log('User not found');
 *     } else if (error.isRetryable()) {
 *       // Retry the operation
 *       console.log('Retrying...');
 *     } else {
 *       console.error('Error:', error.toUserMessage());
 *     }
 *   }
 * }
 * ```
 */
export declare class GrpcError extends Error {
    readonly code: GrpcStatusCode;
    readonly methodName: string;
    readonly metadata?: Metadata | undefined;
    readonly details?: GrpcErrorDetails | undefined;
    /**
     * Create a new gRPC error
     *
     * @param message - Human-readable error message
     * @param code - gRPC status code
     * @param methodName - Name of the method that failed
     * @param metadata - Optional error metadata (trailers)
     * @param details - Optional additional error details
     *
     * @example
     * ```typescript
     * throw new GrpcError(
     *   'User not found',
     *   GrpcStatusCode.NOT_FOUND,
     *   'GetUser',
     *   metadata,
     *   { userId: '123' }
     * );
     * ```
     */
    constructor(message: string, code: GrpcStatusCode, methodName: string, metadata?: Metadata | undefined, details?: GrpcErrorDetails | undefined);
    /**
     * Check if error has a specific status code
     *
     * @param code - Status code to check
     * @returns true if error has the specified code
     *
     * @example
     * ```typescript
     * if (error.is(GrpcStatusCode.NOT_FOUND)) {
     *   console.log('Resource not found');
     * }
     * ```
     */
    is(code: GrpcStatusCode): boolean;
    /**
     * Check if error is in a list of status codes
     *
     * @param codes - Array of status codes to check against
     * @returns true if error matches any of the codes
     *
     * @example
     * ```typescript
     * if (error.isAnyOf([GrpcStatusCode.NOT_FOUND, GrpcStatusCode.ALREADY_EXISTS])) {
     *   // Handle resource conflicts
     * }
     * ```
     */
    isAnyOf(codes: GrpcStatusCode[]): boolean;
    /**
     * Get human-readable name of the status code
     *
     * @returns Status code name (e.g., "NOT_FOUND")
     *
     * @example
     * ```typescript
     * console.log(error.getStatusName()); // "NOT_FOUND"
     * ```
     */
    getStatusName(): string;
    /**
     * Get detailed description of the status code
     *
     * @returns Human-readable description explaining what the status code means
     *
     * @example
     * ```typescript
     * console.log(error.getDescription());
     * // "Some requested entity (e.g., file or directory) was not found..."
     * ```
     */
    getDescription(): string;
    /**
     * Check if this error is retryable
     *
     * Retryable errors are transient failures that may succeed if retried
     * with exponential backoff (UNAVAILABLE, DEADLINE_EXCEEDED, etc.)
     *
     * @returns true if the error is retryable
     *
     * @example
     * ```typescript
     * if (error.isRetryable()) {
     *   // Implement retry logic with exponential backoff
     *   await retryWithBackoff(() => stub.getUser({ id: '123' }));
     * }
     * ```
     */
    isRetryable(): boolean;
    /**
     * Check if this is a client error (4xx-like errors)
     *
     * Client errors indicate problems with the request that should be fixed
     * by the caller (INVALID_ARGUMENT, NOT_FOUND, PERMISSION_DENIED, etc.)
     *
     * @returns true if the error is a client error
     *
     * @example
     * ```typescript
     * if (error.isClientError()) {
     *   console.log('Fix the request and try again');
     * }
     * ```
     */
    isClientError(): boolean;
    /**
     * Check if this is a server error (5xx-like errors)
     *
     * Server errors indicate problems with the service that the client
     * cannot fix (INTERNAL, UNIMPLEMENTED, DATA_LOSS, etc.)
     *
     * @returns true if the error is a server error
     *
     * @example
     * ```typescript
     * if (error.isServerError()) {
     *   console.log('Server error - contact support');
     * }
     * ```
     */
    isServerError(): boolean;
    /**
     * Get a user-friendly error message
     *
     * Formats the error for display to end users.
     *
     * @returns Formatted error message suitable for user display
     *
     * @example
     * ```typescript
     * console.error(error.toUserMessage());
     * // "gRPC GetUser failed: User not found (NOT_FOUND)"
     * ```
     */
    toUserMessage(): string;
    /**
     * Get a detailed error message for debugging
     *
     * Includes status code, description, metadata, and additional details.
     *
     * @returns Detailed error message for logging and debugging
     *
     * @example
     * ```typescript
     * console.error(error.toDebugMessage());
     * // Detailed output with all error information
     * ```
     */
    toDebugMessage(): string;
    /**
     * Convert error to JSON for serialization
     *
     * Useful for logging, error reporting, or sending errors over the wire.
     *
     * @returns Plain object representation of the error
     *
     * @example
     * ```typescript
     * console.log(JSON.stringify(error.toJSON(), null, 2));
     * ```
     */
    toJSON(): Record<string, any>;
    /**
     * String representation for logging
     *
     * @returns Concise string representation of the error
     */
    toString(): string;
}
/**
 * Type guard to check if an error is a GrpcError
 *
 * @param error - Error to check
 * @returns true if error is a GrpcError instance
 *
 * @example
 * ```typescript
 * try {
 *   await stub.getUser({ id: '123' });
 * } catch (error) {
 *   if (isGrpcError(error)) {
 *     console.log(error.getStatusName());
 *   }
 * }
 * ```
 */
export declare function isGrpcError(error: any): error is GrpcError;
//# sourceMappingURL=GrpcError.d.ts.map