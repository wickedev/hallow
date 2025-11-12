# @hallow/plugin

> Universal proto file plugin for Vite, Webpack, ESBuild, and Rollup

[![npm version](https://img.shields.io/npm/v/@hallow/plugin.svg)](https://www.npmjs.com/package/@hallow/plugin)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/@hallow/plugin.svg)](https://nodejs.org)

## Overview

`@hallow/plugin` enables seamless importing of `.proto` files as first-class TypeScript modules without manual code generation. Built on the [Unplugin](https://unplugin.unjs.io/) framework, it provides universal compatibility across modern build systems and orchestrates `@hallow/parser` and `@hallow/generator` to deliver type-safe gRPC-web client code.

### Key Features

- **Zero-Config Proto Imports** - Import `.proto` files directly in TypeScript/JavaScript
- **Universal Build System Support** - Works seamlessly with Vite, Webpack, ESBuild, and Rollup
- **Full TypeScript Type Safety** - Complete IDE autocomplete and type checking
- **Intelligent Caching** - Sub-200ms cold-start processing with smart cache invalidation
- **Hot Module Replacement** - Instant proto file updates in development
- **Production Optimizations** - Tree-shaking, minification, and dead code elimination
- **React Hooks Integration** - Optional React hooks and Suspense support
- **Performance Monitoring** - Built-in performance metrics and bottleneck detection

## Installation

```bash
npm install @hallow/plugin
# or
yarn add @hallow/plugin
# or
pnpm add @hallow/plugin
```

### Peer Dependencies

For React hooks support (optional):

```bash
npm install @hallow/react
```

## Quick Start

### Vite

```typescript
// vite.config.ts
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

### Webpack

```javascript
// webpack.config.js
const { webpack: hallow } = require('@hallow/plugin');

module.exports = {
  // ... other webpack config
  plugins: [
    hallow({
      protoRoot: './protos',
      optimization: {
        production: process.env.NODE_ENV === 'production',
      },
    }),
  ],
};
```

### ESBuild

```javascript
// build.js
const esbuild = require('esbuild');
const { esbuild: hallow } = require('@hallow/plugin');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  plugins: [hallow()],
  outfile: 'dist/bundle.js',
});
```

### Rollup

```javascript
// rollup.config.js
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

## Usage

### Basic Proto Import

Once configured, import `.proto` files directly in your code:

```typescript
import { GreetingServiceStub } from './greeting.proto';
import { Client } from '@hallow/grpc-web';

// Create a client
const client = new Client('https://api.example.com');
const service = new GreetingServiceStub(client);

// Call a method
const response = await service.methods.greet({ name: 'World' });
console.log(response.reply); // "Hello, World!"
```

### With React Hooks

Enable React hooks generation:

```typescript
// vite.config.ts
export default {
  plugins: [
    hallow({
      generateReactHooks: true,
    }),
  ],
};
```

Use in your React components:

```typescript
import { useGreet } from './greeting.proto';

function Greeting({ name }: { name: string }) {
  const { data, error, loading } = useGreet({ name });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{data?.reply}</div>;
}
```

### With React Suspense

Enable Suspense hooks:

```typescript
export default {
  plugins: [
    hallow({
      generateSuspenseHooks: true,
    }),
  ],
};
```

Use with Suspense boundaries:

```typescript
import { Suspense } from 'react';
import { useGreetSuspense } from './greeting.proto';

function Greeting({ name }: { name: string }) {
  const response = useGreetSuspense({ name });
  return <div>{response.reply}</div>;
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Greeting name="World" />
    </Suspense>
  );
}
```

## Configuration

### Configuration Options

All configuration options with their types and defaults:

```typescript
interface PluginOptions {
  // File Filtering
  include?: string[];              // Default: ['**/*.proto']
  exclude?: string[];              // Default: ['node_modules/**']

  // Proto Resolution
  protoRoot?: string;              // Default: process.cwd()
  importPaths?: string[];          // Default: []

  // Code Generation
  generateReactHooks?: boolean;    // Default: false
  generateSuspenseHooks?: boolean; // Default: false
  serverUrl?: string;              // Default: undefined

  // Build Optimization
  sourceMaps?: boolean;            // Default: true (dev), false (prod)
  optimization?: OptimizationOptions;

  // Caching
  cacheDir?: string;               // Default: '.hallow-cache'
  maxCacheSize?: number;           // Default: 100 (MB)
  enablePersistentCache?: boolean; // Default: false

  // Performance Monitoring
  enablePerformanceMonitoring?: boolean; // Default: false
  performanceThreshold?: number;         // Default: 1000 (ms)

  // Debugging
  verbose?: boolean;               // Default: false
  debug?: boolean;                 // Default: false
}

interface OptimizationOptions {
  production?: boolean;            // Auto-detected from NODE_ENV
  minify?: boolean;                // Default: true (prod), false (dev)
  removeComments?: boolean;        // Default: true (prod), false (dev)
  deadCodeElimination?: boolean;   // Default: false
  treeshaking?: boolean;           // Default: false
  codeSplitting?: boolean;         // Default: false
  lazyLoading?: boolean;           // Default: false
  bundleSizeTarget?: number;       // Default: undefined (bytes)
}
```

### Example Configurations

#### Development Configuration

```typescript
hallow({
  protoRoot: './protos',
  verbose: true,
  sourceMaps: true,
  enablePerformanceMonitoring: true,
  performanceThreshold: 500,
});
```

#### Production Configuration

```typescript
hallow({
  protoRoot: './protos',
  optimization: {
    production: true,
    minify: true,
    removeComments: true,
    deadCodeElimination: true,
    bundleSizeTarget: 100000, // 100KB
  },
  sourceMaps: false,
});
```

#### React Project Configuration

```typescript
hallow({
  protoRoot: './src/protos',
  generateReactHooks: true,
  generateSuspenseHooks: true,
  serverUrl: 'https://api.example.com',
  importPaths: ['./node_modules/@types/google-protobuf'],
});
```

#### Multi-Path Proto Configuration

```typescript
hallow({
  protoRoot: './protos',
  importPaths: [
    './proto-definitions',
    './third-party-protos',
    './node_modules/google-proto-files',
  ],
  include: ['**/*.proto'],
  exclude: ['**/test/**', '**/deprecated/**'],
});
```

## TypeScript Support

The plugin provides full TypeScript support with automatic type declarations.

### Ambient Module Declaration

The plugin includes `proto.d.ts` that declares `.proto` as a valid module:

```typescript
declare module "*.proto" {
  import { Client } from '@hallow/grpc-web';

  export interface Message {
    [key: string]: any;
  }

  export interface ServiceStub<T = any> {
    new (client: Client): T;
  }

  const exports: {
    [key: string]: ServiceStub | Message | Function;
  };

  export default exports;
}
```

### Generated Type Safety

For a proto service:

```protobuf
syntax = "proto3";

service GreetingService {
  rpc Greet(GreetRequest) returns (GreetResponse);
}

message GreetRequest {
  string name = 1;
}

message GreetResponse {
  string reply = 1;
}
```

The plugin generates fully-typed exports:

```typescript
export class GreetingServiceStub {
  constructor(client: Client);
  methods: {
    greet(request: GreetRequest): Promise<GreetResponse>;
  };
}

export interface GreetRequest {
  name: string;
}

export interface GreetResponse {
  reply: string;
}
```

## Performance

### Caching Strategy

The plugin implements intelligent caching with:

- **Content-Based Hashing**: SHA-256 hashing for reliable cache invalidation
- **LRU Eviction**: Automatic memory management with configurable limits
- **Persistent Cache**: Optional disk cache for faster rebuilds
- **Dependency Tracking**: Automatic invalidation of dependent files

### Performance Benchmarks

Typical processing times on modern hardware:

| Operation | Time |
|-----------|------|
| Cold start (single proto file) | <200ms |
| Cached file retrieval | <10ms |
| 100+ proto files (cold) | <5s |
| Topological sort (1000 nodes) | <100ms |

### Performance Monitoring

Enable performance monitoring to identify bottlenecks:

```typescript
hallow({
  enablePerformanceMonitoring: true,
  performanceThreshold: 500, // Warn if processing takes >500ms
});
```

This generates a performance report at `.hallow-cache/performance.json`:

```json
{
  "totalFiles": 42,
  "totalTimeMs": 1250,
  "averageTimeMs": 29.8,
  "slowestFiles": [
    {
      "filePath": "/protos/large-service.proto",
      "parseMs": 120,
      "generateMs": 180,
      "totalMs": 300,
      "memoryMB": 25.4
    }
  ],
  "memoryPeakMB": 45.2
}
```

## Troubleshooting

### Common Issues

#### Proto File Not Found

**Error:**
```
[Hallow Plugin] Import resolution failed
File: /path/to/service.proto
Cannot resolve import: "common/types.proto"
```

**Solution:**
1. Check that the imported file exists
2. Verify `protoRoot` is set correctly
3. Add additional search paths via `importPaths`:

```typescript
hallow({
  protoRoot: './protos',
  importPaths: ['./proto-definitions', './node_modules'],
});
```

#### React Hooks Not Generated

**Error:**
```
[@hallow/plugin] Warning: generateReactHooks is enabled but @hallow/react is not found
```

**Solution:**
Install the React runtime:

```bash
npm install @hallow/react
```

#### Circular Dependency Detected

**Error:**
```
[Hallow Plugin] Circular import detected

a.proto → b.proto → c.proto → a.proto
```

**Solution:**
Refactor proto files to break the circular dependency. Extract shared types into a separate file:

```
common/types.proto  ← shared types
a.proto → common/types.proto
b.proto → common/types.proto
c.proto → common/types.proto
```

#### TypeScript Cannot Find Module

**Error:**
```
Cannot find module './service.proto' or its corresponding type declarations
```

**Solution:**
1. Ensure the plugin is properly configured in your build system
2. Add the plugin's type declarations to `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@hallow/plugin"]
  }
}
```

3. Restart your TypeScript server (in VS Code: `Cmd+Shift+P` → "Restart TS Server")

#### Build Performance Issues

**Symptom:** Slow build times with many proto files

**Solution:**
1. Enable persistent cache:

```typescript
hallow({
  enablePersistentCache: true,
  maxCacheSize: 200, // Increase cache size
});
```

2. Use include/exclude patterns to limit processed files:

```typescript
hallow({
  include: ['src/**/*.proto'],
  exclude: ['**/test/**', '**/deprecated/**'],
});
```

3. Enable performance monitoring to identify bottlenecks:

```typescript
hallow({
  enablePerformanceMonitoring: true,
  verbose: true,
});
```

### Debug Mode

Enable debug mode for detailed diagnostic output:

```typescript
hallow({
  debug: true,
  verbose: true,
});
```

This logs:
- Dependency graph structure
- Resolution search paths
- Cache hit/miss statistics
- Full error stack traces
- Performance metrics per file

## Migration Guide

### From Manual Code Generation

If you're currently using `protoc` or other code generation tools:

**Before:**
```bash
# Manual codegen step
protoc --plugin=protoc-gen-ts --ts_out=src/generated *.proto
```

```typescript
// Import generated code
import { GreetingServiceClient } from './generated/greeting_pb_service';
```

**After:**
```typescript
// Configure plugin once
// vite.config.ts
export default {
  plugins: [hallow({ protoRoot: './protos' })],
};
```

```typescript
// Import proto files directly
import { GreetingServiceStub } from './protos/greeting.proto';
```

**Benefits:**
- No manual build step required
- Automatic regeneration on proto changes
- Hot module replacement in development
- Better IDE integration

## API Reference

For detailed API documentation, see [API.md](./docs/API.md).

For error handling documentation, see [ERROR_HANDLING.md](./docs/ERROR_HANDLING.md).

## Examples

See the [examples](../../examples) directory for complete working examples:

- Basic Vite project
- Webpack project with production optimization
- React project with hooks
- Multi-file proto dependencies

## Contributing

Contributions are welcome! Please see the main [CONTRIBUTING.md](../../CONTRIBUTING.md) for guidelines.

## License

MIT © [Hallow gRPC]

## Support

- 📖 [Documentation](https://github.com/yourusername/hallow)
- 🐛 [Issue Tracker](https://github.com/yourusername/hallow/issues)
- 💬 [Discussions](https://github.com/yourusername/hallow/discussions)

## Related Packages

- [@hallow/parser](../parser) - Protocol Buffer parser
- [@hallow/generator](../generator) - TypeScript code generator
- [@hallow/grpc-web](../grpc-web) - gRPC-web client runtime
- [@hallow/react](../react) - React hooks for gRPC

---

**Status:** This package is part of the Hallow gRPC monorepo and is actively maintained.
