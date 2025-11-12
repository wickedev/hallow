/**
 * Comprehensive End-to-End Workflow Tests for @hallow/plugin
 *
 * Task 18.3: E2E Workflow Tests
 *
 * These tests verify complete workflows from proto import to final executable code,
 * testing all components working together in realistic scenarios.
 *
 * Coverage:
 * - Import proto file and verify generated code structure
 * - Multi-file dependencies with topological processing
 * - Cache invalidation on file changes
 * - Production optimization verification
 * - TypeScript autocomplete verification
 * - React hooks generation
 *
 * Non-functional Requirements: Reliability 1, 2, 3
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import * as path from 'path';
import * as fs from 'fs/promises';
import { tmpdir } from 'os';
import { createHallowPlugin } from '../../src/plugin';
import type { PluginOptions } from '../../src/types';
import type { UnpluginContext } from 'unplugin';
import * as ts from 'typescript';

describe.skip('E2E Workflow Tests - Comprehensive', () => {
  let testDir: string;
  // let pluginState: PluginState | null = null;

  beforeEach(async () => {
    // Create unique temporary test directory
    testDir = path.join(tmpdir(), `hallow-e2e-${Date.now()}-${Math.random().toString(36).substring(7)}`);
    await fs.mkdir(testDir, { recursive: true });
    // pluginState = null;
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors in tests
      console.warn('Cleanup error:', error);
    }

    // Reset plugin state
    // pluginState = null;
  });

  /**
   * Helper to create a mock unplugin context for testing
   */
  function createMockContext(_id: string): UnpluginContext {
    const watchedFiles = new Set<string>();

    return {
      addWatchFile: jest.fn((file: string) => {
        watchedFiles.add(file);
      }) as any,
      getWatchedFiles: () => Array.from(watchedFiles),
      warn: jest.fn((message: string) => {
        console.warn('[Mock Context]', message);
      }) as any,
      error: jest.fn((message: string) => {
        console.error('[Mock Context]', message);
      }) as any,
      parse: jest.fn() as any,
      emitFile: jest.fn() as any,
      getModuleInfo: jest.fn() as any,
      resolve: jest.fn() as any,
      load: jest.fn() as any,
      getFileName: jest.fn() as any,
      getModuleIds: jest.fn() as any,
    } as UnpluginContext;
  }

  /**
   * Helper to compile TypeScript code programmatically
   */
  function compileTypeScript(code: string): { success: boolean; diagnostics: readonly ts.Diagnostic[] } {
    const options: ts.CompilerOptions = {
      target: ts.ScriptTarget.ES2020,
      module: ts.ModuleKind.ESNext,
      strict: true,
      noEmit: true,
      skipLibCheck: true,
    };

    const host = ts.createCompilerHost(options);
    const fileName = 'test.ts';

    // Override getSourceFile to provide our code
    const originalGetSourceFile = host.getSourceFile;
    host.getSourceFile = (name, languageVersion) => {
      if (name === fileName) {
        return ts.createSourceFile(fileName, code, ts.ScriptTarget.ES2020, true);
      }
      return originalGetSourceFile.call(host, name, languageVersion);
    };

    const program = ts.createProgram([fileName], options, host);
    const diagnostics = ts.getPreEmitDiagnostics(program);

    return {
      success: diagnostics.length === 0,
      diagnostics,
    };
  }

  describe('E2E-WF-01: Import proto file and verify generated code structure', () => {
    it('should transform proto file into TypeScript code with proper exports', async () => {
      // Test Data Preparation
      const protoContent = `
syntax = "proto3";

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

      const protoPath = path.join(testDir, 'greeting.proto');
      await fs.writeFile(protoPath, protoContent);

      // Configure plugin
      const options: PluginOptions = {
        protoRoot: testDir,
      };

      const pluginFactory: any = createHallowPlugin(options, { framework: 'vite' } as any);
      const context = createMockContext(protoPath);

      // Execute transform
      const result = await pluginFactory.transform?.call(
        context as any,
        protoContent,
        protoPath
      );

      // Verification
      expect(result).toBeDefined();
      expect(result).toHaveProperty('code');

      const code = typeof result === 'string' ? result : (result as any)?.code;
      expect(code).toBeDefined();
      expect(typeof code).toBe('string');

      // Verify exports
      expect(code).toContain('export class GreetingServiceStub');
      expect(code).toContain('export interface GreetRequest');
      expect(code).toContain('export interface GreetResponse');

      // Verify imports
      expect(code).toContain('@hallow/grpc-web');

      // Verify service structure
      expect(code).toContain('methods');
      expect(code).toContain('greet');

      // Verify TypeScript compilation
      const tsResult = compileTypeScript(code);
      expect(tsResult.success).toBe(true);
      if (!tsResult.success) {
        tsResult.diagnostics.forEach(d => {
          console.error('TS Error:', ts.flattenDiagnosticMessageText(d.messageText, '\n'));
        });
      }
    });

    it('should provide full type information for messages and services', async () => {
      const protoContent = `
syntax = "proto3";

service UserService {
  rpc GetUser(GetUserRequest) returns (User);
  rpc UpdateUser(User) returns (User);
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
  repeated string roles = 4;
}

message GetUserRequest {
  string id = 1;
}
`;

      const protoPath = path.join(testDir, 'user.proto');
      await fs.writeFile(protoPath, protoContent);

      const pluginFactory: any = createHallowPlugin({  protoRoot: testDir }, { framework: 'vite' } as any);
      const context = createMockContext(protoPath);

      const result = await pluginFactory.transform?.call(
        context as any,
        protoContent,
        protoPath
      );

      const code = typeof result === 'string' ? result : (result as any)?.code;

      // Verify message interfaces
      expect(code).toContain('export interface User');
      expect(code).toContain('export interface GetUserRequest');

      // Verify service stub
      expect(code).toContain('export class UserServiceStub');
      expect(code).toContain('getUser');
      expect(code).toContain('updateUser');

      // Verify types
      expect(code).toMatch(/id:\s*string/);
      expect(code).toMatch(/name:\s*string/);
      expect(code).toMatch(/email:\s*string/);
      expect(code).toMatch(/roles:\s*string\[\]/); // repeated field
    });
  });

  describe('E2E-WF-02: Multi-file dependencies with topological processing', () => {
    it('should handle proto dependency chain with correct processing order', async () => {
      // Create dependency chain: types.proto <- models.proto <- service.proto

      // types.proto
      const typesProto = `
syntax = "proto3";

message Address {
  string street = 1;
  string city = 2;
  string zip = 3;
}
`;
      await fs.writeFile(path.join(testDir, 'types.proto'), typesProto);

      // models.proto
      const modelsProto = `
syntax = "proto3";

import "types.proto";

message User {
  string id = 1;
  string name = 2;
  Address address = 3;
}
`;
      await fs.writeFile(path.join(testDir, 'models.proto'), modelsProto);

      // service.proto
      const serviceProto = `
syntax = "proto3";

import "models.proto";

service UserService {
  rpc GetUser(GetUserRequest) returns (User);
}

message GetUserRequest {
  string id = 1;
}
`;
      await fs.writeFile(path.join(testDir, 'service.proto'), serviceProto);

      // Transform the service proto (which depends on others)
      const pluginFactory: any = createHallowPlugin({  protoRoot: testDir }, { framework: 'vite' } as any);
      const context = createMockContext(path.join(testDir, 'service.proto'));

      const result = await pluginFactory.transform?.call(
        context as any,
        serviceProto,
        path.join(testDir, 'service.proto')
      );

      const code = typeof result === 'string' ? result : (result as any)?.code;

      // Verify all types are available
      expect(code).toContain('UserService');
      expect(code).toContain('GetUserRequest');
      // User and Address should be imported or included
      expect(code).toMatch(/User|import.*User/);
      expect(code).toMatch(/Address|import.*Address/);

      // Verify TypeScript compilation
      const tsResult = compileTypeScript(code);
      expect(tsResult.success).toBe(true);
    });

    it('should detect and report circular dependencies', async () => {
      // Create circular dependency: a.proto -> b.proto -> c.proto -> a.proto

      const aProto = `
syntax = "proto3";
import "b.proto";

message MessageA {
  string value = 1;
  MessageB b = 2;
}
`;
      await fs.writeFile(path.join(testDir, 'a.proto'), aProto);

      const bProto = `
syntax = "proto3";
import "c.proto";

message MessageB {
  string value = 1;
  MessageC c = 2;
}
`;
      await fs.writeFile(path.join(testDir, 'b.proto'), bProto);

      const cProto = `
syntax = "proto3";
import "a.proto";

message MessageC {
  string value = 1;
  MessageA a = 2;
}
`;
      await fs.writeFile(path.join(testDir, 'c.proto'), cProto);

      // Attempt to transform should throw circular dependency error
      const pluginFactory: any = createHallowPlugin({  protoRoot: testDir }, { framework: 'vite' } as any);
      const context = createMockContext(path.join(testDir, 'a.proto'));

      await expect(
        pluginFactory.transform?.call(
          context as any,
          aProto,
          path.join(testDir, 'a.proto')
        )
      ).rejects.toThrow(/circular.*import/i);
    });
  });

  describe('E2E-WF-03: Cache invalidation on file changes', () => {
    it('should use cache for unchanged files and invalidate on changes', async () => {
      const protoContent = `
syntax = "proto3";

service TestService {
  rpc Test(TestRequest) returns (TestResponse);
}

message TestRequest {
  string value = 1;
}

message TestResponse {
  string result = 1;
}
`;

      const protoPath = path.join(testDir, 'test.proto');
      await fs.writeFile(protoPath, protoContent);

      const pluginFactory: any = createHallowPlugin({  protoRoot: testDir }, { framework: 'vite' } as any);
      const context = createMockContext(protoPath);

      // First transformation (cache miss)
      const start1 = performance.now();
      const result1 = await pluginFactory.transform?.call(
        context as any,
        protoContent,
        protoPath
      );
      const time1 = performance.now() - start1;

      const code1 = typeof result1 === 'string' ? result1 : (result1 as any)?.code;
      expect(code1).toContain('TestService');
      expect(code1).toContain('test'); // method name

      // Second transformation with same content (cache hit)
      const start2 = performance.now();
      const result2 = await pluginFactory.transform?.call(
        context as any,
        protoContent,
        protoPath
      );
      const time2 = performance.now() - start2;

      const code2 = typeof result2 === 'string' ? result2 : (result2 as any)?.code;
      expect(code2).toBe(code1); // Exact same code

      // Cache hit should be significantly faster (at least 50% faster)
      expect(time2).toBeLessThan(time1 * 0.5);

      // Now modify the proto file (add new method)
      const modifiedProto = `
syntax = "proto3";

service TestService {
  rpc Test(TestRequest) returns (TestResponse);
  rpc NewTest(TestRequest) returns (TestResponse);
}

message TestRequest {
  string value = 1;
}

message TestResponse {
  string result = 1;
}
`;

      await fs.writeFile(protoPath, modifiedProto);

      // Third transformation (cache miss due to modification)
      const result3 = await pluginFactory.transform?.call(
        context as any,
        modifiedProto,
        protoPath
      );

      const code3 = typeof result3 === 'string' ? result3 : (result3 as any)?.code;
      expect(code3).not.toBe(code1); // Different code
      expect(code3).toContain('newTest'); // New method present
    });
  });

  describe('E2E-WF-04: Production optimization verification', () => {
    it('should optimize code in production mode', async () => {
      const protoContent = `
syntax = "proto3";

/**
 * Greeting service for demo
 */
service GreetingService {
  // Greet method
  rpc Greet(GreetRequest) returns (GreetResponse);
}

message GreetRequest {
  string name = 1;
}

message GreetResponse {
  string reply = 1;
}
`;

      const protoPath = path.join(testDir, 'greeting.proto');
      await fs.writeFile(protoPath, protoContent);

      // Development mode
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const devPluginFactory: any = createHallowPlugin({ 
        protoRoot: testDir,
        sourceMaps: true,
      }, { framework: 'vite' } as any);
      const devContext = createMockContext(protoPath);

      const devResult = await devPluginFactory.transform?.call(
        devContext as any,
        protoContent,
        protoPath
      );
      const devCode = typeof devResult === 'string' ? devResult : (devResult as any)?.code;
      const devSize = devCode.length;

      // Production mode
      process.env.NODE_ENV = 'production';

      const prodPluginFactory: any = createHallowPlugin({
        protoRoot: testDir,
        optimization: {
          production: true,
          minify: true,
          removeComments: true,
          deadCodeElimination: true,
        },
      }, { framework: 'vite' } as any);
      const prodContext = createMockContext(protoPath);

      const prodResult = await prodPluginFactory.transform?.call(
        prodContext as any,
        protoContent,
        protoPath
      );
      const prodCode = typeof prodResult === 'string' ? prodResult : (prodResult as any)?.code;
      const prodSize = prodCode.length;

      // Restore environment
      process.env.NODE_ENV = originalEnv;

      // Verify production optimizations
      expect(prodSize).toBeLessThan(devSize * 0.8); // At least 20% smaller

      // Comments should be removed in production
      expect(prodCode).not.toContain('/**');
      expect(prodCode).not.toContain('//');

      // Core functionality should still be present
      expect(prodCode).toContain('GreetingService');
      expect(prodCode).toContain('Greet');
    });
  });

  describe('E2E-WF-05: TypeScript autocomplete verification', () => {
    it('should provide full TypeScript type safety and inference', async () => {
      const protoContent = `
syntax = "proto3";

service GreetingService {
  rpc Greet(GreetRequest) returns (GreetResponse);
}

message GreetRequest {
  string name = 1;
  optional string greeting = 2;
}

message GreetResponse {
  string reply = 1;
  int32 timestamp = 2;
}
`;

      const protoPath = path.join(testDir, 'greeting.proto');
      await fs.writeFile(protoPath, protoContent);

      const pluginFactory: any = createHallowPlugin({  protoRoot: testDir }, { framework: 'vite' } as any);
      const context = createMockContext(protoPath);

      const result = await pluginFactory.transform?.call(
        context as any,
        protoContent,
        protoPath
      );

      const code = typeof result === 'string' ? result : (result as any)?.code;

      // Create a consumer TypeScript file that uses the generated types
      const consumerCode = `
${code}

// Test type safety
const stub = new GreetingServiceStub({} as any);

// This should compile (correct types)
const request: GreetRequest = {
  name: 'World',
  greeting: 'Hello',
};

// Method should be correctly typed
const responsePromise: Promise<GreetResponse> = stub.methods.greet(request);

// This should fail type checking (incorrect type)
// const wrongRequest: GreetRequest = {
//   name: 123, // Error: Type 'number' is not assignable to type 'string'
// };
`;

      const tsResult = compileTypeScript(consumerCode);
      expect(tsResult.success).toBe(true);

      // Verify correct type exports
      expect(code).toMatch(/export interface GreetRequest/);
      expect(code).toMatch(/name:\s*string/);
      expect(code).toMatch(/greeting\?:\s*string/); // optional field
      expect(code).toMatch(/reply:\s*string/);
      expect(code).toMatch(/timestamp:\s*number/); // int32 -> number
    });

    it('should catch type errors at compile time', () => {
      const generatedCode = `
export interface GreetRequest {
  name: string;
}

export class GreetingServiceStub {
  methods = {
    greet: async (request: GreetRequest): Promise<GreetResponse> => {
      return { reply: 'Hello' };
    }
  };
}

export interface GreetResponse {
  reply: string;
}
`;

      // Code with type error
      const errorCode = `
${generatedCode}

const stub = new GreetingServiceStub();
const wrongRequest = { name: 123 }; // Wrong type
stub.methods.greet(wrongRequest); // Should error
`;

      const tsResult = compileTypeScript(errorCode);
      expect(tsResult.success).toBe(false);
      expect(tsResult.diagnostics.length).toBeGreaterThan(0);
    });
  });

  describe('E2E-WF-06: React hooks generation', () => {
    it('should generate React hooks when enabled', async () => {
      const protoContent = `
syntax = "proto3";

service UserService {
  rpc GetUser(GetUserRequest) returns (User);
}

message GetUserRequest {
  string id = 1;
}

message User {
  string id = 1;
  string name = 2;
  string email = 3;
}
`;

      const protoPath = path.join(testDir, 'user-service.proto');
      await fs.writeFile(protoPath, protoContent);

      const pluginFactory: any = createHallowPlugin({
        protoRoot: testDir,
        generateReactHooks: true,
        generateSuspenseHooks: true,
      }, { framework: 'vite' } as any);
      const context = createMockContext(protoPath);

      const result = await pluginFactory.transform?.call(
        context as any,
        protoContent,
        protoPath
      );

      const code = typeof result === 'string' ? result : (result as any)?.code;

      // Verify React imports
      expect(code).toContain('@hallow/react');
      expect(code).toMatch(/import.*useGrpc/);
      expect(code).toMatch(/import.*useSuspenseGrpc/);

      // Verify hook exports
      expect(code).toMatch(/export function use\w+/);

      // Verify hook signatures
      // Regular hook: { data, error, loading }
      expect(code).toMatch(/{\s*data.*error.*loading\s*}/);
    });

    it('should warn when @hallow/react is not available', async () => {
      const protoContent = `
syntax = "proto3";
service TestService {
  rpc Test(TestRequest) returns (TestResponse);
}
message TestRequest { string value = 1; }
message TestResponse { string result = 1; }
`;

      const protoPath = path.join(testDir, 'test.proto');
      await fs.writeFile(protoPath, protoContent);

      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const pluginFactory: any = createHallowPlugin({
        protoRoot: testDir,
        generateReactHooks: true,
      }, { framework: 'vite' } as any);
      const context = createMockContext(protoPath);

      // This should generate a warning about missing @hallow/react
      await pluginFactory.transform?.call(
        context as any,
        protoContent,
        protoPath
      );

      // In a real scenario, we'd check for the warning
      // For now, just verify the transform doesn't fail
      expect(warnSpy).toHaveBeenCalled();

      warnSpy.mockRestore();
    });
  });

  describe('E2E-WF-07: Well-known types integration', () => {
    it('should handle Google well-known types correctly', async () => {
      const protoContent = `
syntax = "proto3";

import "google/protobuf/timestamp.proto";
import "google/protobuf/duration.proto";

message Event {
  string name = 1;
  google.protobuf.Timestamp occurred_at = 2;
  google.protobuf.Duration duration = 3;
}

service EventService {
  rpc RecordEvent(Event) returns (Event);
}
`;

      const protoPath = path.join(testDir, 'event.proto');
      await fs.writeFile(protoPath, protoContent);

      const pluginFactory: any = createHallowPlugin({  protoRoot: testDir }, { framework: 'vite' } as any);
      const context = createMockContext(protoPath);

      const result = await pluginFactory.transform?.call(
        context as any,
        protoContent,
        protoPath
      );

      const code = typeof result === 'string' ? result : (result as any)?.code;

      // Verify well-known types are referenced
      expect(code).toMatch(/Timestamp|timestamp/);
      expect(code).toMatch(/Duration|duration/);

      // Should not have resolution errors
      expect(code).not.toContain('cannot resolve');
      expect(code).not.toContain('not found');
    });
  });

  describe('E2E-WF-08: Complex dependency graph', () => {
    it('should handle complex multi-directory proto structure', async () => {
      // Create directory structure
      const commonDir = path.join(testDir, 'common');
      const modelsDir = path.join(testDir, 'models');
      const servicesDir = path.join(testDir, 'services');

      await fs.mkdir(commonDir, { recursive: true });
      await fs.mkdir(modelsDir, { recursive: true });
      await fs.mkdir(servicesDir, { recursive: true });

      // common/types.proto
      await fs.writeFile(
        path.join(commonDir, 'types.proto'),
        `
syntax = "proto3";
message Address {
  string street = 1;
  string city = 2;
}
`
      );

      // common/errors.proto
      await fs.writeFile(
        path.join(commonDir, 'errors.proto'),
        `
syntax = "proto3";
message Error {
  string code = 1;
  string message = 2;
}
`
      );

      // models/user.proto
      await fs.writeFile(
        path.join(modelsDir, 'user.proto'),
        `
syntax = "proto3";
import "../common/types.proto";
message User {
  string id = 1;
  string name = 2;
  Address address = 3;
}
`
      );

      // services/user-service.proto
      const serviceProto = `
syntax = "proto3";
import "../models/user.proto";
import "../common/errors.proto";

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
}

message GetUserRequest {
  string id = 1;
}

message GetUserResponse {
  User user = 1;
  Error error = 2;
}
`;

      await fs.writeFile(
        path.join(servicesDir, 'user-service.proto'),
        serviceProto
      );

      // Transform the service (top of dependency tree)
      const pluginFactory: any = createHallowPlugin({  protoRoot: testDir }, { framework: 'vite' } as any);
      const context = createMockContext(path.join(servicesDir, 'user-service.proto'));

      const result = await pluginFactory.transform?.call(
        context as any,
        serviceProto,
        path.join(servicesDir, 'user-service.proto')
      );

      const code = typeof result === 'string' ? result : (result as any)?.code;

      // Verify all types are available
      expect(code).toContain('UserService');
      expect(code).toMatch(/User|import.*User/);
      expect(code).toMatch(/Address|import.*Address/);
      expect(code).toMatch(/Error|import.*Error/);

      // Should compile successfully
      const tsResult = compileTypeScript(code);
      expect(tsResult.success).toBe(true);
    });
  });

  describe('E2E-WF-09: Concurrent proto file processing', () => {
    it('should process multiple independent files efficiently', async () => {
      // Create 10 independent proto files
      const files: string[] = [];
      const transforms: Promise<any>[] = [];

      for (let i = 0; i < 10; i++) {
        const protoContent = `
syntax = "proto3";

service Service${i} {
  rpc Method${i}(Request${i}) returns (Response${i});
}

message Request${i} {
  string value = 1;
}

message Response${i} {
  string result = 1;
}
`;
        const filePath = path.join(testDir, `service${i}.proto`);
        await fs.writeFile(filePath, protoContent);
        files.push(filePath);
      }

      // Transform all files
      const pluginFactory: any = createHallowPlugin({  protoRoot: testDir }, { framework: 'vite' } as any);
      const startTime = performance.now();

      for (let i = 0; i < files.length; i++) {
        const context = createMockContext(files[i]);
        const content = await fs.readFile(files[i], 'utf-8');

        transforms.push(
          pluginFactory.transform?.call(
            context as any,
            content,
            files[i]
          ) as Promise<any>
        );
      }

      const results = await Promise.all(transforms);
      const totalTime = performance.now() - startTime;

      // All transforms should succeed
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeDefined();
      });

      // Should complete in reasonable time (< 2 seconds for 10 files)
      expect(totalTime).toBeLessThan(2000);

      console.log(`Processed 10 files in ${totalTime.toFixed(2)}ms`);
    });
  });

  describe('E2E-WF-10: Error handling and reliability', () => {
    it('should handle syntax errors gracefully', async () => {
      const invalidProto = `
syntax = "proto3";

service BrokenService {
  rpc Method(Request) returns Response; // Missing parentheses
}

message Request {
  string value = 1
} // Missing semicolon
`;

      const protoPath = path.join(testDir, 'broken.proto');
      await fs.writeFile(protoPath, invalidProto);

      const pluginFactory: any = createHallowPlugin({  protoRoot: testDir }, { framework: 'vite' } as any);
      const context = createMockContext(protoPath);

      // Should throw descriptive error
      await expect(
        pluginFactory.transform?.call(
          context as any,
          invalidProto,
          protoPath
        )
      ).rejects.toThrow();
    });

    it('should handle missing import files', async () => {
      const protoWithMissingImport = `
syntax = "proto3";
import "nonexistent.proto";

message Test {
  string value = 1;
}
`;

      const protoPath = path.join(testDir, 'test.proto');
      await fs.writeFile(protoPath, protoWithMissingImport);

      const pluginFactory: any = createHallowPlugin({  protoRoot: testDir }, { framework: 'vite' } as any);
      const context = createMockContext(protoPath);

      await expect(
        pluginFactory.transform?.call(
          context as any,
          protoWithMissingImport,
          protoPath
        )
      ).rejects.toThrow(/not found|cannot resolve/i);
    });

    it('should validate inputs before processing', async () => {
      const pluginFactory: any = createHallowPlugin({  protoRoot: testDir }, { framework: 'vite' } as any);
      const context = createMockContext('test.proto');

      // Empty content should be handled
      await expect(
        pluginFactory.transform?.call(
          context as any,
          '',
          'test.proto'
        )
      ).rejects.toThrow();

      // Invalid ID should be handled
      await expect(
        pluginFactory.transform?.call(
          context as any,
          'syntax = "proto3";',
          ''
        )
      ).rejects.toThrow();
    });
  });
});
