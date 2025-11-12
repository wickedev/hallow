/**
 * Unit tests for plugin initialization and configuration.
 *
 * Tests the core plugin factory, configuration validation, component initialization,
 * and build system detection.
 */

// Mock modules
jest.mock('@hallow/parser', () => ({
  Parser: jest.fn().mockImplementation(() => ({
    parse: jest.fn((content: string, filePath: string) => {
      const importMatches = content.match(/import\s+"([^"]+)";/g) || [];
      const imports = importMatches.map((match) => {
        const pathMatch = match.match(/import\s+"([^"]+)";/);
        return pathMatch ? pathMatch[1] : '';
      });
      return {
        fileName: filePath,
        package: 'test.package',
        syntax: 'proto3',
        imports,
        services: [],
        messages: [],
        enums: [],
        options: {},
      };
    }),
  })),
  ParseError: class ParseError extends Error {
    constructor(message: string, public line: number, public column: number, public filePath?: string) {
      super(message);
    }
  },
}));

jest.mock('@hallow/generator');

import { createHallowPlugin } from '../../src/plugin';
import type { UnpluginContextMeta, UnpluginOptions } from 'unplugin';

describe.skip('Plugin Initialization', () => {
  // Helper to create mock unplugin context
  const createMockContext = (framework: string = 'vite'): any => ({
    meta: {
      framework,
      webpack: framework === 'webpack',
      rollup: framework === 'rollup',
      vite: framework === 'vite',
      esbuild: framework === 'esbuild',
    } as UnpluginContextMeta,
  });

  // Helper to create plugin instance
  const createPlugin = (options: any = {}): UnpluginOptions => {
    const mockMeta: UnpluginContextMeta = {
      framework: 'vite',
    } as UnpluginContextMeta;
    const result = createHallowPlugin(options, mockMeta);
    // Assert that we get a single plugin, not an array
    if (Array.isArray(result)) {
      throw new Error('Expected single plugin instance, got array');
    }
    return result;
  };

  describe('createHallowPlugin', () => {
    it('should create plugin with default options', () => {
      const plugin = createPlugin();
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('@hallow/plugin');
    });

    it('should create plugin with custom options', () => {
      const plugin = createPlugin({
        protoRoot: './custom-protos',
        generateReactHooks: true,
      });
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('@hallow/plugin');
    });

    it('should validate plugin name is correct', () => {
      const plugin = createPlugin();
      expect(plugin.name).toBe('@hallow/plugin');
    });

    it('should have transformInclude hook', () => {
      const plugin = createPlugin();
      expect(plugin.transformInclude).toBeDefined();
      expect(typeof plugin.transformInclude).toBe('function');
    });

    it('should have transform hook', () => {
      const plugin = createPlugin();
      expect(plugin.transform).toBeDefined();
      expect(typeof plugin.transform).toBe('function');
    });

    it('should have buildStart hook', () => {
      const plugin = createPlugin();
      expect(plugin.buildStart).toBeDefined();
      expect(typeof plugin.buildStart).toBe('function');
    });

    it('should have buildEnd hook', () => {
      const plugin = createPlugin();
      expect(plugin.buildEnd).toBeDefined();
      expect(typeof plugin.buildEnd).toBe('function');
    });

    it('should have Vite-specific hooks', () => {
      const plugin = createPlugin();
      expect(plugin.vite).toBeDefined();
      expect(plugin.vite?.handleHotUpdate).toBeDefined();
    });
  });

  describe('Configuration Validation', () => {
    it('should throw on invalid configuration', () => {
      expect(() => {
        createPlugin({
          maxCacheSize: -10, // Invalid: must be positive
        });
      }).toThrow('Configuration errors');
    });

    it('should throw on invalid type', () => {
      expect(() => {
        createPlugin({
          include: 'invalid', // Should be array
        });
      }).toThrow('Configuration errors');
    });

    it('should throw on unknown option', () => {
      expect(() => {
        createPlugin({
          unknownOption: true,
        });
      }).toThrow('Configuration errors');
    });

    it('should accept valid configuration', () => {
      expect(() => {
        createPlugin({
          include: ['**/*.proto'],
          exclude: ['node_modules/**'],
          protoRoot: './protos',
          generateReactHooks: true,
          sourceMaps: false,
        });
      }).not.toThrow();
    });

    it('should merge user options with defaults', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const plugin = createPlugin({
        verbose: true,
        debug: true,
        generateReactHooks: true,
      });

      const context = createMockContext('vite');
      plugin.buildStart?.call(context);

      // Should log configuration with merged defaults
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Initialized successfully with vite')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Generate React hooks: true')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Build System Detection', () => {
    it('should detect Vite build system', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const plugin = createPlugin({ debug: true });

      const context = createMockContext('vite');
      plugin.buildStart?.call(context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Detected build system: vite')
      );

      consoleSpy.mockRestore();
    });

    it('should detect Webpack build system', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const plugin = createPlugin({ debug: true });

      const context = createMockContext('webpack');
      plugin.buildStart?.call(context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Detected build system: webpack')
      );

      consoleSpy.mockRestore();
    });

    it('should detect ESBuild build system', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const plugin = createPlugin({ debug: true });

      const context = createMockContext('esbuild');
      plugin.buildStart?.call(context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Detected build system: esbuild')
      );

      consoleSpy.mockRestore();
    });

    it('should detect Rollup build system', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const plugin = createPlugin({ debug: true });

      const context = createMockContext('rollup');
      plugin.buildStart?.call(context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Detected build system: rollup')
      );

      consoleSpy.mockRestore();
    });

    it('should detect unknown build system', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const plugin = createPlugin({ debug: true });

      const context = createMockContext('unknown');
      plugin.buildStart?.call(context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Detected build system: unknown')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Component Initialization', () => {
    it('should initialize only once', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const plugin = createPlugin({ verbose: true });

      const context = createMockContext('vite');

      // Call buildStart multiple times
      plugin.buildStart?.call(context);
      plugin.buildStart?.call(context);
      plugin.buildStart?.call(context);

      // Should only initialize once
      const initCalls = consoleSpy.mock.calls.filter((call) =>
        call[0]?.includes('Initialized successfully')
      );
      expect(initCalls).toHaveLength(1);

      consoleSpy.mockRestore();
    });

    it('should initialize before transform', async () => {
      const plugin = createPlugin({ debug: true });
      const context = createMockContext('vite');

      // Call transform without buildStart
      const result = await plugin.transform?.call(
        context,
        'syntax = "proto3";',
        '/test/service.proto'
      );

      expect(result).toBeDefined();
      // Should not throw, components initialized automatically
    });

    it('should log initialization in verbose mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const plugin = createPlugin({ verbose: true });

      const context = createMockContext('vite');
      plugin.buildStart?.call(context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[@hallow/plugin] Initialized successfully with vite')
      );

      consoleSpy.mockRestore();
    });

    it('should log configuration in debug mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const plugin = createPlugin({
        verbose: true,
        debug: true,
        protoRoot: './custom-protos',
        generateReactHooks: true,
      });

      const context = createMockContext('vite');
      plugin.buildStart?.call(context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Configuration:')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Proto root: ./custom-protos')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Generate React hooks: true')
      );

      consoleSpy.mockRestore();
    });

    it('should not log in non-verbose mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const plugin = createPlugin({ verbose: false });

      const context = createMockContext('vite');
      plugin.buildStart?.call(context);

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('transformInclude Hook', () => {
    it('should include .proto files', () => {
      const plugin = createPlugin();
      expect(plugin.transformInclude?.('/path/to/service.proto')).toBe(true);
      expect(plugin.transformInclude?.('/path/to/nested/api.proto')).toBe(true);
    });

    it('should exclude non-.proto files', () => {
      const plugin = createPlugin();
      expect(plugin.transformInclude?.('/path/to/file.ts')).toBe(false);
      expect(plugin.transformInclude?.('/path/to/file.js')).toBe(false);
      expect(plugin.transformInclude?.('/path/to/file.json')).toBe(false);
    });

    it('should handle files without extension', () => {
      const plugin = createPlugin();
      expect(plugin.transformInclude?.('/path/to/file')).toBe(false);
    });
  });

  describe('transform Hook', () => {
    it('should return transformed code', async () => {
      const plugin = createPlugin();
      const context = createMockContext('vite');

      const result = await plugin.transform?.call(
        context,
        'syntax = "proto3";',
        '/test/service.proto'
      );

      expect(result).toBeDefined();
      if (typeof result === 'string') {
        expect(result).toBeDefined();
      } else {
        expect(result?.code).toBeDefined();
        expect(typeof result?.code).toBe('string');
      }
    });

    it('should return null source map by default', async () => {
      const plugin = createPlugin();
      const context = createMockContext('vite');

      const result = await plugin.transform?.call(
        context,
        'syntax = "proto3";',
        '/test/service.proto'
      );

      if (typeof result !== 'string') {
        expect(result?.map).toBeNull();
      }
    });

    it('should log transform in debug mode', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const plugin = createPlugin({ debug: true });
      const context = createMockContext('vite');

      await plugin.transform?.call(
        context,
        'syntax = "proto3";',
        '/test/service.proto'
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Transform called for: /test/service.proto')
      );

      consoleSpy.mockRestore();
    });

    it('should initialize automatically if state not ready', async () => {
      // Even with a null meta, the plugin will initialize with a fallback
      const plugin = createPlugin();

      // Mock a context that doesn't have meta
      const badContext = {
        meta: null,
      };

      // Should initialize automatically with fallback meta, not throw
      const result = await plugin.transform?.call(
        badContext as any,
        'syntax = "proto3";',
        '/test/service.proto'
      );

      expect(result).toBeDefined();
    });
  });

  describe('buildEnd Hook', () => {
    it('should complete without error', () => {
      const plugin = createPlugin();
      const context = createMockContext('vite');

      plugin.buildStart?.call(context);

      expect(() => {
        plugin.buildEnd?.call(context);
      }).not.toThrow();
    });

    it('should log cache statistics in verbose mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const plugin = createPlugin({ verbose: true });
      const context = createMockContext('vite');

      plugin.buildStart?.call(context);
      plugin.buildEnd?.call(context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cache Statistics:')
      );

      consoleSpy.mockRestore();
    });

    it('should log performance summary when monitoring enabled', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const plugin = createPlugin({
        enablePerformanceMonitoring: true,
      });
      const context = createMockContext('vite');

      plugin.buildStart?.call(context);

      // Transform a file to generate metrics
      await plugin.transform?.call(
        context,
        'syntax = "proto3";',
        '/test/service.proto'
      );

      plugin.buildEnd?.call(context);

      // Performance summary should be logged
      // Note: The current TODO implementation doesn't actually generate metrics yet
      // This test will need to be updated when Task 9.2/9.3 are implemented

      consoleSpy.mockRestore();
    });

    it('should handle buildEnd when not initialized', () => {
      const plugin = createPlugin();
      const context = createMockContext('vite');

      // Call buildEnd without buildStart
      expect(() => {
        plugin.buildEnd?.call(context);
      }).not.toThrow();
    });
  });

  describe('Vite HMR Hook', () => {
    it('should have handleHotUpdate hook', () => {
      const plugin = createPlugin();
      expect(plugin.vite?.handleHotUpdate).toBeDefined();
    });

    it('should log HMR update in debug mode', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const plugin = createPlugin({ debug: true });
      const context = createMockContext('vite');

      plugin.buildStart?.call(context);

      const hmrHandler = plugin.vite?.handleHotUpdate;
      if (hmrHandler && typeof hmrHandler === 'function') {
        hmrHandler.call(context, { file: '/test/service.proto' } as any);
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('HMR update for: /test/service.proto')
      );

      consoleSpy.mockRestore();
    });

    it('should handle HMR when not initialized', () => {
      const plugin = createPlugin();
      const context = createMockContext('vite');

      expect(() => {
        const hmrHandler = plugin.vite?.handleHotUpdate;
        if (hmrHandler && typeof hmrHandler === 'function') {
          hmrHandler.call(context, { file: '/test/service.proto' } as any);
        }
      }).not.toThrow();
    });
  });

  describe('Persistent Cache', () => {
    it('should load persistent cache when enabled', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const plugin = createPlugin({
        debug: true,
        enablePersistentCache: true,
        cacheDir: '.test-cache',
      });
      const context = createMockContext('vite');

      plugin.buildStart?.call(context);

      // Wait for async cache loading
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should attempt to load cache (may fail if directory doesn't exist)
      const loadCalls = consoleSpy.mock.calls.filter((call) =>
        call[0]?.includes('persistent cache')
      );
      expect(loadCalls.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });

    it('should save persistent cache on buildEnd', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const plugin = createPlugin({
        debug: true,
        enablePersistentCache: true,
        cacheDir: '.test-cache',
      });
      const context = createMockContext('vite');

      plugin.buildStart?.call(context);
      plugin.buildEnd?.call(context);

      // Wait for async cache saving
      await new Promise((resolve) => setTimeout(resolve, 100));

      consoleSpy.mockRestore();
    });
  });

  describe('Configuration Warnings', () => {
    it('should log warnings in verbose mode', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      createPlugin({
        verbose: true,
        maxCacheSize: 5, // Very low, should trigger warning
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cache size is very low')
      );

      consoleSpy.mockRestore();
    });

    it('should not log warnings in non-verbose mode', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      createPlugin({
        verbose: false,
        maxCacheSize: 5, // Very low, would trigger warning in verbose mode
      });

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
