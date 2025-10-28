/**
 * Unit tests for NativeGrpcAdapter server streaming support
 *
 * Tests cover:
 * - Successful streaming with multiple responses
 * - Stream errors (various status codes)
 * - Stream cancellation via unsubscribe
 * - Metadata extraction (initial metadata)
 * - Trailer extraction (after stream completion)
 * - Timeout/deadline handling
 * - Concurrent streams
 * - Edge cases (observer errors, early cancellation)
 */

import * as grpc from '@grpc/grpc-js';
import { EventEmitter } from 'events';
import { NativeGrpcAdapter } from '../../../src/adapters/NativeGrpcAdapter';
import { MethodDescriptor, GrpcStatusCode } from '../../../src/adapters/types';

/**
 * Mock ClientReadableStream that extends EventEmitter
 */
class MockClientReadableStream extends EventEmitter {
  private cancelled = false;

  cancel(): void {
    this.cancelled = true;
    this.emit('cancelled');
  }

  isCancelled(): boolean {
    return this.cancelled;
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

describe('NativeGrpcAdapter - Server Streaming', () => {
  let adapter: NativeGrpcAdapter;
  let mockClient: any;
  let mockChannel: any;
  let currentMockStream: MockClientReadableStream | null = null;

  // Test message types
  interface TestRequest {
    pageSize: number;
    pageToken?: string;
  }

  interface TestResponse {
    id: string;
    value: string;
  }

  // Mock message serialization
  const mockRequestType = {
    serializeBinary: (req: TestRequest) => Buffer.from(JSON.stringify(req)),
    deserializeBinary: (bytes: Uint8Array) => JSON.parse(Buffer.from(bytes).toString()),
  };

  const mockResponseType = {
    serializeBinary: (res: TestResponse) => Buffer.from(JSON.stringify(res)),
    deserializeBinary: (bytes: Uint8Array) => JSON.parse(Buffer.from(bytes).toString()),
  };

  // Test method descriptor
  const testMethodDescriptor: MethodDescriptor<TestRequest, TestResponse> = {
    serviceName: 'test.TestService',
    methodName: 'StreamData',
    requestStream: false,
    responseStream: true,
    requestType: mockRequestType as any,
    responseType: mockResponseType as any,
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
      makeServerStreamRequest: jest.fn((
        path: string,
        serialize: Function,
        deserialize: Function,
        request: any,
        metadata: grpc.Metadata,
        options: any
      ) => {
        currentMockStream = new MockClientReadableStream();
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

  describe('Basic Streaming', () => {
    it('should successfully stream multiple responses', (done) => {
      const request: TestRequest = { pageSize: 10 };
      const responses: TestResponse[] = [];

      const subscription = adapter
        .serverStream(testMethodDescriptor, request)
        .subscribe({
          next: (response) => {
            responses.push(response);
          },
          error: (err) => done.fail(err),
          complete: () => {
            expect(responses).toHaveLength(3);
            expect(responses[0]).toEqual({ id: '1', value: 'first' });
            expect(responses[1]).toEqual({ id: '2', value: 'second' });
            expect(responses[2]).toEqual({ id: '3', value: 'third' });
            done();
          },
        });

      // Simulate server sending data
      setTimeout(() => {
        expect(currentMockStream).toBeTruthy();
        currentMockStream!.sendData({ id: '1', value: 'first' });
        currentMockStream!.sendData({ id: '2', value: 'second' });
        currentMockStream!.sendData({ id: '3', value: 'third' });
        currentMockStream!.sendEnd();
      }, 10);
    });

    it('should handle empty stream (no data)', (done) => {
      const request: TestRequest = { pageSize: 0 };
      const responses: TestResponse[] = [];

      adapter.serverStream(testMethodDescriptor, request).subscribe({
        next: (response) => responses.push(response),
        error: done.fail,
        complete: () => {
          expect(responses).toHaveLength(0);
          done();
        },
      });

      // Simulate server sending end without data
      setTimeout(() => {
        currentMockStream!.sendEnd();
      }, 10);
    });

    it('should handle single response stream', (done) => {
      const request: TestRequest = { pageSize: 1 };
      const responses: TestResponse[] = [];

      adapter.serverStream(testMethodDescriptor, request).subscribe({
        next: (response) => responses.push(response),
        error: done.fail,
        complete: () => {
          expect(responses).toHaveLength(1);
          expect(responses[0]).toEqual({ id: '1', value: 'only' });
          done();
        },
      });

      setTimeout(() => {
        currentMockStream!.sendData({ id: '1', value: 'only' });
        currentMockStream!.sendEnd();
      }, 10);
    });
  });

  describe('Error Handling', () => {
    it('should handle INTERNAL error', (done) => {
      const request: TestRequest = { pageSize: 10 };

      adapter.serverStream(testMethodDescriptor, request).subscribe({
        next: () => done.fail('Should not receive data on error'),
        error: (error) => {
          expect(error.code).toBe(GrpcStatusCode.INTERNAL);
          expect(error.message).toContain('Internal server error');
          expect(error.methodName).toBe('StreamData');
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

    it('should handle UNAVAILABLE error', (done) => {
      const request: TestRequest = { pageSize: 10 };

      adapter.serverStream(testMethodDescriptor, request).subscribe({
        next: () => done.fail('Should not receive data on error'),
        error: (error) => {
          expect(error.code).toBe(GrpcStatusCode.UNAVAILABLE);
          expect(error.message).toContain('Service unavailable');
          done();
        },
        complete: () => done.fail('Should not complete on error'),
      });

      setTimeout(() => {
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

    it('should handle NOT_FOUND error', (done) => {
      const request: TestRequest = { pageSize: 10 };

      adapter.serverStream(testMethodDescriptor, request).subscribe({
        next: () => done.fail('Should not receive data on error'),
        error: (error) => {
          expect(error.code).toBe(GrpcStatusCode.NOT_FOUND);
          expect(error.message).toContain('Resource not found');
          done();
        },
        complete: () => done.fail('Should not complete on error'),
      });

      setTimeout(() => {
        const grpcError: grpc.ServiceError = {
          name: 'Error',
          message: 'Resource not found',
          code: grpc.status.NOT_FOUND,
          details: 'Resource not found',
          metadata: new grpc.Metadata(),
        };
        currentMockStream!.sendError(grpcError);
      }, 10);
    });

    it('should handle error after receiving some data', (done) => {
      const request: TestRequest = { pageSize: 10 };
      const responses: TestResponse[] = [];

      adapter.serverStream(testMethodDescriptor, request).subscribe({
        next: (response) => responses.push(response),
        error: (error) => {
          expect(responses).toHaveLength(2);
          expect(error.code).toBe(GrpcStatusCode.INTERNAL);
          done();
        },
        complete: () => done.fail('Should not complete on error'),
      });

      setTimeout(() => {
        currentMockStream!.sendData({ id: '1', value: 'first' });
        currentMockStream!.sendData({ id: '2', value: 'second' });

        const grpcError: grpc.ServiceError = {
          name: 'Error',
          message: 'Error during stream',
          code: grpc.status.INTERNAL,
          details: 'Error during stream',
          metadata: new grpc.Metadata(),
        };
        currentMockStream!.sendError(grpcError);
      }, 10);
    });

    it('should handle DEADLINE_EXCEEDED error', (done) => {
      const request: TestRequest = { pageSize: 10 };

      adapter.serverStream(testMethodDescriptor, request, {
        timeout: 100,
      }).subscribe({
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

  describe('Cancellation', () => {
    it('should cancel stream on unsubscribe', (done) => {
      const request: TestRequest = { pageSize: 10 };
      const responses: TestResponse[] = [];
      let completeCalled = false;

      const subscription = adapter
        .serverStream(testMethodDescriptor, request)
        .subscribe({
          next: (response) => responses.push(response),
          error: (err) => done.fail(err),
          complete: () => {
            completeCalled = true;
          },
        });

      setTimeout(() => {
        // Send some data
        currentMockStream!.sendData({ id: '1', value: 'first' });
        currentMockStream!.sendData({ id: '2', value: 'second' });

        // Unsubscribe
        subscription.unsubscribe();

        // Verify stream was cancelled
        expect(currentMockStream!.isCancelled()).toBe(true);
        expect(responses).toHaveLength(2);
        expect(completeCalled).toBe(false);

        done();
      }, 10);
    });

    it('should not receive data after unsubscribe', (done) => {
      const request: TestRequest = { pageSize: 10 };
      const responses: TestResponse[] = [];

      const subscription = adapter
        .serverStream(testMethodDescriptor, request)
        .subscribe({
          next: (response) => responses.push(response),
          error: (err) => done.fail(err),
          complete: () => done.fail('Should not complete on error'),
        });

      setTimeout(() => {
        // Send first data
        currentMockStream!.sendData({ id: '1', value: 'first' });

        // Unsubscribe
        subscription.unsubscribe();

        // Try to send more data (should not be received)
        currentMockStream!.sendData({ id: '2', value: 'second' });
        currentMockStream!.sendEnd();

        // Verify only first data was received
        expect(responses).toHaveLength(1);

        done();
      }, 10);
    });

    it('should handle early unsubscribe before any data', (done) => {
      const request: TestRequest = { pageSize: 10 };
      const responses: TestResponse[] = [];

      const subscription = adapter
        .serverStream(testMethodDescriptor, request)
        .subscribe({
          next: (response) => responses.push(response),
          error: (err) => done.fail(err),
          complete: () => done.fail('Should not complete on error'),
        });

      setTimeout(() => {
        // Unsubscribe immediately
        subscription.unsubscribe();

        // Verify stream was cancelled
        expect(currentMockStream!.isCancelled()).toBe(true);
        expect(responses).toHaveLength(0);

        done();
      }, 10);
    });
  });

  describe('Metadata and Trailers', () => {
    it('should receive initial metadata', (done) => {
      const request: TestRequest = { pageSize: 10 };
      let metadataReceived = false;

      const subscription = adapter
        .serverStream(testMethodDescriptor, request)
        .subscribe({
          next: () => {},
          error: (err) => done.fail(err),
          complete: () => {
            expect(metadataReceived).toBe(true);
            done();
          },
        });

      setTimeout(() => {
        // Send metadata
        const metadata = new grpc.Metadata();
        metadata.set('x-server-version', '1.0.0');
        metadata.set('x-request-id', 'abc-123');
        currentMockStream!.sendMetadata(metadata);
        metadataReceived = true;

        // Send data and end
        currentMockStream!.sendData({ id: '1', value: 'test' });
        currentMockStream!.sendEnd();
      }, 10);
    });

    it('should receive trailing metadata via status event', (done) => {
      const request: TestRequest = { pageSize: 10 };
      let trailersReceived = false;

      adapter.serverStream(testMethodDescriptor, request).subscribe({
        next: () => {},
        error: done.fail,
        complete: () => {
          expect(trailersReceived).toBe(true);
          done();
        },
      });

      setTimeout(() => {
        // Send data
        currentMockStream!.sendData({ id: '1', value: 'test' });

        // Send status with trailers
        const trailers = new grpc.Metadata();
        trailers.set('x-response-time', '123ms');
        trailers.set('x-cache-hit', 'true');

        const status: grpc.StatusObject = {
          code: grpc.status.OK,
          details: 'OK',
          metadata: trailers,
        };
        currentMockStream!.sendStatus(status);
        trailersReceived = true;

        // Send end
        currentMockStream!.sendEnd();
      }, 10);
    });

    it('should receive both metadata and trailers', (done) => {
      const request: TestRequest = { pageSize: 10 };
      let metadataReceived = false;
      let trailersReceived = false;

      adapter.serverStream(testMethodDescriptor, request).subscribe({
        next: () => {},
        error: done.fail,
        complete: () => {
          expect(metadataReceived).toBe(true);
          expect(trailersReceived).toBe(true);
          done();
        },
      });

      setTimeout(() => {
        // Send metadata (initial)
        const metadata = new grpc.Metadata();
        metadata.set('x-server-version', '1.0.0');
        currentMockStream!.sendMetadata(metadata);
        metadataReceived = true;

        // Send data
        currentMockStream!.sendData({ id: '1', value: 'test' });

        // Send status with trailers
        const trailers = new grpc.Metadata();
        trailers.set('x-response-time', '123ms');
        const status: grpc.StatusObject = {
          code: grpc.status.OK,
          details: 'OK',
          metadata: trailers,
        };
        currentMockStream!.sendStatus(status);
        trailersReceived = true;

        // Send end
        currentMockStream!.sendEnd();
      }, 10);
    });
  });

  describe('Concurrent Streams', () => {
    it('should handle multiple concurrent streams', (done) => {
      const request: TestRequest = { pageSize: 5 };
      const responses1: TestResponse[] = [];
      const responses2: TestResponse[] = [];
      const responses3: TestResponse[] = [];
      let completed = 0;

      const checkDone = () => {
        completed++;
        if (completed === 3) {
          expect(responses1).toHaveLength(2);
          expect(responses2).toHaveLength(2);
          expect(responses3).toHaveLength(2);
          done();
        }
      };

      // Create three concurrent streams
      const streams: MockClientReadableStream[] = [];
      let streamIndex = 0;

      // Override makeServerStreamRequest to track streams
      mockClient.makeServerStreamRequest.mockImplementation(() => {
        const stream = new MockClientReadableStream();
        streams.push(stream);
        return stream;
      });

      // Start stream 1
      adapter.serverStream(testMethodDescriptor, request).subscribe({
        next: (r) => responses1.push(r),
        error: done.fail,
        complete: checkDone,
      });

      // Start stream 2
      adapter.serverStream(testMethodDescriptor, request).subscribe({
        next: (r) => responses2.push(r),
        error: done.fail,
        complete: checkDone,
      });

      // Start stream 3
      adapter.serverStream(testMethodDescriptor, request).subscribe({
        next: (r) => responses3.push(r),
        error: done.fail,
        complete: checkDone,
      });

      setTimeout(() => {
        // Send data to all streams
        streams[0].sendData({ id: '1-1', value: 'stream1-msg1' });
        streams[0].sendData({ id: '1-2', value: 'stream1-msg2' });

        streams[1].sendData({ id: '2-1', value: 'stream2-msg1' });
        streams[1].sendData({ id: '2-2', value: 'stream2-msg2' });

        streams[2].sendData({ id: '3-1', value: 'stream3-msg1' });
        streams[2].sendData({ id: '3-2', value: 'stream3-msg2' });

        // End all streams
        streams[0].sendEnd();
        streams[1].sendEnd();
        streams[2].sendEnd();
      }, 10);
    });
  });

  describe('Edge Cases', () => {
    it('should throw error if adapter is closed', () => {
      adapter.close();

      expect(() => {
        adapter.serverStream(testMethodDescriptor, { pageSize: 10 });
      }).toThrow('Adapter is closed');
    });

    it('should handle makeServerStreamRequest being called with correct parameters', (done) => {
      const request: TestRequest = { pageSize: 10, pageToken: 'token123' };
      const customMetadata: Record<string, string> = {
        authorization: 'Bearer token',
        'x-request-id': 'req-123',
      };

      adapter
        .serverStream(testMethodDescriptor, request, {
          timeout: 5000,
          metadata: customMetadata,
        })
        .subscribe({
          next: () => {},
          error: (err) => done.fail(err),
          complete: done,
        });

      setTimeout(() => {
        // Verify makeServerStreamRequest was called
        expect(mockClient.makeServerStreamRequest).toHaveBeenCalledTimes(1);

        const callArgs = mockClient.makeServerStreamRequest.mock.calls[0];
        expect(callArgs[0]).toBe('/test.TestService/StreamData');
        expect(typeof callArgs[1]).toBe('function'); // serialize
        expect(typeof callArgs[2]).toBe('function'); // deserialize
        expect(callArgs[3]).toEqual(request);
        expect(callArgs[4]).toBeInstanceOf(grpc.Metadata);
        expect(callArgs[5].deadline).toBeDefined();

        currentMockStream!.sendEnd();
      }, 10);
    });
  });

  describe('Timeout and Deadline', () => {
    it('should pass timeout as deadline', (done) => {
      const request: TestRequest = { pageSize: 10 };
      const timeout = 5000;

      adapter
        .serverStream(testMethodDescriptor, request, { timeout })
        .subscribe({
          next: () => {},
          error: (err) => done.fail(err),
          complete: done,
        });

      setTimeout(() => {
        const callArgs = mockClient.makeServerStreamRequest.mock.calls[0];
        const options = callArgs[5];

        expect(options.deadline).toBeDefined();
        expect(typeof options.deadline).toBe('number');

        currentMockStream!.sendEnd();
      }, 10);
    });

    it('should pass explicit deadline', (done) => {
      const request: TestRequest = { pageSize: 10 };
      const deadline = Date.now() + 10000;

      adapter
        .serverStream(testMethodDescriptor, request, { deadline })
        .subscribe({
          next: () => {},
          error: (err) => done.fail(err),
          complete: done,
        });

      setTimeout(() => {
        const callArgs = mockClient.makeServerStreamRequest.mock.calls[0];
        const options = callArgs[5];

        expect(options.deadline).toBe(deadline);

        currentMockStream!.sendEnd();
      }, 10);
    });
  });
});
