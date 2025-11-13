/**
 * EnumGenerator - TypeScript enum code generation from proto enum definitions
 *
 * This class handles the generation of TypeScript enums from proto enum
 * definitions, including support for top-level enums, nested enums within messages,
 * and helper functions for type guards and conversions.
 */
import { TemplateEngine } from '../core/template-engine';
import { EnumDefinition } from '../core/proto-types';
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
 * EnumGenerator class for generating TypeScript enums
 */
export declare class EnumGenerator {
    private templateEngine;
    private nameResolver;
    private importManager;
    private optionProcessor;
    private options;
    constructor(templateEngine: TemplateEngine, options?: EnumGeneratorOptions);
    /**
     * Load Handlebars templates for enum generation
     */
    private loadTemplates;
    /**
     * Generate TypeScript enum from top-level enum definition
     * @param enumDef Proto enum definition
     * @param namespace Optional namespace for scoping
     * @returns Generated enum code
     */
    generateEnum(enumDef: EnumDefinition, namespace?: string): GeneratedEnum;
    /**
     * Generate nested enum within message namespace
     * @param enumDef Proto enum definition
     * @param parentMessageName Parent message name for namespace scoping
     * @param namespace Optional additional namespace
     * @returns Generated enum code
     */
    generateNestedEnum(enumDef: EnumDefinition, parentMessageName: string, namespace?: string): GeneratedEnum;
    /**
     * Create enum context for template rendering
     */
    private createEnumContext;
    /**
     * Create enum value context for template rendering
     */
    private createEnumValueContext;
    /**
     * Generate enum code programmatically (fallback)
     */
    private generateEnumProgrammatically;
    /**
     * Generate helper functions for enum
     */
    private generateHelpers;
    /**
     * Combine enum code with helper functions
     */
    combineEnumCode(generated: GeneratedEnum): string;
    /**
     * Update generator options
     */
    updateOptions(options: Partial<EnumGeneratorOptions>): void;
    /**
     * Get current generator options
     */
    getOptions(): Readonly<Required<EnumGeneratorOptions>>;
}
/**
 * Create an EnumGenerator instance
 */
export declare function createEnumGenerator(templateEngine: TemplateEngine, options?: EnumGeneratorOptions): EnumGenerator;
//# sourceMappingURL=EnumGenerator.d.ts.map