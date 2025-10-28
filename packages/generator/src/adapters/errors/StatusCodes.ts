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
export enum GrpcStatusCode {
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
  UNAUTHENTICATED = 16,
}

/**
 * Human-readable descriptions for each status code
 *
 * Provides detailed explanations of what each status code means,
 * useful for debugging and error messages.
 */
export const STATUS_CODE_DESCRIPTIONS: Record<GrpcStatusCode, string> = {
  [GrpcStatusCode.OK]: 'The operation completed successfully.',

  [GrpcStatusCode.CANCELLED]:
    'The operation was cancelled, typically by the caller.',

  [GrpcStatusCode.UNKNOWN]:
    'Unknown error. An example would be errors raised by APIs that do not return enough error information.',

  [GrpcStatusCode.INVALID_ARGUMENT]:
    'The client specified an invalid argument. Note that this differs from FAILED_PRECONDITION. INVALID_ARGUMENT indicates arguments that are problematic regardless of the state of the system.',

  [GrpcStatusCode.DEADLINE_EXCEEDED]:
    'The deadline expired before the operation could complete. For operations that change the state of the system, this error may be returned even if the operation has completed successfully.',

  [GrpcStatusCode.NOT_FOUND]:
    'Some requested entity (e.g., file or directory) was not found. Note to server developers: if a request is denied for an entire class of users, such as gradual feature rollout or undocumented allowlist, NOT_FOUND may be used. If a request is denied for some users within a class of users, such as user-based access control, PERMISSION_DENIED must be used.',

  [GrpcStatusCode.ALREADY_EXISTS]:
    'The entity that a client attempted to create (e.g., file or directory) already exists.',

  [GrpcStatusCode.PERMISSION_DENIED]:
    'The caller does not have permission to execute the specified operation. PERMISSION_DENIED must not be used for rejections caused by exhausting some resource (use RESOURCE_EXHAUSTED instead). PERMISSION_DENIED must not be used if the caller cannot be identified (use UNAUTHENTICATED instead).',

  [GrpcStatusCode.RESOURCE_EXHAUSTED]:
    'Some resource has been exhausted, perhaps a per-user quota, or perhaps the entire file system is out of space.',

  [GrpcStatusCode.FAILED_PRECONDITION]:
    'The operation was rejected because the system is not in a state required for the operation\'s execution. For example, a directory to be deleted may be non-empty, an rmdir operation is applied to a non-directory, etc.',

  [GrpcStatusCode.ABORTED]:
    'The operation was aborted, typically due to a concurrency issue such as a sequencer check failure or transaction abort.',

  [GrpcStatusCode.OUT_OF_RANGE]:
    'The operation was attempted past the valid range. E.g., seeking or reading past end-of-file. Unlike INVALID_ARGUMENT, this error indicates a problem that may be fixed if the system state changes.',

  [GrpcStatusCode.UNIMPLEMENTED]:
    'The operation is not implemented or is not supported/enabled in this service.',

  [GrpcStatusCode.INTERNAL]:
    'Internal errors. This means that some invariants expected by the underlying system have been broken. This error code is reserved for serious errors.',

  [GrpcStatusCode.UNAVAILABLE]:
    'The service is currently unavailable. This is most likely a transient condition, which can be corrected by retrying with a backoff. Note that it is not always safe to retry non-idempotent operations.',

  [GrpcStatusCode.DATA_LOSS]:
    'Unrecoverable data loss or corruption.',

  [GrpcStatusCode.UNAUTHENTICATED]:
    'The request does not have valid authentication credentials for the operation.',
};

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
export function getStatusName(code: GrpcStatusCode): string {
  return GrpcStatusCode[code] || `UNKNOWN(${code})`;
}

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
export function getStatusDescription(code: GrpcStatusCode): string {
  return (
    STATUS_CODE_DESCRIPTIONS[code] ||
    'Unknown status code. No description available.'
  );
}

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
export function isRetryableStatusCode(code: GrpcStatusCode): boolean {
  return (
    code === GrpcStatusCode.UNAVAILABLE ||
    code === GrpcStatusCode.DEADLINE_EXCEEDED ||
    code === GrpcStatusCode.RESOURCE_EXHAUSTED ||
    code === GrpcStatusCode.ABORTED
  );
}

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
export function isClientError(code: GrpcStatusCode): boolean {
  return (
    code === GrpcStatusCode.INVALID_ARGUMENT ||
    code === GrpcStatusCode.NOT_FOUND ||
    code === GrpcStatusCode.ALREADY_EXISTS ||
    code === GrpcStatusCode.PERMISSION_DENIED ||
    code === GrpcStatusCode.FAILED_PRECONDITION ||
    code === GrpcStatusCode.OUT_OF_RANGE ||
    code === GrpcStatusCode.UNAUTHENTICATED
  );
}

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
export function isServerError(code: GrpcStatusCode): boolean {
  return (
    code === GrpcStatusCode.UNIMPLEMENTED ||
    code === GrpcStatusCode.INTERNAL ||
    code === GrpcStatusCode.UNAVAILABLE ||
    code === GrpcStatusCode.DATA_LOSS
  );
}
