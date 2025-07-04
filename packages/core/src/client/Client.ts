import { grpc } from '@improbable-eng/grpc-web';
import { Message } from 'google-protobuf';
import { ClientOptions } from '../types';

export class Client {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(options: ClientOptions) {
    this.baseURL = options.baseURL;
    this.timeout = options.timeout || 10000;
    this.headers = options.headers || {};
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  getTimeout(): number {
    return this.timeout;
  }

  getHeaders(): Record<string, string> {
    return this.headers;
  }

  setHeader(key: string, value: string): void {
    this.headers[key] = value;
  }

  removeHeader(key: string): void {
    delete this.headers[key];
  }

  invoke<TRequest extends Message, TResponse extends Message>(
    methodDescriptor: grpc.MethodDefinition<TRequest, TResponse>,
    request: TRequest,
    metadata?: grpc.Metadata
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      const client = grpc.client(methodDescriptor, {
        host: this.baseURL,
        transport: grpc.WebsocketTransport(),
      });

      const combinedMetadata = metadata || new grpc.Metadata();

      Object.entries(this.headers).forEach(([key, value]) => {
        combinedMetadata.set(key, value);
      });

      client.onHeaders((headers: grpc.Metadata) => {
        // Handle response headers if needed
      });

      client.onMessage((message: any) => {
        resolve(message as TResponse);
      });

      client.onEnd((code: grpc.Code, message: string) => {
        if (code !== grpc.Code.OK) {
          reject(new Error(`gRPC error: ${message} (code: ${code})`));
        }
      });

      client.start(combinedMetadata);
      client.send(request);
      client.finishSend();
    });
  }
}
