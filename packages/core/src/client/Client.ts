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

  // Original invoke method for full gRPC integration
  invoke<TRequest extends Message, TResponse extends Message>(
    methodDescriptor: grpc.MethodDefinition<TRequest, TResponse>,
    request: TRequest,
    metadata?: grpc.Metadata
  ): Promise<TResponse> {
    return new Promise((resolve, reject) => {
      console.log('Invoking gRPC method:', JSON.stringify(methodDescriptor, null, 2));
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
        console.log('Received message:', message);
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

  // Simple invoke method for generated stubs (with mock responses for demo)
  async invokeSimple(methodPath: string, request?: any): Promise<any> {
    console.log(`🚀 Hallow Client: Invoking ${methodPath}`, request);
    
    // For demo purposes, return mock responses based on method path
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    if (methodPath.includes('Greeting')) {
      return {
        message: `Hello ${request?.name || 'World'}! You are ${request?.age || 'unknown'} years old.`,
        hobbies: request?.hobbies || [],
        timestamp: Date.now(),
        success: true
      };
    }
    
    if (methodPath.includes('User')) {
      return {
        success: true,
        user: {
          id: Math.floor(Math.random() * 1000),
          username: request?.username || 'unknown',
          email: request?.email || 'unknown@example.com',
          age: request?.age || 0,
          created_at: Date.now(),
          updated_at: Date.now()
        }
      };
    }
    
    // Default response
    return {
      success: true,
      message: 'Mock response from Hallow gRPC Client',
      data: request,
      timestamp: Date.now()
    };
  }

  // Stream method for streaming operations
  stream(methodPath: string, request?: any): any {
    console.log(`🌊 Hallow Client: Creating stream for ${methodPath}`, request);
    
    // Return a simple stream-like object for demo
    return {
      on: (event: string, callback: Function) => {
        if (event === 'data') {
          // Simulate streaming data
          const interval = setInterval(() => {
            callback({
              id: Math.floor(Math.random() * 1000),
              message: `Stream message from ${methodPath}`,
              timestamp: Date.now()
            });
          }, 1000);
          
          // Stop after 5 messages
          setTimeout(() => clearInterval(interval), 5000);
        }
      },
      write: (data: any) => {
        console.log(`📤 Stream write:`, data);
      },
      close: () => {
        console.log(`🔒 Stream closed for ${methodPath}`);
      }
    };
  }
}
