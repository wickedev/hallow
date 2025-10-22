# TODO: Native gRPC Integration Tests

This document outlines the tasks needed to add native gRPC integration tests that connect directly to the NestJS gRPC server on port 50051 (bypassing Envoy proxy).

## Overview

Currently, we only have `grpc-web-integration.test.ts` which uses `@improbable-eng/grpc-web` to connect through Envoy proxy (port 8080). We need to add native gRPC tests using `@grpc/grpc-js` that connect directly to the gRPC server (port 50051).

## Tasks

### 1. Install Dependencies
- [ ] Add `@grpc/grpc-js` to devDependencies
- [ ] Add `@grpc/proto-loader` to devDependencies (if dynamic proto loading is needed)
- [ ] Run `yarn install` to install new packages

```bash
cd packages/generator
yarn add -D @grpc/grpc-js @grpc/proto-loader
```

### 2. Create GrpcAdapter Class

- [ ] Create new file: `src/adapters/GrpcAdapter.ts`
- [ ] Implement adapter interface similar to `GrpcWebAdapter.ts`
- [ ] Key differences from GrpcWebAdapter:
  - Uses `@grpc/grpc-js` instead of `@improbable-eng/grpc-web`
  - Native HTTP/2 gRPC protocol
  - Node.js only (not browser-compatible)
  - Direct channel/client management

#### Required Methods

- [ ] `unary<TRequest, TResponse>()` - Unary RPC calls
- [ ] `serverStream<TRequest, TResponse>()` - Server streaming RPC
- [ ] Error handling with proper gRPC status codes
- [ ] Metadata support
- [ ] Connection management (create/close channels)

### 3. Implement Unary RPC Method

- [ ] Implement unary call using `grpc.makeUnaryRequest()`
- [ ] Handle request serialization using `google-protobuf` messages
- [ ] Handle response deserialization
- [ ] Map gRPC status codes to custom error types
- [ ] Add timeout support
- [ ] Add metadata/headers support

### 4. Implement Server Streaming RPC Method

- [ ] Implement server streaming using `grpc.makeServerStreamRequest()`
- [ ] Return RxJS Observable for consistency with GrpcWebAdapter
- [ ] Handle stream events: `data`, `end`, `error`, `status`
- [ ] Implement cancellation support
- [ ] Add metadata support for streaming calls

### 5. Error Handling and Status Codes

- [ ] Create `GrpcNativeError` class (similar to `GrpcError`)
- [ ] Map all gRPC status codes:
  - OK (0)
  - CANCELLED (1)
  - UNKNOWN (2)
  - INVALID_ARGUMENT (3)
  - DEADLINE_EXCEEDED (4)
  - NOT_FOUND (5)
  - ... (all 17 status codes)
- [ ] Include metadata and trailers in errors
- [ ] Add human-readable error messages

### 6. Create Test File

- [ ] Create `tests/integration/grpc-integration.test.ts`
- [ ] Import generated service stubs
- [ ] Import `GrpcAdapter` class
- [ ] Set up test fixtures and helpers
- [ ] Configure connection to `localhost:50051`

### 7. Unary RPC Tests

- [ ] Test: should successfully call GetUser and receive response
- [ ] Test: should throw GrpcError on NOT_FOUND status
- [ ] Test: should throw error on INVALID_ARGUMENT (empty userId)
- [ ] Test: should handle special characters in userId
- [ ] Test: should handle very long userId (1000+ chars)
- [ ] Test: should include request metadata
- [ ] Test: should receive response trailers
- [ ] Test: should handle timeout properly
- [ ] Test: should handle connection errors

### 8. Server Streaming Tests

- [ ] Test: should successfully stream multiple ListUsers responses
- [ ] Test: should handle pagination correctly
- [ ] Test: should emit multiple batches of users
- [ ] Test: should complete stream when all users are sent
- [ ] Test: should emit error on stream failure
- [ ] Test: should include error code in streaming error
- [ ] Test: should handle stream cancellation
- [ ] Test: should support backpressure

### 9. Error Handling Tests

- [ ] Test: should handle server not available
- [ ] Test: should handle malformed requests
- [ ] Test: should handle timeout errors
- [ ] Test: should include proper status codes in errors
- [ ] Test: should preserve error metadata
- [ ] Test: should handle streaming errors gracefully

### 10. Metadata and Trailers Tests

- [ ] Test: should send custom metadata with request
- [ ] Test: should receive response metadata
- [ ] Test: should receive trailers on successful completion
- [ ] Test: should receive trailers on error
- [ ] Test: should handle multiple metadata values
- [ ] Test: should handle binary metadata

### 11. Compatibility Verification

- [ ] Verify `google-protobuf` generated messages work with `@grpc/grpc-js`
- [ ] Test that `serializeBinary()` output is compatible
- [ ] Test that response deserialization works correctly
- [ ] Compare behavior with `grpc-web-integration.test.ts` results
- [ ] Document any differences in behavior

### 12. Final Testing

- [ ] Run all tests: `yarn test tests/integration/grpc-integration.test.ts`
- [ ] Verify 100% test pass rate
- [ ] Check for memory leaks in streaming tests
- [ ] Verify proper cleanup of gRPC channels
- [ ] Run tests multiple times to ensure stability
- [ ] Update CI/CD configuration if needed

## Architecture Notes

### Comparison: gRPC-Web vs Native gRPC

| Feature | gRPC-Web (@improbable-eng) | Native gRPC (@grpc/grpc-js) |
|---------|---------------------------|----------------------------|
| Protocol | HTTP/1.1 | HTTP/2 |
| Transport | Browser + Node.js | Node.js only |
| Proxy | Requires Envoy | Direct connection |
| Port | 8080 (Envoy) | 50051 (NestJS) |
| Streaming | Limited (server only) | Full duplex |
| Performance | Slower (HTTP/1.1) | Faster (HTTP/2) |

### Generated Code Structure

Both adapters should work with the same generated TypeScript stubs:

```typescript
// Generated stub (works with both adapters)
export class UserServiceStub {
  constructor(baseUrl: string, adapter: GrpcWebAdapter | GrpcAdapter) {
    // ...
  }

  async getUser(request: GetUserRequest): Promise<GetUserResponse> {
    // Uses adapter.unary()
  }

  listUsers(request: ListUsersRequest): Observable<ListUsersResponse> {
    // Uses adapter.serverStream()
  }
}
```

## Dependencies to Add

```json
{
  "devDependencies": {
    "@grpc/grpc-js": "^1.9.0",
    "@grpc/proto-loader": "^0.7.10"
  }
}
```

## Files to Create/Modify

### New Files
- `src/adapters/GrpcAdapter.ts` - Native gRPC adapter implementation
- `tests/integration/grpc-integration.test.ts` - Native gRPC integration tests

### Modified Files
- `package.json` - Add new dependencies
- `src/adapters/index.ts` - Export GrpcAdapter
- `.github/workflows/*` - Update CI if needed

## Success Criteria

- [ ] All native gRPC tests pass (target: 28+ tests)
- [ ] No memory leaks in streaming tests
- [ ] Proper error handling and status codes
- [ ] Performance is better than gRPC-Web
- [ ] Documentation is complete
- [ ] Code coverage maintained or improved

## References

- [@grpc/grpc-js Documentation](https://grpc.github.io/grpc/node/)
- [gRPC Status Codes](https://grpc.io/docs/guides/error/)
- [Protocol Buffers - JavaScript](https://developers.google.com/protocol-buffers/docs/reference/javascript-generated)
- [NestJS Microservices - gRPC](https://docs.nestjs.com/microservices/grpc)

## Notes

- The native gRPC adapter is **not** intended for browser use
- Keep both GrpcWebAdapter and GrpcAdapter for different use cases
- Consider creating a factory pattern to select the appropriate adapter
- Test both adapters against the same server to ensure compatibility
