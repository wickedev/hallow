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
   * Visit syntax declaration using ANTLR accessors
   * Grammar: SYNTAX EQ (PROTO3_LIT_SINGLE | PROTO3_LIT_DOBULE) SEMI
   */
  visitSyntax(ctx: SyntaxContext): any {
    try {
      // PROTO3_LIT_SINGLE is "proto3" and PROTO3_LIT_DOBULE is 'proto3'
      // Both are defined as literals in the grammar, so just extract "proto3"
      const proto3Single = ctx.PROTO3_LIT_SINGLE();
      const proto3Double = ctx.PROTO3_LIT_DOBULE();

      if (proto3Single || proto3Double) {
        this.protoFile.syntax = 'proto3';
      }
    } catch (error) {
      // Syntax extraction failed, leave as undefined
    }
    return this.visitChildren(ctx);
  }

  /**
   * Visit import statement using ANTLR accessors
   * Grammar: IMPORT (WEAK | PUBLIC)? strLit SEMI
   */
  visitImportStatement(ctx: ImportStatementContext): any {
    try {
      const strLitCtx = ctx.strLit();
      if (strLitCtx) {
        // strLit includes quotes, need to strip them
        let importPath = strLitCtx.text;
        // Remove surrounding quotes (single or double)
        if ((importPath.startsWith('"') && importPath.endsWith('"')) ||
            (importPath.startsWith("'") && importPath.endsWith("'"))) {
          importPath = importPath.slice(1, -1);
        }
        this.protoFile.imports.push(importPath);
      }
    } catch (error) {
      // Import extraction failed, skip this import
    }
    return this.visitChildren(ctx);
  }

  /**
   * Visit package statement
   */
  visitPackageStatement(ctx: PackageStatementContext): any {
    try {
      const fullIdentCtx = ctx.fullIdent();
      if (fullIdentCtx) {
        this.protoFile.package = fullIdentCtx.text;
      }
    } catch (error) {
      // Package extraction failed, leave as undefined
    }
    return this.visitChildren(ctx);
  }

  /**
   * Visit service definition using ANTLR accessors
   */
  visitServiceDef(ctx: ServiceDefContext): any {
    const serviceName = this.extractServiceName(ctx);

    const service: ServiceDefinition = {
      name: serviceName,
      methods: [],
      options: {},
    };

    // Extract methods using proper ANTLR accessor
    // ServiceDef contains ServiceElement children, not direct RPC children
    const serviceElements = ctx.serviceElement();
    if (serviceElements) {
      for (const serviceElement of serviceElements) {
        const rpcCtx = serviceElement.rpc();
        if (rpcCtx) {
          const method = this.extractMethod(rpcCtx);
          if (method) {
            service.methods.push(method);
          }
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
   * Extract service name from context using ANTLR accessors
   */
  private extractServiceName(ctx: ServiceDefContext): string {
    try {
      const serviceNameCtx = ctx.serviceName();
      if (!serviceNameCtx) {
        return 'UnknownService';
      }
      const identCtx = serviceNameCtx.ident();
      if (!identCtx) {
        return 'UnknownService';
      }
      return identCtx.text;
    } catch (error) {
      return 'UnknownService';
    }
  }

  /**
   * Extract method from RPC context using ANTLR accessors
   */
  private extractMethod(ctx: RpcContext): MethodDefinition | null {
    try {
      // Get method name
      const rpcNameCtx = ctx.rpcName();
      if (!rpcNameCtx) {
        return null;
      }
      const identCtx = rpcNameCtx.ident();
      if (!identCtx) {
        return null;
      }
      const name = identCtx.text;

      // Get input and output message types
      const messageTypes = ctx.messageType();
      if (!messageTypes || messageTypes.length !== 2) {
        return null;
      }

      const inputType = messageTypes[0].text.trim();
      const outputType = messageTypes[1].text.trim();

      // Check for streaming - STREAM tokens can appear before input and/or output types
      const streamTokens = ctx.STREAM();
      let clientStreaming = false;
      let serverStreaming = false;

      // If we have stream tokens, we need to determine which apply to input vs output
      // by checking their position in the parse tree
      if (streamTokens && streamTokens.length > 0) {
        const returnsToken = ctx.RETURNS();
        const returnsIndex = returnsToken?.symbol.tokenIndex ?? -1;

        for (let i = 0; i < streamTokens.length; i++) {
          const streamIndex = streamTokens[i].symbol.tokenIndex;
          if (returnsIndex > 0 && streamIndex < returnsIndex) {
            clientStreaming = true;
          } else {
            serverStreaming = true;
          }
        }
      }

      return {
        name,
        inputType,
        outputType,
        clientStreaming,
        serverStreaming,
        options: {},
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract message definition using ANTLR accessors
   */
  private extractMessage(ctx: MessageDefContext): MessageDefinition | null {
    try {
      // Get message name using proper accessor
      const messageNameCtx = ctx.messageName();
      if (!messageNameCtx) {
        return null;
      }
      const identCtx = messageNameCtx.ident();
      if (!identCtx) {
        return null;
      }
      const name = identCtx.text;

      const message: MessageDefinition = {
        name,
        fields: [],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {},
      };

      // Extract fields and nested definitions using proper accessors
      const messageBody = ctx.messageBody();
      if (messageBody) {
        const messageElements = messageBody.messageElement();
        if (messageElements) {
          for (const messageElement of messageElements) {
            // Check for field
            const fieldCtx = messageElement.field();
            if (fieldCtx) {
              const field = this.extractField(fieldCtx);
              if (field) {
                message.fields.push(field);
              }
            }

            // Check for nested message
            const nestedMsgCtx = messageElement.messageDef();
            if (nestedMsgCtx) {
              const nested = this.extractMessage(nestedMsgCtx);
              if (nested) {
                message.nestedMessages.push(nested);
              }
            }

            // Check for nested enum
            const nestedEnumCtx = messageElement.enumDef();
            if (nestedEnumCtx) {
              const nested = this.extractEnum(nestedEnumCtx);
              if (nested) {
                message.nestedEnums.push(nested);
              }
            }
          }
        }
      }

      return message;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract field definition using ANTLR accessors
   * Grammar: fieldLabel? type_ fieldName EQ fieldNumber (LB fieldOptions RB)? SEMI
   */
  private extractField(ctx: FieldContext): FieldDefinition | null {
    try {
      // Get field type
      const typeCtx = ctx.type_();
      if (!typeCtx) {
        return null;
      }
      const type = typeCtx.text;

      // Get field name
      const fieldNameCtx = ctx.fieldName();
      if (!fieldNameCtx) {
        return null;
      }
      const identCtx = fieldNameCtx.ident();
      if (!identCtx) {
        return null;
      }
      const name = identCtx.text;

      // Get field number
      const fieldNumberCtx = ctx.fieldNumber();
      if (!fieldNumberCtx) {
        return null;
      }
      const intLitCtx = fieldNumberCtx.intLit();
      if (!intLitCtx) {
        return null;
      }
      const number = parseInt(intLitCtx.text, 10);

      // Check for field label (optional or repeated)
      const fieldLabelCtx = ctx.fieldLabel();
      let repeated = false;
      let optional = false;

      if (fieldLabelCtx) {
        if (fieldLabelCtx.REPEATED()) {
          repeated = true;
        } else if (fieldLabelCtx.OPTIONAL()) {
          optional = true;
        }
      }

      return {
        name,
        number,
        type,
        repeated,
        optional,
        map: false,
        options: {},
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract enum definition using ANTLR accessors
   */
  private extractEnum(ctx: EnumDefContext): EnumDefinition | null {
    try {
      // Get enum name using proper accessor
      const enumNameCtx = ctx.enumName();
      if (!enumNameCtx) {
        return null;
      }
      const identCtx = enumNameCtx.ident();
      if (!identCtx) {
        return null;
      }
      const name = identCtx.text;

      const enumDef: EnumDefinition = {
        name,
        values: [],
        options: {},
      };

      // Extract enum values using proper accessors
      const enumBody = ctx.enumBody();
      if (enumBody) {
        const enumElements = enumBody.enumElement();
        if (enumElements) {
          for (const enumElement of enumElements) {
            const enumFieldCtx = enumElement.enumField();
            if (enumFieldCtx) {
              const value = this.extractEnumValue(enumFieldCtx);
              if (value) {
                enumDef.values.push(value);
              }
            }
          }
        }
      }

      return enumDef;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extract enum value definition using ANTLR accessors
   * Grammar: ident EQ (MINUS)? intLit enumValueOptions? SEMI
   */
  private extractEnumValue(ctx: EnumFieldContext): EnumValueDefinition | null {
    try {
      // Get enum value name
      const identCtx = ctx.ident();
      if (!identCtx) {
        return null;
      }
      const name = identCtx.text;

      // Get enum value number
      const intLitCtx = ctx.intLit();
      if (!intLitCtx) {
        return null;
      }
      let numberStr = intLitCtx.text;

      // Check for MINUS token
      const minusToken = ctx.MINUS();
      if (minusToken) {
        numberStr = '-' + numberStr;
      }

      const number = parseInt(numberStr, 10);

      return {
        name,
        number,
        options: {},
      };
    } catch (error) {
      return null;
    }
  }
}
