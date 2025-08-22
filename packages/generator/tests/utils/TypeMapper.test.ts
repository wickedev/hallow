/**
 * Unit tests for TypeMapper
 */

import { TypeMapper, TypeMappingConfig, createTypeMapper } from '../../src/utils/TypeMapper';
import { FieldDefinition, MessageDefinition, EnumDefinition } from '../../src/core/proto-types';
import { GenerationError, GenerationErrorCode } from '../../src/core/types';

describe('TypeMapper', () => {
  let mapper: TypeMapper;
  
  beforeEach(() => {
    mapper = new TypeMapper();
  });
  
  describe('Scalar Type Mapping', () => {
    it('should map numeric proto types to TypeScript number', () => {
      const numericTypes = ['double', 'float', 'int32', 'uint32', 'sint32', 'fixed32', 'sfixed32'];
      
      numericTypes.forEach(type => {
        expect(mapper.mapScalarType(type)).toBe('number');
      });
    });
    
    it('should map 64-bit integers to string by default', () => {
      const int64Types = ['int64', 'uint64', 'sint64', 'fixed64', 'sfixed64'];
      
      int64Types.forEach(type => {
        expect(mapper.mapScalarType(type)).toBe('string');
      });
    });
    
    it('should map 64-bit integers to bigint when configured', () => {
      const bigIntMapper = new TypeMapper({ useBigInt: true });
      const int64Types = ['int64', 'uint64', 'sint64', 'fixed64', 'sfixed64'];
      
      int64Types.forEach(type => {
        expect(bigIntMapper.mapScalarType(type)).toBe('bigint');
      });
    });
    
    it('should map bool to boolean', () => {
      expect(mapper.mapScalarType('bool')).toBe('boolean');
    });
    
    it('should map string to string', () => {
      expect(mapper.mapScalarType('string')).toBe('string');
    });
    
    it('should map bytes to Uint8Array', () => {
      expect(mapper.mapScalarType('bytes')).toBe('Uint8Array');
    });
    
    it('should return custom message types as-is', () => {
      expect(mapper.mapScalarType('UserMessage')).toBe('UserMessage');
      expect(mapper.mapScalarType('com.example.Message')).toBe('com.example.Message');
    });
  });
  
  describe('Well-Known Types Mapping', () => {
    it('should map google.protobuf.Timestamp to Date', () => {
      expect(mapper.mapScalarType('google.protobuf.Timestamp')).toBe('Date');
    });
    
    it('should map google.protobuf.Any to any', () => {
      expect(mapper.mapScalarType('google.protobuf.Any')).toBe('any');
    });
    
    it('should map google.protobuf.Empty to empty object', () => {
      expect(mapper.mapScalarType('google.protobuf.Empty')).toBe('{}');
    });
    
    it('should map google.protobuf.Struct to Record<string, any>', () => {
      expect(mapper.mapScalarType('google.protobuf.Struct')).toBe('Record<string, any>');
    });
    
    it('should map wrapper types with null', () => {
      expect(mapper.mapScalarType('google.protobuf.StringValue')).toBe('string | null');
      expect(mapper.mapScalarType('google.protobuf.BoolValue')).toBe('boolean | null');
      expect(mapper.mapScalarType('google.protobuf.Int32Value')).toBe('number | null');
    });
  });
  
  describe('Field Type Mapping', () => {
    it('should map simple field to basic type', () => {
      const field: FieldDefinition = {
        name: 'name',
        number: 1,
        type: 'string',
        repeated: false,
        optional: false,
        map: false,
        options: {}
      };
      
      const result = mapper.mapFieldType(field);
      expect(result.type).toBe('string');
      expect(result.isArray).toBe(false);
      expect(result.isMap).toBe(false);
      expect(result.nullable).toBe(false);
    });
    
    it('should map repeated field to array', () => {
      const field: FieldDefinition = {
        name: 'items',
        number: 1,
        type: 'string',
        repeated: true,
        optional: false,
        map: false,
        options: {}
      };
      
      const result = mapper.mapFieldType(field);
      expect(result.type).toBe('string[]');
      expect(result.isArray).toBe(true);
      expect(result.isMap).toBe(false);
    });
    
    it('should map optional field with undefined', () => {
      const field: FieldDefinition = {
        name: 'description',
        number: 1,
        type: 'string',
        repeated: false,
        optional: true,
        map: false,
        options: {}
      };
      
      const result = mapper.mapFieldType(field);
      expect(result.type).toBe('string | undefined');
      expect(result.nullable).toBe(true);
    });
    
    it('should map map field to Map type', () => {
      const field: FieldDefinition = {
        name: 'attributes',
        number: 1,
        type: 'map',
        repeated: false,
        optional: false,
        map: true,
        mapKeyType: 'string',
        mapValueType: 'int32',
        options: {}
      };
      
      const result = mapper.mapFieldType(field);
      expect(result.type).toBe('Map<string, number>');
      expect(result.isMap).toBe(true);
      expect(result.isArray).toBe(false);
    });
    
    it('should add readonly modifier when configured', () => {
      const readonlyMapper = new TypeMapper({ readonlyProperties: true });
      
      const field: FieldDefinition = {
        name: 'items',
        number: 1,
        type: 'string',
        repeated: true,
        optional: false,
        map: false,
        options: {}
      };
      
      const result = readonlyMapper.mapFieldType(field);
      expect(result.type).toBe('readonly string[]');
    });
  });
  
  describe('Repeated Fields', () => {
    it('should map repeated scalar fields to arrays', () => {
      expect(mapper.mapRepeatedField('string')).toBe('string[]');
      expect(mapper.mapRepeatedField('int32')).toBe('number[]');
      expect(mapper.mapRepeatedField('bool')).toBe('boolean[]');
    });
    
    it('should map repeated message fields to arrays', () => {
      expect(mapper.mapRepeatedField('UserMessage')).toBe('UserMessage[]');
    });
    
    it('should add readonly modifier when specified', () => {
      expect(mapper.mapRepeatedField('string', true)).toBe('readonly string[]');
    });
  });
  
  describe('Optional Fields', () => {
    it('should map optional fields with undefined by default', () => {
      expect(mapper.mapOptionalField('string')).toBe('string | undefined');
      expect(mapper.mapOptionalField('int32')).toBe('number | undefined');
    });
    
    it('should map optional fields with null when specified', () => {
      expect(mapper.mapOptionalField('string', false)).toBe('string | null');
      expect(mapper.mapOptionalField('bool', false)).toBe('boolean | null');
    });
    
    it('should not add undefined when strictNullChecks is disabled', () => {
      const lenientMapper = new TypeMapper({ strictNullChecks: false });
      expect(lenientMapper.mapOptionalField('string')).toBe('string');
    });
  });
  
  describe('Oneof Fields', () => {
    it('should map oneof to discriminated union', () => {
      const fields: FieldDefinition[] = [
        {
          name: 'email',
          number: 1,
          type: 'string',
          repeated: false,
          optional: false,
          map: false,
          options: {}
        },
        {
          name: 'phone',
          number: 2,
          type: 'string',
          repeated: false,
          optional: false,
          map: false,
          options: {}
        }
      ];
      
      const result = mapper.mapOneofField('contact', fields);
      expect(result).toContain("{ contact: 'email'; email: string }");
      expect(result).toContain("{ contact: 'phone'; phone: string }");
      expect(result).toContain("{ contact: undefined }");
    });
    
    it('should handle different field types in oneof', () => {
      const fields: FieldDefinition[] = [
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
        },
        {
          name: 'flag',
          number: 3,
          type: 'bool',
          repeated: false,
          optional: false,
          map: false,
          options: {}
        }
      ];
      
      const result = mapper.mapOneofField('value', fields);
      expect(result).toContain("{ value: 'text'; text: string }");
      expect(result).toContain("{ value: 'number'; number: number }");
      expect(result).toContain("{ value: 'flag'; flag: boolean }");
    });
  });
  
  describe('Custom Type Mappings', () => {
    it('should use custom type mappings when provided', () => {
      const customMapper = new TypeMapper({
        customMappings: {
          'CustomTimestamp': 'moment.Moment',
          'UUID': 'string',
        }
      });
      
      expect(customMapper.mapScalarType('CustomTimestamp')).toBe('moment.Moment');
      expect(customMapper.mapScalarType('UUID')).toBe('string');
    });
    
    it('should override default mappings with custom ones', () => {
      const customMapper = new TypeMapper({
        customMappings: {
          'int64': 'Long',
        }
      });
      
      expect(customMapper.mapScalarType('int64')).toBe('Long');
    });
  });
  
  describe('Package to Namespace Mapping', () => {
    it('should convert proto package to TypeScript namespace', () => {
      expect(mapper.mapPackageToNamespace('com.example.service')).toBe('Com.Example.Service');
      expect(mapper.mapPackageToNamespace('grpc.health.v1')).toBe('Grpc.Health.V1');
    });
    
    it('should handle empty package name', () => {
      expect(mapper.mapPackageToNamespace('')).toBe('');
    });
    
    it('should handle single-part package name', () => {
      expect(mapper.mapPackageToNamespace('service')).toBe('Service');
    });
  });
  
  describe('Enum Type Mapping', () => {
    it('should map enum to TypeScript enum', () => {
      const enumDef: EnumDefinition = {
        name: 'Status',
        values: [
          { name: 'UNKNOWN', number: 0, options: {} },
          { name: 'ACTIVE', number: 1, options: {} },
          { name: 'INACTIVE', number: 2, options: {} }
        ],
        options: {}
      };
      
      expect(mapper.mapEnumType(enumDef)).toBe('enum Status');
      expect(mapper.mapEnumType(enumDef, true)).toBe('const enum Status');
    });
    
    it('should generate enum values correctly', () => {
      const enumDef: EnumDefinition = {
        name: 'Status',
        values: [
          { name: 'UNKNOWN', number: 0, options: {} },
          { name: 'ACTIVE', number: 1, options: {} },
          { name: 'INACTIVE', number: 2, options: {} }
        ],
        options: {}
      };
      
      const values = mapper.generateEnumValues(enumDef);
      expect(values).toContain('UNKNOWN = 0');
      expect(values).toContain('ACTIVE = 1');
      expect(values).toContain('INACTIVE = 2');
    });
  });
  
  describe('Import Requirements', () => {
    it('should identify types that require imports', () => {
      // Built-in types don't require imports
      expect(mapper.requiresImport('string')).toBe(false);
      expect(mapper.requiresImport('number')).toBe(false);
      expect(mapper.requiresImport('boolean')).toBe(false);
      expect(mapper.requiresImport('any')).toBe(false);
      
      // JavaScript built-in types don't require imports
      expect(mapper.requiresImport('Array')).toBe(false);
      expect(mapper.requiresImport('Map<string, number>')).toBe(false);
      expect(mapper.requiresImport('Uint8Array')).toBe(false);
      
      // Custom types require imports
      expect(mapper.requiresImport('UserMessage')).toBe(true);
      expect(mapper.requiresImport('CustomType')).toBe(true);
    });
    
    it('should generate import statements correctly', () => {
      expect(mapper.generateImportStatement('UserMessage', './types'))
        .toBe("import { UserMessage } from './types';");
      
      expect(mapper.generateImportStatement('Status', '../enums'))
        .toBe("import { Status } from '../enums';");
    });
  });
  
  describe('Type Validation', () => {
    it('should throw error for field that is both map and repeated', () => {
      const invalidField: FieldDefinition = {
        name: 'invalid',
        number: 1,
        type: 'map',
        repeated: true,
        optional: false,
        map: true,
        mapKeyType: 'string',
        mapValueType: 'string',
        options: {}
      };
      
      expect(() => mapper.validateTypeMapping(invalidField))
        .toThrow(GenerationError);
    });
    
    it('should throw error for map field without key/value types', () => {
      const invalidField: FieldDefinition = {
        name: 'invalid',
        number: 1,
        type: 'map',
        repeated: false,
        optional: false,
        map: true,
        options: {}
      };
      
      expect(() => mapper.validateTypeMapping(invalidField))
        .toThrow(GenerationError);
    });
    
    it('should throw error for map with invalid key type', () => {
      const invalidField: FieldDefinition = {
        name: 'invalid',
        number: 1,
        type: 'map',
        repeated: false,
        optional: false,
        map: true,
        mapKeyType: 'float', // Invalid key type
        mapValueType: 'string',
        options: {}
      };
      
      expect(() => mapper.validateTypeMapping(invalidField))
        .toThrow(GenerationError);
    });
    
    it('should pass validation for valid fields', () => {
      const validField: FieldDefinition = {
        name: 'valid',
        number: 1,
        type: 'string',
        repeated: false,
        optional: true,
        map: false,
        options: {}
      };
      
      expect(() => mapper.validateTypeMapping(validField)).not.toThrow();
    });
  });
  
  describe('Helper Methods', () => {
    it('should return all supported scalar types', () => {
      const scalarTypes = mapper.getSupportedScalarTypes();
      expect(scalarTypes).toContain('string');
      expect(scalarTypes).toContain('int32');
      expect(scalarTypes).toContain('bool');
      expect(scalarTypes).toContain('bytes');
      expect(scalarTypes.length).toBeGreaterThan(10);
    });
    
    it('should identify scalar types correctly', () => {
      expect(mapper.isScalarType('string')).toBe(true);
      expect(mapper.isScalarType('int32')).toBe(true);
      expect(mapper.isScalarType('bool')).toBe(true);
      expect(mapper.isScalarType('UserMessage')).toBe(false);
    });
    
    it('should identify well-known types correctly', () => {
      expect(mapper.isWellKnownType('google.protobuf.Timestamp')).toBe(true);
      expect(mapper.isWellKnownType('google.protobuf.Any')).toBe(true);
      expect(mapper.isWellKnownType('UserMessage')).toBe(false);
    });
    
    it('should reset type registry correctly', () => {
      const customMapper = new TypeMapper({
        customMappings: { 'Custom': 'CustomType' }
      });
      
      expect(customMapper.mapScalarType('Custom')).toBe('CustomType');
      
      customMapper.resetTypeRegistry();
      expect(customMapper.mapScalarType('Custom')).toBe('Custom');
    });
  });
  
  describe('Factory Function', () => {
    it('should create TypeMapper instance with createTypeMapper', () => {
      const mapper1 = createTypeMapper();
      expect(mapper1).toBeInstanceOf(TypeMapper);
      
      const mapper2 = createTypeMapper({ useBigInt: true });
      expect(mapper2.mapScalarType('int64')).toBe('bigint');
    });
  });
});