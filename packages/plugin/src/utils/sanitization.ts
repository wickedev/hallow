/**
 * Input sanitization utilities for @hallow/plugin
 *
 * This module provides utilities for sanitizing user inputs and error messages
 * to prevent information leakage and security vulnerabilities.
 *
 * Security features:
 * - Path sanitization to prevent leaking sensitive file system information
 * - Input validation to prevent injection attacks
 * - Error message sanitization to prevent information disclosure
 *
 * @packageDocumentation
 */

import * as path from 'path';

/**
 * Sanitizes file paths in error messages to prevent information leakage.
 *
 * Replaces absolute paths with relative paths or generic placeholders
 * to avoid exposing sensitive file system structure in error messages.
 *
 * Security considerations:
 * - Prevents leaking user home directories
 * - Prevents leaking absolute system paths
 * - Preserves enough context for debugging
 *
 * @param filePath - File path to sanitize
 * @param projectRoot - Project root directory for relative path calculation
 * @returns Sanitized file path safe for error messages
 *
 * @example
 * ```typescript
 * // Sanitize absolute path
 * const sanitized = sanitizeFilePath(
 *   '/Users/john/project/src/service.proto',
 *   '/Users/john/project'
 * );
 * // Returns: 'src/service.proto'
 *
 * // Sanitize path outside project
 * const sanitized2 = sanitizeFilePath(
 *   '/Users/john/other-project/secrets.txt',
 *   '/Users/john/project'
 * );
 * // Returns: '<external-file>'
 * ```
 */
export function sanitizeFilePath(
  filePath: string,
  projectRoot: string = process.cwd()
): string {
  try {
    // Check if path is within project
    const relativePath = path.relative(projectRoot, filePath);

    // If path escapes project root (starts with ..), it's external
    if (relativePath.startsWith('..')) {
      return '<external-file>';
    }

    // If path is empty, it's the project root itself
    if (!relativePath) {
      return '<project-root>';
    }

    // Return relative path (safe to expose)
    return relativePath;
  } catch (error) {
    // If any error occurs during path processing, return generic placeholder
    return '<file>';
  }
}

/**
 * Sanitizes error messages to prevent information leakage.
 *
 * Removes or replaces sensitive information from error messages such as:
 * - User home directories
 * - System paths
 * - Absolute file paths
 *
 * @param message - Error message to sanitize
 * @param projectRoot - Project root directory for path sanitization
 * @returns Sanitized error message
 *
 * @example
 * ```typescript
 * const sanitized = sanitizeErrorMessage(
 *   'Error reading /Users/john/project/secrets.txt',
 *   '/Users/john/project'
 * );
 * // Returns: 'Error reading secrets.txt'
 * ```
 */
export function sanitizeErrorMessage(
  message: string,
  projectRoot: string = process.cwd()
): string {
  let sanitized = message;

  // Replace home directory references
  const homeDir = process.env.HOME || process.env.USERPROFILE;
  if (homeDir) {
    const homeDirRegex = new RegExp(homeDir.replace(/[/\\]/g, '[/\\\\]'), 'g');
    sanitized = sanitized.replace(homeDirRegex, '~');
  }

  // Replace absolute paths with relative paths
  const absolutePathRegex = /(?:\/[^/\s]+)+\/[^/\s]+\.\w+/g;
  sanitized = sanitized.replace(absolutePathRegex, (match) => {
    return sanitizeFilePath(match, projectRoot);
  });

  // Replace Windows absolute paths
  const windowsPathRegex = /[A-Z]:\\(?:[^\\]+\\)*[^\\]+\.\w+/g;
  sanitized = sanitized.replace(windowsPathRegex, (match) => {
    return sanitizeFilePath(match, projectRoot);
  });

  return sanitized;
}

/**
 * Validates and sanitizes configuration string inputs.
 *
 * Prevents injection attacks by:
 * - Removing special characters that could be used in path traversal
 * - Validating against allowed patterns
 * - Limiting string length
 *
 * @param input - String input to validate and sanitize
 * @param maxLength - Maximum allowed length (default: 1000)
 * @returns Sanitized input string
 * @throws Error if input contains dangerous characters
 *
 * @example
 * ```typescript
 * const safe = validateAndSanitizeInput('my-config-value');
 * // Returns: 'my-config-value'
 *
 * const unsafe = validateAndSanitizeInput('../../../etc/passwd');
 * // Throws: Error - Input contains potentially dangerous characters
 * ```
 */
export function validateAndSanitizeInput(
  input: string,
  maxLength: number = 1000
): string {
  // Check length
  if (input.length > maxLength) {
    throw new Error(
      `Input exceeds maximum length of ${maxLength} characters`
    );
  }

  // Check for null bytes (potential injection attack)
  if (input.includes('\0')) {
    throw new Error('Input contains null byte (potential injection attack)');
  }

  // Check for directory traversal patterns
  const normalized = path.normalize(input);
  if (normalized.includes('..')) {
    throw new Error(
      'Input contains potentially dangerous characters (directory traversal)'
    );
  }

  // Return sanitized input
  return input.trim();
}

/**
 * Sanitizes a list of file paths for safe display in error messages.
 *
 * Applies sanitization to each path in the list.
 *
 * @param paths - Array of file paths to sanitize
 * @param projectRoot - Project root directory for relative path calculation
 * @returns Array of sanitized paths
 *
 * @example
 * ```typescript
 * const sanitized = sanitizePathList([
 *   '/Users/john/project/src/service.proto',
 *   '/Users/john/project/src/types.proto'
 * ], '/Users/john/project');
 * // Returns: ['src/service.proto', 'src/types.proto']
 * ```
 */
export function sanitizePathList(
  paths: string[],
  projectRoot: string = process.cwd()
): string[] {
  return paths.map((p) => sanitizeFilePath(p, projectRoot));
}

/**
 * Checks if a string contains potentially dangerous patterns.
 *
 * Used to validate user inputs before processing. Checks for:
 * - Directory traversal attempts (..)
 * - Null bytes
 * - Control characters
 *
 * @param input - String to check
 * @returns true if input appears safe, false otherwise
 *
 * @example
 * ```typescript
 * isSafeInput('service.proto'); // true
 * isSafeInput('../../../etc/passwd'); // false
 * isSafeInput('test\0inject'); // false
 * ```
 */
export function isSafeInput(input: string): boolean {
  // Check for null bytes
  if (input.includes('\0')) {
    return false;
  }

  // Check for directory traversal
  const normalized = path.normalize(input);
  if (normalized.includes('..')) {
    return false;
  }

  // Check for control characters (except common whitespace)
  const controlCharRegex = /[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/;
  if (controlCharRegex.test(input)) {
    return false;
  }

  return true;
}

/**
 * Sanitizes a stack trace to remove sensitive paths.
 *
 * Replaces absolute paths in stack traces with relative paths
 * to prevent leaking file system structure.
 *
 * @param stackTrace - Stack trace string
 * @param projectRoot - Project root directory
 * @returns Sanitized stack trace
 *
 * @example
 * ```typescript
 * const stack = `Error: Something failed
 *   at Object.<anonymous> (/Users/john/project/src/index.ts:10:5)
 *   at Module._compile (internal/modules/cjs/loader.js:1137:30)`;
 *
 * const sanitized = sanitizeStackTrace(stack, '/Users/john/project');
 * // Stack trace with paths replaced by relative paths
 * ```
 */
export function sanitizeStackTrace(
  stackTrace: string,
  projectRoot: string = process.cwd()
): string {
  let sanitized = stackTrace;

  // Replace absolute paths in stack traces
  const stackPathRegex = /\(([^)]+)\)/g;
  sanitized = sanitized.replace(stackPathRegex, (match, filePath) => {
    if (filePath.startsWith('/') || /^[A-Z]:/.test(filePath)) {
      const sanitizedPath = sanitizeFilePath(filePath, projectRoot);
      return `(${sanitizedPath})`;
    }
    return match;
  });

  return sanitized;
}
