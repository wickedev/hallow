# Hallow Generator - Implementation Workflow
**Strategy:** Systematic | **Persona:** Backend Developer | **Timeline:** 4 Weeks

## Executive Summary
This workflow addresses 7 critical gaps in the Hallow gRPC generator to produce production-ready, type-safe TypeScript client code. The systematic approach ensures each gap is resolved with proper testing and validation before moving to the next phase.

---

## Phase 1: Message Type Generation (Days 1-3)
**Priority:** P0 Critical | **Estimated Time:** 16 hours

### Goal
Generate complete TypeScript interfaces for all protobuf message types.

### Tasks

#### Task 1.1: Investigate Template Rendering Issue
**Time:** 2 hours | **File:** `packages/generator/src/templates/service.hbs`

**Steps:**
1. Read the current Handlebars template
2. Identify where message types should be generated (lines 11-14)
3. Check if message data is passed to the template context
4. Debug template variables with console logging

**Acceptance Criteria:**
- [ ] Understand why lines 11-14 are empty semicolons
- [ ] Identify the template variable that should contain messages
- [ ] Document the current template structure

**Code Locations:**
```
packages/generator/src/templates/service.hbs:11-14
packages/generator/src/generators/service-generator.ts:generateCode()
```

---

#### Task 1.2: Create Message Interface Template Partial
**Time:** 3 hours | **File:** `packages/generator/src/templates/partials/message.hbs`

**Steps:**
1. Create new template partial for message interfaces
2. Handle all protobuf field types:
   - Primitive types (string, number, boolean)
   - Repeated fields (arrays)
   - Optional fields (with `?`)
   - Nested messages
   - Map fields (`Record<K, V>`)
   - Enum types
3. Add JSDoc comments for each interface
4. Export all interfaces

**Template Example:**
```handlebars
{{#each messages}}
/**
 * {{this.name}} message
 * {{#if this.comment}}{{this.comment}}{{/if}}
 */
export interface {{this.name}} {
  {{#each this.fields}}
  {{#if this.comment}}/** {{this.comment}} */{{/if}}
  {{this.name}}{{#if this.optional}}?{{/if}}: {{this.tsType}}{{#if this.repeated}}[]{{/if}};
  {{/each}}
}

{{/each}}
```

**Acceptance Criteria:**
- [ ] Template generates TypeScript interfaces
- [ ] All field types are correctly mapped
- [ ] Optional fields have `?` modifier
- [ ] Repeated fields are arrays
- [ ] Map fields use `Record<K, V>`
- [ ] Nested messages are properly typed

---

#### Task 1.3: Implement TypeScript Type Mapper
**Time:** 4 hours | **File:** `packages/generator/src/core/type-mapper.ts`

**Steps:**
1. Create type mapping function: `proto type → TS type`
2. Handle mappings:
   ```
   string  → string
   int32   → number
   int64   → number
   bool    → boolean
   bytes   → Uint8Array
   double  → number
   float   → number
   ```
3. Handle custom message types
4. Handle enum types
5. Add unit tests

**Acceptance Criteria:**
- [ ] All proto primitive types mapped
- [ ] Custom message types resolved
- [ ] Enum types handled
- [ ] Unit tests pass (>95% coverage)

**Test File:** `packages/generator/tests/unit/type-mapper.test.ts`

---

#### Task 1.4: Integrate Message Template into Main Template
**Time:** 2 hours

**Steps:**
1. Update `service.hbs` to include message partial
2. Pass message data to template context
3. Register partial with Handlebars
4. Test template rendering

**Code Changes:**
```typescript
// In ServiceGenerator
Handlebars.registerPartial('message', messageTemplate);

const context = {
  ...
  messages: protoFile.messages,
};
```

**Acceptance Criteria:**
- [ ] Messages are rendered in correct location
- [ ] No empty semicolons in output
- [ ] All messages from proto are generated

---

#### Task 1.5: Validation & Testing
**Time:** 5 hours

**Steps:**
1. Run generator with test proto file
2. Verify all message interfaces generated
3. Run TypeScript compiler on generated code
4. Test with complex proto (nested messages, maps, repeated fields)
5. Add integration test

**Acceptance Criteria:**
- [ ] Generated code compiles with `tsc --noEmit`
- [ ] All 6 message types from service.proto are present
- [ ] Complex proto files work correctly
- [ ] Integration test passes

**Validation Command:**
```bash
cd packages/test-client
node generate.js
cd src && tsc --noEmit service.service.ts
```

---

## Phase 2: Complete Method Signatures (Days 4-7)
**Priority:** P0 Critical | **Estimated Time:** 24 hours

### Goal
Generate syntactically correct method declarations for all RPC types.

### Tasks

#### Task 2.1: Fix Unary Method Template
**Time:** 4 hours

**Steps:**
1. Locate method generation code in template
2. Fix method signature for unary RPCs
3. Add proper async/await structure
4. Include error handling skeleton

**Template:**
```handlebars
{{#each methods}}
{{#unless this.clientStreaming}}{{#unless this.serverStream}}
/**
 * RPC method {{this.name}} (unary)
 * @param request - {{this.inputType}} request message
 * @returns Promise<{{this.outputType}}> - Response message
 */
async {{this.name}}(request: {{this.inputType}}): Promise<{{this.outputType}}> {
  return new Promise((resolve, reject) => {
    // TODO: Implement gRPC-web unary call
    reject(new Error('Not implemented'));
  });
}
{{/unless}}{{/unless}}
{{/each}}
```

**Acceptance Criteria:**
- [ ] Method name is present
- [ ] Parameters are typed
- [ ] Return type is Promise
- [ ] Method body is syntactically valid

---

#### Task 2.2: Fix Server Streaming Method Template
**Time:** 4 hours

**Steps:**
1. Create Observable return type
2. Add cancellation token parameter
3. Generate proper method signature

**Template:**
```handlebars
{{#if this.serverStream}}{{#unless this.clientStreaming}}
/**
 * RPC method {{this.name}} (server streaming)
 * @param request - {{this.inputType}} request message
 * @returns Observable stream of {{this.outputType}} messages
 */
{{this.name}}(request: {{this.inputType}}): Observable<{{this.outputType}}> {
  const cancellationToken = new CancellationTokenImpl();

  return new Observable<{{this.outputType}}>(observer => {
    // TODO: Implement gRPC-web server streaming
    observer.error(new Error('Not implemented'));

    return () => {
      cancellationToken.cancel();
    };
  });
}
{{/unless}}{{/if}}
```

**Acceptance Criteria:**
- [ ] Method returns Observable
- [ ] Generic type is correct
- [ ] Cancellation token created
- [ ] Method is syntactically valid

---

#### Task 2.3: Fix Client Streaming Method Template
**Time:** 4 hours

**Steps:**
1. Create client streaming interface
2. Return object with send/complete/cancel methods
3. Type all methods correctly

**Template:**
```handlebars
{{#if this.clientStreaming}}{{#unless this.serverStream}}
/**
 * RPC method {{this.name}} (client streaming)
 * @returns Object with send method and response promise
 */
{{this.name}}(): {
  send: (request: {{this.inputType}}) => void;
  complete: () => Promise<{{this.outputType}}>;
  cancel: () => void;
} {
  const requests: {{this.inputType}}[] = [];
  const cancellationToken = new CancellationTokenImpl();

  return {
    send: (request: {{this.inputType}}) => {
      requests.push(request);
    },
    complete: async () => {
      // TODO: Implement client streaming
      throw new Error('Client streaming not supported in gRPC-web over HTTP/1.1');
    },
    cancel: () => {
      cancellationToken.cancel();
    }
  };
}
{{/unless}}{{/if}}
```

**Acceptance Criteria:**
- [ ] Return type interface is correct
- [ ] send() method typed
- [ ] complete() returns Promise
- [ ] cancel() method present

---

#### Task 2.4: Fix Bidirectional Streaming Method Template
**Time:** 4 hours

**Steps:**
1. Create bidirectional streaming interface
2. Use Subject for request/response
3. Type all components correctly

**Template:**
```handlebars
{{#if this.clientStreaming}}{{#if this.serverStream}}
/**
 * RPC method {{this.name}} (bidirectional streaming)
 * @returns Observable stream for bidirectional streaming
 */
{{this.name}}(): {
  send: (request: {{this.inputType}}) => void;
  responses: Observable<{{this.outputType}}>;
  complete: () => void;
  cancel: () => void;
} {
  const requestSubject = new Subject<{{this.inputType}}>();
  const responseSubject = new Subject<{{this.outputType}}>();
  const cancellationToken = new CancellationTokenImpl();

  return {
    send: (request: {{this.inputType}}) => {
      requestSubject.next(request);
    },
    responses: responseSubject.asObservable(),
    complete: () => {
      requestSubject.complete();
    },
    cancel: () => {
      cancellationToken.cancel();
    }
  };
}
{{/if}}{{/if}}
```

**Acceptance Criteria:**
- [ ] Return interface correct
- [ ] send() typed
- [ ] responses is Observable
- [ ] Methods present

---

#### Task 2.5: Validation & Compilation Testing
**Time:** 8 hours

**Steps:**
1. Generate code with all RPC types
2. Run TypeScript strict mode compilation
3. Fix any type errors
4. Add integration tests for each RPC type
5. Test with complex proto files

**Acceptance Criteria:**
- [ ] Code compiles with `tsc --strict`
- [ ] No `any` types in public APIs
- [ ] All 4 RPC methods have correct signatures
- [ ] Integration tests pass

**Test Cases:**
- Unary: GetUser
- Server streaming: ListUsers
- Client streaming: CreateUsers
- Bidirectional: Chat

---

## Phase 3: gRPC-Web Integration (Days 8-14)
**Priority:** P0 Critical | **Estimated Time:** 40 hours

### Goal
Implement actual gRPC-web communication using `@improbable-eng/grpc-web`.

### Tasks

#### Task 3.1: Research gRPC-Web API
**Time:** 4 hours

**Steps:**
1. Study `@improbable-eng/grpc-web` documentation
2. Understand service/method descriptors
3. Learn `grpc.unary()` and `grpc.invoke()` APIs
4. Study serialization requirements
5. Document findings

**Deliverables:**
- Technical research document
- Code examples
- API usage patterns

**Acceptance Criteria:**
- [ ] Understand descriptor structure
- [ ] Know how to make unary calls
- [ ] Know how to handle streaming
- [ ] Document serialization needs

---

#### Task 3.2: Generate Service Descriptors
**Time:** 6 hours

**Steps:**
1. Create service descriptor generation logic
2. Add service name and methods metadata
3. Generate descriptor constant in output file

**Code Example:**
```typescript
const UserServiceDescriptor = {
  serviceName: 'test.services.UserService',
};
```

**Acceptance Criteria:**
- [ ] Service descriptor generated
- [ ] Service name is correct
- [ ] Descriptor is exported

---

#### Task 3.3: Generate Method Descriptors
**Time:** 8 hours

**Steps:**
1. Create method descriptor for each RPC
2. Include method name, request/response types
3. Add streaming flags
4. Generate in template

**Code Example:**
```typescript
const GetUserMethodDescriptor = {
  methodName: 'GetUser',
  service: UserServiceDescriptor,
  requestStream: false,
  responseStream: false,
  requestType: GetUserRequest,
  responseType: GetUserResponse,
};
```

**Acceptance Criteria:**
- [ ] All methods have descriptors
- [ ] Streaming flags correct
- [ ] Request/response types linked

---

#### Task 3.4: Implement Unary Method Logic
**Time:** 8 hours

**Steps:**
1. Replace placeholder with `grpc.unary()` call
2. Add request serialization
3. Add response deserialization
4. Implement error handling

**Template:**
```typescript
async {{this.name}}(request: {{this.inputType}}): Promise<{{this.outputType}}> {
  return new Promise((resolve, reject) => {
    grpc.unary({{this.name}}MethodDescriptor, {
      request: request,
      host: this.baseUrl,
      onEnd: (response) => {
        if (response.status !== grpc.Code.OK) {
          reject(new Error(response.statusMessage));
        } else {
          resolve(response.message as {{this.outputType}});
        }
      }
    });
  });
}
```

**Acceptance Criteria:**
- [ ] grpc.unary() called correctly
- [ ] Errors handled
- [ ] Response deserialized
- [ ] Promise resolves/rejects properly

---

#### Task 3.5: Implement Server Streaming Logic
**Time:** 8 hours

**Steps:**
1. Replace mock with `grpc.invoke()` call
2. Convert gRPC events to Observable
3. Handle stream completion and errors
4. Implement cancellation

**Template:**
```typescript
{{this.name}}(request: {{this.inputType}}): Observable<{{this.outputType}}> {
  return new Observable<{{this.outputType}}>(observer => {
    const client = grpc.invoke({{this.name}}MethodDescriptor, {
      request: request,
      host: this.baseUrl,
      onMessage: (message: {{this.outputType}}) => {
        observer.next(message);
      },
      onEnd: (code, message, trailers) => {
        if (code === grpc.Code.OK) {
          observer.complete();
        } else {
          observer.error(new Error(message));
        }
      }
    });

    return () => {
      client.close();
    };
  });
}
```

**Acceptance Criteria:**
- [ ] grpc.invoke() called
- [ ] Messages emitted to Observable
- [ ] Stream completion handled
- [ ] Errors propagated
- [ ] Cancellation works

---

#### Task 3.6: Integration Testing
**Time:** 6 hours

**Steps:**
1. Start test gRPC server
2. Generate client code
3. Test unary calls
4. Test server streaming
5. Test error scenarios
6. Add integration tests

**Test Cases:**
- Successful unary call
- Server streaming with multiple messages
- Error handling (server error, network error)
- Stream cancellation
- Timeout scenarios

**Acceptance Criteria:**
- [ ] Unary calls work end-to-end
- [ ] Server streaming receives all messages
- [ ] Errors are properly handled
- [ ] Cancellation stops streams
- [ ] Integration tests pass

**Validation:**
```bash
# Terminal 1
cd packages/test-server && yarn start

# Terminal 2
cd packages/test-client
node generate.js
node test-grpc-integration.js
```

---

## Phase 4: Protobuf Serialization (Days 15-19)
**Priority:** P0 Critical | **Estimated Time:** 32 hours

### Goal
Add protobuf serialization/deserialization logic.

### Decision Point: Serialization Strategy

**Option A: Use google-protobuf (Full Implementation)**
- Pros: Standard, efficient binary format
- Cons: Complex, requires Message class generation
- Time: 32 hours

**Option B: Use protobufjs (Lightweight)**
- Pros: Simpler API, good performance
- Cons: Different API than google-protobuf
- Time: 24 hours

**Option C: Use JSON Format (MVP)**
- Pros: Simple, no serialization needed
- Cons: Less efficient, not true protobuf
- Time: 8 hours

**Recommendation:** Start with Option C for MVP, migrate to Option B later.

### Tasks (Option C - JSON Format)

#### Task 4.1: Configure gRPC-Web for JSON
**Time:** 2 hours

**Steps:**
1. Research gRPC-web JSON mode
2. Configure client for JSON transport
3. Update server to support JSON

**Acceptance Criteria:**
- [ ] JSON mode enabled
- [ ] Server accepts JSON requests
- [ ] Client sends JSON

---

#### Task 4.2: Update Method Descriptors for JSON
**Time:** 2 hours

**Steps:**
1. Add metadata for JSON serialization
2. Update descriptor generation
3. Test with sample messages

**Acceptance Criteria:**
- [ ] Descriptors support JSON
- [ ] Messages serialize to JSON
- [ ] Responses deserialize from JSON

---

#### Task 4.3: Remove Binary Serialization References
**Time:** 2 hours

**Steps:**
1. Remove `serializeBinary` references
2. Update templates to use JSON
3. Clean up imports

**Acceptance Criteria:**
- [ ] No binary serialization code
- [ ] JSON used throughout
- [ ] Code compiles

---

#### Task 4.4: Testing & Validation
**Time:** 2 hours

**Steps:**
1. Test end-to-end with JSON
2. Verify message integrity
3. Test complex messages (nested, arrays)
4. Add tests

**Acceptance Criteria:**
- [ ] Simple messages work
- [ ] Complex messages work
- [ ] No data loss
- [ ] Tests pass

---

## Phase 5: Polish & Cleanup (Days 20-21)
**Priority:** P1 High | **Estimated Time:** 8 hours

### Tasks

#### Task 5.1: Fix CancellationToken Implementation
**Time:** 2 hours

**Steps:**
1. Complete `cancel()` method
2. Execute callbacks
3. Clear callback array
4. Test cancellation

**Code:**
```typescript
cancel(): void {
  if (this._isCancelled) return;
  this._isCancelled = true;
  this.cancelCallbacks.forEach(cb => {
    try {
      cb();
    } catch (error) {
      console.error('Cancellation callback error:', error);
    }
  });
  this.cancelCallbacks = [];
}
```

**Acceptance Criteria:**
- [ ] Callbacks executed
- [ ] Array cleared
- [ ] Errors caught
- [ ] Tests pass

---

#### Task 5.2: Add Comprehensive JSDoc Comments
**Time:** 2 hours

**Steps:**
1. Add class-level documentation
2. Document all public methods
3. Add parameter descriptions
4. Include usage examples

**Acceptance Criteria:**
- [ ] All classes documented
- [ ] All public methods documented
- [ ] Examples included
- [ ] TypeScript sees all docs

---

#### Task 5.3: Remove Debug Code & TODOs
**Time:** 1 hour

**Steps:**
1. Remove console.log statements
2. Replace TODOs with implementations
3. Clean up comments
4. Format code

**Acceptance Criteria:**
- [ ] No console.logs
- [ ] No TODO comments
- [ ] Code formatted
- [ ] Linter passes

---

#### Task 5.4: Final Integration Testing
**Time:** 3 hours

**Steps:**
1. Run full test suite
2. Test with real gRPC server
3. Test all RPC types
4. Performance testing
5. Memory leak testing

**Acceptance Criteria:**
- [ ] All tests pass
- [ ] Real server communication works
- [ ] No performance issues
- [ ] No memory leaks
- [ ] Code coverage >80%

---

## Success Criteria Checklist

### Must Have (P0)
- [ ] All message types generated as TypeScript interfaces
- [ ] All method signatures syntactically correct
- [ ] Generated code compiles with TypeScript strict mode
- [ ] Unary RPC methods successfully call gRPC server
- [ ] Server streaming methods work with real server
- [ ] No `any` types in public APIs
- [ ] Integration tests pass

### Should Have (P1)
- [ ] Proper error handling with typed errors
- [ ] CancellationToken fully functional
- [ ] Comprehensive JSDoc comments
- [ ] Resource cleanup works correctly
- [ ] Code coverage >80%

### Nice to Have (P2)
- [ ] Binary protobuf serialization (migrate from JSON)
- [ ] Performance optimizations
- [ ] Mock/stub utilities for testing

---

## Risk Mitigation

### High Risks

**Risk:** Protobuf serialization complexity
- **Impact:** Critical - without serialization, can't communicate
- **Probability:** High
- **Mitigation:** Use JSON format initially, migrate to binary later
- **Owner:** Backend Developer
- **Status:** Mitigated with Option C approach

**Risk:** gRPC-web client/bidirectional streaming not supported
- **Impact:** Medium - some RPC types won't work
- **Probability:** Certain (HTTP/1.1 limitation)
- **Mitigation:** Document limitations clearly, throw descriptive errors
- **Owner:** Backend Developer
- **Status:** Accepted limitation

### Medium Risks

**Risk:** Template complexity becoming unmaintainable
- **Impact:** Medium - harder to modify and debug
- **Probability:** Medium
- **Mitigation:** Use template partials, comprehensive comments
- **Owner:** Backend Developer
- **Status:** Monitoring

**Risk:** TypeScript strict mode compliance issues
- **Impact:** Medium - may require significant rework
- **Probability:** Low
- **Mitigation:** Enable strict mode from start, fix incrementally
- **Owner:** Backend Developer
- **Status:** Preventive action taken

---

## Daily Standup Template

### Day N Progress Report

**Yesterday:**
- Completed: [Task X.Y]
- Challenges: [Issues encountered]
- Solutions: [How resolved]

**Today:**
- Planning: [Task X.Y]
- Expected completion: [Time estimate]

**Blockers:**
- [Any blockers]

**Metrics:**
- Tests passing: X/Y
- Code coverage: Z%
- Compiler errors: N

---

## Testing Strategy

### Unit Tests
```
packages/generator/tests/unit/
  type-mapper.test.ts          - Type mapping logic
  message-generator.test.ts    - Message interface generation
  service-generator.test.ts    - Service stub generation
  template-rendering.test.ts   - Handlebars template tests
  cancellation-token.test.ts   - Cancellation logic
```

### Integration Tests
```
packages/generator/tests/integration/
  message-generation.test.ts   - End-to-end message generation
  method-generation.test.ts    - Method signature generation
  grpc-communication.test.ts   - Real gRPC server calls
  streaming.test.ts            - Streaming RPC tests
  error-handling.test.ts       - Error scenario testing
```

### Test Commands
```bash
# Unit tests
yarn test:unit

# Integration tests (requires test server)
yarn test:integration

# All tests
yarn test

# Coverage report
yarn test:coverage
```

---

## Deliverables

### Week 1
- [ ] Message type generation working
- [ ] Method signatures complete
- [ ] Code compiles with TypeScript

### Week 2
- [ ] gRPC-web integration complete
- [ ] Unary calls working
- [ ] Server streaming working

### Week 3
- [ ] JSON serialization implemented
- [ ] End-to-end testing complete
- [ ] Integration tests passing

### Week 4
- [ ] CancellationToken fixed
- [ ] Documentation complete
- [ ] Code polished and production-ready

---

## Next Steps After Completion

1. **Performance Optimization**
   - Profile generated code
   - Optimize bundle size
   - Implement code splitting

2. **Advanced Features**
   - React hooks generation
   - Suspense support
   - Mock utilities

3. **Binary Serialization Migration**
   - Migrate from JSON to protobufjs
   - Benchmark performance improvements
   - Update tests

4. **Documentation**
   - API documentation
   - Usage examples
   - Migration guide

---

## Contact & Support

**Project Owner:** Backend Developer
**Timeline:** 4 weeks (21 working days)
**Start Date:** TBD
**End Date:** TBD

**Review Checkpoints:**
- Day 7: Phase 1-2 complete
- Day 14: Phase 3 complete
- Day 19: Phase 4 complete
- Day 21: Final review

