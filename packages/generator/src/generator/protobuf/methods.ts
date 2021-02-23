import { FieldContext } from "@hallow/parser";
import {
  CodeBlockWriter,
  MethodDeclarationStructure,
  OptionalKind,
  StructureKind,
  VariableDeclarationKind,
  WriterFunction,
} from "ts-morph";
import { toFirstLetterCapitalized } from "../utils";

export function serializeBinaryMethod(): OptionalKind<MethodDeclarationStructure> {
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
      "this.serializeBinaryToWriter(writer);",
      "return writer.getResultBuffer();",
    ],
    returnType: "Uint8Array",
  };
}

export function fieldsSerializeBinaryToWriter(
  fields: FieldContext[]
): WriterFunction {
  return (writer: CodeBlockWriter) => {
    fields.forEach((f, idx) => {
      const feildType = toFirstLetterCapitalized(f.typeReference().text);
      const fieldName = f.fieldName().text;
      const fieldNumber = idx + 1;
      const isRepeated = f.fieldModifier()?.REPEATED();

      if (isRepeated) {
        writer.write(`if ((v = this.${fieldName}).length > 0)`).block(() => {
          writer.writeLine(
            `writer.writeRepeatedMessage(${fieldNumber}, v, ${feildType}.serializeBinaryToWriter);`
          );
        });
        return;
      }

      writer.write(`if ((v = this.${fieldName}) != null)`).block(() => {
        writer.writeLine(`writer.write${feildType}(${fieldNumber}, v);`);
      });
    });
  };
}

export function serializeBinaryToWriterMethod(
  feilds: FieldContext[]
): OptionalKind<MethodDeclarationStructure> {
  return {
    name: "serializeBinaryToWriter",
    statements: [
      {
        kind: StructureKind.VariableStatement,
        declarationKind: VariableDeclarationKind.Let,
        declarations: [
          {
            name: "v",
          },
        ],
      },
      fieldsSerializeBinaryToWriter(feilds),
    ],
    parameters: [
      {
        name: "writer",
        type: "jspb.BinaryWriter",
      },
    ],
    returnType: "void",
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
