/**
 * Error collection utility for multi-file error handling (Task 17.4).
 *
 * This module provides a utility for collecting errors from multiple files
 * during batch processing, allowing the plugin to report all errors together
 * instead of failing on the first error encountered.
 *
 * Requirements: 8.5, 8.11
 *
 * @packageDocumentation
 */

/**
 * Represents a collected error with file context.
 */
export interface CollectedError {
  /**
   * Type of error that occurred.
   */
  type: 'parse' | 'generate' | 'resolve' | 'circular' | 'validation' | 'other';

  /**
   * Path to the file where the error occurred.
   */
  file: string;

  /**
   * Error message.
   */
  message: string;

  /**
   * Original error object.
   */
  error: Error;

  /**
   * Optional additional details about the error.
   */
  details?: {
    line?: number;
    column?: number;
    searchPaths?: string[];
    cycle?: string[];
    [key: string]: any;
  };
}

/**
 * Error collector for multi-file processing.
 *
 * Collects errors from multiple files during batch operations,
 * allowing all errors to be reported together instead of failing
 * on the first error encountered.
 *
 * This is particularly useful for:
 * - Processing multiple proto files in a single build
 * - Validating entire proto schemas
 * - Reporting comprehensive error lists to developers
 *
 * @example
 * ```typescript
 * const collector = new ErrorCollector();
 *
 * // Process multiple files
 * for (const file of protoFiles) {
 *   try {
 *     await processFile(file);
 *   } catch (error) {
 *     collector.addParseError(file, error as Error);
 *   }
 * }
 *
 * // Throw combined error if any errors occurred
 * collector.throwIfErrors();
 * ```
 */
export class ErrorCollector {
  private errors: CollectedError[] = [];

  /**
   * Add a parse error to the collection.
   *
   * @param file - Path to the file with parse error
   * @param error - Parse error object
   * @param line - Optional line number
   * @param column - Optional column number
   */
  addParseError(file: string, error: Error, line?: number, column?: number): void {
    this.errors.push({
      type: 'parse',
      file,
      message: error.message,
      error,
      details: line !== undefined && column !== undefined ? { line, column } : undefined,
    });
  }

  /**
   * Add a generation error to the collection.
   *
   * @param file - Path to the file with generation error
   * @param error - Generation error object
   */
  addGenerateError(file: string, error: Error): void {
    this.errors.push({
      type: 'generate',
      file,
      message: error.message,
      error,
    });
  }

  /**
   * Add a resolution error to the collection.
   *
   * @param file - Path to the file with resolution error
   * @param error - Resolution error object
   * @param searchPaths - Optional list of searched paths
   */
  addResolveError(file: string, error: Error, searchPaths?: string[]): void {
    this.errors.push({
      type: 'resolve',
      file,
      message: error.message,
      error,
      details: searchPaths ? { searchPaths } : undefined,
    });
  }

  /**
   * Add a circular dependency error to the collection.
   *
   * @param file - Path to one of the files in the cycle
   * @param error - Circular dependency error object
   * @param cycle - Array of file paths forming the cycle
   */
  addCircularError(file: string, error: Error, cycle?: string[]): void {
    this.errors.push({
      type: 'circular',
      file,
      message: error.message,
      error,
      details: cycle ? { cycle } : undefined,
    });
  }

  /**
   * Add a validation error to the collection.
   *
   * @param file - Path to the file with validation error
   * @param error - Validation error object
   */
  addValidationError(file: string, error: Error): void {
    this.errors.push({
      type: 'validation',
      file,
      message: error.message,
      error,
    });
  }

  /**
   * Add a generic error to the collection.
   *
   * @param file - Path to the file with error
   * @param error - Error object
   * @param details - Optional additional details
   */
  addError(file: string, error: Error, details?: CollectedError['details']): void {
    this.errors.push({
      type: 'other',
      file,
      message: error.message,
      error,
      details,
    });
  }

  /**
   * Check if any errors have been collected.
   *
   * @returns true if there are errors, false otherwise
   */
  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  /**
   * Get the count of collected errors.
   *
   * @returns Number of errors
   */
  getErrorCount(): number {
    return this.errors.length;
  }

  /**
   * Get all collected errors.
   *
   * @returns Array of collected errors
   */
  getErrors(): CollectedError[] {
    return [...this.errors];
  }

  /**
   * Get errors grouped by type.
   *
   * @returns Map of error type to array of errors
   */
  getErrorsByType(): Map<CollectedError['type'], CollectedError[]> {
    const grouped = new Map<CollectedError['type'], CollectedError[]>();

    for (const error of this.errors) {
      if (!grouped.has(error.type)) {
        grouped.set(error.type, []);
      }
      grouped.get(error.type)!.push(error);
    }

    return grouped;
  }

  /**
   * Get errors for a specific file.
   *
   * @param file - File path
   * @returns Array of errors for the file
   */
  getErrorsForFile(file: string): CollectedError[] {
    return this.errors.filter((e) => e.file === file);
  }

  /**
   * Get a summary of errors by type.
   *
   * @returns Object with counts for each error type
   */
  getSummary(): Record<string, number> {
    const summary: Record<string, number> = {
      parse: 0,
      generate: 0,
      resolve: 0,
      circular: 0,
      validation: 0,
      other: 0,
      total: this.errors.length,
    };

    for (const error of this.errors) {
      summary[error.type]++;
    }

    return summary;
  }

  /**
   * Clear all collected errors.
   */
  clear(): void {
    this.errors = [];
  }

  /**
   * Format all errors into a single error message.
   *
   * Creates a comprehensive error report with all collected errors,
   * grouped by type and formatted for readability.
   *
   * @returns Formatted error message string
   */
  formatErrors(): string {
    if (!this.hasErrors()) {
      return '';
    }

    const parts: string[] = [
      `[Hallow Plugin] Multiple errors occurred (${this.errors.length} total):`,
      '',
    ];

    // Group errors by type
    const byType = this.getErrorsByType();

    // Format each type group
    const typeOrder: CollectedError['type'][] = ['parse', 'resolve', 'circular', 'generate', 'validation', 'other'];

    for (const type of typeOrder) {
      const errorsOfType = byType.get(type);
      if (!errorsOfType || errorsOfType.length === 0) continue;

      parts.push(`${this.capitalize(type)} Errors (${errorsOfType.length}):`);
      parts.push('='.repeat(80));

      for (let i = 0; i < errorsOfType.length; i++) {
        const err = errorsOfType[i];
        parts.push(`  ${i + 1}. File: ${err.file}`);
        parts.push(`     ${err.message}`);

        // Add type-specific details
        if (err.details) {
          if (err.details.line !== undefined && err.details.column !== undefined) {
            parts.push(`     Location: Line ${err.details.line}, Column ${err.details.column}`);
          }
          if (err.details.searchPaths) {
            parts.push(`     Searched: ${err.details.searchPaths.join(', ')}`);
          }
          if (err.details.cycle) {
            parts.push(`     Cycle: ${err.details.cycle.join(' → ')}`);
          }
        }

        parts.push('');
      }
    }

    // Add summary
    parts.push('Error Summary:');
    parts.push('-'.repeat(80));
    const summary = this.getSummary();
    for (const [type, count] of Object.entries(summary)) {
      if (count > 0 && type !== 'total') {
        parts.push(`  - ${this.capitalize(type)}: ${count}`);
      }
    }
    parts.push(`  - Total: ${summary.total}`);

    return parts.join('\n');
  }

  /**
   * Throw a combined error if any errors have been collected.
   *
   * If errors exist, formats them all into a single comprehensive error
   * message and throws it. Otherwise, does nothing.
   *
   * This is useful for batch processing where you want to collect all
   * errors and report them at the end instead of failing on the first error.
   *
   * @throws {Error} Combined error with all collected errors
   *
   * @example
   * ```typescript
   * const collector = new ErrorCollector();
   *
   * // Process files...
   * for (const file of files) {
   *   try {
   *     processFile(file);
   *   } catch (error) {
   *     collector.addError(file, error);
   *   }
   * }
   *
   * // Throw if any errors occurred
   * collector.throwIfErrors();
   * ```
   */
  throwIfErrors(): void {
    if (this.hasErrors()) {
      const formattedMessage = this.formatErrors();
      const error = new Error(formattedMessage);
      throw error;
    }
  }

  /**
   * Helper to capitalize first letter of a string.
   *
   * @param str - String to capitalize
   * @returns Capitalized string
   * @internal
   */
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}
