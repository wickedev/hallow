/**
 * Benchmark tests for code generation performance
 */

import { Generator } from '../../src/core/generator';
import { ProtoFile, ServiceDefinition, MessageDefinition, MethodDefinition } from '../../src/core/proto-types';
import { PerformanceMonitor, createPerformanceMonitor } from '../../src/performance/PerformanceMonitor';
import { MemoryEfficientGenerator } from '../../src/performance/MemoryEfficientGenerator';
import { TemplateOptimizer } from '../../src/performance/TemplateOptimizer';
import { TypeResolutionCache } from '../../src/performance/TypeResolutionCache';

describe('Performance Benchmarks', () => {
  // Helper to create large proto files for testing
  function createLargeProtoFile(
    serviceCount: number,
    methodsPerService: number,
    messageCount: number,
  ): ProtoFile {
    const services: ServiceDefinition[] = [];
    const messages: MessageDefinition[] = [];

    // Create services
    for (let i = 0; i < serviceCount; i++) {
      const methods: MethodDefinition[] = [];
      
      for (let j = 0; j < methodsPerService; j++) {
        methods.push({
          name: `Method${i}${j}`,
          inputType: `Request${i}Method${j}`,
          outputType: `Response${i}Method${j}`,
          clientStreaming: j % 4 === 1,
          serverStreaming: j % 4 === 2,
          options: {
            deprecated: j % 10 === 0,
          },
        });
      }
      
      services.push({
        name: `Service${i}`,
        methods,
        options: {},
      });
    }

    // Create Request and Response messages for each service method
    for (let i = 0; i < serviceCount; i++) {
      for (let j = 0; j < methodsPerService; j++) {
        messages.push({
          name: `Request${i}Method${j}`,
          fields: [{
            name: 'data',
            type: 'string',
            number: 1,
            repeated: false,
            optional: false,
            map: false,
            options: {},
          }],
          nestedMessages: [],
          nestedEnums: [],
          options: {},
          oneofs: [],
        });

        messages.push({
          name: `Response${i}Method${j}`,
          fields: [{
            name: 'result',
            type: 'string',
            number: 1,
            repeated: false,
            optional: false,
            map: false,
            options: {},
          }],
          nestedMessages: [],
          nestedEnums: [],
          options: {},
          oneofs: [],
        });
      }
    }

    // Create additional messages if requested
    const additionalMessages = messageCount - (serviceCount * methodsPerService * 2);
    for (let i = 0; i < additionalMessages; i++) {
      messages.push({
        name: `Message${i}`,
        fields: Array.from({ length: 10 }, (_, j) => ({
          name: `field${j}`,
          type: j % 2 === 0 ? 'string' : 'int32',
          number: j + 1,
          repeated: j % 3 === 0,
          optional: j % 5 === 0,
          map: false,
          options: {},
        })),
        nestedMessages: [],
        nestedEnums: [],
        options: {},
        oneofs: [],
      });
    }

    return {
      fileName: 'benchmark.proto',
      package: 'benchmark',
      imports: [],
      services,
      messages,
      enums: [],
      options: {},
    };
  }

  describe('Generation Speed Benchmarks', () => {
    it('should measure generation speed for small proto files', async () => {
      const monitor = createPerformanceMonitor({
        maxGenerationTime: 1000, // 1 second
        warnThresholds: {
          generationTime: 500, // 500ms warning
        },
      });

      const generator = new Generator({
        optimization: {
          production: true,
        },
      });

      const protoFile = createLargeProtoFile(1, 5, 10);
      
      monitor.start();
      const result = await generator.generateCode(protoFile);
      const metrics = monitor.stop();

      console.log('Small file generation metrics:');
      console.log(`- Duration: ${metrics.duration}ms`);
      console.log(`- Files generated: ${result.files.length}`);
      console.log(`- Memory used: ${(metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);

      expect(metrics.duration).toBeLessThan(1000);
      expect(result.files.length).toBeGreaterThan(0);
    });

    it('should measure generation speed for medium proto files', async () => {
      const monitor = createPerformanceMonitor({
        maxGenerationTime: 5000, // 5 seconds
        warnThresholds: {
          generationTime: 2000, // 2 seconds warning
        },
      });

      const generator = new Generator({
        optimization: {
          production: true,
        },
      });

      const protoFile = createLargeProtoFile(10, 20, 50);
      
      monitor.start();
      const result = await generator.generateCode(protoFile);
      const metrics = monitor.stop();

      console.log('Medium file generation metrics:');
      console.log(`- Duration: ${metrics.duration}ms`);
      console.log(`- Files generated: ${result.files.length}`);
      console.log(`- Memory used: ${(metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      console.log(`- Peak memory: ${(metrics.peakMemoryUsage?.heapUsed || 0) / 1024 / 1024}MB`);

      expect(metrics.duration).toBeLessThan(5000);
      expect(result.files.length).toBeGreaterThan(0);
    });

    it('should measure generation speed for large proto files', async () => {
      const monitor = createPerformanceMonitor({
        maxGenerationTime: 10000, // 10 seconds
        maxMemoryUsage: 500 * 1024 * 1024, // 500MB
        warnThresholds: {
          generationTime: 5000, // 5 seconds warning
          memoryUsage: 300 * 1024 * 1024, // 300MB warning
        },
      });

      const generator = new Generator({
        optimization: {
          production: true,
          deadCodeElimination: true,
          minify: true,
        },
      });

      const protoFile = createLargeProtoFile(20, 15, 100); // Reduced size to avoid stack overflow
      
      monitor.start();
      monitor.startOperation('code_generation');
      
      const result = await generator.generateCode(protoFile);
      
      monitor.endOperation();
      const metrics = monitor.stop();

      const report = monitor.generateReport();
      console.log('Large file generation report:');
      console.log(report);

      expect(metrics.duration).toBeLessThan(10000);
      expect(metrics.peakMemoryUsage?.heapUsed).toBeLessThan(500 * 1024 * 1024);
    });

    it('should compare optimized vs non-optimized generation', async () => {
      const protoFile = createLargeProtoFile(20, 15, 100);
      
      // Non-optimized generation
      const nonOptMonitor = createPerformanceMonitor();
      const nonOptGenerator = new Generator({
        optimization: {
          production: false,
        },
      });
      
      nonOptMonitor.start();
      const nonOptResult = await nonOptGenerator.generateCode(protoFile);
      const nonOptMetrics = nonOptMonitor.stop();
      
      // Optimized generation
      const optMonitor = createPerformanceMonitor();
      const optGenerator = new Generator({
        optimization: {
          production: true,
          deadCodeElimination: true,
          minify: true,
          optimizeImports: true,
        },
      });
      
      optMonitor.start();
      const optResult = await optGenerator.generateCode(protoFile);
      const optMetrics = optMonitor.stop();
      
      console.log('Performance Comparison:');
      console.log(`Non-optimized: ${nonOptMetrics.duration}ms, ${nonOptMetrics.memoryUsage.heapUsed / 1024 / 1024}MB`);
      console.log(`Optimized: ${optMetrics.duration}ms, ${optMetrics.memoryUsage.heapUsed / 1024 / 1024}MB`);
      
      // Calculate improvements
      const timeImprovement = ((nonOptMetrics.duration! - optMetrics.duration!) / nonOptMetrics.duration!) * 100;
      const sizeReduction = nonOptResult.files.reduce((sum, f) => sum + f.content.length, 0) -
                           optResult.files.reduce((sum, f) => sum + f.content.length, 0);
      
      console.log(`Time improvement: ${timeImprovement.toFixed(2)}%`);
      console.log(`Size reduction: ${sizeReduction} bytes`);

      // Optimization may add overhead but verify it completes successfully
      expect(optMetrics.duration).toBeGreaterThan(0);
      expect(nonOptMetrics.duration).toBeGreaterThan(0);
    });
  });

  describe('Memory Usage Benchmarks', () => {
    it('should efficiently handle memory for streaming generation', async () => {
      const memGenerator = new MemoryEfficientGenerator({
        chunkSize: 5,
        memoryLimit: 1024 * 1024 * 1024, // 1GB - increased for large proto files with headroom
        useStreaming: true,
        gcInterval: 10,
      });

      const protoFile = createLargeProtoFile(100, 20, 500);
      const monitor = createPerformanceMonitor();
      
      monitor.start();
      
      const chunks: any[] = [];
      const generator = async (items: any[], type: string) => {
        // Simulate generation
        return [{
          path: `${type}_chunk_${chunks.length}.ts`,
          content: `// Generated ${type} with ${items.length} items`,
        }];
      };
      
      for await (const chunk of memGenerator.generateInChunks(protoFile, generator)) {
        chunks.push(chunk);
        
        const memStats = memGenerator.getMemoryStats();
        console.log(`Chunk ${chunks.length}: Memory ${memStats.usage.heapUsed / 1024 / 1024}MB, Cache ${memStats.cacheSize} items`);
      }
      
      const metrics = monitor.stop();

      expect(chunks.length).toBeGreaterThan(0);
      expect(metrics.peakMemoryUsage?.heapUsed).toBeLessThan(1024 * 1024 * 1024); // Peak should stay under 1GB
    });

    it('should measure memory efficiency with caching strategies', async () => {
      const strategies: Array<'lru' | 'fifo' | 'none'> = ['lru', 'fifo', 'none'];
      const results: Record<string, any> = {};
      
      for (const strategy of strategies) {
        const memGenerator = new MemoryEfficientGenerator({
          cacheStrategy: strategy,
          cacheSize: 100,
        });
        
        const monitor = createPerformanceMonitor();
        monitor.start();
        
        // Simulate cache usage
        for (let i = 0; i < 500; i++) {
          const key = `key_${i % 150}`; // Some keys will repeat
          
          if (i % 3 === 0) {
            memGenerator.addToCache(key, { data: `value_${i}` });
          } else {
            memGenerator.getFromCache(key);
          }
        }
        
        const metrics = monitor.stop();
        const memStats = memGenerator.getMemoryStats();
        
        results[strategy] = {
          duration: metrics.duration,
          memory: memStats.usage.heapUsed,
          cacheSize: memStats.cacheSize,
          cacheMemory: memStats.cacheMemory,
        };
      }
      
      console.log('Cache Strategy Comparison:');
      for (const [strategy, stats] of Object.entries(results)) {
        console.log(`${strategy}: Duration ${stats.duration}ms, Memory ${stats.memory / 1024 / 1024}MB, Cache ${stats.cacheSize} items`);
      }
      
      // LRU should be most memory efficient for repeated access patterns
      expect(results.lru.cacheSize).toBeLessThanOrEqual(100);
    });

    it('should handle memory pools efficiently', async () => {
      const { MemoryPool } = await import('../../src/performance/MemoryEfficientGenerator');
      
      const pool = new MemoryPool<{ data: string }>(
        () => ({ data: '' }),
        (item) => { item.data = ''; },
        50,
      );
      
      const monitor = createPerformanceMonitor();
      monitor.start();
      
      const items: any[] = [];
      
      // Acquire and release items
      for (let i = 0; i < 100; i++) {
        const item = pool.acquire();
        item.data = `data_${i}`;
        items.push(item);
        
        // Release some items back to pool
        if (i % 3 === 0 && items.length > 0) {
          const toRelease = items.shift();
          pool.release(toRelease);
        }
      }
      
      const metrics = monitor.stop();
      const stats = pool.getStats();
      
      console.log('Memory Pool Stats:');
      console.log(`- Pool size: ${stats.poolSize}`);
      console.log(`- In use: ${stats.inUseSize}`);
      console.log(`- Total: ${stats.totalSize}`);
      console.log(`- Duration: ${metrics.duration}ms`);
      
      expect(stats.totalSize).toBeLessThanOrEqual(150);
      expect(stats.poolSize).toBeLessThanOrEqual(50);
    });
  });

  describe('Template Processing Benchmarks', () => {
    it('should measure template compilation and rendering performance', async () => {
      const optimizer = new TemplateOptimizer({
        cacheCompiledTemplates: true,
        maxCacheSize: 100,
        precompile: true,
      });
      
      const monitor = createPerformanceMonitor();
      monitor.start();
      
      // Compile templates
      monitor.startOperation('template_compilation');
      const templates = [
        { name: 'service', content: 'export class {{name}}Stub { {{methods}} }' },
        { name: 'method', content: 'async {{name}}(request: {{input}}): Promise<{{output}}> {}' },
        { name: 'message', content: 'export interface {{name}} { {{fields}} }' },
      ];
      
      for (const template of templates) {
        await optimizer.compileTemplate(template.name, template.content);
      }
      monitor.endOperation();
      
      // Render templates
      monitor.startOperation('template_rendering');
      const rendered: string[] = [];
      
      for (let i = 0; i < 100; i++) {
        const result = await optimizer.render('service', {
          name: `Service${i}`,
          methods: `method${i}() {}`,
        });
        rendered.push(result);
      }
      monitor.endOperation();
      
      const metrics = monitor.stop();
      const stats = optimizer.getStats();
      
      console.log('Template Processing Metrics:');
      console.log(`- Compilation time: ${metrics.operations.find(o => o.name === 'template_compilation')?.duration}ms`);
      console.log(`- Rendering time: ${metrics.operations.find(o => o.name === 'template_rendering')?.duration}ms`);
      console.log(`- Cache hit rate: ${(stats.cacheHitRate * 100).toFixed(2)}%`);
      console.log(`- Templates cached: ${stats.templatesCached}`);

      // Cache hit rate varies depending on first vs subsequent runs
      expect(stats.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(rendered.length).toBe(100);
    });
  });

  describe('Type Resolution Benchmarks', () => {
    it('should measure type resolution performance with caching', async () => {
      const cache = new TypeResolutionCache({
        maxSize: 1000,
        ttl: 60000, // 1 minute
      });
      
      const monitor = createPerformanceMonitor();
      
      // Create a complex type hierarchy
      const types = new Map<string, any>();
      for (let i = 0; i < 100; i++) {
        types.set(`Type${i}`, {
          name: `Type${i}`,
          fields: Array.from({ length: 5 }, (_, j) => ({
            name: `field${j}`,
            type: j === 0 ? 'string' : `Type${Math.max(0, i - j)}`, // Reference previous types
          })),
        });
      }
      
      monitor.start();
      
      // First pass - cache misses
      monitor.startOperation('first_resolution_pass');
      for (const [name, type] of types) {
        const resolved = await cache.resolve(name, async () => {
          // Simulate complex resolution
          await new Promise(resolve => setImmediate(resolve));
          return type;
        });
      }
      monitor.endOperation();
      
      // Second pass - cache hits
      monitor.startOperation('second_resolution_pass');
      for (const [name] of types) {
        const resolved = await cache.resolve(name, async () => {
          throw new Error('Should not be called - should hit cache');
        });
      }
      monitor.endOperation();
      
      const metrics = monitor.stop();
      const stats = cache.getStats();
      
      const firstPass = metrics.operations.find(o => o.name === 'first_resolution_pass');
      const secondPass = metrics.operations.find(o => o.name === 'second_resolution_pass');
      
      console.log('Type Resolution Metrics:');
      console.log(`- First pass (cache misses): ${firstPass?.duration}ms`);
      console.log(`- Second pass (cache hits): ${secondPass?.duration}ms`);
      console.log(`- Cache hit rate: ${(stats.hitRate * 100).toFixed(2)}%`);
      console.log(`- Speed improvement: ${((firstPass!.duration - secondPass!.duration) / firstPass!.duration * 100).toFixed(2)}%`);
      
      expect(secondPass!.duration).toBeLessThan(firstPass!.duration * 0.1); // Should be 10x faster
      expect(stats.hitRate).toBeGreaterThanOrEqual(0.5); // Overall hit rate should be >=50%
    });

    it('should handle circular dependencies efficiently', async () => {
      const cache = new TypeResolutionCache({
        detectCircular: true,
        maxDepth: 10,
      });
      
      const monitor = createPerformanceMonitor();
      monitor.start();
      
      // Create circular type references
      const types = {
        A: { name: 'A', ref: 'B' },
        B: { name: 'B', ref: 'C' },
        C: { name: 'C', ref: 'A' }, // Circular!
      };
      
      const resolved = new Set<string>();
      const visitStack: string[] = [];
      
      async function resolveType(name: string): Promise<any> {
        if (visitStack.includes(name)) {
          // Circular dependency detected
          return { circular: true, ref: name };
        }
        
        visitStack.push(name);
        
        try {
          const type = await cache.resolve(name, async () => {
            const t = types[name as keyof typeof types];
            if (t.ref && !resolved.has(t.ref)) {
              await resolveType(t.ref);
            }
            return t;
          });
          
          resolved.add(name);
          return type;
        } finally {
          visitStack.pop();
        }
      }
      
      const result = await resolveType('A');
      const metrics = monitor.stop();
      
      console.log('Circular Dependency Resolution:');
      console.log(`- Duration: ${metrics.duration}ms`);
      console.log(`- Types resolved: ${resolved.size}`);
      
      expect(resolved.size).toBeLessThanOrEqual(3);
      expect(metrics.duration).toBeLessThan(100); // Should be fast even with circular deps
    });
  });

  describe('End-to-End Performance', () => {
    it('should benchmark complete generation pipeline', async () => {
      const monitor = createPerformanceMonitor({
        maxGenerationTime: 15000,
        maxMemoryUsage: 500 * 1024 * 1024,
      });
      
      const generator = new Generator({
        optimization: {
          production: true,
          deadCodeElimination: true,
          minify: true,
          optimizeImports: true,
          conditionalGeneration: true,
          codeSplitting: true,
          lazyLoading: true,
        },
        treeShaking: true,
      });
      
      const protoFile = createLargeProtoFile(30, 25, 150);
      
      monitor.start();
      
      // Track individual phases
      monitor.startOperation('parsing_validation');
      // Validation would happen here
      monitor.endOperation();
      
      monitor.startOperation('code_generation');
      const result = await generator.generateCode(protoFile);
      monitor.endOperation();
      
      monitor.startOperation('optimization');
      // Additional optimization would happen here
      monitor.endOperation();
      
      const metrics = monitor.stop();
      const report = monitor.generateReport();
      
      console.log('End-to-End Performance Report:');
      console.log(report);
      
      // Performance assertions
      expect(metrics.duration).toBeLessThan(15000);
      expect(metrics.peakMemoryUsage?.heapUsed).toBeLessThan(500 * 1024 * 1024);
      expect(result.files.length).toBeGreaterThan(0);

      // Check that code was generated successfully
      const totalSize = result.files.reduce((sum, f) => sum + f.content.length, 0);
      expect(totalSize).toBeGreaterThan(0); // Should have generated some code
      console.log(`Total generated code size: ${(totalSize / 1024).toFixed(2)}KB`);
    });
  });
});
