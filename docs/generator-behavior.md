# Generator Processing Behavior

This document describes how the Hallow gRPC Generator processes proto files and what features are currently supported.

## Overview

The Hallow gRPC Generator is a TypeScript code generator that transforms Protocol Buffer (.proto) files into type-safe TypeScript code with gRPC client stubs, message types, and React hooks.

## Supported Proto Elements

### ✅ Fully Supported

#### Services
- **Service definitions** with all RPC methods
- **Unary RPCs** - Single request, single response
- **Server streaming RPCs** - Single request, stream of responses
- **Client streaming RPCs** - Stream of requests, single response
- **Bidirectional streaming RPCs** - Stream of requests and responses
- **Method comments** and documentation
- **Service options** (custom proto options)

#### Messages
- **Message definitions** with all field types
- **Nested messages** (messages within messages)
- **Scalar fields** (int32, int64, uint32, uint64, sint32, sint64, fixed32, fixed64, sfixed32, sfixed64, float, double, bool, string, bytes)
- **Enum fields**
- **Repeated fields** (arrays)
- **Map fields** (key-value pairs)
- **Optional fields** (proto3 optional)
- **Oneof fields** (union types)
- **Field comments** and documentation
- **Message options**
- **Reserved fields** and numbers
- **Default values** (proto3 semantics)

#### Enums
- **Top-level enum definitions**
- **Nested enums** (enums within messages)
- **Enum value aliases**
- **Enum options**
- **Reserved enum values**

#### Imports
- **Standard proto imports** (`import "path/to/file.proto"`)
- **Public imports** (`import public "path/to/file.proto"`)
- **Well-known types** (google/protobuf/*.proto)
- **Cross-file type references**
- **Dependency resolution** across multiple proto files

### ⚠️ Partially Supported

#### Advanced Features
- **Extensions** - Basic support, may require manual type adjustments
- **Any type** - Supported but requires runtime type handling
- **Oneof with complex types** - Works but may need additional validation

### ❌ Not Yet Supported

#### Proto2 Features
- **Groups** - Deprecated in proto3, not supported
- **Required fields** - proto3 doesn't use required
- **Default values (proto2 style)** - proto3 has different semantics

#### Advanced Options
- **Custom options (complex)** - Simple options work, complex nested options may not
- **Proto2-specific syntax** - Generator targets proto3

## Code Generation Process

### 1. Parsing Phase

The generator uses ANTLR4TS to parse proto files according to the official Protobuf3 grammar:

```
Proto File → ANTLR Parser → Abstract Syntax Tree (AST)
```

**What happens:**
- Tokenizes proto file content
- Validates syntax against Protobuf3 grammar
- Builds an AST representation
- Extracts all proto elements (services, messages, enums, imports)

### 2. Validation Phase

Before code generation, the generator validates:

- ✅ Package names follow protobuf conventions
- ✅ Service names are unique
- ✅ Message names are unique
- ✅ Field numbers are unique and valid
- ✅ Type references resolve correctly
- ✅ No circular dependencies
- ✅ Import paths are valid

**Error Handling:**
- Validation errors include file location, line number, and suggestions
- Multiple errors are collected and reported together
- Descriptive error codes help identify issues quickly

### 3. Type Resolution Phase

The generator resolves all type references:

```
Field Type Reference → Type Mapper → TypeScript Type
```

**Type Mappings:**
- Scalar types → TypeScript primitives
- Message types → Generated TypeScript interfaces
- Enum types → TypeScript enums
- Repeated types → Array<T>
- Map types → Map<K, V> or Record<K, V>
- Well-known types → @types/google-protobuf

### 4. Code Generation Phase

The generator produces TypeScript code using Handlebars templates:

**Generated Files per Proto File:**
1. **Messages File** (`*.pb.ts`) - Message type definitions
2. **Service Stub File** (`*_service.ts`) - gRPC client stubs
3. **React Hooks File** (`*.hooks.ts`) - Optional React hooks
4. **Enum File** (`*_enums.ts`) - Standalone enum definitions

**Template System:**
- Uses Handlebars for flexible templating
- Supports custom templates
- Automatic import optimization
- Type-safe code generation

### 5. Memory-Efficient Generation

For large proto files, the generator supports chunked processing:

**Features:**
- **Chunked message generation** - Processes messages in configurable chunks
- **Chunked enum generation** - Processes enums in chunks
- **Dynamic chunk sizing** - Adjusts based on available memory
- **Cross-chunk dependency resolution** - Resolves imports across chunks
- **Progress reporting** - Shows generation progress
- **Garbage collection** - Triggers GC between chunks if needed

**Configuration:**
```typescript
const generator = new MemoryEfficientGenerator({
  chunkSize: 10,              // Items per chunk
  memoryLimit: 500 * 1024 * 1024,  // 500MB limit
  useStreaming: true,
  gcInterval: 100,            // GC every 100 operations
});
```

## Transport Adapters

The generator supports two transport mechanisms:

### gRPC-Web Adapter (Legacy)
- Uses `@improbable-eng/grpc-web`
- Requires Envoy proxy for browser support
- Supports unary and server streaming
- Limited client/bidi streaming support

### Native gRPC Adapter (Recommended)
- Uses `@grpc/grpc-js`
- Direct Node.js gRPC support
- Full support for all streaming patterns
- Better performance
- Official gRPC implementation

**Adapter Selection:**
```typescript
const stub = new ServiceStub('localhost:50051', {
  adapterType: 'native',  // 'grpc-web' | 'native' | 'auto'
});
```

## React Integration

### Regular Hooks

Generated hooks provide loading/error states:

```typescript
const { data, error, loading, refetch } = useGrpc(
  ServiceStub,
  client => client.methodName(request)
);
```

**Features:**
- Automatic loading state management
- Error handling
- Request deduplication
- Refetch capability
- Request memoization (optional)

### Suspense Hooks

For React Suspense integration:

```typescript
const { data } = useSuspenseGrpc(
  ServiceStub,
  client => client.methodName(request)
);
```

**Features:**
- Suspense-compatible
- Uses React `use()` hook
- Automatic request caching
- Error boundaries integration

## Known Limitations

### 1. Browser Compatibility

**Native gRPC Adapter:**
- ❌ Does not work in browsers
- ✅ Works in Node.js environments
- Use gRPC-Web adapter for browser support

### 2. Streaming in Browsers

**gRPC-Web Limitations:**
- ✅ Server streaming works
- ⚠️ Client streaming has limited support
- ⚠️ Bidirectional streaming has limited support
- Requires Envoy proxy configuration

### 3. Large Proto Files

**Performance Considerations:**
- Files with 1000+ messages may take longer to generate
- Use memory-efficient generation for large schemas
- Consider splitting large proto files

### 4. Well-Known Types

**Support Status:**
- ✅ Timestamp, Duration, Empty
- ✅ Any, Struct, Value
- ⚠️ Field masks require manual handling
- ⚠️ Wrappers (StringValue, etc.) work but may need casting

## Best Practices

### 1. Proto File Organization

```
proto/
├── common/           # Shared types
│   ├── timestamp.proto
│   └── types.proto
├── services/         # Service definitions
│   ├── user.proto
│   └── auth.proto
└── google/          # Well-known types
    └── protobuf/
```

### 2. Naming Conventions

- **Services:** PascalCase (e.g., `UserService`)
- **Messages:** PascalCase (e.g., `UserProfile`)
- **Fields:** snake_case (e.g., `user_id`)
- **Enums:** PascalCase with UPPER_CASE values
- **Packages:** lowercase with dots (e.g., `com.example.api`)

### 3. Error Handling

Always handle gRPC errors:

```typescript
try {
  const response = await stub.method(request);
} catch (error) {
  if (error instanceof GrpcError) {
    switch (error.code) {
      case GrpcStatusCode.NOT_FOUND:
        // Handle not found
        break;
      case GrpcStatusCode.PERMISSION_DENIED:
        // Handle permission denied
        break;
      default:
        // Handle other errors
    }
  }
}
```

### 4. Memory Management

For large-scale generation:

```typescript
// Enable memory-efficient mode
const memEfficientGen = new MemoryEfficientGenerator({
  chunkSize: 50,
  memoryLimit: 1024 * 1024 * 1024, // 1GB
});

// Process in chunks with progress tracking
for await (const { files, metadata } of memEfficientGen.generateMessagesInChunks(
  messages,
  generateFn
)) {
  console.log(`Processed chunk ${metadata.index + 1}/${metadata.totalChunks}`);
  // Write files
}
```

## Troubleshooting

### Issue: "Type not found"

**Cause:** Type is defined in another file but import is missing

**Solution:** Ensure proto file has correct import statement:
```protobuf
import "path/to/other.proto";
```

### Issue: "Circular dependency detected"

**Cause:** Messages reference each other in a cycle

**Solution:** Refactor to break the cycle or use forward declarations

### Issue: "Memory limit exceeded"

**Cause:** Trying to generate code for very large proto file

**Solution:** Enable memory-efficient generation with appropriate chunk size

### Issue: "Method not found on stub"

**Cause:** Generated code out of sync with proto file

**Solution:** Regenerate code after proto file changes

## Future Enhancements

### Planned Features
- [ ] Proto2 full support
- [ ] Advanced custom options handling
- [ ] Incremental generation (only changed files)
- [ ] Source maps for debugging
- [ ] Custom template engine plugins

### Under Consideration
- [ ] gRPC reflection support
- [ ] OpenAPI/Swagger generation
- [ ] GraphQL adapter
- [ ] TypeScript declaration maps

## References

- [Protocol Buffers Language Guide (proto3)](https://protobuf.dev/programming-guides/proto3/)
- [gRPC Concepts](https://grpc.io/docs/what-is-grpc/core-concepts/)
- [@grpc/grpc-js Documentation](https://grpc.github.io/grpc/node/)
- [React Suspense](https://react.dev/reference/react/Suspense)

---

**Document Version:** 1.0
**Last Updated:** 2025-10-28
**Generator Version:** 2.0+
