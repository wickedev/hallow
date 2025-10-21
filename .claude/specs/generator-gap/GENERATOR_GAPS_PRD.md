# Generator Code Quality Improvement - PRD

## Executive Summary
The Hallow gRPC generator successfully creates TypeScript service stub files from proto definitions, but the generated code has critical gaps that prevent it from being production-ready. This PRD outlines the improvements needed to generate complete, functional gRPC-web client code.

## Current State Analysis

### What Works
- ✅ Generator class successfully parses ProtoFile AST
- ✅ Template engine (Handlebars) is initialized and working
- ✅ Service stub class structure is generated
- ✅ Import statements are present
- ✅ Basic method structure and JSDoc comments are created
- ✅ CancellationToken interface is defined

### Critical Gaps Identified

#### Gap 1: Message Type Definitions Missing (CRITICAL)
**Current State:**
```typescript
;  // Lines 11-14 are empty semicolons
;
;
;
```

**Expected State:**
```typescript
export interface GetUserRequest {
  user_id: string;
}

export interface GetUserResponse {
  id: string;
  name: string;
  email: string;
}

export interface ListUsersRequest {
  page_size: number;
  page_token: string;
}

export interface ListUsersResponse {
  users: GetUserResponse[];
  next_page_token: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface StreamMessage {
  content: string;
  timestamp: number;
}
```

**Impact:** TypeScript compilation fails - all message type references are undefined.

---

#### Gap 2: Method Signatures Incomplete (CRITICAL)
**Current State:**
```typescript
/**
 * RPC method GetUser (unary)
 * @param request - GetUserRequest request message
 * @returns Promise<GetUserResponse> - Response message
    }, 0);  // ← No method signature!
  });
}
```

**Expected State:**
```typescript
/**
 * RPC method GetUser (unary)
 * @param request - GetUserRequest request message
 * @returns Promise<GetUserResponse> - Response message
 */
async GetUser(request: GetUserRequest): Promise<GetUserResponse> {
  return new Promise((resolve, reject) => {
    // Implementation
  });
}
```

**Impact:** Code is syntactically invalid - cannot compile.

---

#### Gap 3: gRPC-Web Client Initialization Missing (CRITICAL)
**Current State:**
```typescript
private readonly client: any;

constructor(private readonly baseUrl: string) {
  // Initialize gRPC-web client
  // TODO: Properly initialize with @improbable-eng/grpc-web
}
```

**Expected State:**
```typescript
constructor(private readonly baseUrl: string) {
  // Service descriptor and method descriptors will be used
  // for grpc.unary() and grpc.invoke() calls in each method
}
```

**Impact:** No actual gRPC communication possible - stub cannot connect to server.

---

#### Gap 4: Protobuf Serialization Logic Missing (CRITICAL)
**Current State:**
- No serialization/deserialization code
- Messages are plain TypeScript interfaces

**Expected State:**
For each RPC method, need:
1. Request serialization: `Request → Uint8Array`
2. Response deserialization: `Uint8Array → Response`

**Impact:** Cannot communicate with gRPC server - no wire format conversion.

---

#### Gap 5: CancellationToken Implementation Incomplete (HIGH)
**Current State:**
```typescript
cancel(): void {
  if (this._isCancelled) return;
  // Missing: callback execution!
}
```

**Expected State:**
```typescript
cancel(): void {
  if (this._isCancelled) return;
  this._isCancelled = true;
  this.cancelCallbacks.forEach(cb => cb());
  this.cancelCallbacks = [];
}
```

**Impact:** Stream cancellation doesn't work - resource leaks.

---

#### Gap 6: Server Streaming Uses Mock Data (MEDIUM)
**Current State:**
```typescript
// Mock implementation
if (index < mockResponses.length) {
  observer.next(mockResponses[index++] as any);
}
```

**Expected State:**
- Use `grpc.invoke()` for server streaming
- Convert server events to Observable

**Impact:** ListUsers method doesn't actually call the server.

---

#### Gap 7: Client/Bidirectional Streaming Not Implemented (MEDIUM)
**Current State:**
```typescript
// TODO: Implement actual gRPC-web client streaming
setTimeout(() => {
  reject(new Error('Client streaming not yet implemented'));
}, 0);
```

**Note:** gRPC-web has limited support for client/bidirectional streaming over HTTP/1.1.

**Impact:** CreateUsers and Chat methods throw errors.

---

## Requirements

### Functional Requirements

#### FR-1: Message Type Generation
- **Priority:** P0 (Critical)
- **Description:** Generate complete TypeScript interfaces for all proto messages
- **Acceptance Criteria:**
  - All message types defined in `.proto` are generated as TypeScript interfaces
  - Fields are correctly typed (string, number, boolean, arrays, nested messages)
  - Optional fields are properly marked with `?`
  - Repeated fields are generated as arrays
  - Map fields are generated as `Record<K, V>`
  - Nested message types are properly scoped

#### FR-2: Complete Method Signatures
- **Priority:** P0 (Critical)
- **Description:** Generate syntactically correct method declarations
- **Acceptance Criteria:**
  - Unary methods: `async methodName(request: RequestType): Promise<ResponseType>`
  - Server streaming: `methodName(request: RequestType): Observable<ResponseType>`
  - Client streaming: `methodName(): { send(), complete(), cancel() }`
  - Bidirectional streaming: `methodName(): { send(), responses, complete(), cancel() }`
  - All methods have proper JSDoc comments
  - Method bodies have valid placeholder implementations

#### FR-3: gRPC-Web Integration
- **Priority:** P0 (Critical)
- **Description:** Implement actual gRPC-web communication using `@improbable-eng/grpc-web`
- **Acceptance Criteria:**
  - Service descriptors are created for each service
  - Method descriptors are created for each RPC method
  - Unary calls use `grpc.unary()`
  - Server streaming uses `grpc.invoke()`
  - Requests are properly serialized
  - Responses are properly deserialized
  - Errors are properly handled

#### FR-4: Protobuf Serialization
- **Priority:** P0 (Critical)
- **Description:** Generate serialization/deserialization logic for messages
- **Acceptance Criteria:**
  - Each message has `serializeBinary()` method
  - Each message has static `deserializeBinary()` method
  - Use `google-protobuf` or generate custom serialization
  - Handle all protobuf types correctly
  - Support nested messages and repeated fields

#### FR-5: Stream Cancellation
- **Priority:** P1 (High)
- **Description:** Implement complete cancellation logic
- **Acceptance Criteria:**
  - `CancellationToken.cancel()` executes all callbacks
  - Callbacks are cleared after execution
  - Streaming methods properly clean up on cancellation
  - No resource leaks

### Non-Functional Requirements

#### NFR-1: Code Quality
- Generated code must pass TypeScript strict mode compilation
- No `any` types in public APIs
- Proper error handling with typed errors
- Comprehensive JSDoc comments

#### NFR-2: Template Maintainability
- Templates should be easy to understand and modify
- Clear separation between template logic and data
- Reusable template partials for common patterns
- Template comments explaining complex logic

#### NFR-3: Testing
- Generated code should be testable
- Include mock/stub utilities for testing
- Integration tests with real gRPC server
- Unit tests for serialization/deserialization

## Implementation Strategy

### Phase 1: Fix Message Type Generation (Week 1)
**Goal:** Generate complete TypeScript interfaces for all proto messages

**Tasks:**
1. Investigate why message types are not being generated
2. Fix template logic for message interface generation
3. Add support for all protobuf field types
4. Handle nested messages and enums
5. Test with complex proto files

**Files to Modify:**
- `packages/generator/src/templates/service.hbs` (or equivalent)
- `packages/generator/src/generators/message-generator.ts`
- Template partials for message fields

**Validation:**
```bash
node generate.js
# Check that src/service.service.ts contains all message interfaces
```

---

### Phase 2: Complete Method Signatures (Week 1-2)
**Goal:** Generate syntactically valid method declarations

**Tasks:**
1. Fix template placeholders for method names and parameters
2. Ensure proper method signature for each RPC type
3. Generate correct return types
4. Add method bodies with TODO comments
5. Validate TypeScript compilation

**Files to Modify:**
- `packages/generator/src/templates/service.hbs`
- `packages/generator/src/generators/service-generator.ts`

**Validation:**
```bash
node generate.js
cd src && tsc --noEmit service.service.ts
# Should compile without errors
```

---

### Phase 3: Implement gRPC-Web Client (Week 2-3)
**Goal:** Add actual gRPC-web communication logic

**Tasks:**
1. Create service descriptor generation
2. Create method descriptor generation
3. Implement unary method template
4. Implement server streaming template
5. Add request serialization calls
6. Add response deserialization calls
7. Integrate error handling

**Files to Modify:**
- `packages/generator/src/templates/service.hbs`
- `packages/generator/src/generators/service-generator.ts`
- Add new template partials for descriptors

**Validation:**
```bash
# Start test gRPC server
cd packages/test-server && yarn start

# Run test client
cd packages/test-client
node generate.js
node test-grpc-client.js  # New test file
```

---

### Phase 4: Protobuf Serialization (Week 3-4)
**Goal:** Generate complete serialization logic

**Options:**
1. **Option A:** Use `google-protobuf` and generate Message classes
2. **Option B:** Generate custom serialization using `protobufjs`
3. **Option C:** Use JSON format with gRPC-web JSON mode (simpler but less efficient)

**Recommended:** Option C for MVP, then migrate to Option B for production

**Tasks:**
1. Decide on serialization approach
2. Generate serialization methods for each message
3. Update method templates to use serialization
4. Test with real proto messages
5. Performance benchmarking

---

### Phase 5: Fix Cancellation & Cleanup (Week 4)
**Goal:** Complete streaming cancellation implementation

**Tasks:**
1. Fix `CancellationToken.cancel()` implementation
2. Update streaming methods to properly cancel
3. Add resource cleanup in destructors
4. Test cancellation scenarios
5. Check for memory leaks

---

## Success Criteria

### Must Have (P0)
- [ ] All message types are generated as TypeScript interfaces
- [ ] All method signatures are syntactically correct
- [ ] Generated code compiles with TypeScript strict mode
- [ ] Unary RPC methods can successfully call gRPC server
- [ ] Server streaming methods work with real server
- [ ] No `any` types in public APIs

### Should Have (P1)
- [ ] Proper error handling and typed errors
- [ ] CancellationToken fully functional
- [ ] Comprehensive JSDoc comments
- [ ] Integration tests pass
- [ ] Resource cleanup works correctly

### Nice to Have (P2)
- [ ] Client streaming support (if gRPC-web supports it)
- [ ] Bidirectional streaming support
- [ ] Performance optimizations
- [ ] Mock/stub utilities for testing

## Testing Strategy

### Unit Tests
- Template rendering with various proto structures
- Message type generation for all field types
- Serialization/deserialization correctness
- Method signature generation

### Integration Tests
- Full workflow: proto → AST → generated code → compilation
- Real gRPC server communication
- Stream handling and cancellation
- Error scenarios

### Test Files
```
packages/generator/tests/
  unit/
    message-generator.test.ts
    service-generator.test.ts
    template-rendering.test.ts
  integration/
    complete-workflow.test.ts
    grpc-communication.test.ts
    streaming.test.ts
```

## Dependencies

### External Libraries
- `@improbable-eng/grpc-web` - gRPC-web client
- `google-protobuf` - Protobuf runtime
- `rxjs` - Observable support for streaming
- `handlebars` - Template engine

### Internal Dependencies
- `packages/parser` - Proto file parsing
- `packages/test-server` - Test gRPC server for validation

## Timeline

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 1 | Week 1 | Message types generated |
| Phase 2 | Week 1-2 | Valid method signatures |
| Phase 3 | Week 2-3 | Working gRPC-web calls |
| Phase 4 | Week 3-4 | Serialization complete |
| Phase 5 | Week 4 | Cleanup & polish |

**Total:** 4 weeks

## Risk Assessment

### High Risk
- **Protobuf serialization complexity** - May need custom implementation
  - Mitigation: Start with JSON format, migrate to binary later

- **gRPC-web limitations** - Client/bidirectional streaming not supported over HTTP/1.1
  - Mitigation: Document limitations, provide WebSocket fallback option

### Medium Risk
- **Template complexity** - Handlebars templates may become hard to maintain
  - Mitigation: Use template partials, add comprehensive comments

- **TypeScript strict mode compliance** - May require significant type work
  - Mitigation: Enable strict mode from the start, fix incrementally

### Low Risk
- **Test server compatibility** - Test server may not match production gRPC
  - Mitigation: Use standard gRPC reflection, test with real services

## Open Questions

1. Should we support both `google-protobuf` and `protobufjs` for serialization?
2. Do we need to generate React hooks in this phase, or defer to later?
3. Should client/bidirectional streaming throw errors or use WebSocket transport?
4. What error types should we define for gRPC errors?
5. Should we generate TypeScript declaration files (`.d.ts`) separately?

## References

- [gRPC-web Documentation](https://github.com/grpc/grpc-web)
- [@improbable-eng/grpc-web](https://github.com/improbable-eng/grpc-web)
- [google-protobuf](https://github.com/protocolbuffers/protobuf-javascript)
- [Handlebars Documentation](https://handlebarsjs.com/)
