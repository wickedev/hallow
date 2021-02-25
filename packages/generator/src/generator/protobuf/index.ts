import { MessageBlockContext } from "@hallow/parser";
import {
  ClassDeclarationStructure,
  CodeBlockWriter,
  ConstructorDeclarationStructure,
  OptionalKind,
  StructureKind,
} from "ts-morph";
import {
  getFieldAccessors,
  repeatedAddMethods,
  repeatedFieldsRef,
  repeatedFields_,
  setFieldAccessors,
} from "./fields";
import { serializeBinaryMethod, toObjectMethod } from "./methods";
import {
  staticCreateMethod,
  staticDeserializeBinary,
  staticDeserializeBinaryFromReader,
  staticSerializeBinaryToWriterMethod,
  staticToObjectMethod,
} from "./static-methods";

function constructor(
  messageName: string,
  hasRepeatedFields: boolean
): OptionalKind<ConstructorDeclarationStructure> {
  const ref = repeatedFieldsRef(messageName);

  return {
    statements: [
      "super();",
      (writer: CodeBlockWriter) => {
        writer
          .write("jspb.Message.initialize(")
          .indent(() => {
            writer.writeLine("this,");
            writer.writeLine("data || [],");
            writer.writeLine("0,");
            writer.writeLine("-1,");
            writer.writeLine(`${hasRepeatedFields ? ref : "undefined"},`);
            writer.writeLine("undefined,");
          })
          .write(");");
      },
    ],
    parameters: [
      {
        name: "data",
        hasQuestionToken: true,
        type: "jspb.Message.MessageArray",
      },
    ],
  };
}

export function transformToProtobufMessage(
  ctx: MessageBlockContext
): ClassDeclarationStructure {
  const messageName = ctx.messageName().text;
  const fields = ctx.field();
  const repeatedFields = repeatedFields_(fields);
  const hasRepeatedFields = repeatedFields.length !== 0;

  return {
    isExported: true,
    kind: StructureKind.Class,
    name: messageName,
    extends: "jspb.Message",
    properties: repeatedFields,
    ctors: [constructor(messageName, hasRepeatedFields)],
    getAccessors: getFieldAccessors(fields),
    setAccessors: setFieldAccessors(fields),
    methods: [
      // repeated add methods
      ...repeatedAddMethods(fields),

      // methods
      serializeBinaryMethod(messageName),
      toObjectMethod(messageName),

      // static methods
      staticCreateMethod(messageName, fields),
      staticToObjectMethod(messageName, fields),

      staticSerializeBinaryToWriterMethod(messageName, fields),
      staticDeserializeBinary(messageName),
      staticDeserializeBinaryFromReader(messageName, fields),
    ],
  };
}
