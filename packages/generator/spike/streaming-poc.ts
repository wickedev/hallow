/**
 * Spike: Native gRPC Server Streaming Proof of Concept
 *
 * This spike validates server streaming implementation using @grpc/grpc-js
 * with RxJS Observable wrapper for consistent API with GrpcWebAdapter.
 *
 * Key Findings:
 * - @grpc/grpc-js provides excellent streaming support via ClientReadableStream
 * - Observable wrapper integrates seamlessly with existing patterns
 * - Cancellation is straightforward via stream.cancel()
 * - Error handling works well with RxJS error propagation
 * - Resource cleanup is critical - must handle both completion and cancellation
 */

import * as grpc from '@grpc/grpc-js';
import { Observable, Subscriber } from 'rxjs';

/**
 * Message type interface for serialization/deserialization
 */
interface MessageType<T> {
  deserializeBinary(bytes: Uint8Array): T;
  serializeBinary(message: T): Uint8Array;
}

/**
 * Method descriptor for native gRPC calls
 */
interface MethodDescriptor<TRequest, TResponse> {
  serviceName: string;
  methodName: string;
  requestStream: boolean;
  responseStream: boolean;
  requestType: MessageType<TRequest>;
  responseType: MessageType<TResponse>;
}

/**
 * Call options for RPC methods
 */
interface CallOptions {
  timeout?: number;
  metadata?: Record<string, string>;
  deadline?: Date;
}

/**
 * Spike implementation of server streaming RPC using @grpc/grpc-js
 *
 * This demonstrates:
 * 1. Server streaming via ClientReadableStream
 * 2. Observable wrapper for consistent API
 * 3. Stream event handling (data, end, error, status)
 * 4. Cancellation and cleanup
 * 5. Metadata access (initial and trailing)
 * 6. Error propagation through Observable
 */
class NativeGrpcStreamingSpike {
  private channel: grpc.Channel;
  private client: grpc.Client;

  constructor(
    serverAddress: string,
    credentials: grpc.ChannelCredentials = grpc.credentials.createInsecure()
  ) {
    this.channel = new grpc.Channel(serverAddress, credentials, {
      'grpc.max_receive_message_length': -1,
      'grpc.max_send_message_length': -1,
    });

    this.client = new grpc.Client(serverAddress, credentials, {});
  }

  /**
   * Execute a server streaming RPC call
   *
   * Key observations:
   * - makeServerStreamRequest returns ClientReadableStream
   * - Stream emits 'data' events for each response
   * - Stream emits 'end' event when complete
   * - Stream emits 'error' event on failure
   * - Stream emits 'status' event with final status and metadata
   * - Observable wrapper provides clean subscription API
   * - Unsubscribe automatically cancels the stream
   */
  serverStream<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    request: TRequest,
    options?: CallOptions
  ): Observable<TResponse> {
    return new Observable<TResponse>((observer: Subscriber<TResponse>) => {
      // Construct full method path
      const methodPath = `/${method.serviceName}/${method.methodName}`;

      // Create metadata
      const metadata = this.createMetadata(options?.metadata);

      // Calculate deadline
      let deadline: grpc.Deadline | undefined;
      if (options?.timeout) {
        deadline = Date.now() + options.timeout;
      } else if (options?.deadline) {
        deadline = options.deadline.getTime();
      }

      // Serialization function
      const serialize = (value: TRequest): Buffer => {
        const bytes = method.requestType.serializeBinary(value as any);
        return Buffer.from(bytes);
      };

      // Deserialization function
      const deserialize = (bytes: Buffer): TResponse => {
        return method.responseType.deserializeBinary(new Uint8Array(bytes));
      };

      // Make server streaming call
      const stream = this.client.makeServerStreamRequest(
        methodPath,
        serialize,
        deserialize,
        request,
        metadata,
        { deadline }
      );

      // Track if we've received initial metadata
      let initialMetadataReceived = false;

      /**
       * Handle 'data' events - emitted for each response message
       *
       * Observation: This is called for every message the server sends
       */
      stream.on('data', (response: TResponse) => {
        try {
          observer.next(response);
        } catch (error) {
          // If observer.next throws, we should cancel and error
          console.error('Error in observer.next:', error);
          stream.cancel();
          observer.error(error);
        }
      });

      /**
       * Handle 'end' events - stream completed successfully
       *
       * Observation: Called when server closes the stream normally
       */
      stream.on('end', () => {
        observer.complete();
      });

      /**
       * Handle 'error' events - stream failed
       *
       * Observation: Called when an error occurs before or during streaming
       */
      stream.on('error', (error: grpc.ServiceError) => {
        observer.error(this.convertError(error, method.methodName));
      });

      /**
       * Handle 'status' events - final status and trailing metadata
       *
       * Observation:
       * - Always emitted at the end (success or failure)
       * - Contains trailing metadata
       * - Provides final status code
       */
      stream.on('status', (status: grpc.StatusObject) => {
        // Status event provides final status code and trailing metadata
        // We can store this for access via getTrailers() method
        // For this spike, we just log it
        if (status.code !== grpc.status.OK) {
          // Error status - will also trigger 'error' event
          console.log('Stream ended with error status:', status);
        }
      });

      /**
       * Handle 'metadata' events - initial metadata received
       *
       * Observation:
       * - Emitted when server sends initial metadata (headers)
       * - Happens before any data events
       * - Useful for server-sent headers (authentication tokens, etc.)
       */
      stream.on('metadata', (metadata: grpc.Metadata) => {
        initialMetadataReceived = true;
        // Store for access via getMetadata() method
        // For this spike, we just log it
        console.log('Initial metadata received:', metadata.getMap());
      });

      /**
       * Cleanup function - called when Observable is unsubscribed
       *
       * Key observation:
       * - Must cancel stream to stop receiving data
       * - Prevents memory leaks
       * - Server is notified of cancellation
       * - Critical for proper resource management
       */
      return () => {
        // Cancel the stream if still active
        // This notifies the server that client is no longer interested
        stream.cancel();
      };
    });
  }

  /**
   * Create gRPC metadata from plain object
   */
  private createMetadata(
    metadataObj?: Record<string, string>
  ): grpc.Metadata {
    const metadata = new grpc.Metadata();

    if (metadataObj) {
      for (const [key, value] of Object.entries(metadataObj)) {
        metadata.set(key, value);
      }
    }

    return metadata;
  }

  /**
   * Convert native gRPC error to our error format
   */
  private convertError(error: grpc.ServiceError, methodName: string): Error {
    const statusCode = error.code ?? grpc.status.UNKNOWN;
    const message = error.message || error.details || 'Unknown error';

    const grpcError = new Error(
      `gRPC ${methodName} failed: ${message} (code: ${this.getStatusName(statusCode)})`
    );

    (grpcError as any).code = statusCode;
    (grpcError as any).metadata = error.metadata;
    (grpcError as any).methodName = methodName;

    return grpcError;
  }

  /**
   * Get human-readable status code name
   */
  private getStatusName(code: grpc.status): string {
    const statusNames: Record<number, string> = {
      [grpc.status.OK]: 'OK',
      [grpc.status.CANCELLED]: 'CANCELLED',
      [grpc.status.UNKNOWN]: 'UNKNOWN',
      [grpc.status.INVALID_ARGUMENT]: 'INVALID_ARGUMENT',
      [grpc.status.DEADLINE_EXCEEDED]: 'DEADLINE_EXCEEDED',
      [grpc.status.NOT_FOUND]: 'NOT_FOUND',
      [grpc.status.ALREADY_EXISTS]: 'ALREADY_EXISTS',
      [grpc.status.PERMISSION_DENIED]: 'PERMISSION_DENIED',
      [grpc.status.RESOURCE_EXHAUSTED]: 'RESOURCE_EXHAUSTED',
      [grpc.status.FAILED_PRECONDITION]: 'FAILED_PRECONDITION',
      [grpc.status.ABORTED]: 'ABORTED',
      [grpc.status.OUT_OF_RANGE]: 'OUT_OF_RANGE',
      [grpc.status.UNIMPLEMENTED]: 'UNIMPLEMENTED',
      [grpc.status.INTERNAL]: 'INTERNAL',
      [grpc.status.UNAVAILABLE]: 'UNAVAILABLE',
      [grpc.status.DATA_LOSS]: 'DATA_LOSS',
      [grpc.status.UNAUTHENTICATED]: 'UNAUTHENTICATED',
    };

    return statusNames[code] || `UNKNOWN(${code})`;
  }

  /**
   * Close the client and channel
   */
  close(): void {
    this.client.close();
    this.channel.close();
  }
}

/**
 * Example usage (commented out - for reference only)
 */
/*
interface ListUsersRequest {
  pageSize: number;
  pageToken?: string;
}

interface User {
  userId: string;
  name: string;
  email: string;
}

const listUsersMethod: MethodDescriptor<ListUsersRequest, User> = {
  serviceName: 'user.UserService',
  methodName: 'ListUsers',
  requestStream: false,
  responseStream: true,
  requestType: {
    serializeBinary: (msg: ListUsersRequest) => new Uint8Array(),
    deserializeBinary: (bytes: Uint8Array) => ({ pageSize: 0 }),
  },
  responseType: {
    serializeBinary: (msg: User) => new Uint8Array(),
    deserializeBinary: (bytes: Uint8Array) => ({
      userId: '',
      name: '',
      email: '',
    }),
  },
};

async function streamingExample() {
  const spike = new NativeGrpcStreamingSpike('localhost:50051');

  const users: User[] = [];

  const subscription = spike
    .serverStream(listUsersMethod, { pageSize: 10 })
    .subscribe({
      next: (user) => {
        console.log('Received user:', user);
        users.push(user);
      },
      error: (error) => {
        console.error('Stream error:', error);
      },
      complete: () => {
        console.log('Stream complete. Total users:', users.length);
        spike.close();
      },
    });

  // Example: Cancel after 5 seconds
  setTimeout(() => {
    console.log('Cancelling stream...');
    subscription.unsubscribe();
    spike.close();
  }, 5000);
}
*/

/**
 * Key Takeaways for Full Implementation:
 *
 * 1. Stream Lifecycle:
 *    - 'metadata' event: Initial metadata (headers) from server
 *    - 'data' events: Each response message
 *    - 'status' event: Final status and trailing metadata
 *    - 'end' event: Stream completed successfully
 *    - 'error' event: Stream failed
 *
 * 2. Observable Integration:
 *    - Observable provides clean RxJS API
 *    - Subscriber.next() for each data event
 *    - Subscriber.error() for error events
 *    - Subscriber.complete() for end event
 *    - Unsubscribe triggers stream.cancel()
 *
 * 3. Cancellation:
 *    - stream.cancel() notifies server
 *    - Must be called in teardown function
 *    - Prevents resource leaks
 *    - Server receives CANCELLED status
 *
 * 4. Error Handling:
 *    - Errors during streaming propagate via 'error' event
 *    - Status codes indicate error type
 *    - Metadata contains error details
 *    - Observer errors are handled gracefully
 *
 * 5. Metadata Access:
 *    - Initial metadata via 'metadata' event
 *    - Trailing metadata via 'status' event
 *    - Need to store for later access
 *    - Useful for headers, trailers, and status
 *
 * 6. Backpressure:
 *    - gRPC handles backpressure automatically
 *    - Flow control via HTTP/2
 *    - No explicit backpressure handling needed
 *    - Observable backpressure can be added if needed
 *
 * 7. Resource Management:
 *    - Always cancel stream on unsubscribe
 *    - Close client and channel when done
 *    - Handle errors in teardown function
 *    - Prevent memory leaks from unclosed streams
 *
 * Comparison with GrpcWebAdapter:
 * - Similar Observable-based API
 * - Better performance (HTTP/2 vs HTTP/1.1)
 * - More granular event handling
 * - Explicit resource management
 * - Full duplex streaming support (for bidi)
 *
 * Next Steps:
 * - Implement client streaming
 * - Implement bidirectional streaming
 * - Add metadata storage and access methods
 * - Implement backpressure if needed
 * - Add comprehensive error handling
 * - Create adapter interface
 */

export { NativeGrpcStreamingSpike };
