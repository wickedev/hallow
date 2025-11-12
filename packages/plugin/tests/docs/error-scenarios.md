# Error Scenario Unit Test Cases (Task 18.5)

## Test File

`tests/error-scenarios/task-18.5-comprehensive-errors.test.ts`

## Test Purpose

Comprehensive testing of error handling scenarios in the @hallow/plugin package, specifically focusing on Task 18.5 requirements for reliability (Non-functional: Reliability 2). These tests ensure the plugin handles all error conditions gracefully with clear, actionable error messages and proper recovery mechanisms.

## Test Cases Overview

| Case ID | Feature Description | Test Type |
|---------|-------------------|-----------|
| ERR-SYNTAX-01 | Proto syntax error with line/column location | Error Test |
| ERR-SYNTAX-02 | Multiple syntax errors in single file | Error Test |
| ERR-SYNTAX-03 | Syntax error at file start | Error Test |
| ERR-SYNTAX-04 | Syntax error at file end | Boundary Test |
| ERR-SYNTAX-05 | Syntax error with Unicode characters | Edge Case |
| ERR-CIRC-01 | Simple circular dependency (A→B→A) | Error Test |
| ERR-CIRC-02 | Complex circular dependency (A→B→C→A) | Error Test |
| ERR-CIRC-03 | Self-referencing file | Edge Case |
| ERR-CIRC-04 | Multiple circular chains | Error Test |
| ERR-CIRC-05 | Circular dependency detection in large graph | Performance Test |
| ERR-IMPORT-01 | Missing import file | Error Test |
| ERR-IMPORT-02 | Invalid import path format | Error Test |
| ERR-IMPORT-03 | Import resolution with multiple search paths | Error Test |
| ERR-IMPORT-04 | Case-sensitive import resolution | Platform Test |
| ERR-IMPORT-05 | Import of non-proto file | Validation Test |
| ERR-CONFIG-01 | Invalid configuration type | Error Test |
| ERR-CONFIG-02 | Unknown configuration option | Validation Test |
| ERR-CONFIG-03 | Configuration value out of range | Boundary Test |
| ERR-CONFIG-04 | Conflicting configuration options | Validation Test |
| ERR-CONFIG-05 | Typo in configuration key with suggestion | UX Test |
| ERR-FS-01 | File not found error | Error Test |
| ERR-FS-02 | Permission denied error | Error Test |
| ERR-FS-03 | File read retry mechanism | Reliability Test |
| ERR-FS-04 | Directory not accessible | Error Test |
| ERR-FS-05 | Disk full error handling | Error Test |

## Detailed Test Steps

### ERR-SYNTAX-01: Proto syntax error with line/column location

**Test Purpose**: Verify that syntax errors are reported with accurate file location (line/column) and helpful context.

**Test Data Preparation**:
```proto
syntax = "proto3";

message Test {
  string name = 1    // Missing semicolon
  string value = 2;
}
```

**Test Steps**:
1. Create proto content with syntax error at line 4, column 19
2. Call ErrorFormatter.formatParseError() with location details
3. Verify error message contains:
   - Error type: "Proto syntax error"
   - File path
   - Line and column numbers
   - Error description
   - Code snippet showing context
   - Caret (^) pointing to error location

**Expected Results**:
- Error message format: `[Hallow Plugin] Proto syntax error`
- Contains: `File: /path/to/test.proto`
- Contains: `Line 4, Column 19`
- Contains code snippet with 2 context lines before and after
- Contains caret pointing to exact error position

### ERR-SYNTAX-02: Multiple syntax errors in single file

**Test Purpose**: Verify that all syntax errors in a file are collected and reported together.

**Test Data Preparation**:
```proto
syntax = "proto3";

message Test1 {
  string name = 1    // Error 1: Missing semicolon
}

message Test2 {
  int32 value = 0;   // Error 2: Invalid field number
}
```

**Test Steps**:
1. Create proto content with multiple syntax errors
2. Use ErrorCollector to accumulate parse errors
3. Parse the file and collect all errors
4. Verify all errors are captured

**Expected Results**:
- ErrorCollector contains 2+ errors
- Each error has accurate location
- Formatted output shows all errors grouped by type

### ERR-SYNTAX-03: Syntax error at file start

**Test Purpose**: Verify syntax errors at the beginning of the file are handled correctly.

**Test Data Preparation**:
```proto
invalid syntax here
syntax = "proto3";
```

**Test Steps**:
1. Create proto content with error at line 1
2. Format parse error
3. Verify snippet extraction handles file start

**Expected Results**:
- Error reported at line 1
- Code snippet shows line 1 and following lines
- No attempt to show negative line numbers

### ERR-SYNTAX-04: Syntax error at file end

**Test Purpose**: Verify syntax errors at the end of the file are handled correctly.

**Test Data Preparation**:
```proto
syntax = "proto3";

message Test {
  string name = 1;
// Missing closing brace
```

**Test Steps**:
1. Create proto content with error at last line
2. Format parse error at EOF
3. Verify snippet extraction handles file end

**Expected Results**:
- Error reported at correct line
- Code snippet shows last line and preceding lines
- No attempt to show lines beyond EOF

### ERR-SYNTAX-05: Syntax error with Unicode characters

**Test Purpose**: Verify proper handling of syntax errors in files containing Unicode characters.

**Test Data Preparation**:
```proto
syntax = "proto3";

message Test {
  string name = 1;  // 名前
  string emoji = 2  // Missing semicolon 😀
}
```

**Test Steps**:
1. Create proto with Unicode comments
2. Introduce syntax error near Unicode content
3. Format error with code snippet

**Expected Results**:
- Column position correctly calculated with Unicode
- Code snippet displays Unicode characters correctly
- Caret positioned correctly accounting for multi-byte characters

### ERR-CIRC-01: Simple circular dependency (A→B→A)

**Test Purpose**: Detect and report simple circular dependencies between two files.

**Test Data Preparation**:
- a.proto imports b.proto
- b.proto imports a.proto

**Mock Graph**:
```typescript
graph.addNode('/project/a.proto', ['/project/b.proto'], 'hash-a');
graph.addNode('/project/b.proto', ['/project/a.proto'], 'hash-b');
```

**Test Steps**:
1. Create DependencyGraph instance
2. Add nodes forming circular dependency
3. Call detectCycles()
4. Verify cycle detection

**Expected Results**:
- detectCycles() returns CircularDependencyError
- Cycle path: ['a.proto', 'b.proto', 'a.proto']
- Error message: "Circular import detected: a.proto → b.proto → a.proto"

### ERR-CIRC-02: Complex circular dependency (A→B→C→A)

**Test Purpose**: Detect circular dependencies involving multiple files.

**Test Data Preparation**:
- a.proto imports b.proto
- b.proto imports c.proto
- c.proto imports a.proto

**Test Steps**:
1. Create dependency graph with 3-file cycle
2. Call detectCycles()
3. Verify complete cycle path is returned

**Expected Results**:
- Cycle detected with 4 elements (including return to start)
- Formatted error shows complete cycle path
- All files in cycle are identified

### ERR-CIRC-03: Self-referencing file

**Test Purpose**: Detect when a file imports itself.

**Test Data Preparation**:
- a.proto imports a.proto

**Test Steps**:
1. Add self-referencing node to graph
2. Call detectCycles()
3. Verify cycle detection

**Expected Results**:
- Cycle detected: ['a.proto', 'a.proto']
- Clear error message about self-reference

### ERR-CIRC-04: Multiple circular chains

**Test Purpose**: Detect multiple independent circular dependency chains.

**Test Data Preparation**:
- Chain 1: a.proto → b.proto → a.proto
- Chain 2: c.proto → d.proto → c.proto

**Test Steps**:
1. Create graph with multiple independent cycles
2. Call detectCycles()
3. Verify at least one cycle is detected

**Expected Results**:
- First cycle encountered is detected
- Error message is clear and actionable

### ERR-CIRC-05: Circular dependency detection in large graph

**Test Purpose**: Verify performance of cycle detection with many nodes.

**Test Data Preparation**:
- Create graph with 100 nodes
- Add circular dependency in middle of graph

**Test Steps**:
1. Create large dependency graph
2. Introduce single circular dependency
3. Measure detection time
4. Verify cycle is found

**Expected Results**:
- Cycle detected successfully
- Detection completes in reasonable time (<100ms)
- Correct cycle path identified

### ERR-IMPORT-01: Missing import file

**Test Purpose**: Verify clear error messages when imported file cannot be found.

**Test Data Preparation**:
- Source file: service.proto
- Missing import: "nonexistent.proto"

**Test Steps**:
1. Create ProtoResolver with test search paths
2. Attempt to resolve nonexistent import
3. Verify error includes search paths

**Expected Results**:
- Error message: "Import resolution failed"
- Shows import path: "nonexistent.proto"
- Lists all searched directories
- Suggests checking path and configuration

### ERR-IMPORT-02: Invalid import path format

**Test Purpose**: Verify validation of import path format.

**Test Data Preparation**:
- Invalid paths: "", "   ", "proto:invalid", "http://example.com/proto"

**Test Steps**:
1. Attempt to resolve each invalid path
2. Verify rejection with clear error

**Expected Results**:
- Import fails with validation error
- Error indicates invalid path format
- Suggests correct format

### ERR-IMPORT-03: Import resolution with multiple search paths

**Test Purpose**: Verify import resolution searches all configured paths.

**Test Data Preparation**:
- Search paths: ['/project', '/project/protos', '/project/vendor']
- Import: 'common/types.proto'

**Test Steps**:
1. Configure resolver with multiple search paths
2. Attempt resolution
3. Verify all paths are checked
4. Error shows all searched locations

**Expected Results**:
- All search paths attempted in order
- Error lists each searched location
- Helpful suggestion about adding to importPaths

### ERR-IMPORT-04: Case-sensitive import resolution

**Test Purpose**: Verify case-sensitive handling of import paths.

**Test Data Preparation**:
- File exists: Types.proto
- Import statement: "types.proto"

**Test Steps**:
1. Create file with specific case
2. Attempt to resolve with different case
3. Verify behavior based on OS

**Expected Results**:
- On case-sensitive OS: Resolution fails with clear error
- On case-insensitive OS: Resolution may succeed
- Error suggests checking exact case

### ERR-IMPORT-05: Import of non-proto file

**Test Purpose**: Verify validation that imports reference .proto files.

**Test Data Preparation**:
- Import: "types.json"
- Import: "readme.md"

**Test Steps**:
1. Attempt to import non-.proto files
2. Verify validation error

**Expected Results**:
- Import rejected with clear error
- Error indicates file must have .proto extension
- Suggests correct file naming

### ERR-CONFIG-01: Invalid configuration type

**Test Purpose**: Verify type validation for all configuration options.

**Test Data Preparation**:
```typescript
{
  protoRoot: 123,           // Should be string
  maxCacheSize: "large",    // Should be number
  verbose: "yes"            // Should be boolean
}
```

**Test Steps**:
1. Create ConfigValidator instance
2. Validate configuration with wrong types
3. Verify errors for each type mismatch

**Expected Results**:
- Validation fails with detailed errors
- Each error specifies:
  - Field name
  - Expected type
  - Received type
  - Helpful suggestion

### ERR-CONFIG-02: Unknown configuration option

**Test Purpose**: Verify detection and reporting of unknown options.

**Test Data Preparation**:
```typescript
{
  unknownOption: true,
  protoRot: '/project',  // Typo
  generateReactHoks: true // Typo
}
```

**Test Steps**:
1. Validate configuration with unknown options
2. Verify warnings are generated
3. Check for typo suggestions

**Expected Results**:
- Warnings generated for unknown options
- Typo suggestions: "protoRot" → "protoRoot"
- Typo suggestions: "generateReactHoks" → "generateReactHooks"

### ERR-CONFIG-03: Configuration value out of range

**Test Purpose**: Verify validation of numeric ranges and constraints.

**Test Data Preparation**:
```typescript
{
  maxCacheSize: -10,           // Must be positive
  performanceThreshold: 0,     // Must be positive
  bundleSizeTarget: -1         // Must be positive
}
```

**Test Steps**:
1. Validate configuration with invalid ranges
2. Verify range validation errors

**Expected Results**:
- Errors for negative values
- Clear message: "Must be a positive number"
- Suggestions with valid example values

### ERR-CONFIG-04: Conflicting configuration options

**Test Purpose**: Verify detection of conflicting options.

**Test Data Preparation**:
```typescript
{
  generateSuspenseHooks: true,
  generateReactHooks: false,  // Conflict: Suspense requires React hooks

  sourceMaps: true,
  optimization: {
    production: true,
    minify: true              // Conflict: sourceMaps + minify in production
  }
}
```

**Test Steps**:
1. Validate configuration with conflicts
2. Verify warnings are generated

**Expected Results**:
- Warning about Suspense hooks requiring React hooks
- Warning about sourceMaps + minify in production
- Helpful suggestions for resolution

### ERR-CONFIG-05: Typo in configuration key with suggestion

**Test Purpose**: Verify Levenshtein distance-based typo correction.

**Test Data Preparation**:
- Test typos with varying edit distances
- "protoRot" (1 char different from "protoRoot")
- "maxCachSize" (1 char missing from "maxCacheSize")
- "verbse" (1 char missing from "verbose")

**Test Steps**:
1. Use ConfigValidator.suggestCorrection()
2. Test with various typos
3. Verify suggestions accuracy

**Expected Results**:
- Suggestions provided for typos within 3 edit distance
- No suggestions for completely unrelated names
- Most likely correction chosen

### ERR-FS-01: File not found error

**Test Purpose**: Verify handling of missing file errors.

**Test Data Preparation**:
- Path: /tmp/test-nonexistent-{timestamp}.proto

**Test Steps**:
1. Attempt to read nonexistent file
2. Verify error is caught and handled
3. Check error message clarity

**Expected Results**:
- Error indicates file not found
- Shows attempted path
- Suggests checking path correctness

### ERR-FS-02: Permission denied error

**Test Purpose**: Verify handling of file permission errors.

**Test Data Preparation**:
1. Create test file
2. Set permissions to 0o000 (no access)

**Test Steps**:
1. Attempt to read protected file
2. Verify permission error is caught
3. Restore permissions for cleanup

**Expected Results**:
- Error indicates permission denied
- Clear message about access rights
- Cleanup succeeds despite error

### ERR-FS-03: File read retry mechanism

**Test Purpose**: Verify retry logic for transient file system errors.

**Test Data Preparation**:
- Mock file system that fails first N attempts

**Mock Strategy**:
```typescript
let attemptCount = 0;
jest.spyOn(fs, 'readFile').mockImplementation(() => {
  attemptCount++;
  if (attemptCount < 3) {
    throw new Error('EBUSY: resource busy');
  }
  return Promise.resolve('content');
});
```

**Test Steps**:
1. Configure retry mechanism
2. Attempt file read
3. Verify retries occur
4. Verify eventual success

**Expected Results**:
- Up to 3 retry attempts
- Exponential backoff between retries
- Success after transient errors resolve
- Final error if all retries exhausted

### ERR-FS-04: Directory not accessible

**Test Purpose**: Verify handling of inaccessible directory errors.

**Test Data Preparation**:
- Create directory with restrictive permissions

**Test Steps**:
1. Configure protoRoot to inaccessible directory
2. Attempt to resolve imports
3. Verify clear error message

**Expected Results**:
- Error indicates directory access problem
- Suggests checking permissions
- Does not crash or hang

### ERR-FS-05: Disk full error handling

**Test Purpose**: Verify handling of disk space errors during cache operations.

**Mock Strategy**:
```typescript
jest.spyOn(fs, 'writeFile').mockRejectedValue(
  new Error('ENOSPC: no space left on device')
);
```

**Test Steps**:
1. Mock disk full error
2. Attempt cache save
3. Verify graceful handling

**Expected Results**:
- Error logged but doesn't crash
- Cache operations continue in memory
- Clear error message about disk space
- Suggests freeing disk space or disabling persistent cache

## Test Considerations

### Mock Strategy

**Parser Mocking**:
- Mock @hallow/parser to simulate parse errors
- Control error location (line/column) in test data
- Generate realistic error messages

**File System Mocking**:
- Use temp directories for actual file tests
- Mock fs module for error simulation
- Clean up temp files in afterEach hooks

**Dependency Graph**:
- Use real DependencyGraph for cycle detection
- Create minimal test graphs for clarity
- Test both small and large graphs

### Boundary Conditions

**File Positions**:
- Line 0, Line 1 (start of file)
- Last line of file
- Beyond EOF (should be validated)

**Column Positions**:
- Column 0, Column 1
- End of line
- Beyond line length
- Unicode character boundaries

**Graph Sizes**:
- Empty graph (0 nodes)
- Single node
- Large graph (100+ nodes)
- Disconnected components

**Configuration Values**:
- Minimum values (0, empty array)
- Maximum reasonable values
- Negative values (invalid)
- Undefined vs null vs missing

### Asynchronous Operations

**File System Operations**:
- All fs operations are async
- Use async/await in tests
- Handle promise rejections properly

**Retry Logic**:
- Async retry mechanisms
- Timeout handling
- Concurrent operation handling

**Cache Operations**:
- Disk save is async
- Disk load is async
- Concurrent cache access

### Error Recovery

**Resource Cleanup**:
- Temp files removed even if test fails
- Permissions restored after permission tests
- Cache cleared between tests

**State Reset**:
- Each test starts with clean state
- No cross-test contamination
- Isolated dependency graphs

**Retry After Failure**:
- Plugin should allow rebuilds after errors
- Cache should recover from corruption
- No permanent error states

## Performance Targets

- Cycle detection in 100-node graph: < 100ms
- Error formatting: < 5ms
- Configuration validation: < 10ms
- File resolution with 10 search paths: < 50ms

## Coverage Goals

- All error types have test coverage
- All error formatting functions tested
- Both success and failure paths tested
- Edge cases and boundary conditions covered
- Target: 100% coverage of error handling code
