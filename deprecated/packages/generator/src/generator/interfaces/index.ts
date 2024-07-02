import { FieldContext, MessageBlockContext } from "@hallow/parser";
import {
  InterfaceDeclarationStructure,
  OptionalKind,
  PropertySignatureStructure,
  StructureKind,
} from "ts-morph";
import { isArray, isOptional } from "../../utils";

function getTypeForInterface(field?: FieldContext) {
  const type = field?.typeReference().text;
  const fieldModifier = field?.fieldModifier();
  if (isArray(fieldModifier)) {
    return `I${type}[]`;
  }

  return type;
}

export function transformToInterface(
  ctx: MessageBlockContext
): InterfaceDeclarationStructure {
  const messageName = `I${ctx.messageName().text}`;

  const properties: OptionalKind<PropertySignatureStructure>[] = ctx
    .field()
    .map((f) => ({
      isReadonly: true,
      hasQuestionToken: isOptional(f.fieldModifier()),
      name: f.fieldName().text,
      type: getTypeForInterface(f),
    }));

  const messageInterface: InterfaceDeclarationStructure = {
    isExported: true,
    kind: StructureKind.Interface,
    name: messageName,
    properties,
  };

  return messageInterface;
}
