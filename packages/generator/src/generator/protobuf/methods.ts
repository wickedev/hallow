import { FieldContext } from "@hallow/parser";
import {
  CodeBlockWriter,
  MethodDeclarationStructure,
  OptionalKind,
  StructureKind,
  VariableDeclarationKind,
  WriterFunction,
} from "ts-morph";
import { toCapitalizeStyle } from "../../utils";

export function serializeBinaryMethod(
  messageName: string
): OptionalKind<MethodDeclarationStructure> {
  return {
    name: "serializeBinary",
    statements: [
      {
        kind: StructureKind.VariableStatement,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: "writer",
            initializer: "new jspb.BinaryWriter()",
            hasExclamationToken: false,
          },
        ],
      },
      `${messageName}.serializeBinaryToWriter(this, writer);`,
      "return writer.getResultBuffer();",
    ],
    returnType: "Uint8Array",
  };
}

export function toObjectMethod(
  messageName: string
): OptionalKind<MethodDeclarationStructure> {
  return {
    name: "toObject",
    statements: [`return ${messageName}.toObject(includeInstance, this);`],
    parameters: [
      {
        name: "includeInstance",
        initializer: "false",
        type: "boolean",
      },
    ],
    returnType: `I${messageName} & IObject`,
  };
}
