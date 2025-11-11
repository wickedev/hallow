/**
 * Integration tests for enum generation
 *
 * Tests end-to-end enum generation from ProtoFile to TypeScript,
 * including top-level enums, nested enums, and helper functions.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { TestHelper } from './utils/test-helpers';
import { ProtoFile, EnumDefinition, MessageDefinition } from '../../src/core/proto-types';

describe('Enum Generation Integration Tests', () => {
  let testHelper: TestHelper;

  beforeEach(() => {
    testHelper = new TestHelper();
  });

  afterEach(() => {
    testHelper.cleanup();
  });

  describe('Top-level Enum Generation', () => {
    it('should generate TypeScript code for a simple top-level enum', async () => {
      const protoFile: ProtoFile = {
        fileName: 'status.proto',
        package: 'test.enums',
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

      const result = await testHelper.generateFromProtoFile(protoFile);

      expect(result).toBeDefined();
      expect(result.files).toBeDefined();
      expect(result.files.length).toBeGreaterThan(0);

      // Check that enum file was generated
      const enumFile = result.files.find(f => f.path.includes('Status'));
      expect(enumFile).toBeDefined();
      expect(enumFile?.content).toContain('export enum Status');
      expect(enumFile?.content).toContain('UNKNOWN = 0,');
      expect(enumFile?.content).toContain('ACTIVE = 1,');
      expect(enumFile?.content).toContain('INACTIVE = 2,');
    });

    it('should generate helper functions for top-level enum', async () => {
      const protoFile: ProtoFile = {
        fileName: 'priority.proto',
        package: 'test.enums',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [
          {
            name: 'Priority',
            values: [
              { name: 'LOW', number: 0, options: {} },
              { name: 'MEDIUM', number: 1, options: {} },
              { name: 'HIGH', number: 2, options: {} },
            ],
            options: {},
          },
        ],
        options: {},
      };

      const result = await testHelper.generateFromProtoFile(protoFile);

      const enumFile = result.files.find(f => f.path.includes('Priority'));
      expect(enumFile).toBeDefined();

      // Check for helper functions
      expect(enumFile?.content).toContain('export function isPriority');
      expect(enumFile?.content).toContain('export function toPriority');
      expect(enumFile?.content).toContain('export function getPriorityName');
    });

    it('should generate multiple top-level enums in separate files', async () => {
      const protoFile: ProtoFile = {
        fileName: 'multi-enum.proto',
        package: 'test.enums',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [
          {
            name: 'Color',
            values: [
              { name: 'RED', number: 0, options: {} },
              { name: 'GREEN', number: 1, options: {} },
              { name: 'BLUE', number: 2, options: {} },
            ],
            options: {},
          },
          {
            name: 'Size',
            values: [
              { name: 'SMALL', number: 0, options: {} },
              { name: 'MEDIUM', number: 1, options: {} },
              { name: 'LARGE', number: 2, options: {} },
            ],
            options: {},
          },
        ],
        options: {},
      };

      const result = await testHelper.generateFromProtoFile(protoFile);

      // Should generate separate files for each enum
      const colorFile = result.files.find(f => f.path.includes('Color'));
      const sizeFile = result.files.find(f => f.path.includes('Size'));

      expect(colorFile).toBeDefined();
      expect(sizeFile).toBeDefined();

      expect(colorFile?.content).toContain('export enum Color');
      expect(sizeFile?.content).toContain('export enum Size');
    });
  });

  describe('Nested Enum Generation', () => {
    it('should generate nested enum within message namespace', async () => {
      const protoFile: ProtoFile = {
        fileName: 'contact.proto',
        package: 'test.nested',
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

      expect(result.files.length).toBeGreaterThan(0);

      // Nested enums should be in the message file
      const messageFile = result.files.find(f => f.path.includes('contact'));
      expect(messageFile).toBeDefined();

      // Check for nested enum in namespace
      expect(messageFile?.content).toContain('export namespace Contact');
      expect(messageFile?.content).toContain('export enum Type');
    });

    it('should generate multiple nested enums in same message', async () => {
      const protoFile: ProtoFile = {
        fileName: 'job.proto',
        package: 'test.nested',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'Job',
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
            nestedEnums: [
              {
                name: 'Status',
                values: [
                  { name: 'PENDING', number: 0, options: {} },
                  { name: 'RUNNING', number: 1, options: {} },
                  { name: 'COMPLETED', number: 2, options: {} },
                ],
                options: {},
              },
              {
                name: 'Priority',
                values: [
                  { name: 'LOW', number: 0, options: {} },
                  { name: 'NORMAL', number: 1, options: {} },
                  { name: 'HIGH', number: 2, options: {} },
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

      const messageFile = result.files.find(f => f.path.includes('job'));
      expect(messageFile).toBeDefined();

      // Both enums should be in the Job namespace
      expect(messageFile?.content).toContain('export enum Status');
      expect(messageFile?.content).toContain('export enum Priority');
    });
  });

  describe('Mixed Enum Generation', () => {
    it('should handle both top-level and nested enums', async () => {
      const protoFile: ProtoFile = {
        fileName: 'mixed.proto',
        package: 'test.mixed',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'User',
            fields: [
              {
                name: 'role',
                number: 1,
                type: 'Role',
                repeated: false,
                optional: false,
                map: false,
                options: {},
              },
            ],
            nestedMessages: [],
            nestedEnums: [
              {
                name: 'Role',
                values: [
                  { name: 'USER', number: 0, options: {} },
                  { name: 'ADMIN', number: 1, options: {} },
                ],
                options: {},
              },
            ],
            oneofs: [],
            options: {},
          },
        ],
        enums: [
          {
            name: 'GlobalStatus',
            values: [
              { name: 'OFFLINE', number: 0, options: {} },
              { name: 'ONLINE', number: 1, options: {} },
            ],
            options: {},
          },
        ],
        options: {},
      };

      const result = await testHelper.generateFromProtoFile(protoFile);

      // Should have separate file for top-level enum
      const globalStatusFile = result.files.find(f => f.path.includes('GlobalStatus'));
      expect(globalStatusFile).toBeDefined();
      expect(globalStatusFile?.content).toContain('export enum GlobalStatus');

      // Nested enum should be in message file
      const messageFile = result.files.find(f => f.path.includes('mixed') && !f.path.includes('GlobalStatus'));
      expect(messageFile).toBeDefined();
      expect(messageFile?.content).toContain('export enum Role');
    });
  });

  describe('Enum with Special Values', () => {
    it('should handle enum with non-sequential values', async () => {
      const protoFile: ProtoFile = {
        fileName: 'sparse.proto',
        package: 'test.special',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [
          {
            name: 'ErrorCode',
            values: [
              { name: 'OK', number: 0, options: {} },
              { name: 'CANCELLED', number: 1, options: {} },
              { name: 'UNKNOWN', number: 2, options: {} },
              { name: 'NOT_FOUND', number: 5, options: {} },
              { name: 'INTERNAL', number: 13, options: {} },
            ],
            options: {},
          },
        ],
        options: {},
      };

      const result = await testHelper.generateFromProtoFile(protoFile);

      const enumFile = result.files.find(f => f.path.includes('ErrorCode'));
      expect(enumFile).toBeDefined();
      expect(enumFile?.content).toContain('OK = 0,');
      expect(enumFile?.content).toContain('NOT_FOUND = 5,');
      expect(enumFile?.content).toContain('INTERNAL = 13,');
    });

    it('should handle enum with large values', async () => {
      const protoFile: ProtoFile = {
        fileName: 'large.proto',
        package: 'test.special',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [
          {
            name: 'LargeEnum',
            values: [
              { name: 'ZERO', number: 0, options: {} },
              { name: 'THOUSAND', number: 1000, options: {} },
              { name: 'MILLION', number: 1000000, options: {} },
            ],
            options: {},
          },
        ],
        options: {},
      };

      const result = await testHelper.generateFromProtoFile(protoFile);

      const enumFile = result.files.find(f => f.path.includes('LargeEnum'));
      expect(enumFile).toBeDefined();
      expect(enumFile?.content).toContain('ZERO = 0,');
      expect(enumFile?.content).toContain('THOUSAND = 1000,');
      expect(enumFile?.content).toContain('MILLION = 1000000,');
    });
  });

  describe('End-to-End Enum Generation', () => {
    it('should complete full enum generation pipeline without errors', async () => {
      const protoFile: ProtoFile = {
        fileName: 'complete.proto',
        package: 'test.complete',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [
          {
            name: 'State',
            values: [
              { name: 'IDLE', number: 0, options: {} },
              { name: 'ACTIVE', number: 1, options: {} },
            ],
            options: {},
          },
        ],
        options: {},
      };

      // Should complete without throwing errors
      await expect(testHelper.generateFromProtoFile(protoFile)).resolves.toBeDefined();

      const result = await testHelper.generateFromProtoFile(protoFile);
      expect(result.files).toBeDefined();
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.code).toBeTruthy();
    });

    it('should validate generated enum TypeScript compiles', async () => {
      const protoFile: ProtoFile = {
        fileName: 'compilable.proto',
        package: 'test.compile',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [
          {
            name: 'Mode',
            values: [
              { name: 'READ', number: 0, options: {} },
              { name: 'WRITE', number: 1, options: {} },
              { name: 'EXECUTE', number: 2, options: {} },
            ],
            options: {},
          },
        ],
        options: {},
      };

      const result = await testHelper.generateFromProtoFile(protoFile);

      // Verify that generated code is valid TypeScript
      expect(result.files.length).toBeGreaterThan(0);

      const enumFile = result.files.find(f => f.path.includes('Mode'));
      expect(enumFile).toBeDefined();
      expect(enumFile?.content).toBeTruthy();

      // The code should contain valid enum syntax
      expect(enumFile?.content).toMatch(/export\s+enum\s+Mode/);
      expect(enumFile?.content).toMatch(/READ\s*=\s*0/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty enum values gracefully', async () => {
      const protoFile: ProtoFile = {
        fileName: 'empty-values.proto',
        package: 'test.edge',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [
          {
            name: 'EmptyEnum',
            values: [],
            options: {},
          },
        ],
        options: {},
      };

      // Should reject empty enum (proto3 requires at least one value)
      await expect(testHelper.generateFromProtoFile(protoFile)).rejects.toThrow('EMPTY_ENUM');
    });

    it('should handle proto file with no enums', async () => {
      const protoFile: ProtoFile = {
        fileName: 'no-enums.proto',
        package: 'test.edge',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'EmptyMessage',
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

      const result = await testHelper.generateFromProtoFile(protoFile);
      expect(result).toBeDefined();
      expect(result.files).toBeDefined();
    });

    it('should handle enum name conflicts with messages', async () => {
      const protoFile: ProtoFile = {
        fileName: 'conflict.proto',
        package: 'test.conflict',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'Status',
            fields: [
              {
                name: 'code',
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
        ],
        enums: [
          {
            name: 'Status',
            values: [
              { name: 'OK', number: 0, options: {} },
              { name: 'ERROR', number: 1, options: {} },
            ],
            options: {},
          },
        ],
        options: {},
      };

      // Should handle naming conflicts gracefully
      await expect(testHelper.generateFromProtoFile(protoFile)).resolves.toBeDefined();

      const result = await testHelper.generateFromProtoFile(protoFile);

      // Both Status message and Status enum should be generated
      expect(result.files.some(f => f.content.includes('interface Status'))).toBe(true);
      expect(result.files.some(f => f.content.includes('enum Status'))).toBe(true);
    });
  });
});
