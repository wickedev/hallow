/**
 * Glob pattern filtering utilities for @hallow/plugin.
 *
 * This module provides glob pattern matching for include/exclude filtering
 * of proto files during build-time transformation.
 *
 * Uses fast-glob's minimatch internally for efficient pattern matching.
 *
 * @packageDocumentation
 */

import { minimatch } from 'minimatch';
import * as path from 'path';

/**
 * Options for glob pattern filtering.
 */
export interface GlobFilterOptions {
  /**
   * Glob patterns to include (files matching these patterns will be processed).
   * Default: ['**\/*.proto']
   *
   * @example
   * ```typescript
   * include: ['src/**\/*.proto', 'api/**\/*.proto']
   * ```
   */
  include?: string[];

  /**
   * Glob patterns to exclude (files matching these patterns will be skipped).
   * Default: ['node_modules/**']
   *
   * @example
   * ```typescript
   * exclude: ['node_modules/**', '**\/*.test.proto']
   * ```
   */
  exclude?: string[];

  /**
   * Base directory for resolving relative paths.
   * Default: process.cwd()
   */
  baseDir?: string;
}

/**
 * Glob pattern filter for proto files.
 *
 * Provides efficient pattern matching using minimatch with support for:
 * - Include patterns (files must match at least one)
 * - Exclude patterns (files must not match any)
 * - Relative and absolute path normalization
 * - Common glob patterns (**, *, ?, etc.)
 *
 * @example
 * ```typescript
 * const filter = new GlobFilter({
 *   include: ['src/**\/*.proto'],
 *   exclude: ['node_modules/**', '**\/*.test.proto']
 * });
 *
 * filter.shouldInclude('/project/src/api/service.proto'); // true
 * filter.shouldInclude('/project/node_modules/dep/test.proto'); // false
 * filter.shouldInclude('/project/src/api/service.test.proto'); // false
 * ```
 */
export class GlobFilter {
  private readonly includePatterns: string[];
  private readonly excludePatterns: string[];
  private readonly baseDir: string;

  /**
   * Creates a new GlobFilter instance.
   *
   * @param options - Glob filter options
   */
  constructor(options: GlobFilterOptions = {}) {
    this.includePatterns = options.include || ['**/*.proto'];
    this.excludePatterns = options.exclude || ['**/node_modules/**', 'node_modules/**'];
    this.baseDir = options.baseDir || process.cwd();
  }

  /**
   * Checks if a file path should be included based on glob patterns.
   *
   * A file is included if:
   * 1. It matches at least one include pattern
   * 2. It does not match any exclude pattern
   *
   * @param filePath - File path to check (absolute or relative)
   * @returns true if file should be included, false otherwise
   *
   * @example
   * ```typescript
   * const filter = new GlobFilter({
   *   include: ['src/**\/*.proto'],
   *   exclude: ['**\/*.test.proto']
   * });
   *
   * filter.shouldInclude('/project/src/api/service.proto'); // true
   * filter.shouldInclude('/project/src/api/service.test.proto'); // false
   * filter.shouldInclude('/project/lib/other.proto'); // false (not in src/)
   * ```
   */
  shouldInclude(filePath: string): boolean {
    // Normalize the file path
    const normalizedPath = this.normalizePath(filePath);

    // Step 1: Check if file matches at least one include pattern
    const matchesInclude = this.matchesAnyPattern(
      normalizedPath,
      this.includePatterns
    );

    if (!matchesInclude) {
      return false;
    }

    // Step 2: Check if file matches any exclude pattern
    const matchesExclude = this.matchesAnyPattern(
      normalizedPath,
      this.excludePatterns
    );

    // Include only if matches include and does not match exclude
    return !matchesExclude;
  }

  /**
   * Normalizes a file path for pattern matching.
   *
   * Converts absolute paths to relative paths from baseDir,
   * normalizes path separators to forward slashes, and removes
   * leading './' for consistent matching.
   *
   * @param filePath - File path to normalize
   * @returns Normalized path for pattern matching
   *
   * @internal
   */
  private normalizePath(filePath: string): string {
    // First normalize all path separators to forward slashes (handle mixed separators)
    const forwardSlashPath = filePath.replace(/\\/g, '/');

    // Convert to absolute path if relative
    const absolutePath = path.isAbsolute(forwardSlashPath)
      ? forwardSlashPath
      : path.join(this.baseDir, forwardSlashPath).replace(/\\/g, '/');

    // Get relative path from baseDir
    const relativePath = path.relative(this.baseDir, absolutePath).replace(/\\/g, '/');

    // Remove leading './' if present
    return relativePath.startsWith('./')
      ? relativePath.slice(2)
      : relativePath;
  }

  /**
   * Checks if a file path matches any of the given glob patterns.
   *
   * Uses minimatch for pattern matching with common glob features:
   * - `**` matches zero or more directories
   * - `*` matches zero or more characters (except path separator)
   * - `?` matches exactly one character (except path separator)
   * - `[abc]` matches one character from the set
   * - `{a,b}` matches either a or b
   *
   * @param filePath - Normalized file path to check
   * @param patterns - Array of glob patterns
   * @returns true if path matches any pattern, false otherwise
   *
   * @internal
   */
  private matchesAnyPattern(filePath: string, patterns: string[]): boolean {
    return patterns.some((pattern) => {
      try {
        return minimatch(filePath, pattern, {
          // Enable dot file matching (files starting with .)
          dot: true,
          // Disable case-sensitive matching on Windows
          nocase: process.platform === 'win32',
        });
      } catch (error) {
        // Invalid pattern - log warning and skip
        console.warn(
          `[@hallow/plugin] Invalid glob pattern: ${pattern}`,
          error
        );
        return false;
      }
    });
  }

  /**
   * Gets the current include patterns.
   *
   * @returns Array of include glob patterns
   */
  getIncludePatterns(): string[] {
    return [...this.includePatterns];
  }

  /**
   * Gets the current exclude patterns.
   *
   * @returns Array of exclude glob patterns
   */
  getExcludePatterns(): string[] {
    return [...this.excludePatterns];
  }

  /**
   * Gets the base directory used for path normalization.
   *
   * @returns Base directory path
   */
  getBaseDir(): string {
    return this.baseDir;
  }
}
