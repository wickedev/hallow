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
   * @returns Promise<GetUserResponse> - Response message
      }, 0);
    });
  }
  
  /**
   * RPC method ListUsers (server streaming)
   * @param request - ListUsersRequest request message
   * @returns Observable stream of ListUsersResponse messages
        }
        
        if (index < mockResponses.length) {
          observer.next(mockResponses[index++] as any);
        } else {
          clearInterval(interval);
          observer.complete();
        }
      }, 100);
      
      cancellationToken.onCancel(() => {
        clearInterval(interval);
      });
      
      // Return teardown logic
      return () => {
      };
    });
  }

  /**
   * RPC method CreateUsers (client streaming)
   * @returns Object with send method and response promise
  } {
    const requests: CreateUserRequest[] = [];
    const cancellationToken = new CancellationTokenImpl();
    let isCompleted = false;
    
    return {
        }
      },
      complete: async () => {
        if (isCompleted || cancellationToken.isCancelled) {
          throw new Error('Stream already completed or cancelled');
        }
        isCompleted = true;
        
        // TODO: Implement actual gRPC-web client streaming
        // 1. Send all accumulated requests
        // 2. Signal stream completion
        // 3. Wait for server response
        // 4. Deserialize and return response
          }
          
          // Placeholder implementation
          setTimeout(() => {
            reject(new Error('Client streaming not yet implemented for createUsers'));
          }, 0);
        });
      },
      cancel: () => {
        cancellationToken.cancel();
      }
    };
  }

  /**
   * RPC method Chat (bidirectional streaming)
   * @returns Observable stream for bidirectional streaming
  } {
    const requestSubject = new Subject<StreamMessage>();
    const responseSubject = new Subject<StreamMessage>();
    const cancellationToken = new CancellationTokenImpl();
    
    // Set up the bidirectional stream
    // TODO: Implement actual gRPC-web bidirectional streaming
    const subscription = requestSubject.pipe(
      takeUntil(responseSubject.pipe(finalize(() => cancellationToken.cancel())))
    ).subscribe({
      next: (request) => {
        // TODO: Send request to server
        console.log('Sending request:', request);
      },
      error: (err) => {
        responseSubject.error(err);
      },
      complete: () => {
        // Signal stream completion to server
        responseSubject.complete();
      }
    });
    
    cancellationToken.onCancel(() => {
      subscription.unsubscribe();
      responseSubject.complete();
    });
    
    return {
        }
      },
      responses: responseSubject.asObservable(),
      complete: () => {
        requestSubject.complete();
      },
      cancel: () => {
        cancellationToken.cancel();
      }
    };
  }

}



