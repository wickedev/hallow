/**
 * Integration tests for NativeGrpcAdapter bidirectional streaming
 *
 * Tests the adapter against a real NativeGrpcTestServer to verify
 * end-to-end functionality of bidirectional streaming RPCs.
 *
 * Tests cover:
 * - Concurrent send and receive operations
 * - Chat-like interactions
 * - Client and server ending scenarios
 * - Error handling with real server
 * - Cancellation and timeout
 * - Multiple concurrent streams
 */

import { NativeGrpcAdapter } from '../../src/adapters/NativeGrpcAdapter';
import { MethodDescriptor, GrpcStatusCode } from '../../src/adapters/types';
import { NativeGrpcTestServer } from '@hallow/test-server';

describe('NativeGrpcAdapter - Bidirectional Streaming Integration', () => {
  let server: NativeGrpcTestServer;
  let adapter: NativeGrpcAdapter;

  // Test message types matching proto definitions
  interface StreamMessage {
    content: string;
    timestamp: number;
  }

  // Mock message serialization (would be generated from proto)
  const mockStreamMessageType = {
    serializeBinary: (msg: StreamMessage) => Buffer.from(JSON.stringify(msg)),
    deserializeBinary: (bytes: Uint8Array) => JSON.parse(Buffer.from(bytes).toString()),
  };

  // Method descriptor for Chat (bidirectional streaming)
  const chatDescriptor: MethodDescriptor<StreamMessage, StreamMessage> = {
    serviceName: 'test.services.UserService',
    methodName: 'Chat',
    requestStream: true,
    responseStream: true,
    requestType: mockStreamMessageType as any,
    responseType: mockStreamMessageType as any,
  };

  beforeAll(async () => {
    // Start test server
    server = new NativeGrpcTestServer({
      port: 50053,
      host: '127.0.0.1',
      debug: false,
    });

    await server.start();
  });

  afterAll(async () => {
    // Stop test server
    await server.stop();
  });

  beforeEach(() => {
    // Create adapter for each test
    adapter = new NativeGrpcAdapter({
      serverUrl: '127.0.0.1:50053',
      secure: false,
      debug: false,
      retryConfig: false, // Disable retries for predictable tests
    });
  });

  afterEach(() => {
    // Clean up adapter
    adapter.close();
  });

  describe('Basic Bidirectional Streaming', () => {
    it('should exchange messages in both directions', (done) => {
      const call = adapter.bidiStream(chatDescriptor);
      const receivedMessages: StreamMessage[] = [];

      // Subscribe to responses
      call.responses().subscribe({
        next: (message) => {
          receivedMessages.push(message);
        },
        error: (err) => done.fail(err),
        complete: () => {
          // Verify received messages
          expect(receivedMessages.length).toBeGreaterThanOrEqual(3);
          expect(receivedMessages[0].content).toBe('Echo: Hello');
          expect(receivedMessages[1].content).toBe('Echo: World');
          expect(receivedMessages[2].content).toBe('Echo: Goodbye');

          // Last message should be the end message
          const lastMessage = receivedMessages[receivedMessages.length - 1];
          expect(lastMessage.content).toBe('Chat session ended');

          done();
        },
      });

      // Send messages
      setTimeout(() => {
        call.write({ content: 'Hello', timestamp: Date.now() });
      }, 50);

      setTimeout(() => {
        call.write({ content: 'World', timestamp: Date.now() });
      }, 100);

      setTimeout(() => {
        call.write({ content: 'Goodbye', timestamp: Date.now() });
      }, 150);

      setTimeout(() => {
        call.end();
      }, 200);
    }, 10000);

    it('should handle rapid message exchange', (done) => {
      const call = adapter.bidiStream(chatDescriptor);
      const receivedMessages: StreamMessage[] = [];
      const messagesToSend = 10;

      // Subscribe to responses
      call.responses().subscribe({
        next: (message) => {
          receivedMessages.push(message);
        },
        error: (err) => done.fail(err),
        complete: () => {
          // Should receive echo for each message plus end message
          expect(receivedMessages.length).toBeGreaterThanOrEqual(messagesToSend);

          // Verify echoes
          for (let i = 0; i < messagesToSend; i++) {
            expect(receivedMessages[i].content).toBe(`Echo: Message ${i}`);
          }

          done();
        },
      });

      // Send messages rapidly
      setTimeout(() => {
        for (let i = 0; i < messagesToSend; i++) {
          call.write({ content: `Message ${i}`, timestamp: Date.now() });
        }
        call.end();
      }, 10);
    }, 10000);

    it('should handle client ending while receiving responses', (done) => {
      const call = adapter.bidiStream(chatDescriptor);
      const receivedMessages: StreamMessage[] = [];

      // Subscribe to responses
      call.responses().subscribe({
        next: (message) => {
          receivedMessages.push(message);
        },
        error: (err) => done.fail(err),
        complete: () => {
          // Should receive echoes and end message
          expect(receivedMessages.length).toBeGreaterThanOrEqual(2);
          expect(receivedMessages[0].content).toBe('Echo: Start');

          done();
        },
      });

      // Send and end quickly
      setTimeout(() => {
        call.write({ content: 'Start', timestamp: Date.now() });
        call.end();
      }, 10);
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle server error during streaming', (done) => {
      const call = adapter.bidiStream(chatDescriptor);
      const receivedMessages: StreamMessage[] = [];

      call.responses().subscribe({
        next: (message) => {
          receivedMessages.push(message);
        },
        error: (error) => {
          // Should receive INTERNAL error
          expect(error.code).toBe(GrpcStatusCode.INTERNAL);
          expect(error.message).toContain('internal error');
          done();
        },
        complete: () => done.fail('Should not complete on error'),
      });

      setTimeout(() => {
        call.write({ content: 'Hello', timestamp: Date.now() });

        // Send message that triggers error
        setTimeout(() => {
          call.write({ content: 'error-internal', timestamp: Date.now() });
        }, 50);
      }, 10);
    }, 10000);

    it('should handle UNAVAILABLE error', (done) => {
      const call = adapter.bidiStream(chatDescriptor);

      call.responses().subscribe({
        next: () => {},
        error: (error) => {
          expect(error.code).toBe(GrpcStatusCode.UNAVAILABLE);
          done();
        },
        complete: () => done.fail('Should not complete on error'),
      });

      setTimeout(() => {
        call.write({ content: 'error-unavailable', timestamp: Date.now() });
      }, 10);
    }, 10000);

    it('should handle connection failure', (done) => {
      // Create adapter with wrong port
      const badAdapter = new NativeGrpcAdapter({
        serverUrl: '127.0.0.1:60001',
        secure: false,
        debug: false,
        retryConfig: false,
      });

      try {
        const call = badAdapter.bidiStream(chatDescriptor);

        call.responses().subscribe({
          next: () => {},
          error: (error) => {
            expect(error.code).toBe(GrpcStatusCode.UNAVAILABLE);
            badAdapter.close();
            done();
          },
          complete: () => done.fail('Should not complete on error'),
        });

        setTimeout(() => {
          call.write({ content: 'Hello', timestamp: Date.now() });
        }, 10);
      } catch (error) {
        badAdapter.close();
        done.fail(error);
      }
    }, 10000);
  });

  describe('Cancellation', () => {
    it('should cancel bidirectional stream', (done) => {
      const call = adapter.bidiStream(chatDescriptor);
      const receivedMessages: StreamMessage[] = [];

      call.responses().subscribe({
        next: (message) => {
          receivedMessages.push(message);
        },
        error: (error) => {
          // Should receive CANCELLED error
          expect(error.code).toBe(GrpcStatusCode.CANCELLED);
          done();
        },
        complete: () => done.fail('Should not complete on cancel'),
      });

      setTimeout(() => {
        call.write({ content: 'Hello', timestamp: Date.now() });

        // Cancel after a short delay
        setTimeout(() => {
          call.cancel();
        }, 50);
      }, 10);
    }, 10000);

    it('should not allow writes after cancellation', () => {
      const call = adapter.bidiStream(chatDescriptor);

      call.write({ content: 'Hello', timestamp: Date.now() });
      call.cancel();

      // Should throw when trying to write after cancel
      expect(() => {
        call.write({ content: 'After cancel', timestamp: Date.now() });
      }).toThrow('not writable');
    });
  });

  describe('Timeout Handling', () => {
    it('should handle timeout during streaming', (done) => {
      const timeoutAdapter = new NativeGrpcAdapter({
        serverUrl: '127.0.0.1:50053',
        secure: false,
        debug: false,
        retryConfig: false,
      });

      try {
        const call = timeoutAdapter.bidiStream(chatDescriptor, {
          timeout: 50, // 50ms timeout
        });

        call.responses().subscribe({
          next: () => {},
          error: (error) => {
            expect(error.code).toBe(GrpcStatusCode.DEADLINE_EXCEEDED);
            timeoutAdapter.close();
            done();
          },
          complete: () => done.fail('Should not complete on timeout'),
        });

        // Send messages but wait longer than timeout before ending
        setTimeout(() => {
          call.write({ content: 'Hello', timestamp: Date.now() });
        }, 10);

        // Wait past timeout
        setTimeout(() => {
          call.write({ content: 'Late message', timestamp: Date.now() });
        }, 100);
      } catch (error) {
        timeoutAdapter.close();
        done.fail(error);
      }
    }, 10000);
  });

  describe('Multiple Streams', () => {
    it('should handle multiple sequential bidirectional streams', (done) => {
      let completedStreams = 0;

      const runStream = (messageContent: string) => {
        return new Promise<void>((resolve, reject) => {
          const call = adapter.bidiStream(chatDescriptor);
          const received: StreamMessage[] = [];

          call.responses().subscribe({
            next: (msg) => received.push(msg),
            error: reject,
            complete: () => {
              expect(received.length).toBeGreaterThanOrEqual(1);
              expect(received[0].content).toBe(`Echo: ${messageContent}`);
              resolve();
            },
          });

          setTimeout(() => {
            call.write({ content: messageContent, timestamp: Date.now() });
            call.end();
          }, 10);
        });
      };

      // Run three streams sequentially
      runStream('First')
        .then(() => runStream('Second'))
        .then(() => runStream('Third'))
        .then(() => done())
        .catch(done.fail);
    }, 10000);

    it('should handle multiple concurrent bidirectional streams', (done) => {
      const streams = 3;
      let completedStreams = 0;
      const allReceived: Array<StreamMessage[]> = [[], [], []];

      for (let i = 0; i < streams; i++) {
        const call = adapter.bidiStream(chatDescriptor);

        call.responses().subscribe({
          next: (message) => {
            allReceived[i].push(message);
          },
          error: (err) => done.fail(err),
          complete: () => {
            completedStreams++;
            if (completedStreams === streams) {
              // Verify all streams received messages
              for (let j = 0; j < streams; j++) {
                expect(allReceived[j].length).toBeGreaterThanOrEqual(1);
              }
              done();
            }
          },
        });

        setTimeout(() => {
          call.write({ content: `Stream ${i}`, timestamp: Date.now() });
          call.end();
        }, 10);
      }
    }, 10000);
  });

  describe('Multiple Subscriptions', () => {
    it('should support multiple subscribers to same stream', (done) => {
      const call = adapter.bidiStream(chatDescriptor);
      const received1: StreamMessage[] = [];
      const received2: StreamMessage[] = [];
      let completed = 0;

      const checkDone = () => {
        completed++;
        if (completed === 2) {
          expect(received1.length).toBeGreaterThanOrEqual(1);
          expect(received2.length).toBeGreaterThanOrEqual(1);
          expect(received1[0].content).toBe(received2[0].content);
          done();
        }
      };

      // First subscriber
      call.responses().subscribe({
        next: (msg) => received1.push(msg),
        error: done.fail,
        complete: checkDone,
      });

      // Second subscriber
      call.responses().subscribe({
        next: (msg) => received2.push(msg),
        error: done.fail,
        complete: checkDone,
      });

      setTimeout(() => {
        call.write({ content: 'Test', timestamp: Date.now() });
        call.end();
      }, 10);
    }, 10000);
  });

  describe('Metadata', () => {
    it('should send custom metadata with bidirectional streaming call', (done) => {
      const metadata = {
        'authorization': 'Bearer test-token',
        'x-request-id': 'test-123',
      };

      const call = adapter.bidiStream(chatDescriptor, { metadata });
      const receivedMessages: StreamMessage[] = [];

      call.responses().subscribe({
        next: (message) => receivedMessages.push(message),
        error: done.fail,
        complete: () => {
          expect(receivedMessages.length).toBeGreaterThanOrEqual(1);
          done();
        },
      });

      setTimeout(() => {
        call.write({ content: 'Hello', timestamp: Date.now() });
        call.end();
      }, 10);
    }, 10000);
  });

  describe('Edge Cases', () => {
    it('should throw error when writing after end', () => {
      const call = adapter.bidiStream(chatDescriptor);

      call.write({ content: 'Hello', timestamp: Date.now() });
      call.end();

      expect(() => {
        call.write({ content: 'After end', timestamp: Date.now() });
      }).toThrow('not writable');
    });

    it('should allow multiple end calls (idempotent)', () => {
      const call = adapter.bidiStream(chatDescriptor);

      call.write({ content: 'Hello', timestamp: Date.now() });
      call.end();

      // Second end should not throw
      expect(() => call.end()).not.toThrow();
    });

    it('should handle empty stream (no messages)', (done) => {
      const call = adapter.bidiStream(chatDescriptor);
      const receivedMessages: StreamMessage[] = [];

      call.responses().subscribe({
        next: (message) => receivedMessages.push(message),
        error: done.fail,
        complete: () => {
          // Should receive end message only
          expect(receivedMessages.length).toBeGreaterThanOrEqual(1);
          expect(receivedMessages[receivedMessages.length - 1].content).toBe('Chat session ended');
          done();
        },
      });

      setTimeout(() => {
        call.end();
      }, 10);
    }, 10000);
  });
});
