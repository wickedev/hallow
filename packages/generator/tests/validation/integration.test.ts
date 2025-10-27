/**
 * Integration tests for ProtoFileValidator with Generator
 */

import { Generator } from '../../src/core/generator';
import { ProtoFile } from '../../src/core/proto-types';
import { GenerationError } from '../../src/core/types';

describe('ProtoFileValidator Integration with Generator', () => {
  let generator: Generator;

  beforeEach(() => {
    generator = new Generator();
  });

  describe('Validation in Generation Workflow', () => {
    it('should successfully generate code for valid proto file', async () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example.test',
        syntax: 'proto3',
        imports: [],
        services: [
          {
            name: 'TestService',
            methods: [
              {
                name: 'GetTest',
                inputType: 'GetTestRequest',
                outputType: 'TestResponse',
                clientStreaming: false,
                serverStreaming: false,
                options: {},
              },
            ],
            options: {},
          },
        ],
        messages: [
          {
            name: 'GetTestRequest',
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
            ],
            nestedMessages: [],
            nestedEnums: [],
            oneofs: [],
            options: {},
          },
          {
            name: 'TestResponse',
            fields: [
              {
                name: 'data',
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
        ],
        enums: [],
        options: {},
      };

      const result = await generator.generateCode(protoFile);
      expect(result).toBeDefined();
      expect(result.files.length).toBeGreaterThan(0);
    });

    it('should throw GenerationError for proto file with validation errors', async () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'Invalid.Package.Name', // Invalid - uppercase
        syntax: 'proto3',
        imports: [],
        services: [
          {
            name: 'TestService',
            methods: [
              {
                name: 'GetTest',
                inputType: 'GetTestRequest',
                outputType: 'NonExistentResponse', // Type not defined
                clientStreaming: false,
                serverStreaming: false,
                options: {},
              },
            ],
            options: {},
          },
        ],
        messages: [
          {
            name: 'GetTestRequest',
            fields: [],
            nestedMessages: [],
            nestedEnums: [],
            oneofs: [],
            options: {},
          },
        ],
        enums: [],
        options: {},
      };

      await expect(generator.generateCode(protoFile)).rejects.toThrow(GenerationError);
    });

    it('should throw GenerationError for duplicate service names', async () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example.test',
        syntax: 'proto3',
        imports: [],
        services: [
          {
            name: 'TestService',
            methods: [
              {
                name: 'GetTest',
                inputType: 'GetTestRequest',
                outputType: 'TestResponse',
                clientStreaming: false,
                serverStreaming: false,
                options: {},
              },
            ],
            options: {},
          },
          {
            name: 'TestService', // Duplicate
            methods: [
              {
                name: 'ListTest',
                inputType: 'ListTestRequest',
                outputType: 'TestResponse',
                clientStreaming: false,
                serverStreaming: false,
                options: {},
              },
            ],
            options: {},
          },
        ],
        messages: [
          {
            name: 'GetTestRequest',
            fields: [],
            nestedMessages: [],
            nestedEnums: [],
            oneofs: [],
            options: {},
          },
          {
            name: 'ListTestRequest',
            fields: [],
            nestedMessages: [],
            nestedEnums: [],
            oneofs: [],
            options: {},
          },
          {
            name: 'TestResponse',
            fields: [],
            nestedMessages: [],
            nestedEnums: [],
            oneofs: [],
            options: {},
          },
        ],
        enums: [],
        options: {},
      };

      await expect(generator.generateCode(protoFile)).rejects.toThrow(GenerationError);
    });

    it('should throw GenerationError for invalid field numbers', async () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example.test',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'TestMessage',
            fields: [
              {
                name: 'field1',
                number: 19500, // Reserved range
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
        ],
        enums: [],
        options: {},
      };

      await expect(generator.generateCode(protoFile)).rejects.toThrow(GenerationError);
    });

    it('should throw GenerationError for empty enums', async () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example.test',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [
          {
            name: 'EmptyEnum',
            values: [], // Empty
            options: {},
          },
        ],
        options: {},
      };

      await expect(generator.generateCode(protoFile)).rejects.toThrow(GenerationError);
    });

    it('should throw GenerationError for proto3 enum without 0 value', async () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example.test',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [
          {
            name: 'Status',
            values: [
              {
                name: 'ACTIVE',
                number: 1, // Should be 0 for first value in proto3
                options: {},
              },
              {
                name: 'INACTIVE',
                number: 2,
                options: {},
              },
            ],
            options: {},
          },
        ],
        options: {},
      };

      await expect(generator.generateCode(protoFile)).rejects.toThrow(GenerationError);
    });

    it('should provide detailed error messages with locations', async () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example.test',
        syntax: 'proto3',
        imports: [],
        services: [
          {
            name: 'TestService',
            methods: [], // Empty service
            options: {},
          },
        ],
        messages: [],
        enums: [],
        options: {},
      };

      try {
        await generator.generateCode(protoFile);
        fail('Should have thrown GenerationError');
      } catch (error) {
        expect(error).toBeInstanceOf(GenerationError);
        if (error instanceof GenerationError) {
          expect(error.message).toContain('validation failed');
          expect(error.message).toContain('test.proto');
        }
      }
    });
  });

  describe('Validation Error Details', () => {
    it('should include validation result in error details', async () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: '', // Missing package
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };

      try {
        await generator.generateCode(protoFile);
        fail('Should have thrown GenerationError');
      } catch (error) {
        expect(error).toBeInstanceOf(GenerationError);
        if (error instanceof GenerationError) {
          expect(error.details).toBeDefined();
          expect(error.details.validationResult).toBeDefined();
          expect(error.details.validationResult.valid).toBe(false);
          expect(error.details.validationResult.errors.length).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('Complex Validation Scenarios', () => {
    it('should validate complex proto files with nested messages and enums', async () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example.test',
        syntax: 'proto3',
        imports: [],
        services: [
          {
            name: 'UserService',
            methods: [
              {
                name: 'GetUser',
                inputType: 'GetUserRequest',
                outputType: 'User',
                clientStreaming: false,
                serverStreaming: false,
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
                name: 'id',
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
            name: 'User',
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
                name: 'profile',
                number: 2,
                type: 'Profile',
                repeated: false,
                optional: false,
                map: false,
                options: {},
              },
              {
                name: 'status',
                number: 3,
                type: 'Status',
                repeated: false,
                optional: false,
                map: false,
                options: {},
              },
            ],
            nestedMessages: [
              {
                name: 'Profile',
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
            ],
            nestedEnums: [
              {
                name: 'Status',
                values: [
                  { name: 'UNKNOWN', number: 0, options: {} },
                  { name: 'ACTIVE', number: 1, options: {} },
                  { name: 'INACTIVE', number: 2, options: {} },
                ],
                options: {},
              },
            ],
            oneofs: [],
            options: {},
          },
        ],
        enums: [],
        options: {},
      };

      const result = await generator.generateCode(protoFile);
      expect(result).toBeDefined();
      expect(result.files.length).toBeGreaterThan(0);
    });
  });
});
