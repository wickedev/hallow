# Comprehensive Error Handling

This document describes the error handling implementation in @hallow/plugin, covering Tasks 17.1-17.4.

## Overview

The plugin implements comprehensive error handling across all stages of proto file processing:

1. **Parser Error Handling** (Task 17.1) - Syntax errors in proto files
2. **Generator Error Handling** (Task 17.2) - Code generation failures
3. **Resolution Error Handling** (Task 17.3) - Import resolution failures
4. **Multi-File Error Collection** (Task 17.4) - Batch error reporting

All errors follow a consistent format with the `[Hallow Plugin]` prefix for easy identification.

## Implementation Details

### Task 17.1: Parser Error Handling

**Location**: `/packages/plugin/src/plugin.ts` (lines 494-531)

**Requirements**: 8.1, 8.6, 8.12

**Features**:
- Catches parser errors during proto file parsing
- Formats errors with file path, line number, and column number
- Extracts code snippets showing context around the error
- Highlights the exact error location with a caret (^)

**Implementation**:
```typescript
try {
  const parser = new Parser();
  protoFile = parser.parse(code, id);

  // Record parse time for performance monitoring
  if (config.enablePerformanceMonitoring) {
    const parseTime = Date.now() - parseStartTime;
    performanceMonitor.recordParse(id, parseTime);
  }
} catch (error: any) {
  // Handle parser errors with ErrorFormatter
  if (error.line !== undefined && error.column !== undefined) {
    // Parser error with location
    throw new Error(
      ErrorFormatter.formatParseError(
        id,
        error.line,
        error.column,
        error.message,
        code
      )
    );
  } else {
    // Generic parse error
    throw new Error(
      ErrorFormatter.formatParseError(
        id,
        0,
        0,
        error.message || String(error),
        undefined
      )
    );
  }
}
```

**Error Format Example**:
```
[Hallow Plugin] Proto syntax error
File: /project/service.proto
Line 15, Column 8: Expected semicolon but found "string"

  13 | message GreetRequest {
  14 |   string name = 1
> 15 |   string metadata = 2;
     |        ^
  16 | }
```

### Task 17.2: Generator Error Handling

**Location**: `/packages/plugin/src/plugin.ts` (lines 671-685)

**Requirements**: 8.4, 8.8

**Features**:
- Catches code generation errors from @hallow/generator
- Wraps errors with file context
- Includes full stack trace in verbose/debug mode
- Handles both GenerationError and generic Error types

**Implementation**:
```typescript
try {
  // Generate code using the Generator
  const generatedResult = await state.generator.generateCode(protoFile);

  // Process generated code...

} catch (error: any) {
  // Handle generator errors with ErrorFormatter
  if (error instanceof GenerationError) {
    throw new Error(
      ErrorFormatter.formatGenerateError(
        id,
        new Error(`${error.message}\nCode: ${error.code}`)
      )
    );
  } else {
    throw new Error(
      ErrorFormatter.formatGenerateError(id, error as Error)
    );
  }
}
```

**Error Format Example** (verbose mode):
```
[Hallow Plugin] Code generation failed
File: /project/service.proto
Reason: Failed to generate service stub
Code: INVALID_MESSAGE_TYPE

Stack trace:
Error: Failed to generate service stub
    at Generator.generateCode (generator.ts:100:15)
    at plugin.transform (plugin.ts:589:42)
```

### Task 17.3: Resolution Error Handling

**Location**: `/packages/plugin/src/plugin.ts` (lines 561-567)

**Requirements**: 8.3, 8.7, 8.10

**Features**:
- Catches import resolution errors from ProtoResolver
- Shows all searched paths to help debug resolution issues
- Provides helpful suggestions for common problems
- Handles both relative and absolute imports

**Implementation**:
```typescript
for (const importPath of protoFile.imports) {
  try {
    // Resolve the import path
    const resolved = resolver.resolve(importPath, id);

    // Add to resolved imports list
    resolvedImports.push(resolved.absolutePath);

  } catch (error: any) {
    // Handle resolution errors with ErrorFormatter
    const searchPaths = resolver.getSearchPaths(id);
    throw new Error(
      ErrorFormatter.formatResolveError(importPath, id, searchPaths)
    );
  }
}
```

**Error Format Example**:
```
[Hallow Plugin] Import resolution failed
File: /project/service.proto
Cannot resolve import: "common/types.proto"

Searched in:
  - /project
  - /project/protos
  - /project/node_modules

Suggestion: Check if the file exists and the path is correct.
You may need to configure protoRoot or importPaths in plugin options.
```

### Task 17.4: Multi-File Error Collection

**Location**: `/packages/plugin/src/utils/error-collector.ts`

**Requirements**: 8.5, 8.11

**Features**:
- Collects errors from multiple files during batch processing
- Reports all errors together instead of failing on the first
- Groups errors by type (parse, generate, resolve, circular, etc.)
- Provides summary statistics

**Implementation**:

The `ErrorCollector` utility class provides methods for collecting different types of errors:

```typescript
import { ErrorCollector } from '@hallow/plugin';

// Create error collector
const collector = new ErrorCollector();

// Process multiple files
for (const file of protoFiles) {
  try {
    await processFile(file);
  } catch (error) {
    // Add error to collection instead of throwing
    collector.addParseError(file.path, error as Error, line, column);
  }
}

// Throw combined error if any errors occurred
collector.throwIfErrors();
```

**Error Format Example**:
```
[Hallow Plugin] Multiple errors occurred (3 total):

Parse Errors (1):
================================================================================
  1. File: /project/a.proto
     Expected semicolon at line 5
     Location: Line 5, Column 10

Resolve Errors (1):
================================================================================
  1. File: /project/b.proto
     Cannot resolve import: types.proto
     Searched: /project, /project/protos

Generate Errors (1):
================================================================================
  1. File: /project/c.proto
     Type not found: CustomType

Error Summary:
--------------------------------------------------------------------------------
  - Parse: 1
  - Resolve: 1
  - Generate: 1
  - Total: 3
```

## Error Formatter Utilities

The `ErrorFormatter` class (`/packages/plugin/src/utils/error.ts`) provides static methods for formatting all error types:

### Methods

#### `formatParseError(filePath, line, column, message, sourceCode?)`
Formats parser errors with code snippets and error location pointers.

#### `formatGenerateError(filePath, error)`
Formats generator errors with file context and stack traces.

#### `formatResolveError(importPath, fromFile, searchPaths)`
Formats resolution errors with searched paths and suggestions.

#### `formatCircularDependency(cycle)`
Formats circular dependency errors showing the complete cycle path.

#### `extractCodeSnippet(source, line, contextLines, column?)`
Extracts code snippet with context lines around the error.

#### `colorize(text, color)`
Adds ANSI color codes to error messages for terminal output.

## Usage Examples

### Basic Error Handling

```typescript
import { vite as hallow } from '@hallow/plugin';

export default {
  plugins: [
    hallow({
      protoRoot: './protos',
      verbose: true, // Enable stack traces
      debug: true,   // Enable detailed error logging
    }),
  ],
};
```

### Advanced: Multi-File Error Collection

```typescript
import { ErrorCollector } from '@hallow/plugin';

const collector = new ErrorCollector();

// Process multiple files
for (const file of files) {
  try {
    // Your processing logic
  } catch (error) {
    if (isParseError(error)) {
      collector.addParseError(file, error, line, column);
    } else if (isResolveError(error)) {
      collector.addResolveError(file, error, searchPaths);
    } else {
      collector.addError(file, error);
    }
  }
}

// Get error summary
const summary = collector.getSummary();
console.log(`Total errors: ${summary.total}`);
console.log(`Parse errors: ${summary.parse}`);

// Throw combined error if any errors exist
collector.throwIfErrors();
```

### Error Recovery

The plugin implements graceful error handling:

1. **Cache Corruption**: Clears cache and retries if cache read fails
2. **Transient Errors**: Retries file system operations with exponential backoff
3. **Development Mode**: More lenient error handling with warnings instead of failures

## Testing

Error handling is tested through:

1. **Existing Unit Tests**: Parser, resolver, and generator tests in `/packages/plugin/tests/unit/`
2. **Integration Tests**: Transform hook tests verify error handling in realistic scenarios
3. **ErrorFormatter Tests**: Comprehensive tests for all formatting methods in `error-formatter.test.ts`

## Configuration

Error handling behavior can be configured:

```typescript
{
  verbose: true,        // Enable detailed error messages
  debug: true,          // Enable debug logging with stack traces
  protoRoot: './protos', // Set proto resolution root
  importPaths: ['./common'], // Additional import search paths
}
```

## Error Recovery Strategies

The plugin implements several error recovery strategies:

1. **Graceful Degradation**: Return partial results when possible
2. **Helpful Suggestions**: Provide actionable suggestions for common errors
3. **Comprehensive Reporting**: Report all errors together in batch mode
4. **Context Preservation**: Maintain file context and location information

## Related Files

- `/packages/plugin/src/plugin.ts` - Main error handling implementation
- `/packages/plugin/src/utils/error.ts` - Error formatter utilities
- `/packages/plugin/src/utils/error-collector.ts` - Multi-file error collection
- `/packages/plugin/src/resolver.ts` - Resolution error handling
- `/packages/plugin/tests/unit/error-formatter.test.ts` - Error formatter tests

## Conclusion

Tasks 17.1-17.4 have been successfully implemented, providing comprehensive error handling across all stages of proto file processing. The implementation follows requirements 8.1-8.12, providing:

✅ Detailed error messages with file location
✅ Code snippets showing error context
✅ Stack traces in verbose mode
✅ Multi-file error collection
✅ Helpful suggestions for common issues
✅ Consistent error formatting
✅ ANSI color support for terminal output

The error handling system is production-ready and provides developers with clear, actionable error messages to quickly identify and fix issues in their proto definitions.
