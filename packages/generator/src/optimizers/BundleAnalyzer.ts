/**
 * BundleAnalyzer - Analyzes generated code for bundle size optimization
 *
 * This class provides analysis and reporting on bundle size, helping
 * identify optimization opportunities.
 */

import { GeneratedFile } from '../core/types';
import { ProtoFile } from '../core/proto-types';

/**
 * Bundle analysis options
 */
export interface BundleAnalysisOptions {
  /**
   * Include detailed metrics per file
   */
  detailed?: boolean;

  /**
   * Generate size report
   */
  generateReport?: boolean;

  /**
   * Track dependencies
   */
  trackDependencies?: boolean;

  /**
   * Analyze tree-shaking potential
   */
  analyzeTreeShaking?: boolean;

  /**
   * Size threshold for warnings (in KB)
   */
  sizeWarningThreshold?: number;

  /**
   * Size threshold for errors (in KB)
   */
  sizeErrorThreshold?: number;
}

/**
 * Bundle metrics
 */
export interface BundleMetrics {
  /**
   * Total bundle size in bytes
   */
  totalSize: number;

  /**
   * Gzipped size in bytes
   */
  gzippedSize: number;

  /**
   * Brotli compressed size in bytes
   */
  brotliSize: number;

  /**
   * Number of files
   */
  fileCount: number;

  /**
   * Number of exports
   */
  exportCount: number;

  /**
   * Number of imports
   */
  importCount: number;

  /**
   * Tree-shakeable percentage
   */
  treeShakeablePercentage: number;

  /**
   * Detailed metrics per file
   */
  fileMetrics?: Map<string, FileMetrics>;

  /**
   * Dependency graph
   */
  dependencies?: DependencyGraph;

  /**
   * Optimization suggestions
   */
  suggestions: OptimizationSuggestion[];
}

/**
 * File-specific metrics
 */
export interface FileMetrics {
  /**
   * File path
   */
  path: string;

  /**
   * Raw size in bytes
   */
  size: number;

  /**
   * Gzipped size in bytes
   */
  gzippedSize: number;

  /**
   * Number of exports
   */
  exports: number;

  /**
   * Number of imports
   */
  imports: number;

  /**
   * Lines of code
   */
  lines: number;

  /**
   * Tree-shakeable exports
   */
  treeShakeableExports: string[];

  /**
   * Non-tree-shakeable code percentage
   */
  nonTreeShakeablePercentage: number;
}

/**
 * Dependency graph for bundle analysis
 */
export interface DependencyGraph {
  /**
   * File dependencies (file -> imported files)
   */
  fileDependencies: Map<string, Set<string>>;

  /**
   * External dependencies
   */
  externalDependencies: Set<string>;

  /**
   * Circular dependencies detected
   */
  circularDependencies: string[][];

  /**
   * Dependency depth
   */
  maxDepth: number;
}

/**
 * Optimization suggestion
 */
export interface OptimizationSuggestion {
  /**
   * Severity level
   */
  severity: 'info' | 'warning' | 'error';

  /**
   * Suggestion message
   */
  message: string;

  /**
   * Affected files
   */
  files?: string[];

  /**
   * Potential size savings in bytes
   */
  potentialSavings?: number;

  /**
   * Suggested action
   */
  action?: string;
}

/**
 * BundleAnalyzer class
 */
export class BundleAnalyzer {
  private options: Required<BundleAnalysisOptions>;

  constructor(options: BundleAnalysisOptions = {}) {
    this.options = {
      detailed: options.detailed ?? false,
      generateReport: options.generateReport ?? false,
      trackDependencies: options.trackDependencies ?? false,
      analyzeTreeShaking: options.analyzeTreeShaking ?? true,
      sizeWarningThreshold: options.sizeWarningThreshold ?? 100, // 100KB
      sizeErrorThreshold: options.sizeErrorThreshold ?? 500, // 500KB
    };
  }

  /**
   * Analyze bundle metrics
   */
  public analyzeBundle(files: GeneratedFile[], protoFile?: ProtoFile): BundleMetrics {
    const metrics: BundleMetrics = {
      totalSize: 0,
      gzippedSize: 0,
      brotliSize: 0,
      fileCount: files.length,
      exportCount: 0,
      importCount: 0,
      treeShakeablePercentage: 0,
      suggestions: [],
    };

    if (this.options.detailed) {
      metrics.fileMetrics = new Map();
    }

    if (this.options.trackDependencies) {
      metrics.dependencies = this.analyzeDependencies(files);
    }

    // Analyze each file
    files.forEach(file => {
      const fileMetric = this.analyzeFile(file);

      metrics.totalSize += fileMetric.size;
      metrics.gzippedSize += fileMetric.gzippedSize;
      metrics.exportCount += fileMetric.exports;
      metrics.importCount += fileMetric.imports;

      if (this.options.detailed && metrics.fileMetrics) {
        metrics.fileMetrics.set(file.path, fileMetric);
      }
    });

    // Calculate brotli size (roughly 15-20% better than gzip)
    metrics.brotliSize = Math.round(metrics.gzippedSize * 0.85);

    // Calculate tree-shakeable percentage
    if (this.options.analyzeTreeShaking) {
      metrics.treeShakeablePercentage = this.calculateTreeShakeablePercentage(files);
    }

    // Generate optimization suggestions
    metrics.suggestions = this.generateSuggestions(metrics, files, protoFile);

    return metrics;
  }

  /**
   * Analyze a single file
   */
  private analyzeFile(file: GeneratedFile): FileMetrics {
    const content = file.content;
    const lines = content.split('\n').length;

    // Count exports
    const exportMatches =
      content.match(/export\s+(?:class|function|const|interface|type|enum)/g) || [];
    const exports = exportMatches.length;

    // Count imports
    const importMatches = content.match(/^import\s+/gm) || [];
    const imports = importMatches.length;

    // Identify tree-shakeable exports
    const treeShakeableExports = this.identifyTreeShakeableExports(content);

    // Calculate non-tree-shakeable percentage
    const nonTreeShakeablePercentage = this.calculateNonTreeShakeablePercentage(content);

    return {
      path: file.path,
      size: content.length,
      gzippedSize: this.estimateGzippedSize(content),
      exports,
      imports,
      lines,
      treeShakeableExports,
      nonTreeShakeablePercentage,
    };
  }

  /**
   * Estimate gzipped size (rough approximation)
   */
  private estimateGzippedSize(content: string): number {
    // Simple estimation: gzip typically achieves 60-70% compression for code
    // More accurate would require actual compression
    const compressionRatio = 0.35; // 35% of original size
    return Math.round(content.length * compressionRatio);
  }

  /**
   * Identify tree-shakeable exports
   */
  private identifyTreeShakeableExports(content: string): string[] {
    const treeShakeable: string[] = [];

    // Pure functions and classes marked with pure comments
    const pureExports =
      content.match(/\/\*#__PURE__\*\/\s*export\s+(?:class|function)\s+(\w+)/g) || [];
    pureExports.forEach(match => {
      const name = match.match(/(?:class|function)\s+(\w+)/)?.[1];
      if (name) treeShakeable.push(name);
    });

    // Named exports (generally tree-shakeable)
    const namedExports = content.match(/export\s+(?:const|let|var)\s+(\w+)/g) || [];
    namedExports.forEach(match => {
      const name = match.match(/(?:const|let|var)\s+(\w+)/)?.[1];
      if (name) treeShakeable.push(name);
    });

    // Function exports
    const functionExports = content.match(/export\s+function\s+(\w+)/g) || [];
    functionExports.forEach(match => {
      const name = match.match(/function\s+(\w+)/)?.[1];
      if (name) treeShakeable.push(name);
    });

    return treeShakeable;
  }

  /**
   * Calculate non-tree-shakeable percentage
   */
  private calculateNonTreeShakeablePercentage(content: string): number {
    // Identify non-tree-shakeable patterns
    const nonTreeShakeablePatterns = [
      /export\s+default/, // Default exports
      /module\.exports/, // CommonJS exports
      /exports\.\w+/, // CommonJS named exports
      /globalThis\.\w+/, // Global assignments
      /window\.\w+/, // Window assignments
      /\beval\b/, // eval usage
      /new Function/, // Dynamic function creation
    ];

    let nonTreeShakeableLines = 0;
    const lines = content.split('\n');

    lines.forEach(line => {
      if (nonTreeShakeablePatterns.some(pattern => pattern.test(line))) {
        nonTreeShakeableLines++;
      }
    });

    return (nonTreeShakeableLines / lines.length) * 100;
  }

  /**
   * Calculate overall tree-shakeable percentage
   */
  private calculateTreeShakeablePercentage(files: GeneratedFile[]): number {
    let totalSize = 0;
    let treeShakeableSize = 0;

    files.forEach(file => {
      const content = file.content;
      totalSize += content.length;

      // Estimate tree-shakeable content
      const treeShakeableExports = this.identifyTreeShakeableExports(content);

      // Rough estimate: each tree-shakeable export represents some percentage of the file
      if (treeShakeableExports.length > 0) {
        const exportRegex = new RegExp(
          `export\\s+(?:class|function|const|let|var)\\s+(?:${treeShakeableExports.join('|')})\\b[^}]*}`,
          'gs',
        );

        const matches = content.match(exportRegex) || [];
        matches.forEach(match => {
          treeShakeableSize += match.length;
        });
      }
    });

    return totalSize > 0 ? (treeShakeableSize / totalSize) * 100 : 0;
  }

  /**
   * Analyze dependencies
   */
  private analyzeDependencies(files: GeneratedFile[]): DependencyGraph {
    const fileDependencies = new Map<string, Set<string>>();
    const externalDependencies = new Set<string>();

    files.forEach(file => {
      const deps = new Set<string>();

      // Extract imports
      const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
      let match;

      while ((match = importRegex.exec(file.content)) !== null) {
        const source = match[1];

        if (source.startsWith('.') || source.startsWith('/')) {
          // Internal dependency
          deps.add(source);
        } else {
          // External dependency
          externalDependencies.add(source);
        }
      }

      fileDependencies.set(file.path, deps);
    });

    // Detect circular dependencies
    const circularDependencies = this.detectCircularDependencies(fileDependencies);

    // Calculate max depth
    const maxDepth = this.calculateMaxDepth(fileDependencies);

    return {
      fileDependencies,
      externalDependencies,
      circularDependencies,
      maxDepth,
    };
  }

  /**
   * Detect circular dependencies
   */
  private detectCircularDependencies(dependencies: Map<string, Set<string>>): string[][] {
    const circular: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (file: string, path: string[]): void => {
      visited.add(file);
      recursionStack.add(file);
      path.push(file);

      const deps = dependencies.get(file);
      if (deps) {
        deps.forEach(dep => {
          if (!visited.has(dep)) {
            dfs(dep, [...path]);
          } else if (recursionStack.has(dep)) {
            // Circular dependency detected
            const cycleStart = path.indexOf(dep);
            circular.push(path.slice(cycleStart));
          }
        });
      }

      recursionStack.delete(file);
    };

    dependencies.forEach((_, file) => {
      if (!visited.has(file)) {
        dfs(file, []);
      }
    });

    return circular;
  }

  /**
   * Calculate maximum dependency depth
   */
  private calculateMaxDepth(dependencies: Map<string, Set<string>>): number {
    const depths = new Map<string, number>();

    const calculateDepth = (file: string): number => {
      if (depths.has(file)) {
        return depths.get(file)!;
      }

      const deps = dependencies.get(file);
      if (!deps || deps.size === 0) {
        depths.set(file, 0);
        return 0;
      }

      let maxChildDepth = 0;
      deps.forEach(dep => {
        maxChildDepth = Math.max(maxChildDepth, calculateDepth(dep));
      });

      const depth = maxChildDepth + 1;
      depths.set(file, depth);
      return depth;
    };

    let maxDepth = 0;
    dependencies.forEach((_, file) => {
      maxDepth = Math.max(maxDepth, calculateDepth(file));
    });

    return maxDepth;
  }

  /**
   * Generate optimization suggestions
   */
  private generateSuggestions(
    metrics: BundleMetrics,
    files: GeneratedFile[],
    protoFile?: ProtoFile,
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    // Check total bundle size
    const totalSizeKB = metrics.totalSize / 1024;
    if (totalSizeKB > this.options.sizeErrorThreshold) {
      suggestions.push({
        severity: 'error',
        message: `Bundle size (${totalSizeKB.toFixed(2)}KB) exceeds error threshold (${this.options.sizeErrorThreshold}KB)`,
        potentialSavings: metrics.totalSize - this.options.sizeErrorThreshold * 1024,
        action: 'Consider code splitting, lazy loading, or removing unused code',
      });
    } else if (totalSizeKB > this.options.sizeWarningThreshold) {
      suggestions.push({
        severity: 'warning',
        message: `Bundle size (${totalSizeKB.toFixed(2)}KB) exceeds warning threshold (${this.options.sizeWarningThreshold}KB)`,
        potentialSavings: metrics.totalSize - this.options.sizeWarningThreshold * 1024,
        action: 'Consider optimizing imports and removing unused exports',
      });
    }

    // Check tree-shaking potential
    if (metrics.treeShakeablePercentage < 70) {
      suggestions.push({
        severity: 'warning',
        message: `Low tree-shaking potential (${metrics.treeShakeablePercentage.toFixed(1)}%)`,
        action: 'Use ES modules and avoid side effects in module initialization',
      });
    }

    // Check for large files
    if (metrics.fileMetrics) {
      metrics.fileMetrics.forEach((fileMetric, path) => {
        const fileSizeKB = fileMetric.size / 1024;
        if (fileSizeKB > 50) {
          suggestions.push({
            severity: 'warning',
            message: `Large file detected: ${path} (${fileSizeKB.toFixed(2)}KB)`,
            files: [path],
            potentialSavings: fileMetric.size * 0.3, // Estimate 30% reduction possible
            action: 'Consider splitting this file or removing unused code',
          });
        }

        // Check for files with no tree-shakeable exports
        if (fileMetric.treeShakeableExports.length === 0 && fileMetric.exports > 0) {
          suggestions.push({
            severity: 'info',
            message: `No tree-shakeable exports in ${path}`,
            files: [path],
            action: 'Consider using named exports instead of default exports',
          });
        }
      });
    }

    // Check for circular dependencies
    if (metrics.dependencies && metrics.dependencies.circularDependencies.length > 0) {
      suggestions.push({
        severity: 'error',
        message: `Circular dependencies detected (${metrics.dependencies.circularDependencies.length} cycles)`,
        files: metrics.dependencies.circularDependencies.flat(),
        action: 'Refactor to remove circular dependencies',
      });
    }

    // Check dependency depth
    if (metrics.dependencies && metrics.dependencies.maxDepth > 5) {
      suggestions.push({
        severity: 'warning',
        message: `Deep dependency chain detected (depth: ${metrics.dependencies.maxDepth})`,
        action: 'Consider flattening the dependency structure',
      });
    }

    // Check for too many external dependencies
    if (metrics.dependencies && metrics.dependencies.externalDependencies.size > 10) {
      suggestions.push({
        severity: 'info',
        message: `Many external dependencies (${metrics.dependencies.externalDependencies.size})`,
        action: 'Review external dependencies and consider removing unused ones',
      });
    }

    // Suggest minification if not applied
    const hasMinification = files.some(f => !f.content.includes('\n'));
    if (!hasMinification && metrics.totalSize > 10240) {
      suggestions.push({
        severity: 'info',
        message: 'Consider enabling minification for production builds',
        potentialSavings: metrics.totalSize * 0.4, // Estimate 40% reduction
        action: 'Enable minification in optimization options',
      });
    }

    return suggestions;
  }

  /**
   * Generate bundle report
   */
  public generateReport(metrics: BundleMetrics): string {
    const lines: string[] = [];

    lines.push('=== Bundle Analysis Report ===\n');

    // Overall metrics
    lines.push('## Overall Metrics');
    lines.push(`- Total Size: ${this.formatSize(metrics.totalSize)}`);
    lines.push(`- Gzipped Size: ${this.formatSize(metrics.gzippedSize)}`);
    lines.push(`- Brotli Size: ${this.formatSize(metrics.brotliSize)}`);
    lines.push(`- File Count: ${metrics.fileCount}`);
    lines.push(`- Export Count: ${metrics.exportCount}`);
    lines.push(`- Import Count: ${metrics.importCount}`);
    lines.push(`- Tree-shakeable: ${metrics.treeShakeablePercentage.toFixed(1)}%`);
    lines.push('');

    // File breakdown
    if (metrics.fileMetrics && metrics.fileMetrics.size > 0) {
      lines.push('## File Breakdown');

      // Sort files by size
      const sortedFiles = Array.from(metrics.fileMetrics.entries()).sort(
        (a, b) => b[1].size - a[1].size,
      );

      sortedFiles.forEach(([path, fileMetric]) => {
        lines.push(`\n### ${path}`);
        lines.push(`- Size: ${this.formatSize(fileMetric.size)}`);
        lines.push(`- Gzipped: ${this.formatSize(fileMetric.gzippedSize)}`);
        lines.push(`- Lines: ${fileMetric.lines}`);
        lines.push(`- Exports: ${fileMetric.exports}`);
        lines.push(`- Imports: ${fileMetric.imports}`);
        lines.push(`- Tree-shakeable Exports: ${fileMetric.treeShakeableExports.length}`);
        lines.push(`- Non-tree-shakeable: ${fileMetric.nonTreeShakeablePercentage.toFixed(1)}%`);
      });
      lines.push('');
    }

    // Dependencies
    if (metrics.dependencies) {
      lines.push('## Dependencies');
      lines.push(`- External Dependencies: ${metrics.dependencies.externalDependencies.size}`);
      lines.push(`- Max Dependency Depth: ${metrics.dependencies.maxDepth}`);
      lines.push(`- Circular Dependencies: ${metrics.dependencies.circularDependencies.length}`);

      if (metrics.dependencies.circularDependencies.length > 0) {
        lines.push('\nCircular Dependency Chains:');
        metrics.dependencies.circularDependencies.forEach((chain, i) => {
          lines.push(`  ${i + 1}. ${chain.join(' -> ')}`);
        });
      }
      lines.push('');
    }

    // Optimization suggestions
    if (metrics.suggestions.length > 0) {
      lines.push('## Optimization Suggestions');

      const grouped = {
        error: metrics.suggestions.filter(s => s.severity === 'error'),
        warning: metrics.suggestions.filter(s => s.severity === 'warning'),
        info: metrics.suggestions.filter(s => s.severity === 'info'),
      };

      ['error', 'warning', 'info'].forEach(severity => {
        const items = grouped[severity as keyof typeof grouped];
        if (items.length > 0) {
          lines.push(`\n### ${severity.toUpperCase()}S`);
          items.forEach(suggestion => {
            lines.push(`- ${suggestion.message}`);
            if (suggestion.action) {
              lines.push(`  Action: ${suggestion.action}`);
            }
            if (suggestion.potentialSavings) {
              lines.push(`  Potential Savings: ${this.formatSize(suggestion.potentialSavings)}`);
            }
            if (suggestion.files) {
              lines.push(`  Files: ${suggestion.files.join(', ')}`);
            }
          });
        }
      });
    }

    return lines.join('\n');
  }

  /**
   * Format size for display
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
  }
}

/**
 * Create a bundle analyzer instance
 */
export function createBundleAnalyzer(options?: BundleAnalysisOptions): BundleAnalyzer {
  return new BundleAnalyzer(options);
}
