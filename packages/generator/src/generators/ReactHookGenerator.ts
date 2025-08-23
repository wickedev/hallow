/**
 * ReactHookGenerator - Generates React hooks for gRPC services
 * 
 * This class is responsible for generating type-safe React hooks that provide
 * data fetching capabilities for gRPC services. It supports both regular hooks
 * with loading/error states and Suspense-compatible hooks for React Suspense.
 */

import { 
  ServiceDefinition, 
  MethodDefinition, 
  ProtoFile, 
} from '../core/proto-types';
import { 
  GeneratedFile, 
  GenerationError, 
  GenerationErrorCode, 
} from '../core/types';
import { TemplateEngine } from '../core/template-engine';
import { TypeMapper, TypeMappingConfig } from '../utils/TypeMapper';
import { ImportManager } from '../utils/ImportManager';
import { NameResolver } from '../utils/NameResolver';

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
 * Hook template context for rendering
 */
interface HookTemplateContext {
  packageName?: string;
  imports: Array<{
    name?: string;
    imports?: string[];
    isDefault?: boolean;
    source: string;
  }>;
  services: Array<{
    name: string;
    pascalName: string;
    stubClassName: string;
    description?: string;
    methods: Array<{
      name: string;
      pascalName: string;
      camelName: string;
      inputType: string;
      outputType: string;
      clientStreaming: boolean;
      serverStreaming: boolean;
      description?: string;
      hookName: string;
      suspenseHookName: string;
    }>;
  }>;
  generateRegularHooks: boolean;
  generateSuspenseHooks: boolean;
  includeRefetch: boolean;
  memoizeRequests: boolean;
}

/**
 * ReactHookGenerator class for generating React hooks
 */
export class ReactHookGenerator {
  private templateEngine: TemplateEngine;
  private typeMapper: TypeMapper;
  private importManager: ImportManager;
  private nameResolver: NameResolver;
  private options: Required<ReactHookGeneratorOptions>;
  
  constructor(options: ReactHookGeneratorOptions = {}) {
    this.options = {
      generateRegularHooks: options.generateRegularHooks ?? true,
      generateSuspenseHooks: options.generateSuspenseHooks ?? true,
      generateComments: options.generateComments ?? true,
      includeRefetch: options.includeRefetch ?? true,
      memoizeRequests: options.memoizeRequests ?? false,
      templateDir: options.templateDir || '',
      typeMapping: options.typeMapping || {},
      serviceImportPath: options.serviceImportPath || './service',
    };
    
    // Initialize dependencies
    this.templateEngine = new TemplateEngine({
      cache: true,
      strict: false,
    });
    
    this.typeMapper = new TypeMapper(this.options.typeMapping);
    this.importManager = new ImportManager();
    this.nameResolver = new NameResolver();
    
    // Load template (use existing hooks.hbs or default)
    this.loadHooksTemplate();
  }
  
  /**
   * Generate React hooks from service definition
   * @param service Service definition from proto file
   * @param protoFile Parent proto file for context
   * @returns Generated TypeScript file with React hooks
   */
  public generateHooks(
    service: ServiceDefinition, 
    protoFile: ProtoFile,
  ): GeneratedFile {
    try {
      // Validate service definition
      this.validateService(service);
      
      // Check if any hooks should be generated
      if (!this.options.generateRegularHooks && !this.options.generateSuspenseHooks) {
        throw new GenerationError(
          'At least one hook type must be enabled (regular or suspense)',
          GenerationErrorCode.INVALID_OPTIONS,
        );
      }
      
      // Prepare template context
      const context = this.prepareTemplateContext(service, protoFile);
      
      // Render the template
      const content = this.renderHooksTemplate(context);
      
      // Generate file metadata
      const fileName = this.generateFileName(service, protoFile);
      
      return {
        path: fileName,
        content,
        sourceMap: undefined, // Source maps can be added later
      };
    } catch (error) {
      if (error instanceof GenerationError) {
        throw error;
      }
      throw new GenerationError(
        `Failed to generate React hooks for service "${service.name}": ${error instanceof Error ? error.message : String(error)}`,
        GenerationErrorCode.TEMPLATE_PARSE_ERROR,
        error,
      );
    }
  }
  
  /**
   * Generate hooks for all services in a proto file
   * @param protoFile Proto file containing services
   * @returns Array of generated files
   */
  public async generateAllHooks(protoFile: ProtoFile): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    
    // Only generate if there are services and hooks are enabled
    if (protoFile.services.length === 0) {
      return files;
    }
    
    if (!this.options.generateRegularHooks && !this.options.generateSuspenseHooks) {
      return files;
    }
    
    // Generate a single hooks file for all services
    const context = this.prepareFileTemplateContext(protoFile);
    const content = this.renderHooksTemplate(context);
    const fileName = this.generateFileNameForProto(protoFile);
    
    files.push({
      path: fileName,
      content,
      sourceMap: undefined,
    });
    
    return files;
  }
  
  /**
   * Prepare template context for a single service
   */
  private prepareTemplateContext(
    service: ServiceDefinition, 
    protoFile: ProtoFile,
  ): HookTemplateContext {
    // Reset import manager for this service
    this.importManager.clear();
    
    // Add required React imports
    if (this.options.generateRegularHooks) {
      this.importManager.addNamedImports('react', ['useState', 'useEffect', 'useCallback']);
    }
    if (this.options.generateSuspenseHooks) {
      this.importManager.addNamedImports('react', ['useState', 'use']);
    }
    
    // Add service stub import
    const serviceStubName = `${this.nameResolver.resolveTypeName(service.name)}Stub`;
    this.importManager.addNamedImport(this.options.serviceImportPath, serviceStubName);
    
    // Process methods
    const methods = service.methods.map(method => this.processMethod(method, protoFile));
    
    // Prepare service context
    const serviceContext = {
      name: service.name,
      pascalName: this.nameResolver.resolveTypeName(service.name),
      stubClassName: serviceStubName,
      description: this.generateDescription(service),
      methods,
    };
    
    // Build imports array
    const imports = this.buildImportsArray();
    
    return {
      packageName: protoFile.package,
      imports,
      services: [serviceContext],
      generateRegularHooks: this.options.generateRegularHooks,
      generateSuspenseHooks: this.options.generateSuspenseHooks,
      includeRefetch: this.options.includeRefetch,
      memoizeRequests: this.options.memoizeRequests,
    };
  }
  
  /**
   * Prepare template context for entire proto file
   */
  private prepareFileTemplateContext(protoFile: ProtoFile): HookTemplateContext {
    // Reset import manager
    this.importManager.clear();
    
    // Add required React imports
    if (this.options.generateRegularHooks) {
      this.importManager.addNamedImports('react', ['useState', 'useEffect', 'useCallback']);
    }
    if (this.options.generateSuspenseHooks) {
      this.importManager.addNamedImports('react', ['useState']);
    }
    
    // Process all services
    const services = protoFile.services.map(service => {
      const serviceStubName = `${this.nameResolver.resolveTypeName(service.name)}Stub`;
      
      // Add service stub import
      this.importManager.addNamedImport(this.options.serviceImportPath, serviceStubName);
      
      // Process methods
      const methods = service.methods.map(method => this.processMethod(method, protoFile));
      
      return {
        name: service.name,
        pascalName: this.nameResolver.resolveTypeName(service.name),
        stubClassName: serviceStubName,
        description: this.generateDescription(service),
        methods,
      };
    });
    
    // Build imports array
    const imports = this.buildImportsArray();
    
    return {
      packageName: protoFile.package,
      imports,
      services,
      generateRegularHooks: this.options.generateRegularHooks,
      generateSuspenseHooks: this.options.generateSuspenseHooks,
      includeRefetch: this.options.includeRefetch,
      memoizeRequests: this.options.memoizeRequests,
    };
  }
  
  /**
   * Process a single method definition
   */
  private processMethod(method: MethodDefinition, protoFile: ProtoFile): any {
    // Resolve input and output types
    const inputType = this.resolveMessageType(method.inputType, protoFile);
    const outputType = this.resolveMessageType(method.outputType, protoFile);
    
    const camelName = this.nameResolver.resolveMethodName(method.name);
    const pascalName = method.name.charAt(0).toUpperCase() + method.name.slice(1);
    
    // Generate hook names
    const hookName = `use${pascalName}`;
    const suspenseHookName = `useSuspense${pascalName}`;
    
    return {
      name: method.name,
      pascalName,
      camelName,
      inputType,
      outputType,
      clientStreaming: method.clientStreaming,
      serverStreaming: method.serverStreaming,
      description: this.generateMethodDescription(method),
      hookName,
      suspenseHookName,
    };
  }
  
  /**
   * Resolve message type and add necessary imports
   */
  private resolveMessageType(typeName: string, protoFile: ProtoFile): string {
    // Remove leading dot if present
    const cleanTypeName = typeName.startsWith('.') ? typeName.slice(1) : typeName;
    
    // Check if it's a message from the same file
    const localMessage = protoFile.messages.find(msg => 
      msg.name === cleanTypeName || 
      (protoFile.package && `${protoFile.package}.${msg.name}` === cleanTypeName),
    );
    
    if (localMessage) {
      // For now, assume messages are imported from a separate messages file
      this.importManager.addNamedImport('./messages', localMessage.name);
      return localMessage.name;
    }
    
    // Handle external messages (from imports)
    // This would need to be expanded for full import support
    return cleanTypeName.split('.').pop() || cleanTypeName;
  }
  
  /**
   * Build imports array from ImportManager
   */
  private buildImportsArray(): Array<{
    name?: string;
    imports?: string[];
    isDefault?: boolean;
    source: string;
  }> {
    const imports: Array<{
      name?: string;
      imports?: string[];
      isDefault?: boolean;
      source: string;
    }> = [];
    
    // Get all imports from ImportManager
    // Note: ImportManager's internal structure is not exposed, so we'll build manually
    // This would need to be enhanced to work with actual ImportManager API
    
    // React imports
    const reactImports: string[] = [];
    if (this.options.generateRegularHooks) {
      reactImports.push('useState', 'useEffect');
      if (this.options.includeRefetch) {
        reactImports.push('useCallback');
      }
    }
    if (this.options.generateSuspenseHooks && !reactImports.includes('useState')) {
      reactImports.push('useState');
    }
    
    if (reactImports.length > 0) {
      imports.push({
        imports: reactImports,
        source: 'react',
      });
    }
    
    // Service stub imports would be added dynamically based on the actual imports
    // For now, return the basic structure
    return imports;
  }
  
  /**
   * Render the hooks template
   */
  private renderHooksTemplate(context: HookTemplateContext): string {
    return this.templateEngine.render('hooks', context);
  }
  
  /**
   * Generate file name for the hooks
   */
  private generateFileName(service: ServiceDefinition, protoFile: ProtoFile): string {
    const baseName = protoFile.fileName.replace(/\.proto$/, '');
    return `${baseName}.hooks.ts`;
  }
  
  /**
   * Generate file name for proto file hooks
   */
  private generateFileNameForProto(protoFile: ProtoFile): string {
    const baseName = protoFile.fileName.replace(/\.proto$/, '');
    return `${baseName}.hooks.ts`;
  }
  
  /**
   * Generate description comment for service
   */
  private generateDescription(service: ServiceDefinition): string | undefined {
    if (!this.options.generateComments) {
      return undefined;
    }
    
    return `React hooks for ${service.name} service`;
  }
  
  /**
   * Generate description comment for method
   */
  private generateMethodDescription(method: MethodDefinition): string | undefined {
    if (!this.options.generateComments) {
      return undefined;
    }
    
    let description = `React hook for ${method.name} RPC method`;
    
    if (method.clientStreaming && method.serverStreaming) {
      description += ' (bidirectional streaming)';
    } else if (method.clientStreaming) {
      description += ' (client streaming)';
    } else if (method.serverStreaming) {
      description += ' (server streaming)';
    } else {
      description += ' (unary)';
    }
    
    return description;
  }
  
  /**
   * Validate service definition
   */
  private validateService(service: ServiceDefinition): void {
    if (!service.name) {
      throw new GenerationError(
        'Service name is required',
        GenerationErrorCode.INVALID_PROTO,
      );
    }
    
    if (!service.methods || service.methods.length === 0) {
      throw new GenerationError(
        `Service "${service.name}" has no methods`,
        GenerationErrorCode.INVALID_PROTO,
      );
    }
    
    // Validate each method for hook generation
    service.methods.forEach(method => {
      if (!method.name) {
        throw new GenerationError(
          `Method in service "${service.name}" has no name`,
          GenerationErrorCode.INVALID_PROTO,
        );
      }
      
      if (!method.inputType) {
        throw new GenerationError(
          `Method "${method.name}" in service "${service.name}" has no input type`,
          GenerationErrorCode.INVALID_PROTO,
        );
      }
      
      if (!method.outputType) {
        throw new GenerationError(
          `Method "${method.name}" in service "${service.name}" has no output type`,
          GenerationErrorCode.INVALID_PROTO,
        );
      }
      
      // Warn about streaming methods (not yet fully supported in hooks)
      if (method.clientStreaming || method.serverStreaming) {
        console.warn(
          `Warning: Streaming method "${method.name}" in service "${service.name}" ` +
          `may not be fully supported in React hooks yet`,
        );
      }
    });
  }
  
  /**
   * Load hooks template
   */
  private loadHooksTemplate(): void {
    // Try to load from file system first, then use default
    // For now, we'll use the template that already exists in hooks.hbs
    // The TemplateEngine will handle loading from the file system
    
    // If template file doesn't exist, use this default
    const defaultTemplate = `{{!-- Generated React hooks for gRPC services --}}
import { useState, useEffect{{#if includeRefetch}}, useCallback{{/if}} } from 'react';

{{#each imports}}
import {{#if isDefault}}{{name}}{{else}}{{{join imports ", "}}}{{/if}} from '{{source}}';
{{/each}}

{{#each services}}
{{#if ../generateRegularHooks}}
/**
 * React hooks for {{pascalName}} service
 * {{#if description}}{{description}}{{/if}}
 */
export class {{pascalName}}Hooks {
  constructor(private readonly stub: {{stubClassName}}) {}

  {{#each methods}}
  /**
   * {{#if description}}{{description}}{{else}}Hook for {{name}} method{{/if}}
   * @param request - {{inputType}} request message
   * @returns Hook result with data, loading, and error states
   */
  public {{hookName}}(request: {{inputType}}): {
    data?: {{outputType}};
    loading: boolean;
    error?: Error;
    {{#if ../../includeRefetch}}refetch: () => void;{{/if}}
  } {
    const [data, setData] = useState<{{outputType}} | undefined>(undefined);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | undefined>(undefined);

    {{#if ../../includeRefetch}}
    const fetchData = useCallback(async () => {
      try {
        setLoading(true);
        setError(undefined);
        const result = await this.stub.{{camelName}}(request);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    }, [JSON.stringify(request)]);
    {{else}}
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(undefined);
        const result = await this.stub.{{camelName}}(request);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };
    {{/if}}

    useEffect(() => {
      fetchData();
    }, [{{#if ../../memoizeRequests}}JSON.stringify(request){{else}}request{{/if}}]);

    return {
      data,
      loading,
      error,
      {{#if ../../includeRefetch}}refetch: fetchData,{{/if}}
    };
  }

  {{/each}}
}
{{/if}}

{{#if ../generateSuspenseHooks}}
/**
 * Suspense-compatible hooks for {{pascalName}} service
 * {{#if description}}{{description}}{{/if}}
 */
export class {{pascalName}}SuspenseHooks {
  constructor(private readonly stub: {{stubClassName}}) {}

  {{#each methods}}
  /**
   * Suspense hook for {{name}} method
   * {{#if description}}{{description}}{{/if}}
   * @param request - {{inputType}} request message
   * @returns {{outputType}} - Response data (throws promise while loading)
   */
  public {{suspenseHookName}}(request: {{inputType}}): {{outputType}} {
    const [data, setData] = useState<{{outputType}} | undefined>(undefined);
    const [error, setError] = useState<Error | undefined>(undefined);
    const [promise, setPromise] = useState<Promise<{{outputType}}> | undefined>(undefined);

    if (error) {
      throw error;
    }

    if (!data && !promise) {
      const newPromise = this.stub.{{camelName}}(request)
        .then(result => {
          setData(result);
          return result;
        })
        .catch(err => {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          throw error;
        });
      
      setPromise(newPromise);
      throw newPromise;
    }

    if (!data && promise) {
      throw promise;
    }

    return data!;
  }

  {{/each}}
}
{{/if}}

{{#if ../generateRegularHooks}}
/**
 * Create React hooks instance for {{pascalName}} service
 * @param baseUrl - Base URL for the gRPC service
 * @returns Hooks instance
 */
export function create{{pascalName}}Hooks(baseUrl: string): {{pascalName}}Hooks {
  const stub = new {{stubClassName}}(baseUrl);
  return new {{pascalName}}Hooks(stub);
}
{{/if}}

{{#if ../generateSuspenseHooks}}
/**
 * Create Suspense hooks instance for {{pascalName}} service
 * @param baseUrl - Base URL for the gRPC service
 * @returns Suspense hooks instance
 */
export function create{{pascalName}}SuspenseHooks(baseUrl: string): {{pascalName}}SuspenseHooks {
  const stub = new {{stubClassName}}(baseUrl);
  return new {{pascalName}}SuspenseHooks(stub);
}
{{/if}}

{{/each}}`;
    
    // Load the template into the engine
    this.templateEngine.loadTemplateFromString('hooks', defaultTemplate);
  }
  
  /**
   * Update generator options
   */
  public updateOptions(options: Partial<ReactHookGeneratorOptions>): void {
    this.options = {
      ...this.options,
      ...options,
    };
    
    // Update type mapper if type mapping config changed
    if (options.typeMapping) {
      this.typeMapper = new TypeMapper({
        ...this.options.typeMapping,
        ...options.typeMapping,
      });
    }
  }
  
  /**
   * Get current generator options
   */
  public getOptions(): Readonly<Required<ReactHookGeneratorOptions>> {
    return { ...this.options };
  }
}

/**
 * Factory function to create a ReactHookGenerator instance
 */
export function createReactHookGenerator(options?: ReactHookGeneratorOptions): ReactHookGenerator {
  return new ReactHookGenerator(options);
}