/**
 * Unit tests for RetryPolicy
 */

import {
  RetryPolicy,
  createDefaultRetryPolicy,
  createNoRetryPolicy,
} from '../../../../src/adapters/retry/RetryPolicy';
import { GrpcError, GrpcStatusCode } from '../../../../src/adapters/errors';

describe('RetryPolicy', () => {
  describe('constructor', () => {
    it('should create policy with default configuration', () => {
      const policy = new RetryPolicy();
      const config = policy.getConfig();

      expect(config.maxRetries).toBe(3);
      expect(config.initialBackoffMs).toBe(100);
      expect(config.maxBackoffMs).toBe(10000);
      expect(config.backoffMultiplier).toBe(2);
      expect(config.jitter).toBe(true);
    });

    it('should create policy with custom configuration', () => {
      const policy = new RetryPolicy({
        maxRetries: 5,
        initialBackoffMs: 50,
        maxBackoffMs: 5000,
        backoffMultiplier: 1.5,
        jitter: false,
      });

      const config = policy.getConfig();
      expect(config.maxRetries).toBe(5);
      expect(config.initialBackoffMs).toBe(50);
      expect(config.maxBackoffMs).toBe(5000);
      expect(config.backoffMultiplier).toBe(1.5);
      expect(config.jitter).toBe(false);
    });

    it('should throw on invalid maxRetries', () => {
      expect(() => new RetryPolicy({ maxRetries: -1 })).toThrow();
    });

    it('should throw on invalid initialBackoffMs', () => {
      expect(() => new RetryPolicy({ initialBackoffMs: 0 })).toThrow();
      expect(() => new RetryPolicy({ initialBackoffMs: -1 })).toThrow();
    });

    it('should throw on invalid maxBackoffMs', () => {
      expect(() => new RetryPolicy({ maxBackoffMs: 0 })).toThrow();
      expect(() => new RetryPolicy({ maxBackoffMs: -1 })).toThrow();
    });

    it('should throw on invalid backoffMultiplier', () => {
      expect(() => new RetryPolicy({ backoffMultiplier: 1 })).toThrow();
      expect(() => new RetryPolicy({ backoffMultiplier: 0.5 })).toThrow();
    });

    it('should throw if initialBackoffMs > maxBackoffMs', () => {
      expect(
        () =>
          new RetryPolicy({ initialBackoffMs: 1000, maxBackoffMs: 500 })
      ).toThrow();
    });
  });

  describe('execute - success', () => {
    it('should execute operation successfully on first attempt', async () => {
      const policy = new RetryPolicy();
      const operation = jest.fn().mockResolvedValue('success');

      const result = await policy.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should return operation result', async () => {
      const policy = new RetryPolicy();
      const expectedResult = { id: 123, name: 'Test' };
      const operation = jest.fn().mockResolvedValue(expectedResult);

      const result = await policy.execute(operation);

      expect(result).toEqual(expectedResult);
    });
  });

  describe('execute - retryable errors', () => {
    it('should retry on UNAVAILABLE error', async () => {
      const policy = new RetryPolicy({ maxRetries: 2, initialBackoffMs: 10 });

      const operation = jest
        .fn()
        .mockRejectedValueOnce(
          new GrpcError('Unavailable', GrpcStatusCode.UNAVAILABLE, 'Test')
        )
        .mockResolvedValue('success');

      const result = await policy.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2); // 1 initial + 1 retry
    });

    it('should retry on DEADLINE_EXCEEDED error', async () => {
      const policy = new RetryPolicy({ maxRetries: 2, initialBackoffMs: 10 });

      const operation = jest
        .fn()
        .mockRejectedValueOnce(
          new GrpcError(
            'Deadline exceeded',
            GrpcStatusCode.DEADLINE_EXCEEDED,
            'Test'
          )
        )
        .mockResolvedValue('success');

      const result = await policy.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should retry multiple times until success', async () => {
      const policy = new RetryPolicy({ maxRetries: 3, initialBackoffMs: 10 });

      const error = new GrpcError(
        'Unavailable',
        GrpcStatusCode.UNAVAILABLE,
        'Test'
      );

      const operation = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const result = await policy.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it('should respect maxRetries limit', async () => {
      const policy = new RetryPolicy({ maxRetries: 2, initialBackoffMs: 10 });

      const error = new GrpcError(
        'Unavailable',
        GrpcStatusCode.UNAVAILABLE,
        'Test'
      );
      const operation = jest.fn().mockRejectedValue(error);

      await expect(policy.execute(operation)).rejects.toThrow(error);

      expect(operation).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });
  });

  describe('execute - non-retryable errors', () => {
    it('should not retry on NOT_FOUND error', async () => {
      const policy = new RetryPolicy({ maxRetries: 3 });

      const error = new GrpcError('Not found', GrpcStatusCode.NOT_FOUND, 'Test');
      const operation = jest.fn().mockRejectedValue(error);

      await expect(policy.execute(operation)).rejects.toThrow(error);

      expect(operation).toHaveBeenCalledTimes(1); // Only initial attempt
    });

    it('should not retry on INVALID_ARGUMENT error', async () => {
      const policy = new RetryPolicy({ maxRetries: 3 });

      const error = new GrpcError(
        'Invalid argument',
        GrpcStatusCode.INVALID_ARGUMENT,
        'Test'
      );
      const operation = jest.fn().mockRejectedValue(error);

      await expect(policy.execute(operation)).rejects.toThrow(error);

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should not retry on PERMISSION_DENIED error', async () => {
      const policy = new RetryPolicy({ maxRetries: 3 });

      const error = new GrpcError(
        'Permission denied',
        GrpcStatusCode.PERMISSION_DENIED,
        'Test'
      );
      const operation = jest.fn().mockRejectedValue(error);

      await expect(policy.execute(operation)).rejects.toThrow(error);

      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('custom retryableErrorPredicate', () => {
    it('should use custom predicate to determine retryability', async () => {
      // Custom predicate: only retry on INTERNAL errors
      const policy = new RetryPolicy({
        maxRetries: 2,
        initialBackoffMs: 10,
        retryableErrorPredicate: (error) =>
          error.code === GrpcStatusCode.INTERNAL,
      });

      const error = new GrpcError('Internal', GrpcStatusCode.INTERNAL, 'Test');
      const operation = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const result = await policy.execute(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry when custom predicate returns false', async () => {
      const policy = new RetryPolicy({
        maxRetries: 3,
        retryableErrorPredicate: () => false, // Never retry
      });

      const error = new GrpcError(
        'Unavailable',
        GrpcStatusCode.UNAVAILABLE,
        'Test'
      );
      const operation = jest.fn().mockRejectedValue(error);

      await expect(policy.execute(operation)).rejects.toThrow(error);

      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('backoff calculation', () => {
    it('should increase backoff delay exponentially', async () => {
      const policy = new RetryPolicy({
        maxRetries: 3,
        initialBackoffMs: 100,
        backoffMultiplier: 2,
        jitter: false, // Disable jitter for predictable testing
      });

      const error = new GrpcError(
        'Unavailable',
        GrpcStatusCode.UNAVAILABLE,
        'Test'
      );
      const operation = jest.fn().mockRejectedValue(error);

      const startTime = Date.now();
      await expect(policy.execute(operation)).rejects.toThrow();
      const duration = Date.now() - startTime;

      // Expected delays: 100ms (1st retry), 200ms (2nd retry), 400ms (3rd retry)
      // Total: ~700ms (allowing some tolerance)
      expect(duration).toBeGreaterThanOrEqual(650);
      expect(duration).toBeLessThan(1000);
    });

    it('should cap backoff at maxBackoffMs', async () => {
      const policy = new RetryPolicy({
        maxRetries: 5,
        initialBackoffMs: 100,
        maxBackoffMs: 200, // Cap at 200ms
        backoffMultiplier: 10, // Would normally grow very fast
        jitter: false,
      });

      const error = new GrpcError(
        'Unavailable',
        GrpcStatusCode.UNAVAILABLE,
        'Test'
      );
      const operation = jest.fn().mockRejectedValue(error);

      const startTime = Date.now();
      await expect(policy.execute(operation)).rejects.toThrow();
      const duration = Date.now() - startTime;

      // Expected delays: 100ms (attempt 0), 200ms (capped, attempt 1), 200ms (capped, attempt 2), ...
      // With maxBackoffMs=200, delays after first should be capped
      // 5 retries: ~100 + 200 + 200 + 200 + 200 = 900ms
      expect(duration).toBeGreaterThanOrEqual(850);
      expect(duration).toBeLessThan(1200);
    });
  });

  describe('createDefaultRetryPolicy', () => {
    it('should create policy with specified maxRetries', () => {
      const policy = createDefaultRetryPolicy(5);
      const config = policy.getConfig();

      expect(config.maxRetries).toBe(5);
    });

    it('should use default maxRetries if not specified', () => {
      const policy = createDefaultRetryPolicy();
      const config = policy.getConfig();

      expect(config.maxRetries).toBe(3);
    });
  });

  describe('createNoRetryPolicy', () => {
    it('should create policy with zero retries', () => {
      const policy = createNoRetryPolicy();
      const config = policy.getConfig();

      expect(config.maxRetries).toBe(0);
    });

    it('should not retry on any error', async () => {
      const policy = createNoRetryPolicy();

      const error = new GrpcError(
        'Unavailable',
        GrpcStatusCode.UNAVAILABLE,
        'Test'
      );
      const operation = jest.fn().mockRejectedValue(error);

      await expect(policy.execute(operation)).rejects.toThrow(error);

      expect(operation).toHaveBeenCalledTimes(1);
    });
  });

  describe('getConfig', () => {
    it('should return frozen config object', () => {
      const policy = new RetryPolicy();
      const config = policy.getConfig();

      expect(Object.isFrozen(config)).toBe(true);
    });

    it('should return current configuration', () => {
      const policy = new RetryPolicy({
        maxRetries: 5,
        initialBackoffMs: 200,
      });

      const config = policy.getConfig();

      expect(config.maxRetries).toBe(5);
      expect(config.initialBackoffMs).toBe(200);
    });
  });
});
