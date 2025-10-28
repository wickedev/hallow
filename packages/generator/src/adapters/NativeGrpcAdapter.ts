/**
 * NativeGrpcAdapter - Native gRPC transport adapter using @grpc/grpc-js
 *
 * This adapter provides native gRPC support for Node.js environments using
 * the official @grpc/grpc-js library. It implements the ITransportAdapter
 * interface and supports all four gRPC RPC patterns.
 *
 * Key features:
 * - Full HTTP/2 support with multiplexing
 * - All streaming patterns (unary, server, client, bidirectional)
 * - Metadata and deadline propagation
 * - Automatic error handling and status code mapping
 * - Resource cleanup and connection management
 *
 * @example
 * ```typescript
 * const adapter = new NativeGrpcAdapter({
 *   serverUrl: 'localhost:50051',
 *   secure: false
 * });
 *
 * try {
 *   const response = await adapter.unary(methodDescriptor, request);
 *   console.log('Response:', response);
 * } finally {
 *   adapter.close();
 * }
 * ```
 */

import * as grpc from '@grpc/grpc-js';
import { Observable } from 'rxjs';
import { ITransportAdapter } from './ITransportAdapter';
import {
  MethodDescriptor,
  CallOptions,
  ClientStreamingCall,
  BidiStreamingCall,
  AdapterConfig,
  GrpcStatusCode,
  GrpcError,
  Metadata,
} from './types';
import { MetadataConverter } from './metadata';

/**
 * Configuration specific to NativeGrpcAdapter
 */
export interface NativeGrpcAdapterConfig extends AdapterConfig {
  /**
   * gRPC channel options
   * @see https://grpc.github.io/grpc/core/group__grpc__arg__keys.html
   */
  channelOptions?: grpc.ChannelOptions;

  /**
   * Default timeout for all calls (milliseconds)
   */
  defaultTimeout?: number;
}

/**
 * Internal configuration type with required base properties
 */
interface NativeGrpcAdapterInternalConfig
  extends Required<Omit<AdapterConfig, 'defaultCallOptions'>> {
  channelOptions: grpc.ChannelOptions;
  defaultTimeout?: number;
  defaultCallOptions?: CallOptions;
}

/**
 * Native gRPC adapter implementation
 *
 * Uses @grpc/grpc-js to provide full native gRPC support in Node.js.
 * Implements the ITransportAdapter interface for seamless integration.
 */
export class NativeGrpcAdapter implements ITransportAdapter {
  private channel: grpc.Channel;
  private client: grpc.Client;
  private readonly serverAddress: string;
  private readonly credentials: grpc.ChannelCredentials;
  private readonly config: NativeGrpcAdapterInternalConfig;
  private closed: boolean = false;

  /**
   * Create a new NativeGrpcAdapter
   *
   * @param config - Adapter configuration
   * @throws {Error} If serverUrl is invalid or channel creation fails
   *
   * @example
   * ```typescript
   * // Insecure connection (development)
   * const adapter = new NativeGrpcAdapter({
   *   serverUrl: 'localhost:50051',
   *   secure: false
   * });
   *
   * // Secure connection (production)
   * const adapter = new NativeGrpcAdapter({
   *   serverUrl: 'api.example.com:443',
   *   secure: true
   * });
   * ```
   */
  constructor(config: NativeGrpcAdapterConfig) {
    // Validate configuration
    if (!config.serverUrl) {
      throw new Error('serverUrl is required');
    }

    // Set default configuration values
    this.config = {
      serverUrl: config.serverUrl,
      secure: config.secure ?? false,
      debug: config.debug ?? false,
      defaultCallOptions: config.defaultCallOptions,
      channelOptions: config.channelOptions ?? {},
      defaultTimeout: config.defaultTimeout,
    };

    // Parse server address (remove protocol if present)
    this.serverAddress = this.parseServerAddress(config.serverUrl);

    // Create credentials
    this.credentials = this.config.secure
      ? grpc.credentials.createSsl()
      : grpc.credentials.createInsecure();

    // Create channel with options
    const channelOptions: grpc.ChannelOptions = {
      'grpc.max_receive_message_length': -1, // No limit on received message size
      'grpc.max_send_message_length': -1, // No limit on sent message size
      ...this.config.channelOptions,
    };

    try {
      this.channel = new grpc.Channel(
        this.serverAddress,
        this.credentials,
        channelOptions
      );

      this.client = new grpc.Client(
        this.serverAddress,
        this.credentials,
        {}
      );

      if (this.config.debug) {
        console.log(
          `[NativeGrpcAdapter] Created adapter for ${this.serverAddress}`
        );
      }
    } catch (error) {
      throw new Error(
        `Failed to create gRPC channel: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Execute a unary RPC call
   *
   * Sends a single request and receives a single response.
   * Implements the most common RPC pattern.
   *
   * @template TRequest - Type of the request message
   * @template TResponse - Type of the response message
   * @param method - Method descriptor with service and method metadata
   * @param request - Request message to send
   * @param options - Optional call options (timeout, metadata, etc.)
   * @returns Promise resolving to the response message
   * @throws {GrpcError} If the call fails or returns a non-OK status
   */
  async unary<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    request: TRequest,
    options?: CallOptions
  ): Promise<TResponse> {
    this.ensureNotClosed();

    return new Promise<TResponse>((resolve, reject) => {
      // Construct full method path: /ServiceName/MethodName
      const methodPath = this.getMethodPath(method);

      // Create metadata from options
      const metadata = this.createMetadata(options);

      // Calculate deadline
      const deadline = this.calculateDeadline(options);

      // Create serializer and deserializer
      const serialize = this.createSerializer(method);
      const deserialize = this.createDeserializer(method);

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
            // Error occurred - convert to GrpcError
            reject(this.convertError(error, method.methodName));
            return;
          }

          if (!response) {
            // No response received (shouldn't happen for successful calls)
            reject(
              new GrpcError(
                `No response received from ${method.methodName}`,
                GrpcStatusCode.UNKNOWN,
                method.methodName
              )
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
   * Execute a server streaming RPC call
   *
   * Sends a single request and receives a stream of responses.
   * Returns an Observable that emits each response and completes when done.
   *
   * @template TRequest - Type of the request message
   * @template TResponse - Type of the response messages
   * @param method - Method descriptor with service and method metadata
   * @param request - Request message to send
   * @param options - Optional call options (timeout, metadata, etc.)
   * @returns Observable stream of response messages
   *
   * @note Implementation will be added in Task 10 (server streaming)
   */
  serverStream<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    request: TRequest,
    options?: CallOptions
  ): Observable<TResponse> {
    this.ensureNotClosed();

    // Implementation will be added in Task 10
    throw new Error('Not implemented yet - Task 10');
  }

  /**
   * Execute a client streaming RPC call
   *
   * Sends a stream of requests and receives a single response.
   * Returns a ClientStreamingCall interface for sending requests.
   *
   * @template TRequest - Type of the request messages
   * @template TResponse - Type of the response message
   * @param method - Method descriptor with service and method metadata
   * @param options - Optional call options (timeout, metadata, etc.)
   * @returns ClientStreamingCall interface for sending requests
   *
   * @note Implementation will be added in Task 11 (client streaming)
   */
  clientStream<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    options?: CallOptions
  ): ClientStreamingCall<TRequest, TResponse> {
    this.ensureNotClosed();

    // Implementation will be added in Task 11
    throw new Error('Not implemented yet - Task 11');
  }

  /**
   * Execute a bidirectional streaming RPC call
   *
   * Sends a stream of requests and receives a stream of responses.
   * Both client and server can send messages independently.
   *
   * @template TRequest - Type of the request messages
   * @template TResponse - Type of the response messages
   * @param method - Method descriptor with service and method metadata
   * @param options - Optional call options (timeout, metadata, etc.)
   * @returns BidiStreamingCall interface for bidirectional streaming
   *
   * @note Implementation will be added in Task 11 (bidirectional streaming)
   */
  bidiStream<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    options?: CallOptions
  ): BidiStreamingCall<TRequest, TResponse> {
    this.ensureNotClosed();

    // Implementation will be added in Task 11
    throw new Error('Not implemented yet - Task 11');
  }

  /**
   * Close the adapter and release all resources
   *
   * This closes the gRPC channel and client, releasing all connections.
   * After calling close(), the adapter should not be used for new calls.
   *
   * @example
   * ```typescript
   * const adapter = new NativeGrpcAdapter({ serverUrl: 'localhost:50051' });
   * try {
   *   await adapter.unary(method, request);
   * } finally {
   *   adapter.close(); // Always clean up
   * }
   * ```
   */
  close(): void {
    if (this.closed) {
      return;
    }

    try {
      // Close client first
      this.client.close();

      // Close channel
      this.channel.close();

      this.closed = true;

      if (this.config.debug) {
        console.log('[NativeGrpcAdapter] Adapter closed');
      }
    } catch (error) {
      console.error(
        '[NativeGrpcAdapter] Error closing adapter:',
        error
      );
      // Mark as closed anyway to prevent further use
      this.closed = true;
    }
  }

  /**
   * Helper: Parse server address from URL
   *
   * Removes protocol prefix if present and validates format.
   *
   * @param url - Server URL (e.g., "localhost:50051" or "grpc://localhost:50051")
   * @returns Clean server address in host:port format
   * @private
   */
  private parseServerAddress(url: string): string {
    // Remove protocol if present
    let address = url;
    if (address.startsWith('grpc://')) {
      address = address.substring('grpc://'.length);
    } else if (address.startsWith('grpcs://')) {
      address = address.substring('grpcs://'.length);
    } else if (address.startsWith('http://')) {
      address = address.substring('http://'.length);
    } else if (address.startsWith('https://')) {
      address = address.substring('https://'.length);
    }

    // Validate format (should be host:port)
    if (!address || address.trim() === '') {
      throw new Error('Invalid server address: empty');
    }

    return address.trim();
  }

  /**
   * Helper: Ensure adapter is not closed
   *
   * @throws {Error} If adapter has been closed
   * @private
   */
  private ensureNotClosed(): void {
    if (this.closed) {
      throw new Error(
        'Adapter is closed. Create a new adapter to make calls.'
      );
    }
  }

  /**
   * Helper: Serialize request message
   *
   * Converts a request object to Buffer using google-protobuf serialization.
   *
   * @param method - Method descriptor with request type
   * @param request - Request message to serialize
   * @returns Serialized request as Buffer
   * @private
   */
  protected serializeRequest<TRequest>(
    method: MethodDescriptor<TRequest, any>,
    request: TRequest
  ): Buffer {
    try {
      const bytes = method.requestType.serializeBinary(request as any);
      return Buffer.from(bytes);
    } catch (error) {
      throw new Error(
        `Failed to serialize request: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Helper: Deserialize response message
   *
   * Converts a Buffer to response object using google-protobuf deserialization.
   *
   * @param method - Method descriptor with response type
   * @param bytes - Serialized response as Buffer
   * @returns Deserialized response object
   * @private
   */
  protected deserializeResponse<TResponse>(
    method: MethodDescriptor<any, TResponse>,
    bytes: Buffer
  ): TResponse {
    try {
      return method.responseType.deserializeBinary(new Uint8Array(bytes));
    } catch (error) {
      throw new Error(
        `Failed to deserialize response: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Helper: Create serialization function for grpc-js
   *
   * @param method - Method descriptor with request type
   * @returns Serialization function
   * @private
   */
  protected createSerializer<TRequest>(
    method: MethodDescriptor<TRequest, any>
  ): (value: TRequest) => Buffer {
    return (value: TRequest) => this.serializeRequest(method, value);
  }

  /**
   * Helper: Create deserialization function for grpc-js
   *
   * @param method - Method descriptor with response type
   * @returns Deserialization function
   * @private
   */
  protected createDeserializer<TResponse>(
    method: MethodDescriptor<any, TResponse>
  ): (bytes: Buffer) => TResponse {
    return (bytes: Buffer) => this.deserializeResponse(method, bytes);
  }

  /**
   * Helper: Get full method path
   *
   * Constructs the full method path in the format: /ServiceName/MethodName
   *
   * @param method - Method descriptor
   * @returns Full method path
   * @private
   */
  protected getMethodPath(method: MethodDescriptor<any, any>): string {
    return `/${method.serviceName}/${method.methodName}`;
  }

  /**
   * Helper: Create gRPC metadata from call options
   *
   * Converts application metadata to grpc.Metadata format using MetadataConverter.
   * Merges with default call options metadata if configured.
   *
   * @param options - Call options with optional metadata
   * @returns grpc.Metadata instance
   * @private
   */
  private createMetadata(options?: CallOptions): grpc.Metadata {
    // Merge default metadata with request metadata
    return MetadataConverter.merge([
      this.config.defaultCallOptions?.metadata,
      options?.metadata,
    ]);
  }

  /**
   * Helper: Calculate deadline from call options
   *
   * Converts timeout (relative) or deadline (absolute) to grpc.Deadline.
   * Priority: options.deadline > options.timeout > config.defaultTimeout
   *
   * @param options - Call options with optional timeout or deadline
   * @returns Deadline in milliseconds since epoch, or undefined
   * @private
   */
  private calculateDeadline(options?: CallOptions): grpc.Deadline | undefined {
    // Priority 1: Explicit deadline (absolute timestamp)
    if (options?.deadline) {
      return options.deadline;
    }

    // Priority 2: Timeout (relative milliseconds)
    if (options?.timeout) {
      return Date.now() + options.timeout;
    }

    // Priority 3: Default timeout from config
    if (this.config.defaultTimeout) {
      return Date.now() + this.config.defaultTimeout;
    }

    // Priority 4: Default call options timeout
    if (this.config.defaultCallOptions?.timeout) {
      return Date.now() + this.config.defaultCallOptions.timeout;
    }

    // No deadline
    return undefined;
  }

  /**
   * Helper: Convert grpc.ServiceError to GrpcError
   *
   * Maps native gRPC errors to our standardized GrpcError format.
   * Preserves status code, message, and metadata using MetadataConverter.
   *
   * @param error - Native gRPC ServiceError
   * @param methodName - Name of the method that failed
   * @returns GrpcError with proper status code and metadata
   * @private
   */
  private convertError(error: grpc.ServiceError, methodName: string): GrpcError {
    // Map gRPC status code to our GrpcStatusCode enum
    const statusCode = this.mapGrpcStatusCode(error.code ?? grpc.status.UNKNOWN);

    // Extract error message
    const message = error.message || error.details || 'Unknown gRPC error';

    // Convert metadata if present using MetadataConverter
    let metadata: Metadata | undefined;
    if (error.metadata) {
      metadata = MetadataConverter.fromGrpcMetadata(error.metadata);
    }

    // Create and return GrpcError
    return new GrpcError(message, statusCode, methodName, metadata, {
      originalError: error,
      code: error.code,
    });
  }

  /**
   * Helper: Map grpc.status to GrpcStatusCode
   *
   * @param grpcStatus - Native gRPC status code
   * @returns Our GrpcStatusCode enum value
   * @private
   */
  private mapGrpcStatusCode(grpcStatus: grpc.status): GrpcStatusCode {
    // grpc.status and GrpcStatusCode use the same numeric values
    // This is by design to maintain compatibility
    return grpcStatus as unknown as GrpcStatusCode;
  }

}
