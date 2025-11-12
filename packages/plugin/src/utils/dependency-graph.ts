/**
 * Dependency Graph for Proto File Import Management
 *
 * This module provides a dependency graph implementation for tracking proto file
 * imports and their relationships. It supports topological sorting, circular
 * dependency detection, and cache invalidation of dependent files.
 *
 * @packageDocumentation
 */

import type { DependencyNode, CircularDependencyError } from '../types';

/**
 * Dependency graph for managing proto file imports and relationships.
 *
 * Tracks dependencies between proto files to enable:
 * - Topological sorting for correct generation order
 * - Circular dependency detection
 * - Cache invalidation propagation
 * - Dependency relationship queries
 *
 * @example
 * ```typescript
 * const graph = new DependencyGraph();
 *
 * // Add nodes
 * graph.addNode('/project/a.proto', ['b.proto'], 'hash1');
 * graph.addNode('/project/b.proto', [], 'hash2');
 *
 * // Query dependencies
 * const node = graph.getNode('/project/a.proto');
 * console.log(node?.imports); // ['b.proto']
 *
 * // Check for cycles
 * const cycle = graph.detectCycles();
 * if (cycle) {
 *   console.error('Circular dependency:', cycle.message);
 * }
 * ```
 */
export class DependencyGraph {
  /**
   * Map of file paths to their dependency nodes.
   * Stores all metadata about each proto file and its relationships.
   */
  private nodes: Map<string, DependencyNode>;

  /**
   * Adjacency list representation of the dependency graph.
   * Maps each file to the set of files it imports.
   * Used for efficient graph traversal and topological sorting.
   */
  private adjacencyList: Map<string, Set<string>>;

  /**
   * Creates a new DependencyGraph instance.
   * Initializes empty data structures for nodes and adjacency list.
   */
  constructor() {
    this.nodes = new Map();
    this.adjacencyList = new Map();
  }

  /**
   * Adds a node to the dependency graph or updates an existing node.
   *
   * Registers a proto file and its import relationships in the graph.
   * Updates both the node metadata and the adjacency list representation.
   * Also updates the reverse relationships (importedBy) for all imported files.
   *
   * @param filePath - Absolute path to the proto file
   * @param imports - Array of proto file paths this file imports
   * @param hash - Content hash for change detection
   * @throws {Error} If filePath is empty or undefined
   *
   * @example
   * ```typescript
   * graph.addNode(
   *   '/project/service.proto',
   *   ['common/types.proto', 'google/protobuf/timestamp.proto'],
   *   'sha256-abc123'
   * );
   * ```
   */
  addNode(filePath: string, imports: string[], hash: string): void {
    if (!filePath) {
      throw new Error('File path cannot be empty');
    }

    // Create or update the dependency node
    const existingNode = this.nodes.get(filePath);
    const node: DependencyNode = {
      filePath,
      imports: [...imports], // Create a copy to avoid external mutations
      importedBy: existingNode?.importedBy || [],
      hash,
      timestamp: Date.now(),
    };

    this.nodes.set(filePath, node);

    // Update adjacency list for this node
    this.adjacencyList.set(filePath, new Set(imports));

    // Update reverse relationships (importedBy) for all imported files
    for (const importedFile of imports) {
      const importedNode = this.nodes.get(importedFile);
      if (importedNode) {
        // Add this file to the importedBy list if not already present
        if (!importedNode.importedBy.includes(filePath)) {
          importedNode.importedBy.push(filePath);
        }
      } else {
        // Create a placeholder node for the imported file
        // It will be fully populated when that file is processed
        this.nodes.set(importedFile, {
          filePath: importedFile,
          imports: [],
          importedBy: [filePath],
          hash: '',
          timestamp: Date.now(),
        });
        this.adjacencyList.set(importedFile, new Set());
      }
    }
  }

  /**
   * Retrieves a dependency node from the graph.
   *
   * Returns the complete metadata and relationship information for a proto file.
   *
   * @param filePath - Absolute path to the proto file
   * @returns The dependency node if found, undefined otherwise
   *
   * @example
   * ```typescript
   * const node = graph.getNode('/project/service.proto');
   * if (node) {
   *   console.log('Imports:', node.imports);
   *   console.log('Imported by:', node.importedBy);
   *   console.log('Hash:', node.hash);
   * }
   * ```
   */
  getNode(filePath: string): DependencyNode | undefined {
    return this.nodes.get(filePath);
  }

  /**
   * Performs topological sort on the dependency graph.
   *
   * Uses Kahn's algorithm to order proto files such that dependencies appear
   * before dependents. This ensures proto files are generated in the correct order.
   *
   * @returns Array of file paths in topological order
   * @throws {Error} If a circular dependency is detected
   *
   * @example
   * ```typescript
   * // Given: a.proto imports b.proto, b.proto imports c.proto
   * const order = graph.topologicalSort();
   * console.log(order); // ['c.proto', 'b.proto', 'a.proto']
   * ```
   */
  topologicalSort(): string[] {
    const inDegree = new Map<string, number>();
    const result: string[] = [];
    const queue: string[] = [];

    // Initialize in-degree for all nodes
    // In-degree = number of dependencies (imports)
    for (const [node, dependencies] of this.adjacencyList) {
      inDegree.set(node, dependencies.size);
    }

    // Find all nodes with in-degree 0 (no dependencies)
    for (const [node, degree] of inDegree) {
      if (degree === 0) {
        queue.push(node);
      }
    }

    // Process nodes in topological order
    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);

      // For all nodes that depend on this node (importedBy),
      // reduce their in-degree
      const dependents = this.getDependents(node);
      for (const dependent of dependents) {
        const newDegree = inDegree.get(dependent)! - 1;
        inDegree.set(dependent, newDegree);
        if (newDegree === 0) {
          queue.push(dependent);
        }
      }
    }

    // Check if all nodes were processed (no cycles)
    if (result.length !== this.nodes.size) {
      throw new Error(
        `Cycle detected in dependency graph. Processed ${result.length} of ${this.nodes.size} nodes.`
      );
    }

    return result;
  }

  /**
   * Detects circular dependencies in the graph.
   *
   * Uses depth-first search to identify cycles in the import relationships.
   * Returns detailed information about the cycle if found.
   *
   * @returns CircularDependencyError with cycle path if found, null otherwise
   *
   * @example
   * ```typescript
   * const cycle = graph.detectCycles();
   * if (cycle) {
   *   console.error('Circular dependency detected!');
   *   console.error('Cycle path:', cycle.cycle.join(' → '));
   *   console.error('Message:', cycle.message);
   * }
   * ```
   */
  detectCycles(): CircularDependencyError | null {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const dfs = (node: string): string[] | null => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = this.adjacencyList.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          const cycle = dfs(neighbor);
          if (cycle) {
            return cycle;
          }
        } else if (recursionStack.has(neighbor)) {
          // Cycle detected - extract the cycle path
          const cycleStartIndex = path.indexOf(neighbor);
          const cyclePath = path.slice(cycleStartIndex);
          cyclePath.push(neighbor); // Add the node again to show the loop
          return cyclePath;
        }
      }

      recursionStack.delete(node);
      path.pop();
      return null;
    };

    // Check all nodes for cycles (handles disconnected components)
    for (const [node] of this.adjacencyList) {
      if (!visited.has(node)) {
        const cycle = dfs(node);
        if (cycle) {
          const message = `Circular import detected: ${cycle.join(' → ')}`;
          return {
            cycle,
            message,
          };
        }
      }
    }

    return null;
  }

  /**
   * Gets all files that depend on (import) the specified file.
   *
   * Returns the list of files that directly import the given file.
   * Useful for cache invalidation when a file changes.
   *
   * @param filePath - Absolute path to the proto file
   * @returns Array of file paths that import this file
   *
   * @example
   * ```typescript
   * const dependents = graph.getDependents('/project/common/types.proto');
   * console.log('Files that import types.proto:', dependents);
   * // ['service.proto', 'api.proto']
   * ```
   */
  getDependents(filePath: string): string[] {
    const node = this.nodes.get(filePath);
    return node ? [...node.importedBy] : [];
  }

  /**
   * Invalidates cache for a file and all its dependents recursively.
   *
   * When a proto file changes, all files that import it (directly or indirectly)
   * must be regenerated. This method identifies all such files.
   *
   * @param filePath - Absolute path to the changed proto file
   * @returns Array of all files that need to be invalidated (including the file itself)
   *
   * @example
   * ```typescript
   * // types.proto changed, invalidate everything that depends on it
   * const toInvalidate = graph.invalidateDependents('/project/types.proto');
   * console.log('Files to regenerate:', toInvalidate);
   * // ['/project/types.proto', '/project/service.proto', '/project/api.proto']
   * ```
   */
  invalidateDependents(filePath: string): string[] {
    const toInvalidate = new Set<string>();
    const queue = [filePath];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (toInvalidate.has(current)) {
        continue;
      }

      toInvalidate.add(current);
      const dependents = this.getDependents(current);
      queue.push(...dependents);
    }

    return Array.from(toInvalidate);
  }

  /**
   * Clears all nodes and relationships from the graph.
   *
   * Resets the graph to an empty state. Useful for cleanup or
   * when starting fresh with a new build.
   *
   * @example
   * ```typescript
   * graph.clear();
   * console.log(graph.getNode('/project/service.proto')); // undefined
   * ```
   */
  clear(): void {
    this.nodes.clear();
    this.adjacencyList.clear();
  }

  /**
   * Gets the total number of nodes in the graph.
   *
   * @returns Number of proto files tracked in the graph
   *
   * @example
   * ```typescript
   * console.log(`Tracking ${graph.size()} proto files`);
   * ```
   */
  size(): number {
    return this.nodes.size;
  }

  /**
   * Gets all file paths in the graph.
   *
   * @returns Array of all proto file paths tracked in the graph
   *
   * @example
   * ```typescript
   * const allFiles = graph.getAllFiles();
   * console.log('All proto files:', allFiles);
   * ```
   */
  getAllFiles(): string[] {
    return Array.from(this.nodes.keys());
  }
}
