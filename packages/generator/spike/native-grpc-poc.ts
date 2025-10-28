/**
 * Spike: Native gRPC Unary RPC Proof of Concept
 *
 * This spike validates the approach for implementing native gRPC support
 * using @grpc/grpc-js with google-protobuf serialization.
 *
 * Key Findings:
 * - @grpc/grpc-js provides excellent TypeScript support
 * - Serialization/deserialization works seamlessly with google-protobuf
 * - Metadata handling is straightforward
 * - Error handling maps cleanly to our existing GrpcError pattern
 * - Channel management is explicit and provides good resource control
 */

import * as grpc from '@grpc/grpc-js';
import { Message } from 'google-protobuf';

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
 * Spike implementation of unary RPC using @grpc/grpc-js
 *
 * This demonstrates:
 * 1. Channel creation and management
 * 2. Request serialization using google-protobuf
 * 3. Response deserialization
 * 4. Metadata handling (request and response)
 * 5. Error handling with status codes
 * 6. Deadline/timeout support
 */
class NativeGrpcUnarySpike {
  private channel: grpc.Channel;
  private client: grpc.Client;

  constructor(
    serverAddress: string,
    credentials: grpc.ChannelCredentials = grpc.credentials.createInsecure()
  ) {
    // Create channel - manages HTTP/2 connection to server
    this.channel = new grpc.Channel(serverAddress, credentials, {
      'grpc.max_receive_message_length': -1, // No limit on message size
      'grpc.max_send_message_length': -1,
    });

    // Create client using the channel
    this.client = new grpc.Client(serverAddress, credentials, {});
  }

  /**
   * Execute a unary RPC call
   *
   * Key observations:
   * - makeUnaryRequest provides clean callback-based API
   * - Serialization happens automatically via serialize/deserialize functions
   * - Metadata is passed via grpc.Metadata class
   * - Errors are returned via ServiceError with status codes
   * - Response metadata is available in callback
   */
  async unary<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    request: TRequest,
    options?: CallOptions
  ): Promise<TResponse> {
    return new Promise<TResponse>((resolve, reject) => {
      // Construct full method path: /package.ServiceName/MethodName
      const methodPath = `/${method.serviceName}/${method.methodName}`;

      // Create metadata from options
      const metadata = this.createMetadata(options?.metadata);

      // Calculate deadline if timeout provided
      let deadline: grpc.Deadline | undefined;
      if (options?.timeout) {
        deadline = Date.now() + options.timeout;
      } else if (options?.deadline) {
        deadline = options.deadline.getTime();
      }

      // Serialization function - converts request object to bytes
      const serialize = (value: TRequest): Buffer => {
        const bytes = method.requestType.serializeBinary(value as any);
        return Buffer.from(bytes);
      };

      // Deserialization function - converts bytes to response object
      const deserialize = (bytes: Buffer): TResponse => {
        return method.responseType.deserializeBinary(new Uint8Array(bytes));
      };

      // Make the unary call
      this.client.makeUnaryRequest(
        methodPath,
        serialize,
        deserialize,
        request,
        metadata,
        { deadline },
        (error: grpc.ServiceError | null, response?: TResponse) => {
          if (error) {
            // Error occurred - convert to our error format
            reject(this.convertError(error, method.methodName));
            return;
          }

          if (!response) {
            // No response received (shouldn't happen for successful calls)
            reject(
              new Error(`No response received from ${method.methodName}`)
            );
            return;
          }

          // Success - return response
          resolve(response);
        }
      );
    });
  }

  /**
   * Create gRPC metadata from plain object
   *
   * Findings:
   * - grpc.Metadata class provides clean API for headers/trailers
   * - Supports string and Buffer values
   * - Automatically handles binary headers (keys ending with -bin)
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
   *
   * Findings:
   * - ServiceError contains status code, message, and metadata
   * - Status codes map directly to gRPC canonical codes
   * - Error details can be extracted from metadata
   */
  private convertError(error: grpc.ServiceError, methodName: string): Error {
    const statusCode = error.code ?? grpc.status.UNKNOWN;
    const message = error.message || error.details || 'Unknown error';

    // Could create custom GrpcError class here
    const grpcError = new Error(
      `gRPC ${methodName} failed: ${message} (code: ${this.getStatusName(statusCode)})`
    );

    // Attach status code and metadata to error object
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
   *
   * Findings:
   * - Explicit resource cleanup is important
   * - Channel should be closed to release connections
   * - Client cleanup is automatic when channel closes
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
// Define message types (normally generated from .proto)
interface GetUserRequest {
  userId: string;
}

interface GetUserResponse {
  userId: string;
  name: string;
  email: string;
}

// Define method descriptor
const getUserMethod: MethodDescriptor<GetUserRequest, GetUserResponse> = {
  serviceName: 'user.UserService',
  methodName: 'GetUser',
  requestStream: false,
  responseStream: false,
  requestType: {
    serializeBinary: (msg: GetUserRequest) => {
      // Use google-protobuf generated serializer
      return new Uint8Array();
    },
    deserializeBinary: (bytes: Uint8Array) => {
      // Use google-protobuf generated deserializer
      return { userId: '', name: '', email: '' };
    },
  },
  responseType: {
    serializeBinary: (msg: GetUserResponse) => new Uint8Array(),
    deserializeBinary: (bytes: Uint8Array) => ({
      userId: '',
      name: '',
      email: '',
    }),
  },
};

// Use the spike implementation
async function example() {
  const spike = new NativeGrpcUnarySpike('localhost:50051');

  try {
    const response = await spike.unary(
      getUserMethod,
      { userId: '123' },
      {
        timeout: 5000,
        metadata: {
          authorization: 'Bearer token123',
        },
      }
    );

    console.log('User:', response);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    spike.close();
  }
}
*/

/**
 * Key Takeaways for Full Implementation:
 *
 * 1. Channel Management:
 *    - Create one channel per server address
 *    - Reuse channels across multiple calls
 *    - Properly close channels to prevent resource leaks
 *
 * 2. Serialization:
 *    - google-protobuf provides serializeBinary/deserializeBinary methods
 *    - Need to wrap in Buffer for @grpc/grpc-js
 *    - Deserialization happens automatically in callback
 *
 * 3. Metadata:
 *    - Use grpc.Metadata class for headers/trailers
 *    - Simple key-value pairs
 *    - Supports binary headers
 *
 * 4. Error Handling:
 *    - ServiceError provides status code and message
 *    - Status codes are well-defined (grpc.status enum)
 *    - Metadata can contain error details
 *
 * 5. Timeouts/Deadlines:
 *    - Deadline is absolute timestamp (milliseconds since epoch)
 *    - Timeout is relative (convert to deadline)
 *    - DEADLINE_EXCEEDED error on timeout
 *
 * 6. Type Safety:
 *    - Full TypeScript support with generics
 *    - Type-safe request/response messages
 *    - Type-safe method descriptors
 *
 * Next Steps:
 * - Implement server streaming (see streaming-poc.ts)
 * - Create ITransportAdapter interface
 * - Implement full NativeGrpcAdapter class
 * - Add metadata conversion utilities
 * - Implement retry logic for transient failures
 */

export { NativeGrpcUnarySpike };
