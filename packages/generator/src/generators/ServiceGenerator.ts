/**
 * ServiceGenerator - Generates TypeScript service stub classes from Proto service definitions
 * 
 * This class is responsible for generating client-side service stubs that provide
 * type-safe methods for calling gRPC services. It supports Promise-based API for
 * unary RPC calls and can be extended for streaming support.
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
import { TypeMapper } from '../utils/TypeMapper';
import { ImportManager } from '../utils/ImportManager';
import { NameResolver } from '../utils/NameResolver';

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
}

/**
 * Service template context for rendering
 */
interface ServiceTemplateContext {
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
    }>;
  }>;
  includeReactHooks: boolean;
  includeSuspenseHooks: boolean;
  serverUrl: string;
}

/**
 * ServiceGenerator class for generating service stubs
 */
export class ServiceGenerator {
  private templateEngine: TemplateEngine;
  private typeMapper: TypeMapper;
  private importManager: ImportManager;
  private nameResolver: NameResolver;
  private options: Required<ServiceGeneratorOptions>;
  
  constructor(options: ServiceGeneratorOptions = {}) {
    this.options = {
      serverUrl: options.serverUrl || '',
      generateReactHooks: options.generateReactHooks ?? false,
      generateSuspenseHooks: options.generateSuspenseHooks ?? false,
      generateComments: options.generateComments ?? true,
      templateDir: options.templateDir || '',
      typeMapping: options.typeMapping || {},
    };
    
    // Initialize dependencies
    this.templateEngine = new TemplateEngine({
      cache: true,
      strict: false,
    });
    
    this.typeMapper = new TypeMapper(this.options.typeMapping);
    this.importManager = new ImportManager();
    this.nameResolver = new NameResolver();
    
    // Load default template initially (will be replaced on first use if file exists)
    this.loadDefaultTemplate();
  }
  
  /**
   * Generate service stub from service definition
   * @param service Service definition from proto file
   * @param protoFile Parent proto file for context
   * @returns Generated TypeScript file
   */
  public generateStub(
    service: ServiceDefinition, 
    protoFile: ProtoFile,
  ): GeneratedFile {
    try {
      // Validate service definition
      this.validateService(service);
      
      // Prepare template context
      const context = this.prepareTemplateContext(service, protoFile);
      
      // Render the template
      const content = this.renderServiceTemplate(context);
      
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
        `Failed to generate service stub for "${service.name}": ${error instanceof Error ? error.message : String(error)}`,
        GenerationErrorCode.INVALID_PROTO,
        error,
      );
    }
  }
  
  /**
   * Generate stubs for all services in a proto file
   * @param protoFile Proto file containing services
   * @returns Array of generated files
   */
  public async generateStubs(protoFile: ProtoFile): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];
    
    for (const service of protoFile.services) {
      const file = await this.generateStub(service, protoFile);
      files.push(file);
    }
    
    return files;
  }
  
  /**
   * Prepare template context for service generation
   */
  private prepareTemplateContext(
    service: ServiceDefinition, 
    protoFile: ProtoFile,
  ): ServiceTemplateContext {
    // Reset import manager for this service
    this.importManager.clear();
    
    // Add required imports
    this.importManager.addNamedImport('@improbable-eng/grpc-web', 'grpc');
    this.importManager.addNamedImport('google-protobuf', 'Message');
    
    // Process methods
    const methods = service.methods.map(method => this.processMethod(method, protoFile));
    
    // Prepare service context
    const serviceContext = {
      name: service.name,
      pascalName: this.nameResolver.resolveTypeName(service.name),
      description: this.generateDescription(service),
      methods,
    };
    
    // Prepare import list
    // Build import list from ImportManager's internal maps
    const imports: Array<{
      name?: string;
      imports?: string[];
      isDefault?: boolean;
      source: string;
    }> = [];
    
    // For now, manually add the imports we need
    imports.push({
      imports: ['grpc'],
      source: '@improbable-eng/grpc-web',
    });
    imports.push({
      imports: ['Message'],
      source: 'google-protobuf',
    });
    
    return {
      packageName: protoFile.package,
      imports,
      services: [serviceContext],
      includeReactHooks: this.options.generateReactHooks,
      includeSuspenseHooks: this.options.generateSuspenseHooks,
      serverUrl: this.options.serverUrl,
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
    // For pascalName in the template, we want to keep the original Pascal case (e.g., GetUser -> GetUser)
    const pascalName = method.name.charAt(0).toUpperCase() + method.name.slice(1);
    
    // Debug: log the name conversions
    // console.log(`Method ${method.name} -> camel: ${camelName}, pascal: ${pascalName}`);
    
    return {
      name: method.name,
      pascalName,
      camelName,
      inputType,
      outputType,
      clientStreaming: method.clientStreaming,
      serverStreaming: method.serverStreaming,
      description: this.generateMethodDescription(method),
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
      // Add import for local message if needed
      // For now, assume messages are in the same file
      return localMessage.name;
    }
    
    // Handle external messages (from imports)
    // This would need to be expanded for full import support
    return cleanTypeName.split('.').pop() || cleanTypeName;
  }
  
  /**
   * Render the service template
   */
  private renderServiceTemplate(context: ServiceTemplateContext): string {
    return this.templateEngine.render('service', context);
  }
  
  /**
   * Generate file name for the service
   */
  private generateFileName(service: ServiceDefinition, protoFile: ProtoFile): string {
    const baseName = protoFile.fileName.replace(/\.proto$/, '');
    return `${baseName}.service.ts`;
  }
  
  /**
   * Generate description comment for service
   */
  private generateDescription(service: ServiceDefinition): string | undefined {
    if (!this.options.generateComments) {
      return undefined;
    }
    
    // Extract description from options if available
    // For now, return a default description
    return `${service.name} service client`;
  }
  
  /**
   * Generate description comment for method
   */
  private generateMethodDescription(method: MethodDefinition): string | undefined {
    if (!this.options.generateComments) {
      return undefined;
    }
    
    let description = `RPC method ${method.name}`;
    
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
    
    // Validate each method
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
    });
  }
  
  /**
   * Load default service template
   */
  private loadDefaultTemplate(): void {
    // Default template for service stub generation - matches service.hbs
    const defaultTemplate = `/**
 * Generated gRPC service stubs
 * @generated
 */

{{#each imports}}
import {{#if isDefault}}{{name}}{{else}}{{{join imports ", "}}}{{/if}} from '{{source}}';
{{/each}}

{{#each services}}
/**
 * {{#if description}}{{description}}{{else}}{{pascalName}} service client{{/if}}
 * Generated gRPC service stub with Promise API
 */
export class {{pascalName}}Stub {
  private readonly client: any;
  
  constructor(private readonly baseUrl: string) {
    // Initialize gRPC-web client
    // TODO: Properly initialize with @improbable-eng/grpc-web
  }

  /**
   * Get the service base URL
   */
  public getBaseUrl(): string {
    return this.baseUrl;
  }

  {{#each methods}}
  /**
   * {{#if description}}{{description}}{{else}}{{camelName}} RPC method{{/if}}
   * @param request - {{inputType}} request message
   * @returns Promise<{{outputType}}> - Response message
   */
  public async {{camelName}}(request: {{inputType}}): Promise<{{outputType}}> {
    {{#if serverStreaming}}
    // Server streaming RPC
    throw new Error('Server streaming not yet implemented for {{camelName}}');
    {{else if clientStreaming}}
    // Client streaming RPC
    throw new Error('Client streaming not yet implemented for {{camelName}}');
    {{else}}
    // Unary RPC call
    return new Promise((resolve, reject) => {
      // TODO: Implement actual gRPC-web call
      // 1. Serialize request message
      // 2. Make gRPC-web call to baseUrl + service/method
      // 3. Deserialize response message
      // 4. Resolve with typed response
      
      // Placeholder implementation
      setTimeout(() => {
        reject(new Error('gRPC method {{../name}}.{{camelName}} not yet implemented'));
      }, 0);
    });
    {{/if}}
  }

  {{/each}}
}

{{#if ../includeReactHooks}}
/**
 * React Hook stub for {{pascalName}} service
 */
export class {{pascalName}}HookStub {
  constructor(private readonly baseUrl: string) {}
  
  {{#each methods}}
  /**
   * React Hook for {{camelName}} method
   * @param request - Request message
   * @returns Hook result with data, loading, and error states
   */
  use{{pascalName}}(request: {{inputType}}): {
    data?: {{outputType}};
    loading: boolean;
    error?: Error;
  } {
    // TODO: Implement React Hook using the Promise API
    throw new Error('React Hook not yet implemented');
  }
  
  {{/each}}
}
{{/if}}

{{#if ../includeSuspenseHooks}}
/**
 * Suspense Hook stub for {{pascalName}} service
 */
export class {{pascalName}}SuspenseStub {
  constructor(private readonly baseUrl: string) {}
  
  {{#each methods}}
  /**
   * Suspense Hook for {{camelName}} method
   * @param request - Request message
   * @returns Response data (throws promise during loading)
   */
  use{{pascalName}}(request: {{inputType}}): {{outputType}} {
    // TODO: Implement Suspense Hook using the Promise API
    throw new Error('Suspense Hook not yet implemented');
  }
  
  {{/each}}
}
{{/if}}

{{/each}}`;
    
    this.templateEngine.loadTemplateFromString('service', defaultTemplate);
  }
  
  /**
   * Update generator options
   */
  public updateOptions(options: Partial<ServiceGeneratorOptions>): void {
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
  public getOptions(): Readonly<Required<ServiceGeneratorOptions>> {
    return { ...this.options };
  }
}

/**
 * Factory function to create a ServiceGenerator instance
 */
export function createServiceGenerator(options?: ServiceGeneratorOptions): ServiceGenerator {
  return new ServiceGenerator(options);
}