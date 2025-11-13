import { GeneratorOptions, GeneratedCode } from './types';
import { ProtoFile } from './proto-types';
/**
 * Main code generator class
 */
export declare class Generator {
    private options;
    private serviceGenerator;
    private messageGenerator;
    private enumGenerator;
    private templateEngine;
    private codeOptimizer?;
    private bundleAnalyzer?;
    private performanceMonitor?;
    private memoryEfficientGenerator?;
    private templateOptimizer?;
    private typeResolutionCache?;
    private version;
    private validator;
    constructor(options?: GeneratorOptions);
    /**
     * Generate code from parsed proto file
     * @param protoFile Parsed proto file AST
     * @returns Generated code result
     */
    generateCode(protoFile: ProtoFile): Promise<GeneratedCode>;
    /**
     * Optimize generated files
     */
    private optimizeFiles;
    /**
     * Generate lazy loading index file
     */
    private generateLazyLoadingIndex;
    /**
     * Check if optimization should be enabled
     */
    private shouldEnableOptimization;
    /**
     * Convert usage tracking options
     */
    private convertUsageTracking;
    /**
     * Validate proto file before generation
     * @param protoFile Proto file to validate
     */
    private validateProtoFile;
    /**
     * Get current generator options
     */
    getOptions(): Readonly<Required<GeneratorOptions>>;
    /**
     * Update generator options
     * @param options Partial options to update
     */
    updateOptions(options: Partial<GeneratorOptions>): void;
}
//# sourceMappingURL=generator.d.ts.map