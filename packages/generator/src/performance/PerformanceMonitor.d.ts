/**
 * Performance monitoring utilities for code generation
 */
export interface PerformanceMetrics {
    startTime: number;
    endTime?: number;
    duration?: number;
    memoryUsage: {
        heapUsed: number;
        heapTotal: number;
        external: number;
        rss: number;
    };
    peakMemoryUsage?: {
        heapUsed: number;
        heapTotal: number;
    };
    operations: OperationMetrics[];
    fileMetrics?: FileGenerationMetrics[];
    templateMetrics?: TemplateProcessingMetrics;
    typeResolutionMetrics?: TypeResolutionMetrics;
}
export interface OperationMetrics {
    name: string;
    startTime: number;
    endTime: number;
    duration: number;
    memoryDelta?: number;
    metadata?: Record<string, any>;
}
export interface FileGenerationMetrics {
    fileName: string;
    fileSize: number;
    generationTime: number;
    linesOfCode: number;
    complexity?: number;
    memoryUsed?: number;
}
export interface TemplateProcessingMetrics {
    templatesCompiled: number;
    compilationTime: number;
    renderingTime: number;
    cacheHitRate: number;
    totalTemplateSize: number;
}
export interface TypeResolutionMetrics {
    typesResolved: number;
    resolutionTime: number;
    cacheHits: number;
    cacheMisses: number;
    circularDependencies: number;
    deepestNesting: number;
}
export interface PerformanceThresholds {
    maxGenerationTime?: number;
    maxMemoryUsage?: number;
    maxFileSize?: number;
    maxComplexity?: number;
    warnThresholds?: {
        generationTime?: number;
        memoryUsage?: number;
        fileSize?: number;
    };
}
/**
 * Performance monitor for tracking code generation metrics
 */
export declare class PerformanceMonitor {
    private metrics;
    private operationStack;
    private memoryInterval?;
    private peakMemory;
    private thresholds?;
    private readonly sampleInterval;
    constructor(thresholds?: PerformanceThresholds);
    /**
     * Start monitoring performance
     */
    start(): void;
    /**
     * Stop monitoring and return final metrics
     */
    stop(): PerformanceMetrics;
    /**
     * Start tracking a specific operation
     */
    startOperation(name: string, metadata?: Record<string, any>): void;
    /**
     * End tracking for the most recent operation
     */
    endOperation(): OperationMetrics | undefined;
    /**
     * Record file generation metrics
     */
    recordFileGeneration(metrics: FileGenerationMetrics): void;
    /**
     * Record template processing metrics
     */
    recordTemplateMetrics(metrics: TemplateProcessingMetrics): void;
    /**
     * Record type resolution metrics
     */
    recordTypeResolution(metrics: TypeResolutionMetrics): void;
    /**
     * Get current metrics snapshot
     */
    getSnapshot(): PerformanceMetrics;
    /**
     * Get memory usage statistics
     */
    getMemoryStats(): {
        current: NodeJS.MemoryUsage;
        peak: {
            heapUsed: number;
            heapTotal: number;
        };
        delta: number;
    };
    /**
     * Get operation statistics
     */
    getOperationStats(): {
        totalOperations: number;
        totalDuration: number;
        averageDuration: number;
        slowestOperation?: OperationMetrics;
        operations: Record<string, {
            count: number;
            totalTime: number;
            avgTime: number;
        }>;
    };
    /**
     * Generate a performance report
     */
    generateReport(): string;
    /**
     * Check performance against thresholds and log warnings
     */
    private checkThresholds;
    /**
     * Initialize metrics object
     */
    private initializeMetrics;
    /**
     * Start monitoring memory usage
     */
    private startMemoryMonitoring;
    /**
     * Stop monitoring memory usage
     */
    private stopMemoryMonitoring;
    /**
     * Format bytes to human-readable string
     */
    private formatBytes;
}
/**
 * Create a performance monitor instance
 */
export declare function createPerformanceMonitor(thresholds?: PerformanceThresholds): PerformanceMonitor;
/**
 * Decorator to monitor method performance
 */
export declare function MonitorPerformance(operationName?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
//# sourceMappingURL=PerformanceMonitor.d.ts.map