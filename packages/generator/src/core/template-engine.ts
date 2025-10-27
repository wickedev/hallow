import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { GenerationError, GenerationErrorCode } from './types';

/**
 * Template data context for code generation
 */
export interface TemplateContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
export class TemplateEngine {
  private readonly templates: Map<string, Handlebars.TemplateDelegate> = new Map();
  private readonly templateMetadata: Map<string, TemplateMetadata> = new Map();
  private readonly templatePaths: Map<string, string> = new Map();
  private readonly handlebars: typeof Handlebars;
  private readonly options: Required<TemplateOptions>;

  constructor(options: TemplateOptions = {}) {
    this.handlebars = Handlebars.create();
    this.options = {
      strict: options.strict ?? true,
      helpers: options.helpers ?? {},
      partials: options.partials ?? {},
      cache: options.cache ?? true,
    };

    this.setupDefaultHelpers();
    this.registerCustomHelpers();
    this.registerCustomPartials();
  }

  /**
   * Load template from file system
   * @param templateName Name of the template
   * @param templatePath Path to the template file
   */
  async loadTemplate(templateName: string, templatePath: string): Promise<void> {
    try {
      if (!fs.existsSync(templatePath)) {
        throw new GenerationError(
          `Template file not found: ${templatePath}`,
          GenerationErrorCode.TEMPLATE_NOT_FOUND,
        );
      }

      const content = await fs.promises.readFile(templatePath, 'utf-8');
      const stats = await fs.promises.stat(templatePath);

      this.validateTemplate(content, templateName);

      const compiled = this.handlebars.compile(content, {
        strict: this.options.strict,
        noEscape: true, // TypeScript code generation should not escape HTML
      });

      this.templates.set(templateName, compiled);
      this.templatePaths.set(templateName, templatePath);
      this.templateMetadata.set(templateName, {
        name: templateName,
        path: templatePath,
        lastModified: stats.mtime,
        compiled: true,
      });
    } catch (error) {
      if (error instanceof GenerationError) {
        throw error;
      }
      throw new GenerationError(
        `Failed to load template '${templateName}': ${error instanceof Error ? error.message : String(error)}`,
        GenerationErrorCode.TEMPLATE_PARSE_ERROR,
        error,
      );
    }
  }

  /**
   * Load template from string content
   * @param templateName Name of the template
   * @param content Template content
   */
  loadTemplateFromString(templateName: string, content: string): void {
    try {
      this.validateTemplate(content, templateName);

      const compiled = this.handlebars.compile(content, {
        strict: this.options.strict,
        noEscape: true,
      });

      this.templates.set(templateName, compiled);
      this.templateMetadata.set(templateName, {
        name: templateName,
        path: '<string>',
        lastModified: new Date(),
        compiled: true,
      });
    } catch (error) {
      throw new GenerationError(
        `Failed to compile template '${templateName}': ${error instanceof Error ? error.message : String(error)}`,
        GenerationErrorCode.TEMPLATE_PARSE_ERROR,
        error,
      );
    }
  }

  /**
   * Load templates from directory
   * @param templateDir Directory containing template files
   * @param pattern File pattern to match (default: *.hbs)
   */
  async loadTemplatesFromDirectory(templateDir: string, pattern: string = '*.hbs'): Promise<void> {
    try {
      if (!fs.existsSync(templateDir)) {
        throw new GenerationError(
          `Template directory not found: ${templateDir}`,
          GenerationErrorCode.TEMPLATE_NOT_FOUND,
        );
      }

      const files = await fs.promises.readdir(templateDir);
      const templateFiles = files.filter(file => {
        if (pattern === '*.hbs') {
          return file.endsWith('.hbs');
        }
        // Simple pattern matching - can be enhanced with glob support
        return file.includes(pattern.replace('*', ''));
      });

      const loadPromises = templateFiles.map(async file => {
        const templateName = path.basename(file, path.extname(file));
        const templatePath = path.join(templateDir, file);
        await this.loadTemplate(templateName, templatePath);
      });

      await Promise.all(loadPromises);
    } catch (error) {
      if (error instanceof GenerationError) {
        throw error;
      }
      throw new GenerationError(
        `Failed to load templates from directory '${templateDir}': ${error instanceof Error ? error.message : String(error)}`,
        GenerationErrorCode.TEMPLATE_NOT_FOUND,
        error,
      );
    }
  }

  /**
   * Render template with context data
   * @param templateName Name of the template to render
   * @param context Data context for the template
   * @returns Rendered template output
   */
  render(templateName: string, context: TemplateContext): string {
    try {
      if (!this.templates.has(templateName)) {
        throw new GenerationError(
          `Template '${templateName}' not found. Available templates: ${Array.from(this.templates.keys()).join(', ')}`,
          GenerationErrorCode.TEMPLATE_NOT_FOUND,
        );
      }

      const template = this.templates.get(templateName)!;
      const result = template(context);

      return result;
    } catch (error) {
      if (error instanceof GenerationError) {
        throw error;
      }
      throw new GenerationError(
        `Failed to render template '${templateName}': ${error instanceof Error ? error.message : String(error)}`,
        GenerationErrorCode.TEMPLATE_PARSE_ERROR,
        error,
      );
    }
  }

  /**
   * Check if template needs reloading (file has been modified)
   * @param templateName Name of the template
   * @returns True if template needs reloading
   */
  async needsReload(templateName: string): Promise<boolean> {
    if (!this.options.cache) {
      return true;
    }

    const metadata = this.templateMetadata.get(templateName);
    const templatePath = this.templatePaths.get(templateName);

    if (!metadata || !templatePath || templatePath === '<string>') {
      return false;
    }

    try {
      const stats = await fs.promises.stat(templatePath);
      return stats.mtime > metadata.lastModified;
    } catch {
      return true; // File might have been deleted
    }
  }

  /**
   * Reload template if necessary
   * @param templateName Name of the template
   */
  async reloadIfNecessary(templateName: string): Promise<void> {
    if (await this.needsReload(templateName)) {
      const templatePath = this.templatePaths.get(templateName);
      if (templatePath && templatePath !== '<string>') {
        await this.loadTemplate(templateName, templatePath);
      }
    }
  }

  /**
   * Get list of loaded templates
   * @returns Array of template metadata
   */
  getLoadedTemplates(): TemplateMetadata[] {
    return Array.from(this.templateMetadata.values());
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templates.clear();
    this.templateMetadata.clear();
    this.templatePaths.clear();
  }

  /**
   * Register a custom helper function
   * @param name Helper name
   * @param helper Helper function
   */
  registerHelper(name: string, helper: Handlebars.HelperDelegate): void {
    this.handlebars.registerHelper(name, helper);
  }

  /**
   * Register a partial template
   * @param name Partial name
   * @param content Partial content
   */
  registerPartial(name: string, content: string): void {
    this.handlebars.registerPartial(name, content);
  }

  /**
   * Validate template syntax
   * @param content Template content
   * @param templateName Template name for error reporting
   */
  private validateTemplate(content: string, templateName: string): void {
    try {
      // Try to parse the template to check for syntax errors
      this.handlebars.parse(content);
    } catch (error) {
      throw new GenerationError(
        `Template syntax error in '${templateName}': ${error instanceof Error ? error.message : String(error)}`,
        GenerationErrorCode.TEMPLATE_PARSE_ERROR,
        error,
      );
    }
  }

  /**
   * Setup default helper functions for code generation
   */
  private setupDefaultHelpers(): void {
    // Camel case helper
    this.handlebars.registerHelper('camelCase', (str: string) => {
      if (!str) return '';
      return str.charAt(0).toLowerCase() + str.slice(1);
    });

    // Pascal case helper
    this.handlebars.registerHelper('pascalCase', (str: string) => {
      if (!str) return '';
      return str.charAt(0).toUpperCase() + str.slice(1);
    });

    // Snake case helper
    this.handlebars.registerHelper('snakeCase', (str: string) => {
      if (!str) return '';
      return str.replace(/[A-Z]/g, (match, offset) =>
        offset > 0 ? `_${match.toLowerCase()}` : match.toLowerCase(),
      );
    });

    // Kebab case helper
    this.handlebars.registerHelper('kebabCase', (str: string) => {
      if (!str) return '';
      return str.replace(/[A-Z]/g, (match, offset) =>
        offset > 0 ? `-${match.toLowerCase()}` : match.toLowerCase(),
      );
    });

    // Join helper for arrays
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.handlebars.registerHelper('join', (arr: any[], separator: string = ', ') => {
      if (!Array.isArray(arr)) return '';
      return arr.join(separator);
    });

    // Indent helper for code formatting
    this.handlebars.registerHelper('indent', (content: string, spaces: number = 2) => {
      if (!content) return '';
      const indentation = ' '.repeat(spaces);
      return content
        .split('\n')
        .map(line => (line ? indentation + line : line))
        .join('\n');
    });

    // Comment helper for JSDoc generation
    this.handlebars.registerHelper('comment', (content: string, type: string = 'block') => {
      if (!content) return '';
      if (type === 'line') {
        return `// ${content}`;
      }
      return `/**\n * ${content.split('\n').join('\n * ')}\n */`;
    });

    // Conditional helper for optional code generation
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, 
       @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
    this.handlebars.registerHelper('ifExists', function (this: any, value: any, options: any) {
      if (value !== undefined && value !== null && value !== '') {
        return options.fn(this);
      }
      return options.inverse(this);
    });
    /* eslint-enable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-return, 
       @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */

    // Type mapping helper
    this.handlebars.registerHelper('mapType', (protoType: string) => {
      const typeMapping: Record<string, string> = {
        string: 'string',
        int32: 'number',
        int64: 'number',
        uint32: 'number',
        uint64: 'number',
        float: 'number',
        double: 'number',
        bool: 'boolean',
        bytes: 'Uint8Array',
      };
      return typeMapping[protoType] || protoType;
    });

    // Equality comparison helper
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.handlebars.registerHelper('eq', (a: any, b: any) => a === b);
  }

  /**
   * Register custom helpers from options
   */
  private registerCustomHelpers(): void {
    Object.entries(this.options.helpers).forEach(([name, helper]) => {
      this.handlebars.registerHelper(name, helper);
    });
  }

  /**
   * Register custom partials from options
   */
  private registerCustomPartials(): void {
    Object.entries(this.options.partials).forEach(([name, content]) => {
      this.handlebars.registerPartial(name, content);
    });
  }
}

/**
 * Template engine factory for creating instances with common configurations
 */
export class TemplateEngineFactory {
  /**
   * Create a template engine for service stub generation
   */
  static createForServices(options: TemplateOptions = {}): TemplateEngine {
    return new TemplateEngine({
      ...options,
      helpers: {
        ...options.helpers,
        // Add service-specific helpers here
      },
    });
  }

  /**
   * Create a template engine for message type generation
   */
  static createForMessages(options: TemplateOptions = {}): TemplateEngine {
    return new TemplateEngine({
      ...options,
      helpers: {
        ...options.helpers,
        // Add message-specific helpers here
      },
    });
  }

  /**
   * Create a template engine for React hook generation
   */
  static createForReactHooks(options: TemplateOptions = {}): TemplateEngine {
    return new TemplateEngine({
      ...options,
      helpers: {
        ...options.helpers,
        // Add React-specific helpers here
      },
    });
  }
}
