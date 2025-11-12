# Plugin Package Test Suite Overview

## Introduction

This document provides a comprehensive overview of the test suite for the `@hallow/plugin` package. The test suite ensures that the plugin meets all functional and non-functional requirements with ≥90% code coverage.

## Test Organization

The test suite is organized into five main categories aligned with implementation tasks 18.1-18.5:

### 1. Unit Tests (Task 18.1)
**Location**: `tests/unit/`
**Documentation**: `tests/docs/18.1-unit-tests.md`
**Coverage Target**: ≥90% for all components

Tests individual components in isolation with mocked dependencies:
- **ProtoResolver** (6 test suites): Path resolution, well-known types, security validation
- **DependencyGraph** (6 test suites): Topological sort, cycle detection, invalidation
- **CacheManager** (7 test suites): Caching, LRU eviction, persistence
- **ConfigValidator** (6 test suites): Validation, type checking, suggestions
- **ErrorFormatter** (6 test suites): Error formatting, snippets, colorization
- **PerformanceMonitor** (5 test suites): Metrics tracking, reporting, export

**Total Unit Test Cases**: 36 documented test scenarios

### 2. Integration Tests (Task 18.2)
**Location**: `tests/integration/`
**Documentation**: `tests/docs/18.2-integration-tests.md`
**Coverage Target**: All 4 build systems

Tests plugin integration with build systems:
- **Vite** (5 test suites): Transform, HMR, virtual modules, TypeScript, source maps
- **Webpack** (4 test suites): Transform, module resolution, production, watch mode
- **ESBuild** (3 test suites): Transform, performance, bundler integration
- **Rollup** (4 test suites): Transform, resolveId hook, load hook, bundles

**Total Integration Test Cases**: 16 documented test scenarios

### 3. End-to-End Workflow Tests (Task 18.3)
**Location**: `tests/e2e/`
**Documentation**: `tests/docs/18.3-e2e-tests.md`
**Test File**: `workflow.test.ts`

Tests complete workflows from proto import to execution:
- Import proto and call gRPC methods
- Generate React hooks
- Multi-file proto dependencies
- Cache invalidation on changes
- Production code optimization
- TypeScript autocomplete integration
- Well-known types handling
- Complex dependency graphs
- Concurrent processing
- Full build pipeline

**Total E2E Test Cases**: 10 documented test scenarios

### 4. Performance Benchmark Tests (Task 18.4)
**Location**: `tests/benchmarks/`
**Documentation**: `tests/docs/18.4-performance-tests.md`
**Test File**: `performance.test.ts`

Performance benchmarks with defined targets:
- Single proto cold start (<200ms)
- Cached file retrieval (<10ms)
- Large proto file sets (100+ files, <100MB memory)
- Topological sort (1000 nodes, <100ms)
- Build overhead (<10%)
- Memory usage under load
- Concurrent processing (2x speedup)
- HMR update latency (<50ms)
- Cache hit performance (20x faster)
- Parser overhead (<100ms for 100KB)

**Total Performance Test Cases**: 10 documented benchmarks

### 5. Error Scenario Tests (Task 18.5)
**Location**: `tests/error-scenarios/`
**Documentation**: `tests/docs/18.5-error-scenario-tests.md`
**Test File**: `errors.test.ts`

Comprehensive error handling verification:
- Proto syntax errors with location
- Circular dependency detection
- Missing import resolution
- Invalid configuration handling
- File system errors with retry
- Generator failure wrapping
- Type resolution errors
- Path traversal security
- Cache corruption recovery
- Build system compatibility
- Out of memory handling
- Concurrent write conflicts
- Malformed proto files
- Network timeout handling
- Missing peer dependencies

**Total Error Test Cases**: 15 documented error scenarios

## Test Statistics

### Coverage Summary

| Component | Unit Tests | Integration Tests | E2E Tests | Total |
|-----------|-----------|-------------------|-----------|-------|
| ProtoResolver | 6 | - | - | 6 |
| DependencyGraph | 6 | - | - | 6 |
| CacheManager | 7 | - | - | 7 |
| ConfigValidator | 6 | - | - | 6 |
| ErrorFormatter | 6 | - | - | 6 |
| PerformanceMonitor | 5 | - | - | 5 |
| Vite Integration | - | 5 | - | 5 |
| Webpack Integration | - | 4 | - | 4 |
| ESBuild Integration | - | 3 | - | 3 |
| Rollup Integration | - | 4 | - | 4 |
| E2E Workflows | - | - | 10 | 10 |
| Performance Benchmarks | - | - | 10 | 10 |
| Error Scenarios | - | - | 15 | 15 |
| **TOTAL** | **36** | **16** | **35** | **87** |

### File Coverage

**Test Files Created**:
- Unit tests: 25 files (already existed)
- Integration tests: 6 files (already existed)
- E2E tests: 1 file (newly created)
- Performance benchmarks: 1 file (newly created)
- Error scenarios: 1 file (newly created)

**Total Test Files**: 34 files

**Documentation Files Created**:
- 18.1-unit-tests.md
- 18.2-integration-tests.md
- 18.3-e2e-tests.md
- 18.4-performance-tests.md
- 18.5-error-scenario-tests.md
- TEST-SUITE-OVERVIEW.md (this file)

**Total Documentation Files**: 6 files

## Running Tests

### Run All Tests
```bash
cd packages/plugin
yarn test
```

### Run Unit Tests Only
```bash
yarn test tests/unit
```

### Run Integration Tests Only
```bash
yarn test tests/integration
```

### Run E2E Tests Only
```bash
yarn test tests/e2e
```

### Run Performance Benchmarks
```bash
yarn test tests/benchmarks
```

### Run Error Scenario Tests
```bash
yarn test tests/error-scenarios
```

### Run with Coverage
```bash
yarn test:coverage
```

### Run in Watch Mode
```bash
yarn test:watch
```

## Test Configuration

### Jest Configuration (package.json)

```json
{
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "testMatch": ["**/tests/**/*.test.ts"],
    "collectCoverageFrom": [
      "src/**/*.ts",
      "!src/**/*.d.ts"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 90,
        "functions": 90,
        "lines": 90,
        "statements": 90
      }
    }
  }
}
```

### Coverage Requirements

All source files must meet these thresholds:
- **Branches**: ≥90%
- **Functions**: ≥90%
- **Lines**: ≥90%
- **Statements**: ≥90%

## Test Quality Standards

### Unit Tests
- Test components in isolation
- Mock all external dependencies
- Cover all public methods
- Test error paths
- Test boundary conditions
- Use descriptive test names
- Follow AAA pattern (Arrange-Act-Assert)

### Integration Tests
- Use real build systems
- Minimal mocking
- Test actual transformations
- Verify build system-specific features
- Clean up resources

### E2E Tests
- Test complete workflows
- Use temporary file systems
- Test realistic scenarios
- Verify end-to-end functionality
- Proper cleanup

### Performance Tests
- Use high-resolution timing
- Run multiple iterations
- Calculate statistics (mean, p95, p99)
- Compare against baselines
- Document performance budgets

### Error Tests
- Test all error categories
- Verify error message quality
- Test error recovery
- Verify cleanup after errors
- Test security scenarios

## Performance Budgets

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| Cold start (single file) | <200ms | >250ms |
| Cache hit | <10ms | >15ms |
| 100 files total | <20s | >30s |
| Peak memory (100 files) | <100MB | >150MB |
| Topological sort (1000 nodes) | <100ms | >150ms |
| Build overhead | <10% | >15% |
| HMR latency | <50ms | >75ms |
| Cache hit speedup | 20x | <15x |

## Continuous Integration

### CI Pipeline
```yaml
# Example GitHub Actions workflow
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: yarn install
      - run: yarn test:coverage
      - run: yarn test tests/benchmarks # Performance regression check
```

### Pre-commit Hooks
- Run linting: `yarn lint`
- Run type checking: `yarn typecheck`
- Run unit tests: `yarn test tests/unit`

### Pre-push Hooks
- Run all tests: `yarn test`
- Check coverage: `yarn test:coverage`

## Test Maintenance

### Adding New Tests
1. Determine test category (unit/integration/e2e/performance/error)
2. Create test file in appropriate directory
3. Follow existing test patterns and naming conventions
4. Add documentation in corresponding docs file
5. Ensure coverage thresholds are met
6. Update this overview if needed

### Updating Tests
1. Keep tests in sync with implementation changes
2. Update documentation when test behavior changes
3. Maintain backward compatibility where possible
4. Re-run coverage checks after updates

### Debugging Failed Tests
1. Run test in isolation: `yarn test -t "test name"`
2. Enable verbose output: `yarn test --verbose`
3. Check test logs for detailed errors
4. Use debugger: `node --inspect-brk node_modules/.bin/jest --runInBand`

## Test Reporting

### Coverage Reports
- HTML report: `coverage/lcov-report/index.html`
- Console summary: Shown after `yarn test:coverage`
- CI integration: Coverage uploaded to code coverage services

### Performance Reports
- JSON export: `.hallow-cache/performance.json`
- Console output: Timing statistics during benchmark runs
- Trend analysis: Track metrics over time in CI

### Error Reports
- Jest error output: Detailed stack traces
- Error message validation: Verify error format and content
- Security issue reporting: Flag security test failures

## Known Limitations

1. **Performance tests** are sensitive to system load and may need adjustment for CI environments
2. **Integration tests** require actual build system packages installed
3. **E2E tests** create temporary directories that may persist if tests crash
4. **Error tests** rely on mocked file system for some scenarios

## Future Improvements

1. Add mutation testing for improved test quality
2. Implement visual regression tests for error formatting
3. Add stress tests for extreme scenarios (1000+ files)
4. Create performance baseline comparison tool
5. Add test coverage for edge cases in proto syntax
6. Implement fuzz testing for parser robustness

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [TypeScript Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Test Coverage Best Practices](https://martinfowler.com/bliki/TestCoverage.html)

## Contact

For questions about the test suite:
- Review test documentation in `tests/docs/`
- Check implementation in source files
- Refer to requirements in `.claude/specs/plugin-package/`
