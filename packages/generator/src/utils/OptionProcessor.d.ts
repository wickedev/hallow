/**
 * OptionProcessor - Processes and extracts metadata from proto options
 *
 * This utility class processes custom options and standard options from
 * proto definitions and converts them into metadata objects that can be
 * included in generated code.
 */
/**
 * Represents a processed option with typed value
 */
export interface ProcessedOption {
    /**
     * Option name (e.g., "deprecated", "java_package", "(custom_option)")
     */
    name: string;
    /**
     * Processed option value with proper typing
     */
    value: string | number | boolean | object;
    /**
     * Whether this is a custom option (wrapped in parentheses)
     */
    isCustom: boolean;
    /**
     * Original raw value as it appears in the proto
     */
    rawValue: any;
}
/**
 * Metadata container for options at different scopes
 */
export interface OptionMetadata {
    /**
     * Standard protobuf options (e.g., deprecated, java_package)
     */
    standard: Record<string, ProcessedOption>;
    /**
     * Custom options (e.g., (my_option))
     */
    custom: Record<string, ProcessedOption>;
    /**
     * All options as a flat map for easy access
     */
    all: Record<string, ProcessedOption>;
    /**
     * Whether any options are present
     */
    hasOptions: boolean;
}
/**
 * Configuration for option processing
 */
export interface OptionProcessorConfig {
    /**
     * Whether to include standard protobuf options
     */
    includeStandard?: boolean;
    /**
     * Whether to include custom options
     */
    includeCustom?: boolean;
    /**
     * List of standard options to exclude
     */
    excludeStandard?: string[];
    /**
     * List of custom options to exclude
     */
    excludeCustom?: string[];
    /**
     * Whether to process nested object values
     */
    processNestedObjects?: boolean;
}
/**
 * Default configuration for option processing
 */
export declare const DEFAULT_OPTION_CONFIG: Required<OptionProcessorConfig>;
/**
 * Utility class for processing proto options into structured metadata
 */
export declare class OptionProcessor {
    private config;
    constructor(config?: OptionProcessorConfig);
    /**
     * Process options from a proto definition into structured metadata
     */
    processOptions(options: Record<string, any>): OptionMetadata;
    /**
     * Check if an option name represents a custom option
     */
    private isCustomOption;
    /**
     * Process a raw option value into a properly typed value
     */
    private processValue;
    /**
     * Extract specific option value by name
     */
    getOptionValue(options: Record<string, any>, optionName: string): any;
    /**
     * Check if a specific option exists
     */
    hasOption(options: Record<string, any>, optionName: string): boolean;
    /**
     * Get all custom option names from the options
     */
    getCustomOptionNames(options: Record<string, any>): string[];
    /**
     * Get all standard option names from the options
     */
    getStandardOptionNames(options: Record<string, any>): string[];
    /**
     * Generate metadata for template rendering
     */
    generateTemplateMetadata(metadata: OptionMetadata): TemplateOptionMetadata;
}
/**
 * Template-friendly option metadata for Handlebars rendering
 */
export interface TemplateOptionMetadata {
    hasOptions: boolean;
    hasStandardOptions: boolean;
    hasCustomOptions: boolean;
    standardOptions: ProcessedOption[];
    customOptions: ProcessedOption[];
    allOptions: ProcessedOption[];
    optionsMap: Record<string, ProcessedOption>;
}
/**
 * Helper functions for common option patterns
 */
export declare class OptionHelpers {
    /**
     * Check if an entity is deprecated
     */
    static isDeprecated(options: Record<string, any>): boolean;
    /**
     * Get Java package from options
     */
    static getJavaPackage(options: Record<string, any>): string | undefined;
    /**
     * Get Go package from options
     */
    static getGoPackage(options: Record<string, any>): string | undefined;
    /**
     * Get optimization mode from options
     */
    static getOptimizeFor(options: Record<string, any>): string | undefined;
    /**
     * Check if option allows alias for enums
     */
    static getAllowAlias(options: Record<string, any>): boolean;
    /**
     * Get field default value from options
     */
    static getDefaultValue(options: Record<string, any>): any;
    /**
     * Extract custom option by name (including parentheses)
     */
    static getCustomOption(options: Record<string, any>, name: string): any;
}
/**
 * Default option processor instance
 */
export declare const defaultOptionProcessor: OptionProcessor;
//# sourceMappingURL=OptionProcessor.d.ts.map