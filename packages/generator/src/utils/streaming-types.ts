/**
 * Streaming-related types and utilities for gRPC service generation
 */

import { Observable } from 'rxjs';

/**
 * Cancellation token for streaming operations
 */
export interface CancellationToken {
  /**
   * Cancel the operation
   */
  cancel(): void;

  /**
   * Whether the operation has been cancelled
   */
  readonly isCancelled: boolean;

  /**
   * Register a callback to be called when the operation is cancelled
   */
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
    if (this._isCancelled) return;
    this._isCancelled = true;
    this.cancelCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in cancellation callback:', error);
      }
    });
    // Clear callbacks to prevent memory leaks
    this.cancelCallbacks.length = 0;
  }

  onCancel(callback: () => void): void {
    if (this._isCancelled) {
      try {
        callback();
      } catch (error) {
        console.error('Error in cancellation callback:', error);
      }
    } else {
      this.cancelCallbacks.push(callback);
    }
  }
}

/**
 * Client streaming interface
 */
export interface ClientStreamingCall<TRequest, TResponse> {
  /**
   * Send a request message to the stream
   */
  send: (request: TRequest) => void;

  /**
   * Complete the request stream and get the response
   */
  complete: () => Promise<TResponse>;

  /**
   * Cancel the streaming call
   */
  cancel: () => void;
}

/**
 * Server streaming interface
 */
export interface ServerStreamingCall<TResponse> extends Observable<TResponse> {
  /**
   * Cancel the streaming call
   */
  cancel: () => void;
}

/**
 * Bidirectional streaming interface
 */
export interface BidirectionalStreamingCall<TRequest, TResponse> {
  /**
   * Send a request message to the stream
   */
  send: (request: TRequest) => void;

  /**
   * Observable stream of response messages
   */
  responses: Observable<TResponse>;

  /**
   * Complete the request stream (no more requests)
   */
  complete: () => void;

  /**
   * Cancel the streaming call
   */
  cancel: () => void;
}

/**
 * gRPC streaming error types
 */
export enum StreamingErrorCode {
  CANCELLED = 'CANCELLED',
  DEADLINE_EXCEEDED = 'DEADLINE_EXCEEDED',
  INTERNAL = 'INTERNAL',
  UNAVAILABLE = 'UNAVAILABLE',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Streaming-specific error
 */
export class StreamingError extends Error {
  constructor(
    message: string,
    public readonly code: StreamingErrorCode,
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'StreamingError';
  }
}

/**
 * Streaming method metadata
 */
export interface StreamingMethodInfo {
  name: string;
  clientStreaming: boolean;
  serverStream: boolean;
  inputType: string;
  outputType: string;
}

/**
 * Utility functions for streaming
 */
export class StreamingUtils {
  /**
   * Create a cancellation token
   */
  static createCancellationToken(): CancellationToken {
    return new CancellationTokenImpl();
  }

  /**
   * Determine streaming type from method info
   */
  static getStreamingType(
    methodInfo: StreamingMethodInfo,
  ): 'unary' | 'client_streaming' | 'server_streaming' | 'bidirectional_streaming' {
    if (methodInfo.clientStreaming && methodInfo.serverStream) {
      return 'bidirectional_streaming';
    } else if (methodInfo.clientStreaming) {
      return 'client_streaming';
    } else if (methodInfo.serverStream) {
      return 'server_streaming';
    } else {
      return 'unary';
    }
  }

  /**
   * Create a streaming error with proper context
   */
  static createStreamingError(
    message: string,
    code: StreamingErrorCode = StreamingErrorCode.UNKNOWN,
    details?: any,
  ): StreamingError {
    return new StreamingError(message, code, details);
  }

  /**
   * Wrap an Observable to handle streaming errors
   */
  static wrapStreamingObservable<T>(
    observable: Observable<T>,
    cancellationToken?: CancellationToken,
  ): Observable<T> {
    return new Observable<T>(observer => {
      let subscription: any;

      const cleanup = () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };

      if (cancellationToken) {
        cancellationToken.onCancel(() => {
          cleanup();
          observer.error(
            StreamingUtils.createStreamingError('Stream cancelled', StreamingErrorCode.CANCELLED),
          );
        });

        if (cancellationToken.isCancelled) {
          observer.error(
            StreamingUtils.createStreamingError('Stream cancelled', StreamingErrorCode.CANCELLED),
          );
          return cleanup;
        }
      }

      subscription = observable.subscribe({
        next: value => observer.next(value),
        error: err => {
          cleanup();
          if (err instanceof StreamingError) {
            observer.error(err);
          } else {
            observer.error(
              StreamingUtils.createStreamingError(
                err?.message || 'Unknown streaming error',
                StreamingErrorCode.UNKNOWN,
                err,
              ),
            );
          }
        },
        complete: () => {
          cleanup();
          observer.complete();
        },
      });

      return cleanup;
    });
  }
}
