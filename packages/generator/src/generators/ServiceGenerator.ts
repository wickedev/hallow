/**
 * ServiceGenerator - Generates TypeScript service stub classes from Proto service definitions
 *
 * This class is responsible for generating client-side service stubs that provide
 * type-safe methods for calling gRPC services. It supports Promise-based API for
 * unary RPC calls and can be extended for streaming support.
 */

import { ServiceDefinition, MethodDefinition, ProtoFile } from '../core/proto-types';
import { GeneratedFile, GenerationError, GenerationErrorCode } from '../core/types';
import { TemplateEngine } from '../core/template-engine';
import { TypeMapper } from '../utils/TypeMapper';
import { ImportManager } from '../utils/ImportManager';
import { NameResolver } from '../utils/NameResolver';
import { OptionProcessor, TemplateOptionMetadata } from '../utils/OptionProcessor';

/**
 * Processed method data for template rendering
 */
interface ProcessedServiceMethod {
  name: string;
  pascalName: string;
  camelName: string;
  inputType: string;
  outputType: string;
  clientStreaming: boolean;
  serverStreaming: boolean;
  description: string;
  options?: TemplateOptionMetadata;
}

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
    options?: TemplateOptionMetadata;
    methods: Array<{
      name: string;
      pascalName: string;
      camelName: string;
      inputType: string;
      outputType: string;
      clientStreaming: boolean;
      serverStreaming: boolean;
      description?: string;
      options?: TemplateOptionMetadata;
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
  private optionProcessor: OptionProcessor;
  private options: Required<ServiceGeneratorOptions>;

  constructor(options: ServiceGeneratorOptions = {}) {
    this.options = {
      serverUrl: options.serverUrl || '',
      generateReactHooks: options.generateReactHooks ?? false,
      generateSuspenseHooks: options.generateSuspenseHooks ?? false,
      generateComments: options.generateComments ?? true,
      templateDir: options.templateDir || '',
      typeMapping: options.typeMapping || {},
      includeOptionMetadata: options.includeOptionMetadata ?? false,
      optionProcessing: options.optionProcessing || {},
    };

    // Initialize dependencies
    this.templateEngine = new TemplateEngine({
      cache: true,
      strict: false,
    });

    this.typeMapper = new TypeMapper(this.options.typeMapping);
    this.importManager = new ImportManager();
    this.nameResolver = new NameResolver();
    this.optionProcessor = new OptionProcessor(this.options.optionProcessing);

    // Load templates from directory if templateDir is provided
    if (this.options.templateDir) {
      // Templates will be loaded asynchronously - ensure they're loaded before first use
      this.loadDefaultTemplate();
    } else {
      // Load from default location
      this.loadDefaultTemplate();
    }
  }

  /**
   * Generate service stub from service definition
   * @param service Service definition from proto file
   * @param protoFile Parent proto file for context
   * @returns Generated TypeScript file
   */
  public generateStub(service: ServiceDefinition, protoFile: ProtoFile): GeneratedFile {
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
  public generateStubs(protoFile: ProtoFile): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    for (const service of protoFile.services) {
      const file = this.generateStub(service, protoFile);
      files.push(file);
    }

    return Promise.resolve(files);
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

    // Check if we have any streaming methods
    const hasStreaming = methods.some(m => m.clientStreaming || m.serverStreaming);

    // Process service-level options if enabled
    let serviceOptions: TemplateOptionMetadata | undefined;
    if (this.options.includeOptionMetadata && service.options) {
      const optionMetadata = this.optionProcessor.processOptions(service.options);
      serviceOptions = this.optionProcessor.generateTemplateMetadata(optionMetadata);
    }

    // Prepare service context
    const serviceContext = {
      name: service.name,
      pascalName: this.nameResolver.resolveTypeName(service.name),
      description: this.generateDescription(service),
      options: serviceOptions,
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

    // Always add core imports
    imports.push({
      imports: ['grpc'],
      source: '@improbable-eng/grpc-web',
    });
    imports.push({
      imports: ['Message'],
      source: 'google-protobuf',
    });

    // Add GrpcWebAdapter import from the generator package
    imports.push({
      imports: ['GrpcWebAdapter', 'GrpcError', 'isGrpcError', 'GrpcClientOptions'],
      source: '@hallow/generator',
    });

    // Add Observable imports for streaming methods
    if (hasStreaming) {
      imports.push({
        imports: ['Observable'],
        source: 'rxjs',
      });
    }

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
  private processMethod(method: MethodDefinition, protoFile: ProtoFile): ProcessedServiceMethod {
    // Resolve input and output types
    const inputType = this.resolveMessageType(method.inputType, protoFile);
    const outputType = this.resolveMessageType(method.outputType, protoFile);

    const camelName = this.nameResolver.resolveMethodName(method.name);
    // For pascalName in the template, we want to keep the original Pascal case (e.g., GetUser -> GetUser)
    const pascalName = method.name.charAt(0).toUpperCase() + method.name.slice(1);

    // Process method-level options if enabled
    let methodOptions: TemplateOptionMetadata | undefined;
    if (this.options.includeOptionMetadata && method.options) {
      const optionMetadata = this.optionProcessor.processOptions(method.options);
      methodOptions = this.optionProcessor.generateTemplateMetadata(optionMetadata);
    }

    return {
      name: method.name,
      pascalName,
      camelName,
      inputType,
      outputType,
      clientStreaming: method.clientStreaming,
      serverStreaming: method.serverStreaming,
      description: this.generateMethodDescription(method) || '',
      options: methodOptions,
    };
  }

  /**
   * Resolve message type and add necessary imports
   */
  private resolveMessageType(typeName: string, protoFile: ProtoFile): string {
    // Remove leading dot if present
    const cleanTypeName = typeName.startsWith('.') ? typeName.slice(1) : typeName;

    // Check if it's a message from the same file
    const localMessage = protoFile.messages.find(
      msg =>
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
      throw new GenerationError('Service name is required', GenerationErrorCode.INVALID_PROTO);
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
   * Templates will be loaded from .hbs files by the TemplateEngine when templateDir is provided to Generator constructor
   */
  private loadDefaultTemplate(): void {
    const path = require('path');
    const fs = require('fs');

    try {
      // Determine template directory
      const templateDir = this.options.templateDir || path.join(__dirname, '../templates');
      const templatePath = path.join(templateDir, 'service.hbs');

      // Check if template file exists
      if (fs.existsSync(templatePath)) {
        // Load template synchronously
        const templateContent = fs.readFileSync(templatePath, 'utf-8');
        this.templateEngine.loadTemplateFromString('service', templateContent);
      } else {
        console.warn(`Template file not found: ${templatePath}, using fallback`);
        this.loadFallbackTemplate();
      }
    } catch (error) {
      console.warn(
        `Failed to load service template: ${error instanceof Error ? error.message : String(error)}`,
      );
      this.loadFallbackTemplate();
    }
  }

  /**
   * Load fallback template as a last resort
   */
  private loadFallbackTemplate(): void {
    // Minimal fallback template - just in case file loading fails
    const fallbackTemplate = `// Generated service stub\n{{#each services}}export class {{pascalName}}Stub { }{{/each}}`;
    this.templateEngine.loadTemplateFromString('service', fallbackTemplate);
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
