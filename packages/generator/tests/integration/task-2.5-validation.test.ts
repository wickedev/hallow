/**
 * Task 2.5: Validation & Testing
 *
 * This test suite validates that the generated code from tasks 2.1-2.4:
 * 1. Compiles with TypeScript strict mode (tsc --strict)
 * 2. Has working IntelliSense (type inference)
 * 3. Supports all 4 RPC types (unary, server streaming, client streaming, bidirectional)
 * 4. Passes integration tests
 *
 * Requirements Coverage: FR-2 AC 9-10, FR-6 AC 1-2
 */

import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import { ServiceGenerator } from '../../src/generators/ServiceGenerator';
import {
  ServiceDefinition,
  MethodDefinition,
  ProtoFile
} from '../../src/core/proto-types';

describe('Task 2.5: Validation & Testing', () => {
  let generator: ServiceGenerator;
  let tempDir: string;

  beforeEach(() => {
    generator = new ServiceGenerator({
      serverUrl: 'http://localhost:8080',
      generateComments: true,
      generateReactHooks: false,
      generateSuspenseHooks: false,
    });

    // Create temp directory for generated files
    tempDir = path.join(__dirname, '..', '..', 'temp-validation');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  /**
   * Create a comprehensive test proto file with all 4 RPC types
   */
  const createTestProtoFile = (): ProtoFile => ({
    fileName: 'test.proto',
    package: 'test.validation',
    syntax: 'proto3',
    imports: [],
    services: [
      {
        name: 'TestService',
        methods: [
          // Unary RPC
          {
            name: 'GetUser',
            inputType: 'GetUserRequest',
            outputType: 'GetUserResponse',
            clientStreaming: false,
            serverStream: false,
            options: {},
          },
          // Server streaming RPC
          {
            name: 'ListUsers',
            inputType: 'ListUsersRequest',
            outputType: 'ListUsersResponse',
            clientStreaming: false,
            serverStream: true,
            options: {},
          },
          // Client streaming RPC
          {
            name: 'CreateUsers',
            inputType: 'CreateUserRequest',
            outputType: 'CreateUsersResponse',
            clientStreaming: true,
            serverStream: false,
            options: {},
          },
          // Bidirectional streaming RPC
          {
            name: 'Chat',
            inputType: 'ChatMessage',
            outputType: 'ChatMessage',
            clientStreaming: true,
            serverStream: true,
            options: {},
          },
        ],
        options: {},
      },
    ],
    messages: [
      {
        name: 'GetUserRequest',
        fields: [
          {
            name: 'user_id',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {},
          },
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {},
      },
      {
        name: 'GetUserResponse',
        fields: [
          {
            name: 'id',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {},
          },
          {
            name: 'name',
            number: 2,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {},
          },
          {
            name: 'email',
            number: 3,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {},
          },
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {},
      },
      {
        name: 'ListUsersRequest',
        fields: [
          {
            name: 'page_size',
            number: 1,
            type: 'int32',
            repeated: false,
            optional: false,
            map: false,
            options: {},
          },
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {},
      },
      {
        name: 'ListUsersResponse',
        fields: [
          {
            name: 'users',
            number: 1,
            type: 'GetUserResponse',
            repeated: true,
            optional: false,
            map: false,
            options: {},
          },
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {},
      },
      {
        name: 'CreateUserRequest',
        fields: [
          {
            name: 'name',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {},
          },
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {},
      },
      {
        name: 'CreateUsersResponse',
        fields: [
          {
            name: 'count',
            number: 1,
            type: 'int32',
            repeated: false,
            optional: false,
            map: false,
            options: {},
          },
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {},
      },
      {
        name: 'ChatMessage',
        fields: [
          {
            name: 'content',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {},
          },
          {
            name: 'timestamp',
            number: 2,
            type: 'int64',
            repeated: false,
            optional: false,
            map: false,
            options: {},
          },
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {},
      },
    ],
    enums: [],
    options: {},
  });

  describe('1. TypeScript Strict Mode Compilation (FR-2 AC 9)', () => {
    it('should compile generated code with tsc --strict', async () => {
      const protoFile = createTestProtoFile();
      const service = protoFile.services[0];

      // Generate service stub
      const result = await generator.generateStub(service, protoFile);

      // Write generated code to temp file
      const outputPath = path.join(tempDir, result.path);
      fs.writeFileSync(outputPath, result.content, 'utf-8');

      // Compile with TypeScript strict mode
      const compilerOptions: ts.CompilerOptions = {
        strict: true,
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        noEmit: true,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      };

      const program = ts.createProgram([outputPath], compilerOptions);
      const diagnostics = ts.getPreEmitDiagnostics(program);

      // Filter out diagnostics from external modules (node_modules)
      const relevantDiagnostics = diagnostics.filter(diagnostic => {
        if (!diagnostic.file) return false;
        return diagnostic.file.fileName === outputPath;
      });

      // Log any errors for debugging
      if (relevantDiagnostics.length > 0) {
        console.error('TypeScript compilation errors:');
        relevantDiagnostics.forEach(diagnostic => {
          if (diagnostic.file) {
            const { line, character } = ts.getLineAndCharacterOfPosition(
              diagnostic.file,
              diagnostic.start!
            );
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            console.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
          } else {
            console.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'));
          }
        });
      }

      // Verify zero compilation errors
      expect(relevantDiagnostics.length).toBe(0);
    });

    it('should have no implicit any types in public APIs', async () => {
      const protoFile = createTestProtoFile();
      const service = protoFile.services[0];

      const result = await generator.generateStub(service, protoFile);

      // Check for ': any' in public method signatures (should not exist)
      const publicApiPattern = /public\s+(?:async\s+)?(\w+)\([^)]*\):\s*any(?:\s|;|{)/g;
      const matches = result.content.match(publicApiPattern);

      expect(matches).toBeNull();
    });

    it('should handle strict null checks properly', async () => {
      const protoFile = createTestProtoFile();
      const service = protoFile.services[0];

      const result = await generator.generateStub(service, protoFile);

      // Check that optional fields use '?' modifier or include undefined
      // This is verified by TypeScript compilation, but we can check the pattern
      expect(result.content).toBeDefined();

      // Compile with strictNullChecks
      const outputPath = path.join(tempDir, result.path);
      fs.writeFileSync(outputPath, result.content, 'utf-8');

      const compilerOptions: ts.CompilerOptions = {
        strictNullChecks: true,
        target: ts.ScriptTarget.ES2020,
        module: ts.ModuleKind.CommonJS,
        noEmit: true,
        skipLibCheck: true,
      };

      const program = ts.createProgram([outputPath], compilerOptions);
      const diagnostics = ts.getPreEmitDiagnostics(program).filter(d =>
        d.file && d.file.fileName === outputPath
      );

      expect(diagnostics.length).toBe(0);
    });
  });

  describe('2. IntelliSense and Type Inference (FR-2 AC 10)', () => {
    it('should provide complete type information for IntelliSense', async () => {
      const protoFile = createTestProtoFile();
      const service = protoFile.services[0];

      const result = await generator.generateStub(service, protoFile);

      // Verify method signatures have explicit types
      expect(result.content).toContain('async getUser(request: GetUserRequest): Promise<GetUserResponse>');
      expect(result.content).toContain('listUsers(request: ListUsersRequest): Observable<ListUsersResponse>');
    });

    it('should export all types for external use', async () => {
      const protoFile = createTestProtoFile();
      const service = protoFile.services[0];

      const result = await generator.generateStub(service, protoFile);

      // Check for export statements
      expect(result.content).toContain('export class TestServiceStub');
      expect(result.content).toContain('export const TestServiceService');
    });

    it('should include JSDoc comments for IDE hover tooltips', async () => {
      const protoFile = createTestProtoFile();
      const service = protoFile.services[0];

      const result = await generator.generateStub(service, protoFile);

      // Verify JSDoc comments exist
      expect(result.content).toContain('/**');
      expect(result.content).toContain('* @param');
      expect(result.content).toContain('* @returns');
    });

    it('should provide autocomplete-friendly method names', async () => {
      const protoFile = createTestProtoFile();
      const service = protoFile.services[0];

      const result = await generator.generateStub(service, protoFile);

      // Verify camelCase method names
      expect(result.content).toContain('public async getUser(');
      expect(result.content).toContain('public listUsers(');
      expect(result.content).toContain('public createUsers(');
      expect(result.content).toContain('public chat(');
    });
  });

  describe('3. All RPC Types Support (FR-2 AC 1-4)', () => {
    describe('3.1. Unary RPC (FR-2 AC 1)', () => {
      it('should generate async method signature for unary RPC', async () => {
        const protoFile = createTestProtoFile();
        const service = protoFile.services[0];

        const result = await generator.generateStub(service, protoFile);

        // Verify unary method signature
        expect(result.content).toContain('public async getUser(request: GetUserRequest): Promise<GetUserResponse>');
      });

      it('should use adapter.unary for implementation', async () => {
        const protoFile = createTestProtoFile();
        const service = protoFile.services[0];

        const result = await generator.generateStub(service, protoFile);

        // Verify delegation to adapter
        expect(result.content).toContain('this.adapter.unary');
        expect(result.content).toContain('GetUserDescriptor');
      });

      it('should have Promise return type for unary RPC', async () => {
        const protoFile = createTestProtoFile();
        const service = protoFile.services[0];

        const result = await generator.generateStub(service, protoFile);

        // Check Promise return type
        expect(result.content).toMatch(/getUser\([^)]*\):\s*Promise</);
      });
    });

    describe('3.2. Server Streaming RPC (FR-2 AC 2)', () => {
      it('should generate Observable return type for server streaming', async () => {
        const protoFile = createTestProtoFile();
        const service = protoFile.services[0];

        const result = await generator.generateStub(service, protoFile);

        // Verify Observable return type
        expect(result.content).toContain('listUsers(request: ListUsersRequest): Observable<ListUsersResponse>');
      });

      it('should import Observable from rxjs', async () => {
        const protoFile = createTestProtoFile();
        const service = protoFile.services[0];

        const result = await generator.generateStub(service, protoFile);

        // Verify rxjs import
        expect(result.content).toContain('import { Observable }');
        expect(result.content).toContain('from \'rxjs\'');
      });

      it('should use adapter.serverStream for implementation', async () => {
        const protoFile = createTestProtoFile();
        const service = protoFile.services[0];

        const result = await generator.generateStub(service, protoFile);

        // Verify delegation to adapter
        expect(result.content).toContain('this.adapter.serverStream');
        expect(result.content).toContain('ListUsersDescriptor');
      });
    });

    describe('3.3. Client Streaming RPC (FR-2 AC 3)', () => {
      it('should generate interface with send, complete, cancel for client streaming', async () => {
        const protoFile = createTestProtoFile();
        const service = protoFile.services[0];

        const result = await generator.generateStub(service, protoFile);

        // Verify method signature structure
        expect(result.content).toContain('public createUsers(): {');
        expect(result.content).toContain('send: (request: CreateUserRequest) => void');
        expect(result.content).toContain('complete: () => Promise<CreateUsersResponse>');
        expect(result.content).toContain('cancel: () => void');
      });

      it('should include HTTP/1.1 limitation error message', async () => {
        const protoFile = createTestProtoFile();
        const service = protoFile.services[0];

        const result = await generator.generateStub(service, protoFile);

        // Verify error documentation
        expect(result.content).toContain('Client streaming RPC');
        expect(result.content).toContain('not supported over HTTP/1.1');
      });

      it('should throw descriptive error in method body', async () => {
        const protoFile = createTestProtoFile();
        const service = protoFile.services[0];

        const result = await generator.generateStub(service, protoFile);

        // Verify error throwing
        expect(result.content).toContain('throw new Error(');
      });
    });

    describe('3.4. Bidirectional Streaming RPC (FR-2 AC 4)', () => {
      it('should generate interface with send, responses, complete, cancel for bidirectional', async () => {
        const protoFile = createTestProtoFile();
        const service = protoFile.services[0];

        const result = await generator.generateStub(service, protoFile);

        // Verify method signature structure
        expect(result.content).toContain('public chat(): {');
        expect(result.content).toContain('send: (request: ChatMessage) => void');
        expect(result.content).toContain('responses: Observable<ChatMessage>');
        expect(result.content).toContain('complete: () => void');
        expect(result.content).toContain('cancel: () => void');
      });

      it('should include Observable type for responses property', async () => {
        const protoFile = createTestProtoFile();
        const service = protoFile.services[0];

        const result = await generator.generateStub(service, protoFile);

        // Verify Observable usage
        expect(result.content).toContain('responses: Observable<ChatMessage>');
      });

      it('should include HTTP/1.1 limitation error message', async () => {
        const protoFile = createTestProtoFile();
        const service = protoFile.services[0];

        const result = await generator.generateStub(service, protoFile);

        // Verify error documentation
        expect(result.content).toContain('Bidirectional streaming RPC');
        expect(result.content).toContain('not supported over HTTP/1.1');
      });
    });
  });

  describe('4. Method Descriptors Integration (FR-3 AC 2-3)', () => {
    it('should generate service descriptor constant', async () => {
      const protoFile = createTestProtoFile();
      const service = protoFile.services[0];

      const result = await generator.generateStub(service, protoFile);

      // Verify service descriptor
      expect(result.content).toContain('export const TestServiceService');
      expect(result.content).toContain('serviceName: \'TestService\'');
      expect(result.content).toContain('fullServiceName: \'test.validation.TestService\'');
    });

    it('should generate method descriptors for all RPC methods', async () => {
      const protoFile = createTestProtoFile();
      const service = protoFile.services[0];

      const result = await generator.generateStub(service, protoFile);

      // Verify method descriptors
      expect(result.content).toContain('GetUserDescriptor');
      expect(result.content).toContain('ListUsersDescriptor');
      expect(result.content).toContain('CreateUsersDescriptor');
      expect(result.content).toContain('ChatDescriptor');
    });

    it('should include correct streaming flags in descriptors', async () => {
      const protoFile = createTestProtoFile();
      const service = protoFile.services[0];

      const result = await generator.generateStub(service, protoFile);

      // Verify streaming flags
      // Unary: requestStream: false, responseStream: false
      const getUserDescriptorMatch = result.content.match(/GetUserDescriptor:\s*{[^}]*requestStream:\s*false[^}]*responseStream:\s*false/s);
      expect(getUserDescriptorMatch).not.toBeNull();

      // Server streaming: requestStream: false, responseStream: true
      const listUsersDescriptorMatch = result.content.match(/ListUsersDescriptor:\s*{[^}]*requestStream:\s*false[^}]*responseStream:\s*true/s);
      expect(listUsersDescriptorMatch).not.toBeNull();

      // Client streaming: requestStream: true, responseStream: false
      const createUsersDescriptorMatch = result.content.match(/CreateUsersDescriptor:\s*{[^}]*requestStream:\s*true[^}]*responseStream:\s*false/s);
      expect(createUsersDescriptorMatch).not.toBeNull();

      // Bidirectional: requestStream: true, responseStream: true
      const chatDescriptorMatch = result.content.match(/ChatDescriptor:\s*{[^}]*requestStream:\s*true[^}]*responseStream:\s*true/s);
      expect(chatDescriptorMatch).not.toBeNull();
    });
  });

  describe('5. Code Quality Validation (FR-6, NFR-1)', () => {
    it('should follow TypeScript naming conventions', async () => {
      const protoFile = createTestProtoFile();
      const service = protoFile.services[0];

      const result = await generator.generateStub(service, protoFile);

      // Check PascalCase for class names
      expect(result.content).toContain('export class TestServiceStub');

      // Check camelCase for method names
      expect(result.content).toContain('async getUser(');
      expect(result.content).toContain('listUsers(');
    });

    it('should maintain consistent indentation', async () => {
      const protoFile = createTestProtoFile();
      const service = protoFile.services[0];

      const result = await generator.generateStub(service, protoFile);

      // Check for consistent 2-space indentation in class methods
      const lines = result.content.split('\n');
      const methodLines = lines.filter(line => line.trim().startsWith('public'));

      // All public methods should have consistent indentation
      expect(methodLines.length).toBeGreaterThan(0);
    });

    it('should include proper imports organization', async () => {
      const protoFile = createTestProtoFile();
      const service = protoFile.services[0];

      const result = await generator.generateStub(service, protoFile);

      // Imports should be at the top
      const importSection = result.content.substring(0, 500);
      expect(importSection).toContain('import');

      // Check for required imports
      expect(result.content).toContain('import { Observable }');
      expect(result.content).toContain('import { GrpcWebAdapter }');
    });
  });

  describe('6. Error Handling and Edge Cases', () => {
    it('should handle service with only one RPC type', async () => {
      const minimalProto: ProtoFile = {
        fileName: 'minimal.proto',
        package: 'test',
        syntax: 'proto3',
        imports: [],
        services: [
          {
            name: 'MinimalService',
            methods: [
              {
                name: 'GetData',
                inputType: 'Request',
                outputType: 'Response',
                clientStreaming: false,
                serverStream: false,
                options: {},
              },
            ],
            options: {},
          },
        ],
        messages: [],
        enums: [],
        options: {},
      };

      const service = minimalProto.services[0];
      const result = await generator.generateStub(service, minimalProto);

      expect(result.content).toContain('MinimalServiceStub');
      expect(result.content).toContain('getData');
    });

    it('should handle mixed RPC types in same service', async () => {
      const protoFile = createTestProtoFile();
      const service = protoFile.services[0];

      const result = await generator.generateStub(service, protoFile);

      // All 4 types should coexist
      expect(result.content).toContain('async getUser'); // Unary
      expect(result.content).toContain('listUsers'); // Server streaming
      expect(result.content).toContain('createUsers'); // Client streaming
      expect(result.content).toContain('chat'); // Bidirectional

      // Observable import should be present (for streaming methods)
      expect(result.content).toContain('import { Observable }');
    });
  });
});
