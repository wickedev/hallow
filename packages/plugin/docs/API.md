# API Reference

Complete API documentation for `@hallow/plugin`.

## Table of Contents

- [Plugin Factory Functions](#plugin-factory-functions)
- [Configuration Options](#configuration-options)
  - [PluginOptions](#pluginoptions)
  - [OptimizationOptions](#optimizationoptions)
- [Public Utilities](#public-utilities)
- [Type Definitions](#type-definitions)
- [Error Messages](#error-messages)

---

## Plugin Factory Functions

### `vite(options?: PluginOptions): Plugin`

Creates a Vite-compatible plugin instance.

**Parameters:**
- `options` (optional): Plugin configuration options

**Returns:** Vite plugin instance

**Example:**
```typescript
import { defineConfig } from 'vite';
import { vite as hallow } from '@hallow/plugin';

export default defineConfig({
  plugins: [
    hallow({
      protoRoot: './protos',
      generateReactHooks: true,
    }),
  ],
});
```

**Features:**
- Hot Module Replacement (HMR) support
- Development server integration
- Virtual module support
- Fast refresh capabilities

---

### `webpack(options?: PluginOptions): Plugin`

Creates a Webpack-compatible plugin instance.

**Parameters:**
- `options` (optional): Plugin configuration options

**Returns:** Webpack plugin instance

**Example:**
```typescript
const { webpack: hallow } = require('@hallow/plugin');

module.exports = {
  plugins: [
    hallow({
      protoRoot: './protos',
      optimization: {
        production: true,
      },
    }),
  ],
};
```

**Features:**
- Webpack module resolution integration
- Watch mode support
- Persistent caching support
- Production optimization

---

### `esbuild(options?: PluginOptions): Plugin`

Creates an ESBuild-compatible plugin instance.

**Parameters:**
- `options` (optional): Plugin configuration options

**Returns:** ESBuild plugin instance

**Example:**
```typescript
const esbuild = require('esbuild');
const { esbuild: hallow } = require('@hallow/plugin');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  plugins: [hallow()],
  outfile: 'dist/bundle.js',
});
```

**Features:**
- Minimal overhead for maximum performance
- Async transform hooks
- Concurrent processing support

---

### `rollup(options?: PluginOptions): Plugin`

Creates a Rollup-compatible plugin instance.

**Parameters:**
- `options` (optional): Plugin configuration options

**Returns:** Rollup plugin instance

**Example:**
```typescript
import { rollup as hallow } from '@hallow/plugin';

export default {
  input: 'src/index.ts',
  plugins: [hallow({ protoRoot: './protos' })],
  output: {
    file: 'dist/bundle.js',
    format: 'esm',
  },
};
```

**Features:**
- `resolveId` and `load` hook integration
- Tree-shaking compatibility
- Module graph tracking

---

## Configuration Options

### PluginOptions

Main configuration interface for the plugin.

```typescript
interface PluginOptions {
  // File Filtering
  include?: string[];
  exclude?: string[];

  // Proto Resolution
  protoRoot?: string;
  importPaths?: string[];

  // Code Generation
  generateReactHooks?: boolean;
  generateSuspenseHooks?: boolean;
  serverUrl?: string;

  // Build Optimization
  sourceMaps?: boolean;
  optimization?: OptimizationOptions;

  // Caching
  cacheDir?: string;
  maxCacheSize?: number;
  enablePersistentCache?: boolean;

  // Performance Monitoring
  enablePerformanceMonitoring?: boolean;
  performanceThreshold?: number;

  // Debugging
  verbose?: boolean;
  debug?: boolean;
}
```

#### `include`

**Type:** `string[]`
**Default:** `['**/*.proto']`

Glob patterns for proto files to include in processing.

**Example:**
```typescript
hallow({
  include: [
    'src/**/*.proto',
    'api/**/*.proto',
  ],
})
```

**Notes:**
- Uses [minimatch](https://github.com/isaacs/minimatch) for pattern matching
- Patterns are relative to the project root
- Multiple patterns are combined with OR logic

---

#### `exclude`

**Type:** `string[]`
**Default:** `['node_modules/**']`

Glob patterns for proto files to exclude from processing.

**Example:**
```typescript
hallow({
  exclude: [
    'node_modules/**',
    '**/test/**',
    '**/deprecated/**',
  ],
})
```

**Notes:**
- Applied after `include` patterns
- Helps improve build performance by skipping unnecessary files

---

#### `protoRoot`

**Type:** `string`
**Default:** `process.cwd()`

Root directory for proto file resolution. Used as the base path when resolving proto imports.

**Example:**
```typescript
hallow({
  protoRoot: './src/protos',
})
```

**Notes:**
- Can be absolute or relative to project root
- All proto import paths are resolved relative to this directory
- Affects how `import` statements in proto files are resolved

---

#### `importPaths`

**Type:** `string[]`
**Default:** `[]`

Additional directories to search for proto imports. Paths are searched in order after `protoRoot`.

**Example:**
```typescript
hallow({
  protoRoot: './protos',
  importPaths: [
    './proto-definitions',
    './third-party-protos',
    './node_modules/google-proto-files',
  ],
})
```

**Search Order:**
1. Relative to importing file directory
2. `protoRoot`
3. Each path in `importPaths` (in order)
4. `node_modules` (for well-known types)

---

#### `generateReactHooks`

**Type:** `boolean`
**Default:** `false`

Enable generation of React hooks for gRPC methods.

**Example:**
```typescript
hallow({
  generateReactHooks: true,
})
```

**Generated Code:**
```typescript
// For each RPC method
export function useGreet(
  request: GreetRequest
): {
  data: GreetResponse | null;
  error: Error | null;
  loading: boolean;
}
```

**Requirements:**
- Requires `@hallow/react` package to be installed
- Adds React as a peer dependency

**Warning:**
If enabled without `@hallow/react` installed, you'll see:
```
[@hallow/plugin] Warning: generateReactHooks is enabled but @hallow/react is not found.
Please install it: npm install @hallow/react
```

---

#### `generateSuspenseHooks`

**Type:** `boolean`
**Default:** `false`

Enable generation of React Suspense-compatible hooks.

**Example:**
```typescript
hallow({
  generateSuspenseHooks: true,
})
```

**Generated Code:**
```typescript
// For each RPC method
export function useGreetSuspense(
  request: GreetRequest
): GreetResponse
```

**Requirements:**
- Requires `@hallow/react` package to be installed
- Must be used within a React Suspense boundary

**Usage:**
```typescript
<Suspense fallback={<Loading />}>
  <Component />
</Suspense>
```

---

#### `serverUrl`

**Type:** `string`
**Default:** `undefined`

Default server URL to embed in generated client stubs. Can be overridden at runtime.

**Example:**
```typescript
hallow({
  serverUrl: 'https://api.example.com',
})
```

**Generated Code:**
```typescript
export class GreetingServiceStub {
  constructor(client?: Client) {
    this.client = client || new Client('https://api.example.com');
  }
}
```

---

#### `sourceMaps`

**Type:** `boolean`
**Default:** `true` in development, `false` in production

Enable source map generation for debugging.

**Example:**
```typescript
hallow({
  sourceMaps: true,
})
```

**Development:**
```typescript
// Auto-enabled in development
process.env.NODE_ENV !== 'production' // sourceMaps: true
```

**Production:**
```typescript
// Disabled by default in production
process.env.NODE_ENV === 'production' // sourceMaps: false
```

**Override:**
```typescript
hallow({
  sourceMaps: true, // Force enable even in production
})
```

---

#### `optimization`

**Type:** `OptimizationOptions`
**Default:** Auto-detected based on `NODE_ENV`

Optimization configuration for production builds. See [OptimizationOptions](#optimizationoptions) below.

---

#### `cacheDir`

**Type:** `string`
**Default:** `'.hallow-cache'`

Directory for persistent cache storage.

**Example:**
```typescript
hallow({
  cacheDir: './build-cache/proto',
  enablePersistentCache: true,
})
```

**Cache Structure:**
```
.hallow-cache/
├── cache-entries.json
├── performance.json
└── metadata.json
```

---

#### `maxCacheSize`

**Type:** `number` (megabytes)
**Default:** `100`

Maximum cache size in megabytes. When exceeded, least recently used entries are evicted.

**Example:**
```typescript
hallow({
  maxCacheSize: 200, // 200MB
})
```

**LRU Eviction:**
- Tracks access time for each cache entry
- Evicts least recently used entries when limit exceeded
- Maintains optimal memory usage

---

#### `enablePersistentCache`

**Type:** `boolean`
**Default:** `false`

Enable persistent disk cache for faster rebuilds.

**Example:**
```typescript
hallow({
  enablePersistentCache: true,
  cacheDir: '.hallow-cache',
})
```

**Benefits:**
- Faster cold starts after restart
- Shared cache across builds
- Reduces processing time for unchanged files

**Trade-offs:**
- Additional disk I/O
- Cache invalidation complexity

---

#### `enablePerformanceMonitoring`

**Type:** `boolean`
**Default:** `false`

Enable performance monitoring and metrics collection.

**Example:**
```typescript
hallow({
  enablePerformanceMonitoring: true,
  performanceThreshold: 500,
})
```

**Collected Metrics:**
- Parse time per file
- Generation time per file
- Total processing time
- Memory usage
- Cache hit/miss rates

**Output:**
```json
{
  "totalFiles": 42,
  "totalTimeMs": 1250,
  "averageTimeMs": 29.8,
  "slowestFiles": [...]
}
```

---

#### `performanceThreshold`

**Type:** `number` (milliseconds)
**Default:** `1000`

Performance threshold in milliseconds. Files taking longer to process trigger warnings.

**Example:**
```typescript
hallow({
  enablePerformanceMonitoring: true,
  performanceThreshold: 500,
})
```

**Warning Output:**
```
[Hallow Plugin] Performance warning: large-service.proto took 650ms to process
```

---

#### `verbose`

**Type:** `boolean`
**Default:** `false`

Enable verbose logging with detailed information.

**Example:**
```typescript
hallow({
  verbose: true,
})
```

**Logged Information:**
- Configuration after validation
- Cache hit/miss statistics
- File processing progress
- Performance metrics
- Build system detection

---

#### `debug`

**Type:** `boolean`
**Default:** `false`

Enable debug mode with extensive diagnostic output.

**Example:**
```typescript
hallow({
  debug: true,
  verbose: true, // Usually used together
})
```

**Debug Output:**
- Dependency graph structure
- Resolution search paths
- Full error stack traces
- Cache operations
- Transform hook details

---

### OptimizationOptions

Controls code generation optimizations for production builds.

```typescript
interface OptimizationOptions {
  production?: boolean;
  minify?: boolean;
  removeComments?: boolean;
  deadCodeElimination?: boolean;
  treeshaking?: boolean;
  codeSplitting?: boolean;
  lazyLoading?: boolean;
  bundleSizeTarget?: number;
}
```

#### `production`

**Type:** `boolean`
**Default:** Auto-detected from `process.env.NODE_ENV`

Enable production mode optimizations. When `true`, automatically enables minification and comment removal.

**Example:**
```typescript
hallow({
  optimization: {
    production: true,
  },
})
```

**Auto-Detection:**
```typescript
const isProduction = process.env.NODE_ENV === 'production';
```

---

#### `minify`

**Type:** `boolean`
**Default:** `true` in production, `false` in development

Minify generated code by shortening variable names.

**Example:**
```typescript
hallow({
  optimization: {
    minify: true,
  },
})
```

**Before:**
```typescript
const greeterServiceClient = new GreeterServiceStub(client);
```

**After:**
```typescript
const a=new GreeterServiceStub(b);
```

---

#### `removeComments`

**Type:** `boolean`
**Default:** `true` in production, `false` in development

Remove JSDoc and inline comments from generated code.

**Example:**
```typescript
hallow({
  optimization: {
    removeComments: true,
  },
})
```

---

#### `deadCodeElimination`

**Type:** `boolean`
**Default:** `false`

Enable dead code elimination to remove unused code paths.

**Example:**
```typescript
hallow({
  optimization: {
    deadCodeElimination: true,
  },
})
```

**Removes:**
- Unused imports
- Unreachable code
- Unused variable declarations

---

#### `treeshaking`

**Type:** `boolean`
**Default:** `false`

Enable tree-shaking to eliminate unused exports.

**Example:**
```typescript
hallow({
  optimization: {
    treeshaking: true,
  },
})
```

**Analyzed:**
- Service usage patterns
- Message type usage
- Unused RPC methods

---

#### `codeSplitting`

**Type:** `boolean`
**Default:** `false`

Enable code splitting for lazy loading.

**Example:**
```typescript
hallow({
  optimization: {
    codeSplitting: true,
  },
})
```

---

#### `lazyLoading`

**Type:** `boolean`
**Default:** `false`

Enable lazy loading of proto dependencies.

**Example:**
```typescript
hallow({
  optimization: {
    lazyLoading: true,
  },
})
```

---

#### `bundleSizeTarget`

**Type:** `number` (bytes)
**Default:** `undefined`

Target bundle size in bytes. If generated code exceeds this, a warning is logged.

**Example:**
```typescript
hallow({
  optimization: {
    bundleSizeTarget: 100000, // 100KB
  },
})
```

**Warning:**
```
[Hallow Plugin] Bundle size warning: Generated code is 125KB, target is 100KB
```

---

## Public Utilities

### `Logger`

Logging utility for debug and verbose output.

**Import:**
```typescript
import { createLogger } from '@hallow/plugin';
```

**Usage:**
```typescript
const logger = createLogger({
  verbose: true,
  debug: true,
});

logger.info('Processing proto file');
logger.debug('Cache hit for service.proto');
logger.warn('Performance threshold exceeded');
logger.error('Parse error in proto file');
```

---

### `ErrorCollector`

Utility for collecting and reporting multiple errors.

**Import:**
```typescript
import { ErrorCollector } from '@hallow/plugin';
```

**Usage:**
```typescript
const collector = new ErrorCollector();

collector.add(new Error('Parse error in file1.proto'));
collector.add(new Error('Parse error in file2.proto'));

if (collector.hasErrors()) {
  const summary = collector.getSummary();
  console.error(summary);
}
```

---

### `GlobFilter`

Utility for glob pattern matching.

**Import:**
```typescript
import { GlobFilter } from '@hallow/plugin';
```

**Usage:**
```typescript
const filter = new GlobFilter({
  include: ['**/*.proto'],
  exclude: ['node_modules/**'],
});

if (filter.shouldInclude('src/service.proto')) {
  // Process file
}
```

---

## Type Definitions

### Exported Types

```typescript
// Configuration types
export interface PluginOptions { ... }
export interface OptimizationOptions { ... }

// Internal types (for advanced usage)
export interface CacheEntry { ... }
export interface CacheStats { ... }
export interface PerformanceMetrics { ... }
export interface DependencyNode { ... }
export interface ResolvedProto { ... }

// Utility types
export type BuildSystem = 'vite' | 'webpack' | 'rollup' | 'esbuild' | 'unknown';
```

---

## Error Messages

Complete reference of error messages and their meanings.

### Parse Errors

**Error:**
```
[Hallow Plugin] Proto syntax error
File: /path/to/service.proto
Line 15, Column 8: Expected ';' but found 'string'
```

**Cause:** Syntax error in proto file
**Solution:** Fix the syntax error at the specified location

---

### Resolution Errors

**Error:**
```
[Hallow Plugin] Import resolution failed
File: /path/to/service.proto
Cannot resolve import: "common/types.proto"
Searched in:
  - /path/to (relative)
  - /project/root
  - /project/protos (protoRoot)
```

**Cause:** Cannot find imported proto file
**Solution:** Check file exists and `protoRoot`/`importPaths` are correct

---

### Circular Dependency Errors

**Error:**
```
[Hallow Plugin] Circular import detected

a.proto → b.proto → c.proto → a.proto
```

**Cause:** Proto files have circular imports
**Solution:** Refactor to remove circular dependencies

---

### Generation Errors

**Error:**
```
[Hallow Plugin] Code generation failed
File: /path/to/service.proto
Reason: Undefined type: MyCustomType
```

**Cause:** Generator cannot resolve a type
**Solution:** Ensure all types are properly defined or imported

---

### Configuration Errors

**Error:**
```
[Hallow Plugin] Configuration error: 'maxCacheSize' must be number, got string
```

**Cause:** Invalid configuration option type
**Solution:** Fix the configuration option type

---

For detailed error handling documentation, see [ERROR_HANDLING.md](./ERROR_HANDLING.md).
