import {
  GeneratorOptions,
  GeneratedCode,
  GeneratedFile,
  GenerationError,
  GenerationErrorCode,
} from './types';
import { ProtoFile } from './proto-types';
import { ServiceGenerator } from '../generators/ServiceGenerator';

/**
 * Main code generator class
 */
export class Generator {
  private options: Required<GeneratorOptions>;
  private serviceGenerator: ServiceGenerator;
  
  constructor(options: GeneratorOptions = {}) {
    this.options = {
      outputFormat: options.outputFormat || 'typescript',
      generateReactHooks: options.generateReactHooks ?? false,
      generateSuspenseHooks: options.generateSuspenseHooks ?? false,
      serverUrl: options.serverUrl || '',
      sourceMaps: options.sourceMaps ?? false,
      generateComments: options.generateComments ?? true,
      templateDir: options.templateDir || '',
      treeShaking: options.treeShaking ?? false,
    };
    
    // Initialize service generator
    this.serviceGenerator = new ServiceGenerator({
      serverUrl: this.options.serverUrl,
      generateReactHooks: this.options.generateReactHooks,
      generateSuspenseHooks: this.options.generateSuspenseHooks,
      generateComments: this.options.generateComments,
      templateDir: this.options.templateDir,
    });
  }
  
  /**
   * Generate code from parsed proto file
   * @param protoFile Parsed proto file AST
   * @returns Generated code result
   */
  async generateCode(protoFile: ProtoFile): Promise<GeneratedCode> {
    try {
      this.validateProtoFile(protoFile);
      
      const files: GeneratedFile[] = [];
      const metadata = {
        generatedAt: new Date(),
        generatorVersion: '0.1.0', // TODO: Get from package.json
        servicesCount: protoFile.services.length,
        messagesCount: protoFile.messages.length,
        enumsCount: protoFile.enums.length,
      };
      
      // Generate service stubs
      if (protoFile.services.length > 0) {
        const serviceFiles = await this.serviceGenerator.generateStubs(protoFile);
        files.push(...serviceFiles);
      }
      
      // TODO: Generate message types
      // TODO: Generate enum types
      
      return {
        files,
        metadata,
      };
    } catch (error) {
      if (error instanceof GenerationError) {
        throw error;
      }
      throw new GenerationError(
        `Unexpected error during code generation: ${error instanceof Error ? error.message : String(error)}`,
        GenerationErrorCode.INVALID_PROTO,
        error,
      );
    }
  }
  
  /**
   * Validate proto file before generation
   * @param protoFile Proto file to validate
   */
  private validateProtoFile(protoFile: ProtoFile): void {
    if (!protoFile) {
      throw new GenerationError(
        'Proto file is required',
        GenerationErrorCode.INVALID_PROTO,
      );
    }
    
    // TODO: Add more validation
  }
  
  /**
   * Get current generator options
   */
  getOptions(): Readonly<Required<GeneratorOptions>> {
    return { ...this.options };
  }
  
  /**
   * Update generator options
   * @param options Partial options to update
   */
  updateOptions(options: Partial<GeneratorOptions>): void {
    this.options = {
      ...this.options,
      ...options,
    };
    
    // Update service generator options
    this.serviceGenerator.updateOptions({
      serverUrl: this.options.serverUrl,
      generateReactHooks: this.options.generateReactHooks,
      generateSuspenseHooks: this.options.generateSuspenseHooks,
      generateComments: this.options.generateComments,
      templateDir: this.options.templateDir,
    });
  }
}