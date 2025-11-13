/**
 * ReactHookGenerator - Generates React hooks for gRPC services
 *
 * This class is responsible for generating type-safe React hooks that provide
 * data fetching capabilities for gRPC services. It supports both regular hooks
 * with loading/error states and Suspense-compatible hooks for React Suspense.
 */
import { ServiceDefinition, ProtoFile } from '../core/proto-types';
import { GeneratedFile } from '../core/types';
import { TypeMappingConfig } from '../utils/TypeMapper';
/**
 * React hook generation options
 */
export interface ReactHookGeneratorOptions {
    /**
     * Whether to generate regular hooks (with loading/error states)
     */
    generateRegularHooks?: boolean;
    /**
     * Whether to generate Suspense-compatible hooks
     */
    generateSuspenseHooks?: boolean;
    /**
     * Whether to include JSDoc comments
     */
    generateComments?: boolean;
    /**
     * Whether to include refetch functionality
     */
    includeRefetch?: boolean;
    /**
     * Whether to memoize requests
     */
    memoizeRequests?: boolean;
    /**
     * Custom template directory path
     */
    templateDir?: string;
    /**
     * Type mapping configuration
     */
    typeMapping?: TypeMappingConfig;
    /**
     * Base import path for service stubs
     */
    serviceImportPath?: string;
}
/**
 * ReactHookGenerator class for generating React hooks
 */
export declare class ReactHookGenerator {
    private templateEngine;
    private typeMapper;
    private importManager;
    private nameResolver;
    private options;
    constructor(options?: ReactHookGeneratorOptions);
    /**
     * Generate React hooks from service definition
     * @param service Service definition from proto file
     * @param protoFile Parent proto file for context
     * @returns Generated TypeScript file with React hooks
     */
    generateHooks(service: ServiceDefinition, protoFile: ProtoFile): GeneratedFile;
    /**
     * Generate hooks for all services in a proto file
     * @param protoFile Proto file containing services
     * @returns Array of generated files
     */
    generateAllHooks(protoFile: ProtoFile): Promise<GeneratedFile[]>;
    /**
     * Prepare template context for a single service
     */
    private prepareTemplateContext;
    /**
     * Prepare template context for entire proto file
     */
    private prepareFileTemplateContext;
    /**
     * Process a single method definition
     */
    private processMethod;
    /**
     * Resolve message type and add necessary imports
     */
    private resolveMessageType;
    /**
     * Build imports array from ImportManager
     */
    private buildImportsArray;
    /**
     * Render the hooks template
     */
    private renderHooksTemplate;
    /**
     * Generate file name for the hooks
     */
    private generateFileName;
    /**
     * Generate file name for proto file hooks
     */
    private generateFileNameForProto;
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
     * Load hooks template
     */
    private loadHooksTemplate;
    /**
     * Update generator options
     */
    updateOptions(options: Partial<ReactHookGeneratorOptions>): void;
    /**
     * Get current generator options
     */
    getOptions(): Readonly<Required<ReactHookGeneratorOptions>>;
}
export declare function createReactHookGenerator(options?: ReactHookGeneratorOptions): ReactHookGenerator;
//# sourceMappingURL=ReactHookGenerator.d.ts.map