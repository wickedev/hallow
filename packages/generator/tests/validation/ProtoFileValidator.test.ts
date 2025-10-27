/**
 * Unit tests for ProtoFileValidator
 */

import { ProtoFileValidator } from '../../src/validation/ProtoFileValidator';
import { ProtoFile, ServiceDefinition, MessageDefinition, EnumDefinition } from '../../src/core/proto-types';
import { ValidationErrorCode } from '../../src/validation/types';

describe('ProtoFileValidator', () => {
  let validator: ProtoFileValidator;

  beforeEach(() => {
    validator = new ProtoFileValidator();
  });

  describe('Package Name Validation (Task 5.2)', () => {
    it('should accept valid lowercase dot-separated package names', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example.myservice',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject package names with uppercase letters', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'Com.Example.MyService',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe(ValidationErrorCode.INVALID_PACKAGE_NAME);
    });

    it('should reject package names with invalid characters', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example.my-service',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe(ValidationErrorCode.INVALID_PACKAGE_NAME);
    });

    it('should reject missing package names', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: '',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].code).toBe(ValidationErrorCode.MISSING_PACKAGE_NAME);
    });

    it('should accept single-word package names', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'myservice',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Service and Method Validation (Task 5.3)', () => {
    it('should accept valid service definitions', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
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
                options: {},
              },
            ],
            options: {},
          },
        ],
        messages: [
          {
            name: 'GetUserRequest',
            fields: [],
            nestedMessages: [],
            nestedEnums: [],
            oneofs: [],
            options: {},
          },
          {
            name: 'GetUserResponse',
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

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject duplicate service names', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
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
                options: {},
              },
            ],
            options: {},
          },
          {
            name: 'UserService',
            methods: [
              {
                name: 'ListUsers',
                inputType: 'ListUsersRequest',
                outputType: 'ListUsersResponse',
                clientStreaming: false,
                serverStreaming: false,
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

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.DUPLICATE_SERVICE_NAME)).toBe(true);
    });

    it('should reject services with no methods', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [
          {
            name: 'EmptyService',
            methods: [],
            options: {},
          },
        ],
        messages: [],
        enums: [],
        options: {},
      };

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.EMPTY_SERVICE)).toBe(true);
    });

    it('should reject duplicate method names within a service', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
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
                options: {},
              },
              {
                name: 'GetUser',
                inputType: 'GetUserRequest2',
                outputType: 'GetUserResponse2',
                clientStreaming: false,
                serverStreaming: false,
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

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.DUPLICATE_METHOD_NAME)).toBe(true);
    });

    it('should reject invalid service names (not PascalCase)', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [
          {
            name: 'userService',
            methods: [
              {
                name: 'GetUser',
                inputType: 'GetUserRequest',
                outputType: 'GetUserResponse',
                clientStreaming: false,
                serverStreaming: false,
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

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.INVALID_SERVICE_NAME)).toBe(true);
    });

    it('should reject methods with missing input or output types', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [
          {
            name: 'UserService',
            methods: [
              {
                name: 'GetUser',
                inputType: '',
                outputType: 'GetUserResponse',
                clientStreaming: false,
                serverStreaming: false,
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

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.INVALID_METHOD_INPUT_TYPE)).toBe(true);
    });
  });

  describe('Message Field Validation (Task 5.4)', () => {
    it('should accept valid message definitions', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
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

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject duplicate field numbers', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
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
                optional: false,
                map: false,
                options: {},
              },
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
        enums: [],
        options: {},
      };

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.DUPLICATE_FIELD_NUMBER)).toBe(true);
    });

    it('should reject reserved field numbers (19000-19999)', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'User',
            fields: [
              {
                name: 'id',
                number: 19500,
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

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.RESERVED_FIELD_NUMBER)).toBe(true);
    });

    it('should reject invalid field number ranges', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'User',
            fields: [
              {
                name: 'id',
                number: 0,
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

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.INVALID_FIELD_NUMBER)).toBe(true);
    });

    it('should reject duplicate message names', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'User',
            fields: [],
            nestedMessages: [],
            nestedEnums: [],
            oneofs: [],
            options: {},
          },
          {
            name: 'User',
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

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.DUPLICATE_MESSAGE_NAME)).toBe(true);
    });
  });

  describe('Enum Validation (Task 5.5)', () => {
    it('should accept valid enum definitions', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [
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
        options: {},
      };

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject duplicate enum names', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [
          {
            name: 'Status',
            values: [{ name: 'UNKNOWN', number: 0, options: {} }],
            options: {},
          },
          {
            name: 'Status',
            values: [{ name: 'UNKNOWN', number: 0, options: {} }],
            options: {},
          },
        ],
        options: {},
      };

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.DUPLICATE_ENUM_NAME)).toBe(true);
    });

    it('should reject duplicate enum value names', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [
          {
            name: 'Status',
            values: [
              { name: 'UNKNOWN', number: 0, options: {} },
              { name: 'UNKNOWN', number: 1, options: {} },
            ],
            options: {},
          },
        ],
        options: {},
      };

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.DUPLICATE_ENUM_VALUE)).toBe(true);
    });

    it('should reject duplicate enum numbers', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [
          {
            name: 'Status',
            values: [
              { name: 'UNKNOWN', number: 0, options: {} },
              { name: 'ACTIVE', number: 0, options: {} },
            ],
            options: {},
          },
        ],
        options: {},
      };

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.DUPLICATE_ENUM_NUMBER)).toBe(true);
    });

    it('should reject empty enums', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [
          {
            name: 'Status',
            values: [],
            options: {},
          },
        ],
        options: {},
      };

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.EMPTY_ENUM)).toBe(true);
    });

    it('should require first enum value to be 0 in proto3', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [
          {
            name: 'Status',
            values: [
              { name: 'ACTIVE', number: 1, options: {} },
              { name: 'INACTIVE', number: 2, options: {} },
            ],
            options: {},
          },
        ],
        options: {},
      };

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.INVALID_ENUM_VALUE_NUMBER)).toBe(true);
    });
  });

  describe('Type Reference Validation (Task 5.6)', () => {
    it('should accept valid type references', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
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

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject unresolved type references in fields', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'User',
            fields: [
              {
                name: 'profile',
                number: 1,
                type: 'Profile',
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

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.UNRESOLVED_TYPE_REFERENCE)).toBe(true);
    });

    it('should accept scalar types', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
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
                optional: false,
                map: false,
                options: {},
              },
              {
                name: 'age',
                number: 2,
                type: 'int32',
                repeated: false,
                optional: false,
                map: false,
                options: {},
              },
              {
                name: 'active',
                number: 3,
                type: 'bool',
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

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject unresolved types in service methods', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [
          {
            name: 'UserService',
            methods: [
              {
                name: 'GetUser',
                inputType: 'NonExistentRequest',
                outputType: 'NonExistentResponse',
                clientStreaming: false,
                serverStreaming: false,
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

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(false);
      const unresolvedErrors = result.errors.filter(
        e => e.code === ValidationErrorCode.UNRESOLVED_TYPE_REFERENCE,
      );
      expect(unresolvedErrors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Circular Dependency Detection (Task 5.7)', () => {
    it('should accept files with no circular dependencies', () => {
      const fileA: ProtoFile = {
        fileName: 'a.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: ['b.proto'],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };

      const fileB: ProtoFile = {
        fileName: 'b.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };

      const result = validator.validateMultiple([fileA, fileB]);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect simple circular dependencies', () => {
      const fileA: ProtoFile = {
        fileName: 'a.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: ['b.proto'],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };

      const fileB: ProtoFile = {
        fileName: 'b.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: ['a.proto'],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };

      const result = validator.validateMultiple([fileA, fileB]);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.CIRCULAR_IMPORT_DEPENDENCY)).toBe(true);
    });

    it('should detect complex circular dependencies', () => {
      const fileA: ProtoFile = {
        fileName: 'a.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: ['b.proto'],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };

      const fileB: ProtoFile = {
        fileName: 'b.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: ['c.proto'],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };

      const fileC: ProtoFile = {
        fileName: 'c.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: ['a.proto'],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };

      const result = validator.validateMultiple([fileA, fileB, fileC]);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.code === ValidationErrorCode.CIRCULAR_IMPORT_DEPENDENCY)).toBe(true);
    });
  });

  describe('Validation Options', () => {
    it('should respect validateTypeReferences option', () => {
      const validator = new ProtoFileValidator({
        validateTypeReferences: false,
      });

      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'User',
            fields: [
              {
                name: 'profile',
                number: 1,
                type: 'NonExistentType',
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

      const result = validator.validate(protoFile);
      // Should pass because type reference validation is disabled
      expect(result.valid).toBe(true);
    });

    it('should respect detectCircularDependencies option', () => {
      const validator = new ProtoFileValidator({
        detectCircularDependencies: false,
      });

      const fileA: ProtoFile = {
        fileName: 'a.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: ['b.proto'],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };

      const fileB: ProtoFile = {
        fileName: 'b.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: ['a.proto'],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };

      const result = validator.validateMultiple([fileA, fileB]);
      // Should not detect circular dependencies
      expect(result.errors.some(e => e.code === ValidationErrorCode.CIRCULAR_IMPORT_DEPENDENCY)).toBe(false);
    });
  });

  describe('Nested Structures', () => {
    it('should validate nested messages', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'Outer',
            fields: [],
            nestedMessages: [
              {
                name: 'Inner',
                fields: [
                  {
                    name: 'value',
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
            nestedEnums: [],
            oneofs: [],
            options: {},
          },
        ],
        enums: [],
        options: {},
      };

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(true);
    });

    it('should validate nested enums', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'User',
            fields: [],
            nestedMessages: [],
            nestedEnums: [
              {
                name: 'Status',
                values: [
                  { name: 'UNKNOWN', number: 0, options: {} },
                  { name: 'ACTIVE', number: 1, options: {} },
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

      const result = validator.validate(protoFile);
      expect(result.valid).toBe(true);
    });
  });
});
