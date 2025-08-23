/**
 * NameResolver - Utilities for resolving and transforming proto names
 * 
 * This class handles name resolution, transformation, and conflict resolution
 * for converting Protocol Buffer names to TypeScript identifiers.
 */

// Note: These types might be used in future implementations
// import { MessageDefinition, ServiceDefinition, EnumDefinition } from '../core/proto-types';

/**
 * Name resolution configuration
 */
export interface NameResolverConfig {
  /**
   * Prefix for generated types to avoid conflicts
   */
  typePrefix?: string;
  
  /**
   * Suffix for generated types
   */
  typeSuffix?: string;
  
  /**
   * Whether to preserve proto naming case
   */
  preserveProtoCase?: boolean;
  
  /**
   * Custom name transformations
   */
  customTransformations?: Record<string, string>;
  
  /**
   * Reserved words to avoid in generated code
   */
  reservedWords?: Set<string>;
}

/**
 * NameResolver class for handling proto name transformations
 */
export class NameResolver {
  /**
   * TypeScript reserved keywords
   */
  private static readonly TS_RESERVED_WORDS = new Set([
    'abstract', 'any', 'as', 'async', 'await', 'bigint', 'boolean', 'break',
    'case', 'catch', 'class', 'const', 'constructor', 'continue', 'debugger',
    'declare', 'default', 'delete', 'do', 'else', 'enum', 'export', 'extends',
    'false', 'finally', 'for', 'from', 'function', 'get', 'if', 'implements',
    'import', 'in', 'infer', 'instanceof', 'interface', 'is', 'keyof', 'let',
    'module', 'namespace', 'never', 'new', 'null', 'number', 'object', 'of',
    'package', 'private', 'protected', 'public', 'readonly', 'require', 'return',
    'set', 'static', 'string', 'super', 'switch', 'symbol', 'this', 'throw',
    'true', 'try', 'type', 'typeof', 'undefined', 'unique', 'unknown', 'var',
    'void', 'while', 'with', 'yield',
  ]);
  
  /**
   * Common proto field names that might conflict
   */
  private static readonly COMMON_CONFLICTS = new Set([
    'toString', 'valueOf', 'constructor', 'hasOwnProperty', 'isPrototypeOf',
    'propertyIsEnumerable', 'toLocaleString', '__proto__', 'prototype',
  ]);
  
  private config: NameResolverConfig;
  private nameRegistry: Map<string, string>;
  private conflictCounter: Map<string, number>;
  
  constructor(config: NameResolverConfig = {}) {
    this.config = {
      preserveProtoCase: false,
      reservedWords: new Set([
        ...NameResolver.TS_RESERVED_WORDS,
        ...NameResolver.COMMON_CONFLICTS,
      ]),
      ...config,
    };
    
    this.nameRegistry = new Map();
    this.conflictCounter = new Map();
    
    // Add custom transformations to registry
    if (config.customTransformations) {
      Object.entries(config.customTransformations).forEach(([from, to]) => {
        this.nameRegistry.set(from, to);
      });
    }
  }
  
  /**
   * Convert proto name to TypeScript identifier
   */
  public resolveTypeName(protoName: string, isInterface: boolean = false): string {
    // Check for custom transformation
    if (this.nameRegistry.has(protoName)) {
      return this.nameRegistry.get(protoName)!;
    }
    
    let tsName = protoName;
    
    // Apply transformations
    if (!this.config.preserveProtoCase) {
      tsName = this.toPascalCase(tsName);
    }
    
    // Add prefix/suffix
    if (this.config.typePrefix) {
      tsName = this.config.typePrefix + tsName;
    }
    if (this.config.typeSuffix) {
      tsName = tsName + this.config.typeSuffix;
    }
    
    // Add 'I' prefix for interfaces if needed
    if (isInterface && !tsName.startsWith('I')) {
      tsName = `I${  tsName}`;
    }
    
    // Handle reserved words and conflicts
    tsName = this.resolveConflicts(tsName);
    
    // Cache the resolution
    this.nameRegistry.set(protoName, tsName);
    
    return tsName;
  }
  
  /**
   * Convert proto field name to TypeScript property name
   */
  public resolveFieldName(protoFieldName: string): string {
    // Check for custom transformation
    if (this.nameRegistry.has(protoFieldName)) {
      return this.nameRegistry.get(protoFieldName)!;
    }
    
    let tsName = protoFieldName;
    
    // Convert to camelCase unless preserving proto case
    if (!this.config.preserveProtoCase) {
      tsName = this.toCamelCase(tsName);
    }
    
    // Handle reserved words
    if (this.isReservedWord(tsName)) {
      tsName = this.escapeReservedWord(tsName);
    }
    
    // Cache the resolution
    this.nameRegistry.set(protoFieldName, tsName);
    
    return tsName;
  }
  
  /**
   * Convert proto method name to TypeScript method name
   */
  public resolveMethodName(protoMethodName: string): string {
    // Check for custom transformation
    if (this.nameRegistry.has(protoMethodName)) {
      return this.nameRegistry.get(protoMethodName)!;
    }
    
    let tsName = protoMethodName;
    
    // Always convert to camelCase for methods unless preserving proto case
    if (!this.config.preserveProtoCase) {
      tsName = this.toCamelCase(tsName);
    }
    
    // Handle reserved words
    if (this.isReservedWord(tsName)) {
      tsName = this.escapeReservedWord(tsName);
    }
    
    // Cache the resolution
    this.nameRegistry.set(protoMethodName, tsName);
    
    return tsName;
  }
  
  /**
   * Convert proto service name to TypeScript class name
   */
  public resolveServiceName(protoServiceName: string, suffix: string = 'Stub'): string {
    const baseName = this.resolveTypeName(protoServiceName);
    return baseName + suffix;
  }
  
  /**
   * Convert proto enum value to TypeScript enum member
   */
  public resolveEnumValue(protoEnumValue: string): string {
    // Enum values typically stay in UPPER_SNAKE_CASE
    if (this.config.preserveProtoCase) {
      return protoEnumValue;
    }
    
    // Check if it needs escaping
    if (this.isReservedWord(protoEnumValue)) {
      return this.escapeReservedWord(protoEnumValue);
    }
    
    return protoEnumValue;
  }
  
  /**
   * Generate a unique name for a nested type
   */
  public resolveNestedTypeName(parentName: string, nestedName: string): string {
    const fullName = `${parentName}_${nestedName}`;
    return this.resolveTypeName(fullName);
  }
  
  /**
   * Convert snake_case or kebab-case to PascalCase
   */
  private toPascalCase(str: string): string {
    // If the string doesn't contain underscores or hyphens, just ensure first letter is uppercase
    if (!str.includes('_') && !str.includes('-')) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    // Otherwise split and capitalize each part
    return str
      .split(/[_-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join('');
  }
  
  /**
   * Convert snake_case or kebab-case to camelCase
   */
  private toCamelCase(str: string): string {
    // If the string doesn't contain underscores or hyphens, just ensure first letter is lowercase
    if (!str.includes('_') && !str.includes('-')) {
      return str.charAt(0).toLowerCase() + str.slice(1);
    }
    
    const pascal = this.toPascalCase(str);
    return pascal.charAt(0).toLowerCase() + pascal.slice(1);
  }
  
  /**
   * Check if a name is a reserved word
   */
  private isReservedWord(name: string): boolean {
    return this.config.reservedWords?.has(name) || false;
  }
  
  /**
   * Escape a reserved word
   */
  private escapeReservedWord(name: string): string {
    // Common escaping strategies
    // 1. Prefix with underscore
    return `_${name}`;
    
    // Alternative strategies:
    // 2. Suffix with underscore: `${name}_`
    // 3. Prefix with dollar sign: `$${name}`
    // 4. Change case: `${name.toUpperCase()}`
  }
  
  /**
   * Resolve naming conflicts
   */
  private resolveConflicts(name: string): string {
    if (!this.isReservedWord(name)) {
      return name;
    }
    
    // Generate a unique name by appending a number
    let counter = this.conflictCounter.get(name) || 0;
    let resolvedName = name;
    
    do {
      counter++;
      resolvedName = `${name}${counter}`;
    } while (this.isReservedWord(resolvedName));
    
    this.conflictCounter.set(name, counter);
    return resolvedName;
  }
  
  /**
   * Generate a namespace name from a package name
   */
  public resolveNamespace(packageName: string): string {
    if (!packageName) {
      return '';
    }
    
    // Convert dots to nested namespaces
    return packageName
      .split('.')
      .map(part => this.toPascalCase(part))
      .join('.');
  }
  
  /**
   * Generate an import path for a type
   */
  public resolveImportPath(typeName: string, fromPackage: string, toPackage: string): string {
    // Calculate relative path between packages
    const fromParts = fromPackage.split('.');
    const toParts = toPackage.split('.');
    
    // Find common prefix
    let commonLength = 0;
    while (
      commonLength < fromParts.length &&
      commonLength < toParts.length &&
      fromParts[commonLength] === toParts[commonLength]
    ) {
      commonLength++;
    }
    
    // Build relative path
    const upLevels = fromParts.length - commonLength;
    const downPath = toParts.slice(commonLength);
    
    let relativePath = '';
    if (upLevels > 0) {
      relativePath = '../'.repeat(upLevels);
    } else {
      relativePath = './';
    }
    
    if (downPath.length > 0) {
      relativePath += `${downPath.join('/')  }/`;
    }
    
    return `${relativePath}${typeName}`;
  }
  
  /**
   * Generate a React Hook name from a method name
   */
  public resolveHookName(methodName: string): string {
    const camelName = this.toCamelCase(methodName);
    return `use${camelName.charAt(0).toUpperCase() + camelName.slice(1)}`;
  }
  
  /**
   * Generate a Suspense Hook name from a method name
   */
  public resolveSuspenseHookName(methodName: string): string {
    const camelName = this.toCamelCase(methodName);
    return `useSuspense${camelName.charAt(0).toUpperCase() + camelName.slice(1)}`;
  }
  
  /**
   * Clear the name registry
   */
  public clearRegistry(): void {
    this.nameRegistry.clear();
    this.conflictCounter.clear();
  }
  
  /**
   * Get all registered name mappings
   */
  public getNameMappings(): Map<string, string> {
    return new Map(this.nameRegistry);
  }
  
  /**
   * Check if a name has been registered
   */
  public hasName(protoName: string): boolean {
    return this.nameRegistry.has(protoName);
  }
  
  /**
   * Register a custom name mapping
   */
  public registerName(protoName: string, tsName: string): void {
    this.nameRegistry.set(protoName, tsName);
  }
}

/**
 * Create a default NameResolver instance
 */
export function createNameResolver(config?: NameResolverConfig): NameResolver {
  return new NameResolver(config);
}