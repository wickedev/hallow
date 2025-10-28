/**
 * ImportManager - Manages import statements for generated TypeScript code
 *
 * This class handles the collection, deduplication, and generation of
 * import statements for the generated TypeScript code.
 */

import { ImportDependency } from './ImportResolver';

/**
 * Import type enumeration
 */
export enum ImportType {
  Named = 'named',
  Default = 'default',
  Namespace = 'namespace',
  Type = 'type',
  SideEffect = 'side-effect',
}

/**
 * Import statement information
 */
export interface ImportInfo {
  /**
   * Source module to import from
   */
  source: string;

  /**
   * Type of import
   */
  type: ImportType;

  /**
   * Names to import (for named imports)
   */
  names?: string[];

  /**
   * Default import name
   */
  defaultName?: string;

  /**
   * Namespace import name
   */
  namespaceName?: string;

  /**
   * Whether this is a type-only import
   */
  typeOnly?: boolean;
}

/**
 * Import grouping configuration
 */
export interface ImportGroupConfig {
  /**
   * Group imports by category
   */
  groupByCategory?: boolean;

  /**
   * Sort imports alphabetically
   */
  sortAlphabetically?: boolean;

  /**
   * Add blank lines between groups
   */
  addBlankLinesBetweenGroups?: boolean;

  /**
   * Custom import order
   */
  customOrder?: string[];
}

/**
 * ImportManager class for managing TypeScript imports
 */
export class ImportManager {
  private imports: Map<string, ImportInfo>;
  private typeImports: Map<string, Set<string>>;
  private regularImports: Map<string, Set<string>>;
  private defaultImports: Map<string, string>;
  private namespaceImports: Map<string, string>;
  private sideEffectImports: Set<string>;
  private config: ImportGroupConfig;

  constructor(config: ImportGroupConfig = {}) {
    this.imports = new Map();
    this.typeImports = new Map();
    this.regularImports = new Map();
    this.defaultImports = new Map();
    this.namespaceImports = new Map();
    this.sideEffectImports = new Set();
    this.config = {
      groupByCategory: true,
      sortAlphabetically: true,
      addBlankLinesBetweenGroups: true,
      ...config,
    };
  }

  /**
   * Add a named import
   */
  public addNamedImport(source: string, name: string, typeOnly: boolean = false): void {
    const targetMap = typeOnly ? this.typeImports : this.regularImports;

    if (!targetMap.has(source)) {
      targetMap.set(source, new Set());
    }

    targetMap.get(source)!.add(name);
  }

  /**
   * Add multiple named imports
   */
  public addNamedImports(source: string, names: string[], typeOnly: boolean = false): void {
    names.forEach(name => this.addNamedImport(source, name, typeOnly));
  }

  /**
   * Add a default import
   */
  public addDefaultImport(source: string, name: string): void {
    if (this.defaultImports.has(source)) {
      console.warn(`Default import from "${source}" already exists, overwriting with "${name}"`);
    }
    this.defaultImports.set(source, name);
  }

  /**
   * Add a namespace import
   */
  public addNamespaceImport(source: string, name: string): void {
    if (this.namespaceImports.has(source)) {
      console.warn(`Namespace import from "${source}" already exists, overwriting with "${name}"`);
    }
    this.namespaceImports.set(source, name);
  }

  /**
   * Add a side-effect import
   */
  public addSideEffectImport(source: string): void {
    this.sideEffectImports.add(source);
  }

  /**
   * Add common gRPC and protobuf imports
   */
  public addGrpcImports(): void {
    this.addNamedImports('@improbable-eng/grpc-web', [
      'grpc',
      'Code',
      'Metadata',
      'Request',
      'UnaryOutput',
    ]);

    this.addNamespaceImport('google-protobuf', 'pb');
  }

  /**
   * Add React imports
   */
  public addReactImports(hooks: string[] = []): void {
    const defaultHooks = ['useState', 'useEffect', 'useCallback', 'useMemo'];
    const allHooks = [...new Set([...defaultHooks, ...hooks])];

    this.addNamedImports('react', allHooks);
  }

  /**
   * Add React Suspense imports
   */
  public addSuspenseImports(): void {
    this.addNamedImports('react', ['Suspense', 'use']);
  }

  /**
   * Generate import statements
   */
  public generateImports(): string {
    const importGroups: string[][] = [];

    // Side-effect imports
    if (this.sideEffectImports.size > 0) {
      const sideEffects = Array.from(this.sideEffectImports)
        .sort()
        .map(source => `import '${source}';`);
      importGroups.push(sideEffects);
    }

    // External package imports
    const externalImports = this.generateImportGroup(source => this.isExternalPackage(source));
    if (externalImports.length > 0) {
      importGroups.push(externalImports);
    }

    // Internal/relative imports
    const internalImports = this.generateImportGroup(source => !this.isExternalPackage(source));
    if (internalImports.length > 0) {
      importGroups.push(internalImports);
    }

    // Join groups with blank lines if configured
    const separator = this.config.addBlankLinesBetweenGroups ? '\n\n' : '\n';
    return importGroups.map(group => group.join('\n')).join(separator);
  }

  /**
   * Generate a group of imports based on a filter
   */
  private generateImportGroup(filter: (source: string) => boolean): string[] {
    const imports: string[] = [];
    const processedSources = new Set<string>();

    // Process regular named imports
    this.regularImports.forEach((names, source) => {
      if (filter(source) && !processedSources.has(source)) {
        const defaultImport = this.defaultImports.get(source);
        const namespaceImport = this.namespaceImports.get(source);

        const importStr = this.buildImportStatement(
          source,
          Array.from(names),
          defaultImport,
          namespaceImport,
          false,
        );

        imports.push(importStr);
        processedSources.add(source);
      }
    });

    // Process type-only imports
    this.typeImports.forEach((names, source) => {
      if (filter(source) && !processedSources.has(source)) {
        const importStr = this.buildImportStatement(
          source,
          Array.from(names),
          undefined,
          undefined,
          true,
        );

        imports.push(importStr);
        processedSources.add(source);
      }
    });

    // Process standalone default imports
    this.defaultImports.forEach((name, source) => {
      if (filter(source) && !processedSources.has(source)) {
        imports.push(`import ${name} from '${source}';`);
        processedSources.add(source);
      }
    });

    // Process standalone namespace imports
    this.namespaceImports.forEach((name, source) => {
      if (filter(source) && !processedSources.has(source)) {
        imports.push(`import * as ${name} from '${source}';`);
        processedSources.add(source);
      }
    });

    // Sort if configured
    if (this.config.sortAlphabetically) {
      imports.sort();
    }

    return imports;
  }

  /**
   * Build an import statement
   */
  private buildImportStatement(
    source: string,
    names: string[],
    defaultName?: string,
    namespaceName?: string,
    typeOnly: boolean = false,
  ): string {
    const parts: string[] = [];

    if (typeOnly) {
      parts.push('import type');
    } else {
      parts.push('import');
    }

    const importParts: string[] = [];

    if (defaultName) {
      importParts.push(defaultName);
    }

    if (namespaceName) {
      importParts.push(`* as ${namespaceName}`);
    }

    if (names.length > 0) {
      const sortedNames = this.config.sortAlphabetically ? names.sort() : names;
      if (defaultName || namespaceName) {
        importParts.push(`{ ${sortedNames.join(', ')} }`);
      } else {
        importParts.push(`{ ${sortedNames.join(', ')} }`);
      }
    }

    parts.push(importParts.join(', '));
    parts.push(`from '${source}'`);

    return `${parts.join(' ')};`;
  }

  /**
   * Check if a source is an external package
   */
  private isExternalPackage(source: string): boolean {
    // Relative paths start with './' or '../'
    if (source.startsWith('./') || source.startsWith('../')) {
      return false;
    }

    // Absolute paths start with '/'
    if (source.startsWith('/')) {
      return false;
    }

    // Alias paths might start with '@' but not be packages
    // This is a simple heuristic; might need refinement
    if (source.startsWith('@/') || source.startsWith('~/')) {
      return false;
    }

    // Everything else is considered an external package
    return true;
  }

  /**
   * Clear all imports
   */
  public clear(): void {
    this.imports.clear();
    this.typeImports.clear();
    this.regularImports.clear();
    this.defaultImports.clear();
    this.namespaceImports.clear();
    this.sideEffectImports.clear();
  }

  /**
   * Check if any imports have been added
   */
  public hasImports(): boolean {
    return (
      this.typeImports.size > 0 ||
      this.regularImports.size > 0 ||
      this.defaultImports.size > 0 ||
      this.namespaceImports.size > 0 ||
      this.sideEffectImports.size > 0
    );
  }

  /**
   * Get the count of imports
   */
  public getImportCount(): number {
    let count = 0;
    count += this.typeImports.size;
    count += this.regularImports.size;
    count += this.defaultImports.size;
    count += this.namespaceImports.size;
    count += this.sideEffectImports.size;
    return count;
  }

  /**
   * Merge another ImportManager's imports into this one
   */
  public merge(other: ImportManager): void {
    // Merge type imports
    other.typeImports.forEach((names, source) => {
      names.forEach(name => this.addNamedImport(source, name, true));
    });

    // Merge regular imports
    other.regularImports.forEach((names, source) => {
      names.forEach(name => this.addNamedImport(source, name, false));
    });

    // Merge default imports
    other.defaultImports.forEach((name, source) => {
      this.addDefaultImport(source, name);
    });

    // Merge namespace imports
    other.namespaceImports.forEach((name, source) => {
      this.addNamespaceImport(source, name);
    });

    // Merge side-effect imports
    other.sideEffectImports.forEach(source => {
      this.addSideEffectImport(source);
    });
  }

  /**
   * Create a clone of this ImportManager
   */
  public clone(): ImportManager {
    const cloned = new ImportManager(this.config);
    cloned.merge(this);
    return cloned;
  }

  /**
   * Add imports from ImportResolver dependencies
   */
  public addFromDependencies(dependencies: ImportDependency[]): void {
    dependencies.forEach(dep => {
      if (dep.useNamespace && dep.namespaceName) {
        // Add namespace import
        this.addNamespaceImport(dep.source, dep.namespaceName);
      } else {
        // Add named imports
        dep.types.forEach(type => {
          this.addNamedImport(dep.source, type, false);
        });
      }
    });
  }

  /**
   * Add protobuf message imports
   */
  public addProtobufMessageImports(messages: string[], source: string = './messages'): void {
    messages.forEach(message => {
      this.addNamedImport(source, message, false);
    });
  }

  /**
   * Add cross-file proto imports
   */
  public addCrossFileImport(typeName: string, fromFile: string, isTypeOnly: boolean = false): void {
    const importPath = fromFile.replace(/\.proto$/, '');
    this.addNamedImport(importPath, typeName, isTypeOnly);
  }

  /**
   * Add well-known protobuf type imports
   */
  public addWellKnownTypeImport(typeName: string, importPath: string): void {
    this.addNamedImport(importPath, typeName, false);
  }

  /**
   * Generate organized imports for proto-generated code
   */
  public generateProtoImports(): string {
    const importGroups: string[][] = [];

    // Side-effect imports
    if (this.sideEffectImports.size > 0) {
      const sideEffects = Array.from(this.sideEffectImports)
        .sort()
        .map(source => `import '${source}';`);
      importGroups.push(sideEffects);
    }

    // google-protobuf and grpc-web imports (external)
    const coreImports = this.generateImportGroup(
      source =>
        source.startsWith('google-protobuf') || source.startsWith('@improbable-eng/grpc-web'),
    );
    if (coreImports.length > 0) {
      importGroups.push(coreImports);
    }

    // Other external package imports
    const externalImports = this.generateImportGroup(
      source =>
        this.isExternalPackage(source) &&
        !source.startsWith('google-protobuf') &&
        !source.startsWith('@improbable-eng/grpc-web'),
    );
    if (externalImports.length > 0) {
      importGroups.push(externalImports);
    }

    // Internal/relative imports
    const internalImports = this.generateImportGroup(source => !this.isExternalPackage(source));
    if (internalImports.length > 0) {
      importGroups.push(internalImports);
    }

    // Join groups with blank lines if configured
    const separator = this.config.addBlankLinesBetweenGroups ? '\n\n' : '\n';
    return importGroups.map(group => group.join('\n')).join(separator);
  }

  /**
   * Check if imports include a specific type
   */
  public hasType(typeName: string): boolean {
    // Check in regular imports
    for (const types of this.regularImports.values()) {
      if (types.has(typeName)) {
        return true;
      }
    }

    // Check in type imports
    for (const types of this.typeImports.values()) {
      if (types.has(typeName)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get the source for a specific type
   */
  public getTypeSource(typeName: string): string | null {
    // Check in regular imports
    for (const [source, types] of this.regularImports.entries()) {
      if (types.has(typeName)) {
        return source;
      }
    }

    // Check in type imports
    for (const [source, types] of this.typeImports.entries()) {
      if (types.has(typeName)) {
        return source;
      }
    }

    return null;
  }

  /**
   * Get all collected imports grouped by source
   * Returns a structured view of all imports for inspection or manipulation
   */
  public getImports(): {
    regular: Map<string, string[]>;
    types: Map<string, string[]>;
    defaults: Map<string, string>;
    namespaces: Map<string, string>;
    sideEffects: string[];
  } {
    return {
      regular: new Map(
        Array.from(this.regularImports.entries()).map(([source, names]) => [
          source,
          Array.from(names),
        ])
      ),
      types: new Map(
        Array.from(this.typeImports.entries()).map(([source, names]) => [
          source,
          Array.from(names),
        ])
      ),
      defaults: new Map(this.defaultImports),
      namespaces: new Map(this.namespaceImports),
      sideEffects: Array.from(this.sideEffectImports),
    };
  }

  /**
   * Get import statement for a specific source
   * Builds a formatted import statement string for the given source
   */
  public getImportStatement(source: string): string | null {
    const regularNames = this.regularImports.get(source);
    const typeNames = this.typeImports.get(source);
    const defaultName = this.defaultImports.get(source);
    const namespaceName = this.namespaceImports.get(source);

    // If no imports from this source, return null
    if (!regularNames && !typeNames && !defaultName && !namespaceName) {
      return null;
    }

    const statements: string[] = [];

    // Build regular import statement if exists
    if (regularNames || defaultName || namespaceName) {
      const stmt = this.buildImportStatement(
        source,
        regularNames ? Array.from(regularNames) : [],
        defaultName,
        namespaceName,
        false
      );
      statements.push(stmt);
    }

    // Build type-only import statement if exists
    if (typeNames) {
      const stmt = this.buildImportStatement(
        source,
        Array.from(typeNames),
        undefined,
        undefined,
        true
      );
      statements.push(stmt);
    }

    return statements.join('\n');
  }

  /**
   * Optimize imports by consolidating and removing duplicates
   * This method can be called before generating final imports to ensure
   * the most efficient import statements
   */
  public optimizeImports(): void {
    // Remove empty import sets
    for (const [source, names] of this.regularImports.entries()) {
      if (names.size === 0) {
        this.regularImports.delete(source);
      }
    }

    for (const [source, names] of this.typeImports.entries()) {
      if (names.size === 0) {
        this.typeImports.delete(source);
      }
    }

    // Merge duplicate types between regular and type imports
    // If a type appears in both, keep it in regular imports
    for (const [source, typeNames] of this.typeImports.entries()) {
      const regularNames = this.regularImports.get(source);
      if (regularNames) {
        for (const typeName of typeNames) {
          if (regularNames.has(typeName)) {
            // Remove from type imports since it's already in regular imports
            typeNames.delete(typeName);
          }
        }

        // If type imports is now empty, remove it
        if (typeNames.size === 0) {
          this.typeImports.delete(source);
        }
      }
    }

    // Sort names within each import for consistency
    for (const [source, names] of this.regularImports.entries()) {
      const sorted = Array.from(names).sort();
      this.regularImports.set(source, new Set(sorted));
    }

    for (const [source, names] of this.typeImports.entries()) {
      const sorted = Array.from(names).sort();
      this.typeImports.set(source, new Set(sorted));
    }
  }

  /**
   * Get all sources that have imports
   */
  public getAllSources(): string[] {
    const sources = new Set<string>();

    this.regularImports.forEach((_, source) => sources.add(source));
    this.typeImports.forEach((_, source) => sources.add(source));
    this.defaultImports.forEach((_, source) => sources.add(source));
    this.namespaceImports.forEach((_, source) => sources.add(source));
    this.sideEffectImports.forEach(source => sources.add(source));

    return Array.from(sources).sort();
  }

  /**
   * Remove all imports from a specific source
   */
  public removeSource(source: string): void {
    this.regularImports.delete(source);
    this.typeImports.delete(source);
    this.defaultImports.delete(source);
    this.namespaceImports.delete(source);
    this.sideEffectImports.delete(source);
  }

  /**
   * Check if imports are empty
   */
  public isEmpty(): boolean {
    return !this.hasImports();
  }

  /**
   * Convert imports to JSON for serialization
   */
  public toJSON(): {
    regular: Record<string, string[]>;
    types: Record<string, string[]>;
    defaults: Record<string, string>;
    namespaces: Record<string, string>;
    sideEffects: string[];
  } {
    const imports = this.getImports();

    return {
      regular: Object.fromEntries(imports.regular),
      types: Object.fromEntries(imports.types),
      defaults: Object.fromEntries(imports.defaults),
      namespaces: Object.fromEntries(imports.namespaces),
      sideEffects: imports.sideEffects,
    };
  }

  /**
   * Load imports from JSON
   */
  public fromJSON(json: {
    regular?: Record<string, string[]>;
    types?: Record<string, string[]>;
    defaults?: Record<string, string>;
    namespaces?: Record<string, string>;
    sideEffects?: string[];
  }): void {
    this.clear();

    if (json.regular) {
      Object.entries(json.regular).forEach(([source, names]) => {
        names.forEach(name => this.addNamedImport(source, name, false));
      });
    }

    if (json.types) {
      Object.entries(json.types).forEach(([source, names]) => {
        names.forEach(name => this.addNamedImport(source, name, true));
      });
    }

    if (json.defaults) {
      Object.entries(json.defaults).forEach(([source, name]) => {
        this.addDefaultImport(source, name);
      });
    }

    if (json.namespaces) {
      Object.entries(json.namespaces).forEach(([source, name]) => {
        this.addNamespaceImport(source, name);
      });
    }

    if (json.sideEffects) {
      json.sideEffects.forEach(source => {
        this.addSideEffectImport(source);
      });
    }
  }
}

/**
 * Create a default ImportManager instance
 */
export function createImportManager(config?: ImportGroupConfig): ImportManager {
  return new ImportManager(config);
}
