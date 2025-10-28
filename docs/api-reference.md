# API Reference

Complete API reference for Hallow gRPC Generator and Runtime.

## Table of Contents

- [Generator API](#generator-api)
- [Service Stubs](#service-stubs)
- [Transport Adapters](#transport-adapters)
- [React Hooks](#react-hooks)
- [Memory-Efficient Generation](#memory-efficient-generation)
- [Error Handling](#error-handling)
- [Utilities](#utilities)

---

## Generator API

### Generator

Main class for code generation from proto files.

#### Constructor

```typescript
new Generator(options?: GeneratorOptions)
```

**Parameters:**
- `options` (optional): Configuration options
  - `version?: string` - Generator version (auto-loaded from package.json)
  - `enableMemoryOptimization?: boolean` - Enable memory-efficient generation
  - `chunkSize?: number` - Chunk size for memory-efficient mode (default: 10)
  - `memoryLimit?: number` - Memory limit in bytes (default: 500MB)

**Example:**
```typescript
import { Generator } from '@hallow/generator';

const generator = new Generator({
  enableMemoryOptimization: true,
  chunkSize: 50,
  memoryLimit: 1024 * 1024 * 1024, // 1GB
});
```

#### generate()

Generate TypeScript code from proto file.

```typescript
generator.generate(protoFile: ProtoFile): Promise<GeneratedFile[]>
```

**Parameters:**
- `protoFile`: Parsed proto file AST

**Returns:** Promise of generated files

**Example:**
```typescript
const files = await generator.generate(protoFile);

files.forEach(file => {
  fs.writeFileSync(file.path, file.content);
});
```

---

## Service Stubs

### ServiceStub

Generated service stub class for gRPC communication.

#### Constructor

```typescript
new ServiceStub(
  serverUrl: string,
  options?: ServiceStubOptions
)
```

**Parameters:**
- `serverUrl`: gRPC server URL (e.g., 'localhost:50051')
- `options` (optional): Configuration options
  - `adapterType?: 'grpc-web' | 'native' | 'auto'` - Transport adapter type
  - `enableNativeGrpc?: boolean` - Enable native gRPC (default: true in Node.js)
  - `defaultCallOptions?: CallOptions` - Default options for all calls
  - `secure?: boolean` - Use TLS/SSL (default: false)
  - `credentials?: grpc.ChannelCredentials` - Custom credentials

**Example:**
```typescript
import { UserServiceStub } from './generated/user_service';

// Auto-detection (recommended)
const stub = new UserServiceStub('localhost:50051', {
  adapterType: 'auto',
});

// Explicit native gRPC
const stub = new UserServiceStub('localhost:50051', {
  adapterType: 'native',
  secure: true,
});
```

#### Unary Methods

Call a unary RPC method.

```typescript
async methodName(
  request: RequestType,
  options?: CallOptions
): Promise<ResponseType>
```

**Parameters:**
- `request`: RPC request message
- `options` (optional): Call options
  - `timeout?: number` - Request timeout in milliseconds
  - `metadata?: Metadata` - Request metadata
  - `signal?: AbortSignal` - Abort signal

**Returns:** Promise of response message

**Example:**
```typescript
const response = await stub.getUser(
  { userId: '123' },
  {
    timeout: 5000,
    metadata: new grpc.Metadata().set('authorization', 'Bearer token'),
  }
);

console.log('User:', response.name);
```

#### Server Streaming Methods

Call a server streaming RPC method.

```typescript
methodName(
  request: RequestType,
  options?: CallOptions
): Observable<ResponseType>
```

**Parameters:**
- `request`: RPC request message
- `options` (optional): Call options

**Returns:** RxJS Observable of response messages

**Example:**
```typescript
import { take } from 'rxjs/operators';

stub.listUsers({ pageSize: 10 })
  .pipe(take(10))
  .subscribe({
    next: (user) => console.log('User:', user),
    error: (error) => console.error('Error:', error),
    complete: () => console.log('Stream complete'),
  });
```

#### Client Streaming Methods

Call a client streaming RPC method.

```typescript
methodName(
  options?: CallOptions
): ClientStreamingCall<RequestType, ResponseType>
```

**Parameters:**
- `options` (optional): Call options

**Returns:** Client streaming call interface

**Example:**
```typescript
const call = stub.recordMetrics();

// Write multiple requests
call.write({ metric: 'cpu', value: 0.8 });
call.write({ metric: 'memory', value: 0.6 });
call.end();

// Get response
const response = await call.getResponse();
console.log('Recorded:', response.count);
```

#### Bidirectional Streaming Methods

Call a bidirectional streaming RPC method.

```typescript
methodName(
  options?: CallOptions
): BidiStreamingCall<RequestType, ResponseType>
```

**Parameters:**
- `options` (optional): Call options

**Returns:** Bidirectional streaming call interface

**Example:**
```typescript
const call = stub.chat();

// Send messages
call.write({ message: 'Hello' });

// Receive messages
call.responses().subscribe({
  next: (response) => console.log('Received:', response.message),
});

// Send more and end
setTimeout(() => {
  call.write({ message: 'Goodbye' });
  call.end();
}, 1000);
```

#### close()

Close the stub and clean up resources.

```typescript
stub.close(): void
```

**Example:**
```typescript
// Always close when done
stub.close();

// Or use with try-finally
try {
  await stub.getUser({ userId: '123' });
} finally {
  stub.close();
}
```

---

## Transport Adapters

### ITransportAdapter

Base interface for all transport adapters.

```typescript
interface ITransportAdapter {
  unary<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    request: TRequest,
    options?: CallOptions
  ): Promise<TResponse>;

  serverStream<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    request: TRequest,
    options?: CallOptions
  ): Observable<TResponse>;

  clientStream<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    options?: CallOptions
  ): ClientStreamingCall<TRequest, TResponse>;

  bidiStream<TRequest, TResponse>(
    method: MethodDescriptor<TRequest, TResponse>,
    options?: CallOptions
  ): BidiStreamingCall<TRequest, TResponse>;

  close(): void;
}
```

### NativeGrpcAdapter

Native gRPC adapter using @grpc/grpc-js.

**Features:**
- Full streaming support
- Better performance
- Official implementation
- Node.js only

**Usage:**
```typescript
import { NativeGrpcAdapter } from '@hallow/grpc-core';

const adapter = new NativeGrpcAdapter({
  serverUrl: 'localhost:50051',
  secure: false,
});
```

### GrpcWebAdapter

Legacy grpc-web adapter.

**Features:**
- Browser support
- Limited streaming
- Requires Envoy proxy

**Usage:**
```typescript
import { GrpcWebAdapter } from '@hallow/grpc-core';

const adapter = new GrpcWebAdapter({
  serverUrl: 'https://api.example.com:8080',
  secure: true,
});
```

### AdapterFactory

Factory for creating appropriate adapters.

```typescript
AdapterFactory.create(config: AdapterFactoryConfig): ITransportAdapter
```

**Example:**
```typescript
const adapter = AdapterFactory.create({
  serverUrl: 'localhost:50051',
  adapterType: 'auto', // Auto-detect best adapter
});
```

---

## React Hooks

### useGrpc

React hook for unary gRPC calls with loading/error states.

```typescript
function useGrpc<TRequest, TResponse>(
  stubClass: new (url: string, options?: any) => any,
  callFn: (client: any) => Promise<TResponse>,
  options?: UseGrpcOptions
): UseGrpcResult<TResponse>
```

**Parameters:**
- `stubClass`: Service stub class
- `callFn`: Function that makes the gRPC call
- `options` (optional): Hook options
  - `url?: string` - Server URL
  - `enabled?: boolean` - Enable/disable the query
  - `onSuccess?: (data: TResponse) => void` - Success callback
  - `onError?: (error: Error) => void` - Error callback
  - `refetchInterval?: number` - Auto-refetch interval

**Returns:**
- `data`: Response data (undefined while loading)
- `error`: Error object (null if no error)
- `loading`: Loading state
- `refetch`: Function to refetch data

**Example:**
```typescript
import { useGrpc } from './generated/user.hooks';
import { UserServiceStub } from './generated/user_service';

function UserProfile({ userId }) {
  const { data, error, loading, refetch } = useGrpc(
    UserServiceStub,
    client => client.getUser({ userId }),
    {
      url: 'localhost:50051',
      enabled: !!userId,
      onSuccess: (user) => console.log('Loaded:', user.name),
    }
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### useSuspenseGrpc

React hook for unary gRPC calls with Suspense support.

```typescript
function useSuspenseGrpc<TRequest, TResponse>(
  stubClass: new (url: string, options?: any) => any,
  callFn: (client: any) => Promise<TResponse>,
  options?: UseSuspenseGrpcOptions
): TResponse
```

**Parameters:**
- `stubClass`: Service stub class
- `callFn`: Function that makes the gRPC call
- `options` (optional): Hook options

**Returns:** Response data (suspends while loading)

**Example:**
```typescript
import { Suspense } from 'react';
import { useSuspenseGrpc } from './generated/user.hooks';
import { UserServiceStub } from './generated/user_service';

function UserProfile({ userId }) {
  const user = useSuspenseGrpc(
    UserServiceStub,
    client => client.getUser({ userId }),
    { url: 'localhost:50051' }
  );

  return <h1>{user.name}</h1>;
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfile userId="123" />
    </Suspense>
  );
}
```

### useGrpcStream

React hook for server streaming gRPC calls.

```typescript
function useGrpcStream<TRequest, TResponse>(
  stubClass: new (url: string, options?: any) => any,
  callFn: (client: any) => Observable<TResponse>,
  options?: UseGrpcStreamOptions
): UseGrpcStreamResult<TResponse>
```

**Parameters:**
- `stubClass`: Service stub class
- `callFn`: Function that makes the streaming call
- `options` (optional): Hook options

**Returns:**
- `data`: Array of received messages
- `error`: Error object
- `loading`: Loading state
- `completed`: Whether stream is complete

**Example:**
```typescript
import { useGrpcStream } from './generated/user.hooks';
import { UserServiceStub } from './generated/user_service';

function UserList() {
  const { data, error, loading, completed } = useGrpcStream(
    UserServiceStub,
    client => client.listUsers({ pageSize: 10 }),
    { url: 'localhost:50051' }
  );

  if (loading && data.length === 0) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
      {!completed && <div>Receiving more...</div>}
    </div>
  );
}
```

---

## Memory-Efficient Generation

### MemoryEfficientGenerator

Generator for large proto files with memory constraints.

#### Constructor

```typescript
new MemoryEfficientGenerator(options?: StreamingGenerationOptions)
```

**Parameters:**
- `options` (optional):
  - `chunkSize?: number` - Items per chunk (default: 10)
  - `memoryLimit?: number` - Memory limit in bytes (default: 500MB)
  - `useStreaming?: boolean` - Enable streaming (default: true)
  - `gcInterval?: number` - GC interval in operations (default: 100)
  - `cacheStrategy?: 'lru' | 'fifo' | 'none'` - Cache strategy (default: 'lru')
  - `cacheSize?: number` - Maximum cache entries (default: 1000)

**Example:**
```typescript
const generator = new MemoryEfficientGenerator({
  chunkSize: 50,
  memoryLimit: 1024 * 1024 * 1024, // 1GB
  gcInterval: 50,
});
```

#### generateMessagesInChunks()

Generate messages in memory-efficient chunks.

```typescript
async *generateMessagesInChunks(
  messages: MessageDefinition[],
  generator: (messages: MessageDefinition[]) => Promise<GeneratedFile[]>
): AsyncGenerator<{ files: GeneratedFile[]; metadata: ChunkMetadata }>
```

**Parameters:**
- `messages`: Array of message definitions
- `generator`: Function to generate code for messages

**Yields:** Object containing generated files and metadata

**Example:**
```typescript
for await (const { files, metadata } of generator.generateMessagesInChunks(
  messages,
  async (chunk) => messageGenerator.generate(chunk)
)) {
  console.log(
    `Chunk ${metadata.index + 1}/${metadata.totalChunks}: ` +
    `${metadata.itemCount} messages, ${(metadata.memoryUsage / 1024 / 1024).toFixed(2)}MB`
  );

  // Write files
  files.forEach(file => {
    fs.writeFileSync(file.path, file.content);
  });
}
```

#### generateEnumsInChunks()

Generate enums in memory-efficient chunks.

```typescript
async *generateEnumsInChunks(
  enums: EnumDefinition[],
  generator: (enums: EnumDefinition[]) => Promise<GeneratedFile[]>
): AsyncGenerator<{ files: GeneratedFile[]; metadata: ChunkMetadata }>
```

**Usage:** Same as generateMessagesInChunks

#### resolveCrossChunkDependencies()

Resolve dependencies across chunks.

```typescript
resolveCrossChunkDependencies(chunkIndex: number): ResolvedImport[]
```

**Parameters:**
- `chunkIndex`: Index of current chunk

**Returns:** Array of resolved imports

**Example:**
```typescript
const imports = generator.resolveCrossChunkDependencies(0);
imports.forEach(imp => {
  console.log(`Import from ${imp.source}: ${imp.types.join(', ')}`);
});
```

---

## Error Handling

### GrpcError

Base error class for gRPC errors.

```typescript
class GrpcError extends Error {
  code: GrpcStatusCode;
  metadata?: Metadata;
  details?: any;

  constructor(
    code: GrpcStatusCode,
    message: string,
    metadata?: Metadata,
    details?: any
  );

  is(code: GrpcStatusCode): boolean;
  getDescription(): string;
}
```

**Example:**
```typescript
try {
  await stub.getUser({ userId: '123' });
} catch (error) {
  if (error instanceof GrpcError) {
    console.error(`gRPC Error [${error.code}]: ${error.message}`);
    console.error('Description:', error.getDescription());

    if (error.is(GrpcStatusCode.NOT_FOUND)) {
      // Handle not found
    } else if (error.is(GrpcStatusCode.PERMISSION_DENIED)) {
      // Handle permission denied
    }
  }
}
```

### GrpcStatusCode

Enum of gRPC status codes.

```typescript
enum GrpcStatusCode {
  OK = 0,
  CANCELLED = 1,
  UNKNOWN = 2,
  INVALID_ARGUMENT = 3,
  DEADLINE_EXCEEDED = 4,
  NOT_FOUND = 5,
  ALREADY_EXISTS = 6,
  PERMISSION_DENIED = 7,
  RESOURCE_EXHAUSTED = 8,
  FAILED_PRECONDITION = 9,
  ABORTED = 10,
  OUT_OF_RANGE = 11,
  UNIMPLEMENTED = 12,
  INTERNAL = 13,
  UNAVAILABLE = 14,
  DATA_LOSS = 15,
  UNAUTHENTICATED = 16,
}
```

---

## Utilities

### ImportManager

Manager for TypeScript import statements.

```typescript
class ImportManager {
  addNamedImport(source: string, name: string, typeOnly?: boolean): void;
  addDefaultImport(source: string, name: string): void;
  addNamespaceImport(source: string, name: string): void;
  getImports(): ImportCollectionResult;
  getImportStatement(source: string): string | null;
  optimizeImports(): void;
  generateImports(): string;
}
```

**Example:**
```typescript
const imports = new ImportManager();

imports.addNamedImports('react', ['useState', 'useEffect']);
imports.addNamedImport('rxjs', 'Observable');
imports.optimizeImports();

const code = imports.generateImports();
console.log(code);
// Output:
// import { useEffect, useState } from 'react';
// import { Observable } from 'rxjs';
```

### DependencyResolver

Resolver for cross-chunk dependencies.

```typescript
class DependencyResolver {
  addMessage(message: MessageDefinition, chunkIndex: number): void;
  addEnum(enumDef: EnumDefinition, chunkIndex: number): void;
  resolveCrossChunkDependencies(currentChunkIndex: number): ResolvedImport[];
  detectCircularDependencies(): string[] | null;
  getTopologicalOrder(): string[];
}
```

**Example:**
```typescript
const resolver = new DependencyResolver();

// Track dependencies
messages.forEach((msg, idx) => {
  resolver.addMessage(msg, Math.floor(idx / 10));
});

// Detect cycles
const cycles = resolver.detectCircularDependencies();
if (cycles) {
  console.error('Circular dependencies:', cycles);
}

// Get topological order
const order = resolver.getTopologicalOrder();
console.log('Generation order:', order);
```

---

## Type Definitions

### CallOptions

Options for gRPC calls.

```typescript
interface CallOptions {
  timeout?: number;
  metadata?: Metadata;
  signal?: AbortSignal;
}
```

### MethodDescriptor

Descriptor for gRPC methods.

```typescript
interface MethodDescriptor<TRequest = any, TResponse = any> {
  serviceName: string;
  methodName: string;
  requestStream: boolean;
  responseStream: boolean;
  requestType: MessageType<TRequest>;
  responseType: MessageType<TResponse>;
}
```

### GeneratedFile

Generated TypeScript file.

```typescript
interface GeneratedFile {
  path: string;
  content: string;
}
```

---

## TypeScript Support

All APIs are fully typed with TypeScript. Import types as needed:

```typescript
import type {
  ServiceDefinition,
  MessageDefinition,
  EnumDefinition,
  GeneratedFile,
  CallOptions,
  GrpcStatusCode,
} from '@hallow/generator';
```

---

**Document Version:** 1.0
**Last Updated:** 2025-10-28
**API Version:** 2.0+
