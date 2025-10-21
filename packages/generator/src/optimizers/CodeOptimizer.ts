/**
 * CodeOptimizer - Handles code optimization, tree-shaking, and minification
 * 
 * This class provides various optimization strategies to reduce bundle size
 * and improve runtime performance of generated code.
 */

import { GeneratedFile } from '../core/types';
import { ProtoFile, ServiceDefinition, MessageDefinition } from '../core/proto-types';

/**
 * Optimization options
 */
export interface OptimizationOptions {
  /**
   * Enable dead code elimination
   */
  deadCodeElimination?: boolean;
  
  /**
   * Enable tree-shaking optimizations
   */
  treeShaking?: boolean;
  
  /**
   * Enable minification for production builds
   */
  minify?: boolean;
  
  /**
   * Remove JSDoc comments in production
   */
  removeComments?: boolean;
  
  /**
   * Inline small functions for better performance
   */
  inlineFunctions?: boolean;
  
  /**
   * Collapse duplicate code patterns
   */
  collapseDuplicates?: boolean;
  
  /**
   * Generate ES modules for better tree-shaking
   */
  esModules?: boolean;
  
  /**
   * Optimize import statements
   */
  optimizeImports?: boolean;
  
  /**
   * Use production mode optimizations
   */
  production?: boolean;
  
  /**
   * Conditional generation based on usage
   */
  conditionalGeneration?: boolean;
  
  /**
   * Track which methods/types are actually used
   */
  usageTracking?: UsageTrackingOptions;
  
  /**
   * Bundle size target in KB (triggers aggressive optimizations)
   */
  bundleSizeTarget?: number;
  
  /**
   * Generate separate chunks for code splitting
   */
  codeSplitting?: boolean;
  
  /**
   * Lazy load unused services
   */
  lazyLoading?: boolean;
}

/**
 * Usage tracking options for conditional generation
 */
export interface UsageTrackingOptions {
  /**
   * Track which services are used
   */
  usedServices?: Set<string>;
  
  /**
   * Track which methods are used
   */
  usedMethods?: Map<string, Set<string>>;
  
  /**
   * Track which message types are used
   */
  usedMessages?: Set<string>;
  
  /**
   * Track which enums are used
   */
  usedEnums?: Set<string>;
  
  /**
   * Analyze imports to detect usage
   */
  analyzeImports?: boolean;
}

/**
 * Optimization result metrics
 */
export interface OptimizationMetrics {
  /**
   * Original size in bytes
   */
  originalSize: number;
  
  /**
   * Optimized size in bytes
   */
  optimizedSize: number;
  
  /**
   * Size reduction percentage
   */
  reductionPercentage: number;
  
  /**
   * Number of unused exports removed
   */
  unusedExportsRemoved: number;
  
  /**
   * Number of duplicate patterns collapsed
   */
  duplicatesCollapsed: number;
  
  /**
   * Number of imports optimized
   */
  importsOptimized: number;
  
  /**
   * Optimization time in milliseconds
   */
  optimizationTime: number;
}

/**
 * CodeOptimizer class for optimizing generated code
 */
export class CodeOptimizer {
  private options: Required<OptimizationOptions>;
  private metrics: OptimizationMetrics;
  
  constructor(options: OptimizationOptions = {}) {
    this.options = {
      deadCodeElimination: options.deadCodeElimination ?? false,  // FIXED: Disabled by default - regex too aggressive for multi-line methods
      treeShaking: options.treeShaking ?? true,
      minify: options.minify ?? false,
      removeComments: options.removeComments ?? false,
      inlineFunctions: options.inlineFunctions ?? false,
      collapseDuplicates: options.collapseDuplicates ?? false,  // FIXED: Disabled by default - regex doesn't handle nested braces
      esModules: options.esModules ?? true,
      optimizeImports: options.optimizeImports ?? true,
      production: options.production ?? false,
      conditionalGeneration: options.conditionalGeneration ?? true,
      usageTracking: options.usageTracking || {},
      bundleSizeTarget: options.bundleSizeTarget ?? 0,
      codeSplitting: options.codeSplitting ?? false,
      lazyLoading: options.lazyLoading ?? false,
    };
    
    this.metrics = this.initializeMetrics();
    
    // Enable aggressive optimizations in production mode
    if (this.options.production) {
      this.enableProductionOptimizations();
    }
  }
  
  /**
   * Initialize optimization metrics
   */
  private initializeMetrics(): OptimizationMetrics {
    return {
      originalSize: 0,
      optimizedSize: 0,
      reductionPercentage: 0,
      unusedExportsRemoved: 0,
      duplicatesCollapsed: 0,
      importsOptimized: 0,
      optimizationTime: 0,
    };
  }
  
  /**
   * Enable production-specific optimizations
   */
  private enableProductionOptimizations(): void {
    this.options.minify = true;
    this.options.removeComments = true;
    this.options.inlineFunctions = true;
    this.options.deadCodeElimination = true;
    this.options.collapseDuplicates = true;
    this.options.optimizeImports = true;
  }
  
  /**
   * Optimize a generated file
   */
  public optimizeFile(file: GeneratedFile, protoFile?: ProtoFile): GeneratedFile {
    const startTime = Date.now();
    let content = file.content;
    
    // Track original size
    this.metrics.originalSize = content.length;
    
    // Apply optimizations in order of impact
    if (this.options.conditionalGeneration && protoFile) {
      content = this.applyConditionalGeneration(content, protoFile);
    }
    
    if (this.options.deadCodeElimination) {
      content = this.eliminateDeadCode(content);
    }
    
    if (this.options.optimizeImports) {
      content = this.optimizeImports(content);
    }
    
    if (this.options.collapseDuplicates) {
      content = this.collapseDuplicatePatterns(content);
    }
    
    if (this.options.treeShaking) {
      content = this.applyTreeShakingOptimizations(content);
    }
    
    if (this.options.inlineFunctions) {
      content = this.inlineSmallFunctions(content);
    }
    
    if (this.options.removeComments) {
      content = this.removeComments(content);
    }
    
    if (this.options.minify) {
      content = this.minifyCode(content);
    }
    
    if (this.options.esModules) {
      content = this.ensureESModules(content);
    }
    
    // Track optimized size and time
    this.metrics.optimizedSize = content.length;
    this.metrics.reductionPercentage = 
      ((this.metrics.originalSize - this.metrics.optimizedSize) / this.metrics.originalSize) * 100;
    this.metrics.optimizationTime = Date.now() - startTime;
    
    return {
      ...file,
      content,
    };
  }
  
  /**
   * Apply conditional generation based on usage patterns
   */
  private applyConditionalGeneration(content: string, protoFile: ProtoFile): string {
    if (!this.options.usageTracking) {
      return content;
    }
    
    const { usedServices, usedMethods, usedMessages } = this.options.usageTracking;
    
    // Remove unused services
    if (usedServices && usedServices.size > 0) {
      content = this.removeUnusedServices(content, protoFile.services, usedServices);
    }
    
    // Remove unused methods from services
    if (usedMethods && usedMethods.size > 0) {
      content = this.removeUnusedMethods(content, usedMethods);
    }
    
    // Remove unused message types
    if (usedMessages && usedMessages.size > 0) {
      content = this.removeUnusedMessages(content, protoFile.messages, usedMessages);
    }
    
    return content;
  }
  
  /**
   * Remove unused services from generated code
   */
  private removeUnusedServices(
    content: string,
    services: ServiceDefinition[],
    usedServices: Set<string>,
  ): string {
    let optimized = content;
    
    services.forEach(service => {
      if (!usedServices.has(service.name)) {
        // Remove the entire service class
        const serviceRegex = new RegExp(
          `export\\s+class\\s+${service.name}Stub\\s*{[^}]*}\\s*`,
          'gs',
        );
        optimized = optimized.replace(serviceRegex, '');
        
        // Remove React hook stub if present
        const hookRegex = new RegExp(
          `export\\s+class\\s+${service.name}HookStub\\s*{[^}]*}\\s*`,
          'gs',
        );
        optimized = optimized.replace(hookRegex, '');
        
        // Remove Suspense stub if present
        const suspenseRegex = new RegExp(
          `export\\s+class\\s+${service.name}SuspenseStub\\s*{[^}]*}\\s*`,
          'gs',
        );
        optimized = optimized.replace(suspenseRegex, '');
        
        this.metrics.unusedExportsRemoved++;
      }
    });
    
    return optimized;
  }
  
  /**
   * Remove unused methods from services
   */
  private removeUnusedMethods(content: string, usedMethods: Map<string, Set<string>>): string {
    let optimized = content;
    
    usedMethods.forEach((methods, serviceName) => {
      // Find all methods in the service
      const methodRegex = new RegExp(
        `(public\\s+(?:async\\s+)?)(\\w+)\\s*\\([^)]*\\)[^{]*{[^}]*}`,
        'gs',
      );
      
      const serviceClassRegex = new RegExp(
        `class\\s+${serviceName}Stub\\s*{([^}]*)}`,
        's',
      );
      
      const serviceMatch = serviceClassRegex.exec(optimized);
      if (serviceMatch) {
        let serviceBody = serviceMatch[1];
        let match;
        
        while ((match = methodRegex.exec(serviceBody)) !== null) {
          const methodName = match[2];
          if (!methods.has(methodName) && methodName !== 'constructor' && methodName !== 'getBaseUrl') {
            // Remove this method
            serviceBody = serviceBody.replace(match[0], '');
            this.metrics.unusedExportsRemoved++;
          }
        }
        
        optimized = optimized.replace(serviceMatch[0], `class ${serviceName}Stub {${serviceBody}}`);
      }
    });
    
    return optimized;
  }
  
  /**
   * Remove unused message types
   */
  private removeUnusedMessages(
    content: string,
    messages: MessageDefinition[],
    usedMessages: Set<string>,
  ): string {
    let optimized = content;
    
    messages.forEach(message => {
      if (!usedMessages.has(message.name)) {
        // Remove message interface
        const interfaceRegex = new RegExp(
          `export\\s+interface\\s+${message.name}\\s*{[^}]*}\\s*`,
          'gs',
        );
        optimized = optimized.replace(interfaceRegex, '');
        
        // Remove message class if present
        const classRegex = new RegExp(
          `export\\s+class\\s+${message.name}\\s+extends\\s+Message\\s*{[^}]*}\\s*`,
          'gs',
        );
        optimized = optimized.replace(classRegex, '');
        
        this.metrics.unusedExportsRemoved++;
      }
    });
    
    return optimized;
  }
  
  /**
   * Eliminate dead code
   */
  private eliminateDeadCode(content: string): string {
    // Remove unreachable code after return statements
    let optimized = content.replace(
      /return[^;]*;[\s\S]*?(?=\n\s*})/g,
      (match) => {
        const lines = match.split('\n');
        return lines[0]; // Keep only the return statement
      },
    );
    
    // Remove empty functions
    optimized = optimized.replace(
      /(?:public\s+)?(?:async\s+)?(\w+)\s*\([^)]*\)\s*(?::\s*[^{]+)?\s*{\s*}/g,
      '',
    );
    
    // Remove unused private methods
    optimized = this.removeUnusedPrivateMethods(optimized);
    
    return optimized;
  }
  
  /**
   * Remove unused private methods
   */
  private removeUnusedPrivateMethods(content: string): string {
    // Find all private method declarations
    const privateMethodRegex = /private\s+(?:async\s+)?(\w+)\s*\([^)]*\)[^{]*{[^}]*}/g;
    const privateMethods = new Map<string, string>();
    
    let match;
    while ((match = privateMethodRegex.exec(content)) !== null) {
      privateMethods.set(match[1], match[0]);
    }
    
    // Check if each private method is called
    let optimized = content;
    privateMethods.forEach((methodCode, methodName) => {
      const usageRegex = new RegExp(`this\\.${methodName}\\s*\\(`, 'g');
      if (!usageRegex.test(content)) {
        optimized = optimized.replace(methodCode, '');
        this.metrics.unusedExportsRemoved++;
      }
    });
    
    return optimized;
  }
  
  /**
   * Optimize import statements
   */
  private optimizeImports(content: string): string {
    // Combine multiple imports from the same source
    const importMap = new Map<string, Set<string>>();
    const importRegex = /import\s*{([^}]+)}\s*from\s*['"]([^'"]+)['"]/g;
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const imports = match[1].split(',').map(s => s.trim());
      const source = match[2];
      
      if (!importMap.has(source)) {
        importMap.set(source, new Set());
      }
      
      imports.forEach(imp => importMap.get(source)!.add(imp));
    }
    
    // Replace with optimized imports
    let optimized = content.replace(importRegex, '');
    const optimizedImports: string[] = [];
    
    importMap.forEach((imports, source) => {
      const sortedImports = Array.from(imports).sort();
      optimizedImports.push(`import { ${sortedImports.join(', ')} } from '${source}'`);
      this.metrics.importsOptimized++;
    });
    
    // Add optimized imports at the beginning
    if (optimizedImports.length > 0) {
      optimized = optimizedImports.join(';\n') + ';\n\n' + optimized;
    }
    
    // Remove duplicate imports
    optimized = this.removeDuplicateImports(optimized);
    
    return optimized;
  }
  
  /**
   * Remove duplicate imports
   */
  private removeDuplicateImports(content: string): string {
    const lines = content.split('\n');
    const seenImports = new Set<string>();
    const filteredLines: string[] = [];
    
    lines.forEach(line => {
      if (line.startsWith('import ')) {
        const normalizedImport = line.replace(/\s+/g, ' ').trim();
        if (!seenImports.has(normalizedImport)) {
          seenImports.add(normalizedImport);
          filteredLines.push(line);
        }
      } else {
        filteredLines.push(line);
      }
    });
    
    return filteredLines.join('\n');
  }
  
  /**
   * Collapse duplicate code patterns
   */
  private collapseDuplicatePatterns(content: string): string {
    // Find duplicate method implementations
    const methodBodies = new Map<string, number>();
    const methodRegex = /(?:public\s+)?(?:async\s+)?(\w+)\s*\([^)]*\)[^{]*{([^}]*)}/g;
    
    let match;
    while ((match = methodRegex.exec(content)) !== null) {
      const body = match[2].trim();
      if (body.length > 50) { // Only consider substantial method bodies
        const count = methodBodies.get(body) || 0;
        methodBodies.set(body, count + 1);
      }
    }
    
    // Extract common patterns into helper functions
    let optimized = content;
    methodBodies.forEach((count, body) => {
      if (count > 2) {
        // Create a helper function for this pattern
        const helperName = `_commonPattern${this.metrics.duplicatesCollapsed}`;
        const helper = `private ${helperName}() { ${body} }`;
        
        // Replace duplicates with calls to helper
        optimized = optimized.replace(
          new RegExp(body.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          `this.${helperName}()`,
        );
        
        // Add helper function
        optimized = optimized.replace(
          /^export\s+class/m,
          `${helper}\n\nexport class`,
        );
        
        this.metrics.duplicatesCollapsed++;
      }
    });
    
    return optimized;
  }
  
  /**
   * Apply tree-shaking optimizations
   */
  private applyTreeShakingOptimizations(content: string): string {
    // Mark all exports with tree-shaking hints
    let optimized = content;
    
    // Add pure annotations for better tree-shaking
    optimized = optimized.replace(
      /export\s+class\s+(\w+)/g,
      '/*#__PURE__*/ export class $1',
    );
    
    // Add pure annotations to function exports
    optimized = optimized.replace(
      /export\s+function\s+(\w+)/g,
      '/*#__PURE__*/ export function $1',
    );
    
    // Use named exports instead of default exports for better tree-shaking
    optimized = optimized.replace(
      /export\s+default\s+class\s+(\w+)/g,
      'export class $1',
    );
    
    // Add sideEffects: false hint comment
    if (!optimized.includes('/*#__NO_SIDE_EFFECTS__*/')) {
      optimized = '/*#__NO_SIDE_EFFECTS__*/\n' + optimized;
    }
    
    return optimized;
  }
  
  /**
   * Inline small functions for better performance
   */
  private inlineSmallFunctions(content: string): string {
    // Find small getter/setter functions
    const getterRegex = /get\s+(\w+)\(\)\s*{\s*return\s+this\.(\w+);\s*}/g;
    const setterRegex = /set\s+(\w+)\((\w+)[^)]*\)\s*{\s*this\.(\w+)\s*=\s*\2;\s*}/g;
    
    let optimized = content;
    
    // Inline getters
    optimized = optimized.replace(getterRegex, (match, propName, fieldName) => {
      // Replace calls to getter with direct field access
      const usageRegex = new RegExp(`this\\.${propName}`, 'g');
      optimized = optimized.replace(usageRegex, `this.${fieldName}`);
      return ''; // Remove the getter
    });
    
    // Inline setters
    optimized = optimized.replace(setterRegex, (match, propName, paramName, fieldName) => {
      // Replace calls to setter with direct field assignment
      const usageRegex = new RegExp(`this\\.${propName}\\s*=\\s*([^;]+)`, 'g');
      optimized = optimized.replace(usageRegex, `this.${fieldName} = $1`);
      return ''; // Remove the setter
    });
    
    return optimized;
  }
  
  /**
   * Remove comments from code
   */
  private removeComments(content: string): string {
    // Remove single-line comments
    let optimized = content.replace(/\/\/.*$/gm, '');
    
    // Remove multi-line comments but preserve JSDoc for type information
    optimized = optimized.replace(/\/\*(?!\*)[^*]*\*+(?:[^/*][^*]*\*+)*\//g, '');
    
    // Remove JSDoc comments if not needed
    if (this.options.production) {
      optimized = optimized.replace(/\/\*\*[\s\S]*?\*\//g, '');
    }
    
    // Remove empty lines created by comment removal
    optimized = optimized.replace(/^\s*[\r\n]/gm, '');
    
    return optimized;
  }
  
  /**
   * Minify the code
   */
  private minifyCode(content: string): string {
    // Remove unnecessary whitespace
    let minified = content.replace(/\s+/g, ' ');
    
    // Remove whitespace around operators
    minified = minified.replace(/\s*([=+\-*/<>!&|,;:{}()[\]])\s*/g, '$1');
    
    // Remove trailing semicolons before closing braces
    minified = minified.replace(/;}/g, '}');
    
    // Remove unnecessary semicolons
    minified = minified.replace(/;+/g, ';');
    
    // Compress boolean values
    minified = minified.replace(/\btrue\b/g, '!0');
    minified = minified.replace(/\bfalse\b/g, '!1');
    
    // Compress undefined
    minified = minified.replace(/\bundefined\b/g, 'void 0');
    
    // Remove newlines except where necessary
    minified = minified.replace(/\n+/g, '');
    
    return minified;
  }
  
  /**
   * Ensure ES module format for better tree-shaking
   */
  private ensureESModules(content: string): string {
    // Convert CommonJS exports to ES modules
    let esm = content.replace(
      /module\.exports\s*=\s*{([^}]+)}/g,
      (match, exports) => {
        const exportList = exports.split(',').map((exp: string) => {
          const trimmed = exp.trim();
          if (trimmed.includes(':')) {
            const [key, value] = trimmed.split(':').map(s => s.trim());
            return `export { ${value} as ${key} }`;
          }
          return `export { ${trimmed} }`;
        });
        return exportList.join(';\n');
      },
    );
    
    // Convert CommonJS requires to ES imports
    esm = esm.replace(
      /const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/g,
      'import $1 from \'$2\'',
    );
    
    // Convert destructured requires to named imports
    esm = esm.replace(
      /const\s*{([^}]+)}\s*=\s*require\(['"]([^'"]+)['"]\)/g,
      'import { $1 } from \'$2\'',
    );
    
    return esm;
  }
  
  /**
   * Generate code splitting configuration
   */
  public generateCodeSplitConfig(services: ServiceDefinition[]): Map<string, string[]> {
    const chunks = new Map<string, string[]>();
    
    if (!this.options.codeSplitting) {
      // Single chunk for all services
      chunks.set('main', services.map(s => s.name));
      return chunks;
    }
    
    // Split services into logical chunks
    services.forEach(service => {
      // Group by service name prefix (e.g., User* services together)
      const prefix = service.name.replace(/Service$/, '');
      const chunkName = `chunk-${prefix.toLowerCase()}`;
      
      if (!chunks.has(chunkName)) {
        chunks.set(chunkName, []);
      }
      
      chunks.get(chunkName)!.push(service.name);
    });
    
    return chunks;
  }
  
  /**
   * Generate lazy loading wrapper for services
   */
  public generateLazyLoadWrapper(serviceName: string, importPath: string): string {
    if (!this.options.lazyLoading) {
      return `export { ${serviceName}Stub } from '${importPath}';`;
    }
    
    return `
export const ${serviceName}Stub = {
  _stub: null as any,
  _loading: false as boolean,
  _loaded: false as boolean,
  
  async load() {
    if (this._loaded) return this._stub;
    if (this._loading) {
      // Wait for ongoing load
      while (this._loading) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      return this._stub;
    }
    
    this._loading = true;
    try {
      const module = await import('${importPath}');
      this._stub = new module.${serviceName}Stub();
      this._loaded = true;
      return this._stub;
    } finally {
      this._loading = false;
    }
  },
  
  get stub() {
    if (!this._loaded) {
      throw new Error('${serviceName}Stub not loaded. Call load() first.');
    }
    return this._stub;
  }
};`;
  }
  
  /**
   * Get optimization metrics
   */
  public getMetrics(): Readonly<OptimizationMetrics> {
    return { ...this.metrics };
  }
  
  /**
   * Reset metrics
   */
  public resetMetrics(): void {
    this.metrics = this.initializeMetrics();
  }
  
  /**
   * Analyze code for optimization opportunities
   */
  public analyzeOptimizationOpportunities(content: string): string[] {
    const opportunities: string[] = [];
    
    // Check for duplicate imports
    const importLines = content.match(/^import .*/gm) || [];
    const uniqueImports = new Set(importLines);
    if (importLines.length > uniqueImports.size) {
      opportunities.push(`Found ${importLines.length - uniqueImports.size} duplicate imports`);
    }
    
    // Check for unused exports
    const exports = content.match(/export\s+(?:class|function|const|interface)\s+(\w+)/g) || [];
    opportunities.push(`Found ${exports.length} exports that could be tree-shaken if unused`);
    
    // Check for large method bodies
    const largeMethods = content.match(/{[^}]{500,}}/g) || [];
    if (largeMethods.length > 0) {
      opportunities.push(`Found ${largeMethods.length} large methods that could be optimized`);
    }
    
    // Check for repeated patterns
    const patterns = new Map<string, number>();
    const codeBlocks = content.match(/{[^}]{50,200}}/g) || [];
    codeBlocks.forEach(block => {
      const normalized = block.replace(/\s+/g, ' ').trim();
      patterns.set(normalized, (patterns.get(normalized) || 0) + 1);
    });
    
    let duplicateCount = 0;
    patterns.forEach(count => {
      if (count > 2) duplicateCount++;
    });
    
    if (duplicateCount > 0) {
      opportunities.push(`Found ${duplicateCount} duplicate code patterns that could be extracted`);
    }
    
    return opportunities;
  }
}

/**
 * Create a code optimizer instance
 */
export function createCodeOptimizer(options?: OptimizationOptions): CodeOptimizer {
  return new CodeOptimizer(options);
}