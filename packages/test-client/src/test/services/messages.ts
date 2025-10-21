import { BinaryReader, BinaryWriter } from 'google-protobuf';

;

export namespace Test.Services {
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