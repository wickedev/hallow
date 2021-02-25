import { RpcMethodContext, ServiceBlockContext } from "@hallow/parser";
import { writer } from "repl";
import {
  ClassDeclarationStructure,
  CodeBlockWriter,
  MethodDeclarationStructure,
  OptionalKind,
  PropertyDeclarationStructure,
  Scope,
  StructureKind,
  WriterFunction,
} from "ts-morph";
import { toCapitalizeStyle, toChicagoStyle } from "../../utils";
import { convertTypeInfo } from "../well-known-types";

function resourceDeclaration(
  rpcMethods: RpcMethodContext[]
): OptionalKind<PropertyDeclarationStructure>[] {
  return rpcMethods.map((r) => {
    const rpcName = toChicagoStyle(r.rpcName().text);
    const rpcResponseType = convertTypeInfo(r.rpcType(1).text, true);

    return {
      name: `${rpcName}Resource`,
      type: `Resource<${rpcResponseType.type}>`,
      isReadonly: true,
      scope: Scope.Private,
    };
  });
}
function resourceInitializeWriter(
  rpcMethods: RpcMethodContext[]
): WriterFunction {
  return (writer: CodeBlockWriter) => {
    rpcMethods.forEach((r) => {
      const rpcName = toChicagoStyle(r.rpcName().text);
      writer.writeLine(
        `this.${rpcName}Resource = new Resource(this.${rpcName}.bind(this));`
      );
    });
  };
}

function defaultImplementationMethods(
  serviceNmae: string,
  rpcMethods: RpcMethodContext[]
): OptionalKind<MethodDeclarationStructure>[] {
  return rpcMethods.map((r) => {
    const rpcName = toChicagoStyle(r.rpcName().text);
    const rpcNameTypeName = toCapitalizeStyle(r.rpcName().text);
    const rpcResponseType = convertTypeInfo(r.rpcType(1).text, true);
    const isEmptyRequest = r.rpcType(0).text === "google.protobuf.Empty";

    return {
      name: rpcName,
      parameters: isEmptyRequest
        ? []
        : [
            {
              name: "request",
              type: convertTypeInfo(r.rpcType(0).text, true).type,
            },
          ],
      statements: [
        (writer: CodeBlockWriter) => {
          writer
            .write(
              `return new Promise<${rpcResponseType.type}>((resolve, reject) => {`
            )
            .indent(() => {
              writer
                .write(`grpc.unary(${serviceNmae}Service.${rpcNameTypeName}, {`)
                .indent(() => {
                  writer.writeLine("host: this.client.host,");
                  writer.writeLine("debug: false,");
                  writer.writeLine(
                    "onEnd: createUnaryOnEndHandler(resolve, reject),"
                  );
                  if (isEmptyRequest) {
                    writer.writeLine(`request: new empty_pb.Empty(),`);
                  } else {
                    writer.writeLine(
                      `request: ${
                        convertTypeInfo(r.rpcType(0).text).type
                      }.create(request),`
                    );
                  }
                })
                .writeLine("});");
            })
            .writeLine("});");
        },
      ],

      returnType: `Promise<${rpcResponseType.type}>`,
    };
  });
}

function reactHooksMethods(
  rpcMethods: RpcMethodContext[]
): OptionalKind<MethodDeclarationStructure>[] {
  return rpcMethods.map((r) => {
    const rpcNameAsType = toCapitalizeStyle(r.rpcName().text);
    const rpcName = toChicagoStyle(rpcNameAsType);
    const rpcResourceName = `${rpcName}Resource`;

    const isEmptyRequest = r.rpcType(0).text === "google.protobuf.Empty";
    const isEmptyResponse = r.rpcType(1).text === "google.protobuf.Empty";
    const rpcRequestType = convertTypeInfo(r.rpcType(0).text, true);
    const rpcResponseType = convertTypeInfo(r.rpcType(1).text, true);

    return {
      name: `use${rpcNameAsType}`,
      parameters: isEmptyRequest
        ? []
        : [
            {
              name: "request",
              type: rpcRequestType.protoType,
            },
          ],
      statements: [
        `this.${rpcName}Resource.forceUpdate = useForceUpdate();`,
        `this.${rpcName}Resource.arguments = ${
          isEmptyRequest ? "[]" : "[request]"
        };`,

        (writer: CodeBlockWriter) => {
          writer
            .write("useEffect(() => {")
            .indent(() => {
              writer
                .write(`if (this.${rpcResourceName}.mustBeIgnored) {`)
                .indent(() => {
                  writer.writeLine(
                    `this.${rpcResourceName}.mustBeIgnored = false;`
                  );
                })
                .writeLine("} else {")
                .indent(() => {
                  writer.writeLine(
                    `this.${rpcResourceName}.mustBeIgnored = true;`
                  );
                  writer.writeLine(
                    `this.${rpcResourceName}.arguments = [${
                      isEmptyRequest ? "" : "request"
                    }];`
                  );
                  writer.writeLine(`this.${rpcResourceName}.refresh();`);
                })
                .writeLine("}");
            })
            .writeLine(`}, [${isEmptyRequest ? "" : "request"}]);`);
        },

        `return this.${rpcResourceName};`,
      ],
      returnType: `Resource<${rpcResponseType.type}>`,
    };
  });
}

export function transformToStub(
  ctx: ServiceBlockContext
): ClassDeclarationStructure {
  const rpcMethods = ctx.rpcMethod();
  const serviceNmae = ctx.serviceName().text;

  return {
    name: `${serviceNmae}Stub`,
    isExported: true,
    kind: StructureKind.Class,
    properties: resourceDeclaration(rpcMethods),
    ctors: [
      {
        statements: [resourceInitializeWriter(rpcMethods)],
        parameters: [
          {
            name: "client",
            type: "IClient",
            isReadonly: true,
            scope: Scope.Private,
          },
        ],
      },
    ],
    methods: [
      ...defaultImplementationMethods(serviceNmae, rpcMethods),
      ...reactHooksMethods(rpcMethods),
    ],
  };
}
