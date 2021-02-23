import { ServiceBlockContext } from "@hallow/parser";
import {
  ClassDeclarationStructure,
  CodeBlockWriter,
  StructureKind,
} from "ts-morph";

export function transformToService(
  ctx: ServiceBlockContext
): ClassDeclarationStructure {
  return {
    implements: ["grpc.ServiceDefinition"],
    name: "GreetingService",
    isExported: true,
    kind: StructureKind.Class,
    properties: [
      {
        name: "serviceName",
        type: "string",
        initializer: '"greeting.GreetingService"',
      },
      {
        name: "service",
        initializer: "new GreetingService()",
        isStatic: true,
      },
      {
        name: "Greeting",
        type:
          "grpc.UnaryMethodDefinition<\n  GreetingRequest,\n  GreetingResponse\n>",
        initializer: (writer: CodeBlockWriter) => {
          writer.block(() => {
            writer.writeLine('methodName: "Greeting",');
            writer.writeLine("service: GreetingService.service,");
            writer.writeLine("requestStream: false,");
            writer.writeLine("responseStream: false,");
            writer.writeLine(
              "requestType: (GreetingRequest as unknown) as ProtobufMessageClass<GreetingRequest>,"
            );
            writer.writeLine(
              "responseType: (GreetingResponse as unknown) as ProtobufMessageClass<GreetingResponse>,"
            );
          });
        },

        isStatic: true,
      },
    ],
  };
}
