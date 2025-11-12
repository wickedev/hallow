/**
 * Centralized logging utility for @hallow/plugin.
 *
 * Provides consistent logging with configurable verbosity levels and formatting.
 * Supports verbose mode for detailed informational logging and debug mode for
 * extensive diagnostic output including dependency graphs and resolution paths.
 *
 * @packageDocumentation
 */

import type { PluginOptions, CacheStats, PerformanceMetrics, DependencyNode } from '../types';
import type { DependencyGraph } from './dependency-graph';

/**
 * Log level for message severity.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Logger configuration derived from plugin options.
 */
export interface LoggerConfig {
  /**
   * Enable verbose logging with detailed information.
   */
  verbose: boolean;

  /**
   * Enable debug mode with extensive diagnostic output.
   */
  debug: boolean;
}

/**
 * Logger class for centralized logging throughout the plugin.
 *
 * Provides methods for different types of logs with automatic formatting,
 * level filtering, and consistent prefix formatting.
 *
 * @example
 * ```typescript
 * const logger = new Logger({ verbose: true, debug: false });
 * logger.info('Processing proto file');
 * logger.debug('Dependency graph structure:', graph);
 * ```
 */
export class Logger {
  private config: LoggerConfig;
  private prefix = '[@hallow/plugin]';

  /**
   * Creates a new logger instance.
   *
   * @param config - Logger configuration
   */
  constructor(config: LoggerConfig) {
    this.config = config;
  }

  /**
   * Updates logger configuration.
   *
   * @param config - New logger configuration
   */
  updateConfig(config: LoggerConfig): void {
    this.config = config;
  }

  /**
   * Logs a debug message (only when debug mode is enabled).
   *
   * @param message - Message to log
   * @param data - Optional data to log (will be formatted)
   */
  debug(message: string, data?: unknown): void {
    if (!this.config.debug) return;

    console.log(`${this.prefix} [DEBUG] ${message}`);
    if (data !== undefined) {
      this.logData(data);
    }
  }

  /**
   * Logs an info message (only when verbose mode is enabled).
   *
   * @param message - Message to log
   * @param data - Optional data to log
   */
  info(message: string, data?: unknown): void {
    if (!this.config.verbose) return;

    console.log(`${this.prefix} ${message}`);
    if (data !== undefined) {
      this.logData(data);
    }
  }

  /**
   * Logs a warning message (always logged).
   *
   * @param message - Warning message
   */
  warn(message: string): void {
    console.warn(`${this.prefix} ${message}`);
  }

  /**
   * Logs an error message (always logged).
   *
   * @param message - Error message
   * @param error - Optional error object with stack trace
   */
  error(message: string, error?: Error): void {
    console.error(`${this.prefix} ${message}`);
    if (error && this.config.debug) {
      console.error('Full error stack:', error.stack);
    }
  }

  /**
   * Logs plugin initialization information (Task 21.1).
   *
   * Logs build system detection, configuration summary, and initialization success.
   *
   * @param buildSystem - Detected build system
   * @param config - Resolved plugin configuration
   */
  logInitialization(buildSystem: string, config: Required<PluginOptions>): void {
    // Always log initialization success
    console.log(`${this.prefix} Initialized successfully with ${buildSystem}`);

    // Log configuration in verbose mode (Task 21.1)
    if (this.config.verbose) {
      this.info('Configuration:');
      console.log('  Proto root:', config.protoRoot);
      console.log('  Include patterns:', config.include);
      console.log('  Exclude patterns:', config.exclude);
      console.log('  Generate React hooks:', config.generateReactHooks);
      console.log('  Generate Suspense hooks:', config.generateSuspenseHooks);
      console.log('  Source maps:', config.sourceMaps);
      console.log('  Cache size limit:', config.maxCacheSize, 'MB');
      console.log('  Performance monitoring:', config.enablePerformanceMonitoring);
      console.log('  Optimization:', {
        production: config.optimization?.production,
        minify: config.optimization?.minify,
        removeComments: config.optimization?.removeComments,
      });
    }

    // Log detailed configuration in debug mode (Task 21.2)
    if (this.config.debug) {
      this.debug('Full configuration:', config);
    }
  }

  /**
   * Logs cache statistics (Task 21.1).
   *
   * Logs cache hit/miss ratio and size metrics when verbose mode is enabled.
   *
   * @param stats - Cache statistics
   */
  logCacheStats(stats: CacheStats): void {
    if (!this.config.verbose) return;

    const hitRate = (stats.hitRate * 100).toFixed(1);
    this.info(
      `Cache stats: ${stats.hits} hits, ${stats.misses} misses (${hitRate}% hit rate), ` +
      `${stats.entryCount} entries, ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`
    );
  }

  /**
   * Logs cache hit event (Task 21.1).
   *
   * @param filePath - Proto file path
   */
  logCacheHit(filePath: string): void {
    if (!this.config.verbose) return;
    this.info(`Cache hit: ${filePath}`);
  }

  /**
   * Logs cache miss event (Task 21.1).
   *
   * @param filePath - Proto file path
   */
  logCacheMiss(filePath: string): void {
    if (!this.config.verbose) return;
    this.info(`Cache miss: ${filePath}`);
  }

  /**
   * Logs performance metrics for a file (Task 21.1).
   *
   * @param metrics - Performance metrics
   */
  logPerformanceMetrics(metrics: PerformanceMetrics): void {
    if (!this.config.verbose) return;

    this.info(
      `Performance [${metrics.filePath}]: ` +
      `parse=${metrics.parseMs}ms, generate=${metrics.generateMs}ms, ` +
      `total=${metrics.totalMs}ms, memory=${metrics.memoryMB.toFixed(2)}MB`
    );
  }

  /**
   * Logs dependency graph structure (Task 21.2).
   *
   * Only logs when debug mode is enabled.
   *
   * @param graph - Dependency graph instance
   */
  logDependencyGraph(_graph: DependencyGraph): void {
    if (!this.config.debug) return;

    // const nodes: DependencyNode[] = [];
    // Access internal nodes map (we'll need to expose a method for this)
    // For now, we'll log what we can through the public API

    this.debug('Dependency graph structure:');
    this.debug('  Use verbose mode to see detailed dependency information');
  }

  /**
   * Logs dependency node information (Task 21.2).
   *
   * @param node - Dependency node
   */
  logDependencyNode(node: DependencyNode): void {
    if (!this.config.debug) return;

    this.debug(`Dependency node: ${node.filePath}`);
    console.log('  Imports:', node.imports);
    console.log('  Imported by:', node.importedBy);
    console.log('  Hash:', node.hash);
    console.log('  Timestamp:', new Date(node.timestamp).toISOString());
  }

  /**
   * Logs proto resolution search paths (Task 21.2).
   *
   * @param importPath - Import path being resolved
   * @param searchPaths - List of paths searched
   */
  logResolutionPaths(importPath: string, searchPaths: string[]): void {
    if (!this.config.debug) return;

    this.debug(`Resolving import: ${importPath}`);
    console.log('  Search paths:');
    searchPaths.forEach((path, index) => {
      console.log(`    ${index + 1}. ${path}`);
    });
  }

  /**
   * Logs successful proto resolution (Task 21.2).
   *
   * @param importPath - Original import path
   * @param resolvedPath - Resolved absolute path
   * @param searchPathIndex - Index of search path that succeeded (optional)
   */
  logResolutionSuccess(importPath: string, resolvedPath: string, searchPathIndex?: number): void {
    if (!this.config.debug) return;

    let message = `Resolved: ${importPath} -> ${resolvedPath}`;
    if (searchPathIndex !== undefined) {
      message += ` (via search path #${searchPathIndex + 1})`;
    }
    this.debug(message);
  }

  /**
   * Logs proto file processing start (Task 21.1).
   *
   * @param filePath - Proto file being processed
   */
  logProcessingStart(filePath: string): void {
    if (!this.config.verbose) return;
    this.info(`Processing: ${filePath}`);
  }

  /**
   * Logs proto file processing completion (Task 21.1).
   *
   * @param filePath - Proto file that was processed
   * @param generatedSize - Size of generated code in bytes
   */
  logProcessingComplete(filePath: string, generatedSize: number): void {
    if (!this.config.verbose) return;
    this.info(
      `Completed: ${filePath} (generated ${(generatedSize / 1024).toFixed(2)} KB)`
    );
  }

  /**
   * Logs file watching registration (Task 21.1).
   *
   * @param filePath - File being watched
   */
  logFileWatched(filePath: string): void {
    if (!this.config.debug) return;
    this.debug(`Watching file: ${filePath}`);
  }

  /**
   * Logs HMR update event (Task 21.1).
   *
   * @param filePath - File that changed
   * @param affectedFiles - Files affected by the change
   */
  logHMRUpdate(filePath: string, affectedFiles: string[]): void {
    if (!this.config.verbose) return;

    this.info(`HMR update: ${filePath}`);
    if (affectedFiles.length > 0 && this.config.debug) {
      console.log('  Affected files:', affectedFiles);
    }
  }

  /**
   * Logs topological sort result (Task 21.2).
   *
   * @param sortedFiles - Files in dependency order
   */
  logTopologicalSort(sortedFiles: string[]): void {
    if (!this.config.debug) return;

    this.debug('Topological sort order:');
    sortedFiles.forEach((file, index) => {
      console.log(`  ${index + 1}. ${file}`);
    });
  }

  /**
   * Logs build completion summary (Task 21.1).
   *
   * @param fileCount - Number of files processed
   * @param totalTimeMs - Total processing time
   */
  logBuildComplete(fileCount: number, totalTimeMs: number): void {
    if (!this.config.verbose) return;

    this.info(
      `Build complete: Processed ${fileCount} proto file${fileCount === 1 ? '' : 's'} ` +
      `in ${totalTimeMs.toFixed(0)}ms`
    );
  }

  /**
   * Helper method to format and log data objects.
   *
   * @param data - Data to log
   */
  private logData(data: unknown): void {
    if (typeof data === 'object' && data !== null) {
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log(data);
    }
  }
}

/**
 * Creates a logger instance from plugin options.
 *
 * @param options - Plugin options containing verbose and debug flags
 * @returns Logger instance
 */
export function createLogger(options: PluginOptions): Logger {
  return new Logger({
    verbose: options.verbose ?? false,
    debug: options.debug ?? false,
  });
}
