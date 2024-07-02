import {
  ImportStatementContext,
  MessageBlockContext,
  ProtoContext,
  ProtoVisitor,
  ServiceBlockContext,
} from "@hallow/parser";
import {
  InterfaceDeclarationStructure,
  StatementStructures,
  WriterFunction,
} from "ts-morph";
import { defaultImportsWriter, transformToImports } from "./generator/imports";
import { transformToInterface } from "./generator/interfaces";
import { transformToProtobufMessage } from "./generator/protobuf";
import { transformToService } from "./generator/service";
import { transformToStub } from "./generator/stub";

type Statements = StatementStructures | WriterFunction;
export class GrpcProtoGenerator extends ProtoVisitor<Statements[]> {
  private statements: Statements[] = [];

  constructor() {
    super();
    this.statements.push(defaultImportsWriter);
  }

  protected defaultResult(): Statements[] {
    return this.statements;
  }
  visitImportStatement(ctx: ImportStatementContext): Statements[] {
    const result = transformToImports(ctx);
    this.statements.push(result);
    return this.statements;
  }

  visitMessageBlock(ctx: MessageBlockContext): Statements[] {
    const messageInterface = transformToInterface(ctx);
    this.statements.push(messageInterface);

    const messageImpl = transformToProtobufMessage(ctx);
    this.statements.push(messageImpl);

    return this.statements;
  }

  visitServiceBlock(ctx: ServiceBlockContext): Statements[] {
    const service = transformToService(ctx);
    this.statements.push(service);
    const stub = transformToStub(ctx);
    this.statements.push(stub);
    return this.statements;
  }
}
