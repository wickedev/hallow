/**
 * MessageGenerator - TypeScript interface and serialization code generation
 *
 * This class handles the generation of TypeScript interfaces from message
 * definitions, including support for nested messages, proper namespace
 * structure, and integration with google-protobuf for serialization.
 */
import { TemplateEngine } from '../core/template-engine';
import { MessageDefinition, ProtoFile } from '../core/proto-types';
import { TypeMappingConfig } from '../utils/TypeMapper';
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
 * MessageGenerator class for generating TypeScript interfaces and serialization code
 */
export declare class MessageGenerator {
    private templateEngine;
    private typeMapper;
    private nameResolver;
    private importManager;
    private optionProcessor;
    private options;
    private enumRegistry;
    private currentMessageEnums;
    constructor(templateEngine: TemplateEngine, options?: MessageGeneratorOptions);
    /**
     * Load Handlebars templates for message generation
     */
    private loadTemplates;
    /**
     * Generate TypeScript interface from message definition
     */
    generateInterface(message: MessageDefinition, namespace?: string): string;
    /**
     * Generate serialization code for message
     */
    generateSerialization(message: MessageDefinition, namespace?: string): string;
    /**
     * Generate complete message code (interface + serialization)
     */
    generateMessage(message: MessageDefinition, namespace?: string): GeneratedMessage;
    /**
     * Generate all messages from a proto file
     */
    generateMessages(protoFile: ProtoFile): string;
    /**
     * Create message context for template rendering
     */
    private createMessageContext;
    /**
     * Create field context for template rendering
     */
    private createFieldContext;
    /**
     * Create oneof context for template rendering
     */
    private createOneofContext;
    /**
     * Create enum context for template rendering
     */
    private createEnumContext;
    /**
     * Generate interface code programmatically (fallback)
     */
    private generateInterfaceProgrammatically;
    /**
     * Generate serialization code programmatically (fallback)
     */
    private generateSerializationProgrammatically;
    /**
     * Generate Message class for grpc-web compatibility
     */
    private generateMessageClass;
    /**
     * Generate encode method
     */
    private generateEncodeMethod;
    /**
     * Generate decode method
     */
    private generateDecodeMethod;
    /**
     * Generate nested types
     */
    private generateNestedTypes;
    /**
     * Generate enum type
     */
    private generateEnum;
    /**
     * Get wire type for field
     */
    private getWireType;
    /**
     * Get serializer method for field type
     */
    private getSerializerMethod;
    /**
     * Get deserializer method for field type
     */
    private getDeserializerMethod;
    /**
     * Get write method for map key type
     */
    private getMapKeyWriteMethod;
    /**
     * Get write method for map value type
     */
    private getMapValueWriteMethod;
    /**
     * Get read method for map key type
     */
    private getMapKeyReadMethod;
    /**
     * Get read method for map value type
     */
    private getMapValueReadMethod;
    /**
     * Check if a type can be packed in repeated fields
     */
    private isPackableType;
    /**
     * Check if a field is an enum type
     * Uses the enum registry to determine if a field references an enum type.
     */
    private isEnumField;
    /**
     * Register enum types from a proto file
     * Should be called before generating messages to populate the enum registry
     */
    registerEnumTypes(protoFile: ProtoFile): void;
    /**
     * Get default value for field
     */
    private getDefaultValue;
    /**
     * Generate imports for proto file
     */
    private generateImports;
    /**
     * Generate exports for message
     */
    private generateExports;
    /**
     * Combine message code parts
     */
    private combineMessageCode;
    /**
     * Wrap code in namespace if needed
     */
    private wrapInNamespace;
    /**
     * Indent code by 2 spaces
     */
    private indentCode;
}
/**
 * Create a MessageGenerator instance
 */
export declare function createMessageGenerator(templateEngine: TemplateEngine, options?: MessageGeneratorOptions): MessageGenerator;
//# sourceMappingURL=MessageGenerator.d.ts.map