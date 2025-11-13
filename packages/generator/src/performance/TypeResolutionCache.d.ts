/**
 * Type resolution cache for optimized type lookups and circular dependency handling
 */
export interface TypeResolutionOptions {
    maxSize?: number;
    ttl?: number;
    detectCircular?: boolean;
    maxDepth?: number;
    enableMetrics?: boolean;
}
export interface TypeResolutionStats {
    hits: number;
    misses: number;
    evictions: number;
    circularDependencies: number;
    totalResolutionTime: number;
    averageResolutionTime: number;
    hitRate: number;
    cacheSize: number;
    deepestNesting: number;
}
interface ResolutionContext {
    visitStack: string[];
    resolved: Set<string>;
    depth: number;
    maxDepth: number;
    startTime: number;
}
/**
 * High-performance type resolution cache with circular dependency detection
 */
export declare class TypeResolutionCache<T = any> {
    private cache;
    private options;
    private stats;
    private resolutionQueue;
    private dependencyGraph;
    constructor(options?: TypeResolutionOptions);
    /**
     * Resolve a type with caching and circular dependency detection
     */
    resolve(key: string, resolver: () => Promise<T>, context?: ResolutionContext): Promise<T>;
    /**
     * Batch resolve multiple types efficiently
     */
    resolveBatch(keys: string[], resolver: (key: string) => Promise<T>): Promise<Map<string, T>>;
    /**
     * Prefetch types that are likely to be needed
     */
    prefetch(keys: string[], resolver: (key: string) => Promise<T>): Promise<void>;
    /**
     * Get value from cache if valid
     */
    private getFromCache;
    /**
     * Add value to cache with eviction if needed
     */
    private addToCache;
    /**
     * Evict least recently used entry
     */
    private evictLRU;
    /**
     * Extract dependencies from resolved type
     */
    private extractDependencies;
    /**
     * Update dependency graph
     */
    private updateDependencyGraph;
    /**
     * Group keys by dependency level for optimal resolution order
     */
    private groupByDependencyLevel;
    /**
     * Invalidate cache entries and their dependents
     */
    invalidate(key: string, cascade?: boolean): void;
    /**
     * Clear entire cache
     */
    clear(): void;
    /**
     * Update hit rate statistic
     */
    private updateHitRate;
    /**
     * Update average resolution time
     */
    private updateAverageResolutionTime;
    /**
     * Get cache statistics
     */
    getStats(): TypeResolutionStats;
    /**
     * Get dependency graph for visualization
     */
    getDependencyGraph(): Map<string, Set<string>>;
    /**
     * Find circular dependencies in the type system
     */
    findCircularDependencies(): string[][];
    /**
     * Optimize cache by removing unused entries
     */
    optimize(): void;
    /**
     * Warm cache with commonly used types
     */
    warmUp(commonTypes: string[], resolver: (key: string) => Promise<T>): Promise<void>;
}
/**
 * Create a type resolution cache instance
 */
export declare function createTypeResolutionCache<T = any>(options?: TypeResolutionOptions): TypeResolutionCache<T>;
export {};
//# sourceMappingURL=TypeResolutionCache.d.ts.map