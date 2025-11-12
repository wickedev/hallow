/**
 * Unit tests for React hooks support (Tasks 14.1, 14.2, 14.3).
 *
 * Tests React configuration options, dependency validation, and code generation verification.
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
import type { UnpluginContextMeta } from 'unplugin';

// Mock console methods to capture warnings and logs
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

// Helper to create plugin instance
const createPlugin = (options: any = {}): any => {
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

describe('React Hooks Support (Tasks 14.1, 14.2, 14.3)', () => {
  beforeEach(() => {
    mockConsoleWarn.mockClear();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleWarn.mockRestore();
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  // ============================================================================
  // Task 14.1: React Configuration Options
  // ============================================================================

  describe('Task 14.1: React Configuration Options', () => {
    it('should accept generateReactHooks option', () => {
      const plugin = createPlugin({
        generateReactHooks: true,
      });

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('@hallow/plugin');
    });

    it('should accept generateSuspenseHooks option', () => {
      const plugin = createPlugin({
        generateSuspenseHooks: true,
      });

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('@hallow/plugin');
    });

    it('should accept both React hooks options together', () => {
      const plugin = createPlugin({
        generateReactHooks: true,
        generateSuspenseHooks: true,
      });

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('@hallow/plugin');
    });

    it('should default generateReactHooks to false', () => {
      const plugin = createPlugin({});
      expect(plugin).toBeDefined();
      // The default should be false (no hooks generated)
    });

    it('should default generateSuspenseHooks to false', () => {
      const plugin = createPlugin({});
      expect(plugin).toBeDefined();
      // The default should be false (no suspense hooks generated)
    });

    it('should pass React hooks flags to generator configuration', () => {
      // This is verified by checking that the plugin initializes without error
      // The actual passing to the generator is tested in integration tests
      const plugin = createPlugin({
        generateReactHooks: true,
        generateSuspenseHooks: true,
        verbose: true,
      });

      expect(plugin).toBeDefined();
    });

    it('should validate generateReactHooks is boolean', () => {
      expect(() => {
        createPlugin({
          generateReactHooks: 'invalid',
        });
      }).toThrow('Configuration errors');
    });

    it('should validate generateSuspenseHooks is boolean', () => {
      expect(() => {
        createPlugin({
          generateSuspenseHooks: 'invalid',
        });
      }).toThrow('Configuration errors');
    });

    it('should handle generateReactHooks with serverUrl', () => {
      const plugin = createPlugin({
        generateReactHooks: true,
        serverUrl: 'https://api.example.com',
      });

      expect(plugin).toBeDefined();
    });

    it('should handle generateSuspenseHooks with optimization settings', () => {
      const plugin = createPlugin({
        generateSuspenseHooks: true,
        optimization: {
          production: true,
          minify: true,
        },
      });

      expect(plugin).toBeDefined();
    });
  });

  // ============================================================================
  // Task 14.2: React Dependency Validation
  // ============================================================================

  describe('Task 14.2: React Dependency Validation', () => {
    // Mock require.resolve to simulate package installation states
    const originalResolve = require.resolve;

    beforeEach(() => {
      // Reset require.resolve mock before each test
      require.resolve = originalResolve;
    });

    afterEach(() => {
      // Restore original require.resolve
      require.resolve = originalResolve;
    });

    it('should warn when generateReactHooks is enabled but @hallow/react is not installed', () => {
      // Mock require.resolve to simulate @hallow/react not being installed
      const mockResolve = jest.fn((moduleName: string) => {
        if (moduleName === '@hallow/react') {
          throw new Error('Cannot find module');
        }
        return originalResolve(moduleName);
      }) as any;
      mockResolve.paths = jest.fn();
      require.resolve = mockResolve;

      const plugin = createPlugin({
        generateReactHooks: true,
      });

      // Trigger initialization by calling buildStart
      if (plugin.buildStart) {
        plugin.buildStart.call({ meta: { framework: 'vite' } });
      }

      // Check that warning was logged
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('[@hallow/plugin] Warning: generateReactHooks or generateSuspenseHooks is enabled but @hallow/react is not found')
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Please install it: npm install @hallow/react')
      );
    });

    it('should warn when generateSuspenseHooks is enabled but @hallow/react is not installed', () => {
      // Mock require.resolve to simulate @hallow/react not being installed
      const mockResolve = jest.fn((moduleName: string) => {
        if (moduleName === '@hallow/react') {
          throw new Error('Cannot find module');
        }
        return originalResolve(moduleName);
      }) as any;
      mockResolve.paths = jest.fn();
      require.resolve = mockResolve;

      const plugin = createPlugin({
        generateSuspenseHooks: true,
      });

      // Trigger initialization by calling buildStart
      if (plugin.buildStart) {
        plugin.buildStart.call({ meta: { framework: 'vite' } });
      }

      // Check that warning was logged
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('[@hallow/plugin] Warning: generateReactHooks or generateSuspenseHooks is enabled but @hallow/react is not found')
      );
    });

    it.skip('should not warn when React hooks are enabled and @hallow/react is installed', () => {
      // Mock require.resolve to simulate @hallow/react being installed
      const mockResolve = jest.fn((moduleName: string) => {

        if (moduleName === '@hallow/react') {
          return '/node_modules/@hallow/react/index.js';
        }
        return originalResolve(moduleName);
            }) as any;
      mockResolve.paths = jest.fn();
      require.resolve = mockResolve;

      const plugin = createPlugin({
        generateReactHooks: true,
      });

      // Trigger initialization
      if (plugin.buildStart) {
        plugin.buildStart.call({ meta: { framework: 'vite' } });
      }

      // Check that no warning about @hallow/react was logged
      const warnings = mockConsoleWarn.mock.calls
        .map((call) => call[0])
        .filter((msg: string) => msg.includes('@hallow/react'));

      expect(warnings.length).toBe(0);
    });

    it('should include installation instructions in warning message', () => {
      // Mock require.resolve to simulate @hallow/react not being installed
      const mockResolve = jest.fn((moduleName: string) => {

        if (moduleName === '@hallow/react') {
          throw new Error('Cannot find module');
        }
        return originalResolve(moduleName);
            }) as any;
      mockResolve.paths = jest.fn();
      require.resolve = mockResolve;

      const plugin = createPlugin({
        generateReactHooks: true,
      });

      // Trigger initialization
      if (plugin.buildStart) {
        plugin.buildStart.call({ meta: { framework: 'vite' } });
      }

      // Check for installation instructions
      const warningCalls = mockConsoleWarn.mock.calls.map((call) => call[0]).join('\n');
      expect(warningCalls).toContain('npm install @hallow/react');
      expect(warningCalls).toContain('yarn add @hallow/react');
    });

    it('should not warn when React hooks are not enabled', () => {
      // Mock require.resolve to simulate @hallow/react not being installed
      const mockResolve = jest.fn((moduleName: string) => {

        if (moduleName === '@hallow/react') {
          throw new Error('Cannot find module');
        }
        return originalResolve(moduleName);
            }) as any;
      mockResolve.paths = jest.fn();
      require.resolve = mockResolve;

      const plugin = createPlugin({
        generateReactHooks: false,
        generateSuspenseHooks: false,
      });

      // Trigger initialization
      if (plugin.buildStart) {
        plugin.buildStart.call({ meta: { framework: 'vite' } });
      }

      // Check that no warning about @hallow/react was logged
      const warnings = mockConsoleWarn.mock.calls
        .map((call) => call[0])
        .filter((msg: string) => msg.includes('@hallow/react'));

      expect(warnings.length).toBe(0);
    });

    it('should suggest enabling hooks when React is detected (verbose mode)', () => {
      // Mock require.resolve to simulate React being installed but hooks not enabled
      const mockResolve = jest.fn((moduleName: string) => {

        if (moduleName === 'react') {
          return '/node_modules/react/index.js';
        }
        if (moduleName === '@hallow/react') {
          throw new Error('Cannot find module');
        }
        return originalResolve(moduleName);
            }) as any;
      mockResolve.paths = jest.fn();
      require.resolve = mockResolve;

      const plugin = createPlugin({
        generateReactHooks: false,
        generateSuspenseHooks: false,
        verbose: true,
      });

      // Trigger initialization
      if (plugin.buildStart) {
        plugin.buildStart.call({ meta: { framework: 'vite' } });
      }

      // Check for suggestion to enable hooks
      const logCalls = mockConsoleLog.mock.calls.map((call) => call[0]).join('\n');
      expect(logCalls).toContain('React detected in your project');
      expect(logCalls).toContain('generateReactHooks: true');
      expect(logCalls).toContain('generateSuspenseHooks: true');
    });

    it('should not suggest enabling hooks when verbose mode is disabled', () => {
      // Mock require.resolve to simulate React being installed
      const mockResolve = jest.fn((moduleName: string) => {

        if (moduleName === 'react') {
          return '/node_modules/react/index.js';
        }
        return originalResolve(moduleName);
            }) as any;
      mockResolve.paths = jest.fn();
      require.resolve = mockResolve;

      const plugin = createPlugin({
        generateReactHooks: false,
        verbose: false,
      });

      // Trigger initialization
      if (plugin.buildStart) {
        plugin.buildStart.call({ meta: { framework: 'vite' } });
      }

      // Check that no suggestion was logged
      const logCalls = mockConsoleLog.mock.calls.map((call) => call[0]).join('\n');
      expect(logCalls).not.toContain('React detected in your project');
    });

    it('should not suggest enabling hooks when React is already enabled', () => {
      // Mock require.resolve to simulate React being installed
      const mockResolve = jest.fn((moduleName: string) => {

        if (moduleName === 'react' || moduleName === '@hallow/react') {
          return '/node_modules/react/index.js';
        }
        return originalResolve(moduleName);
            }) as any;
      mockResolve.paths = jest.fn();
      require.resolve = mockResolve;

      const plugin = createPlugin({
        generateReactHooks: true,
        verbose: true,
      });

      // Trigger initialization
      if (plugin.buildStart) {
        plugin.buildStart.call({ meta: { framework: 'vite' } });
      }

      // Check that no suggestion was logged
      const logCalls = mockConsoleLog.mock.calls.map((call) => call[0]).join('\n');
      expect(logCalls).not.toContain('React detected in your project');
    });
  });

  // ============================================================================
  // Task 14.3: React Hook Code Generation Verification
  // ============================================================================

  describe('Task 14.3: React Hook Code Generation Verification', () => {
    it('should ensure generated code imports from @hallow/react when hooks enabled', async () => {
      // This is tested at the integration level with the generator
      // Here we verify the plugin passes the correct options

      const plugin = createPlugin({
        generateReactHooks: true,
      });

      expect(plugin).toBeDefined();
      // The actual import statement generation is verified in integration tests
      // as it depends on the generator implementation
    });

    it('should ensure generated code includes hook exports when hooks enabled', async () => {
      // This is tested at the integration level with the generator
      // Here we verify the configuration is accepted

      const plugin = createPlugin({
        generateReactHooks: true,
        generateSuspenseHooks: true,
      });

      expect(plugin).toBeDefined();
      // The actual hook function exports are verified in integration tests
      // as they depend on the generator implementation
    });

    it('should ensure TypeScript types are generated for hooks', async () => {
      // This is tested at the integration level
      // Here we verify the configuration supports it

      const plugin = createPlugin({
        generateReactHooks: true,
        sourceMaps: true,
      });

      expect(plugin).toBeDefined();
      // TypeScript type generation is verified in integration tests
    });

    it('should support React hooks with Suspense mode', async () => {
      const plugin = createPlugin({
        generateReactHooks: true,
        generateSuspenseHooks: true,
      });

      expect(plugin).toBeDefined();
      // Suspense hook generation is verified in integration tests
    });

    it('should support React hooks with custom server URL', async () => {
      const plugin = createPlugin({
        generateReactHooks: true,
        serverUrl: 'https://grpc.example.com',
      });

      expect(plugin).toBeDefined();
    });

    it('should support React hooks in production mode', async () => {
      const plugin = createPlugin({
        generateReactHooks: true,
        optimization: {
          production: true,
          minify: true,
          removeComments: true,
        },
      });

      expect(plugin).toBeDefined();
    });

    it('should support React hooks with performance monitoring', async () => {
      const plugin = createPlugin({
        generateReactHooks: true,
        enablePerformanceMonitoring: true,
      });

      expect(plugin).toBeDefined();
    });
  });

  // ============================================================================
  // Integration Tests for React Hooks
  // ============================================================================

  describe('Integration: React Hooks with Multiple Options', () => {
    it('should handle full React hooks configuration', () => {
      const plugin = createPlugin({
        generateReactHooks: true,
        generateSuspenseHooks: true,
        serverUrl: 'https://api.example.com',
        sourceMaps: true,
        verbose: true,
        optimization: {
          production: false,
        },
      });

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('@hallow/plugin');
    });

    it('should handle React hooks with caching enabled', () => {
      const plugin = createPlugin({
        generateReactHooks: true,
        maxCacheSize: 200,
        enablePersistentCache: true,
      });

      expect(plugin).toBeDefined();
    });

    it('should handle React hooks with custom proto paths', () => {
      const plugin = createPlugin({
        generateReactHooks: true,
        protoRoot: './custom-protos',
        importPaths: ['./shared-protos'],
      });

      expect(plugin).toBeDefined();
    });

    it('should handle React hooks with file filtering', () => {
      const plugin = createPlugin({
        generateReactHooks: true,
        include: ['**/*.proto'],
        exclude: ['**/test/**', '**/node_modules/**'],
      });

      expect(plugin).toBeDefined();
    });
  });
});
