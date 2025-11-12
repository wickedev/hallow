/**
 * Type declarations for @hallow/parser
 *
 * This declaration file provides type information for the parser package
 * without importing the actual implementation, avoiding Rollup bundling issues.
 */

declare module '@hallow/parser' {
  export class Parser {
    parse(content: string, filePath: string): ProtoFile;
  }

  export class ParseError extends Error {
    readonly line: number;
    readonly column: number;
    readonly filePath?: string;

    constructor(message: string, line: number, column: number, filePath?: string);
  }

  export interface ProtoFile {
    fileName: string;
    package?: string;
    syntax?: string;
    imports: string[];
    services: ServiceDefinition[];
    messages: MessageDefinition[];
    enums: EnumDefinition[];
    options: Record<string, any>;
  }

  export interface ServiceDefinition {
    name: string;
    methods: MethodDefinition[];
    options: Record<string, any>;
  }

  export interface MethodDefinition {
    name: string;
    inputType: string;
    outputType: string;
    clientStreaming: boolean;
    serverStreaming: boolean;
    options: Record<string, any>;
  }

  export interface MessageDefinition {
    name: string;
    fields: FieldDefinition[];
    nestedMessages: MessageDefinition[];
    nestedEnums: EnumDefinition[];
    oneofs: OneofDefinition[];
    options: Record<string, any>;
  }

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

  export interface OneofDefinition {
    name: string;
    fields: FieldDefinition[];
  }

  export interface EnumDefinition {
    name: string;
    values: EnumValueDefinition[];
    options: Record<string, any>;
  }

  export interface EnumValueDefinition {
    name: string;
    number: number;
    options: Record<string, any>;
  }
}
