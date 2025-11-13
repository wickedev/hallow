/**
 * GrpcWebAdapter - Wrapper around @improbable-eng/grpc-web for type-safe gRPC communication
 *
 * This adapter provides a clean abstraction over the gRPC-web library, handling:
 * - Unary RPC calls with Promise API
 * - Server streaming RPC calls with Observable API
 * - Error handling with typed GrpcError
 * - Request/response serialization
 *
 * Implements ITransportAdapter interface for compatibility with adapter factory.
 *
 * Note: Client streaming and bidirectional streaming are not fully supported
 * by @improbable-eng/grpc-web and will throw errors if attempted.
 */
import { grpc } from '@improbable-eng/grpc-web';
import { Observable } from 'rxjs';
import { ITransportAdapter } from './ITransportAdapter';
import { MethodDescriptor as IMethodDescriptor, CallOptions as ICallOptions, ClientStreamingCall, BidiStreamingCall } from './types';
/**
 * Serializer interface for converting between plain objects and Message instances
 */
export interface MessageSerializer<T> {
    encode(message: T): Uint8Array;
    decode(bytes: Uint8Array): T;
}
/**
 * Method descriptor for gRPC-web method calls (legacy compatibility)
 */
export interface MethodDescriptor<TRequest = any, TResponse = any> {
    methodName: string;
    service?: {
        serviceName: string;
    };
    serviceName?: string;
    requestStream: boolean;
    responseStream: boolean;
    requestType: any;
    responseType: any;
    requestSerializer?: MessageSerializer<TRequest>;
    responseSerializer?: MessageSerializer<TResponse>;
}
/**
 * gRPC client configuration options
 */
export interface GrpcClientOptions {
    /**
     * Request timeout in milliseconds
     */
    timeout?: number;
    /**
     * Custom metadata/headers to include with requests
     */
    metadata?: grpc.Metadata;
    /**
     * Debug mode - logs requests and responses
     */
    debug?: boolean;
}
/**
 * Cancellation token for streaming operations
 */
export interface CancellationToken {
    cancel(): void;
    readonly isCancelled: boolean;
    onCancel(callback: () => void): void;
}
/**
 * Implementation of cancellation token
 */
export declare class CancellationTokenImpl implements CancellationToken {
    private _isCancelled;
    private readonly cancelCallbacks;
    get isCancelled(): boolean;
    cancel(): void;
    onCancel(callback: () => void): void;
}
/**
 * gRPC error class with status code information
 */
export declare class GrpcError extends Error {
    readonly code: grpc.Code;
    readonly methodName: string;
    readonly metadata?: grpc.Metadata | undefined;
    constructor(message: string, code: grpc.Code, methodName: string, metadata?: grpc.Metadata | undefined);
    /**
     * Check if error is a specific gRPC status code
     */
    isCode(code: grpc.Code): boolean;
    /**
     * Get human-readable error message
     */
    toUserMessage(): string;
    /**
     * String representation for logging and debugging
     */
    toString(): string;
}
/**
 * Type guard for GrpcError
 */
export declare function isGrpcError(error: any): error is GrpcError;
/**
 * GrpcWebAdapter - Wrapper around @improbable-eng/grpc-web
 *
 * Provides type-safe methods for making gRPC calls using the gRPC-web protocol.
 * Handles serialization, error handling, and stream management automatically.
 *
 * Implements ITransportAdapter interface for use with AdapterFactory.
 *
 * @example
 * ```typescript
 * const adapter = new GrpcWebAdapter('https://api.example.com');
 *
 * // Unary call
 * const response = await adapter.unary(UserService.GetUserDescriptor, request);
 *
 * // Server streaming call
 * const stream = adapter.serverStream(UserService.ListUsersDescriptor, request);
 * stream.subscribe(message => console.log(message));
 * ```
 */
export declare class GrpcWebAdapter implements ITransportAdapter {
    private readonly baseUrl;
    private readonly options;
    /**
     * Create a new GrpcWebAdapter
     * @param baseUrl - Base URL for the gRPC server (e.g., 'https://api.example.com')
     * @param options - Optional client configuration
     */
    constructor(baseUrl: string, options?: GrpcClientOptions);
    /**
     * Convert IMethodDescriptor to grpc-web compatible MethodDescriptor
     *
     * The @improbable-eng/grpc-web library expects methodDefinition.service.serviceName,
     * but our IMethodDescriptor has serviceName at the root level.
     * This method transforms the descriptor to the expected format.
     *
     * @param descriptor - The IMethodDescriptor from our adapter interface
     * @returns A grpc-web compatible MethodDescriptor with nested service object
     */
    private toGrpcWebDescriptor;
    /**
     * Make a unary RPC call
     *
     * Sends a single request and receives a single response.
     *
     * @param methodDescriptor - Method descriptor containing service and method metadata
     * @param request - Request message
     * @param options - Optional call options (timeout, metadata, etc.)
     * @returns Promise resolving to response message
     * @throws {GrpcError} If the gRPC call fails or returns a non-OK status
     *
     * @example
     * ```typescript
     * const response = await adapter.unary(
     *   UserService.GetUserDescriptor,
     *   { userId: '123' },
     *   { timeout: 5000 }
     * );
     * console.log(response.name);
     * ```
     */
    unary<TRequest, TResponse>(methodDescriptor: MethodDescriptor<TRequest, TResponse>, request: TRequest, options?: ICallOptions): Promise<TResponse>;
    /**
     * Make a server streaming RPC call
     *
     * Sends a single request and receives a stream of responses.
     * Returns an RxJS Observable that emits each response message.
     *
     * @param methodDescriptor - Method descriptor containing service and method metadata
     * @param request - Request message
     * @param options - Optional call options (timeout, metadata, etc.)
     * @returns Observable stream of response messages
     *
     * @example
     * ```typescript
     * const stream = adapter.serverStream(
     *   UserService.ListUsersDescriptor,
     *   { pageSize: 10 },
     *   { timeout: 30000 }
     * );
     *
     * stream.subscribe({
     *   next: (user) => console.log('Received user:', user),
     *   error: (err) => console.error('Stream error:', err),
     *   complete: () => console.log('Stream complete')
     * });
     * ```
     */
    serverStream<TRequest, TResponse>(methodDescriptor: MethodDescriptor<TRequest, TResponse>, request: TRequest, options?: ICallOptions): Observable<TResponse>;
    /**
     * Execute a client streaming RPC call
     *
     * NOTE: Client streaming is not fully supported by @improbable-eng/grpc-web.
     * This method throws an error indicating the limitation.
     *
     * For client streaming support, use NativeGrpcAdapter in Node.js environments.
     *
     * @throws {Error} Client streaming not supported
     */
    clientStream<TRequest, TResponse>(method: IMethodDescriptor<TRequest, TResponse>, options?: ICallOptions): ClientStreamingCall<TRequest, TResponse>;
    /**
     * Execute a bidirectional streaming RPC call
     *
     * NOTE: Bidirectional streaming is not fully supported by @improbable-eng/grpc-web.
     * This method throws an error indicating the limitation.
     *
     * For bidirectional streaming support, use NativeGrpcAdapter in Node.js environments.
     *
     * @throws {Error} Bidirectional streaming not supported
     */
    bidiStream<TRequest, TResponse>(method: IMethodDescriptor<TRequest, TResponse>, options?: ICallOptions): BidiStreamingCall<TRequest, TResponse>;
    /**
     * Close the adapter and release resources
     *
     * Note: gRPC-web doesn't maintain persistent connections, so this is a no-op.
     * Provided for interface compatibility with NativeGrpcAdapter.
     */
    close(): void;
    /**
     * Get the base URL for this adapter
     */
    getBaseUrl(): string;
    /**
     * Get the current client options
     */
    getOptions(): Readonly<GrpcClientOptions>;
    /**
     * Merge metadata from multiple sources
     * @param baseMetadata - Base metadata from instance options
     * @param callMetadata - Metadata from call options
     * @returns Merged metadata
     */
    private mergeMetadata;
    /**
     * Create a Message-like wrapper object with serializeBinary method
     * This allows plain objects to work with grpc-web which expects Message instances
     */
    /**
     * Create a protobuf message wrapper with serializeBinary method
     *
     * The grpc-web library expects request messages to have a serializeBinary() method.
     * This wraps a plain JavaScript object with the serialization method from the descriptor's requestType.
     *
     * @param data - Plain JavaScript object containing the message data
     * @param messageType - MessageType from the method descriptor containing serialize/deserialize functions
     * @returns Message wrapper with serializeBinary() method
     */
    private createProtoMessage;
    private createMessageWrapper;
}
//# sourceMappingURL=GrpcWebAdapter.d.ts.map