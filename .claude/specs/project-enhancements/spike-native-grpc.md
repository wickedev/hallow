# Spike: Native gRPC Integration with @grpc/grpc-js

**Date:** 2025-10-27
**Status:** Completed
**Requirement:** 2.1 - Native gRPC Migration

## Executive Summary

This spike validates the feasibility and approach for migrating from `@improbable-eng/grpc-web` to the official `@grpc/grpc-js` library for native gRPC support in Node.js environments. The spike confirms that:

1. **@grpc/grpc-js is production-ready** with excellent TypeScript support
2. **Serialization with google-protobuf works seamlessly** without additional wrappers
3. **Observable-based streaming API is straightforward** to implement
4. **Metadata and error handling map cleanly** to our existing patterns
5. **Resource management is explicit** but well-documented

**Recommendation:** Proceed with full implementation using the adapter pattern outlined in this spike.

---

## Objectives

1. Validate compatibility of @grpc/grpc-js with google-protobuf serialization
2. Test unary RPC implementation patterns
3. Test server streaming implementation with Observable wrapper
4. Evaluate metadata handling (request headers, response trailers)
5. Assess error handling and status code mapping
6. Document architectural decisions and best practices

---

## Implementation Files

- `packages/generator/spike/native-grpc-poc.ts` - Unary RPC proof of concept
- `packages/generator/spike/streaming-poc.ts` - Server streaming proof of concept

---

## Findings

### 1. Unary RPC Implementation

#### Channel and Client Management

```typescript
// Create channel - manages HTTP/2 connection
const channel = new grpc.Channel(serverAddress, credentials, {
  'grpc.max_receive_message_length': -1, // No message size limit
  'grpc.max_send_message_length': -1,
});

// Create client using channel
const client = new grpc.Client(serverAddress, credentials, {});
```

**Key Observations:**
- One channel per server address (can be reused across calls)
- Channel options control message size, timeouts, etc.
- Explicit cleanup required via `channel.close()` and `client.close()`

#### Serialization with google-protobuf

```typescript
const serialize = (value: TRequest): Buffer => {
  const bytes = method.requestType.serializeBinary(value as any);
  return Buffer.from(bytes);
};

const deserialize = (bytes: Buffer): TResponse => {
  return method.responseType.deserializeBinary(new Uint8Array(bytes));
};
```

**Key Observations:**
- `serializeBinary()` returns `Uint8Array` - convert to `Buffer` for @grpc/grpc-js
- `deserializeBinary()` accepts `Uint8Array` - convert from `Buffer`
- No additional serialization layer needed
- Type safety maintained throughout

#### Making Unary Calls

```typescript
client.makeUnaryRequest(
  methodPath,              // /package.Service/Method
  serialize,               // Request serializer
  deserialize,             // Response deserializer
  request,                 // Request object
  metadata,                // grpc.Metadata
  { deadline },            // Call options
  (error, response) => {   // Callback
    if (error) {
      reject(convertError(error));
    } else {
      resolve(response);
    }
  }
);
```

**Key Observations:**
- Callback-based API (wrap in Promise for async/await)
- Method path format: `/{package.ServiceName}/{MethodName}`
- Deadline is absolute timestamp (milliseconds since epoch)
- Response is already deserialized in callback

#### Metadata Handling

```typescript
const metadata = new grpc.Metadata();
metadata.set('authorization', 'Bearer token123');
metadata.set('request-id', 'abc-123');
```

**Key Observations:**
- `grpc.Metadata` class provides clean key-value API
- Supports string and Buffer values
- Binary headers (keys ending with `-bin`) handled automatically
- Response metadata available in error/status objects

#### Error Handling

```typescript
interface ServiceError extends Error {
  code: grpc.status;      // Status code enum
  details: string;        // Error message
  metadata: grpc.Metadata; // Error metadata
}
```

**Status Codes:**
- Maps to standard gRPC status codes (OK, CANCELLED, UNKNOWN, etc.)
- Well-defined error semantics
- Error details in metadata for rich error information

**Key Observations:**
- ServiceError provides structured error information
- Status codes are well-documented and standardized
- Metadata can contain custom error details
- Clean mapping to our existing GrpcError class

---

### 2. Server Streaming Implementation

#### Stream Creation

```typescript
const stream = client.makeServerStreamRequest(
  methodPath,
  serialize,
  deserialize,
  request,
  metadata,
  { deadline }
);
```

**Returns:** `ClientReadableStream<TResponse>` - Node.js readable stream

#### Stream Events

**Available Events:**
1. **'data'** - Emitted for each response message
2. **'end'** - Stream completed successfully
3. **'error'** - Stream failed with error
4. **'status'** - Final status and trailing metadata
5. **'metadata'** - Initial metadata (headers) received

**Event Order:**
```
metadata → data → data → ... → data → status → end
                                   OR
metadata → error → status
```

#### Observable Wrapper

```typescript
serverStream<TRequest, TResponse>(
  method: MethodDescriptor<TRequest, TResponse>,
  request: TRequest,
  options?: CallOptions
): Observable<TResponse> {
  return new Observable<TResponse>((observer) => {
    const stream = client.makeServerStreamRequest(/* ... */);

    stream.on('data', (response) => observer.next(response));
    stream.on('end', () => observer.complete());
    stream.on('error', (error) => observer.error(convertError(error)));

    // Cleanup on unsubscribe
    return () => stream.cancel();
  });
}
```

**Key Observations:**
- Observable wrapper provides consistent API with GrpcWebAdapter
- RxJS integration is straightforward
- Cancellation via `stream.cancel()` on unsubscribe
- All stream events map cleanly to Observable semantics

#### Cancellation and Cleanup

```typescript
const subscription = stream.subscribe({
  next: (data) => console.log(data),
  complete: () => console.log('done'),
});

// Cancel stream
subscription.unsubscribe(); // Triggers stream.cancel()
```

**Key Observations:**
- `stream.cancel()` notifies server of cancellation
- Server receives CANCELLED status
- Must be called in Observable teardown function
- Critical for preventing resource leaks

---

### 3. Metadata Access Patterns

#### Request Metadata

```typescript
const metadata = new grpc.Metadata();
metadata.set('authorization', 'Bearer token');
metadata.set('x-request-id', 'uuid');
metadata.set('x-binary-header-bin', Buffer.from([1, 2, 3]));
```

#### Response Metadata

**Initial Metadata (Headers):**
```typescript
stream.on('metadata', (metadata: grpc.Metadata) => {
  const map = metadata.getMap();
  // { 'x-server-version': '1.0.0', ... }
});
```

**Trailing Metadata (Trailers):**
```typescript
stream.on('status', (status: grpc.StatusObject) => {
  const trailers = status.metadata;
  // Available after stream completes
});
```

**Key Observations:**
- Initial metadata arrives before any data
- Trailing metadata arrives with final status
- Both are `grpc.Metadata` instances
- Need to store for access via adapter methods

---

### 4. Timeout and Deadline Handling

#### Timeout (Relative)

```typescript
const timeout = 5000; // 5 seconds
const deadline = Date.now() + timeout;
client.makeUnaryRequest(/* ... */, { deadline }, /* ... */);
```

#### Deadline (Absolute)

```typescript
const deadline = new Date('2025-10-27T12:00:00Z').getTime();
client.makeUnaryRequest(/* ... */, { deadline }, /* ... */);
```

**Error on Timeout:**
```typescript
error.code === grpc.status.DEADLINE_EXCEEDED
```

**Key Observations:**
- Deadline is absolute timestamp in milliseconds
- Convert timeout to deadline by adding to `Date.now()`
- Server receives deadline and enforces it
- DEADLINE_EXCEEDED error is clear and actionable

---

## Architectural Decisions

### 1. Adapter Pattern

**Decision:** Implement `ITransportAdapter` interface that both `GrpcWebAdapter` and `NativeGrpcAdapter` implement.

**Rationale:**
- Enables gradual migration
- Maintains backward compatibility
- Allows runtime adapter selection based on environment

### 2. Observable-Based Streaming

**Decision:** Use RxJS Observable for all streaming APIs.

**Rationale:**
- Consistent with existing GrpcWebAdapter
- Well-understood patterns
- Clean cancellation via unsubscribe
- Composable with RxJS operators

### 3. Channel Reuse

**Decision:** Create one channel per server address, reuse across calls.

**Rationale:**
- HTTP/2 connection pooling
- Better performance
- Reduced connection overhead
- Matches gRPC best practices

### 4. Error Type Consistency

**Decision:** Convert `grpc.ServiceError` to our existing `GrpcError` type.

**Rationale:**
- Consistent error handling across adapters
- Maintains existing API contracts
- Easy to add adapter-specific error information

### 5. Metadata Conversion

**Decision:** Convert plain object metadata to `grpc.Metadata` in adapter.

**Rationale:**
- Simpler application-level API
- Adapter handles gRPC-specific details
- Consistent with GrpcWebAdapter pattern

---

## Performance Considerations

### HTTP/2 Benefits

- **Multiplexing:** Multiple RPCs over single connection
- **Header Compression:** Reduced overhead for metadata
- **Server Push:** Potential for optimization
- **Binary Framing:** More efficient than HTTP/1.1

### Connection Pooling

- Channel reuse reduces connection overhead
- HTTP/2 keeps connection alive
- Fewer TLS handshakes

### Backpressure

- HTTP/2 flow control handles backpressure automatically
- No explicit backpressure handling needed in adapter
- Observable backpressure can be added if needed

---

## Comparison: grpc-web vs @grpc/grpc-js

| Feature | @improbable-eng/grpc-web | @grpc/grpc-js |
|---------|--------------------------|---------------|
| **Protocol** | HTTP/1.1 or HTTP/2 (limited) | HTTP/2 (full) |
| **Environment** | Browser + Node.js | Node.js only |
| **Streaming** | Unary, Server streaming | All patterns |
| **Performance** | Good | Excellent |
| **Maintenance** | Community | Official gRPC team |
| **Client Streaming** | Limited | Full support |
| **Bidirectional Streaming** | Limited | Full support |
| **Binary Framing** | Custom | Standard gRPC |
| **Type Safety** | Good | Excellent |

---

## Recommended Implementation Approach

### Phase 1: Core Adapter (Unary + Server Streaming)

1. Create `ITransportAdapter` interface
2. Implement `NativeGrpcAdapter` for unary RPCs
3. Implement server streaming with Observable
4. Add metadata conversion utilities
5. Implement error mapping

### Phase 2: Full Streaming Support

1. Implement client streaming
2. Implement bidirectional streaming
3. Add advanced metadata features
4. Implement retry logic

### Phase 3: Integration

1. Create `AdapterFactory` for environment detection
2. Update service generator templates
3. Update React hooks to work with both adapters
4. Integration tests

### Phase 4: Migration

1. Documentation and migration guide
2. Feature flag for gradual rollout
3. Deprecation plan for grpc-web
4. Performance benchmarks

---

## Risk Assessment

### Low Risk

- ✅ Serialization compatibility verified
- ✅ TypeScript support excellent
- ✅ Error handling straightforward
- ✅ Metadata patterns clear

### Medium Risk

- ⚠️ Channel lifecycle management requires care
- ⚠️ Resource cleanup critical for long-running processes
- ⚠️ Streaming cancellation must be handled correctly

### Mitigation

- Implement comprehensive resource cleanup
- Add tests for channel lifecycle
- Document cancellation patterns
- Add timeout safeguards

---

## Next Steps

1. **Task 8.1:** Create `ITransportAdapter` interface ✅ (Ready to implement)
2. **Task 8.2:** Implement `AdapterFactory` ✅ (Ready to implement)
3. **Task 8.3:** Refactor `GrpcWebAdapter` to implement interface ✅ (Ready to implement)
4. **Task 9:** Implement `NativeGrpcAdapter` for unary RPCs
5. **Task 10:** Add server streaming support
6. **Task 11:** Add client and bidirectional streaming

---

## Code Samples

See spike implementation files for complete working examples:

- **Unary RPC:** `packages/generator/spike/native-grpc-poc.ts`
- **Server Streaming:** `packages/generator/spike/streaming-poc.ts`

---

## Conclusion

The spike successfully validates that @grpc/grpc-js is an excellent choice for native gRPC support in Hallow. The implementation approach is straightforward, the library is well-maintained, and the patterns integrate cleanly with our existing architecture.

**Recommendation:** Proceed with full implementation using the adapter pattern.

**Estimated Effort for Phase 1 (Unary + Server Streaming):**
- Interface design: 1 hour ✅
- Factory implementation: 2 hours ✅
- GrpcWebAdapter refactor: 1 hour ✅
- NativeGrpcAdapter unary: 8 hours
- Server streaming: 6 hours
- Metadata handling: 3 hours
- Error handling: 2 hours
- Testing: 8 hours

**Total:** ~31 hours for Phase 1

---

**Document Version:** 1.0
**Last Updated:** 2025-10-27
**Author:** Claude Code (AI Assistant)
**Status:** Completed - Ready for Implementation
