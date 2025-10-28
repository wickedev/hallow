/**
 * Memory-efficient code generation strategies for large proto schemas
 */

import {
  ProtoFile,
  ServiceDefinition,
  MessageDefinition,
  EnumDefinition,
} from '../core/proto-types';
import { GeneratedFile } from '../core/types';
import { Readable, Transform, pipeline } from 'stream';
import { promisify } from 'util';
import { DependencyResolver, ResolvedImport } from '../utils/DependencyResolver';

const pipelineAsync = promisify(pipeline);

export interface StreamingGenerationOptions {
  chunkSize?: number; // Number of items to process at once
  memoryLimit?: number; // Maximum memory usage in bytes
  useStreaming?: boolean; // Enable streaming mode
  gcInterval?: number; // Force garbage collection interval (operations)
  cacheStrategy?: 'lru' | 'fifo' | 'none';
  cacheSize?: number; // Maximum cache entries
}

export interface ChunkMetadata {
  index: number;
  totalChunks: number;
  itemCount: number;
  memoryUsage: number;
  startTime: number;
  endTime?: number;
}

/**
 * Memory-efficient generator for large proto schemas
 */
export class MemoryEfficientGenerator {
  private options: Required<StreamingGenerationOptions>;
  private cache: Map<string, any> = new Map();
  private cacheOrder: string[] = [];
  private operationCount = 0;
  private dependencyResolver: DependencyResolver;
  private currentChunkSize: number;
  private memoryHistory: number[] = [];
  private readonly MEMORY_HISTORY_SIZE = 10;

  constructor(options: StreamingGenerationOptions = {}) {
    this.options = {
      chunkSize: options.chunkSize ?? 10,
      memoryLimit: options.memoryLimit ?? 500 * 1024 * 1024, // 500MB
      useStreaming: options.useStreaming ?? true,
      gcInterval: options.gcInterval ?? 100,
      cacheStrategy: options.cacheStrategy ?? 'lru',
      cacheSize: options.cacheSize ?? 1000,
    };
    this.dependencyResolver = new DependencyResolver();
    this.currentChunkSize = this.options.chunkSize;
  }

  /**
   * Generate code in chunks to manage memory efficiently
   */
  async *generateInChunks(
    protoFile: ProtoFile,
    generator: (items: any[], type: string) => Promise<GeneratedFile[]>,
  ): AsyncGenerator<GeneratedFile[], void, unknown> {
    // Process services in chunks
    if (protoFile.services.length > 0) {
      yield* this.processChunks(protoFile.services, 'service', generator);
    }

    // Process messages in chunks
    if (protoFile.messages.length > 0) {
      yield* this.processChunks(protoFile.messages, 'message', generator);
    }

    // Process enums in chunks
    if (protoFile.enums.length > 0) {
      yield* this.processChunks(protoFile.enums, 'enum', generator);
    }
  }

  /**
   * Generate messages in chunks with async generator
   * Provides fine-grained control over message generation with progress reporting
   */
  async *generateMessagesInChunks(
    messages: MessageDefinition[],
    generator: (messages: MessageDefinition[]) => Promise<GeneratedFile[]>,
  ): AsyncGenerator<{ files: GeneratedFile[]; metadata: ChunkMetadata }, void, unknown> {
    const chunkSize = this.calculateOptimalChunkSize(messages.length);
    const chunks = this.createChunks(messages, chunkSize);
    let chunkIndex = 0;

    for (const chunk of chunks) {
      // Check memory before processing
      await this.checkMemoryUsage();

      const metadata: ChunkMetadata = {
        index: chunkIndex++,
        totalChunks: chunks.length,
        itemCount: chunk.length,
        memoryUsage: process.memoryUsage().heapUsed,
        startTime: Date.now(),
      };

      try {
        // Generate code for this chunk of messages
        const files = await generator(chunk);

        metadata.endTime = Date.now();
        this.reportProgress(metadata, 'messages');

        // Perform garbage collection if needed
        this.performGarbageCollection();

        yield { files, metadata };
      } catch (error) {
        console.error(`[MemoryEfficient] Error processing message chunk ${metadata.index}:`, error);
        throw error;
      }
    }
  }

  /**
   * Generate enums in chunks using the same infrastructure as messages
   */
  async *generateEnumsInChunks(
    enums: EnumDefinition[],
    generator: (enums: EnumDefinition[]) => Promise<GeneratedFile[]>,
  ): AsyncGenerator<{ files: GeneratedFile[]; metadata: ChunkMetadata }, void, unknown> {
    const chunkSize = this.calculateOptimalChunkSize(enums.length);
    const chunks = this.createChunks(enums, chunkSize);
    let chunkIndex = 0;

    for (const chunk of chunks) {
      // Check memory before processing
      await this.checkMemoryUsage();

      const metadata: ChunkMetadata = {
        index: chunkIndex++,
        totalChunks: chunks.length,
        itemCount: chunk.length,
        memoryUsage: process.memoryUsage().heapUsed,
        startTime: Date.now(),
      };

      try {
        // Generate code for this chunk of enums
        const files = await generator(chunk);

        metadata.endTime = Date.now();
        this.reportProgress(metadata, 'enums');

        // Perform garbage collection if needed
        this.performGarbageCollection();

        yield { files, metadata };
      } catch (error) {
        console.error(`[MemoryEfficient] Error processing enum chunk ${metadata.index}:`, error);
        throw error;
      }
    }
  }

  /**
   * Calculate optimal chunk size based on memory constraints and item count
   * Dynamically adjusts based on heap monitoring and memory trends
   */
  private calculateOptimalChunkSize(itemCount: number): number {
    const memoryUsage = process.memoryUsage();
    const memoryUtilization = memoryUsage.heapUsed / this.options.memoryLimit;

    // Update memory history for trend analysis
    this.memoryHistory.push(memoryUsage.heapUsed);
    if (this.memoryHistory.length > this.MEMORY_HISTORY_SIZE) {
      this.memoryHistory.shift();
    }

    // Analyze memory trend
    const memoryTrend = this.analyzeMemoryTrend();

    // Log memory metrics for debugging
    this.logMemoryMetrics(memoryUsage, memoryUtilization, memoryTrend);

    // Dynamic adjustment based on multiple factors
    let adjustedChunkSize = this.currentChunkSize;

    // Critical: Memory usage exceeds 90% threshold
    if (memoryUtilization > 0.9) {
      adjustedChunkSize = Math.max(Math.floor(this.currentChunkSize * 0.5), 1);
      console.warn(`[MemoryEfficient] Critical memory usage (${(memoryUtilization * 100).toFixed(1)}%), reducing chunk size to ${adjustedChunkSize}`);
    }
    // High: Memory usage exceeds 80% threshold
    else if (memoryUtilization > 0.8) {
      adjustedChunkSize = Math.max(Math.floor(this.currentChunkSize * 0.7), 1);
      console.warn(`[MemoryEfficient] High memory usage (${(memoryUtilization * 100).toFixed(1)}%), reducing chunk size to ${adjustedChunkSize}`);
    }
    // Growing trend detected
    else if (memoryTrend > 0.1 && memoryUtilization > 0.6) {
      adjustedChunkSize = Math.max(Math.floor(this.currentChunkSize * 0.8), 1);
      console.log(`[MemoryEfficient] Memory growing rapidly, preemptively reducing chunk size to ${adjustedChunkSize}`);
    }
    // Low memory usage: Increase chunk size for better performance
    else if (memoryUtilization < 0.5 && memoryTrend < 0.05) {
      adjustedChunkSize = Math.min(Math.floor(this.currentChunkSize * 1.5), this.options.chunkSize * 3);
      console.log(`[MemoryEfficient] Low memory usage (${(memoryUtilization * 100).toFixed(1)}%), increasing chunk size to ${adjustedChunkSize}`);
    }

    // Ensure chunk size doesn't exceed item count
    adjustedChunkSize = Math.min(adjustedChunkSize, itemCount);

    // Update current chunk size for next iteration
    this.currentChunkSize = adjustedChunkSize;

    return adjustedChunkSize;
  }

  /**
   * Analyze memory usage trend from history
   * Returns a value indicating growth rate (positive = growing, negative = decreasing)
   */
  private analyzeMemoryTrend(): number {
    if (this.memoryHistory.length < 3) {
      return 0; // Not enough data
    }

    // Calculate average growth rate
    let totalGrowth = 0;
    for (let i = 1; i < this.memoryHistory.length; i++) {
      const growth = (this.memoryHistory[i] - this.memoryHistory[i - 1]) / this.memoryHistory[i - 1];
      totalGrowth += growth;
    }

    return totalGrowth / (this.memoryHistory.length - 1);
  }

  /**
   * Log memory metrics for debugging
   */
  private logMemoryMetrics(
    memoryUsage: NodeJS.MemoryUsage,
    memoryUtilization: number,
    memoryTrend: number
  ): void {
    const heapMB = (memoryUsage.heapUsed / (1024 * 1024)).toFixed(2);
    const limitMB = (this.options.memoryLimit / (1024 * 1024)).toFixed(2);
    const utilizationPct = (memoryUtilization * 100).toFixed(1);
    const trendPct = (memoryTrend * 100).toFixed(2);

    console.log(
      `[MemoryEfficient] Memory: ${heapMB}MB / ${limitMB}MB (${utilizationPct}%), ` +
      `Trend: ${trendPct}%, Current chunk size: ${this.currentChunkSize}`
    );
  }

  /**
   * Report progress for chunk processing
   */
  private reportProgress(metadata: ChunkMetadata, type: string): void {
    const duration = metadata.endTime ? metadata.endTime - metadata.startTime : 0;
    const memoryMB = (metadata.memoryUsage / (1024 * 1024)).toFixed(2);
    const progress = ((metadata.index + 1) / metadata.totalChunks * 100).toFixed(1);

    console.log(
      `[MemoryEfficient] Processed ${type} chunk ${metadata.index + 1}/${metadata.totalChunks} ` +
      `(${progress}%) - ${metadata.itemCount} items in ${duration}ms - Memory: ${memoryMB}MB`
    );
  }

  /**
   * Resolve cross-chunk dependencies for messages and enums
   * Should be called after all chunks are processed
   */
  resolveCrossChunkDependencies(chunkIndex: number): ResolvedImport[] {
    const imports = this.dependencyResolver.resolveCrossChunkDependencies(chunkIndex);

    // Check for circular dependencies
    const cycles = this.dependencyResolver.detectCircularDependencies();
    if (cycles && cycles.length > 0) {
      console.warn('[MemoryEfficient] Circular dependencies detected:');
      cycles.forEach(cycle => console.warn(`  ${cycle}`));
    }

    return imports;
  }

  /**
   * Add messages to dependency graph for tracking
   */
  trackMessageDependencies(messages: MessageDefinition[], chunkIndex: number): void {
    messages.forEach(message => {
      this.dependencyResolver.addMessage(message, chunkIndex);
    });
  }

  /**
   * Add enums to dependency graph for tracking
   */
  trackEnumDependencies(enums: EnumDefinition[], chunkIndex: number): void {
    enums.forEach(enumDef => {
      this.dependencyResolver.addEnum(enumDef, chunkIndex);
    });
  }

  /**
   * Get topological order for types (useful for code generation)
   */
  getTopologicalOrder(): string[] {
    return this.dependencyResolver.getTopologicalOrder();
  }

  /**
   * Get dependency graph statistics
   */
  getDependencyStats() {
    return this.dependencyResolver.getStats();
  }

  /**
   * Process items in chunks
   */
  private async *processChunks<T>(
    items: T[],
    type: string,
    generator: (items: T[], type: string) => Promise<GeneratedFile[]>,
  ): AsyncGenerator<GeneratedFile[], void, unknown> {
    const chunks = this.createChunks(items, this.options.chunkSize);
    let chunkIndex = 0;

    for (const chunk of chunks) {
      // Check memory before processing
      await this.checkMemoryUsage();

      const metadata: ChunkMetadata = {
        index: chunkIndex++,
        totalChunks: chunks.length,
        itemCount: chunk.length,
        memoryUsage: process.memoryUsage().heapUsed,
        startTime: Date.now(),
      };

      try {
        // Generate code for this chunk
        const files = await generator(chunk, type);

        metadata.endTime = Date.now();

        // Perform garbage collection if needed
        this.performGarbageCollection();

        yield files;
      } catch (error) {
        console.error(`[MemoryEfficient] Error processing chunk ${metadata.index}:`, error);
        throw error;
      }
    }
  }

  /**
   * Create a streaming transform for code generation
   */
  createGenerationStream(): Transform {
    const self = this;
    return new Transform({
      objectMode: true,
      async transform(chunk: any, encoding, callback) {
        try {
          // Process the chunk and push generated code
          const generated = await self.processStreamChunk(chunk);
          callback(null, generated);
        } catch (error) {
          callback(error as Error);
        }
      },
    });
  }

  /**
   * Stream-based file generation for very large outputs
   */
  async generateFileStream(content: string[], fileName: string): Promise<Readable> {
    const stream = new Readable({
      read() {
        // Stream content line by line
        if (content.length > 0) {
          const batch = content.splice(0, 100).join('\n');
          this.push(batch + '\n');
        } else {
          this.push(null); // End stream
        }
      },
    });

    return stream;
  }

  /**
   * Optimize memory usage by clearing unnecessary data
   */
  optimizeMemory(data: any): any {
    // Remove circular references
    const seen = new WeakSet();
    return JSON.parse(
      JSON.stringify(data, (key, value) => {
        if (typeof value === 'object' && value !== null) {
          if (seen.has(value)) {
            return undefined; // Remove circular reference
          }
          seen.add(value);
        }
        return value;
      }),
    );
  }

  /**
   * Cache management with memory limits
   */
  addToCache(key: string, value: any): void {
    if (this.options.cacheStrategy === 'none') {
      return;
    }

    // Check cache size limit
    if (this.cache.size >= this.options.cacheSize) {
      this.evictFromCache();
    }

    this.cache.set(key, value);

    if (this.options.cacheStrategy === 'lru') {
      // Move to end for LRU
      const index = this.cacheOrder.indexOf(key);
      if (index > -1) {
        this.cacheOrder.splice(index, 1);
      }
      this.cacheOrder.push(key);
    } else if (this.options.cacheStrategy === 'fifo') {
      // Add to end for FIFO
      this.cacheOrder.push(key);
    }
  }

  /**
   * Get from cache with strategy update
   */
  getFromCache(key: string): any | undefined {
    const value = this.cache.get(key);

    if (value && this.options.cacheStrategy === 'lru') {
      // Move to end for LRU
      const index = this.cacheOrder.indexOf(key);
      if (index > -1) {
        this.cacheOrder.splice(index, 1);
        this.cacheOrder.push(key);
      }
    }

    return value;
  }

  /**
   * Evict items from cache based on strategy
   */
  private evictFromCache(): void {
    if (this.cacheOrder.length === 0) return;

    const keyToEvict = this.cacheOrder.shift();
    if (keyToEvict) {
      this.cache.delete(keyToEvict);
    }
  }

  /**
   * Clear entire cache
   */
  clearCache(): void {
    this.cache.clear();
    this.cacheOrder = [];
  }

  /**
   * Check memory usage and pause if necessary
   */
  private async checkMemoryUsage(): Promise<void> {
    const usage = process.memoryUsage();

    if (usage.heapUsed > this.options.memoryLimit) {
      console.warn('[MemoryEfficient] Memory limit approaching, triggering garbage collection');

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      // Clear cache to free memory
      this.clearCache();

      // Wait for memory to stabilize
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check again
      const newUsage = process.memoryUsage();
      if (newUsage.heapUsed > this.options.memoryLimit * 0.9) {
        throw new Error(`Memory limit exceeded: ${newUsage.heapUsed} bytes`);
      }
    }
  }

  /**
   * Perform garbage collection if needed
   */
  private performGarbageCollection(): void {
    this.operationCount++;

    if (this.operationCount % this.options.gcInterval === 0) {
      if (global.gc) {
        global.gc();
      }

      // Also trim cache if it's getting large
      if (this.cache.size > this.options.cacheSize * 0.8) {
        const toRemove = Math.floor(this.cache.size * 0.2);
        for (let i = 0; i < toRemove; i++) {
          this.evictFromCache();
        }
      }
    }
  }

  /**
   * Create chunks from array
   */
  private createChunks<T>(items: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Process a stream chunk (placeholder for stream processing)
   */
  private async processStreamChunk(chunk: any): Promise<any> {
    // This would be implemented based on specific generation needs
    return chunk;
  }

  /**
   * Get current memory statistics
   */
  getMemoryStats(): {
    usage: NodeJS.MemoryUsage;
    cacheSize: number;
    cacheMemory: number;
  } {
    const usage = process.memoryUsage();

    // Estimate cache memory usage
    let cacheMemory = 0;
    for (const [key, value] of this.cache) {
      cacheMemory += key.length * 2; // Rough estimate for string
      cacheMemory += JSON.stringify(value).length * 2; // Rough estimate for value
    }

    return {
      usage,
      cacheSize: this.cache.size,
      cacheMemory,
    };
  }
}

/**
 * Helper class for managing memory pools
 */
export class MemoryPool<T> {
  private pool: T[] = [];
  private inUse: Set<T> = new Set();
  private factory: () => T;
  private reset: (item: T) => void;
  private maxSize: number;

  constructor(factory: () => T, reset: (item: T) => void, maxSize: number = 100) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  /**
   * Acquire an item from the pool
   */
  acquire(): T {
    let item = this.pool.pop();

    if (!item) {
      item = this.factory();
    }

    this.inUse.add(item);
    return item;
  }

  /**
   * Release an item back to the pool
   */
  release(item: T): void {
    if (!this.inUse.has(item)) {
      return;
    }

    this.inUse.delete(item);
    this.reset(item);

    if (this.pool.length < this.maxSize) {
      this.pool.push(item);
    }
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.pool = [];
    this.inUse.clear();
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    poolSize: number;
    inUseSize: number;
    totalSize: number;
  } {
    return {
      poolSize: this.pool.length,
      inUseSize: this.inUse.size,
      totalSize: this.pool.length + this.inUse.size,
    };
  }
}

/**
 * Create a memory-efficient generator instance
 */
export function createMemoryEfficientGenerator(
  options?: StreamingGenerationOptions,
): MemoryEfficientGenerator {
  return new MemoryEfficientGenerator(options);
}
