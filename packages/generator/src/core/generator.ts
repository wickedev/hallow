import {
  GeneratorOptions,
  GeneratedCode,
  GeneratedFile,
  GenerationError,
  GenerationErrorCode,
} from './types';
import { ProtoFile } from './proto-types';
import { ServiceGenerator } from '../generators/ServiceGenerator';
import { MessageGenerator } from '../generators/MessageGenerator';
import { TemplateEngine } from './template-engine';
import { CodeOptimizer, UsageTrackingOptions } from '../optimizers/CodeOptimizer';
import { BundleAnalyzer } from '../optimizers/BundleAnalyzer';
import {
  PerformanceMonitor,
  createPerformanceMonitor,
  MemoryEfficientGenerator,
  createMemoryEfficientGenerator,
  TemplateOptimizer,
  createTemplateOptimizer,
  TypeResolutionCache,
  createTypeResolutionCache,
} from '../performance';
import { loadVersion } from '../utils/VersionLoader';
import { ProtoFileValidator } from '../validation/ProtoFileValidator';
import { formatValidationResult } from '../validation/types';

/**
 * Main code generator class
 */
export class Generator {
  private options: Required<GeneratorOptions>;
  private serviceGenerator: ServiceGenerator;
  private messageGenerator: MessageGenerator;
  private templateEngine: TemplateEngine;
  private codeOptimizer?: CodeOptimizer;
  private bundleAnalyzer?: BundleAnalyzer;
  private performanceMonitor?: PerformanceMonitor;
  private memoryEfficientGenerator?: MemoryEfficientGenerator;
  private templateOptimizer?: TemplateOptimizer;
  private typeResolutionCache?: TypeResolutionCache;
  private version: string;
  private validator: ProtoFileValidator;

  constructor(options: GeneratorOptions = {}) {
    // Load version from package.json
    try {
      this.version = loadVersion();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Failed to initialize generator: ${errorMessage}`,
      );
    }
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
        deadCodeElimination: options.optimization?.deadCodeElimination ?? false, // FIXED: Disabled by default - CodeOptimizer regex is too aggressive
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
      enablePerformanceMonitoring: options.enablePerformanceMonitoring ?? false,
    };

    // Initialize template engine
    this.templateEngine = new TemplateEngine();

    // Initialize validator
    this.validator = new ProtoFileValidator({
      validateTypeReferences: true,
      detectCircularDependencies: true,
      validateImports: true,
      maxCircularDepth: 100,
      strictMode: false,
    });

    // Initialize message generator
    this.messageGenerator = new MessageGenerator(this.templateEngine, {
      interfacesOnly: false,
      generateComments: this.options.generateComments,
      readonlyProperties: false,
      generateNamespaces: true,
      includeOptionMetadata: this.options.includeOptionMetadata,
      optionProcessing: this.options.optionProcessing,
    });

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

    // Initialize performance monitoring if enabled
    if (options.enablePerformanceMonitoring) {
      this.performanceMonitor = createPerformanceMonitor({
        maxGenerationTime: 30000, // 30 seconds
        maxMemoryUsage: 500 * 1024 * 1024, // 500MB
        warnThresholds: {
          generationTime: 10000, // 10 seconds
          memoryUsage: 300 * 1024 * 1024, // 300MB
        },
      });

      // Initialize memory-efficient generator for large files
      this.memoryEfficientGenerator = createMemoryEfficientGenerator({
        chunkSize: 20,
        memoryLimit: 400 * 1024 * 1024, // 400MB
        useStreaming: true,
        gcInterval: 50,
        cacheStrategy: 'lru',
      });

      // Initialize template optimizer
      this.templateOptimizer = createTemplateOptimizer({
        cacheCompiledTemplates: true,
        maxCacheSize: 100,
        precompile: true,
        minifyOutput: this.options.optimization?.minify,
      });

      // Initialize type resolution cache
      this.typeResolutionCache = createTypeResolutionCache({
        maxSize: 1000,
        ttl: 60000,
        detectCircular: true,
        maxDepth: 20,
      });
    }
  }

  /**
   * Generate code from parsed proto file
   * @param protoFile Parsed proto file AST
   * @returns Generated code result
   */
  async generateCode(protoFile: ProtoFile): Promise<GeneratedCode> {
    // Start performance monitoring if enabled
    if (this.performanceMonitor) {
      this.performanceMonitor.start();
    }

    try {
      if (this.performanceMonitor) {
        this.performanceMonitor.startOperation('validation');
      }
      this.validateProtoFile(protoFile);
      if (this.performanceMonitor) {
        this.performanceMonitor.endOperation();
      }

      let files: GeneratedFile[] = [];
      const metadata = {
        generatedAt: new Date(),
        generatorVersion: this.version,
        servicesCount: protoFile.services.length,
        messagesCount: protoFile.messages.length,
        enumsCount: protoFile.enums.length,
      };

      // Check if we should use memory-efficient generation for large files
      const isLargeFile = protoFile.services.length > 50 || protoFile.messages.length > 200;

      if (isLargeFile && this.memoryEfficientGenerator) {
        // Use memory-efficient chunked generation
        if (this.performanceMonitor) {
          this.performanceMonitor.startOperation('chunked_generation');
        }

        for await (const chunk of this.memoryEfficientGenerator.generateInChunks(
          protoFile,
          async (items, type) => {
            if (type === 'service') {
              return await this.serviceGenerator.generateStubs({
                ...protoFile,
                services: items as any,
              });
            }
            // TODO: Handle messages and enums
            return [];
          },
        )) {
          files.push(...chunk);
        }

        if (this.performanceMonitor) {
          this.performanceMonitor.endOperation();
        }
      } else {
        // Standard generation
        if (this.performanceMonitor) {
          this.performanceMonitor.startOperation('service_generation');
        }

        // Generate service stubs (includes message interfaces inline)
        if (protoFile.services.length > 0) {
          const serviceFiles = await this.serviceGenerator.generateStubs(protoFile);

          // Inject message interfaces at the top of each service file
          if (protoFile.messages.length > 0) {
            if (this.performanceMonitor) {
              this.performanceMonitor.startOperation('message_generation');
            }

            const messageCode = this.messageGenerator.generateMessages(protoFile);

            // Inject message interfaces into service files
            serviceFiles.forEach(file => {
              // Find the position after imports but before the service class
              const lines = file.content.split('\n');
              let insertPosition = 0;

              // Find where to insert (after imports, before service stub)
              for (let i = 0; i < lines.length; i++) {
                if (
                  lines[i].includes('/**') &&
                  lines[i + 1]?.includes('* Generated gRPC service stubs')
                ) {
                  insertPosition = i;
                  break;
                }
              }

              // Insert message interfaces - split messageCode into lines first!
              const messageLines = messageCode.split('\n');
              lines.splice(insertPosition, 0, '', ...messageLines, '');

              file.content = lines.join('\n');
            });

            if (this.performanceMonitor) {
              this.performanceMonitor.endOperation();
            }
          }

          files.push(...serviceFiles);

          // Record file metrics
          if (this.performanceMonitor) {
            serviceFiles.forEach(file => {
              this.performanceMonitor!.recordFileGeneration({
                fileName: file.path,
                fileSize: file.content.length,
                generationTime: 0, // Will be calculated by operation
                linesOfCode: file.content.split('\n').length,
              });
            });
          }
        }

        if (this.performanceMonitor) {
          this.performanceMonitor.endOperation();
        }
      }

      // TODO: Generate enum types (standalone enums, not nested in messages)

      // Apply optimizations if enabled
      if (this.codeOptimizer) {
        if (this.performanceMonitor) {
          this.performanceMonitor.startOperation('optimization');
        }
        files = await this.optimizeFiles(files, protoFile);
        if (this.performanceMonitor) {
          this.performanceMonitor.endOperation();
        }
      }

      // Analyze bundle if analyzer is enabled
      if (this.bundleAnalyzer) {
        if (this.performanceMonitor) {
          this.performanceMonitor.startOperation('bundle_analysis');
        }

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

        if (this.performanceMonitor) {
          this.performanceMonitor.endOperation();
        }
      }

      // Generate performance report if monitoring is enabled
      if (this.performanceMonitor) {
        const perfMetrics = this.performanceMonitor.stop();

        // Add performance report as a file in development mode
        if (!this.options.optimization?.production) {
          const perfReport = this.performanceMonitor.generateReport();
          files.push({
            path: 'performance-report.md',
            content: perfReport,
          });
        }

        // Log performance summary
        console.log(`[Performance] Generation completed in ${perfMetrics.duration}ms`);
        console.log(
          `[Performance] Peak memory usage: ${(perfMetrics.peakMemoryUsage?.heapUsed || 0) / 1024 / 1024}MB`,
        );
      }

      return {
        files,
        metadata,
      };
    } catch (error) {
      // Stop performance monitoring on error
      if (this.performanceMonitor) {
        this.performanceMonitor.stop();
      }

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
      throw new GenerationError('Proto file is required', GenerationErrorCode.INVALID_PROTO);
    }

    // Run comprehensive validation
    const validationResult = this.validator.validate(protoFile);

    // Log warnings to console if any
    if (validationResult.warnings.length > 0) {
      console.warn('[Validation] Proto file has warnings:');
      validationResult.warnings.forEach(warning => {
        console.warn(`  ${warning.message} (${warning.location.file}:${warning.location.line})`);
      });
    }

    // Throw error if validation failed
    if (!validationResult.valid) {
      const formattedErrors = formatValidationResult(validationResult);
      throw new GenerationError(
        `Proto file validation failed:\n${formattedErrors}`,
        GenerationErrorCode.INVALID_PROTO,
        { validationResult },
      );
    }
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
      enablePerformanceMonitoring:
        options.enablePerformanceMonitoring ?? this.options.enablePerformanceMonitoring,
    };

    // Update service generator options
    this.serviceGenerator.updateOptions({
      serverUrl: this.options.serverUrl,
      generateReactHooks: this.options.generateReactHooks,
      generateSuspenseHooks: this.options.generateSuspenseHooks,
      generateComments: this.options.generateComments,
      templateDir: this.options.templateDir,
    });

    // Re-initialize performance monitoring if enabled state changed
    if (options.enablePerformanceMonitoring !== undefined) {
      if (options.enablePerformanceMonitoring && !this.performanceMonitor) {
        // Initialize performance monitoring
        this.performanceMonitor = createPerformanceMonitor({
          maxGenerationTime: 30000,
          maxMemoryUsage: 500 * 1024 * 1024,
          warnThresholds: {
            generationTime: 10000,
            memoryUsage: 300 * 1024 * 1024,
          },
        });

        this.memoryEfficientGenerator = createMemoryEfficientGenerator({
          chunkSize: 20,
          memoryLimit: 400 * 1024 * 1024,
          useStreaming: true,
          gcInterval: 50,
          cacheStrategy: 'lru',
        });

        this.templateOptimizer = createTemplateOptimizer({
          cacheCompiledTemplates: true,
          maxCacheSize: 100,
          precompile: true,
          minifyOutput: this.options.optimization?.minify,
        });

        this.typeResolutionCache = createTypeResolutionCache({
          maxSize: 1000,
          ttl: 60000,
          detectCircular: true,
          maxDepth: 20,
        });
      } else if (!options.enablePerformanceMonitoring && this.performanceMonitor) {
        // Clean up performance monitoring
        this.performanceMonitor = undefined;
        this.memoryEfficientGenerator = undefined;
        this.templateOptimizer = undefined;
        this.typeResolutionCache = undefined;
      }
    }
  }
}
