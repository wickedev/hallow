/**
 * Unit tests for EnumGenerator
 *
 * Tests TypeScript enum generation, helper function generation,
 * nested enum handling, and various enum patterns.
 */

import {
  EnumGenerator,
  createEnumGenerator,
  GeneratedEnum,
} from '../../src/generators/EnumGenerator';
import { TemplateEngine } from '../../src/core/template-engine';
import { EnumDefinition, EnumValueDefinition } from '../../src/core/proto-types';

describe('EnumGenerator', () => {
  let generator: EnumGenerator;
  let templateEngine: TemplateEngine;

  beforeEach(() => {
    templateEngine = new TemplateEngine();
    generator = createEnumGenerator(templateEngine, {
      generateComments: true,
      generateHelpers: true,
      generateConstEnums: false,
    });
  });

  describe('generateEnum', () => {
    it('should generate a simple enum', () => {
      const enumDef: EnumDefinition = {
        name: 'Status',
        values: [
          { name: 'UNKNOWN', number: 0, options: {} },
          { name: 'ACTIVE', number: 1, options: {} },
          { name: 'INACTIVE', number: 2, options: {} },
        ],
        options: {},
      };

      const result = generator.generateEnum(enumDef);
      const code = generator.combineEnumCode(result);

      expect(code).toContain('export enum Status');
      expect(code).toContain('UNKNOWN = 0,');
      expect(code).toContain('ACTIVE = 1,');
      expect(code).toContain('INACTIVE = 2,');
    });

    it('should generate enum with comments', () => {
      const enumDef: EnumDefinition = {
        name: 'Priority',
        values: [
          { name: 'LOW', number: 0, options: {} },
          { name: 'MEDIUM', number: 1, options: {} },
          { name: 'HIGH', number: 2, options: {} },
        ],
        options: {},
      };

      const result = generator.generateEnum(enumDef);
      const code = generator.combineEnumCode(result);

      expect(code).toContain('/**');
      expect(code).toContain('* Enum Priority');
      expect(code).toContain('*/');
    });

    it('should generate enum helper functions', () => {
      const enumDef: EnumDefinition = {
        name: 'Color',
        values: [
          { name: 'RED', number: 0, options: {} },
          { name: 'GREEN', number: 1, options: {} },
          { name: 'BLUE', number: 2, options: {} },
        ],
        options: {},
      };

      const result = generator.generateEnum(enumDef);
      const code = generator.combineEnumCode(result);

      // Check for type guard function
      expect(code).toContain('export function isColor(value: any): value is Color');
      expect(code).toContain("return typeof value === 'number' && value in Color;");

      // Check for converter function
      expect(code).toContain('export function toColor(value: number): Color | undefined');
      expect(code).toContain('return isColor(value) ? value : undefined;');

      // Check for name getter function
      expect(code).toContain('export function getColorName(value: Color): string');
      expect(code).toContain('return Color[value];');
    });

    it('should handle enum with zero and non-zero values', () => {
      const enumDef: EnumDefinition = {
        name: 'ErrorCode',
        values: [
          { name: 'OK', number: 0, options: {} },
          { name: 'CANCELLED', number: 1, options: {} },
          { name: 'UNKNOWN', number: 2, options: {} },
          { name: 'INVALID_ARGUMENT', number: 3, options: {} },
          { name: 'NOT_FOUND', number: 5, options: {} },
        ],
        options: {},
      };

      const result = generator.generateEnum(enumDef);
      const code = generator.combineEnumCode(result);

      expect(code).toContain('OK = 0,');
      expect(code).toContain('CANCELLED = 1,');
      expect(code).toContain('NOT_FOUND = 5,');
    });

    it('should generate const enum when option is enabled', () => {
      const constGenerator = createEnumGenerator(templateEngine, {
        generateComments: false,
        generateHelpers: false,
        generateConstEnums: true,
      });

      const enumDef: EnumDefinition = {
        name: 'Role',
        values: [
          { name: 'USER', number: 0, options: {} },
          { name: 'ADMIN', number: 1, options: {} },
        ],
        options: {},
      };

      const result = constGenerator.generateEnum(enumDef);
      const code = constGenerator.combineEnumCode(result);

      expect(code).toContain('export const enum Role');
    });

    it('should not generate comments when disabled', () => {
      const noCommentGenerator = createEnumGenerator(templateEngine, {
        generateComments: false,
        generateHelpers: false,
      });

      const enumDef: EnumDefinition = {
        name: 'State',
        values: [{ name: 'IDLE', number: 0, options: {} }],
        options: {},
      };

      const result = noCommentGenerator.generateEnum(enumDef);
      const code = noCommentGenerator.combineEnumCode(result);

      expect(code).not.toContain('/**');
      expect(code).not.toContain('* Enum:');
    });

    it('should not generate helper functions when disabled', () => {
      const noHelperGenerator = createEnumGenerator(templateEngine, {
        generateComments: false,
        generateHelpers: false,
      });

      const enumDef: EnumDefinition = {
        name: 'Mode',
        values: [{ name: 'ON', number: 1, options: {} }],
        options: {},
      };

      const result = noHelperGenerator.generateEnum(enumDef);
      const code = noHelperGenerator.combineEnumCode(result);

      expect(code).not.toContain('export function isMode');
      expect(code).not.toContain('export function toMode');
      expect(code).not.toContain('export function getModeName');
    });
  });

  describe('generateNestedEnum', () => {
    it('should generate nested enum with parent message namespace', () => {
      const enumDef: EnumDefinition = {
        name: 'Type',
        values: [
          { name: 'UNKNOWN', number: 0, options: {} },
          { name: 'PERSONAL', number: 1, options: {} },
          { name: 'BUSINESS', number: 2, options: {} },
        ],
        options: {},
      };

      const result = generator.generateNestedEnum(enumDef, 'Contact');
      const code = generator.combineEnumCode(result);

      expect(code).toContain('export enum Type');
      expect(code).toContain('UNKNOWN = 0,');
      expect(code).toContain('PERSONAL = 1,');
      expect(code).toContain('BUSINESS = 2,');
    });

    it('should generate nested enum with full namespace path', () => {
      const enumDef: EnumDefinition = {
        name: 'Status',
        values: [
          { name: 'PENDING', number: 0, options: {} },
          { name: 'APPROVED', number: 1, options: {} },
        ],
        options: {},
      };

      const result = generator.generateNestedEnum(enumDef, 'Request', 'com.example');
      const code = generator.combineEnumCode(result);

      expect(code).toContain('export enum Status');
    });

    it('should generate helper functions for nested enum', () => {
      const enumDef: EnumDefinition = {
        name: 'Phase',
        values: [
          { name: 'INIT', number: 0, options: {} },
          { name: 'PROCESSING', number: 1, options: {} },
        ],
        options: {},
      };

      const result = generator.generateNestedEnum(enumDef, 'Job');
      const code = generator.combineEnumCode(result);

      expect(code).toContain('export function isPhase');
      expect(code).toContain('export function toPhase');
      expect(code).toContain('export function getPhaseName');
    });
  });

  describe('combineEnumCode', () => {
    it('should combine enum code with helper functions', () => {
      const generatedEnum: GeneratedEnum = {
        enumCode: 'export enum TestEnum { VALUE = 0 }',
        helpersCode: 'export function isTestEnum() { }',
        imports: [],
        exports: ['export { TestEnum }'],
      };

      const combined = generator.combineEnumCode(generatedEnum);

      expect(combined).toContain('export enum TestEnum');
      expect(combined).toContain('export function isTestEnum');
    });

    it('should handle enum without helper functions', () => {
      const generatedEnum: GeneratedEnum = {
        enumCode: 'export enum SimpleEnum { A = 1 }',
        imports: [],
        exports: ['export { SimpleEnum }'],
      };

      const combined = generator.combineEnumCode(generatedEnum);

      expect(combined).toContain('export enum SimpleEnum');
      expect(combined).not.toContain('export function');
    });
  });

  describe('edge cases', () => {
    it('should handle enum with single value', () => {
      const enumDef: EnumDefinition = {
        name: 'BinaryState',
        values: [{ name: 'TRUE', number: 1, options: {} }],
        options: {},
      };

      const result = generator.generateEnum(enumDef);
      const code = generator.combineEnumCode(result);

      expect(code).toContain('export enum BinaryState');
      expect(code).toContain('TRUE = 1,');
    });

    it('should handle enum with large number values', () => {
      const enumDef: EnumDefinition = {
        name: 'LargeEnum',
        values: [
          { name: 'MAX_INT32', number: 2147483647, options: {} },
          { name: 'HIGH_VALUE', number: 999999, options: {} },
        ],
        options: {},
      };

      const result = generator.generateEnum(enumDef);
      const code = generator.combineEnumCode(result);

      expect(code).toContain('MAX_INT32 = 2147483647,');
      expect(code).toContain('HIGH_VALUE = 999999,');
    });

    it('should handle enum with negative values', () => {
      const enumDef: EnumDefinition = {
        name: 'SignedEnum',
        values: [
          { name: 'NEGATIVE', number: -1, options: {} },
          { name: 'ZERO', number: 0, options: {} },
          { name: 'POSITIVE', number: 1, options: {} },
        ],
        options: {},
      };

      const result = generator.generateEnum(enumDef);
      const code = generator.combineEnumCode(result);

      expect(code).toContain('NEGATIVE = -1,');
      expect(code).toContain('ZERO = 0,');
      expect(code).toContain('POSITIVE = 1,');
    });

    it('should handle enum with non-sequential values', () => {
      const enumDef: EnumDefinition = {
        name: 'SparseEnum',
        values: [
          { name: 'FIRST', number: 0, options: {} },
          { name: 'TENTH', number: 10, options: {} },
          { name: 'HUNDREDTH', number: 100, options: {} },
        ],
        options: {},
      };

      const result = generator.generateEnum(enumDef);
      const code = generator.combineEnumCode(result);

      expect(code).toContain('FIRST = 0,');
      expect(code).toContain('TENTH = 10,');
      expect(code).toContain('HUNDREDTH = 100,');
    });
  });

  describe('option updates', () => {
    it('should update generator options', () => {
      const originalOptions = generator.getOptions();
      expect(originalOptions.generateHelpers).toBe(true);

      generator.updateOptions({ generateHelpers: false });

      const updatedOptions = generator.getOptions();
      expect(updatedOptions.generateHelpers).toBe(false);
    });

    it('should reflect option changes in generation', () => {
      const enumDef: EnumDefinition = {
        name: 'TestEnum',
        values: [{ name: 'VALUE', number: 0, options: {} }],
        options: {},
      };

      // Generate with helpers
      let result = generator.generateEnum(enumDef);
      let code = generator.combineEnumCode(result);
      expect(code).toContain('export function isTestEnum');

      // Update options to disable helpers
      generator.updateOptions({ generateHelpers: false });

      // Generate again without helpers
      result = generator.generateEnum(enumDef);
      code = generator.combineEnumCode(result);
      expect(code).not.toContain('export function isTestEnum');
    });
  });

  describe('factory function', () => {
    it('should create generator instance with default options', () => {
      const newGenerator = createEnumGenerator(templateEngine);
      const options = newGenerator.getOptions();

      expect(options.generateComments).toBe(true);
      expect(options.generateHelpers).toBe(true);
      expect(options.generateConstEnums).toBe(false);
    });

    it('should create generator instance with custom options', () => {
      const newGenerator = createEnumGenerator(templateEngine, {
        generateComments: false,
        generateHelpers: false,
        generateConstEnums: true,
      });
      const options = newGenerator.getOptions();

      expect(options.generateComments).toBe(false);
      expect(options.generateHelpers).toBe(false);
      expect(options.generateConstEnums).toBe(true);
    });
  });

  describe('exports', () => {
    it('should generate correct export statements', () => {
      const enumDef: EnumDefinition = {
        name: 'ExportTest',
        values: [{ name: 'VALUE', number: 0, options: {} }],
        options: {},
      };

      const result = generator.generateEnum(enumDef);

      expect(result.exports).toContain('export { ExportTest }');
      expect(result.exports).toContain(
        'export { isExportTest, toExportTest, getExportTestName }',
      );
    });

    it('should not export helper functions when disabled', () => {
      const noHelperGenerator = createEnumGenerator(templateEngine, {
        generateHelpers: false,
      });

      const enumDef: EnumDefinition = {
        name: 'NoHelpers',
        values: [{ name: 'VALUE', number: 0, options: {} }],
        options: {},
      };

      const result = noHelperGenerator.generateEnum(enumDef);

      expect(result.exports).toContain('export { NoHelpers }');
      expect(result.exports).not.toContain('isNoHelpers');
    });
  });
});
