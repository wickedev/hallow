/**
 * Configuration options for the code generator
 */
export interface GeneratorOptions {
  /**
   * Output format for the generated code
   */
  outputFormat?: 'typescript' | 'javascript';
  
  /**
   * Whether to generate React hooks
   */
  generateReactHooks?: boolean;
  
  /**
   * Whether to generate Suspense-compatible hooks
   */
  generateSuspenseHooks?: boolean;
  
  /**
   * Base URL for the gRPC server
   */
  serverUrl?: string;
  
  /**
   * Whether to include source maps
   */
  sourceMaps?: boolean;
  
  /**
   * Whether to generate JSDoc comments
   */
  generateComments?: boolean;
  
  /**
   * Custom template directory path
   */
  templateDir?: string;
  
  /**
   * Whether to optimize generated code for tree-shaking
   */
  treeShaking?: boolean;
}

/**
 * Represents a generated code file
 */
export interface GeneratedFile {
  /**
   * File path relative to output directory
   */
  path: string;
  
  /**
   * Generated code content
   */
  content: string;
  
  /**
   * Source map content if enabled
   */
  sourceMap?: string;
}

/**
 * Result of code generation
 */
export interface GeneratedCode {
  /**
   * List of generated files
   */
  files: GeneratedFile[];
  
  /**
   * Metadata about the generation process
   */
  metadata: {
    /**
     * Timestamp of generation
     */
    generatedAt: Date;
    
    /**
     * Version of the generator
     */
    generatorVersion: string;
    
    /**
     * Number of services processed
     */
    servicesCount: number;
    
    /**
     * Number of messages processed
     */
    messagesCount: number;
    
    /**
     * Number of enums processed
     */
    enumsCount: number;
  };
}

/**
 * Custom error class for generation errors
 */
export class GenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public readonly details?: any,
  ) {
    super(message);
    this.name = 'GenerationError';
  }
}

/**
 * Error codes for generation errors
 */
export enum GenerationErrorCode {
  INVALID_PROTO = 'INVALID_PROTO',
  TEMPLATE_NOT_FOUND = 'TEMPLATE_NOT_FOUND',
  TEMPLATE_PARSE_ERROR = 'TEMPLATE_PARSE_ERROR',
  TYPE_MAPPING_ERROR = 'TYPE_MAPPING_ERROR',
  SERIALIZATION_ERROR = 'SERIALIZATION_ERROR',
  INVALID_OPTIONS = 'INVALID_OPTIONS',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
}