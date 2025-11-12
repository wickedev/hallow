/**
 * ProtoFileBuilder - builds ProtoFile AST from ANTLR parse tree
 *
 * This class visits the ANTLR parse tree and extracts protobuf definitions
 * into a structured ProtoFile object.
 *
 * @packageDocumentation
 */
import { AbstractParseTreeVisitor } from 'antlr4ts/tree/AbstractParseTreeVisitor';
import { Protobuf3Visitor } from './generated/grammar/Protobuf3Visitor';
import { ProtoContext, SyntaxContext, ImportStatementContext, PackageStatementContext, ServiceDefContext, MessageDefContext, EnumDefContext } from './generated/grammar/Protobuf3Parser';
import { ProtoFile } from './types';
/**
 * Visitor that builds a ProtoFile AST from ANTLR parse tree
 */
export declare class ProtoFileBuilder extends AbstractParseTreeVisitor<any> implements Protobuf3Visitor<any> {
    private protoFile;
    constructor(fileName: string);
    /**
     * Build ProtoFile from parse tree
     */
    build(ctx: ProtoContext): ProtoFile;
    /**
     * Default result for unhandled nodes
     */
    protected defaultResult(): any;
    /**
     * Visit proto context (root)
     */
    visitProto(ctx: ProtoContext): any;
    /**
     * Visit syntax declaration
     */
    visitSyntax(ctx: SyntaxContext): any;
    /**
     * Visit import statement
     */
    visitImportStatement(ctx: ImportStatementContext): any;
    /**
     * Visit package statement
     */
    visitPackageStatement(ctx: PackageStatementContext): any;
    /**
     * Visit service definition
     */
    visitServiceDef(ctx: ServiceDefContext): any;
    /**
     * Visit message definition
     */
    visitMessageDef(ctx: MessageDefContext): any;
    /**
     * Visit enum definition
     */
    visitEnumDef(ctx: EnumDefContext): any;
    /**
     * Extract service name from context
     */
    private extractServiceName;
    /**
     * Extract method from RPC context
     */
    private extractMethod;
    /**
     * Extract message definition
     */
    private extractMessage;
    /**
     * Extract field definition
     */
    private extractField;
    /**
     * Extract enum definition
     */
    private extractEnum;
    /**
     * Extract enum value definition
     */
    private extractEnumValue;
}
//# sourceMappingURL=ProtoFileBuilder.d.ts.map