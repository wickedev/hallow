/**
 * ImportOptimizer - Optimizes import statements for better tree-shaking
 * 
 * This class analyzes and optimizes import statements to reduce bundle size
 * and improve tree-shaking effectiveness.
 */

import { ImportManager } from '../utils/ImportManager';

/**
 * Import optimization options
 */
export interface ImportOptimizationOptions {
  /**
   * Use named imports instead of namespace imports
   */
  preferNamedImports?: boolean;
  
  /**
   * Combine imports from the same source
   */
  combineImports?: boolean;
  
  /**
   * Remove unused imports
   */
  removeUnused?: boolean;
  
  /**
   * Sort imports alphabetically
   */
  sortImports?: boolean;
  
  /**
   * Group imports by type (external, internal, etc.)
   */
  groupImports?: boolean;
  
  /**
   * Use dynamic imports for code splitting
   */
  useDynamicImports?: boolean;
  
  /**
   * Analyze usage to determine which imports are needed
   */
  analyzeUsage?: boolean;
  
  /**
   * Prefer tree-shakeable imports
   */
  treeShakeableImports?: boolean;
}

/**
 * Import usage analysis result
 */
export interface ImportUsageAnalysis {
  /**
   * Used named imports per source
   */
  usedImports: Map<string, Set<string>>;
  
  /**
   * Unused imports that can be removed
   */
  unusedImports: Map<string, Set<string>>;
  
  /**
   * Namespace imports that could be converted to named
   */
  namespaceImports: Map<string, string>;
  
  /**
   * Side-effect imports
   */
  sideEffectImports: Set<string>;
  
  /**
   * Potential dynamic import candidates
   */
  dynamicImportCandidates: Set<string>;
}

/**
 * ImportOptimizer class
 */
export class ImportOptimizer {
  private options: Required<ImportOptimizationOptions>;
  
  constructor(options: ImportOptimizationOptions = {}) {
    this.options = {
      preferNamedImports: options.preferNamedImports ?? true,
      combineImports: options.combineImports ?? true,
      removeUnused: options.removeUnused ?? true,
      sortImports: options.sortImports ?? true,
      groupImports: options.groupImports ?? true,
      useDynamicImports: options.useDynamicImports ?? false,
      analyzeUsage: options.analyzeUsage ?? true,
      treeShakeableImports: options.treeShakeableImports ?? true,
    };
  }
  
  /**
   * Optimize imports in code
   */
  public optimizeImports(code: string): string {
    // Parse existing imports
    const imports = this.parseImports(code);
    
    // Analyze usage if enabled
    let usageAnalysis: ImportUsageAnalysis | undefined;
    if (this.options.analyzeUsage) {
      usageAnalysis = this.analyzeImportUsage(code, imports);
    }
    
    // Apply optimizations
    let optimizedImports = imports;
    
    if (this.options.removeUnused && usageAnalysis) {
      optimizedImports = this.removeUnusedImports(optimizedImports, usageAnalysis);
    }
    
    if (this.options.preferNamedImports) {
      optimizedImports = this.convertToNamedImports(optimizedImports, code);
    }
    
    if (this.options.combineImports) {
      optimizedImports = this.combineImportsFromSameSource(optimizedImports);
    }
    
    if (this.options.treeShakeableImports) {
      optimizedImports = this.makeTreeShakeable(optimizedImports);
    }
    
    // Generate optimized import statements
    const importStatements = this.generateImportStatements(optimizedImports);
    
    // Replace imports in code
    return this.replaceImports(code, importStatements);
  }
  
  /**
   * Parse imports from code
   */
  private parseImports(code: string): Map<string, ImportData> {
    const imports = new Map<string, ImportData>();
    
    // Match various import patterns
    const patterns = [
      // Named imports: import { a, b } from 'source'
      /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/g,
      // Default import: import name from 'source'
      /import\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g,
      // Namespace import: import * as name from 'source'
      /import\s*\*\s*as\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g,
      // Side effect: import 'source'
      /import\s*['"]([^'"]+)['"]/g,
      // Type imports: import type { a } from 'source'
      /import\s+type\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/g,
    ];
    
    patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.source, pattern.flags);
      
      while ((match = regex.exec(code)) !== null) {
        const source = match[match.length - 1] || match[2];
        
        if (!imports.has(source)) {
          imports.set(source, {
            source,
            named: new Set(),
            default: undefined,
            namespace: undefined,
            typeOnly: false,
            sideEffect: false,
          });
        }
        
        const importData = imports.get(source)!;
        
        // Determine import type
        if (pattern.source.includes('\\*\\s*as')) {
          // Namespace import
          importData.namespace = match[1];
        } else if (pattern.source.includes('{')) {
          // Named or type imports
          const names = match[1].split(',').map(s => s.trim());
          names.forEach(name => importData.named.add(name));
          
          if (pattern.source.includes('type')) {
            importData.typeOnly = true;
          }
        } else if (match.length === 2) {
          // Side effect import
          importData.sideEffect = true;
        } else {
          // Default import
          importData.default = match[1];
        }
      }
    });
    
    return imports;
  }
  
  /**
   * Analyze import usage in code
   */
  private analyzeImportUsage(
    code: string,
    imports: Map<string, ImportData>,
  ): ImportUsageAnalysis {
    const usedImports = new Map<string, Set<string>>();
    const unusedImports = new Map<string, Set<string>>();
    const namespaceImports = new Map<string, string>();
    const sideEffectImports = new Set<string>();
    const dynamicImportCandidates = new Set<string>();
    
    // Remove import statements from code for usage analysis
    const codeWithoutImports = code.replace(/^import\s+.*$/gm, '');
    
    imports.forEach((importData, source) => {
      const used = new Set<string>();
      const unused = new Set<string>();
      
      // Check named imports
      importData.named.forEach(name => {
        // Check if the import is used in the code
        const usagePattern = new RegExp(`\\b${name}\\b`, 'g');
        if (usagePattern.test(codeWithoutImports)) {
          used.add(name);
        } else {
          unused.add(name);
        }
      });
      
      // Check default import
      if (importData.default) {
        const usagePattern = new RegExp(`\\b${importData.default}\\b`, 'g');
        if (!usagePattern.test(codeWithoutImports)) {
          unused.add(importData.default);
        }
      }
      
      // Check namespace import
      if (importData.namespace) {
        namespaceImports.set(source, importData.namespace);
        
        // Check if namespace is used
        const usagePattern = new RegExp(`\\b${importData.namespace}\\b`, 'g');
        if (!usagePattern.test(codeWithoutImports)) {
          // Namespace not used at all
          unused.add(importData.namespace);
        }
      }
      
      // Track side-effect imports
      if (importData.sideEffect) {
        sideEffectImports.add(source);
      }
      
      // Identify dynamic import candidates (large libraries, conditionally used)
      if (this.isDynamicImportCandidate(source, codeWithoutImports)) {
        dynamicImportCandidates.add(source);
      }
      
      if (used.size > 0) {
        usedImports.set(source, used);
      }
      
      if (unused.size > 0) {
        unusedImports.set(source, unused);
      }
    });
    
    return {
      usedImports,
      unusedImports,
      namespaceImports,
      sideEffectImports,
      dynamicImportCandidates,
    };
  }
  
  /**
   * Check if an import is a candidate for dynamic import
   */
  private isDynamicImportCandidate(source: string, code: string): boolean {
    // Large libraries that might benefit from code splitting
    const largeLibraries = [
      'lodash',
      'moment',
      'd3',
      'chart.js',
      'react-select',
      'react-table',
    ];
    
    if (largeLibraries.some(lib => source.includes(lib))) {
      // Check if it's used conditionally
      const conditionalPatterns = [
        /if\s*\([^)]*\)\s*{[^}]*import/,
        /async\s+function[^{]*{[^}]*import/,
        /\.then\s*\([^)]*import/,
      ];
      
      return conditionalPatterns.some(pattern => pattern.test(code));
    }
    
    return false;
  }
  
  /**
   * Remove unused imports
   */
  private removeUnusedImports(
    imports: Map<string, ImportData>,
    usageAnalysis: ImportUsageAnalysis,
  ): Map<string, ImportData> {
    const optimized = new Map<string, ImportData>();
    
    imports.forEach((importData, source) => {
      const unused = usageAnalysis.unusedImports.get(source);
      
      if (unused && unused.size === importData.named.size && 
          (!importData.default || unused.has(importData.default)) &&
          (!importData.namespace || unused.has(importData.namespace))) {
        // All imports from this source are unused, skip it
        return;
      }
      
      // Remove unused named imports
      const filteredData = { ...importData };
      if (unused) {
        filteredData.named = new Set(
          Array.from(importData.named).filter(name => !unused.has(name)),
        );
        
        if (importData.default && unused.has(importData.default)) {
          filteredData.default = undefined;
        }
        
        if (importData.namespace && unused.has(importData.namespace)) {
          filteredData.namespace = undefined;
        }
      }
      
      optimized.set(source, filteredData);
    });
    
    return optimized;
  }
  
  /**
   * Convert namespace imports to named imports
   */
  private convertToNamedImports(
    imports: Map<string, ImportData>,
    code: string,
  ): Map<string, ImportData> {
    const optimized = new Map<string, ImportData>();
    
    imports.forEach((importData, source) => {
      if (importData.namespace) {
        // Find all usages of the namespace
        const namespaceRegex = new RegExp(`${importData.namespace}\\.(\\w+)`, 'g');
        const usedMembers = new Set<string>();
        
        let match;
        while ((match = namespaceRegex.exec(code)) !== null) {
          usedMembers.add(match[1]);
        }
        
        if (usedMembers.size > 0 && usedMembers.size < 10) {
          // Convert to named imports if not too many members
          const newData = { ...importData };
          usedMembers.forEach(member => newData.named.add(member));
          newData.namespace = undefined;
          
          optimized.set(source, newData);
        } else {
          optimized.set(source, importData);
        }
      } else {
        optimized.set(source, importData);
      }
    });
    
    return optimized;
  }
  
  /**
   * Combine imports from the same source
   */
  private combineImportsFromSameSource(
    imports: Map<string, ImportData>,
  ): Map<string, ImportData> {
    // Imports are already combined by source in our data structure
    return imports;
  }
  
  /**
   * Make imports tree-shakeable
   */
  private makeTreeShakeable(imports: Map<string, ImportData>): Map<string, ImportData> {
    const optimized = new Map<string, ImportData>();
    
    imports.forEach((importData, source) => {
      const newData = { ...importData };
      
      // Prefer named imports over namespace imports for tree-shaking
      if (newData.namespace && newData.named.size > 0) {
        // If we have both, prefer named imports
        newData.namespace = undefined;
      }
      
      optimized.set(source, newData);
    });
    
    return optimized;
  }
  
  /**
   * Generate import statements from import data
   */
  private generateImportStatements(imports: Map<string, ImportData>): string[] {
    const statements: string[] = [];
    
    // Group imports if enabled
    const groups = this.options.groupImports 
      ? this.groupImportsByType(imports)
      : [Array.from(imports.entries())];
    
    groups.forEach((group, index) => {
      // Sort within group if enabled
      if (this.options.sortImports) {
        group.sort((a, b) => a[0].localeCompare(b[0]));
      }
      
      group.forEach(([source, data]) => {
        const statement = this.generateImportStatement(source, data);
        if (statement) {
          statements.push(statement);
        }
      });
      
      // Add blank line between groups
      if (index < groups.length - 1 && group.length > 0) {
        statements.push('');
      }
    });
    
    return statements;
  }
  
  /**
   * Group imports by type
   */
  private groupImportsByType(
    imports: Map<string, ImportData>,
  ): Array<Array<[string, ImportData]>> {
    const sideEffects: Array<[string, ImportData]> = [];
    const external: Array<[string, ImportData]> = [];
    const internal: Array<[string, ImportData]> = [];
    const types: Array<[string, ImportData]> = [];
    
    imports.forEach((data, source) => {
      const entry: [string, ImportData] = [source, data];
      
      if (data.sideEffect) {
        sideEffects.push(entry);
      } else if (data.typeOnly) {
        types.push(entry);
      } else if (this.isExternalPackage(source)) {
        external.push(entry);
      } else {
        internal.push(entry);
      }
    });
    
    return [sideEffects, external, internal, types].filter(group => group.length > 0);
  }
  
  /**
   * Check if source is an external package
   */
  private isExternalPackage(source: string): boolean {
    return !source.startsWith('.') && !source.startsWith('/');
  }
  
  /**
   * Generate a single import statement
   */
  private generateImportStatement(source: string, data: ImportData): string {
    if (data.sideEffect) {
      return `import '${source}';`;
    }
    
    const parts: string[] = [];
    
    if (data.typeOnly) {
      parts.push('import type');
    } else {
      parts.push('import');
    }
    
    const importParts: string[] = [];
    
    if (data.default) {
      importParts.push(data.default);
    }
    
    if (data.namespace) {
      if (importParts.length > 0) {
        importParts.push(`, * as ${data.namespace}`);
      } else {
        importParts.push(`* as ${data.namespace}`);
      }
    }
    
    if (data.named.size > 0) {
      const namedImports = Array.from(data.named).sort();
      if (data.default || data.namespace) {
        importParts.push(`, { ${namedImports.join(', ')} }`);
      } else {
        importParts.push(`{ ${namedImports.join(', ')} }`);
      }
    }
    
    if (importParts.length > 0) {
      parts.push(importParts.join(''));
    }
    
    parts.push(`from '${source}';`);
    
    return parts.join(' ');
  }
  
  /**
   * Replace imports in code
   */
  private replaceImports(code: string, importStatements: string[]): string {
    // Remove existing imports
    const codeWithoutImports = code.replace(/^import\s+.*$/gm, '');
    
    // Find the position after any initial comments or directives
    const directivePattern = /^(?:\/\/.*|\/\*[\s\S]*?\*\/|'use strict';?)\s*$/gm;
    let insertPosition = 0;
    let match;
    
    while ((match = directivePattern.exec(codeWithoutImports)) !== null) {
      insertPosition = match.index + match[0].length;
    }
    
    // Insert optimized imports
    const beforeImports = codeWithoutImports.substring(0, insertPosition);
    const afterImports = codeWithoutImports.substring(insertPosition).trimStart();
    
    return [
      beforeImports,
      importStatements.join('\n'),
      '',
      afterImports,
    ].filter(Boolean).join('\n');
  }
  
  /**
   * Generate dynamic import wrapper
   */
  public generateDynamicImport(source: string, names: string[]): string {
    return `
const ${names[0]} = await (async () => {
  const module = await import('${source}');
  return ${names.map(n => `module.${n}`).join(', ')};
})();`;
  }
  
  /**
   * Convert static imports to dynamic imports for code splitting
   */
  public convertToDynamicImports(
    code: string,
    candidates: Set<string>,
  ): string {
    let optimized = code;
    
    candidates.forEach(source => {
      // Find the import statement
      const importRegex = new RegExp(
        `import\\s+(?:{([^}]+)}|([\\w]+))\\s+from\\s+['"]${source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?`,
        'g',
      );
      
      optimized = optimized.replace(importRegex, (match, named, defaultImport) => {
        if (named) {
          const names = named.split(',').map((s: string) => s.trim());
          return this.generateDynamicImport(source, names);
        } else if (defaultImport) {
          return this.generateDynamicImport(source, [defaultImport]);
        }
        return match;
      });
    });
    
    return optimized;
  }
}

/**
 * Import data structure
 */
interface ImportData {
  source: string;
  named: Set<string>;
  default?: string;
  namespace?: string;
  typeOnly: boolean;
  sideEffect: boolean;
}

/**
 * Create an import optimizer instance
 */
export function createImportOptimizer(options?: ImportOptimizationOptions): ImportOptimizer {
  return new ImportOptimizer(options);
}