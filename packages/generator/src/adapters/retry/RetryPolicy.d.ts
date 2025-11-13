/**
 * Retry Policy for transient gRPC failures
 *
 * Implements exponential backoff retry logic for transient errors.
 * Used by transport adapters to automatically retry failed operations.
 */
import { GrpcError } from '../errors';
/**
 * Configuration for retry behavior
 */
export interface RetryConfig {
    /**
     * Maximum number of retry attempts
     * @default 3
     */
    maxRetries?: number;
    /**
     * Initial backoff delay in milliseconds
     * @default 100
     */
    initialBackoffMs?: number;
    /**
     * Maximum backoff delay in milliseconds
     * @default 10000 (10 seconds)
     */
    maxBackoffMs?: number;
    /**
     * Backoff multiplier for exponential backoff
     * @default 2
     */
    backoffMultiplier?: number;
    /**
     * Add random jitter to backoff delays
     * Helps prevent thundering herd problem
     * @default true
     */
    jitter?: boolean;
    /**
     * Custom predicate to determine if an error is retryable
     * If not provided, uses default retryable status code check
     */
    retryableErrorPredicate?: (error: GrpcError) => boolean;
}
/**
 * Internal retry configuration with required fields
 */
interface ResolvedRetryConfig {
    maxRetries: number;
    initialBackoffMs: number;
    maxBackoffMs: number;
    backoffMultiplier: number;
    jitter: boolean;
    retryableErrorPredicate: (error: GrpcError) => boolean;
}
/**
 * Retry context for tracking retry attempts
 */
export interface RetryContext {
    /**
     * Current attempt number (0-based)
     */
    attempt: number;
    /**
     * Total attempts made so far (including initial attempt)
     */
    attemptsMade: number;
    /**
     * Maximum retry attempts allowed
     */
    maxRetries: number;
    /**
     * Last error encountered
     */
    lastError?: GrpcError;
    /**
     * Total time spent on retries (milliseconds)
     */
    totalRetryTime: number;
}
/**
 * RetryPolicy class for managing retry logic
 *
 * Implements exponential backoff with optional jitter for retrying
 * transient failures in gRPC calls.
 *
 * @example
 * ```typescript
 * const retryPolicy = new RetryPolicy({
 *   maxRetries: 3,
 *   initialBackoffMs: 100,
 *   maxBackoffMs: 5000,
 * });
 *
 * const result = await retryPolicy.execute(async () => {
 *   return await adapter.unary(method, request);
 * });
 * ```
 */
export declare class RetryPolicy {
    private config;
    /**
     * Create a new RetryPolicy
     *
     * @param config - Retry configuration
     */
    constructor(config?: RetryConfig);
    /**
     * Validate retry configuration
     * @private
     */
    private validateConfig;
    /**
     * Execute an operation with retry logic
     *
     * Automatically retries the operation on transient failures using
     * exponential backoff.
     *
     * @template T - Return type of the operation
     * @param operation - Async operation to execute
     * @param context - Optional initial retry context
     * @returns Promise resolving to the operation result
     * @throws {GrpcError} If all retry attempts fail
     *
     * @example
     * ```typescript
     * const result = await retryPolicy.execute(async () => {
     *   return await stub.getUser({ id: '123' });
     * });
     * ```
     */
    execute<T>(operation: () => Promise<T>, context?: Partial<RetryContext>): Promise<T>;
    /**
     * Check if error should be retried
     *
     * @param context - Current retry context
     * @param error - Error to check
     * @returns true if should retry
     * @private
     */
    private shouldRetry;
    /**
     * Calculate backoff delay for current attempt
     *
     * Uses exponential backoff: delay = initial * (multiplier ^ attempt)
     * Applies jitter if configured.
     *
     * @param attempt - Current attempt number (0-based)
     * @returns Delay in milliseconds
     * @private
     */
    private calculateBackoff;
    /**
     * Sleep for specified milliseconds
     *
     * @param ms - Milliseconds to sleep
     * @returns Promise that resolves after delay
     * @private
     */
    private sleep;
    /**
     * Convert any error to GrpcError
     *
     * @param error - Error to convert
     * @returns GrpcError instance
     * @private
     */
    private toGrpcError;
    /**
     * Get current configuration
     *
     * @returns Resolved retry configuration
     */
    getConfig(): Readonly<ResolvedRetryConfig>;
}
/**
 * Create a simple retry policy with default configuration
 *
 * @param maxRetries - Maximum number of retries (default: 3)
 * @returns RetryPolicy instance
 *
 * @example
 * ```typescript
 * const policy = createDefaultRetryPolicy(5);
 * const result = await policy.execute(() => stub.getData());
 * ```
 */
export declare function createDefaultRetryPolicy(maxRetries?: number): RetryPolicy;
/**
 * Create a retry policy with no retries (fail fast)
 *
 * @returns RetryPolicy instance with maxRetries = 0
 */
export declare function createNoRetryPolicy(): RetryPolicy;
export {};
//# sourceMappingURL=RetryPolicy.d.ts.map