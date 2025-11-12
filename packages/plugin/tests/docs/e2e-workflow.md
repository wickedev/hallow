# E2E Workflow Test Cases

## Test File

`tests/e2e/workflow.test.ts`

## Test Purpose

Verify complete end-to-end workflows of the @hallow/plugin package, testing the entire pipeline from proto file import to final executable code with actual plugin integration. These tests ensure that all components work together correctly in realistic scenarios, validating:

- Proto file transformation and code generation
- Multi-file dependency resolution and topological processing
- Cache invalidation and performance optimization
- Production build optimizations
- TypeScript type safety and IDE integration
- React hooks generation

## Test Cases Overview

| Case ID | Feature Description | Test Type |
| ------- | ------------------- | --------- |
| E2E-WF-01 | Import proto file and verify generated code structure | Positive Test |
| E2E-WF-02 | Multi-file dependencies with topological processing | Positive Test |
| E2E-WF-03 | Cache invalidation on file changes | Positive Test |
| E2E-WF-04 | Production optimization verification | Positive Test |
| E2E-WF-05 | TypeScript autocomplete verification | Positive Test |
| E2E-WF-06 | React hooks generation | Positive Test |
| E2E-WF-07 | Well-known types integration | Positive Test |
| E2E-WF-08 | Complex dependency graph with circular detection | Error Test |
| E2E-WF-09 | Concurrent proto file processing | Performance Test |
| E2E-WF-10 | Full build pipeline with Vite integration | Integration Test |

## Detailed Test Steps

### E2E-WF-01: Import proto file and verify generated code structure

**Test Purpose**: Verify that the plugin correctly transforms a proto file into TypeScript code with proper exports and structure

**Test Data Preparation**:
- Create temporary test directory
- Create `greeting.proto` with service and message definitions
- Initialize plugin with default configuration
- Set up mock transform context

**Test Steps**:
1. Create proto file with GreetingService containing Greet RPC method
2. Configure plugin instance with `createHallowPlugin({})`
3. Call transform hook with proto file ID and content
4. Verify transformation returns valid TypeScript code
5. Parse generated code and verify exports
6. Check for service stub class export
7. Check for message interface exports
8. Verify TypeScript compilation succeeds

**Expected Results**:
- Transform hook returns `{ code: string, map: SourceMap | null }`
- Generated code contains `export class GreetingServiceStub`
- Generated code contains `export interface GreetRequest`
- Generated code contains `export interface GreetResponse`
- Code imports from `@hallow/grpc-web`
- TypeScript compiler validates generated code without errors
- Service stub has `methods` property with `greet` method

### E2E-WF-02: Multi-file dependencies with topological processing

**Test Purpose**: Verify correct handling of multi-file proto dependencies with proper topological ordering

**Test Data Preparation**:
- Create proto dependency chain:
  - `types.proto`: Address message
  - `models.proto`: User message importing Address
  - `service.proto`: UserService importing User
- Set up plugin with protoRoot configuration
- Mock file system for import resolution

**Test Steps**:
1. Create three proto files with import dependencies
2. Configure plugin with protoRoot pointing to test directory
3. Transform service.proto (which depends on others)
4. Verify dependency graph builds correctly
5. Check topological sort produces correct order: types → models → service
6. Verify all files are processed
7. Check generated code has proper TypeScript imports
8. Verify no duplicate code generation

**Expected Results**:
- Dependency graph correctly tracks: types.proto ← models.proto ← service.proto
- Files processed in topological order
- Generated service.proto code imports from models.proto
- Generated models.proto code imports from types.proto
- All message types are accessible from service stub
- No circular dependency errors thrown
- Import registry prevents duplicate generation

### E2E-WF-03: Cache invalidation on file changes

**Test Purpose**: Verify cache hits on unchanged files and cache invalidation when files are modified

**Test Data Preparation**:
- Create test proto file
- Initialize plugin with caching enabled
- Prepare modified version of proto file
- Set up cache monitoring

**Test Steps**:
1. First transformation - cold start (cache miss)
2. Record transformation time T1
3. Compute content hash and store in cache
4. Second transformation with same file (cache hit)
5. Record transformation time T2
6. Verify T2 << T1 (cache significantly faster)
7. Modify proto file (add new RPC method)
8. Third transformation (cache miss due to hash change)
9. Verify new method appears in generated code
10. Check cache statistics show hit/miss counts

**Expected Results**:
- First transform populates cache with hash
- Second transform returns cached code in <10ms
- Cache hit rate increases from 0% to 50%
- File modification changes content hash
- Third transform regenerates code
- New RPC method present in generated code
- Cache invalidation logs shown in verbose mode
- Dependent files also invalidated if imports changed

### E2E-WF-04: Production optimization verification

**Test Purpose**: Verify production mode enables optimizations and reduces code size

**Test Data Preparation**:
- Create proto file with services and messages
- Configure plugin for development mode (NODE_ENV=development)
- Configure plugin for production mode (NODE_ENV=production)
- Set up code size measurement

**Test Steps**:
1. Transform proto in development mode
2. Measure generated code size (devSize)
3. Verify source maps are generated
4. Verify JSDoc comments are present
5. Transform same proto in production mode
6. Measure generated code size (prodSize)
7. Verify source maps are disabled (unless explicitly enabled)
8. Verify JSDoc comments are removed
9. Verify variable names are minified (where safe)
10. Calculate size reduction percentage

**Expected Results**:
- Development mode: sourceMaps = true, minify = false, removeComments = false
- Production mode: sourceMaps = false, minify = true, removeComments = true
- prodSize < devSize (at least 20-30% smaller)
- Production code has no `/**` comment markers
- Production code has shorter variable names
- Optimization metrics logged in buildEnd hook
- Bundle size warning shown if exceeds target (when configured)
- Dead code elimination flag passed to generator

### E2E-WF-05: TypeScript autocomplete verification

**Test Purpose**: Verify generated code provides full TypeScript type safety and IDE autocomplete

**Test Data Preparation**:
- Create proto file with service, messages, and enums
- Generate TypeScript code
- Create test .ts file importing generated code
- Set up TypeScript compiler programmatically

**Test Steps**:
1. Transform proto file to generate TypeScript code
2. Write generated code to temporary .ts file
3. Create consumer .ts file that imports generated types
4. Compile with TypeScript programmatic API
5. Attempt to use stub with correct types (should compile)
6. Attempt to use stub with incorrect types (should error)
7. Verify type inference works correctly
8. Check service method signatures are correctly typed
9. Verify message field types are enforced
10. Test optional fields and repeated fields

**Expected Results**:
- TypeScript compiler finds all exported types
- Service stub methods have correct parameter types
- Message interfaces enforce field types
- Optional fields typed as `field?: Type`
- Incorrect type usage produces TypeScript error
- Type inference works: `const res = await stub.methods.greet(req)` infers response type
- Go-to-definition would work in IDE (verified via AST)
- Hover type info available (verified via type system)

### E2E-WF-06: React hooks generation

**Test Purpose**: Verify React hooks are generated when enabled and have correct types

**Test Data Preparation**:
- Create proto file with UserService
- Configure plugin with `generateReactHooks: true` and `generateSuspenseHooks: true`
- Mock @hallow/react package
- Verify React is in dependencies

**Test Steps**:
1. Configure plugin with React hooks enabled
2. Transform proto file
3. Verify generated code imports from '@hallow/react'
4. Check for `useGrpc` hook import
5. Check for `useSuspenseGrpc` hook import
6. Verify hook function exports for each RPC method
7. Verify hook signatures: `use{Method}(request): { data, error, loading }`
8. Verify Suspense hook signatures: `use{Method}Suspense(request): data`
9. Test without @hallow/react installed (should warn)
10. Verify warning message includes installation instructions

**Expected Results**:
- Generated code contains: `import { useGrpc, useSuspenseGrpc } from '@hallow/react'`
- Hook functions exported: `export function useGetUser(...)`
- Hook returns type: `{ data: GetUserResponse | null, error: Error | null, loading: boolean }`
- Suspense hook returns type: `GetUserResponse`
- Warning logged if @hallow/react not found
- Warning includes: "Please install it: npm install @hallow/react"
- React hooks disabled if @hallow/react missing
- Both promise-based and hook-based stubs available

### E2E-WF-07: Well-known types integration

**Test Purpose**: Verify integration with Google well-known protobuf types

**Test Data Preparation**:
- Create proto file importing google/protobuf/timestamp.proto
- Create proto file importing google/protobuf/duration.proto
- Set up proto resolver with google-protobuf package location
- Configure well-known type mappings

**Test Steps**:
1. Create proto with google.protobuf.Timestamp field
2. Configure plugin with well-known type resolution
3. Transform proto file
4. Verify import resolution finds google-protobuf types
5. Check generated TypeScript imports from google-protobuf
6. Verify type mappings are correct
7. Test with multiple well-known types
8. Verify no resolution errors

**Expected Results**:
- ProtoResolver identifies google/protobuf/* as well-known types
- Resolver maps to google-protobuf package in node_modules
- Generated code imports: `import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb'`
- TypeScript types are compatible with google-protobuf runtime
- No "cannot resolve import" errors
- Timestamp field typed correctly in message interface
- Duration field typed correctly in message interface

### E2E-WF-08: Complex dependency graph with circular detection

**Test Purpose**: Verify detection and reporting of circular dependencies

**Test Data Preparation**:
- Create proto files with circular imports:
  - `a.proto` imports `b.proto`
  - `b.proto` imports `c.proto`
  - `c.proto` imports `a.proto` (creates cycle)
- Set up dependency graph monitoring
- Prepare error assertion

**Test Steps**:
1. Create circular dependency chain
2. Configure plugin
3. Attempt to transform proto file in cycle
4. Dependency graph detects cycle during detectCycles()
5. Verify CircularDependencyError is thrown
6. Check error message includes complete cycle path
7. Verify error format: "a.proto → b.proto → c.proto → a.proto"
8. Test complex cycles (more than 3 files)
9. Verify cycle detection is accurate
10. Check error logging shows helpful message

**Expected Results**:
- DependencyGraph.detectCycles() returns cycle array
- Error thrown with message: "[Hallow Plugin] Circular import detected"
- Error includes full cycle path visualization
- Build fails with exit code 1
- Error message shows which file created the cycle
- Suggestion provided: "Review import statements"
- Multiple cycles detected if present
- No false positives (valid graphs pass)

### E2E-WF-09: Concurrent proto file processing

**Test Purpose**: Verify plugin can process multiple independent proto files concurrently

**Test Data Preparation**:
- Create 20 independent proto files (no cross-dependencies)
- Configure plugin for concurrent processing
- Set up performance monitoring
- Create high-precision timers

**Test Steps**:
1. Create 20 independent service proto files
2. Configure plugin
3. Start timer
4. Transform all files (should process concurrently)
5. Record total time T_concurrent
6. Estimate sequential time (sum of individual times)
7. Calculate speedup: T_sequential / T_concurrent
8. Verify speedup > 1.5 (at least 50% faster)
9. Check no race conditions occurred
10. Verify cache works correctly with concurrency

**Expected Results**:
- Multiple files processed in parallel (async transform hooks)
- Total time significantly less than sum of individual times
- Speedup ratio > 1.5 (concurrent processing advantage)
- No race conditions in cache
- No race conditions in dependency graph
- All files processed successfully
- Performance monitor tracks parallel operations
- Build system allows parallel processing (Vite, ESBuild)

### E2E-WF-10: Full build pipeline with Vite integration

**Test Purpose**: Verify complete build pipeline from proto import to running application

**Test Data Preparation**:
- Create full Vite project structure
- Add proto files
- Create TypeScript client code
- Set up Vite configuration
- Prepare production build config

**Test Steps**:
1. Create Vite project with @hallow/plugin
2. Add greeting.proto service definition
3. Create src/main.ts importing greeting.proto
4. Start Vite dev server
5. Verify proto file transforms correctly
6. Modify proto file and verify HMR triggers
7. Verify handleHotUpdate hook invalidates cache
8. Check browser receives HMR update
9. Run production build
10. Verify optimized bundle created
11. Measure bundle size
12. Test production bundle in Node.js

**Expected Results**:
- Vite dev server starts successfully
- Proto import transforms without errors
- Generated stub class available in main.ts
- HMR updates on proto file changes (<1 second)
- Cache invalidated for modified file and dependents
- Production build completes successfully
- Bundle size is reasonable (<100KB for simple service)
- Production code is minified
- Source maps optional in production
- Application runs correctly in both dev and prod

## Test Considerations

### Mock Strategy

E2E tests use realistic mocking:
- **Real plugin code**: Use actual @hallow/plugin implementation
- **Real parsers/generators**: Use @hallow/parser and @hallow/generator
- **Temporary file system**: Create actual files in OS temp directory
- **Mock build systems**: Use minimal mocking for Vite/Webpack/etc
- **Mock gRPC servers**: Only mock external network services

### Boundary Conditions

Test edge cases and limits:
- Empty proto files (no services or messages)
- Large proto schemas (100+ messages)
- Deep dependency chains (10+ levels)
- Wide dependency graphs (50+ files)
- Very long file paths (>256 characters)
- Special characters in message/service names
- Unicode in proto files

### Asynchronous Operations

All E2E tests handle async operations:
- Plugin transform hooks are async
- File system operations use async/await
- Cache operations are async
- Build processes run asynchronously
- Use proper async/await in all test steps
- Set appropriate timeouts (30s for slow operations)

### Performance Benchmarks

Track key performance metrics:
- Cold start transform time: <200ms for typical file
- Cached transform time: <10ms
- Large file transform time: <1s for 100KB proto
- Dependency resolution: <50ms per file
- Cache lookup: <5ms
- Hash computation: <20ms for 100KB file

### Error Handling

Verify robust error handling:
- Syntax errors in proto files
- Missing import files
- Circular dependencies
- Invalid configuration
- File system errors
- Permission errors
- Out of memory scenarios (large files)
- Concurrent access issues

### Cleanup

Ensure proper cleanup after each test:
- Delete temporary directories
- Clear plugin caches
- Reset file watchers
- Clear dependency graphs
- Release file handles
- Remove generated files
- Reset NODE_ENV
- Clear require cache
