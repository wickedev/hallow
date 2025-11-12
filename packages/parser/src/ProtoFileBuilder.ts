/**
 * ProtoFileBuilder - builds ProtoFile AST from ANTLR parse tree
 *
 * This class visits the ANTLR parse tree and extracts protobuf definitions
 * into a structured ProtoFile object.
 *
 * @packageDocumentation
 */

import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';
import { Protobuf3Visitor } from './generated/grammar/Protobuf3Visitor';
import {
  ProtoContext,
  SyntaxContext,
  ImportStatementContext,
  PackageStatementContext,
  ServiceDefContext,
  MessageDefContext,
  EnumDefContext,
  RpcContext,
  FieldContext,
  EnumFieldContext,
} from './generated/grammar/Protobuf3Parser';
import {
  ProtoFile,
  ServiceDefinition,
  MessageDefinition,
  EnumDefinition,
  MethodDefinition,
  FieldDefinition,
  EnumValueDefinition,
} from './types';

/**
 * Visitor that builds a ProtoFile AST from ANTLR parse tree
 */
export class ProtoFileBuilder extends AbstractParseTreeVisitor<any> implements Protobuf3Visitor<any> {
  private protoFile: ProtoFile;

  constructor(fileName: string) {
    super();
    this.protoFile = {
      fileName,
      package: undefined,
      syntax: undefined,
      imports: [],
      services: [],
      messages: [],
      enums: [],
      options: {},
    };
  }

  /**
   * Build ProtoFile from parse tree
   */
  build(ctx: ProtoContext): ProtoFile {
    this.visit(ctx);
    return this.protoFile;
  }

  /**
   * Default result for unhandled nodes
   */
  protected defaultResult(): any {
    return null;
  }

  /**
   * Visit proto context (root)
   */
  visitProto(ctx: ProtoContext): any {
    // Visit all children
    return this.visitChildren(ctx);
  }

  /**
   * Visit syntax declaration
   */
  visitSyntax(ctx: SyntaxContext): any {
    const syntaxText = ctx.text;
    const match = syntaxText.match(/syntax\s*=\s*["']([^"']+)["']/);
    if (match) {
      this.protoFile.syntax = match[1];
    }
    return this.visitChildren(ctx);
  }

  /**
   * Visit import statement
   */
  visitImportStatement(ctx: ImportStatementContext): any {
    const importText = ctx.text;
    const match = importText.match(/import\s+(?:public\s+|weak\s+)?["']([^"']+)["']/);
    if (match) {
      this.protoFile.imports.push(match[1]);
    }
    return this.visitChildren(ctx);
  }

  /**
   * Visit package statement
   */
  visitPackageStatement(ctx: PackageStatementContext): any {
    const packageText = ctx.text;
    const match = packageText.match(/package\s+([^;]+);/);
    if (match) {
      this.protoFile.package = match[1].trim();
    }
    return this.visitChildren(ctx);
  }

  /**
   * Visit service definition
   */
  visitServiceDef(ctx: ServiceDefContext): any {
    const serviceName = this.extractServiceName(ctx);

    const service: ServiceDefinition = {
      name: serviceName,
      methods: [],
      options: {},
    };

    // Extract methods
    for (let i = 0; i < ctx.childCount; i++) {
      const child = ctx.getChild(i);
      if (child instanceof RpcContext) {
        const method = this.extractMethod(child);
        if (method) {
          service.methods.push(method);
        }
      }
    }

    this.protoFile.services.push(service);

    return this.visitChildren(ctx);
  }

  /**
   * Visit message definition
   */
  visitMessageDef(ctx: MessageDefContext): any {
    const message = this.extractMessage(ctx);
    if (message) {
      this.protoFile.messages.push(message);
    }
    return this.visitChildren(ctx);
  }

  /**
   * Visit enum definition
   */
  visitEnumDef(ctx: EnumDefContext): any {
    const enumDef = this.extractEnum(ctx);
    if (enumDef) {
      this.protoFile.enums.push(enumDef);
    }
    return this.visitChildren(ctx);
  }

  /**
   * Extract service name from context
   */
  private extractServiceName(ctx: ServiceDefContext): string {
    const text = ctx.text;
    const match = text.match(/service\s+(\w+)/);
    return match ? match[1] : 'UnknownService';
  }

  /**
   * Extract method from RPC context
   */
  private extractMethod(ctx: RpcContext): MethodDefinition | null {
    try {
      const text = ctx.text;
      // Match: rpc MethodName (stream? InputType) returns (stream? OutputType)
      const match = text.match(/rpc\s+(\w+)\s*\((\s*stream\s+)?([^)]+)\)\s*returns\s*\((\s*stream\s+)?([^)]+)\)/);

      if (!match) {
        return null;
      }

      return {
        name: match[1],
        inputType: match[3].trim(),
        outputType: match[5].trim(),
        clientStreaming: !!match[2],
        serverStreaming: !!match[4],
        options: {},
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract message definition
   */
  private extractMessage(ctx: MessageDefContext): MessageDefinition | null {
    try {
      const text = ctx.text;
      const match = text.match(/message\s+(\w+)/);
      const name = match ? match[1] : 'UnknownMessage';

      const message: MessageDefinition = {
        name,
        fields: [],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {},
      };

      // Extract fields
      for (let i = 0; i < ctx.childCount; i++) {
        const child = ctx.getChild(i);
        if (child instanceof FieldContext) {
          const field = this.extractField(child);
          if (field) {
            message.fields.push(field);
          }
        } else if (child instanceof MessageDefContext) {
          const nested = this.extractMessage(child);
          if (nested) {
            message.nestedMessages.push(nested);
          }
        } else if (child instanceof EnumDefContext) {
          const nested = this.extractEnum(child);
          if (nested) {
            message.nestedEnums.push(nested);
          }
        }
      }

      return message;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract field definition
   */
  private extractField(ctx: FieldContext): FieldDefinition | null {
    try {
      const text = ctx.text;
      // Match: (repeated)? type name = number
      const match = text.match(/(repeated\s+)?(\w+)\s+(\w+)\s*=\s*(\d+)/);

      if (!match) {
        return null;
      }

      return {
        name: match[3],
        number: parseInt(match[4], 10),
        type: match[2],
        repeated: !!match[1],
        optional: false,
        map: false,
        options: {},
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract enum definition
   */
  private extractEnum(ctx: EnumDefContext): EnumDefinition | null {
    try {
      const text = ctx.text;
      const match = text.match(/enum\s+(\w+)/);
      const name = match ? match[1] : 'UnknownEnum';

      const enumDef: EnumDefinition = {
        name,
        values: [],
        options: {},
      };

      // Extract enum values
      for (let i = 0; i < ctx.childCount; i++) {
        const child = ctx.getChild(i);
        if (child instanceof EnumFieldContext) {
          const value = this.extractEnumValue(child);
          if (value) {
            enumDef.values.push(value);
          }
        }
      }

      return enumDef;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract enum value definition
   */
  private extractEnumValue(ctx: EnumFieldContext): EnumValueDefinition | null {
    try {
      const text = ctx.text;
      // Match: NAME = number
      const match = text.match(/(\w+)\s*=\s*(-?\d+)/);

      if (!match) {
        return null;
      }

      return {
        name: match[1],
        number: parseInt(match[2], 10),
        options: {},
      };
    } catch (error) {
      return null;
    }
  }
}
