/**
 * Template processing optimization for improved performance
 */

import * as Handlebars from 'handlebars';
import { createHash } from 'crypto';

export interface TemplateOptimizationOptions {
  cacheCompiledTemplates?: boolean;
  maxCacheSize?: number;
  precompile?: boolean;
  minifyOutput?: boolean;
  inlinePartials?: boolean;
  lazyCompilation?: boolean;
}

export interface TemplateStats {
  templatesCompiled: number;
  templatesCached: number;
  cacheHits: number;
  cacheMisses: number;
  totalCompilationTime: number;
  totalRenderTime: number;
  averageCompilationTime: number;
  averageRenderTime: number;
  cacheHitRate: number;
}

interface CachedTemplate {
  compiled: HandlebarsTemplateDelegate;
  hash: string;
  lastUsed: number;
  useCount: number;
  compilationTime: number;
  size: number;
}

/**
 * Optimized template processor with caching and performance improvements
 */
export class TemplateOptimizer {
  private options: Required<TemplateOptimizationOptions>;
  private templateCache: Map<string, CachedTemplate> = new Map();
  private partialCache: Map<string, string> = new Map();
  private stats: TemplateStats;
  private handlebars: typeof Handlebars;

  constructor(options: TemplateOptimizationOptions = {}) {
    this.options = {
      cacheCompiledTemplates: options.cacheCompiledTemplates ?? true,
      maxCacheSize: options.maxCacheSize ?? 100,
      precompile: options.precompile ?? false,
      minifyOutput: options.minifyOutput ?? false,
      inlinePartials: options.inlinePartials ?? true,
      lazyCompilation: options.lazyCompilation ?? true,
    };

    this.stats = {
      templatesCompiled: 0,
      templatesCached: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalCompilationTime: 0,
      totalRenderTime: 0,
      averageCompilationTime: 0,
      averageRenderTime: 0,
      cacheHitRate: 0,
    };

    // Create isolated Handlebars instance for thread safety
    this.handlebars = Handlebars.create();
    this.registerHelpers();
  }

  /**
   * Compile and cache a template
   */
  async compileTemplate(name: string, source: string): Promise<HandlebarsTemplateDelegate> {
    const hash = this.hashTemplate(source);

    // Check cache first
    if (this.options.cacheCompiledTemplates) {
      const cached = this.getCachedTemplate(name, hash);
      if (cached) {
        this.stats.cacheHits++;
        this.updateCacheHitRate();
        return cached.compiled;
      }
    }

    this.stats.cacheMisses++;

    // Optimize template source before compilation
    const optimizedSource = this.optimizeTemplateSource(source);

    const startTime = Date.now();

    // Compile template
    const compiled = this.handlebars.compile(optimizedSource, {
      noEscape: false,
      preventIndent: this.options.minifyOutput,
      strict: true,
      assumeObjects: true,
      knownHelpers: {
        if: true,
        unless: true,
        each: true,
        with: true,
        eq: true,
        ne: true,
        lt: true,
        gt: true,
        and: true,
        or: true,
      },
      knownHelpersOnly: false,
    });

    const compilationTime = Date.now() - startTime;
    this.stats.templatesCompiled++;
    this.stats.totalCompilationTime += compilationTime;
    this.updateAverages();

    // Cache the compiled template
    if (this.options.cacheCompiledTemplates) {
      this.cacheTemplate(name, {
        compiled,
        hash,
        lastUsed: Date.now(),
        useCount: 0,
        compilationTime,
        size: source.length,
      });
    }

    return compiled;
  }

  /**
   * Render a template with data
   */
  async render(templateName: string, data: any): Promise<string> {
    const startTime = Date.now();

    try {
      // Get compiled template (from cache or compile)
      let template = this.templateCache.get(templateName)?.compiled;

      if (!template) {
        // Template not in cache, need to compile
        // In real usage, the template source would be loaded from file system
        throw new Error(`Template ${templateName} not found in cache`);
      }

      // Optimize data before rendering
      const optimizedData = this.optimizeRenderData(data);

      // Render template
      let output = template(optimizedData);

      // Post-process output if needed
      if (this.options.minifyOutput) {
        output = this.minifyOutput(output);
      }

      const renderTime = Date.now() - startTime;
      this.stats.totalRenderTime += renderTime;
      this.updateAverages();

      // Update cache usage stats
      const cached = this.templateCache.get(templateName);
      if (cached) {
        cached.lastUsed = Date.now();
        cached.useCount++;
      }

      return output;
    } catch (error) {
      console.error(`[TemplateOptimizer] Error rendering template ${templateName}:`, error);
      throw error;
    }
  }

  /**
   * Precompile all templates for better performance
   */
  async precompileTemplates(templates: Map<string, string>): Promise<void> {
    const compilationPromises: Promise<void>[] = [];

    for (const [name, source] of templates) {
      if (this.options.lazyCompilation) {
        // Skip compilation, will compile on first use
        continue;
      }

      compilationPromises.push(this.compileTemplate(name, source).then(() => {}));
    }

    await Promise.all(compilationPromises);
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHelpers(): void {
    // Comparison helpers
    this.handlebars.registerHelper('eq', (a, b) => a === b);
    this.handlebars.registerHelper('ne', (a, b) => a !== b);
    this.handlebars.registerHelper('lt', (a, b) => a < b);
    this.handlebars.registerHelper('gt', (a, b) => a > b);
    this.handlebars.registerHelper('lte', (a, b) => a <= b);
    this.handlebars.registerHelper('gte', (a, b) => a >= b);

    // Logical helpers
    this.handlebars.registerHelper('and', (...args) => {
      const values = args.slice(0, -1); // Remove options object
      return values.every(v => v);
    });

    this.handlebars.registerHelper('or', (...args) => {
      const values = args.slice(0, -1); // Remove options object
      return values.some(v => v);
    });

    // String helpers
    this.handlebars.registerHelper('capitalize', (str: string) => {
      return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
    });

    this.handlebars.registerHelper('lowercase', (str: string) => {
      return str ? str.toLowerCase() : '';
    });

    this.handlebars.registerHelper('uppercase', (str: string) => {
      return str ? str.toUpperCase() : '';
    });

    // Array helpers
    this.handlebars.registerHelper('join', (arr: any[], separator: string) => {
      return Array.isArray(arr) ? arr.join(separator || ', ') : '';
    });

    this.handlebars.registerHelper('first', (arr: any[]) => {
      return Array.isArray(arr) ? arr[0] : undefined;
    });

    this.handlebars.registerHelper('last', (arr: any[]) => {
      return Array.isArray(arr) ? arr[arr.length - 1] : undefined;
    });

    // Performance-optimized helpers
    this.handlebars.registerHelper('cache', (key: string, options: any) => {
      // Cache helper output for repeated blocks
      const cacheKey = `helper_${key}`;
      let cached = this.partialCache.get(cacheKey);

      if (!cached) {
        cached = options.fn(options.data.root);
        if (cached) {
          this.partialCache.set(cacheKey, cached);
        }
      }

      return cached || '';
    });
  }

  /**
   * Optimize template source before compilation
   */
  private optimizeTemplateSource(source: string): string {
    let optimized = source;

    // Remove unnecessary whitespace
    if (this.options.minifyOutput) {
      optimized = optimized.replace(/\s+/g, ' ').replace(/>\s+</g, '><').replace(/\n\s*/g, '');
    }

    // Inline small partials
    if (this.options.inlinePartials) {
      optimized = this.inlinePartials(optimized);
    }

    // Optimize common patterns
    optimized = this.optimizePatterns(optimized);

    return optimized;
  }

  /**
   * Inline partials for better performance
   */
  private inlinePartials(source: string): string {
    const partialRegex = /\{\{>\s*(\w+)\s*\}\}/g;

    return source.replace(partialRegex, (match, partialName) => {
      const partial = this.partialCache.get(partialName);

      if (partial && partial.length < 500) {
        // Inline small partials
        return partial;
      }

      return match;
    });
  }

  /**
   * Optimize common template patterns
   */
  private optimizePatterns(source: string): string {
    // Optimize {{#if}} {{else}} {{/if}} to ternary-like structure
    source = source.replace(
      /\{\{#if\s+(\w+)\}\}(.*?)\{\{else\}\}(.*?)\{\{\/if\}\}/g,
      (match, condition, ifBlock, elseBlock) => {
        if (ifBlock.length < 50 && elseBlock.length < 50) {
          return `{{#if ${condition}}}${ifBlock}{{else}}${elseBlock}{{/if}}`;
        }
        return match;
      },
    );

    // Optimize {{#each}} for arrays
    source = source.replace(/\{\{#each\s+(\w+)\}\}/g, '{{#each $1 as |item index|}}');

    return source;
  }

  /**
   * Optimize render data for better performance
   */
  private optimizeRenderData(data: any): any {
    // Remove undefined and null values to reduce processing
    const cleanData = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(cleanData);
      }

      if (obj && typeof obj === 'object') {
        const cleaned: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value !== undefined && value !== null) {
            cleaned[key] = cleanData(value);
          }
        }
        return cleaned;
      }

      return obj;
    };

    return cleanData(data);
  }

  /**
   * Minify template output
   */
  private minifyOutput(output: string): string {
    return output
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .replace(/\n\s*/g, '')
      .replace(/<!--.*?-->/g, '')
      .trim();
  }

  /**
   * Get cached template if available and valid
   */
  private getCachedTemplate(name: string, hash: string): CachedTemplate | undefined {
    const cached = this.templateCache.get(name);

    if (cached && cached.hash === hash) {
      return cached;
    }

    return undefined;
  }

  /**
   * Cache a compiled template
   */
  private cacheTemplate(name: string, template: CachedTemplate): void {
    // Enforce cache size limit
    if (this.templateCache.size >= this.options.maxCacheSize) {
      this.evictLeastUsed();
    }

    this.templateCache.set(name, template);
    this.stats.templatesCached = this.templateCache.size;
  }

  /**
   * Evict least recently used template from cache
   */
  private evictLeastUsed(): void {
    let leastUsed: [string, CachedTemplate] | undefined;
    let minScore = Infinity;

    for (const entry of this.templateCache.entries()) {
      const [name, template] = entry;
      // Score based on last used time and use count
      const score = template.lastUsed + template.useCount * 1000;

      if (score < minScore) {
        minScore = score;
        leastUsed = entry;
      }
    }

    if (leastUsed) {
      this.templateCache.delete(leastUsed[0]);
    }
  }

  /**
   * Generate hash for template source
   */
  private hashTemplate(source: string): string {
    return createHash('md5').update(source).digest('hex');
  }

  /**
   * Update cache hit rate statistic
   */
  private updateCacheHitRate(): void {
    const total = this.stats.cacheHits + this.stats.cacheMisses;
    this.stats.cacheHitRate = total > 0 ? this.stats.cacheHits / total : 0;
  }

  /**
   * Update average statistics
   */
  private updateAverages(): void {
    if (this.stats.templatesCompiled > 0) {
      this.stats.averageCompilationTime =
        this.stats.totalCompilationTime / this.stats.templatesCompiled;
    }

    const renderCount = this.stats.cacheHits + this.stats.cacheMisses;
    if (renderCount > 0) {
      this.stats.averageRenderTime = this.stats.totalRenderTime / renderCount;
    }
  }

  /**
   * Clear template cache
   */
  clearCache(): void {
    this.templateCache.clear();
    this.partialCache.clear();
    this.stats.templatesCached = 0;
  }

  /**
   * Get current statistics
   */
  getStats(): TemplateStats {
    return { ...this.stats };
  }

  /**
   * Warm up cache with frequently used templates
   */
  async warmCache(templates: Map<string, string>): Promise<void> {
    const warmupPromises: Promise<void>[] = [];

    for (const [name, source] of templates) {
      warmupPromises.push(this.compileTemplate(name, source).then(() => {}));
    }

    await Promise.all(warmupPromises);
  }

  /**
   * Get cache information
   */
  getCacheInfo(): {
    size: number;
    maxSize: number;
    templates: Array<{
      name: string;
      hash: string;
      useCount: number;
      compilationTime: number;
      size: number;
    }>;
  } {
    const templates = Array.from(this.templateCache.entries()).map(([name, cached]) => ({
      name,
      hash: cached.hash,
      useCount: cached.useCount,
      compilationTime: cached.compilationTime,
      size: cached.size,
    }));

    return {
      size: this.templateCache.size,
      maxSize: this.options.maxCacheSize,
      templates,
    };
  }
}

/**
 * Create a template optimizer instance
 */
export function createTemplateOptimizer(options?: TemplateOptimizationOptions): TemplateOptimizer {
  return new TemplateOptimizer(options);
}
