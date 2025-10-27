/**
 * EnumGenerator - TypeScript enum code generation from proto enum definitions
 *
 * This class handles the generation of TypeScript enums from proto enum
 * definitions, including support for top-level enums, nested enums within messages,
 * and helper functions for type guards and conversions.
 */

import { TemplateEngine } from '../core/template-engine';
import { EnumDefinition, EnumValueDefinition } from '../core/proto-types';
import { NameResolver } from '../utils/NameResolver';
import { ImportManager } from '../utils/ImportManager';
import { OptionProcessor, TemplateOptionMetadata } from '../utils/OptionProcessor';

/**
 * Options for enum generation
 */
export interface EnumGeneratorOptions {
  /**
   * Whether to generate JSDoc comments
   */
  generateComments?: boolean;

  /**
   * Whether to generate helper functions (type guards, converters)
   */
  generateHelpers?: boolean;

  /**
   * Whether to generate const enums (for better tree-shaking)
   */
  generateConstEnums?: boolean;

  /**
   * Whether to include option metadata in generated code
   */
  includeOptionMetadata?: boolean;

  /**
   * Configuration for option processing
   */
  optionProcessing?: {
    includeStandard?: boolean;
    includeCustom?: boolean;
    excludeStandard?: string[];
    excludeCustom?: string[];
    processNestedObjects?: boolean;
  };
}

/**
 * Generated enum code structure
 */
export interface GeneratedEnum {
  /**
   * TypeScript enum definition
   */
  enumCode: string;

  /**
   * Helper functions code (type guards, converters)
   */
  helpersCode?: string;

  /**
   * Import statements required
   */
  imports: string[];

  /**
   * Export statements
   */
  exports: string[];
}

/**
 * Enum context for template rendering
 */
interface EnumContext {
  name: string;
  enumName: string;
  namespace?: string;
  values: EnumValueContext[];
  generateHelpers: boolean;
  generateComments: boolean;
  isConstEnum: boolean;
  options?: TemplateOptionMetadata;
}

/**
 * Enum value context for template rendering
 */
interface EnumValueContext {
  name: string;
  number: number;
  comment?: string;
  options?: TemplateOptionMetadata;
}

/**
 * EnumGenerator class for generating TypeScript enums
 */
export class EnumGenerator {
  private templateEngine: TemplateEngine;
  private nameResolver: NameResolver;
  private importManager: ImportManager;
  private optionProcessor: OptionProcessor;
  private options: Required<EnumGeneratorOptions>;

  constructor(templateEngine: TemplateEngine, options: EnumGeneratorOptions = {}) {
    this.templateEngine = templateEngine;
    this.options = {
      generateComments: options.generateComments ?? true,
      generateHelpers: options.generateHelpers ?? true,
      generateConstEnums: options.generateConstEnums ?? false,
      includeOptionMetadata: options.includeOptionMetadata ?? false,
      optionProcessing: options.optionProcessing || {},
    };

    this.nameResolver = new NameResolver();
    this.importManager = new ImportManager();
    this.optionProcessor = new OptionProcessor(this.options.optionProcessing);

    // Load templates
    this.loadTemplates();
  }

  /**
   * Load Handlebars templates for enum generation
   */
  private loadTemplates(): void {
    // Templates will be loaded from .hbs files by the TemplateEngine
    // when templateDir is provided to Generator constructor.
    // No need to load default string templates anymore.
  }

  /**
   * Generate TypeScript enum from top-level enum definition
   * @param enumDef Proto enum definition
   * @param namespace Optional namespace for scoping
   * @returns Generated enum code
   */
  public generateEnum(enumDef: EnumDefinition, namespace?: string): GeneratedEnum {
    const context = this.createEnumContext(enumDef, namespace);

    try {
      // Use template for enum generation
      const enumCode = this.templateEngine.render('enum', context);
      const helpersCode = this.options.generateHelpers
        ? this.generateHelpers(context)
        : undefined;

      // Collect imports and exports
      const imports = this.importManager.generateImports().split('\n').filter(Boolean);
      const exports = [`export { ${context.enumName} }`];

      if (this.options.generateHelpers) {
        exports.push(
          `export { is${context.enumName}, to${context.enumName}, get${context.enumName}Name }`,
        );
      }

      return {
        enumCode,
        helpersCode,
        imports,
        exports,
      };
    } catch (error) {
      // Fallback to programmatic generation if template fails
      return this.generateEnumProgrammatically(context);
    }
  }

  /**
   * Generate nested enum within message namespace
   * @param enumDef Proto enum definition
   * @param parentMessageName Parent message name for namespace scoping
   * @param namespace Optional additional namespace
   * @returns Generated enum code
   */
  public generateNestedEnum(
    enumDef: EnumDefinition,
    parentMessageName: string,
    namespace?: string,
  ): GeneratedEnum {
    // For nested enums, we include the parent message name in the namespace
    const nestedNamespace = namespace
      ? `${namespace}.${parentMessageName}`
      : parentMessageName;

    const context = this.createEnumContext(enumDef, nestedNamespace);

    try {
      // Use template for nested enum generation
      const enumCode = this.templateEngine.render('enum', context);
      const helpersCode = this.options.generateHelpers
        ? this.generateHelpers(context)
        : undefined;

      const imports = this.importManager.generateImports().split('\n').filter(Boolean);
      const exports = [`export { ${context.enumName} }`];

      if (this.options.generateHelpers) {
        exports.push(
          `export { is${context.enumName}, to${context.enumName}, get${context.enumName}Name }`,
        );
      }

      return {
        enumCode,
        helpersCode,
        imports,
        exports,
      };
    } catch (error) {
      // Fallback to programmatic generation
      return this.generateEnumProgrammatically(context);
    }
  }

  /**
   * Create enum context for template rendering
   */
  private createEnumContext(enumDef: EnumDefinition, namespace?: string): EnumContext {
    const enumName = this.nameResolver.resolveTypeName(enumDef.name, false);

    const values = enumDef.values.map(value => this.createEnumValueContext(value));

    // Process enum-level options if enabled
    let enumOptions: TemplateOptionMetadata | undefined;
    if (this.options.includeOptionMetadata && enumDef.options) {
      const optionMetadata = this.optionProcessor.processOptions(enumDef.options);
      enumOptions = this.optionProcessor.generateTemplateMetadata(optionMetadata);
    }

    return {
      name: enumDef.name,
      enumName,
      namespace,
      values,
      generateHelpers: this.options.generateHelpers,
      generateComments: this.options.generateComments,
      isConstEnum: this.options.generateConstEnums,
      options: enumOptions,
    };
  }

  /**
   * Create enum value context for template rendering
   */
  private createEnumValueContext(value: EnumValueDefinition): EnumValueContext {
    // Process enum value-level options if enabled
    let valueOptions: TemplateOptionMetadata | undefined;
    if (this.options.includeOptionMetadata && value.options) {
      const optionMetadata = this.optionProcessor.processOptions(value.options);
      valueOptions = this.optionProcessor.generateTemplateMetadata(optionMetadata);
    }

    return {
      name: value.name,
      number: value.number,
      comment: this.options.generateComments
        ? `Value ${value.name} = ${value.number}`
        : undefined,
      options: valueOptions,
    };
  }

  /**
   * Generate enum code programmatically (fallback)
   */
  private generateEnumProgrammatically(context: EnumContext): GeneratedEnum {
    const lines: string[] = [];

    // Add JSDoc comment if enabled
    if (context.generateComments) {
      lines.push('/**');
      if (context.namespace) {
        lines.push(` * Enum ${context.name} (nested in ${context.namespace})`);
      } else {
        lines.push(` * Enum ${context.name}`);
      }
      lines.push(' */');
    }

    // Start enum declaration
    const constPrefix = context.isConstEnum ? 'const ' : '';
    lines.push(`export ${constPrefix}enum ${context.enumName} {`);

    // Add enum values
    context.values.forEach(value => {
      if (value.comment) {
        lines.push(`  /** ${value.comment} */`);
      }
      lines.push(`  ${value.name} = ${value.number},`);
    });

    // Close enum
    lines.push('}');

    const enumCode = lines.join('\n');
    const helpersCode = context.generateHelpers ? this.generateHelpers(context) : undefined;

    const imports: string[] = [];
    const exports = [`export { ${context.enumName} }`];

    if (context.generateHelpers) {
      exports.push(
        `export { is${context.enumName}, to${context.enumName}, get${context.enumName}Name }`,
      );
    }

    return {
      enumCode,
      helpersCode,
      imports,
      exports,
    };
  }

  /**
   * Generate helper functions for enum
   */
  private generateHelpers(context: EnumContext): string {
    const lines: string[] = [];

    // Generate type guard function
    lines.push('');
    if (context.generateComments) {
      lines.push('/**');
      lines.push(` * Type guard to check if a value is a valid ${context.enumName}`);
      lines.push(' * @param value - Value to check');
      lines.push(` * @returns True if value is a valid ${context.enumName}`);
      lines.push(' */');
    }
    lines.push(
      `export function is${context.enumName}(value: any): value is ${context.enumName} {`,
    );
    lines.push(`  return typeof value === 'number' && value in ${context.enumName};`);
    lines.push('}');

    // Generate converter function (number to enum)
    lines.push('');
    if (context.generateComments) {
      lines.push('/**');
      lines.push(` * Convert a number to ${context.enumName}`);
      lines.push(' * @param value - Number value to convert');
      lines.push(` * @returns ${context.enumName} or undefined if invalid`);
      lines.push(' */');
    }
    lines.push(
      `export function to${context.enumName}(value: number): ${context.enumName} | undefined {`,
    );
    lines.push(`  return is${context.enumName}(value) ? value : undefined;`);
    lines.push('}');

    // Generate name getter function (enum to string name)
    lines.push('');
    if (context.generateComments) {
      lines.push('/**');
      lines.push(` * Get the string name of a ${context.enumName} value`);
      lines.push(` * @param value - ${context.enumName} value`);
      lines.push(' * @returns String name of the enum value');
      lines.push(' */');
    }
    lines.push(
      `export function get${context.enumName}Name(value: ${context.enumName}): string {`,
    );
    lines.push(`  return ${context.enumName}[value];`);
    lines.push('}');

    return lines.join('\n');
  }

  /**
   * Combine enum code with helper functions
   */
  public combineEnumCode(generated: GeneratedEnum): string {
    const parts: string[] = [];

    // Add enum definition
    parts.push(generated.enumCode);

    // Add helper functions if present
    if (generated.helpersCode) {
      parts.push(generated.helpersCode);
    }

    return parts.join('\n\n');
  }

  /**
   * Update generator options
   */
  public updateOptions(options: Partial<EnumGeneratorOptions>): void {
    this.options = {
      ...this.options,
      ...options,
    };

    // Update option processor if processing config changed
    if (options.optionProcessing) {
      this.optionProcessor = new OptionProcessor({
        ...this.options.optionProcessing,
        ...options.optionProcessing,
      });
    }
  }

  /**
   * Get current generator options
   */
  public getOptions(): Readonly<Required<EnumGeneratorOptions>> {
    return { ...this.options };
  }
}

/**
 * Create an EnumGenerator instance
 */
export function createEnumGenerator(
  templateEngine: TemplateEngine,
  options?: EnumGeneratorOptions,
): EnumGenerator {
  return new EnumGenerator(templateEngine, options);
}
