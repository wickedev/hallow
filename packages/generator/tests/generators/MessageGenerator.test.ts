/**
 * Unit tests for MessageGenerator
 * 
 * Tests TypeScript interface generation, serialization code generation,
 * nested type handling, and various proto patterns.
 */

import { MessageGenerator, createMessageGenerator } from '../../src/generators/MessageGenerator';
import { TemplateEngine } from '../../src/core/template-engine';
import { 
  MessageDefinition, 
  FieldDefinition, 
  EnumDefinition, 
  OneofDefinition 
} from '../../src/core/proto-types';

describe('MessageGenerator', () => {
  let generator: MessageGenerator;
  let templateEngine: TemplateEngine;

  beforeEach(() => {
    templateEngine = new TemplateEngine();
    generator = createMessageGenerator(templateEngine, {
      generateComments: true,
      readonlyProperties: false,
      generateNamespaces: true
    });
  });

  describe('generateInterface', () => {
    it('should generate a simple message interface', () => {
      const message: MessageDefinition = {
        name: 'Person',
        fields: [
          {
            name: 'name',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          },
          {
            name: 'age',
            number: 2,
            type: 'int32',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(message);

      expect(result).toContain('export interface Person');
      expect(result).toContain('name: string;');
      expect(result).toContain('age: number;');
    });

    it('should generate interface with optional fields', () => {
      const message: MessageDefinition = {
        name: 'User',
        fields: [
          {
            name: 'id',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          },
          {
            name: 'email',
            number: 2,
            type: 'string',
            repeated: false,
            optional: true,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(message);

      expect(result).toContain('id: string;');
      expect(result).toContain('email?: string | undefined;');
    });

    it('should generate interface with repeated fields', () => {
      const message: MessageDefinition = {
        name: 'Group',
        fields: [
          {
            name: 'members',
            number: 1,
            type: 'string',
            repeated: true,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(message);

      expect(result).toContain('members: string[];');
    });

    it('should generate interface with map fields', () => {
      const message: MessageDefinition = {
        name: 'Config',
        fields: [
          {
            name: 'settings',
            number: 1,
            type: 'map',
            repeated: false,
            optional: false,
            map: true,
            mapKeyType: 'string',
            mapValueType: 'string',
            options: {}
          }
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(message);

      expect(result).toContain('settings: Map<string, string>;');
    });

    it('should generate interface with oneof fields', () => {
      const message: MessageDefinition = {
        name: 'Response',
        fields: [],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [
          {
            name: 'result',
            fields: [
              {
                name: 'success',
                number: 1,
                type: 'string',
                repeated: false,
                optional: false,
                map: false,
                options: {}
              },
              {
                name: 'error',
                number: 2,
                type: 'string',
                repeated: false,
                optional: false,
                map: false,
                options: {}
              }
            ]
          }
        ],
        options: {}
      };

      const result = generator.generateInterface(message);

      expect(result).toContain('result:');
      expect(result).toMatch(/\{ result: 'success'; success: string \}/);
      expect(result).toMatch(/\{ result: 'error'; error: string \}/);
    });

    it('should generate interface with nested messages', () => {
      const nestedMessage: MessageDefinition = {
        name: 'Address',
        fields: [
          {
            name: 'street',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          },
          {
            name: 'city',
            number: 2,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const message: MessageDefinition = {
        name: 'Person',
        fields: [
          {
            name: 'name',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [nestedMessage],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(message);

      expect(result).toContain('export interface Person');
      expect(result).toContain('export namespace Person');
      expect(result).toContain('export interface Address');
      expect(result).toContain('street: string;');
      expect(result).toContain('city: string;');
    });

    it('should generate interface with nested enums', () => {
      const nestedEnum: EnumDefinition = {
        name: 'Status',
        values: [
          { name: 'ACTIVE', number: 0, options: {} },
          { name: 'INACTIVE', number: 1, options: {} },
          { name: 'PENDING', number: 2, options: {} }
        ],
        options: {}
      };

      const message: MessageDefinition = {
        name: 'Account',
        fields: [
          {
            name: 'status',
            number: 1,
            type: 'Status',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [],
        nestedEnums: [nestedEnum],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(message);

      expect(result).toContain('export namespace Account');
      expect(result).toContain('export enum Status');
      expect(result).toContain('ACTIVE = 0');
      expect(result).toContain('INACTIVE = 1');
      expect(result).toContain('PENDING = 2');
    });
  });

  describe('generateSerialization', () => {
    it('should generate encode/decode methods for simple message', () => {
      const message: MessageDefinition = {
        name: 'SimpleMessage',
        fields: [
          {
            name: 'value',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateSerialization(message);

      expect(result).toContain('export namespace SimpleMessage');
      expect(result).toContain('export function encode(message: SimpleMessage): Uint8Array');
      expect(result).toContain('export function decode(bytes: Uint8Array): SimpleMessage');
      expect(result).toContain('writer.writeString(1, message.value)');
      expect(result).toContain('reader.readString()');
    });

    it('should generate serialization for repeated fields', () => {
      const message: MessageDefinition = {
        name: 'ListMessage',
        fields: [
          {
            name: 'items',
            number: 1,
            type: 'int32',
            repeated: true,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateSerialization(message);

      // int32 repeated fields are packed by default in protobuf3
      expect(result).toContain('writer.writePackedInt32(1, message.items)');
      expect(result).toContain('message.items = reader.readPackedInt32() || []');
    });

    it('should generate serialization for map fields', () => {
      const message: MessageDefinition = {
        name: 'MapMessage',
        fields: [
          {
            name: 'data',
            number: 1,
            type: 'map',
            repeated: false,
            optional: false,
            map: true,
            mapKeyType: 'string',
            mapValueType: 'int32',
            options: {}
          }
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateSerialization(message);

      expect(result).toContain('for (const [key, value] of message.data)');
      expect(result).toContain('writer.beginSubMessage(1)');
      expect(result).toContain('writer.writeString(1, key)');
      expect(result).toContain('writer.writeInt32(2, value)');
      expect(result).toContain('writer.endSubMessage(1)');
      expect(result).toContain('reader.readMessage((r) => {');
      expect(result).toContain('message.data.set(key, value)');
    });

    it('should generate serialization for oneof fields', () => {
      const message: MessageDefinition = {
        name: 'OneofMessage',
        fields: [],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [
          {
            name: 'choice',
            fields: [
              {
                name: 'text',
                number: 1,
                type: 'string',
                repeated: false,
                optional: false,
                map: false,
                options: {}
              },
              {
                name: 'number',
                number: 2,
                type: 'int32',
                repeated: false,
                optional: false,
                map: false,
                options: {}
              }
            ]
          }
        ],
        options: {}
      };

      const result = generator.generateSerialization(message);

      expect(result).toContain("if (message.choice === 'text')");
      expect(result).toContain('writer.writeString(1, message.text)');
      expect(result).toContain("if (message.choice === 'number')");
      // 'number' is a reserved word in JS, so it gets escaped to _number
      expect(result).toContain('writer.writeInt32(2, message._number)');
    });

    it('should handle all scalar types correctly', () => {
      const message: MessageDefinition = {
        name: 'ScalarTypes',
        fields: [
          { name: 'doubleField', number: 1, type: 'double', repeated: false, optional: false, map: false, options: {} },
          { name: 'floatField', number: 2, type: 'float', repeated: false, optional: false, map: false, options: {} },
          { name: 'int32Field', number: 3, type: 'int32', repeated: false, optional: false, map: false, options: {} },
          { name: 'int64Field', number: 4, type: 'int64', repeated: false, optional: false, map: false, options: {} },
          { name: 'boolField', number: 5, type: 'bool', repeated: false, optional: false, map: false, options: {} },
          { name: 'stringField', number: 6, type: 'string', repeated: false, optional: false, map: false, options: {} },
          { name: 'bytesField', number: 7, type: 'bytes', repeated: false, optional: false, map: false, options: {} }
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateSerialization(message);

      expect(result).toContain('writer.writeDouble(1, message.doubleField)');
      expect(result).toContain('writer.writeFloat(2, message.floatField)');
      expect(result).toContain('writer.writeInt32(3, message.int32Field)');
      expect(result).toContain('writer.writeInt64(4, message.int64Field)');
      expect(result).toContain('writer.writeBool(5, message.boolField)');
      expect(result).toContain('writer.writeString(6, message.stringField)');
      expect(result).toContain('writer.writeBytes(7, message.bytesField)');

      expect(result).toContain('reader.readDouble()');
      expect(result).toContain('reader.readFloat()');
      expect(result).toContain('reader.readInt32()');
      expect(result).toContain('reader.readInt64()');
      expect(result).toContain('reader.readBool()');
      expect(result).toContain('reader.readString()');
      expect(result).toContain('reader.readBytes()');
    });
  });

  describe('generateMessage', () => {
    it('should generate complete message with interface and serialization', () => {
      const message: MessageDefinition = {
        name: 'CompleteMessage',
        fields: [
          {
            name: 'id',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          },
          {
            name: 'values',
            number: 2,
            type: 'int32',
            repeated: true,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateMessage(message);

      expect(result.interface).toContain('export interface CompleteMessage');
      expect(result.interface).toContain('id: string;');
      expect(result.interface).toContain('values: number[];');

      expect(result.serialization).toContain('export namespace CompleteMessage');
      expect(result.serialization).toContain('export function encode');
      expect(result.serialization).toContain('export function decode');

      expect(result.imports).toContain('import { BinaryReader, BinaryWriter } from \'google-protobuf\';');
      expect(result.exports).toContain('export { CompleteMessage }');
    });

    it('should handle complex nested structure', () => {
      const innerMessage: MessageDefinition = {
        name: 'Inner',
        fields: [
          {
            name: 'value',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const message: MessageDefinition = {
        name: 'Outer',
        fields: [
          {
            name: 'inner',
            number: 1,
            type: 'Inner',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [innerMessage],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateMessage(message);

      expect(result.interface).toContain('export interface Outer');
      expect(result.interface).toContain('inner: Inner;');
      expect(result.nestedTypes).toHaveLength(1);
      expect(result.exports).toContain('export { Outer.Inner }');
    });
  });

  describe('edge cases', () => {
    it('should handle empty message', () => {
      const message: MessageDefinition = {
        name: 'Empty',
        fields: [],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(message);

      expect(result).toContain('export interface Empty {');
      expect(result).toContain('}');
    });

    it('should handle message with only nested types', () => {
      const nestedEnum: EnumDefinition = {
        name: 'Type',
        values: [
          { name: 'A', number: 0, options: {} },
          { name: 'B', number: 1, options: {} }
        ],
        options: {}
      };

      const message: MessageDefinition = {
        name: 'Container',
        fields: [],
        nestedMessages: [],
        nestedEnums: [nestedEnum],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(message);

      expect(result).toContain('export interface Container');
      expect(result).toContain('export namespace Container');
      expect(result).toContain('export enum Type');
    });

    it('should handle field names that conflict with TypeScript keywords', () => {
      const message: MessageDefinition = {
        name: 'Keywords',
        fields: [
          {
            name: 'class',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          },
          {
            name: 'function',
            number: 2,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = generator.generateInterface(message);

      // The NameResolver should handle keyword conflicts
      expect(result).toBeDefined();
      expect(result).toContain('export interface Keywords');
    });

    it('should generate interface without comments when disabled', () => {
      const noCommentsGenerator = createMessageGenerator(templateEngine, {
        generateComments: false
      });

      const message: MessageDefinition = {
        name: 'NoComments',
        fields: [
          {
            name: 'field',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = noCommentsGenerator.generateInterface(message);

      expect(result).not.toContain('/**');
      expect(result).toContain('export interface NoComments');
      expect(result).toContain('field: string;');
    });

    it('should generate readonly properties when configured', () => {
      const readonlyGenerator = createMessageGenerator(templateEngine, {
        readonlyProperties: true
      });

      const message: MessageDefinition = {
        name: 'ReadOnly',
        fields: [
          {
            name: 'field',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {}
          },
          {
            name: 'list',
            number: 2,
            type: 'int32',
            repeated: true,
            optional: false,
            map: false,
            options: {}
          }
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {}
      };

      const result = readonlyGenerator.generateInterface(message);

      expect(result).toContain('readonly field: string;');
      expect(result).toContain('readonly list: readonly number[];');
    });
  });
});