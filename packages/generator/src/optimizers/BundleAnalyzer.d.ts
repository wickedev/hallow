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
export declare class BundleAnalyzer {
    private options;
    constructor(options?: BundleAnalysisOptions);
    /**
     * Analyze bundle metrics
     */
    analyzeBundle(files: GeneratedFile[], protoFile?: ProtoFile): BundleMetrics;
    /**
     * Analyze a single file
     */
    private analyzeFile;
    /**
     * Estimate gzipped size (rough approximation)
     */
    private estimateGzippedSize;
    /**
     * Identify tree-shakeable exports
     */
    private identifyTreeShakeableExports;
    /**
     * Calculate non-tree-shakeable percentage
     */
    private calculateNonTreeShakeablePercentage;
    /**
     * Calculate overall tree-shakeable percentage
     */
    private calculateTreeShakeablePercentage;
    /**
     * Analyze dependencies
     */
    private analyzeDependencies;
    /**
     * Detect circular dependencies
     */
    private detectCircularDependencies;
    /**
     * Calculate maximum dependency depth
     */
    private calculateMaxDepth;
    /**
     * Generate optimization suggestions
     */
    private generateSuggestions;
    /**
     * Generate bundle report
     */
    generateReport(metrics: BundleMetrics): string;
    /**
     * Format size for display
     */
    private formatSize;
}
/**
 * Create a bundle analyzer instance
 */
export declare function createBundleAnalyzer(options?: BundleAnalysisOptions): BundleAnalyzer;
//# sourceMappingURL=BundleAnalyzer.d.ts.map