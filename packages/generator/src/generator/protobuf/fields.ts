import { FieldContext } from "@hallow/parser";
import {
  CodeBlockWriter,
  GetAccessorDeclarationStructure,
  MethodDeclarationStructure,
  OptionalKind,
  PropertyDeclarationStructure,
  SetAccessorDeclarationStructure,
  StructureKind,
} from "ts-morph";
import { getType, getWrapperType, toFirstLetterCapitalized } from "../utils";

export function getFieldAccessors(
  feilds: FieldContext[]
): OptionalKind<GetAccessorDeclarationStructure>[] {
  return feilds.map((f, idx) => {
    const isRepeated = f.fieldModifier()?.REPEATED();
    const feildType = f.typeReference().text;
    const fieldNumber = idx + 1;

    return {
      name: f.fieldName().text,
      statements: [
        isRepeated
          ? `return jspb.Message.getRepeatedWrapperField(this, ${feildType} as any, ${fieldNumber});`
          : `return jspb.Message.getField(this, ${fieldNumber}) as ${getType(
              f
            )};`,
      ],
      returnType: getWrapperType(f),
    };
  });
}

export function setFieldAccessors(
  feilds: FieldContext[]
): OptionalKind<SetAccessorDeclarationStructure>[] {
  return feilds.map((f, idx) => {
    const isRepeated = f.fieldModifier()?.REPEATED();
    const fieldNumber = idx + 1;

    return {
      name: f.fieldName().text,
      statements: [
        isRepeated
          ? `jspb.Message.setRepeatedWrapperField(this, ${fieldNumber}, value);`
          : `jspb.Message.setField(this, ${fieldNumber}, value);`,
      ],
      parameters: [
        {
          name: "value",
          type: getWrapperType(f),
        },
      ],
    };
  });
}

export function repeatedFields_(
  feilds: FieldContext[]
): OptionalKind<PropertyDeclarationStructure>[] {
  const repeatedFields = feilds.filter(
    (f) => f.fieldModifier()?.REPEATED() != null
  );

  if (repeatedFields.length === 0) {
    return [];
  }

  return [
    {
      name: "repeatedFields_",
      initializer: `[${repeatedFields.map((rf) => rf.tag().INTEGER_VALUE())}]`,
      isStatic: true,
    },
  ];
}

export function repeatedFieldsRef(messageName: string): string {
  return `${messageName}.repeatedFields_`;
}

export function repeatedAddMethods(
  fields: FieldContext[]
): OptionalKind<MethodDeclarationStructure>[] {
  return fields
    .filter((f) => f.fieldModifier()?.REPEATED())
    .map((f) => {
      const fieldType = f.typeReference().text;
      const fieldName = f.fieldName().text;
      const methodSuffix = toFirstLetterCapitalized(fieldName);
      const fieldNumber = f.tag().INTEGER_VALUE().text;

      return {
        name: `add${methodSuffix}`,
        parameters: [
          {
            name: "value",
            type: fieldType,
          },
          {
            hasQuestionToken: true,
            name: "opt_index",
            type: "number",
          },
        ],
        statements: [
          (writer: CodeBlockWriter) => {
            writer
              .write("return jspb.Message.addToRepeatedWrapperField(")
              .indent(() => {
                writer.writeLine("this,");
                writer.writeLine(`${fieldNumber},`);
                writer.writeLine("value,");
                writer.writeLine(`${fieldType} as any,`);
                writer.writeLine("opt_index,");
              })
              .write(");");
          },
        ],
      };
    });
}
