/**
 * gRPC Error Handling Module
 *
 * Provides comprehensive error handling for gRPC operations:
 * - GrpcError: Structured error class with status codes and metadata
 * - GrpcStatusCode: Standard gRPC status code enum
 * - Status code utilities: Helper functions for error classification
 * - StatusCodeMapper: Utilities for converting native gRPC errors
 *
 * @example
 * ```typescript
 * import { GrpcError, GrpcStatusCode, isGrpcError, convertGrpcError } from './errors';
 *
 * try {
 *   const response = await adapter.unary(method, request);
 * } catch (error) {
 *   if (isGrpcError(error)) {
 *     if (error.is(GrpcStatusCode.NOT_FOUND)) {
 *       console.log('Resource not found');
 *     } else if (error.isRetryable()) {
 *       // Retry with backoff
 *     }
 *   } else {
 *     // Convert any error to GrpcError
 *     throw convertGrpcError(error, 'MethodName');
 *   }
 * }
 * ```
 */
export { GrpcStatusCode, STATUS_CODE_DESCRIPTIONS, getStatusName, getStatusDescription, isRetryableStatusCode, isClientError, isServerError, } from './StatusCodes';
export { GrpcError, isGrpcError, type GrpcErrorDetails } from './GrpcError';
export { mapGrpcStatus, mapToGrpcStatus, isValidGrpcStatus, convertGrpcError, toGrpcError, isGrpcServiceError, extractErrorDetails, } from './StatusCodeMapper';
//# sourceMappingURL=index.d.ts.map