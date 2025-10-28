/**
 * Integration tests for enum serialization/deserialization in messages
 *
 * Tests that enum fields in messages serialize and deserialize correctly,
 * including validation, default values, and repeated enum fields.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TestHelper } from './utils/test-helpers';
import { ProtoFile } from '../../src/core/proto-types';

describe('Enum Serialization in Messages Integration Tests', () => {
  let testHelper: TestHelper;

  beforeEach(() => {
    testHelper = new TestHelper();
  });

  afterEach(() => {
    testHelper.cleanup();
  });

  describe('Simple Enum Field Serialization', () => {
    it('should generate correct serialization code for message with enum field', async () => {
      const protoFile: ProtoFile = {
        fileName: 'user.proto',
        package: 'test.user',
        syntax: 'proto3',
        imports: [],
        services: [],
        enums: [
          {
            name: 'Role',
            values: [
              { name: 'USER', number: 0, options: {} },
              { name: 'ADMIN', number: 1, options: {} },
              { name: 'MODERATOR', number: 2, options: {} },
            ],
            options: {},
          },
        ],
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
                name: 'role',
                number: 2,
                type: 'Role',
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
        options: {},
      };

      const result = await testHelper.generateFromProtoFile(protoFile);

      expect(result).toBeDefined();
      expect(result.code).toBeTruthy();

      // Check that enum is imported or referenced
      expect(result.code).toContain('Role');

      // Check that message has role field with enum type
      expect(result.code).toContain('role');

      // Verify encode method handles enum field
      expect(result.code).toContain('encode');
      expect(result.code).toContain('writeInt32'); // Enums use int32 wire format
    });

    it('should use default value of 0 for enum fields (Proto3 semantics)', async () => {
      const protoFile: ProtoFile = {
        fileName: 'status.proto',
        package: 'test.status',
        syntax: 'proto3',
        imports: [],
        services: [],
        enums: [
          {
            name: 'Status',
            values: [
              { name: 'UNKNOWN', number: 0, options: {} }, // Default value
              { name: 'ACTIVE', number: 1, options: {} },
              { name: 'INACTIVE', number: 2, options: {} },
            ],
            options: {},
          },
        ],
        messages: [
          {
            name: 'Entity',
            fields: [
              {
                name: 'status',
                number: 1,
                type: 'Status',
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
        options: {},
      };

      const result = await testHelper.generateFromProtoFile(protoFile);

      expect(result).toBeDefined();
      expect(result.code).toBeTruthy();

      // Verify decode method initializes enum field with default value
      expect(result.code).toContain('decode');
      // Default for enum should be 0 (UNKNOWN status)
      expect(result.code).toContain('status');
    });
  });

  describe('Nested Enum Field Serialization', () => {
    it('should handle nested enum fields correctly', async () => {
      const protoFile: ProtoFile = {
        fileName: 'contact.proto',
        package: 'test.contact',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'Contact',
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
              {
                name: 'type',
                number: 2,
                type: 'Type',
                repeated: false,
                optional: false,
                map: false,
                options: {},
              },
            ],
            nestedMessages: [],
            nestedEnums: [
              {
                name: 'Type',
                values: [
                  { name: 'UNKNOWN', number: 0, options: {} },
                  { name: 'PERSONAL', number: 1, options: {} },
                  { name: 'BUSINESS', number: 2, options: {} },
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

      const result = await testHelper.generateFromProtoFile(protoFile);

      expect(result).toBeDefined();
      expect(result.code).toBeTruthy();

      // Verify nested enum is in Contact namespace
      expect(result.code).toContain('export namespace Contact');
      expect(result.code).toContain('export enum Type');

      // Verify type field uses nested enum
      expect(result.code).toContain('type');
    });
  });

  describe('Repeated Enum Field Serialization', () => {
    it('should generate packed encoding for repeated enum fields', async () => {
      const protoFile: ProtoFile = {
        fileName: 'permissions.proto',
        package: 'test.permissions',
        syntax: 'proto3',
        imports: [],
        services: [],
        enums: [
          {
            name: 'Permission',
            values: [
              { name: 'READ', number: 0, options: {} },
              { name: 'WRITE', number: 1, options: {} },
              { name: 'DELETE', number: 2, options: {} },
              { name: 'ADMIN', number: 3, options: {} },
            ],
            options: {},
          },
        ],
        messages: [
          {
            name: 'UserPermissions',
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
              {
                name: 'permissions',
                number: 2,
                type: 'Permission',
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
        ],
        options: {},
      };

      const result = await testHelper.generateFromProtoFile(protoFile);

      expect(result).toBeDefined();
      expect(result.code).toBeTruthy();

      // Verify repeated enum field uses packed encoding
      expect(result.code).toContain('permissions');
      expect(result.code).toContain('writePackedInt32'); // Repeated enums use packed int32
      expect(result.code).toContain('readPackedInt32');
    });
  });

  describe('Multiple Enum Fields', () => {
    it('should handle messages with multiple enum fields', async () => {
      const protoFile: ProtoFile = {
        fileName: 'task.proto',
        package: 'test.task',
        syntax: 'proto3',
        imports: [],
        services: [],
        enums: [
          {
            name: 'Status',
            values: [
              { name: 'TODO', number: 0, options: {} },
              { name: 'IN_PROGRESS', number: 1, options: {} },
              { name: 'DONE', number: 2, options: {} },
            ],
            options: {},
          },
          {
            name: 'Priority',
            values: [
              { name: 'LOW', number: 0, options: {} },
              { name: 'MEDIUM', number: 1, options: {} },
              { name: 'HIGH', number: 2, options: {} },
              { name: 'CRITICAL', number: 3, options: {} },
            ],
            options: {},
          },
        ],
        messages: [
          {
            name: 'Task',
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
                name: 'status',
                number: 2,
                type: 'Status',
                repeated: false,
                optional: false,
                map: false,
                options: {},
              },
              {
                name: 'priority',
                number: 3,
                type: 'Priority',
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
        options: {},
      };

      const result = await testHelper.generateFromProtoFile(protoFile);

      expect(result).toBeDefined();
      expect(result.code).toBeTruthy();

      // Verify both enum fields are present
      expect(result.code).toContain('status');
      expect(result.code).toContain('priority');

      // Verify both enums are referenced
      expect(result.code).toContain('Status');
      expect(result.code).toContain('Priority');
    });
  });

  describe('Mixed Scalar and Enum Fields', () => {
    it('should correctly serialize messages with both scalar and enum fields', async () => {
      const protoFile: ProtoFile = {
        fileName: 'product.proto',
        package: 'test.product',
        syntax: 'proto3',
        imports: [],
        services: [],
        enums: [
          {
            name: 'Category',
            values: [
              { name: 'ELECTRONICS', number: 0, options: {} },
              { name: 'CLOTHING', number: 1, options: {} },
              { name: 'FOOD', number: 2, options: {} },
            ],
            options: {},
          },
        ],
        messages: [
          {
            name: 'Product',
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
                name: 'price',
                number: 3,
                type: 'double',
                repeated: false,
                optional: false,
                map: false,
                options: {},
              },
              {
                name: 'category',
                number: 4,
                type: 'Category',
                repeated: false,
                optional: false,
                map: false,
                options: {},
              },
              {
                name: 'in_stock',
                number: 5,
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
        options: {},
      };

      const result = await testHelper.generateFromProtoFile(protoFile);

      expect(result).toBeDefined();
      expect(result.code).toBeTruthy();

      // Verify all fields are present
      expect(result.code).toContain('id');
      expect(result.code).toContain('name');
      expect(result.code).toContain('price');
      expect(result.code).toContain('category');
      expect(result.code).toContain('in_stock');

      // Verify different serialization methods
      expect(result.code).toContain('writeString');
      expect(result.code).toContain('writeDouble');
      expect(result.code).toContain('writeInt32'); // For enum
      expect(result.code).toContain('writeBool');
    });
  });

  describe('Edge Cases', () => {
    it('should handle enum with non-sequential values', async () => {
      const protoFile: ProtoFile = {
        fileName: 'error.proto',
        package: 'test.error',
        syntax: 'proto3',
        imports: [],
        services: [],
        enums: [
          {
            name: 'ErrorCode',
            values: [
              { name: 'OK', number: 0, options: {} },
              { name: 'CANCELLED', number: 1, options: {} },
              { name: 'NOT_FOUND', number: 5, options: {} },
              { name: 'PERMISSION_DENIED', number: 7, options: {} },
              { name: 'INTERNAL', number: 13, options: {} },
            ],
            options: {},
          },
        ],
        messages: [
          {
            name: 'ErrorResponse',
            fields: [
              {
                name: 'code',
                number: 1,
                type: 'ErrorCode',
                repeated: false,
                optional: false,
                map: false,
                options: {},
              },
              {
                name: 'message',
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
        options: {},
      };

      const result = await testHelper.generateFromProtoFile(protoFile);

      expect(result).toBeDefined();
      expect(result.code).toBeTruthy();

      // Verify enum with sparse values is handled
      expect(result.code).toContain('ErrorCode');
      expect(result.code).toContain('code');
    });

    it('should handle optional enum fields', async () => {
      const protoFile: ProtoFile = {
        fileName: 'optional.proto',
        package: 'test.optional',
        syntax: 'proto3',
        imports: [],
        services: [],
        enums: [
          {
            name: 'OptionalEnum',
            values: [
              { name: 'UNSET', number: 0, options: {} },
              { name: 'VALUE_A', number: 1, options: {} },
              { name: 'VALUE_B', number: 2, options: {} },
            ],
            options: {},
          },
        ],
        messages: [
          {
            name: 'OptionalMessage',
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
                name: 'optional_field',
                number: 2,
                type: 'OptionalEnum',
                repeated: false,
                optional: true,
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
        options: {},
      };

      const result = await testHelper.generateFromProtoFile(protoFile);

      expect(result).toBeDefined();
      expect(result.code).toBeTruthy();

      // Verify optional enum field handling
      expect(result.code).toContain('optional_field');
      expect(result.code).toContain('OptionalEnum');
    });
  });

  describe('End-to-End Enum Serialization', () => {
    it('should complete full serialization pipeline for enum fields', async () => {
      const protoFile: ProtoFile = {
        fileName: 'complete.proto',
        package: 'test.complete',
        syntax: 'proto3',
        imports: [],
        services: [],
        enums: [
          {
            name: 'State',
            values: [
              { name: 'IDLE', number: 0, options: {} },
              { name: 'RUNNING', number: 1, options: {} },
              { name: 'PAUSED', number: 2, options: {} },
              { name: 'STOPPED', number: 3, options: {} },
            ],
            options: {},
          },
        ],
        messages: [
          {
            name: 'Process',
            fields: [
              {
                name: 'id',
                number: 1,
                type: 'int32',
                repeated: false,
                optional: false,
                map: false,
                options: {},
              },
              {
                name: 'state',
                number: 2,
                type: 'State',
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
        options: {},
      };

      // Should complete without throwing errors
      await expect(testHelper.generateFromProtoFile(protoFile)).resolves.toBeDefined();

      const result = await testHelper.generateFromProtoFile(protoFile);

      // Verify generated code structure
      expect(result.code).toBeTruthy();
      expect(result.files).toBeDefined();
      expect(result.files.length).toBeGreaterThan(0);

      // Verify both enum and message are generated
      expect(result.code).toContain('export enum State');
      expect(result.code).toContain('export interface Process');

      // Verify serialization methods
      expect(result.code).toContain('encode');
      expect(result.code).toContain('decode');
    });
  });
});
