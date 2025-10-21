/**
 * GrpcWebAdapter - Wrapper around @improbable-eng/grpc-web for type-safe gRPC communication
 *
 * This adapter provides a clean abstraction over the gRPC-web library, handling:
 * - Unary RPC calls with Promise API
 * - Server streaming RPC calls with Observable API
 * - Error handling with typed GrpcError
 * - Request/response serialization
 */

import { grpc } from '@improbable-eng/grpc-web';
import { Observable } from 'rxjs';

/**
 * Method descriptor for gRPC-web method calls
 */
export interface MethodDescriptor<TRequest = any, TResponse = any> {
  methodName: string;
  service: { serviceName: string };
  requestStream: boolean;
  responseStream: boolean;
  requestType: any;
  responseType: any;
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
    public readonly metadata?: grpc.Metadata
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
export class GrpcWebAdapter {
  private readonly options: GrpcClientOptions;

  /**
   * Create a new GrpcWebAdapter
   * @param baseUrl - Base URL for the gRPC server (e.g., 'https://api.example.com')
   * @param options - Optional client configuration
   */
  constructor(
    private readonly baseUrl: string,
    options?: GrpcClientOptions
  ) {
    this.options = {
      timeout: options?.timeout,
      metadata: options?.metadata,
      debug: options?.debug ?? false,
    };
  }

  /**
   * Make a unary RPC call
   *
   * Sends a single request and receives a single response.
   *
   * @param methodDescriptor - Method descriptor containing service and method metadata
   * @param request - Request message
   * @returns Promise resolving to response message
   * @throws {GrpcError} If the gRPC call fails or returns a non-OK status
   *
   * @example
   * ```typescript
   * const response = await adapter.unary(
   *   UserService.GetUserDescriptor,
   *   { userId: '123' }
   * );
   * console.log(response.name);
   * ```
   */
  async unary<TRequest, TResponse>(
    methodDescriptor: MethodDescriptor<TRequest, TResponse>,
    request: TRequest
  ): Promise<TResponse> {
    return new Promise<TResponse>((resolve, reject) => {
      try {
        if (this.options.debug) {
          console.log(`[GrpcWebAdapter] Unary call to ${methodDescriptor.methodName}`, request);
        }

        // Make gRPC-web unary call
        grpc.unary(methodDescriptor as any, {
          request: request as any,
          host: this.baseUrl,
          metadata: this.options.metadata,
          onEnd: (response) => {
            if (response.status !== grpc.Code.OK) {
              const error = new GrpcError(
                response.statusMessage,
                response.status,
                methodDescriptor.methodName,
                response.trailers
              );

              if (this.options.debug) {
                console.error(`[GrpcWebAdapter] Unary call failed:`, error);
              }

              reject(error);
              return;
            }

            if (this.options.debug) {
              console.log(`[GrpcWebAdapter] Unary call succeeded:`, response.message);
            }

            // Response message is already deserialized by gRPC-web
            resolve(response.message as TResponse);
          }
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
   * @returns Observable stream of response messages
   *
   * @example
   * ```typescript
   * const stream = adapter.serverStream(
   *   UserService.ListUsersDescriptor,
   *   { pageSize: 10 }
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
    request: TRequest
  ): Observable<TResponse> {
    return new Observable<TResponse>(observer => {
      const cancellationToken = new CancellationTokenImpl();

      try {
        if (this.options.debug) {
          console.log(`[GrpcWebAdapter] Server stream to ${methodDescriptor.methodName}`, request);
        }

        // Open streaming connection
        const client = grpc.invoke(methodDescriptor as any, {
          request: request as any,
          host: this.baseUrl,
          metadata: this.options.metadata,
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
              const error = new GrpcError(
                message,
                code,
                methodDescriptor.methodName,
                trailers
              );

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
          }
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
}
