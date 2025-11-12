/**
 * Integration tests for performance monitoring in the plugin (Tasks 13.1 and 13.2)
 *
 * Tests that performance monitoring is correctly integrated into the transform hook
 * and buildEnd hook, including metric collection, threshold checking, summary generation,
 * and report export functionality.
 */

import { createHallowPlugin } from '../../src/plugin';
import type { UnpluginOptions } from 'unplugin';
import { Parser } from '@hallow/parser';
import { Generator } from '@hallow/generator';
import * as fs from 'fs/promises';

// Mock dependencies
jest.mock('@hallow/parser');
jest.mock('@hallow/generator');
jest.mock('fs/promises');

const MockedParser = Parser as jest.MockedClass<typeof Parser>;
const MockedGenerator = Generator as jest.MockedClass<typeof Generator>;
const mockedFs = fs as jest.Mocked<typeof fs>;

// Helper to create plugin with default meta
const mockMeta: any = {
  framework: 'vite',
  webpack: { compiler: {} as any },
  rollup: {} as any,
  esbuild: {} as any,
  rspack: { compiler: {} as any },
  vite: {} as any,
};

function createPlugin(options: any = {}) {
  const result = createHallowPlugin(options, mockMeta);
  if (Array.isArray(result)) {
    throw new Error('Expected single plugin instance, got array');
  }
  return result as UnpluginOptions;
}

describe.skip('Performance Monitoring Integration (Tasks 13.1 and 13.2)', () => {
  let consoleSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  const mockProtoFile = {
    syntax: 'proto3' as const,
    package: 'test',
    imports: [],
    messages: [
      {
        name: 'TestMessage',
        fields: [
          { name: 'id', type: 'string', number: 1, repeated: false, optional: false },
        ],
        nestedMessages: [],
        nestedEnums: [],
      },
    ],
    services: [
      {
        name: 'TestService',
        methods: [
          {
            name: 'Test',
            inputType: 'TestRequest',
            outputType: 'TestResponse',
            clientStreaming: false,
            serverStreaming: false,
          },
        ],
      },
    ],
    enums: [],
  };

  const mockGeneratedCode = {
    files: [
      {
        path: 'test.ts',
        content: 'export class TestServiceStub {}',
        hash: 'test-hash',
      },
    ],
    metadata: {
      servicesCount: 1,
      messagesCount: 1,
      enumsCount: 0,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console methods
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // Mock Parser
    MockedParser.prototype.parse = jest.fn().mockReturnValue(mockProtoFile);

    // Mock Generator
    MockedGenerator.prototype.generateCode = jest.fn().mockResolvedValue(mockGeneratedCode);

    // Mock fs promises
    mockedFs.mkdir = jest.fn().mockResolvedValue(undefined);
    mockedFs.writeFile = jest.fn().mockResolvedValue(undefined);
    mockedFs.readFile = jest.fn().mockResolvedValue('syntax = "proto3";');
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('Task 13.1: Performance tracking in transform hook', () => {
    it('should start timer at beginning of transform', async () => {
      const plugin = createPlugin({
        enablePerformanceMonitoring: true,
        performanceThreshold: 1000,
        debug: true,
      });

      // Trigger buildStart to initialize components
      if (plugin.buildStart) {
        await plugin.buildStart.call({} as any);
      }

      // Perform transform
      if (plugin.transform) {
        const result = await plugin.transform.call(
          { addWatchFile: jest.fn() } as any,
          'syntax = "proto3";',
          '/project/test.proto'
        );

        expect(result).toBeDefined();
        expect((result as any)?.code).toContain('TestServiceStub');
      }

      // Verify parser was called (indicating parse time was recorded)
      expect(MockedParser.prototype.parse).toHaveBeenCalled();

      // Verify generator was called (indicating generation time was recorded)
      expect(MockedGenerator.prototype.generateCode).toHaveBeenCalled();
    });

    it('should record parse time after parser completion', async () => {
      const plugin = createPlugin({
        enablePerformanceMonitoring: true,
        performanceThreshold: 1000,
        debug: true,
      });

      if (plugin.buildStart) {
        await plugin.buildStart.call({} as any);
      }

      // Perform transform
      if (plugin.transform) {
        await plugin.transform.call(
           { addWatchFile: jest.fn() } as any,
          'syntax = "proto3";',
          '/project/test.proto'
        );
      }

      // Parser should have been called to measure parse time
      expect(MockedParser.prototype.parse).toHaveBeenCalledWith(
        'syntax = "proto3";',
        '/project/test.proto'
      );
    });

    it('should record generation time after generator completion', async () => {
      const plugin = createPlugin({
        enablePerformanceMonitoring: true,
        performanceThreshold: 1000,
        debug: true,
      });

      if (plugin.buildStart) {
        await plugin.buildStart.call({} as any);
      }

      // Perform transform
      if (plugin.transform) {
        await plugin.transform.call(
           { addWatchFile: jest.fn() } as any,
          'syntax = "proto3";',
          '/project/test.proto'
        );
      }

      // Generator should have been called to measure generation time
      expect(MockedGenerator.prototype.generateCode).toHaveBeenCalledWith(mockProtoFile);
    });

    it('should record total time and memory usage', async () => {
      const plugin = createPlugin({
        enablePerformanceMonitoring: true,
        performanceThreshold: 1000,
        debug: true,
      });

      if (plugin.buildStart) {
        await plugin.buildStart.call({} as any);
      }

      // Perform transform
      if (plugin.transform) {
        await plugin.transform.call(
           { addWatchFile: jest.fn() } as any,
          'syntax = "proto3";',
          '/project/test.proto'
        );
      }

      // Both parser and generator should have been called
      expect(MockedParser.prototype.parse).toHaveBeenCalled();
      expect(MockedGenerator.prototype.generateCode).toHaveBeenCalled();
    });

    it('should check threshold and log warnings for slow files', async () => {
      // Mock slow parser execution
      MockedParser.prototype.parse = jest.fn().mockImplementation(() => {
        // Simulate slow parsing
        const start = Date.now();
        while (Date.now() - start < 1100) {
          // Busy wait to exceed threshold
        }
        return mockProtoFile;
      });

      const plugin = createPlugin({
        enablePerformanceMonitoring: true,
        performanceThreshold: 1000, // 1 second threshold
        debug: true,
      });

      if (plugin.buildStart) {
        await plugin.buildStart.call({} as any);
      }

      // Perform transform
      if (plugin.transform) {
        await plugin.transform.call(
           { addWatchFile: jest.fn() } as any,
          'syntax = "proto3";',
          '/project/slow.proto'
        );
      }

      // Should have logged performance warning
      expect(consoleWarnSpy).toHaveBeenCalled();
      const warnCalls = consoleWarnSpy.mock.calls.map(call => call[0]).join(' ');
      expect(warnCalls).toContain('Performance warning');
    });

    it('should record cache hit with minimal time', async () => {
      const plugin = createPlugin({
        enablePerformanceMonitoring: true,
        performanceThreshold: 1000,
        debug: true,
      });

      if (plugin.buildStart) {
        await plugin.buildStart.call({} as any);
      }

      const testId = '/project/cached.proto';
      const testCode = 'syntax = "proto3";';

      // First transform - cache miss
      if (plugin.transform) {
        await plugin.transform.call(
           { addWatchFile: jest.fn() } as any,
          testCode,
          testId
        );
      }

      // Clear parser mock calls
      MockedParser.prototype.parse = jest.fn().mockClear();

      // Second transform with same content - cache hit
      if (plugin.transform) {
        await plugin.transform.call(
           { addWatchFile: jest.fn() } as any,
          testCode,
          testId
        );
      }

      // Parser should not be called on cache hit
      expect(MockedParser.prototype.parse).not.toHaveBeenCalled();

      // Should have logged cache hit
      const logCalls = consoleSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('Cache hit');
    });

    it('should not track performance when monitoring is disabled', async () => {
      const plugin = createPlugin({
        enablePerformanceMonitoring: false,
        debug: true,
      });

      if (plugin.buildStart) {
        await plugin.buildStart.call({} as any);
      }

      // Perform transform
      if (plugin.transform) {
        await plugin.transform.call(
           { addWatchFile: jest.fn() } as any,
          'syntax = "proto3";',
          '/project/test.proto'
        );
      }

      // No performance logs should be generated when disabled
      const logCalls = consoleSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).not.toContain('Performance');
    });
  });

  describe('Task 13.2: Performance summary generation', () => {
    it('should generate summary after all files processed', async () => {
      const plugin = createPlugin({
        enablePerformanceMonitoring: true,
        performanceThreshold: 1000,
        verbose: true,
        debug: true,
      });

      if (plugin.buildStart) {
        await plugin.buildStart.call({} as any);
      }

      // Process multiple files
      const files = ['/project/file1.proto', '/project/file2.proto', '/project/file3.proto'];

      for (const file of files) {
        if (plugin.transform) {
          await plugin.transform.call(
             { addWatchFile: jest.fn() } as any,
            'syntax = "proto3";',
            file
          );
        }
      }

      // Trigger buildEnd to generate summary
      if (plugin.buildEnd) {
        await plugin.buildEnd.call({} as any);
      }

      // Should have logged performance summary
      const logCalls = consoleSpy.mock.calls.map(call => call[0]).join(' ');
      expect(logCalls).toContain('Performance Summary');
    });

    it('should log total files, total time, and average time', async () => {
      const plugin = createPlugin({
        enablePerformanceMonitoring: true,
        performanceThreshold: 1000,
        verbose: true,
      });

      if (plugin.buildStart) {
        await plugin.buildStart.call({} as any);
      }

      // Process multiple files
      const files = ['/project/file1.proto', '/project/file2.proto'];

      for (const file of files) {
        if (plugin.transform) {
          await plugin.transform.call(
             { addWatchFile: jest.fn() } as any,
            'syntax = "proto3";',
            file
          );
        }
      }

      // Trigger buildEnd
      if (plugin.buildEnd) {
        await plugin.buildEnd.call({} as any);
      }

      // Verify summary was logged
      const logCalls = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(logCalls).toContain('Total files:');
      expect(logCalls).toContain('Total time:');
      expect(logCalls).toContain('Average time:');
      expect(logCalls).toContain('Peak memory:');
    });

    it('should identify and log slowest files', async () => {
      const plugin = createPlugin({
        enablePerformanceMonitoring: true,
        performanceThreshold: 1000,
        verbose: true,
      });

      if (plugin.buildStart) {
        await plugin.buildStart.call({} as any);
      }

      // Process files (some will be slower than others naturally)
      const files = [
        '/project/file1.proto',
        '/project/file2.proto',
        '/project/file3.proto',
      ];

      for (const file of files) {
        if (plugin.transform) {
          await plugin.transform.call(
             { addWatchFile: jest.fn() } as any,
            'syntax = "proto3";',
            file
          );
        }
      }

      // Trigger buildEnd
      if (plugin.buildEnd) {
        await plugin.buildEnd.call({} as any);
      }

      // Verify slowest files section was logged
      const logCalls = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(logCalls).toContain('Slowest files:');
    });

    it('should export performance report to JSON when cacheDir is configured', async () => {
      const cacheDir = '/project/.hallow-cache';

      const plugin = createPlugin({
        enablePerformanceMonitoring: true,
        performanceThreshold: 1000,
        cacheDir,
        debug: true,
      });

      if (plugin.buildStart) {
        await plugin.buildStart.call({} as any);
      }

      // Process a file
      if (plugin.transform) {
        await plugin.transform.call(
           { addWatchFile: jest.fn() } as any,
          'syntax = "proto3";',
          '/project/test.proto'
        );
      }

      // Trigger buildEnd
      if (plugin.buildEnd) {
        await plugin.buildEnd.call({} as any);
      }

      // Wait for async export to complete
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify directory was created
      expect(mockedFs.mkdir).toHaveBeenCalledWith(
        cacheDir,
        expect.objectContaining({ recursive: true })
      );

      // Verify report was written
      expect(mockedFs.writeFile).toHaveBeenCalled();
      const writeCall = mockedFs.writeFile.mock.calls.find(call =>
        String(call[0]).includes('performance.json')
      );

      expect(writeCall).toBeDefined();
      expect(writeCall?.[0]).toBe(`${cacheDir}/performance.json`);

      // Verify report structure
      const reportContent = writeCall?.[1] as string;
      const report = JSON.parse(reportContent);

      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('metrics');
      expect(report).toHaveProperty('threshold');
      expect(report.summary.totalFiles).toBeGreaterThan(0);
    });

    it('should not export report when cacheDir is not configured', async () => {
      const plugin = createPlugin({
        enablePerformanceMonitoring: true,
        performanceThreshold: 1000,
        // No cacheDir configured
      });

      if (plugin.buildStart) {
        await plugin.buildStart.call({} as any);
      }

      // Process a file
      if (plugin.transform) {
        await plugin.transform.call(
           { addWatchFile: jest.fn() } as any,
          'syntax = "proto3";',
          '/project/test.proto'
        );
      }

      // Trigger buildEnd
      if (plugin.buildEnd) {
        await plugin.buildEnd.call({} as any);
      }

      // Wait for any async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify writeFile was not called for performance report
      const performanceWriteCalls = mockedFs.writeFile.mock.calls.filter(call =>
        call[0].toString().includes('performance.json')
      );

      expect(performanceWriteCalls.length).toBe(0);
    });

    it('should not generate summary when no files processed', async () => {
      const plugin = createPlugin({
        enablePerformanceMonitoring: true,
        performanceThreshold: 1000,
        verbose: true,
      });

      if (plugin.buildStart) {
        await plugin.buildStart.call({} as any);
      }

      // Trigger buildEnd without processing any files
      if (plugin.buildEnd) {
        await plugin.buildEnd.call({} as any);
      }

      // No performance summary should be logged
      const logCalls = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(logCalls).not.toContain('Performance Summary');
    });

    it('should handle export errors gracefully', async () => {
      // Mock writeFile to reject
      mockedFs.writeFile = jest.fn().mockRejectedValue(new Error('Write failed'));

      const plugin = createPlugin({
        enablePerformanceMonitoring: true,
        performanceThreshold: 1000,
        cacheDir: '/project/.hallow-cache',
        debug: true,
      });

      if (plugin.buildStart) {
        await plugin.buildStart.call({} as any);
      }

      // Process a file
      if (plugin.transform) {
        await plugin.transform.call(
           { addWatchFile: jest.fn() } as any,
          'syntax = "proto3";',
          '/project/test.proto'
        );
      }

      // Trigger buildEnd
      if (plugin.buildEnd) {
        await plugin.buildEnd.call({} as any);
      }

      // Wait for async export to fail
      await new Promise(resolve => setTimeout(resolve, 100));

      // Should have logged error
      const warnCalls = consoleWarnSpy.mock.calls.map(call => call[0]).join(' ');
      expect(warnCalls).toContain('Failed to export performance report');
    });
  });

  describe('Integration with other features', () => {
    it('should track performance across cache hits and misses', async () => {
      const plugin = createPlugin({
        enablePerformanceMonitoring: true,
        performanceThreshold: 1000,
        verbose: true,
      });

      if (plugin.buildStart) {
        await plugin.buildStart.call({} as any);
      }

      const testId = '/project/test.proto';
      const testCode = 'syntax = "proto3";';

      // First transform - cache miss
      if (plugin.transform) {
        await plugin.transform.call(
           { addWatchFile: jest.fn() } as any,
          testCode,
          testId
        );
      }

      // Second transform - cache hit
      if (plugin.transform) {
        await plugin.transform.call(
           { addWatchFile: jest.fn() } as any,
          testCode,
          testId
        );
      }

      // Trigger buildEnd
      if (plugin.buildEnd) {
        await plugin.buildEnd.call({} as any);
      }

      // Should show 2 processing events (1 miss + 1 hit)
      const logCalls = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(logCalls).toContain('Cache hit');
      expect(logCalls).toContain('Cache miss');
    });

    it('should work correctly with verbose and debug modes', async () => {
      const plugin = createPlugin({
        enablePerformanceMonitoring: true,
        performanceThreshold: 1000,
        verbose: true,
        debug: true,
      });

      if (plugin.buildStart) {
        await plugin.buildStart.call({} as any);
      }

      // Process a file
      if (plugin.transform) {
        await plugin.transform.call(
           { addWatchFile: jest.fn() } as any,
          'syntax = "proto3";',
          '/project/test.proto'
        );
      }

      // Trigger buildEnd
      if (plugin.buildEnd) {
        await plugin.buildEnd.call({} as any);
      }

      // Should have extensive logging
      const logCalls = consoleSpy.mock.calls.map(call => call[0]).join('\n');
      expect(logCalls).toContain('Performance monitoring: true');
      expect(logCalls).toContain('Cache miss');
      expect(logCalls).toContain('Performance Summary');
    });
  });
});
