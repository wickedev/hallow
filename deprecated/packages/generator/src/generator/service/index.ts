import { RpcMethodContext, ServiceBlockContext } from "@hallow/parser";
import { writer } from "repl";
import {
  ClassDeclarationStructure,
  CodeBlockWriter,
  OptionalKind,
  PropertyDeclarationStructure,
  StructureKind,
} from "ts-morph";
import { toCapitalizeStyle } from "../../utils";
import { convertTypeInfo } from "../well-known-types";

function rpcMethodProperties(
  serviceName: string,
  rpcMethods: RpcMethodContext[]
): OptionalKind<PropertyDeclarationStructure>[] {
  return rpcMethods.map((r) => {
    const rpcName = toCapitalizeStyle(r.rpcName().text);
    const rpcRequestTypeCtx = r.rpcType(0);
    const rpcResponseTypeCtx = r.rpcType(1);
    const rpcRequestType = convertTypeInfo(rpcRequestTypeCtx.text);
    const rpcResponseType = convertTypeInfo(rpcResponseTypeCtx.text);
    const isSteramRequest = rpcRequestTypeCtx.STREAM() != null;
    const isSteramResponse = rpcRequestTypeCtx.STREAM() != null;

    return {
      name: rpcName,
      isStatic: true,
      type: (writer: CodeBlockWriter) => {
        writer
          .write("grpc.UnaryMethodDefinition<")
          .indent(() => {
            writer.writeLine(`${rpcRequestType.protoType},`);
            writer.writeLine(`${rpcResponseType.protoType}`);
          })
          .write(">");
      },

      initializer: (writer: CodeBlockWriter) => {
        writer.block(() => {
          writer.writeLine(`methodName: "${rpcName}",`);
          writer.writeLine(`service: ${serviceName}Service.service,`);
          writer.writeLine(`requestStream: ${isSteramRequest},`);
          writer.writeLine(`responseStream: ${isSteramResponse},`);
          writer.writeLine(
            `requestType: (${rpcRequestType.protoType} as unknown) as ProtobufMessageClass<${rpcRequestType.protoType}>,`
          );
          writer.writeLine(
            `responseType: (${rpcResponseType.protoType} as unknown) as ProtobufMessageClass<${rpcResponseType.protoType}>,`
          );
        });
      },
    };
  });
}

export function transformToService(
  ctx: ServiceBlockContext
): ClassDeclarationStructure {
  const serviceName = toCapitalizeStyle(ctx.serviceName().text);
  const rpcMethods = ctx.rpcMethod();

  return {
    implements: ["grpc.ServiceDefinition"],
    name: `${serviceName}Service`,
    isExported: true,
    kind: StructureKind.Class,
    properties: [
      {
        name: "serviceName",
        type: "string",
        initializer: `"greeting.${serviceName}"`,
      },
      {
        name: "service",
        initializer: `new ${serviceName}Service()`,
        isStatic: true,
      },
      ...rpcMethodProperties(serviceName, rpcMethods),
    ],
  };
}
