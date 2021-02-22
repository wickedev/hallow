import { MessageBlockContext } from "@hallow/parser";
import {
  InterfaceDeclarationStructure,
  OptionalKind,
  PropertySignatureStructure,
  StructureKind,
} from "ts-morph";
import { getType, isOptional } from "./utils";

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
      type: getType(f),
    }));

  const messageInterface: InterfaceDeclarationStructure = {
    isExported: true,
    kind: StructureKind.Interface,
    name: messageName,
    properties,
  };

  return messageInterface;
}
