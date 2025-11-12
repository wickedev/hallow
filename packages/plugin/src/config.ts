/**
 * Configuration validation and management for @hallow/plugin.
 *
 * This module provides schema-based validation using Zod, default configuration merging,
 * and helpful error messages with suggestions for common mistakes.
 *
 * @packageDocumentation
 */

import { z } from 'zod';
import type {
  PluginOptions,
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from './types';

// ============================================================================
// Zod Schemas
// ============================================================================

/**
 * Zod schema for OptimizationOptions.
 * Validates all optimization-related configuration fields.
 */
const OptimizationOptionsSchema = z.object({
  production: z.boolean().optional(),
  minify: z.boolean().optional(),
  removeComments: z.boolean().optional(),
  deadCodeElimination: z.boolean().optional(),
  treeshaking: z.boolean().optional(),
  codeSplitting: z.boolean().optional(),
  lazyLoading: z.boolean().optional(),
  bundleSizeTarget: z.number().positive().int().optional(),
}).strict();

/**
 * Zod schema for PluginOptions.
 * Validates the entire plugin configuration with comprehensive type checking.
 */
const PluginOptionsSchema = z.object({
  // File filtering
  include: z.array(z.string()).optional(),
  exclude: z.array(z.string()).optional(),

  // Proto resolution
  protoRoot: z.string().optional(),
  importPaths: z.array(z.string()).optional(),

  // Code generation
  generateReactHooks: z.boolean().optional(),
  generateSuspenseHooks: z.boolean().optional(),
  serverUrl: z.string().url().optional(),

  // Build optimization
  sourceMaps: z.boolean().optional(),
  optimization: OptimizationOptionsSchema.optional(),

  // Caching
  cacheDir: z.string().optional(),
  maxCacheSize: z.number().positive().optional(),
  enablePersistentCache: z.boolean().optional(),

  // Performance monitoring
  enablePerformanceMonitoring: z.boolean().optional(),
  performanceThreshold: z.number().positive().optional(),

  // Debugging
  verbose: z.boolean().optional(),
  debug: z.boolean().optional(),
}).strict();

// ============================================================================
// Default Configuration
// ============================================================================

/**
 * Detects if the build is running in production mode.
 *
 * Checks both NODE_ENV environment variable and common build system
 * production flags (e.g., --mode=production, --production).
 *
 * @returns true if production mode is detected
 * @internal
 */
function detectProductionMode(): boolean {
  // Check NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    return true;
  }

  // Check common build system flags
  const args = process.argv.slice(2);
  return args.some((arg) =>
    arg.includes('--mode=production') ||
    arg.includes('--production') ||
    arg.includes('mode:production')
  );
}

/**
 * Default plugin configuration values.
 *
 * These defaults provide sensible out-of-the-box settings that work for
 * most use cases. They prioritize developer experience in development mode
 * and performance in production mode.
 *
 * Production mode is automatically detected from NODE_ENV or build system flags.
 * In production mode:
 * - Source maps are disabled by default (unless explicitly enabled)
 * - Code minification is enabled
 * - Comments are removed
 *
 * @example
 * ```typescript
 * // Use defaults directly
 * const config = { ...DEFAULT_OPTIONS, generateReactHooks: true };
 * ```
 */
export const DEFAULT_OPTIONS: Required<PluginOptions> = {
  // File filtering
  include: ['**/*.proto'],
  exclude: ['node_modules/**'],

  // Proto resolution
  protoRoot: process.cwd(),
  importPaths: [],

  // Code generation
  generateReactHooks: false,
  generateSuspenseHooks: false,
  serverUrl: '',

  // Build optimization
  // Task 11.2: Enable source maps by default in development mode
  // Source maps are enabled in development for better debugging experience
  // and disabled in production for smaller bundle size (unless explicitly enabled)
  sourceMaps: !detectProductionMode(),
  optimization: {
    // Task 11.2: Detect development vs production mode from NODE_ENV or build flags
    // Development mode: No minification, preserve comments, faster builds
    // Production mode: Minification enabled, comments removed, optimized output
    production: detectProductionMode(),
    minify: detectProductionMode(),
    removeComments: detectProductionMode(),
    deadCodeElimination: false,
    treeshaking: false,
    codeSplitting: false,
    lazyLoading: false,
  },

  // Caching
  cacheDir: '.hallow-cache',
  maxCacheSize: 100, // MB
  enablePersistentCache: false,

  // Performance monitoring
  enablePerformanceMonitoring: false,
  performanceThreshold: 1000, // ms

  // Debugging
  verbose: false,
  debug: false,
};

// ============================================================================
// ConfigValidator Class
// ============================================================================

/**
 * Configuration validator with schema validation and helpful error messages.
 *
 * Provides comprehensive validation of plugin options using Zod schemas,
 * merges user configuration with defaults, detects common mistakes, and
 * suggests corrections for invalid options.
 *
 * @example
 * ```typescript
 * const validator = new ConfigValidator();
 *
 * // Validate user configuration
 * const result = validator.validate({ include: ['src/**‎/*.proto'] });
 * if (!result.valid) {
 *   console.error(result.errors);
 * }
 *
 * // Merge with defaults
 * const config = validator.mergeWithDefaults({ generateReactHooks: true });
 * ```
 */
export class ConfigValidator {
  private readonly schema: z.ZodType<Partial<PluginOptions>>;

  /**
   * Creates a new ConfigValidator instance.
   */
  constructor() {
    this.schema = PluginOptionsSchema;
  }

  /**
   * Validates plugin configuration against the schema.
   *
   * Performs comprehensive type checking and validation of all configuration
   * fields. Returns a ValidationResult with any errors and warnings found.
   *
   * @param options - User-provided configuration options (partial)
   * @returns Validation result with errors and warnings
   *
   * @example
   * ```typescript
   * const validator = new ConfigValidator();
   * const result = validator.validate({
   *   maxCacheSize: -10 // Invalid: must be positive
   * });
   *
   * if (!result.valid) {
   *   result.errors.forEach(error => {
   *     console.error(`${error.field}: ${error.message}`);
   *   });
   * }
   * ```
   */
  validate(options: Partial<PluginOptions>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate against Zod schema
    const result = this.schema.safeParse(options);

    if (!result.success) {
      // Convert Zod errors to ValidationError format
      result.error.errors.forEach((zodError) => {
        const field = zodError.path.join('.');
        let message = zodError.message;
        let suggestion: string | undefined;

        // Customize error messages and add suggestions
        if (zodError.code === 'invalid_type') {
          const expected = zodError.expected;
          const received = zodError.received;
          message = `Must be ${expected}, got ${received}`;
          suggestion = this.getSuggestionForType(field, expected);
        } else if (zodError.code === 'unrecognized_keys') {
          const unknownKeys = (zodError as any).keys;
          message = `Unknown option${unknownKeys.length > 1 ? 's' : ''}: ${unknownKeys.join(', ')}`;

          // Suggest corrections for each unknown key
          const validKeys = this.getValidKeys();
          unknownKeys.forEach((key: string) => {
            const fullPath = zodError.path.length > 0
              ? `${zodError.path.join('.')}.${key}`
              : key;
            const correctedKey = this.suggestCorrection(key, validKeys);
            errors.push({
              field: fullPath,
              message: `Unknown option '${key}'`,
              suggestion: correctedKey
                ? `Did you mean '${correctedKey}'?`
                : 'Check documentation for valid options',
            });
          });
          return; // Skip adding the generic error
        } else if (zodError.code === 'too_small') {
          message = 'Must be a positive number';
          suggestion = `Try: ${field}: 100`;
        } else if (zodError.code === 'invalid_string' && (zodError as any).validation === 'url') {
          message = 'Must be a valid URL';
          suggestion = `Try: ${field}: 'https://example.com'`;
        }

        errors.push({ field, message, suggestion });
      });
    }

    // Detect configuration conflicts
    const conflictWarnings = this.detectConflicts(
      this.mergeWithDefaults(options)
    );
    warnings.push(...conflictWarnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Merges user configuration with default values.
   *
   * Creates a complete configuration object by filling in any missing
   * values with sensible defaults. Performs deep merging for nested
   * objects like optimization options.
   *
   * @param options - User-provided configuration options (partial)
   * @returns Complete configuration with all fields populated
   *
   * @example
   * ```typescript
   * const validator = new ConfigValidator();
   * const config = validator.mergeWithDefaults({
   *   generateReactHooks: true
   * });
   * // config.include will be ['**‎/*.proto'] from defaults
   * // config.generateReactHooks will be true from user input
   * ```
   */
  mergeWithDefaults(options: Partial<PluginOptions>): PluginOptions {
    const merged: PluginOptions = {
      ...DEFAULT_OPTIONS,
      ...options,
    };

    // Deep merge optimization options
    if (options.optimization) {
      merged.optimization = {
        ...DEFAULT_OPTIONS.optimization,
        ...options.optimization,
      };
    }

    return merged;
  }

  /**
   * Suggests a correction for an invalid configuration key.
   *
   * Uses Levenshtein distance algorithm to find the closest valid key
   * name to suggest as a correction. Helps developers quickly fix typos
   * in configuration.
   *
   * @param invalidKey - The invalid key name
   * @param validKeys - List of valid key names
   * @returns Suggested correction, or empty string if no close match
   *
   * @example
   * ```typescript
   * const validator = new ConfigValidator();
   * const suggestion = validator.suggestCorrection(
   *   'maxCachSize', // typo
   *   ['maxCacheSize', 'cacheDir', 'enablePersistentCache']
   * );
   * // Returns: 'maxCacheSize'
   * ```
   */
  suggestCorrection(invalidKey: string, validKeys: string[]): string {
    let closestKey = '';
    let minDistance = Infinity;

    for (const validKey of validKeys) {
      const distance = this.levenshteinDistance(
        invalidKey.toLowerCase(),
        validKey.toLowerCase()
      );

      // Only suggest if distance is small enough (within 3 edits)
      if (distance < minDistance && distance <= 3) {
        minDistance = distance;
        closestKey = validKey;
      }
    }

    return closestKey;
  }

  /**
   * Detects conflicting or potentially problematic configuration combinations.
   *
   * Identifies common configuration mistakes such as:
   * - Enabling both minification and source maps in production
   * - Setting very low cache sizes
   * - Enabling React hooks without React dependency
   *
   * @param options - Complete plugin configuration
   * @returns List of configuration warnings
   *
   * @example
   * ```typescript
   * const validator = new ConfigValidator();
   * const warnings = validator.detectConflicts({
   *   ...DEFAULT_OPTIONS,
   *   sourceMaps: true,
   *   optimization: { production: true, minify: true }
   * });
   * // Returns warning about sourceMaps + minify in production
   * ```
   */
  detectConflicts(options: PluginOptions): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];

    // Check for source maps + minify in production
    if (
      options.sourceMaps &&
      options.optimization?.production &&
      options.optimization?.minify
    ) {
      warnings.push({
        field: 'sourceMaps',
        message: 'Source maps are enabled in production with minification',
        suggestion:
          'Consider disabling source maps in production to reduce bundle size',
      });
    }

    // Check for very low cache size
    if (options.maxCacheSize && options.maxCacheSize < 10) {
      warnings.push({
        field: 'maxCacheSize',
        message: `Cache size is very low (${options.maxCacheSize}MB)`,
        suggestion: 'Consider increasing to at least 50MB for better performance',
      });
    }

    // Check for performance monitoring with very low threshold
    if (
      options.enablePerformanceMonitoring &&
      options.performanceThreshold &&
      options.performanceThreshold < 100
    ) {
      warnings.push({
        field: 'performanceThreshold',
        message: `Performance threshold is very low (${options.performanceThreshold}ms)`,
        suggestion:
          'This may generate excessive warnings. Consider increasing to at least 500ms',
      });
    }

    // Check for Suspense hooks without React hooks
    if (options.generateSuspenseHooks && !options.generateReactHooks) {
      warnings.push({
        field: 'generateSuspenseHooks',
        message: 'Suspense hooks require React hooks to be enabled',
        suggestion: 'Set generateReactHooks: true',
      });
    }

    // Check for empty include patterns
    if (options.include && options.include.length === 0) {
      warnings.push({
        field: 'include',
        message: 'No include patterns specified - no proto files will be processed',
        suggestion: "Add at least one pattern like '**/*.proto'",
      });
    }

    // Check for persistent cache without cache dir
    if (options.enablePersistentCache && !options.cacheDir) {
      warnings.push({
        field: 'enablePersistentCache',
        message: 'Persistent cache is enabled but no cache directory specified',
        suggestion: 'This should not happen with defaults, but cacheDir will be set to .hallow-cache',
      });
    }

    return warnings;
  }

  /**
   * Gets list of all valid configuration keys.
   *
   * Returns a flat list of all valid top-level configuration option names.
   *
   * @returns Array of valid configuration keys
   * @internal
   */
  private getValidKeys(): string[] {
    return [
      'include',
      'exclude',
      'protoRoot',
      'importPaths',
      'generateReactHooks',
      'generateSuspenseHooks',
      'serverUrl',
      'sourceMaps',
      'optimization',
      'cacheDir',
      'maxCacheSize',
      'enablePersistentCache',
      'enablePerformanceMonitoring',
      'performanceThreshold',
      'verbose',
      'debug',
    ];
  }

  /**
   * Generates a type-specific suggestion for validation errors.
   *
   * Provides helpful examples based on the expected type.
   *
   * @param field - Field name
   * @param expectedType - Expected type name
   * @returns Suggestion string
   * @internal
   */
  private getSuggestionForType(field: string, expectedType: string): string {
    switch (expectedType) {
      case 'boolean':
        return `Try: ${field}: true or ${field}: false`;
      case 'number':
        return `Try: ${field}: 100`;
      case 'string':
        return `Try: ${field}: 'value'`;
      case 'array':
        return `Try: ${field}: ['item1', 'item2']`;
      case 'object':
        return `Try: ${field}: { key: value }`;
      default:
        return `Expected ${expectedType}`;
    }
  }

  /**
   * Calculates Levenshtein distance between two strings.
   *
   * Measures the minimum number of single-character edits (insertions,
   * deletions, or substitutions) required to change one string into another.
   * Used for suggesting corrections for typos.
   *
   * @param str1 - First string
   * @param str2 - Second string
   * @returns Edit distance between strings
   * @internal
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;

    // Create a 2D array for dynamic programming
    const dp: number[][] = Array(len1 + 1)
      .fill(null)
      .map(() => Array(len2 + 1).fill(0));

    // Initialize base cases
    for (let i = 0; i <= len1; i++) {
      dp[i][0] = i;
    }
    for (let j = 0; j <= len2; j++) {
      dp[0][j] = j;
    }

    // Fill the DP table
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        if (str1[i - 1] === str2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = Math.min(
            dp[i - 1][j] + 1, // deletion
            dp[i][j - 1] + 1, // insertion
            dp[i - 1][j - 1] + 1 // substitution
          );
        }
      }
    }

    return dp[len1][len2];
  }
}
