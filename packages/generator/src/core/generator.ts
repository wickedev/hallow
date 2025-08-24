import {
  GeneratorOptions,
  GeneratedCode,
  GeneratedFile,
  GenerationError,
  GenerationErrorCode,
} from './types';
import { ProtoFile } from './proto-types';
import { ServiceGenerator } from '../generators/ServiceGenerator';
import { CodeOptimizer, UsageTrackingOptions } from '../optimizers/CodeOptimizer';
import { BundleAnalyzer } from '../optimizers/BundleAnalyzer';

/**
 * Main code generator class
 */
export class Generator {
  private options: Required<GeneratorOptions>;
  private serviceGenerator: ServiceGenerator;
  private codeOptimizer?: CodeOptimizer;
  private bundleAnalyzer?: BundleAnalyzer;
  
  constructor(options: GeneratorOptions = {}) {
    this.options = {
      outputFormat: options.outputFormat || 'typescript',
      generateReactHooks: options.generateReactHooks ?? false,
      generateSuspenseHooks: options.generateSuspenseHooks ?? false,
      serverUrl: options.serverUrl || '',
      sourceMaps: options.sourceMaps ?? false,
      generateComments: options.generateComments ?? true,
      templateDir: options.templateDir || '',
      treeShaking: options.treeShaking ?? false,
      includeOptionMetadata: options.includeOptionMetadata ?? false,
      optionProcessing: {
        includeStandard: options.optionProcessing?.includeStandard ?? true,
        includeCustom: options.optionProcessing?.includeCustom ?? true,
        excludeStandard: options.optionProcessing?.excludeStandard ?? [],
        excludeCustom: options.optionProcessing?.excludeCustom ?? [],
        processNestedObjects: options.optionProcessing?.processNestedObjects ?? true,
        ...options.optionProcessing,
      },
      optimization: {
        deadCodeElimination: options.optimization?.deadCodeElimination ?? true,
        minify: options.optimization?.minify ?? false,
        removeComments: options.optimization?.removeComments ?? false,
        inlineFunctions: options.optimization?.inlineFunctions ?? false,
        optimizeImports: options.optimization?.optimizeImports ?? true,
        production: options.optimization?.production ?? false,
        conditionalGeneration: options.optimization?.conditionalGeneration ?? true,
        bundleSizeTarget: options.optimization?.bundleSizeTarget,
        codeSplitting: options.optimization?.codeSplitting ?? false,
        lazyLoading: options.optimization?.lazyLoading ?? false,
        ...options.optimization,
      },
      usageTracking: options.usageTracking || {},
    };
    
    // Initialize service generator
    this.serviceGenerator = new ServiceGenerator({
      serverUrl: this.options.serverUrl,
      generateReactHooks: this.options.generateReactHooks,
      generateSuspenseHooks: this.options.generateSuspenseHooks,
      generateComments: this.options.generateComments,
      templateDir: this.options.templateDir,
    });
    
    // Initialize optimizer if optimization is enabled
    if (this.shouldEnableOptimization()) {
      this.codeOptimizer = new CodeOptimizer({
        ...this.options.optimization,
        treeShaking: this.options.treeShaking,
        esModules: true,
        usageTracking: this.convertUsageTracking(),
      });
      
      this.bundleAnalyzer = new BundleAnalyzer({
        detailed: true,
        generateReport: true,
        trackDependencies: true,
        analyzeTreeShaking: this.options.treeShaking,
        sizeWarningThreshold: this.options.optimization.bundleSizeTarget 
          ? this.options.optimization.bundleSizeTarget / 2
          : 100,
        sizeErrorThreshold: this.options.optimization.bundleSizeTarget || 500,
      });
    }
  }
  
  /**
   * Generate code from parsed proto file
   * @param protoFile Parsed proto file AST
   * @returns Generated code result
   */
  async generateCode(protoFile: ProtoFile): Promise<GeneratedCode> {
    try {
      this.validateProtoFile(protoFile);
      
      let files: GeneratedFile[] = [];
      const metadata = {
        generatedAt: new Date(),
        generatorVersion: '0.1.0', // TODO: Get from package.json
        servicesCount: protoFile.services.length,
        messagesCount: protoFile.messages.length,
        enumsCount: protoFile.enums.length,
      };
      
      // Generate service stubs
      if (protoFile.services.length > 0) {
        const serviceFiles = await this.serviceGenerator.generateStubs(protoFile);
        files.push(...serviceFiles);
      }
      
      // TODO: Generate message types
      // TODO: Generate enum types
      
      // Apply optimizations if enabled
      if (this.codeOptimizer) {
        files = await this.optimizeFiles(files, protoFile);
      }
      
      // Analyze bundle if analyzer is enabled
      if (this.bundleAnalyzer) {
        const metrics = this.bundleAnalyzer.analyzeBundle(files, protoFile);
        
        // Add bundle report as a separate file if requested
        if (this.options.optimization?.production) {
          const report = this.bundleAnalyzer.generateReport(metrics);
          files.push({
            path: 'bundle-report.md',
            content: report,
          });
        }
        
        // Log warnings for large bundles
        metrics.suggestions
          .filter(s => s.severity === 'error' || s.severity === 'warning')
          .forEach(suggestion => {
            console.warn(`[Bundle Analysis] ${suggestion.message}`);
          });
      }
      
      return {
        files,
        metadata,
      };
    } catch (error) {
      if (error instanceof GenerationError) {
        throw error;
      }
      throw new GenerationError(
        `Unexpected error during code generation: ${error instanceof Error ? error.message : String(error)}`,
        GenerationErrorCode.INVALID_PROTO,
        error,
      );
    }
  }
  
  /**
   * Optimize generated files
   */
  private async optimizeFiles(
    files: GeneratedFile[],
    protoFile: ProtoFile,
  ): Promise<GeneratedFile[]> {
    if (!this.codeOptimizer) {
      return files;
    }
    
    const optimizedFiles: GeneratedFile[] = [];
    
    for (const file of files) {
      // Skip non-TypeScript/JavaScript files
      if (!file.path.match(/\.[tj]sx?$/)) {
        optimizedFiles.push(file);
        continue;
      }
      
      const optimized = this.codeOptimizer.optimizeFile(file, protoFile);
      optimizedFiles.push(optimized);
    }
    
    // Generate code splitting configuration if enabled
    if (this.options.optimization?.codeSplitting && protoFile.services.length > 0) {
      const splitConfig = this.codeOptimizer.generateCodeSplitConfig(protoFile.services);
      
      // Generate an index file with lazy loading if enabled
      if (this.options.optimization.lazyLoading) {
        const indexContent = this.generateLazyLoadingIndex(splitConfig, optimizedFiles);
        optimizedFiles.push({
          path: 'index.ts',
          content: indexContent,
        });
      }
    }
    
    return optimizedFiles;
  }
  
  /**
   * Generate lazy loading index file
   */
  private generateLazyLoadingIndex(
    splitConfig: Map<string, string[]>,
    files: GeneratedFile[],
  ): string {
    const lines: string[] = [
      '/**',
      ' * Auto-generated index with lazy loading support',
      ' * @generated',
      ' */',
      '',
    ];
    
    splitConfig.forEach((services, chunkName) => {
      lines.push(`// ${chunkName}`);
      services.forEach(serviceName => {
        const file = files.find(f => f.path.includes(serviceName.toLowerCase()));
        if (file && this.codeOptimizer) {
          const importPath = `./${file.path.replace('.ts', '')}`;
          lines.push(this.codeOptimizer.generateLazyLoadWrapper(serviceName, importPath));
        }
      });
      lines.push('');
    });
    
    return lines.join('\n');
  }
  
  /**
   * Check if optimization should be enabled
   */
  private shouldEnableOptimization(): boolean {
    return !!(
      this.options.optimization?.production ||
      this.options.optimization?.deadCodeElimination ||
      this.options.optimization?.minify ||
      this.options.optimization?.optimizeImports ||
      this.options.optimization?.conditionalGeneration ||
      this.options.treeShaking
    );
  }
  
  /**
   * Convert usage tracking options
   */
  private convertUsageTracking(): UsageTrackingOptions {
    const tracking = this.options.usageTracking;
    if (!tracking) {
      return {};
    }
    
    const result: UsageTrackingOptions = {};
    
    if (tracking.usedServices) {
      result.usedServices = new Set(tracking.usedServices);
    }
    
    if (tracking.usedMethods) {
      result.usedMethods = new Map();
      Object.entries(tracking.usedMethods).forEach(([service, methods]) => {
        result.usedMethods!.set(service, new Set(methods));
      });
    }
    
    if (tracking.usedMessages) {
      result.usedMessages = new Set(tracking.usedMessages);
    }
    
    if (tracking.usedEnums) {
      result.usedEnums = new Set(tracking.usedEnums);
    }
    
    return result;
  }
  
  /**
   * Validate proto file before generation
   * @param protoFile Proto file to validate
   */
  private validateProtoFile(protoFile: ProtoFile): void {
    if (!protoFile) {
      throw new GenerationError(
        'Proto file is required',
        GenerationErrorCode.INVALID_PROTO,
      );
    }
    
    // TODO: Add more validation
  }
  
  /**
   * Get current generator options
   */
  getOptions(): Readonly<Required<GeneratorOptions>> {
    return { ...this.options };
  }
  
  /**
   * Update generator options
   * @param options Partial options to update
   */
  updateOptions(options: Partial<GeneratorOptions>): void {
    this.options = {
      ...this.options,
      ...options,
    };
    
    // Update service generator options
    this.serviceGenerator.updateOptions({
      serverUrl: this.options.serverUrl,
      generateReactHooks: this.options.generateReactHooks,
      generateSuspenseHooks: this.options.generateSuspenseHooks,
      generateComments: this.options.generateComments,
      templateDir: this.options.templateDir,
    });
  }
}