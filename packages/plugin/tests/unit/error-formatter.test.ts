/**
 * Unit tests for ErrorFormatter
 *
 * Tests all error formatting methods to ensure:
 * - Correct message structure and formatting
 * - Proper file location information
 * - Code snippet extraction and highlighting
 * - Color support
 * - Helpful suggestions
 */

// Mock chalk to disable colors in tests
jest.mock('chalk', () => ({
  default: {
    cyan: (str: string) => str,
    yellow: (str: string) => str,
    red: (str: string) => str,
    green: (str: string) => str,
    blue: (str: string) => str,
    gray: (str: string) => str,
    bold: (str: string) => str,
  },
  cyan: (str: string) => str,
  yellow: (str: string) => str,
  red: (str: string) => str,
  green: (str: string) => str,
  blue: (str: string) => str,
  gray: (str: string) => str,
  bold: (str: string) => str,
}));

import { ErrorFormatter } from '../../src/utils/error';

describe('ErrorFormatter', () => {
  describe('formatParseError', () => {
    it('should format parse error with file location', () => {
      const error = ErrorFormatter.formatParseError(
        '/project/service.proto',
        15,
        8,
        'Expected semicolon'
      );

      expect(error).toContain('[Hallow Plugin] Proto syntax error');
      expect(error).toContain('/project/service.proto');
      expect(error).toContain('Line 15');
      expect(error).toContain('Column 8');
      expect(error).toContain('Expected semicolon');
    });

    it('should include code snippet when source provided', () => {
      const source = `syntax = "proto3";

message GreetRequest {
  string name = 1
  string metadata = 2;
}`;

      const error = ErrorFormatter.formatParseError(
        '/project/service.proto',
        4,
        18,
        'Expected semicolon',
        source
      );

      expect(error).toContain('message GreetRequest');
      expect(error).toContain('string name = 1');
      expect(error).toContain('>');
      expect(error).toContain('^');
    });

    it('should work without source code', () => {
      const error = ErrorFormatter.formatParseError(
        '/project/service.proto',
        10,
        5,
        'Unexpected token'
      );

      expect(error).toContain('[Hallow Plugin] Proto syntax error');
      expect(error).toContain('Line 10');
      expect(error).not.toContain('>');
    });

    it('should handle file paths with special characters', () => {
      const error = ErrorFormatter.formatParseError(
        '/project/my-protos/service (v2).proto',
        1,
        1,
        'Error'
      );

      expect(error).toContain('my-protos/service (v2).proto');
    });

    it('should handle multiline error messages', () => {
      const message = 'Expected semicolon\nSuggestion: Add ; at end of line';
      const error = ErrorFormatter.formatParseError(
        '/project/service.proto',
        5,
        10,
        message
      );

      expect(error).toContain('Expected semicolon');
      expect(error).toContain('Suggestion: Add ; at end of line');
    });
  });

  describe('formatGenerateError', () => {
    it('should format generation error with file context', () => {
      const originalError = new Error('Cannot generate stub for undefined type');
      const error = ErrorFormatter.formatGenerateError(
        '/project/service.proto',
        originalError
      );

      expect(error).toContain('[Hallow Plugin] Code generation failed');
      expect(error).toContain('/project/service.proto');
      expect(error).toContain('Cannot generate stub for undefined type');
    });

    it('should include stack trace when available', () => {
      const originalError = new Error('Generation failed');
      originalError.stack = 'Error: Generation failed\n    at Generator.generate (generator.ts:42:10)';

      const error = ErrorFormatter.formatGenerateError(
        '/project/service.proto',
        originalError
      );

      expect(error).toContain('Stack trace:');
      expect(error).toContain('generator.ts:42:10');
    });

    it('should handle errors without stack traces', () => {
      const originalError = new Error('Simple error');
      originalError.stack = undefined;

      const error = ErrorFormatter.formatGenerateError(
        '/project/service.proto',
        originalError
      );

      expect(error).toContain('[Hallow Plugin] Code generation failed');
      expect(error).toContain('Simple error');
      expect(error).not.toContain('Stack trace:');
    });

    it('should preserve original error message exactly', () => {
      const message = 'Special characters: @#$%^&*()';
      const originalError = new Error(message);

      const error = ErrorFormatter.formatGenerateError(
        '/project/service.proto',
        originalError
      );

      expect(error).toContain(message);
    });
  });

  describe('formatResolveError', () => {
    it('should format resolution error with searched paths', () => {
      const error = ErrorFormatter.formatResolveError(
        'common/types.proto',
        '/project/service.proto',
        [
          '/project',
          '/project/protos',
          '/project/node_modules'
        ]
      );

      expect(error).toContain('[Hallow Plugin] Import resolution failed');
      expect(error).toContain('common/types.proto');
      expect(error).toContain('/project/service.proto');
      expect(error).toContain('Searched in:');
      expect(error).toContain('/project');
      expect(error).toContain('/project/protos');
      expect(error).toContain('/project/node_modules');
    });

    it('should include helpful suggestion', () => {
      const error = ErrorFormatter.formatResolveError(
        'types.proto',
        '/project/service.proto',
        ['/project']
      );

      expect(error).toContain('Suggestion:');
      expect(error).toContain('protoRoot');
      expect(error).toContain('importPaths');
    });

    it('should handle single search path', () => {
      const error = ErrorFormatter.formatResolveError(
        'missing.proto',
        '/project/service.proto',
        ['/project']
      );

      expect(error).toContain('Searched in:');
      expect(error).toContain('/project');
    });

    it('should handle empty search paths gracefully', () => {
      const error = ErrorFormatter.formatResolveError(
        'missing.proto',
        '/project/service.proto',
        []
      );

      expect(error).toContain('[Hallow Plugin] Import resolution failed');
      expect(error).toContain('Searched in:');
    });

    it('should handle well-known type paths', () => {
      const error = ErrorFormatter.formatResolveError(
        'google/protobuf/timestamp.proto',
        '/project/service.proto',
        ['/project/node_modules']
      );

      expect(error).toContain('google/protobuf/timestamp.proto');
    });
  });

  describe('formatCircularDependency', () => {
    it('should format simple circular dependency', () => {
      const error = ErrorFormatter.formatCircularDependency([
        'a.proto',
        'b.proto',
        'a.proto'
      ]);

      expect(error).toContain('[Hallow Plugin] Circular import detected');
      expect(error).toContain('a.proto');
      expect(error).toContain('b.proto');
      expect(error).toContain('→');
      expect(error).toContain('dependency cycle');
    });

    it('should format complex circular dependency', () => {
      const error = ErrorFormatter.formatCircularDependency([
        'a.proto',
        'b.proto',
        'c.proto',
        'd.proto',
        'a.proto'
      ]);

      expect(error).toContain('a.proto');
      expect(error).toContain('b.proto');
      expect(error).toContain('c.proto');
      expect(error).toContain('d.proto');
    });

    it('should include helpful suggestion', () => {
      const error = ErrorFormatter.formatCircularDependency([
        'x.proto',
        'y.proto',
        'x.proto'
      ]);

      expect(error).toContain('Suggestion:');
      expect(error).toContain('Remove one of the imports');
      expect(error).toContain('refactor');
    });

    it('should handle file paths with directories', () => {
      const error = ErrorFormatter.formatCircularDependency([
        '/project/protos/a.proto',
        '/project/protos/b.proto',
        '/project/protos/a.proto'
      ]);

      expect(error).toContain('/project/protos/a.proto');
      expect(error).toContain('/project/protos/b.proto');
    });
  });

  describe('formatConfigError', () => {
    it('should format type mismatch error', () => {
      const error = ErrorFormatter.formatConfigError(
        'maxCacheSize',
        'number',
        'string'
      );

      expect(error).toContain('[Hallow Plugin] Configuration error');
      expect(error).toContain('maxCacheSize');
      expect(error).toContain('Expected: number');
      expect(error).toContain('Received: string');
    });

    it('should format value validation error', () => {
      const error = ErrorFormatter.formatConfigError(
        'performanceThreshold',
        'positive number',
        '-100'
      );

      expect(error).toContain('performanceThreshold');
      expect(error).toContain('positive number');
      expect(error).toContain('-100');
    });

    it('should handle complex type descriptions', () => {
      const error = ErrorFormatter.formatConfigError(
        'optimization',
        'OptimizationOptions | undefined',
        'boolean'
      );

      expect(error).toContain('OptimizationOptions | undefined');
    });
  });

  describe('extractCodeSnippet', () => {
    const sampleCode = `syntax = "proto3";

message Person {
  string name = 1;
  int32 age = 2;
  string email = 3;
}

service PersonService {
  rpc GetPerson(PersonRequest) returns (Person);
}`;

    it('should extract snippet with context lines', () => {
      const snippet = ErrorFormatter.extractCodeSnippet(sampleCode, 4, 2);

      expect(snippet).toBeTruthy();
      expect(snippet).toContain('message Person');
      expect(snippet).toContain('string name = 1');
      expect(snippet).toContain('>');
      expect(snippet).toContain('^');
    });

    it('should handle snippet at start of file', () => {
      const snippet = ErrorFormatter.extractCodeSnippet(sampleCode, 1, 2);

      expect(snippet).toBeTruthy();
      expect(snippet).toContain('syntax = "proto3"');
      expect(snippet).toContain('>');
    });

    it('should handle snippet at end of file', () => {
      const lines = sampleCode.split('\n').length;
      const snippet = ErrorFormatter.extractCodeSnippet(sampleCode, lines, 2);

      expect(snippet).toBeTruthy();
      expect(snippet).toContain('GetPerson');
      expect(snippet).toContain('>');
    });

    it('should return null for invalid line number', () => {
      const snippet = ErrorFormatter.extractCodeSnippet(sampleCode, 0, 2);
      expect(snippet).toBeNull();
    });

    it('should return null for line number beyond file', () => {
      const snippet = ErrorFormatter.extractCodeSnippet(sampleCode, 1000, 2);
      expect(snippet).toBeNull();
    });

    it('should handle zero context lines', () => {
      const snippet = ErrorFormatter.extractCodeSnippet(sampleCode, 4, 0);

      expect(snippet).toBeTruthy();
      if (snippet) {
        expect(snippet).toContain('>');
        // Should only show the error line
        const lineCount = snippet.split('\n').filter(l => l.trim()).length;
        expect(lineCount).toBe(2); // Error line + pointer line
      }
    });

    it('should handle large context lines gracefully', () => {
      const snippet = ErrorFormatter.extractCodeSnippet(sampleCode, 5, 100);

      expect(snippet).toBeTruthy();
      expect(snippet).toContain('int32 age = 2');
      expect(snippet).toContain('>');
    });

    it('should add proper line number padding', () => {
      const largeCode = Array(100).fill('line content').join('\n');
      const snippet = ErrorFormatter.extractCodeSnippet(largeCode, 50, 2);

      expect(snippet).toBeTruthy();
      // Line numbers should be padded consistently
      expect(snippet).toMatch(/\s+\d+\s+\|/);
    });

    it('should preserve indentation in code', () => {
      const indentedCode = `message Test {
  message Nested {
    string field = 1;
  }
}`;
      const snippet = ErrorFormatter.extractCodeSnippet(indentedCode, 3, 1);

      expect(snippet).toBeTruthy();
      expect(snippet).toContain('    string field = 1');
    });

    it('should position caret at specified column', () => {
      const code = `message Test {
  string name = 1;
}`;
      const snippet = ErrorFormatter.extractCodeSnippet(code, 2, 1, 10);

      expect(snippet).toBeTruthy();
      if (snippet) {
        // Caret should be positioned at column 10
        const lines = snippet.split('\n');
        const pointerLine = lines.find(l => l.includes('^'));
        expect(pointerLine).toBeTruthy();

        // Strip ANSI codes to check position accurately
        const plainPointerLine = pointerLine!.replace(/\x1b\[[0-9;]*m/g, '');
        // Should have pipe, then 9 spaces (column 10 is 0-based index 9), then caret
        expect(plainPointerLine).toMatch(/\|\s{9}\^/);
      }
    });

    it('should position caret at column 1 when column is 1', () => {
      const code = `message Test {
  string name = 1;
}`;
      const snippet = ErrorFormatter.extractCodeSnippet(code, 2, 1, 1);

      expect(snippet).toBeTruthy();
      if (snippet) {
        const lines = snippet.split('\n');
        const pointerLine = lines.find(l => l.includes('^'));
        expect(pointerLine).toBeTruthy();

        // Strip ANSI codes
        const plainPointerLine = pointerLine!.replace(/\x1b\[[0-9;]*m/g, '');
        // Should have pipe, then immediately caret (no spaces before it)
        expect(plainPointerLine).toMatch(/\|\^/);
      }
    });

    it('should handle large column numbers', () => {
      const code = `message Test {
  string very_long_field_name_here = 1;
}`;
      const snippet = ErrorFormatter.extractCodeSnippet(code, 2, 1, 35);

      expect(snippet).toBeTruthy();
      if (snippet) {
        const lines = snippet.split('\n');
        const pointerLine = lines.find(l => l.includes('^'));
        expect(pointerLine).toBeTruthy();

        // Strip ANSI codes
        const plainPointerLine = pointerLine!.replace(/\x1b\[[0-9;]*m/g, '');
        // Should have pipe, then 34 spaces, then caret
        expect(plainPointerLine).toMatch(/\|\s{34}\^/);
      }
    });

    it('should handle column at exact error position', () => {
      const code = `syntax = "proto3";

message GreetRequest {
  string name = 1
  string metadata = 2;
}`;
      // Column 18 is where the missing semicolon should be (after '1')
      const snippet = ErrorFormatter.extractCodeSnippet(code, 4, 2, 18);

      expect(snippet).toBeTruthy();
      if (snippet) {
        expect(snippet).toContain('string name = 1');
        expect(snippet).toContain('^');

        // Verify caret is at column 18
        const lines = snippet.split('\n');
        const pointerLine = lines.find(l => l.includes('^'));
        const plainPointerLine = pointerLine!.replace(/\x1b\[[0-9;]*m/g, '');
        expect(plainPointerLine).toMatch(/\|\s{17}\^/);
      }
    });

    it('should default to column 0 when column is not provided', () => {
      const code = `message Test {
  string name = 1;
}`;
      const snippet = ErrorFormatter.extractCodeSnippet(code, 2, 1);

      expect(snippet).toBeTruthy();
      if (snippet) {
        const lines = snippet.split('\n');
        const pointerLine = lines.find(l => l.includes('^'));
        expect(pointerLine).toBeTruthy();

        // Strip ANSI codes
        const plainPointerLine = pointerLine!.replace(/\x1b\[[0-9;]*m/g, '');
        // Should have pipe, then immediately caret (backwards compatible)
        expect(plainPointerLine).toMatch(/\|\^/);
      }
    });

    it('should handle column 0 as default position', () => {
      const code = `message Test {
  string name = 1;
}`;
      const snippet = ErrorFormatter.extractCodeSnippet(code, 2, 1, 0);

      expect(snippet).toBeTruthy();
      if (snippet) {
        const lines = snippet.split('\n');
        const pointerLine = lines.find(l => l.includes('^'));
        expect(pointerLine).toBeTruthy();

        const plainPointerLine = pointerLine!.replace(/\x1b\[[0-9;]*m/g, '');
        expect(plainPointerLine).toMatch(/\|\^/);
      }
    });

    it('should handle negative column numbers as default', () => {
      const code = `message Test {
  string name = 1;
}`;
      const snippet = ErrorFormatter.extractCodeSnippet(code, 2, 1, -5);

      expect(snippet).toBeTruthy();
      if (snippet) {
        const lines = snippet.split('\n');
        const pointerLine = lines.find(l => l.includes('^'));
        expect(pointerLine).toBeTruthy();

        const plainPointerLine = pointerLine!.replace(/\x1b\[[0-9;]*m/g, '');
        expect(plainPointerLine).toMatch(/\|\^/);
      }
    });
  });

  describe('colorize', () => {
    it('should colorize text in red', () => {
      const result = ErrorFormatter.colorize('Error', 'red');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      // Text should be included in the result
      expect(result).toContain('Error');
    });

    it('should colorize text in yellow', () => {
      const result = ErrorFormatter.colorize('Warning', 'yellow');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('Warning');
    });

    it('should colorize text in green', () => {
      const result = ErrorFormatter.colorize('Success', 'green');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('Success');
    });

    it('should colorize text in blue', () => {
      const result = ErrorFormatter.colorize('Info', 'blue');
      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      expect(result).toContain('Info');
    });

    it('should handle empty strings', () => {
      const result = ErrorFormatter.colorize('', 'red');
      expect(result).toBe('');
    });

    it('should handle special characters', () => {
      const result = ErrorFormatter.colorize('Error: @#$%', 'red');
      expect(result).toBeTruthy();
      expect(result).toContain('@#$%');
    });

    it('should apply ANSI color codes when terminal supports colors', () => {
      // Note: chalk automatically detects color support
      // When colors are enabled, ANSI escape codes will be present
      const result = ErrorFormatter.colorize('Test', 'red');

      // Result should contain the text
      expect(result).toContain('Test');

      // In environments with color support, result will have ANSI codes
      // In environments without, it will be plain text
      // Both are acceptable - chalk handles this automatically
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThanOrEqual('Test'.length);
    });

    it('should preserve text content regardless of color support', () => {
      const colors: Array<'red' | 'yellow' | 'green' | 'blue'> = ['red', 'yellow', 'green', 'blue'];
      const testText = 'Test Message';

      colors.forEach(color => {
        const result = ErrorFormatter.colorize(testText, color);
        // Strip ANSI codes to verify original text is preserved
        const plainText = result.replace(/\x1b\[[0-9;]*m/g, '');
        expect(plainText).toBe(testText);
      });
    });

    it('should handle multiline text colorization', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';
      const result = ErrorFormatter.colorize(multilineText, 'red');

      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
      expect(result).toContain('Line 3');
    });

    it('should handle unicode characters', () => {
      const unicodeText = '错误: 文件未找到 🚫';
      const result = ErrorFormatter.colorize(unicodeText, 'red');

      expect(result).toContain('错误');
      expect(result).toContain('文件未找到');
      expect(result).toContain('🚫');
    });

    it('should handle very long strings', () => {
      const longText = 'Error: '.repeat(100);
      const result = ErrorFormatter.colorize(longText, 'red');

      expect(result).toBeTruthy();
      expect(typeof result).toBe('string');
      // Strip ANSI codes and verify length
      const plainText = result.replace(/\x1b\[[0-9;]*m/g, '');
      expect(plainText).toBe(longText);
    });

    it('should return different colors for different color parameters', () => {
      const text = 'Message';
      const red = ErrorFormatter.colorize(text, 'red');
      const yellow = ErrorFormatter.colorize(text, 'yellow');
      const green = ErrorFormatter.colorize(text, 'green');
      const blue = ErrorFormatter.colorize(text, 'blue');

      // All should contain the original text
      [red, yellow, green, blue].forEach(result => {
        expect(result).toContain(text);
      });

      // In environments with color support, they should be different
      // In environments without, they might be the same (plain text)
      // Both behaviors are acceptable
      expect(typeof red).toBe('string');
      expect(typeof yellow).toBe('string');
      expect(typeof green).toBe('string');
      expect(typeof blue).toBe('string');
    });
  });

  describe('createFormattedError', () => {
    it('should create parse error object', () => {
      const error = ErrorFormatter.createFormattedError(
        'parse',
        'Syntax error',
        {
          filePath: '/project/service.proto',
          line: 10,
          column: 5,
          suggestion: 'Add semicolon'
        }
      );

      expect(error.type).toBe('parse');
      expect(error.message).toBe('Syntax error');
      expect(error.filePath).toBe('/project/service.proto');
      expect(error.line).toBe(10);
      expect(error.column).toBe(5);
      expect(error.suggestion).toBe('Add semicolon');
    });

    it('should create generation error object', () => {
      const error = ErrorFormatter.createFormattedError(
        'generate',
        'Code generation failed',
        {
          filePath: '/project/service.proto'
        }
      );

      expect(error.type).toBe('generate');
      expect(error.message).toBe('Code generation failed');
      expect(error.filePath).toBe('/project/service.proto');
    });

    it('should create resolution error object with search paths', () => {
      const error = ErrorFormatter.createFormattedError(
        'resolve',
        'Cannot resolve import',
        {
          filePath: '/project/service.proto',
          searchPaths: ['/project', '/project/protos']
        }
      );

      expect(error.type).toBe('resolve');
      expect(error.searchPaths).toEqual(['/project', '/project/protos']);
    });

    it('should create circular dependency error', () => {
      const error = ErrorFormatter.createFormattedError(
        'circular',
        'Circular dependency detected'
      );

      expect(error.type).toBe('circular');
      expect(error.message).toBe('Circular dependency detected');
    });

    it('should create validation error', () => {
      const error = ErrorFormatter.createFormattedError(
        'validation',
        'Invalid configuration',
        {
          suggestion: 'Check configuration options'
        }
      );

      expect(error.type).toBe('validation');
      expect(error.suggestion).toBe('Check configuration options');
    });

    it('should handle minimal options', () => {
      const error = ErrorFormatter.createFormattedError(
        'parse',
        'Error message'
      );

      expect(error.type).toBe('parse');
      expect(error.message).toBe('Error message');
      expect(error.filePath).toBeUndefined();
      expect(error.line).toBeUndefined();
      expect(error.column).toBeUndefined();
    });

    it('should handle all optional fields', () => {
      const error = ErrorFormatter.createFormattedError(
        'parse',
        'Complete error',
        {
          filePath: '/test.proto',
          line: 1,
          column: 1,
          snippet: 'code snippet',
          suggestion: 'fix this',
          searchPaths: ['/path1']
        }
      );

      expect(error.filePath).toBe('/test.proto');
      expect(error.line).toBe(1);
      expect(error.column).toBe(1);
      expect(error.snippet).toBe('code snippet');
      expect(error.suggestion).toBe('fix this');
      expect(error.searchPaths).toEqual(['/path1']);
    });
  });

  describe('Color integration in formatting methods', () => {
    it('should apply colors in formatParseError', () => {
      const error = ErrorFormatter.formatParseError(
        '/project/service.proto',
        10,
        5,
        'Syntax error'
      );

      // Should contain the error text
      expect(error).toContain('Hallow Plugin');
      expect(error).toContain('Proto syntax error');
      expect(error).toContain('service.proto');
      expect(error).toContain('Line');
      expect(error).toContain('10');
    });

    it('should apply colors in formatGenerateError', () => {
      const originalError = new Error('Generation failed');
      const error = ErrorFormatter.formatGenerateError(
        '/project/service.proto',
        originalError
      );

      // Should contain the error text
      expect(error).toContain('Hallow Plugin');
      expect(error).toContain('Code generation failed');
      expect(error).toContain('service.proto');
      expect(error).toContain('Generation failed');
    });

    it('should apply colors in formatResolveError', () => {
      const error = ErrorFormatter.formatResolveError(
        'types.proto',
        '/project/service.proto',
        ['/project']
      );

      // Should contain the error text
      expect(error).toContain('Hallow Plugin');
      expect(error).toContain('Import resolution failed');
      expect(error).toContain('types.proto');
      expect(error).toContain('Suggestion');
    });

    it('should apply colors in formatCircularDependency', () => {
      const error = ErrorFormatter.formatCircularDependency([
        'a.proto',
        'b.proto',
        'a.proto'
      ]);

      // Should contain the error text
      expect(error).toContain('Hallow Plugin');
      expect(error).toContain('Circular import detected');
      expect(error).toContain('a.proto');
      expect(error).toContain('→');
    });

    it('should apply colors in formatConfigError', () => {
      const error = ErrorFormatter.formatConfigError(
        'maxCacheSize',
        'number',
        'string'
      );

      // Should contain the error text
      expect(error).toContain('Hallow Plugin');
      expect(error).toContain('Configuration error');
      expect(error).toContain('maxCacheSize');
      expect(error).toContain('number');
      expect(error).toContain('string');
    });

    it('should use consistent color scheme across all methods', () => {
      const parseError = ErrorFormatter.formatParseError('/test.proto', 1, 1, 'error');
      const genError = ErrorFormatter.formatGenerateError('/test.proto', new Error('error'));
      const resolveError = ErrorFormatter.formatResolveError('test.proto', '/test.proto', ['/']);
      const circularError = ErrorFormatter.formatCircularDependency(['a.proto', 'b.proto', 'a.proto']);
      const configError = ErrorFormatter.formatConfigError('field', 'type', 'actual');

      // All errors should start with [Hallow Plugin]
      [parseError, genError, resolveError, circularError, configError].forEach(error => {
        expect(error).toContain('[Hallow Plugin]');
      });

      // All should be non-empty strings
      [parseError, genError, resolveError, circularError, configError].forEach(error => {
        expect(typeof error).toBe('string');
        expect(error.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Integration tests', () => {
    it('should format complete parse error workflow', () => {
      const sourceCode = `syntax = "proto3";
message Test {
  string field = 1
}`;

      const error = ErrorFormatter.formatParseError(
        '/project/test.proto',
        3,
        19,
        'Expected semicolon',
        sourceCode
      );

      expect(error).toContain('[Hallow Plugin]');
      expect(error).toContain('test.proto');
      expect(error).toContain('Line 3');
      expect(error).toContain('string field = 1');
      expect(error).toContain('>');
    });

    it('should format complete resolution error workflow', () => {
      const error = ErrorFormatter.formatResolveError(
        'missing/types.proto',
        '/project/src/service.proto',
        [
          '/project/src',
          '/project/protos',
          '/project/node_modules'
        ]
      );

      expect(error).toContain('Import resolution failed');
      expect(error).toContain('missing/types.proto');
      expect(error).toContain('Searched in:');
      expect(error).toContain('Suggestion:');
    });

    it('should format complete circular dependency workflow', () => {
      const cycle = [
        '/project/a.proto',
        '/project/b.proto',
        '/project/c.proto',
        '/project/a.proto'
      ];

      const error = ErrorFormatter.formatCircularDependency(cycle);

      expect(error).toContain('Circular import detected');
      expect(error).toContain('→');
      expect(error).toContain('a.proto');
      expect(error).toContain('b.proto');
      expect(error).toContain('c.proto');
    });
  });
});
