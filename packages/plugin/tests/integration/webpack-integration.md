# Webpack Integration Test Cases

## Test File

`webpack.test.ts`

## Test Purpose

Verify that the `@hallow/plugin` package correctly integrates with Webpack's build system and module resolution mechanisms. These tests ensure proto files are transformed correctly, watch mode works properly, and the plugin integrates seamlessly with Webpack's compilation lifecycle.

## Test Cases Overview

| Case ID | Feature Description | Test Type |
|---------|-------------------|-----------|
| WP-01 | Plugin initialization with Webpack | Integration Test |
| WP-02 | Proto file transformation | Positive Test |
| WP-03 | Webpack compilation hook | Integration Test |
| WP-04 | Module resolution system | Integration Test |
| WP-05 | Watch mode compatibility | Integration Test |
| WP-06 | Production build optimization | Integration Test |

## Detailed Test Steps

### WP-01: Plugin Initialization with Webpack

**Test Purpose**: Verify that the plugin initializes correctly when used in a Webpack build context without errors.

**Test Data Preparation**:
- Create plugin instance with debug and verbose options
- Prepare Webpack context object with framework metadata

**Test Steps**:
1. Create plugin using `createHallowPlugin()` with debug config
2. Create Webpack build context with `meta.framework = 'webpack'`
3. Call `buildStart` hook with Webpack context
4. Verify no exceptions are thrown

**Expected Results**:
- Plugin initializes without throwing errors
- Build system is correctly detected as 'webpack'
- Plugin state is properly initialized
- Debug logs indicate Webpack detection (if verbose mode)

**Requirements Verified**:
- Requirement 1.9: Integrate with Webpack's module resolution system
- Requirement 1.10: Log detected build system in debug mode
- Requirement 14.10: Log initialization success

---

### WP-02: Proto File Transformation

**Test Purpose**: Verify that proto files are correctly transformed into TypeScript/JavaScript modules within a Webpack build.

**Test Data Preparation**:
- Create `greeting.proto` with service and message definitions
- Mock file system with proto content
- Configure plugin with proto root path

**Test Steps**:
1. Initialize plugin with Webpack context
2. Call `buildStart` to initialize plugin state
3. Create transform context with Webpack metadata
4. Call `transform` hook with proto content and file path
5. Inspect transformed result

**Expected Results**:
- Transform returns valid result object with `code` property
- Generated code contains service name `GreetingService`
- Generated code uses ES module syntax (`export`)
- Generated code is valid TypeScript
- No parse or generation errors occur

**Requirements Verified**:
- Requirement 1.4: Register transform hook for files matching `/\.proto$/`
- Requirement 1.6: Transform hook receives file path and source code
- Requirement 1.7: Return valid TypeScript/JavaScript module code
- Requirement 3.7: Call `generator.generate()` with parsed AST

---

### WP-03: Webpack Compilation Hook

**Test Purpose**: Verify that the plugin registers a compilation hook with Webpack and logs compilation start in debug mode.

**Test Data Preparation**:
- Create plugin with debug mode enabled
- Mock Webpack compiler with compilation hooks
- Spy on console.log to verify debug output

**Test Steps**:
1. Create plugin with `debug: true`
2. Create mock Webpack compiler with `hooks.compilation.tap`
3. Call Webpack-specific hook on plugin
4. Verify hook registration and callback execution

**Expected Results**:
- Compilation hook is registered with name '@hallow/plugin'
- Callback function is provided and executed
- Debug log contains '[@hallow/plugin]' prefix
- Debug log contains 'Webpack compilation started' message
- Console output is properly formatted

**Requirements Verified**:
- Requirement 13.2: Implement loader interface for Webpack
- Requirement 21.1: Log build system detection
- Requirement 21.1: Use consistent log format with `[Hallow Plugin]` prefix

---

### WP-04: Module Resolution System

**Test Purpose**: Verify that the plugin correctly resolves proto imports using Webpack's module resolution system.

**Test Data Preparation**:
- Create `main.proto` that imports `common/types.proto`
- Create `common/types.proto` with shared message definitions
- Mock file system with both files
- Configure plugin with proto root

**Test Steps**:
1. Initialize plugin with Webpack context and proto root
2. Perform buildStart
3. Transform main proto file that contains import statement
4. Verify import resolution succeeds

**Expected Results**:
- Transform succeeds without resolution errors
- Imported types are accessible in generated code
- Dependency graph correctly tracks the import
- Generated code includes proper import statements

**Requirements Verified**:
- Requirement 1.9: Integrate with Webpack's module resolution system
- Requirement 2.6: Recursively resolve and parse all dependencies
- Requirement 9.1: Resolve imports using ProtoResolver
- Requirement 9.2: Search in correct order (current dir, protoRoot, node_modules)

---

### WP-05: Watch Mode Compatibility

**Test Purpose**: Verify that the plugin supports Webpack's watch mode by registering proto files for watching.

**Test Data Preparation**:
- Create `service.proto` with test service definition
- Mock file system with proto content
- Create spy function for `addWatchFile`

**Test Steps**:
1. Initialize plugin with Webpack context
2. Create transform context with `addWatchFile` spy
3. Transform proto file
4. Verify `addWatchFile` was called

**Expected Results**:
- `addWatchFile` is called at least once
- Proto file path is registered for watching
- Subsequent file changes will trigger rebuild
- Watch mode integration works correctly

**Requirements Verified**:
- Requirement 2.10: Call `this.addWatchFile(protoPath)` for each processed proto file
- Requirement 6.8: Register each proto file for watching via `this.addWatchFile()`
- Requirement 6.9: Build system re-triggers transform hook when watched file changes

---

### WP-06: Production Build Optimization

**Test Purpose**: Verify that the plugin applies appropriate optimizations during Webpack production builds.

**Test Data Preparation**:
- Set `NODE_ENV=production`
- Create proto file with test service
- Configure plugin with production optimization options

**Test Steps**:
1. Set environment to production mode
2. Create plugin with production optimization config
3. Initialize with Webpack context
4. Transform proto file
5. Inspect generated code
6. Restore original environment

**Expected Results**:
- Plugin detects production mode
- Optimization flags are applied (minify, removeComments)
- Generated code is optimized
- Source maps disabled by default in production
- Build completes successfully

**Requirements Verified**:
- Requirement 7.1: Detect production mode from `NODE_ENV === 'production'`
- Requirement 7.2: Set generator options with production flags
- Requirement 7.3: Disable source map generation by default in production
- Requirement 12.2: Pass optimization flags to generator

---

## Test Considerations

### Mock Strategy

**Webpack Compiler Mocking**:
- Mock `compiler.hooks.compilation.tap` for hook registration
- Provide callback execution to simulate compilation lifecycle
- Mock module resolution APIs if needed

**File System Mocking**:
- Use `Map<string, string>` for file contents
- Mock `fs.promises.readFile` to read from Map
- Mock `fs.promises.writeFile` for persistent cache

**Transform Context**:
- Include Webpack framework metadata
- Provide `addWatchFile` spy to verify watch registration
- Mock any Webpack-specific context properties

### Boundary Conditions

**Large Projects**:
- Multiple proto files (100+)
- Deep import chains
- Circular dependencies (should error)

**Edge Cases**:
- Empty proto files
- Proto files with syntax errors
- Missing import files
- Concurrent webpack compilations

### Webpack-Specific Features

**Loader Interface**:
- Transform hook acts as loader
- Proper integration with Webpack's module system
- Cache integration with Webpack's cache

**Module Resolution**:
- Respects Webpack's resolve configuration
- Works with Webpack aliases
- Handles node_modules resolution

### Performance Considerations

**Build Performance**:
- Initial build with cache miss
- Incremental builds with cache hits
- Watch mode rebuild speed
- Production build optimization time

**Memory Usage**:
- Cache size limits
- Memory-efficient large file handling
- Proper cleanup in watch mode

---

## Integration with Webpack Architecture

### Webpack Plugin Lifecycle

1. **Plugin Registration**: Webpack loads plugin via `webpack()` export
2. **Compilation Hook**: Plugin registers compilation listener
3. **Module Resolution**: Webpack resolves proto imports
4. **Loader Execution**: Transform hook processes proto files
5. **Module Building**: Generated code added to bundle

### Webpack-Specific Features Tested

**Compilation Hooks**: Plugin taps into compilation lifecycle
**Watch Mode**: File watching for development rebuild
**Module Graph**: Integration with Webpack's dependency tracking
**Production Mode**: Detection and optimization application

---

## Compatibility Matrix

| Webpack Version | Node Version | Test Status |
|-----------------|--------------|-------------|
| 5.89.x | 14.x | ✅ Passing |
| 5.89.x | 16.x | ✅ Passing |
| 5.89.x | 18.x | ✅ Passing |
| 5.90.x | 14.x | 🔄 To be tested |
| 5.90.x | 18.x | 🔄 To be tested |

---

## Known Limitations

1. **Persistent Cache**: Webpack 5 persistent cache integration not yet optimized
2. **Module Federation**: Proto sharing across federated modules not tested
3. **Worker Threads**: Multi-threaded Webpack builds may need additional testing

---

## Related Requirements

- **Requirement 1.9**: IF the build system is Webpack THEN the plugin SHALL integrate with Webpack's module resolution system
- **Requirement 13.2**: WHEN the plugin runs in Webpack THEN it SHALL implement the loader interface for optimal integration
- **Requirement 6.8**: WHEN the build system supports file watching THEN the plugin SHALL register each proto file for watching
- **Requirement 7.1**: WHEN the plugin detects production mode THEN it SHALL enable optimization

---

## Test Execution

**Run all Webpack integration tests**:
```bash
yarn test tests/integration/webpack.test.ts
```

**Run specific test**:
```bash
yarn test tests/integration/webpack.test.ts -t "compilation hook"
```

**Run with coverage**:
```bash
yarn test:coverage tests/integration/webpack.test.ts
```

---

## Success Criteria

✅ All 6 test cases pass
✅ Plugin initializes correctly in Webpack context
✅ Proto files are transformed to valid modules
✅ Compilation hook is registered and executes
✅ Module resolution works with imports
✅ Watch mode integrates properly
✅ Production optimizations are applied
