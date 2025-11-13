# Example Webpack Architecture

This document describes the architecture of the Hallow gRPC Webpack example application.

## Overview

The example demonstrates seamless gRPC-web integration with React 18, TypeScript, and Webpack 5. It showcases three different API patterns: Promise API, Hook API, and Suspense API.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser Client                              │
│  - React 18 Application                                         │
│  - @improbable-eng/grpc-web library                            │
│  - HTTP/1.1 + gRPC-web protocol                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ POST /grpc/greeting.GreetingService/Greet
                             │ Content-Type: application/grpc-web+proto
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              Webpack Dev Server (port 8080)                     │
│  - Hot Module Replacement (HMR)                                 │
│  - Static file serving                                          │
│  - Proxy configuration: /grpc → localhost:3000                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ Proxied HTTP request
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         @grpc-web/proxy (port 3000)                             │
│  - Official gRPC-web proxy for Node.js                          │
│  - Translates HTTP/1.1 gRPC-web → HTTP/2 native gRPC           │
│  - Handles CORS headers                                         │
│  - Manages trailer frame conversion                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/2 native gRPC
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         Native gRPC Server (port 50051)                         │
│  - @grpc/grpc-js implementation                                 │
│  - GreetingService with multiple RPC patterns:                  │
│    • Unary: Greet                                               │
│    • Server Streaming: StreamGreetings                          │
│    • Client Streaming: AccumulateGreetings                      │
│    • Bidirectional: Chat                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Request Flow

### 1. Client Request
```typescript
// Browser (PromiseExample.tsx)
const stub = new GreetingServiceStub({ serverUrl: '/grpc' });
const response = await stub.methods.greet({ name: 'World' });
```

### 2. gRPC-web Adapter
```
GrpcWebAdapter (packages/generator/src/adapters/GrpcWebAdapter.ts)
  ↓
Serializes request using protobuf
  ↓
Creates gRPC-web frame:
  [1 byte: compression flag]
  [4 bytes: message length]
  [N bytes: protobuf message]
  ↓
POST /grpc/greeting.GreetingService/Greet
```

### 3. Webpack Dev Server Proxy
```javascript
// webpack.dev.js
proxy: {
  '/grpc': {
    target: 'http://localhost:3000',
    pathRewrite: { '^/grpc': '' },
    changeOrigin: false,
  }
}
```

### 4. gRPC-web Proxy
```javascript
// server/src/index.ts
const proxyServer = proxy({
  target: 'http://localhost:50051',
  origin: ['http://localhost:8080'],
}).listen(3000);
```

The proxy:
- Receives HTTP/1.1 gRPC-web request
- Establishes HTTP/2 connection to native gRPC server
- Forwards request as native gRPC call
- Translates HTTP/2 response back to gRPC-web format
- Adds proper trailer frames with grpc-status and grpc-message

### 5. Native gRPC Server
```typescript
// server/src/services/greeting.service.ts
greet(call, callback) {
  const response = {
    reply: `Hello, ${request.name}!`,
    timestamp: Date.now(),
    metadata: {
      server_version: '1.0.0',
      request_id: Math.random().toString(36).substr(2, 9),
      tags: ['greet', 'unary'],
    },
  };
  callback(null, response);
}
```

### 6. Response Flow
```
Native gRPC Server
  ↓ HTTP/2 response
@grpc-web/proxy
  ↓ Converts to gRPC-web format:
    [Response Frame]
      0x00 (uncompressed flag)
      [4 bytes length]
      [protobuf message]
    [Trailer Frame]
      0x80 (trailer flag)
      [4 bytes length]
      "grpc-status: 0\r\ngrpc-message: OK\r\n"
  ↓
Webpack Dev Server (proxy pass-through)
  ↓
Browser Client
  ↓ @improbable-eng/grpc-web deserializes
GrpcWebAdapter.onEnd()
  ↓ Resolves Promise
React Component receives data
```

## Component Architecture

### Client-Side Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    React Components                         │
│  - PromiseExample.tsx (async/await)                         │
│  - HookExample.tsx (useGrpc)                                │
│  - SuspenseExample.tsx (useSuspenseGrpc)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Generated Service Stubs                        │
│  - GreetingServiceStub                                      │
│  - Auto-generated from greeting.proto                       │
│  - Located in: proto/greeting.proto.ts (virtual)            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Transport Adapters                             │
│  - GrpcWebAdapter (browser)                                 │
│  - NativeGrpcAdapter (node - stubbed in browser)            │
│  - Auto-selected via AdapterFactory                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│         @improbable-eng/grpc-web Library                    │
│  - Low-level gRPC-web protocol implementation               │
│  - Handles framing, trailers, and status codes              │
└─────────────────────────────────────────────────────────────┘
```

### Server-Side Layers

```
┌─────────────────────────────────────────────────────────────┐
│                   HTTP Server Layer                         │
│  - Express app (@grpc-web/proxy uses Connect)               │
│  - CORS middleware                                          │
│  - Error handling                                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              gRPC-web Proxy Middleware                      │
│  - Protocol translation (HTTP/1.1 ↔ HTTP/2)                 │
│  - Frame conversion (gRPC-web ↔ native gRPC)                │
│  - Trailer handling                                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                Native gRPC Server                           │
│  - @grpc/grpc-js                                            │
│  - gRPC Server instance                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Service Implementation                         │
│  - GreetingService class                                    │
│  - Business logic                                           │
│  - Request/response handling                                │
└─────────────────────────────────────────────────────────────┘
```

## Build Process

### Development Build Flow

```
┌─────────────────────────────────────────────────────────────┐
│               Source Files (.tsx, .ts)                      │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│          Import .proto file detected                        │
│  import { GreetingServiceStub } from './greeting.proto'     │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              @hallow/plugin (Unplugin)                      │
│  - Intercepts .proto imports                                │
│  - Triggers code generation                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              @hallow/parser                                 │
│  - ANTLR-based parser                                       │
│  - Parses Protobuf3 grammar                                 │
│  - Generates AST                                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              @hallow/generator                              │
│  - ServiceGenerator                                         │
│  - MessageGenerator                                         │
│  - EnumGenerator                                            │
│  - Generates TypeScript code from AST                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│        Generated TypeScript Code (virtual)                  │
│  - Service stubs with type definitions                      │
│  - Message interfaces                                       │
│  - Enum types                                               │
│  - Cached in .cache/hallow/                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              TypeScript Compiler                            │
│  - ts-loader                                                │
│  - Type checking                                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Webpack Bundle                                 │
│  - main.js (application code)                               │
│  - vendors.js (node_modules)                                │
│  - runtime.js (webpack runtime)                             │
└─────────────────────────────────────────────────────────────┘
```

## Protocol Details

### gRPC-web Frame Format

**Request Frame:**
```
┌──────────────┬──────────────────┬─────────────────────────┐
│ Compression  │ Message Length   │ Protobuf Message        │
│ (1 byte)     │ (4 bytes BE)     │ (N bytes)               │
│ 0x00 or 0x01 │ uint32           │ serialized proto        │
└──────────────┴──────────────────┴─────────────────────────┘
```

**Response Frames:**
```
┌─────────────────────────────────────────────────────────────┐
│                    Message Frame                            │
├──────────────┬──────────────────┬─────────────────────────┤
│ 0x00         │ Length           │ Response Message        │
│ (uncompressed)│ (4 bytes BE)    │ (N bytes)               │
└──────────────┴──────────────────┴─────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Trailer Frame                            │
├──────────────┬──────────────────┬─────────────────────────┤
│ 0x80         │ Length           │ HTTP-style trailers     │
│ (trailer flag)│ (4 bytes BE)    │ "grpc-status: 0\r\n..." │
└──────────────┴──────────────────┴─────────────────────────┘
```

### HTTP Headers

**Request Headers:**
```http
POST /grpc/greeting.GreetingService/Greet HTTP/1.1
Host: localhost:8080
Content-Type: application/grpc-web+proto
X-Grpc-Web: 1
Accept: application/grpc-web+proto
```

**Response Headers:**
```http
HTTP/1.1 200 OK
Content-Type: application/grpc-web+proto
Access-Control-Allow-Origin: http://localhost:8080
Access-Control-Expose-Headers: grpc-status,grpc-message
Transfer-Encoding: chunked
Grpc-Status: 0
Grpc-Message: OK
```

## Type Mapping

### Proto to TypeScript

| Proto Type | TypeScript Type | Notes |
|------------|----------------|-------|
| `string` | `string` | UTF-8 encoded |
| `int32` | `number` | 32-bit integer |
| `int64` | `string` | 64-bit int as string (JS number is 53-bit) |
| `bool` | `boolean` | true/false |
| `bytes` | `Uint8Array` | Binary data |
| `enum` | `enum` | TypeScript enum |
| `message` | `interface` | TypeScript interface |
| `repeated T` | `T[]` | Array type |
| `map<K,V>` | `{ [key: K]: V }` | Object/Map type |

### Field Naming Convention

Proto uses `snake_case`, generated TypeScript uses `camelCase`:

**Proto definition:**
```protobuf
message ResponseMetadata {
  string server_version = 1;
  string request_id = 2;
}
```

**Generated TypeScript:**
```typescript
interface ResponseMetadata {
  serverVersion: string;
  requestId: string;
}
```

**Runtime compatibility:**
```typescript
// Both naming conventions are supported in components
data.metadata?.serverVersion || data.metadata?.server_version
```

## Configuration

### Webpack Configuration

**webpack.common.js:**
- Hallow plugin setup
- TypeScript compilation
- Proto file resolution
- Node.js polyfills for browser

**webpack.dev.js:**
- Dev server configuration
- HMR (Hot Module Replacement)
- Proxy configuration for gRPC
- Source maps

### Server Configuration

**server/src/index.ts:**
```typescript
// Native gRPC server
const grpcServer = createServer();
await startServer(grpcServer, 50051);

// gRPC-web proxy
const proxyServer = proxy({
  target: 'http://localhost:50051',
  origin: ['http://localhost:8080'],
}).listen(3000);
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEV_SERVER_PORT` | 8080 | Webpack dev server port |
| `GRPC_SERVER_PORT` | 3000 | gRPC-web proxy port |
| `GRPC_SERVER_URL` | `/grpc` | Client-side server URL |
| `NODE_ENV` | `development` | Environment mode |

## Error Handling

### Error Flow

```
Server Error
  ↓
Native gRPC error with status code
  ↓
@grpc-web/proxy converts to gRPC-web trailer
  ↓
Trailer frame with grpc-status and grpc-message
  ↓
@improbable-eng/grpc-web parses trailer
  ↓
GrpcWebAdapter.onEnd receives error status
  ↓
Creates GrpcError instance
  ↓
Promise rejected with GrpcError
  ↓
React component catches error
```

### gRPC Status Codes

| Code | Name | Description |
|------|------|-------------|
| 0 | OK | Success |
| 1 | CANCELLED | Operation cancelled |
| 2 | UNKNOWN | Unknown error |
| 3 | INVALID_ARGUMENT | Invalid argument |
| 4 | DEADLINE_EXCEEDED | Timeout |
| 5 | NOT_FOUND | Resource not found |
| 7 | PERMISSION_DENIED | No permission |
| 14 | UNAVAILABLE | Service unavailable |
| 16 | UNAUTHENTICATED | Authentication required |

## Performance Considerations

### Bundle Size Optimization

1. **Code Splitting**: Webpack splits vendor and application code
2. **Tree Shaking**: Unused protobuf code is eliminated
3. **Import Optimization**: Only import required message types
4. **Compression**: gzip/brotli compression in production

### Runtime Performance

1. **Protobuf Serialization**: Binary format is compact and fast
2. **HTTP/2 Multiplexing**: Proxy uses HTTP/2 for multiple concurrent requests
3. **Connection Reuse**: Persistent connections reduce overhead
4. **Streaming**: Server/client streaming for large data transfers

### Development Performance

1. **HMR**: Fast refresh without full page reload
2. **Incremental Builds**: Only rebuild changed files
3. **Source Maps**: Fast debugging with original source
4. **Caching**: Proto generation cached in `.cache/hallow/`

## Security Considerations

### Development Mode

- CORS enabled for `localhost:8080`
- No authentication/authorization
- Insecure gRPC connections (no TLS)

### Production Recommendations

1. **TLS/SSL**: Enable HTTPS and secure gRPC
2. **Authentication**: Add JWT or session-based auth
3. **CORS**: Restrict allowed origins
4. **Rate Limiting**: Prevent abuse
5. **Input Validation**: Validate all user inputs
6. **Error Messages**: Don't leak sensitive information

## Troubleshooting

### Common Issues

**Issue: "Response closed without headers"**
- Cause: Incompatible gRPC-web proxy
- Solution: Use official `@grpc-web/proxy`

**Issue: Timestamp shows "Invalid Date"**
- Cause: int64 received as string
- Solution: `new Date(Number(timestamp))`

**Issue: Metadata fields undefined**
- Cause: Field name mismatch (snake_case vs camelCase)
- Solution: Support both: `metadata?.serverVersion || metadata?.server_version`

**Issue: CORS errors**
- Cause: Origin not allowed
- Solution: Update proxy origin configuration

**Issue: Connection refused on port 3000**
- Cause: gRPC-web proxy not running
- Solution: Run `yarn dev` to start both servers

## References

### Documentation

- [gRPC-web Protocol](https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-WEB.md)
- [@grpc-web/proxy](https://github.com/marella/node-grpc-web)
- [@improbable-eng/grpc-web](https://github.com/improbable-eng/grpc-web)
- [Protocol Buffers](https://developers.google.com/protocol-buffers)

### Related Files

- `proto/greeting.proto` - Service definitions
- `server/src/services/greeting.service.ts` - Service implementation
- `src/components/PromiseExample.tsx` - Promise API example
- `webpack.dev.js` - Webpack dev configuration
- `packages/generator/src/adapters/GrpcWebAdapter.ts` - Client adapter
