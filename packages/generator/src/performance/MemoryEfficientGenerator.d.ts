/**
 * Memory-efficient code generation strategies for large proto schemas
 */
import { ProtoFile, MessageDefinition, EnumDefinition } from '../core/proto-types';
import { GeneratedFile } from '../core/types';
import { Readable, Transform } from 'stream';
import { ResolvedImport } from '../utils/DependencyResolver';
export interface StreamingGenerationOptions {
    chunkSize?: number;
    memoryLimit?: number;
    useStreaming?: boolean;
    gcInterval?: number;
    cacheStrategy?: 'lru' | 'fifo' | 'none';
    cacheSize?: number;
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
export declare class MemoryEfficientGenerator {
    private options;
    private cache;
    private cacheOrder;
    private operationCount;
    private dependencyResolver;
    private currentChunkSize;
    private memoryHistory;
    private readonly MEMORY_HISTORY_SIZE;
    constructor(options?: StreamingGenerationOptions);
    /**
     * Generate code in chunks to manage memory efficiently
     */
    generateInChunks(protoFile: ProtoFile, generator: (items: any[], type: string) => Promise<GeneratedFile[]>): AsyncGenerator<GeneratedFile[], void, unknown>;
    /**
     * Generate messages in chunks with async generator
     * Provides fine-grained control over message generation with progress reporting
     */
    generateMessagesInChunks(messages: MessageDefinition[], generator: (messages: MessageDefinition[]) => Promise<GeneratedFile[]>): AsyncGenerator<{
        files: GeneratedFile[];
        metadata: ChunkMetadata;
    }, void, unknown>;
    /**
     * Generate enums in chunks using the same infrastructure as messages
     */
    generateEnumsInChunks(enums: EnumDefinition[], generator: (enums: EnumDefinition[]) => Promise<GeneratedFile[]>): AsyncGenerator<{
        files: GeneratedFile[];
        metadata: ChunkMetadata;
    }, void, unknown>;
    /**
     * Calculate optimal chunk size based on memory constraints and item count
     * Dynamically adjusts based on heap monitoring and memory trends
     */
    private calculateOptimalChunkSize;
    /**
     * Analyze memory usage trend from history
     * Returns a value indicating growth rate (positive = growing, negative = decreasing)
     */
    private analyzeMemoryTrend;
    /**
     * Log memory metrics for debugging
     */
    private logMemoryMetrics;
    /**
     * Report progress for chunk processing
     */
    private reportProgress;
    /**
     * Resolve cross-chunk dependencies for messages and enums
     * Should be called after all chunks are processed
     */
    resolveCrossChunkDependencies(chunkIndex: number): ResolvedImport[];
    /**
     * Add messages to dependency graph for tracking
     */
    trackMessageDependencies(messages: MessageDefinition[], chunkIndex: number): void;
    /**
     * Add enums to dependency graph for tracking
     */
    trackEnumDependencies(enums: EnumDefinition[], chunkIndex: number): void;
    /**
     * Get topological order for types (useful for code generation)
     */
    getTopologicalOrder(): string[];
    /**
     * Get dependency graph statistics
     */
    getDependencyStats(): {
        totalNodes: number;
        totalEdges: number;
        totalChunks: number;
        avgDependenciesPerNode: number;
    };
    /**
     * Process items in chunks
     */
    private processChunks;
    /**
     * Create a streaming transform for code generation
     */
    createGenerationStream(): Transform;
    /**
     * Stream-based file generation for very large outputs
     */
    generateFileStream(content: string[], fileName: string): Promise<Readable>;
    /**
     * Optimize memory usage by clearing unnecessary data
     */
    optimizeMemory(data: any): any;
    /**
     * Cache management with memory limits
     */
    addToCache(key: string, value: any): void;
    /**
     * Get from cache with strategy update
     */
    getFromCache(key: string): any | undefined;
    /**
     * Evict items from cache based on strategy
     */
    private evictFromCache;
    /**
     * Clear entire cache
     */
    clearCache(): void;
    /**
     * Check memory usage and pause if necessary
     */
    private checkMemoryUsage;
    /**
     * Perform garbage collection if needed
     */
    private performGarbageCollection;
    /**
     * Create chunks from array
     */
    private createChunks;
    /**
     * Process a stream chunk (placeholder for stream processing)
     */
    private processStreamChunk;
    /**
     * Get current memory statistics
     */
    getMemoryStats(): {
        usage: NodeJS.MemoryUsage;
        cacheSize: number;
        cacheMemory: number;
    };
}
/**
 * Helper class for managing memory pools
 */
export declare class MemoryPool<T> {
    private pool;
    private inUse;
    private factory;
    private reset;
    private maxSize;
    constructor(factory: () => T, reset: (item: T) => void, maxSize?: number);
    /**
     * Acquire an item from the pool
     */
    acquire(): T;
    /**
     * Release an item back to the pool
     */
    release(item: T): void;
    /**
     * Clear the pool
     */
    clear(): void;
    /**
     * Get pool statistics
     */
    getStats(): {
        poolSize: number;
        inUseSize: number;
        totalSize: number;
    };
}
/**
 * Create a memory-efficient generator instance
 */
export declare function createMemoryEfficientGenerator(options?: StreamingGenerationOptions): MemoryEfficientGenerator;
//# sourceMappingURL=MemoryEfficientGenerator.d.ts.map