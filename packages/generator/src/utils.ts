import {
  FieldContext,
  FieldModifierContext
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
