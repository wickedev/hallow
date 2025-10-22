/**
 * MessageGenerator - TypeScript interface and serialization code generation
 * 
 * This class handles the generation of TypeScript interfaces from message
 * definitions, including support for nested messages, proper namespace
 * structure, and integration with google-protobuf for serialization.
 */

import { TemplateEngine } from '../core/template-engine';
import { 
  MessageDefinition, 
  FieldDefinition, 
  EnumDefinition,
  OneofDefinition,
  ProtoFile, 
} from '../core/proto-types';
// Note: GenerationError and GenerationErrorCode are imported but not used directly
// They are used by the TemplateEngine for error handling
// import { 
// GenerationError, 
// GenerationErrorCode, 
// GeneratorOptions, 
// } from '../core/types';
import { TypeMapper, TypeMappingConfig } from '../utils/TypeMapper';
import { NameResolver } from '../utils/NameResolver';
import { ImportManager } from '../utils/ImportManager';
import { OptionProcessor, TemplateOptionMetadata } from '../utils/OptionProcessor';

/**
 * Options for message generation
 */
export interface MessageGeneratorOptions {
  /**
   * Whether to generate interfaces only (no serialization code)
   */
  interfacesOnly?: boolean;
  
  /**
   * Whether to generate JSDoc comments
   */
  generateComments?: boolean;
  
  /**
   * Whether to use readonly properties
   */
  readonlyProperties?: boolean;
  
  /**
   * Whether to generate nested namespaces
   */
  generateNamespaces?: boolean;
  
  /**
   * Whether to inline nested messages
   */
  inlineNestedMessages?: boolean;
  
  /**
   * Type mapping configuration
   */
  typeMappingConfig?: TypeMappingConfig;
  
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
 * Generated message code structure
 */
export interface GeneratedMessage {
  /**
   * TypeScript interface definition
   */
  interface: string;
  
  /**
   * Serialization namespace with encode/decode methods
   */
  serialization?: string;
  
  /**
   * Nested type definitions
   */
  nestedTypes?: GeneratedMessage[];
  
  /**
   * Import statements required
   */
  imports: string[];
  
  /**
   * Export statements
   */
  exports: string[];
}

/**
 * Message context for template rendering
 */
interface MessageContext {
  name: string;
  interfaceName: string;
  namespace?: string;
  fields: FieldContext[];
  oneofs: OneofContext[];
  nestedMessages: MessageContext[];
  nestedEnums: EnumContext[];
  hasNestedTypes: boolean;
  generateSerialization: boolean;
  generateComments: boolean;
  options?: TemplateOptionMetadata;
}

/**
 * Field context for template rendering
 */
interface FieldContext {
  name: string;
  camelCaseName: string;
  number: number;
  type: string;
  tsType: string;
  repeated: boolean;
  optional: boolean;
  map: boolean;
  mapKeyType?: string;
  mapValueType?: string;
  packed?: boolean;
  mapKeyWriteMethod?: string;
  mapValueWriteMethod?: string;
  mapKeyReadMethod?: string;
  mapValueReadMethod?: string;
  wireType: string;
  serializerMethod: string;
  deserializerMethod: string;
  defaultValue: string;
  comment?: string;
  options?: TemplateOptionMetadata;
}

/**
 * Oneof context for template rendering
 */
interface OneofContext {
  name: string;
  camelCaseName: string;
  fields: FieldContext[];
  unionType: string;
}

/**
 * Enum context for template rendering
 */
interface EnumContext {
  name: string;
  values: Array<{
    name: string;
    number: number;
    comment?: string;
    options?: TemplateOptionMetadata;
  }>;
  isConstEnum: boolean;
  options?: TemplateOptionMetadata;
}

/**
 * MessageGenerator class for generating TypeScript interfaces and serialization code
 */
export class MessageGenerator {
  private templateEngine: TemplateEngine;
  private typeMapper: TypeMapper;
  private nameResolver: NameResolver;
  private importManager: ImportManager;
  private optionProcessor: OptionProcessor;
  private options: MessageGeneratorOptions;
  
  constructor(
    templateEngine: TemplateEngine,
    options: MessageGeneratorOptions = {},
  ) {
    this.templateEngine = templateEngine;
    this.options = {
      interfacesOnly: false,
      generateComments: true,
      readonlyProperties: false,
      generateNamespaces: false,  // FIXED: Don't wrap messages in package namespace - causes type errors
      inlineNestedMessages: false,
      includeOptionMetadata: false,
      optionProcessing: {},
      ...options,
    };
    
    this.typeMapper = new TypeMapper({
      strictNullChecks: true,
      readonlyProperties: this.options.readonlyProperties,
      ...this.options.typeMappingConfig,
    });
    
    this.nameResolver = new NameResolver();
    this.importManager = new ImportManager();
    this.optionProcessor = new OptionProcessor(this.options.optionProcessing);
    
    // Load templates
    this.loadTemplates();
  }
  
  /**
   * Load Handlebars templates for message generation
   */
  private loadTemplates(): void {
    // Templates will be loaded from .hbs files by the TemplateEngine
    // when templateDir is provided to Generator constructor.
    // No need to load default string templates anymore.
  }

  /**
   * Generate TypeScript interface from message definition
   */
  public generateInterface(
    message: MessageDefinition,
    namespace?: string,
  ): string {
    const context = this.createMessageContext(message, namespace);
    
    try {
      // Use template for interface generation
      return this.templateEngine.render('message-interface', context);
    } catch (error) {
      // Fallback to programmatic generation if template fails
      return this.generateInterfaceProgrammatically(context);
    }
  }
  
  /**
   * Generate serialization code for message
   */
  public generateSerialization(
    message: MessageDefinition,
    namespace?: string,
  ): string {
    if (this.options.interfacesOnly) {
      return '';
    }

    const context = this.createMessageContext(message, namespace);

    // FIXED: Always use programmatic generation to avoid namespace conflicts
    // Template-based generation creates duplicate namespaces that conflict with interface generation
    return this.generateSerializationProgrammatically(context);
  }
  
  /**
   * Generate complete message code (interface + serialization)
   */
  public generateMessage(
    message: MessageDefinition,
    namespace?: string,
  ): GeneratedMessage {
    const interfaceCode = this.generateInterface(message, namespace);
    const serializationCode = this.generateSerialization(message, namespace);
    const nestedTypes = this.generateNestedTypes(message, namespace);

    // Collect all imports
    this.importManager.addNamedImports('google-protobuf', ['BinaryWriter', 'BinaryReader']);

    const imports = this.importManager.generateImports().split('\n');
    const exports = this.generateExports(message, namespace);

    return {
      interface: interfaceCode,
      serialization: serializationCode,
      nestedTypes,
      imports,
      exports,
    };
  }
  
  /**
   * Generate all messages from a proto file
   */
  public generateMessages(protoFile: ProtoFile): string {
    const messages = protoFile.messages;

    // Generate import statements
    const imports = this.generateImports(protoFile);

    // Generate message code without namespace wrapping
    // FIXED: Don't pass namespace to avoid generating export namespace Test.Services
    const messageCode = messages.map(message => {
      const generated = this.generateMessage(message);  // No namespace parameter
      return this.combineMessageCode(generated);
    }).join('\n\n');

    // Don't wrap in namespace (generateNamespaces is false by default now)
    return `${imports}\n\n${messageCode}`;
  }
  
  /**
   * Create message context for template rendering
   */
  private createMessageContext(
    message: MessageDefinition,
    namespace?: string,
  ): MessageContext {
    const interfaceName = this.nameResolver.resolveTypeName(message.name, false);
    
    const fields = message.fields.map(field => 
      this.createFieldContext(field, message),
    );
    
    const oneofs = message.oneofs.map(oneof => 
      this.createOneofContext(oneof, message),
    );
    
    const nestedMessages = message.nestedMessages.map(nested =>
      this.createMessageContext(nested, `${namespace || ''}.${message.name}`),
    );
    
    const nestedEnums = message.nestedEnums.map(enumDef =>
      this.createEnumContext(enumDef),
    );
    
    // Process message-level options if enabled
    let messageOptions: TemplateOptionMetadata | undefined;
    if (this.options.includeOptionMetadata && message.options) {
      const optionMetadata = this.optionProcessor.processOptions(message.options);
      messageOptions = this.optionProcessor.generateTemplateMetadata(optionMetadata);
    }
    
    return {
      name: message.name,
      interfaceName,
      namespace,
      fields,
      oneofs,
      nestedMessages,
      nestedEnums,
      hasNestedTypes: nestedMessages.length > 0 || nestedEnums.length > 0,
      generateSerialization: !this.options.interfacesOnly,
      generateComments: this.options.generateComments || false,
      options: messageOptions,
    };
  }
  
  /**
   * Create field context for template rendering
   */
  private createFieldContext(
    field: FieldDefinition,
    _message: MessageDefinition,
  ): FieldContext {
    // Validate field mapping
    this.typeMapper.validateTypeMapping(field);
    
    const tsType = this.typeMapper.mapFieldType(field).type;
    const camelCaseName = this.nameResolver.resolveFieldName(field.name);
    const wireType = this.getWireType(field);
    const serializerMethod = this.getSerializerMethod(field);
    const deserializerMethod = this.getDeserializerMethod(field);
    const defaultValue = this.getDefaultValue(field);
    const packed = field.repeated && this.isPackableType(field.type);
    
    // Process field-level options if enabled
    let fieldOptions: TemplateOptionMetadata | undefined;
    if (this.options.includeOptionMetadata && field.options) {
      const optionMetadata = this.optionProcessor.processOptions(field.options);
      fieldOptions = this.optionProcessor.generateTemplateMetadata(optionMetadata);
    }
    
    return {
      name: field.name,
      camelCaseName,
      number: field.number,
      type: field.type,
      tsType,
      repeated: field.repeated,
      optional: field.optional,
      map: field.map,
      mapKeyType: field.mapKeyType,
      mapValueType: field.mapValueType,
      packed,
      mapKeyWriteMethod: field.map && field.mapKeyType ? this.getMapKeyWriteMethod(field.mapKeyType) : undefined,
      mapValueWriteMethod: field.map && field.mapValueType ? 
        this.getMapValueWriteMethod(field.mapValueType) : undefined,
      mapKeyReadMethod: field.map && field.mapKeyType ? this.getMapKeyReadMethod(field.mapKeyType) : undefined,
      mapValueReadMethod: field.map && field.mapValueType ? this.getMapValueReadMethod(field.mapValueType) : undefined,
      wireType,
      serializerMethod,
      deserializerMethod,
      defaultValue,
      comment: this.options.generateComments ? 
        `Field ${field.name} (${field.type})` : undefined,
      options: fieldOptions,
    };
  }
  
  /**
   * Create oneof context for template rendering
   */
  private createOneofContext(
    oneof: OneofDefinition,
    message: MessageDefinition,
  ): OneofContext {
    const camelCaseName = this.nameResolver.resolveFieldName(oneof.name);
    const fields = oneof.fields.map(field => 
      this.createFieldContext(field, message),
    );
    const unionType = this.typeMapper.mapOneofField(oneof.name, oneof.fields);
    
    return {
      name: oneof.name,
      camelCaseName,
      fields,
      unionType,
    };
  }
  
  /**
   * Create enum context for template rendering
   */
  private createEnumContext(enumDef: EnumDefinition): EnumContext {
    // Process enum-level options if enabled
    let enumOptions: TemplateOptionMetadata | undefined;
    if (this.options.includeOptionMetadata && enumDef.options) {
      const optionMetadata = this.optionProcessor.processOptions(enumDef.options);
      enumOptions = this.optionProcessor.generateTemplateMetadata(optionMetadata);
    }
    
    return {
      name: enumDef.name,
      values: enumDef.values.map(value => {
        // Process enum value-level options if enabled
        let valueOptions: TemplateOptionMetadata | undefined;
        if (this.options.includeOptionMetadata && value.options) {
          const optionMetadata = this.optionProcessor.processOptions(value.options);
          valueOptions = this.optionProcessor.generateTemplateMetadata(optionMetadata);
        }
        
        return {
          name: value.name,
          number: value.number,
          comment: this.options.generateComments ? 
            `Value ${value.name} = ${value.number}` : undefined,
          options: valueOptions,
        };
      }),
      isConstEnum: false, // Can be configured later
      options: enumOptions,
    };
  }
  
  /**
   * Generate interface code programmatically (fallback)
   */
  private generateInterfaceProgrammatically(
    context: MessageContext,
    indentLevel: number = 0,
  ): string {
    const lines: string[] = [];
    const indent = '  '.repeat(indentLevel);
    const innerIndent = '  '.repeat(indentLevel + 1);

    // Add comment if enabled
    if (context.generateComments) {
      lines.push(`${indent}/**`);
      if (context.namespace) {
        lines.push(`${indent} * Interface for ${context.name} message (nested)`);
      } else {
        lines.push(`${indent} * Interface for ${context.name} message`);
      }
      lines.push(`${indent} */`);
    }

    // Start interface - use 'export' for all interfaces
    lines.push(`${indent}export interface ${context.interfaceName} {`);

    // Add fields
    context.fields.forEach(field => {
      if (field.comment) {
        lines.push(`${innerIndent}/** ${field.comment} */`);
      }
      const optional = field.optional ? '?' : '';
      const readonly = this.options.readonlyProperties ? 'readonly ' : '';
      lines.push(`${innerIndent}${readonly}${field.camelCaseName}${optional}: ${field.tsType};`);
    });

    // Add oneofs
    context.oneofs.forEach(oneof => {
      lines.push(`${innerIndent}${oneof.camelCaseName}: ${oneof.unionType};`);
    });

    // Close interface
    lines.push(`${indent}}`);

    // Add nested types if any
    if (context.hasNestedTypes) {
      lines.push('');
      lines.push(`${indent}export namespace ${context.interfaceName} {`);

      // Add nested messages - recursively handle deeply nested structures
      context.nestedMessages.forEach((nestedMessage, index) => {
        if (index > 0) {
          lines.push(''); // Add spacing between nested types
        }
        const nestedCode = this.generateInterfaceProgrammatically(
          nestedMessage,
          indentLevel + 1,
        );
        lines.push(nestedCode);
      });

      // Add nested enums
      context.nestedEnums.forEach(nestedEnum => {
        lines.push('');
        if (context.generateComments) {
          lines.push(`${innerIndent}/**`);
          lines.push(`${innerIndent} * Enum ${nestedEnum.name}`);
          lines.push(`${innerIndent} */`);
        }
        lines.push(`${innerIndent}export enum ${nestedEnum.name} {`);
        nestedEnum.values.forEach(value => {
          if (value.comment) {
            lines.push(`${innerIndent}  /** ${value.comment} */`);
          }
          lines.push(`${innerIndent}  ${value.name} = ${value.number},`);
        });
        lines.push(`${innerIndent}}`);
      });

      lines.push(`${indent}}`);
    }

    return lines.join('\n');
  }
  
  /**
   * Generate serialization code programmatically (fallback)
   */
  private generateSerializationProgrammatically(context: MessageContext): string {
    const lines: string[] = [];
    
    // Start namespace
    lines.push(`export namespace ${context.interfaceName} {`);
    
    // Generate encode method
    lines.push(...this.generateEncodeMethod(context));
    lines.push('');
    
    // Generate decode method
    lines.push(...this.generateDecodeMethod(context));
    lines.push('');

    // Generate Message class for grpc-web compatibility
    lines.push(...this.generateMessageClass(context));

    // Close namespace
    lines.push('}');

    return lines.join('\n');
  }

  /**
   * Generate Message class for grpc-web compatibility
   */
  private generateMessageClass(context: MessageContext): string[] {
    const lines: string[] = [];

    lines.push('  /**');
    lines.push(`   * Protobuf Message class for ${context.name}`);
    lines.push('   * Compatible with @improbable-eng/grpc-web');
    lines.push('   */');
    lines.push('  export class Message {');

    // Add fields
    context.fields.forEach(field => {
      const optional = field.optional ? '?' : '';
      lines.push(`    ${field.camelCaseName}${optional}: ${field.tsType};`);
    });
    lines.push('');

    // Constructor
    lines.push(`    constructor(init?: Partial<${context.interfaceName}>) {`);
    context.fields.forEach(field => {
      if (!field.optional) {
        lines.push(`      this.${field.camelCaseName} = ${field.defaultValue};`);
      }
    });
    lines.push('      if (init) {');
    lines.push('        Object.assign(this, init);');
    lines.push('      }');
    lines.push('    }');
    lines.push('');

    // toObject method
    lines.push(`    toObject(): ${context.interfaceName} {`);
    lines.push('      return {');
    context.fields.forEach(field => {
      lines.push(`        ${field.camelCaseName}: this.${field.camelCaseName},`);
    });
    lines.push('      };');
    lines.push('    }');
    lines.push('');

    // serializeBinary method
    lines.push('    serializeBinary(): Uint8Array {');
    lines.push('      return encode(this.toObject());');
    lines.push('    }');
    lines.push('');

    // static deserializeBinary method
    lines.push('    static deserializeBinary(bytes: Uint8Array): Message {');
    lines.push('      const decoded = decode(bytes);');
    lines.push('      return new Message(decoded);');
    lines.push('    }');
    lines.push('  }');

    return lines;
  }
  
  /**
   * Generate encode method
   */
  private generateEncodeMethod(context: MessageContext): string[] {
    const lines: string[] = [];
    
    lines.push('  /**');
    lines.push(`   * Encode ${context.name} message to protobuf format`);
    lines.push('   */');
    lines.push(`  export function encode(message: ${context.interfaceName}): Uint8Array {`);
    lines.push('    const writer = new BinaryWriter();');
    lines.push('');
    
    // Encode each field
    context.fields.forEach(field => {
      lines.push(`    if (message.${field.camelCaseName} !== undefined) {`);
      
      if (field.repeated) {
        // Check if it's a packed field
        if (this.typeMapper.isScalarType(field.type) && field.type !== 'string' && field.type !== 'bytes') {
          // Use packed write for numeric arrays
          lines.push(`      writer.${field.serializerMethod}(${field.number}, message.${field.camelCaseName});`);
        } else if (!this.typeMapper.isScalarType(field.type)) {
          // For message types, use writeMessage with encoder function
          lines.push(`      for (const item of message.${field.camelCaseName}) {`);
          lines.push(`        writer.${field.serializerMethod}(${field.number}, item, ${field.type}.encode);`);
          lines.push('      }');
        } else {
          // Write each item individually for non-packed scalar fields
          lines.push(`      for (const item of message.${field.camelCaseName}) {`);
          lines.push(`        writer.${field.serializerMethod}(${field.number}, item);`);
          lines.push('      }');
        }
      } else if (field.map) {
        lines.push(`      for (const [key, value] of message.${field.camelCaseName}) {`);
        lines.push('        // Encode map entry as a message with key and value fields');
        lines.push(`        writer.beginSubMessage(${field.number});`);
        lines.push(`        writer.${this.getMapKeyWriteMethod(field.mapKeyType!)}(1, key);`);
        lines.push(`        writer.${this.getMapValueWriteMethod(field.mapValueType!)}(2, value);`);
        lines.push(`        writer.endSubMessage(${field.number});`);
        lines.push('      }');
      } else if (!this.typeMapper.isScalarType(field.type)) {
        // For message types, use writeMessage with encoder function
        lines.push(`      writer.${field.serializerMethod}(${field.number}, message.${field.camelCaseName}, ${field.type}.encode);`);
      } else {
        lines.push(`      writer.${field.serializerMethod}(${field.number}, message.${field.camelCaseName});`);
      }
      
      lines.push('    }');
    });
    
    lines.push('');
    lines.push('    return writer.getResultBuffer();');
    lines.push('  }');
    
    return lines;
  }
  
  /**
   * Generate decode method
   */
  private generateDecodeMethod(context: MessageContext): string[] {
    const lines: string[] = [];
    
    lines.push('  /**');
    lines.push(`   * Decode ${context.name} message from protobuf format`);
    lines.push('   */');
    lines.push(`  export function decode(bytes: Uint8Array): ${context.interfaceName} {`);
    lines.push('    const reader = new BinaryReader(bytes);');
    lines.push(`    const message: ${context.interfaceName} = {`);
    
    // Initialize fields
    context.fields.forEach(field => {
      if (!field.optional || !this.options.typeMappingConfig?.strictNullChecks) {
        lines.push(`      ${field.camelCaseName}: ${field.defaultValue},`);
      }
    });
    
    lines.push('    };');
    lines.push('');
    lines.push('    while (reader.nextField()) {');
    lines.push('      const fieldNumber = reader.getFieldNumber();');
    lines.push('');
    lines.push('      switch (fieldNumber) {');
    
    // Decode each field
    context.fields.forEach(field => {
      lines.push(`        case ${field.number}:`);
      
      if (field.repeated) {
        // Check if it's a packed field
        if (this.typeMapper.isScalarType(field.type) && field.type !== 'string' && field.type !== 'bytes') {
          // Use packed read for numeric arrays
          lines.push(`          message.${field.camelCaseName} = reader.${field.deserializerMethod}();`);
        } else if (!this.typeMapper.isScalarType(field.type)) {
          // For message types, use readMessage with callback to get bytes and decode
          lines.push(`          if (!message.${field.camelCaseName}) {`);
          lines.push(`            message.${field.camelCaseName} = [];`);
          lines.push('          }');
          lines.push(`          const bytes = reader.readBytes();`);
          lines.push(`          message.${field.camelCaseName}.push(${field.type}.decode(bytes));`);
        } else {
          // Read individual items for non-packed scalar fields
          lines.push(`          if (!message.${field.camelCaseName}) {`);
          lines.push(`            message.${field.camelCaseName} = [];`);
          lines.push('          }');
          lines.push(`          message.${field.camelCaseName}.push(reader.${field.deserializerMethod.replace('Packed', '')}());`);
        }
      } else if (field.map) {
        lines.push(`          if (!message.${field.camelCaseName}) {`);
        lines.push(`            message.${field.camelCaseName} = new Map();`);
        lines.push('          }');
        lines.push('          // Read map entry as a submessage');
        lines.push('          const messageLength = reader.readUint32();');
        lines.push('          const messageEnd = reader.getCursor() + messageLength;');
        lines.push('          let key: any, value: any;');
        lines.push('          while (reader.getCursor() < messageEnd) {');
        lines.push('            const fieldNumber = reader.getFieldNumber();');
        lines.push('            switch (fieldNumber) {');
        lines.push('              case 1:');
        lines.push(`                key = reader.${this.getMapKeyReadMethod(field.mapKeyType!)}();`);
        lines.push('                break;');
        lines.push('              case 2:');
        lines.push(`                value = reader.${this.getMapValueReadMethod(field.mapValueType!)}();`);
        lines.push('                break;');
        lines.push('              default:');
        lines.push('                reader.skipField();');
        lines.push('                break;');
        lines.push('            }');
        lines.push('          }');
        lines.push('          if (key !== undefined && value !== undefined) {');
        lines.push(`            message.${field.camelCaseName}.set(key, value);`);
        lines.push('          }');
      } else if (!this.typeMapper.isScalarType(field.type)) {
        // For message types, read bytes and decode
        lines.push(`          const bytes = reader.readBytes();`);
        lines.push(`          message.${field.camelCaseName} = ${field.type}.decode(bytes);`);
      } else {
        lines.push(`          message.${field.camelCaseName} = reader.${field.deserializerMethod}();`);
      }
      
      lines.push('          break;');
    });
    
    lines.push('        default:');
    lines.push('          reader.skipField();');
    lines.push('          break;');
    lines.push('      }');
    lines.push('    }');
    lines.push('');
    lines.push('    return message;');
    lines.push('  }');
    
    return lines;
  }
  
  /**
   * Generate nested types
   */
  private generateNestedTypes(
    message: MessageDefinition,
    namespace?: string,
  ): GeneratedMessage[] {
    if (!message.nestedMessages.length && !message.nestedEnums.length) {
      return [];
    }
    
    const nestedTypes: GeneratedMessage[] = [];
    const nestedNamespace = namespace ? 
      `${namespace}.${message.name}` : message.name;
    
    // Generate nested messages
    message.nestedMessages.forEach(nested => {
      nestedTypes.push(this.generateMessage(nested, nestedNamespace));
    });
    
    // Generate nested enums (as simple interfaces for now)
    message.nestedEnums.forEach(enumDef => {
      const enumCode = this.generateEnum(enumDef);
      nestedTypes.push({
        interface: enumCode,
        imports: [],
        exports: [`export { ${enumDef.name} }`],
      });
    });
    
    return nestedTypes;
  }
  
  /**
   * Generate enum type
   */
  private generateEnum(enumDef: EnumDefinition): string {
    const lines: string[] = [];
    
    if (this.options.generateComments) {
      lines.push('/**');
      lines.push(` * Enum ${enumDef.name}`);
      lines.push(' */');
    }
    
    lines.push(`export enum ${enumDef.name} {`);
    
    enumDef.values.forEach(value => {
      if (this.options.generateComments) {
        lines.push(`  /** ${value.name} = ${value.number} */`);
      }
      lines.push(`  ${value.name} = ${value.number},`);
    });
    
    lines.push('}');
    
    return lines.join('\n');
  }
  
  /**
   * Get wire type for field
   */
  private getWireType(field: FieldDefinition): string {
    const wireTypes: Record<string, string> = {
      'double': 'FIXED64',
      'float': 'FIXED32',
      'int32': 'VARINT',
      'int64': 'VARINT',
      'uint32': 'VARINT',
      'uint64': 'VARINT',
      'sint32': 'VARINT',
      'sint64': 'VARINT',
      'fixed32': 'FIXED32',
      'fixed64': 'FIXED64',
      'sfixed32': 'FIXED32',
      'sfixed64': 'FIXED64',
      'bool': 'VARINT',
      'string': 'LENGTH_DELIMITED',
      'bytes': 'LENGTH_DELIMITED',
    };
    
    if (field.map || !this.typeMapper.isScalarType(field.type)) {
      return 'LENGTH_DELIMITED';
    }
    
    return wireTypes[field.type] || 'LENGTH_DELIMITED';
  }
  
  /**
   * Get serializer method for field type
   */
  private getSerializerMethod(field: FieldDefinition): string {
    const methods: Record<string, string> = {
      'double': 'writeDouble',
      'float': 'writeFloat',
      'int32': 'writeInt32',
      'int64': 'writeInt64String',  // FIXED: Accepts string for 64-bit integers
      'uint32': 'writeUint32',
      'uint64': 'writeUint64String',  // FIXED: Accepts string for 64-bit integers
      'sint32': 'writeSint32',
      'sint64': 'writeSint64String',  // FIXED: Accepts string for 64-bit integers
      'fixed32': 'writeFixed32',
      'fixed64': 'writeFixed64String',  // FIXED: Accepts string for 64-bit integers
      'sfixed32': 'writeSfixed32',
      'sfixed64': 'writeSfixed64String',  // FIXED: Accepts string for 64-bit integers
      'bool': 'writeBool',
      'string': 'writeString',
      'bytes': 'writeBytes',
    };
    
    if (field.map) {
      return 'writeMessage';
    }
    
    // For repeated fields, we need to check if it's a packed field
    if (field.repeated && this.typeMapper.isScalarType(field.type) && field.type !== 'string' && field.type !== 'bytes') {
      // Use packed methods for numeric repeated fields
      const packedMethods: Record<string, string> = {
        'double': 'writePackedDouble',
        'float': 'writePackedFloat',
        'int32': 'writePackedInt32',
        'int64': 'writePackedInt64',
        'uint32': 'writePackedUint32',
        'uint64': 'writePackedUint64',
        'sint32': 'writePackedSint32',
        'sint64': 'writePackedSint64',
        'fixed32': 'writePackedFixed32',
        'fixed64': 'writePackedFixed64',
        'sfixed32': 'writePackedSfixed32',
        'sfixed64': 'writePackedSfixed64',
        'bool': 'writePackedBool',
      };
      return packedMethods[field.type] || methods[field.type] || 'writeMessage';
    }
    
    return methods[field.type] || 'writeMessage';
  }
  
  /**
   * Get deserializer method for field type
   */
  private getDeserializerMethod(field: FieldDefinition): string {
    const methods: Record<string, string> = {
      'double': 'readDouble',
      'float': 'readFloat',
      'int32': 'readInt32',
      'int64': 'readInt64String',  // FIXED: Returns string for 64-bit integers
      'uint32': 'readUint32',
      'uint64': 'readUint64String',  // FIXED: Returns string for 64-bit integers
      'sint32': 'readSint32',
      'sint64': 'readSint64String',  // FIXED: Returns string for 64-bit integers
      'fixed32': 'readFixed32',
      'fixed64': 'readFixed64String',  // FIXED: Returns string for 64-bit integers
      'sfixed32': 'readSfixed32',
      'sfixed64': 'readSfixed64String',  // FIXED: Returns string for 64-bit integers
      'bool': 'readBool',
      'string': 'readString',
      'bytes': 'readBytes',
    };
    
    if (field.map) {
      return 'readMessage';
    }
    
    // For repeated packed fields, we need to use packed read methods
    if (field.repeated && this.typeMapper.isScalarType(field.type) && field.type !== 'string' && field.type !== 'bytes') {
      const packedMethods: Record<string, string> = {
        'double': 'readPackedDouble',
        'float': 'readPackedFloat',
        'int32': 'readPackedInt32',
        'int64': 'readPackedInt64',
        'uint32': 'readPackedUint32',
        'uint64': 'readPackedUint64',
        'sint32': 'readPackedSint32',
        'sint64': 'readPackedSint64',
        'fixed32': 'readPackedFixed32',
        'fixed64': 'readPackedFixed64',
        'sfixed32': 'readPackedSfixed32',
        'sfixed64': 'readPackedSfixed64',
        'bool': 'readPackedBool',
      };
      return packedMethods[field.type] || methods[field.type] || 'readMessage';
    }
    
    return methods[field.type] || 'readMessage';
  }
  
  /**
   * Get write method for map key type
   */
  private getMapKeyWriteMethod(keyType: string): string {
    const methods: Record<string, string> = {
      'string': 'writeString',
      'int32': 'writeInt32',
      'int64': 'writeInt64',
      'uint32': 'writeUint32',
      'uint64': 'writeUint64',
      'sint32': 'writeSint32',
      'sint64': 'writeSint64',
      'fixed32': 'writeFixed32',
      'fixed64': 'writeFixed64',
      'sfixed32': 'writeSfixed32',
      'sfixed64': 'writeSfixed64',
      'bool': 'writeBool',
    };
    return methods[keyType] || 'writeString';
  }
  
  /**
   * Get write method for map value type
   */
  private getMapValueWriteMethod(valueType: string): string {
    const methods: Record<string, string> = {
      'double': 'writeDouble',
      'float': 'writeFloat',
      'int32': 'writeInt32',
      'int64': 'writeInt64String',  // FIXED: Accepts string for 64-bit integers
      'uint32': 'writeUint32',
      'uint64': 'writeUint64String',  // FIXED: Accepts string for 64-bit integers
      'sint32': 'writeSint32',
      'sint64': 'writeSint64String',  // FIXED: Accepts string for 64-bit integers
      'fixed32': 'writeFixed32',
      'fixed64': 'writeFixed64String',  // FIXED: Accepts string for 64-bit integers
      'sfixed32': 'writeSfixed32',
      'sfixed64': 'writeSfixed64String',  // FIXED: Accepts string for 64-bit integers
      'bool': 'writeBool',
      'string': 'writeString',
      'bytes': 'writeBytes',
    };
    return methods[valueType] || 'writeMessage';
  }
  
  /**
   * Get read method for map key type
   */
  private getMapKeyReadMethod(keyType: string): string {
    const methods: Record<string, string> = {
      'string': 'readString',
      'int32': 'readInt32',
      'int64': 'readInt64',
      'uint32': 'readUint32',
      'uint64': 'readUint64',
      'sint32': 'readSint32',
      'sint64': 'readSint64',
      'fixed32': 'readFixed32',
      'fixed64': 'readFixed64',
      'sfixed32': 'readSfixed32',
      'sfixed64': 'readSfixed64',
      'bool': 'readBool',
    };
    return methods[keyType] || 'readString';
  }
  
  /**
   * Get read method for map value type
   */
  private getMapValueReadMethod(valueType: string): string {
    const methods: Record<string, string> = {
      'double': 'readDouble',
      'float': 'readFloat',
      'int32': 'readInt32',
      'int64': 'readInt64String',  // FIXED: Returns string for 64-bit integers
      'uint32': 'readUint32',
      'uint64': 'readUint64String',  // FIXED: Returns string for 64-bit integers
      'sint32': 'readSint32',
      'sint64': 'readSint64String',  // FIXED: Returns string for 64-bit integers
      'fixed32': 'readFixed32',
      'fixed64': 'readFixed64String',  // FIXED: Returns string for 64-bit integers
      'sfixed32': 'readSfixed32',
      'sfixed64': 'readSfixed64String',  // FIXED: Returns string for 64-bit integers
      'bool': 'readBool',
      'string': 'readString',
      'bytes': 'readBytes',
    };
    return methods[valueType] || 'readMessage';
  }
  
  /**
   * Check if a type can be packed in repeated fields
   */
  private isPackableType(type: string): boolean {
    const packableTypes = [
      'double', 'float',
      'int32', 'int64',
      'uint32', 'uint64',
      'sint32', 'sint64',
      'fixed32', 'fixed64',
      'sfixed32', 'sfixed64',
      'bool',
    ];
    return packableTypes.includes(type);
  }
  
  /**
   * Get default value for field
   */
  private getDefaultValue(field: FieldDefinition): string {
    if (field.repeated) {
      return '[]';
    }
    
    if (field.map) {
      return 'new Map()';
    }
    
    if (field.optional && this.options.typeMappingConfig?.strictNullChecks) {
      return 'undefined';
    }
    
    const defaults: Record<string, string> = {
      'double': '0',
      'float': '0',
      'int32': '0',
      'int64': '"0"',
      'uint32': '0',
      'uint64': '"0"',
      'sint32': '0',
      'sint64': '"0"',
      'fixed32': '0',
      'fixed64': '"0"',
      'sfixed32': '0',
      'sfixed64': '"0"',
      'bool': 'false',
      'string': '""',
      'bytes': 'new Uint8Array()',
    };
    
    return defaults[field.type] || '{}';
  }
  
  /**
   * Generate imports for proto file
   */
  private generateImports(protoFile: ProtoFile): string {
    const imports: string[] = [];
    
    // Always import google-protobuf for serialization
    if (!this.options.interfacesOnly) {
      imports.push('import { BinaryWriter, BinaryReader } from \'google-protobuf\';');
    }
    
    // Import dependencies from other proto files
    protoFile.imports.forEach(importPath => {
      const importName = importPath.replace(/\.proto$/, '');
      const importAlias = this.nameResolver.resolveFieldName(importName);
      imports.push(`import * as ${importAlias} from './${importName}';`);
    });
    
    return imports.join('\n');
  }
  
  /**
   * Generate exports for message
   */
  private generateExports(
    message: MessageDefinition,
    _namespace?: string,
  ): string[] {
    const exports: string[] = [];
    const interfaceName = this.nameResolver.resolveTypeName(message.name, false);
    
    exports.push(`export { ${interfaceName} }`);
    
    // Export nested types
    message.nestedMessages.forEach(nested => {
      const nestedName = this.nameResolver.resolveTypeName(nested.name, false);
      exports.push(`export { ${interfaceName}.${nestedName} }`);
    });
    
    message.nestedEnums.forEach(enumDef => {
      exports.push(`export { ${interfaceName}.${enumDef.name} }`);
    });
    
    return exports;
  }
  
  /**
   * Combine message code parts
   */
  private combineMessageCode(generated: GeneratedMessage): string {
    const parts: string[] = [];

    // Add interface
    parts.push(generated.interface);

    // Add serialization if present
    if (generated.serialization) {
      parts.push(generated.serialization);
    }

    // Add nested types
    if (generated.nestedTypes) {
      generated.nestedTypes.forEach(nested => {
        parts.push(this.combineMessageCode(nested));
      });
    }

    return parts.join('\n\n');
  }
  
  /**
   * Wrap code in namespace if needed
   */
  private wrapInNamespace(code: string, namespace?: string): string {
    if (!namespace || !this.options.generateNamespaces) {
      return code;
    }
    
    const namespaceName = this.typeMapper.mapPackageToNamespace(namespace);
    
    return `export namespace ${namespaceName} {\n${this.indentCode(code)}\n}`;
  }
  
  /**
   * Indent code by 2 spaces
   */
  private indentCode(code: string): string {
    return code.split('\n').map(line => line ? `  ${line}` : '').join('\n');
  }
}

/**
 * Create a MessageGenerator instance
 */
export function createMessageGenerator(
  templateEngine: TemplateEngine,
  options?: MessageGeneratorOptions,
): MessageGenerator {
  return new MessageGenerator(templateEngine, options);
}