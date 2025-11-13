/**
 * CodeOptimizer - Handles code optimization, tree-shaking, and minification
 *
 * This class provides various optimization strategies to reduce bundle size
 * and improve runtime performance of generated code.
 */
import { GeneratedFile } from '../core/types';
import { ProtoFile, ServiceDefinition } from '../core/proto-types';
/**
 * Optimization options
 */
export interface OptimizationOptions {
    /**
     * Enable dead code elimination
     */
    deadCodeElimination?: boolean;
    /**
     * Enable tree-shaking optimizations
     */
    treeShaking?: boolean;
    /**
     * Enable minification for production builds
     */
    minify?: boolean;
    /**
     * Remove JSDoc comments in production
     */
    removeComments?: boolean;
    /**
     * Inline small functions for better performance
     */
    inlineFunctions?: boolean;
    /**
     * Collapse duplicate code patterns
     */
    collapseDuplicates?: boolean;
    /**
     * Generate ES modules for better tree-shaking
     */
    esModules?: boolean;
    /**
     * Optimize import statements
     */
    optimizeImports?: boolean;
    /**
     * Use production mode optimizations
     */
    production?: boolean;
    /**
     * Conditional generation based on usage
     */
    conditionalGeneration?: boolean;
    /**
     * Track which methods/types are actually used
     */
    usageTracking?: UsageTrackingOptions;
    /**
     * Bundle size target in KB (triggers aggressive optimizations)
     */
    bundleSizeTarget?: number;
    /**
     * Generate separate chunks for code splitting
     */
    codeSplitting?: boolean;
    /**
     * Lazy load unused services
     */
    lazyLoading?: boolean;
}
/**
 * Usage tracking options for conditional generation
 */
export interface UsageTrackingOptions {
    /**
     * Track which services are used
     */
    usedServices?: Set<string>;
    /**
     * Track which methods are used
     */
    usedMethods?: Map<string, Set<string>>;
    /**
     * Track which message types are used
     */
    usedMessages?: Set<string>;
    /**
     * Track which enums are used
     */
    usedEnums?: Set<string>;
    /**
     * Analyze imports to detect usage
     */
    analyzeImports?: boolean;
}
/**
 * Optimization result metrics
 */
export interface OptimizationMetrics {
    /**
     * Original size in bytes
     */
    originalSize: number;
    /**
     * Optimized size in bytes
     */
    optimizedSize: number;
    /**
     * Size reduction percentage
     */
    reductionPercentage: number;
    /**
     * Number of unused exports removed
     */
    unusedExportsRemoved: number;
    /**
     * Number of duplicate patterns collapsed
     */
    duplicatesCollapsed: number;
    /**
     * Number of imports optimized
     */
    importsOptimized: number;
    /**
     * Optimization time in milliseconds
     */
    optimizationTime: number;
}
/**
 * CodeOptimizer class for optimizing generated code
 */
export declare class CodeOptimizer {
    private options;
    private metrics;
    constructor(options?: OptimizationOptions);
    /**
     * Initialize optimization metrics
     */
    private initializeMetrics;
    /**
     * Enable production-specific optimizations
     */
    private enableProductionOptimizations;
    /**
     * Optimize a generated file
     */
    optimizeFile(file: GeneratedFile, protoFile?: ProtoFile): GeneratedFile;
    /**
     * Apply conditional generation based on usage patterns
     */
    private applyConditionalGeneration;
    /**
     * Remove unused services from generated code
     */
    private removeUnusedServices;
    /**
     * Remove unused methods from services
     */
    private removeUnusedMethods;
    /**
     * Remove unused message types
     */
    private removeUnusedMessages;
    /**
     * Eliminate dead code
     */
    private eliminateDeadCode;
    /**
     * Remove unused private methods
     */
    private removeUnusedPrivateMethods;
    /**
     * Optimize import statements
     */
    private optimizeImports;
    /**
     * Remove duplicate imports
     */
    private removeDuplicateImports;
    /**
     * Collapse duplicate code patterns
     */
    private collapseDuplicatePatterns;
    /**
     * Apply tree-shaking optimizations
     */
    private applyTreeShakingOptimizations;
    /**
     * Inline small functions for better performance
     */
    private inlineSmallFunctions;
    /**
     * Remove comments from code
     */
    private removeComments;
    /**
     * Minify the code
     */
    private minifyCode;
    /**
     * Ensure ES module format for better tree-shaking
     */
    private ensureESModules;
    /**
     * Generate code splitting configuration
     */
    generateCodeSplitConfig(services: ServiceDefinition[]): Map<string, string[]>;
    /**
     * Generate lazy loading wrapper for services
     */
    generateLazyLoadWrapper(serviceName: string, importPath: string): string;
    /**
     * Get optimization metrics
     */
    getMetrics(): Readonly<OptimizationMetrics>;
    /**
     * Reset metrics
     */
    resetMetrics(): void;
    /**
     * Analyze code for optimization opportunities
     */
    analyzeOptimizationOpportunities(content: string): string[];
}
/**
 * Create a code optimizer instance
 */
export declare function createCodeOptimizer(options?: OptimizationOptions): CodeOptimizer;
//# sourceMappingURL=CodeOptimizer.d.ts.map