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
import { MethodDescriptor, CallOptions, ClientStreamingCall, BidiStreamingCall, AdapterConfig } from './types';
import { type RetryConfig } from './retry';
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
    /**
     * Retry configuration for transient failures
     * Set to false to disable retries
     * @default { maxRetries: 3, initialBackoffMs: 100, maxBackoffMs: 10000 }
     */
    retryConfig?: RetryConfig | false;
}
/**
 * Native gRPC adapter implementation
 *
 * Uses @grpc/grpc-js to provide full native gRPC support in Node.js.
 * Implements the ITransportAdapter interface for seamless integration.
 */
export declare class NativeGrpcAdapter implements ITransportAdapter {
    private channel;
    private client;
    private readonly serverAddress;
    private readonly credentials;
    private readonly config;
    private readonly retryPolicy;
    private closed;
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
    constructor(config: NativeGrpcAdapterConfig);
    /**
     * Execute a unary RPC call
     *
     * Sends a single request and receives a single response.
     * Implements the most common RPC pattern.
     *
     * If retry policy is enabled (default), automatically retries transient
     * failures (UNAVAILABLE, DEADLINE_EXCEEDED, etc.) with exponential backoff.
     *
     * @template TRequest - Type of the request message
     * @template TResponse - Type of the response message
     * @param method - Method descriptor with service and method metadata
     * @param request - Request message to send
     * @param options - Optional call options (timeout, metadata, etc.)
     * @returns Promise resolving to the response message
     * @throws {GrpcError} If the call fails or returns a non-OK status
     *
     * @example
     * ```typescript
     * try {
     *   const response = await adapter.unary(getUserDescriptor, { id: '123' });
     *   console.log('User:', response);
     * } catch (error) {
     *   if (error.is(GrpcStatusCode.NOT_FOUND)) {
     *     console.log('User not found');
     *   }
     * }
     * ```
     */
    unary<TRequest, TResponse>(method: MethodDescriptor<TRequest, TResponse>, request: TRequest, options?: CallOptions): Promise<TResponse>;
    /**
     * Execute a single unary RPC call (internal implementation)
     *
     * This is the actual implementation of the unary call logic.
     * Called directly when retries are disabled, or wrapped by retry policy
     * when retries are enabled.
     *
     * @template TRequest - Type of the request message
     * @template TResponse - Type of the response message
     * @param method - Method descriptor
     * @param request - Request message
     * @param options - Call options
     * @returns Promise resolving to the response message
     * @throws {GrpcError} If the call fails
     * @private
     */
    private executeUnaryCall;
    /**
     * Execute a server streaming RPC call
     *
     * Sends a single request and receives a stream of responses.
     * Returns an Observable that emits each response and completes when done.
     *
     * Key features:
     * - Wraps gRPC ClientReadableStream in RxJS Observable
     * - Handles data, end, error, status, and metadata events
     * - Automatic cancellation on unsubscribe
     * - Stores metadata and trailers for access via getter methods
     * - Proper resource cleanup on completion/error/cancellation
     *
     * @template TRequest - Type of the request message
     * @template TResponse - Type of the response messages
     * @param method - Method descriptor with service and method metadata
     * @param request - Request message to send
     * @param options - Optional call options (timeout, metadata, etc.)
     * @returns Observable stream of response messages
     *
     * @example
     * ```typescript
     * const subscription = adapter.serverStream(listUsersDescriptor, { pageSize: 10 })
     *   .subscribe({
     *     next: (user) => console.log('User:', user),
     *     error: (err) => console.error('Error:', err),
     *     complete: () => console.log('Stream complete')
     *   });
     *
     * // Cancel after 5 seconds
     * setTimeout(() => subscription.unsubscribe(), 5000);
     * ```
     */
    serverStream<TRequest, TResponse>(method: MethodDescriptor<TRequest, TResponse>, request: TRequest, options?: CallOptions): Observable<TResponse>;
    /**
     * Execute a client streaming RPC call
     *
     * Sends a stream of requests and receives a single response.
     * Returns a ClientStreamingCall interface for sending requests.
     *
     * Key features:
     * - Wraps gRPC ClientWritableStream for sending multiple requests
     * - Returns a promise that resolves with the server's response
     * - Supports write(), end(), getResponse(), and cancel() operations
     * - Proper error handling and resource cleanup
     * - Validates method descriptor for client streaming pattern
     *
     * @template TRequest - Type of the request messages
     * @template TResponse - Type of the response message
     * @param method - Method descriptor with service and method metadata
     * @param options - Optional call options (timeout, metadata, etc.)
     * @returns ClientStreamingCall interface for sending requests
     * @throws {Error} If method is not a client streaming RPC
     *
     * @example
     * ```typescript
     * const call = adapter.clientStream(createUsersDescriptor);
     * call.write({ name: 'Alice', email: 'alice@example.com' });
     * call.write({ name: 'Bob', email: 'bob@example.com' });
     * call.end();
     * const response = await call.getResponse();
     * console.log('Created users:', response.users);
     * ```
     */
    clientStream<TRequest, TResponse>(method: MethodDescriptor<TRequest, TResponse>, options?: CallOptions): ClientStreamingCall<TRequest, TResponse>;
    /**
     * Execute a bidirectional streaming RPC call
     *
     * Sends a stream of requests and receives a stream of responses.
     * Both client and server can send messages independently.
     *
     * Key features:
     * - Wraps gRPC ClientDuplexStream for bidirectional communication
     * - Returns an Observable for receiving responses
     * - Supports write(), end(), responses(), and cancel() operations
     * - Client and server can send/receive messages concurrently
     * - Proper error handling and resource cleanup
     * - Validates method descriptor for bidirectional streaming pattern
     *
     * @template TRequest - Type of the request messages
     * @template TResponse - Type of the response messages
     * @param method - Method descriptor with service and method metadata
     * @param options - Optional call options (timeout, metadata, etc.)
     * @returns BidiStreamingCall interface for bidirectional streaming
     * @throws {Error} If method is not a bidirectional streaming RPC
     *
     * @example
     * ```typescript
     * const call = adapter.bidiStream(chatDescriptor);
     *
     * // Subscribe to responses
     * call.responses().subscribe({
     *   next: (msg) => console.log('Received:', msg.content),
     *   error: (err) => console.error('Error:', err),
     *   complete: () => console.log('Stream complete')
     * });
     *
     * // Send messages
     * call.write({ content: 'Hello', timestamp: Date.now() });
     * call.write({ content: 'World', timestamp: Date.now() });
     * call.end();
     * ```
     */
    bidiStream<TRequest, TResponse>(method: MethodDescriptor<TRequest, TResponse>, options?: CallOptions): BidiStreamingCall<TRequest, TResponse>;
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
    close(): void;
    /**
     * Helper: Parse server address from URL
     *
     * Removes protocol prefix if present and validates format.
     *
     * @param url - Server URL (e.g., "localhost:50051" or "grpc://localhost:50051")
     * @returns Clean server address in host:port format
     * @private
     */
    private parseServerAddress;
    /**
     * Helper: Ensure adapter is not closed
     *
     * @throws {Error} If adapter has been closed
     * @private
     */
    private ensureNotClosed;
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
    protected serializeRequest<TRequest>(method: MethodDescriptor<TRequest, any>, request: TRequest): Buffer;
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
    protected deserializeResponse<TResponse>(method: MethodDescriptor<any, TResponse>, bytes: Buffer): TResponse;
    /**
     * Helper: Create serialization function for grpc-js
     *
     * @param method - Method descriptor with request type
     * @returns Serialization function
     * @private
     */
    protected createSerializer<TRequest>(method: MethodDescriptor<TRequest, any>): (value: TRequest) => Buffer;
    /**
     * Helper: Create deserialization function for grpc-js
     *
     * @param method - Method descriptor with response type
     * @returns Deserialization function
     * @private
     */
    protected createDeserializer<TResponse>(method: MethodDescriptor<any, TResponse>): (bytes: Buffer) => TResponse;
    /**
     * Helper: Get full method path
     *
     * Constructs the full method path in the format: /ServiceName/MethodName
     *
     * @param method - Method descriptor
     * @returns Full method path
     * @private
     */
    protected getMethodPath(method: MethodDescriptor<any, any>): string;
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
    private createMetadata;
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
    private calculateDeadline;
    /**
     * Helper: Convert grpc.ServiceError to GrpcError
     *
     * Maps native gRPC errors to our standardized GrpcError format.
     * Uses StatusCodeMapper for consistent error conversion with:
     * - Proper status code mapping
     * - Metadata extraction
     * - Error details preservation
     * - Debug logging in debug mode
     *
     * @param error - Native gRPC ServiceError or any error
     * @param methodName - Name of the method that failed
     * @returns GrpcError with proper status code and metadata
     * @private
     */
    private convertError;
}
//# sourceMappingURL=NativeGrpcAdapter.d.ts.map