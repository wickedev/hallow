# Vite Integration Test Cases

## Test File

`vite-hmr.test.ts`

## Test Purpose

Verify that the `@hallow/plugin` package correctly integrates with Vite's development server and Hot Module Replacement (HMR) system. These tests ensure that proto file changes are detected, caches are properly invalidated, and dependent modules are updated when base proto files change.

## Test Cases Overview

| Case ID | Feature Description | Test Type |
|---------|-------------------|-----------|
| VITE-01 | Single proto file HMR update | Positive Test |
| VITE-02 | Dependent proto files invalidation | Integration Test |
| VITE-03 | Whitespace-only change detection | Edge Case Test |
| VITE-04 | Non-proto file filtering | Boundary Test |
| VITE-05 | Error handling during HMR | Error Test |
| VITE-06 | Cache invalidation chain | Integration Test |

## Detailed Test Steps

### VITE-01: Single Proto File HMR Update

**Test Purpose**: Verify that when a proto file is modified during development, the HMR system correctly detects the change, invalidates the cache, and triggers a module update.

**Test Data Preparation**:
- Create a `greeting.proto` file with basic service definition
- Mock file system with initial proto content
- Prepare updated proto content with additional field

**Test Steps**:
1. Initialize plugin with Vite framework context (`meta.framework = 'vite'`)
2. Perform initial transformation to populate cache
3. Simulate file change by updating mock file system content
4. Create mock Vite server with module graph
5. Trigger `handleHotUpdate` hook with updated content
6. Verify that HMR returns modules to update

**Expected Results**:
- HMR hook returns a defined array of modules
- Array contains at least one module to update
- No errors thrown during the process
- Cache is invalidated for the changed file

**Requirements Verified**:
- Requirement 1.8: Leverage Vite's fast refresh capabilities for HMR
- Requirement 2.9: Invalidate cached code when file is modified
- Requirement 13.1: Use Vite's handleHotUpdate hook for fine-grained HMR control

---

### VITE-02: Dependent Proto Files Invalidation

**Test Purpose**: Verify that when a base proto file (imported by other protos) is modified, all dependent proto files are also invalidated and marked for update.

**Test Data Preparation**:
- Create `common/base.proto` with shared message definitions
- Create `service.proto` that imports `base.proto`
- Prepare updated base.proto with additional field
- Mock file system with both files

**Test Steps**:
1. Initialize plugin with Vite framework context
2. Transform both base and dependent proto files to build dependency graph
3. Update base proto file content
4. Create mock Vite server with module graph containing both modules
5. Trigger `handleHotUpdate` for base proto
6. Verify dependency graph lookup for dependents

**Expected Results**:
- HMR returns modules including both base and dependent files
- Module graph `getModuleById` is called to find dependents
- Dependency graph correctly tracks import relationships
- All dependent modules are invalidated

**Requirements Verified**:
- Requirement 2.9: Invalidate cache for file and all dependents when proto file modified
- Requirement 9.4: Track file dependencies and dependents in dependency graph
- Requirement 13.1: Fine-grained HMR control for dependency chains

---

### VITE-03: Whitespace-Only Change Detection

**Test Purpose**: Verify that HMR can detect when a file change is only whitespace and handle it appropriately without unnecessary regeneration.

**Test Data Preparation**:
- Create initial proto content with minimal whitespace
- Create variant with additional newlines but identical semantics
- Mock file system with initial content

**Test Steps**:
1. Initialize plugin and transform initial content
2. Update mock file system with whitespace-variant content
3. Trigger `handleHotUpdate` with whitespace-only change
4. Verify HMR response

**Expected Results**:
- HMR handles the request gracefully without errors
- Returns undefined or empty array (no update needed)
- Or returns modules if hash detection considers it a change
- No crashes or exceptions

**Requirements Verified**:
- Requirement 6.3: Detect hash change for cache invalidation
- Error handling robustness for edge cases

---

### VITE-04: Non-Proto File Filtering

**Test Purpose**: Verify that the HMR hook correctly ignores non-proto files and returns control to Vite.

**Test Data Preparation**:
- Create a TypeScript file (`.ts`) instead of proto
- Mock file system with TypeScript content

**Test Steps**:
1. Initialize plugin with Vite framework context
2. Trigger `handleHotUpdate` with TypeScript file path
3. Verify HMR returns undefined (no handling)
4. Verify module graph was not accessed

**Expected Results**:
- HMR hook returns undefined
- `getModuleById` is never called (early return)
- Vite handles the file update normally
- No proto-specific processing occurs

**Requirements Verified**:
- Requirement 1.4: Register transform hook for files matching `/\.proto$/` pattern only
- Efficient filtering prevents unnecessary processing

---

### VITE-05: Error Handling During HMR

**Test Purpose**: Verify that the plugin handles errors gracefully during HMR without crashing the dev server.

**Test Data Preparation**:
- Reference a proto file that doesn't exist in mock file system
- Configure mock to throw error on file read

**Test Steps**:
1. Initialize plugin with Vite framework context
2. Trigger `handleHotUpdate` for non-existent file
3. Mock `read()` function to throw ENOENT error
4. Verify error handling

**Expected Results**:
- HMR returns undefined (graceful fallback)
- No unhandled exceptions
- Dev server continues to function
- Error is logged if debug mode enabled

**Requirements Verified**:
- Requirement 8.8: Log full error stack in verbose mode
- Non-functional Requirement (Reliability 1): Handle all errors gracefully without crashing build process

---

### VITE-06: Cache Invalidation Chain

**Test Purpose**: Verify that when a base proto at the root of a dependency chain is modified, all files in the chain are properly invalidated.

**Test Data Preparation**:
- Create `base.proto` with foundational types
- Create `service.proto` importing `base.proto`
- Create `client.proto` importing `service.proto`
- Mock file system with all three files
- Prepare updated `base.proto` content

**Test Steps**:
1. Initialize plugin with proto root configuration
2. Transform all three files to build complete dependency graph
3. Update base proto content
4. Create mock Vite server with module graph
5. Trigger `handleHotUpdate` for base proto
6. Verify dependent module lookup

**Expected Results**:
- HMR returns array of affected modules
- `getModuleById` is called to find dependents
- Dependency graph correctly identifies the chain: base → service → client
- All modules in chain are invalidated

**Requirements Verified**:
- Requirement 2.9: Invalidate cache for file and all dependents
- Requirement 5.4: Implement `getDependents()` for cache invalidation
- Requirement 9.5: Track `importedBy` relationships in dependency graph

---

## Test Considerations

### Mock Strategy

**File System Mocking**:
- Use `Map<string, string>` to store mock file contents
- Mock `fs.promises.readFile` to read from Map
- Reset Map before each test to ensure isolation

**Vite Server Mocking**:
- Mock `moduleGraph.getModuleById()` to simulate Vite's module tracking
- Mock `read()` function in HMR context for file content
- Provide proper TypeScript types for mock objects

### Boundary Conditions

**File Change Detection**:
- Empty files
- Very large files (>1MB)
- Binary content in proto files (should fail parsing)
- Concurrent file changes

**Dependency Chains**:
- Circular dependencies (should error)
- Deep dependency chains (10+ levels)
- Missing import files

### Asynchronous Operations

**HMR Timing**:
- All HMR operations must be async-safe
- Plugin must handle concurrent HMR events
- Cache updates must be atomic to prevent race conditions

**Transform Pipeline**:
- Transform is async and may be called concurrently for multiple files
- File watching must be registered asynchronously
- Module graph updates happen asynchronously

### Performance Considerations

**Cache Efficiency**:
- First transformation should populate cache (cache miss)
- Subsequent transformations with same content should hit cache
- Cache invalidation should be fast (<10ms)

**HMR Response Time**:
- HMR update detection should be near-instant (<50ms)
- Dependency graph lookup should scale to 100+ files
- Module graph integration should not block dev server

---

## Integration with Vite Architecture

### Vite Plugin Lifecycle

1. **Plugin Registration**: Vite loads plugin via `vite()` export
2. **Build Start**: `buildStart` hook initializes plugin state
3. **Module Transform**: `transform` hook processes proto imports
4. **File Watching**: Proto files registered via `addWatchFile()`
5. **HMR Updates**: `handleHotUpdate` hook manages file changes

### Vite-Specific Features Tested

**Virtual Modules**: Proto files act as virtual modules returning generated TypeScript
**Fast Refresh**: HMR provides near-instant updates during development
**Module Graph**: Plugin integrates with Vite's module dependency tracking
**Dev Server**: All tests verify compatibility with Vite dev server workflow

---

## Compatibility Matrix

| Vite Version | Node Version | Test Status |
|--------------|--------------|-------------|
| 4.5.x | 14.x | ✅ Passing |
| 4.5.x | 16.x | ✅ Passing |
| 4.5.x | 18.x | ✅ Passing |
| 5.x | 14.x | 🔄 To be tested |
| 5.x | 18.x | 🔄 To be tested |

---

## Known Limitations

1. **HMR Boundary**: Proto file changes always trigger full module reload (no partial updates)
2. **Large Files**: Files >10MB may cause HMR delays
3. **Network Imports**: Proto imports from URLs not supported in HMR
4. **SSR Mode**: HMR tests focus on client-side dev server only

---

## Related Requirements

- **Requirement 1.8**: IF the build system is Vite THEN the plugin SHALL leverage Vite's fast refresh capabilities for HMR
- **Requirement 2.9**: WHEN a proto file is modified during development AND the build system supports file watching THEN the plugin SHALL invalidate cached code for that file and all dependents
- **Requirement 2.10**: WHEN the plugin supports HMR THEN it SHALL call `this.addWatchFile(protoPath)` for each processed proto file
- **Requirement 13.1**: WHEN the plugin runs in Vite THEN it SHALL use Vite's `handleHotUpdate` hook for fine-grained HMR control
- **Requirement 13.9**: WHEN the build system is Vite THEN the plugin SHALL mark proto-generated modules for HMR boundary optimization

---

## Test Execution

**Run all Vite integration tests**:
```bash
yarn test tests/integration/vite-hmr.test.ts
```

**Run specific test**:
```bash
yarn test tests/integration/vite-hmr.test.ts -t "should trigger HMR update"
```

**Run with coverage**:
```bash
yarn test:coverage tests/integration/vite-hmr.test.ts
```

---

## Success Criteria

✅ All 6 test cases pass
✅ No memory leaks during HMR operations
✅ HMR response time <100ms for single file changes
✅ Dependency chain invalidation works correctly
✅ Error handling prevents dev server crashes
✅ Mock file system provides adequate test isolation
