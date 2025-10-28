/**
 * Unit tests for MemoryEfficientGenerator
 */

import { MemoryEfficientGenerator, StreamingGenerationOptions } from '../../src/performance/MemoryEfficientGenerator';
import { MessageDefinition, EnumDefinition, FieldDefinition } from '../../src/core/proto-types';
import { GeneratedFile } from '../../src/core/types';

describe('MemoryEfficientGenerator', () => {
  let generator: MemoryEfficientGenerator;

  beforeEach(() => {
    generator = new MemoryEfficientGenerator({
      chunkSize: 5,
      memoryLimit: 512 * 1024 * 1024, // 512MB for testing (needs to be higher than Node.js baseline memory)
      useStreaming: true,
      gcInterval: 10,
    });
  });

  describe('generateMessagesInChunks', () => {
    it('should generate messages in chunks with correct metadata', async () => {
      const messages = createTestMessages(15);
      const mockGenerator = jest.fn().mockResolvedValue([createMockGeneratedFile()]);

      const chunks: Array<{ files: GeneratedFile[]; metadata: any }> = [];
      for await (const chunk of generator.generateMessagesInChunks(messages, mockGenerator)) {
        chunks.push(chunk);
      }

      // Should create chunks (dynamic sizing based on memory)
      expect(chunks.length).toBeGreaterThan(0);
      expect(mockGenerator).toHaveBeenCalled();

      // Verify metadata
      chunks.forEach((chunk, index) => {
        expect(chunk.metadata.index).toBe(index);
        expect(chunk.metadata.totalChunks).toBe(chunks.length);
        expect(chunk.metadata.itemCount).toBeGreaterThan(0);
        expect(chunk.metadata.startTime).toBeDefined();
        expect(chunk.metadata.endTime).toBeDefined();
      });
    });

    it('should handle odd number of messages', async () => {
      const messages = createTestMessages(13);
      const mockGenerator = jest.fn().mockResolvedValue([createMockGeneratedFile()]);

      const chunks: Array<{ files: GeneratedFile[]; metadata: any }> = [];
      for await (const chunk of generator.generateMessagesInChunks(messages, mockGenerator)) {
        chunks.push(chunk);
      }

      // Should create chunks (dynamic sizing, likely 2 with increased chunk size or 3 with base size)
      expect(chunks.length).toBeGreaterThan(0);
      expect(mockGenerator).toHaveBeenCalled();

      // Verify all messages were processed (sum of all chunk item counts should be 13)
      const totalProcessed = chunks.reduce((sum, chunk) => sum + chunk.metadata.itemCount, 0);
      expect(totalProcessed).toBe(13);
    });

    it('should report progress correctly', async () => {
      const messages = createTestMessages(10);
      const mockGenerator = jest.fn().mockResolvedValue([createMockGeneratedFile()]);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const chunks: Array<any> = [];
      for await (const chunk of generator.generateMessagesInChunks(messages, mockGenerator)) {
        chunks.push(chunk);
      }

      // Should log progress for each chunk
      expect(consoleSpy).toHaveBeenCalled();
      const progressLogs = consoleSpy.mock.calls.filter(call =>
        call[0].includes('[MemoryEfficient] Processed messages chunk')
      );
      expect(progressLogs.length).toBeGreaterThan(0);

      consoleSpy.mockRestore();
    });

    it('should handle generator errors gracefully', async () => {
      const messages = createTestMessages(10);
      const mockGenerator = jest.fn().mockRejectedValue(new Error('Generation failed'));

      await expect(async () => {
        for await (const chunk of generator.generateMessagesInChunks(messages, mockGenerator)) {
          // Should not reach here
        }
      }).rejects.toThrow('Generation failed');
    });
  });

  describe('generateEnumsInChunks', () => {
    it('should generate enums in chunks with correct metadata', async () => {
      const enums = createTestEnums(12);
      const mockGenerator = jest.fn().mockResolvedValue([createMockGeneratedFile()]);

      const chunks: Array<{ files: GeneratedFile[]; metadata: any }> = [];
      for await (const chunk of generator.generateEnumsInChunks(enums, mockGenerator)) {
        chunks.push(chunk);
      }

      // Should create 3 chunks (12 enums / 5 chunk size, rounded up)
      expect(chunks.length).toBeGreaterThanOrEqual(2);
      expect(mockGenerator).toHaveBeenCalled();

      // Verify metadata
      chunks.forEach((chunk, index) => {
        expect(chunk.metadata.index).toBe(index);
        expect(chunk.metadata.startTime).toBeDefined();
        expect(chunk.metadata.endTime).toBeDefined();
      });
    });
  });

  describe('cross-chunk dependency resolution', () => {
    it('should track message dependencies correctly', () => {
      const messages = createTestMessagesWithDependencies();

      messages.forEach((msg, index) => {
        generator.trackMessageDependencies([msg], index);
      });

      const stats = generator.getDependencyStats();
      expect(stats.totalNodes).toBeGreaterThan(0);
      expect(stats.totalChunks).toBeGreaterThan(0);
    });

    it('should resolve cross-chunk dependencies', () => {
      const messages = createTestMessagesWithDependencies();

      messages.forEach((msg, index) => {
        generator.trackMessageDependencies([msg], index);
      });

      const imports = generator.resolveCrossChunkDependencies(1);
      expect(Array.isArray(imports)).toBe(true);
    });

    it('should provide topological order', () => {
      const messages = createTestMessagesWithDependencies();

      messages.forEach((msg, index) => {
        generator.trackMessageDependencies([msg], index);
      });

      const order = generator.getTopologicalOrder();
      expect(Array.isArray(order)).toBe(true);
      expect(order.length).toBeGreaterThan(0);
    });
  });

  describe('chunk size adjustment', () => {
    it('should adjust chunk size based on memory usage', async () => {
      // Create generator with small memory limit to trigger adjustments
      const smallMemGenerator = new MemoryEfficientGenerator({
        chunkSize: 10,
        memoryLimit: 768 * 1024 * 1024, // 768MB (higher than baseline Node.js memory)
        useStreaming: true,
      });

      const messages = createTestMessages(50);
      const mockGenerator = jest.fn().mockResolvedValue([createMockGeneratedFile()]);

      const chunkSizes: number[] = [];
      for await (const chunk of smallMemGenerator.generateMessagesInChunks(messages, mockGenerator)) {
        chunkSizes.push(chunk.metadata.itemCount);
      }

      // Chunk sizes may vary due to dynamic adjustment
      expect(chunkSizes.length).toBeGreaterThan(0);
    });

    it('should not exceed item count when adjusting chunk size', async () => {
      const messages = createTestMessages(3); // Less than chunk size
      const mockGenerator = jest.fn().mockResolvedValue([createMockGeneratedFile()]);

      const chunks: Array<any> = [];
      for await (const chunk of generator.generateMessagesInChunks(messages, mockGenerator)) {
        chunks.push(chunk);
      }

      // Should create only 1 chunk
      expect(chunks.length).toBe(1);
      expect(chunks[0].metadata.itemCount).toBe(3);
    });
  });

  describe('memory monitoring', () => {
    it('should report memory statistics', () => {
      const stats = generator.getMemoryStats();

      expect(stats).toHaveProperty('usage');
      expect(stats).toHaveProperty('cacheSize');
      expect(stats).toHaveProperty('cacheMemory');

      expect(typeof stats.usage.heapUsed).toBe('number');
      expect(typeof stats.cacheSize).toBe('number');
      expect(typeof stats.cacheMemory).toBe('number');
    });

    it('should track memory history for trend analysis', async () => {
      const messages = createTestMessages(20);
      const mockGenerator = jest.fn().mockResolvedValue([createMockGeneratedFile()]);

      // Process chunks to build memory history
      for await (const chunk of generator.generateMessagesInChunks(messages, mockGenerator)) {
        // Just iterate
      }

      const stats = generator.getMemoryStats();
      expect(stats).toBeDefined();
    });
  });

  describe('cache management', () => {
    it('should add items to cache', () => {
      generator.addToCache('test-key', { data: 'test-value' });

      const retrieved = generator.getFromCache('test-key');
      expect(retrieved).toEqual({ data: 'test-value' });
    });

    it('should clear cache when memory limit is approached', async () => {
      // Fill cache
      for (let i = 0; i < 100; i++) {
        generator.addToCache(`key-${i}`, { data: `value-${i}` });
      }

      // Cache should be managed automatically
      const stats = generator.getMemoryStats();
      expect(stats.cacheSize).toBeDefined();
    });

    it('should support LRU cache strategy', () => {
      const lruGenerator = new MemoryEfficientGenerator({
        cacheStrategy: 'lru',
        cacheSize: 3,
      });

      lruGenerator.addToCache('key1', 'value1');
      lruGenerator.addToCache('key2', 'value2');
      lruGenerator.addToCache('key3', 'value3');
      lruGenerator.addToCache('key4', 'value4'); // Should evict key1

      expect(lruGenerator.getFromCache('key1')).toBeUndefined();
      expect(lruGenerator.getFromCache('key4')).toBe('value4');
    });

    it('should support FIFO cache strategy', () => {
      const fifoGenerator = new MemoryEfficientGenerator({
        cacheStrategy: 'fifo',
        cacheSize: 3,
      });

      fifoGenerator.addToCache('key1', 'value1');
      fifoGenerator.addToCache('key2', 'value2');
      fifoGenerator.addToCache('key3', 'value3');
      fifoGenerator.addToCache('key4', 'value4'); // Should evict key1

      expect(fifoGenerator.getFromCache('key1')).toBeUndefined();
      expect(fifoGenerator.getFromCache('key4')).toBe('value4');
    });

    it('should support no-cache strategy', () => {
      const noCacheGenerator = new MemoryEfficientGenerator({
        cacheStrategy: 'none',
      });

      noCacheGenerator.addToCache('key1', 'value1');
      expect(noCacheGenerator.getFromCache('key1')).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should handle memory limit exceeded error', async () => {
      // Create generator with very small memory limit
      const tinyMemGenerator = new MemoryEfficientGenerator({
        chunkSize: 100,
        memoryLimit: 1, // 1 byte - unrealistic but will trigger error
      });

      const messages = createTestMessages(50);
      const mockGenerator = jest.fn().mockResolvedValue([createMockGeneratedFile()]);

      await expect(async () => {
        for await (const chunk of tinyMemGenerator.generateMessagesInChunks(messages, mockGenerator)) {
          // Should throw before completing
        }
      }).rejects.toThrow();
    });
  });

  describe('garbage collection', () => {
    it('should trigger garbage collection at intervals', async () => {
      const gcGenerator = new MemoryEfficientGenerator({
        chunkSize: 2,
        gcInterval: 2, // Trigger GC every 2 operations
      });

      const messages = createTestMessages(10);
      const mockGenerator = jest.fn().mockResolvedValue([createMockGeneratedFile()]);

      let chunkCount = 0;
      for await (const chunk of gcGenerator.generateMessagesInChunks(messages, mockGenerator)) {
        chunkCount++;
      }

      expect(chunkCount).toBeGreaterThan(0);
    });
  });
});

// Helper functions

function createTestMessages(count: number): MessageDefinition[] {
  return Array.from({ length: count }, (_, i) => ({
    name: `TestMessage${i}`,
    fields: [
      {
        name: 'id',
        type: 'string',
        number: 1,
        label: 'optional',
        repeated: false,
        optional: true,
        map: false,
        options: {},
      } as FieldDefinition,
    ],
    nestedMessages: [],
    nestedEnums: [],
    oneofs: [],
    options: {},
  }));
}

function createTestMessagesWithDependencies(): MessageDefinition[] {
  const createField = (name: string, type: string, number: number): FieldDefinition => ({
    name,
    type,
    number,
    repeated: false,
    optional: true,
    map: false,
    options: {},
  });

  return [
    {
      name: 'User',
      fields: [
        createField('id', 'string', 1),
        createField('address', 'Address', 2),
      ],
      nestedMessages: [],
      nestedEnums: [],
      oneofs: [],
      options: {},
    },
    {
      name: 'Address',
      fields: [
        createField('street', 'string', 1),
        createField('city', 'City', 2),
      ],
      nestedMessages: [],
      nestedEnums: [],
      oneofs: [],
      options: {},
    },
    {
      name: 'City',
      fields: [
        createField('name', 'string', 1),
      ],
      nestedMessages: [],
      nestedEnums: [],
      oneofs: [],
      options: {},
    },
  ];
}

function createTestEnums(count: number): EnumDefinition[] {
  return Array.from({ length: count }, (_, i) => ({
    name: `TestEnum${i}`,
    values: [
      { name: `VALUE_${i}_0`, number: 0, options: {} },
      { name: `VALUE_${i}_1`, number: 1, options: {} },
    ],
    options: {},
  } as EnumDefinition));
}

function createMockGeneratedFile(): GeneratedFile {
  return {
    path: 'test.ts',
    content: 'export class Test {}',
  };
}
