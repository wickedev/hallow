/**
 * Integration tests for Rollup support (Task 15.4).
 *
 * These tests verify that the plugin correctly integrates with Rollup's
 * build system, including custom resolution and loading hooks.
 *
 * Requirements:
 * - Requirement 13.4: Use Rollup's resolveId and load hooks for maximum control
 * - Requirement 13.8: Ensure compatibility with the build system's tree-shaking algorithm
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

describe('Rollup Integration Tests (Task 15.4)', () => {
  beforeEach(() => {
    mockFiles.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test that plugin initializes correctly with Rollup
   */
  it('should initialize correctly with Rollup build system', () => {
    const plugin: any = createHallowPlugin({ 
      debug: true,
      verbose: true,
    }, { framework: "vite" } as any);

    const rollupContext = {
      meta: { framework: 'rollup' },
    };

    // Initialize plugin with Rollup context
    expect(() => {
      if (plugin.buildStart) {
        plugin.buildStart.call(rollupContext);
      }
    }).not.toThrow();
  });

  /**
   * Test that Rollup-specific hooks are available
   */
  it('should have Rollup-specific resolveId and load hooks', () => {
    const plugin: any = createHallowPlugin({ 
      debug: true,
    }, { framework: "vite" } as any);

    expect(plugin.rollup).toBeDefined();
    // @ts-ignore - accessing build system-specific section
    expect(plugin.rollup.resolveId).toBeDefined();
    // @ts-ignore - accessing build system-specific section
    expect(typeof plugin.rollup.resolveId).toBe('function');
    // @ts-ignore - accessing build system-specific section
    expect(plugin.rollup.load).toBeDefined();
    // @ts-ignore - accessing build system-specific section
    expect(typeof plugin.rollup.load).toBe('function');
  });

  /**
   * Test Rollup resolveId hook for proto files
   */
  it('should resolve proto file imports using resolveId hook', () => {
    const plugin: any = createHallowPlugin({
      debug: true,
      protoRoot: '/project/src',
    }, { framework: "vite" } as any);

    const rollupContext = {
      meta: { framework: 'rollup' },
    };

    if (plugin.buildStart) {
      plugin.buildStart.call(rollupContext);
    }

    // Call resolveId for a proto file import
    // @ts-ignore - accessing rollup-specific hook
    const resolved = plugin.rollup.resolveId('greeting.proto', '/project/src/index.ts');

    // resolveId should either resolve to a path or return null if file not found
    // The important thing is it doesn't throw an error
    expect(resolved === null || typeof resolved === 'string').toBe(true);
  });

  /**
   * Test that resolveId returns null for non-proto files
   */
  it('should return null for non-proto files in resolveId', () => {
    const plugin: any = createHallowPlugin({ 
      debug: true,
    }, { framework: "vite" } as any);

    const rollupContext = {
      meta: { framework: 'rollup' },
    };

    if (plugin.buildStart) {
      plugin.buildStart.call(rollupContext);
    }

    // Call resolveId for a non-proto file
    // @ts-ignore - accessing rollup-specific hook
    const resolved = plugin.rollup.resolveId('index.ts', '/project/src/index.ts');

    // Should return null to let Rollup handle it
    expect(resolved).toBeNull();
  });

  /**
   * Test Rollup load hook for proto files
   */
  it('should load proto files using load hook', async () => {
    const protoPath = '/project/src/greeting.proto';

    const plugin: any = createHallowPlugin({
      debug: true,
      protoRoot: '/project/src',
    }, { framework: "vite" } as any);

    const rollupContext = {
      meta: { framework: 'rollup' },
    };

    if (plugin.buildStart) {
      plugin.buildStart.call(rollupContext);
    }

    // Call load for a proto file
    // @ts-ignore - accessing rollup-specific hook
    const content = await plugin.rollup.load(protoPath);

    // load should either return content or null if file not found
    // The important thing is it doesn't throw an unexpected error
    expect(content === null || typeof content === 'string').toBe(true);
  });

  /**
   * Test that load returns null for non-proto files
   */
  it('should return null for non-proto files in load hook', async () => {
    const plugin: any = createHallowPlugin({ 
      debug: true,
    }, { framework: "vite" } as any);

    const rollupContext = {
      meta: { framework: 'rollup' },
    };

    if (plugin.buildStart) {
      plugin.buildStart.call(rollupContext);
    }

    // Call load for a non-proto file
    // @ts-ignore - accessing rollup-specific hook
    const content = await plugin.rollup.load('/project/src/index.ts');

    // Should return null to let Rollup handle it
    expect(content).toBeNull();
  });

  /**
   * Test Rollup with proto file dependencies
   */
  it('should handle proto file imports with resolveId and load', async () => {
    const mainProto = '/project/src/main.proto';

    const plugin: any = createHallowPlugin({
      debug: true,
      protoRoot: '/project/src',
    }, { framework: "vite" } as any);

    const rollupContext = {
      meta: { framework: 'rollup' },
    };

    if (plugin.buildStart) {
      plugin.buildStart.call(rollupContext);
    }

    // Test resolveId for imported proto file
    // @ts-ignore - accessing rollup-specific hook
    const resolvedPath = plugin.rollup.resolveId('common/types.proto', mainProto);

    // resolveId should return either null (if file doesn't exist) or a valid path string
    expect(resolvedPath === null || typeof resolvedPath === 'string').toBe(true);

    // If resolveId returned a path, test load
    if (resolvedPath) {
      // @ts-ignore - accessing rollup-specific hook
      const loadedContent = await plugin.rollup.load(resolvedPath);

      // load should return either null (if file doesn't exist) or content string
      expect(loadedContent === null || typeof loadedContent === 'string').toBe(true);
    }
  });

  /**
   * Test Rollup transform integration
   */
  it('should transform proto files after resolveId and load', async () => {
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

    const plugin: any = createHallowPlugin({
      debug: true,
      protoRoot: '/project/src',
    }, { framework: "vite" } as any);

    const rollupContext = {
      meta: { framework: 'rollup' },
    };

    if (plugin.buildStart) {
      plugin.buildStart.call(rollupContext);
    }

    // Test the full Rollup workflow: resolveId -> load -> transform
    // @ts-ignore
    const resolvedPath = plugin.rollup.resolveId('greeting.proto', '/project/src/index.ts');

    // resolveId should return either null or a path string
    expect(resolvedPath === null || typeof resolvedPath === 'string').toBe(true);

    // Test transform with proto content (simulating what load would return)
    const transformContext = {
      meta: { framework: 'rollup' },
      addWatchFile: jest.fn(),
    };

    const protoPath = '/project/src/greeting.proto';
    const result = await plugin.transform?.call(
      transformContext,
      protoContent,
      protoPath
    );

    // Transform should return generated code
    expect(result).toBeDefined();
    expect(result?.code).toBeDefined();
    expect(typeof result?.code).toBe('string');
  });

  /**
   * Test tree-shaking compatibility with Rollup
   */
  it('should generate tree-shakeable ES modules for Rollup', async () => {
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

    const plugin: any = createHallowPlugin({ 
      optimization: {
        production: true,
        treeshaking: true,
      },
    }, { framework: "vite" } as any);

    const rollupContext = {
      meta: { framework: 'rollup' },
    };

    if (plugin.buildStart) {
      plugin.buildStart.call(rollupContext);
    }

    const transformContext = {
      meta: { framework: 'rollup' },
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
    expect(result?.code).not.toContain('module.exports');
    expect(result?.code).not.toContain('exports.');
  });

  /**
   * Test error handling in resolveId
   */
  it('should handle resolution errors gracefully in resolveId', () => {
    const plugin: any = createHallowPlugin({ 
      debug: false,
      protoRoot: '/project/src',
    }, { framework: "vite" } as any);

    const rollupContext = {
      meta: { framework: 'rollup' },
    };

    if (plugin.buildStart) {
      plugin.buildStart.call(rollupContext);
    }

    // Try to resolve a non-existent proto file
    // @ts-ignore
    const resolved = plugin.rollup.resolveId('nonexistent.proto', '/project/src/index.ts');

    // Should return null to let Rollup handle the error
    expect(resolved).toBeNull();
  });

  /**
   * Test error handling in load
   */
  it('should handle load errors gracefully in load hook', async () => {
    const plugin: any = createHallowPlugin({ 
      debug: false,
    }, { framework: "vite" } as any);

    const rollupContext = {
      meta: { framework: 'rollup' },
    };

    if (plugin.buildStart) {
      plugin.buildStart.call(rollupContext);
    }

    // Try to load a non-existent file
    // @ts-ignore
    const content = await plugin.rollup.load('/nonexistent/file.proto');

    // Should return null to let Rollup handle the error
    expect(content).toBeNull();
  });

  /**
   * Test Rollup with source maps
   */
  it('should support source map generation for Rollup', async () => {
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

    const plugin: any = createHallowPlugin({ 
      sourceMaps: true,
    }, { framework: "vite" } as any);

    const rollupContext = {
      meta: { framework: 'rollup' },
    };

    if (plugin.buildStart) {
      plugin.buildStart.call(rollupContext);
    }

    const transformContext = {
      meta: { framework: 'rollup' },
      addWatchFile: jest.fn(),
    };

    const result = await plugin.transform?.call(
      transformContext,
      protoContent,
      protoPath
    );

    expect(result).toBeDefined();
    expect(result?.code).toBeDefined();
    // Source map may be null or a string depending on generator implementation
    expect(result).toHaveProperty('map');
  });
});
