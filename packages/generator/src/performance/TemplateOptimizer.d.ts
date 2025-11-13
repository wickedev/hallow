/**
 * Template processing optimization for improved performance
 */
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
/**
 * Optimized template processor with caching and performance improvements
 */
export declare class TemplateOptimizer {
    private options;
    private templateCache;
    private partialCache;
    private stats;
    private handlebars;
    constructor(options?: TemplateOptimizationOptions);
    /**
     * Compile and cache a template
     */
    compileTemplate(name: string, source: string): Promise<HandlebarsTemplateDelegate>;
    /**
     * Render a template with data
     */
    render(templateName: string, data: any): Promise<string>;
    /**
     * Precompile all templates for better performance
     */
    precompileTemplates(templates: Map<string, string>): Promise<void>;
    /**
     * Register custom Handlebars helpers
     */
    private registerHelpers;
    /**
     * Optimize template source before compilation
     */
    private optimizeTemplateSource;
    /**
     * Inline partials for better performance
     */
    private inlinePartials;
    /**
     * Optimize common template patterns
     */
    private optimizePatterns;
    /**
     * Optimize render data for better performance
     */
    private optimizeRenderData;
    /**
     * Minify template output
     */
    private minifyOutput;
    /**
     * Get cached template if available and valid
     */
    private getCachedTemplate;
    /**
     * Cache a compiled template
     */
    private cacheTemplate;
    /**
     * Evict least recently used template from cache
     */
    private evictLeastUsed;
    /**
     * Generate hash for template source
     */
    private hashTemplate;
    /**
     * Update cache hit rate statistic
     */
    private updateCacheHitRate;
    /**
     * Update average statistics
     */
    private updateAverages;
    /**
     * Clear template cache
     */
    clearCache(): void;
    /**
     * Get current statistics
     */
    getStats(): TemplateStats;
    /**
     * Warm up cache with frequently used templates
     */
    warmCache(templates: Map<string, string>): Promise<void>;
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
    };
}
/**
 * Create a template optimizer instance
 */
export declare function createTemplateOptimizer(options?: TemplateOptimizationOptions): TemplateOptimizer;
//# sourceMappingURL=TemplateOptimizer.d.ts.map