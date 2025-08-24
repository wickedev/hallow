/**
 * Performance optimization modules for code generation
 */

export {
  PerformanceMonitor,
  createPerformanceMonitor,
  MonitorPerformance,
  type PerformanceMetrics,
  type OperationMetrics,
  type FileGenerationMetrics,
  type TemplateProcessingMetrics,
  type TypeResolutionMetrics,
  type PerformanceThresholds,
} from './PerformanceMonitor';

export {
  MemoryEfficientGenerator,
  createMemoryEfficientGenerator,
  MemoryPool,
  type StreamingGenerationOptions,
  type ChunkMetadata,
} from './MemoryEfficientGenerator';

export {
  TemplateOptimizer,
  createTemplateOptimizer,
  type TemplateOptimizationOptions,
  type TemplateStats,
} from './TemplateOptimizer';

export {
  TypeResolutionCache,
  createTypeResolutionCache,
  type TypeResolutionOptions,
  type TypeResolutionStats,
} from './TypeResolutionCache';