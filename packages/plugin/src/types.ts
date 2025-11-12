/**
 * Type definitions for @hallow/plugin
 *
 * This file contains all TypeScript interfaces and types used by the plugin package.
 * These types define the plugin's configuration, internal data structures, and integration
 * points with @hallow/parser and @hallow/generator.
 *
 * @packageDocumentation
 */

/**
 * Build system type identifier.
 * Represents the detected build system where the plugin is running.
 */
export type BuildSystem = 'vite' | 'webpack' | 'rollup' | 'esbuild' | 'unknown';

// ============================================================================
// Plugin Configuration Types
// ============================================================================

/**
 * Plugin configuration options.
 *
 * Main configuration interface for the Hallow plugin. Extends GeneratorOptions
 * from @hallow/generator and adds plugin-specific options for file filtering,
 * path resolution, caching, performance monitoring, and debugging.
 *
 * @example
 * ```typescript
 * const config: PluginOptions = {
 *   include: ['**‎/*.proto'],
 *   exclude: ['node_modules/**‎'],
 *   protoRoot: './protos',
 *   generateReactHooks: true,
 *   sourceMaps: true,
 *   optimization: {
 *     production: true,
 *     minify: true
 *   }
 * };
 * ```
 */
export interface PluginOptions {
  // File filtering
  /**
   * Glob patterns for proto files to include.
   * @default ['**‎/*.proto']
   */
  include?: string[];

  /**
   * Glob patterns for proto files to exclude.
   * @default ['node_modules/**‎']
   */
  exclude?: string[];

  // Proto resolution
  /**
   * Root directory for proto file resolution.
   * Used as base path when resolving proto imports.
   * @default process.cwd()
   */
  protoRoot?: string;

  /**
   * Additional directories to search for proto imports.
   * Paths are searched in order after protoRoot.
   * @default []
   */
  importPaths?: string[];

  // Code generation
  /**
   * Enable generation of React hooks for gRPC methods.
   * Requires @hallow/react to be installed.
   * @default false
   */
  generateReactHooks?: boolean;

  /**
   * Enable generation of React Suspense-compatible hooks.
   * Requires @hallow/react to be installed.
   * @default false
   */
  generateSuspenseHooks?: boolean;

  /**
   * Default server URL to embed in generated client stubs.
   * Can be overridden at runtime.
   */
  serverUrl?: string;

  // Build optimization
  /**
   * Enable source map generation.
   * @default true in development, false in production
   */
  sourceMaps?: boolean;

  /**
   * Optimization configuration for production builds.
   */
  optimization?: OptimizationOptions;

  // Caching
  /**
   * Directory for persistent cache storage.
   * @default '.hallow-cache'
   */
  cacheDir?: string;

  /**
   * Maximum cache size in megabytes.
   * When exceeded, least recently used entries are evicted.
   * @default 100
   */
  maxCacheSize?: number;

  /**
   * Enable persistent disk cache.
   * Saves cache to disk for faster rebuilds.
   * @default false
   */
  enablePersistentCache?: boolean;

  // Performance monitoring
  /**
   * Enable performance monitoring and metrics collection.
   * @default false
   */
  enablePerformanceMonitoring?: boolean;

  /**
   * Performance threshold in milliseconds.
   * Files taking longer to process will trigger warnings.
   * @default 1000
   */
  performanceThreshold?: number;

  // Debugging
  /**
   * Enable verbose logging with detailed information.
   * @default false
   */
  verbose?: boolean;

  /**
   * Enable debug mode with extensive diagnostic output.
   * @default false
   */
  debug?: boolean;
}

/**
 * Optimization configuration options.
 *
 * Controls code generation optimizations for production builds.
 * These settings are passed to the generator to control output characteristics.
 *
 * @example
 * ```typescript
 * const optimization: OptimizationOptions = {
 *   production: true,
 *   minify: true,
 *   removeComments: true,
 *   deadCodeElimination: true,
 *   bundleSizeTarget: 100000 // 100KB
 * };
 * ```
 */
export interface OptimizationOptions {
  /**
   * Enable production mode optimizations.
   * When true, automatically enables minification and comment removal.
   * @default process.env.NODE_ENV === 'production'
   */
  production?: boolean;

  /**
   * Minify generated code by shortening variable names.
   * @default process.env.NODE_ENV === 'production'
   */
  minify?: boolean;

  /**
   * Remove JSDoc and inline comments from generated code.
   * @default process.env.NODE_ENV === 'production'
   */
  removeComments?: boolean;

  /**
   * Enable dead code elimination to remove unused code paths.
   * @default false
   */
  deadCodeElimination?: boolean;

  /**
   * Enable tree-shaking to eliminate unused exports.
   * @default false
   */
  treeshaking?: boolean;

  /**
   * Enable code splitting for lazy loading.
   * @default false
   */
  codeSplitting?: boolean;

  /**
   * Enable lazy loading of proto dependencies.
   * @default false
   */
  lazyLoading?: boolean;

  /**
   * Target bundle size in bytes.
   * If generated code exceeds this, a warning is logged.
   */
  bundleSizeTarget?: number;
}

// ============================================================================
// Proto Resolution Types
// ============================================================================

/**
 * Options for proto file path resolution.
 *
 * Configuration for the ProtoResolver component that handles
 * resolving proto import paths to absolute file system paths.
 */
export interface ResolverOptions {
  /**
   * Root directory for proto file resolution.
   */
  protoRoot: string;

  /**
   * Additional import search paths.
   */
  importPaths: string[];

  /**
   * Project root directory.
   */
  projectRoot: string;
}

/**
 * Result of proto file path resolution.
 *
 * Contains the resolved absolute path and metadata about the resolution.
 *
 * @example
 * ```typescript
 * const resolved: ResolvedProto = {
 *   absolutePath: '/project/protos/service.proto',
 *   originalImport: 'service.proto',
 *   isWellKnown: false
 * };
 * ```
 */
export interface ResolvedProto {
  /**
   * Absolute file system path to the resolved proto file.
   */
  absolutePath: string;

  /**
   * Original import path as specified in the proto file.
   */
  originalImport: string;

  /**
   * Whether this is a well-known type from google.protobuf.
   */
  isWellKnown: boolean;

  /**
   * Package path if resolved from node_modules.
   */
  packagePath?: string;
}

// ============================================================================
// Cache Management Types
// ============================================================================

/**
 * Cache entry for parsed and generated proto files.
 *
 * Stores generated code along with metadata for cache invalidation
 * and LRU eviction.
 *
 * @example
 * ```typescript
 * const entry: CacheEntry = {
 *   content: 'export class ServiceStub { ... }',
 *   hash: 'sha256-...',
 *   timestamp: Date.now(),
 *   size: 1024,
 *   accessCount: 5,
 *   lastAccess: Date.now()
 * };
 * ```
 */
export interface CacheEntry {
  /**
   * Generated TypeScript code content.
   */
  content: string;

  /**
   * SHA-256 hash of the original proto file content.
   * Used for cache invalidation.
   */
  hash: string;

  /**
   * Timestamp when entry was created (milliseconds since epoch).
   */
  timestamp: number;

  /**
   * Size of content in bytes.
   */
  size: number;

  /**
   * Number of times this entry has been accessed.
   */
  accessCount: number;

  /**
   * Timestamp of last access (milliseconds since epoch).
   * Used for LRU eviction.
   */
  lastAccess: number;
}

/**
 * Cache statistics for monitoring cache effectiveness.
 *
 * Tracks hit rate and size metrics to help optimize cache performance.
 *
 * @example
 * ```typescript
 * const stats: CacheStats = {
 *   hits: 150,
 *   misses: 50,
 *   hitRate: 0.75,
 *   totalSize: 1048576, // 1MB
 *   entryCount: 10
 * };
 * ```
 */
export interface CacheStats {
  /**
   * Number of cache hits.
   */
  hits: number;

  /**
   * Number of cache misses.
   */
  misses: number;

  /**
   * Cache hit rate (hits / (hits + misses)).
   */
  hitRate: number;

  /**
   * Total size of all cache entries in bytes.
   */
  totalSize: number;

  /**
   * Number of entries in the cache.
   */
  entryCount: number;
}

// ============================================================================
// Dependency Graph Types
// ============================================================================

/**
 * Node in the proto dependency graph.
 *
 * Represents a proto file and its relationships to other proto files
 * through imports.
 *
 * @example
 * ```typescript
 * const node: DependencyNode = {
 *   filePath: '/project/protos/service.proto',
 *   imports: ['common/types.proto', 'google/protobuf/timestamp.proto'],
 *   importedBy: ['api/v1/api.proto'],
 *   hash: 'sha256-...',
 *   timestamp: Date.now()
 * };
 * ```
 */
export interface DependencyNode {
  /**
   * Absolute path to the proto file.
   */
  filePath: string;

  /**
   * List of proto files this file imports.
   */
  imports: string[];

  /**
   * List of proto files that import this file.
   */
  importedBy: string[];

  /**
   * Content hash for change detection.
   */
  hash: string;

  /**
   * Timestamp when node was last updated.
   */
  timestamp: number;
}

/**
 * Error information for circular dependency detection.
 *
 * Contains the cycle path and formatted error message.
 *
 * @example
 * ```typescript
 * const error: CircularDependencyError = {
 *   cycle: ['a.proto', 'b.proto', 'c.proto', 'a.proto'],
 *   message: 'Circular import detected: a.proto → b.proto → c.proto → a.proto'
 * };
 * ```
 */
export interface CircularDependencyError {
  /**
   * Array of file paths forming the cycle.
   * Last element equals first element to show the loop.
   */
  cycle: string[];

  /**
   * Formatted error message describing the cycle.
   */
  message: string;
}

// ============================================================================
// Performance Monitoring Types
// ============================================================================

/**
 * Performance metrics for a single proto file processing.
 *
 * Tracks timing and memory usage for parse and generation phases.
 *
 * @example
 * ```typescript
 * const metrics: PerformanceMetrics = {
 *   filePath: '/project/protos/service.proto',
 *   parseMs: 45,
 *   generateMs: 120,
 *   totalMs: 165,
 *   memoryMB: 12.5,
 *   cacheHit: false
 * };
 * ```
 */
export interface PerformanceMetrics {
  /**
   * Path to the proto file being measured.
   */
  filePath: string;

  /**
   * Time spent parsing in milliseconds.
   */
  parseMs: number;

  /**
   * Time spent generating code in milliseconds.
   */
  generateMs: number;

  /**
   * Total processing time in milliseconds.
   */
  totalMs: number;

  /**
   * Memory used in megabytes.
   */
  memoryMB: number;

  /**
   * Whether this was a cache hit (no parsing/generation needed).
   */
  cacheHit: boolean;
}

/**
 * Summary of performance metrics across all processed files.
 *
 * Provides aggregate statistics for performance analysis.
 *
 * @example
 * ```typescript
 * const summary: PerformanceSummary = {
 *   totalFiles: 50,
 *   totalTimeMs: 8500,
 *   averageTimeMs: 170,
 *   slowestFiles: [...],
 *   memoryPeakMB: 45.2
 * };
 * ```
 */
export interface PerformanceSummary {
  /**
   * Total number of proto files processed.
   */
  totalFiles: number;

  /**
   * Total time spent processing all files in milliseconds.
   */
  totalTimeMs: number;

  /**
   * Average processing time per file in milliseconds.
   */
  averageTimeMs: number;

  /**
   * Array of slowest files sorted by processing time.
   */
  slowestFiles: PerformanceMetrics[];

  /**
   * Peak memory usage in megabytes.
   */
  memoryPeakMB: number;
}

// ============================================================================
// Configuration Validation Types
// ============================================================================

/**
 * Result of configuration validation.
 *
 * Contains validation status and lists of errors and warnings.
 *
 * @example
 * ```typescript
 * const result: ValidationResult = {
 *   valid: false,
 *   errors: [{
 *     field: 'maxCacheSize',
 *     message: 'Must be a positive number',
 *     suggestion: 'Try: maxCacheSize: 100'
 *   }],
 *   warnings: []
 * };
 * ```
 */
export interface ValidationResult {
  /**
   * Whether configuration is valid.
   */
  valid: boolean;

  /**
   * List of validation errors.
   */
  errors: ValidationError[];

  /**
   * List of validation warnings.
   */
  warnings: ValidationWarning[];
}

/**
 * Configuration validation error.
 *
 * Describes a configuration error with field name, message, and optional suggestion.
 */
export interface ValidationError {
  /**
   * Configuration field that failed validation.
   */
  field: string;

  /**
   * Error message describing the validation failure.
   */
  message: string;

  /**
   * Optional suggestion for fixing the error.
   */
  suggestion?: string;
}

/**
 * Configuration validation warning.
 *
 * Describes a non-fatal configuration issue with optional suggestion.
 */
export interface ValidationWarning {
  /**
   * Configuration field that triggered the warning.
   */
  field: string;

  /**
   * Warning message.
   */
  message: string;

  /**
   * Optional suggestion for addressing the warning.
   */
  suggestion?: string;
}

// ============================================================================
// Error Formatting Types
// ============================================================================

/**
 * Formatted error information with enhanced context.
 *
 * Contains error type, message, location, and optional code snippet.
 *
 * @example
 * ```typescript
 * const error: FormattedError = {
 *   type: 'parse',
 *   message: 'Expected semicolon',
 *   filePath: '/project/protos/service.proto',
 *   line: 15,
 *   column: 8,
 *   snippet: '  14 |   string name = 1\n> 15 |   string metadata = 2;\n     |        ^',
 *   suggestion: 'Add semicolon at end of line 14'
 * };
 * ```
 */
export interface FormattedError {
  /**
   * Type of error.
   */
  type: 'parse' | 'generate' | 'resolve' | 'validation' | 'circular';

  /**
   * Error message.
   */
  message: string;

  /**
   * Path to file where error occurred.
   */
  filePath?: string;

  /**
   * Line number where error occurred (1-based).
   */
  line?: number;

  /**
   * Column number where error occurred (1-based).
   */
  column?: number;

  /**
   * Code snippet showing error context.
   */
  snippet?: string;

  /**
   * Suggestion for fixing the error.
   */
  suggestion?: string;

  /**
   * List of paths searched (for resolution errors).
   */
  searchPaths?: string[];
}

// ============================================================================
// Parser AST Types (from @hallow/parser)
// ============================================================================

/**
 * Proto file AST root.
 *
 * Represents the parsed structure of a .proto file.
 * This interface matches the output from @hallow/parser.
 */
export interface ProtoFile {
  /**
   * Proto syntax version (always 'proto3' for this implementation).
   */
  syntax: 'proto3';

  /**
   * Package name declared in the proto file.
   */
  package?: string;

  /**
   * List of import statements.
   */
  imports: ProtoImport[];

  /**
   * List of message definitions.
   */
  messages: MessageDescriptor[];

  /**
   * List of service definitions.
   */
  services: ServiceDescriptor[];

  /**
   * List of enum definitions.
   */
  enums: EnumDescriptor[];
}

/**
 * Proto import statement.
 *
 * Represents an import declaration in a proto file.
 */
export interface ProtoImport {
  /**
   * Path to the imported proto file.
   */
  path: string;

  /**
   * Whether this is a public import.
   */
  isPublic: boolean;

  /**
   * Whether this is a weak import.
   */
  isWeak: boolean;
}

/**
 * Message descriptor from proto AST.
 *
 * Represents a message type definition.
 */
export interface MessageDescriptor {
  /**
   * Message name.
   */
  name: string;

  /**
   * List of field definitions.
   */
  fields: FieldDescriptor[];

  /**
   * Nested message definitions.
   */
  nestedMessages: MessageDescriptor[];

  /**
   * Nested enum definitions.
   */
  nestedEnums: EnumDescriptor[];
}

/**
 * Field descriptor from proto AST.
 *
 * Represents a field within a message.
 */
export interface FieldDescriptor {
  /**
   * Field name.
   */
  name: string;

  /**
   * Field type (e.g., 'string', 'int32', 'MyMessage').
   */
  type: string;

  /**
   * Field number.
   */
  number: number;

  /**
   * Whether field is repeated.
   */
  repeated: boolean;

  /**
   * Whether field is optional.
   */
  optional: boolean;
}

/**
 * Service descriptor from proto AST.
 *
 * Represents a gRPC service definition.
 */
export interface ServiceDescriptor {
  /**
   * Service name.
   */
  name: string;

  /**
   * List of RPC method definitions.
   */
  methods: MethodDescriptor[];
}

/**
 * Method descriptor from proto AST.
 *
 * Represents an RPC method within a service.
 */
export interface MethodDescriptor {
  /**
   * Method name.
   */
  name: string;

  /**
   * Input message type.
   */
  inputType: string;

  /**
   * Output message type.
   */
  outputType: string;

  /**
   * Whether the client streams input.
   */
  clientStreaming: boolean;

  /**
   * Whether the server streams output.
   */
  serverStreaming: boolean;
}

/**
 * Enum descriptor from proto AST.
 *
 * Represents an enum type definition.
 */
export interface EnumDescriptor {
  /**
   * Enum name.
   */
  name: string;

  /**
   * List of enum value definitions.
   */
  values: EnumValueDescriptor[];
}

/**
 * Enum value descriptor from proto AST.
 *
 * Represents a single value within an enum.
 */
export interface EnumValueDescriptor {
  /**
   * Value name.
   */
  name: string;

  /**
   * Numeric value.
   */
  number: number;
}

// ============================================================================
// Generator Output Types (from @hallow/generator)
// ============================================================================

/**
 * Generated code output from @hallow/generator.
 *
 * Contains generated files and optional source maps.
 */
export interface GeneratedCode {
  /**
   * List of generated files.
   */
  files: GeneratedFile[];

  /**
   * Source map generators for each file (if source maps enabled).
   */
  sourceMaps?: SourceMapGenerator[];
}

/**
 * Single generated file.
 *
 * Represents a generated TypeScript file with its content.
 */
export interface GeneratedFile {
  /**
   * Virtual file path for the generated code.
   */
  path: string;

  /**
   * Generated TypeScript/JavaScript content.
   */
  content: string;

  /**
   * Content hash for caching.
   */
  hash: string;
}

/**
 * Source map generator interface.
 *
 * Placeholder for source map generator type.
 * Actual implementation depends on source map library used.
 */
export interface SourceMapGenerator {
  /**
   * Source map content as string.
   */
  toString(): string;

  /**
   * Source map content as JSON object.
   */
  toJSON(): Record<string, unknown>;
}

// ============================================================================
// Plugin State Types
// ============================================================================

// Forward declarations for circular dependency avoidance
// These will be imported by the plugin implementation
export interface CacheManagerInterface {
  get(key: string): CacheEntry | null;
  set(key: string, content: string, hash: string): void;
  invalidate(key: string): void;
  invalidateMultiple(keys: string[]): void;
  computeHash(content: string): string;
  getStats(): CacheStats;
  saveToDisk(): Promise<void>;
  loadFromDisk(): Promise<void>;
}

export interface DependencyGraphInterface {
  addNode(filePath: string, imports: string[], hash: string): void;
  getNode(filePath: string): DependencyNode | undefined;
  detectCycles(): CircularDependencyError | null;
  topologicalSort(): string[];
  getDependents(filePath: string): string[];
}

export interface ProtoResolverInterface {
  resolve(importPath: string, fromFile: string): ResolvedProto;
  resolveWellKnownType(typePath: string): ResolvedProto;
  getSearchPaths(fromFile: string): string[];
}

export interface PerformanceMonitorInterface {
  startTimer(filePath: string): void;
  recordParse(filePath: string, timeMs: number): void;
  recordGenerate(filePath: string, timeMs: number): void;
  recordTotal(filePath: string, timeMs: number, memoryMB: number, cacheHit: boolean): void;
  checkThreshold(filePath: string): void;
  getSummary(): PerformanceSummary;
  exportReport(outputPath: string): Promise<void>;
}

/**
 * Internal plugin state.
 *
 * Maintains state across transform hook invocations.
 * This is an internal type not exposed in public API.
 *
 * @internal
 */
export interface PluginState {
  /**
   * Resolved plugin configuration.
   */
  config: Required<PluginOptions>;

  /**
   * Cache manager instance.
   */
  cache: CacheManagerInterface;

  /**
   * Dependency graph instance.
   */
  dependencyGraph: DependencyGraphInterface;

  /**
   * Proto resolver instance.
   */
  resolver: ProtoResolverInterface;

  /**
   * Performance monitor instance.
   */
  performanceMonitor: PerformanceMonitorInterface;

  /**
   * Generator instance for code generation.
   */
  generator: any; // Use 'any' to avoid circular dependency with @hallow/generator

  /**
   * Glob pattern filter for include/exclude matching.
   */
  globFilter: any; // GlobFilter instance

  /**
   * Detected build system.
   */
  buildSystem: BuildSystem;

  /**
   * Set of watched proto files for HMR.
   */
  watchedFiles: Set<string>;
}
