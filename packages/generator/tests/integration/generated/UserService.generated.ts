import { BinaryReader, BinaryWriter, Message } from 'google-protobuf';
import { grpc } from '@improbable-eng/grpc-web';
import { GrpcClientOptions, GrpcError, GrpcWebAdapter, isGrpcError } from '@hallow/generator';
import { Observable } from 'rxjs';
import { AdapterFactory, type AdapterFactoryConfig, type AdapterType, type BidiStreamingCall, type CallOptions, type ClientStreamingCall, type ITransportAdapter, type MessageType, type MethodDescriptor } from '@hallow/generator/adapters';


;

/**
 * Interface for GetUserRequest message
 */
export interface GetUserRequest {
  /** Field user_id (string) */
  userId?: string | undefined;
}

export namespace GetUserRequest {
  /**
   * Encode GetUserRequest message to protobuf format
   */
  export function encode(message: GetUserRequest): Uint8Array {
    const writer = new BinaryWriter();

    if (message.userId !== undefined) {
      writer.writeString(1, message.userId);
    }

    return writer.getResultBuffer();
  }

  /**
   * Decode GetUserRequest message from protobuf format
   */
  export function decode(bytes: Uint8Array): GetUserRequest {
    const reader = new BinaryReader(bytes);
    const message: GetUserRequest = {
      userId: "",
    };

    while (reader.nextField()) {
      const fieldNumber = reader.getFieldNumber();

      switch (fieldNumber) {
        case 1:
          message.userId = reader.readString();
          break;
        default:
          reader.skipField();
          break;
      }
    }

    return message;
  }

  /**
   * Protobuf Message class for GetUserRequest
   * Compatible with @improbable-eng/grpc-web
   */
  export class Message {
    userId?: string | undefined;

    constructor(init?: Partial<GetUserRequest>) {
      if (init) {
        Object.assign(this, init);
      }
    }

    toObject(): GetUserRequest {
      return {
        userId: this.userId,
      };
    }

    serializeBinary(): Uint8Array {
      return encode(this.toObject());
    }

    static deserializeBinary(bytes: Uint8Array): Message {
      const decoded = decode(bytes);
      return new Message(decoded);
    }
  }
}

/**
 * Interface for GetUserResponse message
 */
export interface GetUserResponse {
  /** Field id (string) */
  id?: string | undefined;
  /** Field name (string) */
  name?: string | undefined;
  /** Field email (string) */
  email?: string | undefined;
}

export namespace GetUserResponse {
  /**
   * Encode GetUserResponse message to protobuf format
   */
  export function encode(message: GetUserResponse): Uint8Array {
    const writer = new BinaryWriter();

    if (message.id !== undefined) {
      writer.writeString(1, message.id);
    }
    if (message.name !== undefined) {
      writer.writeString(2, message.name);
    }
    if (message.email !== undefined) {
      writer.writeString(3, message.email);
    }

    return writer.getResultBuffer();
  }

  /**
   * Decode GetUserResponse message from protobuf format
   */
  export function decode(bytes: Uint8Array): GetUserResponse {
    const reader = new BinaryReader(bytes);
    const message: GetUserResponse = {
      id: "",
      name: "",
      email: "",
    };

    while (reader.nextField()) {
      const fieldNumber = reader.getFieldNumber();

      switch (fieldNumber) {
        case 1:
          message.id = reader.readString();
          break;
        case 2:
          message.name = reader.readString();
          break;
        case 3:
          message.email = reader.readString();
          break;
        default:
          reader.skipField();
          break;
      }
    }

    return message;
  }

  /**
   * Protobuf Message class for GetUserResponse
   * Compatible with @improbable-eng/grpc-web
   */
  export class Message {
    id?: string | undefined;
    name?: string | undefined;
    email?: string | undefined;

    constructor(init?: Partial<GetUserResponse>) {
      if (init) {
        Object.assign(this, init);
      }
    }

    toObject(): GetUserResponse {
      return {
        id: this.id,
        name: this.name,
        email: this.email,
      };
    }

    serializeBinary(): Uint8Array {
      return encode(this.toObject());
    }

    static deserializeBinary(bytes: Uint8Array): Message {
      const decoded = decode(bytes);
      return new Message(decoded);
    }
  }
}

/**
 * Interface for ListUsersRequest message
 */
export interface ListUsersRequest {
  /** Field page_size (int32) */
  pageSize?: number | undefined;
  /** Field page_token (string) */
  pageToken?: string | undefined;
}

export namespace ListUsersRequest {
  /**
   * Encode ListUsersRequest message to protobuf format
   */
  export function encode(message: ListUsersRequest): Uint8Array {
    const writer = new BinaryWriter();

    if (message.pageSize !== undefined) {
      writer.writeInt32(1, message.pageSize);
    }
    if (message.pageToken !== undefined) {
      writer.writeString(2, message.pageToken);
    }

    return writer.getResultBuffer();
  }

  /**
   * Decode ListUsersRequest message from protobuf format
   */
  export function decode(bytes: Uint8Array): ListUsersRequest {
    const reader = new BinaryReader(bytes);
    const message: ListUsersRequest = {
      pageSize: 0,
      pageToken: "",
    };

    while (reader.nextField()) {
      const fieldNumber = reader.getFieldNumber();

      switch (fieldNumber) {
        case 1:
          message.pageSize = reader.readInt32();
          break;
        case 2:
          message.pageToken = reader.readString();
          break;
        default:
          reader.skipField();
          break;
      }
    }

    return message;
  }

  /**
   * Protobuf Message class for ListUsersRequest
   * Compatible with @improbable-eng/grpc-web
   */
  export class Message {
    pageSize?: number | undefined;
    pageToken?: string | undefined;

    constructor(init?: Partial<ListUsersRequest>) {
      if (init) {
        Object.assign(this, init);
      }
    }

    toObject(): ListUsersRequest {
      return {
        pageSize: this.pageSize,
        pageToken: this.pageToken,
      };
    }

    serializeBinary(): Uint8Array {
      return encode(this.toObject());
    }

    static deserializeBinary(bytes: Uint8Array): Message {
      const decoded = decode(bytes);
      return new Message(decoded);
    }
  }
}

/**
 * Interface for ListUsersResponse message
 */
export interface ListUsersResponse {
  /** Field users (GetUserResponse) */
  users: GetUserResponse[];
  /** Field next_page_token (string) */
  nextPageToken?: string | undefined;
}

export namespace ListUsersResponse {
  /**
   * Encode ListUsersResponse message to protobuf format
   */
  export function encode(message: ListUsersResponse): Uint8Array {
    const writer = new BinaryWriter();

    if (message.users !== undefined) {
      for (const item of message.users) {
        writer.writeMessage(1, item, GetUserResponse.encode);
      }
    }
    if (message.nextPageToken !== undefined) {
      writer.writeString(2, message.nextPageToken);
    }

    return writer.getResultBuffer();
  }

  /**
   * Decode ListUsersResponse message from protobuf format
   */
  export function decode(bytes: Uint8Array): ListUsersResponse {
    const reader = new BinaryReader(bytes);
    const message: ListUsersResponse = {
      users: [],
      nextPageToken: "",
    };

    while (reader.nextField()) {
      const fieldNumber = reader.getFieldNumber();

      switch (fieldNumber) {
        case 1:
          if (!message.users) {
            message.users = [];
          }
          const bytes = reader.readBytes();
          message.users.push(GetUserResponse.decode(bytes));
          break;
        case 2:
          message.nextPageToken = reader.readString();
          break;
        default:
          reader.skipField();
          break;
      }
    }

    return message;
  }

  /**
   * Protobuf Message class for ListUsersResponse
   * Compatible with @improbable-eng/grpc-web
   */
  export class Message {
    users: GetUserResponse[];
    nextPageToken?: string | undefined;

    constructor(init?: Partial<ListUsersResponse>) {
      this.users = [];
      if (init) {
        Object.assign(this, init);
      }
    }

    toObject(): ListUsersResponse {
      return {
        users: this.users,
        nextPageToken: this.nextPageToken,
      };
    }

    serializeBinary(): Uint8Array {
      return encode(this.toObject());
    }

    static deserializeBinary(bytes: Uint8Array): Message {
      const decoded = decode(bytes);
      return new Message(decoded);
    }
  }
}

/**
 * Interface for CreateUserRequest message
 */
export interface CreateUserRequest {
  /** Field name (string) */
  name?: string | undefined;
  /** Field email (string) */
  email?: string | undefined;
}

export namespace CreateUserRequest {
  /**
   * Encode CreateUserRequest message to protobuf format
   */
  export function encode(message: CreateUserRequest): Uint8Array {
    const writer = new BinaryWriter();

    if (message.name !== undefined) {
      writer.writeString(1, message.name);
    }
    if (message.email !== undefined) {
      writer.writeString(2, message.email);
    }

    return writer.getResultBuffer();
  }

  /**
   * Decode CreateUserRequest message from protobuf format
   */
  export function decode(bytes: Uint8Array): CreateUserRequest {
    const reader = new BinaryReader(bytes);
    const message: CreateUserRequest = {
      name: "",
      email: "",
    };

    while (reader.nextField()) {
      const fieldNumber = reader.getFieldNumber();

      switch (fieldNumber) {
        case 1:
          message.name = reader.readString();
          break;
        case 2:
          message.email = reader.readString();
          break;
        default:
          reader.skipField();
          break;
      }
    }

    return message;
  }

  /**
   * Protobuf Message class for CreateUserRequest
   * Compatible with @improbable-eng/grpc-web
   */
  export class Message {
    name?: string | undefined;
    email?: string | undefined;

    constructor(init?: Partial<CreateUserRequest>) {
      if (init) {
        Object.assign(this, init);
      }
    }

    toObject(): CreateUserRequest {
      return {
        name: this.name,
        email: this.email,
      };
    }

    serializeBinary(): Uint8Array {
      return encode(this.toObject());
    }

    static deserializeBinary(bytes: Uint8Array): Message {
      const decoded = decode(bytes);
      return new Message(decoded);
    }
  }
}

/**
 * Interface for StreamMessage message
 */
export interface StreamMessage {
  /** Field content (string) */
  content?: string | undefined;
  /** Field timestamp (int64) */
  timestamp?: string | undefined;
}

export namespace StreamMessage {
  /**
   * Encode StreamMessage message to protobuf format
   */
  export function encode(message: StreamMessage): Uint8Array {
    const writer = new BinaryWriter();

    if (message.content !== undefined) {
      writer.writeString(1, message.content);
    }
    if (message.timestamp !== undefined) {
      writer.writeInt64String(2, message.timestamp);
    }

    return writer.getResultBuffer();
  }

  /**
   * Decode StreamMessage message from protobuf format
   */
  export function decode(bytes: Uint8Array): StreamMessage {
    const reader = new BinaryReader(bytes);
    const message: StreamMessage = {
      content: "",
      timestamp: "0",
    };

    while (reader.nextField()) {
      const fieldNumber = reader.getFieldNumber();

      switch (fieldNumber) {
        case 1:
          message.content = reader.readString();
          break;
        case 2:
          message.timestamp = reader.readInt64String();
          break;
        default:
          reader.skipField();
          break;
      }
    }

    return message;
  }

  /**
   * Protobuf Message class for StreamMessage
   * Compatible with @improbable-eng/grpc-web
   */
  export class Message {
    content?: string | undefined;
    timestamp?: string | undefined;

    constructor(init?: Partial<StreamMessage>) {
      if (init) {
        Object.assign(this, init);
      }
    }

    toObject(): StreamMessage {
      return {
        content: this.content,
        timestamp: this.timestamp,
      };
    }

    serializeBinary(): Uint8Array {
      return encode(this.toObject());
    }

    static deserializeBinary(bytes: Uint8Array): Message {
      const decoded = decode(bytes);
      return new Message(decoded);
    }
  }
}

/**
 * Generated gRPC service stubs
 * @generated
 *
 * This file provides service stubs with support for both gRPC-web and native gRPC transports.
 * The adapter is automatically selected based on the runtime environment:
 * - Browser: Uses GrpcWebAdapter (HTTP/1.1 with gRPC-web protocol)
 * - Node.js: Uses NativeGrpcAdapter (HTTP/2 with native gRPC)
 *
 * You can also explicitly specify the adapter type in the constructor options.
 */

;
;
;
;
;

/**
 * Configuration options for UserServiceStub
 */
export interface UserServiceStubConfig {
  /**
   * Server URL or address
   * - For gRPC-web: HTTP(S) URL (e.g., 'https://api.example.com')
   * - For native gRPC: host:port (e.g., 'localhost:50051')
   */
  serverUrl: string;

  /**
   * Transport adapter type
   * - 'auto': Automatically select based on environment (default)
   * - 'grpc-web': Force use of gRPC-web adapter (browser-compatible)
   * - 'native': Force use of native gRPC adapter (Node.js only)
   *
   * @default 'auto'
   */
  adapterType?: AdapterType;

  /**
   * Use secure connection (TLS/SSL)
   * @default false for native gRPC, true for gRPC-web with HTTPS URL
   */
  secure?: boolean;

  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;

  /**
   * Default call options applied to all RPC methods
   */
  defaultCallOptions?: CallOptions;
}

/**
 * Method descriptor for GetUser RPC
 * Contains metadata required for making gRPC calls with any transport adapter
 */
const GetUserDescriptor: MethodDescriptor<GetUserRequest, GetUserResponse> = {
  serviceName: 'test.services.UserService',
  methodName: 'GetUser',
  requestStream: false,
  responseStream: false,
  requestType: {
    serializeBinary: (msg: GetUserRequest) => GetUserRequest.toBinary(msg),
    deserializeBinary: (bytes: Uint8Array) => GetUserRequest.fromBinary(bytes),
  } as MessageType<GetUserRequest>,
  responseType: {
    serializeBinary: (msg: GetUserResponse) => GetUserResponse.toBinary(msg),
    deserializeBinary: (bytes: Uint8Array) => GetUserResponse.fromBinary(bytes),
  } as MessageType<GetUserResponse>,
};

/**
 * Method descriptor for ListUsers RPC
 * Contains metadata required for making gRPC calls with any transport adapter
 */
const ListUsersDescriptor: MethodDescriptor<ListUsersRequest, ListUsersResponse> = {
  serviceName: 'test.services.UserService',
  methodName: 'ListUsers',
  requestStream: false,
  responseStream: true,
  requestType: {
    serializeBinary: (msg: ListUsersRequest) => ListUsersRequest.toBinary(msg),
    deserializeBinary: (bytes: Uint8Array) => ListUsersRequest.fromBinary(bytes),
  } as MessageType<ListUsersRequest>,
  responseType: {
    serializeBinary: (msg: ListUsersResponse) => ListUsersResponse.toBinary(msg),
    deserializeBinary: (bytes: Uint8Array) => ListUsersResponse.fromBinary(bytes),
  } as MessageType<ListUsersResponse>,
};

/**
 * Method descriptor for CreateUsers RPC
 * Contains metadata required for making gRPC calls with any transport adapter
 */
const CreateUsersDescriptor: MethodDescriptor<CreateUserRequest, ListUsersResponse> = {
  serviceName: 'test.services.UserService',
  methodName: 'CreateUsers',
  requestStream: true,
  responseStream: false,
  requestType: {
    serializeBinary: (msg: CreateUserRequest) => CreateUserRequest.toBinary(msg),
    deserializeBinary: (bytes: Uint8Array) => CreateUserRequest.fromBinary(bytes),
  } as MessageType<CreateUserRequest>,
  responseType: {
    serializeBinary: (msg: ListUsersResponse) => ListUsersResponse.toBinary(msg),
    deserializeBinary: (bytes: Uint8Array) => ListUsersResponse.fromBinary(bytes),
  } as MessageType<ListUsersResponse>,
};

/**
 * Method descriptor for Chat RPC
 * Contains metadata required for making gRPC calls with any transport adapter
 */
const ChatDescriptor: MethodDescriptor<StreamMessage, StreamMessage> = {
  serviceName: 'test.services.UserService',
  methodName: 'Chat',
  requestStream: true,
  responseStream: true,
  requestType: {
    serializeBinary: (msg: StreamMessage) => StreamMessage.toBinary(msg),
    deserializeBinary: (bytes: Uint8Array) => StreamMessage.fromBinary(bytes),
  } as MessageType<StreamMessage>,
  responseType: {
    serializeBinary: (msg: StreamMessage) => StreamMessage.toBinary(msg),
    deserializeBinary: (bytes: Uint8Array) => StreamMessage.fromBinary(bytes),
  } as MessageType<StreamMessage>,
};


/**
 * UserService service client
 *
 * Generated gRPC service stub with automatic transport adapter selection.
 * Supports both Promise-based APIs for unary calls and Observable-based APIs for streaming.
 *
 * ## Transport Adapters
 *
 * This stub automatically selects the appropriate transport adapter:
 * - **Browser**: Uses gRPC-web adapter (HTTP/1.1 compatible)
 * - **Node.js**: Uses native gRPC adapter (HTTP/2 with full gRPC support)
 *
 * You can override the automatic selection:
 *
 * ```typescript
 * // Force gRPC-web adapter (browser-compatible)
 * const stub = new UserServiceStub({
 *   serverUrl: 'https://api.example.com',
 *   adapterType: 'grpc-web'
 * });
 *
 * // Force native gRPC adapter (Node.js only, full streaming support)
 * const stub = new UserServiceStub({
 *   serverUrl: 'localhost:50051',
 *   adapterType: 'native'
 * });
 *
 * // Automatic selection (recommended)
 * const stub = new UserServiceStub({
 *   serverUrl: 'https://api.example.com'
 * });
 * ```
 *
 * ## Streaming Support
 *
 * - **Unary RPC**: Fully supported by both adapters
 * - **Server streaming**: Fully supported by both adapters
 * - **Client streaming**: Native adapter only (HTTP/2 required)
 * - **Bidirectional streaming**: Native adapter only (HTTP/2 required)
 *
 * @see {@link AdapterFactory} for more details on adapter selection
 */
export class UserServiceStub {
  private readonly adapter: ITransportAdapter;
  private readonly config: UserServiceStubConfig;

  /**
   * Create a new UserServiceStub
   *
   * @param config - Service stub configuration
   *
   * @example
   * ```typescript
   * // Auto-select adapter (recommended)
   * const stub = new UserServiceStub({
   *   serverUrl: 'https://api.example.com'
   * });
   *
   * // Browser-compatible gRPC-web
   * const webStub = new UserServiceStub({
   *   serverUrl: 'https://api.example.com',
   *   adapterType: 'grpc-web'
   * });
   *
   * // Node.js native gRPC (full streaming support)
   * const nativeStub = new UserServiceStub({
   *   serverUrl: 'localhost:50051',
   *   adapterType: 'native',
   *   secure: false
   * });
   * ```
   */
  constructor(config: UserServiceStubConfig) {
    this.config = config;

    // Create adapter using AdapterFactory
    this.adapter = AdapterFactory.create({
      serverUrl: config.serverUrl,
      adapterType: config.adapterType,
      secure: config.secure,
      debug: config.debug,
      defaultCallOptions: config.defaultCallOptions,
    });
  }

  /**
   * Get the service configuration
   */
  public getConfig(): Readonly<UserServiceStubConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Get the underlying transport adapter for advanced usage
   *
   * @returns The current transport adapter instance
   */
  public getAdapter(): ITransportAdapter {
    return this.adapter;
  }

  /**
   * Close the adapter and clean up resources
   *
   * Call this when you're done using the stub to release connections
   * and prevent resource leaks.
   */
  public async close(): Promise<void> {
    await this.adapter.close();
  }

  /**
   * RPC method GetUser (unary)
   *
   * Sends a single request and receives a single response.
   *
   * **Transport Support**:
   * - Native gRPC adapter: ✓ Fully supported
   * - gRPC-web adapter: ✓ Fully supported
   *
   * @param request - GetUserRequest request message
   * @param options - Optional call options (metadata, timeout, etc.)
   * @returns Promise resolving to GetUserResponse response message
   *
   * @example
   * ```typescript
   * try {
   *   const response = await stub.getUser(request);
   *   console.log('Response:', response);
   * } catch (error) {
   *   console.error('RPC failed:', error);
   * }
   * ```
   */
  public async getUser(
    request: GetUserRequest,
    options?: CallOptions
  ): Promise<GetUserResponse> {
    return this.adapter.unary<GetUserRequest, GetUserResponse>(
      UserServiceDescriptor,
      request,
      options
    );
  }
  
  /**
   * RPC method ListUsers (server streaming)
   *
   * Sends a single request and receives a stream of responses.
   * Returns an RxJS Observable that emits each response message.
   *
   * **Transport Support**:
   * - Native gRPC adapter: ✓ Fully supported (HTTP/2)
   * - gRPC-web adapter: ✓ Supported (with HTTP/1.1 chunked transfer)
   *
   * @param request - ListUsersRequest request message
   * @param options - Optional call options (metadata, timeout, etc.)
   * @returns Observable stream of ListUsersResponse response messages
   *
   * @example
   * ```typescript
   * const subscription = stub.listUsers(request).subscribe({
   *   next: (response) => console.log('Received:', response),
   *   error: (err) => console.error('Error:', err),
   *   complete: () => console.log('Stream completed')
   * });
   *
   * // Cancel the stream
   * subscription.unsubscribe();
   * ```
   *
   * @description Opens a server stream and emits multiple response messages.
   *              Unsubscribe to cancel the stream and clean up resources.
   */
  public listUsers(
    request: ListUsersRequest,
    options?: CallOptions
  ): Observable<ListUsersResponse> {
    return this.adapter.serverStream<ListUsersRequest, ListUsersResponse>(
      UserServiceDescriptor,
      request,
      options
    );
  }

  /**
   * RPC method CreateUsers (client streaming)
   *
   * Sends a stream of requests and receives a single response.
   *
   * **IMPORTANT**: Client streaming requires HTTP/2 transport.
   * - Native gRPC adapter: ✓ Fully supported
   * - gRPC-web adapter: ✗ Not supported (HTTP/1.1 limitation)
   *
   * @param options - Optional call options (metadata, timeout, etc.)
   * @returns Client streaming call with send/complete capabilities
   * @throws {Error} If using gRPC-web adapter (HTTP/1.1 does not support client streaming)
   *
   * @example
   * ```typescript
   * // Only works with native gRPC adapter
   * const call = stub.createUsers();
   *
   * // Send multiple requests
   * call.send(request1);
   * call.send(request2);
   * call.send(request3);
   *
   * // Complete and get response
   * const response = await call.complete();
   * console.log('Final response:', response);
   * ```
   *
   * @see https://github.com/grpc/grpc-web#streaming-support
   */
  public createUsers(options?: CallOptions): ClientStreamingCall<CreateUserRequest, ListUsersResponse> {
    return this.adapter.clientStream<CreateUserRequest, ListUsersResponse>(
      UserServiceDescriptor,
      options
    );
  }

  /**
   * RPC method Chat (bidirectional streaming)
   *
   * Establishes a bidirectional stream for sending and receiving messages.
   *
   * **IMPORTANT**: Bidirectional streaming requires HTTP/2 transport.
   * - Native gRPC adapter: ✓ Fully supported
   * - gRPC-web adapter: ✗ Not supported (HTTP/1.1 limitation)
   *
   * @returns Bidirectional streaming call with send/receive capabilities
   * @throws {Error} If using gRPC-web adapter (HTTP/1.1 does not support bidi streaming)
   *
   * @example
   * ```typescript
   * // Only works with native gRPC adapter
   * const call = stub.chat();
   *
   * // Subscribe to responses
   * call.responses.subscribe({
   *   next: (response) => console.log('Received:', response),
   *   error: (err) => console.error('Error:', err),
   *   complete: () => console.log('Stream completed')
   * });
   *
   * // Send requests
   * call.send(request1);
   * call.send(request2);
   * call.complete();
   * ```
   *
   * @see https://github.com/grpc/grpc-web#streaming-support
   */
  public chat(options?: CallOptions): BidiStreamingCall<StreamMessage, StreamMessage> {
    return this.adapter.bidiStream<StreamMessage, StreamMessage>(
      UserServiceDescriptor,
      options
    );
  }

}



