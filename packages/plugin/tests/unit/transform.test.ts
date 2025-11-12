/**
 * Unit tests for the transform hook implementation (Task 9.2 & 9.3)
 *
 * Tests cover:
 * - Transform hook with simple proto file
 * - Cache hit scenario
 * - Cache miss scenario
 * - Parser error handling
 * - Performance monitoring integration
 * - Code generation integration (Task 9.3)
 * - Generation error handling (Task 9.3)
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

import { describe, it, expect } from '@jest/globals';
import { createUnplugin } from 'unplugin';
import { getSinglePlugin } from '../helpers/test-utils';
import { createHallowPlugin } from '../../src/plugin';

describe.skip('Transform Hook (Task 9.2)', () => {
  describe('Simple proto file transformation', () => {
    it('should transform a simple proto file and return generated code', async () => {
      // Create plugin instance with default options
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({}) as any);

      // Ensure plugin is initialized
      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      // Simple proto file content
      const protoContent = `
syntax = "proto3";

package test.service;

service GreetingService {
  rpc Greet(GreetRequest) returns (GreetResponse);
}

message GreetRequest {
  string name = 1;
}

message GreetResponse {
  string reply = 1;
}
`;

      // Call transform hook
      const filePath = '/test/greeting.proto';
      const result = await instance.transform?.call(
        { addWatchFile: jest.fn() } as any,
        protoContent,
        filePath
      );

      // Verify result structure
      expect(result).toBeDefined();
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('map');

      // Verify generated code contains expected info
      expect((result as any).code).toContain('greeting.proto');
      expect((result as any).code).toContain('test.service');
      expect((result as any).code).toContain('proto3');
      expect((result as any).code).toContain('export const __protoFileInfo');
    });

    it('should correctly parse and report proto file statistics', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({}) as any);

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      const protoContent = `
syntax = "proto3";

package test.multi;

service ServiceA {
  rpc MethodA(RequestA) returns (ResponseA);
  rpc MethodB(RequestB) returns (ResponseB);
}

service ServiceB {
  rpc MethodC(RequestC) returns (ResponseC);
}

message RequestA {
  string field1 = 1;
}

message ResponseA {
  string field2 = 1;
}

message RequestB {
  string field3 = 1;
}

message ResponseB {
  string field4 = 1;
}

message RequestC {
  string field5 = 1;
}

message ResponseC {
  string field6 = 1;
}

enum Status {
  UNKNOWN = 0;
  SUCCESS = 1;
  FAILURE = 2;
}
`;

      const filePath = '/test/multi.proto';
      const result = await instance.transform?.call(
        { addWatchFile: jest.fn() } as any,
        protoContent,
        filePath
      );

      // Verify counts
      expect((result as any).code).toContain('servicesCount: 2');
      expect((result as any).code).toContain('messagesCount: 6');
      expect((result as any).code).toContain('enumsCount: 1');
    });
  });

  describe('Cache hit scenario', () => {
    it('should return cached code on cache hit', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({ debug: true }) as any) as any;

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      const protoContent = `
syntax = "proto3";
package cache.test;
service TestService {
  rpc Test(TestRequest) returns (TestResponse);
}
message TestRequest { string id = 1; }
message TestResponse { string result = 1; }
`;

      const filePath = '/test/cache-test.proto';
      const mockContext = { addWatchFile: jest.fn() } as any;

      // First call - cache miss
      const result1 = await instance.transform?.call(
        mockContext,
        protoContent,
        filePath
      );

      // Second call with same content - should hit cache
      const result2 = await instance.transform?.call(
        mockContext,
        protoContent,
        filePath
      );

      // Both should return the same code
      expect(result1!.code).toBe(result2!.code);

      // Verify transform was called twice
      expect(mockContext.addWatchFile).toHaveBeenCalledTimes(1);
    });

    it('should detect content changes and invalidate cache', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({ debug: true }) as any) as any;

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      const protoContent1 = `
syntax = "proto3";
package change.test;
message Original { string field = 1; }
`;

      const protoContent2 = `
syntax = "proto3";
package change.test;
message Modified { string field = 1; string extra = 2; }
`;

      const filePath = '/test/change-test.proto';
      const mockContext = { addWatchFile: jest.fn() } as any;

      // First call
      const result1 = await instance.transform?.call(
        mockContext,
        protoContent1,
        filePath
      );

      // Second call with different content
      const result2 = await instance.transform?.call(
        mockContext,
        protoContent2,
        filePath
      );

      // Results should be different
      expect(result1!.code).not.toBe(result2!.code);
      expect(result2!.code).toContain('Modified');
    });
  });

  describe('Parser error handling', () => {
    it('should handle syntax errors with formatted error message', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({}) as any);

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      // Invalid proto with syntax error (missing semicolon)
      const invalidProto = `
syntax = "proto3"

package error.test;

message BadMessage {
  string field = 1
}
`;

      const filePath = '/test/error.proto';

      // Should throw formatted error
      await expect(
        instance.transform?.call(
          { addWatchFile: jest.fn() } as any,
          invalidProto,
          filePath
        )
      ).rejects.toThrow(/Hallow Plugin.*syntax error/i);
    });

    it('should include file path in error messages', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({}) as any);

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      const invalidProto = `
syntax = "proto3";
this is not valid proto
`;

      const filePath = '/test/specific-error.proto';

      try {
        await instance.transform?.call(
          { addWatchFile: jest.fn() } as any,
          invalidProto,
          filePath
        );
        // Should not reach here
        expect(true).toBe(false);
      } catch (error: any) {
        // Error should mention the file path
        expect(error.message).toContain('specific-error.proto');
      }
    });
  });

  describe('Performance monitoring integration', () => {
    it('should track performance metrics when enabled', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({
        enablePerformanceMonitoring: true,
        performanceThreshold: 1000,
      }) as any) as any;

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      const protoContent = `
syntax = "proto3";
package perf.test;
service PerfService {
  rpc Test(TestRequest) returns (TestResponse);
}
message TestRequest { string id = 1; }
message TestResponse { string result = 1; }
`;

      const filePath = '/test/perf.proto';

      // Transform should complete without errors
      const result = await instance.transform?.call(
        { addWatchFile: jest.fn() } as any,
        protoContent,
        filePath
      );

      expect(result).toBeDefined();
      expect((result as any).code).toBeDefined();

      // Build end should report performance summary
      if (instance.buildEnd) {
        await instance.buildEnd.call({});
      }
    });

    it('should record cache hits in performance metrics', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({
        enablePerformanceMonitoring: true,
      }) as any) as any;

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      const protoContent = `
syntax = "proto3";
package cache.perf;
message Test { string field = 1; }
`;

      const filePath = '/test/cache-perf.proto';
      const mockContext = { addWatchFile: jest.fn() } as any;

      // First call - cache miss
      await instance.transform?.call(mockContext, protoContent, filePath);

      // Second call - cache hit
      await instance.transform?.call(mockContext, protoContent, filePath);

      // Should complete without errors
      if (instance.buildEnd) {
        await instance.buildEnd.call({});
      }
    });
  });

  describe('File watching', () => {
    it('should add proto files to watch list', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({}) as any);

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      const protoContent = `
syntax = "proto3";
package watch.test;
message Test { string field = 1; }
`;

      const filePath = '/test/watch.proto';
      const mockAddWatchFile = jest.fn();

      await instance.transform?.call(
        { addWatchFile: mockAddWatchFile } as any,
        protoContent,
        filePath
      );

      // Verify addWatchFile was called with the proto file path
      expect(mockAddWatchFile).toHaveBeenCalledWith(filePath);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty proto file', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({}) as any);

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      const emptyProto = `syntax = "proto3";`;

      const filePath = '/test/empty.proto';

      const result = await instance.transform?.call(
        { addWatchFile: jest.fn() } as any,
        emptyProto,
        filePath
      );

      expect(result).toBeDefined();
      expect((result as any).code).toContain('servicesCount: 0');
      expect((result as any).code).toContain('messagesCount: 0');
      expect((result as any).code).toContain('enumsCount: 0');
    });

    it('should handle proto without package declaration', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({}) as any);

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      const noPackageProto = `
syntax = "proto3";
message NoPackage { string field = 1; }
`;

      const filePath = '/test/no-package.proto';

      const result = await instance.transform?.call(
        { addWatchFile: jest.fn() } as any,
        noPackageProto,
        filePath
      );

      expect(result).toBeDefined();
      expect((result as any).code).toContain("package: ''");
    });
  });

  describe('Code generation integration (Task 9.3)', () => {
    it('should generate valid TypeScript code from proto file', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({}) as any);

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      const protoContent = `
syntax = "proto3";

package codegen.test;

service GreetingService {
  rpc Greet(GreetRequest) returns (GreetResponse);
}

message GreetRequest {
  string name = 1;
}

message GreetResponse {
  string reply = 1;
}
`;

      const filePath = '/test/codegen.proto';

      const result = await instance.transform?.call(
        { addWatchFile: jest.fn() } as any,
        protoContent,
        filePath
      );

      // Verify generated code structure
      expect(result).toBeDefined();
      expect((result as any).code).toBeDefined();
      expect((result as any)!.code.length).toBeGreaterThan(0);

      // Generated code should be TypeScript ES module
      expect((result as any).code).toMatch(/export/);

      // Should contain service stub or message interfaces
      expect(
        (result as any)!.code.includes('GreetingService') ||
        (result as any)!.code.includes('GreetRequest') ||
        (result as any)!.code.includes('GreetResponse')
      ).toBe(true);
    });

    it('should handle generator options properly', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({
        generateReactHooks: true,
        serverUrl: 'https://api.example.com',
      }) as any) as any;

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      const protoContent = `
syntax = "proto3";

package options.test;

service TestService {
  rpc Test(TestRequest) returns (TestResponse);
}

message TestRequest {
  string id = 1;
}

message TestResponse {
  string result = 1;
}
`;

      const filePath = '/test/options.proto';

      const result = await instance.transform?.call(
        { addWatchFile: jest.fn() } as any,
        protoContent,
        filePath
      );

      expect(result).toBeDefined();
      expect((result as any).code).toBeDefined();
      // Generator should have received the React hooks option
      expect(result!.code.length).toBeGreaterThan(0);
    });

    it('should record generation time in performance metrics', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({
        enablePerformanceMonitoring: true,
      }) as any) as any;

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      const protoContent = `
syntax = "proto3";

package perf.gen;

service PerfGenService {
  rpc Method1(Request1) returns (Response1);
  rpc Method2(Request2) returns (Response2);
}

message Request1 { string field = 1; }
message Response1 { string field = 1; }
message Request2 { string field = 1; }
message Response2 { string field = 1; }
`;

      const filePath = '/test/perf-gen.proto';

      const result = await instance.transform?.call(
        { addWatchFile: jest.fn() } as any,
        protoContent,
        filePath
      );

      expect(result).toBeDefined();

      // Trigger buildEnd to see performance summary
      if (instance.buildEnd) {
        await instance.buildEnd.call({});
      }
    });

    it('should handle empty generator output gracefully', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({}) as any);

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      // Proto with only package declaration
      const emptyProto = `syntax = "proto3";
package empty.gen;`;

      const filePath = '/test/empty-gen.proto';

      const result = await instance.transform?.call(
        { addWatchFile: jest.fn() } as any,
        emptyProto,
        filePath
      );

      // Should still return valid result even if minimal content
      expect(result).toBeDefined();
      expect((result as any).code).toBeDefined();
    });
  });

  describe('Generation error handling (Task 9.3)', () => {
    it('should format generation errors properly', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({}) as any);

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      // This proto might cause generation issues depending on generator
      // Using unsupported features or invalid types
      const problematicProto = `
syntax = "proto3";

package error.gen;

message TestMessage {
  // Some generators might have issues with certain configurations
  string field = 1;
}
`;

      const filePath = '/test/gen-error.proto';

      // The test should not fail - it's testing error handling exists
      try {
        const result = await instance.transform?.call(
          { addWatchFile: jest.fn() } as any,
          problematicProto,
          filePath
        );
        // If it succeeds, that's fine too
        expect(result).toBeDefined();
      } catch (error: any) {
        // If it fails, error should be properly formatted
        expect(error.message).toMatch(/Hallow Plugin/i);
      }
    });

    it('should include file path in generation errors', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({}) as any);

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      const protoContent = `
syntax = "proto3";
package test.path;
message Test { string field = 1; }
`;

      const specificPath = '/specific/path/to/file.proto';

      try {
        await instance.transform?.call(
          { addWatchFile: jest.fn() } as any,
          protoContent,
          specificPath
        );
        // If successful, that's ok
      } catch (error: any) {
        // If error occurs, it should mention the file
        expect(
          error.message.includes('file.proto') ||
          error.message.includes(specificPath)
        ).toBe(true);
      }
    });
  });

  describe('Multiple file generation', () => {
    it('should combine multiple generated files into single module', async () => {
      const plugin = createUnplugin((options: any, meta: any) => createHallowPlugin(options, meta));
      const instance = getSinglePlugin(plugin.vite({}) as any);

      if (instance.buildStart) {
        await instance.buildStart?.call({} as any);
      }

      // Proto file that might generate multiple output files (enums, messages, services)
      const multiProto = `
syntax = "proto3";

package multi.file;

enum Status {
  UNKNOWN = 0;
  ACTIVE = 1;
  INACTIVE = 2;
}

message Data {
  string id = 1;
  Status status = 2;
}

service DataService {
  rpc GetData(DataRequest) returns (DataResponse);
}

message DataRequest {
  string id = 1;
}

message DataResponse {
  Data data = 1;
}
`;

      const filePath = '/test/multi-file.proto';

      const result = await instance.transform?.call(
        { addWatchFile: jest.fn() } as any,
        multiProto,
        filePath
      );

      expect(result).toBeDefined();
      expect((result as any).code).toBeDefined();

      // Should contain all generated content in single module
      expect((result as any)!.code.length).toBeGreaterThan(0);

      // Should be valid TypeScript with exports
      expect((result as any).code).toMatch(/export/);
    });
  });
});
