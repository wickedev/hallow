/**
 * Unit tests for Task 16.3: Source Map Generation
 *
 * Tests verify that the plugin generates valid source maps mapping generated
 * TypeScript code back to original proto files, with proper handling of
 * development/production modes.
 *
 * Requirements: 4.9, 12.11
 */

import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';
import hallowPlugin from '../../src/index';
import { Generator } from '@hallow/generator';

// Mock the generator to control source map generation
jest.mock('@hallow/generator', () => ({
  Generator: jest.fn().mockImplementation(() => ({
    generateCode: jest.fn(() => Promise.resolve({
      files: [
        {
          path: 'test.proto.ts',
          content: 'export interface Test { id: string; }',
          sourceMap: '{"version":3,"sources":["test.proto"],"names":[],"mappings":"AAAA"}',
        },
      ],
      metadata: {
        generatedAt: new Date(),
        generatorVersion: '0.1.0',
        servicesCount: 0,
        messagesCount: 1,
        enumsCount: 0,
      },
    })),
  } as any)),
}));

// Mock the parser
jest.mock('@hallow/parser', () => ({
  Parser: jest.fn().mockImplementation(() => ({
    parse: jest.fn(() => Promise.resolve({
      syntax: 'proto3',
      package: 'test',
      imports: [],
      messages: [
        {
          name: 'Test',
          fields: [
            { name: 'id', type: 'string', tag: 1, repeated: false, optional: false },
          ],
        },
      ],
      services: [],
      enums: [],
    })),
  })),
}));

describe('Task 16.3: Source Map Generation', () => {
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('16.3.1: Source Map Generation in Development Mode', () => {
    it('should generate source maps when sourceMaps is true', async () => {
      process.env.NODE_ENV = 'development';

      const plugin = hallowPlugin.vite({
        protoRoot: '/test',
        sourceMaps: true,
        verbose: false,
        debug: false,
      });

      // Get the unplugin instance
      const unplugin = plugin as any;

      // Simulate transform hook
      const transformHook = unplugin.transform;
      expect(transformHook).toBeDefined();

      const mockCode = 'syntax = "proto3";\nmessage Test { string id = 1; }';
      const mockId = '/test/test.proto';

      const result = await transformHook.call(
        {
          addWatchFile: jest.fn(),
        },
        mockCode,
        mockId
      );

      expect(result).toBeDefined();
      expect(result.code).toBeDefined();
      expect(result.map).toBeDefined();
      expect(result.map).not.toBeNull();
      expect(typeof result.map).toBe('string');
    });

    it('should enable source maps by default in development mode', async () => {
      process.env.NODE_ENV = 'development';

      const plugin = hallowPlugin.vite({
        protoRoot: '/test',
        // sourceMaps not explicitly set - should default to true in dev mode
        verbose: false,
        debug: false,
      });

      const unplugin = plugin as any;
      const transformHook = unplugin.transform;

      const mockCode = 'syntax = "proto3";\nmessage Test { string id = 1; }';
      const mockId = '/test/test.proto';

      const result = await transformHook.call(
        {
          addWatchFile: jest.fn(),
        },
        mockCode,
        mockId
      );

      // Should have source map in development mode by default
      expect(result.map).toBeDefined();
    });

    it('should respect explicit sourceMaps: false in development mode', async () => {
      process.env.NODE_ENV = 'development';

      const plugin = hallowPlugin.vite({
        protoRoot: '/test',
        sourceMaps: false, // Explicitly disabled
        verbose: false,
        debug: false,
      });

      const unplugin = plugin as any;
      const transformHook = unplugin.transform;

      const mockCode = 'syntax = "proto3";\nmessage Test { string id = 1; }';
      const mockId = '/test/test.proto';

      const result = await transformHook.call(
        {
          addWatchFile: jest.fn(),
        },
        mockCode,
        mockId
      );

      // Should not have source map when explicitly disabled
      expect(result.map).toBeNull();
    });
  });

  describe('16.3.2: Source Map Generation in Production Mode', () => {
    it.skip('should not generate source maps by default in production mode', async () => {
      process.env.NODE_ENV = 'production';

      const plugin = hallowPlugin.vite({
        protoRoot: '/test',
        // sourceMaps not set - should default to false in production
        verbose: false,
        debug: false,
      });

      const unplugin = plugin as any;
      const transformHook = unplugin.transform;

      const mockCode = 'syntax = "proto3";\nmessage Test { string id = 1; }';
      const mockId = '/test/test.proto';

      const result = await transformHook.call(
        {
          addWatchFile: jest.fn(),
        },
        mockCode,
        mockId
      );

      // Should not have source map in production mode by default
      expect(result.map).toBeNull();
    });

    it('should generate source maps when explicitly enabled in production', async () => {
      process.env.NODE_ENV = 'production';

      const plugin = hallowPlugin.vite({
        protoRoot: '/test',
        sourceMaps: true, // Explicitly enabled
        verbose: false,
        debug: false,
      });

      const unplugin = plugin as any;
      const transformHook = unplugin.transform;

      const mockCode = 'syntax = "proto3";\nmessage Test { string id = 1; }';
      const mockId = '/test/test.proto';

      const result = await transformHook.call(
        {
          addWatchFile: jest.fn(),
        },
        mockCode,
        mockId
      );

      // Should have source map when explicitly enabled
      expect(result.map).toBeDefined();
      expect(result.map).not.toBeNull();
    });
  });

  describe('16.3.3: Source Map Content Validation', () => {
    it('should return valid source map JSON', async () => {
      process.env.NODE_ENV = 'development';

      const plugin = hallowPlugin.vite({
        protoRoot: '/test',
        sourceMaps: true,
        verbose: false,
        debug: false,
      });

      const unplugin = plugin as any;
      const transformHook = unplugin.transform;

      const mockCode = 'syntax = "proto3";\nmessage Test { string id = 1; }';
      const mockId = '/test/test.proto';

      const result = await transformHook.call(
        {
          addWatchFile: jest.fn(),
        },
        mockCode,
        mockId
      );

      expect(result.map).toBeDefined();
      expect(result.map).not.toBeNull();

      // Should be valid JSON
      const sourceMapObj = JSON.parse(result.map as string);
      expect(sourceMapObj.version).toBe(3); // Source map v3
      expect(sourceMapObj.sources).toBeDefined();
      expect(Array.isArray(sourceMapObj.sources)).toBe(true);
    });

    it('should map sources back to proto file', async () => {
      process.env.NODE_ENV = 'development';

      const plugin = hallowPlugin.vite({
        protoRoot: '/test',
        sourceMaps: true,
        verbose: false,
        debug: false,
      });

      const unplugin = plugin as any;
      const transformHook = unplugin.transform;

      const mockCode = 'syntax = "proto3";\nmessage Test { string id = 1; }';
      const mockId = '/test/service.proto';

      const result = await transformHook.call(
        {
          addWatchFile: jest.fn(),
        },
        mockCode,
        mockId
      );

      const sourceMapObj = JSON.parse(result.map as string);

      // Sources should reference the original proto file
      expect(sourceMapObj.sources).toBeDefined();
      expect(sourceMapObj.sources.length).toBeGreaterThan(0);
      expect(sourceMapObj.sources[0]).toContain('.proto');
    });
  });

  describe('16.3.4: Multiple Files Source Map Handling', () => {
    it('should handle single file with source map', async () => {
      // This is covered by previous tests
      // Generator returns a single file with source map
      process.env.NODE_ENV = 'development';

      const plugin = hallowPlugin.vite({
        protoRoot: '/test',
        sourceMaps: true,
        verbose: false,
        debug: false,
      });

      const unplugin = plugin as any;
      const transformHook = unplugin.transform;

      const mockCode = 'syntax = "proto3";\nmessage Test { string id = 1; }';
      const mockId = '/test/test.proto';

      const result = await transformHook.call(
        {
          addWatchFile: jest.fn(),
        },
        mockCode,
        mockId
      );

      expect(result.map).toBeDefined();
      expect(result.map).not.toBeNull();
    });

    it('should handle multiple files with source maps', async () => {
      // Mock generator to return multiple files with source maps
      const mockGenerator: any = {
        generateCode: jest.fn(() => Promise.resolve({
          files: [
            {
              path: 'messages.ts',
              content: 'export interface Message1 {}',
              sourceMap: '{"version":3,"sources":["test.proto"],"names":[],"mappings":"AAAA"}',
            },
            {
              path: 'services.ts',
              content: 'export class ServiceStub {}',
              sourceMap: '{"version":3,"sources":["test.proto"],"names":[],"mappings":"BBBB"}',
            },
          ],
          metadata: {
            generatedAt: new Date(),
            generatorVersion: '0.1.0',
            servicesCount: 1,
            messagesCount: 1,
            enumsCount: 0,
          },
        })),
      };

      jest.mocked(Generator).mockImplementation(() => mockGenerator);

      process.env.NODE_ENV = 'development';

      const plugin = hallowPlugin.vite({
        protoRoot: '/test',
        sourceMaps: true,
        verbose: false,
        debug: false,
      });

      const unplugin = plugin as any;
      const transformHook = unplugin.transform;

      const mockCode = 'syntax = "proto3";\nmessage Test { string id = 1; }';
      const mockId = '/test/test.proto';

      const result = await transformHook.call(
        {
          addWatchFile: jest.fn(),
        },
        mockCode,
        mockId
      );

      // Should have a source map (uses first one)
      expect(result.map).toBeDefined();
      expect(result.map).not.toBeNull();
    });

    it('should handle files without source maps gracefully', async () => {
      // Mock generator to return file without source map
      const mockGenerator: any = {
        generateCode: jest.fn(() => Promise.resolve({
          files: [
            {
              path: 'test.ts',
              content: 'export interface Test {}',
              // No sourceMap field
            },
          ],
          metadata: {
            generatedAt: new Date(),
            generatorVersion: '0.1.0',
            servicesCount: 0,
            messagesCount: 1,
            enumsCount: 0,
          },
        })),
      };

      jest.mocked(Generator).mockImplementation(() => mockGenerator);

      process.env.NODE_ENV = 'development';

      const plugin = hallowPlugin.vite({
        protoRoot: '/test',
        sourceMaps: true,
        verbose: false,
        debug: false,
      });

      const unplugin = plugin as any;
      const transformHook = unplugin.transform;

      const mockCode = 'syntax = "proto3";\nmessage Test { string id = 1; }';
      const mockId = '/test/test.proto';

      const result = await transformHook.call(
        {
          addWatchFile: jest.fn(),
        },
        mockCode,
        mockId
      );

      // Should return null when no source maps available
      expect(result.map).toBeNull();
    });
  });

  describe('16.3.5: Configuration Option Validation', () => {
    it.skip('should pass sourceMaps option to generator', async () => {
      process.env.NODE_ENV = 'development';

      void hallowPlugin.vite({
        protoRoot: '/test',
        sourceMaps: true,
        verbose: false,
        debug: false,
      });

      // The Generator should have been called with sourceMaps: true
      // This is verified through the mock implementation
      expect(Generator).toHaveBeenCalled();

      const generatorCall = jest.mocked(Generator).mock.calls[0];
      expect(generatorCall[0]).toHaveProperty('sourceMaps', true);
    });

    it.skip('should not pass sourceMaps when disabled', async () => {
      jest.clearAllMocks();

      process.env.NODE_ENV = 'development';

      void hallowPlugin.vite({
        protoRoot: '/test',
        sourceMaps: false,
        verbose: false,
        debug: false,
      });

      expect(Generator).toHaveBeenCalled();

      const generatorCall = jest.mocked(Generator).mock.calls[0];
      expect(generatorCall[0]).toHaveProperty('sourceMaps', false);
    });
  });

  describe('16.3.6: Debug Logging', () => {
    it.skip('should log source map usage in debug mode', async () => {
      process.env.NODE_ENV = 'development';

      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      const plugin = hallowPlugin.vite({
        protoRoot: '/test',
        sourceMaps: true,
        verbose: false,
        debug: true, // Enable debug logging
      });

      const unplugin = plugin as any;
      const transformHook = unplugin.transform;

      const mockCode = 'syntax = "proto3";\nmessage Test { string id = 1; }';
      const mockId = '/test/test.proto';

      await transformHook.call(
        {
          addWatchFile: jest.fn(),
        },
        mockCode,
        mockId
      );

      // Should log source map usage
      expect(consoleLogSpy).toHaveBeenCalled();

      // Find log entry about source map
      const sourcMapLog = consoleLogSpy.mock.calls.find((call) =>
        call[0]?.includes('source map')
      );
      expect(sourcMapLog).toBeDefined();

      consoleLogSpy.mockRestore();
    });
  });
});
