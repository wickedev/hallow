/**
 * NameResolver - Utilities for resolving and transforming proto names
 *
 * This class handles name resolution, transformation, and conflict resolution
 * for converting Protocol Buffer names to TypeScript identifiers.
 */
/**
 * Reserved for future enhancement: Context-aware name resolution
 *
 * The following types from '../core/proto-types' may be used in future implementations
 * to enable context-aware name resolution and validation:
 *
 * - MessageDefinition: For validating message field references and detecting naming conflicts
 *   within message hierarchies. Useful for implementing features like:
 *   * Automatic namespace generation based on message nesting
 *   * Detection of field name collisions with nested message names
 *   * Validation of message type references in field definitions
 *
 * - ServiceDefinition: For service-level name transformations and RPC method validation.
 *   Potential use cases:
 *   * Service name uniqueness validation across proto files
 *   * RPC method name conflict detection
 *   * Service-specific naming conventions (e.g., gRPC-web vs native gRPC)
 *
 * - EnumDefinition: For enum value conflict detection and scoped enum generation.
 *   Future features might include:
 *   * Validation of enum value uniqueness within scope
 *   * Detection of enum name conflicts with message/service names
 *   * Scoped enum name resolution (nested vs top-level)
 *
 * These types are currently commented out to reduce import overhead until the features
 * are implemented. If implementing context-aware resolution, uncomment and import:
 * import { MessageDefinition, ServiceDefinition, EnumDefinition } from '../core/proto-types';
 *
 * Related tracking:
 * - Feature request: Context-aware name resolution (Phase 2 enhancements)
 * - Requirement 1.2: Comprehensive Proto File Validation
 * - Design doc: .claude/specs/project-enhancements/design.md (Component 3)
 */
/**
 * Name resolution configuration
 */
export interface NameResolverConfig {
    /**
     * Prefix for generated types to avoid conflicts
     */
    typePrefix?: string;
    /**
     * Suffix for generated types
     */
    typeSuffix?: string;
    /**
     * Whether to preserve proto naming case
     */
    preserveProtoCase?: boolean;
    /**
     * Custom name transformations
     */
    customTransformations?: Record<string, string>;
    /**
     * Reserved words to avoid in generated code
     */
    reservedWords?: Set<string>;
}
/**
 * NameResolver class for handling proto name transformations
 */
export declare class NameResolver {
    /**
     * TypeScript reserved keywords
     */
    private static readonly TS_RESERVED_WORDS;
    /**
     * Common proto field names that might conflict
     */
    private static readonly COMMON_CONFLICTS;
    private config;
    private nameRegistry;
    private conflictCounter;
    constructor(config?: NameResolverConfig);
    /**
     * Convert proto name to TypeScript identifier
     */
    resolveTypeName(protoName: string, isInterface?: boolean): string;
    /**
     * Convert proto field name to TypeScript property name
     */
    resolveFieldName(protoFieldName: string): string;
    /**
     * Convert proto method name to TypeScript method name
     */
    resolveMethodName(protoMethodName: string): string;
    /**
     * Convert proto service name to TypeScript class name
     */
    resolveServiceName(protoServiceName: string, suffix?: string): string;
    /**
     * Convert proto enum value to TypeScript enum member
     */
    resolveEnumValue(protoEnumValue: string): string;
    /**
     * Generate a unique name for a nested type
     */
    resolveNestedTypeName(parentName: string, nestedName: string): string;
    /**
     * Convert snake_case or kebab-case to PascalCase
     */
    private toPascalCase;
    /**
     * Convert snake_case or kebab-case to camelCase
     */
    private toCamelCase;
    /**
     * Check if a name is a reserved word
     */
    private isReservedWord;
    /**
     * Escape a reserved word
     */
    private escapeReservedWord;
    /**
     * Resolve naming conflicts
     */
    private resolveConflicts;
    /**
     * Generate a namespace name from a package name
     */
    resolveNamespace(packageName: string): string;
    /**
     * Generate an import path for a type
     */
    resolveImportPath(typeName: string, fromPackage: string, toPackage: string): string;
    /**
     * Generate a React Hook name from a method name
     */
    resolveHookName(methodName: string): string;
    /**
     * Generate a Suspense Hook name from a method name
     */
    resolveSuspenseHookName(methodName: string): string;
    /**
     * Clear the name registry
     */
    clearRegistry(): void;
    /**
     * Get all registered name mappings
     */
    getNameMappings(): Map<string, string>;
    /**
     * Check if a name has been registered
     */
    hasName(protoName: string): boolean;
    /**
     * Register a custom name mapping
     */
    registerName(protoName: string, tsName: string): void;
}
/**
 * Create a default NameResolver instance
 */
export declare function createNameResolver(config?: NameResolverConfig): NameResolver;
//# sourceMappingURL=NameResolver.d.ts.map