/**
 * Cache management for parsed and generated proto files.
 *
 * This module provides intelligent caching with hash-based invalidation,
 * LRU eviction, and optional persistent disk storage. The cache stores
 * generated TypeScript code keyed by proto file path.
 *
 * @packageDocumentation
 */

import { createHash } from 'crypto';
import { promises as fs } from 'fs';
import { join } from 'path';
import { CacheEntry, CacheStats } from './types';

/**
 * Cache manager for parsed and generated proto files.
 *
 * Manages an in-memory cache of generated code with the following features:
 * - SHA-256 content hashing for cache invalidation
 * - LRU (Least Recently Used) eviction when memory limit exceeded
 * - Cache hit/miss statistics tracking
 * - Optional persistent disk cache (implemented in task 6.4)
 *
 * @example
 * ```typescript
 * const cache = new CacheManager(100); // 100MB max size
 *
 * // Store generated code
 * const hash = cache.computeHash(protoContent);
 * cache.set('/path/to/service.proto', generatedCode, hash);
 *
 * // Retrieve from cache
 * const entry = cache.get('/path/to/service.proto');
 * if (entry && entry.hash === hash) {
 *   return entry.content; // Cache hit
 * }
 *
 * // Check cache effectiveness
 * const stats = cache.getStats();
 * console.log(`Hit rate: ${stats.hitRate * 100}%`);
 * ```
 */
export class CacheManager {
  /**
   * In-memory cache storage.
   * Maps proto file paths to cache entries.
   */
  private cache: Map<string, CacheEntry>;

  /**
   * LRU list ordered by access time.
   * Maintained for efficient LRU eviction.
   */
  private lruList: string[];

  /**
   * Cache statistics.
   * Tracks hits, misses, and size metrics.
   */
  private stats: CacheStats;

  /**
   * Maximum cache size in bytes.
   * When exceeded, LRU eviction is triggered.
   */
  private maxSizeInBytes: number;

  /**
   * Optional directory for persistent cache storage.
   * Used in task 6.4 for disk-based caching.
   */
  private persistentCacheDir?: string;

  /**
   * Create a new cache manager.
   *
   * @param maxSizeInMB - Maximum cache size in megabytes (default: 100MB)
   * @param persistentCacheDir - Optional directory for persistent cache storage
   *
   * @example
   * ```typescript
   * // Simple in-memory cache
   * const cache = new CacheManager(100);
   *
   * // With persistent cache
   * const cache = new CacheManager(100, '.hallow-cache');
   * ```
   */
  constructor(maxSizeInMB: number = 100, persistentCacheDir?: string) {
    this.cache = new Map();
    this.lruList = [];
    this.maxSizeInBytes = maxSizeInMB * 1024 * 1024; // Convert MB to bytes
    this.persistentCacheDir = persistentCacheDir;

    // Initialize statistics
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalSize: 0,
      entryCount: 0,
    };
  }

  /**
   * Retrieve a cache entry by key.
   *
   * Updates access statistics and LRU tracking on cache hit.
   * Returns null on cache miss.
   *
   * @param key - Proto file path (absolute path)
   * @returns Cache entry if found, null otherwise
   *
   * @example
   * ```typescript
   * const entry = cache.get('/project/protos/service.proto');
   * if (entry) {
   *   console.log('Cache hit!', entry.content);
   * } else {
   *   console.log('Cache miss');
   * }
   * ```
   */
  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);

    if (entry) {
      // Cache hit - update statistics and access tracking
      this.stats.hits++;
      entry.accessCount++;
      entry.lastAccess = Date.now();

      // Update LRU list - move to end (most recently used)
      this.updateLRU(key);

      // Recalculate hit rate
      this.updateHitRate();

      return entry;
    } else {
      // Cache miss - update statistics
      this.stats.misses++;
      this.updateHitRate();

      return null;
    }
  }

  /**
   * Store a cache entry.
   *
   * Creates a new cache entry with the provided content and hash.
   * Triggers LRU eviction if cache size exceeds maximum.
   *
   * @param key - Proto file path (absolute path)
   * @param content - Generated TypeScript code
   * @param hash - SHA-256 hash of original proto content
   *
   * @example
   * ```typescript
   * const protoContent = fs.readFileSync('service.proto', 'utf-8');
   * const hash = cache.computeHash(protoContent);
   * const generatedCode = await generateCode(protoContent);
   * cache.set('/project/protos/service.proto', generatedCode, hash);
   * ```
   */
  set(key: string, content: string, hash: string): void {
    const now = Date.now();
    const size = Buffer.byteLength(content, 'utf-8');

    // Create cache entry
    const entry: CacheEntry = {
      content,
      hash,
      timestamp: now,
      size,
      accessCount: 0,
      lastAccess: now,
    };

    // Check if key already exists - if so, subtract old size from total
    const existingEntry = this.cache.get(key);
    if (existingEntry) {
      this.stats.totalSize -= existingEntry.size;
      this.stats.entryCount--;
    }

    // Add to cache
    this.cache.set(key, entry);

    // Update statistics
    this.stats.totalSize += size;
    this.stats.entryCount++;

    // Update LRU list
    this.updateLRU(key);

    // Check if eviction is needed
    if (this.stats.totalSize > this.maxSizeInBytes) {
      this.evictLRU();
    }
  }

  /**
   * Invalidate a single cache entry.
   *
   * Removes the entry from cache and updates statistics.
   * No-op if key doesn't exist.
   *
   * @param key - Proto file path to invalidate
   *
   * @example
   * ```typescript
   * // File changed - invalidate cache
   * cache.invalidate('/project/protos/service.proto');
   * ```
   */
  invalidate(key: string): void {
    const entry = this.cache.get(key);
    if (entry) {
      // Update statistics
      this.stats.totalSize -= entry.size;
      this.stats.entryCount--;

      // Remove from cache and LRU list
      this.cache.delete(key);
      this.lruList = this.lruList.filter((k) => k !== key);
    }
  }

  /**
   * Invalidate multiple cache entries.
   *
   * Efficiently removes multiple entries at once.
   * Useful for invalidating dependents when a proto file changes.
   *
   * @param keys - Array of proto file paths to invalidate
   *
   * @example
   * ```typescript
   * // File changed - invalidate it and all dependents
   * const dependents = dependencyGraph.getDependents('/project/protos/types.proto');
   * cache.invalidateMultiple(['/project/protos/types.proto', ...dependents]);
   * ```
   */
  invalidateMultiple(keys: string[]): void {
    for (const key of keys) {
      this.invalidate(key);
    }
  }

  /**
   * Compute SHA-256 hash of content.
   *
   * Used for cache invalidation - when content hash changes,
   * cache entry is stale and must be regenerated.
   *
   * @param content - Content to hash (typically proto file content)
   * @returns SHA-256 hash as hexadecimal string
   *
   * @example
   * ```typescript
   * const hash1 = cache.computeHash('syntax = "proto3";');
   * const hash2 = cache.computeHash('syntax = "proto3";');
   * console.log(hash1 === hash2); // true - same content, same hash
   *
   * const hash3 = cache.computeHash('syntax = "proto2";');
   * console.log(hash1 === hash3); // false - different content
   * ```
   */
  computeHash(content: string): string {
    return createHash('sha256').update(content, 'utf-8').digest('hex');
  }

  /**
   * Evict least recently used entries until under memory limit.
   *
   * Implements LRU (Least Recently Used) eviction policy.
   * Entries are sorted by last access time and oldest are removed first.
   *
   * Called automatically when cache size exceeds maximum.
   * Can also be called manually to free memory.
   *
   * @example
   * ```typescript
   * // Manual eviction to free memory
   * cache.evictLRU();
   * console.log(`Cache size: ${cache.getStats().totalSize / (1024 * 1024)}MB`);
   * ```
   */
  evictLRU(): void {
    if (this.lruList.length === 0) {
      return;
    }

    // Sort LRU list by last access time (oldest first)
    this.lruList.sort((a, b) => {
      const entryA = this.cache.get(a);
      const entryB = this.cache.get(b);

      // Should never happen, but handle gracefully
      if (!entryA || !entryB) {
        return 0;
      }

      return entryA.lastAccess - entryB.lastAccess;
    });

    // Evict entries until under memory limit
    while (this.stats.totalSize > this.maxSizeInBytes && this.lruList.length > 0) {
      const keyToEvict = this.lruList.shift();
      if (keyToEvict) {
        const entry = this.cache.get(keyToEvict);
        if (entry) {
          this.stats.totalSize -= entry.size;
          this.stats.entryCount--;
          this.cache.delete(keyToEvict);
        }
      }
    }
  }

  /**
   * Get current cache statistics.
   *
   * Returns cache effectiveness metrics including hit rate,
   * total size, and entry count.
   *
   * @returns Current cache statistics
   *
   * @example
   * ```typescript
   * const stats = cache.getStats();
   * console.log(`Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
   * console.log(`Cache size: ${stats.totalSize / (1024 * 1024)}MB`);
   * console.log(`Entries: ${stats.entryCount}`);
   * ```
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clear all cache entries.
   *
   * Removes all entries and resets statistics.
   * Useful for testing or forcing full rebuild.
   *
   * @example
   * ```typescript
   * // Force full rebuild
   * cache.clear();
   * ```
   */
  clear(): void {
    this.cache.clear();
    this.lruList = [];
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      totalSize: 0,
      entryCount: 0,
    };
  }

  /**
   * Load cache from disk.
   *
   * Loads persistent cache entries from disk storage.
   * Handles corrupted files and missing directories gracefully.
   *
   * @returns Promise that resolves when cache is loaded
   *
   * @example
   * ```typescript
   * const cache = new CacheManager(100, '.hallow-cache');
   * await cache.loadFromDisk();
   * console.log(`Loaded ${cache.getStats().entryCount} entries from disk`);
   * ```
   */
  async loadFromDisk(): Promise<void> {
    if (!this.persistentCacheDir) {
      return;
    }

    try {
      // Check if cache directory exists
      await fs.access(this.persistentCacheDir);
    } catch {
      // Directory doesn't exist - nothing to load
      return;
    }

    try {
      // Read all files in cache directory
      const files = await fs.readdir(this.persistentCacheDir);

      // Filter for JSON cache files only
      const cacheFiles = files.filter((file) => file.endsWith('.json'));

      // Load each cache file
      for (const file of cacheFiles) {
        const filePath = join(this.persistentCacheDir, file);

        try {
          // Read and parse cache entry
          const content = await fs.readFile(filePath, 'utf-8');
          const entry: CacheEntry = JSON.parse(content);

          // Validate cache entry structure
          if (
            typeof entry.content === 'string' &&
            typeof entry.hash === 'string' &&
            typeof entry.timestamp === 'number' &&
            typeof entry.size === 'number' &&
            typeof entry.accessCount === 'number' &&
            typeof entry.lastAccess === 'number'
          ) {
            // Extract key from filename (remove .json extension)
            const key = decodeURIComponent(file.replace(/\.json$/, ''));

            // Add to cache
            this.cache.set(key, entry);

            // Update statistics
            this.stats.totalSize += entry.size;
            this.stats.entryCount++;

            // Update LRU list
            this.updateLRU(key);
          }
        } catch (error) {
          // Corrupted file - skip it and continue with next file
          // In production, might want to log this error
          continue;
        }
      }
    } catch (error) {
      // Error reading directory - fail silently
      // The cache will start fresh
    }
  }

  /**
   * Save cache to disk.
   *
   * Persists current cache entries to disk storage.
   * Creates cache directory if it doesn't exist.
   *
   * @returns Promise that resolves when cache is saved
   *
   * @example
   * ```typescript
   * const cache = new CacheManager(100, '.hallow-cache');
   * cache.set('/project/protos/service.proto', generatedCode, hash);
   * await cache.saveToDisk();
   * ```
   */
  async saveToDisk(): Promise<void> {
    if (!this.persistentCacheDir) {
      return;
    }

    try {
      // Create cache directory if it doesn't exist
      await fs.mkdir(this.persistentCacheDir, { recursive: true });

      // Save each cache entry as a separate JSON file
      const savePromises: Promise<void>[] = [];

      for (const [key, entry] of this.cache.entries()) {
        // Encode key to safe filename (URL encoding)
        const filename = `${encodeURIComponent(key)}.json`;
        const filePath = join(this.persistentCacheDir, filename);

        // Write entry to file
        const savePromise = fs.writeFile(
          filePath,
          JSON.stringify(entry, null, 2),
          'utf-8'
        );

        savePromises.push(savePromise);
      }

      // Wait for all files to be written
      await Promise.all(savePromises);
    } catch (error) {
      // Error saving cache - throw to let caller handle
      throw new Error(
        `Failed to save cache to disk: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  /**
   * Update LRU list when key is accessed or added.
   *
   * Moves key to end of LRU list (most recently used position).
   * Creates entry if doesn't exist.
   *
   * @param key - Cache key to update
   * @private
   */
  private updateLRU(key: string): void {
    // Remove key from current position
    this.lruList = this.lruList.filter((k) => k !== key);

    // Add to end (most recently used)
    this.lruList.push(key);
  }

  /**
   * Update hit rate calculation.
   *
   * Recalculates hit rate as: hits / (hits + misses)
   * Handles division by zero gracefully.
   *
   * @private
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Get total cache size in bytes.
   *
   * Helper method for testing and diagnostics.
   *
   * @returns Total size of all cache entries in bytes
   * @internal
   */
  getTotalSize(): number {
    return this.stats.totalSize;
  }
}
