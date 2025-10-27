/**
 * ImportResolver - Resolves cross-file type references and manages import dependencies
 *
 * This class handles the resolution of type references across proto files,
 * manages package namespace imports, and generates proper import paths
 * for the generated TypeScript code.
 */

import {
  ProtoFile,
  MessageDefinition,
  ServiceDefinition,
  EnumDefinition,
} from '../core/proto-types';
import { NameResolver } from './NameResolver';
import { TypeMapper } from './TypeMapper';

/**
 * Type reference information
 */
export interface TypeReference {
  /**
   * Fully qualified type name (e.g., "google.protobuf.Timestamp")
   */
  fullName: string;

  /**
   * Package name (e.g., "google.protobuf")
   */
  package: string;

  /**
   * Type name without package (e.g., "Timestamp")
   */
  typeName: string;

  /**
   * Source file where the type is defined
   */
  sourceFile?: string;

  /**
   * Whether this is a well-known type
   */
  isWellKnown?: boolean;

  /**
   * Whether this is an external import
   */
  isExternal?: boolean;
}

/**
 * Import dependency information
 */
export interface ImportDependency {
  /**
   * Source file path (relative or absolute)
   */
  source: string;

  /**
   * Types to import from this source
   */
  types: string[];

  /**
   * Whether this is a proto file import
   */
  isProtoImport: boolean;

  /**
   * Generated TypeScript module path
   */
  tsModulePath?: string;

  /**
   * Whether to use namespace import
   */
  useNamespace?: boolean;

  /**
   * Namespace name if using namespace import
   */
  namespaceName?: string;
}

/**
 * Type registry entry
 */
interface TypeRegistryEntry {
  file: ProtoFile;
  package: string;
  typeName: string;
  fullName: string;
  kind: 'message' | 'enum' | 'service';
  definition: MessageDefinition | EnumDefinition | ServiceDefinition;
}

/**
 * Well-known protobuf types mapping
 */
const WELL_KNOWN_TYPES: Record<string, string> = {
  'google.protobuf.Any': 'google-protobuf/google/protobuf/any_pb',
  'google.protobuf.Timestamp': 'google-protobuf/google/protobuf/timestamp_pb',
  'google.protobuf.Duration': 'google-protobuf/google/protobuf/duration_pb',
  'google.protobuf.Empty': 'google-protobuf/google/protobuf/empty_pb',
  'google.protobuf.Struct': 'google-protobuf/google/protobuf/struct_pb',
  'google.protobuf.Value': 'google-protobuf/google/protobuf/struct_pb',
  'google.protobuf.ListValue': 'google-protobuf/google/protobuf/struct_pb',
  'google.protobuf.FieldMask': 'google-protobuf/google/protobuf/field_mask_pb',
  'google.protobuf.DoubleValue': 'google-protobuf/google/protobuf/wrappers_pb',
  'google.protobuf.FloatValue': 'google-protobuf/google/protobuf/wrappers_pb',
  'google.protobuf.Int64Value': 'google-protobuf/google/protobuf/wrappers_pb',
  'google.protobuf.UInt64Value': 'google-protobuf/google/protobuf/wrappers_pb',
  'google.protobuf.Int32Value': 'google-protobuf/google/protobuf/wrappers_pb',
  'google.protobuf.UInt32Value': 'google-protobuf/google/protobuf/wrappers_pb',
  'google.protobuf.BoolValue': 'google-protobuf/google/protobuf/wrappers_pb',
  'google.protobuf.StringValue': 'google-protobuf/google/protobuf/wrappers_pb',
  'google.protobuf.BytesValue': 'google-protobuf/google/protobuf/wrappers_pb',
};

/**
 * Import resolution configuration
 */
export interface ImportResolverConfig {
  /**
   * Base path for resolving imports
   */
  basePath?: string;

  /**
   * Output directory for generated files
   */
  outputDir?: string;

  /**
   * Whether to use relative imports
   */
  useRelativeImports?: boolean;

  /**
   * Whether to generate namespace imports for packages
   */
  useNamespaceImports?: boolean;

  /**
   * Custom import paths mapping
   */
  customImportPaths?: Record<string, string>;

  /**
   * File extension for generated files
   */
  fileExtension?: string;
}

/**
 * ImportResolver class for managing cross-file dependencies
 */
export class ImportResolver {
  private typeRegistry: Map<string, TypeRegistryEntry>;
  private fileRegistry: Map<string, ProtoFile>;
  private dependencyGraph: Map<string, Set<string>>;
  private config: ImportResolverConfig;
  private nameResolver: NameResolver;
  private typeMapper: TypeMapper;

  constructor(
    config: ImportResolverConfig = {},
    nameResolver?: NameResolver,
    typeMapper?: TypeMapper,
  ) {
    this.typeRegistry = new Map();
    this.fileRegistry = new Map();
    this.dependencyGraph = new Map();
    this.config = {
      useRelativeImports: true,
      useNamespaceImports: false,
      fileExtension: '.ts',
      ...config,
    };
    this.nameResolver = nameResolver || new NameResolver();
    this.typeMapper = typeMapper || new TypeMapper();
  }

  /**
   * Register a proto file and its types
   */
  public registerProtoFile(file: ProtoFile): void {
    const fileName = file.fileName;
    this.fileRegistry.set(fileName, file);

    // Register all messages
    this.registerMessages(file.messages, file, file.package || '');

    // Register all enums
    this.registerEnums(file.enums, file, file.package || '');

    // Register all services
    this.registerServices(file.services, file, file.package || '');

    // Process imports to build dependency graph
    if (!this.dependencyGraph.has(fileName)) {
      this.dependencyGraph.set(fileName, new Set());
    }

    file.imports.forEach(importPath => {
      this.dependencyGraph.get(fileName)!.add(importPath);
    });
  }

  /**
   * Register message types recursively
   */
  private registerMessages(
    messages: MessageDefinition[],
    file: ProtoFile,
    packageName: string,
    parentName?: string,
  ): void {
    messages.forEach(message => {
      const typeName = parentName ? `${parentName}.${message.name}` : message.name;
      const fullName = packageName ? `${packageName}.${typeName}` : typeName;

      this.typeRegistry.set(fullName, {
        file,
        package: packageName,
        typeName,
        fullName,
        kind: 'message',
        definition: message,
      });

      // Register nested messages
      if (message.nestedMessages) {
        this.registerMessages(message.nestedMessages, file, packageName, typeName);
      }

      // Register nested enums
      if (message.nestedEnums) {
        this.registerEnums(message.nestedEnums, file, packageName, typeName);
      }
    });
  }

  /**
   * Register enum types
   */
  private registerEnums(
    enums: EnumDefinition[],
    file: ProtoFile,
    packageName: string,
    parentName?: string,
  ): void {
    enums.forEach(enumDef => {
      const typeName = parentName ? `${parentName}.${enumDef.name}` : enumDef.name;
      const fullName = packageName ? `${packageName}.${typeName}` : typeName;

      this.typeRegistry.set(fullName, {
        file,
        package: packageName,
        typeName,
        fullName,
        kind: 'enum',
        definition: enumDef,
      });
    });
  }

  /**
   * Register service types
   */
  private registerServices(
    services: ServiceDefinition[],
    file: ProtoFile,
    packageName: string,
  ): void {
    services.forEach(service => {
      const fullName = packageName ? `${packageName}.${service.name}` : service.name;

      this.typeRegistry.set(fullName, {
        file,
        package: packageName,
        typeName: service.name,
        fullName,
        kind: 'service',
        definition: service,
      });
    });
  }

  /**
   * Resolve a type reference to its definition
   */
  public resolveType(typeName: string, currentPackage?: string): TypeReference | null {
    // Check if it's a well-known type
    if (WELL_KNOWN_TYPES[typeName]) {
      return {
        fullName: typeName,
        package: typeName.substring(0, typeName.lastIndexOf('.')),
        typeName: typeName.substring(typeName.lastIndexOf('.') + 1),
        isWellKnown: true,
        isExternal: true,
      };
    }

    // Try to resolve as fully qualified name
    if (this.typeRegistry.has(typeName)) {
      const entry = this.typeRegistry.get(typeName)!;
      return {
        fullName: entry.fullName,
        package: entry.package,
        typeName: entry.typeName,
        sourceFile: entry.file.fileName,
        isWellKnown: false,
        isExternal: false,
      };
    }

    // Try to resolve relative to current package
    if (currentPackage) {
      const fullName = `${currentPackage}.${typeName}`;
      if (this.typeRegistry.has(fullName)) {
        const entry = this.typeRegistry.get(fullName)!;
        return {
          fullName: entry.fullName,
          package: entry.package,
          typeName: entry.typeName,
          sourceFile: entry.file.fileName,
          isWellKnown: false,
          isExternal: false,
        };
      }
    }

    // Try to resolve without package (for types in the same file)
    const entries = Array.from(this.typeRegistry.values());
    const match = entries.find(entry => entry.typeName === typeName);
    if (match) {
      return {
        fullName: match.fullName,
        package: match.package,
        typeName: match.typeName,
        sourceFile: match.file.fileName,
        isWellKnown: false,
        isExternal: false,
      };
    }

    return null;
  }

  /**
   * Get all import dependencies for a proto file
   */
  public getImportDependencies(fileName: string): ImportDependency[] {
    const file = this.fileRegistry.get(fileName);
    if (!file) {
      return [];
    }

    const dependencies: Map<string, ImportDependency> = new Map();
    const processedTypes = new Set<string>();

    // Process all type references in the file
    this.collectTypeReferences(file, processedTypes).forEach(typeRef => {
      if (typeRef.isWellKnown) {
        // Handle well-known types
        const importPath = WELL_KNOWN_TYPES[typeRef.fullName];
        if (importPath) {
          if (!dependencies.has(importPath)) {
            dependencies.set(importPath, {
              source: importPath,
              types: [],
              isProtoImport: false,
            });
          }
          const tsTypeName = this.nameResolver.resolveTypeName(typeRef.typeName);
          dependencies.get(importPath)!.types.push(tsTypeName);
        }
      } else if (typeRef.sourceFile && typeRef.sourceFile !== fileName) {
        // Handle cross-file imports
        const importPath = this.generateImportPath(fileName, typeRef.sourceFile);
        if (!dependencies.has(importPath)) {
          dependencies.set(importPath, {
            source: importPath,
            types: [],
            isProtoImport: true,
            tsModulePath: importPath,
          });
        }
        const tsTypeName = this.nameResolver.resolveTypeName(typeRef.typeName);
        dependencies.get(importPath)!.types.push(tsTypeName);
      }
    });

    // Add namespace imports if configured
    if (this.config.useNamespaceImports) {
      dependencies.forEach(dep => {
        if (dep.isProtoImport && dep.types.length > 3) {
          // Use namespace import for files with many types
          const packageName = this.extractPackageFromPath(dep.source);
          dep.useNamespace = true;
          dep.namespaceName = this.nameResolver.resolveNamespace(packageName);
        }
      });
    }

    return Array.from(dependencies.values());
  }

  /**
   * Collect all type references from a proto file
   */
  private collectTypeReferences(file: ProtoFile, processedTypes: Set<string>): TypeReference[] {
    const references: TypeReference[] = [];

    // Collect from services
    file.services.forEach(service => {
      service.methods.forEach(method => {
        this.addTypeReference(method.inputType, file.package, references, processedTypes);
        this.addTypeReference(method.outputType, file.package, references, processedTypes);
      });
    });

    // Collect from messages
    const collectFromMessage = (message: MessageDefinition) => {
      message.fields.forEach(field => {
        if (!this.typeMapper.isScalarType(field.type)) {
          this.addTypeReference(field.type, file.package, references, processedTypes);
        }
        if (field.mapKeyType && !this.typeMapper.isScalarType(field.mapKeyType)) {
          this.addTypeReference(field.mapKeyType, file.package, references, processedTypes);
        }
        if (field.mapValueType && !this.typeMapper.isScalarType(field.mapValueType)) {
          this.addTypeReference(field.mapValueType, file.package, references, processedTypes);
        }
      });

      // Process nested messages
      message.nestedMessages?.forEach(collectFromMessage);
    };

    file.messages.forEach(collectFromMessage);

    return references;
  }

  /**
   * Add a type reference if not already processed
   */
  private addTypeReference(
    typeName: string,
    currentPackage: string | undefined,
    references: TypeReference[],
    processedTypes: Set<string>,
  ): void {
    if (processedTypes.has(typeName)) {
      return;
    }

    const typeRef = this.resolveType(typeName, currentPackage);
    if (typeRef) {
      references.push(typeRef);
      processedTypes.add(typeName);
    }
  }

  /**
   * Generate import path between two files
   */
  private generateImportPath(fromFile: string, toFile: string): string {
    if (!this.config.useRelativeImports) {
      // Use absolute imports
      return this.stripProtoExtension(toFile);
    }

    // Calculate relative path
    const fromParts = fromFile.split('/');
    const toParts = toFile.split('/');

    // Remove file names
    fromParts.pop();
    const toFileName = toParts.pop()!;

    // Find common path
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
    } else if (downPath.length === 0) {
      relativePath = './';
    }

    if (downPath.length > 0) {
      relativePath += `${downPath.join('/')}/`;
    }

    return relativePath + this.stripProtoExtension(toFileName);
  }

  /**
   * Strip .proto extension and add TypeScript extension
   */
  private stripProtoExtension(fileName: string): string {
    const base = fileName.replace(/\.proto$/, '');
    return base + (this.config.fileExtension || '');
  }

  /**
   * Extract package name from file path
   */
  private extractPackageFromPath(path: string): string {
    const parts = path.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.replace(/\.(proto|ts|js)$/, '');
  }

  /**
   * Get all types defined in a file
   */
  public getFileTypes(fileName: string): TypeRegistryEntry[] {
    return Array.from(this.typeRegistry.values()).filter(entry => entry.file.fileName === fileName);
  }

  /**
   * Check if a type is defined locally in a file
   */
  public isLocalType(typeName: string, fileName: string): boolean {
    const file = this.fileRegistry.get(fileName);
    if (!file) {
      return false;
    }

    const typeRef = this.resolveType(typeName, file.package);
    return typeRef !== null && typeRef.sourceFile === fileName;
  }

  /**
   * Get dependency graph for analysis
   */
  public getDependencyGraph(): Map<string, Set<string>> {
    return new Map(this.dependencyGraph);
  }

  /**
   * Clear all registries
   */
  public clear(): void {
    this.typeRegistry.clear();
    this.fileRegistry.clear();
    this.dependencyGraph.clear();
  }
}

/**
 * Create a default ImportResolver instance
 */
export function createImportResolver(
  config?: ImportResolverConfig,
  nameResolver?: NameResolver,
  typeMapper?: TypeMapper,
): ImportResolver {
  return new ImportResolver(config, nameResolver, typeMapper);
}
