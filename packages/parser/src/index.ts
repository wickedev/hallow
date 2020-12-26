import { CharStreams, CommonTokenStream } from 'antlr4ts'
import { AbstractParseTreeVisitor } from 'antlr4ts/tree'
import { ProtoLexer } from '~/parser/ProtoLexer';
import { ProtoParser } from '~/parser/ProtoParser';
import { ProtoParserVisitor } from '~/parser/ProtoParserVisitor';

export function parse(proto: string) {
    let inputStream = CharStreams.fromString(proto);
    let lexer = new ProtoLexer(inputStream);
    let tokenStream = new CommonTokenStream(lexer);
    return new ProtoParser(tokenStream);
}

export abstract class ProtoVisitor<Result> extends  AbstractParseTreeVisitor<Result> implements ProtoParserVisitor<Result>{}

export * from "~/parser/ProtoLexer"
export * from "~/parser/ProtoParser"
export * from "~/parser/ProtoParserListener"
export * from "~/parser/ProtoParserVisitor"
