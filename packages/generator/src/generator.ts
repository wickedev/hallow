import { XPath } from "antlr4ts/tree/xpath";
import ts, {
  ClassElement,
  DeclarationStatement,
  TypeElement
} from "typescript";
import {
  MessageBlockContext,
  parse,
  ProtoVisitor,
  ProtoParser,
  ServiceBlockContext
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

interface IService {
  name: string;
  methods: IMethod[];
}

interface IMethod {
  name: string;
  request: string;
  response: string;
}

function chicagoStypeFirstLetter(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

function getFirst<T>(set: Set<T>): T | undefined {
  for (const value of set) {
    return value;
  }

  return undefined;
}

function getLast<T>(set: Set<T>): T | undefined {
  let value;

  for (const v of set) {
    value = v;
  }

  return value;
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
  private readonly services: IService[] = [];

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

  visitServiceBlock(ctx: ServiceBlockContext): ServiceBlockContext {
    const serviceNameCtx = XPath.findAll(
      ctx,
      "//serviceName/ident",
      this.parser
    );

    const rpcMethodsCtx = XPath.findAll(ctx, "//rpcMethod", this.parser);
    const serviceName = getFirst(serviceNameCtx)?.text;
    if (serviceName) {
      const service: IService = { name: serviceName, methods: [] };

      for (let rpcMethodCtx of rpcMethodsCtx) {
        const rpcNameCtx = XPath.findAll(
          rpcMethodCtx,
          "//rpcName/ident",
          this.parser
        );
        const reqAndRes = XPath.findAll(
          rpcMethodCtx,
          "//rpcType/typeReference/ident",
          this.parser
        );

        const name = getFirst(rpcNameCtx)?.text;
        const request = getFirst(reqAndRes)?.text;
        const response = getLast(reqAndRes)?.text;

        if (name && request && response) {
          service.methods.push({
            name,
            request,
            response
          });
        }
      }

      this.services.push(service);
    }
    return ctx;
  }

  generate(): DeclarationStatement[] {
    this.visit(this.parser.proto());

    const result: DeclarationStatement[] = [];

    this.generateMessage(result);
    this.generateStub(result);
    return result;
  }

  private generateMessage(result: DeclarationStatement[]): void {
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
  }

  private generateStub(result: DeclarationStatement[]): void {
    for (const service of this.services) {
      const identifier = ts.createIdentifier(`${service.name}Stub`);
      const members: ClassElement[] = [];

      for (const method of service.methods) {
        const reqType = ts.createTypeReferenceNode(method.request, []);
        const reqParams = ts.createParameter(
          undefined,
          undefined,
          undefined,
          chicagoStypeFirstLetter(method.request),
          undefined,
          reqType,
          undefined
        );

        const resType = ts.createTypeReferenceNode(method.response, undefined);
        const promiseType = ts.createTypeReferenceNode("Promise", [resType]);

        const nullExpr = ts.createNull();
        const returnExpr = ts.createReturn(nullExpr);
        const block = ts.createBlock([returnExpr], true);

        members.push(
          ts.createMethod(
            undefined,
            undefined,
            undefined,
            chicagoStypeFirstLetter(method.name),
            undefined,
            [],
            [reqParams],
            promiseType,
            block
          )
        );
      }

      const declaration = ts.createClassDeclaration(
        undefined,
        [ts.createToken(ts.SyntaxKind.ExportKeyword)],
        identifier,
        undefined,
        undefined,
        members
      );

      result.push(declaration);
    }
  }
}

export function generate(proto: string): string {
  const parser = parse(proto);
  const generator = new MessageInterfaceGenerator(parser);
  const nodes = generator.generate();
  const sourceFile = ts.createSourceFile(
    "interfaces.ts",
    "",
    ts.ScriptTarget.Latest,
    false,
    ts.ScriptKind.TS
  );

  const resultFile = ts.updateSourceFileNode(sourceFile, nodes);
  const printer = ts.createPrinter({
    newLine: ts.NewLineKind.LineFeed
  });
  return printer.printFile(resultFile);
}
