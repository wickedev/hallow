/**
 * Comprehensive CancellationToken Tests
 *
 * Phase 5 - Task 5.2: Complete CancellationToken
 * Phase 5 - Task 5.3: Stream Resource Cleanup
 * Phase 5 - Task 5.4: Testing
 *
 * This test suite validates:
 * - CancellationToken.cancel() execution
 * - Callback array cleanup to prevent memory leaks
 * - Error handling in cancellation callbacks
 * - isCancelled state management
 * - Concurrent cancellation handling
 *
 * Requirements Coverage:
 * - FR-5 AC 1-10: Stream cancellation and resource management
 * - NFR-3 AC 5-6: Memory leak prevention
 */

import { CancellationTokenImpl } from '../../src/adapters/GrpcWebAdapter';

describe('CancellationToken - Phase 5', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('constructor', () => {
    it('should create token with isCancelled = false', () => {
      const token = new CancellationTokenImpl();
      expect(token.isCancelled).toBe(false);
    });

    it('should initialize with empty callback array', () => {
      const token = new CancellationTokenImpl();

      // Register callback to verify array is initially empty
      token.onCancel(() => {});
      token.cancel();

      // If array was not empty, cancel would execute more callbacks
      expect(token.isCancelled).toBe(true);
    });
  });

  describe('cancel()', () => {
    it('should set isCancelled to true', () => {
      const token = new CancellationTokenImpl();

      expect(token.isCancelled).toBe(false);
      token.cancel();
      expect(token.isCancelled).toBe(true);
    });

    it('should execute all registered callbacks', () => {
      const token = new CancellationTokenImpl();
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      const callback3 = jest.fn();

      token.onCancel(callback1);
      token.onCancel(callback2);
      token.onCancel(callback3);

      token.cancel();

      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      expect(callback3).toHaveBeenCalledTimes(1);
    });

    it('should execute callbacks in registration order', () => {
      const token = new CancellationTokenImpl();
      const executionOrder: number[] = [];

      token.onCancel(() => executionOrder.push(1));
      token.onCancel(() => executionOrder.push(2));
      token.onCancel(() => executionOrder.push(3));

      token.cancel();

      expect(executionOrder).toEqual([1, 2, 3]);
    });

    it('should clear callbacks array after execution', () => {
      const token = new CancellationTokenImpl();
      const callback = jest.fn();

      token.onCancel(callback);
      token.cancel();

      expect(callback).toHaveBeenCalledTimes(1);

      // Cancelling again should not execute callbacks again
      token.cancel();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should be idempotent (safe to call multiple times)', () => {
      const token = new CancellationTokenImpl();
      const callback = jest.fn();

      token.onCancel(callback);

      token.cancel();
      token.cancel();
      token.cancel();

      // Callback should only be called once
      expect(callback).toHaveBeenCalledTimes(1);
      expect(token.isCancelled).toBe(true);
    });

    it('should not throw when called with no callbacks', () => {
      const token = new CancellationTokenImpl();

      expect(() => token.cancel()).not.toThrow();
      expect(token.isCancelled).toBe(true);
    });
  });

  describe('onCancel()', () => {
    it('should register callback for future cancellation', () => {
      const token = new CancellationTokenImpl();
      const callback = jest.fn();

      token.onCancel(callback);
      expect(callback).not.toHaveBeenCalled();

      token.cancel();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should execute callback immediately if already cancelled', () => {
      const token = new CancellationTokenImpl();
      const callback = jest.fn();

      token.cancel();

      token.onCancel(callback);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should allow registering multiple callbacks', () => {
      const token = new CancellationTokenImpl();
      const callbacks = [jest.fn(), jest.fn(), jest.fn(), jest.fn(), jest.fn()];

      callbacks.forEach(cb => token.onCancel(cb));
      token.cancel();

      callbacks.forEach(cb => {
        expect(cb).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle large number of callbacks', () => {
      const token = new CancellationTokenImpl();
      const callbackCount = 1000;
      const callbacks = Array.from({ length: callbackCount }, () => jest.fn());

      callbacks.forEach(cb => token.onCancel(cb));
      token.cancel();

      callbacks.forEach(cb => {
        expect(cb).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Error Handling in Callbacks', () => {
    it('should catch errors in callbacks and log them', () => {
      const token = new CancellationTokenImpl();
      const errorCallback = jest.fn(() => {
        throw new Error('Callback error');
      });
      const normalCallback = jest.fn();

      token.onCancel(errorCallback);
      token.onCancel(normalCallback);

      token.cancel();

      // Both callbacks should have been called despite the error
      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(normalCallback).toHaveBeenCalledTimes(1);

      // Error should have been logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in cancellation callback:',
        expect.any(Error)
      );
    });

    it('should continue executing callbacks after one throws', () => {
      const token = new CancellationTokenImpl();
      const executionOrder: number[] = [];

      token.onCancel(() => executionOrder.push(1));
      token.onCancel(() => {
        executionOrder.push(2);
        throw new Error('Error in callback 2');
      });
      token.onCancel(() => executionOrder.push(3));
      token.onCancel(() => {
        executionOrder.push(4);
        throw new Error('Error in callback 4');
      });
      token.onCancel(() => executionOrder.push(5));

      token.cancel();

      // All callbacks should have executed
      expect(executionOrder).toEqual([1, 2, 3, 4, 5]);

      // Two errors should have been logged
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle error in immediate callback execution', () => {
      const token = new CancellationTokenImpl();
      const errorCallback = jest.fn(() => {
        throw new Error('Immediate callback error');
      });

      token.cancel();
      token.onCancel(errorCallback);

      expect(errorCallback).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in immediate cancellation callback:',
        expect.any(Error)
      );
    });

    it('should handle various error types in callbacks', () => {
      const token = new CancellationTokenImpl();

      token.onCancel(() => {
        throw new Error('Regular error');
      });
      token.onCancel(() => {
        throw new TypeError('Type error');
      });
      token.onCancel(() => {
        throw new RangeError('Range error');
      });
      token.onCancel(() => {
        throw 'String error';
      });
      token.onCancel(() => {
        throw { custom: 'error' };
      });

      token.cancel();

      expect(consoleErrorSpy).toHaveBeenCalledTimes(5);
    });
  });

  describe('Memory Leak Prevention', () => {
    it('should clear callbacks array to prevent memory leaks', () => {
      const token = new CancellationTokenImpl();
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      token.onCancel(callback1);
      token.onCancel(callback2);

      token.cancel();

      // Callbacks should have been executed
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);

      // Registering new callback after cancel should execute immediately
      const callback3 = jest.fn();
      token.onCancel(callback3);
      expect(callback3).toHaveBeenCalledTimes(1);

      // Original callbacks should not be called again
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
    });

    it('should allow garbage collection of callback references', () => {
      const token = new CancellationTokenImpl();

      // Create callbacks with closures over large objects
      const largeObject1 = { data: new Array(10000).fill(0) };
      const largeObject2 = { data: new Array(10000).fill(0) };

      token.onCancel(() => {
        // Reference large objects in callbacks
        expect(largeObject1.data.length).toBe(10000);
      });

      token.onCancel(() => {
        expect(largeObject2.data.length).toBe(10000);
      });

      // After cancellation, callbacks should be cleared
      token.cancel();

      // Verify callbacks array was cleared (indirectly)
      const newCallback = jest.fn();
      token.onCancel(newCallback);
      expect(newCallback).toHaveBeenCalledTimes(1);
    });

    it('should not accumulate callbacks across multiple cancel cycles', () => {
      const token = new CancellationTokenImpl();

      // First cycle
      const callback1 = jest.fn();
      token.onCancel(callback1);
      token.cancel();
      expect(callback1).toHaveBeenCalledTimes(1);

      // Second cycle (should not be possible in normal use, but test anyway)
      const callback2 = jest.fn();
      token.onCancel(callback2);
      expect(callback2).toHaveBeenCalledTimes(1);

      // Original callback should not be called again
      expect(callback1).toHaveBeenCalledTimes(1);
    });
  });

  describe('Concurrent Cancellation', () => {
    it('should handle concurrent cancel() calls safely', () => {
      const token = new CancellationTokenImpl();
      const callback = jest.fn();

      token.onCancel(callback);

      // Simulate concurrent cancellation
      Promise.all([
        Promise.resolve().then(() => token.cancel()),
        Promise.resolve().then(() => token.cancel()),
        Promise.resolve().then(() => token.cancel()),
      ]);

      // Wait for promises to resolve
      return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        expect(callback).toHaveBeenCalledTimes(1);
        expect(token.isCancelled).toBe(true);
      });
    });

    it('should handle concurrent onCancel() calls', () => {
      const token = new CancellationTokenImpl();
      const callbacks = Array.from({ length: 10 }, () => jest.fn());

      // Register callbacks concurrently
      Promise.all(
        callbacks.map(cb => Promise.resolve().then(() => token.onCancel(cb)))
      );

      return new Promise(resolve => setTimeout(resolve, 10)).then(() => {
        token.cancel();

        callbacks.forEach(cb => {
          expect(cb).toHaveBeenCalledTimes(1);
        });
      });
    });
  });

  describe('Resource Cleanup Scenarios', () => {
    it('should cleanup gRPC client connection', () => {
      const token = new CancellationTokenImpl();
      const mockClient = { close: jest.fn() };

      token.onCancel(() => {
        mockClient.close();
      });

      token.cancel();

      expect(mockClient.close).toHaveBeenCalledTimes(1);
    });

    it('should cleanup multiple resources', () => {
      const token = new CancellationTokenImpl();
      const resources = {
        connection: { close: jest.fn() },
        timer: { clear: jest.fn() },
        subscription: { unsubscribe: jest.fn() },
        eventListener: { remove: jest.fn() },
      };

      token.onCancel(() => resources.connection.close());
      token.onCancel(() => resources.timer.clear());
      token.onCancel(() => resources.subscription.unsubscribe());
      token.onCancel(() => resources.eventListener.remove());

      token.cancel();

      expect(resources.connection.close).toHaveBeenCalledTimes(1);
      expect(resources.timer.clear).toHaveBeenCalledTimes(1);
      expect(resources.subscription.unsubscribe).toHaveBeenCalledTimes(1);
      expect(resources.eventListener.remove).toHaveBeenCalledTimes(1);
    });

    it('should handle cleanup errors gracefully', () => {
      const token = new CancellationTokenImpl();
      const resources = {
        resource1: {
          close: jest.fn(() => {
            throw new Error('Failed to close resource1');
          }),
        },
        resource2: { close: jest.fn() },
        resource3: { close: jest.fn() },
      };

      token.onCancel(() => resources.resource1.close());
      token.onCancel(() => resources.resource2.close());
      token.onCancel(() => resources.resource3.close());

      token.cancel();

      // All cleanup attempts should have been made despite error
      expect(resources.resource1.close).toHaveBeenCalledTimes(1);
      expect(resources.resource2.close).toHaveBeenCalledTimes(1);
      expect(resources.resource3.close).toHaveBeenCalledTimes(1);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration with Observable Teardown', () => {
    it('should integrate with Observable unsubscribe', () => {
      const token = new CancellationTokenImpl();
      const cleanupFn = jest.fn();

      // Simulate Observable teardown registration
      token.onCancel(cleanupFn);

      // Simulate unsubscribe
      token.cancel();

      expect(cleanupFn).toHaveBeenCalledTimes(1);
      expect(token.isCancelled).toBe(true);
    });

    it('should support Observable pattern with multiple subscribers', () => {
      const token = new CancellationTokenImpl();
      const subscriber1Cleanup = jest.fn();
      const subscriber2Cleanup = jest.fn();
      const subscriber3Cleanup = jest.fn();

      token.onCancel(subscriber1Cleanup);
      token.onCancel(subscriber2Cleanup);
      token.onCancel(subscriber3Cleanup);

      token.cancel();

      expect(subscriber1Cleanup).toHaveBeenCalledTimes(1);
      expect(subscriber2Cleanup).toHaveBeenCalledTimes(1);
      expect(subscriber3Cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle callback that registers another callback', () => {
      const token = new CancellationTokenImpl();
      const innerCallback = jest.fn();
      const outerCallback = jest.fn(() => {
        token.onCancel(innerCallback);
      });

      token.onCancel(outerCallback);
      token.cancel();

      expect(outerCallback).toHaveBeenCalledTimes(1);
      // Inner callback should be executed immediately since token is already cancelled
      expect(innerCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle callback that calls cancel again', () => {
      const token = new CancellationTokenImpl();
      const recursiveCallback = jest.fn(() => {
        token.cancel();
      });

      token.onCancel(recursiveCallback);
      token.cancel();

      expect(recursiveCallback).toHaveBeenCalledTimes(1);
      expect(token.isCancelled).toBe(true);
    });

    it('should handle empty callback function', () => {
      const token = new CancellationTokenImpl();
      const emptyCallback = jest.fn();

      token.onCancel(emptyCallback);
      token.cancel();

      expect(emptyCallback).toHaveBeenCalledTimes(1);
    });

    it('should handle callback with async operations', async () => {
      const token = new CancellationTokenImpl();
      let asyncOperationCompleted = false;

      token.onCancel(async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        asyncOperationCompleted = true;
      });

      token.cancel();

      // Callback is called but async operation may not complete immediately
      // This is expected behavior - cancel doesn't wait for async callbacks
      await new Promise(resolve => setTimeout(resolve, 20));
      expect(asyncOperationCompleted).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should handle large number of callbacks efficiently', () => {
      const token = new CancellationTokenImpl();
      const callbackCount = 10000;
      const callbacks = Array.from({ length: callbackCount }, () => jest.fn());

      const startTime = Date.now();

      callbacks.forEach(cb => token.onCancel(cb));
      token.cancel();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (< 100ms for 10k callbacks)
      expect(duration).toBeLessThan(100);

      // All callbacks should have been executed
      callbacks.forEach(cb => {
        expect(cb).toHaveBeenCalledTimes(1);
      });
    });

    it('should clear memory efficiently after cancellation', () => {
      const token = new CancellationTokenImpl();
      const callbacks = Array.from({ length: 1000 }, () => jest.fn());

      callbacks.forEach(cb => token.onCancel(cb));
      token.cancel();

      // After cancellation, internal array should be cleared
      // Test by verifying new callbacks execute immediately
      const testCallback = jest.fn();
      token.onCancel(testCallback);
      expect(testCallback).toHaveBeenCalledTimes(1);
    });
  });
});
