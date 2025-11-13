/**
 * ImportResolver - Resolves cross-file type references and manages import dependencies
 *
 * This class handles the resolution of type references across proto files,
 * manages package namespace imports, and generates proper import paths
 * for the generated TypeScript code.
 */
import { ProtoFile, MessageDefinition, ServiceDefinition, EnumDefinition } from '../core/proto-types';
import { NameResolver } from './NameResolver';
import { TypeMapper } from './TypeMapper';
/**
 * Type reference information
 */
export interface TypeReference {
    /**
     * Fully qualified type name (e.g., "google.protobuf.Timestamp")
     */
    fullName: string;
    /**
     * Package name (e.g., "google.protobuf")
     */
    package: string;
    /**
     * Type name without package (e.g., "Timestamp")
     */
    typeName: string;
    /**
     * Source file where the type is defined
     */
    sourceFile?: string;
    /**
     * Whether this is a well-known type
     */
    isWellKnown?: boolean;
    /**
     * Whether this is an external import
     */
    isExternal?: boolean;
}
/**
 * Import dependency information
 */
export interface ImportDependency {
    /**
     * Source file path (relative or absolute)
     */
    source: string;
    /**
     * Types to import from this source
     */
    types: string[];
    /**
     * Whether this is a proto file import
     */
    isProtoImport: boolean;
    /**
     * Generated TypeScript module path
     */
    tsModulePath?: string;
    /**
     * Whether to use namespace import
     */
    useNamespace?: boolean;
    /**
     * Namespace name if using namespace import
     */
    namespaceName?: string;
}
/**
 * Type registry entry
 */
interface TypeRegistryEntry {
    file: ProtoFile;
    package: string;
    typeName: string;
    fullName: string;
    kind: 'message' | 'enum' | 'service';
    definition: MessageDefinition | EnumDefinition | ServiceDefinition;
}
/**
 * Import resolution configuration
 */
export interface ImportResolverConfig {
    /**
     * Base path for resolving imports
     */
    basePath?: string;
    /**
     * Output directory for generated files
     */
    outputDir?: string;
    /**
     * Whether to use relative imports
     */
    useRelativeImports?: boolean;
    /**
     * Whether to generate namespace imports for packages
     */
    useNamespaceImports?: boolean;
    /**
     * Custom import paths mapping
     */
    customImportPaths?: Record<string, string>;
    /**
     * File extension for generated files
     */
    fileExtension?: string;
}
/**
 * ImportResolver class for managing cross-file dependencies
 */
export declare class ImportResolver {
    private typeRegistry;
    private fileRegistry;
    private dependencyGraph;
    private config;
    private nameResolver;
    private typeMapper;
    constructor(config?: ImportResolverConfig, nameResolver?: NameResolver, typeMapper?: TypeMapper);
    /**
     * Register a proto file and its types
     */
    registerProtoFile(file: ProtoFile): void;
    /**
     * Register message types recursively
     */
    private registerMessages;
    /**
     * Register enum types
     */
    private registerEnums;
    /**
     * Register service types
     */
    private registerServices;
    /**
     * Resolve a type reference to its definition
     */
    resolveType(typeName: string, currentPackage?: string): TypeReference | null;
    /**
     * Get all import dependencies for a proto file
     */
    getImportDependencies(fileName: string): ImportDependency[];
    /**
     * Collect all type references from a proto file
     */
    private collectTypeReferences;
    /**
     * Add a type reference if not already processed
     */
    private addTypeReference;
    /**
     * Generate import path between two files
     */
    private generateImportPath;
    /**
     * Strip .proto extension and add TypeScript extension
     */
    private stripProtoExtension;
    /**
     * Extract package name from file path
     */
    private extractPackageFromPath;
    /**
     * Get all types defined in a file
     */
    getFileTypes(fileName: string): TypeRegistryEntry[];
    /**
     * Check if a type is defined locally in a file
     */
    isLocalType(typeName: string, fileName: string): boolean;
    /**
     * Get dependency graph for analysis
     */
    getDependencyGraph(): Map<string, Set<string>>;
    /**
     * Clear all registries
     */
    clear(): void;
}
/**
 * Create a default ImportResolver instance
 */
export declare function createImportResolver(config?: ImportResolverConfig, nameResolver?: NameResolver, typeMapper?: TypeMapper): ImportResolver;
export {};
//# sourceMappingURL=ImportResolver.d.ts.map