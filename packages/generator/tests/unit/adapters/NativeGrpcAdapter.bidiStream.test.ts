/**
 * Unit tests for NativeGrpcAdapter bidirectional streaming support
 *
 * Tests cover:
 * - Successful bidirectional streaming with concurrent send/receive
 * - Multiple messages in both directions
 * - Stream completion scenarios (client ends, server ends, both end)
 * - Error handling (various status codes)
 * - Cancellation from both sides
 * - Timeout/deadline handling
 * - Edge cases (concurrent streams, write after end, etc.)
 * - Method descriptor validation
 */

import * as grpc from '@grpc/grpc-js';
import { EventEmitter } from 'events';
import { NativeGrpcAdapter } from '../../../src/adapters/NativeGrpcAdapter';
import { MethodDescriptor, GrpcStatusCode } from '../../../src/adapters/types';
import { take } from 'rxjs/operators';

/**
 * Mock ClientDuplexStream that extends EventEmitter
 */
class MockClientDuplexStream extends EventEmitter {
  private writtenRequests: any[] = [];
  private cancelled = false;
  private ended = false;

  write(data: any): void {
    if (this.cancelled || this.ended) {
      throw new Error('Stream is not writable');
    }
    this.writtenRequests.push(data);
  }

  end(): void {
    if (!this.cancelled && !this.ended) {
      this.ended = true;
      this.emit('finish');
    }
  }

  cancel(): void {
    if (!this.cancelled) {
      this.cancelled = true;
      this.emit('cancelled');
    }
  }

  isCancelled(): boolean {
    return this.cancelled;
  }

  isEnded(): boolean {
    return this.ended;
  }

  getWrittenRequests(): any[] {
    return this.writtenRequests;
  }

  // Simulate server sending data
  sendData(data: any): void {
    if (!this.cancelled) {
      this.emit('data', data);
    }
  }

  // Simulate stream ending
  sendEnd(): void {
    if (!this.cancelled) {
      this.emit('end');
    }
  }

  // Simulate stream error
  sendError(error: grpc.ServiceError): void {
    if (!this.cancelled) {
      this.emit('error', error);
    }
  }

  // Simulate status event
  sendStatus(status: grpc.StatusObject): void {
    if (!this.cancelled) {
      this.emit('status', status);
    }
  }

  // Simulate metadata event
  sendMetadata(metadata: grpc.Metadata): void {
    if (!this.cancelled) {
      this.emit('metadata', metadata);
    }
  }
}

describe('NativeGrpcAdapter - Bidirectional Streaming', () => {
  let adapter: NativeGrpcAdapter;
  let mockClient: any;
  let mockChannel: any;
  let currentMockStream: MockClientDuplexStream | null = null;

  // Test message types
  interface TestMessage {
    content: string;
    timestamp: number;
  }

  // Mock message serialization
  const mockMessageType = {
    serializeBinary: (msg: TestMessage) => Buffer.from(JSON.stringify(msg)),
    deserializeBinary: (bytes: Uint8Array) => JSON.parse(Buffer.from(bytes).toString()),
  };

  // Test method descriptor (bidirectional streaming)
  const testMethodDescriptor: MethodDescriptor<TestMessage, TestMessage> = {
    serviceName: 'test.TestService',
    methodName: 'Chat',
    requestStream: true,
    responseStream: true,
    requestType: mockMessageType as any,
    responseType: mockMessageType as any,
  };

  beforeEach(() => {
    // Reset mock stream
    currentMockStream = null;

    // Mock grpc.Channel
    mockChannel = {
      close: jest.fn(),
    };

    // Mock grpc.Client
    mockClient = {
      close: jest.fn(),
      makeBidiStreamRequest: jest.fn((
        path: string,
        serialize: Function,
        deserialize: Function,
        metadata: grpc.Metadata,
        options: any
      ) => {
        currentMockStream = new MockClientDuplexStream();
        return currentMockStream;
      }),
    };

    // Mock grpc module constructors
    jest.spyOn(grpc, 'Channel').mockImplementation(() => mockChannel);
    jest.spyOn(grpc, 'Client').mockImplementation(() => mockClient);

    // Create adapter
    adapter = new NativeGrpcAdapter({
      serverUrl: 'localhost:50051',
      secure: false,
      debug: false,
    });
  });

  afterEach(() => {
    adapter.close();
    jest.restoreAllMocks();
  });

  describe('Basic Bidirectional Streaming', () => {
    it('should send and receive messages concurrently', (done) => {
      const call = adapter.bidiStream(testMethodDescriptor);

      expect(call.writable).toBe(true);

      const receivedMessages: TestMessage[] = [];

      // Subscribe to responses
      call.responses().subscribe({
        next: (message) => {
          receivedMessages.push(message);
        },
        error: (err) => done.fail(err),
        complete: () => {
          expect(receivedMessages).toHaveLength(3);
          expect(receivedMessages[0].content).toBe('Echo: Hello');
          expect(receivedMessages[1].content).toBe('Echo: World');
          expect(receivedMessages[2].content).toBe('Echo: Bye');
          done();
        },
      });

      // Send messages
      setTimeout(() => {
        call.write({ content: 'Hello', timestamp: Date.now() });
        currentMockStream!.sendData({ content: 'Echo: Hello', timestamp: Date.now() });

        call.write({ content: 'World', timestamp: Date.now() });
        currentMockStream!.sendData({ content: 'Echo: World', timestamp: Date.now() });

        call.write({ content: 'Bye', timestamp: Date.now() });
        call.end();

        currentMockStream!.sendData({ content: 'Echo: Bye', timestamp: Date.now() });
        currentMockStream!.sendEnd();
      }, 10);
    });

    it('should handle server sending responses before client writes', (done) => {
      const call = adapter.bidiStream(testMethodDescriptor);
      const receivedMessages: TestMessage[] = [];

      // Subscribe to responses
      call.responses().subscribe({
        next: (message) => {
          receivedMessages.push(message);
        },
        error: (err) => done.fail(err),
        complete: () => {
          expect(receivedMessages).toHaveLength(2);
          expect(receivedMessages[0].content).toBe('Welcome');
          expect(receivedMessages[1].content).toBe('Ready');
          done();
        },
      });

      // Server sends messages first
      setTimeout(() => {
        currentMockStream!.sendData({ content: 'Welcome', timestamp: Date.now() });
        currentMockStream!.sendData({ content: 'Ready', timestamp: Date.now() });
        currentMockStream!.sendEnd();
      }, 10);
    });

    it('should handle client ending while server continues sending', (done) => {
      const call = adapter.bidiStream(testMethodDescriptor);
      const receivedMessages: TestMessage[] = [];

      // Subscribe to responses
      call.responses().subscribe({
        next: (message) => {
          receivedMessages.push(message);
        },
        error: (err) => done.fail(err),
        complete: () => {
          expect(receivedMessages).toHaveLength(3);
          done();
        },
      });

      setTimeout(() => {
        // Client sends and ends
        call.write({ content: 'Request', timestamp: Date.now() });
        call.end();

        expect(call.writable).toBe(false);

        // Server continues sending
        currentMockStream!.sendData({ content: 'Response 1', timestamp: Date.now() });
        currentMockStream!.sendData({ content: 'Response 2', timestamp: Date.now() });
        currentMockStream!.sendData({ content: 'Response 3', timestamp: Date.now() });
        currentMockStream!.sendEnd();
      }, 10);
    });

    it('should handle empty stream (no messages from either side)', (done) => {
      const call = adapter.bidiStream(testMethodDescriptor);
      const receivedMessages: TestMessage[] = [];

      // Subscribe to responses
      call.responses().subscribe({
        next: (message) => receivedMessages.push(message),
        error: done.fail,
        complete: () => {
          expect(receivedMessages).toHaveLength(0);
          done();
        },
      });

      setTimeout(() => {
        call.end();
        currentMockStream!.sendEnd();
      }, 10);
    });
  });

  describe('Error Handling', () => {
    it('should handle INTERNAL error', (done) => {
      const call = adapter.bidiStream(testMethodDescriptor);

      call.responses().subscribe({
        next: () => done.fail('Should not receive data on error'),
        error: (error) => {
          expect(error.code).toBe(GrpcStatusCode.INTERNAL);
          expect(error.message).toContain('Internal server error');
          expect(error.methodName).toBe('Chat');
          done();
        },
        complete: () => done.fail('Should not complete on error'),
      });

      setTimeout(() => {
        const grpcError: grpc.ServiceError = {
          name: 'Error',
          message: 'Internal server error',
          code: grpc.status.INTERNAL,
          details: 'Internal server error',
          metadata: new grpc.Metadata(),
        };
        currentMockStream!.sendError(grpcError);
      }, 10);
    });

    it('should handle error after exchanging some messages', (done) => {
      const call = adapter.bidiStream(testMethodDescriptor);
      const receivedMessages: TestMessage[] = [];

      call.responses().subscribe({
        next: (message) => receivedMessages.push(message),
        error: (error) => {
          expect(receivedMessages).toHaveLength(2);
          expect(error.code).toBe(GrpcStatusCode.UNAVAILABLE);
          done();
        },
        complete: () => done.fail('Should not complete on error'),
      });

      setTimeout(() => {
        call.write({ content: 'Message 1', timestamp: Date.now() });
        currentMockStream!.sendData({ content: 'Echo 1', timestamp: Date.now() });

        call.write({ content: 'Message 2', timestamp: Date.now() });
        currentMockStream!.sendData({ content: 'Echo 2', timestamp: Date.now() });

        // Error occurs
        const grpcError: grpc.ServiceError = {
          name: 'Error',
          message: 'Service unavailable',
          code: grpc.status.UNAVAILABLE,
          details: 'Service unavailable',
          metadata: new grpc.Metadata(),
        };
        currentMockStream!.sendError(grpcError);
      }, 10);
    });

    it('should throw error when writing after stream is ended', () => {
      const call = adapter.bidiStream(testMethodDescriptor);

      call.write({ content: 'Hello', timestamp: Date.now() });
      call.end();

      expect(() => {
        call.write({ content: 'After end', timestamp: Date.now() });
      }).toThrow('stream is not writable');
    });

    it('should throw error when writing to cancelled stream', () => {
      const call = adapter.bidiStream(testMethodDescriptor);

      call.write({ content: 'Hello', timestamp: Date.now() });
      call.cancel();

      expect(() => {
        call.write({ content: 'After cancel', timestamp: Date.now() });
      }).toThrow('stream is not writable');
    });
  });

  describe('Cancellation', () => {
    it('should cancel stream from client side', (done) => {
      const call = adapter.bidiStream(testMethodDescriptor);
      let errorReceived = false;

      call.responses().subscribe({
        next: () => {},
        error: (error) => {
          errorReceived = true;
          expect(error.code).toBe(GrpcStatusCode.CANCELLED);
        },
        complete: () => {},
      });

      setTimeout(() => {
        call.write({ content: 'Hello', timestamp: Date.now() });

        // Cancel the stream
        call.cancel();

        expect(call.writable).toBe(false);
        expect(currentMockStream!.isCancelled()).toBe(true);

        // Give time for error to propagate
        setTimeout(() => {
          done();
        }, 20);
      }, 10);
    });

    it('should handle early cancellation (before any activity)', () => {
      const call = adapter.bidiStream(testMethodDescriptor);

      // Cancel immediately
      call.cancel();

      expect(call.writable).toBe(false);
      expect(currentMockStream!.isCancelled()).toBe(true);
    });

    it('should allow multiple cancel calls (idempotent)', () => {
      const call = adapter.bidiStream(testMethodDescriptor);

      call.cancel();
      expect(call.writable).toBe(false);

      // Second cancel should not throw
      expect(() => call.cancel()).not.toThrow();
    });

    it('should allow end after cancel (no-op)', () => {
      const call = adapter.bidiStream(testMethodDescriptor);

      call.cancel();

      // End should not throw but should be no-op
      expect(() => call.end()).not.toThrow();
    });
  });

  describe('Method Descriptor Validation', () => {
    it('should throw error for non-bidi-streaming method (unary)', () => {
      const unaryDescriptor: MethodDescriptor<TestMessage, TestMessage> = {
        ...testMethodDescriptor,
        requestStream: false,
        responseStream: false,
      };

      expect(() => {
        adapter.bidiStream(unaryDescriptor);
      }).toThrow('is not a bidirectional streaming RPC');
    });

    it('should throw error for server streaming method', () => {
      const serverStreamDescriptor: MethodDescriptor<TestMessage, TestMessage> = {
        ...testMethodDescriptor,
        requestStream: false,
        responseStream: true,
      };

      expect(() => {
        adapter.bidiStream(serverStreamDescriptor);
      }).toThrow('is not a bidirectional streaming RPC');
    });

    it('should throw error for client streaming method', () => {
      const clientStreamDescriptor: MethodDescriptor<TestMessage, TestMessage> = {
        ...testMethodDescriptor,
        requestStream: true,
        responseStream: false,
      };

      expect(() => {
        adapter.bidiStream(clientStreamDescriptor);
      }).toThrow('is not a bidirectional streaming RPC');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle rapid concurrent send/receive', (done) => {
      const call = adapter.bidiStream(testMethodDescriptor);
      const receivedMessages: TestMessage[] = [];
      const messageCount = 50;

      call.responses().subscribe({
        next: (message) => receivedMessages.push(message),
        error: done.fail,
        complete: () => {
          expect(receivedMessages).toHaveLength(messageCount);
          expect(currentMockStream!.getWrittenRequests()).toHaveLength(messageCount);
          done();
        },
      });

      setTimeout(() => {
        // Send and receive messages concurrently
        for (let i = 0; i < messageCount; i++) {
          call.write({ content: `Message ${i}`, timestamp: Date.now() });
          currentMockStream!.sendData({ content: `Echo ${i}`, timestamp: Date.now() });
        }

        call.end();
        currentMockStream!.sendEnd();
      }, 10);
    });

    it('should maintain writable state correctly during operations', () => {
      const call = adapter.bidiStream(testMethodDescriptor);

      expect(call.writable).toBe(true);

      call.write({ content: 'Message 1', timestamp: Date.now() });
      expect(call.writable).toBe(true);

      call.write({ content: 'Message 2', timestamp: Date.now() });
      expect(call.writable).toBe(true);

      call.end();
      expect(call.writable).toBe(false);
    });
  });

  describe('Multiple Subscriptions', () => {
    it('should support multiple subscribers to responses', (done) => {
      const call = adapter.bidiStream(testMethodDescriptor);
      const received1: TestMessage[] = [];
      const received2: TestMessage[] = [];
      let completed = 0;

      const checkDone = () => {
        completed++;
        if (completed === 2) {
          expect(received1).toHaveLength(2);
          expect(received2).toHaveLength(2);
          expect(received1[0].content).toBe(received2[0].content);
          expect(received1[1].content).toBe(received2[1].content);
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
        currentMockStream!.sendData({ content: 'Message 1', timestamp: Date.now() });
        currentMockStream!.sendData({ content: 'Message 2', timestamp: Date.now() });
        currentMockStream!.sendEnd();
      }, 10);
    });

    it('should return same Observable instance on multiple responses() calls', () => {
      const call = adapter.bidiStream(testMethodDescriptor);

      const obs1 = call.responses();
      const obs2 = call.responses();

      expect(obs1).toBe(obs2);
    });
  });

  describe('Timeout and Deadline', () => {
    it('should pass timeout as deadline', () => {
      const timeout = 5000;

      adapter.bidiStream(testMethodDescriptor, { timeout });

      expect(mockClient.makeBidiStreamRequest).toHaveBeenCalledTimes(1);

      const callArgs = mockClient.makeBidiStreamRequest.mock.calls[0];
      const options = callArgs[4];

      expect(options.deadline).toBeDefined();
      expect(typeof options.deadline).toBe('number');
    });

    it('should pass explicit deadline', () => {
      const deadline = Date.now() + 10000;

      adapter.bidiStream(testMethodDescriptor, { deadline });

      const callArgs = mockClient.makeBidiStreamRequest.mock.calls[0];
      const options = callArgs[4];

      expect(options.deadline).toBe(deadline);
    });

    it('should handle DEADLINE_EXCEEDED error', (done) => {
      const call = adapter.bidiStream(testMethodDescriptor, { timeout: 100 });

      call.responses().subscribe({
        next: () => done.fail('Should not receive data on error'),
        error: (error) => {
          expect(error.code).toBe(GrpcStatusCode.DEADLINE_EXCEEDED);
          done();
        },
        complete: () => done.fail('Should not complete on error'),
      });

      setTimeout(() => {
        const grpcError: grpc.ServiceError = {
          name: 'Error',
          message: 'Deadline exceeded',
          code: grpc.status.DEADLINE_EXCEEDED,
          details: 'Deadline exceeded',
          metadata: new grpc.Metadata(),
        };
        currentMockStream!.sendError(grpcError);
      }, 10);
    });
  });

  describe('Edge Cases', () => {
    it('should throw error if adapter is closed', () => {
      adapter.close();

      expect(() => {
        adapter.bidiStream(testMethodDescriptor);
      }).toThrow('Adapter is closed');
    });

    it('should handle makeBidiStreamRequest being called with correct parameters', () => {
      const customMetadata: Record<string, string> = {
        authorization: 'Bearer token',
        'x-request-id': 'req-123',
      };

      adapter.bidiStream(testMethodDescriptor, {
        timeout: 5000,
        metadata: customMetadata,
      });

      expect(mockClient.makeBidiStreamRequest).toHaveBeenCalledTimes(1);

      const callArgs = mockClient.makeBidiStreamRequest.mock.calls[0];
      expect(callArgs[0]).toBe('/test.TestService/Chat');
      expect(typeof callArgs[1]).toBe('function'); // serialize
      expect(typeof callArgs[2]).toBe('function'); // deserialize
      expect(callArgs[3]).toBeInstanceOf(grpc.Metadata);
      expect(callArgs[4].deadline).toBeDefined();
    });
  });

  describe('Metadata and Status', () => {
    it('should receive initial metadata', (done) => {
      const call = adapter.bidiStream(testMethodDescriptor);
      let metadataReceived = false;

      call.responses().subscribe({
        next: () => {},
        error: done.fail,
        complete: () => {
          expect(metadataReceived).toBe(true);
          done();
        },
      });

      setTimeout(() => {
        const metadata = new grpc.Metadata();
        metadata.set('x-server-version', '1.0.0');
        currentMockStream!.sendMetadata(metadata);
        metadataReceived = true;

        currentMockStream!.sendData({ content: 'Test', timestamp: Date.now() });
        currentMockStream!.sendEnd();
      }, 10);
    });

    it('should receive status with trailers', (done) => {
      const call = adapter.bidiStream(testMethodDescriptor);
      let statusReceived = false;

      call.responses().subscribe({
        next: () => {},
        error: done.fail,
        complete: () => {
          expect(statusReceived).toBe(true);
          done();
        },
      });

      setTimeout(() => {
        currentMockStream!.sendData({ content: 'Test', timestamp: Date.now() });

        const trailers = new grpc.Metadata();
        trailers.set('x-response-time', '123ms');
        const status: grpc.StatusObject = {
          code: grpc.status.OK,
          details: 'OK',
          metadata: trailers,
        };
        currentMockStream!.sendStatus(status);
        statusReceived = true;

        currentMockStream!.sendEnd();
      }, 10);
    });
  });
});
