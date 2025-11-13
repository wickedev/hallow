/**
 * Retry Logic Module
 *
 * Provides retry policies for handling transient gRPC failures with
 * exponential backoff and jitter.
 *
 * @example
 * ```typescript
 * import { RetryPolicy, createDefaultRetryPolicy } from './retry';
 *
 * const retryPolicy = createDefaultRetryPolicy(3);
 * const result = await retryPolicy.execute(async () => {
 *   return await adapter.unary(method, request);
 * });
 * ```
 */
export { RetryPolicy, createDefaultRetryPolicy, createNoRetryPolicy, type RetryConfig, type RetryContext, } from './RetryPolicy';
//# sourceMappingURL=index.d.ts.map