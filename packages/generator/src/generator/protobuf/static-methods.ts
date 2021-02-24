import { FieldContext } from "@hallow/parser";
import {
  CodeBlockWriter,
  MethodDeclarationStructure,
  OptionalKind,
  StructureKind,
  VariableDeclarationKind,
  WriterFunction
} from "ts-morph";
import { toCapitalizeStyle } from "../../utils";

export function staticCreateMethod(
  messageName: string,
  feilds: FieldContext[]
): OptionalKind<MethodDeclarationStructure> {
  return {
    name: "create",
    statements: [
      {
        kind: StructureKind.VariableStatement,
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: "message",
            initializer: `new ${messageName}([])`,
          },
        ],
      },
      ...feilds.map((f) => {
        const fieldName = f.fieldName().text;
        const fieldType = f.typeReference().text;
        const isRepeated = f.fieldModifier()?.REPEATED();

        if (isRepeated) {
          return `message.${fieldName} = data.${fieldName}.map(${fieldType}.create);`;
        } else {
          return `message.${fieldName} = data.${fieldName};`;
        }
      }),
      "return message;",
    ],
    parameters: [
      {
        name: "data",
        type: `I${messageName}`,
      },
    ],
    returnType: messageName,
    isStatic: true,
  };
}

export function staticDeserializeBinary(
  messageName: string
): OptionalKind<MethodDeclarationStructure>[] {
  return [
    {
      isStatic: true,
      name: "deserializeBinary",
      parameters: [
        {
          name: "bytes",
          type: "Uint8Array",
        },
      ],
      returnType: messageName,
      statements: [
        (writer: CodeBlockWriter) => {
          writer
            .write(`return ${messageName}.deserializeBinaryFromReader(`)
            .indent(() => {
              writer.writeLine(`new ${messageName}(),`);
              writer.writeLine("new jspb.BinaryReader(bytes)");
            })
            .write(");");
        },
      ],
    },
  ];
}

export function staticToObjectMethodFieldWriter(
  fields: FieldContext[]
): WriterFunction {
  return (writer: CodeBlockWriter) => {
    writer
      .write("return {")
      .indent(() => {
        fields.forEach((f, idx) => {
          const fieldName = f.fieldName().text;
          const fieldType = f.typeReference().text;
          const isRepetead = f.fieldModifier()?.REPEATED();

          if (isRepetead) {
            writer
              .write(`${fieldName}: jspb.Message.toObjectList(`)
              .indent(() => {
                writer.writeLine(`message.${fieldName},`);
                writer.writeLine(`${fieldType}.toObject,`);
                writer.writeLine("includeInstance");
              })
              .writeLine(`) as I${fieldType}[],`);
          } else {
            writer.writeLine(`${fieldName}: message.${fieldName},`);
          }
        });
        writer.writeLine(
          "$messageInstance: includeInstance ? message : undefined,"
        );
      })
      .writeLine("};");
  };
}
export function staticToObjectMethod(
  messageName: string,
  feilds: FieldContext[]
): OptionalKind<MethodDeclarationStructure> {
  return {
    name: "toObject",
    statements: [staticToObjectMethodFieldWriter(feilds)],
    parameters: [
      {
        name: "includeInstance",
        type: "boolean",
      },
      {
        name: "message",
        type: messageName,
      },
    ],
    returnType: `I${messageName} & IObject`,
    isStatic: true,
  };
}

export function staticDeserializeBinaryFromReaderFieldWriter(
  fields: FieldContext[]
): WriterFunction {
  return (writer: CodeBlockWriter) => {
    writer.write("while (reader.nextField())").block(() => {
      writer.write("if (reader.isEndGroup())").block(() => {
        writer.writeLine("break;");
      });
      writer.writeLine("const field = reader.getFieldNumber();");
      writer.write("switch (field)").block(() => {
        fields.forEach((f, idx) => {
          const isRepeated = f.fieldModifier()?.REPEATED();
          const fieldType = toCapitalizeStyle(f.typeReference().text);
          const fieldNumber = idx + 1;

          writer.write(`case ${idx + 1}:`).indent(() => {
            if (isRepeated) {
              const fieldName = f.fieldName().text;

              const methodSuffix = toCapitalizeStyle(fieldName);
              writer.writeLine(`const value = new ${fieldType}();`);
              writer.writeLine(
                `reader.readMessage(value, ${fieldType}.deserializeBinaryFromReader);`
              );
              writer.writeLine(`message.add${methodSuffix}(value);`);
            } else {
              writer.writeLine(
                `jspb.Message.setField(message, ${fieldNumber}, reader.read${fieldType}());`
              );
            }

            writer.writeLine("break;");
          });
        });
        writer.writeLine("default:"),
          writer.indent(() => {
            writer.writeLine("reader.skipField();");
            writer.writeLine("break;");
          });
      });
    });
  };
}

export function staticDeserializeBinaryFromReader(
  messageName: string,
  feilds: FieldContext[]
): OptionalKind<MethodDeclarationStructure> {
  return {
    name: "deserializeBinaryFromReader",
    statements: [
      staticDeserializeBinaryFromReaderFieldWriter(feilds),
      "return message;",
    ],
    parameters: [
      {
        name: "message",
        type: messageName,
      },
      {
        name: "reader",
        type: "jspb.BinaryReader",
      },
    ],
    returnType: messageName,
    isStatic: true,
  };
}
