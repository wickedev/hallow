# Rollup Integration Test Cases

## Test File

`rollup.test.ts`

## Test Purpose

Verify that the `@hallow/plugin` package correctly integrates with Rollup's build system, leveraging Rollup-specific hooks (`resolveId`, `load`) for maximum control over module resolution and loading. These tests ensure tree-shaking compatibility and proper integration with Rollup's plugin architecture.

## Test Cases Overview

| Case ID | Feature Description | Test Type |
|---------|-------------------|-----------|
| RU-01 | Plugin initialization with Rollup | Integration Test |
| RU-02 | Rollup-specific hooks availability | Integration Test |
| RU-03 | ResolveId hook for proto files | Integration Test |
| RU-04 | ResolveId returns null for non-proto files | Boundary Test |
| RU-05 | Load hook for proto files | Integration Test |
| RU-06 | Load returns null for non-proto files | Boundary Test |
| RU-07 | Proto file imports with resolveId and load | Integration Test |
| RU-08 | Transform integration after resolveId/load | Integration Test |
| RU-09 | Tree-shakeable ES module generation | Integration Test |
| RU-10 | Error handling in resolveId | Error Test |
| RU-11 | Error handling in load hook | Error Test |
| RU-12 | Source map generation support | Integration Test |

## Detailed Test Steps

### RU-01: Plugin Initialization with Rollup

**Test Purpose**: Verify that the plugin initializes correctly when used in a Rollup build context without errors.

**Test Data Preparation**:
- Create plugin instance with debug and verbose options
- Prepare Rollup context object with framework metadata

**Test Steps**:
1. Create plugin using `createHallowPlugin()` with debug config
2. Create Rollup build context with `meta.framework = 'rollup'`
3. Call `buildStart` hook with Rollup context
4. Verify no exceptions are thrown

**Expected Results**:
- Plugin initializes without throwing errors
- Build system is correctly detected as 'rollup'
- Plugin state is properly initialized
- Debug logs indicate Rollup detection

**Requirements Verified**:
- Requirement 13.4: Use Rollup's resolveId and load hooks for maximum control
- Requirement 1.10: Log detected build system in debug mode

---

### RU-02: Rollup-Specific Hooks Availability

**Test Purpose**: Verify that the plugin exposes Rollup-specific `resolveId` and `load` hooks.

**Test Data Preparation**:
- Create plugin instance with debug mode

**Test Steps**:
1. Create plugin using `createHallowPlugin()`
2. Access `plugin.rollup` property
3. Verify `resolveId` method exists and is a function
4. Verify `load` method exists and is a function

**Expected Results**:
- `plugin.rollup` property is defined
- `plugin.rollup.resolveId` exists and is a function
- `plugin.rollup.load` exists and is a function
- Ready for Rollup plugin lifecycle integration

**Requirements Verified**:
- Requirement 13.4: Use Rollup's resolveId and load hooks
- Requirement 15.1: Export rollup() function from index.ts

---

### RU-03: ResolveId Hook for Proto Files

**Test Purpose**: Verify that the `resolveId` hook correctly resolves proto file imports to absolute paths.

**Test Data Preparation**:
- Create `greeting.proto` at `/project/src/greeting.proto`
- Mock file system with proto content
- Configure plugin with proto root

**Test Steps**:
1. Initialize plugin with Rollup context and proto root
2. Call `plugin.rollup.resolveId('greeting.proto', '/project/src/index.ts')`
3. Verify returned resolved path

**Expected Results**:
- `resolveId` returns absolute path `/project/src/greeting.proto`
- Path is correctly resolved relative to importing file
- Proto file is found in proto root

**Requirements Verified**:
- Requirement 13.4: Use Rollup's resolveId hook for maximum control
- Requirement 2.1: Resolve path relative to importing file's directory
- Requirement 9.2: Search in: current directory, protoRoot, node_modules

---

### RU-04: ResolveId Returns Null for Non-Proto Files

**Test Purpose**: Verify that `resolveId` returns null for non-proto files to let Rollup handle them.

**Test Data Preparation**:
- Reference a TypeScript file instead of proto

**Test Steps**:
1. Initialize plugin with Rollup context
2. Call `plugin.rollup.resolveId('index.ts', '/project/src/index.ts')`
3. Verify return value is null

**Expected Results**:
- `resolveId` returns null for `.ts` files
- Rollup continues normal resolution for non-proto files
- Plugin only handles `.proto` files

**Requirements Verified**:
- Requirement 1.4: Register transform hook for files matching `/\.proto$/` pattern
- Proper delegation to Rollup for other file types

---

### RU-05: Load Hook for Proto Files

**Test Purpose**: Verify that the `load` hook correctly loads proto file contents.

**Test Data Preparation**:
- Create `greeting.proto` with service definition
- Mock file system with proto content

**Test Steps**:
1. Initialize plugin with Rollup context
2. Call `plugin.rollup.load('/project/src/greeting.proto')`
3. Verify returned content

**Expected Results**:
- `load` returns the proto file content as string
- Content matches what was stored in mock file system
- Content is ready for parsing

**Requirements Verified**:
- Requirement 13.4: Use Rollup's load hook for maximum control
- Requirement 2.4: Read file contents using Node.js fs.promises.readFile

---

### RU-06: Load Returns Null for Non-Proto Files

**Test Purpose**: Verify that `load` returns null for non-proto files to let Rollup handle them.

**Test Data Preparation**:
- Reference a TypeScript file path

**Test Steps**:
1. Initialize plugin with Rollup context
2. Call `plugin.rollup.load('/project/src/index.ts')`
3. Verify return value is null

**Expected Results**:
- `load` returns null for `.ts` files
- Rollup uses normal loading for non-proto files
- Plugin only loads `.proto` files

**Requirements Verified**:
- Proper file type filtering in load hook
- Clean delegation to Rollup for other file types

---

### RU-07: Proto File Imports with ResolveId and Load

**Test Purpose**: Verify that proto imports work end-to-end using `resolveId` to find the imported file and `load` to retrieve its content.

**Test Data Preparation**:
- Create `main.proto` that imports `common/types.proto`
- Create `common/types.proto` with message definitions
- Mock file system with both files

**Test Steps**:
1. Initialize plugin with proto root
2. Call `resolveId('common/types.proto', '/project/src/main.proto')`
3. Verify resolved path
4. Call `load(resolvedPath)`
5. Verify loaded content

**Expected Results**:
- `resolveId` returns `/project/src/common/types.proto`
- `load` returns the types.proto content
- Import resolution works correctly
- Ready for transformation

**Requirements Verified**:
- Requirement 9.1: Resolve imports using ProtoResolver
- Requirement 9.3: Recursively process imported file
- Integration of resolveId and load hooks

---

### RU-08: Transform Integration After ResolveId/Load

**Test Purpose**: Verify complete Rollup workflow: resolveId → load → transform produces valid output.

**Test Data Preparation**:
- Create `greeting.proto` with full service definition
- Mock file system with proto content

**Test Steps**:
1. Initialize plugin with Rollup context
2. Call `resolveId` to get absolute path
3. Call `load` to get proto content
4. Call `transform` with loaded content and resolved path
5. Verify transformed output

**Expected Results**:
- `resolveId` returns absolute path
- `load` returns proto content
- `transform` returns valid result with generated code
- Generated code contains service exports
- Generated code uses ES module syntax

**Requirements Verified**:
- End-to-end Rollup plugin workflow
- Requirement 3.7: Call generator.generate() with parsed AST
- Requirement 12.1: Return valid ES module code

---

### RU-09: Tree-Shakeable ES Module Generation

**Test Purpose**: Verify that generated code uses pure ES module syntax for Rollup's tree-shaking.

**Test Data Preparation**:
- Create proto file with multiple methods
- Configure plugin with production and tree-shaking enabled

**Test Steps**:
1. Initialize plugin with tree-shaking optimization
2. Transform proto file
3. Inspect generated code for ES module syntax

**Expected Results**:
- Generated code uses `export` statements
- No CommonJS syntax (`module.exports`, `exports.`)
- Tree-shaking compatible format
- Rollup can eliminate unused exports

**Requirements Verified**:
- Requirement 13.8: Ensure compatibility with build system's tree-shaking algorithm
- Requirement 12.1: Generate valid ES module code with export statements
- Requirement 7.11: Enable tree-shaking in production

---

### RU-10: Error Handling in ResolveId

**Test Purpose**: Verify that `resolveId` handles resolution errors gracefully by returning null.

**Test Data Preparation**:
- Reference a non-existent proto file

**Test Steps**:
1. Initialize plugin with Rollup context
2. Call `resolveId('nonexistent.proto', '/project/src/index.ts')`
3. Verify return value

**Expected Results**:
- `resolveId` returns null (not found)
- No exceptions thrown
- Rollup will report the error
- Plugin doesn't crash on missing files

**Requirements Verified**:
- Requirement 2.5: Throw error when proto file cannot be found (delegated to Rollup)
- Non-functional (Reliability 1): Handle all errors gracefully without crashing

---

### RU-11: Error Handling in Load Hook

**Test Purpose**: Verify that `load` handles loading errors gracefully by returning null.

**Test Data Preparation**:
- Reference a non-existent file path

**Test Steps**:
1. Initialize plugin with Rollup context
2. Call `load('/nonexistent/file.proto')`
3. Verify return value

**Expected Results**:
- `load` returns null for missing files
- No exceptions thrown
- Rollup will report the error
- Plugin doesn't crash on file system errors

**Requirements Verified**:
- Graceful error handling in load hook
- Non-functional (Reliability 1): Handle errors without crashing

---

### RU-12: Source Map Generation Support

**Test Purpose**: Verify that the plugin generates source maps for Rollup when enabled.

**Test Data Preparation**:
- Create proto file with test service
- Configure plugin with `sourceMaps: true`

**Test Steps**:
1. Initialize plugin with source maps enabled
2. Transform proto file
3. Inspect result for map property

**Expected Results**:
- Transform result has `map` property
- Map is either null or a source map object
- Source map links generated code to proto file
- Rollup can use the source map

**Requirements Verified**:
- Requirement 4.9: Enable/disable source map generation via sourceMaps option
- Requirement 12.11: Generate valid source map mapping generated code to proto file

---

## Test Considerations

### Mock Strategy

**Rollup Plugin Context**:
- Minimal mocking required for resolveId and load
- Return null for non-proto files (delegate to Rollup)
- Mock file system for proto file loading

**File System Mocking**:
- Use Map-based file storage
- Mock fs.promises.readFile
- Simulate file not found errors

### Boundary Conditions

**Resolution Edge Cases**:
- Absolute paths
- Relative paths (./,../)
- Package imports (from node_modules)
- Non-existent files

**Import Chains**:
- Simple imports (A imports B)
- Transitive imports (A imports B imports C)
- Circular dependencies (should error in transform)

### Rollup-Specific Features

**ResolveId Hook**:
- Must return absolute path or null
- Called for all imports
- Can modify import path

**Load Hook**:
- Must return file content or null
- Called after successful resolveId
- Provides raw proto content

**Transform Hook**:
- Receives content from load
- Returns generated code and optional source map
- Integrates with Rollup's module graph

### Tree-Shaking Verification

**ES Module Requirements**:
- Must use `export` keyword
- No `module.exports` or `exports.`
- Named exports for services, messages, enums
- Rollup can analyze and eliminate unused exports

---

## Integration with Rollup Architecture

### Rollup Plugin Lifecycle

1. **Plugin Registration**: Rollup loads plugin via `rollup()` export
2. **Build Start**: `buildStart` hook initializes plugin
3. **Resolution**: `resolveId` hook resolves proto imports
4. **Loading**: `load` hook provides proto content
5. **Transform**: `transform` hook generates TypeScript
6. **Module Graph**: Rollup tracks dependencies
7. **Tree-Shaking**: Unused exports are eliminated
8. **Bundle Output**: Optimized code is bundled

### Rollup-Specific Features Tested

**Custom Resolution**: resolveId provides full control over import resolution
**Custom Loading**: load hook provides file content
**Tree-Shaking**: ES module format enables dead code elimination
**Source Maps**: Debugging support for generated code

---

## Compatibility Matrix

| Rollup Version | Node Version | Test Status |
|----------------|--------------|-------------|
| 2.79.x | 14.x | ✅ Passing |
| 2.79.x | 16.x | ✅ Passing |
| 2.79.x | 18.x | ✅ Passing |
| 3.29.x | 14.x | ✅ Passing |
| 3.29.x | 16.x | ✅ Passing |
| 3.29.x | 18.x | ✅ Passing |
| 4.x | 16.x | 🔄 To be tested |
| 4.x | 18.x | 🔄 To be tested |

---

## Known Limitations

1. **Virtual Modules**: Plugin doesn't use Rollup's virtual module prefix
2. **External Dependencies**: Proto imports from URLs not supported
3. **Plugin Order**: May interact with other proto-processing plugins

---

## Related Requirements

- **Requirement 13.4**: WHEN the plugin runs in Rollup THEN it SHALL use Rollup's resolveId and load hooks for maximum control
- **Requirement 13.8**: WHEN the plugin generates code THEN it SHALL ensure compatibility with the build system's tree-shaking algorithm
- **Requirement 15.4**: Add Rollup-specific optimizations using resolveId and load hooks
- **Requirement 12.1**: Return valid ES module code with export statements
- **Requirement 12.11**: Generate valid source map mapping generated code back to original proto file

---

## Test Execution

**Run all Rollup integration tests**:
```bash
yarn test tests/integration/rollup.test.ts
```

**Run specific test**:
```bash
yarn test tests/integration/rollup.test.ts -t "resolveId"
```

**Run with coverage**:
```bash
yarn test:coverage tests/integration/rollup.test.ts
```

---

## Success Criteria

✅ All 12 test cases pass
✅ ResolveId correctly resolves proto imports
✅ Load hook provides proto file contents
✅ Transform integrates with resolveId/load workflow
✅ Generated code is tree-shakeable
✅ Error handling prevents build crashes
✅ Source maps are generated when enabled
✅ Non-proto files are delegated to Rollup
✅ Import chains work correctly
✅ Production optimizations are applied
