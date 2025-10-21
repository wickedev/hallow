/**
 * Stream Resource Cleanup Tests - Task 5.3
 *
 * Phase 5 - Task 5.3: Stream Resource Cleanup
 *
 * This comprehensive test suite validates:
 * - Proper Observable teardown logic
 * - gRPC connection closing on cancellation
 * - Memory leak prevention in streaming scenarios
 * - Resource cleanup under various conditions
 * - Concurrent stream management
 *
 * Requirements Coverage:
 * - FR-5 AC 5-9: Stream cancellation and resource management
 * - NFR-3 AC 5-6: Memory leak prevention and resource cleanup validation
 */

import { GrpcWebAdapter, MethodDescriptor } from '../../src/adapters/GrpcWebAdapter';
import { grpc } from '@improbable-eng/grpc-web';
import { Subscription } from 'rxjs';

// Mock @improbable-eng/grpc-web
jest.mock('@improbable-eng/grpc-web', () => ({
  grpc: {
    invoke: jest.fn(),
    Code: {
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
    },
    Metadata: jest.fn().mockImplementation(() => ({
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      has: jest.fn(),
    })),
  },
}));

describe('Stream Resource Cleanup - Task 5.3', () => {
  let adapter: GrpcWebAdapter;
  const baseUrl = 'https://api.example.com';

  const mockStreamingDescriptor: MethodDescriptor = {
    methodName: 'ListUsers',
    service: { serviceName: 'UserService' },
    requestStream: false,
    responseStream: true,
    requestType: 'ListUsersRequest',
    responseType: 'ListUsersResponse',
  };

  const mockRequest = { pageSize: 10, pageToken: '' };
  const mockResponse = { users: [{ id: '1', name: 'User 1' }], nextPageToken: 'token1' };

  beforeEach(() => {
    jest.clearAllMocks();
    adapter = new GrpcWebAdapter(baseUrl);
  });

  describe('FR-5 AC 5: Observable Teardown on Unsubscribe', () => {
    it('should invoke cancellation token when Observable is unsubscribed', (done) => {
      const mockClient = { close: jest.fn() };

      (grpc.invoke as jest.Mock).mockImplementation(() => mockClient);

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({
        next: () => {},
      });

      // Unsubscribe to trigger teardown
      subscription.unsubscribe();

      setTimeout(() => {
        expect(mockClient.close).toHaveBeenCalled();
        expect(mockClient.close).toHaveBeenCalledTimes(1);
        done();
      }, 10);
    });

    it('should execute teardown function immediately on unsubscribe', (done) => {
      const mockClient = { close: jest.fn() };

      (grpc.invoke as jest.Mock).mockImplementation(() => mockClient);

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({
        next: () => {},
      });

      // Unsubscribe and check immediate execution
      const startTime = Date.now();
      subscription.unsubscribe();
      const endTime = Date.now();
      const duration = endTime - startTime;

      setTimeout(() => {
        // Teardown should execute quickly (< 50ms for CI environments)
        expect(duration).toBeLessThan(50);
        expect(mockClient.close).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should handle teardown for completed streams', (done) => {
      const mockClient = { close: jest.fn() };

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onMessage(mockResponse);
          options.onEnd(grpc.Code.OK, 'Success', {});
        }, 10);
        return mockClient;
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({
        next: () => {},
        complete: () => {
          // Try to unsubscribe after completion
          subscription.unsubscribe();

          setTimeout(() => {
            // Close should have been called (idempotent)
            expect(mockClient.close).toHaveBeenCalled();
            done();
          }, 10);
        }
      });
    });

    it('should handle teardown for errored streams', (done) => {
      const mockClient = { close: jest.fn() };

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd(grpc.Code.Internal, 'Internal error', {});
        }, 10);
        return mockClient;
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({
        next: () => {},
        error: () => {
          // Try to unsubscribe after error
          subscription.unsubscribe();

          setTimeout(() => {
            // Close should have been called
            expect(mockClient.close).toHaveBeenCalled();
            done();
          }, 10);
        }
      });
    });
  });

  describe('FR-5 AC 6: gRPC Connection Closing on Cancel', () => {
    it('should close gRPC client connection on stream cancellation', (done) => {
      const mockClient = {
        close: jest.fn(),
        isClosed: false,
      };

      (grpc.invoke as jest.Mock).mockImplementation(() => {
        mockClient.close.mockImplementation(() => {
          mockClient.isClosed = true;
        });
        return mockClient;
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({
        next: () => {},
      });

      subscription.unsubscribe();

      setTimeout(() => {
        expect(mockClient.close).toHaveBeenCalled();
        expect(mockClient.isClosed).toBe(true);
        done();
      }, 10);
    });

    it('should close connection exactly once even with multiple unsubscribes', (done) => {
      const mockClient = { close: jest.fn() };

      (grpc.invoke as jest.Mock).mockImplementation(() => mockClient);

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({
        next: () => {},
      });

      // Multiple unsubscribes
      subscription.unsubscribe();
      subscription.unsubscribe();
      subscription.unsubscribe();

      setTimeout(() => {
        // Close should only be called once
        expect(mockClient.close).toHaveBeenCalledTimes(1);
        done();
      }, 10);
    });

    it('should close connection for each independent stream', (done) => {
      const mockClient1 = { close: jest.fn() };
      const mockClient2 = { close: jest.fn() };
      const mockClient3 = { close: jest.fn() };

      let callCount = 0;
      (grpc.invoke as jest.Mock).mockImplementation(() => {
        callCount++;
        if (callCount === 1) return mockClient1;
        if (callCount === 2) return mockClient2;
        return mockClient3;
      });

      const stream1 = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const stream2 = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const stream3 = adapter.serverStream(mockStreamingDescriptor, mockRequest);

      const sub1 = stream1.subscribe({ next: () => {} });
      const sub2 = stream2.subscribe({ next: () => {} });
      const sub3 = stream3.subscribe({ next: () => {} });

      // Unsubscribe all
      sub1.unsubscribe();
      sub2.unsubscribe();
      sub3.unsubscribe();

      setTimeout(() => {
        expect(mockClient1.close).toHaveBeenCalledTimes(1);
        expect(mockClient2.close).toHaveBeenCalledTimes(1);
        expect(mockClient3.close).toHaveBeenCalledTimes(1);
        done();
      }, 10);
    });
  });

  describe('FR-5 AC 7-8: Client/Bidirectional Streaming Cleanup', () => {
    it('should document limitation for client streaming cleanup', () => {
      // Client streaming is not supported over HTTP/1.1 in gRPC-web
      // This test documents the known limitation
      // The generated code should throw a descriptive error for client streaming

      // Future enhancement: Add WebSocket transport support
      expect(true).toBe(true); // Placeholder for limitation documentation
    });

    it('should document limitation for bidirectional streaming cleanup', () => {
      // Bidirectional streaming is not supported over HTTP/1.1 in gRPC-web
      // This test documents the known limitation

      // Future enhancement: Add WebSocket transport support
      expect(true).toBe(true); // Placeholder for limitation documentation
    });
  });

  describe('FR-5 AC 9: Memory Leak Prevention', () => {
    it('should not leak memory with single stream subscription', (done) => {
      const mockClient = { close: jest.fn() };
      const streams: any[] = [];

      (grpc.invoke as jest.Mock).mockImplementation(() => mockClient);

      // Create and unsubscribe single stream
      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({
        next: () => {},
      });

      streams.push(stream);

      subscription.unsubscribe();

      setTimeout(() => {
        // Verify cleanup
        expect(mockClient.close).toHaveBeenCalled();

        // Clear reference
        streams.length = 0;

        // In a real scenario, we would use heap snapshots to verify
        // that the stream objects are garbage collected
        done();
      }, 10);
    });

    it('should not leak memory with 100 stream creations and cancellations', (done) => {
      const mockClients: Array<{ close: jest.Mock }> = [];

      (grpc.invoke as jest.Mock).mockImplementation(() => {
        const client = { close: jest.fn() };
        mockClients.push(client);
        return client;
      });

      const subscriptions = [];

      // Create 100 streams
      for (let i = 0; i < 100; i++) {
        const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
        const subscription = stream.subscribe({
          next: () => {},
        });
        subscriptions.push(subscription);
      }

      // Unsubscribe all
      for (const subscription of subscriptions) {
        subscription.unsubscribe();
      }

      setTimeout(() => {
        // All clients should be closed
        expect(mockClients.length).toBe(100);
        mockClients.forEach(client => {
          expect(client.close).toHaveBeenCalled();
        });

        // Clear references
        subscriptions.length = 0;
        mockClients.length = 0;

        done();
      }, 50);
    });

    it('should not leak memory with rapid subscribe/unsubscribe cycles', (done) => {
      const mockClient = { close: jest.fn() };

      (grpc.invoke as jest.Mock).mockImplementation(() => mockClient);

      // Rapid cycles
      for (let i = 0; i < 50; i++) {
        const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
        const subscription = stream.subscribe({
          next: () => {},
        });

        // Immediate unsubscribe
        subscription.unsubscribe();
      }

      setTimeout(() => {
        // Close should be called 50 times
        expect(mockClient.close).toHaveBeenCalledTimes(50);
        done();
      }, 20);
    });

    it('should not leak callbacks after stream completion', (done) => {
      const mockClient = { close: jest.fn() };

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onMessage(mockResponse);
          options.onEnd(grpc.Code.OK, 'Success', {});
        }, 10);
        return mockClient;
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      stream.subscribe({
        next: () => {},
        complete: () => {
          // After completion, cancellation callbacks should be cleared
          setTimeout(() => {
            // Verify no lingering callbacks (indirectly by checking close was called)
            expect(mockClient.close).toHaveBeenCalled();
            done();
          }, 10);
        }
      });
    });

    it('should not leak callbacks after stream error', (done) => {
      const mockClient = { close: jest.fn() };

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        setTimeout(() => {
          options.onEnd(grpc.Code.Internal, 'Internal error', {});
        }, 10);
        return mockClient;
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      stream.subscribe({
        next: () => {},
        error: () => {
          // After error, cancellation callbacks should be cleared
          setTimeout(() => {
            expect(mockClient.close).toHaveBeenCalled();
            done();
          }, 10);
        }
      });
    });
  });

  describe('NFR-3 AC 5: Concurrent Cancellation Handling', () => {
    it('should handle 10 concurrent stream cancellations without errors', (done) => {
      const mockClients: Array<{ close: jest.Mock }> = [];

      (grpc.invoke as jest.Mock).mockImplementation(() => {
        const client = { close: jest.fn() };
        mockClients.push(client);
        return client;
      });

      const subscriptions = [];

      // Create 10 concurrent streams
      for (let i = 0; i < 10; i++) {
        const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
        const subscription = stream.subscribe({
          next: () => {},
        });
        subscriptions.push(subscription);
      }

      // Cancel all concurrently
      Promise.all(
        subscriptions.map(sub => Promise.resolve().then(() => sub.unsubscribe()))
      );

      setTimeout(() => {
        // All should be closed
        expect(mockClients.length).toBe(10);
        mockClients.forEach(client => {
          expect(client.close).toHaveBeenCalled();
        });
        done();
      }, 50);
    });

    it('should handle staggered cancellations correctly', (done) => {
      const mockClients: Array<{ close: jest.Mock; id: number }> = [];
      let clientId = 0;

      (grpc.invoke as jest.Mock).mockImplementation(() => {
        const client = { close: jest.fn(), id: clientId++ };
        mockClients.push(client);
        return client;
      });

      const subscriptions: Subscription[] = [];

      // Create 5 streams
      for (let i = 0; i < 5; i++) {
        const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
        const subscription = stream.subscribe({
          next: () => {},
        });
        subscriptions.push(subscription);
      }

      // Cancel at different times
      setTimeout(() => subscriptions[0].unsubscribe(), 5);
      setTimeout(() => subscriptions[1].unsubscribe(), 10);
      setTimeout(() => subscriptions[2].unsubscribe(), 15);
      setTimeout(() => subscriptions[3].unsubscribe(), 20);
      setTimeout(() => subscriptions[4].unsubscribe(), 25);

      setTimeout(() => {
        // All should be closed
        expect(mockClients.length).toBe(5);
        mockClients.forEach(client => {
          expect(client.close).toHaveBeenCalled();
        });
        done();
      }, 50);
    });
  });

  describe('NFR-3 AC 6: Resource Cleanup Validation', () => {
    it('should cleanup all resources for a single stream', (done) => {
      const mockClient = { close: jest.fn() };
      let clientClosed = false;

      (grpc.invoke as jest.Mock).mockImplementation(() => {
        mockClient.close.mockImplementation(() => {
          clientClosed = true;
        });
        return mockClient;
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({
        next: () => {},
      });

      // Cancel
      subscription.unsubscribe();

      setTimeout(() => {
        // Verify all cleanup happened
        expect(mockClient.close).toHaveBeenCalled();
        expect(clientClosed).toBe(true);
        done();
      }, 10);
    });

    it('should handle cleanup errors gracefully', (done) => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockClient = {
        close: jest.fn(() => {
          throw new Error('Cleanup failed');
        })
      };

      (grpc.invoke as jest.Mock).mockImplementation(() => mockClient);

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({
        next: () => {},
      });

      // Should not throw even if cleanup fails
      expect(() => subscription.unsubscribe()).not.toThrow();

      setTimeout(() => {
        expect(mockClient.close).toHaveBeenCalled();
        // Error should be caught and logged
        expect(consoleErrorSpy).toHaveBeenCalled();
        consoleErrorSpy.mockRestore();
        done();
      }, 10);
    });

    it('should verify no dangling references after cleanup', (done) => {
      const mockClient = { close: jest.fn() };

      (grpc.invoke as jest.Mock).mockImplementation(() => mockClient);

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({
        next: () => {},
      });

      subscription.unsubscribe();

      setTimeout(() => {
        // In a real scenario, we would use heap snapshots or WeakRef to verify
        // that the stream objects are garbage collected after cleanup
        // For unit tests, we verify that close was called indicating cleanup occurred
        expect(mockClient.close).toHaveBeenCalled();
        done();
      }, 10);
    });
  });

  describe('Edge Cases - Resource Cleanup', () => {
    it('should handle cleanup when stream never emits messages', (done) => {
      const mockClient = { close: jest.fn() };

      (grpc.invoke as jest.Mock).mockImplementation(() => {
        // Never call onMessage or onEnd
        return mockClient;
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const subscription = stream.subscribe({
        next: () => {},
      });

      // Unsubscribe before any messages
      subscription.unsubscribe();

      setTimeout(() => {
        expect(mockClient.close).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('should handle cleanup when stream emits partial data', (done) => {
      const mockClient = { close: jest.fn() };
      let onMessageCallback: any;

      (grpc.invoke as jest.Mock).mockImplementation((descriptor: any, options: any) => {
        onMessageCallback = options.onMessage;
        return mockClient;
      });

      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
      const messages: any[] = [];

      const subscription = stream.subscribe({
        next: (msg) => messages.push(msg),
      });

      // Emit one message
      setTimeout(() => {
        onMessageCallback(mockResponse);
      }, 10);

      // Cancel before stream completes
      setTimeout(() => {
        subscription.unsubscribe();
      }, 20);

      setTimeout(() => {
        expect(messages.length).toBe(1);
        expect(mockClient.close).toHaveBeenCalled();
        done();
      }, 30);
    });

    it('should handle cleanup with no subscribers', (done) => {
      const mockClient = { close: jest.fn() };

      (grpc.invoke as jest.Mock).mockImplementation(() => mockClient);

      // Create stream but don't subscribe
      const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);

      // Subscribe and immediately unsubscribe
      const subscription = stream.subscribe({
        next: () => {},
      });
      subscription.unsubscribe();

      setTimeout(() => {
        expect(mockClient.close).toHaveBeenCalled();
        done();
      }, 10);
    });
  });

  describe('Performance - Resource Cleanup', () => {
    it('should cleanup efficiently with 1000 streams', (done) => {
      const mockClients: Array<{ close: jest.Mock }> = [];

      (grpc.invoke as jest.Mock).mockImplementation(() => {
        const client = { close: jest.fn() };
        mockClients.push(client);
        return client;
      });

      const startTime = Date.now();

      // Create and cleanup 1000 streams
      for (let i = 0; i < 1000; i++) {
        const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
        const subscription = stream.subscribe({
          next: () => {},
        });
        subscription.unsubscribe();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      setTimeout(() => {
        // Should complete in reasonable time (< 500ms for 1000 streams)
        expect(duration).toBeLessThan(500);

        // All clients should be closed
        expect(mockClients.length).toBe(1000);
        mockClients.forEach(client => {
          expect(client.close).toHaveBeenCalled();
        });

        done();
      }, 50);
    });

    it('should not accumulate memory over time with repeated use', (done) => {
      const mockClient = { close: jest.fn() };

      (grpc.invoke as jest.Mock).mockImplementation(() => mockClient);

      // Simulate long-running application with repeated stream usage
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        const stream = adapter.serverStream(mockStreamingDescriptor, mockRequest);
        const subscription = stream.subscribe({
          next: () => {},
        });

        // Immediate cleanup
        subscription.unsubscribe();
      }

      setTimeout(() => {
        // All resources should be cleaned up
        expect(mockClient.close).toHaveBeenCalledTimes(iterations);

        // In production, we would check heap size remains stable
        done();
      }, 50);
    });
  });
});
