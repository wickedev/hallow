/**
 * SerializationAdapter - Interface for message serialization/deserialization
 *
 * This interface defines the contract for converting between TypeScript objects
 * and wire formats (JSON or binary protobuf) for gRPC communication.
 *
 * Different implementations can provide:
 * - JSON serialization (MVP - simpler, debuggable)
 * - Binary protobuf serialization (future - more efficient)
 */

/**
 * Message descriptor metadata for serialization
 */
export interface MessageDescriptor {
  /**
   * Fully qualified message name (e.g., "test.services.GetUserRequest")
   */
  messageName: string;

  /**
   * Field descriptors for this message
   */
  fields: FieldDescriptor[];
}

/**
 * Field descriptor metadata
 */
export interface FieldDescriptor {
  /**
   * Field name in camelCase
   */
  name: string;

  /**
   * Field number from proto definition
   */
  number: number;

  /**
   * Field type (e.g., "string", "int32", "bytes", "Message")
   */
  type: string;

  /**
   * Whether this field is repeated (array)
   */
  repeated: boolean;

  /**
   * Whether this field is optional
   */
  optional: boolean;

  /**
   * Whether this field is a map
   */
  map?: boolean;

  /**
   * For message types, the message descriptor
   */
  messageType?: MessageDescriptor;
}

/**
 * Serialization adapter interface
 *
 * Implementations of this interface handle the conversion between
 * TypeScript objects and the wire format used by gRPC.
 */
export interface ISerializationAdapter {
  /**
   * Serialize a message to wire format
   *
   * @param message - The message object to serialize
   * @returns Uint8Array containing the serialized message
   * @throws {SerializationError} If serialization fails
   *
   * @example
   * ```typescript
   * const adapter = new JsonSerializationAdapter();
   * const bytes = adapter.serialize({ userId: "123" });
   * ```
   */
  serialize<T>(message: T): Uint8Array;

  /**
   * Deserialize a message from wire format
   *
   * @param bytes - The serialized message bytes
   * @param messageDescriptor - Metadata describing the message structure
   * @returns Deserialized TypeScript object
   * @throws {SerializationError} If deserialization fails
   *
   * @example
   * ```typescript
   * const adapter = new JsonSerializationAdapter();
   * const message = adapter.deserialize<GetUserResponse>(
   *   bytes,
   *   GetUserResponseDescriptor
   * );
   * ```
   */
  deserialize<T>(bytes: Uint8Array, messageDescriptor?: MessageDescriptor): T;

  /**
   * Convert a message to a plain JavaScript object
   *
   * This is useful for:
   * - Debugging (can inspect in DevTools)
   * - JSON serialization
   * - Logging
   *
   * @param message - The message to convert
   * @returns Plain JavaScript object representation
   */
  toObject<T>(message: T): any;

  /**
   * Convert a plain JavaScript object to a typed message
   *
   * @param obj - The plain JavaScript object
   * @param messageDescriptor - Metadata describing the expected message structure
   * @returns Typed message object
   * @throws {SerializationError} If conversion fails
   */
  fromObject<T>(obj: any, messageDescriptor?: MessageDescriptor): T;
}

/**
 * Serialization error
 *
 * Thrown when serialization or deserialization fails.
 */
export class SerializationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: any
  ) {
    super(message);
    this.name = 'SerializationError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SerializationError);
    }
  }
}

/**
 * Type guard for SerializationError
 */
export function isSerializationError(error: any): error is SerializationError {
  return error instanceof SerializationError;
}
