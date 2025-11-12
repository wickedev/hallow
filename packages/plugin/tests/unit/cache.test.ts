/**
 * Unit tests for CacheManager.
 *
 * Tests cache operations, hash computation, LRU eviction, and statistics tracking.
 */

import { CacheManager } from '../../src/cache';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('CacheManager', () => {
  describe('constructor', () => {
    it('should initialize with default max size of 100MB', () => {
      const cache = new CacheManager();
      const stats = cache.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.entryCount).toBe(0);
    });

    it('should accept custom max size in MB', () => {
      const cache = new CacheManager(50);
      const stats = cache.getStats();

      expect(stats.totalSize).toBe(0);
      expect(stats.entryCount).toBe(0);
    });

    it('should accept persistent cache directory', () => {
      const cache = new CacheManager(100, '.hallow-cache');
      expect(cache).toBeDefined();
    });
  });

  describe('computeHash', () => {
    let cache: CacheManager;

    beforeEach(() => {
      cache = new CacheManager();
    });

    it('should compute SHA-256 hash of content', () => {
      const content = 'syntax = "proto3";';
      const hash = cache.computeHash(content);

      // SHA-256 hashes are 64 hex characters
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should produce consistent hashes for same content', () => {
      const content = 'syntax = "proto3"; message Test { string name = 1; }';
      const hash1 = cache.computeHash(content);
      const hash2 = cache.computeHash(content);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different content', () => {
      const content1 = 'syntax = "proto3"; message Test1 { }';
      const content2 = 'syntax = "proto3"; message Test2 { }';

      const hash1 = cache.computeHash(content1);
      const hash2 = cache.computeHash(content2);

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty content', () => {
      const hash = cache.computeHash('');

      expect(hash).toHaveLength(64);
      expect(hash).toBe(
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      ); // SHA-256 of empty string
    });

    it('should handle unicode content', () => {
      const content = 'message 测试 { string 名称 = 1; }';
      const hash = cache.computeHash(content);

      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should be sensitive to whitespace changes', () => {
      const content1 = 'syntax = "proto3";';
      const content2 = 'syntax  =  "proto3";';

      const hash1 = cache.computeHash(content1);
      const hash2 = cache.computeHash(content2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('set and get', () => {
    let cache: CacheManager;
    const testKey = '/project/protos/service.proto';
    const testContent = 'export class ServiceStub { }';

    beforeEach(() => {
      cache = new CacheManager();
    });

    it('should store and retrieve cache entry', () => {
      const hash = cache.computeHash('original proto content');

      cache.set(testKey, testContent, hash);
      const entry = cache.get(testKey);

      expect(entry).not.toBeNull();
      expect(entry?.content).toBe(testContent);
      expect(entry?.hash).toBe(hash);
    });

    it('should return null for non-existent key', () => {
      const entry = cache.get('/non/existent/file.proto');

      expect(entry).toBeNull();
    });

    it('should update statistics on cache miss', () => {
      cache.get('/non/existent/file.proto');

      const stats = cache.getStats();
      expect(stats.misses).toBe(1);
      expect(stats.hits).toBe(0);
      expect(stats.hitRate).toBe(0);
    });

    it('should update statistics on cache hit', () => {
      const hash = cache.computeHash('content');
      cache.set(testKey, testContent, hash);

      cache.get(testKey);

      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(1);
    });

    it('should track access count on multiple hits', () => {
      const hash = cache.computeHash('content');
      cache.set(testKey, testContent, hash);

      cache.get(testKey);
      cache.get(testKey);
      cache.get(testKey);

      const entry = cache.get(testKey);
      expect(entry?.accessCount).toBe(4); // 3 + 1 from this get
    });

    it('should update last access time on get', () => {
      const hash = cache.computeHash('content');
      cache.set(testKey, testContent, hash);

      const entry1 = cache.get(testKey);
      const firstAccessTime = entry1?.lastAccess || 0;

      // Wait a bit
      const waitUntil = Date.now() + 10;
      while (Date.now() < waitUntil) {
        // busy wait
      }

      const entry2 = cache.get(testKey);
      const secondAccessTime = entry2?.lastAccess || 0;

      expect(secondAccessTime).toBeGreaterThan(firstAccessTime);
    });

    it('should calculate hit rate correctly with mixed hits and misses', () => {
      const hash = cache.computeHash('content');
      cache.set(testKey, testContent, hash);

      cache.get(testKey); // hit
      cache.get('/missing1.proto'); // miss
      cache.get(testKey); // hit
      cache.get('/missing2.proto'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(2);
      expect(stats.hitRate).toBe(0.5);
    });

    it('should update total size when adding entry', () => {
      const hash = cache.computeHash('content');
      cache.set(testKey, testContent, hash);

      const stats = cache.getStats();
      expect(stats.totalSize).toBe(Buffer.byteLength(testContent, 'utf-8'));
      expect(stats.entryCount).toBe(1);
    });

    it('should update total size when replacing entry', () => {
      const hash1 = cache.computeHash('content1');
      const content1 = 'export class Service1 { }';
      cache.set(testKey, content1, hash1);

      const hash2 = cache.computeHash('content2');
      const content2 = 'export class Service2 { } // longer content';
      cache.set(testKey, content2, hash2);

      const stats = cache.getStats();
      expect(stats.totalSize).toBe(Buffer.byteLength(content2, 'utf-8'));
      expect(stats.entryCount).toBe(1); // Still one entry
    });

    it('should store timestamp and size in entry', () => {
      const hash = cache.computeHash('content');
      const beforeSet = Date.now();

      cache.set(testKey, testContent, hash);

      const entry = cache.get(testKey);
      expect(entry?.timestamp).toBeGreaterThanOrEqual(beforeSet);
      expect(entry?.timestamp).toBeLessThanOrEqual(Date.now());
      expect(entry?.size).toBe(Buffer.byteLength(testContent, 'utf-8'));
    });
  });

  describe('invalidate', () => {
    let cache: CacheManager;

    beforeEach(() => {
      cache = new CacheManager();
    });

    it('should remove entry from cache', () => {
      const key = '/project/protos/service.proto';
      const hash = cache.computeHash('content');

      cache.set(key, 'export class Service { }', hash);
      expect(cache.get(key)).not.toBeNull();

      cache.invalidate(key);
      expect(cache.get(key)).toBeNull();
    });

    it('should update statistics when invalidating', () => {
      const key = '/project/protos/service.proto';
      const content = 'export class Service { }';
      const hash = cache.computeHash('content');

      cache.set(key, content, hash);

      const statsBefore = cache.getStats();
      expect(statsBefore.entryCount).toBe(1);
      expect(statsBefore.totalSize).toBeGreaterThan(0);

      cache.invalidate(key);

      const statsAfter = cache.getStats();
      expect(statsAfter.entryCount).toBe(0);
      expect(statsAfter.totalSize).toBe(0);
    });

    it('should handle invalidating non-existent key gracefully', () => {
      cache.invalidate('/non/existent/file.proto');

      const stats = cache.getStats();
      expect(stats.entryCount).toBe(0);
    });
  });

  describe('invalidateMultiple', () => {
    let cache: CacheManager;

    beforeEach(() => {
      cache = new CacheManager();
    });

    it('should invalidate multiple entries', () => {
      const keys = [
        '/project/protos/service1.proto',
        '/project/protos/service2.proto',
        '/project/protos/service3.proto',
      ];

      const hash = cache.computeHash('content');
      keys.forEach((key) => {
        cache.set(key, 'export class Service { }', hash);
      });

      expect(cache.getStats().entryCount).toBe(3);

      cache.invalidateMultiple(keys);

      expect(cache.getStats().entryCount).toBe(0);
      keys.forEach((key) => {
        expect(cache.get(key)).toBeNull();
      });
    });

    it('should handle empty array', () => {
      const key = '/project/protos/service.proto';
      const hash = cache.computeHash('content');

      cache.set(key, 'export class Service { }', hash);

      cache.invalidateMultiple([]);

      expect(cache.getStats().entryCount).toBe(1);
    });

    it('should handle mix of existing and non-existing keys', () => {
      const hash = cache.computeHash('content');
      cache.set('/existing.proto', 'content', hash);

      cache.invalidateMultiple(['/existing.proto', '/non-existing.proto']);

      expect(cache.getStats().entryCount).toBe(0);
    });
  });

  describe('clear', () => {
    let cache: CacheManager;

    beforeEach(() => {
      cache = new CacheManager();
    });

    it('should remove all entries', () => {
      const hash = cache.computeHash('content');
      cache.set('/file1.proto', 'content1', hash);
      cache.set('/file2.proto', 'content2', hash);
      cache.set('/file3.proto', 'content3', hash);

      cache.clear();

      expect(cache.get('/file1.proto')).toBeNull();
      expect(cache.get('/file2.proto')).toBeNull();
      expect(cache.get('/file3.proto')).toBeNull();
    });

    it('should reset statistics', () => {
      const hash = cache.computeHash('content');
      cache.set('/file1.proto', 'content1', hash);
      cache.get('/file1.proto');
      cache.get('/file2.proto'); // miss

      cache.clear();

      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.entryCount).toBe(0);
    });
  });

  describe('getStats', () => {
    let cache: CacheManager;

    beforeEach(() => {
      cache = new CacheManager();
    });

    it('should return immutable copy of statistics', () => {
      const stats1 = cache.getStats();
      stats1.hits = 999; // Try to modify

      const stats2 = cache.getStats();
      expect(stats2.hits).toBe(0); // Should not be modified
    });

    it('should accurately track all statistics', () => {
      const hash = cache.computeHash('content');
      const content = 'export class Service { }';

      cache.set('/file1.proto', content, hash);
      cache.set('/file2.proto', content, hash);

      cache.get('/file1.proto'); // hit
      cache.get('/file2.proto'); // hit
      cache.get('/file3.proto'); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(2 / 3);
      expect(stats.entryCount).toBe(2);
      expect(stats.totalSize).toBe(Buffer.byteLength(content, 'utf-8') * 2);
    });
  });

  describe('evictLRU - Memory limit enforcement (task 6.2)', () => {
    it('should automatically evict when cache size exceeds limit', () => {
      // Create cache with very small limit (1KB = 1024 bytes)
      const cache = new CacheManager(1 / 1024); // 1KB in MB
      const hash = cache.computeHash('content');

      // Each entry is approximately 200+ bytes
      const content1 = 'A'.repeat(300); // 300 bytes
      const content2 = 'B'.repeat(300); // 300 bytes
      const content3 = 'C'.repeat(300); // 300 bytes
      const content4 = 'D'.repeat(300); // 300 bytes

      // Add entries that will exceed 1KB limit
      cache.set('/file1.proto', content1, hash);
      cache.set('/file2.proto', content2, hash);
      cache.set('/file3.proto', content3, hash);

      // At this point, we're at ~900 bytes
      expect(cache.getStats().entryCount).toBe(3);

      // Add fourth entry which should trigger eviction (would be 1200 bytes)
      cache.set('/file4.proto', content4, hash);

      // Oldest entries should be evicted to stay under 1KB
      const stats = cache.getStats();
      expect(stats.totalSize).toBeLessThanOrEqual(1024);
      expect(stats.entryCount).toBeLessThan(4);
    });

    it('should evict multiple entries if needed to get under limit', () => {
      // Create cache with small limit
      const cache = new CacheManager(1 / 1024); // 1KB
      const hash = cache.computeHash('content');

      // Add several small entries
      for (let i = 0; i < 5; i++) {
        cache.set(`/file${i}.proto`, 'X'.repeat(100), hash);
      }

      // Now add one large entry that exceeds limit by itself
      const largeContent = 'Z'.repeat(2000); // 2KB - exceeds limit
      cache.set('/large.proto', largeContent, hash);

      // Should evict all old entries and keep only the large one
      // (or evict large one if implementation chooses to keep smaller entries)
      const stats = cache.getStats();
      expect(stats.totalSize).toBeLessThanOrEqual(2048); // Allow some margin
    });

    it('should not evict if under memory limit', () => {
      const cache = new CacheManager(10); // 10MB - plenty of space
      const hash = cache.computeHash('content');

      const content = 'export class Service { }'; // ~24 bytes

      cache.set('/file1.proto', content, hash);
      cache.set('/file2.proto', content, hash);
      cache.set('/file3.proto', content, hash);

      const stats = cache.getStats();
      expect(stats.entryCount).toBe(3); // All entries should remain
      expect(cache.get('/file1.proto')).not.toBeNull();
      expect(cache.get('/file2.proto')).not.toBeNull();
      expect(cache.get('/file3.proto')).not.toBeNull();
    });

    it('should maintain cache size correctly after eviction', () => {
      const cache = new CacheManager(1 / 1024); // 1KB
      const hash = cache.computeHash('content');

      // Add entries to trigger eviction
      cache.set('/file1.proto', 'A'.repeat(400), hash);
      cache.set('/file2.proto', 'B'.repeat(400), hash);
      cache.set('/file3.proto', 'C'.repeat(400), hash); // Should evict file1

      const stats = cache.getStats();

      // Total size should be accurate
      let calculatedSize = 0;
      if (cache.get('/file1.proto')) {
        calculatedSize += Buffer.byteLength('A'.repeat(400), 'utf-8');
      }
      if (cache.get('/file2.proto')) {
        calculatedSize += Buffer.byteLength('B'.repeat(400), 'utf-8');
      }
      if (cache.get('/file3.proto')) {
        calculatedSize += Buffer.byteLength('C'.repeat(400), 'utf-8');
      }

      expect(stats.totalSize).toBe(calculatedSize);
      expect(stats.totalSize).toBeLessThanOrEqual(1024);
    });

    it('should handle eviction when cache is empty', () => {
      const cache = new CacheManager(1);

      // Should not throw when evicting empty cache
      expect(() => {
        // Access private method through type assertion for testing
        (cache as any).evictLRU();
      }).not.toThrow();
    });
  });

  describe('evictLRU - LRU eviction order (task 6.2)', () => {
    it('should evict least recently used entry first', () => {
      const cache = new CacheManager(1 / 1024); // 1KB
      const hash = cache.computeHash('content');

      // Add three entries
      cache.set('/file1.proto', 'A'.repeat(300), hash); // First
      cache.set('/file2.proto', 'B'.repeat(300), hash); // Second
      cache.set('/file3.proto', 'C'.repeat(300), hash); // Third (900 bytes total)

      // Access file1 to make it more recently used than file2
      cache.get('/file1.proto');

      // Now access order is: file2 (oldest), file3, file1 (newest)

      // Add fourth entry to trigger eviction
      cache.set('/file4.proto', 'D'.repeat(300), hash);

      // file2 should be evicted (least recently used)
      expect(cache.get('/file2.proto')).toBeNull();
      expect(cache.get('/file1.proto')).not.toBeNull(); // Should still exist
      expect(cache.get('/file3.proto')).not.toBeNull(); // Should still exist
      expect(cache.get('/file4.proto')).not.toBeNull(); // Should still exist
    });

    it('should evict entries in LRU order when multiple evictions needed', () => {
      const cache = new CacheManager(1 / 1024); // 1KB
      const hash = cache.computeHash('content');

      // Add entries with different access patterns
      cache.set('/file1.proto', 'A'.repeat(200), hash);
      cache.set('/file2.proto', 'B'.repeat(200), hash);
      cache.set('/file3.proto', 'C'.repeat(200), hash);
      cache.set('/file4.proto', 'D'.repeat(200), hash);

      // Create access pattern: file1 (oldest), file2, file4, file3 (newest)
      cache.get('/file2.proto');
      cache.get('/file4.proto');
      cache.get('/file3.proto');

      // Add large entry requiring multiple evictions
      cache.set('/large.proto', 'X'.repeat(600), hash);

      // file1 should be evicted first (never accessed)
      // file2 might be evicted second (accessed once, oldest access)
      expect(cache.get('/file1.proto')).toBeNull();

      // Most recently accessed should remain
      expect(cache.get('/file3.proto')).not.toBeNull(); // Most recent access
    });

    it('should respect access count when evicting', () => {
      const cache = new CacheManager(1 / 1024); // 1KB
      const hash = cache.computeHash('content');

      // Add entries that will fill most of cache
      cache.set('/file1.proto', 'A'.repeat(400), hash); // 400 bytes
      cache.set('/file2.proto', 'B'.repeat(400), hash); // 400 bytes, total 800

      // Access file1 multiple times to make it hot
      cache.get('/file1.proto');
      cache.get('/file1.proto');
      cache.get('/file1.proto');

      // Don't access file2

      // Wait a tiny bit to ensure timestamp difference
      const waitUntil = Date.now() + 5;
      while (Date.now() < waitUntil) {
        // busy wait
      }

      // Add entry to trigger eviction (800 + 500 = 1300 > 1024)
      cache.set('/file3.proto', 'C'.repeat(500), hash);

      // file2 should be evicted (less recently accessed)
      // file1 should remain (more recently accessed)
      expect(cache.get('/file2.proto')).toBeNull();
      expect(cache.get('/file1.proto')).not.toBeNull();
    });

    it('should update LRU order on set operation', () => {
      const cache = new CacheManager(1 / 1024); // 1KB
      const hash = cache.computeHash('content');

      // Add entries
      cache.set('/file1.proto', 'A'.repeat(400), hash); // 400 bytes
      cache.set('/file2.proto', 'B'.repeat(400), hash); // 400 bytes, total 800

      // Re-set file1 (should move it to most recently used)
      cache.set('/file1.proto', 'A-updated'.repeat(40), hash); // ~440 bytes

      // Now order is: file2 (oldest), file1 (newest)

      // Add entry to trigger eviction (800 + 500 = 1300 > 1024)
      cache.set('/file3.proto', 'C'.repeat(500), hash);

      // file2 should be evicted
      expect(cache.get('/file2.proto')).toBeNull();
      expect(cache.get('/file1.proto')).not.toBeNull(); // Should remain (recently set)
    });

    it('should evict correct entries with mixed access patterns', () => {
      const cache = new CacheManager(1 / 1024); // 1KB
      const hash = cache.computeHash('content');

      // Create complex access pattern with larger entries
      cache.set('/a.proto', 'A'.repeat(250), hash); // t=0, 250 bytes
      cache.set('/b.proto', 'B'.repeat(250), hash); // t=1, 250 bytes (total 500)
      cache.set('/c.proto', 'C'.repeat(250), hash); // t=2, 250 bytes (total 750)

      // Access pattern: a (oldest), c (middle), b (newest)
      cache.get('/c.proto'); // t=3
      cache.get('/b.proto'); // t=4

      // Add entries to force evictions (750 + 250 = 1000, still under)
      // Need to add larger entries to exceed limit
      cache.set('/d.proto', 'D'.repeat(300), hash); // t=5, would be 1050 > 1024, triggers eviction
      cache.set('/e.proto', 'E'.repeat(300), hash); // t=6, would be 1350, triggers more eviction

      // 'a' should definitely be evicted (never accessed after creation)
      expect(cache.get('/a.proto')).toBeNull();

      // More recent entries should have higher survival rate
      // At least one of the more recently accessed entries should survive
      const hasB = cache.get('/b.proto') !== null;
      const hasC = cache.get('/c.proto') !== null;
      const hasD = cache.get('/d.proto') !== null;
      const hasE = cache.get('/e.proto') !== null;

      // At least the most recent entries should survive
      expect(hasB || hasC || hasD || hasE).toBe(true);
    });

    it('should handle eviction when all entries have same access time', () => {
      const cache = new CacheManager(1 / 1024); // 1KB
      const hash = cache.computeHash('content');

      // Add multiple entries without any get operations
      cache.set('/file1.proto', 'A'.repeat(300), hash);
      cache.set('/file2.proto', 'B'.repeat(300), hash);
      cache.set('/file3.proto', 'C'.repeat(300), hash);

      // Add entry to trigger eviction
      // All have same access pattern (only set, no get), so oldest by creation should go
      cache.set('/file4.proto', 'D'.repeat(300), hash);

      // Should have evicted to stay under limit
      const stats = cache.getStats();
      expect(stats.totalSize).toBeLessThanOrEqual(1024);
    });
  });

  describe('persistent cache - saveToDisk (task 6.4)', () => {
    let testCacheDir: string;

    beforeEach(async () => {
      // Create unique temporary directory for each test
      testCacheDir = join(tmpdir(), `hallow-test-${Date.now()}-${Math.random()}`);
    });

    afterEach(async () => {
      // Clean up test cache directory
      try {
        const files = await fs.readdir(testCacheDir);
        for (const file of files) {
          await fs.unlink(join(testCacheDir, file));
        }
        await fs.rmdir(testCacheDir);
      } catch {
        // Directory might not exist if test failed early
      }
    });

    it('should save cache entries to disk', async () => {
      const cache = new CacheManager(100, testCacheDir);
      const hash = cache.computeHash('content');

      cache.set('/project/protos/service.proto', 'export class Service { }', hash);
      cache.set('/project/protos/types.proto', 'export interface Message { }', hash);

      await cache.saveToDisk();

      // Verify files were created
      const files = await fs.readdir(testCacheDir);
      expect(files.length).toBe(2);
      expect(files).toContain(encodeURIComponent('/project/protos/service.proto') + '.json');
      expect(files).toContain(encodeURIComponent('/project/protos/types.proto') + '.json');
    });

    it('should save cache entries as valid JSON', async () => {
      const cache = new CacheManager(100, testCacheDir);
      const hash = cache.computeHash('proto content');
      const content = 'export class Service { }';

      cache.set('/test.proto', content, hash);
      await cache.saveToDisk();

      // Read and parse JSON file
      const filename = encodeURIComponent('/test.proto') + '.json';
      const filePath = join(testCacheDir, filename);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const entry = JSON.parse(fileContent);

      expect(entry.content).toBe(content);
      expect(entry.hash).toBe(hash);
      expect(entry.timestamp).toBeGreaterThan(0);
      expect(entry.size).toBe(Buffer.byteLength(content, 'utf-8'));
      expect(entry.accessCount).toBe(0);
      expect(entry.lastAccess).toBeGreaterThan(0);
    });

    it('should create cache directory if it does not exist', async () => {
      const cache = new CacheManager(100, testCacheDir);
      const hash = cache.computeHash('content');

      cache.set('/test.proto', 'export class Test { }', hash);

      // Ensure directory doesn't exist yet
      await expect(fs.access(testCacheDir)).rejects.toThrow();

      await cache.saveToDisk();

      // Directory should now exist
      await expect(fs.access(testCacheDir)).resolves.toBeUndefined();
    });

    it('should handle empty cache gracefully', async () => {
      const cache = new CacheManager(100, testCacheDir);

      await cache.saveToDisk();

      // Directory should be created but empty
      const files = await fs.readdir(testCacheDir);
      expect(files.length).toBe(0);
    });

    it('should not save if persistent cache dir is not set', async () => {
      const cache = new CacheManager(100); // No cache dir
      const hash = cache.computeHash('content');

      cache.set('/test.proto', 'export class Test { }', hash);

      // Should not throw and should not create any directory
      await expect(cache.saveToDisk()).resolves.toBeUndefined();
    });

    it('should throw error if unable to create directory', async () => {
      // Use invalid path (file instead of directory)
      const invalidPath = join(tmpdir(), 'invalid-file.txt');
      await fs.writeFile(invalidPath, 'this is a file, not a directory', 'utf-8');

      const cache = new CacheManager(100, join(invalidPath, 'subdir'));
      const hash = cache.computeHash('content');
      cache.set('/test.proto', 'content', hash);

      await expect(cache.saveToDisk()).rejects.toThrow('Failed to save cache to disk');

      // Clean up
      await fs.unlink(invalidPath);
    });

    it('should overwrite existing cache files', async () => {
      const cache = new CacheManager(100, testCacheDir);
      const hash1 = cache.computeHash('content1');
      const hash2 = cache.computeHash('content2');

      cache.set('/test.proto', 'original content', hash1);
      await cache.saveToDisk();

      // Update cache entry
      cache.set('/test.proto', 'updated content', hash2);
      await cache.saveToDisk();

      // Read file
      const filename = encodeURIComponent('/test.proto') + '.json';
      const filePath = join(testCacheDir, filename);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const entry = JSON.parse(fileContent);

      expect(entry.content).toBe('updated content');
      expect(entry.hash).toBe(hash2);
    });

    it('should handle special characters in file paths', async () => {
      const cache = new CacheManager(100, testCacheDir);
      const hash = cache.computeHash('content');

      // Path with special characters
      const specialPath = '/project/protos/测试/service.proto?query=test&foo=bar';
      cache.set(specialPath, 'export class Service { }', hash);

      await cache.saveToDisk();

      // Verify file was created with encoded name
      const files = await fs.readdir(testCacheDir);
      expect(files.length).toBe(1);

      // Should be able to read the file
      const filename = encodeURIComponent(specialPath) + '.json';
      const filePath = join(testCacheDir, filename);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const entry = JSON.parse(fileContent);

      expect(entry.content).toBe('export class Service { }');
    });
  });

  describe('persistent cache - loadFromDisk (task 6.4)', () => {
    let testCacheDir: string;

    beforeEach(async () => {
      // Create unique temporary directory for each test
      testCacheDir = join(tmpdir(), `hallow-test-${Date.now()}-${Math.random()}`);
      await fs.mkdir(testCacheDir, { recursive: true });
    });

    afterEach(async () => {
      // Clean up test cache directory
      try {
        const files = await fs.readdir(testCacheDir);
        for (const file of files) {
          await fs.unlink(join(testCacheDir, file));
        }
        await fs.rmdir(testCacheDir);
      } catch {
        // Directory might not exist if test failed early
      }
    });

    it('should load cache entries from disk', async () => {
      // First, save some entries
      const cache1 = new CacheManager(100, testCacheDir);
      const hash = cache1.computeHash('proto content');

      cache1.set('/project/protos/service.proto', 'export class Service { }', hash);
      cache1.set('/project/protos/types.proto', 'export interface Message { }', hash);
      await cache1.saveToDisk();

      // Create new cache instance and load from disk
      const cache2 = new CacheManager(100, testCacheDir);
      await cache2.loadFromDisk();

      // Verify entries were loaded
      const stats = cache2.getStats();
      expect(stats.entryCount).toBe(2);

      const entry1 = cache2.get('/project/protos/service.proto');
      const entry2 = cache2.get('/project/protos/types.proto');

      expect(entry1?.content).toBe('export class Service { }');
      expect(entry2?.content).toBe('export interface Message { }');
    });

    it('should restore cache entry properties correctly', async () => {
      const cache1 = new CacheManager(100, testCacheDir);
      const hash = cache1.computeHash('proto content');
      const content = 'export class Service { }';

      cache1.set('/test.proto', content, hash);
      const originalEntry = cache1.get('/test.proto');
      await cache1.saveToDisk();

      // Load in new cache
      const cache2 = new CacheManager(100, testCacheDir);
      await cache2.loadFromDisk();

      const loadedEntry = cache2.get('/test.proto');

      expect(loadedEntry?.content).toBe(originalEntry?.content);
      expect(loadedEntry?.hash).toBe(originalEntry?.hash);
      expect(loadedEntry?.size).toBe(originalEntry?.size);
      // Note: accessCount and lastAccess will be updated by the get() call
    });

    it('should handle non-existent cache directory gracefully', async () => {
      const nonExistentDir = join(tmpdir(), `non-existent-${Date.now()}`);
      const cache = new CacheManager(100, nonExistentDir);

      // Should not throw
      await expect(cache.loadFromDisk()).resolves.toBeUndefined();

      const stats = cache.getStats();
      expect(stats.entryCount).toBe(0);
    });

    it('should handle empty cache directory', async () => {
      const cache = new CacheManager(100, testCacheDir);

      await cache.loadFromDisk();

      const stats = cache.getStats();
      expect(stats.entryCount).toBe(0);
    });

    it('should not load if persistent cache dir is not set', async () => {
      const cache = new CacheManager(100); // No cache dir

      // Should not throw
      await expect(cache.loadFromDisk()).resolves.toBeUndefined();

      const stats = cache.getStats();
      expect(stats.entryCount).toBe(0);
    });

    it('should skip corrupted cache files gracefully', async () => {
      // Create valid entry
      const cache1 = new CacheManager(100, testCacheDir);
      const hash = cache1.computeHash('content');
      cache1.set('/valid.proto', 'export class Valid { }', hash);
      await cache1.saveToDisk();

      // Create corrupted JSON file
      const corruptedPath = join(testCacheDir, encodeURIComponent('/corrupted.proto') + '.json');
      await fs.writeFile(corruptedPath, '{ invalid json content }', 'utf-8');

      // Load cache - should skip corrupted file
      const cache2 = new CacheManager(100, testCacheDir);
      await cache2.loadFromDisk();

      const stats = cache2.getStats();
      expect(stats.entryCount).toBe(1); // Only valid entry loaded

      expect(cache2.get('/valid.proto')).not.toBeNull();
      expect(cache2.get('/corrupted.proto')).toBeNull();
    });

    it('should skip files with invalid structure', async () => {
      // Create file with valid JSON but invalid structure
      const invalidPath = join(testCacheDir, encodeURIComponent('/invalid.proto') + '.json');
      await fs.writeFile(
        invalidPath,
        JSON.stringify({ foo: 'bar', missing: 'required fields' }),
        'utf-8',
      );

      const cache = new CacheManager(100, testCacheDir);
      await cache.loadFromDisk();

      const stats = cache.getStats();
      expect(stats.entryCount).toBe(0);
    });

    it('should skip non-JSON files in cache directory', async () => {
      // Create valid cache entry
      const cache1 = new CacheManager(100, testCacheDir);
      const hash = cache1.computeHash('content');
      cache1.set('/test.proto', 'export class Test { }', hash);
      await cache1.saveToDisk();

      // Create non-JSON file
      await fs.writeFile(join(testCacheDir, 'readme.txt'), 'This is not a cache file', 'utf-8');

      // Load cache - should only load JSON files
      const cache2 = new CacheManager(100, testCacheDir);
      await cache2.loadFromDisk();

      const stats = cache2.getStats();
      expect(stats.entryCount).toBe(1);
    });

    it('should decode file paths correctly', async () => {
      const cache1 = new CacheManager(100, testCacheDir);
      const hash = cache1.computeHash('content');

      // Path with special characters
      const specialPath = '/project/protos/测试/service.proto?query=test';
      cache1.set(specialPath, 'export class Service { }', hash);
      await cache1.saveToDisk();

      // Load and verify
      const cache2 = new CacheManager(100, testCacheDir);
      await cache2.loadFromDisk();

      const entry = cache2.get(specialPath);
      expect(entry?.content).toBe('export class Service { }');
    });

    it('should update cache statistics correctly on load', async () => {
      const cache1 = new CacheManager(100, testCacheDir);
      const hash = cache1.computeHash('content');

      const content1 = 'export class Service1 { }';
      const content2 = 'export class Service2 { }';

      cache1.set('/service1.proto', content1, hash);
      cache1.set('/service2.proto', content2, hash);
      await cache1.saveToDisk();

      const cache2 = new CacheManager(100, testCacheDir);
      await cache2.loadFromDisk();

      const stats = cache2.getStats();
      expect(stats.entryCount).toBe(2);
      expect(stats.totalSize).toBe(
        Buffer.byteLength(content1, 'utf-8') + Buffer.byteLength(content2, 'utf-8'),
      );
    });

    it('should handle round-trip save and load correctly', async () => {
      const cache1 = new CacheManager(100, testCacheDir);
      const hash = cache1.computeHash('proto content');

      // Add multiple entries
      for (let i = 0; i < 5; i++) {
        cache1.set(`/service${i}.proto`, `export class Service${i} { }`, hash);
      }

      // Access some entries to update access patterns
      cache1.get('/service0.proto');
      cache1.get('/service0.proto');
      cache1.get('/service2.proto');

      await cache1.saveToDisk();

      // Load in new cache
      const cache2 = new CacheManager(100, testCacheDir);
      await cache2.loadFromDisk();

      // Verify all entries were loaded
      const stats = cache2.getStats();
      expect(stats.entryCount).toBe(5);

      // Verify content
      for (let i = 0; i < 5; i++) {
        const entry = cache2.get(`/service${i}.proto`);
        expect(entry?.content).toBe(`export class Service${i} { }`);
      }
    });
  });
});
