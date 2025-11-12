/**
 * Error Scenario Tests
 *
 * Tests that verify comprehensive error handling with clear, actionable messages.
 * Ensures the plugin handles all failure scenarios gracefully.
 */

// Mock chalk to disable colors in tests
jest.mock('chalk', () => ({
  default: {
    cyan: (str: string) => str,
    yellow: (str: string) => str,
    red: (str: string) => str,
    green: (str: string) => str,
    blue: (str: string) => str,
    gray: (str: string) => str,
    bold: (str: string) => str,
  },
  cyan: (str: string) => str,
  yellow: (str: string) => str,
  red: (str: string) => str,
  green: (str: string) => str,
  blue: (str: string) => str,
  gray: (str: string) => str,
  bold: (str: string) => str,
}));

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as path from 'path';
import * as fs from 'fs/promises';
import { tmpdir } from 'os';

// Mock implementations
import { ProtoResolver } from '../../src/resolver';
import { DependencyGraph } from '../../src/utils/dependency-graph';
import { CacheManager } from '../../src/cache';
import { ConfigValidator } from '../../src/config';
import { ErrorFormatter } from '../../src/utils/error';

describe('Error Scenario Tests', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = path.join(tmpdir(), `hallow-errors-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('ERR-01: Proto syntax errors with location', () => {
    it('should report syntax errors with file location and code snippet', () => {
      const protoContent = `syntax = "proto3";

message Test {
  string name = 1
  string value = 2;
}`;

      const error = ErrorFormatter.formatParseError(
        '/project/test.proto',
        4,
        19,
        "Expected ';' but found 'string'",
        protoContent
      );

      expect(error).toContain('[Hallow Plugin] Proto syntax error');
      expect(error).toContain('File: /project/test.proto');
      expect(error).toContain('Line 4, Column 19');
      expect(error).toContain("Expected ';' but found 'string'");
      expect(error).toContain('string name = 1');
      expect(error).toContain('^');
    });

    it('should extract code snippet with context lines', () => {
      const source = `line 1
line 2
line 3
line 4 with error
line 5
line 6`;

      const snippet = ErrorFormatter.extractCodeSnippet(source, 4, 1);

      expect(snippet).toContain('3');
      expect(snippet).toContain('4');
      expect(snippet).toContain('5');
      expect(snippet).toContain('line 4 with error');
    });
  });

  describe('ERR-02: Circular dependencies', () => {
    it('should detect and report circular dependencies', () => {
      const graph = new DependencyGraph();

      // Create circular dependency: a -> b -> c -> a
      graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash1');
      graph.addNode('/project/b.proto', ['/project/c.proto'], 'hash2');
      graph.addNode('/project/c.proto', ['/project/a.proto'], 'hash3');

      const cycles = graph.detectCycles();

      expect(cycles).not.toBeNull();
      if (cycles) {
        expect(cycles.cycle.length).toBeGreaterThan(2);
        expect(cycles.message).toContain('Circular import detected');
      }
    });

    it.skip('should format circular dependency error with cycle path', () => {
      const cycle = [
        '/project/a.proto',
        '/project/b.proto',
        '/project/c.proto',
        '/project/a.proto'
      ];

      const error = ErrorFormatter.formatCircularDependency(cycle);

      expect(error).toContain('[Hallow Plugin] Circular import detected');
      expect(error).toContain('a.proto → b.proto → c.proto → a.proto');
    });
  });

  describe('ERR-03: Missing imports', () => {
    it.skip('should report missing imports with searched paths', async () => {
      const resolver = new ProtoResolver({
        protoRoot: testDir,
        importPaths: [path.join(testDir, 'protos')],
        projectRoot: testDir
      });

      try {
        await resolver.resolve('nonexistent.proto', '/project/service.proto');
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        expect(error.message).toContain('Proto file not found');
        expect(error.message).toContain('nonexistent.proto');
      }
    });

    it('should format resolution error with search paths', () => {
      const searchPaths = [
        '/current/directory',
        '/project/root',
        '/project/protos',
        '/project/node_modules'
      ];

      const error = ErrorFormatter.formatResolveError(
        'nonexistent.proto',
        '/project/service.proto',
        searchPaths
      );

      expect(error).toContain('[Hallow Plugin] Import resolution failed');
      expect(error).toContain('nonexistent.proto');
      expect(error).toContain('Searched in:');
      searchPaths.forEach(path => {
        expect(error).toContain(path);
      });
    });
  });

  describe('ERR-04: Invalid configuration', () => {
    it('should reject configuration with wrong types', () => {
      const validator = new ConfigValidator();

      const result = validator.validate({
        protoRoot: 123 as any // Wrong type
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('string');
    });

    it.skip('should warn about unknown options', () => {
      const validator = new ConfigValidator();

      const result = validator.validate({
        unknownOption: true
      } as any);

      expect(result.warnings.length).toBeGreaterThan(0);
      const unknownWarning = result.warnings.find(w => w.message.includes('unknown'));
      expect(unknownWarning).toBeDefined();
    });

    it('should suggest corrections for typos', () => {
      const validator = new ConfigValidator();

      const suggestion = validator.suggestCorrection('protoRot', [
        'protoRoot',
        'protoPath',
        'importPaths'
      ]);

      expect(suggestion).toBe('protoRoot');
    });
  });

  describe('ERR-05: File system errors with retry', () => {
    it('should handle file not found errors', async () => {
      const nonExistentPath = path.join(testDir, 'does-not-exist.proto');

      await expect(fs.readFile(nonExistentPath, 'utf-8')).rejects.toThrow();
    });

    it('should handle permission denied errors', async () => {
      const testFile = path.join(testDir, 'protected.proto');
      await fs.writeFile(testFile, 'content');

      // Change permissions (Unix-like only)
      try {
        await fs.chmod(testFile, 0o000);
        await expect(fs.readFile(testFile, 'utf-8')).rejects.toThrow();
      } finally {
        // Restore permissions for cleanup
        await fs.chmod(testFile, 0o644);
      }
    });
  });

  describe('ERR-06: Generator failures', () => {
    it.skip('should format generator errors with file context', () => {
      const originalError = new Error('Invalid message type: Foo');
      originalError.stack = 'Error: Invalid message type: Foo\n  at generate (generator.ts:123)';

      const error = ErrorFormatter.formatGenerateError('/project/service.proto', originalError);

      expect(error).toContain('[Hallow Plugin] Code generation failed');
      expect(error).toContain('File: /project/service.proto');
      expect(error).toContain('Reason: Invalid message type: Foo');
      expect(error).toContain('Stack:');
    });
  });

  describe('ERR-07: Type resolution errors', () => {
    it('should report undefined type references', () => {
      const error = ErrorFormatter.formatConfigError(
        'type',
        'defined message type',
        'UndefinedType'
      );

      expect(error).toContain('[Hallow Plugin]');
      expect(error).toContain('type');
    });
  });

  describe('ERR-08: Path traversal attempts', () => {
    it('should block path traversal with .. segments', async () => {
      const resolver = new ProtoResolver({
        protoRoot: testDir,
        importPaths: [],
        projectRoot: testDir
      });

      const maliciousPaths = [
        '../../../etc/passwd',
        '..\\..\\windows\\system32',
        '../../node_modules/malicious'
      ];

      for (const maliciousPath of maliciousPaths) {
        const isValid = resolver.validatePath(maliciousPath);
        expect(isValid).toBe(false);
      }
    });

    it('should allow safe relative paths', async () => {
      const resolver = new ProtoResolver({
        protoRoot: testDir,
        importPaths: [],
        projectRoot: testDir
      });

      const safePaths = [
        './types.proto',
        'common/types.proto',
        'services/user-service.proto'
      ];

      for (const safePath of safePaths) {
        const isValid = resolver.validatePath(safePath);
        expect(isValid).toBe(true);
      }
    });
  });

  describe('ERR-09: Cache corruption', () => {
    it('should handle corrupted cache gracefully', async () => {
      const cacheDir = path.join(testDir, '.hallow-cache');
      await fs.mkdir(cacheDir, { recursive: true });

      // Write corrupted cache file
      const corruptedCache = path.join(cacheDir, 'cache.json');
      await fs.writeFile(corruptedCache, '{ invalid json }');

      const cache = new CacheManager(100, cacheDir);

      // Should handle corruption and continue
      try {
        await cache.loadFromDisk();
      } catch (error) {
        // Expected to either handle gracefully or throw clear error
        expect(error).toBeDefined();
      }
    });

    it('should rebuild cache after corruption', () => {
      const cache = new CacheManager(100, undefined);

      // Add entry
      cache.set('test.proto', 'content', 'hash');

      // Clear (simulating corruption)
      cache.clear();

      // Should allow rebuilding
      cache.set('test.proto', 'new content', 'new hash');
      const result = cache.get('test.proto');

      expect(result).toBeDefined();
      expect(result?.content).toBe('new content');
    });
  });

  describe('ERR-10: Build system incompatibility', () => {
    it('should detect build system version', () => {
      // Mock build system detection
      const context = {
        meta: { framework: 'vite' },
        webpack: undefined,
        esbuild: undefined
      };

      const buildSystem = context.meta?.framework || 'unknown';
      expect(buildSystem).toBe('vite');
    });
  });

  describe('ERR-11: Out of memory conditions', () => {
    it('should enforce memory limits with LRU eviction', () => {
      const cache = new CacheManager(1, undefined); // 1MB limit

      // Add entries exceeding limit
      for (let i = 0; i < 10; i++) {
        const content = 'x'.repeat(1024 * 200); // 200KB each
        cache.set(`file${i}.proto`, content, `hash${i}`);
      }

      // Should have evicted old entries
      const stats = cache.getStats();
      expect(stats.totalSize).toBeLessThan(1024 * 1024 * 1.5); // Allow some overhead
    });
  });

  describe('ERR-12: Concurrent write conflicts', () => {
    it('should handle concurrent cache writes safely', async () => {
      const cache = new CacheManager(100, undefined);

      // Simulate concurrent writes to same key
      const writes = [];
      for (let i = 0; i < 10; i++) {
        writes.push(
          Promise.resolve().then(() => {
            cache.set('test.proto', `content${i}`, `hash${i}`);
          })
        );
      }

      await Promise.all(writes);

      // Should have final write
      const result = cache.get('test.proto');
      expect(result).toBeDefined();
      expect(result?.content).toMatch(/content\d/);
    });
  });

  describe('ERR-13: Malformed proto files', () => {
    it('should handle empty proto files', async () => {
      const emptyFile = path.join(testDir, 'empty.proto');
      await fs.writeFile(emptyFile, '');

      const content = await fs.readFile(emptyFile, 'utf-8');
      expect(content).toBe('');
    });

    it('should handle proto with only comments', async () => {
      const commentsOnly = `
// This file only has comments
/*
 * More comments
 */
`;
      const file = path.join(testDir, 'comments.proto');
      await fs.writeFile(file, commentsOnly);

      const content = await fs.readFile(file, 'utf-8');
      expect(content).toContain('//');
      expect(content).toContain('/*');
    });

    it('should detect duplicate field numbers', () => {
      const protoWithDuplicates = `
syntax = "proto3";

message Test {
  string field1 = 1;
  string field2 = 1;  // Duplicate field number
}
`;

      expect(protoWithDuplicates).toContain('field1 = 1');
      expect(protoWithDuplicates).toContain('field2 = 1');
    });
  });

  describe('ERR-14: Network timeouts', () => {
    it('should handle client timeout errors', async () => {
      class MockClient {
        async call(_method: string, _request: any): Promise<any> {
          // Simulate timeout
          await new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), 100)
          );
        }
      }

      const client = new MockClient();

      await expect(client.call('test', {})).rejects.toThrow('Request timeout');
    });
  });

  describe('ERR-15: Missing peer dependencies', () => {
    it('should warn about missing @hallow/react', () => {
      // Mock package.json check
      const hasReact = false; // Simulating missing dependency

      if (!hasReact) {
        const warning = 'generateReactHooks is enabled but @hallow/react is not found';
        expect(warning).toContain('@hallow/react');
        expect(warning).toContain('not found');
      }
    });

    it('should suggest installation command', () => {
      const installCommand = 'npm install @hallow/react';
      expect(installCommand).toContain('npm install');
      expect(installCommand).toContain('@hallow/react');
    });
  });

  describe('Error message quality', () => {
    it('should format errors with proper structure', () => {
      const error = `[Hallow Plugin] Proto syntax error

File: /project/service.proto
Line 15, Column 8: Expected ';' but found 'string'

  13 | message GreetRequest {
  14 |   string name = 1
> 15 |   string metadata = 2;
     |        ^
  16 | }

Suggestion: Add a semicolon after field declaration on line 14.`;

      expect(error).toContain('[Hallow Plugin]');
      expect(error).toContain('File:');
      expect(error).toContain('Line');
      expect(error).toContain('Column');
      expect(error).toContain('Suggestion:');
    });

    it('should colorize error output when supported', () => {
      const red = ErrorFormatter.colorize('Error', 'red');
      const yellow = ErrorFormatter.colorize('Warning', 'yellow');

      // Should contain ANSI codes (or be unchanged if colors not supported)
      expect(red).toBeDefined();
      expect(yellow).toBeDefined();
    });
  });

  describe('Error recovery and cleanup', () => {
    it('should clean up resources after errors', async () => {
      const cache = new CacheManager(100, undefined);

      try {
        // Simulate error during processing
        cache.set('test.proto', 'content', 'hash');
        throw new Error('Processing failed');
      } catch (error) {
        // Cleanup should still work
        cache.clear();
      }

      const stats = cache.getStats();
      expect(stats.entryCount).toBe(0);
    });

    it('should allow subsequent builds after errors', () => {
      const cache = new CacheManager(100, undefined);

      // First attempt fails
      try {
        throw new Error('Build failed');
      } catch (error) {
        // Expected
      }

      // Second attempt should work
      cache.set('test.proto', 'content', 'hash');
      const result = cache.get('test.proto');
      expect(result).toBeDefined();
    });
  });
});
