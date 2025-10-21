import { BinaryReader, BinaryWriter, Message } from 'google-protobuf';
import { grpc } from '@improbable-eng/grpc-web';
import { GrpcClientOptions, GrpcError, GrpcWebAdapter, isGrpcError } from '@hallow/generator/adapters';
import { Observable } from 'rxjs';


;

/**
 * Interface for GetUserRequest message
 */
export interface GetUserRequest {
  /** Field user_id (string) */
  userId: string;
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
}

/**
 * Interface for GetUserResponse message
 */
export interface GetUserResponse {
  /** Field id (string) */
  id: string;
  /** Field name (string) */
  name: string;
  /** Field email (string) */
  email: string;
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
}

/**
 * Interface for ListUsersRequest message
 */
export interface ListUsersRequest {
  /** Field page_size (int32) */
  pageSize: number;
  /** Field page_token (string) */
  pageToken: string;
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
}

/**
 * Interface for ListUsersResponse message
 */
export interface ListUsersResponse {
  /** Field users (GetUserResponse) */
  users: GetUserResponse[];
  /** Field next_page_token (string) */
  nextPageToken: string;
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
}

/**
 * Interface for CreateUserRequest message
 */
export interface CreateUserRequest {
  /** Field name (string) */
  name: string;
  /** Field email (string) */
  email: string;
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
}

/**
 * Interface for StreamMessage message
 */
export interface StreamMessage {
  /** Field content (string) */
  content: string;
  /** Field timestamp (int64) */
  timestamp: string;
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
}

/**
 * Generated gRPC service stubs
 * @generated
 */

;
;
;
;

/**
 * Service descriptor for UserService
 * Contains metadata for all RPC methods in this service
 */
export const UserServiceService = {
  serviceName: 'UserService',
  fullServiceName: 'test.services.UserService',

  /**
   * Method descriptor for GetUser RPC
   * @type {grpc.MethodDefinition<GetUserRequest, GetUserResponse>}
   */
  GetUserDescriptor: {
    methodName: 'GetUser',
    serviceName: 'UserService',  // FIXED: serviceName at top level, not nested
    requestType: 'GetUserRequest',
    responseType: 'GetUserResponse',
    requestStream: false,
    responseStream: false,
  },
  /**
   * Method descriptor for ListUsers RPC
   * @type {grpc.MethodDefinition<ListUsersRequest, ListUsersResponse>}
   */
  ListUsersDescriptor: {
    methodName: 'ListUsers',
    serviceName: 'UserService',  // FIXED: serviceName at top level, not nested
    requestType: 'ListUsersRequest',
    responseType: 'ListUsersResponse',
    requestStream: false,
    responseStream: true,
  },
  /**
   * Method descriptor for CreateUsers RPC
   * @type {grpc.MethodDefinition<CreateUserRequest, ListUsersResponse>}
   */
  CreateUsersDescriptor: {
    methodName: 'CreateUsers',
    serviceName: 'UserService',  // FIXED: serviceName at top level, not nested
    requestType: 'CreateUserRequest',
    responseType: 'ListUsersResponse',
    requestStream: true,
    responseStream: false,
  },
  /**
   * Method descriptor for Chat RPC
   * @type {grpc.MethodDefinition<StreamMessage, StreamMessage>}
   */
  ChatDescriptor: {
    methodName: 'Chat',
    serviceName: 'UserService',  // FIXED: serviceName at top level, not nested
    requestType: 'StreamMessage',
    responseType: 'StreamMessage',
    requestStream: true,
    responseStream: true,
  },
} as const;

/**
 * UserService service client
 * Generated gRPC service stub with Promise and Streaming APIs
 */
export class UserServiceStub {
  private readonly adapter: GrpcWebAdapter;

  /**
   * Create a new UserServiceStub
   * @param baseUrl - Base URL for the gRPC server (e.g., 'https://api.example.com')
   * @param options - Optional client configuration
   */
  constructor(
    private readonly baseUrl: string,
    options?: GrpcClientOptions
  ) {
    this.adapter = new GrpcWebAdapter(baseUrl, options);
  }

  /**
   * Get the service base URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Get the underlying GrpcWebAdapter for advanced usage
   */
  public getAdapter(): GrpcWebAdapter {
    return this.adapter;
  }

  /**
   * RPC method GetUser (unary)
   *
   * Sends a single request and receives a single response.
   *
   * @param request - GetUserRequest request message
   * @returns Promise resolving to GetUserResponse response message
   */
  public async getUser(request: GetUserRequest): Promise<GetUserResponse> {
    return this.adapter.unary<GetUserRequest, GetUserResponse>(
      UserServiceService.GetUserDescriptor,
      request
    );
  }
  
  /**
   * RPC method ListUsers (server streaming)
   *
   * Sends a single request and receives a stream of responses.
   * Returns an RxJS Observable that emits each response message.
   *
   * @param request - ListUsersRequest request message
   * @returns Observable stream of ListUsersResponse response messages
   * @description Opens a server stream and emits multiple response messages.
   *              Unsubscribe to cancel the stream and clean up resources.
   */
  public listUsers(request: ListUsersRequest): Observable<ListUsersResponse> {
    return this.adapter.serverStream<ListUsersRequest, ListUsersResponse>(
      UserServiceService.ListUsersDescriptor,
      request
    );
  }

  /**
   * RPC method CreateUsers (client streaming)
   *
   * **IMPORTANT:** Client streaming is not fully supported over HTTP/1.1 in gRPC-web.
   * This method requires WebSocket transport or HTTP/2.
   *
   * @returns Object with send(), complete(), and cancel() methods
   * @throws {Error} Client streaming not supported over HTTP/1.1
   *
   * @see https://github.com/grpc/grpc-web#streaming-support
   */
  public createUsers(): {
    send: (request: CreateUserRequest) => void;
    complete: () => Promise<ListUsersResponse>;
    cancel: () => void;
  } {
    throw new Error(
      'Client streaming RPC "CreateUsers" is not supported over HTTP/1.1. ' +
      'gRPC-web requires WebSocket transport or HTTP/2 for client streaming. ' +
      'Please use unary or server streaming RPCs, or configure your server for WebSocket support. ' +
      'See: https://github.com/grpc/grpc-web#streaming-support'
    );
  }

  /**
   * RPC method Chat (bidirectional streaming)
   *
   * **IMPORTANT:** Bidirectional streaming is not fully supported over HTTP/1.1 in gRPC-web.
   * This method requires WebSocket transport or HTTP/2.
   *
   * @returns Object with send(), responses, complete(), and cancel() methods
   * @throws {Error} Bidirectional streaming not supported over HTTP/1.1
   *
   * @see https://github.com/grpc/grpc-web#streaming-support
   */
  public chat(): {
    send: (request: StreamMessage) => void;
    responses: Observable<StreamMessage>;
    complete: () => void;
    cancel: () => void;
  } {
    throw new Error(
      'Bidirectional streaming RPC "Chat" is not supported over HTTP/1.1. ' +
      'gRPC-web requires WebSocket transport or HTTP/2 for bidirectional streaming. ' +
      'Please use unary or server streaming RPCs, or configure your server for WebSocket support. ' +
      'See: https://github.com/grpc/grpc-web#streaming-support'
    );
  }

}



