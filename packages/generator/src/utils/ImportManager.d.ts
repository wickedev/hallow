/**
 * ImportManager - Manages import statements for generated TypeScript code
 *
 * This class handles the collection, deduplication, and generation of
 * import statements for the generated TypeScript code.
 */
import { ImportDependency } from './ImportResolver';
/**
 * Import type enumeration
 */
export declare enum ImportType {
    Named = "named",
    Default = "default",
    Namespace = "namespace",
    Type = "type",
    SideEffect = "side-effect"
}
/**
 * Import statement information
 */
export interface ImportInfo {
    /**
     * Source module to import from
     */
    source: string;
    /**
     * Type of import
     */
    type: ImportType;
    /**
     * Names to import (for named imports)
     */
    names?: string[];
    /**
     * Default import name
     */
    defaultName?: string;
    /**
     * Namespace import name
     */
    namespaceName?: string;
    /**
     * Whether this is a type-only import
     */
    typeOnly?: boolean;
}
/**
 * Import grouping configuration
 */
export interface ImportGroupConfig {
    /**
     * Group imports by category
     */
    groupByCategory?: boolean;
    /**
     * Sort imports alphabetically
     */
    sortAlphabetically?: boolean;
    /**
     * Add blank lines between groups
     */
    addBlankLinesBetweenGroups?: boolean;
    /**
     * Custom import order
     */
    customOrder?: string[];
}
/**
 * ImportManager class for managing TypeScript imports
 */
export declare class ImportManager {
    private imports;
    private typeImports;
    private regularImports;
    private defaultImports;
    private namespaceImports;
    private sideEffectImports;
    private config;
    constructor(config?: ImportGroupConfig);
    /**
     * Add a named import
     */
    addNamedImport(source: string, name: string, typeOnly?: boolean): void;
    /**
     * Add multiple named imports
     */
    addNamedImports(source: string, names: string[], typeOnly?: boolean): void;
    /**
     * Add a default import
     */
    addDefaultImport(source: string, name: string): void;
    /**
     * Add a namespace import
     */
    addNamespaceImport(source: string, name: string): void;
    /**
     * Add a side-effect import
     */
    addSideEffectImport(source: string): void;
    /**
     * Add common gRPC and protobuf imports
     */
    addGrpcImports(): void;
    /**
     * Add React imports
     */
    addReactImports(hooks?: string[]): void;
    /**
     * Add React Suspense imports
     */
    addSuspenseImports(): void;
    /**
     * Generate import statements
     */
    generateImports(): string;
    /**
     * Generate a group of imports based on a filter
     */
    private generateImportGroup;
    /**
     * Build an import statement
     */
    private buildImportStatement;
    /**
     * Check if a source is an external package
     */
    private isExternalPackage;
    /**
     * Clear all imports
     */
    clear(): void;
    /**
     * Check if any imports have been added
     */
    hasImports(): boolean;
    /**
     * Get the count of imports
     */
    getImportCount(): number;
    /**
     * Merge another ImportManager's imports into this one
     */
    merge(other: ImportManager): void;
    /**
     * Create a clone of this ImportManager
     */
    clone(): ImportManager;
    /**
     * Add imports from ImportResolver dependencies
     */
    addFromDependencies(dependencies: ImportDependency[]): void;
    /**
     * Add protobuf message imports
     */
    addProtobufMessageImports(messages: string[], source?: string): void;
    /**
     * Add cross-file proto imports
     */
    addCrossFileImport(typeName: string, fromFile: string, isTypeOnly?: boolean): void;
    /**
     * Add well-known protobuf type imports
     */
    addWellKnownTypeImport(typeName: string, importPath: string): void;
    /**
     * Generate organized imports for proto-generated code
     */
    generateProtoImports(): string;
    /**
     * Check if imports include a specific type
     */
    hasType(typeName: string): boolean;
    /**
     * Get the source for a specific type
     */
    getTypeSource(typeName: string): string | null;
    /**
     * Get all collected imports grouped by source
     * Returns a structured view of all imports for inspection or manipulation
     */
    getImports(): {
        regular: Map<string, string[]>;
        types: Map<string, string[]>;
        defaults: Map<string, string>;
        namespaces: Map<string, string>;
        sideEffects: string[];
    };
    /**
     * Get import statement for a specific source
     * Builds a formatted import statement string for the given source
     */
    getImportStatement(source: string): string | null;
    /**
     * Optimize imports by consolidating and removing duplicates
     * This method can be called before generating final imports to ensure
     * the most efficient import statements
     */
    optimizeImports(): void;
    /**
     * Get all sources that have imports
     */
    getAllSources(): string[];
    /**
     * Remove all imports from a specific source
     */
    removeSource(source: string): void;
    /**
     * Check if imports are empty
     */
    isEmpty(): boolean;
    /**
     * Convert imports to JSON for serialization
     */
    toJSON(): {
        regular: Record<string, string[]>;
        types: Record<string, string[]>;
        defaults: Record<string, string>;
        namespaces: Record<string, string>;
        sideEffects: string[];
    };
    /**
     * Load imports from JSON
     */
    fromJSON(json: {
        regular?: Record<string, string[]>;
        types?: Record<string, string[]>;
        defaults?: Record<string, string>;
        namespaces?: Record<string, string>;
        sideEffects?: string[];
    }): void;
}
/**
 * Create a default ImportManager instance
 */
export declare function createImportManager(config?: ImportGroupConfig): ImportManager;
//# sourceMappingURL=ImportManager.d.ts.map