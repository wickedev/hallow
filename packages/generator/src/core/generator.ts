import {
  GeneratorOptions,
  GeneratedCode,
  GeneratedFile,
  GenerationError,
  GenerationErrorCode,
} from './types';
import { ProtoFile } from './proto-types';

/**
 * Main code generator class
 */
export class Generator {
  private options: Required<GeneratorOptions>;
  
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
        servicesCount: 0,
        messagesCount: 0,
        enumsCount: 0,
      };
      
      // TODO: Implement actual generation logic
      // For now, return empty result
      
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
        error
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
        GenerationErrorCode.INVALID_PROTO
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
  }
}