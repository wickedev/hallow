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
import {
  MethodDescriptor as IMethodDescriptor,
  CallOptions as ICallOptions,
  ClientStreamingCall,
  BidiStreamingCall,
  GrpcStatusCode,
} from './types';

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
  service?: { serviceName: string }; // Legacy field for backward compatibility
  serviceName?: string; // New field matching ITransportAdapter
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
export class CancellationTokenImpl implements CancellationToken {
  private _isCancelled = false;
  private readonly cancelCallbacks: Array<() => void> = [];

  get isCancelled(): boolean {
    return this._isCancelled;
  }

  cancel(): void {
    if (this._isCancelled) {
      return;
    }

    this._isCancelled = true;

    // Execute all callbacks with error handling
    for (const callback of this.cancelCallbacks) {
      try {
        callback();
      } catch (error) {
        // Log error but don't throw to ensure all callbacks execute
        console.error('Error in cancellation callback:', error);
      }
    }

    // Clear callbacks to prevent memory leaks
    this.cancelCallbacks.length = 0;
  }

  onCancel(callback: () => void): void {
    if (this._isCancelled) {
      // Already cancelled, execute immediately
      try {
        callback();
      } catch (error) {
        console.error('Error in immediate cancellation callback:', error);
      }
    } else {
      this.cancelCallbacks.push(callback);
    }
  }
}

/**
 * gRPC error class with status code information
 */
export class GrpcError extends Error {
  constructor(
    message: string,
    public readonly code: grpc.Code,
    public readonly methodName: string,
    public readonly metadata?: grpc.Metadata,
  ) {
    super(message);
    this.name = 'GrpcError';

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GrpcError);
    }
  }

  /**
   * Check if error is a specific gRPC status code
   */
  isCode(code: grpc.Code): boolean {
    return this.code === code;
  }

  /**
   * Get human-readable error message
   */
  toUserMessage(): string {
    return `gRPC ${this.methodName} failed: ${this.message} (code: ${grpc.Code[this.code]})`;
  }

  /**
   * String representation for logging and debugging
   */
  toString(): string {
    const codeName = grpc.Code[this.code] || `Unknown(${this.code})`;
    return `GrpcError: ${this.message} [${codeName}] at ${this.methodName}`;
  }
}

/**
 * Type guard for GrpcError
 */
export function isGrpcError(error: any): error is GrpcError {
  return error instanceof GrpcError;
}

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
export class GrpcWebAdapter implements ITransportAdapter {
  private readonly options: GrpcClientOptions;

  /**
   * Create a new GrpcWebAdapter
   * @param baseUrl - Base URL for the gRPC server (e.g., 'https://api.example.com')
   * @param options - Optional client configuration
   */
  constructor(
    private readonly baseUrl: string,
    options?: GrpcClientOptions,
  ) {
    this.options = {
      timeout: options?.timeout,
      metadata: options?.metadata,
      debug: options?.debug ?? false,
    };
  }

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
  private toGrpcWebDescriptor<TRequest, TResponse>(
    descriptor: MethodDescriptor<TRequest, TResponse>
  ): MethodDescriptor<TRequest, TResponse> {
    // Extract serviceName from either the nested service object or root level
    const serviceName = descriptor.service?.serviceName || descriptor.serviceName || '';

    return {
      methodName: descriptor.methodName,
      service: {
        serviceName,
      },
      serviceName, // Keep for backward compatibility
      requestStream: descriptor.requestStream,
      responseStream: descriptor.responseStream,
      requestType: descriptor.requestType,
      responseType: descriptor.responseType,
    };
  }

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
  async unary<TRequest, TResponse>(
    methodDescriptor: MethodDescriptor<TRequest, TResponse>,
    request: TRequest,
    options?: ICallOptions,
  ): Promise<TResponse> {
    return new Promise<TResponse>((resolve, reject) => {
      try {
        if (this.options.debug) {
          console.log(`[GrpcWebAdapter] Unary call to ${methodDescriptor.methodName}`, {
            request,
            baseUrl: this.baseUrl,
            serviceName: methodDescriptor.serviceName || methodDescriptor.service?.serviceName,
            requestType: methodDescriptor.requestType,
            responseType: methodDescriptor.responseType,
          });
        }

        // Convert plain object to Message-like object with serializeBinary method
        // Use requestType.serializeBinary from the descriptor
        const messageRequest = this.createProtoMessage(request, methodDescriptor.requestType);

        if (this.options.debug) {
          console.log('[GrpcWebAdapter] Message wrapper created:', {
            hasSerializeBinary: typeof messageRequest.serializeBinary === 'function',
            requestKeys: Object.keys(messageRequest),
          });
        }

        // Merge call-specific options with instance options
        const callMetadata = this.mergeMetadata(
          this.options.metadata,
          options?.metadata
        );

        // Convert to grpc-web compatible descriptor format
        const grpcWebDescriptor = this.toGrpcWebDescriptor(methodDescriptor);

        // Make gRPC-web unary call
        grpc.unary(grpcWebDescriptor as any, {
          request: messageRequest as any,
          host: this.baseUrl,
          metadata: callMetadata,
          onEnd: response => {
            if (this.options.debug) {
              console.log('[GrpcWebAdapter] Response received:', {
                status: response.status,
                statusMessage: response.statusMessage,
                hasMessage: !!response.message,
                headers: response.headers,
                trailers: response.trailers,
              });
            }

            if (response.status !== grpc.Code.OK) {
              const error = new GrpcError(
                response.statusMessage,
                response.status,
                methodDescriptor.methodName,
                response.trailers,
              );

              if (this.options.debug) {
                console.error(`[GrpcWebAdapter] Unary call failed:`, error);
              }

              reject(error);
              return;
            }

            if (!response.message) {
              const error = new Error('No message in response');
              reject(error);
              return;
            }

            if (this.options.debug) {
              console.log(`[GrpcWebAdapter] Unary call succeeded:`, response.message);
            }

            // Response message is already deserialized by gRPC-web
            resolve(response.message as TResponse);
          },
        });
      } catch (error) {
        if (this.options.debug) {
          console.error(`[GrpcWebAdapter] Unary call exception:`, error);
        }
        reject(error);
      }
    });
  }

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
  serverStream<TRequest, TResponse>(
    methodDescriptor: MethodDescriptor<TRequest, TResponse>,
    request: TRequest,
    options?: ICallOptions,
  ): Observable<TResponse> {
    return new Observable<TResponse>(observer => {
      const cancellationToken = new CancellationTokenImpl();

      try {
        if (this.options.debug) {
          console.log(`[GrpcWebAdapter] Server stream to ${methodDescriptor.methodName}`, request);
        }

        // Convert plain object to Message-like object with serializeBinary method
        const messageRequest = this.createProtoMessage(request, methodDescriptor.requestType);

        // Merge call-specific options with instance options
        const callMetadata = this.mergeMetadata(
          this.options.metadata,
          options?.metadata
        );

        // Convert to grpc-web compatible descriptor format
        const grpcWebDescriptor = this.toGrpcWebDescriptor(methodDescriptor);

        // Open streaming connection
        const client = grpc.invoke(grpcWebDescriptor as any, {
          request: messageRequest as any,
          host: this.baseUrl,
          metadata: callMetadata,
          onMessage: (message: any) => {
            if (!cancellationToken.isCancelled) {
              if (this.options.debug) {
                console.log(`[GrpcWebAdapter] Stream message received:`, message);
              }

              // Emit each message received from the stream
              observer.next(message as TResponse);
            }
          },
          onEnd: (code: grpc.Code, message: string, trailers: grpc.Metadata) => {
            if (code !== grpc.Code.OK) {
              const error = new GrpcError(message, code, methodDescriptor.methodName, trailers);

              if (this.options.debug) {
                console.error(`[GrpcWebAdapter] Stream ended with error:`, error);
              }

              observer.error(error);
            } else {
              if (this.options.debug) {
                console.log(`[GrpcWebAdapter] Stream completed successfully`);
              }

              observer.complete();
            }
          },
        });

        // Handle cancellation
        cancellationToken.onCancel(() => {
          if (this.options.debug) {
            console.log(`[GrpcWebAdapter] Stream cancelled`);
          }
          client.close();
        });

        // Return teardown function (called on unsubscribe)
        return () => {
          cancellationToken.cancel();
        };
      } catch (error) {
        if (this.options.debug) {
          console.error(`[GrpcWebAdapter] Stream exception:`, error);
        }
        observer.error(error);
        return () => {};
      }
    });
  }

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
  clientStream<TRequest, TResponse>(
    method: IMethodDescriptor<TRequest, TResponse>,
    options?: ICallOptions,
  ): ClientStreamingCall<TRequest, TResponse> {
    throw new Error(
      'Client streaming is not supported by gRPC-web adapter. ' +
        'Use NativeGrpcAdapter in Node.js environment for client streaming support.'
    );
  }

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
  bidiStream<TRequest, TResponse>(
    method: IMethodDescriptor<TRequest, TResponse>,
    options?: ICallOptions,
  ): BidiStreamingCall<TRequest, TResponse> {
    throw new Error(
      'Bidirectional streaming is not supported by gRPC-web adapter. ' +
        'Use NativeGrpcAdapter in Node.js environment for bidirectional streaming support.'
    );
  }

  /**
   * Close the adapter and release resources
   *
   * Note: gRPC-web doesn't maintain persistent connections, so this is a no-op.
   * Provided for interface compatibility with NativeGrpcAdapter.
   */
  close(): void {
    // gRPC-web uses HTTP/1.1 or HTTP/2 connections managed by the browser
    // No explicit cleanup needed
    if (this.options.debug) {
      console.log('[GrpcWebAdapter] Adapter closed');
    }
  }

  /**
   * Get the base URL for this adapter
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get the current client options
   */
  getOptions(): Readonly<GrpcClientOptions> {
    return { ...this.options };
  }

  /**
   * Merge metadata from multiple sources
   * @param baseMetadata - Base metadata from instance options
   * @param callMetadata - Metadata from call options
   * @returns Merged metadata
   */
  private mergeMetadata(
    baseMetadata?: grpc.Metadata,
    callMetadata?: any, // Accept any to handle different metadata types
  ): grpc.Metadata | undefined {
    if (!baseMetadata && !callMetadata) {
      return undefined;
    }

    // If call metadata is a plain object, we can't merge it with grpc.Metadata
    // Just return call metadata if it's defined, otherwise base metadata
    if (callMetadata) {
      if (typeof callMetadata === 'object' && !(callMetadata instanceof grpc.Metadata)) {
        // Plain object metadata - can't merge with grpc.Metadata easily
        // This is a limitation we accept for now
        if (this.options.debug) {
          console.warn('[GrpcWebAdapter] Call metadata as plain object not fully supported');
        }
        return baseMetadata;
      }
      // Both are grpc.Metadata - grpc-web doesn't provide a merge API
      // Use call metadata if provided
      return callMetadata as grpc.Metadata;
    }

    return baseMetadata;
  }

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
  private createProtoMessage<T>(data: T, messageType: any): any {
    // If data already has serializeBinary, use it directly
    if ((data as any).serializeBinary && typeof (data as any).serializeBinary === 'function') {
      if (this.options.debug) {
        console.log('[GrpcWebAdapter] Data already has serializeBinary, using as-is');
      }
      return data;
    }

    // Check if messageType has the serialize method
    if (!messageType || !messageType.serializeBinary) {
      if (this.options.debug) {
        console.warn('[GrpcWebAdapter] No serializeBinary found in messageType, returning data as-is');
      }
      return data;
    }

    // Create a wrapper object that includes the data and serializeBinary method
    const wrapper = Object.assign({}, data, {
      serializeBinary: () => {
        try {
          // Call the messageType's serializeBinary with the data
          const serialized = messageType.serializeBinary(data);
          if (this.options?.debug) {
            console.log('[GrpcWebAdapter] Serialized message:', {
              originalData: data,
              serializedLength: serialized?.length,
            });
          }
          return serialized;
        } catch (error) {
          console.error('[GrpcWebAdapter] Serialization error:', error);
          throw error;
        }
      }
    });

    if (this.options.debug) {
      console.log('[GrpcWebAdapter] Created proto message wrapper:', {
        hasSerializeBinary: typeof wrapper.serializeBinary === 'function',
        dataKeys: Object.keys(data as any),
      });
    }

    return wrapper;
  }

  private createMessageWrapper<T>(data: T, serializer?: MessageSerializer<T>): any {
    // If no serializer provided or data already has serializeBinary, return as-is
    if (!serializer || (data as any).serializeBinary) {
      if (this.options.debug) {
        console.log('[GrpcWebAdapter] Using data as-is (has serializeBinary):', {
          hasSerializer: !!serializer,
          hasSerializeBinary: !!(data as any).serializeBinary,
        });
      }
      return data;
    }

    if (this.options.debug) {
      console.log('[GrpcWebAdapter] Creating message wrapper with serializer');
    }

    // Create a wrapper object with serializeBinary method
    const self = this;
    const wrapper = {
      ...data,
      serializeBinary(): Uint8Array {
        try {
          const encoded = serializer.encode(data);
          if (self.options?.debug) {
            console.log('[GrpcWebAdapter] Serialized message:', {
              originalData: data,
              encodedLength: encoded.length,
              encodedBytes: Array.from(encoded.slice(0, 20)),
            });
          }
          return encoded;
        } catch (error) {
          console.error('[GrpcWebAdapter] Serialization error:', error);
          throw error;
        }
      },
    };

    return wrapper;
  }
}
