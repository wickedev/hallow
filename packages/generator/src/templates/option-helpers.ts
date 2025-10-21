/**
 * Handlebars helpers for option metadata generation
 * 
 * This module provides template helpers that make it easy to work with
 * option metadata in Handlebars templates.
 */

import { TemplateOptionMetadata, ProcessedOption } from '../utils/OptionProcessor';

/**
 * Handlebars helpers for option processing
 */
export const optionHelpers = {
  /**
   * Check if options exist and have content
   */
  hasOptions: (options?: TemplateOptionMetadata): boolean => {
    return !!(options && options.hasOptions);
  },

  /**
   * Check if standard options exist
   */
  hasStandardOptions: (options?: TemplateOptionMetadata): boolean => {
    return !!(options && options.hasStandardOptions);
  },

  /**
   * Check if custom options exist
   */
  hasCustomOptions: (options?: TemplateOptionMetadata): boolean => {
    return !!(options && options.hasCustomOptions);
  },

  /**
   * Get a specific option value by name
   */
  getOption: (options?: TemplateOptionMetadata, name?: string): ProcessedOption | undefined => {
    if (!options || !name) return undefined;
    return options.optionsMap[name];
  },

  /**
   * Check if a specific option exists
   */
  hasOption: (options?: TemplateOptionMetadata, name?: string): boolean => {
    if (!options || !name) return false;
    return name in options.optionsMap;
  },

  /**
   * Get option value or default
   */
  getOptionValue: (options?: TemplateOptionMetadata, name?: string, defaultValue?: any): any => {
    if (!options || !name) return defaultValue;
    const option = options.optionsMap[name];
    return option ? option.value : defaultValue;
  },

  /**
   * Check if an option has a specific value
   */
  optionEquals: (options?: TemplateOptionMetadata, name?: string, value?: any): boolean => {
    if (!options || !name) return false;
    const option = options.optionsMap[name];
    return option ? option.value === value : false;
  },

  /**
   * Check if entity is deprecated
   */
  isDeprecated: (options?: TemplateOptionMetadata): boolean => {
    return !!(options && options.optionsMap.deprecated?.value);
  },

  /**
   * Format option value for display
   */
  formatOptionValue: (option?: ProcessedOption): string => {
    if (!option) return '';
    
    if (typeof option.value === 'string') {
      return `"${option.value}"`;
    }
    
    if (typeof option.value === 'boolean' || typeof option.value === 'number') {
      return String(option.value);
    }
    
    if (typeof option.value === 'object') {
      return JSON.stringify(option.value);
    }
    
    return String(option.value);
  },

  /**
   * Generate JSDoc comment for options
   */
  generateOptionsComment: (options?: TemplateOptionMetadata): string => {
    if (!options || !options.hasOptions) return '';
    
    const lines: string[] = [];
    
    if (options.hasStandardOptions) {
      lines.push(' * Standard options:');
      options.standardOptions.forEach(option => {
        lines.push(` *   ${option.name}: ${optionHelpers.formatOptionValue(option)}`);
      });
    }
    
    if (options.hasCustomOptions) {
      lines.push(' * Custom options:');
      options.customOptions.forEach(option => {
        lines.push(` *   ${option.name}: ${optionHelpers.formatOptionValue(option)}`);
      });
    }
    
    return lines.length > 0 ? lines.join('\n') : '';
  },

  /**
   * Generate metadata object for runtime access
   */
  generateMetadataObject: (options?: TemplateOptionMetadata): string => {
    if (!options || !options.hasOptions) return 'undefined';
    
    const metadata: Record<string, any> = {};
    
    options.allOptions.forEach(option => {
      metadata[option.name] = {
        value: option.value,
        isCustom: option.isCustom,
        rawValue: option.rawValue,
      };
    });
    
    return JSON.stringify(metadata, null, 2);
  },

  /**
   * Filter options by type
   */
  filterOptions: (
    options?: TemplateOptionMetadata, 
    type?: 'standard' | 'custom'
  ): ProcessedOption[] => {
    if (!options) return [];
    
    switch (type) {
      case 'standard':
        return options.standardOptions;
      case 'custom':
        return options.customOptions;
      default:
        return options.allOptions;
    }
  },

  /**
   * Check if option should be included in generated comments
   */
  shouldIncludeInComments: (option?: ProcessedOption): boolean => {
    if (!option) return false;
    
    // Exclude internal options that shouldn't be shown to users
    const excludeFromComments = [
      'java_package',
      'go_package',
      'optimize_for',
      'cc_enable_arenas',
    ];
    
    return !excludeFromComments.includes(option.name);
  },

  /**
   * Generate deprecation warning if applicable
   */
  generateDeprecationWarning: (options?: TemplateOptionMetadata): string => {
    if (!optionHelpers.isDeprecated(options)) return '';
    
    const deprecatedOption = options?.optionsMap.deprecated;
    const message = typeof deprecatedOption?.value === 'string' 
      ? deprecatedOption.value 
      : 'This element is deprecated';
    
    return `/**\n * @deprecated ${message}\n */`;
  },

  /**
   * Get all option names as array
   */
  getOptionNames: (options?: TemplateOptionMetadata): string[] => {
    if (!options) return [];
    return options.allOptions.map(option => option.name);
  },

  /**
   * Sort options by name
   */
  sortOptions: (options?: ProcessedOption[]): ProcessedOption[] => {
    if (!options) return [];
    return [...options].sort((a, b) => a.name.localeCompare(b.name));
  },
};

/**
 * Register helpers with a Handlebars instance
 */
export function registerOptionHelpers(handlebars: any): void {
  Object.entries(optionHelpers).forEach(([name, helper]) => {
    handlebars.registerHelper(name, helper);
  });
}

/**
 * Template metadata for services with options
 */
export interface ServiceWithOptionsMetadata {
  name: string;
  pascalName: string;
  description?: string;
  options?: TemplateOptionMetadata;
  methods: Array<{
    name: string;
    pascalName: string;
    camelName: string;
    inputType: string;
    outputType: string;
    clientStreaming: boolean;
    serverStream: boolean;
    description?: string;
    options?: TemplateOptionMetadata;
  }>;
}

/**
 * Template metadata for messages with options
 */
export interface MessageWithOptionsMetadata {
  name: string;
  interfaceName: string;
  namespace?: string;
  options?: TemplateOptionMetadata;
  fields: Array<{
    name: string;
    camelCaseName: string;
    number: number;
    type: string;
    tsType: string;
    repeated: boolean;
    optional: boolean;
    comment?: string;
    options?: TemplateOptionMetadata;
  }>;
}

/**
 * Example template usage with options
 */
export const exampleTemplateWithOptions = `
{{!-- Service template with options support --}}
{{#each services}}
{{#if options.hasOptions}}
{{generateOptionsComment options}}
{{/if}}
{{#if (isDeprecated options)}}
{{generateDeprecationWarning options}}
{{/if}}
export class {{pascalName}}Stub {
  {{#if options.hasOptions}}
  /**
   * Service options metadata
   */
  static readonly _options = {{{generateMetadataObject options}}};
  {{/if}}
  
  constructor(private client: Client) {}
  
  {{#each methods}}
  {{#if options.hasOptions}}
  {{generateOptionsComment options}}
  {{/if}}
  {{#if (isDeprecated options)}}
  {{generateDeprecationWarning options}}
  {{/if}}
  async {{camelName}}(request: {{inputType}}): Promise<{{outputType}}> {
    {{#if options.hasOptions}}
    // Method options: {{{generateMetadataObject options}}}
    {{/if}}
    // Implementation here
  }
  {{/each}}
}
{{/each}}

{{!-- Message template with options support --}}
{{#each messages}}
{{#if options.hasOptions}}
{{generateOptionsComment options}}
{{/if}}
{{#if (isDeprecated options)}}
{{generateDeprecationWarning options}}
{{/if}}
export interface {{interfaceName}} {
  {{#if options.hasOptions}}
  /** Message options metadata */
  readonly _options?: {{{generateMetadataObject options}}};
  {{/if}}
  
  {{#each fields}}
  {{#if options.hasOptions}}
  /** {{generateOptionsComment options}} */
  {{/if}}
  {{#if (isDeprecated options)}}
  /** @deprecated {{#if options.optionsMap.deprecated}}{{options.optionsMap.deprecated.value}}{{else}}This field is deprecated{{/if}} */
  {{/if}}
  {{camelCaseName}}{{#if optional}}?{{/if}}: {{tsType}}{{#if repeated}}[]{{/if}};
  {{/each}}
}
{{/each}}
`;
