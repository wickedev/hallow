/**
 * Proto file validator - provides comprehensive validation of proto files
 * @module validation/ProtoFileValidator
 */
import { ProtoFile } from '../core/proto-types';
import { ValidationResult, ValidationOptions } from './types';
/**
 * Proto file validator
 * Provides comprehensive validation of proto files before code generation
 */
export declare class ProtoFileValidator {
    private options;
    constructor(options?: ValidationOptions);
    /**
     * Validate a single proto file
     * @param protoFile The proto file to validate
     * @returns Validation result with errors and warnings
     */
    validate(protoFile: ProtoFile): ValidationResult;
    /**
     * Validate multiple proto files with cross-file dependencies
     * @param protoFiles Array of proto files to validate
     * @returns Combined validation result
     */
    validateMultiple(protoFiles: ProtoFile[]): ValidationResult;
    /**
     * Validate package name follows protobuf naming conventions
     * Package names should be lowercase, dot-separated identifiers
     * @param protoFile Proto file to validate
     * @returns Array of validation errors
     */
    private validatePackageName;
    /**
     * Validate service definitions
     * - Service names must be unique within the file
     * - Service names must follow naming conventions
     * - Services must have at least one method
     * - Method names must be unique within the service
     * @param protoFile Proto file to validate
     * @returns Array of validation errors
     */
    private validateServices;
    /**
     * Validate methods within a service
     * @param service Service definition
     * @param protoFile Proto file containing the service
     * @returns Array of validation errors
     */
    private validateServiceMethods;
    /**
     * Validate message definitions
     * - Message names must be unique within the file
     * - Field numbers must be unique within the message
     * - Field numbers must not be in reserved ranges
     * - Field types must be valid
     * @param protoFile Proto file to validate
     * @returns Array of validation errors
     */
    private validateMessages;
    /**
     * Validate fields within a message
     * @param message Message definition
     * @param protoFile Proto file containing the message
     * @param messagePath Full path to the message (for nested messages)
     * @returns Array of validation errors
     */
    private validateMessageFields;
    /**
     * Validate enum definitions
     * - Enum names must be unique
     * - Enum values must be unique within the enum
     * - Enum numbers must be unique within the enum
     * @param protoFile Proto file to validate
     * @returns Array of validation errors
     */
    private validateEnums;
    /**
     * Validate a single enum definition
     * @param enumDef Enum definition
     * @param protoFile Proto file containing the enum
     * @param parentName Optional parent message name for nested enums
     * @returns Array of validation errors
     */
    private validateEnum;
    /**
     * Validate type references in messages
     * Ensures all referenced types (messages, enums) exist
     * @param protoFile Proto file to validate
     * @returns Array of validation errors
     */
    private validateTypeReferences;
    /**
     * Build a registry of all available types in the proto file
     * @param protoFile Proto file
     * @returns Set of available type names
     */
    private buildTypeRegistry;
    /**
     * Find a similar type name for suggestions
     * @param typeName Type name to find similar matches for
     * @param availableTypes Set of available types
     * @returns Similar type name or undefined
     */
    private findSimilarType;
    /**
     * Detect circular dependencies in proto file imports
     * @param protoFiles Array of proto files to check
     * @returns Array of validation errors for circular dependencies
     */
    private detectCircularDependencies;
    /**
     * Update validation options
     * @param options Partial validation options to update
     */
    updateOptions(options: Partial<ValidationOptions>): void;
    /**
     * Get current validation options
     * @returns Current validation options
     */
    getOptions(): Readonly<Required<ValidationOptions>>;
}
//# sourceMappingURL=ProtoFileValidator.d.ts.map