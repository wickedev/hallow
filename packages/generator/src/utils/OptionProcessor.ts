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
export const DEFAULT_OPTION_CONFIG: Required<OptionProcessorConfig> = {
  includeStandard: true,
  includeCustom: true,
  excludeStandard: [],
  excludeCustom: [],
  processNestedObjects: true,
};

/**
 * Utility class for processing proto options into structured metadata
 */
export class OptionProcessor {
  private config: Required<OptionProcessorConfig>;

  constructor(config: OptionProcessorConfig = {}) {
    this.config = { ...DEFAULT_OPTION_CONFIG, ...config };
  }

  /**
   * Process options from a proto definition into structured metadata
   */
  processOptions(options: Record<string, any>): OptionMetadata {
    const standard: Record<string, ProcessedOption> = {};
    const custom: Record<string, ProcessedOption> = {};
    const all: Record<string, ProcessedOption> = {};

    for (const [name, value] of Object.entries(options)) {
      const isCustom = this.isCustomOption(name);

      // Skip if excluded by configuration
      if (isCustom && this.config.excludeCustom.includes(name)) {
        continue;
      }
      if (!isCustom && this.config.excludeStandard.includes(name)) {
        continue;
      }

      // Skip if not included by configuration
      if (isCustom && !this.config.includeCustom) {
        continue;
      }
      if (!isCustom && !this.config.includeStandard) {
        continue;
      }

      const processedOption: ProcessedOption = {
        name,
        value: this.processValue(value),
        isCustom,
        rawValue: value,
      };

      all[name] = processedOption;

      if (isCustom) {
        custom[name] = processedOption;
      } else {
        standard[name] = processedOption;
      }
    }

    return {
      standard,
      custom,
      all,
      hasOptions: Object.keys(all).length > 0,
    };
  }

  /**
   * Check if an option name represents a custom option
   */
  private isCustomOption(name: string): boolean {
    return name.startsWith('(') && name.endsWith(')');
  }

  /**
   * Process a raw option value into a properly typed value
   */
  private processValue(value: any): string | number | boolean | object {
    if (value === null || value === undefined) {
      return value;
    }

    // Handle string values
    if (typeof value === 'string') {
      // Remove surrounding quotes if present
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        return value.slice(1, -1);
      }

      // Try to parse as boolean
      if (value.toLowerCase() === 'true') return true;
      if (value.toLowerCase() === 'false') return false;

      // Try to parse as number
      if (/^\d+$/.test(value)) {
        return parseInt(value, 10);
      }
      if (/^\d*\.\d+$/.test(value)) {
        return parseFloat(value);
      }

      return value;
    }

    // Handle numeric values
    if (typeof value === 'number') {
      return value;
    }

    // Handle boolean values
    if (typeof value === 'boolean') {
      return value;
    }

    // Handle object values (nested options)
    if (typeof value === 'object' && this.config.processNestedObjects) {
      if (Array.isArray(value)) {
        return value.map(item => this.processValue(item));
      }

      const processed: Record<string, any> = {};
      for (const [key, val] of Object.entries(value)) {
        processed[key] = this.processValue(val);
      }
      return processed;
    }

    // Return as-is for any other types
    return value;
  }

  /**
   * Extract specific option value by name
   */
  getOptionValue(options: Record<string, any>, optionName: string): any {
    return options[optionName];
  }

  /**
   * Check if a specific option exists
   */
  hasOption(options: Record<string, any>, optionName: string): boolean {
    return optionName in options;
  }

  /**
   * Get all custom option names from the options
   */
  getCustomOptionNames(options: Record<string, any>): string[] {
    return Object.keys(options).filter(name => this.isCustomOption(name));
  }

  /**
   * Get all standard option names from the options
   */
  getStandardOptionNames(options: Record<string, any>): string[] {
    return Object.keys(options).filter(name => !this.isCustomOption(name));
  }

  /**
   * Generate metadata for template rendering
   */
  generateTemplateMetadata(metadata: OptionMetadata): TemplateOptionMetadata {
    return {
      hasOptions: metadata.hasOptions,
      hasStandardOptions: Object.keys(metadata.standard).length > 0,
      hasCustomOptions: Object.keys(metadata.custom).length > 0,
      standardOptions: Object.values(metadata.standard),
      customOptions: Object.values(metadata.custom),
      allOptions: Object.values(metadata.all),
      optionsMap: metadata.all,
    };
  }
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
export class OptionHelpers {
  /**
   * Check if an entity is deprecated
   */
  static isDeprecated(options: Record<string, any>): boolean {
    return !!options.deprecated;
  }

  /**
   * Get Java package from options
   */
  static getJavaPackage(options: Record<string, any>): string | undefined {
    return options.java_package as string;
  }

  /**
   * Get Go package from options
   */
  static getGoPackage(options: Record<string, any>): string | undefined {
    return options.go_package as string;
  }

  /**
   * Get optimization mode from options
   */
  static getOptimizeFor(options: Record<string, any>): string | undefined {
    return options.optimize_for as string;
  }

  /**
   * Check if option allows alias for enums
   */
  static getAllowAlias(options: Record<string, any>): boolean {
    return !!options.allow_alias;
  }

  /**
   * Get field default value from options
   */
  static getDefaultValue(options: Record<string, any>): any {
    return options.default;
  }

  /**
   * Extract custom option by name (including parentheses)
   */
  static getCustomOption(options: Record<string, any>, name: string): any {
    const optionName = name.startsWith('(') ? name : `(${name})`;
    return options[optionName];
  }
}

/**
 * Default option processor instance
 */
export const defaultOptionProcessor = new OptionProcessor();
