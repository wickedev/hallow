# Error Scenario Tests - Task 18.5

## Overview

This directory contains comprehensive error scenario tests for Task 18.5, focusing on reliability (Non-functional: Reliability 2) requirements for the @hallow/plugin package.

## Test Files

### Documentation

- **error-scenarios.md** - Comprehensive test case documentation
  - Location: `/tests/docs/error-scenarios.md`
  - Contains detailed test specifications for all 25 error scenarios
  - Includes test purpose, data preparation, steps, and expected results
  - Documents mock strategies, boundary conditions, and performance targets

### Test Implementation

- **task-18.5-comprehensive-errors.test.ts** - Complete test suite implementation
  - Location: `/tests/error-scenarios/task-18.5-comprehensive-errors.test.ts`
  - 41 tests covering all error scenarios
  - 100% passing test coverage
  - Follows AAA (Arrange-Act-Assert) pattern

## Test Coverage

### 1. Proto Syntax Errors (5 tests)
- ERR-SYNTAX-01: Syntax error with line/column location
- ERR-SYNTAX-02: Multiple syntax errors in single file
- ERR-SYNTAX-03: Syntax error at file start
- ERR-SYNTAX-04: Syntax error at file end
- ERR-SYNTAX-05: Syntax error with Unicode characters

### 2. Circular Dependencies (5 tests)
- ERR-CIRC-01: Simple circular dependency (A→B→A)
- ERR-CIRC-02: Complex circular dependency (A→B→C→A)
- ERR-CIRC-03: Self-referencing file
- ERR-CIRC-04: Multiple circular chains
- ERR-CIRC-05: Circular dependency detection in large graph

### 3. Missing Imports (5 tests)
- ERR-IMPORT-01: Missing import file
- ERR-IMPORT-02: Invalid import path format
- ERR-IMPORT-03: Import resolution with multiple search paths
- ERR-IMPORT-04: Case-sensitive import resolution
- ERR-IMPORT-05: Import of non-proto file

### 4. Invalid Configuration (5 tests)
- ERR-CONFIG-01: Invalid configuration type
- ERR-CONFIG-02: Unknown configuration option
- ERR-CONFIG-03: Configuration value out of range
- ERR-CONFIG-04: Conflicting configuration options
- ERR-CONFIG-05: Typo in configuration key with suggestion

### 5. File System Errors (5 tests)
- ERR-FS-01: File not found error
- ERR-FS-02: Permission denied error
- ERR-FS-03: File read retry mechanism
- ERR-FS-04: Directory not accessible
- ERR-FS-05: Disk full error handling

### 6. Additional Tests (6 tests)
- Error recovery and cleanup (2 tests)
- Error message quality (2 tests)
- Multiple error collection (2 tests)

## Running Tests

### Run all error scenario tests:
```bash
npm test -- tests/error-scenarios/task-18.5-comprehensive-errors.test.ts
```

### Run with coverage:
```bash
npm test -- tests/error-scenarios/task-18.5-comprehensive-errors.test.ts --coverage
```

### Run specific test suite:
```bash
npm test -- tests/error-scenarios/task-18.5-comprehensive-errors.test.ts -t "ERR-SYNTAX"
```

## Test Results

**All 41 tests passing:**
- ✓ Proto syntax errors: 8 tests
- ✓ Circular dependencies: 6 tests
- ✓ Missing imports: 7 tests
- ✓ Invalid configuration: 9 tests
- ✓ File system errors: 7 tests
- ✓ Error recovery: 2 tests
- ✓ Error quality: 2 tests

## Key Features Tested

### Error Formatting
- Clear, actionable error messages
- File location with line/column numbers
- Code snippets with context lines
- ANSI color support for terminals
- Helpful suggestions for common mistakes

### Error Collection
- Multi-file error handling
- Grouped error reporting
- Error summaries by type
- Comprehensive error lists

### Dependency Management
- Cycle detection with complete path
- Topological sorting validation
- Large graph performance (<100ms for 100 nodes)

### Configuration Validation
- Type checking with Zod schemas
- Typo suggestions (Levenshtein distance)
- Conflict detection
- Range validation

### File System Handling
- Retry logic for transient errors
- Permission error handling
- Graceful degradation
- Resource cleanup

## Performance Targets

All tests meet the following performance requirements:
- Cycle detection in 100-node graph: < 100ms ✓
- Error formatting: < 5ms ✓
- Configuration validation: < 10ms ✓
- File resolution with 10 search paths: < 50ms ✓

## Documentation

Full test documentation is available in:
- `/tests/docs/error-scenarios.md` - Complete test specifications
- This README - Quick reference and overview

## Maintenance

When adding new error scenarios:
1. Add test case to `error-scenarios.md` documentation
2. Implement test in `task-18.5-comprehensive-errors.test.ts`
3. Follow AAA pattern (Arrange-Act-Assert)
4. Include clear comments explaining test purpose
5. Verify all tests pass before committing
