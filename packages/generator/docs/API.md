# Hallow Generator API Documentation

## Overview

The Hallow Generator transforms Protocol Buffer (`.proto`) files into TypeScript code with full type safety and gRPC-web client support. It parses proto definitions and generates corresponding TypeScript interfaces, client stubs, and React hooks.

## Installation

```bash
npm install @hallow/generator
# or
yarn add @hallow/generator
```

## Core API

### CodeGenerator

The main class responsible for generating TypeScript code from proto files.

```typescript
import { Generator } from '@hallow/generator';

const generator = new Generator(options);
```

#### Constructor Options

```typescript
interface GeneratorOptions {
  // Output format for generated code
  outputFormat?: 'typescript' | 'javascript';
  
  // Whether to generate React hooks
  generateReactHooks?: boolean;
  
  // Whether to generate Suspense-enabled hooks
  generateSuspenseHooks?: boolean;
  
  // Base server URL for generated clients
  serverUrl?: string;
  
  // Enable source map generation
  sourceMaps?: boolean;
  
  // Include JSDoc comments in generated code
  generateComments?: boolean;
  
  // Custom template directory
  templateDir?: string;
  
  // Enable tree shaking optimizations
  treeShaking?: boolean;
  
  // Include custom option metadata
  includeOptionMetadata?: boolean;
  
  // Option processing configuration
  optionProcessing?: {
    includeStandard?: boolean;
    includeCustom?: boolean;
    excludeStandard?: string[];
    excludeCustom?: string[];
    processNestedObjects?: boolean;
  };
  
  // Code optimization options
  optimization?: {
    deadCodeElimination?: boolean;
    minify?: boolean;
    removeComments?: boolean;
    inlineFunctions?: boolean;
    optimizeImports?: boolean;
    production?: boolean;
    conditionalGeneration?: boolean;
    bundleSizeTarget?: number;
    codeSplitting?: boolean;
    lazyLoading?: boolean;
  };
  
  // Usage tracking for tree shaking
  usageTracking?: {
    usedServices?: string[];
    usedMethods?: Record<string, string[]>;
    usedMessages?: string[];
    usedEnums?: string[];
  };
  
  // Enable performance monitoring
  enablePerformanceMonitoring?: boolean;
}
```

#### Methods

##### `generateCode(protoFile: ProtoFile): Promise<GeneratedCode>`

Generates TypeScript code from a parsed proto file AST.

```typescript
const protoFile = await parser.parse('./service.proto');
const result = await generator.generateCode(protoFile);

// result.files contains generated file content
// result.metadata contains generation metadata
```

Returns:

```typescript
interface GeneratedCode {
  files: GeneratedFile[];
  metadata: {
    generatedAt: Date;
    generatorVersion: string;
    servicesCount: number;
    messagesCount: number;
    enumsCount: number;
  };
}

interface GeneratedFile {
  path: string;        // Output file path
  content: string;     // Generated TypeScript code
  sourceMap?: string;  // Optional source map
}
```

##### `getOptions(): Readonly<Required<GeneratorOptions>>`

Returns the current generator options.

```typescript
const options = generator.getOptions();
console.log('React hooks enabled:', options.generateReactHooks);
```

##### `updateOptions(options: Partial<GeneratorOptions>): void`

Updates generator options.

```typescript
generator.updateOptions({
  generateReactHooks: true,
  optimization: {
    production: true,
    minify: true
  }
});
```

### ServiceGenerator

Generates gRPC service stubs from service definitions.

```typescript
import { ServiceGenerator } from '@hallow/generator';

const serviceGen = new ServiceGenerator(options);
```

#### Methods

##### `generateStubs(protoFile: ProtoFile): Promise<GeneratedFile[]>`

Generates service stub files from a proto file.

```typescript
const files = await serviceGen.generateStubs(protoFile);
```

##### `generateStub(service: ServiceDefinition): Promise<string>`

Generates a single service stub.

```typescript
const stubCode = await serviceGen.generateStub(service);
```

### MessageGenerator

Generates TypeScript interfaces and serialization code for proto messages.

```typescript
import { MessageGenerator } from '@hallow/generator';

const messageGen = new MessageGenerator();
```

#### Methods

##### `generateInterface(message: MessageDefinition): string`

Generates a TypeScript interface for a proto message.

```typescript
const interfaceCode = messageGen.generateInterface(message);
```

##### `generateSerializer(message: MessageDefinition): string`

Generates serialization/deserialization methods.

```typescript
const serializerCode = messageGen.generateSerializer(message);
```

### ReactHookGenerator

Generates React hooks for gRPC services.

```typescript
import { ReactHookGenerator } from '@hallow/generator';

const hookGen = new ReactHookGenerator(options);
```

#### Methods

##### `generateHooks(service: ServiceDefinition): string`

Generates React hooks for a service.

```typescript
const hooksCode = hookGen.generateHooks(service);
```

##### `generateSuspenseHooks(service: ServiceDefinition): string`

Generates Suspense-compatible hooks.

```typescript
const suspenseHooks = hookGen.generateSuspenseHooks(service);
```

## Type Definitions

### ProtoFile

The Abstract Syntax Tree representation of a proto file.

```typescript
interface ProtoFile {
  syntax: 'proto2' | 'proto3';
  package?: string;
  imports: ImportStatement[];
  options: ProtoOption[];
  messages: MessageDefinition[];
  enums: EnumDefinition[];
  services: ServiceDefinition[];
}
```

### ServiceDefinition

Describes a gRPC service.

```typescript
interface ServiceDefinition {
  name: string;
  methods: MethodDefinition[];
  options: ProtoOption[];
  comments?: CommentBlock;
}
```

### MethodDefinition

Describes a service method.

```typescript
interface MethodDefinition {
  name: string;
  inputType: string;
  outputType: string;
  clientStreaming: boolean;
  serverStreaming: boolean;
  options: ProtoOption[];
  comments?: CommentBlock;
}
```

### MessageDefinition

Describes a proto message.

```typescript
interface MessageDefinition {
  name: string;
  fields: FieldDefinition[];
  oneofs: OneofDefinition[];
  nested: MessageDefinition[];
  enums: EnumDefinition[];
  options: ProtoOption[];
  comments?: CommentBlock;
}
```

### FieldDefinition

Describes a message field.

```typescript
interface FieldDefinition {
  name: string;
  number: number;
  type: string;
  label?: 'optional' | 'repeated' | 'required';
  defaultValue?: any;
  options: ProtoOption[];
  comments?: CommentBlock;
}
```

## Code Optimization

### Tree Shaking

Enable tree shaking to remove unused code:

```typescript
const generator = new Generator({
  treeShaking: true,
  usageTracking: {
    usedServices: ['UserService'],
    usedMethods: {
      UserService: ['getUser', 'createUser']
    }
  }
});
```

### Code Splitting

Split generated code into chunks:

```typescript
const generator = new Generator({
  optimization: {
    codeSplitting: true,
    lazyLoading: true
  }
});
```

### Bundle Analysis

Analyze bundle size and get optimization suggestions:

```typescript
const generator = new Generator({
  optimization: {
    production: true,
    bundleSizeTarget: 100000 // 100KB
  }
});

// Bundle report will be generated as 'bundle-report.md'
```

## Performance Monitoring

Enable performance monitoring to track generation metrics:

```typescript
const generator = new Generator({
  enablePerformanceMonitoring: true
});

// Performance report will be generated as 'performance-report.md'
```

## Error Handling

The generator provides detailed error messages with source location information.

```typescript
try {
  const result = await generator.generateCode(protoFile);
} catch (error) {
  if (error instanceof GenerationError) {
    console.error(`Error: ${error.message}`);
    console.error(`Code: ${error.code}`);
    
    if (error.location) {
      console.error(`Location: ${error.location.line}:${error.location.column}`);
    }
  }
}
```

### Error Types

```typescript
enum GenerationErrorCode {
  INVALID_PROTO = 'INVALID_PROTO',
  TEMPLATE_ERROR = 'TEMPLATE_ERROR',
  TYPE_MAPPING_ERROR = 'TYPE_MAPPING_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DEPENDENCY_ERROR = 'DEPENDENCY_ERROR'
}

class GenerationError extends Error {
  constructor(
    message: string,
    public code: GenerationErrorCode,
    public cause?: unknown,
    public location?: { line: number; column: number }
  ) {
    super(message);
  }
}
```

## Advanced Usage

### Custom Templates

Provide custom templates for code generation:

```typescript
const generator = new Generator({
  templateDir: './my-templates',
  generateComments: true
});
```

### Option Processing

Process custom proto options:

```typescript
const generator = new Generator({
  includeOptionMetadata: true,
  optionProcessing: {
    includeCustom: true,
    processNestedObjects: true
  }
});
```

### Memory-Efficient Generation

For large proto files, the generator automatically uses chunked generation:

```typescript
// Automatically enabled for files with >50 services or >200 messages
const generator = new Generator({
  enablePerformanceMonitoring: true
});

// Files are processed in chunks to avoid memory issues
const result = await generator.generateCode(largeProtoFile);
```

## Integration with Build Tools

### Programmatic Usage

```typescript
import { Generator } from '@hallow/generator';
import { Parser } from '@hallow/parser';

async function buildProtos() {
  const parser = new Parser();
  const generator = new Generator({
    generateReactHooks: true,
    optimization: {
      production: process.env.NODE_ENV === 'production'
    }
  });
  
  const protoFile = await parser.parse('./api.proto');
  const result = await generator.generateCode(protoFile);
  
  // Write files to disk
  for (const file of result.files) {
    await fs.writeFile(file.path, file.content);
  }
}
```

### With Unplugin

```typescript
// vite.config.ts
import { hallowPlugin } from '@hallow/unplugin';

export default {
  plugins: [
    hallowPlugin({
      generator: {
        generateReactHooks: true,
        optimization: {
          production: true
        }
      }
    })
  ]
};
```

## Best Practices

1. **Enable optimization for production builds**
   ```typescript
   const generator = new Generator({
     optimization: {
       production: true,
       minify: true,
       deadCodeElimination: true
     }
   });
   ```

2. **Use tree shaking to reduce bundle size**
   ```typescript
   const generator = new Generator({
     treeShaking: true,
     usageTracking: {
       // Track what's actually used
     }
   });
   ```

3. **Enable performance monitoring during development**
   ```typescript
   const generator = new Generator({
     enablePerformanceMonitoring: process.env.NODE_ENV !== 'production'
   });
   ```

4. **Generate React hooks when using React**
   ```typescript
   const generator = new Generator({
     generateReactHooks: true,
     generateSuspenseHooks: true
   });
   ```

## Version Compatibility

- Protobuf: Supports proto2 and proto3
- TypeScript: Generates code compatible with TypeScript 4.0+
- Node.js: Requires Node.js 14.0+
- React: Compatible with React 16.8+ (hooks) and 18+ (Suspense)