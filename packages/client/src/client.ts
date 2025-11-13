/**
 * gRPC-web client implementation
 */

import { grpc } from '@improbable-eng/grpc-web';

export interface GrpcWebClientOptions {
  serverUrl: string;
  debug?: boolean;
  transport?: grpc.TransportFactory;
}

/**
 * Base class for generated gRPC service stubs
 */
export class GrpcWebClient {
  protected serverUrl: string;
  protected options: GrpcWebClientOptions;

  constructor(serverUrl: string, options: Partial<GrpcWebClientOptions> = {}) {
    this.serverUrl = serverUrl;
    this.options = {
      serverUrl,
      debug: false,
      ...options,
    };
  }

  /**
   * Make a unary gRPC call
   */
  protected async unaryCall<TRequest, TResponse>(
    methodDescriptor: grpc.MethodDefinition<TRequest, TResponse>,
    request: TRequest
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      grpc.unary(methodDescriptor, {
        request,
        host: this.serverUrl,
        onEnd: (response) => {
          const { status, statusMessage, message } = response;

          if (status === grpc.Code.OK && message) {
            resolve(message as TResponse);
          } else {
            const error = new Error(statusMessage || 'gRPC call failed') as any;
            error.code = status;
            reject(error);
          }
        },
      });
    });
  }

  /**
   * Create a server streaming call
   */
  protected serverStream<TRequest, TResponse>(
    methodDescriptor: grpc.MethodDefinition<TRequest, TResponse>,
    request: TRequest
  ): AsyncIterable<TResponse> {
    const messages: TResponse[] = [];
    let resolveIterator: ((value: IteratorResult<TResponse>) => void) | null = null;
    let rejectIterator: ((error: Error) => void) | null = null;
    let done = false;

    const client = grpc.invoke(methodDescriptor, {
      request,
      host: this.serverUrl,
      onMessage: (message) => {
        messages.push(message as TResponse);
        if (resolveIterator) {
          resolveIterator({ value: message as TResponse, done: false });
          resolveIterator = null;
        }
      },
      onEnd: (status, statusMessage) => {
        done = true;
        if (status !== grpc.Code.OK) {
          const error = new Error(statusMessage || 'Stream ended with error') as any;
          error.code = status;
          if (rejectIterator) {
            rejectIterator(error);
            rejectIterator = null;
          }
        } else if (resolveIterator) {
          resolveIterator({ value: undefined as any, done: true });
          resolveIterator = null;
        }
      },
    });

    return {
      [Symbol.asyncIterator]() {
        let index = 0;
        return {
          async next(): Promise<IteratorResult<TResponse>> {
            if (index < messages.length) {
              return { value: messages[index++], done: false };
            }
            if (done) {
              return { value: undefined as any, done: true };
            }
            return new Promise((resolve, reject) => {
              resolveIterator = resolve;
              rejectIterator = reject;
            });
          },
        };
      },
    };
  }
}
