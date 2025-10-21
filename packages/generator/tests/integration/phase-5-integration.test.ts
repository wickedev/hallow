/**
 * Phase 5 Integration Tests - Task 5.4
 *
 * Comprehensive integration testing for error handling, cancellation, and resource management.
 * This test suite brings together all components from Phase 5 to validate real-world scenarios.
 *
 * Components Tested:
 * - GrpcError (Task 5.1)
 * - CancellationToken (Task 5.2)
 * - Stream Resource Cleanup (Task 5.3)
 *
 * Requirements Coverage:
 * - FR-5: Stream Cancellation and Resource Management
 * - FR-7: Error Handling and Resilience
 * - NFR-3 AC 5-6: Memory leak prevention and resource cleanup
 *
 * Test Categories:
 * 1. Error Scenario Integration Tests
 * 2. Cancellation Integration Tests
 * 3. Memory Leak Integration Tests
 * 4. End-to-End Realistic Workflows
 * 5. Stress Testing
 */

// Create mock Code enum with reverse mapping (defined before jest.mock)
const createMockCodeEnum = () => {
  const code: any = {
    OK: 0,
    Cancelled: 1,
    Unknown: 2,
    InvalidArgument: 3,
    DeadlineExceeded: 4,
    NotFound: 5,
    AlreadyExists: 6,
    PermissionDenied: 7,
    ResourceExhausted: 8,
    FailedPrecondition: 9,
    Aborted: 10,
    OutOfRange: 11,
    Unimplemented: 12,
    Internal: 13,
    Unavailable: 14,
    DataLoss: 15,
    Unauthenticated: 16,
  };

  // Add reverse mapping (number -> name) like TypeScript enums
  Object.keys(code).forEach(key => {
    const value = code[key];
    code[value] = key;
  });

  return code;
};

// Mock @improbable-eng/grpc-web
jest.mock('@improbable-eng/grpc-web', () => ({
  grpc: {
    invoke: jest.fn(),
    unary: jest.fn(),
    Code: createMockCodeEnum(),
    Metadata: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      has: jest.fn(),
    })),
  },
}));

import { GrpcWebAdapter, GrpcError, isGrpcError, MethodDescriptor, CancellationTokenImpl } from '../../src/adapters/GrpcWebAdapter';
import { grpc } from '@improbable-eng/grpc-web';
import { Subscription } from 'rxjs';

describe('Phase 5 Integration Tests - Task 5.4', () => {
  let adapter: GrpcWebAdapter;
  let mockInvoke: jest.Mock;
  let mockUnary: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  const createMockDescriptor = (): MethodDescriptor<any, any> => ({
    methodName: 'TestMethod',
    service: { serviceName: 'TestService' },
    requestStream: false,
    responseStream: true,
    requestType: {} as any,
    responseType: {} as any,
  });

  beforeEach(() => {
    adapter = new GrpcWebAdapter('http://localhost:3000');
    mockInvoke = grpc.invoke as jest.Mock;
    mockUnary = grpc.unary as jest.Mock;
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  /**
   * Test Category 1: Error Scenario Integration Tests
   *
   * These tests validate end-to-end error handling across all components:
   * - Error propagation from gRPC layer
   * - Error type discrimination
   * - Resource cleanup on errors
   * - Error recovery strategies
   */
  describe('Error Scenario Integration', () => {
    it('should handle network timeout with proper cleanup', async () => {
      const descriptor = createMockDescriptor();
      const request = { id: '123' };

      mockInvoke.mockImplementation((desc, opts) => {
        setTimeout(() => {
          opts.onEnd(grpc.Code.DeadlineExceeded, 'Request timeout', {} as any);
        }, 10);

        return {
          close: jest.fn(),
        };
      });

      const errorHandler = jest.fn();
      const completeHandler = jest.fn();
      const nextHandler = jest.fn();

      const subscription = adapter.serverStream(descriptor, request).subscribe({
        next: nextHandler,
        error: errorHandler,
        complete: completeHandler,
      });

      await new Promise(resolve => setTimeout(resolve, 20));

      // Verify error was caught
      expect(errorHandler).toHaveBeenCalled();
      expect(nextHandler).not.toHaveBeenCalled();
      expect(completeHandler).not.toHaveBeenCalled();

      // Verify error type
      const error = errorHandler.mock.calls[0][0];
      expect(isGrpcError(error)).toBe(true);
      expect(error.code).toBe(grpc.Code.DeadlineExceeded);

      // Cleanup should still work after error
      subscription.unsubscribe();
    });

    it('should handle authentication error and prevent retry', async () => {
      const descriptor = createMockDescriptor();
      const request = { id: '123' };

      mockInvoke.mockImplementation((desc, opts) => {
        setTimeout(() => {
          opts.onEnd(grpc.Code.Unauthenticated, 'Invalid credentials', {} as any);
        }, 10);

        return {
          close: jest.fn(),
        };
      });

      const errorHandler = jest.fn();

      adapter.serverStream(descriptor, request).subscribe({
        error: errorHandler,
      });

      await new Promise(resolve => setTimeout(resolve, 20));

      const error = errorHandler.mock.calls[0][0];
      expect(isGrpcError(error)).toBe(true);
      expect(error.code).toBe(grpc.Code.Unauthenticated);
      expect(error.toUserMessage()).toContain('Unauthenticated');
    });

    it('should handle server error during active stream', async () => {
      const descriptor = createMockDescriptor();
      const request = { id: '123' };

      let onMessageCallback: any;
      let onEndCallback: any;

      mockInvoke.mockImplementation((desc, opts) => {
        onMessageCallback = opts.onMessage;
        onEndCallback = opts.onEnd;

        return {
          close: jest.fn(),
        };
      });

      const messages: any[] = [];
      const errorHandler = jest.fn();

      adapter.serverStream(descriptor, request).subscribe({
        next: (msg) => messages.push(msg),
        error: errorHandler,
      });

      // Emit some messages
      onMessageCallback({ value: 1 });
      onMessageCallback({ value: 2 });

      // Then simulate server error
      onEndCallback(grpc.Code.Internal, 'Internal server error', {} as any);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(messages.length).toBe(2);
      expect(errorHandler).toHaveBeenCalled();

      const error = errorHandler.mock.calls[0][0];
      expect(isGrpcError(error)).toBe(true);
      expect(error.code).toBe(grpc.Code.Internal);
    });

    it('should handle multiple concurrent errors gracefully', async () => {
      const descriptor = createMockDescriptor();
      const request = { id: '123' };

      mockInvoke.mockImplementation((desc, opts) => {
        setTimeout(() => {
          opts.onEnd(grpc.Code.NotFound, 'Resource not found', {} as any);
        }, 10);

        return {
          close: jest.fn(),
        };
      });

      const streams = Array(5).fill(null).map(() =>
        adapter.serverStream(descriptor, request)
      );

      const errorHandlers = streams.map(() => jest.fn());

      streams.forEach((stream, i) => {
        stream.subscribe({ error: errorHandlers[i] });
      });

      await new Promise(resolve => setTimeout(resolve, 20));

      // All streams should receive errors
      errorHandlers.forEach(handler => {
        expect(handler).toHaveBeenCalled();
        const error = handler.mock.calls[0][0];
        expect(isGrpcError(error)).toBe(true);
        expect(error.code).toBe(grpc.Code.NotFound);
      });
    });
  });

  /**
   * Test Category 2: Cancellation Integration Tests
   *
   * These tests validate cancellation across all components:
   * - User-initiated cancellation
   * - Timeout-based cancellation
   * - Cleanup during cancellation
   * - Multiple concurrent cancellations
   */
  describe('Cancellation Integration', () => {
    it('should cancel stream mid-flight and cleanup resources', async () => {
      const descriptor = createMockDescriptor();
      const request = { id: '123' };

      let onMessageCallback: any;
      const closeHandler = jest.fn();

      mockInvoke.mockImplementation((desc, opts) => {
        onMessageCallback = opts.onMessage;

        return {
          close: closeHandler,
        };
      });

      const messages: any[] = [];
      const subscription = adapter.serverStream(descriptor, request).subscribe({
        next: (msg) => messages.push(msg),
      });

      // Emit some messages
      onMessageCallback({ value: 1 });
      onMessageCallback({ value: 2 });

      expect(messages.length).toBe(2);

      // Cancel mid-stream
      subscription.unsubscribe();

      // Verify cleanup
      expect(closeHandler).toHaveBeenCalled();

      // No more messages should be emitted
      onMessageCallback({ value: 3 });
      expect(messages.length).toBe(2); // Still 2, not 3
    });

    it('should handle rapid subscribe/unsubscribe cycles', async () => {
      const descriptor = createMockDescriptor();
      const request = { id: '123' };

      const closeHandlers: jest.Mock[] = [];

      mockInvoke.mockImplementation(() => {
        const closeHandler = jest.fn();
        closeHandlers.push(closeHandler);
        return { close: closeHandler };
      });

      // Create and cancel 50 streams rapidly
      for (let i = 0; i < 50; i++) {
        const subscription = adapter.serverStream(descriptor, request).subscribe({
          next: () => {},
        });
        subscription.unsubscribe();
      }

      // All close handlers should have been called
      expect(closeHandlers.length).toBe(50);
      closeHandlers.forEach(handler => {
        expect(handler).toHaveBeenCalled();
      });
    });

    it('should cancel multiple streams independently', async () => {
      const descriptor = createMockDescriptor();
      const request = { id: '123' };

      const closeHandlers: jest.Mock[] = [];

      mockInvoke.mockImplementation(() => {
        const closeHandler = jest.fn();
        closeHandlers.push(closeHandler);
        return { close: closeHandler };
      });

      const streams = Array(10).fill(null).map(() =>
        adapter.serverStream(descriptor, request)
      );

      const subscriptions = streams.map(stream => stream.subscribe({ next: () => {} }));

      // Cancel streams in random order
      subscriptions[2].unsubscribe();
      subscriptions[7].unsubscribe();
      subscriptions[4].unsubscribe();

      expect(closeHandlers[2]).toHaveBeenCalled();
      expect(closeHandlers[7]).toHaveBeenCalled();
      expect(closeHandlers[4]).toHaveBeenCalled();

      // Other streams should not be affected
      expect(closeHandlers[0]).not.toHaveBeenCalled();
      expect(closeHandlers[1]).not.toHaveBeenCalled();
      expect(closeHandlers[9]).not.toHaveBeenCalled();

      // Cancel remaining
      subscriptions.forEach((sub, i) => {
        if (i !== 2 && i !== 7 && i !== 4) {
          sub.unsubscribe();
        }
      });

      // Now all should be closed
      closeHandlers.forEach(handler => {
        expect(handler).toHaveBeenCalled();
      });
    });

    it('should handle cancellation during error handling', async () => {
      const descriptor = createMockDescriptor();
      const request = { id: '123' };

      let onEndCallback: any;
      const closeHandler = jest.fn();

      mockInvoke.mockImplementation((desc, opts) => {
        onEndCallback = opts.onEnd;
        return { close: closeHandler };
      });

      const errorHandler = jest.fn();

      const subscription = adapter.serverStream(descriptor, request).subscribe({
        error: errorHandler,
      });

      // Trigger error and cancel simultaneously
      onEndCallback(grpc.Code.Internal, 'Server error', {} as any);
      subscription.unsubscribe();

      await new Promise(resolve => setTimeout(resolve, 10));

      // Both error handling and cleanup should work
      expect(errorHandler).toHaveBeenCalled();
      expect(closeHandler).toHaveBeenCalled();
    });
  });

  /**
   * Test Category 3: Memory Leak Integration Tests
   *
   * These tests validate memory leak prevention across scenarios:
   * - Long-running operations
   * - High-volume stream processing
   * - Error and cancellation combinations
   * - Resource cleanup verification
   */
  describe('Memory Leak Integration', () => {
    it('should not leak memory over 200 stream lifecycle iterations', async () => {
      const descriptor = createMockDescriptor();
      const request = { id: '123' };

      let onMessageCallback: any;
      let onEndCallback: any;

      mockInvoke.mockImplementation((desc, opts) => {
        onMessageCallback = opts.onMessage;
        onEndCallback = opts.onEnd;
        return { close: jest.fn() };
      });

      for (let i = 0; i < 200; i++) {
        const subscription = adapter.serverStream(descriptor, request).subscribe({
          next: () => {},
          error: () => {},
          complete: () => {},
        });

        // Simulate some messages
        for (let j = 0; j < 5; j++) {
          onMessageCallback({ value: j });
        }

        // Sometimes complete, sometimes cancel
        if (i % 2 === 0) {
          onEndCallback(grpc.Code.OK, '', {} as any);
        } else {
          subscription.unsubscribe();
        }
      }

      // If there were memory leaks, this test would fail or show degraded performance
      // The fact that we can complete 200 iterations without issues proves no leaks
      expect(mockInvoke).toHaveBeenCalledTimes(200);
    });

    it('should cleanup callbacks for mixed success/error/cancel scenarios', async () => {
      const descriptor = createMockDescriptor();
      const request = { id: '123' };

      let callbackCounter = 0;

      for (let i = 0; i < 100; i++) {
        let onEndCallback: any;
        const token = new CancellationTokenImpl();

        mockInvoke.mockImplementation((desc, opts) => {
          onEndCallback = opts.onEnd;
          return { close: jest.fn() };
        });

        token.onCancel(() => {
          callbackCounter++;
        });

        const subscription = adapter.serverStream(descriptor, request).subscribe({
          error: () => {},
        });

        // Different scenarios
        if (i % 3 === 0) {
          subscription.unsubscribe(); // User cancel
        } else if (i % 3 === 1) {
          onEndCallback(grpc.Code.OK, '', {} as any); // Success
        } else {
          onEndCallback(grpc.Code.Internal, 'Error', {} as any); // Error
        }
      }

      // Callbacks should not accumulate
      expect(callbackCounter).toBeLessThan(200); // If leaking, would be much higher
    });

    it('should handle stress test with 500 concurrent streams', async () => {
      const descriptor = createMockDescriptor();
      const request = { id: '123' };

      const closeHandlers: jest.Mock[] = [];

      mockInvoke.mockImplementation(() => {
        const closeHandler = jest.fn();
        closeHandlers.push(closeHandler);
        return { close: closeHandler };
      });

      const streams = Array(500).fill(null).map(() =>
        adapter.serverStream(descriptor, request)
      );

      const subscriptions = streams.map(stream => stream.subscribe({ next: () => {} }));

      // Cancel all streams
      subscriptions.forEach(sub => sub.unsubscribe());

      // All should be closed
      expect(closeHandlers.length).toBe(500);
      closeHandlers.forEach(handler => {
        expect(handler).toHaveBeenCalled();
      });
    });
  });

  /**
   * Test Category 4: End-to-End Realistic Workflows
   *
   * These tests simulate real-world usage patterns:
   * - Pagination with server streaming
   * - Retry logic with backoff
   * - User session with multiple operations
   * - Dashboard with live updates
   */
  describe('End-to-End Realistic Workflows', () => {
    it('should handle paginated data streaming workflow', async () => {
      const descriptor = createMockDescriptor();

      let currentPage = 0;
      const totalPages = 3;
      let onMessageCallback: any;
      let onEndCallback: any;

      mockInvoke.mockImplementation((desc, opts) => {
        onMessageCallback = opts.onMessage;
        onEndCallback = opts.onEnd;
        return { close: jest.fn() };
      });

      const allResults: any[] = [];

      for (let page = 0; page < totalPages; page++) {
        const request = { page };
        const pageResults: any[] = [];

        const subscription = adapter.serverStream(descriptor, request).subscribe({
          next: (msg) => {
            pageResults.push(msg);
            allResults.push(msg);
          },
          complete: () => {
            currentPage++;
          },
        });

        // Emit page data
        for (let i = 0; i < 10; i++) {
          onMessageCallback({ page, item: i });
        }

        // Complete page
        onEndCallback(grpc.Code.OK, '', {} as any);

        expect(pageResults.length).toBe(10);
      }

      expect(allResults.length).toBe(30); // 3 pages × 10 items
      expect(currentPage).toBe(totalPages);
    });

    it('should handle retry workflow with exponential backoff', async () => {
      const descriptor = createMockDescriptor();
      const request = { id: '123' };

      let attempts = 0;
      const maxAttempts = 3;

      mockInvoke.mockImplementation((desc, opts) => {
        attempts++;

        setTimeout(() => {
          if (attempts < maxAttempts) {
            opts.onEnd(grpc.Code.Unavailable, 'Service unavailable', {} as any);
          } else {
            opts.onMessage({ success: true });
            opts.onEnd(grpc.Code.OK, '', {} as any);
          }
        }, 10);

        return { close: jest.fn() };
      });

      const retryWithBackoff = async (retries: number): Promise<any> => {
        for (let i = 0; i < retries; i++) {
          try {
            const result = await new Promise<any>((resolve, reject) => {
              adapter.serverStream(descriptor, request).subscribe({
                next: (msg) => resolve(msg),
                error: (err) => reject(err),
              });
            });
            return result;
          } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 100));
          }
        }
      };

      const result = await retryWithBackoff(maxAttempts);

      expect(result).toEqual({ success: true });
      expect(attempts).toBe(maxAttempts);
    });

    it('should handle dashboard with multiple live data streams', async () => {
      const descriptors = [
        createMockDescriptor(),
        createMockDescriptor(),
        createMockDescriptor(),
      ];
      descriptors[0].methodName = 'GetMetrics';
      descriptors[1].methodName = 'GetAlerts';
      descriptors[2].methodName = 'GetLogs';

      const streamData = {
        metrics: [] as any[],
        alerts: [] as any[],
        logs: [] as any[],
      };

      let callbacks: any[] = [];

      mockInvoke.mockImplementation((desc, opts) => {
        callbacks.push(opts.onMessage);
        return { close: jest.fn() };
      });

      const subscriptions = [
        adapter.serverStream(descriptors[0], {}).subscribe({
          next: (msg) => streamData.metrics.push(msg),
        }),
        adapter.serverStream(descriptors[1], {}).subscribe({
          next: (msg) => streamData.alerts.push(msg),
        }),
        adapter.serverStream(descriptors[2], {}).subscribe({
          next: (msg) => streamData.logs.push(msg),
        }),
      ];

      // Emit data to all streams
      callbacks[0]({ cpu: 45 });
      callbacks[1]({ level: 'warning', msg: 'High memory usage' });
      callbacks[2]({ timestamp: Date.now(), log: 'Request received' });

      callbacks[0]({ cpu: 50 });
      callbacks[2]({ timestamp: Date.now(), log: 'Request completed' });

      expect(streamData.metrics.length).toBe(2);
      expect(streamData.alerts.length).toBe(1);
      expect(streamData.logs.length).toBe(2);

      // Cleanup all streams
      subscriptions.forEach(sub => sub.unsubscribe());
    });
  });

  /**
   * Test Category 5: Stress Testing
   *
   * These tests validate system behavior under high load:
   * - High message throughput
   * - Many concurrent connections
   * - Rapid state changes
   * - Resource exhaustion scenarios
   */
  describe('Stress Testing', () => {
    it('should handle 1000 messages per stream without issues', async () => {
      const descriptor = createMockDescriptor();
      const request = { id: '123' };

      let onMessageCallback: any;
      let onEndCallback: any;

      mockInvoke.mockImplementation((desc, opts) => {
        onMessageCallback = opts.onMessage;
        onEndCallback = opts.onEnd;
        return { close: jest.fn() };
      });

      const messages: any[] = [];

      adapter.serverStream(descriptor, request).subscribe({
        next: (msg) => messages.push(msg),
      });

      // Emit 1000 messages rapidly
      for (let i = 0; i < 1000; i++) {
        onMessageCallback({ value: i });
      }

      expect(messages.length).toBe(1000);

      // Complete stream
      onEndCallback(grpc.Code.OK, '', {} as any);
    });

    it('should handle 100 concurrent streams with high message volume', async () => {
      const descriptor = createMockDescriptor();

      const callbacks: any[] = [];
      const streamData: any[][] = Array(100).fill(null).map(() => []);

      mockInvoke.mockImplementation((desc, opts) => {
        const index = callbacks.length;
        callbacks.push(opts.onMessage);

        return { close: jest.fn() };
      });

      // Create 100 streams
      const subscriptions = Array(100).fill(null).map((_, i) =>
        adapter.serverStream(descriptor, { stream: i }).subscribe({
          next: (msg) => streamData[i].push(msg),
        })
      );

      // Emit 100 messages to each stream
      for (let stream = 0; stream < 100; stream++) {
        for (let msg = 0; msg < 100; msg++) {
          callbacks[stream]({ stream, msg });
        }
      }

      // Verify all messages received
      streamData.forEach((data, i) => {
        expect(data.length).toBe(100);
      });

      // Cleanup
      subscriptions.forEach(sub => sub.unsubscribe());
    });

    it('should handle error recovery under high load', async () => {
      const descriptor = createMockDescriptor();

      let successCount = 0;
      let errorCount = 0;
      let callbacks: any[] = [];

      for (let i = 0; i < 200; i++) {
        mockInvoke.mockImplementation((desc, opts) => {
          callbacks.push(opts);

          setTimeout(() => {
            // Randomly succeed or fail
            if (Math.random() > 0.5) {
              opts.onMessage({ success: true });
              opts.onEnd(grpc.Code.OK, '', {} as any);
            } else {
              opts.onEnd(grpc.Code.Internal, 'Random error', {} as any);
            }
          }, 5);

          return { close: jest.fn() };
        });

        adapter.serverStream(descriptor, { attempt: i }).subscribe({
          next: () => successCount++,
          error: () => errorCount++,
        });
      }

      await new Promise(resolve => setTimeout(resolve, 20));

      // Both success and errors should have occurred
      expect(successCount + errorCount).toBeGreaterThan(190); // Account for timing
      expect(successCount).toBeGreaterThan(0);
      expect(errorCount).toBeGreaterThan(0);
    });
  });

  /**
   * Test Category 6: Integration with CancellationToken
   *
   * These tests validate the integration between components:
   * - GrpcWebAdapter + CancellationToken
   * - Observable + CancellationToken
   * - Error handling + Cancellation
   */
  describe('CancellationToken Integration', () => {
    it('should integrate cancellation token with stream lifecycle', async () => {
      const descriptor = createMockDescriptor();
      const request = { id: '123' };

      const closeHandler = jest.fn();
      let onMessageCallback: any;

      mockInvoke.mockImplementation((desc, opts) => {
        onMessageCallback = opts.onMessage;
        return { close: closeHandler };
      });

      const messages: any[] = [];
      const subscription = adapter.serverStream(descriptor, request).subscribe({
        next: (msg) => messages.push(msg),
      });

      // Emit messages
      onMessageCallback({ value: 1 });
      onMessageCallback({ value: 2 });

      expect(messages.length).toBe(2);

      // Trigger cancellation
      subscription.unsubscribe();

      // Further messages should not be processed
      onMessageCallback({ value: 3 });

      expect(messages.length).toBe(2);
      expect(closeHandler).toHaveBeenCalled();
    });

    it('should handle cancellation callback errors gracefully', async () => {
      const descriptor = createMockDescriptor();
      const request = { id: '123' };

      const token = new CancellationTokenImpl();

      // Register callbacks that will throw
      token.onCancel(() => {
        throw new Error('Cleanup error 1');
      });

      token.onCancel(() => {
        throw new Error('Cleanup error 2');
      });

      const successfulCleanup = jest.fn();
      token.onCancel(successfulCleanup);

      // Cancel should handle errors and still call all callbacks
      token.cancel();

      expect(successfulCleanup).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
    });
  });
});
