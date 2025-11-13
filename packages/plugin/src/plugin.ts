/**
 * Core plugin logic for @hallow/plugin.
 *
 * This module implements the main unplugin factory that orchestrates all components:
 * - Configuration validation
 * - Build system detection
 * - Component initialization (resolver, cache, dependency graph, performance monitor)
 * - Plugin hooks registration
 *
 * @packageDocumentation
 */

import type { UnpluginFactory, UnpluginContextMeta } from 'unplugin';
import * as ts from 'typescript';
import { Parser } from '@hallow/parser';
import { Generator, GenerationError } from '@hallow/generator';
import { ConfigValidator } from './config';
import { ProtoResolver } from './resolver';
import { CacheManager } from './cache';
import { DependencyGraph } from './utils/dependency-graph';
import { PerformanceMonitor } from './utils/performance';
import { ErrorFormatter } from './utils/error';
import { createLogger } from './utils/logger';
import { GlobFilter } from './utils/glob-filter';
import type { PluginOptions, BuildSystem, PluginState } from './types';

/**
 * Detects the build system from unplugin context metadata.
 *
 * Uses context metadata to identify which build system the plugin is running in.
 * This enables build system-specific optimizations and logging.
 *
 * @param meta - Unplugin context metadata
 * @returns Detected build system identifier
 *
 * @internal
 */
function detectBuildSystem(meta: UnpluginContextMeta): BuildSystem {
  if (meta.framework === 'vite') return 'vite';
  if (meta.framework === 'webpack') return 'webpack';
  if (meta.framework === 'esbuild') return 'esbuild';
  if (meta.framework === 'rollup') return 'rollup';
  return 'unknown';
}

/**
 * Logs a message with the [@hallow/plugin] prefix.
 *
 * @param message - Message to log
 * @param level - Log level (info, warn, error)
 *
 * @internal
 */
function log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
  const prefix = '[@hallow/plugin]';
  switch (level) {
    case 'error':
      console.error(`${prefix} ${message}`);
      break;
    case 'warn':
      console.warn(`${prefix} ${message}`);
      break;
    default:
      console.log(`${prefix} ${message}`);
  }
}

/**
 * Generates a valid TypeScript import alias from a proto file path.
 *
 * Converts a file path to a camelCase identifier suitable for use as an import alias.
 * Handles various path formats and ensures the result is a valid TypeScript identifier.
 *
 * @param filePath - Proto file path to convert
 * @returns Valid TypeScript identifier
 *
 * @example
 * ```typescript
 * generateImportAlias('/project/common/types.proto') // 'commonTypes'
 * generateImportAlias('google/protobuf/timestamp.proto') // 'googleProtobufTimestamp'
 * ```
 *
 * @internal
 */
function generateImportAlias(filePath: string): string {
  // Extract filename without extension
  const withoutExtension = filePath.replace(/\.proto$/, '');

  // Extract just the filename and directory parts
  const parts = withoutExtension
    .split(/[/\\]/) // Split on path separators
    .filter((part) => part.length > 0) // Remove empty parts
    .map((part) => {
      // Convert to camelCase: capitalize first letter, lowercase rest
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    });

  // Join parts and ensure first character is lowercase (camelCase convention)
  const alias = parts.join('');
  return alias.charAt(0).toLowerCase() + alias.slice(1);
}

/**
 * Checks if a package is installed by attempting to resolve it.
 *
 * @param packageName - Name of the package to check
 * @returns true if package is installed, false otherwise
 *
 * @internal
 */
function isPackageInstalled(packageName: string): boolean {
  try {
    require.resolve(packageName);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads package.json from the project root to detect dependencies.
 *
 * @returns Package.json contents or null if not found
 *
 * @internal
 */
function readPackageJson(): { dependencies?: Record<string, string>; devDependencies?: Record<string, string> } | null {
  try {
    const fs = require('fs');
    const path = require('path');
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const content = fs.readFileSync(packageJsonPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Checks if React is installed in the project.
 *
 * Checks both package.json dependencies and actual module resolution.
 *
 * @returns true if React is detected, false otherwise
 *
 * @internal
 */
function isReactInstalled(): boolean {
  // Check if React can be resolved
  const reactResolvable = isPackageInstalled('react');

  // Also check package.json dependencies
  const packageJson = readPackageJson();
  const reactInPackageJson = Boolean(
    packageJson &&
    (packageJson.dependencies?.['react'] || packageJson.devDependencies?.['react'])
  );

  return reactResolvable || reactInPackageJson;
}

/**
 * Validates React-related configuration options (Task 14.2).
 *
 * Performs the following checks:
 * 1. If React hooks are enabled, warn if @hallow/react is not installed (Requirement 11.6)
 * 2. If React is detected but hooks not enabled, suggest enabling hooks (Requirement 11.8)
 *
 * @param config - Plugin configuration
 *
 * @internal
 */
function validateReactConfiguration(config: Required<PluginOptions>): void {
  const reactHooksEnabled = config.generateReactHooks || config.generateSuspenseHooks;
  const hallowReactInstalled = isPackageInstalled('@hallow/react');
  const reactInstalled = isReactInstalled();

  // Requirement 11.6: Warn if React hooks enabled but @hallow/react not installed
  if (reactHooksEnabled && !hallowReactInstalled) {
    log(
      'Warning: generateReactHooks or generateSuspenseHooks is enabled but @hallow/react is not found.\n' +
      '  Please install it: npm install @hallow/react\n' +
      '  or: yarn add @hallow/react',
      'warn'
    );
  }

  // Requirement 11.8: Suggest enabling hooks if React detected but hooks not enabled
  if (reactInstalled && !reactHooksEnabled && config.verbose) {
    log(
      'Suggestion: React detected in your project. Consider enabling React hooks generation:\n' +
      '  Set generateReactHooks: true in plugin options to generate useGrpc hooks\n' +
      '  Set generateSuspenseHooks: true to also generate Suspense-compatible hooks',
      'info'
    );
  }
}

/**
 * Creates the Hallow unplugin factory.
 *
 * This factory function initializes the plugin with all its components and returns
 * an unplugin instance configured for proto file transformation. It performs:
 * 1. Configuration validation and merging with defaults
 * 2. Build system detection
 * 3. Component initialization (resolver, cache, dependency graph, performance monitor)
 * 4. Logging of initialization status
 *
 * The returned unplugin instance can be adapted for different build systems via
 * the exported vite, webpack, rollup, and esbuild functions.
 *
 * @param options - User-provided plugin configuration (partial)
 * @returns Unplugin factory function
 *
 * @example
 * ```typescript
 * import { createUnplugin } from 'unplugin';
 * import { createHallowPlugin } from './plugin';
 *
 * const unplugin = createUnplugin(createHallowPlugin);
 *
 * // Use with Vite
 * export const vite = unplugin.vite;
 * ```
 */
export const createHallowPlugin: UnpluginFactory<PluginOptions | undefined> = (
  options = {}
) => {
  // ============================================================================
  // Configuration Validation and Initialization
  // ============================================================================

  const validator = new ConfigValidator();

  // Validate configuration
  const validationResult = validator.validate(options);

  // Handle validation errors
  if (!validationResult.valid) {
    const errorMessages = validationResult.errors
      .map((err) => {
        let msg = `  - ${err.field}: ${err.message}`;
        if (err.suggestion) {
          msg += `\n    ${err.suggestion}`;
        }
        return msg;
      })
      .join('\n');

    throw new Error(
      `[@hallow/plugin] Configuration errors:\n${errorMessages}\n\n` +
        'See documentation: https://github.com/hallow-org/hallow#plugin-configuration'
    );
  }

  // Log validation warnings
  if (validationResult.warnings.length > 0 && options.verbose) {
    validationResult.warnings.forEach((warning) => {
      let msg = `${warning.field}: ${warning.message}`;
      if (warning.suggestion) {
        msg += ` - ${warning.suggestion}`;
      }
      log(msg, 'warn');
    });
  }

  // Merge with defaults - result is guaranteed to have all required fields
  const config = validator.mergeWithDefaults(options) as Required<PluginOptions>;

  // ============================================================================
  // Plugin State Initialization
  // ============================================================================

  // Create logger instance (Tasks 21.1, 21.2)
  const logger = createLogger(config);

  let buildSystem: BuildSystem = 'unknown';
  let state: PluginState | null = null;

  // Flag to track initialization
  let initialized = false;

  // Import registry to track generated modules and avoid duplicates (Task 10.3)
  const importRegistry = new Set<string>();


  // Task 12.3: Bundle size tracking for production optimization monitoring
  const bundleSizes = new Map<string, number>();
  let totalBundleSize = 0;
  /**
   * Initializes plugin components.
   * This is called once during plugin setup.
   *
   * @internal
   */
  function initializeComponents(meta: UnpluginContextMeta): void {
    if (initialized) return;

    // Detect build system
    buildSystem = detectBuildSystem(meta);

    // Task 21.1: Log build system detection
    logger.debug(`Detected build system: ${buildSystem}`);

    // Initialize ProtoResolver
    const resolver = new ProtoResolver({
      protoRoot: config.protoRoot,
      importPaths: config.importPaths,
      projectRoot: process.cwd(),
    });

    // Initialize CacheManager
    const cache = new CacheManager(
      config.maxCacheSize,
      config.enablePersistentCache ? config.cacheDir : undefined
    );

    // Load persistent cache if enabled
    if (config.enablePersistentCache) {
      cache
        .loadFromDisk()
        .then(() => {
          // Task 21.2: Log cache loading in debug mode
          const stats = cache.getStats();
          logger.debug(
            `Loaded persistent cache: ${stats.entryCount} entries, ${(stats.totalSize / 1024 / 1024).toFixed(2)}MB`
          );
        })
        .catch((error: Error) => {
          logger.debug(`Failed to load persistent cache: ${error.message}`);
        });
    }

    // Initialize DependencyGraph
    const dependencyGraph = new DependencyGraph();

    // Initialize PerformanceMonitor
    const performanceMonitor = new PerformanceMonitor(
      config.enablePerformanceMonitoring,
      config.performanceThreshold
    );

    // Initialize Generator with plugin options
    const generator = new Generator({
      outputFormat: 'typescript',
      generateReactHooks: config.generateReactHooks,
      generateSuspenseHooks: config.generateSuspenseHooks,
      serverUrl: config.serverUrl,
      sourceMaps: config.sourceMaps,
      generateComments: !config.optimization.removeComments,
      optimization: config.optimization,
      enablePerformanceMonitoring: config.enablePerformanceMonitoring,
    });

    // Initialize GlobFilter for include/exclude pattern matching (Task 23.1)
    const globFilter = new GlobFilter({
      include: config.include,
      exclude: config.exclude,
      baseDir: config.protoRoot,
    });

    // Validate React configuration (Task 14.2)
    validateReactConfiguration(config);

    // Create plugin state
    state = {
      config,
      cache,
      dependencyGraph,
      resolver,
      performanceMonitor,
      generator,
      globFilter,
      buildSystem,
      watchedFiles: new Set<string>(),
    };

    // Task 21.1: Log initialization with comprehensive configuration details
    logger.logInitialization(buildSystem, config);

    initialized = true;
  }

  // ============================================================================
  // Unplugin Instance Definition
  // ============================================================================

  return {
    name: '@hallow/plugin',

    /**
     * Build start hook - initialize components on first build.
     */
    buildStart() {
      if (!initialized) {
        // Use a default meta if not available (for testing)
        const meta: UnpluginContextMeta = (this as any).meta || {
          framework: 'unknown',
        };
        initializeComponents(meta);
      }
    },

    /**
     * Transform include filter - process proto files matching glob patterns.
     *
     * Uses the GlobFilter to apply include/exclude pattern matching (Task 23.2).
     * A file is processed if:
     * 1. It has a .proto extension
     * 2. It matches at least one include pattern
     * 3. It does not match any exclude pattern
     *
     * @param id - File path
     * @returns true if file should be transformed
     *
     * @example
     * ```typescript
     * // With default config: include: ['**\/*.proto'], exclude: ['node_modules/**']
     * transformInclude('/project/src/api.proto')         // true
     * transformInclude('/project/node_modules/test.proto') // false
     * ```
     */
    transformInclude(id: string): boolean {
      // First check: must be a .proto file
      if (!id.endsWith('.proto')) {
        return false;
      }

      // Task 23.2: Apply glob pattern filtering
      // If state is not initialized yet, accept all .proto files
      // (this can happen during initial plugin setup)
      if (!state) {
        return true;
      }

      // Use GlobFilter to check include/exclude patterns
      const shouldInclude = state.globFilter.shouldInclude(id);

      // Task 21.2: Log filtering decisions in debug mode
      if (config.debug && !shouldInclude) {
        logger.debug(`Filtered out (excluded): ${id}`);
      }

      return shouldInclude;
    },

    /**
     * Transform hook - main proto file processing logic.
     *
     * Implements the core transformation pipeline:
     * 1. Compute content hash and check cache
     * 2. Return cached code on cache hit
     * 3. Parse proto file on cache miss
     * 4. Handle parser errors with ErrorFormatter
     * 5. Generate TypeScript code (Task 9.3)
     * 6. Update cache and track metrics
     *
     * @param code - Proto file content
     * @param id - Proto file path
     * @returns Transformed TypeScript code
     */
    async transform(code: string, id: string) {
      // Ensure components are initialized
      if (!initialized) {
        const meta: UnpluginContextMeta = (this as any).meta || {
          framework: 'unknown',
        };
        initializeComponents(meta);
      }

      if (!state) {
        throw new Error('[@hallow/plugin] Plugin state not initialized');
      }

      const { cache, performanceMonitor } = state;

      // Task 21.1: Log processing start
      logger.logProcessingStart(id);

      // Start performance monitoring if enabled
      if (config.enablePerformanceMonitoring) {
        performanceMonitor.startTimer(id);
      }

      try {
        // ============================================================================
        // Step 1: Compute content hash and check cache
        // ============================================================================
        const contentHash = cache.computeHash(code);

        // Check cache for existing generated code
        const cachedEntry = cache.get(id);

        if (cachedEntry && cachedEntry.hash === contentHash) {
          // Task 21.1: Log cache hit
          logger.logCacheHit(id);

          // Record cache hit in performance metrics
          if (config.enablePerformanceMonitoring) {
            performanceMonitor.recordTotal(id, 0, 0, true);
          }

          return {
            code: cachedEntry.content,
            map: null,
          };
        }

        // Task 21.1: Log cache miss
        logger.logCacheMiss(id);

        // ============================================================================
        // Step 2: Parse proto file using @hallow/parser
        // ============================================================================
        let protoFile;
        const parseStartTime = Date.now();

        try {
          // Create parser instance
          const parser = new Parser();

          // Parse the proto file
          protoFile = parser.parse(code, id);

          // Record parse time
          if (config.enablePerformanceMonitoring) {
            const parseTime = Date.now() - parseStartTime;
            performanceMonitor.recordParse(id, parseTime);
          }
        } catch (error: any) {
          // Handle parser errors with ErrorFormatter
          if (error.line !== undefined && error.column !== undefined) {
            // Parser error with location
            throw new Error(
              ErrorFormatter.formatParseError(
                id,
                error.line,
                error.column,
                error.message,
                code
              )
            );
          } else {
            // Generic parse error
            throw new Error(
              ErrorFormatter.formatParseError(
                id,
                0,
                0,
                error.message || String(error),
                undefined
              )
            );
          }
        }

        // ============================================================================
        // Step 2.5: Resolve imports and build dependency graph (Tasks 10.1, 10.2, 10.3)
        // ============================================================================
        const { resolver, dependencyGraph } = state;
        const resolvedImports: string[] = [];

        // Task 10.1: Parse import statements and resolve each import
        if (protoFile.imports && protoFile.imports.length > 0) {
          // Task 21.2: Log import processing in debug mode
          logger.debug(`Processing ${protoFile.imports.length} import(s) for: ${id}`);

          for (const importPath of protoFile.imports) {
            try {
              // Task 21.2: Log resolution search paths
              const searchPaths = resolver.getSearchPaths(id);
              logger.logResolutionPaths(importPath, searchPaths);

              // Resolve the import path
              const resolved = resolver.resolve(importPath, id);

              // Add to resolved imports list
              resolvedImports.push(resolved.absolutePath);

              // Task 21.2: Log successful resolution
              logger.logResolutionSuccess(
                importPath,
                resolved.absolutePath,
                resolved.isWellKnown ? undefined : 0
              );

              logger.debug(
                `Resolved import "${importPath}" -> ${resolved.absolutePath}${
                  resolved.isWellKnown ? ' (well-known type)' : ''
                }`
              );
            } catch (error: any) {
              // Handle resolution errors with ErrorFormatter
              const searchPaths = resolver.getSearchPaths(id);
              throw new Error(
                ErrorFormatter.formatResolveError(importPath, id, searchPaths)
              );
            }
          }
        }

        // Add node to dependency graph with resolved imports
        dependencyGraph.addNode(id, resolvedImports, contentHash);

        // Task 10.2: Detect circular dependencies
        const circularError = dependencyGraph.detectCycles();
        if (circularError) {
          // Throw formatted error with cycle path
          throw new Error(ErrorFormatter.formatCircularDependency(circularError.cycle));
        }

        // ============================================================================
        // Step 3: Generate TypeScript code using @hallow/generator
        // ============================================================================
        let generatedCode: string;
        let generatedResult: any;
        const generateStartTime = Date.now();

        try {
          // Generate code using the Generator
          generatedResult = await state.generator.generateCode(protoFile);

          // Record generation time
          if (config.enablePerformanceMonitoring) {
            const generateTime = Date.now() - generateStartTime;
            performanceMonitor.recordGenerate(id, generateTime);
          }

          // Extract generated TypeScript code
          // The generator returns GeneratedCode with files array
          // We need to combine all generated files into a single module
          if (generatedResult.files.length === 0) {
            throw new Error('Generator produced no output files');
          }

          // Transform to ES module format by combining all generated files
          // For a single proto file, we want to export everything from a single module
          let baseCode: string;
          if (generatedResult.files.length === 1) {
            // Single file - use it as-is (already ES module format)
            baseCode = generatedResult.files[0].content;
          } else {
            // Multiple files - combine them into a single module
            // This happens when the generator produces separate files for enums, messages, etc.
            const fileContents = generatedResult.files
              .filter((f: any) => !f.path.includes('report')) // Exclude report files
              .map((f: any) => f.content)
              .join('\n\n');

            baseCode = fileContents;
          }

          // Task 10.3: Generate TypeScript import statements for proto dependencies
          const importStatements: string[] = [];

          if (resolvedImports.length > 0) {
            // Task 21.2: Log import generation in debug mode
            logger.debug(`Generating import statements for ${resolvedImports.length} dependency(ies)`);

            for (const importedPath of resolvedImports) {
              // Skip if already in import registry (avoid duplicates)
              if (importRegistry.has(importedPath)) {
                logger.debug(`Skipping duplicate import: ${importedPath}`);
                continue;
              }

              // Add to import registry
              importRegistry.add(importedPath);

              // Generate relative import path from current file to imported file
              // Convert absolute path to relative module import
              const relativePath = importedPath.replace(/\.proto$/, '');

              // Generate import statement
              // Import all exports from the proto file
              importStatements.push(`import * as ${generateImportAlias(importedPath)} from '${relativePath}';`);

              logger.debug(`Generated import for: ${importedPath}`);
            }
          }

          // Combine import statements with generated code
          let generatedTypeScript: string;
          if (importStatements.length > 0) {
            generatedTypeScript = importStatements.join('\n') + '\n\n' + baseCode;
          } else {
            generatedTypeScript = baseCode;
          }

          // Transpile TypeScript to JavaScript for webpack compatibility
          // Webpack needs JavaScript output, not TypeScript
          const transpileResult = ts.transpileModule(generatedTypeScript, {
            compilerOptions: {
              target: ts.ScriptTarget.ES2020,
              module: ts.ModuleKind.ESNext,
              jsx: ts.JsxEmit.React,
              esModuleInterop: true,
              skipLibCheck: true,
              strict: false,
              declaration: false,
              sourceMap: config.sourceMaps,
            },
          });

          generatedCode = transpileResult.outputText;

          // Task 21.1: Log code generation completion
          logger.info(
            `Generated ${generatedResult.files.length} file(s) for: ${id} ` +
            `(Services: ${generatedResult.metadata.servicesCount}, ` +
            `Messages: ${generatedResult.metadata.messagesCount}, ` +
            `Enums: ${generatedResult.metadata.enumsCount})`
          );
        } catch (error: any) {
          // Handle generator errors with ErrorFormatter
          if (error instanceof GenerationError) {
            throw new Error(
              ErrorFormatter.formatGenerateError(
                id,
                new Error(`${error.message}\nCode: ${error.code}`)
              )
            );
          } else {
            throw new Error(
              ErrorFormatter.formatGenerateError(id, error as Error)
            );
          }
        }

        // ============================================================================
        // Step 4: Update cache with generated code
        // ============================================================================
        cache.set(id, generatedCode, contentHash);

        if (config.debug) {
          log(`Cached generated code for: ${id}`, 'info');
        }

        // ============================================================================
        // Task 12.3: Measure bundle size and track metrics
        // ============================================================================
        const codeSize = Buffer.byteLength(generatedCode, 'utf-8');
        bundleSizes.set(id, codeSize);
        totalBundleSize += codeSize;

        // Check against bundle size target if configured
        if (config.optimization.bundleSizeTarget) {
          if (codeSize > config.optimization.bundleSizeTarget) {
            const sizeMB = (codeSize / 1024 / 1024).toFixed(2);
            const targetMB = (config.optimization.bundleSizeTarget / 1024 / 1024).toFixed(2);
            log(
              `Bundle size warning for ${id}: ${sizeMB}MB exceeds target of ${targetMB}MB`,
              'warn'
            );
          }
        }

        if (config.debug) {
          const sizeKB = (codeSize / 1024).toFixed(2);
          log(`Generated code size for ${id}: ${sizeKB}KB`, 'info');
        }

        // ============================================================================
        // Step 5: Add file to watch list (for HMR support - Task 11.1)
        // ============================================================================
        state.watchedFiles.add(id);

        // Add watch file for build system HMR
        if (typeof (this as any).addWatchFile === 'function') {
          // Watch the main proto file
          (this as any).addWatchFile(id);

          // Task 11.1: Register all dependencies for watching
          // This ensures that changes to imported proto files trigger rebuilds
          if (resolvedImports.length > 0) {
            for (const importedPath of resolvedImports) {
              (this as any).addWatchFile(importedPath);
              state.watchedFiles.add(importedPath);

              if (config.debug) {
                log(`Watching dependency: ${importedPath}`, 'info');
              }
            }
          }
        }

        // ============================================================================
        // Step 6: Record performance metrics
        // ============================================================================
        if (config.enablePerformanceMonitoring) {
          const totalTime = Date.now() - parseStartTime;
          const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
          performanceMonitor.recordTotal(id, totalTime, memoryUsage, false);
          performanceMonitor.checkThreshold(id);
        }

        // ============================================================================
        // Task 16.3: Extract and process source maps
        // ============================================================================
        let sourceMap: string | null = null;

        if (config.sourceMaps && generatedResult.files.length > 0) {
          // Extract source maps from generated files
          const sourceMaps = generatedResult.files
            .filter((f: any) => !f.path.includes('report') && f.sourceMap)
            .map((f: any) => f.sourceMap!);

          if (sourceMaps.length > 0) {
            if (sourceMaps.length === 1) {
              // Single source map - use it directly
              sourceMap = sourceMaps[0];

              if (config.debug) {
                log(`Using source map for: ${id}`, 'info');
              }
            } else {
              // Multiple source maps - combine them
              // For now, we use the first one as the primary source map
              // In a more advanced implementation, we could merge source maps
              sourceMap = sourceMaps[0];

              if (config.debug) {
                log(
                  `Using primary source map for: ${id} (${sourceMaps.length} maps available)`,
                  'info'
                );
              }
            }
          }
        }

        // ============================================================================
        // Step 7: Return generated code with source map
        // ============================================================================
        return {
          code: generatedCode,
          map: sourceMap,
        };
      } catch (error) {
        // Re-throw formatted errors as-is
        if (error instanceof Error && error.message.includes('[Hallow Plugin]')) {
          throw error;
        }

        // Wrap unexpected errors
        throw new Error(
          ErrorFormatter.formatGenerateError(id, error as Error)
        );
      }
    },

    /**
     * Vite-specific: Handle hot module replacement (Task 11.3).
     *
     * This hook is called when a file changes in Vite's dev server.
     * It performs intelligent cache invalidation based on file dependencies.
     *
     * @param file - Path to the changed file
     * @param server - Vite dev server instance
     * @returns Updated modules list or undefined
     */
    vite: {
      async handleHotUpdate({ file, server, modules }) {
        if (!state) return;

        // Only process proto files
        if (!file.endsWith('.proto')) {
          return;
        }

        if (config.debug) {
          log(`HMR update for: ${file}`, 'info');
        }

        try {
          // ============================================================================
          // Step 1: Read the changed file and compute new hash
          // ============================================================================
          const fs = await import('fs/promises');
          const newContent = await fs.readFile(file, 'utf-8');
          const newHash = state.cache.computeHash(newContent);

          // Get cached entry for this file
          const cachedEntry = state.cache.get(file);

          // ============================================================================
          // Step 2: Check if the hash changed
          // ============================================================================
          if (cachedEntry && cachedEntry.hash === newHash) {
            // Content hasn't actually changed (e.g., whitespace-only change)
            if (config.debug) {
              log(`No content change detected for: ${file}`, 'info');
            }
            return [];
          }

          // Hash changed - content was modified
          if (config.debug) {
            log(`Content changed for: ${file} (invalidating cache)`, 'info');
          }

          // ============================================================================
          // Step 3: Invalidate cache for the changed file
          // ============================================================================
          state.cache.invalidate(file);

          // ============================================================================
          // Step 4: Invalidate cache for all files that depend on this file
          // ============================================================================
          const dependents = state.dependencyGraph.getDependents(file);

          if (dependents.length > 0) {
            if (config.debug) {
              log(
                `Invalidating ${dependents.length} dependent file(s): ${dependents.join(', ')}`,
                'info'
              );
            }

            // Invalidate cache for all dependents
            state.cache.invalidateMultiple(dependents);
          }

          // ============================================================================
          // Step 5: Find affected Vite modules for HMR
          // ============================================================================
          const affectedModules = new Set(modules);

          // Add modules for dependent proto files
          for (const dependent of dependents) {
            const dependentModule = server.moduleGraph.getModuleById(dependent);
            if (dependentModule) {
              affectedModules.add(dependentModule);
            }
          }

          if (config.debug) {
            log(
              `HMR will update ${affectedModules.size} module(s)`,
              'info'
            );
          }

          // Return the list of modules to update
          return Array.from(affectedModules);
        } catch (error) {
          // Log error but don't crash the dev server
          log(
            `Error during HMR update for ${file}: ${(error as Error).message}`,
            'error'
          );

          // Return undefined to let Vite handle the update normally
          return;
        }
      },
    },

    /**
     * Webpack-specific optimizations (Task 15.2).
     *
     * Webpack integration leverages the standard transform hook but can be
     * extended with loader-specific optimizations here if needed.
     *
     * The unplugin framework automatically handles Webpack's loader interface,
     * so no additional hooks are required for basic functionality.
     *
     * Future enhancements could include:
     * - Webpack-specific caching strategies
     * - Integration with Webpack's persistent cache
     * - Webpack watch mode optimizations
     */
    webpack: (compiler) => {
      // Webpack integration is handled automatically by unplugin
      // This section is available for future Webpack-specific optimizations

      if (config.debug) {
        compiler.hooks.compilation.tap('@hallow/plugin', () => {
          log('Webpack compilation started', 'info');
        });
      }
    },

    /**
     * Rollup-specific optimizations (Task 15.4).
     *
     * Provides Rollup-specific hooks for enhanced module resolution and tree-shaking.
     *
     * - resolveId: Custom proto file resolution for Rollup's module graph
     * - load: Load proto files with proper caching
     */
    rollup: {
      /**
       * Rollup resolveId hook - custom resolution for proto files.
       *
       * This hook helps Rollup understand how to resolve proto file imports,
       * ensuring proper module graph construction and tree-shaking support.
       *
       * @param id - Import specifier
       * @param importer - File that contains the import
       * @returns Resolved module ID or null to defer to default resolution
       */
      resolveId(id: string, importer?: string) {
        // Only handle proto file imports
        if (!id.endsWith('.proto')) {
          return null;
        }

        if (!state) {
          return null;
        }

        try {
          // Use our proto resolver to handle the import
          const resolved = state.resolver.resolve(id, importer || '');

          if (config.debug) {
            log(`Rollup resolved: ${id} -> ${resolved.absolutePath}`, 'info');
          }

          return resolved.absolutePath;
        } catch (error) {
          // Let Rollup handle resolution errors through the normal transform hook
          return null;
        }
      },

      /**
       * Rollup load hook - load proto files with caching.
       *
       * This hook allows Rollup to load proto files efficiently, leveraging
       * our caching system and ensuring consistent module loading.
       *
       * @param id - Module ID to load
       * @returns Module code or null to defer to default loading
       */
      async load(id: string) {
        // Only handle proto files
        if (!id.endsWith('.proto')) {
          return null;
        }

        if (!state) {
          return null;
        }

        try {
          // Read the file content
          const fs = await import('fs/promises');
          const content = await fs.readFile(id, 'utf-8');

          if (config.debug) {
            log(`Rollup loading: ${id}`, 'info');
          }

          // Return the content - it will be transformed by the transform hook
          return content;
        } catch (error) {
          // Let Rollup handle loading errors
          return null;
        }
      },
    },

    /**
     * ESBuild-specific optimizations (Task 15.3).
     *
     * ESBuild is known for its extreme performance, so this section minimizes
     * plugin overhead to maintain ESBuild's speed characteristics.
     *
     * Key optimizations:
     * - Async transform hook for non-blocking processing
     * - Efficient caching to avoid redundant parsing
     * - Minimal logging in production mode
     *
     * The transform hook already implements these optimizations, so no
     * additional ESBuild-specific hooks are required.
     */
    esbuild: {
      // ESBuild setup hook - runs once during plugin initialization
      setup(_build) {
        if (!state && config.debug) {
          log('ESBuild plugin initialized', 'info');
        }

        // The transform hook already handles ESBuild efficiently
        // This section is available for future ESBuild-specific optimizations
      },
    },

    /**
     * Build end hook - cleanup and final reporting.
     */
    buildEnd() {
      if (!state) return;

      // Save persistent cache if enabled
      if (config.enablePersistentCache) {
        state.cache
          .saveToDisk()
          .then(() => {
            if (config.debug) {
              const stats = state!.cache.getStats();
              log(
                `Saved persistent cache: ${stats.entryCount} entries, ${Math.round(stats.totalSize / 1024)}KB`,
                'info'
              );
            }
          })
          .catch((error: Error) => {
            if (config.debug) {
              log(`Failed to save persistent cache: ${error.message}`, 'warn');
            }
          });
      }

      // Task 13.2: Log performance summary and optionally export report if monitoring enabled
      if (config.enablePerformanceMonitoring) {
        const summary = state.performanceMonitor.getSummary();
        if (summary.totalFiles > 0) {
          log('Performance Summary:', 'info');
          log(`  - Total files: ${summary.totalFiles}`, 'info');
          log(`  - Total time: ${summary.totalTimeMs}ms`, 'info');
          log(
            `  - Average time: ${Math.round(summary.averageTimeMs)}ms per file`,
            'info'
          );
          log(`  - Peak memory: ${summary.memoryPeakMB.toFixed(2)}MB`, 'info');

          if (summary.slowestFiles.length > 0) {
            log('  - Slowest files:', 'info');
            summary.slowestFiles.slice(0, 5).forEach((metric) => {
              log(
                `    - ${metric.filePath}: ${metric.totalMs}ms`,
                'info'
              );
            });
          }

          // Task 13.2: Optionally export performance report to JSON (Requirement 10.12)
          if (config.cacheDir) {
            const reportPath = `${config.cacheDir}/performance.json`;
            state.performanceMonitor
              .exportReport(reportPath)
              .then(() => {
                if (config.debug) {
                  log(`Performance report exported to: ${reportPath}`, 'info');
                }
              })
              .catch((error: Error) => {
                if (config.debug) {
                  log(`Failed to export performance report: ${error.message}`, 'warn');
                }
              });
          }
        }
      }

      // Log cache statistics if verbose
      if (config.verbose) {
        const stats = state.cache.getStats();
        log('Cache Statistics:', 'info');
        log(`  - Entries: ${stats.entryCount}`, 'info');
        log(`  - Size: ${Math.round(stats.totalSize / 1024)}KB`, 'info');
        log(`  - Hits: ${stats.hits}`, 'info');
        log(`  - Misses: ${stats.misses}`, 'info');
        log(`  - Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`, 'info');
      }

      // Task 12.3: Log bundle size and optimization metrics in production mode
      if (config.optimization.production && bundleSizes.size > 0) {
        const totalSizeKB = (totalBundleSize / 1024).toFixed(2);
        const totalSizeMB = (totalBundleSize / 1024 / 1024).toFixed(2);

        log('Production Build Optimization Metrics:', 'info');
        log(`  - Total proto files: ${bundleSizes.size}`, 'info');
        log(`  - Total generated code size: ${totalSizeMB}MB (${totalSizeKB}KB)`, 'info');
        log(`  - Average file size: ${(totalBundleSize / bundleSizes.size / 1024).toFixed(2)}KB`, 'info');

        // Task 12.2: Show optimization settings that are enabled
        log('  - Optimizations enabled:', 'info');
        log(`    - Minify: ${config.optimization.minify}`, 'info');
        log(`    - Remove comments: ${config.optimization.removeComments}`, 'info');
        log(`    - Dead code elimination: ${config.optimization.deadCodeElimination}`, 'info');
        log(`    - Tree shaking: ${config.optimization.treeshaking}`, 'info');
        if (config.optimization.codeSplitting) {
          log(`    - Code splitting: ${config.optimization.codeSplitting}`, 'info');
        }
        if (config.optimization.lazyLoading) {
          log(`    - Lazy loading: ${config.optimization.lazyLoading}`, 'info');
        }

        // Show largest files if verbose
        if (config.verbose && bundleSizes.size > 0) {
          const sortedFiles = Array.from(bundleSizes.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

          if (sortedFiles.length > 0) {
            log('  - Largest generated files:', 'info');
            sortedFiles.forEach(([file, size]) => {
              const sizeKB = (size / 1024).toFixed(2);
              log(`    - ${file}: ${sizeKB}KB`, 'info');
            });
          }
        }

        // Task 12.3: Warn if total size exceeds bundle size target
        if (config.optimization.bundleSizeTarget) {
          const targetMB = (config.optimization.bundleSizeTarget / 1024 / 1024).toFixed(2);
          if (totalBundleSize > config.optimization.bundleSizeTarget) {
            log(
              `Total bundle size (${totalSizeMB}MB) exceeds target of ${targetMB}MB`,
              'warn'
            );
            log('Consider enabling additional optimizations:', 'warn');
            if (!config.optimization.deadCodeElimination) {
              log('  - deadCodeElimination: true', 'warn');
            }
            if (!config.optimization.treeshaking) {
              log('  - treeshaking: true', 'warn');
            }
          } else {
            log(`  - Bundle size target: ${targetMB}MB ✓ (within target)`, 'info');
          }
        }
      }
    },
  };
};
