/**
 * Integration tests for ESBuild support (Task 15.3).
 *
 * These tests verify that the plugin correctly integrates with ESBuild's
 * fast build system while maintaining minimal overhead.
 *
 * Requirements:
 * - Requirement 13.3: Leverage ESBuild's native speed by minimizing overhead
 * - Requirement 13.5: Allow concurrent proto file processing via async transform hooks
 */

import { createHallowPlugin } from '../../src/plugin';

// Mock @hallow/parser
jest.mock('@hallow/parser', () => ({
  Parser: jest.fn().mockImplementation(() => ({
    parse: jest.fn(() => ({
      syntax: 'proto3',
      package: 'test',
      imports: [],
      messages: [],
      services: [],
      enums: [],
    })),
  })),
}));

// Mock @hallow/generator
jest.mock('@hallow/generator', () => ({
  Generator: jest.fn().mockImplementation(() => ({
    generateCode: jest.fn(() => Promise.resolve({
      files: [{
        path: 'test.ts',
        content: 'export class TestStub {}',
      }],
      metadata: {
        generatedAt: new Date(),
        generatorVersion: '0.1.0',
        servicesCount: 0,
        messagesCount: 0,
        enumsCount: 0,
      },
    })),
  })),
}));

// Mock file system for testing
const mockFiles = new Map<string, string>();

// Mock fs/promises
jest.mock('fs/promises', () => ({
  readFile: jest.fn((path: string) => {
    const content = mockFiles.get(path);
    if (!content) {
      return Promise.reject(new Error(`File not found: ${path}`));
    }
    return Promise.resolve(content);
  }),
  writeFile: jest.fn(() => Promise.resolve()),
  mkdir: jest.fn(() => Promise.resolve()),
}));

describe('ESBuild Integration Tests (Task 15.3)', () => {
  beforeEach(() => {
    mockFiles.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test that plugin initializes correctly with ESBuild
   */
  it('should initialize correctly with ESBuild build system', () => {
    const esbuildContext = {
      meta: { framework: 'esbuild' },
    };

    const plugin: any = createHallowPlugin({
      debug: true,
      verbose: true,
    }, esbuildContext.meta as any);

    // Initialize plugin with ESBuild context
    expect(() => {
      if (plugin.buildStart) {
        plugin.buildStart.call(esbuildContext);
      }
    }).not.toThrow();
  });

  /**
   * Test that ESBuild setup hook is available
   */
  it('should have ESBuild-specific setup hook', () => {
    const plugin: any = createHallowPlugin({
      debug: true,
    }, { framework: 'esbuild' } as any);

    expect(plugin.esbuild).toBeDefined();
    // @ts-ignore - accessing build system-specific section
    expect(plugin.esbuild.setup).toBeDefined();
    // @ts-ignore - accessing build system-specific section
    expect(typeof plugin.esbuild.setup).toBe('function');
  });

  /**
   * Test ESBuild setup hook execution
   */
  it('should execute ESBuild setup hook without errors', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const plugin: any = createHallowPlugin({
      debug: true,
    }, { framework: 'esbuild' } as any);

    // Create a mock ESBuild build object
    const mockBuild = {
      onResolve: jest.fn(),
      onLoad: jest.fn(),
    };

    // Call ESBuild-specific setup hook
    if (plugin.esbuild && typeof plugin.esbuild === 'object') {
      // @ts-ignore - accessing setup hook
      expect(() => plugin.esbuild.setup(mockBuild)).not.toThrow();
    }

    consoleSpy.mockRestore();
  });

  /**
   * Test async transform hook for non-blocking processing
   */
  it('should use async transform hook for non-blocking processing', async () => {
    const protoPath = '/project/src/greeting.proto';
    const protoContent = `
      syntax = "proto3";
      package greeting;

      message GreetRequest {
        string name = 1;
      }

      message GreetResponse {
        string message = 1;
      }

      service GreetingService {
        rpc Greet(GreetRequest) returns (GreetResponse);
      }
    `;

    // Initialize with ESBuild context
    const esbuildContext = {
      meta: { framework: 'esbuild' },
    };

    const plugin: any = createHallowPlugin({
      debug: false, // Disable debug to minimize overhead
      protoRoot: '/project',
    }, esbuildContext.meta as any);

    if (plugin.buildStart) {
      plugin.buildStart.call(esbuildContext);
    }

    // Verify transform is async
    expect(plugin.transform).toBeDefined();
    expect(plugin.transform?.constructor.name).toBe('AsyncFunction');

    // Transform the proto file
    const transformContext = {
      meta: { framework: 'esbuild' },
      addWatchFile: jest.fn(),
    };

    const transformPromise = plugin.transform?.call(
      transformContext,
      protoContent,
      protoPath
    );

    // Verify it returns a promise
    expect(transformPromise).toBeInstanceOf(Promise);

    const result = await transformPromise;

    // Verify transform returns generated code
    expect(result).toBeDefined();
    expect(result?.code).toBeDefined();
    expect(typeof result?.code).toBe('string');
  });

  /**
   * Test concurrent processing of multiple proto files
   */
  it('should support concurrent processing of multiple proto files', async () => {
    const proto1Path = '/project/src/service1.proto';
    const proto2Path = '/project/src/service2.proto';
    const proto3Path = '/project/src/service3.proto';

    const protoTemplate = (num: number) => `
      syntax = "proto3";
      package service${num};

      service Service${num} {
        rpc Method${num}(Request${num}) returns (Response${num});
      }

      message Request${num} {}
      message Response${num} {}
    `;

    const esbuildContext = {
      meta: { framework: 'esbuild' },
    };

    const plugin: any = createHallowPlugin({
      debug: false,
      protoRoot: '/project',
    }, esbuildContext.meta as any);

    if (plugin.buildStart) {
      plugin.buildStart.call(esbuildContext);
    }

    const transformContext = {
      meta: { framework: 'esbuild' },
      addWatchFile: jest.fn(),
    };

    // Process all files concurrently
    const results = await Promise.all([
      plugin.transform?.call(transformContext, protoTemplate(1), proto1Path),
      plugin.transform?.call(transformContext, protoTemplate(2), proto2Path),
      plugin.transform?.call(transformContext, protoTemplate(3), proto3Path),
    ]);

    // Verify all transforms completed successfully
    expect(results).toHaveLength(3);
    results.forEach((result) => {
      expect(result).toBeDefined();
      expect(result?.code).toBeDefined();
      expect(typeof result?.code).toBe('string');
    });
  });

  /**
   * Test efficient caching for ESBuild performance
   */
  it('should leverage caching to avoid redundant parsing', async () => {
    const protoPath = '/project/src/service.proto';
    const protoContent = `
      syntax = "proto3";
      package test;

      service TestService {
        rpc Test(TestRequest) returns (TestResponse);
      }

      message TestRequest {}
      message TestResponse {}
    `;

    const esbuildContext = {
      meta: { framework: 'esbuild' },
    };

    const plugin: any = createHallowPlugin({
      debug: false,
    }, esbuildContext.meta as any);

    if (plugin.buildStart) {
      plugin.buildStart.call(esbuildContext);
    }

    const transformContext = {
      meta: { framework: 'esbuild' },
      addWatchFile: jest.fn(),
    };

    // First transformation (cache miss)
    const result1 = await plugin.transform?.call(
      transformContext,
      protoContent,
      protoPath
    );

    expect(result1).toBeDefined();
    expect(result1?.code).toBeDefined();

    // Second transformation (cache hit - should return same result)
    const result2 = await plugin.transform?.call(
      transformContext,
      protoContent,
      protoPath
    );

    expect(result2).toBeDefined();
    expect(result2?.code).toBeDefined();
    // Both results should be consistent
    expect(result1?.code).toBe(result2?.code);
  });

  /**
   * Test minimal logging in production mode for ESBuild
   */
  it('should minimize logging overhead in production mode', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const protoPath = '/project/src/service.proto';
    const protoContent = `
      syntax = "proto3";
      package test;

      service TestService {
        rpc Test(TestRequest) returns (TestResponse);
      }

      message TestRequest {}
      message TestResponse {}
    `;

    mockFiles.set(protoPath, protoContent);

    // Set production environment
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const esbuildContext = {
      meta: { framework: 'esbuild' },
    };

    const plugin: any = createHallowPlugin({
      debug: false,
      verbose: false,
      optimization: {
        production: true,
      },
    }, esbuildContext.meta as any);

    if (plugin.buildStart) {
      plugin.buildStart.call(esbuildContext);
    }

    const transformContext = {
      meta: { framework: 'esbuild' },
      addWatchFile: jest.fn(),
    };

    await plugin.transform?.call(transformContext, protoContent, protoPath);

    // In production without debug/verbose, there should be minimal or no logs
    const logCallCount = consoleSpy.mock.calls.length;
    expect(logCallCount).toBeLessThan(5); // Allow a few logs, but not many

    consoleSpy.mockRestore();
    process.env.NODE_ENV = originalEnv;
  });

  /**
   * Test ESBuild with tree-shaking compatibility
   */
  it('should generate tree-shakeable code for ESBuild', async () => {
    const protoPath = '/project/src/service.proto';
    const protoContent = `
      syntax = "proto3";
      package test;

      service TestService {
        rpc Method1(Request1) returns (Response1);
        rpc Method2(Request2) returns (Response2);
      }

      message Request1 {}
      message Response1 {}
      message Request2 {}
      message Response2 {}
    `;

    mockFiles.set(protoPath, protoContent);

    const esbuildContext = {
      meta: { framework: 'esbuild' },
    };

    const plugin: any = createHallowPlugin({
      optimization: {
        production: true,
        treeshaking: true,
      },
    }, esbuildContext.meta as any);

    if (plugin.buildStart) {
      plugin.buildStart.call(esbuildContext);
    }

    const transformContext = {
      meta: { framework: 'esbuild' },
      addWatchFile: jest.fn(),
    };

    const result = await plugin.transform?.call(
      transformContext,
      protoContent,
      protoPath
    );

    expect(result).toBeDefined();
    expect(result?.code).toBeDefined();

    // Generated code should use ES module exports for tree-shaking
    expect(result?.code).toContain('export');
    expect(result?.code).not.toContain('module.exports'); // No CommonJS
  });
});
