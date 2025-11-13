/**
 * gRPC Status Codes
 *
 * Standard gRPC status codes as defined in the gRPC specification.
 * See: https://grpc.github.io/grpc/core/md_doc_statuscodes.html
 *
 * These status codes are used across all transport adapters for consistent
 * error handling and reporting.
 */
/**
 * gRPC status code enum
 *
 * Numeric values match the official gRPC specification and @grpc/grpc-js
 * status codes for seamless interoperability.
 */
export declare enum GrpcStatusCode {
    /** The operation completed successfully */
    OK = 0,
    /** The operation was cancelled (typically by the caller) */
    CANCELLED = 1,
    /** Unknown error */
    UNKNOWN = 2,
    /** Client specified an invalid argument */
    INVALID_ARGUMENT = 3,
    /** Deadline expired before operation could complete */
    DEADLINE_EXCEEDED = 4,
    /** Some requested entity was not found */
    NOT_FOUND = 5,
    /** Some entity that we attempted to create already exists */
    ALREADY_EXISTS = 6,
    /** The caller does not have permission to execute the operation */
    PERMISSION_DENIED = 7,
    /** Some resource has been exhausted */
    RESOURCE_EXHAUSTED = 8,
    /** Operation was rejected because the system is not in required state */
    FAILED_PRECONDITION = 9,
    /** The operation was aborted */
    ABORTED = 10,
    /** Operation was attempted past the valid range */
    OUT_OF_RANGE = 11,
    /** Operation is not implemented or not supported */
    UNIMPLEMENTED = 12,
    /** Internal error */
    INTERNAL = 13,
    /** The service is currently unavailable */
    UNAVAILABLE = 14,
    /** Unrecoverable data loss or corruption */
    DATA_LOSS = 15,
    /** The request does not have valid authentication credentials */
    UNAUTHENTICATED = 16
}
/**
 * Human-readable descriptions for each status code
 *
 * Provides detailed explanations of what each status code means,
 * useful for debugging and error messages.
 */
export declare const STATUS_CODE_DESCRIPTIONS: Record<GrpcStatusCode, string>;
/**
 * Get the human-readable name of a status code
 *
 * @param code - Status code to get name for
 * @returns Status code name (e.g., "NOT_FOUND")
 *
 * @example
 * ```typescript
 * getStatusName(GrpcStatusCode.NOT_FOUND) // Returns: "NOT_FOUND"
 * getStatusName(5) // Returns: "NOT_FOUND"
 * getStatusName(999) // Returns: "UNKNOWN(999)"
 * ```
 */
export declare function getStatusName(code: GrpcStatusCode): string;
/**
 * Get the human-readable description of a status code
 *
 * @param code - Status code to get description for
 * @returns Detailed description of the status code
 *
 * @example
 * ```typescript
 * getStatusDescription(GrpcStatusCode.NOT_FOUND)
 * // Returns: "Some requested entity (e.g., file or directory) was not found..."
 * ```
 */
export declare function getStatusDescription(code: GrpcStatusCode): string;
/**
 * Check if a status code indicates a retryable error
 *
 * Retryable errors are transient failures that may succeed if retried:
 * - UNAVAILABLE: Service temporarily unavailable
 * - DEADLINE_EXCEEDED: Operation timed out
 * - RESOURCE_EXHAUSTED: Temporary resource limitation
 * - ABORTED: Concurrency conflict (may succeed on retry)
 *
 * @param code - Status code to check
 * @returns true if the error is retryable
 *
 * @example
 * ```typescript
 * isRetryable(GrpcStatusCode.UNAVAILABLE) // true
 * isRetryable(GrpcStatusCode.NOT_FOUND) // false
 * ```
 */
export declare function isRetryableStatusCode(code: GrpcStatusCode): boolean;
/**
 * Check if a status code indicates a client error
 *
 * Client errors are caused by invalid requests or missing permissions:
 * - INVALID_ARGUMENT: Bad request parameters
 * - NOT_FOUND: Resource doesn't exist
 * - ALREADY_EXISTS: Resource already exists
 * - PERMISSION_DENIED: Insufficient permissions
 * - FAILED_PRECONDITION: Preconditions not met
 * - OUT_OF_RANGE: Value out of valid range
 * - UNAUTHENTICATED: Missing authentication
 *
 * @param code - Status code to check
 * @returns true if the error is a client error
 */
export declare function isClientError(code: GrpcStatusCode): boolean;
/**
 * Check if a status code indicates a server error
 *
 * Server errors are caused by problems in the service:
 * - UNIMPLEMENTED: Feature not implemented
 * - INTERNAL: Server-side bug or invariant violation
 * - UNAVAILABLE: Service temporarily down
 * - DATA_LOSS: Data corruption
 *
 * @param code - Status code to check
 * @returns true if the error is a server error
 */
export declare function isServerError(code: GrpcStatusCode): boolean;
//# sourceMappingURL=StatusCodes.d.ts.map