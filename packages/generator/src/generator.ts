import { ParseTree } from "antlr4ts/tree";
import { XPath } from "antlr4ts/tree/xpath";
import { Trees } from "antlr4ts/tree/Trees";
import ts, {
  InterfaceDeclaration,
  KeywordTypeNode,
  NodeArray,
  SourceFile,
  TypeElement,
  TypeNode,
  visitEachChild
} from "typescript";
import {
  MessageBlockContext,
  parse,
  ProtoVisitor,
  ProtoParser
} from "@suited-grpc/parser";

interface IMessage {
  name: string;
  fields: IField[];
}

interface IField {
  name: string;
  type: string;
  modifier?: string;
}

function getFirst<T>(set: Set<T>): T | undefined {
  for (const value of set) {
    return value;
  }

  return undefined;
}

function wrapType(field: IField, type: ts.TypeNode): ts.TypeNode | undefined {
  if (field.modifier === "repeated") {
    return ts.createArrayTypeNode(type);
  }
}

function getType(field: IField): ts.TypeNode | undefined {
  let type: ts.TypeNode;

  switch (field.type) {
    case "string": {
      type = ts.createKeywordTypeNode(ts.SyntaxKind.StringKeyword);
    }
  }
  type = ts.createTypeReferenceNode(field.type, []);

  if (field.modifier === "repeated") {
    return wrapType(field, type);
  }

  return type;
}

class MessageInterfaceGenerator extends ProtoVisitor<MessageBlockContext> {
  private readonly messages: IMessage[] = [];

  constructor(private readonly parser: ProtoParser) {
    super();
  }

  protected defaultResult(): MessageBlockContext {
    return null as any;
  }

  visitMessageBlock(ctx: MessageBlockContext): MessageBlockContext {
    const messageNameCtx = XPath.findAll(
      ctx,
      "//messageName/ident",
      this.parser
    );
    const fieldsCtx = XPath.findAll(ctx, "//field", this.parser);

    const messageName = getFirst(messageNameCtx);

    if (messageName?.text) {
      const fields: IField[] = [];

      for (let fieldCtx of fieldsCtx) {
        const modifierCtx = XPath.findAll(
          fieldCtx,
          "//fieldModifier",
          this.parser
        );
        const typeCtx = XPath.findAll(fieldCtx, "//typeReference", this.parser);
        const fieldNameCtx = XPath.findAll(
          fieldCtx,
          "//fieldName/ident",
          this.parser
        );

        const type = getFirst(typeCtx)?.text;
        const name = getFirst(fieldNameCtx)?.text;
        const modifier = getFirst(modifierCtx)?.text;

        if (type && name) {
          fields.push({
            type,
            name,
            modifier
          });
        }
      }

      this.messages.push({
        name: messageName?.text,
        fields
      });
    }

    return ctx;
  }

  generate(): InterfaceDeclaration[] {
    this.visit(this.parser.proto());

    const result: InterfaceDeclaration[] = [];

    for (let message of this.messages) {
      const identifier = ts.createIdentifier(message.name);
      const members: TypeElement[] = [];

      for (let field of message.fields) {
        members.push(
          ts.createPropertySignature(
            undefined,
            field.name,
            undefined,
            getType(field),
            undefined
          )
        );
      }

      const interfaceDeclaration = ts.createInterfaceDeclaration(
        undefined,
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        identifier,
        undefined,
        undefined,
        members
      );
      result.push(interfaceDeclaration);
    }

    return result;
  }
}

export function generate(proto: string): string {
  const parser = parse(proto);
  const generator = new MessageInterfaceGenerator(parser);
  const interfaces = generator.generate();
  const sourceFile = ts.createSourceFile(
    "interfaces.ts",
    "",
    ts.ScriptTarget.Latest,
    /*setParentNodes*/ false,
    ts.ScriptKind.TS
  );

  const resultFile = ts.updateSourceFileNode(sourceFile, interfaces);
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed
  });
  return printer.printFile(resultFile);
}
