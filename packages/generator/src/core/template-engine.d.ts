import * as Handlebars from 'handlebars';
/**
 * Template data context for code generation
 */
export interface TemplateContext {
    [key: string]: any;
}
/**
 * Template compilation options
 */
export interface TemplateOptions {
    /**
     * Whether to enable strict mode for templates
     */
    strict?: boolean;
    /**
     * Custom helper functions
     */
    helpers?: Record<string, Handlebars.HelperDelegate>;
    /**
     * Custom partials
     */
    partials?: Record<string, string>;
    /**
     * Enable template caching
     */
    cache?: boolean;
}
/**
 * Template metadata
 */
export interface TemplateMetadata {
    name: string;
    path: string;
    lastModified: Date;
    compiled: boolean;
}
/**
 * Template engine for processing Handlebars templates
 * Provides template loading, caching, and rendering capabilities
 */
export declare class TemplateEngine {
    private readonly templates;
    private readonly templateMetadata;
    private readonly templatePaths;
    private readonly handlebars;
    private readonly options;
    constructor(options?: TemplateOptions);
    /**
     * Load template from file system
     * @param templateName Name of the template
     * @param templatePath Path to the template file
     */
    loadTemplate(templateName: string, templatePath: string): Promise<void>;
    /**
     * Load template from string content
     * @param templateName Name of the template
     * @param content Template content
     */
    loadTemplateFromString(templateName: string, content: string): void;
    /**
     * Load templates from directory
     * @param templateDir Directory containing template files
     * @param pattern File pattern to match (default: *.hbs)
     */
    loadTemplatesFromDirectory(templateDir: string, pattern?: string): Promise<void>;
    /**
     * Render template with context data
     * @param templateName Name of the template to render
     * @param context Data context for the template
     * @returns Rendered template output
     */
    render(templateName: string, context: TemplateContext): string;
    /**
     * Check if template needs reloading (file has been modified)
     * @param templateName Name of the template
     * @returns True if template needs reloading
     */
    needsReload(templateName: string): Promise<boolean>;
    /**
     * Reload template if necessary
     * @param templateName Name of the template
     */
    reloadIfNecessary(templateName: string): Promise<void>;
    /**
     * Get list of loaded templates
     * @returns Array of template metadata
     */
    getLoadedTemplates(): TemplateMetadata[];
    /**
     * Clear template cache
     */
    clearCache(): void;
    /**
     * Register a custom helper function
     * @param name Helper name
     * @param helper Helper function
     */
    registerHelper(name: string, helper: Handlebars.HelperDelegate): void;
    /**
     * Register a partial template
     * @param name Partial name
     * @param content Partial content
     */
    registerPartial(name: string, content: string): void;
    /**
     * Validate template syntax
     * @param content Template content
     * @param templateName Template name for error reporting
     */
    private validateTemplate;
    /**
     * Setup default helper functions for code generation
     */
    private setupDefaultHelpers;
    /**
     * Register custom helpers from options
     */
    private registerCustomHelpers;
    /**
     * Register custom partials from options
     */
    private registerCustomPartials;
}
/**
 * Template engine factory for creating instances with common configurations
 */
export declare class TemplateEngineFactory {
    /**
     * Create a template engine for service stub generation
     */
    static createForServices(options?: TemplateOptions): TemplateEngine;
    /**
     * Create a template engine for message type generation
     */
    static createForMessages(options?: TemplateOptions): TemplateEngine;
    /**
     * Create a template engine for React hook generation
     */
    static createForReactHooks(options?: TemplateOptions): TemplateEngine;
}
//# sourceMappingURL=template-engine.d.ts.map