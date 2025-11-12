/**
 * Unit tests for DependencyGraph
 *
 * Tests the dependency graph implementation including:
 * - Node addition and retrieval
 * - Adjacency list management
 * - Topological sorting
 * - Circular dependency detection
 * - Dependent invalidation
 */

import { DependencyGraph } from '../../src/utils/dependency-graph';

describe('DependencyGraph', () => {
  let graph: DependencyGraph;

  beforeEach(() => {
    graph = new DependencyGraph();
  });

  describe('constructor', () => {
    it('should create an empty graph', () => {
      expect(graph.size()).toBe(0);
      expect(graph.getAllFiles()).toEqual([]);
    });
  });

  describe('addNode', () => {
    it('should add a node with no imports', () => {
      graph.addNode('/project/a.proto', [], 'hash-a');

      const node = graph.getNode('/project/a.proto');
      expect(node).toBeDefined();
      expect(node?.filePath).toBe('/project/a.proto');
      expect(node?.imports).toEqual([]);
      expect(node?.importedBy).toEqual([]);
      expect(node?.hash).toBe('hash-a');
      expect(node?.timestamp).toBeGreaterThan(0);
    });

    it('should add a node with imports', () => {
      graph.addNode('/project/a.proto', ['/project/b.proto', '/project/c.proto'], 'hash-a');

      const node = graph.getNode('/project/a.proto');
      expect(node).toBeDefined();
      expect(node?.imports).toEqual(['/project/b.proto', '/project/c.proto']);
    });

    it('should create placeholder nodes for imported files', () => {
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');

      const nodeB = graph.getNode('/project/b.proto');
      expect(nodeB).toBeDefined();
      expect(nodeB?.filePath).toBe('/project/b.proto');
      expect(nodeB?.imports).toEqual([]);
      expect(nodeB?.importedBy).toEqual(['/project/a.proto']);
      expect(nodeB?.hash).toBe(''); // Placeholder has empty hash
    });

    it('should update importedBy relationships', () => {
      // Add b.proto first
      graph.addNode('/project/b.proto', [], 'hash-b');

      // Add a.proto that imports b.proto
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');

      const nodeB = graph.getNode('/project/b.proto');
      expect(nodeB?.importedBy).toEqual(['/project/a.proto']);
    });

    it('should handle multiple files importing the same file', () => {
      graph.addNode('/project/common.proto', [], 'hash-common');
      graph.addNode('/project/a.proto', ['/project/common.proto'], 'hash-a');
      graph.addNode('/project/b.proto', ['/project/common.proto'], 'hash-b');

      const nodeCommon = graph.getNode('/project/common.proto');
      expect(nodeCommon?.importedBy).toHaveLength(2);
      expect(nodeCommon?.importedBy).toContain('/project/a.proto');
      expect(nodeCommon?.importedBy).toContain('/project/b.proto');
    });

    it('should update existing node when added again', () => {
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-1');
      const firstTimestamp = graph.getNode('/project/a.proto')?.timestamp!;

      // Wait a bit to ensure timestamp changes
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      return delay(10).then(() => {
        graph.addNode('/project/a.proto', ['/project/c.proto'], 'hash-2');

        const node = graph.getNode('/project/a.proto');
        expect(node?.hash).toBe('hash-2');
        expect(node?.imports).toEqual(['/project/c.proto']);
        expect(node?.timestamp).toBeGreaterThan(firstTimestamp);
      });
    });

    it('should preserve importedBy when updating a node', () => {
      graph.addNode('/project/b.proto', [], 'hash-b');
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');

      // Update b.proto
      graph.addNode('/project/b.proto', [], 'hash-b-updated');

      const nodeB = graph.getNode('/project/b.proto');
      expect(nodeB?.importedBy).toEqual(['/project/a.proto']);
    });

    it('should not add duplicate entries to importedBy', () => {
      graph.addNode('/project/b.proto', [], 'hash-b');
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a-updated');

      const nodeB = graph.getNode('/project/b.proto');
      expect(nodeB?.importedBy).toEqual(['/project/a.proto']);
      expect(nodeB?.importedBy).toHaveLength(1);
    });

    it('should create a copy of imports array', () => {
      const imports = ['/project/b.proto'];
      graph.addNode('/project/a.proto', imports, 'hash-a');

      // Mutate original array
      imports.push('/project/c.proto');

      // Node should still have only the original import
      const node = graph.getNode('/project/a.proto');
      expect(node?.imports).toEqual(['/project/b.proto']);
    });

    it('should throw error for empty file path', () => {
      expect(() => {
        graph.addNode('', [], 'hash');
      }).toThrow('File path cannot be empty');
    });

    it('should handle complex import chains', () => {
      // a -> b -> c -> d
      graph.addNode('/project/d.proto', [], 'hash-d');
      graph.addNode('/project/c.proto', ['/project/d.proto'], 'hash-c');
      graph.addNode('/project/b.proto', ['/project/c.proto'], 'hash-b');
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');

      expect(graph.size()).toBe(4);

      const nodeA = graph.getNode('/project/a.proto');
      const nodeB = graph.getNode('/project/b.proto');
      const nodeC = graph.getNode('/project/c.proto');
      const nodeD = graph.getNode('/project/d.proto');

      expect(nodeA?.imports).toEqual(['/project/b.proto']);
      expect(nodeB?.imports).toEqual(['/project/c.proto']);
      expect(nodeC?.imports).toEqual(['/project/d.proto']);
      expect(nodeD?.imports).toEqual([]);

      expect(nodeD?.importedBy).toEqual(['/project/c.proto']);
      expect(nodeC?.importedBy).toEqual(['/project/b.proto']);
      expect(nodeB?.importedBy).toEqual(['/project/a.proto']);
      expect(nodeA?.importedBy).toEqual([]);
    });
  });

  describe('getNode', () => {
    it('should return undefined for non-existent node', () => {
      const node = graph.getNode('/project/nonexistent.proto');
      expect(node).toBeUndefined();
    });

    it('should return the correct node', () => {
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');
      graph.addNode('/project/c.proto', ['/project/d.proto'], 'hash-c');

      const nodeA = graph.getNode('/project/a.proto');
      const nodeC = graph.getNode('/project/c.proto');

      expect(nodeA?.filePath).toBe('/project/a.proto');
      expect(nodeA?.imports).toEqual(['/project/b.proto']);

      expect(nodeC?.filePath).toBe('/project/c.proto');
      expect(nodeC?.imports).toEqual(['/project/d.proto']);
    });

    it('should return node with all properties', () => {
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-abc123');

      const node = graph.getNode('/project/a.proto');

      expect(node).toHaveProperty('filePath');
      expect(node).toHaveProperty('imports');
      expect(node).toHaveProperty('importedBy');
      expect(node).toHaveProperty('hash');
      expect(node).toHaveProperty('timestamp');
    });
  });

  describe('topologicalSort', () => {
    it('should sort nodes with no dependencies', () => {
      graph.addNode('/project/a.proto', [], 'hash-a');
      graph.addNode('/project/b.proto', [], 'hash-b');
      graph.addNode('/project/c.proto', [], 'hash-c');

      const sorted = graph.topologicalSort();

      expect(sorted).toHaveLength(3);
      expect(sorted).toContain('/project/a.proto');
      expect(sorted).toContain('/project/b.proto');
      expect(sorted).toContain('/project/c.proto');
    });

    it('should sort linear dependency chain', () => {
      // a -> b -> c
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');
      graph.addNode('/project/b.proto', ['/project/c.proto'], 'hash-b');
      graph.addNode('/project/c.proto', [], 'hash-c');

      const sorted = graph.topologicalSort();

      expect(sorted).toEqual(['/project/c.proto', '/project/b.proto', '/project/a.proto']);
    });

    it('should sort diamond dependency pattern', () => {
      // a -> b, c
      // b -> d
      // c -> d
      graph.addNode('/project/a.proto', ['/project/b.proto', '/project/c.proto'], 'hash-a');
      graph.addNode('/project/b.proto', ['/project/d.proto'], 'hash-b');
      graph.addNode('/project/c.proto', ['/project/d.proto'], 'hash-c');
      graph.addNode('/project/d.proto', [], 'hash-d');

      const sorted = graph.topologicalSort();

      expect(sorted).toHaveLength(4);
      // d should come first
      expect(sorted[0]).toBe('/project/d.proto');
      // a should come last
      expect(sorted[3]).toBe('/project/a.proto');
      // b and c should be in the middle (order doesn't matter)
      expect(sorted.slice(1, 3)).toContain('/project/b.proto');
      expect(sorted.slice(1, 3)).toContain('/project/c.proto');
    });

    it('should throw error on circular dependency', () => {
      // a -> b -> c -> a (cycle)
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');
      graph.addNode('/project/b.proto', ['/project/c.proto'], 'hash-b');
      graph.addNode('/project/c.proto', ['/project/a.proto'], 'hash-c');

      expect(() => {
        graph.topologicalSort();
      }).toThrow(/Cycle detected/);
    });

    it('should handle empty graph', () => {
      const sorted = graph.topologicalSort();
      expect(sorted).toEqual([]);
    });
  });

  describe('detectCycles', () => {
    it('should return null for acyclic graph', () => {
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');
      graph.addNode('/project/b.proto', ['/project/c.proto'], 'hash-b');
      graph.addNode('/project/c.proto', [], 'hash-c');

      const cycle = graph.detectCycles();
      expect(cycle).toBeNull();
    });

    it('should detect simple cycle (A -> B -> A)', () => {
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');
      graph.addNode('/project/b.proto', ['/project/a.proto'], 'hash-b');

      const cycle = graph.detectCycles();
      expect(cycle).not.toBeNull();
      expect(cycle?.cycle).toContain('/project/a.proto');
      expect(cycle?.cycle).toContain('/project/b.proto');
      expect(cycle?.cycle[0]).toBe(cycle?.cycle[cycle.cycle.length - 1]); // First and last should be same
      expect(cycle?.message).toContain('Circular import detected');
    });

    it('should detect cycle in longer chain (A -> B -> C -> A)', () => {
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');
      graph.addNode('/project/b.proto', ['/project/c.proto'], 'hash-b');
      graph.addNode('/project/c.proto', ['/project/a.proto'], 'hash-c');

      const cycle = graph.detectCycles();
      expect(cycle).not.toBeNull();
      expect(cycle?.cycle).toHaveLength(4); // A -> B -> C -> A
      expect(cycle?.cycle[0]).toBe(cycle?.cycle[3]);
    });

    it('should detect self-loop (A -> A)', () => {
      graph.addNode('/project/a.proto', ['/project/a.proto'], 'hash-a');

      const cycle = graph.detectCycles();
      expect(cycle).not.toBeNull();
      expect(cycle?.cycle).toEqual(['/project/a.proto', '/project/a.proto']);
    });

    it('should detect cycle in complex graph', () => {
      // a -> b
      // b -> c, d
      // c -> e
      // d -> e
      // e -> b (creates cycle: b -> c -> e -> b)
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');
      graph.addNode('/project/b.proto', ['/project/c.proto', '/project/d.proto'], 'hash-b');
      graph.addNode('/project/c.proto', ['/project/e.proto'], 'hash-c');
      graph.addNode('/project/d.proto', ['/project/e.proto'], 'hash-d');
      graph.addNode('/project/e.proto', ['/project/b.proto'], 'hash-e');

      const cycle = graph.detectCycles();
      expect(cycle).not.toBeNull();
      expect(cycle?.cycle).toContain('/project/b.proto');
      expect(cycle?.cycle).toContain('/project/e.proto');
    });

    it('should return null for empty graph', () => {
      const cycle = graph.detectCycles();
      expect(cycle).toBeNull();
    });

    it('should handle disconnected components without cycles', () => {
      // Component 1: a -> b
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');
      graph.addNode('/project/b.proto', [], 'hash-b');

      // Component 2: c -> d
      graph.addNode('/project/c.proto', ['/project/d.proto'], 'hash-c');
      graph.addNode('/project/d.proto', [], 'hash-d');

      const cycle = graph.detectCycles();
      expect(cycle).toBeNull();
    });
  });

  describe('getDependents', () => {
    it('should return empty array for file with no dependents', () => {
      graph.addNode('/project/a.proto', [], 'hash-a');

      const dependents = graph.getDependents('/project/a.proto');
      expect(dependents).toEqual([]);
    });

    it('should return files that import the specified file', () => {
      graph.addNode('/project/a.proto', ['/project/common.proto'], 'hash-a');
      graph.addNode('/project/b.proto', ['/project/common.proto'], 'hash-b');
      graph.addNode('/project/common.proto', [], 'hash-common');

      const dependents = graph.getDependents('/project/common.proto');
      expect(dependents).toHaveLength(2);
      expect(dependents).toContain('/project/a.proto');
      expect(dependents).toContain('/project/b.proto');
    });

    it('should return empty array for non-existent file', () => {
      const dependents = graph.getDependents('/project/nonexistent.proto');
      expect(dependents).toEqual([]);
    });

    it('should return copy of importedBy array', () => {
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');
      graph.addNode('/project/b.proto', [], 'hash-b');

      const dependents = graph.getDependents('/project/b.proto');
      dependents.push('/project/c.proto'); // Mutate the returned array

      // Original should be unchanged
      const dependents2 = graph.getDependents('/project/b.proto');
      expect(dependents2).toEqual(['/project/a.proto']);
    });
  });

  describe('invalidateDependents', () => {
    it('should return only the file itself if no dependents', () => {
      graph.addNode('/project/a.proto', [], 'hash-a');

      const toInvalidate = graph.invalidateDependents('/project/a.proto');
      expect(toInvalidate).toEqual(['/project/a.proto']);
    });

    it('should return file and direct dependents', () => {
      graph.addNode('/project/common.proto', [], 'hash-common');
      graph.addNode('/project/a.proto', ['/project/common.proto'], 'hash-a');
      graph.addNode('/project/b.proto', ['/project/common.proto'], 'hash-b');

      const toInvalidate = graph.invalidateDependents('/project/common.proto');
      expect(toInvalidate).toHaveLength(3);
      expect(toInvalidate).toContain('/project/common.proto');
      expect(toInvalidate).toContain('/project/a.proto');
      expect(toInvalidate).toContain('/project/b.proto');
    });

    it('should return file and transitive dependents', () => {
      // d -> c -> b -> a
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');
      graph.addNode('/project/b.proto', ['/project/c.proto'], 'hash-b');
      graph.addNode('/project/c.proto', ['/project/d.proto'], 'hash-c');
      graph.addNode('/project/d.proto', [], 'hash-d');

      const toInvalidate = graph.invalidateDependents('/project/d.proto');
      expect(toInvalidate).toHaveLength(4);
      expect(toInvalidate).toContain('/project/d.proto');
      expect(toInvalidate).toContain('/project/c.proto');
      expect(toInvalidate).toContain('/project/b.proto');
      expect(toInvalidate).toContain('/project/a.proto');
    });

    it('should handle diamond dependency pattern', () => {
      // a -> b, c -> d
      graph.addNode('/project/a.proto', ['/project/b.proto', '/project/c.proto'], 'hash-a');
      graph.addNode('/project/b.proto', ['/project/d.proto'], 'hash-b');
      graph.addNode('/project/c.proto', ['/project/d.proto'], 'hash-c');
      graph.addNode('/project/d.proto', [], 'hash-d');

      const toInvalidate = graph.invalidateDependents('/project/d.proto');
      expect(toInvalidate).toHaveLength(4);
      expect(toInvalidate).toContain('/project/d.proto');
      expect(toInvalidate).toContain('/project/c.proto');
      expect(toInvalidate).toContain('/project/b.proto');
      expect(toInvalidate).toContain('/project/a.proto');
    });

    it('should return only the file for non-existent file', () => {
      const toInvalidate = graph.invalidateDependents('/project/nonexistent.proto');
      expect(toInvalidate).toEqual(['/project/nonexistent.proto']);
    });
  });

  describe('clear', () => {
    it('should remove all nodes', () => {
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');
      graph.addNode('/project/b.proto', [], 'hash-b');

      expect(graph.size()).toBe(2);

      graph.clear();

      expect(graph.size()).toBe(0);
      expect(graph.getNode('/project/a.proto')).toBeUndefined();
      expect(graph.getNode('/project/b.proto')).toBeUndefined();
    });

    it('should clear empty graph without errors', () => {
      expect(() => {
        graph.clear();
      }).not.toThrow();
      expect(graph.size()).toBe(0);
    });
  });

  describe('size', () => {
    it('should return 0 for empty graph', () => {
      expect(graph.size()).toBe(0);
    });

    it('should return correct count after adding nodes', () => {
      graph.addNode('/project/a.proto', [], 'hash-a');
      expect(graph.size()).toBe(1);

      graph.addNode('/project/b.proto', [], 'hash-b');
      expect(graph.size()).toBe(2);

      graph.addNode('/project/c.proto', [], 'hash-c');
      expect(graph.size()).toBe(3);
    });

    it('should include placeholder nodes in count', () => {
      graph.addNode('/project/a.proto', ['/project/b.proto', '/project/c.proto'], 'hash-a');
      // a.proto + placeholder for b.proto + placeholder for c.proto = 3
      expect(graph.size()).toBe(3);
    });

    it('should not increase when updating existing node', () => {
      graph.addNode('/project/a.proto', [], 'hash-a');
      expect(graph.size()).toBe(1);

      graph.addNode('/project/a.proto', [], 'hash-a-updated');
      expect(graph.size()).toBe(1);
    });
  });

  describe('getAllFiles', () => {
    it('should return empty array for empty graph', () => {
      expect(graph.getAllFiles()).toEqual([]);
    });

    it('should return all file paths', () => {
      graph.addNode('/project/a.proto', [], 'hash-a');
      graph.addNode('/project/b.proto', [], 'hash-b');
      graph.addNode('/project/c.proto', [], 'hash-c');

      const files = graph.getAllFiles();
      expect(files).toHaveLength(3);
      expect(files).toContain('/project/a.proto');
      expect(files).toContain('/project/b.proto');
      expect(files).toContain('/project/c.proto');
    });

    it('should include placeholder nodes', () => {
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');

      const files = graph.getAllFiles();
      expect(files).toHaveLength(2);
      expect(files).toContain('/project/a.proto');
      expect(files).toContain('/project/b.proto');
    });
  });
});
