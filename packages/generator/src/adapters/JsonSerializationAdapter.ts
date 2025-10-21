/**
 * JsonSerializationAdapter - JSON-based message serialization
 *
 * This adapter implements JSON serialization for gRPC messages.
 * It's simpler than binary protobuf and makes debugging easier since
 * payloads can be inspected in browser DevTools.
 *
 * Handles:
 * - Primitive types (string, number, boolean)
 * - Nested messages and objects
 * - Arrays (repeated fields)
 * - Maps (as plain objects)
 * - Bytes (Uint8Array) as base64 strings
 * - 64-bit integers as strings for precision
 *
 * @example
 * ```typescript
 * const adapter = new JsonSerializationAdapter();
 *
 * // Serialize a message
 * const bytes = adapter.serialize({ userId: "123" });
 *
 * // Deserialize a response
 * const response = adapter.deserialize<GetUserResponse>(bytes);
 * ```
 */

import {
  ISerializationAdapter,
  MessageDescriptor,
  FieldDescriptor,
  SerializationError,
} from './SerializationAdapter';

/**
 * JSON serialization adapter (MVP implementation)
 *
 * Uses JSON as the wire format for gRPC communication.
 * This is simpler than binary protobuf and sufficient for MVP requirements.
 */
export class JsonSerializationAdapter implements ISerializationAdapter {
  /**
   * Serialize a message to JSON wire format
   *
   * Converts the message to JSON and encodes it as UTF-8 bytes.
   *
   * @param message - The message object to serialize
   * @returns Uint8Array containing the JSON-encoded message
   * @throws {SerializationError} If JSON serialization fails
   */
  serialize<T>(message: T): Uint8Array {
    try {
      // Convert message to plain object (handles Map, Uint8Array, etc.)
      const plainObject = this.toObject(message);

      // Convert to JSON string
      const json = JSON.stringify(plainObject);

      // Convert to Uint8Array
      const encoder = new TextEncoder();
      return encoder.encode(json);
    } catch (error) {
      throw new SerializationError(
        `Failed to serialize message: ${error instanceof Error ? error.message : String(error)}`,
        undefined,
        message
      );
    }
  }

  /**
   * Deserialize a message from JSON wire format
   *
   * Decodes UTF-8 bytes to JSON and parses it to a typed message.
   *
   * @param bytes - The serialized message bytes
   * @param messageDescriptor - Optional metadata describing the message structure
   * @returns Deserialized TypeScript object
   * @throws {SerializationError} If deserialization fails
   */
  deserialize<T>(bytes: Uint8Array, messageDescriptor?: MessageDescriptor): T {
    try {
      // Convert from Uint8Array to string
      const decoder = new TextDecoder();
      const json = decoder.decode(bytes);

      // Parse JSON
      const obj = JSON.parse(json);

      // Convert to typed message if descriptor provided
      if (messageDescriptor) {
        return this.fromObject<T>(obj, messageDescriptor);
      }

      // Otherwise return as-is
      return obj as T;
    } catch (error) {
      throw new SerializationError(
        `Failed to deserialize message: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Convert a message to a plain JavaScript object
   *
   * Recursively converts:
   * - Arrays → arrays
   * - Maps → plain objects
   * - Uint8Array → base64 strings
   * - Nested objects → plain objects
   *
   * @param message - The message to convert
   * @returns Plain JavaScript object
   */
  toObject<T>(message: T): any {
    if (message === null || message === undefined) {
      return message;
    }

    // Handle arrays (repeated fields)
    if (Array.isArray(message)) {
      return message.map(item => this.toObject(item));
    }

    // Handle Map objects
    if (message instanceof Map) {
      const obj: any = {};
      for (const [key, value] of message.entries()) {
        obj[key] = this.toObject(value);
      }
      return obj;
    }

    // Handle Uint8Array (bytes type) - convert to base64
    if (message instanceof Uint8Array) {
      return this.uint8ArrayToBase64(message);
    }

    // Handle plain objects
    if (typeof message === 'object') {
      const obj: any = {};
      for (const key in message) {
        if (Object.prototype.hasOwnProperty.call(message, key)) {
          obj[key] = this.toObject((message as any)[key]);
        }
      }
      return obj;
    }

    // Primitive types (string, number, boolean) - return as-is
    return message;
  }

  /**
   * Convert a plain JavaScript object to a typed message
   *
   * Uses the message descriptor to properly type fields.
   * Handles:
   * - Type conversion based on field descriptors
   * - Repeated fields (arrays)
   * - Map fields
   * - Nested messages
   * - Bytes fields (base64 → Uint8Array)
   * - 64-bit integers (string representation)
   *
   * @param obj - The plain JavaScript object
   * @param messageDescriptor - Metadata describing the expected message structure
   * @returns Typed message object
   * @throws {SerializationError} If conversion fails
   */
  fromObject<T>(obj: any, messageDescriptor?: MessageDescriptor): T {
    if (!messageDescriptor) {
      // No descriptor, return as-is
      return obj as T;
    }

    const message: any = {};

    // Process each field according to descriptor
    for (const field of messageDescriptor.fields) {
      if (obj[field.name] !== undefined) {
        try {
          message[field.name] = this.convertField(
            obj[field.name],
            field
          );
        } catch (error) {
          throw new SerializationError(
            `Failed to convert field '${field.name}': ${error instanceof Error ? error.message : String(error)}`,
            field.name,
            obj[field.name]
          );
        }
      } else if (!field.optional) {
        // Field is required but missing - use default value
        message[field.name] = this.getDefaultValue(field);
      }
    }

    return message as T;
  }

  /**
   * Convert a field value according to its descriptor
   *
   * @param value - The raw field value
   * @param field - Field descriptor
   * @returns Converted field value
   */
  private convertField(value: any, field: FieldDescriptor): any {
    // Handle repeated fields (arrays)
    if (field.repeated) {
      return Array.isArray(value)
        ? value.map(item => this.convertFieldValue(item, field))
        : [];
    }

    // Handle map fields
    if (field.map) {
      const map = new Map();
      if (typeof value === 'object' && value !== null) {
        for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            map.set(key, this.convertFieldValue(value[key], field));
          }
        }
      }
      return map;
    }

    // Handle single value
    return this.convertFieldValue(value, field);
  }

  /**
   * Convert a single field value based on its type
   *
   * @param value - The raw value
   * @param field - Field descriptor
   * @returns Converted value
   */
  private convertFieldValue(value: any, field: FieldDescriptor): any {
    // Handle nested messages
    if (field.messageType) {
      return this.fromObject(value, field.messageType);
    }

    // Handle special types
    switch (field.type) {
      case 'bytes':
        // Convert base64 string back to Uint8Array
        return typeof value === 'string'
          ? this.base64ToUint8Array(value)
          : value;

      case 'int64':
      case 'uint64':
      case 'sint64':
      case 'fixed64':
      case 'sfixed64':
        // Keep as string for precision (JavaScript numbers can't represent full 64-bit range)
        return String(value);

      case 'int32':
      case 'uint32':
      case 'sint32':
      case 'fixed32':
      case 'sfixed32':
      case 'float':
      case 'double':
        // Convert to number
        return Number(value);

      case 'bool':
        // Convert to boolean
        return Boolean(value);

      case 'string':
        // Convert to string
        return String(value);

      default:
        // Unknown type - return as-is
        return value;
    }
  }

  /**
   * Get default value for a field type
   *
   * @param field - Field descriptor
   * @returns Default value for the field type
   */
  private getDefaultValue(field: FieldDescriptor): any {
    if (field.repeated) {
      return [];
    }

    if (field.map) {
      return new Map();
    }

    switch (field.type) {
      case 'bytes':
        return new Uint8Array(0);
      case 'int64':
      case 'uint64':
      case 'sint64':
      case 'fixed64':
      case 'sfixed64':
        return '0';
      case 'int32':
      case 'uint32':
      case 'sint32':
      case 'fixed32':
      case 'sfixed32':
      case 'float':
      case 'double':
        return 0;
      case 'bool':
        return false;
      case 'string':
        return '';
      default:
        return null;
    }
  }

  /**
   * Convert Uint8Array to base64 string
   *
   * This is necessary because JSON cannot directly represent binary data.
   *
   * @param bytes - Byte array to convert
   * @returns Base64-encoded string
   */
  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 string to Uint8Array
   *
   * @param base64 - Base64-encoded string
   * @returns Decoded byte array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
}
