/**
 * Performance monitoring utilities for the Hallow plugin.
 *
 * This module provides performance tracking and reporting capabilities for proto file
 * processing. It tracks parse time, generation time, total processing time, and memory usage
 * for each proto file, enabling performance optimization and bottleneck identification.
 *
 * @packageDocumentation
 */

import { performance } from 'perf_hooks';
import type { PerformanceMetrics, PerformanceSummary } from '../types';

/**
 * Timer state for tracking operation start times.
 *
 * @internal
 */
interface TimerState {
  /**
   * Start time in milliseconds from performance.now()
   */
  startTime: number;

  /**
   * Parse phase start time
   */
  parseStartTime?: number;

  /**
   * Generate phase start time
   */
  generateStartTime?: number;

  /**
   * Initial memory usage in bytes
   */
  initialMemory: number;
}

/**
 * Performance monitor for tracking proto file processing metrics.
 *
 * Collects and aggregates performance data including parse time, generation time,
 * total processing time, and memory usage. Supports threshold-based warnings for
 * slow file processing.
 *
 * @example
 * ```typescript
 * const monitor = new PerformanceMonitor(true, 1000);
 *
 * // Start tracking a file
 * monitor.startTimer('/path/to/service.proto');
 *
 * // Record parse phase
 * monitor.recordParse('/path/to/service.proto', 45);
 *
 * // Record generate phase
 * monitor.recordGenerate('/path/to/service.proto', 120);
 *
 * // Record total and check threshold
 * monitor.recordTotal('/path/to/service.proto', 165, 12.5);
 * monitor.checkThreshold('/path/to/service.proto');
 *
 * // Get summary
 * const summary = monitor.getSummary();
 * console.log(`Processed ${summary.totalFiles} files in ${summary.totalTimeMs}ms`);
 * ```
 */
export class PerformanceMonitor {
  /**
   * Map of file paths to their performance metrics
   */
  private metrics: Map<string, PerformanceMetrics>;

  /**
   * Map of file paths to their timer states (active timers)
   */
  private timers: Map<string, TimerState>;

  /**
   * Whether performance monitoring is enabled
   */
  private enabled: boolean;

  /**
   * Performance threshold in milliseconds
   * Files exceeding this will trigger warnings
   */
  private threshold: number;

  /**
   * Creates a new PerformanceMonitor instance.
   *
   * @param enabled - Whether performance monitoring is enabled
   * @param threshold - Performance threshold in milliseconds (default: 1000)
   *
   * @example
   * ```typescript
   * // Create monitor with 500ms threshold
   * const monitor = new PerformanceMonitor(true, 500);
   *
   * // Create disabled monitor
   * const noopMonitor = new PerformanceMonitor(false);
   * ```
   */
  constructor(enabled: boolean, threshold: number = 1000) {
    this.metrics = new Map();
    this.timers = new Map();
    this.enabled = enabled;
    this.threshold = threshold;
  }

  /**
   * Starts a performance timer for a proto file.
   *
   * Records the start time and initial memory usage. This should be called
   * at the beginning of the transform hook before any processing begins.
   *
   * @param filePath - Absolute path to the proto file
   *
   * @example
   * ```typescript
   * monitor.startTimer('/project/protos/service.proto');
   * // ... perform parsing and generation ...
   * monitor.recordTotal('/project/protos/service.proto', totalMs, memoryMB);
   * ```
   */
  startTimer(filePath: string): void {
    if (!this.enabled) {
      return;
    }

    const memUsage = process.memoryUsage();
    const initialMemory = memUsage.heapUsed;

    this.timers.set(filePath, {
      startTime: performance.now(),
      initialMemory,
    });
  }

  /**
   * Records the parse phase time for a proto file.
   *
   * Should be called immediately after the parser completes.
   *
   * @param filePath - Absolute path to the proto file
   * @param timeMs - Parse time in milliseconds
   *
   * @example
   * ```typescript
   * const parseStart = performance.now();
   * const ast = parser.parse(content, filePath);
   * const parseTime = performance.now() - parseStart;
   * monitor.recordParse(filePath, parseTime);
   * ```
   */
  recordParse(filePath: string, timeMs: number): void {
    if (!this.enabled) {
      return;
    }

    const timer = this.timers.get(filePath);
    if (timer) {
      timer.parseStartTime = timeMs;
    }

    // Initialize or update metrics entry
    const existing = this.metrics.get(filePath);
    if (existing) {
      existing.parseMs = timeMs;
    } else {
      this.metrics.set(filePath, {
        filePath,
        parseMs: timeMs,
        generateMs: 0,
        totalMs: 0,
        memoryMB: 0,
        cacheHit: false,
      });
    }
  }

  /**
   * Records the code generation phase time for a proto file.
   *
   * Should be called immediately after the generator completes.
   *
   * @param filePath - Absolute path to the proto file
   * @param timeMs - Generation time in milliseconds
   *
   * @example
   * ```typescript
   * const genStart = performance.now();
   * const generated = generator.generate(ast, options);
   * const genTime = performance.now() - genStart;
   * monitor.recordGenerate(filePath, genTime);
   * ```
   */
  recordGenerate(filePath: string, timeMs: number): void {
    if (!this.enabled) {
      return;
    }

    const timer = this.timers.get(filePath);
    if (timer) {
      timer.generateStartTime = timeMs;
    }

    // Initialize or update metrics entry
    const existing = this.metrics.get(filePath);
    if (existing) {
      existing.generateMs = timeMs;
    } else {
      this.metrics.set(filePath, {
        filePath,
        parseMs: 0,
        generateMs: timeMs,
        totalMs: 0,
        memoryMB: 0,
        cacheHit: false,
      });
    }
  }

  /**
   * Records the total processing time and memory usage for a proto file.
   *
   * Should be called at the end of the transform hook after all processing
   * is complete. Calculates memory delta from the start of processing.
   *
   * @param filePath - Absolute path to the proto file
   * @param timeMs - Total processing time in milliseconds
   * @param memoryMB - Memory used in megabytes (optional, will be calculated if not provided)
   * @param cacheHit - Whether this was a cache hit (default: false)
   *
   * @example
   * ```typescript
   * const totalTime = performance.now() - startTime;
   * const memUsed = (process.memoryUsage().heapUsed - initialMemory) / 1024 / 1024;
   * monitor.recordTotal(filePath, totalTime, memUsed);
   * ```
   */
  recordTotal(filePath: string, timeMs: number, memoryMB?: number, cacheHit: boolean = false): void {
    if (!this.enabled) {
      return;
    }

    const timer = this.timers.get(filePath);

    // Calculate memory usage if not provided
    let finalMemoryMB = memoryMB;
    if (finalMemoryMB === undefined && timer) {
      const currentMemory = process.memoryUsage().heapUsed;
      const memoryDelta = currentMemory - timer.initialMemory;
      finalMemoryMB = memoryDelta / 1024 / 1024; // Convert bytes to MB
    }

    // Initialize or update metrics entry
    const existing = this.metrics.get(filePath);
    if (existing) {
      existing.totalMs = timeMs;
      existing.memoryMB = finalMemoryMB || 0;
      existing.cacheHit = cacheHit;
    } else {
      this.metrics.set(filePath, {
        filePath,
        parseMs: 0,
        generateMs: 0,
        totalMs: timeMs,
        memoryMB: finalMemoryMB || 0,
        cacheHit,
      });
    }

    // Clean up timer state
    if (timer) {
      this.timers.delete(filePath);
    }
  }

  /**
   * Checks if a file's processing time exceeds the threshold and logs a warning.
   *
   * Should be called after recordTotal() to check if the file took too long
   * to process.
   *
   * @param filePath - Absolute path to the proto file
   *
   * @example
   * ```typescript
   * monitor.recordTotal(filePath, totalTime, memoryMB);
   * monitor.checkThreshold(filePath); // Logs warning if totalTime > threshold
   * ```
   */
  checkThreshold(filePath: string): void {
    if (!this.enabled) {
      return;
    }

    const metrics = this.metrics.get(filePath);
    if (!metrics) {
      return;
    }

    if (metrics.totalMs > this.threshold) {
      console.warn(
        `[Hallow Plugin] Performance warning: ${filePath} took ${metrics.totalMs.toFixed(2)}ms to process ` +
        `(threshold: ${this.threshold}ms)`
      );

      // Add breakdown if available
      if (metrics.parseMs > 0 || metrics.generateMs > 0) {
        console.warn(
          `  Parse: ${metrics.parseMs.toFixed(2)}ms, ` +
          `Generate: ${metrics.generateMs.toFixed(2)}ms, ` +
          `Memory: ${metrics.memoryMB.toFixed(2)}MB`
        );
      }
    }
  }

  /**
   * Generates a performance summary across all processed files.
   *
   * Calculates aggregate statistics including total files, total time,
   * average time, and identifies the slowest files.
   *
   * @returns Performance summary object
   *
   * @example
   * ```typescript
   * const summary = monitor.getSummary();
   * console.log(`Processed ${summary.totalFiles} files`);
   * console.log(`Average time: ${summary.averageTimeMs}ms`);
   * console.log(`Peak memory: ${summary.memoryPeakMB}MB`);
   * console.log('Slowest files:', summary.slowestFiles.slice(0, 5));
   * ```
   */
  getSummary(): PerformanceSummary {
    if (!this.enabled || this.metrics.size === 0) {
      return {
        totalFiles: 0,
        totalTimeMs: 0,
        averageTimeMs: 0,
        slowestFiles: [],
        memoryPeakMB: 0,
      };
    }

    const allMetrics = Array.from(this.metrics.values());

    const totalTimeMs = allMetrics.reduce((sum, m) => sum + m.totalMs, 0);
    const totalFiles = allMetrics.length;
    const averageTimeMs = totalFiles > 0 ? totalTimeMs / totalFiles : 0;

    // Find peak memory usage
    const memoryPeakMB = Math.max(...allMetrics.map(m => m.memoryMB), 0);

    // Sort by processing time descending and take top 10
    const slowestFiles = allMetrics
      .sort((a, b) => b.totalMs - a.totalMs)
      .slice(0, 10);

    return {
      totalFiles,
      totalTimeMs,
      averageTimeMs,
      slowestFiles,
      memoryPeakMB,
    };
  }

  /**
   * Exports a detailed performance report to a JSON file.
   *
   * Writes comprehensive performance data including all metrics and summary
   * statistics to the specified output path.
   *
   * @param outputPath - Absolute path where the report should be written
   * @returns Promise that resolves when the report is written
   *
   * @example
   * ```typescript
   * await monitor.exportReport('/project/.hallow-cache/performance.json');
   * ```
   */
  async exportReport(outputPath: string): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const fs = await import('fs/promises');
    const path = await import('path');

    const summary = this.getSummary();
    const allMetrics = Array.from(this.metrics.values());

    const report = {
      timestamp: new Date().toISOString(),
      summary,
      metrics: allMetrics,
      threshold: this.threshold,
    };

    // Ensure directory exists
    const dir = path.dirname(outputPath);
    await fs.mkdir(dir, { recursive: true });

    // Write report
    await fs.writeFile(
      outputPath,
      JSON.stringify(report, null, 2),
      'utf-8'
    );
  }

  /**
   * Clears all collected metrics and timer state.
   *
   * Useful for resetting the monitor between builds or test runs.
   *
   * @example
   * ```typescript
   * monitor.clear();
   * // All metrics are now reset
   * ```
   */
  clear(): void {
    this.metrics.clear();
    this.timers.clear();
  }

  /**
   * Gets the current number of active timers.
   *
   * Useful for debugging and testing to ensure timers are being
   * properly cleaned up.
   *
   * @returns Number of active timers
   *
   * @internal
   */
  getActiveTimerCount(): number {
    return this.timers.size;
  }

  /**
   * Gets the current number of collected metrics.
   *
   * @returns Number of metrics entries
   *
   * @internal
   */
  getMetricsCount(): number {
    return this.metrics.size;
  }

  /**
   * Gets metrics for a specific file.
   *
   * @param filePath - Absolute path to the proto file
   * @returns Performance metrics or undefined if not found
   *
   * @internal
   */
  getMetrics(filePath: string): PerformanceMetrics | undefined {
    return this.metrics.get(filePath);
  }
}
