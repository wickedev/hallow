/**
 * DependencyResolver - Resolves dependencies across chunked generation
 *
 * This class builds dependency graphs for proto elements (messages, enums)
 * and resolves import statements after all chunks are processed.
 */
import { MessageDefinition, EnumDefinition } from '../core/proto-types';
/**
 * Dependency node representing a type and its dependencies
 */
export interface DependencyNode {
    name: string;
    type: 'message' | 'enum';
    dependencies: Set<string>;
    importPath?: string;
    chunkIndex?: number;
}
/**
 * Dependency graph for tracking relationships between types
 */
export interface DependencyGraph {
    nodes: Map<string, DependencyNode>;
    edges: Map<string, Set<string>>;
}
/**
 * Import statement after dependency resolution
 */
export interface ResolvedImport {
    source: string;
    types: string[];
    isTypeOnly: boolean;
}
/**
 * DependencyResolver class for managing cross-chunk dependencies
 */
export declare class DependencyResolver {
    private graph;
    private typeToChunk;
    private chunkToTypes;
    constructor();
    /**
     * Add a message to the dependency graph
     */
    addMessage(message: MessageDefinition, chunkIndex: number): void;
    /**
     * Add an enum to the dependency graph
     */
    addEnum(enumDef: EnumDefinition, chunkIndex: number): void;
    /**
     * Resolve cross-chunk dependencies and generate import statements
     */
    resolveCrossChunkDependencies(currentChunkIndex: number): ResolvedImport[];
    /**
     * Get all dependencies for a given type
     */
    getDependencies(typeName: string): string[];
    /**
     * Check if there are circular dependencies
     */
    detectCircularDependencies(): string[] | null;
    /**
     * Get topologically sorted order for types
     * This is useful for generating code in the correct order
     */
    getTopologicalOrder(): string[];
    /**
     * Optimize imports by consolidating and removing duplicates
     */
    private optimizeImports;
    /**
     * Get import path for a chunk index
     */
    private getImportPath;
    /**
     * Extract type name from field type string
     */
    private extractTypeName;
    /**
     * Check if a type is a scalar (built-in) type
     */
    private isScalarType;
    /**
     * Clear the dependency graph
     */
    clear(): void;
    /**
     * Get statistics about the dependency graph
     */
    getStats(): {
        totalNodes: number;
        totalEdges: number;
        totalChunks: number;
        avgDependenciesPerNode: number;
    };
    /**
     * Export the dependency graph for visualization or debugging
     */
    exportGraph(): {
        nodes: Array<{
            name: string;
            type: string;
            chunk: number;
        }>;
        edges: Array<{
            from: string;
            to: string;
        }>;
    };
}
/**
 * Create a new DependencyResolver instance
 */
export declare function createDependencyResolver(): DependencyResolver;
//# sourceMappingURL=DependencyResolver.d.ts.map