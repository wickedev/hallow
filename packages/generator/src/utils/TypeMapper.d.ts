/**
 * TypeMapper - Proto to TypeScript type conversion utilities
 *
 * This class handles the conversion of Protocol Buffer types to their
 * corresponding TypeScript types, including scalar types, complex types,
 * and special field modifiers like repeated, optional, and oneof.
 */
import { FieldDefinition, MessageDefinition, EnumDefinition } from '../core/proto-types';
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
export declare class TypeMapper {
    /**
     * Scalar type mappings from Proto to TypeScript
     */
    private static readonly SCALAR_TYPE_MAP;
    /**
     * Well-known Google protobuf types
     */
    private static readonly WELL_KNOWN_TYPES;
    private config;
    private typeRegistry;
    constructor(config?: TypeMappingConfig);
    /**
     * Initialize the type registry with custom mappings
     */
    private initializeTypeRegistry;
    /**
     * Map a Proto scalar type to TypeScript
     */
    mapScalarType(protoType: string): string;
    /**
     * Map a field definition to TypeScript type
     */
    mapFieldType(field: FieldDefinition, _context?: TypeContext): TypeScriptType;
    /**
     * Map repeated field to TypeScript array type
     */
    mapRepeatedField(elementType: string, readonly?: boolean): string;
    /**
     * Map optional field with proper null handling
     */
    mapOptionalField(baseType: string, useUndefined?: boolean): string;
    /**
     * Map oneof field to TypeScript discriminated union
     */
    mapOneofField(oneofName: string, fields: FieldDefinition[]): string;
    /**
     * Map complex message type with nested types
     */
    mapMessageType(message: MessageDefinition, namespace?: string): string;
    /**
     * Map enum type to TypeScript enum or union type
     */
    mapEnumType(enumDef: EnumDefinition, useConstEnum?: boolean): string;
    /**
     * Generate TypeScript enum values
     */
    generateEnumValues(enumDef: EnumDefinition): string;
    /**
     * Map a proto package to TypeScript namespace
     */
    mapPackageToNamespace(packageName: string): string;
    /**
     * Determine if a type requires an import statement
     */
    requiresImport(typeName: string): boolean;
    /**
     * Generate import statement for a type
     */
    generateImportStatement(typeName: string, fromPath: string): string;
    /**
     * Validate type mapping to ensure correctness
     */
    validateTypeMapping(field: FieldDefinition): void;
    /**
     * Get all scalar types supported by the mapper
     */
    getSupportedScalarTypes(): string[];
    /**
     * Check if a type is a scalar type
     */
    isScalarType(typeName: string): boolean;
    /**
     * Check if a type is a well-known type
     */
    isWellKnownType(typeName: string): boolean;
    /**
     * Reset type registry to default state
     */
    resetTypeRegistry(): void;
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
export declare function createTypeMapper(config?: TypeMappingConfig): TypeMapper;
//# sourceMappingURL=TypeMapper.d.ts.map