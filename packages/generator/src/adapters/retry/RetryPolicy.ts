/**
 * Retry Policy for transient gRPC failures
 *
 * Implements exponential backoff retry logic for transient errors.
 * Used by transport adapters to automatically retry failed operations.
 */

import { GrpcError, isRetryableStatusCode } from '../errors';

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
 * Default retryable error predicate
 *
 * Returns true for errors with retryable status codes:
 * - UNAVAILABLE
 * - DEADLINE_EXCEEDED
 * - RESOURCE_EXHAUSTED
 * - ABORTED
 */
function defaultRetryableErrorPredicate(error: GrpcError): boolean {
  return isRetryableStatusCode(error.code);
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
export class RetryPolicy {
  private config: ResolvedRetryConfig;

  /**
   * Create a new RetryPolicy
   *
   * @param config - Retry configuration
   */
  constructor(config: RetryConfig = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      initialBackoffMs: config.initialBackoffMs ?? 100,
      maxBackoffMs: config.maxBackoffMs ?? 10000,
      backoffMultiplier: config.backoffMultiplier ?? 2,
      jitter: config.jitter ?? true,
      retryableErrorPredicate:
        config.retryableErrorPredicate || defaultRetryableErrorPredicate,
    };

    // Validate configuration
    this.validateConfig();
  }

  /**
   * Validate retry configuration
   * @private
   */
  private validateConfig(): void {
    if (this.config.maxRetries < 0) {
      throw new Error('maxRetries must be >= 0');
    }

    if (this.config.initialBackoffMs <= 0) {
      throw new Error('initialBackoffMs must be > 0');
    }

    if (this.config.maxBackoffMs <= 0) {
      throw new Error('maxBackoffMs must be > 0');
    }

    if (this.config.backoffMultiplier <= 1) {
      throw new Error('backoffMultiplier must be > 1');
    }

    if (this.config.initialBackoffMs > this.config.maxBackoffMs) {
      throw new Error('initialBackoffMs must be <= maxBackoffMs');
    }
  }

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
  async execute<T>(
    operation: () => Promise<T>,
    context?: Partial<RetryContext>
  ): Promise<T> {
    const ctx: RetryContext = {
      attempt: context?.attempt ?? 0,
      attemptsMade: context?.attemptsMade ?? 0,
      maxRetries: this.config.maxRetries,
      lastError: context?.lastError,
      totalRetryTime: context?.totalRetryTime ?? 0,
    };

    while (true) {
      try {
        // Execute the operation
        const result = await operation();
        return result;
      } catch (error) {
        ctx.attemptsMade++;

        // Convert error to GrpcError if needed
        const grpcError = this.toGrpcError(error);
        ctx.lastError = grpcError;

        // Check if we should retry
        if (!this.shouldRetry(ctx, grpcError)) {
          throw grpcError;
        }

        // Calculate backoff delay
        const delayMs = this.calculateBackoff(ctx.attempt);
        ctx.totalRetryTime += delayMs;

        // Wait before retrying
        await this.sleep(delayMs);

        // Increment attempt counter for next iteration
        ctx.attempt++;
      }
    }
  }

  /**
   * Check if error should be retried
   *
   * @param context - Current retry context
   * @param error - Error to check
   * @returns true if should retry
   * @private
   */
  private shouldRetry(context: RetryContext, error: GrpcError): boolean {
    // Exceeded max retries
    if (context.attempt >= this.config.maxRetries) {
      return false;
    }

    // Check if error is retryable
    return this.config.retryableErrorPredicate(error);
  }

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
  private calculateBackoff(attempt: number): number {
    // Calculate exponential backoff
    const exponentialDelay =
      this.config.initialBackoffMs *
      Math.pow(this.config.backoffMultiplier, attempt);

    // Cap at max backoff
    let delay = Math.min(exponentialDelay, this.config.maxBackoffMs);

    // Apply jitter if enabled
    if (this.config.jitter) {
      // Random jitter between 0% and 100% of delay
      const jitterRange = delay;
      delay = Math.random() * jitterRange;
    }

    return Math.floor(delay);
  }

  /**
   * Sleep for specified milliseconds
   *
   * @param ms - Milliseconds to sleep
   * @returns Promise that resolves after delay
   * @private
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Convert any error to GrpcError
   *
   * @param error - Error to convert
   * @returns GrpcError instance
   * @private
   */
  private toGrpcError(error: any): GrpcError {
    if (error instanceof GrpcError) {
      return error;
    }

    // For non-GrpcError, wrap in generic error
    // This shouldn't normally happen if adapters use proper error conversion
    const message = error instanceof Error ? error.message : String(error);
    // Import GrpcStatusCode to create error
    const GrpcErrorClass = error.constructor;
    if (GrpcErrorClass.name === 'GrpcError') {
      return error as GrpcError;
    }

    // Return error as-is and let caller handle
    throw error;
  }

  /**
   * Get current configuration
   *
   * @returns Resolved retry configuration
   */
  getConfig(): Readonly<ResolvedRetryConfig> {
    return Object.freeze({ ...this.config });
  }
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
export function createDefaultRetryPolicy(maxRetries: number = 3): RetryPolicy {
  return new RetryPolicy({ maxRetries });
}

/**
 * Create a retry policy with no retries (fail fast)
 *
 * @returns RetryPolicy instance with maxRetries = 0
 */
export function createNoRetryPolicy(): RetryPolicy {
  return new RetryPolicy({ maxRetries: 0 });
}
