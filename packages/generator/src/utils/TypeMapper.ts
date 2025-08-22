/**
 * TypeMapper - Proto to TypeScript type conversion utilities
 * 
 * This class handles the conversion of Protocol Buffer types to their
 * corresponding TypeScript types, including scalar types, complex types,
 * and special field modifiers like repeated, optional, and oneof.
 */

import { FieldDefinition, MessageDefinition, EnumDefinition } from '../core/proto-types';
import { GenerationError, GenerationErrorCode } from '../core/types';

/**
 * Type mapping configuration
 */
export interface TypeMappingConfig {
  /**
   * Whether to use TypeScript's strict null checks
   */
  strictNullChecks?: boolean;
  
  /**
   * Whether to use bigint for 64-bit integers
   */
  useBigInt?: boolean;
  
  /**
   * Custom type mappings for specific proto types
   */
  customMappings?: Record<string, string>;
  
  /**
   * Whether to generate readonly properties
   */
  readonlyProperties?: boolean;
}

/**
 * TypeScript type information
 */
export interface TypeScriptType {
  /**
   * The TypeScript type string
   */
  type: string;
  
  /**
   * Import statements required for this type
   */
  imports: Set<string>;
  
  /**
   * Whether the type is nullable
   */
  nullable: boolean;
  
  /**
   * Whether the type is an array
   */
  isArray: boolean;
  
  /**
   * Whether the type is a map
   */
  isMap: boolean;
}

/**
 * TypeMapper class for converting Proto types to TypeScript
 */
export class TypeMapper {
  /**
   * Scalar type mappings from Proto to TypeScript
   */
  private static readonly SCALAR_TYPE_MAP: Record<string, string> = {
    // Numeric types
    'double': 'number',
    'float': 'number',
    'int32': 'number',
    'int64': 'string', // Default to string, can be overridden with bigint
    'uint32': 'number',
    'uint64': 'string', // Default to string, can be overridden with bigint
    'sint32': 'number',
    'sint64': 'string', // Default to string, can be overridden with bigint
    'fixed32': 'number',
    'fixed64': 'string', // Default to string, can be overridden with bigint
    'sfixed32': 'number',
    'sfixed64': 'string', // Default to string, can be overridden with bigint
    
    // Boolean type
    'bool': 'boolean',
    
    // String types
    'string': 'string',
    
    // Binary type
    'bytes': 'Uint8Array',
  };
  
  /**
   * Well-known Google protobuf types
   */
  private static readonly WELL_KNOWN_TYPES: Record<string, string> = {
    'google.protobuf.Any': 'any',
    'google.protobuf.Timestamp': 'Date',
    'google.protobuf.Duration': '{ seconds: number; nanos: number }',
    'google.protobuf.Empty': '{}',
    'google.protobuf.Struct': 'Record<string, any>',
    'google.protobuf.Value': 'any',
    'google.protobuf.ListValue': 'any[]',
    'google.protobuf.BoolValue': 'boolean | null',
    'google.protobuf.StringValue': 'string | null',
    'google.protobuf.BytesValue': 'Uint8Array | null',
    'google.protobuf.Int32Value': 'number | null',
    'google.protobuf.Int64Value': 'string | null',
    'google.protobuf.UInt32Value': 'number | null',
    'google.protobuf.UInt64Value': 'string | null',
    'google.protobuf.FloatValue': 'number | null',
    'google.protobuf.DoubleValue': 'number | null',
  };
  
  private config: TypeMappingConfig;
  private typeRegistry: Map<string, string>;
  
  constructor(config: TypeMappingConfig = {}) {
    this.config = {
      strictNullChecks: true,
      useBigInt: false,
      readonlyProperties: false,
      ...config,
    };
    
    this.typeRegistry = new Map();
    this.initializeTypeRegistry();
  }
  
  /**
   * Initialize the type registry with custom mappings
   */
  private initializeTypeRegistry(): void {
    // Add custom mappings to registry
    if (this.config.customMappings) {
      Object.entries(this.config.customMappings).forEach(([proto, ts]) => {
        this.typeRegistry.set(proto, ts);
      });
    }
    
    // Handle bigint configuration for 64-bit integers
    if (this.config.useBigInt) {
      const bigIntTypes = ['int64', 'uint64', 'sint64', 'fixed64', 'sfixed64'];
      bigIntTypes.forEach(type => {
        this.typeRegistry.set(type, 'bigint');
      });
    }
  }
  
  /**
   * Map a Proto scalar type to TypeScript
   */
  public mapScalarType(protoType: string): string {
    // Check custom mappings first
    if (this.typeRegistry.has(protoType)) {
      return this.typeRegistry.get(protoType)!;
    }
    
    // Check well-known types
    if (TypeMapper.WELL_KNOWN_TYPES[protoType]) {
      return TypeMapper.WELL_KNOWN_TYPES[protoType];
    }
    
    // Check scalar types
    if (TypeMapper.SCALAR_TYPE_MAP[protoType]) {
      return TypeMapper.SCALAR_TYPE_MAP[protoType];
    }
    
    // Default to the type name itself (for custom messages/enums)
    return protoType;
  }
  
  /**
   * Map a field definition to TypeScript type
   */
  public mapFieldType(field: FieldDefinition, context?: TypeContext): TypeScriptType {
    const imports = new Set<string>();
    let baseType = this.mapScalarType(field.type);
    const nullable = !!(field.optional && this.config.strictNullChecks);
    
    // Handle map fields
    if (field.map && field.mapKeyType && field.mapValueType) {
      const keyType = this.mapScalarType(field.mapKeyType);
      const valueType = this.mapScalarType(field.mapValueType);
      baseType = `Map<${keyType}, ${valueType}>`;
      
      return {
        type: baseType,
        imports,
        nullable,
        isArray: false,
        isMap: true,
      };
    }
    
    // Handle repeated fields
    if (field.repeated) {
      baseType = `${baseType}[]`;
      
      return {
        type: this.config.readonlyProperties ? `readonly ${baseType}` : baseType,
        imports,
        nullable,
        isArray: true,
        isMap: false,
      };
    }
    
    // Handle optional fields
    if (field.optional && this.config.strictNullChecks) {
      baseType = `${baseType} | undefined`;
    }
    
    // Add readonly modifier if configured
    if (this.config.readonlyProperties) {
      baseType = `readonly ${baseType}`;
    }
    
    return {
      type: baseType,
      imports,
      nullable,
      isArray: false,
      isMap: false,
    };
  }
  
  /**
   * Map repeated field to TypeScript array type
   */
  public mapRepeatedField(elementType: string, readonly: boolean = false): string {
    const mappedType = this.mapScalarType(elementType);
    const arrayType = `${mappedType}[]`;
    return readonly ? `readonly ${arrayType}` : arrayType;
  }
  
  /**
   * Map optional field with proper null handling
   */
  public mapOptionalField(baseType: string, useUndefined: boolean = true): string {
    const mappedType = this.mapScalarType(baseType);
    if (!this.config.strictNullChecks) {
      return mappedType;
    }
    return useUndefined ? `${mappedType} | undefined` : `${mappedType} | null`;
  }
  
  /**
   * Map oneof field to TypeScript discriminated union
   */
  public mapOneofField(oneofName: string, fields: FieldDefinition[]): string {
    const unionTypes = fields.map(field => {
      const fieldType = this.mapScalarType(field.type);
      return `{ ${oneofName}: '${field.name}'; ${field.name}: ${fieldType} }`;
    });
    
    // Add a case for when no field is set
    if (this.config.strictNullChecks) {
      unionTypes.push(`{ ${oneofName}: undefined }`);
    }
    
    return unionTypes.join(' | ');
  }
  
  /**
   * Map complex message type with nested types
   */
  public mapMessageType(message: MessageDefinition, namespace?: string): string {
    const fullName = namespace ? `${namespace}.${message.name}` : message.name;
    
    // Check if it's a well-known type
    if (TypeMapper.WELL_KNOWN_TYPES[fullName]) {
      return TypeMapper.WELL_KNOWN_TYPES[fullName];
    }
    
    // Return the message name as the type
    return message.name;
  }
  
  /**
   * Map enum type to TypeScript enum or union type
   */
  public mapEnumType(enumDef: EnumDefinition, useConstEnum: boolean = false): string {
    if (useConstEnum) {
      // Generate as const enum (more efficient but has limitations)
      return `const enum ${enumDef.name}`;
    }
    
    // Generate as regular enum
    return `enum ${enumDef.name}`;
  }
  
  /**
   * Generate TypeScript enum values
   */
  public generateEnumValues(enumDef: EnumDefinition): string {
    const values = enumDef.values
      .map(value => `  ${value.name} = ${value.number}`)
      .join(',\n');
    
    return `{\n${values}\n}`;
  }
  
  /**
   * Map a proto package to TypeScript namespace
   */
  public mapPackageToNamespace(packageName: string): string {
    if (!packageName) {
      return '';
    }
    
    // Convert proto package (e.g., "com.example.service") to TypeScript namespace
    return packageName
      .split('.')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('.');
  }
  
  /**
   * Determine if a type requires an import statement
   */
  public requiresImport(typeName: string): boolean {
    // Check if it's a built-in TypeScript type
    const builtInTypes = [
      'string', 'number', 'boolean', 'any', 'void', 'undefined', 'null',
      'object', 'bigint', 'symbol', 'never', 'unknown'
    ];
    
    if (builtInTypes.includes(typeName)) {
      return false;
    }
    
    // Check if it's a built-in JavaScript type
    const jsBuiltInTypes = [
      'Array', 'Map', 'Set', 'Date', 'RegExp', 'Promise', 'Uint8Array'
    ];
    
    if (jsBuiltInTypes.some(type => typeName.includes(type))) {
      return false;
    }
    
    // All other types require imports
    return true;
  }
  
  /**
   * Generate import statement for a type
   */
  public generateImportStatement(typeName: string, fromPath: string): string {
    return `import { ${typeName} } from '${fromPath}';`;
  }
  
  /**
   * Validate type mapping to ensure correctness
   */
  public validateTypeMapping(field: FieldDefinition): void {
    // Check for unsupported field combinations
    if (field.map && field.repeated) {
      throw new GenerationError(
        `Field "${field.name}" cannot be both map and repeated`,
        GenerationErrorCode.TYPE_MAPPING_ERROR,
        { field }
      );
    }
    
    if (field.map && (!field.mapKeyType || !field.mapValueType)) {
      throw new GenerationError(
        `Map field "${field.name}" must have both key and value types`,
        GenerationErrorCode.TYPE_MAPPING_ERROR,
        { field }
      );
    }
    
    // Validate map key type (must be integral or string)
    if (field.map && field.mapKeyType) {
      const validKeyTypes = [
        'int32', 'int64', 'uint32', 'uint64', 'sint32', 'sint64',
        'fixed32', 'fixed64', 'sfixed32', 'sfixed64', 'bool', 'string'
      ];
      
      if (!validKeyTypes.includes(field.mapKeyType)) {
        throw new GenerationError(
          `Invalid map key type "${field.mapKeyType}" for field "${field.name}"`,
          GenerationErrorCode.TYPE_MAPPING_ERROR,
          { field }
        );
      }
    }
  }
  
  /**
   * Get all scalar types supported by the mapper
   */
  public getSupportedScalarTypes(): string[] {
    return Object.keys(TypeMapper.SCALAR_TYPE_MAP);
  }
  
  /**
   * Check if a type is a scalar type
   */
  public isScalarType(typeName: string): boolean {
    return typeName in TypeMapper.SCALAR_TYPE_MAP;
  }
  
  /**
   * Check if a type is a well-known type
   */
  public isWellKnownType(typeName: string): boolean {
    return typeName in TypeMapper.WELL_KNOWN_TYPES;
  }
  
  /**
   * Reset type registry to default state
   */
  public resetTypeRegistry(): void {
    // Clear the registry completely
    this.typeRegistry.clear();
    
    // Reset configuration to exclude custom mappings
    const originalCustomMappings = this.config.customMappings;
    this.config.customMappings = undefined;
    
    // Re-initialize with updated config
    this.initializeTypeRegistry();
    
    // Restore original custom mappings config (but don't apply them)
    this.config.customMappings = originalCustomMappings;
  }
}

/**
 * Type context for complex type resolution
 */
export interface TypeContext {
  /**
   * Current namespace or package
   */
  namespace?: string;
  
  /**
   * Available message types in scope
   */
  messages?: Map<string, MessageDefinition>;
  
  /**
   * Available enum types in scope
   */
  enums?: Map<string, EnumDefinition>;
  
  /**
   * Import paths for external types
   */
  imports?: Map<string, string>;
}

/**
 * Create a default TypeMapper instance
 */
export function createTypeMapper(config?: TypeMappingConfig): TypeMapper {
  return new TypeMapper(config);
}