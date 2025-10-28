/**
 * ITransportAdapter - Abstraction layer for gRPC transport
 *
 * This interface provides a unified API for different gRPC transport
 * implementations. Both GrpcWebAdapter and NativeGrpcAdapter implement
 * this interface, allowing for seamless switching between transports
 * based on the runtime environment.
 *
 * The interface supports all four gRPC RPC patterns:
 * 1. Unary - Single request, single response
 * 2. Server Streaming - Single request, stream of responses
 * 3. Client Streaming - Stream of requests, single response
 * 4. Bidirectional Streaming - Stream of requests, stream of responses
 */

import { Observable } from 'rxjs';
import {
  MethodDescriptor,
  CallOptions,
  ClientStreamingCall,
  BidiStreamingCall,
} from './types';

/**
 * Transport adapter interface for gRPC communication
 *
 * Provides a consistent API across different gRPC transports:
 * - GrpcWebAdapter: Uses @improbable-eng/grpc-web (HTTP/1.1 or HTTP/2)
 * - NativeGrpcAdapter: Uses @grpc/grpc-js (HTTP/2, Node.js only)
 *
 * All methods are type-safe and support proper error handling, metadata,
 * and cancellation patterns.
 *
 * @example
 * ```typescript
 * // Using with unary RPC
 * const response = await adapter.unary(methodDescriptor, request, {
 *   timeout: 5000,
 *   metadata: { authorization: 'Bearer token' }
 * });
 *
 * // Using with server streaming
 * adapter.serverStream(methodDescriptor, request)
 *   .subscribe({
 *     next: (message) => console.log('Received:', message),
 *     error: (err) => console.error('Error:', err),
 *     complete: () => console.log('Stream complete')
 *   });
 *
 * // Cleanup when done
 * adapter.close();
 * ```
 */
export interface ITransportAdapter {
  /**
   * Execute a unary RPC call
   *
   * Sends a single request and receives a single response.
   * This is the most common RPC pattern.
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
   * const response = await adapter.unary(
   *   getUserDescriptor,
   *   { userId: '123' },
   *   { timeout: 5000 }
   * );
   * console.log('User:', response.name);
   * ```
   */
  unary<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    request: TRequest,
    options?: CallOptions
  ): Promise<TResponse>;

  /**
   * Execute a server streaming RPC call
   *
   * Sends a single request and receives a stream of responses.
   * The server sends zero or more responses followed by a final status.
   *
   * Returns an RxJS Observable that:
   * - Emits each response via next()
   * - Completes via complete() when server closes the stream
   * - Errors via error() if the stream fails
   * - Cancels the stream when unsubscribed
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
   * const subscription = adapter.serverStream(
   *   listUsersDescriptor,
   *   { pageSize: 10 }
   * ).subscribe({
   *   next: (user) => console.log('User:', user),
   *   error: (err) => console.error('Stream error:', err),
   *   complete: () => console.log('Stream complete')
   * });
   *
   * // Cancel after 5 seconds
   * setTimeout(() => subscription.unsubscribe(), 5000);
   * ```
   */
  serverStream<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    request: TRequest,
    options?: CallOptions
  ): Observable<TResponse>;

  /**
   * Execute a client streaming RPC call
   *
   * Sends a stream of requests and receives a single response.
   * The client sends zero or more requests, then signals completion.
   * The server processes all requests and sends a single response.
   *
   * Returns a ClientStreamingCall interface that allows:
   * - Writing multiple requests via write()
   * - Signaling completion via end()
   * - Receiving the response via getResponse()
   * - Cancelling the stream via cancel()
   *
   * @template TRequest - Type of the request messages
   * @template TResponse - Type of the response message
   * @param method - Method descriptor with service and method metadata
   * @param options - Optional call options (timeout, metadata, etc.)
   * @returns ClientStreamingCall interface for sending requests
   *
   * @example
   * ```typescript
   * const call = adapter.clientStream(uploadChunksDescriptor);
   *
   * // Send multiple requests
   * call.write({ chunk: data1 });
   * call.write({ chunk: data2 });
   * call.write({ chunk: data3 });
   *
   * // Signal completion and wait for response
   * call.end();
   * const response = await call.getResponse();
   * console.log('Upload complete:', response.totalBytes);
   * ```
   */
  clientStream<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    options?: CallOptions
  ): ClientStreamingCall<TRequest, TResponse>;

  /**
   * Execute a bidirectional streaming RPC call
   *
   * Sends a stream of requests and receives a stream of responses.
   * Both client and server can send messages independently and concurrently.
   * The client and server can read and write in any order.
   *
   * Returns a BidiStreamingCall interface that provides:
   * - Writing requests via write()
   * - Reading responses via responses() Observable
   * - Signaling completion via end()
   * - Cancelling via cancel()
   *
   * @template TRequest - Type of the request messages
   * @template TResponse - Type of the response messages
   * @param method - Method descriptor with service and method metadata
   * @param options - Optional call options (timeout, metadata, etc.)
   * @returns BidiStreamingCall interface for bidirectional streaming
   *
   * @example
   * ```typescript
   * const call = adapter.bidiStream(chatDescriptor);
   *
   * // Subscribe to responses
   * call.responses().subscribe({
   *   next: (msg) => console.log('Received:', msg.text),
   *   complete: () => console.log('Server closed stream')
   * });
   *
   * // Send requests
   * call.write({ text: 'Hello' });
   * call.write({ text: 'How are you?' });
   *
   * // Close client side of stream
   * call.end();
   * ```
   */
  bidiStream<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    options?: CallOptions
  ): BidiStreamingCall<TRequest, TResponse>;

  /**
   * Close the adapter and release all resources
   *
   * This should be called when the adapter is no longer needed to:
   * - Close any open connections
   * - Cancel any pending streams
   * - Release any allocated resources
   *
   * After calling close(), the adapter should not be used for new calls.
   *
   * @example
   * ```typescript
   * const adapter = new NativeGrpcAdapter('localhost:50051');
   * try {
   *   await adapter.unary(method, request);
   * } finally {
   *   adapter.close(); // Always clean up
   * }
   * ```
   */
  close(): void;
}

/**
 * Type guard to check if an object implements ITransportAdapter
 * @param obj - Object to check
 * @returns true if object implements ITransportAdapter interface
 */
export function isTransportAdapter(obj: any): obj is ITransportAdapter {
  return (
    obj &&
    typeof obj.unary === 'function' &&
    typeof obj.serverStream === 'function' &&
    typeof obj.clientStream === 'function' &&
    typeof obj.bidiStream === 'function' &&
    typeof obj.close === 'function'
  );
}
