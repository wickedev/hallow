/**
 * EnhancedServiceGenerator - Example of ServiceGenerator with ImportResolver integration
 * 
 * This class demonstrates how to use the ImportResolver for handling
 * cross-file type references and managing import dependencies.
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
import { ImportResolver } from '../utils/ImportResolver';
import { NameResolver } from '../utils/NameResolver';

/**
 * Enhanced service generation options
 */
export interface EnhancedServiceGeneratorOptions {
  /**
   * Base URL for the gRPC server
   */
  serverUrl?: string;
  
  /**
   * Whether to generate React hooks
   */
  generateReactHooks?: boolean;
  
  /**
   * Whether to resolve cross-file imports
   */
  resolveCrossFileImports?: boolean;
  
  /**
   * Output directory for generated files
   */
  outputDir?: string;
  
  /**
   * Whether to use namespace imports for large packages
   */
  useNamespaceImports?: boolean;
}

/**
 * EnhancedServiceGenerator class with ImportResolver integration
 */
export class EnhancedServiceGenerator {
  private templateEngine: TemplateEngine;
  private typeMapper: TypeMapper;
  private importManager: ImportManager;
  private importResolver: ImportResolver;
  private nameResolver: NameResolver;
  private options: Required<EnhancedServiceGeneratorOptions>;
  
  constructor(options: EnhancedServiceGeneratorOptions = {}) {
    this.options = {
      serverUrl: options.serverUrl || '',
      generateReactHooks: options.generateReactHooks ?? false,
      resolveCrossFileImports: options.resolveCrossFileImports ?? true,
      outputDir: options.outputDir || './generated',
      useNamespaceImports: options.useNamespaceImports ?? false,
    };
    
    // Initialize dependencies
    this.templateEngine = new TemplateEngine({
      cache: true,
      strict: false,
    });
    
    this.typeMapper = new TypeMapper();
    this.nameResolver = new NameResolver();
    this.importManager = new ImportManager({
      groupByCategory: true,
      sortAlphabetically: true,
      addBlankLinesBetweenGroups: true,
    });
    
    // Initialize ImportResolver with configuration
    this.importResolver = new ImportResolver(
      {
        basePath: this.options.outputDir,
        outputDir: this.options.outputDir,
        useRelativeImports: true,
        useNamespaceImports: this.options.useNamespaceImports,
        fileExtension: '.ts',
      },
      this.nameResolver,
      this.typeMapper,
    );
  }
  
  /**
   * Generate service stub with cross-file import resolution
   */
  public generateStub(
    service: ServiceDefinition, 
    protoFile: ProtoFile,
    allProtoFiles?: ProtoFile[],
  ): GeneratedFile {
    try {
      // Clear previous imports
      this.importManager.clear();
      
      // Register all proto files with ImportResolver if available
      if (allProtoFiles && this.options.resolveCrossFileImports) {
        allProtoFiles.forEach(file => {
          this.importResolver.registerProtoFile(file);
        });
      } else if (protoFile) {
        this.importResolver.registerProtoFile(protoFile);
      }
      
      // Add base gRPC imports
      this.importManager.addGrpcImports();
      
      // Process service methods and collect type references
      const processedMethods = this.processServiceMethods(
        service.methods,
        protoFile,
      );
      
      // Resolve import dependencies
      if (this.options.resolveCrossFileImports) {
        const dependencies = this.importResolver.getImportDependencies(
          protoFile.fileName,
        );
        
        // Add resolved dependencies to ImportManager
        this.importManager.addFromDependencies(dependencies);
      }
      
      // Generate service class
      const serviceName = this.nameResolver.resolveServiceName(service.name);
      const serviceCode = this.generateServiceClass(
        serviceName,
        processedMethods,
        protoFile.package,
      );
      
      // Generate React hooks if enabled
      let reactHooksCode = '';
      if (this.options.generateReactHooks) {
        this.importManager.addReactImports();
        reactHooksCode = this.generateReactHooks(
          serviceName,
          processedMethods,
        );
      }
      
      // Combine all code with imports
      const imports = this.importManager.generateProtoImports();
      const fullCode = [
        imports,
        '',
        serviceCode,
        reactHooksCode,
      ].filter(Boolean).join('\n');
      
      return {
        path: `${service.name.toLowerCase()}.service.ts`,
        content: fullCode,
      };
    } catch (error) {
      throw new GenerationError(
        `Failed to generate service stub: ${String(error)}`,
        GenerationErrorCode.TEMPLATE_PARSE_ERROR,
        { service: service.name },
      );
    }
  }
  
  /**
   * Process service methods and resolve types
   */
  private processServiceMethods(
    methods: MethodDefinition[],
    protoFile: ProtoFile,
  ): ProcessedMethod[] {
    const processedMethods: ProcessedMethod[] = [];
    
    for (const method of methods) {
      // Resolve input and output types
      const inputTypeRef = this.importResolver.resolveType(
        method.inputType,
        protoFile.package,
      );
      const outputTypeRef = this.importResolver.resolveType(
        method.outputType,
        protoFile.package,
      );
      
      // Convert to TypeScript names
      const inputTypeName = inputTypeRef 
        ? this.nameResolver.resolveTypeName(inputTypeRef.typeName)
        : method.inputType;
      const outputTypeName = outputTypeRef
        ? this.nameResolver.resolveTypeName(outputTypeRef.typeName)
        : method.outputType;
      
      // Add type imports if needed
      if (inputTypeRef && !inputTypeRef.isWellKnown) {
        if (inputTypeRef.sourceFile !== protoFile.fileName) {
          this.importManager.addCrossFileImport(
            inputTypeName,
            inputTypeRef.sourceFile || '',
          );
        }
      }
      
      if (outputTypeRef && !outputTypeRef.isWellKnown) {
        if (outputTypeRef.sourceFile !== protoFile.fileName) {
          this.importManager.addCrossFileImport(
            outputTypeName,
            outputTypeRef.sourceFile || '',
          );
        }
      }
      
      processedMethods.push({
        name: method.name,
        camelName: this.nameResolver.resolveMethodName(method.name),
        inputType: inputTypeName,
        outputType: outputTypeName,
        clientStreaming: method.clientStreaming,
        serverStreaming: method.serverStreaming,
        fullPath: this.generateMethodPath(protoFile.package, method.name),
      });
    }
    
    return processedMethods;
  }
  
  /**
   * Generate service class code
   */
  private generateServiceClass(
    serviceName: string,
    methods: ProcessedMethod[],
    _packageName?: string,
  ): string {
    const code: string[] = [];
    
    code.push(`export class ${serviceName} {`);
    code.push('  private client: grpc.Client;');
    code.push('');
    code.push('  constructor(hostname: string, options?: grpc.ClientOptions) {');
    code.push('    this.client = new grpc.Client(hostname, options);');
    code.push('  }');
    code.push('');
    
    // Generate methods
    for (const method of methods) {
      if (method.clientStreaming || method.serverStreaming) {
        code.push(this.generateStreamingMethod(method));
      } else {
        code.push(this.generateUnaryMethod(method, _packageName));
      }
      code.push('');
    }
    
    code.push('}');
    
    return code.join('\n');
  }
  
  /**
   * Generate unary method
   */
  private generateUnaryMethod(method: ProcessedMethod, _packageName?: string): string {
    const lines: string[] = [];
    
    lines.push(`  async ${method.camelName}(`);
    lines.push(`    request: ${method.inputType},`);
    lines.push('    metadata?: grpc.Metadata');
    lines.push(`  ): Promise<${method.outputType}> {`);
    lines.push('    return new Promise((resolve, reject) => {');
    lines.push('      grpc.unary({');
    lines.push('        request,');
    lines.push('        host: this.client.host,');
    lines.push('        metadata,');
    lines.push('        transport: this.client.options.transport,');
    lines.push('        debug: this.client.options.debug,');
    lines.push('        onEnd: (response) => {');
    lines.push('          if (response.status === grpc.Code.OK && response.message) {');
    lines.push(`            resolve(response.message as ${method.outputType});`);
    lines.push('          } else {');
    lines.push('            reject(new Error(response.statusMessage));');
    lines.push('          }');
    lines.push('        },');
    lines.push('      });');
    lines.push('    });');
    lines.push('  }');
    
    return lines.join('\n');
  }
  
  /**
   * Generate streaming method (placeholder)
   */
  private generateStreamingMethod(method: ProcessedMethod): string {
    const lines: string[] = [];
    
    lines.push(`  // TODO: Implement streaming method ${method.camelName}`);
    lines.push(`  ${method.camelName}(`);
    lines.push(`    request: ${method.inputType},`);
    lines.push('    metadata?: grpc.Metadata');
    lines.push('  ): grpc.Request {');
    lines.push('    throw new Error(\'Streaming not yet implemented\');');
    lines.push('  }');
    
    return lines.join('\n');
  }
  
  /**
   * Generate React hooks
   */
  private generateReactHooks(
    serviceName: string,
    methods: ProcessedMethod[],
  ): string {
    const code: string[] = [];
    
    code.push(`// React Hooks for ${serviceName}`);
    code.push('');
    
    for (const method of methods) {
      if (!method.clientStreaming && !method.serverStreaming) {
        const hookName = this.nameResolver.resolveHookName(method.name);
        
        code.push(`export function ${hookName}() {`);
        code.push(`  const [data, setData] = useState<${method.outputType} | null>(null);`);
        code.push('  const [loading, setLoading] = useState(false);');
        code.push('  const [error, setError] = useState<Error | null>(null);');
        code.push('');
        code.push(`  const execute = useCallback(async (request: ${method.inputType}) => {`);
        code.push('    setLoading(true);');
        code.push('    setError(null);');
        code.push('    try {');
        code.push(`      const response = await service.${method.camelName}(request);`);
        code.push('      setData(response);');
        code.push('      return response;');
        code.push('    } catch (err) {');
        code.push('      setError(err as Error);');
        code.push('      throw err;');
        code.push('    } finally {');
        code.push('      setLoading(false);');
        code.push('    }');
        code.push('  }, []);');
        code.push('');
        code.push('  return { data, loading, error, execute };');
        code.push('}');
        code.push('');
      }
    }
    
    return code.join('\n');
  }
  
  /**
   * Generate method path for gRPC
   */
  private generateMethodPath(packageName: string | undefined, methodName: string): string {
    if (packageName) {
      return `/${packageName}/${methodName}`;
    }
    return `/${methodName}`;
  }
}

/**
 * Processed method information
 */
interface ProcessedMethod {
  name: string;
  camelName: string;
  inputType: string;
  outputType: string;
  clientStreaming: boolean;
  serverStreaming: boolean;
  fullPath: string;
}