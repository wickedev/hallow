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
import { ISerializationAdapter, MessageDescriptor } from './SerializationAdapter';
/**
 * JSON serialization adapter (MVP implementation)
 *
 * Uses JSON as the wire format for gRPC communication.
 * This is simpler than binary protobuf and sufficient for MVP requirements.
 */
export declare class JsonSerializationAdapter implements ISerializationAdapter {
    /**
     * Serialize a message to JSON wire format
     *
     * Converts the message to JSON and encodes it as UTF-8 bytes.
     *
     * @param message - The message object to serialize
     * @returns Uint8Array containing the JSON-encoded message
     * @throws {SerializationError} If JSON serialization fails
     */
    serialize<T>(message: T): Uint8Array;
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
    deserialize<T>(bytes: Uint8Array, messageDescriptor?: MessageDescriptor): T;
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
    toObject<T>(message: T): any;
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
    fromObject<T>(obj: any, messageDescriptor?: MessageDescriptor): T;
    /**
     * Convert a field value according to its descriptor
     *
     * @param value - The raw field value
     * @param field - Field descriptor
     * @returns Converted field value
     */
    private convertField;
    /**
     * Convert a single field value based on its type
     *
     * @param value - The raw value
     * @param field - Field descriptor
     * @returns Converted value
     */
    private convertFieldValue;
    /**
     * Get default value for a field type
     *
     * @param field - Field descriptor
     * @returns Default value for the field type
     */
    private getDefaultValue;
    /**
     * Convert Uint8Array to base64 string
     *
     * This is necessary because JSON cannot directly represent binary data.
     *
     * @param bytes - Byte array to convert
     * @returns Base64-encoded string
     */
    private uint8ArrayToBase64;
    /**
     * Convert base64 string to Uint8Array
     *
     * @param base64 - Base64-encoded string
     * @returns Decoded byte array
     */
    private base64ToUint8Array;
}
//# sourceMappingURL=JsonSerializationAdapter.d.ts.map