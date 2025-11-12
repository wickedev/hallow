/**
 * Error formatting utilities for @hallow/plugin
 *
 * This module provides comprehensive error formatting with:
 * - File location and line/column information
 * - Code snippets showing error context
 * - ANSI color support for terminal output
 * - Helpful suggestions for common mistakes
 *
 * All error messages follow the format:
 * [Hallow Plugin] {Error Type}
 * File: {path}
 * {Details}
 * {Code Snippet (if applicable)}
 * {Suggestion (if available)}
 *
 * @packageDocumentation
 */

import chalk from 'chalk';
import type { FormattedError } from '../types';

/**
 * Error formatter providing enhanced error messages with context.
 *
 * All methods are static and can be called without instantiation.
 * Error messages include ANSI colors when terminal supports them.
 *
 * @example
 * ```typescript
 * const error = ErrorFormatter.formatParseError(
 *   '/project/service.proto',
 *   15,
 *   8,
 *   'Expected semicolon',
 *   protoFileContent
 * );
 * throw new Error(error);
 * ```
 */
export class ErrorFormatter {
  /**
   * Format a proto file parse error with location and code snippet.
   *
   * Creates a detailed error message showing:
   * - File path
   * - Line and column numbers
   * - Code snippet with context lines
   * - Error pointer indicating exact location
   *
   * @param filePath - Absolute path to the proto file
   * @param line - Line number where error occurred (1-based)
   * @param column - Column number where error occurred (1-based)
   * @param message - Error message from parser
   * @param sourceCode - Optional full source code for snippet extraction
   * @returns Formatted error message string
   *
   * @example
   * ```typescript
   * const error = ErrorFormatter.formatParseError(
   *   '/project/protos/service.proto',
   *   15,
   *   8,
   *   'Expected semicolon but found "string"',
   *   fileContent
   * );
   * // Returns:
   * // [Hallow Plugin] Proto syntax error
   * // File: /project/protos/service.proto
   * // Line 15, Column 8: Expected semicolon but found "string"
   * //
   * //   13 | message GreetRequest {
   * //   14 |   string name = 1
   * // > 15 |   string metadata = 2;
   * //      |        ^
   * //   16 | }
   * ```
   */
  static formatParseError(
    filePath: string,
    line: number,
    column: number,
    message: string,
    sourceCode?: string
  ): string {
    const parts: string[] = [
      this.colorize('[Hallow Plugin] Proto syntax error', 'red'),
      `File: ${chalk.cyan(filePath)}`,
      `Line ${chalk.yellow(line)}, Column ${chalk.yellow(column)}: ${message}`,
    ];

    // Add code snippet if source code is provided
    if (sourceCode) {
      const snippet = this.extractCodeSnippet(sourceCode, line, 2, column);
      if (snippet) {
        parts.push('');
        parts.push(snippet);
      }
    }

    return parts.join('\n');
  }

  /**
   * Format a code generation error with stack trace.
   *
   * Wraps generator errors with file context and preserves original stack trace.
   *
   * @param filePath - Path to proto file being generated
   * @param error - Original error from generator
   * @returns Formatted error message string
   *
   * @example
   * ```typescript
   * try {
   *   generator.generate(ast, options);
   * } catch (error) {
   *   throw new Error(
   *     ErrorFormatter.formatGenerateError('/project/service.proto', error)
   *   );
   * }
   * ```
   */
  static formatGenerateError(filePath: string, error: Error): string {
    const parts: string[] = [
      this.colorize('[Hallow Plugin] Code generation failed', 'red'),
      `File: ${chalk.cyan(filePath)}`,
      `Reason: ${error.message}`,
    ];

    // Include stack trace if available
    if (error.stack) {
      parts.push('');
      parts.push('Stack trace:');
      parts.push(chalk.gray(error.stack));
    }

    return parts.join('\n');
  }

  /**
   * Format an import resolution error with searched paths.
   *
   * Shows all directories searched when attempting to resolve an import,
   * helping developers understand why resolution failed.
   *
   * @param importPath - Import path that could not be resolved
   * @param fromFile - File containing the import statement
   * @param searchPaths - List of directories searched
   * @returns Formatted error message string
   *
   * @example
   * ```typescript
   * const error = ErrorFormatter.formatResolveError(
   *   'common/types.proto',
   *   '/project/service.proto',
   *   ['/project', '/project/protos', '/project/node_modules']
   * );
   * ```
   */
  static formatResolveError(
    importPath: string,
    fromFile: string,
    searchPaths: string[]
  ): string {
    const parts: string[] = [
      this.colorize('[Hallow Plugin] Import resolution failed', 'red'),
      `File: ${chalk.cyan(fromFile)}`,
      `Cannot resolve import: ${chalk.yellow(importPath)}`,
      '',
      'Searched in:',
      ...searchPaths.map(path => `  - ${chalk.gray(path)}`),
    ];

    // Add helpful suggestion
    parts.push('');
    parts.push(
      chalk.blue(
        'Suggestion: Check if the file exists and the path is correct. ' +
        'You may need to configure protoRoot or importPaths in plugin options.'
      )
    );

    return parts.join('\n');
  }

  /**
   * Format a circular dependency error with complete cycle path.
   *
   * Shows the full cycle of imports that creates the circular dependency,
   * making it easy to identify and fix the issue.
   *
   * @param cycle - Array of file paths forming the cycle (last element equals first)
   * @returns Formatted error message string
   *
   * @example
   * ```typescript
   * const error = ErrorFormatter.formatCircularDependency([
   *   'a.proto',
   *   'b.proto',
   *   'c.proto',
   *   'a.proto'
   * ]);
   * // Returns:
   * // [Hallow Plugin] Circular import detected
   * //
   * // a.proto → b.proto → c.proto → a.proto
   * //
   * // This creates a dependency cycle that cannot be resolved.
   * ```
   */
  static formatCircularDependency(cycle: string[]): string {
    const cycleDisplay = cycle
      .map(path => chalk.cyan(path))
      .join(chalk.yellow(' → '));

    const parts: string[] = [
      this.colorize('[Hallow Plugin] Circular import detected', 'red'),
      '',
      cycleDisplay,
      '',
      'This creates a dependency cycle that cannot be resolved.',
      '',
      chalk.blue(
        'Suggestion: Remove one of the imports or refactor shared types into a separate file.'
      ),
    ];

    return parts.join('\n');
  }

  /**
   * Format a configuration validation error.
   *
   * Provides clear information about configuration type mismatches
   * or invalid values.
   *
   * @param field - Configuration field name
   * @param expected - Expected type or value
   * @param actual - Actual type or value received
   * @returns Formatted error message string
   *
   * @example
   * ```typescript
   * const error = ErrorFormatter.formatConfigError(
   *   'maxCacheSize',
   *   'number',
   *   'string'
   * );
   * ```
   */
  static formatConfigError(
    field: string,
    expected: string,
    actual: string
  ): string {
    const parts: string[] = [
      this.colorize('[Hallow Plugin] Configuration error', 'red'),
      `Field: ${chalk.cyan(field)}`,
      `Expected: ${chalk.green(expected)}`,
      `Received: ${chalk.red(actual)}`,
    ];

    return parts.join('\n');
  }

  /**
   * Extract code snippet showing context around an error line.
   *
   * Extracts lines before and after the error location, adds line numbers,
   * and highlights the error line with a pointer at the specified column.
   *
   * @param source - Full source code
   * @param line - Error line number (1-based)
   * @param contextLines - Number of context lines before and after (default: 2)
   * @param column - Optional column number (1-based) for error pointer position
   * @returns Formatted code snippet string or null if invalid
   *
   * @example
   * ```typescript
   * const snippet = ErrorFormatter.extractCodeSnippet(
   *   fileContent,
   *   15,
   *   2,
   *   8
   * );
   * // Returns:
   * //   13 | message GreetRequest {
   * //   14 |   string name = 1
   * // > 15 |   string metadata = 2;
   * //      |        ^
   * //   16 | }
   * ```
   */
  static extractCodeSnippet(
    source: string,
    line: number,
    contextLines: number = 2,
    column?: number
  ): string | null {
    const lines = source.split('\n');

    // Validate line number
    if (line < 1 || line > lines.length) {
      return null;
    }

    // Calculate range (1-based to 0-based conversion)
    const startLine = Math.max(0, line - contextLines - 1);
    const endLine = Math.min(lines.length - 1, line + contextLines - 1);
    const errorLineIndex = line - 1;

    // Calculate padding for line numbers
    const maxLineNum = endLine + 1;
    const padding = String(maxLineNum).length;

    const snippetLines: string[] = [];

    for (let i = startLine; i <= endLine; i++) {
      const lineNum = i + 1;
      const lineContent = lines[i];
      const isErrorLine = i === errorLineIndex;

      // Format line number with padding
      const lineNumStr = String(lineNum).padStart(padding, ' ');

      if (isErrorLine) {
        // Error line with > prefix
        snippetLines.push(
          chalk.red(`> ${lineNumStr} |`) + ' ' + lineContent
        );

        // Add pointer line showing error location
        const pointerPadding = ' '.repeat(padding + 3);

        // Position the caret at the specified column
        // If column is provided, position it at that column (1-based)
        // Otherwise, place it at the beginning
        const columnOffset = column && column > 0 ? column - 1 : 0;
        const caretPosition = pointerPadding + '|' + ' '.repeat(columnOffset) + '^';

        snippetLines.push(chalk.red(caretPosition));
      } else {
        // Context line
        snippetLines.push(
          chalk.gray(`  ${lineNumStr} |`) + ' ' + chalk.gray(lineContent)
        );
      }
    }

    return snippetLines.join('\n');
  }

  /**
   * Add ANSI color to text.
   *
   * Automatically detects if terminal supports colors and falls back
   * to plain text if not supported.
   *
   * @param text - Text to colorize
   * @param color - Color to apply
   * @returns Colored text string
   *
   * @example
   * ```typescript
   * const redText = ErrorFormatter.colorize('Error', 'red');
   * const yellowText = ErrorFormatter.colorize('Warning', 'yellow');
   * ```
   */
  static colorize(
    text: string,
    color: 'red' | 'yellow' | 'green' | 'blue'
  ): string {
    switch (color) {
      case 'red':
        return chalk.red(text);
      case 'yellow':
        return chalk.yellow(text);
      case 'green':
        return chalk.green(text);
      case 'blue':
        return chalk.blue(text);
      default:
        return text;
    }
  }

  /**
   * Create a FormattedError object from parse error details.
   *
   * Utility method to create a structured error object that can be
   * stored or processed programmatically.
   *
   * @param filePath - Path to file with error
   * @param line - Line number
   * @param column - Column number
   * @param message - Error message
   * @param snippet - Optional code snippet
   * @param suggestion - Optional suggestion
   * @returns FormattedError object
   */
  static createFormattedError(
    type: FormattedError['type'],
    message: string,
    options: {
      filePath?: string;
      line?: number;
      column?: number;
      snippet?: string;
      suggestion?: string;
      searchPaths?: string[];
    } = {}
  ): FormattedError {
    return {
      type,
      message,
      ...options,
    };
  }
}
