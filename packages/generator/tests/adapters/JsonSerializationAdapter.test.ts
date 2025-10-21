/**
 * JsonSerializationAdapter Test Suite
 *
 * Comprehensive tests for JSON serialization/deserialization functionality.
 * Covers all requirements from FR-4 (Protobuf Serialization and Deserialization).
 *
 * Test Coverage:
 * - FR-4 AC 1: JSON serialization format configuration
 * - FR-4 AC 2: Request serialization to JSON
 * - FR-4 AC 3: Response deserialization from JSON
 * - FR-4 AC 4: Nested objects serialization
 * - FR-4 AC 5: Repeated fields (arrays) serialization
 * - FR-4 AC 6: Map fields serialization
 * - FR-4 AC 7: Data integrity preservation
 * - FR-4 AC 8: Complex messages with zero data loss
 */

import { JsonSerializationAdapter } from '../../src/adapters/JsonSerializationAdapter';
import {
  MessageDescriptor,
  FieldDescriptor,
  SerializationError,
  isSerializationError,
} from '../../src/adapters/SerializationAdapter';

describe('JsonSerializationAdapter', () => {
  let adapter: JsonSerializationAdapter;

  beforeEach(() => {
    adapter = new JsonSerializationAdapter();
  });

  describe('serialize', () => {
    it('should serialize simple message to JSON bytes', () => {
      // FR-4 AC 2: Serialize request to JSON format
      const message = { userId: '123' };
      const bytes = adapter.serialize(message);

      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes.length).toBeGreaterThan(0);

      // Verify it's valid JSON
      const decoder = new TextDecoder();
      const json = decoder.decode(bytes);
      expect(JSON.parse(json)).toEqual(message);
    });

    it('should serialize message with primitive types', () => {
      const message = {
        stringField: 'test',
        numberField: 42,
        boolField: true,
        nullField: null,
      };

      const bytes = adapter.serialize(message);
      const decoder = new TextDecoder();
      const json = decoder.decode(bytes);
      const parsed = JSON.parse(json);

      expect(parsed.stringField).toBe('test');
      expect(parsed.numberField).toBe(42);
      expect(parsed.boolField).toBe(true);
      expect(parsed.nullField).toBeNull();
    });

    it('should serialize repeated fields (arrays)', () => {
      // FR-4 AC 5: Repeated fields serialization
      const message = {
        users: [
          { id: '1', name: 'Alice' },
          { id: '2', name: 'Bob' },
        ],
      };

      const bytes = adapter.serialize(message);
      const decoder = new TextDecoder();
      const json = decoder.decode(bytes);
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed.users)).toBe(true);
      expect(parsed.users).toHaveLength(2);
      expect(parsed.users[0].name).toBe('Alice');
    });

    it('should serialize Map fields as plain objects', () => {
      // FR-4 AC 6: Map fields serialization
      const metadata = new Map<string, string>();
      metadata.set('key1', 'value1');
      metadata.set('key2', 'value2');

      const message = { metadata };

      const bytes = adapter.serialize(message);
      const decoder = new TextDecoder();
      const json = decoder.decode(bytes);
      const parsed = JSON.parse(json);

      expect(parsed.metadata).toEqual({
        key1: 'value1',
        key2: 'value2',
      });
    });

    it('should serialize Uint8Array (bytes) as base64', () => {
      const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello" in ASCII
      const message = { data };

      const bytes = adapter.serialize(message);
      const decoder = new TextDecoder();
      const json = decoder.decode(bytes);
      const parsed = JSON.parse(json);

      // Should be base64-encoded
      expect(typeof parsed.data).toBe('string');
      // Decode and verify
      const decoded = atob(parsed.data);
      expect(decoded).toBe('Hello');
    });

    it('should serialize nested messages', () => {
      // FR-4 AC 4: Nested objects serialization
      const message = {
        user: {
          id: '123',
          profile: {
            name: 'Alice',
            age: 30,
          },
        },
      };

      const bytes = adapter.serialize(message);
      const decoder = new TextDecoder();
      const json = decoder.decode(bytes);
      const parsed = JSON.parse(json);

      expect(parsed.user.profile.name).toBe('Alice');
      expect(parsed.user.profile.age).toBe(30);
    });

    it('should throw SerializationError on circular reference', () => {
      const message: any = { name: 'test' };
      message.self = message; // Circular reference

      expect(() => adapter.serialize(message)).toThrow(SerializationError);
    });
  });

  describe('deserialize', () => {
    it('should deserialize JSON bytes to message object', () => {
      // FR-4 AC 3: Deserialize response from JSON
      const json = JSON.stringify({ userId: '123' });
      const encoder = new TextEncoder();
      const bytes = encoder.encode(json);

      const message = adapter.deserialize<{ userId: string }>(bytes);

      expect(message.userId).toBe('123');
    });

    it('should deserialize with message descriptor', () => {
      const descriptor: MessageDescriptor = {
        messageName: 'GetUserRequest',
        fields: [
          {
            name: 'userId',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
          },
        ],
      };

      const json = JSON.stringify({ userId: '123' });
      const encoder = new TextEncoder();
      const bytes = encoder.encode(json);

      const message = adapter.deserialize(bytes, descriptor) as any;

      expect(message.userId).toBe('123');
    });

    it('should handle missing optional fields', () => {
      const descriptor: MessageDescriptor = {
        messageName: 'User',
        fields: [
          {
            name: 'id',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
          },
          {
            name: 'email',
            number: 2,
            type: 'string',
            repeated: false,
            optional: true,
          },
        ],
      };

      const json = JSON.stringify({ id: '123' });
      const encoder = new TextEncoder();
      const bytes = encoder.encode(json);

      const message = adapter.deserialize(bytes, descriptor) as any;

      expect(message.id).toBe('123');
      expect(message.email).toBeUndefined();
    });

    it('should provide default values for missing required fields', () => {
      const descriptor: MessageDescriptor = {
        messageName: 'User',
        fields: [
          {
            name: 'id',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
          },
          {
            name: 'count',
            number: 2,
            type: 'int32',
            repeated: false,
            optional: false,
          },
        ],
      };

      const json = JSON.stringify({ id: '123' });
      const encoder = new TextEncoder();
      const bytes = encoder.encode(json);

      const message = adapter.deserialize(bytes, descriptor) as any;

      expect(message.id).toBe('123');
      expect(message.count).toBe(0); // Default value for int32
    });

    it('should throw SerializationError on invalid JSON', () => {
      const invalidJson = 'not valid json {';
      const encoder = new TextEncoder();
      const bytes = encoder.encode(invalidJson);

      expect(() => adapter.deserialize(bytes)).toThrow(SerializationError);
    });
  });

  describe('toObject', () => {
    it('should convert simple message to plain object', () => {
      const message = { userId: '123', active: true };
      const obj = adapter.toObject(message);

      expect(obj).toEqual({ userId: '123', active: true });
    });

    it('should convert arrays', () => {
      const message = [1, 2, 3];
      const obj = adapter.toObject(message);

      expect(Array.isArray(obj)).toBe(true);
      expect(obj).toEqual([1, 2, 3]);
    });

    it('should convert Map to plain object', () => {
      const map = new Map();
      map.set('a', 1);
      map.set('b', 2);

      const obj = adapter.toObject(map);

      expect(obj).toEqual({ a: 1, b: 2 });
    });

    it('should convert Uint8Array to base64 string', () => {
      const bytes = new Uint8Array([65, 66, 67]); // "ABC"
      const obj = adapter.toObject(bytes);

      expect(typeof obj).toBe('string');
      expect(atob(obj)).toBe('ABC');
    });

    it('should handle null and undefined', () => {
      expect(adapter.toObject(null)).toBeNull();
      expect(adapter.toObject(undefined)).toBeUndefined();
    });

    it('should recursively convert nested objects', () => {
      const message = {
        user: {
          data: new Uint8Array([1, 2, 3]),
          tags: ['a', 'b'],
          metadata: new Map([['key', 'value']]),
        },
      };

      const obj = adapter.toObject(message);

      expect(typeof obj.user.data).toBe('string'); // base64
      expect(Array.isArray(obj.user.tags)).toBe(true);
      expect(obj.user.metadata).toEqual({ key: 'value' });
    });
  });

  describe('fromObject', () => {
    it('should convert plain object to typed message', () => {
      const descriptor: MessageDescriptor = {
        messageName: 'GetUserRequest',
        fields: [
          {
            name: 'userId',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
          },
        ],
      };

      const obj = { userId: '123' };
      const message = adapter.fromObject(obj, descriptor) as any;

      expect(message.userId).toBe('123');
    });

    it('should convert int64 to string for precision', () => {
      const descriptor: MessageDescriptor = {
        messageName: 'Stats',
        fields: [
          {
            name: 'count',
            number: 1,
            type: 'int64',
            repeated: false,
            optional: false,
          },
        ],
      };

      const obj = { count: 9007199254740991 }; // Max safe integer + 1
      const message = adapter.fromObject(obj, descriptor) as any;

      expect(typeof message.count).toBe('string');
      expect(message.count).toBe('9007199254740991');
    });

    it('should convert base64 string back to Uint8Array', () => {
      const descriptor: MessageDescriptor = {
        messageName: 'Data',
        fields: [
          {
            name: 'content',
            number: 1,
            type: 'bytes',
            repeated: false,
            optional: false,
          },
        ],
      };

      const obj = { content: btoa('Hello') };
      const message = adapter.fromObject(obj, descriptor) as any;

      expect(message.content).toBeInstanceOf(Uint8Array);
      const decoder = new TextDecoder();
      expect(decoder.decode(message.content)).toBe('Hello');
    });

    it('should handle repeated fields', () => {
      const descriptor: MessageDescriptor = {
        messageName: 'UserList',
        fields: [
          {
            name: 'users',
            number: 1,
            type: 'string',
            repeated: true,
            optional: false,
          },
        ],
      };

      const obj = { users: ['Alice', 'Bob', 'Charlie'] };
      const message = adapter.fromObject(obj, descriptor) as any;

      expect(Array.isArray(message.users)).toBe(true);
      expect(message.users).toHaveLength(3);
      expect(message.users[0]).toBe('Alice');
    });

    it('should handle map fields', () => {
      const descriptor: MessageDescriptor = {
        messageName: 'Config',
        fields: [
          {
            name: 'settings',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: true,
          },
        ],
      };

      const obj = {
        settings: {
          theme: 'dark',
          language: 'en',
        },
      };

      const message = adapter.fromObject(obj, descriptor) as any;

      expect(message.settings).toBeInstanceOf(Map);
      expect(message.settings.get('theme')).toBe('dark');
      expect(message.settings.get('language')).toBe('en');
    });

    it('should throw SerializationError on field conversion failure', () => {
      const descriptor: MessageDescriptor = {
        messageName: 'Bad',
        fields: [
          {
            name: 'data',
            number: 1,
            type: 'bytes',
            repeated: false,
            optional: false,
          },
        ],
      };

      const obj = { data: 'not-valid-base64!!!' };

      expect(() => adapter.fromObject(obj, descriptor)).toThrow(SerializationError);
      try {
        adapter.fromObject(obj, descriptor);
      } catch (error) {
        expect(isSerializationError(error)).toBe(true);
        if (isSerializationError(error)) {
          expect(error.field).toBe('data');
        }
      }
    });
  });

  describe('round-trip serialization', () => {
    it('should maintain data integrity for simple messages', () => {
      // FR-4 AC 7: Data integrity preservation
      const original = {
        id: '123',
        name: 'Alice',
        age: 30,
        active: true,
      };

      const bytes = adapter.serialize(original);
      const deserialized = adapter.deserialize<typeof original>(bytes);

      expect(deserialized).toEqual(original);
    });

    it('should maintain data integrity for complex nested messages', () => {
      // FR-4 AC 8: Complex messages with zero data loss
      const original = {
        user: {
          id: '123',
          profile: {
            name: 'Alice',
            emails: ['alice@example.com', 'alice@work.com'],
            metadata: new Map([
              ['role', 'admin'],
              ['department', 'engineering'],
            ]),
          },
        },
        data: new Uint8Array([1, 2, 3, 4, 5]),
      };

      // Serialize
      const bytes = adapter.serialize(original);

      // Deserialize with descriptor
      const descriptor: MessageDescriptor = {
        messageName: 'ComplexMessage',
        fields: [
          {
            name: 'user',
            number: 1,
            type: 'User',
            repeated: false,
            optional: false,
            messageType: {
              messageName: 'User',
              fields: [
                {
                  name: 'id',
                  number: 1,
                  type: 'string',
                  repeated: false,
                  optional: false,
                },
                {
                  name: 'profile',
                  number: 2,
                  type: 'Profile',
                  repeated: false,
                  optional: false,
                  messageType: {
                    messageName: 'Profile',
                    fields: [
                      {
                        name: 'name',
                        number: 1,
                        type: 'string',
                        repeated: false,
                        optional: false,
                      },
                      {
                        name: 'emails',
                        number: 2,
                        type: 'string',
                        repeated: true,
                        optional: false,
                      },
                      {
                        name: 'metadata',
                        number: 3,
                        type: 'string',
                        repeated: false,
                        optional: false,
                        map: true,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'data',
            number: 2,
            type: 'bytes',
            repeated: false,
            optional: false,
          },
        ],
      };

      const deserialized = adapter.deserialize(bytes, descriptor) as any;

      // Verify all data preserved
      expect(deserialized.user.id).toBe('123');
      expect(deserialized.user.profile.name).toBe('Alice');
      expect(deserialized.user.profile.emails).toEqual([
        'alice@example.com',
        'alice@work.com',
      ]);
      expect(deserialized.user.profile.metadata).toBeInstanceOf(Map);
      expect(deserialized.user.profile.metadata.get('role')).toBe('admin');
      expect(deserialized.data).toBeInstanceOf(Uint8Array);
      expect(Array.from(deserialized.data)).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle all protobuf primitive types correctly', () => {
      const original = {
        stringField: 'test',
        int32Field: 42,
        int64Field: '9007199254740991',
        uint32Field: 100,
        uint64Field: '18446744073709551615',
        floatField: 3.14,
        doubleField: 2.71828,
        boolField: true,
        bytesField: new Uint8Array([1, 2, 3]),
      };

      const descriptor: MessageDescriptor = {
        messageName: 'AllTypes',
        fields: [
          { name: 'stringField', number: 1, type: 'string', repeated: false, optional: false },
          { name: 'int32Field', number: 2, type: 'int32', repeated: false, optional: false },
          { name: 'int64Field', number: 3, type: 'int64', repeated: false, optional: false },
          { name: 'uint32Field', number: 4, type: 'uint32', repeated: false, optional: false },
          { name: 'uint64Field', number: 5, type: 'uint64', repeated: false, optional: false },
          { name: 'floatField', number: 6, type: 'float', repeated: false, optional: false },
          { name: 'doubleField', number: 7, type: 'double', repeated: false, optional: false },
          { name: 'boolField', number: 8, type: 'bool', repeated: false, optional: false },
          { name: 'bytesField', number: 9, type: 'bytes', repeated: false, optional: false },
        ],
      };

      const bytes = adapter.serialize(original);
      const deserialized = adapter.deserialize(bytes, descriptor) as any;

      expect(deserialized.stringField).toBe('test');
      expect(deserialized.int32Field).toBe(42);
      expect(deserialized.int64Field).toBe('9007199254740991');
      expect(deserialized.uint32Field).toBe(100);
      expect(deserialized.uint64Field).toBe('18446744073709551615');
      expect(deserialized.floatField).toBeCloseTo(3.14, 2);
      expect(deserialized.doubleField).toBeCloseTo(2.71828, 5);
      expect(deserialized.boolField).toBe(true);
      expect(deserialized.bytesField).toBeInstanceOf(Uint8Array);
      expect(Array.from(deserialized.bytesField)).toEqual([1, 2, 3]);
    });
  });

  describe('error handling', () => {
    it('should identify SerializationError with type guard', () => {
      const error = new SerializationError('Test error', 'field1', 'value1');

      expect(isSerializationError(error)).toBe(true);
      expect(error.field).toBe('field1');
      expect(error.value).toBe('value1');
    });

    it('should not identify regular errors as SerializationError', () => {
      const error = new Error('Regular error');

      expect(isSerializationError(error)).toBe(false);
    });
  });
});
