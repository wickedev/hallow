# Changelog

All notable changes to `@hallow/plugin` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-01-12

### Added

#### Core Features
- **Universal Build System Support** - Unplugin-based architecture supporting Vite, Webpack, ESBuild, and Rollup
- **Zero-Config Proto Imports** - Direct `.proto` file imports in TypeScript/JavaScript without manual code generation
- **Full TypeScript Type Safety** - Complete ambient module declarations and generated type definitions
- **Intelligent Caching System** - Content-based hashing with LRU eviction and optional persistent disk cache
- **Hot Module Replacement** - Vite-specific HMR support with dependency tracking
- **Production Optimizations** - Minification, dead code elimination, tree-shaking, and bundle size monitoring

#### Proto Resolution
- **Multi-Path Resolution** - Support for `protoRoot` and additional `importPaths`
- **Well-Known Types** - Automatic resolution of google.protobuf types
- **Dependency Graph** - Topological sorting and circular dependency detection
- **Path Validation** - Security checks to prevent directory traversal attacks

#### Code Generation Integration
- **React Hooks Support** - Optional generation of React hooks with `generateReactHooks` option
- **Suspense Support** - Optional generation of Suspense-compatible hooks with `generateSuspenseHooks`
- **Source Maps** - Automatic source map generation in development mode
- **ES Module Output** - Dual CommonJS/ESM output with proper module resolution

#### Performance Features
- **Performance Monitoring** - Built-in metrics collection with configurable thresholds
- **Performance Reports** - JSON report generation at `.hallow-cache/performance.json`
- **Cache Statistics** - Hit/miss rates and memory usage tracking
- **Sub-200ms Cold Start** - Optimized processing for single proto files
- **Concurrent Processing** - Parallel proto file processing support

#### Developer Experience
- **Comprehensive Error Messages** - Detailed error formatting with file locations and code snippets
- **Verbose Logging** - Detailed logging with `verbose` option
- **Debug Mode** - Extensive diagnostic output with `debug` option
- **ANSI Colors** - Terminal-friendly colored output
- **Configuration Validation** - Runtime validation with helpful error messages and suggestions

#### File Filtering
- **Glob Pattern Support** - Include/exclude patterns using minimatch
- **Default Exclusions** - Automatic exclusion of `node_modules/**`
- **Custom Patterns** - Support for complex glob patterns

#### Build System Optimizations
- **Vite HMR** - Fine-grained hot module replacement with `handleHotUpdate` hook
- **Webpack Integration** - Native Webpack loader interface and module resolution
- **ESBuild Performance** - Minimal overhead with async transform hooks
- **Rollup Hooks** - `resolveId` and `load` hook integration for maximum control

### Configuration

#### Plugin Options
- `include` - Glob patterns for files to include (default: `['**/*.proto']`)
- `exclude` - Glob patterns for files to exclude (default: `['node_modules/**']`)
- `protoRoot` - Root directory for proto resolution (default: `process.cwd()`)
- `importPaths` - Additional import search paths (default: `[]`)
- `generateReactHooks` - Enable React hooks generation (default: `false`)
- `generateSuspenseHooks` - Enable Suspense hooks generation (default: `false`)
- `serverUrl` - Default server URL for generated stubs
- `sourceMaps` - Enable source map generation (default: `true` in dev, `false` in prod)
- `cacheDir` - Cache directory path (default: `'.hallow-cache'`)
- `maxCacheSize` - Maximum cache size in MB (default: `100`)
- `enablePersistentCache` - Enable disk cache (default: `false`)
- `enablePerformanceMonitoring` - Enable performance tracking (default: `false`)
- `performanceThreshold` - Warning threshold in ms (default: `1000`)
- `verbose` - Enable verbose logging (default: `false`)
- `debug` - Enable debug mode (default: `false`)

#### Optimization Options
- `production` - Enable production mode (auto-detected from `NODE_ENV`)
- `minify` - Minify generated code (default: `true` in prod)
- `removeComments` - Remove comments (default: `true` in prod)
- `deadCodeElimination` - Enable dead code elimination (default: `false`)
- `treeshaking` - Enable tree-shaking (default: `false`)
- `codeSplitting` - Enable code splitting (default: `false`)
- `lazyLoading` - Enable lazy loading (default: `false`)
- `bundleSizeTarget` - Target bundle size in bytes

### Security

- **Path Traversal Prevention** - All file paths validated to prevent `..` attacks
- **Input Sanitization** - All error messages sanitized to prevent information leakage
- **No Dynamic Code Execution** - No use of `eval()`, `Function()`, or dynamic `require()` with user input
- **Configuration Validation** - All inputs validated before processing

### Performance

- **Cold Start** - Single proto file processing in <200ms
- **Cache Retrieval** - Cached file access in <10ms
- **Large Projects** - 100+ proto files processed without memory issues
- **Topological Sort** - 1000 nodes sorted in <100ms
- **Memory Management** - LRU eviction with configurable limits

### Documentation

- **Comprehensive README** - Installation, usage, configuration, troubleshooting
- **API Reference** - Complete documentation of all configuration options and utilities
- **Error Handling Guide** - Detailed error messages with solutions
- **TypeScript Examples** - Type-safe usage examples
- **Migration Guide** - Guide for migrating from manual code generation

### Dependencies

- `unplugin` ^1.5.0 - Universal plugin framework
- `@hallow/parser` * - Proto file parser
- `@hallow/generator` * - TypeScript code generator
- `chalk` ^4.1.2 - Terminal colors
- `fast-glob` ^3.3.2 - Glob pattern matching (unused, can be removed)
- `minimatch` ^10.1.1 - Glob pattern matching
- `zod` ^3.22.4 - Configuration validation

### Peer Dependencies

- `@hallow/react` >=0.1.0 (optional) - React hooks runtime

### Requirements

- Node.js >=14.0.0
- TypeScript >=4.0.0 (recommended)

### Package Distribution

- **Main Entry** - `dist/index.js` (CommonJS)
- **Module Entry** - `dist/index.esm.js` (ES Modules)
- **Type Declarations** - `dist/index.d.ts`
- **Ambient Declarations** - `dist/proto.d.ts`
- **Dual Module Support** - Both `import` and `require()` supported

### Testing

- **Unit Tests** - Comprehensive unit test coverage for all components
- **Integration Tests** - Tests for Vite, Webpack, ESBuild, and Rollup
- **E2E Tests** - End-to-end workflow tests
- **Performance Tests** - Benchmark tests for performance requirements
- **Error Scenario Tests** - Tests for all error conditions

### Known Issues

- Performance monitoring may have minimal overhead on very large proto files
- Persistent cache requires manual cleanup when cache directory grows large
- Tree-shaking support is experimental and may not work with all bundlers

### Breaking Changes

None - Initial release

---

## Version History

### [0.1.0] - 2025-01-12
- Initial release with full feature set
- Universal build system support (Vite, Webpack, ESBuild, Rollup)
- Intelligent caching and performance monitoring
- React hooks and Suspense support
- Production optimizations
- Comprehensive error handling and debugging

---

## Migration Guides

### Upgrading from Pre-Release

This is the first stable release. No migration needed.

### Future Breaking Changes

Breaking changes will be announced in advance and documented here with migration guides.

---

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for contribution guidelines.

## License

MIT © [Hallow gRPC]

---

**Legend:**
- `Added` - New features
- `Changed` - Changes in existing functionality
- `Deprecated` - Soon-to-be removed features
- `Removed` - Removed features
- `Fixed` - Bug fixes
- `Security` - Security fixes

[Unreleased]: https://github.com/yourusername/hallow/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/yourusername/hallow/releases/tag/v0.1.0
