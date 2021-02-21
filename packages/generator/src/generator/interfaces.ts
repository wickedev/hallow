import {
  MessageBlockContext,
  ProtoVisitor,
  FieldModifierContext,
  FieldContext,
} from "@hallow/parser";
import {
  InterfaceDeclarationStructure,
  OptionalKind,
  PropertySignatureStructure,
  StructureKind,
} from "ts-morph";

function isRequired(fieldModifier?: FieldModifierContext) {
  return fieldModifier?.REQUIRED() != null;
}

function isArray(fieldModifier?: FieldModifierContext) {
  return fieldModifier?.REPEATED() != null;
}

function isOptional(fieldModifier?: FieldModifierContext) {
  return fieldModifier?.OPTIONAL() != null;
}

function getType(field?: FieldContext) {
  const type = field?.typeReference().text;
  if (isArray(field?.fieldModifier())) {
    return `${type}[]`;
  }

  return type;
}

export class MessageInterfaceGenerator extends ProtoVisitor<
  InterfaceDeclarationStructure[]
> {
  private interfaces: InterfaceDeclarationStructure[] = [];

  protected defaultResult(): InterfaceDeclarationStructure[] {
    return this.interfaces;
  }

  visitMessageBlock(ctx: MessageBlockContext): InterfaceDeclarationStructure[] {
    const messageName = `I${ctx.messageName().ident().text}`;

    const properties: OptionalKind<PropertySignatureStructure>[] = ctx
      .field()
      .map((f) => ({
        isReadonly: true,
        hasQuestionToken: isOptional(f.fieldModifier()),
        name: f.fieldName().ident().text,
        type: getType(f),
      }));

    const message: InterfaceDeclarationStructure = {
      isExported: true,
      kind: StructureKind.Interface,
      name: messageName,
      properties,
    };

    this.interfaces.push(message);

    return this.interfaces;
  }
}
