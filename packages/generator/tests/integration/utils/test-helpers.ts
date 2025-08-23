import { readFileSync } from 'fs';
import { join } from 'path';
import { Generator } from '../../../src/core/generator';
import { Project, SourceFile } from 'ts-morph';
import { ProtoFile, ServiceDefinition, MessageDefinition, FieldDefinition, EnumDefinition } from '../../../src/core/proto-types';
import { GeneratorOptions, GeneratedCode } from '../../../src/core/types';
import * as ts from 'typescript';

export interface TestResult {
  code: string;
  files: any[];
  compiles: boolean;
}

export class TestHelper {
  private generator: Generator;
  private project: Project;

  constructor() {
    this.generator = new Generator({
      outputFormat: 'typescript',
      generateReactHooks: false,
      generateSuspenseHooks: false,
      generateComments: true,
    });
    this.project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: 99 as any, // ESNext
        module: 99 as any, // ESNext
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        lib: ['es2020'],
        types: ['node'],
      },
    });
  }

  /**
   * Load a proto file from fixtures (returns content as string)
   */
  loadProtoFile(relativePath: string): string {
    const fullPath = join(__dirname, '..', 'fixtures', relativePath);
    return readFileSync(fullPath, 'utf-8');
  }

  /**
   * Generate TypeScript code from a ProtoFile object
   */
  async generateFromProtoFile(
    protoFile: ProtoFile,
    options?: Partial<GeneratorOptions>
  ): Promise<TestResult> {
    if (options) {
      this.generator.updateOptions(options);
    }
    
    // Generate code
    const result: GeneratedCode = await this.generator.generateCode(protoFile);
    
    // Combine all generated files into a single code string for testing
    let combinedCode = '';
    for (const file of result.files) {
      combinedCode += file.content + '\n\n';
    }
    
    // Test compilation
    let compiles = false;
    try {
      const sourceFile = this.project.createSourceFile(
        'test.ts',
        combinedCode,
        { overwrite: true }
      );
      
      const diagnostics = this.project.getPreEmitDiagnostics();
      compiles = diagnostics.length === 0;
    } catch (error) {
      compiles = false;
    }
    
    return {
      code: combinedCode,
      files: result.files,
      compiles,
    };
  }

  /**
   * Create a simple service ProtoFile for testing
   */
  createSimpleServiceProtoFile(): ProtoFile {
    return {
      fileName: 'test-service.proto',
      package: 'test.service',
      syntax: 'proto3',
      imports: [],
      services: [
        {
          name: 'UserService',
          methods: [
            {
              name: 'GetUser',
              inputType: 'GetUserRequest',
              outputType: 'GetUserResponse',
              clientStreaming: false,
              serverStreaming: false,
              options: {}
            }
          ],
          options: {}
        }
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
              optional: true,
              map: false,
              options: {}
            }
          ],
          nestedMessages: [],
          nestedEnums: [],
          oneofs: [],
          options: {}
        },
        {
          name: 'GetUserResponse',
          fields: [
            {
              name: 'id',
              number: 1,
              type: 'string',
              repeated: false,
              optional: true,
              map: false,
              options: {}
            },
            {
              name: 'name',
              number: 2,
              type: 'string',
              repeated: false,
              optional: true,
              map: false,
              options: {}
            }
          ],
          nestedMessages: [],
          nestedEnums: [],
          oneofs: [],
          options: {}
        }
      ],
      enums: [],
      options: {}
    };
  }

  /**
   * Create a simple message-only ProtoFile for testing
   */
  createSimpleMessageProtoFile(): ProtoFile {
    return {
      fileName: 'test-message.proto',
      package: 'test.message',
      syntax: 'proto3',
      imports: [],
      services: [],
      messages: [
        {
          name: 'User',
          fields: [
            {
              name: 'id',
              number: 1,
              type: 'string',
              repeated: false,
              optional: true,
              map: false,
              options: {}
            },
            {
              name: 'age',
              number: 2,
              type: 'int32',
              repeated: false,
              optional: true,
              map: false,
              options: {}
            },
            {
              name: 'is_active',
              number: 3,
              type: 'bool',
              repeated: false,
              optional: true,
              map: false,
              options: {}
            }
          ],
          nestedMessages: [],
          nestedEnums: [],
          oneofs: [],
          options: {}
        }
      ],
      enums: [],
      options: {}
    };
  }

  /**
   * Check if generated code contains expected patterns
   */
  containsPattern(code: string, pattern: string | RegExp): boolean {
    if (typeof pattern === 'string') {
      return code.includes(pattern);
    }
    return pattern.test(code);
  }

  /**
   * Clean up the test project
   */
  cleanup(): void {
    this.project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: 99 as any, // ESNext
        module: 99 as any, // ESNext
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        lib: ['es2020'],
        types: ['node'],
      },
    });
  }
}