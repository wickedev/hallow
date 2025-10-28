/**
 * DependencyResolver - Resolves dependencies across chunked generation
 *
 * This class builds dependency graphs for proto elements (messages, enums)
 * and resolves import statements after all chunks are processed.
 */

import { MessageDefinition, EnumDefinition, FieldDefinition } from '../core/proto-types';

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
export class DependencyResolver {
  private graph: DependencyGraph;
  private typeToChunk: Map<string, number>;
  private chunkToTypes: Map<number, Set<string>>;

  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
    };
    this.typeToChunk = new Map();
    this.chunkToTypes = new Map();
  }

  /**
   * Add a message to the dependency graph
   */
  addMessage(message: MessageDefinition, chunkIndex: number): void {
    const node: DependencyNode = {
      name: message.name,
      type: 'message',
      dependencies: new Set(),
      chunkIndex,
    };

    // Extract dependencies from fields
    message.fields.forEach(field => {
      const fieldType = this.extractTypeName(field.type);
      if (fieldType && !this.isScalarType(fieldType)) {
        node.dependencies.add(fieldType);
      }
    });

    // Add nested messages recursively
    message.nestedMessages?.forEach(nested => {
      const nestedName = `${message.name}.${nested.name}`;
      this.addMessage({ ...nested, name: nestedName }, chunkIndex);
    });

    // Add nested enums
    message.nestedEnums?.forEach(nested => {
      const nestedName = `${message.name}.${nested.name}`;
      this.addEnum({ ...nested, name: nestedName }, chunkIndex);
    });

    this.graph.nodes.set(message.name, node);
    this.typeToChunk.set(message.name, chunkIndex);

    if (!this.chunkToTypes.has(chunkIndex)) {
      this.chunkToTypes.set(chunkIndex, new Set());
    }
    this.chunkToTypes.get(chunkIndex)!.add(message.name);

    // Update edges
    node.dependencies.forEach(dep => {
      if (!this.graph.edges.has(message.name)) {
        this.graph.edges.set(message.name, new Set());
      }
      this.graph.edges.get(message.name)!.add(dep);
    });
  }

  /**
   * Add an enum to the dependency graph
   */
  addEnum(enumDef: EnumDefinition, chunkIndex: number): void {
    const node: DependencyNode = {
      name: enumDef.name,
      type: 'enum',
      dependencies: new Set(), // Enums don't have dependencies typically
      chunkIndex,
    };

    this.graph.nodes.set(enumDef.name, node);
    this.typeToChunk.set(enumDef.name, chunkIndex);

    if (!this.chunkToTypes.has(chunkIndex)) {
      this.chunkToTypes.set(chunkIndex, new Set());
    }
    this.chunkToTypes.get(chunkIndex)!.add(enumDef.name);
  }

  /**
   * Resolve cross-chunk dependencies and generate import statements
   */
  resolveCrossChunkDependencies(currentChunkIndex: number): ResolvedImport[] {
    const imports: ResolvedImport[] = [];
    const currentTypes = this.chunkToTypes.get(currentChunkIndex) || new Set();

    // For each type in the current chunk
    currentTypes.forEach(typeName => {
      const node = this.graph.nodes.get(typeName);
      if (!node) return;

      // Check each dependency
      node.dependencies.forEach(depName => {
        const depChunkIndex = this.typeToChunk.get(depName);

        // If dependency is in a different chunk, we need an import
        if (depChunkIndex !== undefined && depChunkIndex !== currentChunkIndex) {
          const existingImport = imports.find(imp =>
            imp.source === this.getImportPath(depChunkIndex)
          );

          if (existingImport) {
            existingImport.types.push(depName);
          } else {
            imports.push({
              source: this.getImportPath(depChunkIndex),
              types: [depName],
              isTypeOnly: false,
            });
          }
        }
      });
    });

    return this.optimizeImports(imports);
  }

  /**
   * Get all dependencies for a given type
   */
  getDependencies(typeName: string): string[] {
    const node = this.graph.nodes.get(typeName);
    if (!node) return [];

    return Array.from(node.dependencies);
  }

  /**
   * Check if there are circular dependencies
   */
  detectCircularDependencies(): string[] | null {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[] = [];

    const dfs = (nodeName: string, path: string[]): boolean => {
      if (recursionStack.has(nodeName)) {
        cycles.push([...path, nodeName].join(' -> '));
        return true;
      }

      if (visited.has(nodeName)) {
        return false;
      }

      visited.add(nodeName);
      recursionStack.add(nodeName);

      const node = this.graph.nodes.get(nodeName);
      if (node) {
        for (const dep of node.dependencies) {
          if (dfs(dep, [...path, nodeName])) {
            return true;
          }
        }
      }

      recursionStack.delete(nodeName);
      return false;
    };

    for (const nodeName of this.graph.nodes.keys()) {
      if (!visited.has(nodeName)) {
        dfs(nodeName, []);
      }
    }

    return cycles.length > 0 ? cycles : null;
  }

  /**
   * Get topologically sorted order for types
   * This is useful for generating code in the correct order
   */
  getTopologicalOrder(): string[] {
    const visited = new Set<string>();
    const result: string[] = [];

    const dfs = (nodeName: string): void => {
      if (visited.has(nodeName)) return;

      visited.add(nodeName);

      const node = this.graph.nodes.get(nodeName);
      if (node) {
        node.dependencies.forEach(dep => {
          if (this.graph.nodes.has(dep)) {
            dfs(dep);
          }
        });
      }

      result.push(nodeName);
    };

    // Visit all nodes
    for (const nodeName of this.graph.nodes.keys()) {
      if (!visited.has(nodeName)) {
        dfs(nodeName);
      }
    }

    return result;
  }

  /**
   * Optimize imports by consolidating and removing duplicates
   */
  private optimizeImports(imports: ResolvedImport[]): ResolvedImport[] {
    const optimized = new Map<string, ResolvedImport>();

    imports.forEach(imp => {
      if (optimized.has(imp.source)) {
        const existing = optimized.get(imp.source)!;
        existing.types = [...new Set([...existing.types, ...imp.types])];
      } else {
        optimized.set(imp.source, {
          ...imp,
          types: [...new Set(imp.types)],
        });
      }
    });

    // Sort types alphabetically within each import
    optimized.forEach(imp => {
      imp.types.sort();
    });

    return Array.from(optimized.values());
  }

  /**
   * Get import path for a chunk index
   */
  private getImportPath(chunkIndex: number): string {
    // This would be customized based on your file structure
    // For now, using a simple pattern
    return `./chunk_${chunkIndex}`;
  }

  /**
   * Extract type name from field type string
   */
  private extractTypeName(fieldType: string): string | null {
    // Handle repeated types
    if (fieldType.startsWith('repeated ')) {
      fieldType = fieldType.substring(9).trim();
    }

    // Handle map types
    if (fieldType.startsWith('map<')) {
      // Extract value type from map<key, value>
      const match = fieldType.match(/map<[^,]+,\s*([^>]+)>/);
      if (match) {
        fieldType = match[1].trim();
      }
    }

    // Remove package prefixes if any
    const parts = fieldType.split('.');
    return parts[parts.length - 1] || null;
  }

  /**
   * Check if a type is a scalar (built-in) type
   */
  private isScalarType(typeName: string): boolean {
    const scalarTypes = [
      'double', 'float', 'int32', 'int64', 'uint32', 'uint64',
      'sint32', 'sint64', 'fixed32', 'fixed64', 'sfixed32', 'sfixed64',
      'bool', 'string', 'bytes'
    ];

    return scalarTypes.includes(typeName.toLowerCase());
  }

  /**
   * Clear the dependency graph
   */
  clear(): void {
    this.graph.nodes.clear();
    this.graph.edges.clear();
    this.typeToChunk.clear();
    this.chunkToTypes.clear();
  }

  /**
   * Get statistics about the dependency graph
   */
  getStats(): {
    totalNodes: number;
    totalEdges: number;
    totalChunks: number;
    avgDependenciesPerNode: number;
  } {
    const totalEdges = Array.from(this.graph.edges.values())
      .reduce((sum, deps) => sum + deps.size, 0);

    return {
      totalNodes: this.graph.nodes.size,
      totalEdges,
      totalChunks: this.chunkToTypes.size,
      avgDependenciesPerNode: this.graph.nodes.size > 0
        ? totalEdges / this.graph.nodes.size
        : 0,
    };
  }

  /**
   * Export the dependency graph for visualization or debugging
   */
  exportGraph(): {
    nodes: Array<{ name: string; type: string; chunk: number }>;
    edges: Array<{ from: string; to: string }>;
  } {
    const nodes = Array.from(this.graph.nodes.values()).map(node => ({
      name: node.name,
      type: node.type,
      chunk: node.chunkIndex || -1,
    }));

    const edges: Array<{ from: string; to: string }> = [];
    this.graph.edges.forEach((deps, from) => {
      deps.forEach(to => {
        edges.push({ from, to });
      });
    });

    return { nodes, edges };
  }
}

/**
 * Create a new DependencyResolver instance
 */
export function createDependencyResolver(): DependencyResolver {
  return new DependencyResolver();
}
