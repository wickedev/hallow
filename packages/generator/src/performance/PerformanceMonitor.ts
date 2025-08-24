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
  maxGenerationTime?: number; // milliseconds
  maxMemoryUsage?: number; // bytes
  maxFileSize?: number; // bytes
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
export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private operationStack: OperationMetrics[] = [];
  private memoryInterval?: NodeJS.Timeout;
  private peakMemory = { heapUsed: 0, heapTotal: 0 };
  private thresholds?: PerformanceThresholds;
  private readonly sampleInterval = 100; // ms

  constructor(thresholds?: PerformanceThresholds) {
    this.thresholds = thresholds;
    this.metrics = this.initializeMetrics();
  }

  /**
   * Start monitoring performance
   */
  start(): void {
    this.metrics = this.initializeMetrics();
    this.startMemoryMonitoring();
  }

  /**
   * Stop monitoring and return final metrics
   */
  stop(): PerformanceMetrics {
    this.stopMemoryMonitoring();
    this.metrics.endTime = Date.now();
    this.metrics.duration = this.metrics.endTime - this.metrics.startTime;
    this.metrics.memoryUsage = process.memoryUsage();
    this.metrics.peakMemoryUsage = { ...this.peakMemory };
    
    this.checkThresholds();
    return { ...this.metrics };
  }

  /**
   * Start tracking a specific operation
   */
  startOperation(name: string, metadata?: Record<string, any>): void {
    const operation: OperationMetrics = {
      name,
      startTime: Date.now(),
      endTime: 0,
      duration: 0,
      metadata,
      memoryDelta: process.memoryUsage().heapUsed,
    };
    this.operationStack.push(operation);
  }

  /**
   * End tracking for the most recent operation
   */
  endOperation(): OperationMetrics | undefined {
    const operation = this.operationStack.pop();
    if (operation) {
      operation.endTime = Date.now();
      operation.duration = operation.endTime - operation.startTime;
      
      if (operation.memoryDelta !== undefined) {
        operation.memoryDelta = process.memoryUsage().heapUsed - operation.memoryDelta;
      }
      
      this.metrics.operations.push(operation);
      return operation;
    }
  }

  /**
   * Record file generation metrics
   */
  recordFileGeneration(metrics: FileGenerationMetrics): void {
    if (!this.metrics.fileMetrics) {
      this.metrics.fileMetrics = [];
    }
    this.metrics.fileMetrics.push(metrics);
    
    // Check file-specific thresholds
    if (this.thresholds?.maxFileSize && metrics.fileSize > this.thresholds.maxFileSize) {
      console.warn(`[Performance] File ${metrics.fileName} exceeds size threshold: ${metrics.fileSize} bytes`);
    }
  }

  /**
   * Record template processing metrics
   */
  recordTemplateMetrics(metrics: TemplateProcessingMetrics): void {
    this.metrics.templateMetrics = metrics;
  }

  /**
   * Record type resolution metrics
   */
  recordTypeResolution(metrics: TypeResolutionMetrics): void {
    this.metrics.typeResolutionMetrics = metrics;
  }

  /**
   * Get current metrics snapshot
   */
  getSnapshot(): PerformanceMetrics {
    const current = { ...this.metrics };
    current.memoryUsage = process.memoryUsage();
    current.duration = Date.now() - current.startTime;
    return current;
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): {
    current: NodeJS.MemoryUsage;
    peak: { heapUsed: number; heapTotal: number };
    delta: number;
  } {
    const current = process.memoryUsage();
    const delta = current.heapUsed - this.metrics.memoryUsage.heapUsed;
    
    return {
      current,
      peak: { ...this.peakMemory },
      delta,
    };
  }

  /**
   * Get operation statistics
   */
  getOperationStats(): {
    totalOperations: number;
    totalDuration: number;
    averageDuration: number;
    slowestOperation?: OperationMetrics;
    operations: Record<string, { count: number; totalTime: number; avgTime: number }>;
  } {
    const stats: Record<string, { count: number; totalTime: number; avgTime: number }> = {};
    let slowest: OperationMetrics | undefined;
    let totalDuration = 0;

    for (const op of this.metrics.operations) {
      if (!stats[op.name]) {
        stats[op.name] = { count: 0, totalTime: 0, avgTime: 0 };
      }
      
      stats[op.name].count++;
      stats[op.name].totalTime += op.duration;
      totalDuration += op.duration;
      
      if (!slowest || op.duration > slowest.duration) {
        slowest = op;
      }
    }

    // Calculate averages
    for (const name in stats) {
      stats[name].avgTime = stats[name].totalTime / stats[name].count;
    }

    return {
      totalOperations: this.metrics.operations.length,
      totalDuration,
      averageDuration: this.metrics.operations.length > 0 
        ? totalDuration / this.metrics.operations.length 
        : 0,
      slowestOperation: slowest,
      operations: stats,
    };
  }

  /**
   * Generate a performance report
   */
  generateReport(): string {
    const snapshot = this.getSnapshot();
    const memStats = this.getMemoryStats();
    const opStats = this.getOperationStats();
    
    const report = [
      '# Performance Report',
      '',
      '## Summary',
      `- Total Duration: ${snapshot.duration}ms`,
      `- Memory Usage: ${this.formatBytes(memStats.current.heapUsed)}`,
      `- Peak Memory: ${this.formatBytes(memStats.peak.heapUsed)}`,
      `- Memory Delta: ${this.formatBytes(memStats.delta)}`,
      '',
      '## Operations',
      `- Total Operations: ${opStats.totalOperations}`,
      `- Average Duration: ${opStats.averageDuration.toFixed(2)}ms`,
      '',
    ];

    if (opStats.slowestOperation) {
      report.push(
        `### Slowest Operation`,
        `- Name: ${opStats.slowestOperation.name}`,
        `- Duration: ${opStats.slowestOperation.duration}ms`,
        '',
      );
    }

    report.push('### Operation Breakdown');
    for (const [name, stats] of Object.entries(opStats.operations)) {
      report.push(
        `- **${name}**:`,
        `  - Count: ${stats.count}`,
        `  - Total Time: ${stats.totalTime}ms`,
        `  - Average Time: ${stats.avgTime.toFixed(2)}ms`,
      );
    }

    if (snapshot.fileMetrics && snapshot.fileMetrics.length > 0) {
      report.push('', '## File Generation');
      const totalSize = snapshot.fileMetrics.reduce((sum, f) => sum + f.fileSize, 0);
      const totalLines = snapshot.fileMetrics.reduce((sum, f) => sum + f.linesOfCode, 0);
      
      report.push(
        `- Files Generated: ${snapshot.fileMetrics.length}`,
        `- Total Size: ${this.formatBytes(totalSize)}`,
        `- Total Lines: ${totalLines}`,
        '',
        '### Files:',
      );
      
      for (const file of snapshot.fileMetrics) {
        report.push(
          `- **${file.fileName}**:`,
          `  - Size: ${this.formatBytes(file.fileSize)}`,
          `  - Lines: ${file.linesOfCode}`,
          `  - Generation Time: ${file.generationTime}ms`,
        );
      }
    }

    if (snapshot.templateMetrics) {
      const tm = snapshot.templateMetrics;
      report.push(
        '',
        '## Template Processing',
        `- Templates Compiled: ${tm.templatesCompiled}`,
        `- Compilation Time: ${tm.compilationTime}ms`,
        `- Rendering Time: ${tm.renderingTime}ms`,
        `- Cache Hit Rate: ${(tm.cacheHitRate * 100).toFixed(1)}%`,
        `- Total Template Size: ${this.formatBytes(tm.totalTemplateSize)}`,
      );
    }

    if (snapshot.typeResolutionMetrics) {
      const tr = snapshot.typeResolutionMetrics;
      report.push(
        '',
        '## Type Resolution',
        `- Types Resolved: ${tr.typesResolved}`,
        `- Resolution Time: ${tr.resolutionTime}ms`,
        `- Cache Hit Rate: ${((tr.cacheHits / (tr.cacheHits + tr.cacheMisses)) * 100).toFixed(1)}%`,
        `- Circular Dependencies: ${tr.circularDependencies}`,
        `- Deepest Nesting: ${tr.deepestNesting}`,
      );
    }

    return report.join('\n');
  }

  /**
   * Check performance against thresholds and log warnings
   */
  private checkThresholds(): void {
    if (!this.thresholds) return;

    const snapshot = this.getSnapshot();
    
    // Check generation time
    if (this.thresholds.maxGenerationTime && snapshot.duration) {
      if (snapshot.duration > this.thresholds.maxGenerationTime) {
        console.error(`[Performance] Generation time exceeded threshold: ${snapshot.duration}ms > ${this.thresholds.maxGenerationTime}ms`);
      } else if (this.thresholds.warnThresholds?.generationTime && 
                 snapshot.duration > this.thresholds.warnThresholds.generationTime) {
        console.warn(`[Performance] Generation time warning: ${snapshot.duration}ms`);
      }
    }

    // Check memory usage
    if (this.thresholds.maxMemoryUsage && this.peakMemory.heapUsed > this.thresholds.maxMemoryUsage) {
      console.error(`[Performance] Memory usage exceeded threshold: ${this.formatBytes(this.peakMemory.heapUsed)}`);
    } else if (this.thresholds.warnThresholds?.memoryUsage && 
               this.peakMemory.heapUsed > this.thresholds.warnThresholds.memoryUsage) {
      console.warn(`[Performance] Memory usage warning: ${this.formatBytes(this.peakMemory.heapUsed)}`);
    }
  }

  /**
   * Initialize metrics object
   */
  private initializeMetrics(): PerformanceMetrics {
    const memUsage = process.memoryUsage();
    return {
      startTime: Date.now(),
      memoryUsage: memUsage,
      operations: [],
    };
  }

  /**
   * Start monitoring memory usage
   */
  private startMemoryMonitoring(): void {
    this.memoryInterval = setInterval(() => {
      const current = process.memoryUsage();
      if (current.heapUsed > this.peakMemory.heapUsed) {
        this.peakMemory.heapUsed = current.heapUsed;
        this.peakMemory.heapTotal = current.heapTotal;
      }
    }, this.sampleInterval);
  }

  /**
   * Stop monitoring memory usage
   */
  private stopMemoryMonitoring(): void {
    if (this.memoryInterval) {
      clearInterval(this.memoryInterval);
      this.memoryInterval = undefined;
    }
  }

  /**
   * Format bytes to human-readable string
   */
  private formatBytes(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(2)} ${sizes[i]}`;
  }
}

/**
 * Create a performance monitor instance
 */
export function createPerformanceMonitor(thresholds?: PerformanceThresholds): PerformanceMonitor {
  return new PerformanceMonitor(thresholds);
}

/**
 * Decorator to monitor method performance
 */
export function MonitorPerformance(operationName?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const monitor = (this as any).performanceMonitor as PerformanceMonitor | undefined;
      const name = operationName || `${target.constructor.name}.${propertyKey}`;
      
      if (monitor) {
        monitor.startOperation(name);
      }
      
      try {
        const result = await originalMethod.apply(this, args);
        return result;
      } finally {
        if (monitor) {
          monitor.endOperation();
        }
      }
    };
    
    return descriptor;
  };
}