/**
 * Type resolution cache for optimized type lookups and circular dependency handling
 */

export interface TypeResolutionOptions {
  maxSize?: number;
  ttl?: number; // Time to live in milliseconds
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

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  hits: number;
  resolutionTime: number;
  dependencies: Set<string>;
  depth: number;
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
export class TypeResolutionCache<T = any> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private options: Required<TypeResolutionOptions>;
  private stats: TypeResolutionStats;
  private resolutionQueue: Set<string> = new Set();
  private dependencyGraph: Map<string, Set<string>> = new Map();

  constructor(options: TypeResolutionOptions = {}) {
    this.options = {
      maxSize: options.maxSize ?? 1000,
      ttl: options.ttl ?? 60000, // 1 minute default
      detectCircular: options.detectCircular ?? true,
      maxDepth: options.maxDepth ?? 20,
      enableMetrics: options.enableMetrics ?? true,
    };

    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      circularDependencies: 0,
      totalResolutionTime: 0,
      averageResolutionTime: 0,
      hitRate: 0,
      cacheSize: 0,
      deepestNesting: 0,
    };
  }

  /**
   * Resolve a type with caching and circular dependency detection
   */
  async resolve(key: string, resolver: () => Promise<T>, context?: ResolutionContext): Promise<T> {
    // Check if already resolving (circular dependency)
    if (this.resolutionQueue.has(key)) {
      if (this.options.detectCircular) {
        this.stats.circularDependencies++;
        throw new Error(`Circular dependency detected: ${key}`);
      }
      return undefined as any; // Return undefined for circular deps if not throwing
    }

    // Check cache first
    const cached = this.getFromCache(key);
    if (cached !== undefined) {
      this.stats.hits++;
      this.updateHitRate();
      return cached;
    }

    this.stats.misses++;

    // Initialize context if not provided
    const ctx = context || {
      visitStack: [],
      resolved: new Set(),
      depth: 0,
      maxDepth: this.options.maxDepth,
      startTime: Date.now(),
    };

    // Check depth limit
    if (ctx.depth >= ctx.maxDepth) {
      throw new Error(`Maximum type resolution depth exceeded: ${ctx.depth}`);
    }

    // Track deepest nesting
    if (ctx.depth > this.stats.deepestNesting) {
      this.stats.deepestNesting = ctx.depth;
    }

    // Add to resolution queue
    this.resolutionQueue.add(key);
    ctx.visitStack.push(key);

    try {
      // Resolve the type
      const startTime = Date.now();
      const value = await resolver();
      const resolutionTime = Date.now() - startTime;

      // Update stats
      if (this.options.enableMetrics) {
        this.stats.totalResolutionTime += resolutionTime;
        this.updateAverageResolutionTime();
      }

      // Extract dependencies from the resolved value
      const dependencies = this.extractDependencies(value);

      // Cache the result
      this.addToCache(key, {
        value,
        timestamp: Date.now(),
        hits: 0,
        resolutionTime,
        dependencies,
        depth: ctx.depth,
      });

      // Update dependency graph
      this.updateDependencyGraph(key, dependencies);

      // Mark as resolved
      ctx.resolved.add(key);

      return value;
    } finally {
      // Clean up
      this.resolutionQueue.delete(key);
      ctx.visitStack.pop();
    }
  }

  /**
   * Batch resolve multiple types efficiently
   */
  async resolveBatch(
    keys: string[],
    resolver: (key: string) => Promise<T>,
  ): Promise<Map<string, T>> {
    const results = new Map<string, T>();
    const promises: Promise<void>[] = [];

    // Group keys by dependency level for optimal resolution order
    const groups = this.groupByDependencyLevel(keys);

    // Resolve each group in order
    for (const group of groups) {
      const groupPromises = group.map(async key => {
        try {
          const value = await this.resolve(key, () => resolver(key));
          results.set(key, value);
        } catch (error) {
          console.error(`[TypeResolution] Error resolving ${key}:`, error);
          // Continue with other resolutions
        }
      });

      // Wait for current group to complete before next
      await Promise.all(groupPromises);
    }

    return results;
  }

  /**
   * Prefetch types that are likely to be needed
   */
  async prefetch(keys: string[], resolver: (key: string) => Promise<T>): Promise<void> {
    const prefetchPromises = keys.map(key =>
      this.resolve(key, () => resolver(key)).catch(() => {
        // Ignore prefetch errors
      }),
    );

    await Promise.all(prefetchPromises);
  }

  /**
   * Get value from cache if valid
   */
  private getFromCache(key: string): T | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      return undefined;
    }

    // Check TTL
    if (Date.now() - entry.timestamp > this.options.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    // Update hit count
    entry.hits++;

    return entry.value;
  }

  /**
   * Add value to cache with eviction if needed
   */
  private addToCache(key: string, entry: CacheEntry<T>): void {
    // Evict if at capacity
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.stats.cacheSize = this.cache.size;
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | undefined;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache) {
      const score = entry.timestamp + entry.hits * 1000;
      if (score < lruTime) {
        lruTime = score;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
      this.dependencyGraph.delete(lruKey);
      this.stats.evictions++;
    }
  }

  /**
   * Extract dependencies from resolved type
   */
  private extractDependencies(value: T): Set<string> {
    const dependencies = new Set<string>();

    // This is a simplified version - actual implementation would
    // depend on the structure of your types
    if (value && typeof value === 'object') {
      const obj = value as any;

      // Look for common type reference patterns
      if (obj.type && typeof obj.type === 'string') {
        dependencies.add(obj.type);
      }

      if (obj.extends && typeof obj.extends === 'string') {
        dependencies.add(obj.extends);
      }

      if (obj.implements && Array.isArray(obj.implements)) {
        obj.implements.forEach((impl: string) => dependencies.add(impl));
      }

      if (obj.fields && Array.isArray(obj.fields)) {
        obj.fields.forEach((field: any) => {
          if (field.type && typeof field.type === 'string') {
            dependencies.add(field.type);
          }
        });
      }
    }

    return dependencies;
  }

  /**
   * Update dependency graph
   */
  private updateDependencyGraph(key: string, dependencies: Set<string>): void {
    this.dependencyGraph.set(key, dependencies);

    // Update reverse dependencies for efficient invalidation
    for (const dep of dependencies) {
      if (!this.dependencyGraph.has(dep)) {
        this.dependencyGraph.set(dep, new Set());
      }
    }
  }

  /**
   * Group keys by dependency level for optimal resolution order
   */
  private groupByDependencyLevel(keys: string[]): string[][] {
    const levels: string[][] = [];
    const remaining = new Set(keys);
    const resolved = new Set<string>();

    while (remaining.size > 0) {
      const currentLevel: string[] = [];

      for (const key of remaining) {
        const deps = this.dependencyGraph.get(key) || new Set();
        const unresolvedDeps = Array.from(deps).filter(d => remaining.has(d) && !resolved.has(d));

        if (unresolvedDeps.length === 0) {
          currentLevel.push(key);
        }
      }

      if (currentLevel.length === 0) {
        // Circular dependency or external dependency
        // Add remaining items as is
        currentLevel.push(...remaining);
        remaining.clear();
      } else {
        currentLevel.forEach(key => {
          remaining.delete(key);
          resolved.add(key);
        });
      }

      levels.push(currentLevel);
    }

    return levels;
  }

  /**
   * Invalidate cache entries and their dependents
   */
  invalidate(key: string, cascade: boolean = true): void {
    this.cache.delete(key);

    if (cascade) {
      // Find and invalidate all types that depend on this one
      for (const [depKey, deps] of this.dependencyGraph) {
        if (deps.has(key)) {
          this.invalidate(depKey, true);
        }
      }
    }

    this.dependencyGraph.delete(key);
    this.stats.cacheSize = this.cache.size;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.dependencyGraph.clear();
    this.resolutionQueue.clear();
    this.stats.cacheSize = 0;
  }

  /**
   * Update hit rate statistic
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Update average resolution time
   */
  private updateAverageResolutionTime(): void {
    const total = this.stats.hits + this.stats.misses;
    if (total > 0) {
      this.stats.averageResolutionTime = this.stats.totalResolutionTime / total;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): TypeResolutionStats {
    return { ...this.stats };
  }

  /**
   * Get dependency graph for visualization
   */
  getDependencyGraph(): Map<string, Set<string>> {
    return new Map(this.dependencyGraph);
  }

  /**
   * Find circular dependencies in the type system
   */
  findCircularDependencies(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const stack: string[] = [];

    const dfs = (node: string): boolean => {
      if (stack.includes(node)) {
        // Found a cycle
        const cycleStart = stack.indexOf(node);
        cycles.push(stack.slice(cycleStart).concat(node));
        return true;
      }

      if (visited.has(node)) {
        return false;
      }

      visited.add(node);
      stack.push(node);

      const deps = this.dependencyGraph.get(node) || new Set();
      for (const dep of deps) {
        if (dfs(dep)) {
          // Continue to find all cycles
        }
      }

      stack.pop();
      return false;
    };

    for (const node of this.dependencyGraph.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return cycles;
  }

  /**
   * Optimize cache by removing unused entries
   */
  optimize(): void {
    const threshold = Date.now() - this.options.ttl / 2;
    const toRemove: string[] = [];

    for (const [key, entry] of this.cache) {
      // Remove old entries with no recent hits
      if (entry.timestamp < threshold && entry.hits === 0) {
        toRemove.push(key);
      }
    }

    toRemove.forEach(key => {
      this.cache.delete(key);
      this.dependencyGraph.delete(key);
    });

    this.stats.cacheSize = this.cache.size;
  }

  /**
   * Warm cache with commonly used types
   */
  async warmUp(commonTypes: string[], resolver: (key: string) => Promise<T>): Promise<void> {
    await this.prefetch(commonTypes, resolver);
  }
}

/**
 * Create a type resolution cache instance
 */
export function createTypeResolutionCache<T = any>(
  options?: TypeResolutionOptions,
): TypeResolutionCache<T> {
  return new TypeResolutionCache<T>(options);
}
