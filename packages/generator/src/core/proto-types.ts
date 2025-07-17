/**
 * Proto file AST types for the generator
 */

/**
 * Represents a parsed proto file
 */
export interface ProtoFile {
  /**
   * File name
   */
  fileName: string;
  
  /**
   * Package name
   */
  package?: string;
  
  /**
   * Syntax version (e.g., "proto3")
   */
  syntax?: string;
  
  /**
   * Import statements
   */
  imports: string[];
  
  /**
   * Service definitions
   */
  services: ServiceDefinition[];
  
  /**
   * Message definitions
   */
  messages: MessageDefinition[];
  
  /**
   * Enum definitions
   */
  enums: EnumDefinition[];
  
  /**
   * File-level options
   */
  options: Record<string, any>;
}

/**
 * Service definition
 */
export interface ServiceDefinition {
  name: string;
  methods: MethodDefinition[];
  options: Record<string, any>;
}

/**
 * RPC method definition
 */
export interface MethodDefinition {
  name: string;
  inputType: string;
  outputType: string;
  clientStreaming: boolean;
  serverStreaming: boolean;
  options: Record<string, any>;
}

/**
 * Message definition
 */
export interface MessageDefinition {
  name: string;
  fields: FieldDefinition[];
  nestedMessages: MessageDefinition[];
  nestedEnums: EnumDefinition[];
  oneofs: OneofDefinition[];
  options: Record<string, any>;
}

/**
 * Field definition
 */
export interface FieldDefinition {
  name: string;
  number: number;
  type: string;
  repeated: boolean;
  optional: boolean;
  map: boolean;
  mapKeyType?: string;
  mapValueType?: string;
  options: Record<string, any>;
}

/**
 * Oneof definition
 */
export interface OneofDefinition {
  name: string;
  fields: FieldDefinition[];
}

/**
 * Enum definition
 */
export interface EnumDefinition {
  name: string;
  values: EnumValueDefinition[];
  options: Record<string, any>;
}

/**
 * Enum value definition
 */
export interface EnumValueDefinition {
  name: string;
  number: number;
  options: Record<string, any>;
}