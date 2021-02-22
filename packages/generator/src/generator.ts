import { MessageBlockContext, ProtoVisitor } from "@hallow/parser";
import { StatementStructures } from "ts-morph";
import { transformToInterface } from "./generator/interfaces";
import { transformToProtobufMessage } from "./generator/protobuf";

export class gRpcProtoGenerator extends ProtoVisitor<StatementStructures[]> {
  private statements: StatementStructures[] = [];

  protected defaultResult(): StatementStructures[] {
    return this.statements;
  }

  visitMessageBlock(ctx: MessageBlockContext): StatementStructures[] {
    const messageInterface = transformToInterface(ctx);
    this.statements.push(messageInterface);

    const messageImpl = transformToProtobufMessage(ctx);
    this.statements.push(messageImpl);

    return this.statements;
  }

  /* visitServiceBlock(ctx: ServiceBlockContext): InterfaceDeclarationStructure[] {
    return [];
  } */
}
