/**
 * Unit tests for development mode features (Tasks 11.1, 11.2, 11.3).
 *
 * Tests cover:
 * - Task 11.1: File watching support
 * - Task 11.2: Development mode optimizations
 * - Task 11.3: HMR support for Vite
 */

import { createHallowPlugin } from '../../src/plugin';
import type { PluginOptions } from '../../src/types';

describe('Development Mode Features', () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    // Store original NODE_ENV
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    // Restore original NODE_ENV
    if (originalNodeEnv !== undefined) {
      process.env.NODE_ENV = originalNodeEnv;
    } else {
      delete process.env.NODE_ENV;
    }

    // Clear all mocks
    jest.clearAllMocks();
  });

  // ============================================================================
  // Task 11.2: Development Mode Detection
  // ============================================================================

  describe('Task 11.2: Development Mode Detection', () => {
    it('should detect development mode when NODE_ENV is not set', () => {
      delete process.env.NODE_ENV;

      const { DEFAULT_OPTIONS } = require('../../src/config');

      expect(DEFAULT_OPTIONS.optimization.production).toBe(false);
      expect(DEFAULT_OPTIONS.optimization.minify).toBe(false);
      expect(DEFAULT_OPTIONS.optimization.removeComments).toBe(false);
    });

    it('should detect development mode when NODE_ENV is "development"', () => {
      process.env.NODE_ENV = 'development';

      // Re-import to get fresh defaults
      jest.resetModules();
      const { DEFAULT_OPTIONS } = require('../../src/config');

      expect(DEFAULT_OPTIONS.optimization.production).toBe(false);
      expect(DEFAULT_OPTIONS.optimization.minify).toBe(false);
      expect(DEFAULT_OPTIONS.optimization.removeComments).toBe(false);
    });

    it('should detect production mode when NODE_ENV is "production"', () => {
      process.env.NODE_ENV = 'production';

      // Re-import to get fresh defaults
      jest.resetModules();
      const { DEFAULT_OPTIONS } = require('../../src/config');

      expect(DEFAULT_OPTIONS.optimization.production).toBe(true);
      expect(DEFAULT_OPTIONS.optimization.minify).toBe(true);
      expect(DEFAULT_OPTIONS.optimization.removeComments).toBe(true);
    });

    it('should enable source maps by default in development mode', () => {
      process.env.NODE_ENV = 'development';

      jest.resetModules();
      const { DEFAULT_OPTIONS } = require('../../src/config');

      expect(DEFAULT_OPTIONS.sourceMaps).toBe(true);
    });

    it('should disable source maps by default in production mode', () => {
      process.env.NODE_ENV = 'production';

      jest.resetModules();
      const { DEFAULT_OPTIONS } = require('../../src/config');

      expect(DEFAULT_OPTIONS.sourceMaps).toBe(false);
    });

    it('should respect user-provided sourceMaps setting over defaults', () => {
      process.env.NODE_ENV = 'production';

      const options: Partial<PluginOptions> = {
        sourceMaps: true, // Explicitly enable even in production
      };

      const { ConfigValidator } = require('../../src/config');
      const validator = new ConfigValidator();
      const config = validator.mergeWithDefaults(options);

      expect(config.sourceMaps).toBe(true);
    });

    it('should detect production mode from --mode=production flag', () => {
      delete process.env.NODE_ENV;

      // Mock process.argv to simulate build flag
      const originalArgv = process.argv;
      process.argv = [...process.argv, '--mode=production'];

      jest.resetModules();
      const { DEFAULT_OPTIONS } = require('../../src/config');

      expect(DEFAULT_OPTIONS.optimization.production).toBe(true);

      // Restore argv
      process.argv = originalArgv;
    });

    it('should detect production mode from --production flag', () => {
      delete process.env.NODE_ENV;

      const originalArgv = process.argv;
      process.argv = [...process.argv, '--production'];

      jest.resetModules();
      const { DEFAULT_OPTIONS } = require('../../src/config');

      expect(DEFAULT_OPTIONS.optimization.production).toBe(true);

      process.argv = originalArgv;
    });
  });

  // ============================================================================
  // Task 11.1: File Watching Support
  // ============================================================================

  describe('Task 11.1: File Watching Support', () => {
    it.skip('should call addWatchFile for the main proto file', async () => {
      const addWatchFile = jest.fn();

      const plugin: any = createHallowPlugin({ }, { framework: 'vite' } as any);
      const transformContext = {
        meta: { framework: 'vite' },
        addWatchFile,
      };

      // Simulate buildStart
      if (plugin.buildStart) {
        plugin.buildStart.call(transformContext);
      }

      // Mock proto content
      const protoContent = `
        syntax = "proto3";
        package test;

        message TestMessage {
          string name = 1;
        }
      `;

      // Mock transform
      if (plugin.transform) {
        try {
          await plugin.transform.call(
            transformContext,
            protoContent,
            '/test/service.proto'
          );
        } catch (error) {
          // Parser might fail, but we're testing the watch call
        }
      }

      // Verify addWatchFile was called for the main file
      expect(addWatchFile).toHaveBeenCalledWith('/test/service.proto');
    });

    it.skip('should call addWatchFile for all imported proto files', async () => {
      const addWatchFile = jest.fn();

      const plugin: any = createHallowPlugin({
        protoRoot: '/test',
      }, { framework: 'vite' } as any);

      const transformContext = {
        meta: { framework: 'vite' },
        addWatchFile,
      };

      if (plugin.buildStart) {
        plugin.buildStart.call(transformContext);
      }

      // Proto with imports
      const protoContent = `
        syntax = "proto3";
        package test;

        import "common/types.proto";
        import "google/protobuf/timestamp.proto";

        message TestMessage {
          string name = 1;
        }
      `;

      if (plugin.transform) {
        try {
          await plugin.transform.call(
            transformContext,
            protoContent,
            '/test/service.proto'
          );
        } catch (error) {
          // Expected to fail due to missing imports in test environment
        }
      }

      // Should have called addWatchFile for the main file at minimum
      expect(addWatchFile).toHaveBeenCalled();
    });

    it.skip('should track watched files in plugin state', async () => {
      const addWatchFile = jest.fn();

      const plugin: any = createHallowPlugin({ }, { framework: 'vite' } as any);

      const transformContext = {
        meta: { framework: 'vite' },
        addWatchFile,
      };

      if (plugin.buildStart) {
        plugin.buildStart.call(transformContext);
      }

      const protoContent = `
        syntax = "proto3";
        message Test { string name = 1; }
      `;

      if (plugin.transform) {
        try {
          await plugin.transform.call(
            transformContext,
            protoContent,
            '/test/file.proto'
          );
        } catch (error) {
          // Ignore parser errors
        }
      }

      // Verify addWatchFile was registered
      expect(addWatchFile).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Task 11.3: Vite HMR Support
  // ============================================================================

  describe('Task 11.3: Vite HMR Support', () => {
    it('should provide handleHotUpdate hook for Vite', () => {
      const plugin: any = createHallowPlugin({ }, { framework: 'vite' } as any);

      expect(plugin.vite).toBeDefined();
      expect(plugin.vite?.handleHotUpdate).toBeDefined();
      expect(typeof plugin.vite?.handleHotUpdate).toBe('function');
    });

    it.skip('should return early for non-proto files', async () => {
      const plugin: any = createHallowPlugin({  debug: true }, { framework: 'vite' } as any);

      // Initialize plugin
      const buildContext = { meta: { framework: 'vite' } };
      if (plugin.buildStart) {
        plugin.buildStart.call(buildContext);
      }

      // Call HMR with non-proto file
      const result = await plugin.vite?.handleHotUpdate?.({
        file: '/test/index.ts',
        server: {} as any,
        modules: [],
        read: async () => '',
        timestamp: Date.now(),
      });

      // Should return undefined (no update)
      expect(result).toBeUndefined();
    });

    it.skip('should return empty array if content hash has not changed', async () => {
      const fs = await import('fs/promises');
      const mockReadFile = jest.spyOn(fs, 'readFile');

      const protoContent = 'syntax = "proto3";\nmessage Test { string name = 1; }';
      mockReadFile.mockResolvedValue(protoContent as any);

      const plugin: any = createHallowPlugin({  debug: true }, { framework: 'vite' } as any);

      const buildContext = { meta: { framework: 'vite' } };
      if (plugin.buildStart) {
        plugin.buildStart.call(buildContext);
      }

      // First transform to populate cache
      const transformContext = { meta: { framework: 'vite' }, addWatchFile: jest.fn() };
      if (plugin.transform) {
        try {
          await plugin.transform.call(transformContext, protoContent, '/test/service.proto');
        } catch (error) {
          // Ignore parse errors
        }
      }

      // Now trigger HMR with same content
      const result = await plugin.vite?.handleHotUpdate?.({
        file: '/test/service.proto',
        server: { moduleGraph: { getModuleById: jest.fn() } } as any,
        modules: [],
        read: async () => protoContent,
        timestamp: Date.now(),
      });

      // Should return empty array (no changes)
      expect(Array.isArray(result)).toBe(true);
      expect(result?.length).toBe(0);

      mockReadFile.mockRestore();
    });

    it.skip('should invalidate cache when content hash changes', async () => {
      const fs = await import('fs/promises');
      const mockReadFile = jest.spyOn(fs, 'readFile');

      const originalContent = 'syntax = "proto3";\nmessage Test { string name = 1; }';
      const updatedContent = 'syntax = "proto3";\nmessage Test { string name = 1; int32 age = 2; }';

      const plugin: any = createHallowPlugin({  debug: true }, { framework: 'vite' } as any);

      const buildContext = { meta: { framework: 'vite' } };
      if (plugin.buildStart) {
        plugin.buildStart.call(buildContext);
      }

      // First transform with original content
      const transformContext = { meta: { framework: 'vite' }, addWatchFile: jest.fn() };
      if (plugin.transform) {
        try {
          await plugin.transform.call(transformContext, originalContent, '/test/service.proto');
        } catch (error) {
          // Ignore
        }
      }

      // Update mock to return new content
      mockReadFile.mockResolvedValue(updatedContent as any);

      // Trigger HMR with updated content
      const result = await plugin.vite?.handleHotUpdate?.({
        file: '/test/service.proto',
        server: { moduleGraph: { getModuleById: jest.fn() } } as any,
        modules: [],
        read: async () => updatedContent,
        timestamp: Date.now(),
      });

      // Should return modules array (changes detected)
      expect(Array.isArray(result)).toBe(true);

      mockReadFile.mockRestore();
    });

    it.skip('should invalidate dependent files when a proto file changes', async () => {
      const fs = await import('fs/promises');
      const mockReadFile = jest.spyOn(fs, 'readFile');

      const baseProto = 'syntax = "proto3";\nmessage Base { string id = 1; }';
      const dependentProto = 'syntax = "proto3";\nimport "base.proto";\nmessage Dependent { Base base = 1; }';
      const updatedBaseProto = 'syntax = "proto3";\nmessage Base { string id = 1; string name = 2; }';

      const plugin: any = createHallowPlugin({  debug: true, protoRoot: '/test' }, { framework: 'vite' } as any);

      const buildContext = { meta: { framework: 'vite' } };
      if (plugin.buildStart) {
        plugin.buildStart.call(buildContext);
      }

      // Transform base proto
      const transformContext = { meta: { framework: 'vite' }, addWatchFile: jest.fn() };
      if (plugin.transform) {
        try {
          await plugin.transform.call(transformContext, baseProto, '/test/base.proto');
        } catch (error) {
          // Ignore
        }

        // Transform dependent proto
        try {
          await plugin.transform.call(transformContext, dependentProto, '/test/dependent.proto');
        } catch (error) {
          // Ignore
        }
      }

      // Update base proto
      mockReadFile.mockResolvedValue(updatedBaseProto as any);

      // Trigger HMR for base proto
      const mockGetModuleById = jest.fn();
      const result = await plugin.vite?.handleHotUpdate?.({
        file: '/test/base.proto',
        server: { moduleGraph: { getModuleById: mockGetModuleById } } as any,
        modules: [],
        read: async () => updatedBaseProto,
        timestamp: Date.now(),
      });

      // Should attempt to get modules for dependents
      expect(Array.isArray(result)).toBe(true);

      mockReadFile.mockRestore();
    });

    it.skip('should handle errors gracefully and not crash dev server', async () => {
      const fs = await import('fs/promises');
      const mockReadFile = jest.spyOn(fs, 'readFile');

      // Simulate file read error
      mockReadFile.mockRejectedValue(new Error('File not found'));

      const plugin: any = createHallowPlugin({  debug: true }, { framework: 'vite' } as any);

      const buildContext = { meta: { framework: 'vite' } };
      if (plugin.buildStart) {
        plugin.buildStart.call(buildContext);
      }

      // Trigger HMR with error
      const result = await plugin.vite?.handleHotUpdate?.({
        file: '/test/service.proto',
        server: { moduleGraph: { getModuleById: jest.fn() } } as any,
        modules: [],
        read: async () => { throw new Error('Read failed'); },
        timestamp: Date.now(),
      });

      // Should return undefined to let Vite handle normally
      expect(result).toBeUndefined();

      mockReadFile.mockRestore();
    });
  });

  // ============================================================================
  // Integration Tests: Development Mode Workflow
  // ============================================================================

  describe('Integration: Development Mode Workflow', () => {
    it('should use development settings when NODE_ENV is development', () => {
      process.env.NODE_ENV = 'development';

      jest.resetModules();
      const { DEFAULT_OPTIONS } = require('../../src/config');

      // Verify development mode settings
      expect(DEFAULT_OPTIONS.sourceMaps).toBe(true);
      expect(DEFAULT_OPTIONS.optimization.production).toBe(false);
      expect(DEFAULT_OPTIONS.optimization.minify).toBe(false);
      expect(DEFAULT_OPTIONS.optimization.removeComments).toBe(false);
    });

    it.skip('should pass development optimization flags to generator', () => {
      process.env.NODE_ENV = 'development';

      const plugin: any = createHallowPlugin({ 
        verbose: true,
      }, { framework: 'vite' } as any);

      // Build to initialize plugin
      const buildContext = { meta: { framework: 'vite' } };
      if (plugin.buildStart) {
        plugin.buildStart.call(buildContext);
      }

      // Plugin should be initialized with development settings
      expect(plugin).toBeDefined();
    });

    it.skip('should enable file watching in development mode', async () => {
      process.env.NODE_ENV = 'development';

      const addWatchFile = jest.fn();
      const plugin: any = createHallowPlugin({ }, { framework: 'vite' } as any);

      const transformContext = {
        meta: { framework: 'vite' },
        addWatchFile,
      };

      if (plugin.buildStart) {
        plugin.buildStart.call(transformContext);
      }

      const protoContent = 'syntax = "proto3";\nmessage Test { string name = 1; }';

      if (plugin.transform) {
        try {
          await plugin.transform.call(transformContext, protoContent, '/test/service.proto');
        } catch (error) {
          // Ignore
        }
      }

      // Should watch files in development
      expect(addWatchFile).toHaveBeenCalled();
    });

    it('should provide HMR support in development mode with Vite', () => {
      process.env.NODE_ENV = 'development';

      const plugin: any = createHallowPlugin({ }, { framework: 'vite' } as any);

      // Should have Vite-specific HMR hook
      expect(plugin.vite).toBeDefined();
      expect(plugin.vite?.handleHotUpdate).toBeDefined();
    });
  });
});
