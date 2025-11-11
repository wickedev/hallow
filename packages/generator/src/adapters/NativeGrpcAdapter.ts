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
  Metadata,
} from './types';
import { MetadataConverter } from './metadata';
import {
  GrpcError,
  GrpcStatusCode,
  convertGrpcError,
  toGrpcError,
} from './errors';
import { RetryPolicy, type RetryConfig } from './retry';

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
  private readonly retryPolicy: RetryPolicy | null;
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
    if (!config.serverUrl || config.serverUrl.trim() === '') {
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

      // Initialize retry policy
      if (config.retryConfig === false) {
        // Explicitly disabled
        this.retryPolicy = null;
      } else if (config.retryConfig) {
        // Custom retry configuration
        this.retryPolicy = new RetryPolicy(config.retryConfig);
      } else {
        // Default retry configuration
        this.retryPolicy = new RetryPolicy({
          maxRetries: 3,
          initialBackoffMs: 100,
          maxBackoffMs: 10000,
        });
      }

      if (this.config.debug) {
        console.log(
          `[NativeGrpcAdapter] Created adapter for ${this.serverAddress}`
        );
        if (this.retryPolicy) {
          const retryConfig = this.retryPolicy.getConfig();
          console.log(
            `[NativeGrpcAdapter] Retry policy enabled: maxRetries=${retryConfig.maxRetries}`
          );
        } else {
          console.log('[NativeGrpcAdapter] Retry policy disabled');
        }
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
  async unary<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    request: TRequest,
    options?: CallOptions
  ): Promise<TResponse> {
    this.ensureNotClosed();

    // If retry policy is enabled, wrap call with retry logic
    if (this.retryPolicy) {
      return this.retryPolicy.execute(() =>
        this.executeUnaryCall(method, request, options)
      );
    }

    // No retry - execute directly
    return this.executeUnaryCall(method, request, options);
  }

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
  private executeUnaryCall<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    request: TRequest,
    options?: CallOptions
  ): Promise<TResponse> {
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
  serverStream<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    request: TRequest,
    options?: CallOptions
  ): Observable<TResponse> {
    this.ensureNotClosed();

    return new Observable<TResponse>((observer) => {
      // Construct full method path: /ServiceName/MethodName
      const methodPath = this.getMethodPath(method);

      // Create metadata from options
      const metadata = this.createMetadata(options);

      // Calculate deadline
      const deadline = this.calculateDeadline(options);

      // Create serializer and deserializer
      const serialize = this.createSerializer(method);
      const deserialize = this.createDeserializer(method);

      // Storage for metadata and trailers (for this specific stream)
      let streamMetadata: grpc.Metadata | undefined;
      let streamTrailers: grpc.Metadata | undefined;

      // Make server streaming call
      const stream = this.client.makeServerStreamRequest(
        methodPath,
        serialize,
        deserialize,
        request,
        metadata,
        { deadline }
      );

      if (this.config.debug) {
        console.log(`[NativeGrpcAdapter] Starting server stream: ${methodPath}`);
      }

      /**
       * Handle 'metadata' event - initial metadata from server
       *
       * Emitted when server sends initial metadata (headers).
       * This happens before any data events.
       */
      stream.on('metadata', (receivedMetadata: grpc.Metadata) => {
        streamMetadata = receivedMetadata;

        if (this.config.debug) {
          console.log(
            `[NativeGrpcAdapter] Received initial metadata:`,
            receivedMetadata.getMap()
          );
        }
      });

      /**
       * Handle 'data' events - each response message
       *
       * Emitted for every message the server sends.
       * We emit each response to the Observable subscriber.
       * Note: RxJS SafeSubscriber handles errors thrown in observer.next()
       */
      stream.on('data', (response: TResponse) => {
        observer.next(response);
      });

      /**
       * Handle 'end' event - stream completed successfully
       *
       * Emitted when server closes the stream normally.
       * We complete the Observable.
       */
      stream.on('end', () => {
        if (this.config.debug) {
          console.log(`[NativeGrpcAdapter] Stream ended: ${methodPath}`);
        }
        observer.complete();
      });

      /**
       * Handle 'error' event - stream failed
       *
       * Emitted when an error occurs during streaming.
       * We convert the error and propagate to the Observable.
       */
      stream.on('error', (error: grpc.ServiceError) => {
        if (this.config.debug) {
          console.error(
            `[NativeGrpcAdapter] Stream error:`,
            error.message,
            error.code
          );
        }
        observer.error(this.convertError(error, method.methodName));
      });

      /**
       * Handle 'status' event - final status and trailing metadata
       *
       * Always emitted at the end (success or failure).
       * Contains trailing metadata and final status code.
       */
      stream.on('status', (status: grpc.StatusObject) => {
        streamTrailers = status.metadata;

        if (this.config.debug) {
          console.log(
            `[NativeGrpcAdapter] Stream status:`,
            status.code,
            status.details
          );
        }
      });

      /**
       * Cleanup function - called when Observable is unsubscribed
       *
       * Critical for resource management:
       * - Cancels the stream if still active
       * - Notifies server of cancellation
       * - Prevents memory leaks
       */
      return () => {
        if (this.config.debug) {
          console.log(`[NativeGrpcAdapter] Cancelling stream: ${methodPath}`);
        }

        try {
          // Cancel the stream - notifies server
          stream.cancel();
        } catch (error) {
          // Stream may already be closed - ignore errors
          if (this.config.debug) {
            console.error(
              '[NativeGrpcAdapter] Error cancelling stream:',
              error
            );
          }
        }
      };
    });
  }

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
  clientStream<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    options?: CallOptions
  ): ClientStreamingCall<TRequest, TResponse> {
    this.ensureNotClosed();

    // Validate that this is a client streaming RPC
    if (!method.requestStream || method.responseStream) {
      throw new Error(
        `Method ${method.methodName} is not a client streaming RPC ` +
          `(requestStream=${method.requestStream}, responseStream=${method.responseStream})`
      );
    }

    // Construct full method path: /ServiceName/MethodName
    const methodPath = this.getMethodPath(method);

    // Create metadata from options
    const metadata = this.createMetadata(options);

    // Calculate deadline
    const deadline = this.calculateDeadline(options);

    // Create serializer and deserializer
    const serialize = this.createSerializer(method);
    const deserialize = this.createDeserializer(method);

    // Storage for response and error
    let responsePromiseResolve: ((value: TResponse) => void) | null = null;
    let responsePromiseReject: ((error: Error) => void) | null = null;
    let isStreamWritable = true;
    let streamCancelled = false;

    // Create response promise
    const responsePromise = new Promise<TResponse>((resolve, reject) => {
      responsePromiseResolve = resolve;
      responsePromiseReject = reject;
    });

    // Make client streaming call
    const stream = this.client.makeClientStreamRequest(
      methodPath,
      serialize,
      deserialize,
      metadata,
      { deadline },
      (error: grpc.ServiceError | null, response?: TResponse) => {
        if (error) {
          // Error occurred - convert and reject
          responsePromiseReject?.(this.convertError(error, method.methodName));
          return;
        }

        if (!response) {
          // No response received (shouldn't happen for successful calls)
          responsePromiseReject?.(
            new GrpcError(
              `No response received from ${method.methodName}`,
              GrpcStatusCode.UNKNOWN,
              method.methodName
            )
          );
          return;
        }

        // Success - resolve with response
        responsePromiseResolve?.(response);
      }
    );

    if (this.config.debug) {
      console.log(`[NativeGrpcAdapter] Starting client stream: ${methodPath}`);
    }

    // Handle stream events
    stream.on('error', (error: grpc.ServiceError) => {
      if (this.config.debug) {
        console.error(
          `[NativeGrpcAdapter] Client stream error:`,
          error.message,
          error.code
        );
      }
      isStreamWritable = false;
    });

    stream.on('finish', () => {
      if (this.config.debug) {
        console.log(`[NativeGrpcAdapter] Client stream finished: ${methodPath}`);
      }
      isStreamWritable = false;
    });

    // Return ClientStreamingCall interface
    return {
      /**
       * Write a request message to the stream
       * @param request - Request message to send
       * @throws Error if stream is closed or not writable
       */
      write: (request: TRequest): void => {
        if (!isStreamWritable || streamCancelled) {
          throw new Error(
            `Cannot write to ${method.methodName}: stream is not writable`
          );
        }

        try {
          stream.write(request);
        } catch (error) {
          isStreamWritable = false;
          throw new Error(
            `Failed to write to stream: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      },

      /**
       * Signal that no more requests will be sent
       * This triggers the server to send its response.
       */
      end: (): void => {
        if (streamCancelled) {
          return;
        }

        try {
          stream.end();
          isStreamWritable = false;

          if (this.config.debug) {
            console.log(`[NativeGrpcAdapter] Client stream ended: ${methodPath}`);
          }
        } catch (error) {
          if (this.config.debug) {
            console.error(
              '[NativeGrpcAdapter] Error ending client stream:',
              error
            );
          }
        }
      },

      /**
       * Get the response from the server
       * This promise resolves after end() is called and the server has sent its response.
       *
       * @returns Promise that resolves with the server's response
       */
      getResponse: (): Promise<TResponse> => {
        return responsePromise;
      },

      /**
       * Cancel the streaming call
       * Closes the stream and notifies the server.
       */
      cancel: (): void => {
        if (streamCancelled) {
          return;
        }

        streamCancelled = true;
        isStreamWritable = false;

        try {
          stream.cancel();

          if (this.config.debug) {
            console.log(
              `[NativeGrpcAdapter] Client stream cancelled: ${methodPath}`
            );
          }

          // Reject the response promise
          responsePromiseReject?.(
            new GrpcError(
              `${method.methodName} was cancelled`,
              GrpcStatusCode.CANCELLED,
              method.methodName
            )
          );
        } catch (error) {
          if (this.config.debug) {
            console.error(
              '[NativeGrpcAdapter] Error cancelling client stream:',
              error
            );
          }
        }
      },

      /**
       * Check if the stream is still writable
       */
      get writable(): boolean {
        return isStreamWritable && !streamCancelled;
      },
    };
  }

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
  bidiStream<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    options?: CallOptions
  ): BidiStreamingCall<TRequest, TResponse> {
    this.ensureNotClosed();

    // Validate that this is a bidirectional streaming RPC
    if (!method.requestStream || !method.responseStream) {
      throw new Error(
        `Method ${method.methodName} is not a bidirectional streaming RPC ` +
          `(requestStream=${method.requestStream}, responseStream=${method.responseStream})`
      );
    }

    // Construct full method path: /ServiceName/MethodName
    const methodPath = this.getMethodPath(method);

    // Create metadata from options
    const metadata = this.createMetadata(options);

    // Calculate deadline
    const deadline = this.calculateDeadline(options);

    // Create serializer and deserializer
    const serialize = this.createSerializer(method);
    const deserialize = this.createDeserializer(method);

    // Storage for stream state
    let isStreamWritable = true;
    let streamCancelled = false;
    let responsesObservable: Observable<TResponse> | null = null;

    // Make bidirectional streaming call
    const stream = this.client.makeBidiStreamRequest(
      methodPath,
      serialize,
      deserialize,
      metadata,
      { deadline }
    );

    if (this.config.debug) {
      console.log(`[NativeGrpcAdapter] Starting bidi stream: ${methodPath}`);
    }

    // Handle stream events for write side
    stream.on('error', (error: grpc.ServiceError) => {
      if (this.config.debug) {
        console.error(
          `[NativeGrpcAdapter] Bidi stream error:`,
          error.message,
          error.code
        );
      }
      isStreamWritable = false;
    });

    stream.on('finish', () => {
      if (this.config.debug) {
        console.log(`[NativeGrpcAdapter] Bidi stream write side finished: ${methodPath}`);
      }
      isStreamWritable = false;
    });

    // Return BidiStreamingCall interface
    return {
      /**
       * Write a request message to the stream
       * @param request - Request message to send
       * @throws Error if stream is closed or not writable
       */
      write: (request: TRequest): void => {
        if (!isStreamWritable || streamCancelled) {
          throw new Error(
            `Cannot write to ${method.methodName}: stream is not writable`
          );
        }

        try {
          stream.write(request);
        } catch (error) {
          isStreamWritable = false;
          throw new Error(
            `Failed to write to stream: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      },

      /**
       * Signal that no more requests will be sent
       * The server may continue sending responses after the client ends.
       */
      end: (): void => {
        if (streamCancelled) {
          return;
        }

        try {
          stream.end();
          isStreamWritable = false;

          if (this.config.debug) {
            console.log(`[NativeGrpcAdapter] Bidi stream write side ended: ${methodPath}`);
          }
        } catch (error) {
          if (this.config.debug) {
            console.error(
              '[NativeGrpcAdapter] Error ending bidi stream write side:',
              error
            );
          }
        }
      },

      /**
       * Get an Observable of response messages from the server
       * Messages can be received before, during, and after client writes.
       *
       * @returns Observable stream of response messages
       */
      responses: (): Observable<TResponse> => {
        // Create Observable lazily (only once)
        if (!responsesObservable) {
          responsesObservable = new Observable<TResponse>((observer) => {
            /**
             * Handle 'data' events - each response message
             *
             * Emitted for every message the server sends.
             * We emit each response to the Observable subscriber.
             */
            stream.on('data', (response: TResponse) => {
              observer.next(response);
            });

            /**
             * Handle 'end' event - stream completed successfully
             *
             * Emitted when server closes the stream normally.
             * We complete the Observable.
             */
            stream.on('end', () => {
              if (this.config.debug) {
                console.log(`[NativeGrpcAdapter] Bidi stream ended: ${methodPath}`);
              }
              observer.complete();
            });

            /**
             * Handle 'error' event - stream failed
             *
             * Emitted when an error occurs during streaming.
             * We convert the error and propagate to the Observable.
             */
            stream.on('error', (error: grpc.ServiceError) => {
              observer.error(this.convertError(error, method.methodName));
            });

            /**
             * Handle 'metadata' event - initial metadata from server
             *
             * Emitted when server sends initial metadata (headers).
             */
            stream.on('metadata', (receivedMetadata: grpc.Metadata) => {
              if (this.config.debug) {
                console.log(
                  `[NativeGrpcAdapter] Bidi stream received metadata:`,
                  receivedMetadata.getMap()
                );
              }
            });

            /**
             * Handle 'status' event - final status and trailing metadata
             *
             * Always emitted at the end (success or failure).
             */
            stream.on('status', (status: grpc.StatusObject) => {
              if (this.config.debug) {
                console.log(
                  `[NativeGrpcAdapter] Bidi stream status:`,
                  status.code,
                  status.details
                );
              }
            });

            /**
             * Cleanup function - called when Observable is unsubscribed
             *
             * Note: This does NOT cancel the stream automatically.
             * The stream continues until cancel() is explicitly called.
             */
            return () => {
              // No automatic cancellation - stream remains active
              // Call cancel() explicitly if needed
            };
          });
        }

        return responsesObservable;
      },

      /**
       * Cancel the streaming call
       * Closes both the request and response streams.
       */
      cancel: (): void => {
        if (streamCancelled) {
          return;
        }

        streamCancelled = true;
        isStreamWritable = false;

        try {
          stream.cancel();

          if (this.config.debug) {
            console.log(
              `[NativeGrpcAdapter] Bidi stream cancelled: ${methodPath}`
            );
          }
        } catch (error) {
          if (this.config.debug) {
            console.error(
              '[NativeGrpcAdapter] Error cancelling bidi stream:',
              error
            );
          }
        }
      },

      /**
       * Check if the stream is still writable
       */
      get writable(): boolean {
        return isStreamWritable && !streamCancelled;
      },
    };
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
  private convertError(error: any, methodName: string): GrpcError {
    // Convert using StatusCodeMapper
    const grpcError = toGrpcError(error, methodName);

    // Log error details in debug mode
    if (this.config.debug) {
      console.error(
        `[NativeGrpcAdapter] Error in ${methodName}:`,
        grpcError.toDebugMessage()
      );
    }

    return grpcError;
  }
}
