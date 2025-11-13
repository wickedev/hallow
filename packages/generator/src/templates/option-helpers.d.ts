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
export declare const optionHelpers: {
    /**
     * Check if options exist and have content
     */
    hasOptions: (options?: TemplateOptionMetadata) => boolean;
    /**
     * Check if standard options exist
     */
    hasStandardOptions: (options?: TemplateOptionMetadata) => boolean;
    /**
     * Check if custom options exist
     */
    hasCustomOptions: (options?: TemplateOptionMetadata) => boolean;
    /**
     * Get a specific option value by name
     */
    getOption: (options?: TemplateOptionMetadata, name?: string) => ProcessedOption | undefined;
    /**
     * Check if a specific option exists
     */
    hasOption: (options?: TemplateOptionMetadata, name?: string) => boolean;
    /**
     * Get option value or default
     */
    getOptionValue: (options?: TemplateOptionMetadata, name?: string, defaultValue?: any) => any;
    /**
     * Check if an option has a specific value
     */
    optionEquals: (options?: TemplateOptionMetadata, name?: string, value?: any) => boolean;
    /**
     * Check if entity is deprecated
     */
    isDeprecated: (options?: TemplateOptionMetadata) => boolean;
    /**
     * Format option value for display
     */
    formatOptionValue: (option?: ProcessedOption) => string;
    /**
     * Generate JSDoc comment for options
     */
    generateOptionsComment: (options?: TemplateOptionMetadata) => string;
    /**
     * Generate metadata object for runtime access
     */
    generateMetadataObject: (options?: TemplateOptionMetadata) => string;
    /**
     * Filter options by type
     */
    filterOptions: (options?: TemplateOptionMetadata, type?: "standard" | "custom") => ProcessedOption[];
    /**
     * Check if option should be included in generated comments
     */
    shouldIncludeInComments: (option?: ProcessedOption) => boolean;
    /**
     * Generate deprecation warning if applicable
     */
    generateDeprecationWarning: (options?: TemplateOptionMetadata) => string;
    /**
     * Get all option names as array
     */
    getOptionNames: (options?: TemplateOptionMetadata) => string[];
    /**
     * Sort options by name
     */
    sortOptions: (options?: ProcessedOption[]) => ProcessedOption[];
};
/**
 * Register helpers with a Handlebars instance
 */
export declare function registerOptionHelpers(handlebars: any): void;
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
export declare const exampleTemplateWithOptions = "\n{{!-- Service template with options support --}}\n{{#each services}}\n{{#if options.hasOptions}}\n{{generateOptionsComment options}}\n{{/if}}\n{{#if (isDeprecated options)}}\n{{generateDeprecationWarning options}}\n{{/if}}\nexport class {{pascalName}}Stub {\n  {{#if options.hasOptions}}\n  /**\n   * Service options metadata\n   */\n  static readonly _options = {{{generateMetadataObject options}}};\n  {{/if}}\n  \n  constructor(private client: Client) {}\n  \n  {{#each methods}}\n  {{#if options.hasOptions}}\n  {{generateOptionsComment options}}\n  {{/if}}\n  {{#if (isDeprecated options)}}\n  {{generateDeprecationWarning options}}\n  {{/if}}\n  async {{camelName}}(request: {{inputType}}): Promise<{{outputType}}> {\n    {{#if options.hasOptions}}\n    // Method options: {{{generateMetadataObject options}}}\n    {{/if}}\n    // Implementation here\n  }\n  {{/each}}\n}\n{{/each}}\n\n{{!-- Message template with options support --}}\n{{#each messages}}\n{{#if options.hasOptions}}\n{{generateOptionsComment options}}\n{{/if}}\n{{#if (isDeprecated options)}}\n{{generateDeprecationWarning options}}\n{{/if}}\nexport interface {{interfaceName}} {\n  {{#if options.hasOptions}}\n  /** Message options metadata */\n  readonly _options?: {{{generateMetadataObject options}}};\n  {{/if}}\n  \n  {{#each fields}}\n  {{#if options.hasOptions}}\n  /** {{generateOptionsComment options}} */\n  {{/if}}\n  {{#if (isDeprecated options)}}\n  /** @deprecated {{#if options.optionsMap.deprecated}}{{options.optionsMap.deprecated.value}}{{else}}This field is deprecated{{/if}} */\n  {{/if}}\n  {{camelCaseName}}{{#if optional}}?{{/if}}: {{tsType}}{{#if repeated}}[]{{/if}};\n  {{/each}}\n}\n{{/each}}\n";
//# sourceMappingURL=option-helpers.d.ts.map