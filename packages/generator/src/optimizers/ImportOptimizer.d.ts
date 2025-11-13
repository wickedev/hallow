/**
 * ImportOptimizer - Optimizes import statements for better tree-shaking
 *
 * This class analyzes and optimizes import statements to reduce bundle size
 * and improve tree-shaking effectiveness.
 */
/**
 * Import optimization options
 */
export interface ImportOptimizationOptions {
    /**
     * Use named imports instead of namespace imports
     */
    preferNamedImports?: boolean;
    /**
     * Combine imports from the same source
     */
    combineImports?: boolean;
    /**
     * Remove unused imports
     */
    removeUnused?: boolean;
    /**
     * Sort imports alphabetically
     */
    sortImports?: boolean;
    /**
     * Group imports by type (external, internal, etc.)
     */
    groupImports?: boolean;
    /**
     * Use dynamic imports for code splitting
     */
    useDynamicImports?: boolean;
    /**
     * Analyze usage to determine which imports are needed
     */
    analyzeUsage?: boolean;
    /**
     * Prefer tree-shakeable imports
     */
    treeShakeableImports?: boolean;
}
/**
 * Import usage analysis result
 */
export interface ImportUsageAnalysis {
    /**
     * Used named imports per source
     */
    usedImports: Map<string, Set<string>>;
    /**
     * Unused imports that can be removed
     */
    unusedImports: Map<string, Set<string>>;
    /**
     * Namespace imports that could be converted to named
     */
    namespaceImports: Map<string, string>;
    /**
     * Side-effect imports
     */
    sideEffectImports: Set<string>;
    /**
     * Potential dynamic import candidates
     */
    dynamicImportCandidates: Set<string>;
}
/**
 * ImportOptimizer class
 */
export declare class ImportOptimizer {
    private options;
    constructor(options?: ImportOptimizationOptions);
    /**
     * Optimize imports in code
     */
    optimizeImports(code: string): string;
    /**
     * Parse imports from code
     */
    private parseImports;
    /**
     * Analyze import usage in code
     */
    private analyzeImportUsage;
    /**
     * Check if an import is a candidate for dynamic import
     */
    private isDynamicImportCandidate;
    /**
     * Remove unused imports
     */
    private removeUnusedImports;
    /**
     * Convert namespace imports to named imports
     */
    private convertToNamedImports;
    /**
     * Combine imports from the same source
     */
    private combineImportsFromSameSource;
    /**
     * Make imports tree-shakeable
     */
    private makeTreeShakeable;
    /**
     * Generate import statements from import data
     */
    private generateImportStatements;
    /**
     * Group imports by type
     */
    private groupImportsByType;
    /**
     * Check if source is an external package
     */
    private isExternalPackage;
    /**
     * Generate a single import statement
     */
    private generateImportStatement;
    /**
     * Replace imports in code
     */
    private replaceImports;
    /**
     * Generate dynamic import wrapper
     */
    generateDynamicImport(source: string, names: string[]): string;
    /**
     * Convert static imports to dynamic imports for code splitting
     */
    convertToDynamicImports(code: string, candidates: Set<string>): string;
}
/**
 * Create an import optimizer instance
 */
export declare function createImportOptimizer(options?: ImportOptimizationOptions): ImportOptimizer;
//# sourceMappingURL=ImportOptimizer.d.ts.map