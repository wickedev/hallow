/**
 * Validation types and error definitions for proto file validation
 * @module validation/types
 */

/**
 * Source location information for error reporting
 */
export interface SourceLocation {
  /**
   * File path
   */
  file: string;

  /**
   * Line number (1-indexed)
   */
  line: number;

  /**
   * Column number (1-indexed)
   */
  column: number;

  /**
   * Surrounding code context for better error messages
   */
  context?: string;
}

/**
 * Validation error codes
 */
export enum ValidationErrorCode {
  // Package validation
  INVALID_PACKAGE_NAME = 'INVALID_PACKAGE_NAME',
  MISSING_PACKAGE_NAME = 'MISSING_PACKAGE_NAME',

  // Service validation
  DUPLICATE_SERVICE_NAME = 'DUPLICATE_SERVICE_NAME',
  INVALID_SERVICE_NAME = 'INVALID_SERVICE_NAME',
  EMPTY_SERVICE = 'EMPTY_SERVICE',

  // Method validation
  DUPLICATE_METHOD_NAME = 'DUPLICATE_METHOD_NAME',
  INVALID_METHOD_NAME = 'INVALID_METHOD_NAME',
  INVALID_METHOD_INPUT_TYPE = 'INVALID_METHOD_INPUT_TYPE',
  INVALID_METHOD_OUTPUT_TYPE = 'INVALID_METHOD_OUTPUT_TYPE',

  // Message validation
  DUPLICATE_MESSAGE_NAME = 'DUPLICATE_MESSAGE_NAME',
  INVALID_MESSAGE_NAME = 'INVALID_MESSAGE_NAME',
  DUPLICATE_FIELD_NUMBER = 'DUPLICATE_FIELD_NUMBER',
  RESERVED_FIELD_NUMBER = 'RESERVED_FIELD_NUMBER',
  RESERVED_FIELD_NAME = 'RESERVED_FIELD_NAME',
  INVALID_FIELD_TYPE = 'INVALID_FIELD_TYPE',
  INVALID_FIELD_NUMBER = 'INVALID_FIELD_NUMBER',

  // Enum validation
  DUPLICATE_ENUM_NAME = 'DUPLICATE_ENUM_NAME',
  INVALID_ENUM_NAME = 'INVALID_ENUM_NAME',
  DUPLICATE_ENUM_VALUE = 'DUPLICATE_ENUM_VALUE',
  DUPLICATE_ENUM_NUMBER = 'DUPLICATE_ENUM_NUMBER',
  INVALID_ENUM_VALUE_NUMBER = 'INVALID_ENUM_VALUE_NUMBER',
  EMPTY_ENUM = 'EMPTY_ENUM',

  // Type reference validation
  UNRESOLVED_TYPE_REFERENCE = 'UNRESOLVED_TYPE_REFERENCE',
  CIRCULAR_MESSAGE_DEPENDENCY = 'CIRCULAR_MESSAGE_DEPENDENCY',

  // Import validation
  CIRCULAR_IMPORT_DEPENDENCY = 'CIRCULAR_IMPORT_DEPENDENCY',
  INVALID_IMPORT_PATH = 'INVALID_IMPORT_PATH',
  MISSING_IMPORT = 'MISSING_IMPORT',
}

/**
 * Validation error
 */
export interface ValidationError {
  /**
   * Error code
   */
  code: ValidationErrorCode;

  /**
   * Human-readable error message
   */
  message: string;

  /**
   * Location where the error occurred
   */
  location: SourceLocation;

  /**
   * Optional suggestion for fixing the error
   */
  suggestion?: string;

  /**
   * Additional details about the error
   */
  details?: Record<string, any>;
}

/**
 * Validation warning (non-blocking issues)
 */
export interface ValidationWarning {
  /**
   * Warning code (uses same enum as errors)
   */
  code: ValidationErrorCode;

  /**
   * Human-readable warning message
   */
  message: string;

  /**
   * Location where the warning occurred
   */
  location: SourceLocation;

  /**
   * Optional suggestion for addressing the warning
   */
  suggestion?: string;
}

/**
 * Result of proto file validation
 */
export interface ValidationResult {
  /**
   * Whether the validation passed (no errors)
   */
  valid: boolean;

  /**
   * List of validation errors (blocking issues)
   */
  errors: ValidationError[];

  /**
   * List of validation warnings (non-blocking issues)
   */
  warnings: ValidationWarning[];
}

/**
 * Options for validation behavior
 */
export interface ValidationOptions {
  /**
   * Whether to validate type references across files
   */
  validateTypeReferences?: boolean;

  /**
   * Whether to detect circular dependencies
   */
  detectCircularDependencies?: boolean;

  /**
   * Whether to validate import paths
   */
  validateImports?: boolean;

  /**
   * Maximum depth for circular dependency detection
   */
  maxCircularDepth?: number;

  /**
   * Whether to treat warnings as errors
   */
  strictMode?: boolean;
}

/**
 * Helper function to create a validation error
 */
export function createValidationError(
  code: ValidationErrorCode,
  message: string,
  location: SourceLocation,
  suggestion?: string,
  details?: Record<string, any>,
): ValidationError {
  return {
    code,
    message,
    location,
    suggestion,
    details,
  };
}

/**
 * Helper function to create a validation warning
 */
export function createValidationWarning(
  code: ValidationErrorCode,
  message: string,
  location: SourceLocation,
  suggestion?: string,
): ValidationWarning {
  return {
    code,
    message,
    location,
    suggestion,
  };
}

/**
 * Helper function to format a validation error for display
 */
export function formatValidationError(error: ValidationError): string {
  const { location, code, message, suggestion } = error;
  let formatted = `[${code}] ${location.file}:${location.line}:${location.column} - ${message}`;

  if (location.context) {
    formatted += `\n  Context: ${location.context}`;
  }

  if (suggestion) {
    formatted += `\n  Suggestion: ${suggestion}`;
  }

  return formatted;
}

/**
 * Helper function to format a validation warning for display
 */
export function formatValidationWarning(warning: ValidationWarning): string {
  const { location, code, message, suggestion } = warning;
  let formatted = `[${code}] ${location.file}:${location.line}:${location.column} - ${message}`;

  if (location.context) {
    formatted += `\n  Context: ${location.context}`;
  }

  if (suggestion) {
    formatted += `\n  Suggestion: ${suggestion}`;
  }

  return formatted;
}

/**
 * Helper function to format a validation result for display
 */
export function formatValidationResult(result: ValidationResult): string {
  const lines: string[] = [];

  if (result.errors.length > 0) {
    lines.push('Validation Errors:');
    result.errors.forEach(error => {
      lines.push(`  ${formatValidationError(error)}`);
    });
  }

  if (result.warnings.length > 0) {
    if (lines.length > 0) {
      lines.push('');
    }
    lines.push('Validation Warnings:');
    result.warnings.forEach(warning => {
      lines.push(`  ${formatValidationWarning(warning)}`);
    });
  }

  if (lines.length === 0) {
    return 'Validation passed with no errors or warnings.';
  }

  return lines.join('\n');
}

/**
 * Helper function to create a default source location
 */
export function createSourceLocation(
  file: string,
  line: number = 1,
  column: number = 1,
  context?: string,
): SourceLocation {
  return {
    file,
    line,
    column,
    context,
  };
}
