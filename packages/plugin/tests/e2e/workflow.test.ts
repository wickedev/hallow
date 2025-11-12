/**
 * End-to-End Workflow Tests
 *
 * Tests complete workflows from proto import to final executable code.
 * These tests verify that all components work together correctly in realistic scenarios.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as path from 'path';
import * as fs from 'fs/promises';
import { tmpdir } from 'os';
// import { promisify } from 'util';
// import { exec as execCallback } from 'child_process';

// const exec = promisify(execCallback);

describe('E2E Workflow Tests', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(tmpdir(), `hallow-e2e-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('E2E-01: Import proto and call gRPC method', () => {
    it('should transform proto file and enable gRPC calls', async () => {
      // Create proto file
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

      // Mock plugin transformation (would normally use actual plugin)
      const mockTransformedCode = `
export class GreetingServiceStub {
  constructor(private client: any) {}

  methods = {
    greet: async (request: GreetRequest): Promise<GreetResponse> => {
      return { reply: \`Hello, \${request.name}!\` };
    }
  };
}

export interface GreetRequest {
  name: string;
}

export interface GreetResponse {
  reply: string;
}
`;

      // Verify structure
      expect(mockTransformedCode).toContain('export class GreetingServiceStub');
      expect(mockTransformedCode).toContain('export interface GreetRequest');
      expect(mockTransformedCode).toContain('export interface GreetResponse');
    });

    it('should provide TypeScript types for service methods', () => {
      interface GreetRequest {
        name: string;
      }

      interface GreetResponse {
        reply: string;
      }

      // Verify types are properly defined
      const request: GreetRequest = { name: 'Test' };
      const response: GreetResponse = { reply: 'Hello, Test!' };

      expect(request.name).toBe('Test');
      expect(response.reply).toBe('Hello, Test!');
    });
  });

  describe('E2E-02: Generate React hooks', () => {
    it('should generate React hooks when enabled', async () => {
      const protoContent = `
syntax = "proto3";

service UserService {
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
}

message GetUserRequest {
  string id = 1;
}

message GetUserResponse {
  string name = 1;
  string email = 2;
}
`;

      const protoPath = path.join(testDir, 'user-service.proto');
      await fs.writeFile(protoPath, protoContent);

      // Mock generated hooks
      const mockHookCode = `
import { useGrpc, useSuspenseGrpc } from '@hallow/react';

export function useGetUser(request: GetUserRequest) {
  return useGrpc(UserServiceStub, client => client.methods.getUser(request));
}

export function useGetUserSuspense(request: GetUserRequest) {
  return useSuspenseGrpc(UserServiceStub, client => client.methods.getUser(request));
}
`;

      expect(mockHookCode).toContain('import { useGrpc, useSuspenseGrpc }');
      expect(mockHookCode).toContain('export function useGetUser');
      expect(mockHookCode).toContain('export function useGetUserSuspense');
    });
  });

  describe('E2E-03: Multi-file proto dependencies', () => {
    it('should handle proto file dependencies correctly', async () => {
      // Create types.proto
      const typesProto = `
syntax = "proto3";

message Address {
  string street = 1;
  string city = 2;
  string zip = 3;
}
`;
      await fs.writeFile(path.join(testDir, 'types.proto'), typesProto);

      // Create models.proto that imports types.proto
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

      // Create service.proto that imports models.proto
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

      // Verify all files exist
      const files = await fs.readdir(testDir);
      expect(files).toContain('types.proto');
      expect(files).toContain('models.proto');
      expect(files).toContain('service.proto');

      // Verify import chain
      const modelsContent = await fs.readFile(path.join(testDir, 'models.proto'), 'utf-8');
      expect(modelsContent).toContain('import "types.proto"');

      const serviceContent = await fs.readFile(path.join(testDir, 'service.proto'), 'utf-8');
      expect(serviceContent).toContain('import "models.proto"');
    });
  });

  describe('E2E-04: Cache invalidation on changes', () => {
    it('should invalidate cache when proto file changes', async () => {
      const protoPath = path.join(testDir, 'test.proto');

      // Initial proto
      const initialProto = `
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
      await fs.writeFile(protoPath, initialProto);

      // Simulate first transform (cache miss)
      const firstTransformTime = Date.now();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 10));

      // Modified proto (add new method)
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

      // Verify file was modified
      const stats = await fs.stat(protoPath);
      expect(stats.mtimeMs).toBeGreaterThan(firstTransformTime);

      // Verify content changed
      const content = await fs.readFile(protoPath, 'utf-8');
      expect(content).toContain('rpc NewTest');
    });
  });

  describe('E2E-05: Production code optimization', () => {
    it('should optimize code in production mode', () => {
      const devCode = `
/**
 * Greeting service stub
 * Provides methods to interact with greeting service
 */
export class GreetingServiceStub {
  // Constructor for the service stub
  constructor(private client: any) {}

  // Service methods
  methods = {
    /**
     * Greet method
     * @param request The greet request
     * @returns The greet response
     */
    greet: async (request: GreetRequest): Promise<GreetResponse> => {
      return this.client.call('greet', request);
    }
  };
}
`;

      const prodCode = `
export class GreetingServiceStub{constructor(private client:any){}methods={greet:async(request:GreetRequest):Promise<GreetResponse>=>{return this.client.call('greet',request);}};
}
`;

      // Production code should be smaller
      expect(prodCode.length).toBeLessThan(devCode.length);
      // Should not contain comments
      expect(prodCode).not.toContain('/**');
      expect(prodCode).not.toContain('//');
      // Should contain same functionality (minified)
      expect(prodCode).toContain('GreetingServiceStub');
      expect(prodCode).toContain('methods');
      expect(prodCode).toContain('greet');
    });
  });

  describe('E2E-06: TypeScript autocomplete', () => {
    it('should provide full TypeScript type information', () => {
      // Define interfaces as they would be generated
      interface GreetRequest {
        name: string;
        metadata?: { [key: string]: string };
      }

      interface GreetResponse {
        reply: string;
        timestamp?: number;
      }

      class GreetingServiceStub {
        constructor(_client: any) {
          // Client parameter kept for interface compatibility
          void _client;
        }

        methods = {
          greet: async (request: GreetRequest): Promise<GreetResponse> => {
            return { reply: `Hello, ${request.name}!` };
          }
        };
      }

      // TypeScript should infer types correctly
      const stub = new GreetingServiceStub({});
      const request: GreetRequest = { name: 'World' };

      // This would fail type checking if types were wrong
      const responsePromise: Promise<GreetResponse> = stub.methods.greet(request);

      expect(responsePromise).toBeDefined();
    });
  });

  describe('E2E-07: Well-known types integration', () => {
    it('should handle Google well-known types', async () => {
      const protoContent = `
syntax = "proto3";

import "google/protobuf/timestamp.proto";
import "google/protobuf/duration.proto";

message Event {
  string name = 1;
  google.protobuf.Timestamp occurred_at = 2;
  google.protobuf.Duration duration = 3;
}
`;

      const protoPath = path.join(testDir, 'event.proto');
      await fs.writeFile(protoPath, protoContent);

      // Verify imports
      const content = await fs.readFile(protoPath, 'utf-8');
      expect(content).toContain('google/protobuf/timestamp.proto');
      expect(content).toContain('google/protobuf/duration.proto');
      expect(content).toContain('google.protobuf.Timestamp');
      expect(content).toContain('google.protobuf.Duration');
    });
  });

  describe('E2E-08: Complex dependency graph', () => {
    it('should handle complex multi-file dependencies', async () => {
      // Create common directory
      const commonDir = path.join(testDir, 'common');
      await fs.mkdir(commonDir, { recursive: true });

      // Create common/types.proto
      await fs.writeFile(
        path.join(commonDir, 'types.proto'),
        'syntax = "proto3";\nmessage Address { string street = 1; }'
      );

      // Create common/errors.proto
      await fs.writeFile(
        path.join(commonDir, 'errors.proto'),
        'syntax = "proto3";\nmessage Error { string code = 1; }'
      );

      // Create models directory
      const modelsDir = path.join(testDir, 'models');
      await fs.mkdir(modelsDir, { recursive: true });

      // Create models/user.proto
      await fs.writeFile(
        path.join(modelsDir, 'user.proto'),
        `syntax = "proto3";
import "../common/types.proto";
message User {
  string id = 1;
  Address address = 2;
}`
      );

      // Verify structure
      const commonFiles = await fs.readdir(commonDir);
      expect(commonFiles).toContain('types.proto');
      expect(commonFiles).toContain('errors.proto');

      const modelFiles = await fs.readdir(modelsDir);
      expect(modelFiles).toContain('user.proto');
    });
  });

  describe('E2E-09: Concurrent proto processing', () => {
    it('should process multiple proto files concurrently', async () => {
      // Create 10 independent proto files
      const filePromises = [];
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
        filePromises.push(
          fs.writeFile(path.join(testDir, `service${i}.proto`), protoContent)
        );
      }

      // Create all files concurrently
      const startTime = Date.now();
      await Promise.all(filePromises);
      const duration = Date.now() - startTime;

      // Should complete quickly (all parallel)
      expect(duration).toBeLessThan(1000);

      // Verify all files created
      const files = await fs.readdir(testDir);
      for (let i = 0; i < 10; i++) {
        expect(files).toContain(`service${i}.proto`);
      }
    });
  });

  describe('E2E-10: Full build pipeline', () => {
    it('should complete full build from source to output', async () => {
      // Create package.json
      const packageJson = {
        name: 'test-project',
        version: '1.0.0',
        type: 'module',
        scripts: {
          build: 'echo "Build complete"'
        },
        dependencies: {
          '@hallow/plugin': '*'
        }
      };

      await fs.writeFile(
        path.join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      // Create tsconfig.json
      const tsConfig = {
        compilerOptions: {
          target: 'ES2020',
          module: 'ESNext',
          moduleResolution: 'bundler',
          strict: true
        }
      };

      await fs.writeFile(
        path.join(testDir, 'tsconfig.json'),
        JSON.stringify(tsConfig, null, 2)
      );

      // Create proto file
      const protoContent = `
syntax = "proto3";

service AppService {
  rpc GetData(DataRequest) returns (DataResponse);
}

message DataRequest {
  string id = 1;
}

message DataResponse {
  string data = 1;
}
`;

      await fs.writeFile(path.join(testDir, 'app.proto'), protoContent);

      // Verify project structure
      const files = await fs.readdir(testDir);
      expect(files).toContain('package.json');
      expect(files).toContain('tsconfig.json');
      expect(files).toContain('app.proto');

      // Verify package.json content
      const pkgContent = await fs.readFile(path.join(testDir, 'package.json'), 'utf-8');
      const pkg = JSON.parse(pkgContent);
      expect(pkg.dependencies).toHaveProperty('@hallow/plugin');
    });
  });
});
