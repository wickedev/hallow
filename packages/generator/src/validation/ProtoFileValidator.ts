/**
 * Proto file validator - provides comprehensive validation of proto files
 * @module validation/ProtoFileValidator
 */

import { ProtoFile, ServiceDefinition, MessageDefinition, EnumDefinition, FieldDefinition } from '../core/proto-types';
import {
  ValidationResult,
  ValidationError,
  ValidationWarning,
  ValidationErrorCode,
  ValidationOptions,
  createValidationError,
  createValidationWarning,
  createSourceLocation,
  SourceLocation,
} from './types';

/**
 * Default validation options
 */
const DEFAULT_VALIDATION_OPTIONS: Required<ValidationOptions> = {
  validateTypeReferences: true,
  detectCircularDependencies: true,
  validateImports: true,
  maxCircularDepth: 100,
  strictMode: false,
};

/**
 * Proto file validator
 * Provides comprehensive validation of proto files before code generation
 */
export class ProtoFileValidator {
  private options: Required<ValidationOptions>;

  constructor(options: ValidationOptions = {}) {
    this.options = {
      ...DEFAULT_VALIDATION_OPTIONS,
      ...options,
    };
  }

  /**
   * Validate a single proto file
   * @param protoFile The proto file to validate
   * @returns Validation result with errors and warnings
   */
  validate(protoFile: ProtoFile): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Basic null check
    if (!protoFile) {
      errors.push(
        createValidationError(
          ValidationErrorCode.INVALID_PACKAGE_NAME,
          'Proto file is null or undefined',
          createSourceLocation('unknown', 0, 0),
        ),
      );
      return { valid: false, errors, warnings };
    }

    // Validate package name
    errors.push(...this.validatePackageName(protoFile));

    // Validate services
    errors.push(...this.validateServices(protoFile));

    // Validate messages
    errors.push(...this.validateMessages(protoFile));

    // Validate enums
    errors.push(...this.validateEnums(protoFile));

    // Validate type references if enabled
    if (this.options.validateTypeReferences) {
      errors.push(...this.validateTypeReferences(protoFile));
    }

    // Determine if validation passed
    const valid = errors.length === 0 && (!this.options.strictMode || warnings.length === 0);

    return {
      valid,
      errors,
      warnings,
    };
  }

  /**
   * Validate multiple proto files with cross-file dependencies
   * @param protoFiles Array of proto files to validate
   * @returns Combined validation result
   */
  validateMultiple(protoFiles: ProtoFile[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate each file individually first
    for (const protoFile of protoFiles) {
      const result = this.validate(protoFile);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }

    // Detect circular dependencies across files if enabled
    if (this.options.detectCircularDependencies) {
      errors.push(...this.detectCircularDependencies(protoFiles));
    }

    const valid = errors.length === 0 && (!this.options.strictMode || warnings.length === 0);

    return {
      valid,
      errors,
      warnings,
    };
  }

  /**
   * Validate package name follows protobuf naming conventions
   * Package names should be lowercase, dot-separated identifiers
   * @param protoFile Proto file to validate
   * @returns Array of validation errors
   */
  private validatePackageName(protoFile: ProtoFile): ValidationError[] {
    const errors: ValidationError[] = [];
    const location = createSourceLocation(protoFile.fileName, 1, 1);

    // Check if package name exists
    if (!protoFile.package || protoFile.package.trim() === '') {
      errors.push(
        createValidationError(
          ValidationErrorCode.MISSING_PACKAGE_NAME,
          'Proto file must have a package declaration',
          location,
          'Add a package declaration like: package com.example.myservice;',
        ),
      );
      return errors;
    }

    const packageName = protoFile.package;

    // Package name should be lowercase
    if (packageName !== packageName.toLowerCase()) {
      errors.push(
        createValidationError(
          ValidationErrorCode.INVALID_PACKAGE_NAME,
          `Package name "${packageName}" must be lowercase`,
          location,
          `Use: package ${packageName.toLowerCase()};`,
        ),
      );
    }

    // Package name should be dot-separated identifiers
    const packageRegex = /^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)*$/;
    if (!packageRegex.test(packageName)) {
      errors.push(
        createValidationError(
          ValidationErrorCode.INVALID_PACKAGE_NAME,
          `Package name "${packageName}" must be lowercase, dot-separated identifiers (e.g., com.example.myservice)`,
          location,
          'Each segment must start with a letter and contain only lowercase letters and digits',
        ),
      );
    }

    return errors;
  }

  /**
   * Validate service definitions
   * - Service names must be unique within the file
   * - Service names must follow naming conventions
   * - Services must have at least one method
   * - Method names must be unique within the service
   * @param protoFile Proto file to validate
   * @returns Array of validation errors
   */
  private validateServices(protoFile: ProtoFile): ValidationError[] {
    const errors: ValidationError[] = [];
    const serviceNames = new Set<string>();

    for (const service of protoFile.services) {
      const location = createSourceLocation(protoFile.fileName, 1, 1, `service ${service.name}`);

      // Check for duplicate service names
      if (serviceNames.has(service.name)) {
        errors.push(
          createValidationError(
            ValidationErrorCode.DUPLICATE_SERVICE_NAME,
            `Duplicate service name "${service.name}"`,
            location,
            'Service names must be unique within a proto file',
          ),
        );
      }
      serviceNames.add(service.name);

      // Validate service name format (PascalCase)
      const serviceNameRegex = /^[A-Z][a-zA-Z0-9]*$/;
      if (!serviceNameRegex.test(service.name)) {
        errors.push(
          createValidationError(
            ValidationErrorCode.INVALID_SERVICE_NAME,
            `Invalid service name "${service.name}". Service names should be PascalCase`,
            location,
            'Use PascalCase for service names (e.g., UserService, PaymentService)',
          ),
        );
      }

      // Check if service has methods
      if (!service.methods || service.methods.length === 0) {
        errors.push(
          createValidationError(
            ValidationErrorCode.EMPTY_SERVICE,
            `Service "${service.name}" has no methods`,
            location,
            'Services must define at least one RPC method',
          ),
        );
      }

      // Validate methods within the service
      errors.push(...this.validateServiceMethods(service, protoFile));
    }

    return errors;
  }

  /**
   * Validate methods within a service
   * @param service Service definition
   * @param protoFile Proto file containing the service
   * @returns Array of validation errors
   */
  private validateServiceMethods(service: ServiceDefinition, protoFile: ProtoFile): ValidationError[] {
    const errors: ValidationError[] = [];
    const methodNames = new Set<string>();

    for (const method of service.methods) {
      const location = createSourceLocation(
        protoFile.fileName,
        1,
        1,
        `service ${service.name}, method ${method.name}`,
      );

      // Check for duplicate method names
      if (methodNames.has(method.name)) {
        errors.push(
          createValidationError(
            ValidationErrorCode.DUPLICATE_METHOD_NAME,
            `Duplicate method name "${method.name}" in service "${service.name}"`,
            location,
            'Method names must be unique within a service',
          ),
        );
      }
      methodNames.add(method.name);

      // Validate method name format (PascalCase)
      const methodNameRegex = /^[A-Z][a-zA-Z0-9]*$/;
      if (!methodNameRegex.test(method.name)) {
        errors.push(
          createValidationError(
            ValidationErrorCode.INVALID_METHOD_NAME,
            `Invalid method name "${method.name}". Method names should be PascalCase`,
            location,
            'Use PascalCase for method names (e.g., GetUser, ListUsers)',
          ),
        );
      }

      // Validate input and output types exist
      if (!method.inputType || method.inputType.trim() === '') {
        errors.push(
          createValidationError(
            ValidationErrorCode.INVALID_METHOD_INPUT_TYPE,
            `Method "${method.name}" in service "${service.name}" has no input type`,
            location,
            'Every RPC method must specify an input message type',
          ),
        );
      }

      if (!method.outputType || method.outputType.trim() === '') {
        errors.push(
          createValidationError(
            ValidationErrorCode.INVALID_METHOD_OUTPUT_TYPE,
            `Method "${method.name}" in service "${service.name}" has no output type`,
            location,
            'Every RPC method must specify an output message type',
          ),
        );
      }
    }

    return errors;
  }

  /**
   * Validate message definitions
   * - Message names must be unique within the file
   * - Field numbers must be unique within the message
   * - Field numbers must not be in reserved ranges
   * - Field types must be valid
   * @param protoFile Proto file to validate
   * @returns Array of validation errors
   */
  private validateMessages(protoFile: ProtoFile): ValidationError[] {
    const errors: ValidationError[] = [];
    const messageNames = new Set<string>();

    const validateMessageRecursive = (message: MessageDefinition, parentName?: string): void => {
      const fullName = parentName ? `${parentName}.${message.name}` : message.name;
      const location = createSourceLocation(protoFile.fileName, 1, 1, `message ${fullName}`);

      // Check for duplicate message names at the same level
      if (messageNames.has(fullName)) {
        errors.push(
          createValidationError(
            ValidationErrorCode.DUPLICATE_MESSAGE_NAME,
            `Duplicate message name "${fullName}"`,
            location,
            'Message names must be unique within their scope',
          ),
        );
      }
      messageNames.add(fullName);

      // Validate message name format (PascalCase)
      const messageNameRegex = /^[A-Z][a-zA-Z0-9]*$/;
      if (!messageNameRegex.test(message.name)) {
        errors.push(
          createValidationError(
            ValidationErrorCode.INVALID_MESSAGE_NAME,
            `Invalid message name "${message.name}". Message names should be PascalCase`,
            location,
            'Use PascalCase for message names (e.g., User, UserRequest)',
          ),
        );
      }

      // Validate fields
      errors.push(...this.validateMessageFields(message, protoFile, fullName));

      // Recursively validate nested messages
      for (const nested of message.nestedMessages) {
        validateMessageRecursive(nested, fullName);
      }

      // Validate nested enums
      for (const nestedEnum of message.nestedEnums) {
        errors.push(...this.validateEnum(nestedEnum, protoFile, fullName));
      }
    };

    // Validate all top-level messages
    for (const message of protoFile.messages) {
      validateMessageRecursive(message);
    }

    return errors;
  }

  /**
   * Validate fields within a message
   * @param message Message definition
   * @param protoFile Proto file containing the message
   * @param messagePath Full path to the message (for nested messages)
   * @returns Array of validation errors
   */
  private validateMessageFields(
    message: MessageDefinition,
    protoFile: ProtoFile,
    messagePath: string,
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const fieldNumbers = new Set<number>();
    const fieldNames = new Set<string>();

    // Reserved field number ranges in protobuf
    const reservedRanges = [
      { start: 19000, end: 19999 }, // Reserved for protobuf implementation
    ];

    for (const field of message.fields) {
      const location = createSourceLocation(
        protoFile.fileName,
        1,
        1,
        `message ${messagePath}, field ${field.name}`,
      );

      // Check for duplicate field numbers
      if (fieldNumbers.has(field.number)) {
        errors.push(
          createValidationError(
            ValidationErrorCode.DUPLICATE_FIELD_NUMBER,
            `Duplicate field number ${field.number} in message "${messagePath}"`,
            location,
            'Field numbers must be unique within a message',
          ),
        );
      }
      fieldNumbers.add(field.number);

      // Check for reserved field numbers
      for (const range of reservedRanges) {
        if (field.number >= range.start && field.number <= range.end) {
          errors.push(
            createValidationError(
              ValidationErrorCode.RESERVED_FIELD_NUMBER,
              `Field number ${field.number} is in reserved range ${range.start}-${range.end} in message "${messagePath}"`,
              location,
              'Use field numbers outside of reserved ranges (avoid 19000-19999)',
            ),
          );
        }
      }

      // Validate field number range
      if (field.number < 1 || field.number > 536870911) {
        errors.push(
          createValidationError(
            ValidationErrorCode.INVALID_FIELD_NUMBER,
            `Field number ${field.number} is out of valid range (1-536870911) in message "${messagePath}"`,
            location,
            'Field numbers must be between 1 and 536870911',
          ),
        );
      }

      // Check for duplicate field names
      if (fieldNames.has(field.name)) {
        errors.push(
          createValidationError(
            ValidationErrorCode.DUPLICATE_FIELD_NUMBER,
            `Duplicate field name "${field.name}" in message "${messagePath}"`,
            location,
            'Field names must be unique within a message',
          ),
        );
      }
      fieldNames.add(field.name);

      // Validate field type (basic validation - detailed type checking in validateTypeReferences)
      if (!field.type || field.type.trim() === '') {
        errors.push(
          createValidationError(
            ValidationErrorCode.INVALID_FIELD_TYPE,
            `Field "${field.name}" in message "${messagePath}" has no type`,
            location,
            'Every field must specify a type',
          ),
        );
      }
    }

    return errors;
  }

  /**
   * Validate enum definitions
   * - Enum names must be unique
   * - Enum values must be unique within the enum
   * - Enum numbers must be unique within the enum
   * @param protoFile Proto file to validate
   * @returns Array of validation errors
   */
  private validateEnums(protoFile: ProtoFile): ValidationError[] {
    const errors: ValidationError[] = [];
    const enumNames = new Set<string>();

    for (const enumDef of protoFile.enums) {
      errors.push(...this.validateEnum(enumDef, protoFile));

      // Check for duplicate enum names at top level
      if (enumNames.has(enumDef.name)) {
        const location = createSourceLocation(protoFile.fileName, 1, 1, `enum ${enumDef.name}`);
        errors.push(
          createValidationError(
            ValidationErrorCode.DUPLICATE_ENUM_NAME,
            `Duplicate enum name "${enumDef.name}"`,
            location,
            'Enum names must be unique within a proto file',
          ),
        );
      }
      enumNames.add(enumDef.name);
    }

    return errors;
  }

  /**
   * Validate a single enum definition
   * @param enumDef Enum definition
   * @param protoFile Proto file containing the enum
   * @param parentName Optional parent message name for nested enums
   * @returns Array of validation errors
   */
  private validateEnum(
    enumDef: EnumDefinition,
    protoFile: ProtoFile,
    parentName?: string,
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const fullName = parentName ? `${parentName}.${enumDef.name}` : enumDef.name;
    const location = createSourceLocation(protoFile.fileName, 1, 1, `enum ${fullName}`);

    // Validate enum name format (PascalCase)
    const enumNameRegex = /^[A-Z][a-zA-Z0-9]*$/;
    if (!enumNameRegex.test(enumDef.name)) {
      errors.push(
        createValidationError(
          ValidationErrorCode.INVALID_ENUM_NAME,
          `Invalid enum name "${enumDef.name}". Enum names should be PascalCase`,
          location,
          'Use PascalCase for enum names (e.g., Status, UserRole)',
        ),
      );
    }

    // Check if enum has values
    if (!enumDef.values || enumDef.values.length === 0) {
      errors.push(
        createValidationError(
          ValidationErrorCode.EMPTY_ENUM,
          `Enum "${fullName}" has no values`,
          location,
          'Enums must define at least one value',
        ),
      );
      return errors;
    }

    const valueNames = new Set<string>();
    const valueNumbers = new Set<number>();

    for (const value of enumDef.values) {
      const valueLocation = createSourceLocation(
        protoFile.fileName,
        1,
        1,
        `enum ${fullName}, value ${value.name}`,
      );

      // Check for duplicate enum value names
      if (valueNames.has(value.name)) {
        errors.push(
          createValidationError(
            ValidationErrorCode.DUPLICATE_ENUM_VALUE,
            `Duplicate enum value name "${value.name}" in enum "${fullName}"`,
            valueLocation,
            'Enum value names must be unique within an enum',
          ),
        );
      }
      valueNames.add(value.name);

      // Check for duplicate enum numbers
      if (valueNumbers.has(value.number)) {
        errors.push(
          createValidationError(
            ValidationErrorCode.DUPLICATE_ENUM_NUMBER,
            `Duplicate enum number ${value.number} in enum "${fullName}"`,
            valueLocation,
            'Enum numbers must be unique within an enum (unless using allow_alias option)',
          ),
        );
      }
      valueNumbers.add(value.number);

      // Validate enum value number range
      if (value.number < -2147483648 || value.number > 2147483647) {
        errors.push(
          createValidationError(
            ValidationErrorCode.INVALID_ENUM_VALUE_NUMBER,
            `Enum value number ${value.number} is out of valid range (-2147483648 to 2147483647) in enum "${fullName}"`,
            valueLocation,
            'Enum numbers must be 32-bit signed integers',
          ),
        );
      }
    }

    // Proto3 requires first enum value to be 0
    if (protoFile.syntax === 'proto3') {
      const firstValue = enumDef.values[0];
      if (firstValue && firstValue.number !== 0) {
        errors.push(
          createValidationError(
            ValidationErrorCode.INVALID_ENUM_VALUE_NUMBER,
            `First enum value in "${fullName}" must be 0 in proto3`,
            location,
            'In proto3, the first enum value must have number 0',
          ),
        );
      }
    }

    return errors;
  }

  /**
   * Validate type references in messages
   * Ensures all referenced types (messages, enums) exist
   * @param protoFile Proto file to validate
   * @returns Array of validation errors
   */
  private validateTypeReferences(protoFile: ProtoFile): ValidationError[] {
    const errors: ValidationError[] = [];

    // Build a registry of available types
    const availableTypes = this.buildTypeRegistry(protoFile);

    // Scalar types in protobuf
    const scalarTypes = new Set([
      'double',
      'float',
      'int32',
      'int64',
      'uint32',
      'uint64',
      'sint32',
      'sint64',
      'fixed32',
      'fixed64',
      'sfixed32',
      'sfixed64',
      'bool',
      'string',
      'bytes',
    ]);

    const validateFieldType = (field: FieldDefinition, messagePath: string): void => {
      // Skip map types (they have special handling)
      if (field.map) {
        return;
      }

      const fieldType = field.type;

      // Check if it's a scalar type
      if (scalarTypes.has(fieldType)) {
        return;
      }

      // Check if the type exists in the registry
      if (!availableTypes.has(fieldType)) {
        const location = createSourceLocation(
          protoFile.fileName,
          1,
          1,
          `message ${messagePath}, field ${field.name}`,
        );

        // Try to suggest similar types
        const suggestion = this.findSimilarType(fieldType, availableTypes);

        errors.push(
          createValidationError(
            ValidationErrorCode.UNRESOLVED_TYPE_REFERENCE,
            `Type "${fieldType}" referenced in field "${field.name}" of message "${messagePath}" is not defined`,
            location,
            suggestion ? `Did you mean "${suggestion}"?` : 'Ensure the type is defined or imported',
            { fieldType, messagePath },
          ),
        );
      }
    };

    const validateMessageRecursive = (message: MessageDefinition, parentName?: string): void => {
      const fullName = parentName ? `${parentName}.${message.name}` : message.name;

      // Validate all fields
      for (const field of message.fields) {
        validateFieldType(field, fullName);
      }

      // Recursively validate nested messages
      for (const nested of message.nestedMessages) {
        validateMessageRecursive(nested, fullName);
      }
    };

    // Validate all messages
    for (const message of protoFile.messages) {
      validateMessageRecursive(message);
    }

    // Validate service method input/output types
    for (const service of protoFile.services) {
      for (const method of service.methods) {
        const location = createSourceLocation(
          protoFile.fileName,
          1,
          1,
          `service ${service.name}, method ${method.name}`,
        );

        if (!scalarTypes.has(method.inputType) && !availableTypes.has(method.inputType)) {
          const suggestion = this.findSimilarType(method.inputType, availableTypes);
          errors.push(
            createValidationError(
              ValidationErrorCode.UNRESOLVED_TYPE_REFERENCE,
              `Input type "${method.inputType}" for method "${method.name}" is not defined`,
              location,
              suggestion ? `Did you mean "${suggestion}"?` : 'Ensure the type is defined or imported',
            ),
          );
        }

        if (!scalarTypes.has(method.outputType) && !availableTypes.has(method.outputType)) {
          const suggestion = this.findSimilarType(method.outputType, availableTypes);
          errors.push(
            createValidationError(
              ValidationErrorCode.UNRESOLVED_TYPE_REFERENCE,
              `Output type "${method.outputType}" for method "${method.name}" is not defined`,
              location,
              suggestion ? `Did you mean "${suggestion}"?` : 'Ensure the type is defined or imported',
            ),
          );
        }
      }
    }

    return errors;
  }

  /**
   * Build a registry of all available types in the proto file
   * @param protoFile Proto file
   * @returns Set of available type names
   */
  private buildTypeRegistry(protoFile: ProtoFile): Set<string> {
    const types = new Set<string>();

    const addMessageTypes = (message: MessageDefinition, parentName?: string): void => {
      const fullName = parentName ? `${parentName}.${message.name}` : message.name;
      types.add(fullName);
      types.add(message.name); // Also add simple name

      // Add nested messages
      for (const nested of message.nestedMessages) {
        addMessageTypes(nested, fullName);
      }

      // Add nested enums
      for (const nestedEnum of message.nestedEnums) {
        const enumFullName = `${fullName}.${nestedEnum.name}`;
        types.add(enumFullName);
        types.add(nestedEnum.name);
      }
    };

    // Add all messages
    for (const message of protoFile.messages) {
      addMessageTypes(message);
    }

    // Add all top-level enums
    for (const enumDef of protoFile.enums) {
      types.add(enumDef.name);
    }

    return types;
  }

  /**
   * Find a similar type name for suggestions
   * @param typeName Type name to find similar matches for
   * @param availableTypes Set of available types
   * @returns Similar type name or undefined
   */
  private findSimilarType(typeName: string, availableTypes: Set<string>): string | undefined {
    // Simple similarity check - case-insensitive match
    const lowerTypeName = typeName.toLowerCase();

    for (const availableType of availableTypes) {
      if (availableType.toLowerCase() === lowerTypeName) {
        return availableType;
      }
    }

    // Check for partial matches
    for (const availableType of availableTypes) {
      if (
        availableType.toLowerCase().includes(lowerTypeName) ||
        lowerTypeName.includes(availableType.toLowerCase())
      ) {
        return availableType;
      }
    }

    return undefined;
  }

  /**
   * Detect circular dependencies in proto file imports
   * @param protoFiles Array of proto files to check
   * @returns Array of validation errors for circular dependencies
   */
  private detectCircularDependencies(protoFiles: ProtoFile[]): ValidationError[] {
    const errors: ValidationError[] = [];

    // Build import graph
    const importGraph = new Map<string, string[]>();
    const fileMap = new Map<string, ProtoFile>();

    for (const protoFile of protoFiles) {
      importGraph.set(protoFile.fileName, protoFile.imports);
      fileMap.set(protoFile.fileName, protoFile);
    }

    // Detect cycles using DFS
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const hasCycle = (fileName: string): boolean => {
      visited.add(fileName);
      recursionStack.add(fileName);
      path.push(fileName);

      const imports = importGraph.get(fileName) || [];
      for (const importPath of imports) {
        if (!visited.has(importPath)) {
          if (hasCycle(importPath)) {
            return true;
          }
        } else if (recursionStack.has(importPath)) {
          // Found a cycle
          const cycleStart = path.indexOf(importPath);
          const cycle = [...path.slice(cycleStart), importPath];
          const protoFile = fileMap.get(fileName);

          if (protoFile) {
            const location = createSourceLocation(
              protoFile.fileName,
              1,
              1,
              `imports: ${protoFile.imports.join(', ')}`,
            );
            errors.push(
              createValidationError(
                ValidationErrorCode.CIRCULAR_IMPORT_DEPENDENCY,
                `Circular import dependency detected: ${cycle.join(' -> ')}`,
                location,
                'Remove or reorganize imports to break the circular dependency',
                { cycle },
              ),
            );
          }
          return true;
        }
      }

      path.pop();
      recursionStack.delete(fileName);
      return false;
    };

    // Check for cycles starting from each file
    for (const fileName of importGraph.keys()) {
      if (!visited.has(fileName)) {
        hasCycle(fileName);
      }
    }

    return errors;
  }

  /**
   * Update validation options
   * @param options Partial validation options to update
   */
  updateOptions(options: Partial<ValidationOptions>): void {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  /**
   * Get current validation options
   * @returns Current validation options
   */
  getOptions(): Readonly<Required<ValidationOptions>> {
    return { ...this.options };
  }
}
