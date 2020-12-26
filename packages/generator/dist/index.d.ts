import { AbstractParseTreeVisitor } from 'antlr4ts/tree';
import { MessageNameContext, ProtoParserVisitor } from '@suited-grpc/parser';
declare class Visitor extends AbstractParseTreeVisitor<MessageNameContext> implements ProtoParserVisitor<MessageNameContext> {
    protected defaultResult(): MessageNameContext;
    visitMessageName(ctx: MessageNameContext): MessageNameContext;
}
declare const parser: import("@suited-grpc/parser").ProtoParser;
declare const visitor: Visitor;
export { parser, visitor };
