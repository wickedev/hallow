# ESBuild Integration Test Cases

## Test File

`esbuild.test.ts`

## Test Purpose

Verify that the `@hallow/plugin` package correctly integrates with ESBuild's ultra-fast build system while maintaining minimal overhead. These tests ensure the plugin leverages ESBuild's native speed, supports concurrent processing, and generates optimized output.

## Test Cases Overview

| Case ID | Feature Description | Test Type |
|---------|-------------------|-----------|
| ESB-01 | Plugin initialization with ESBuild | Integration Test |
| ESB-02 | ESBuild-specific setup hook | Integration Test |
| ESB-03 | Setup hook execution | Integration Test |
| ESB-04 | Async transform for non-blocking processing | Performance Test |
| ESB-05 | Concurrent proto file processing | Performance Test |
| ESB-06 | Efficient caching for performance | Performance Test |
| ESB-07 | Minimal logging overhead in production | Performance Test |
| ESB-08 | Tree-shakeable code generation | Integration Test |

## Detailed Test Steps

### ESB-01: Plugin Initialization with ESBuild

**Test Purpose**: Verify that the plugin initializes correctly when used in an ESBuild build context without errors.

**Test Data Preparation**:
- Create plugin instance with debug and verbose options
- Prepare ESBuild context object with framework metadata

**Test Steps**:
1. Create plugin using `createHallowPlugin()` with debug config
2. Create ESBuild build context with `meta.framework = 'esbuild'`
3. Call `buildStart` hook with ESBuild context
4. Verify no exceptions are thrown

**Expected Results**:
- Plugin initializes without throwing errors
- Build system is correctly detected as 'esbuild'
- Plugin state is properly initialized
- Minimal overhead during initialization

**Requirements Verified**:
- Requirement 13.3: Leverage ESBuild's native speed by minimizing overhead
- Requirement 1.10: Log detected build system in debug mode

---

### ESB-02: ESBuild-Specific Setup Hook

**Test Purpose**: Verify that the plugin provides ESBuild-specific setup hook for integration.

**Test Data Preparation**:
- Create plugin instance with debug mode

**Test Steps**:
1. Create plugin using `createHallowPlugin()`
2. Access `plugin.esbuild` property
3. Verify `setup` method exists
4. Verify `setup` is a function

**Expected Results**:
- `plugin.esbuild` property is defined
- `plugin.esbuild.setup` method exists
- Setup method is a function type
- Ready for ESBuild build object integration

**Requirements Verified**:
- Requirement 13.3: Minimize plugin overhead for ESBuild
- Requirement 15.1: Export esbuild() function from index.ts

---

### ESB-03: Setup Hook Execution

**Test Purpose**: Verify that the ESBuild setup hook executes without errors when called with a mock build object.

**Test Data Preparation**:
- Create plugin with debug mode enabled
- Create mock ESBuild build object with onResolve and onLoad hooks
- Spy on console.log for debug output

**Test Steps**:
1. Create plugin with `debug: true`
2. Create mock build object with hook registration methods
3. Call `plugin.esbuild.setup(mockBuild)`
4. Verify no exceptions are thrown

**Expected Results**:
- Setup hook executes without errors
- No unhandled exceptions
- Hook registration may occur (onResolve/onLoad)
- Debug logs may appear if verbose mode enabled

**Requirements Verified**:
- Requirement 13.3: Minimize overhead for ESBuild performance
- ESBuild plugin interface compliance

---

### ESB-04: Async Transform for Non-Blocking Processing

**Test Purpose**: Verify that the transform hook is async to enable non-blocking, concurrent processing in ESBuild.

**Test Data Preparation**:
- Create `greeting.proto` with service definition
- Mock file system with proto content
- Configure plugin with minimal debug output

**Test Steps**:
1. Initialize plugin with ESBuild context
2. Verify transform hook is async (AsyncFunction)
3. Call transform hook with proto content
4. Verify it returns a Promise
5. Await result and verify output

**Expected Results**:
- Transform hook is an AsyncFunction
- Transform returns a Promise immediately
- Promise resolves with valid result
- Generated code contains expected exports
- Non-blocking execution verified

**Requirements Verified**:
- Requirement 13.5: Allow concurrent proto file processing via async transform hooks
- Requirement 13.3: Minimize overhead by using efficient async patterns

---

### ESB-05: Concurrent Proto File Processing

**Test Purpose**: Verify that multiple proto files can be processed concurrently using Promise.all, demonstrating ESBuild's parallel processing capabilities.

**Test Data Preparation**:
- Create 3 proto files: service1.proto, service2.proto, service3.proto
- Each with distinct service definitions
- Mock file system with all three files

**Test Steps**:
1. Initialize plugin with ESBuild context and debug disabled
2. Create transform context
3. Start timer
4. Process all 3 files concurrently using Promise.all
5. Measure total duration
6. Verify all results

**Expected Results**:
- All 3 transforms complete successfully
- Each result contains expected service name
- Total duration is reasonable (<5 seconds)
- Concurrent processing is faster than sequential
- No race conditions or cache corruption

**Requirements Verified**:
- Requirement 13.5: Allow concurrent proto file processing via async transform hooks
- Requirement 13.3: Leverage ESBuild's native speed
- Non-functional (Performance 3): Support concurrent processing when build system allows

---

### ESB-06: Efficient Caching for Performance

**Test Purpose**: Verify that the plugin's caching mechanism significantly improves performance on repeated transformations, crucial for ESBuild's speed.

**Test Data Preparation**:
- Create `service.proto` with test service
- Mock file system with proto content
- Configure plugin with debug disabled for accurate timing

**Test Steps**:
1. Initialize plugin with ESBuild context
2. First transformation - measure duration (cache miss)
3. Verify result is valid
4. Second transformation with same content - measure duration (cache hit)
5. Compare durations

**Expected Results**:
- First transformation completes successfully
- Second transformation completes successfully
- Cached transformation is at least 50% faster
- Usually 90%+ faster due to cache hit
- No code quality difference between cached and uncached

**Requirements Verified**:
- Requirement 6.2: Return cached generated code without re-parsing when hash matches
- Requirement 6.3: Detect hash change and invalidate cache entry
- Requirement 13.3: Minimize overhead for maximum ESBuild performance
- Non-functional (Performance 2): Use intelligent caching to avoid redundant parsing

---

### ESB-07: Minimal Logging Overhead in Production

**Test Purpose**: Verify that the plugin minimizes logging in production mode to avoid overhead in ESBuild builds.

**Test Data Preparation**:
- Set `NODE_ENV=production`
- Create proto file with test service
- Configure plugin with debug and verbose disabled
- Spy on console.log to count log calls

**Test Steps**:
1. Set production environment
2. Create plugin with optimization config
3. Initialize with ESBuild context
4. Transform proto file
5. Count console.log calls
6. Restore original environment

**Expected Results**:
- Log call count is minimal (< 5 total)
- Most logs are suppressed in production
- Only critical errors would be logged
- Performance not degraded by logging

**Requirements Verified**:
- Requirement 13.3: Minimize overhead for ESBuild performance
- Requirement 21.1: Logging respects verbose/debug settings
- Production mode efficiency

---

### ESB-08: Tree-Shakeable Code Generation

**Test Purpose**: Verify that generated code uses ES module syntax to enable ESBuild's tree-shaking optimization.

**Test Data Preparation**:
- Create proto file with multiple methods
- Configure plugin with production and tree-shaking enabled

**Test Steps**:
1. Initialize plugin with tree-shaking optimization
2. Transform proto file
3. Inspect generated code

**Expected Results**:
- Generated code uses `export` statements
- No CommonJS syntax (`module.exports`, `exports.`)
- ES module format enables tree-shaking
- Unused exports can be eliminated by ESBuild

**Requirements Verified**:
- Requirement 13.8: Ensure compatibility with build system's tree-shaking algorithm
- Requirement 12.1: Return valid ES module code with export statements
- Requirement 7.11: Enable tree-shaking via optimization.treeshaking

---

## Test Considerations

### Mock Strategy

**ESBuild Build Object Mocking**:
- Mock `onResolve` for resolution hooks
- Mock `onLoad` for loading hooks
- Minimal mocking to test actual plugin behavior

**Performance Measurement**:
- Use `Date.now()` for timing measurements
- Account for variability in test environments
- Use reasonable thresholds (not absolute values)

**File System Mocking**:
- Same Map-based approach as other tests
- Ensure mock doesn't add overhead to timing tests

### Boundary Conditions

**Performance Edge Cases**:
- Very large proto files (>1MB)
- Many small proto files (1000+)
- Complex dependency graphs
- Concurrent cache access

**Optimization Cases**:
- Production vs development mode
- Tree-shaking enabled vs disabled
- Source maps enabled vs disabled

### ESBuild-Specific Features

**Native Speed**:
- Plugin should add <10% to build time
- Caching should reduce overhead to near-zero
- Async operations prevent blocking

**Concurrent Processing**:
- ESBuild processes files in parallel
- Plugin must be thread-safe
- No shared mutable state between transforms

### Performance Benchmarks

**Target Metrics**:
- Cold start transform: <200ms per file
- Cached transform: <10ms per file
- 100 files concurrent: <5 seconds total
- Memory usage: <100MB for cache

**Optimization Impact**:
- Caching: 90%+ speedup
- Concurrent processing: ~3x speedup
- Production mode: Smaller output, similar speed

---

## Integration with ESBuild Architecture

### ESBuild Plugin Lifecycle

1. **Plugin Registration**: ESBuild loads plugin via `esbuild()` export
2. **Setup Hook**: ESBuild calls `setup(build)` for configuration
3. **Resolution**: onResolve hooks handle proto file resolution
4. **Loading**: onLoad hooks may provide file contents
5. **Transform**: Transform hook converts proto to TypeScript
6. **Bundling**: ESBuild bundles generated code

### ESBuild-Specific Features Tested

**Setup Hook**: Custom ESBuild plugin initialization
**Async Transform**: Non-blocking concurrent processing
**Tree-Shaking**: ES module output for dead code elimination
**Performance**: Minimal overhead maintains ESBuild speed

---

## Performance Comparison

### Expected Performance Characteristics

| Operation | Cold Start | Cached | Notes |
|-----------|------------|--------|-------|
| Single File | <200ms | <10ms | With parser overhead |
| 10 Files | <1s | <50ms | Concurrent processing |
| 100 Files | <5s | <200ms | Scales linearly |
| Cache Hit Rate | N/A | 95%+ | In typical workflows |

---

## Compatibility Matrix

| ESBuild Version | Node Version | Test Status |
|-----------------|--------------|-------------|
| 0.19.x | 14.x | ✅ Passing |
| 0.19.x | 16.x | ✅ Passing |
| 0.19.x | 18.x | ✅ Passing |
| 0.20.x | 14.x | 🔄 To be tested |
| 0.20.x | 18.x | 🔄 To be tested |

---

## Known Limitations

1. **Watch Mode**: ESBuild watch mode testing limited (focus is on transform performance)
2. **Plugins API**: ESBuild plugins API is less feature-rich than Rollup/Webpack
3. **Source Maps**: Source map testing is basic (ESBuild handles most of it)

---

## Related Requirements

- **Requirement 13.3**: WHEN the plugin runs in ESBuild THEN it SHALL leverage ESBuild's native speed by minimizing overhead
- **Requirement 13.5**: WHEN the build system supports parallel processing THEN the plugin SHALL allow concurrent proto file processing
- **Requirement 13.8**: WHEN the plugin generates code THEN it SHALL ensure compatibility with the build system's tree-shaking algorithm
- **Non-functional (Performance 1)**: The plugin SHALL process proto files with minimal overhead, adding less than 10% to build time
- **Non-functional (Performance 2)**: The plugin SHALL use intelligent caching to avoid redundant parsing
- **Non-functional (Performance 3)**: The plugin SHALL support concurrent processing when the build system allows

---

## Test Execution

**Run all ESBuild integration tests**:
```bash
yarn test tests/integration/esbuild.test.ts
```

**Run specific test**:
```bash
yarn test tests/integration/esbuild.test.ts -t "concurrent processing"
```

**Run with coverage**:
```bash
yarn test:coverage tests/integration/esbuild.test.ts
```

---

## Success Criteria

✅ All 8 test cases pass
✅ Plugin maintains ESBuild's fast build speeds
✅ Concurrent processing works without race conditions
✅ Caching provides 90%+ speedup on repeated builds
✅ Production mode minimizes logging overhead
✅ Generated code is tree-shakeable
✅ Setup hook integrates cleanly with ESBuild
✅ Async transform enables non-blocking operations
