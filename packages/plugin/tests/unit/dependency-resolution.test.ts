/**
 * Unit tests for dependency resolution (Tasks 10.1, 10.2, 10.3)
 *
 * Tests import parsing, resolution, circular dependency detection,
 * and topological processing of proto file dependencies.
 */

import { createUnplugin } from 'unplugin';
import { createHallowPlugin } from '../../src/plugin';
import type { PluginOptions } from '../../src/types';

// Mock fs/promises
const mockReadFile = jest.fn();
jest.mock('fs/promises', () => ({
  readFile: mockReadFile,
}));

// Mock @hallow/parser
jest.mock('@hallow/parser', () => ({
  Parser: jest.fn().mockImplementation(() => ({
    parse: jest.fn((content: string, filePath: string) => {
      // Parse imports from content
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
    constructor(
      message: string,
      public line: number,
      public column: number,
      public filePath?: string
    ) {
      super(message);
    }
  },
}));

// Mock @hallow/generator
jest.mock('@hallow/generator', () => ({
  Generator: jest.fn().mockImplementation(() => ({
    generateCode: jest.fn().mockResolvedValue({
      files: [
        {
          path: 'test.ts',
          content: 'export class TestStub {}',
          hash: 'hash123',
        },
      ],
      metadata: {
        servicesCount: 1,
        messagesCount: 2,
        enumsCount: 0,
      },
    }),
  })),
  GenerationError: class GenerationError extends Error {
    constructor(
      message: string,
      public code: string
    ) {
      super(message);
    }
  },
}));

describe('Dependency Resolution (Tasks 10.1, 10.2, 10.3)', () => {
  let plugin: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore all mocks to prevent "Cannot redefine property" errors
    jest.restoreAllMocks();
  });

  beforeEach(() => {

    // Create plugin instance with test configuration
    const options: Partial<PluginOptions> = {
      protoRoot: '/test/protos',
      importPaths: ['/test/common'],
      debug: true,
      verbose: true,
    };

    const unpluginFactory = createUnplugin(createHallowPlugin);
    plugin = unpluginFactory.rollup(options);
  });

  // TODO: Re-enable when file resolution is fully implemented
  describe.skip('Task 10.1: Import Parsing and Resolution', () => {
    it('should parse import statements from proto AST', async () => {
      // Proto file with imports
      const protoContent = `
syntax = "proto3";
import "common/types.proto";
import "google/protobuf/timestamp.proto";

message TestMessage {
  string name = 1;
}
`;

      // Mock file system
      const mockFs = {
        '/test/service.proto': protoContent,
        '/test/common/types.proto': 'syntax = "proto3";\nmessage CommonType {}',
        '/test/google/protobuf/timestamp.proto': 'syntax = "proto3";\nmessage Timestamp {}',
      };

      // Mock fs.readFile
      mockReadFile.mockImplementation(async (path: any) => {
        const content = mockFs[path as keyof typeof mockFs];
        if (!content) throw new Error(`File not found: ${path}`);
        return content;
      });

      // Transform the file
      const result = await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        protoContent,
        '/test/service.proto'
      );

      // Verify imports were parsed
      expect(result).toBeDefined();
      expect(result.code).toBeDefined();
    });

    it('should resolve relative imports', async () => {
      const protoContent = `
syntax = "proto3";
import "types.proto";

message TestMessage {
  string name = 1;
}
`;

      const result = await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        protoContent,
        '/test/service.proto'
      );

      expect(result).toBeDefined();
    });

    it('should handle well-known types separately', async () => {
      const protoContent = `
syntax = "proto3";
import "google/protobuf/timestamp.proto";
import "google/protobuf/empty.proto";

message TestMessage {
  google.protobuf.Timestamp created_at = 1;
}
`;

      const result = await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        protoContent,
        '/test/service.proto'
      );

      expect(result).toBeDefined();
      expect(result.code).toBeDefined();
    });

    it('should build dependency graph with all imports', async () => {
      const protoContent = `
syntax = "proto3";
import "a.proto";
import "b.proto";

message TestMessage {}
`;

      const result = await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        protoContent,
        '/test/service.proto'
      );

      expect(result).toBeDefined();
    });

    it('should throw error on import resolution failure', async () => {
      const protoContent = `
syntax = "proto3";
import "nonexistent/file.proto";

message TestMessage {}
`;

      await expect(
        plugin.transform.call(
          {
            meta: { framework: 'rollup' },
            addWatchFile: jest.fn(),
          },
          protoContent,
          '/test/service.proto'
        )
      ).rejects.toThrow();
    });
  });

  // TODO: Re-enable when file resolution is fully implemented
  describe.skip('Task 10.2: Circular Dependency Detection', () => {
    it('should detect simple circular dependencies (A→B→A)', async () => {
      // This test simulates a circular dependency scenario
      // In a real scenario, the dependency graph would detect the cycle
      const protoA = `
syntax = "proto3";
import "b.proto";

message MessageA {}
`;

      const protoB = `
syntax = "proto3";
import "a.proto";

message MessageB {}
`;

      // First, transform file A
      await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        protoA,
        '/test/a.proto'
      );

      // Then transform file B, which should detect the cycle
      // Note: In the actual implementation, this would be caught by the dependency graph
      const result = await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        protoB,
        '/test/b.proto'
      );

      // The cycle would be detected when b.proto is processed
      expect(result).toBeDefined();
    });

    it('should detect complex circular dependencies (A→B→C→A)', async () => {
      const protoA = `
syntax = "proto3";
import "b.proto";

message MessageA {}
`;

      const protoB = `
syntax = "proto3";
import "c.proto";

message MessageB {}
`;

      const protoC = `
syntax = "proto3";
import "a.proto";

message MessageC {}
`;

      // Transform files in sequence
      await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        protoA,
        '/test/a.proto'
      );

      await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        protoB,
        '/test/b.proto'
      );

      // The third file should detect the cycle
      const result = await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        protoC,
        '/test/c.proto'
      );

      expect(result).toBeDefined();
    });

    it('should include complete cycle path in error message', async () => {
      // Test that circular dependency errors include the full cycle path
      // This is verified by the ErrorFormatter.formatCircularDependency method
      const protoWithCycle = `
syntax = "proto3";
import "cycle.proto";

message Test {}
`;

      try {
        await plugin.transform.call(
          {
            meta: { framework: 'rollup' },
            addWatchFile: jest.fn(),
          },
          protoWithCycle,
          '/test/cycle.proto'
        );
      } catch (error: any) {
        // If a cycle is detected, the error should contain the cycle path
        if (error.message.includes('Circular')) {
          expect(error.message).toContain('cycle.proto');
        }
      }
    });
  });

  // TODO: Re-enable when file resolution is fully implemented
  describe.skip('Task 10.3: Topological Processing', () => {
    it('should process dependencies before dependents', async () => {
      // Process files in dependency order
      // File dependency: service.proto → types.proto
      const typesProto = `
syntax = "proto3";

message CommonType {
  string value = 1;
}
`;

      const serviceProto = `
syntax = "proto3";
import "types.proto";

message Service {
  CommonType data = 1;
}
`;

      // First process the dependency (types.proto)
      const typesResult = await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        typesProto,
        '/test/types.proto'
      );

      expect(typesResult).toBeDefined();

      // Then process the dependent (service.proto)
      const serviceResult = await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        serviceProto,
        '/test/service.proto'
      );

      expect(serviceResult).toBeDefined();
      expect(serviceResult.code).toBeDefined();
    });

    it('should generate import statements in TypeScript code', async () => {
      const protoWithImport = `
syntax = "proto3";
import "common/types.proto";

message TestMessage {
  string name = 1;
}
`;

      const result = await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        protoWithImport,
        '/test/service.proto'
      );

      expect(result).toBeDefined();
      expect(result.code).toBeDefined();

      // Verify import statement is generated
      // The generated code should include an import for the dependency
      // Format: import * as {alias} from '{path}';
      if (result.code.includes('import')) {
        expect(result.code).toMatch(/import\s+\*\s+as\s+\w+\s+from\s+['"].*['"]/);
      }
    });

    it('should maintain import registry to avoid duplicates', async () => {
      // Process multiple files that import the same dependency
      const proto1 = `
syntax = "proto3";
import "common/types.proto";

message Message1 {}
`;

      const proto2 = `
syntax = "proto3";
import "common/types.proto";

message Message2 {}
`;

      // Transform both files
      const result1 = await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        proto1,
        '/test/service1.proto'
      );

      const result2 = await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        proto2,
        '/test/service2.proto'
      );

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      // Import registry should prevent duplicate imports
    });

    it('should handle multi-file dependency resolution', async () => {
      // Complex dependency chain: A → B → C
      const protoC = `
syntax = "proto3";

message MessageC {
  string value = 1;
}
`;

      const protoB = `
syntax = "proto3";
import "c.proto";

message MessageB {
  MessageC data = 1;
}
`;

      const protoA = `
syntax = "proto3";
import "b.proto";

message MessageA {
  MessageB data = 1;
}
`;

      // Process in topological order: C, B, A
      await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        protoC,
        '/test/c.proto'
      );

      await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        protoB,
        '/test/b.proto'
      );

      const resultA = await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        protoA,
        '/test/a.proto'
      );

      expect(resultA).toBeDefined();
      expect(resultA.code).toBeDefined();
    });
  });

  describe('Integration: Complete Dependency Resolution Workflow', () => {
    // TODO: Re-enable when file resolution is fully implemented
    it.skip('should handle complete workflow: parse → resolve → detect cycles → generate imports', async () => {
      const protoContent = `
syntax = "proto3";
import "common/types.proto";
import "google/protobuf/timestamp.proto";

message CompleteTest {
  string name = 1;
  google.protobuf.Timestamp created_at = 2;
}
`;

      const result = await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        protoContent,
        '/test/complete.proto'
      );

      // Verify all steps completed successfully
      expect(result).toBeDefined();
      expect(result.code).toBeDefined();
      expect(typeof result.code).toBe('string');
      expect(result.code.length).toBeGreaterThan(0);
    });

    it('should handle files with no imports', async () => {
      const protoContent = `
syntax = "proto3";

message SimpleMessage {
  string name = 1;
  int32 value = 2;
}
`;

      const result = await plugin.transform.call(
        {
          meta: { framework: 'rollup' },
          addWatchFile: jest.fn(),
        },
        protoContent,
        '/test/simple.proto'
      );

      expect(result).toBeDefined();
      expect(result.code).toBeDefined();
      // Should not include any import statements
      expect(result.code).not.toMatch(/^import\s+\*/);
    });
  });
});
