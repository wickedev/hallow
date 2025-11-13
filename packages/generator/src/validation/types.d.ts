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
export declare enum ValidationErrorCode {
    INVALID_PACKAGE_NAME = "INVALID_PACKAGE_NAME",
    MISSING_PACKAGE_NAME = "MISSING_PACKAGE_NAME",
    DUPLICATE_SERVICE_NAME = "DUPLICATE_SERVICE_NAME",
    INVALID_SERVICE_NAME = "INVALID_SERVICE_NAME",
    EMPTY_SERVICE = "EMPTY_SERVICE",
    DUPLICATE_METHOD_NAME = "DUPLICATE_METHOD_NAME",
    INVALID_METHOD_NAME = "INVALID_METHOD_NAME",
    INVALID_METHOD_INPUT_TYPE = "INVALID_METHOD_INPUT_TYPE",
    INVALID_METHOD_OUTPUT_TYPE = "INVALID_METHOD_OUTPUT_TYPE",
    DUPLICATE_MESSAGE_NAME = "DUPLICATE_MESSAGE_NAME",
    INVALID_MESSAGE_NAME = "INVALID_MESSAGE_NAME",
    DUPLICATE_FIELD_NUMBER = "DUPLICATE_FIELD_NUMBER",
    RESERVED_FIELD_NUMBER = "RESERVED_FIELD_NUMBER",
    RESERVED_FIELD_NAME = "RESERVED_FIELD_NAME",
    INVALID_FIELD_TYPE = "INVALID_FIELD_TYPE",
    INVALID_FIELD_NUMBER = "INVALID_FIELD_NUMBER",
    DUPLICATE_ENUM_NAME = "DUPLICATE_ENUM_NAME",
    INVALID_ENUM_NAME = "INVALID_ENUM_NAME",
    DUPLICATE_ENUM_VALUE = "DUPLICATE_ENUM_VALUE",
    DUPLICATE_ENUM_NUMBER = "DUPLICATE_ENUM_NUMBER",
    INVALID_ENUM_VALUE_NUMBER = "INVALID_ENUM_VALUE_NUMBER",
    EMPTY_ENUM = "EMPTY_ENUM",
    UNRESOLVED_TYPE_REFERENCE = "UNRESOLVED_TYPE_REFERENCE",
    CIRCULAR_MESSAGE_DEPENDENCY = "CIRCULAR_MESSAGE_DEPENDENCY",
    CIRCULAR_IMPORT_DEPENDENCY = "CIRCULAR_IMPORT_DEPENDENCY",
    INVALID_IMPORT_PATH = "INVALID_IMPORT_PATH",
    MISSING_IMPORT = "MISSING_IMPORT"
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
export declare function createValidationError(code: ValidationErrorCode, message: string, location: SourceLocation, suggestion?: string, details?: Record<string, any>): ValidationError;
/**
 * Helper function to create a validation warning
 */
export declare function createValidationWarning(code: ValidationErrorCode, message: string, location: SourceLocation, suggestion?: string): ValidationWarning;
/**
 * Helper function to format a validation error for display
 */
export declare function formatValidationError(error: ValidationError): string;
/**
 * Helper function to format a validation warning for display
 */
export declare function formatValidationWarning(warning: ValidationWarning): string;
/**
 * Helper function to format a validation result for display
 */
export declare function formatValidationResult(result: ValidationResult): string;
/**
 * Helper function to create a default source location
 */
export declare function createSourceLocation(file: string, line?: number, column?: number, context?: string): SourceLocation;
//# sourceMappingURL=types.d.ts.map