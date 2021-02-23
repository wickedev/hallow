import {
  FieldContext,
  FieldModifierContext,
  MessageBlockContext,
  ProtoVisitor,
} from "@hallow/parser";

export function isRequired(fieldModifier?: FieldModifierContext) {
  return fieldModifier?.REQUIRED() != null;
}

export function isArray(fieldModifier?: FieldModifierContext) {
  return fieldModifier?.REPEATED() != null;
}

export function isOptional(fieldModifier?: FieldModifierContext) {
  return fieldModifier?.OPTIONAL() != null;
}

export type Optional<T> = T | undefined;

export function getType(field?: FieldContext) {
  const type = field?.typeReference().text;
  const fieldModifier = field?.fieldModifier();
  if (isArray(fieldModifier)) {
    return `${type}[]`;
  }

  return type;
}

export function getWrapperType(field?: FieldContext) {
  const type = field?.typeReference().text;
  const fieldModifier = field?.fieldModifier();
  if (isArray(fieldModifier)) {
    return `${type}[]`;
  }
  if (isOptional(fieldModifier)) {
    return `Optional<${type}>`;
  }

  return type;
}


export function toFirstLetterCapitalized(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export class MessageVisitor<T> extends ProtoVisitor<T[]> {
  private statements: T[] = [];

  constructor(private readonly transfomer: (ctx: MessageBlockContext) => T) {
    super();
  }

  protected defaultResult(): T[] {
    return this.statements;
  }
  visitMessageBlock(ctx: MessageBlockContext): T[] {
    const result = this.transfomer(ctx);
    this.statements.push(result);
    return this.statements;
  }
}
