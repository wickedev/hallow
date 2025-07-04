import * as protobuf from 'protobufjs';
import {
  ProtoPackage,
  ProtoService,
  ProtoMethod,
  ProtoMessage,
  ProtoField,
  ProtoEnum,
  ParseResult,
  ParseError,
  ParseWarning,
  ParseOptions
} from '../types/parser';

export class ProtoParser {
  private options: ParseOptions;

  constructor(options: ParseOptions = {}) {
    this.options = {
      keepCase: false,
      alternateCommentMode: false,
      preferTrailingComment: false,
      ...options
    };
  }

  async parseFromString(content: string): Promise<ParseResult> {
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];

    try {
      const root = protobuf.parse(content, {
        keepCase: this.options.keepCase,
        alternateCommentMode: this.options.alternateCommentMode,
        preferTrailingComment: this.options.preferTrailingComment
      }).root;

      const protoPackage = this.convertToProtoPackage(root);
      
      return {
        package: protoPackage,
        errors,
        warnings
      };
    } catch (error) {
      errors.push({
        message: error instanceof Error ? error.message : 'Unknown parsing error'
      });
      
      return {
        package: this.createEmptyPackage(),
        errors,
        warnings
      };
    }
  }

  async parseFromFile(filePath: string): Promise<ParseResult> {
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];

    try {
      const root = await protobuf.load(filePath);
      const protoPackage = this.convertToProtoPackage(root);
      
      return {
        package: protoPackage,
        errors,
        warnings
      };
    } catch (error) {
      errors.push({
        message: error instanceof Error ? error.message : 'Unknown parsing error'
      });
      
      return {
        package: this.createEmptyPackage(),
        errors,
        warnings
      };
    }
  }

  private convertToProtoPackage(root: protobuf.Root): ProtoPackage {
    const services: Record<string, ProtoService> = {};
    const messages: Record<string, ProtoMessage> = {};
    const enums: Record<string, ProtoEnum> = {};

    this.extractFromNamespace(root, services, messages, enums);

    return {
      name: root.name || undefined,
      syntax: 'proto3',
      imports: [],
      services,
      messages,
      enums
    };
  }

  private extractFromNamespace(
    namespace: protobuf.Namespace,
    services: Record<string, ProtoService>,
    messages: Record<string, ProtoMessage>,
    enums: Record<string, ProtoEnum>
  ): void {
    namespace.nestedArray.forEach(nested => {
      if (nested instanceof protobuf.Service) {
        services[nested.name] = this.convertService(nested);
      } else if (nested instanceof protobuf.Type) {
        messages[nested.name] = this.convertMessage(nested);
      } else if (nested instanceof protobuf.Enum) {
        enums[nested.name] = this.convertEnum(nested);
      } else if (nested instanceof protobuf.Namespace) {
        this.extractFromNamespace(nested, services, messages, enums);
      }
    });
  }

  private convertService(service: protobuf.Service): ProtoService {
    const methods: ProtoMethod[] = [];

    Object.values(service.methods).forEach(method => {
      methods.push({
        name: method.name,
        requestType: method.requestType,
        responseType: method.responseType,
        requestStream: method.requestStream || false,
        responseStream: method.responseStream || false,
        options: method.options || {}
      });
    });

    return {
      name: service.name,
      methods,
      options: service.options || {}
    };
  }

  private convertMessage(type: protobuf.Type): ProtoMessage {
    const fields: ProtoField[] = [];
    const nested: Record<string, ProtoMessage> = {};

    Object.values(type.fields).forEach(field => {
      fields.push({
        name: field.name,
        type: field.type,
        number: field.id,
        options: field.options || {}
      });
    });

    type.nestedArray.forEach(nestedType => {
      if (nestedType instanceof protobuf.Type) {
        nested[nestedType.name] = this.convertMessage(nestedType);
      }
    });

    return {
      name: type.name,
      fields,
      nested: Object.keys(nested).length > 0 ? nested : undefined
    };
  }

  private convertEnum(enumType: protobuf.Enum): ProtoEnum {
    return {
      name: enumType.name,
      values: enumType.values
    };
  }

  private createEmptyPackage(): ProtoPackage {
    return {
      syntax: 'proto3',
      imports: [],
      services: {},
      messages: {},
      enums: {}
    };
  }

  extractServiceNames(protoPackage: ProtoPackage): string[] {
    return Object.keys(protoPackage.services);
  }

  extractMessageNames(protoPackage: ProtoPackage): string[] {
    return Object.keys(protoPackage.messages);
  }

  getServiceMethods(protoPackage: ProtoPackage, serviceName: string): ProtoMethod[] {
    const service = protoPackage.services[serviceName];
    return service ? service.methods : [];
  }
}