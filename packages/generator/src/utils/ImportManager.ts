/**
 * ImportManager - Manages import statements for generated TypeScript code
 * 
 * This class handles the collection, deduplication, and generation of
 * import statements for the generated TypeScript code.
 */

/**
 * Import type enumeration
 */
export enum ImportType {
  Named = 'named',
  Default = 'default',
  Namespace = 'namespace',
  Type = 'type',
  SideEffect = 'side-effect'
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
      ...config
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
      'UnaryOutput'
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
    const externalImports = this.generateImportGroup(
      source => this.isExternalPackage(source)
    );
    if (externalImports.length > 0) {
      importGroups.push(externalImports);
    }
    
    // Internal/relative imports
    const internalImports = this.generateImportGroup(
      source => !this.isExternalPackage(source)
    );
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
        
        let importStr = this.buildImportStatement(
          source,
          Array.from(names),
          defaultImport,
          namespaceImport,
          false
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
          true
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
    typeOnly: boolean = false
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
    
    return parts.join(' ') + ';';
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
}

/**
 * Create a default ImportManager instance
 */
export function createImportManager(config?: ImportGroupConfig): ImportManager {
  return new ImportManager(config);
}