/**
 * ServiceGenerator - Generates TypeScript service stub classes from Proto service definitions
 *
 * This class is responsible for generating client-side service stubs that provide
 * type-safe methods for calling gRPC services. It supports Promise-based API for
 * unary RPC calls and can be extended for streaming support.
 */
import { ServiceDefinition, ProtoFile } from '../core/proto-types';
import { GeneratedFile } from '../core/types';
/**
 * Service generation options
 */
export interface ServiceGeneratorOptions {
    /**
     * Base URL for the gRPC server
     */
    serverUrl?: string;
    /**
     * Whether to generate React hooks
     */
    generateReactHooks?: boolean;
    /**
     * Whether to generate Suspense hooks
     */
    generateSuspenseHooks?: boolean;
    /**
     * Whether to include JSDoc comments
     */
    generateComments?: boolean;
    /**
     * Custom template directory path
     */
    templateDir?: string;
    /**
     * Type mapping configuration
     */
    typeMapping?: {
        strictNullChecks?: boolean;
        useBigInt?: boolean;
    };
    /**
     * Whether to include option metadata in generated code
     */
    includeOptionMetadata?: boolean;
    /**
     * Configuration for option processing
     */
    optionProcessing?: {
        includeStandard?: boolean;
        includeCustom?: boolean;
        excludeStandard?: string[];
        excludeCustom?: string[];
        processNestedObjects?: boolean;
    };
}
/**
 * ServiceGenerator class for generating service stubs
 */
export declare class ServiceGenerator {
    private templateEngine;
    private typeMapper;
    private importManager;
    private nameResolver;
    private optionProcessor;
    private options;
    constructor(options?: ServiceGeneratorOptions);
    /**
     * Generate service stub from service definition
     * @param service Service definition from proto file
     * @param protoFile Parent proto file for context
     * @returns Generated TypeScript file
     */
    generateStub(service: ServiceDefinition, protoFile: ProtoFile): GeneratedFile;
    /**
     * Generate stubs for all services in a proto file
     * @param protoFile Proto file containing services
     * @returns Array of generated files
     */
    generateStubs(protoFile: ProtoFile): Promise<GeneratedFile[]>;
    /**
     * Prepare template context for service generation
     */
    private prepareTemplateContext;
    /**
     * Process a single method definition
     */
    private processMethod;
    /**
     * Resolve message type and add necessary imports
     */
    private resolveMessageType;
    /**
     * Render the service template
     */
    private renderServiceTemplate;
    /**
     * Generate file name for the service
     */
    private generateFileName;
    /**
     * Generate description comment for service
     */
    private generateDescription;
    /**
     * Generate description comment for method
     */
    private generateMethodDescription;
    /**
     * Validate service definition
     */
    private validateService;
    /**
     * Load default service template
     * Templates will be loaded from .hbs files by the TemplateEngine when templateDir is provided to Generator constructor
     */
    private loadDefaultTemplate;
    /**
     * Load fallback template as a last resort
     */
    private loadFallbackTemplate;
    /**
     * Update generator options
     */
    updateOptions(options: Partial<ServiceGeneratorOptions>): void;
    /**
     * Get current generator options
     */
    getOptions(): Readonly<Required<ServiceGeneratorOptions>>;
}
/**
 * Factory function to create a ServiceGenerator instance
 */
export declare function createServiceGenerator(options?: ServiceGeneratorOptions): ServiceGenerator;
//# sourceMappingURL=ServiceGenerator.d.ts.map