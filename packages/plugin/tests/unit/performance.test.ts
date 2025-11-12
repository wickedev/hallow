/**
 * Unit tests for PerformanceMonitor
 *
 * Tests performance tracking, metrics collection, threshold checking,
 * and report generation functionality.
 */

import { PerformanceMonitor } from '../../src/utils/performance';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock fs promises module
jest.mock('fs/promises');
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;
  const testFilePath = '/project/protos/service.proto';

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    // Create enabled monitor with 1000ms threshold by default
    monitor = new PerformanceMonitor(true, 1000);
  });

  afterEach(() => {
    monitor.clear();
  });

  describe('constructor', () => {
    it('should create monitor with enabled state and threshold', () => {
      const enabledMonitor = new PerformanceMonitor(true, 500);
      expect(enabledMonitor).toBeInstanceOf(PerformanceMonitor);
    });

    it('should create monitor with default threshold of 1000ms', () => {
      const defaultMonitor = new PerformanceMonitor(true);
      expect(defaultMonitor).toBeInstanceOf(PerformanceMonitor);
    });

    it('should create disabled monitor', () => {
      const disabledMonitor = new PerformanceMonitor(false);
      expect(disabledMonitor).toBeInstanceOf(PerformanceMonitor);
    });
  });

  describe('startTimer', () => {
    it('should start a timer for a file', () => {
      monitor.startTimer(testFilePath);
      expect(monitor.getActiveTimerCount()).toBe(1);
    });

    it('should record initial memory usage', () => {
      monitor.startTimer(testFilePath);
      // Timer should be active
      expect(monitor.getActiveTimerCount()).toBe(1);
    });

    it('should not start timer when disabled', () => {
      const disabledMonitor = new PerformanceMonitor(false);
      disabledMonitor.startTimer(testFilePath);
      expect(disabledMonitor.getActiveTimerCount()).toBe(0);
    });

    it('should allow multiple concurrent timers for different files', () => {
      monitor.startTimer('/path/file1.proto');
      monitor.startTimer('/path/file2.proto');
      monitor.startTimer('/path/file3.proto');
      expect(monitor.getActiveTimerCount()).toBe(3);
    });
  });

  describe('recordParse', () => {
    it('should record parse time for a file', () => {
      monitor.startTimer(testFilePath);
      monitor.recordParse(testFilePath, 45.5);

      const metrics = monitor.getMetrics(testFilePath);
      expect(metrics).toBeDefined();
      expect(metrics?.parseMs).toBe(45.5);
      expect(metrics?.filePath).toBe(testFilePath);
    });

    it('should not record parse time when disabled', () => {
      const disabledMonitor = new PerformanceMonitor(false);
      disabledMonitor.startTimer(testFilePath);
      disabledMonitor.recordParse(testFilePath, 45.5);

      const metrics = disabledMonitor.getMetrics(testFilePath);
      expect(metrics).toBeUndefined();
    });

    it('should create metrics entry even without timer started', () => {
      monitor.recordParse(testFilePath, 45.5);

      const metrics = monitor.getMetrics(testFilePath);
      expect(metrics).toBeDefined();
      expect(metrics?.parseMs).toBe(45.5);
    });

    it('should update existing metrics entry', () => {
      monitor.recordParse(testFilePath, 40);
      monitor.recordParse(testFilePath, 50);

      const metrics = monitor.getMetrics(testFilePath);
      expect(metrics?.parseMs).toBe(50);
    });
  });

  describe('recordGenerate', () => {
    it('should record generation time for a file', () => {
      monitor.startTimer(testFilePath);
      monitor.recordGenerate(testFilePath, 120.3);

      const metrics = monitor.getMetrics(testFilePath);
      expect(metrics).toBeDefined();
      expect(metrics?.generateMs).toBe(120.3);
      expect(metrics?.filePath).toBe(testFilePath);
    });

    it('should not record generation time when disabled', () => {
      const disabledMonitor = new PerformanceMonitor(false);
      disabledMonitor.startTimer(testFilePath);
      disabledMonitor.recordGenerate(testFilePath, 120.3);

      const metrics = disabledMonitor.getMetrics(testFilePath);
      expect(metrics).toBeUndefined();
    });

    it('should create metrics entry even without timer started', () => {
      monitor.recordGenerate(testFilePath, 120.3);

      const metrics = monitor.getMetrics(testFilePath);
      expect(metrics).toBeDefined();
      expect(metrics?.generateMs).toBe(120.3);
    });

    it('should update existing metrics entry', () => {
      monitor.recordGenerate(testFilePath, 100);
      monitor.recordGenerate(testFilePath, 150);

      const metrics = monitor.getMetrics(testFilePath);
      expect(metrics?.generateMs).toBe(150);
    });
  });

  describe('recordTotal', () => {
    it('should record total time and memory usage', () => {
      monitor.startTimer(testFilePath);
      monitor.recordTotal(testFilePath, 165.8, 12.5);

      const metrics = monitor.getMetrics(testFilePath);
      expect(metrics).toBeDefined();
      expect(metrics?.totalMs).toBe(165.8);
      expect(metrics?.memoryMB).toBe(12.5);
      expect(metrics?.cacheHit).toBe(false);
    });

    it('should record cache hit status', () => {
      monitor.startTimer(testFilePath);
      monitor.recordTotal(testFilePath, 5, 0.1, true);

      const metrics = monitor.getMetrics(testFilePath);
      expect(metrics?.cacheHit).toBe(true);
    });

    it('should calculate memory usage if not provided', () => {
      monitor.startTimer(testFilePath);
      monitor.recordTotal(testFilePath, 165.8);

      const metrics = monitor.getMetrics(testFilePath);
      expect(metrics).toBeDefined();
      expect(metrics?.memoryMB).toBeGreaterThanOrEqual(0);
    });

    it('should clean up timer state after recording', () => {
      monitor.startTimer(testFilePath);
      expect(monitor.getActiveTimerCount()).toBe(1);

      monitor.recordTotal(testFilePath, 165.8, 12.5);
      expect(monitor.getActiveTimerCount()).toBe(0);
    });

    it('should not record when disabled', () => {
      const disabledMonitor = new PerformanceMonitor(false);
      disabledMonitor.startTimer(testFilePath);
      disabledMonitor.recordTotal(testFilePath, 165.8, 12.5);

      const metrics = disabledMonitor.getMetrics(testFilePath);
      expect(metrics).toBeUndefined();
    });

    it('should handle recording without prior timer start', () => {
      monitor.recordTotal(testFilePath, 165.8, 12.5);

      const metrics = monitor.getMetrics(testFilePath);
      expect(metrics).toBeDefined();
      expect(metrics?.totalMs).toBe(165.8);
    });
  });

  describe('checkThreshold', () => {
    let consoleSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      consoleSpy.mockRestore();
    });

    it('should log warning when time exceeds threshold', () => {
      monitor.startTimer(testFilePath);
      monitor.recordTotal(testFilePath, 1500, 12.5); // Exceeds 1000ms threshold
      monitor.checkThreshold(testFilePath);

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy.mock.calls[0][0]).toContain('Performance warning');
      expect(consoleSpy.mock.calls[0][0]).toContain(testFilePath);
      expect(consoleSpy.mock.calls[0][0]).toContain('1500');
    });

    it('should not log warning when time is below threshold', () => {
      monitor.startTimer(testFilePath);
      monitor.recordTotal(testFilePath, 500, 12.5); // Below 1000ms threshold
      monitor.checkThreshold(testFilePath);

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should include breakdown when parse/generate times are available', () => {
      monitor.startTimer(testFilePath);
      monitor.recordParse(testFilePath, 600);
      monitor.recordGenerate(testFilePath, 900);
      monitor.recordTotal(testFilePath, 1500, 12.5);
      monitor.checkThreshold(testFilePath);

      expect(consoleSpy).toHaveBeenCalledTimes(2);
      expect(consoleSpy.mock.calls[1][0]).toContain('Parse:');
      expect(consoleSpy.mock.calls[1][0]).toContain('Generate:');
      expect(consoleSpy.mock.calls[1][0]).toContain('Memory:');
    });

    it('should not log when disabled', () => {
      const disabledMonitor = new PerformanceMonitor(false);
      disabledMonitor.startTimer(testFilePath);
      disabledMonitor.recordTotal(testFilePath, 1500, 12.5);
      disabledMonitor.checkThreshold(testFilePath);

      expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should handle missing metrics gracefully', () => {
      monitor.checkThreshold('/nonexistent/file.proto');
      expect(consoleSpy).not.toHaveBeenCalled();
    });
  });

  describe('getSummary', () => {
    it('should return empty summary when no metrics collected', () => {
      const summary = monitor.getSummary();

      expect(summary).toEqual({
        totalFiles: 0,
        totalTimeMs: 0,
        averageTimeMs: 0,
        slowestFiles: [],
        memoryPeakMB: 0,
      });
    });

    it('should calculate summary for single file', () => {
      monitor.startTimer(testFilePath);
      monitor.recordTotal(testFilePath, 165.8, 12.5);

      const summary = monitor.getSummary();

      expect(summary.totalFiles).toBe(1);
      expect(summary.totalTimeMs).toBe(165.8);
      expect(summary.averageTimeMs).toBe(165.8);
      expect(summary.memoryPeakMB).toBe(12.5);
      expect(summary.slowestFiles).toHaveLength(1);
      expect(summary.slowestFiles[0].filePath).toBe(testFilePath);
    });

    it('should calculate summary for multiple files', () => {
      const files = [
        { path: '/path/file1.proto', time: 100, memory: 10 },
        { path: '/path/file2.proto', time: 200, memory: 20 },
        { path: '/path/file3.proto', time: 300, memory: 15 },
      ];

      files.forEach(file => {
        monitor.startTimer(file.path);
        monitor.recordTotal(file.path, file.time, file.memory);
      });

      const summary = monitor.getSummary();

      expect(summary.totalFiles).toBe(3);
      expect(summary.totalTimeMs).toBe(600);
      expect(summary.averageTimeMs).toBe(200);
      expect(summary.memoryPeakMB).toBe(20);
      expect(summary.slowestFiles).toHaveLength(3);
    });

    it('should sort slowest files correctly', () => {
      const files = [
        { path: '/path/fast.proto', time: 50, memory: 5 },
        { path: '/path/slow.proto', time: 500, memory: 25 },
        { path: '/path/medium.proto', time: 200, memory: 15 },
      ];

      files.forEach(file => {
        monitor.startTimer(file.path);
        monitor.recordTotal(file.path, file.time, file.memory);
      });

      const summary = monitor.getSummary();

      expect(summary.slowestFiles[0].filePath).toBe('/path/slow.proto');
      expect(summary.slowestFiles[1].filePath).toBe('/path/medium.proto');
      expect(summary.slowestFiles[2].filePath).toBe('/path/fast.proto');
    });

    it('should limit slowest files to top 10', () => {
      // Create 15 files
      for (let i = 0; i < 15; i++) {
        const filePath = `/path/file${i}.proto`;
        monitor.startTimer(filePath);
        monitor.recordTotal(filePath, i * 10, 10);
      }

      const summary = monitor.getSummary();

      expect(summary.totalFiles).toBe(15);
      expect(summary.slowestFiles).toHaveLength(10);
    });

    it('should return empty summary when disabled', () => {
      const disabledMonitor = new PerformanceMonitor(false);
      disabledMonitor.startTimer(testFilePath);
      disabledMonitor.recordTotal(testFilePath, 165.8, 12.5);

      const summary = disabledMonitor.getSummary();

      expect(summary).toEqual({
        totalFiles: 0,
        totalTimeMs: 0,
        averageTimeMs: 0,
        slowestFiles: [],
        memoryPeakMB: 0,
      });
    });
  });

  describe('exportReport', () => {
    const outputPath = '/project/.hallow-cache/performance.json';

    beforeEach(() => {
      mockedFs.mkdir.mockResolvedValue(undefined);
      mockedFs.writeFile.mockResolvedValue(undefined);
    });

    it('should export performance report to file', async () => {
      monitor.startTimer(testFilePath);
      monitor.recordParse(testFilePath, 45);
      monitor.recordGenerate(testFilePath, 120);
      monitor.recordTotal(testFilePath, 165, 12.5);

      await monitor.exportReport(outputPath);

      expect(mockedFs.mkdir).toHaveBeenCalledWith(
        path.dirname(outputPath),
        { recursive: true }
      );
      expect(mockedFs.writeFile).toHaveBeenCalled();

      const writeCall = mockedFs.writeFile.mock.calls[0];
      expect(writeCall[0]).toBe(outputPath);
      expect(writeCall[2]).toBe('utf-8');

      const reportData = JSON.parse(writeCall[1] as string);
      expect(reportData).toHaveProperty('timestamp');
      expect(reportData).toHaveProperty('summary');
      expect(reportData).toHaveProperty('metrics');
      expect(reportData).toHaveProperty('threshold');
      expect(reportData.threshold).toBe(1000);
    });

    it('should include all metrics in report', async () => {
      const files = [
        { path: '/path/file1.proto', time: 100, memory: 10 },
        { path: '/path/file2.proto', time: 200, memory: 20 },
      ];

      files.forEach(file => {
        monitor.startTimer(file.path);
        monitor.recordTotal(file.path, file.time, file.memory);
      });

      await monitor.exportReport(outputPath);

      const writeCall = mockedFs.writeFile.mock.calls[0];
      const reportData = JSON.parse(writeCall[1] as string);

      expect(reportData.metrics).toHaveLength(2);
      expect(reportData.summary.totalFiles).toBe(2);
    });

    it('should not export when disabled', async () => {
      const disabledMonitor = new PerformanceMonitor(false);
      disabledMonitor.startTimer(testFilePath);
      disabledMonitor.recordTotal(testFilePath, 165, 12.5);

      await disabledMonitor.exportReport(outputPath);

      expect(mockedFs.writeFile).not.toHaveBeenCalled();
    });

    it('should create directory if it does not exist', async () => {
      await monitor.exportReport(outputPath);

      expect(mockedFs.mkdir).toHaveBeenCalledWith(
        '/project/.hallow-cache',
        { recursive: true }
      );
    });

    it('should handle write errors gracefully', async () => {
      mockedFs.writeFile.mockRejectedValue(new Error('Write failed'));

      await expect(monitor.exportReport(outputPath)).rejects.toThrow('Write failed');
    });
  });

  describe('clear', () => {
    it('should clear all metrics and timers', () => {
      monitor.startTimer('/path/file1.proto');
      monitor.startTimer('/path/file2.proto');
      monitor.recordTotal('/path/file1.proto', 100, 10);
      monitor.recordTotal('/path/file2.proto', 200, 20);

      expect(monitor.getMetricsCount()).toBe(2);
      expect(monitor.getActiveTimerCount()).toBe(0);

      monitor.clear();

      expect(monitor.getMetricsCount()).toBe(0);
      expect(monitor.getActiveTimerCount()).toBe(0);
    });

    it('should allow fresh metrics after clear', () => {
      monitor.recordTotal(testFilePath, 100, 10);
      monitor.clear();

      monitor.startTimer(testFilePath);
      monitor.recordTotal(testFilePath, 200, 20);

      const metrics = monitor.getMetrics(testFilePath);
      expect(metrics?.totalMs).toBe(200);
      expect(metrics?.memoryMB).toBe(20);
    });
  });

  describe('timer accuracy', () => {
    it('should measure time with reasonable accuracy', (done) => {
      monitor.startTimer(testFilePath);

      setTimeout(() => {
        monitor.recordTotal(testFilePath, 50);

        const metrics = monitor.getMetrics(testFilePath);
        expect(metrics?.totalMs).toBeGreaterThanOrEqual(40);
        expect(metrics?.totalMs).toBeLessThan(100);
        done();
      }, 50);
    });

    it('should track memory with reasonable accuracy', () => {
      monitor.startTimer(testFilePath);

      // Allocate some memory
      const largeArray = new Array(1000000).fill('test');

      monitor.recordTotal(testFilePath, 100);

      const metrics = monitor.getMetrics(testFilePath);
      expect(metrics?.memoryMB).toBeGreaterThan(0);

      // Clean up
      largeArray.length = 0;
    });
  });

  describe('edge cases', () => {
    it('should handle recording metrics for same file multiple times', () => {
      monitor.startTimer(testFilePath);
      monitor.recordParse(testFilePath, 45);
      monitor.recordGenerate(testFilePath, 120);
      monitor.recordTotal(testFilePath, 165, 12.5);

      // Record again
      monitor.startTimer(testFilePath);
      monitor.recordParse(testFilePath, 50);
      monitor.recordGenerate(testFilePath, 130);
      monitor.recordTotal(testFilePath, 180, 15);

      const metrics = monitor.getMetrics(testFilePath);
      expect(metrics?.parseMs).toBe(50);
      expect(metrics?.generateMs).toBe(130);
      expect(metrics?.totalMs).toBe(180);
      expect(metrics?.memoryMB).toBe(15);
    });

    it('should handle zero values', () => {
      monitor.recordTotal(testFilePath, 0, 0);

      const metrics = monitor.getMetrics(testFilePath);
      expect(metrics?.totalMs).toBe(0);
      expect(metrics?.memoryMB).toBe(0);
    });

    it('should handle negative memory deltas', () => {
      // This can happen if GC runs during processing
      monitor.recordTotal(testFilePath, 100, -0.5);

      const metrics = monitor.getMetrics(testFilePath);
      expect(metrics?.memoryMB).toBe(-0.5);
    });
  });
});
