import { BinaryReader, BinaryWriter, Message } from 'google-protobuf';
import { grpc } from '@improbable-eng/grpc-web';
import { Observable, Subject, Subscription } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';


;

export namespace Test.Services {
  /**
   * Interface for GetUserRequest message (nested)
   */
  export interface GetUserRequest {
    /** Field user_id (string) */
    userId: string;
  }

  export namespace GetUserRequest {
    /**
     * Encode GetUserRequest message to protobuf format
     * @param message Message to encode
     * @returns Encoded bytes
            }
      
      
      return writer.getResultBuffer();
    }

    /**
     * Decode GetUserRequest message from protobuf format
     * @param bytes Encoded bytes
     * @returns Decoded message
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
   * Interface for GetUserResponse message (nested)
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
     * @param message Message to encode
     * @returns Encoded bytes
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
     * @param bytes Encoded bytes
     * @returns Decoded message
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
   * Interface for ListUsersRequest message (nested)
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
     * @param message Message to encode
     * @returns Encoded bytes
            }
      if (message.pageToken !== undefined) {
        writer.writeString(2, message.pageToken);
            }
      
      
      return writer.getResultBuffer();
    }

    /**
     * Decode ListUsersRequest message from protobuf format
     * @param bytes Encoded bytes
     * @returns Decoded message
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
   * Interface for ListUsersResponse message (nested)
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
     * @param message Message to encode
     * @returns Encoded bytes
        }
      }
      if (message.nextPageToken !== undefined) {
        writer.writeString(2, message.nextPageToken);
            }
      
      
      return writer.getResultBuffer();
    }

    /**
     * Decode ListUsersResponse message from protobuf format
     * @param bytes Encoded bytes
     * @returns Decoded message
      };

      while (reader.nextField()) {
        const fieldNumber = reader.getFieldNumber();
        
        switch (fieldNumber) {
          case 1:
            if (!message.users) {
              message.users = [];
            }
            message.users.push(reader.readMessage());
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
   * Interface for CreateUserRequest message (nested)
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
     * @param message Message to encode
     * @returns Encoded bytes
            }
      if (message.email !== undefined) {
        writer.writeString(2, message.email);
            }
      
      
      return writer.getResultBuffer();
    }

    /**
     * Decode CreateUserRequest message from protobuf format
     * @param bytes Encoded bytes
     * @returns Decoded message
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
   * Interface for StreamMessage message (nested)
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
     * @param message Message to encode
     * @returns Encoded bytes
            }
      if (message.timestamp !== undefined) {
        writer.writeInt64(2, message.timestamp);
            }
      
      
      return writer.getResultBuffer();
    }

    /**
     * Decode StreamMessage message from protobuf format
     * @param bytes Encoded bytes
     * @returns Decoded message
      };

      while (reader.nextField()) {
        const fieldNumber = reader.getFieldNumber();
        
        switch (fieldNumber) {
          case 1:
            message.content = reader.readString();
                      break;
          case 2:
            message.timestamp = reader.readInt64();
                      break;
          default:
            reader.skipField();
            break;
        }
      }

      return message;
    }
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
class CancellationTokenImpl implements CancellationToken {
  private _isCancelled = false;
  private readonly cancelCallbacks: Array<() => void> = [];
  
  get isCancelled(): boolean {
    return this._isCancelled;
  }
  
  cancel(): void {
    if (this._isCancelled) return;
  }
  
  onCancel(callback: () => void): void {
    if (this._isCancelled) {
      callback();
    } else {
      this.cancelCallbacks.push(callback);
    }
  }
}

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
    service: { serviceName: 'UserService' },
    requestStream: false,
    responseStream: false,
    requestType: {} as any, // Message type placeholder
    responseType: {} as any, // Message type placeholder
  },
  /**
   * Method descriptor for ListUsers RPC
   * @type {grpc.MethodDefinition<ListUsersRequest, ListUsersResponse>}
   */
  ListUsersDescriptor: {
    methodName: 'ListUsers',
    service: { serviceName: 'UserService' },
    requestStream: false,
    responseStream: true,
    requestType: {} as any, // Message type placeholder
    responseType: {} as any, // Message type placeholder
  },
  /**
   * Method descriptor for CreateUsers RPC
   * @type {grpc.MethodDefinition<CreateUserRequest, ListUsersResponse>}
   */
  CreateUsersDescriptor: {
    methodName: 'CreateUsers',
    service: { serviceName: 'UserService' },
    requestStream: true,
    responseStream: false,
    requestType: {} as any, // Message type placeholder
    responseType: {} as any, // Message type placeholder
  },
  /**
   * Method descriptor for Chat RPC
   * @type {grpc.MethodDefinition<StreamMessage, StreamMessage>}
   */
  ChatDescriptor: {
    methodName: 'Chat',
    service: { serviceName: 'UserService' },
    requestStream: true,
    responseStream: true,
    requestType: {} as any, // Message type placeholder
    responseType: {} as any, // Message type placeholder
  },
} as const;

/**
 * UserService service client
 * Generated gRPC service stub with Promise and Streaming APIs
 */
export class UserServiceStub {
  private readonly client: any;
  
  constructor(private readonly baseUrl: string) {
    // Initialize gRPC-web client
    // TODO: Properly initialize with @improbable-eng/grpc-web
  }

  /**
   * Get the service base URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * RPC method GetUser (unary)
   * @param request - GetUserRequest request message
   * @returns Promise resolving to GetUserResponse response message
            }

            // Response message is already deserialized by gRPC-web
            resolve(response.message as GetUserResponse);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * RPC method ListUsers (server streaming)
   * @param request - ListUsersRequest request message
   * @returns Observable stream of ListUsersResponse response messages
            }
          },
          onEnd: (code: grpc.Code, message: string) => {
            if (code === grpc.Code.OK) {
              observer.complete();
            } else {
              observer.error(new Error(
                `gRPC stream error ${grpc.Code[code]}: ${message}`
              ));
            }
          }
        });

        // Register cleanup for cancellation
        cancellationToken.onCancel(() => {
          client.close();
        });

        // Return teardown logic (called on unsubscribe)
        return () => {
        };
      } catch (error) {
        observer.error(error);
        return () => {};
      }
    });
  }

  /**
   * RPC method CreateUsers (client streaming)
   *
   * **IMPORTANT:** Client streaming is not fully supported over HTTP/1.1 in gRPC-web.
   * This method requires WebSocket transport or HTTP/2.
   *
   * @returns Object with send(), complete(), and cancel() methods
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
  } {
    throw new Error(
      'Bidirectional streaming RPC "Chat" is not supported over HTTP/1.1. ' +
      'gRPC-web requires WebSocket transport or HTTP/2 for bidirectional streaming. ' +
      'Please use unary or server streaming RPCs, or configure your server for WebSocket support. ' +
      'See: https://github.com/grpc/grpc-web#streaming-support'
    );
  }

}



