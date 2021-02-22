import { AbstractParseTreeVisitor } from 'antlr4ts/tree';
// Generated from parser/ProtoParser.g4 by ANTLR 4.9.0-SNAPSHOT
import { ATN } from "antlr4ts/atn/ATN";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
// Generated from parser/ProtoParser.g4 by ANTLR 4.9.0-SNAPSHOT
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
// Generated from parser/ProtoParser.g4 by ANTLR 4.9.0-SNAPSHOT
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { CharStream } from "antlr4ts/CharStream";
import { Lexer } from "antlr4ts/Lexer";
/**
 * This interface defines a complete listener for a parse tree produced by
 * `ProtoParser`.
 */
interface ProtoParserListener extends ParseTreeListener {
    /**
     * Enter a parse tree produced by `ProtoParser.proto`.
     * @param ctx the parse tree
     */
    enterProto?: (ctx: ProtoContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.proto`.
     * @param ctx the parse tree
     */
    exitProto?: (ctx: ProtoContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.syntaxStatement`.
     * @param ctx the parse tree
     */
    enterSyntaxStatement?: (ctx: SyntaxStatementContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.syntaxStatement`.
     * @param ctx the parse tree
     */
    exitSyntaxStatement?: (ctx: SyntaxStatementContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.syntaxName`.
     * @param ctx the parse tree
     */
    enterSyntaxName?: (ctx: SyntaxNameContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.syntaxName`.
     * @param ctx the parse tree
     */
    exitSyntaxName?: (ctx: SyntaxNameContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.packageStatement`.
     * @param ctx the parse tree
     */
    enterPackageStatement?: (ctx: PackageStatementContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.packageStatement`.
     * @param ctx the parse tree
     */
    exitPackageStatement?: (ctx: PackageStatementContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.packageName`.
     * @param ctx the parse tree
     */
    enterPackageName?: (ctx: PackageNameContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.packageName`.
     * @param ctx the parse tree
     */
    exitPackageName?: (ctx: PackageNameContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.importStatement`.
     * @param ctx the parse tree
     */
    enterImportStatement?: (ctx: ImportStatementContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.importStatement`.
     * @param ctx the parse tree
     */
    exitImportStatement?: (ctx: ImportStatementContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.fileReference`.
     * @param ctx the parse tree
     */
    enterFileReference?: (ctx: FileReferenceContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.fileReference`.
     * @param ctx the parse tree
     */
    exitFileReference?: (ctx: FileReferenceContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.optionEntry`.
     * @param ctx the parse tree
     */
    enterOptionEntry?: (ctx: OptionEntryContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.optionEntry`.
     * @param ctx the parse tree
     */
    exitOptionEntry?: (ctx: OptionEntryContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.enumBlock`.
     * @param ctx the parse tree
     */
    enterEnumBlock?: (ctx: EnumBlockContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.enumBlock`.
     * @param ctx the parse tree
     */
    exitEnumBlock?: (ctx: EnumBlockContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.enumName`.
     * @param ctx the parse tree
     */
    enterEnumName?: (ctx: EnumNameContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.enumName`.
     * @param ctx the parse tree
     */
    exitEnumName?: (ctx: EnumNameContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.enumField`.
     * @param ctx the parse tree
     */
    enterEnumField?: (ctx: EnumFieldContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.enumField`.
     * @param ctx the parse tree
     */
    exitEnumField?: (ctx: EnumFieldContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.enumFieldName`.
     * @param ctx the parse tree
     */
    enterEnumFieldName?: (ctx: EnumFieldNameContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.enumFieldName`.
     * @param ctx the parse tree
     */
    exitEnumFieldName?: (ctx: EnumFieldNameContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.enumFieldValue`.
     * @param ctx the parse tree
     */
    enterEnumFieldValue?: (ctx: EnumFieldValueContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.enumFieldValue`.
     * @param ctx the parse tree
     */
    exitEnumFieldValue?: (ctx: EnumFieldValueContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.extendBlock`.
     * @param ctx the parse tree
     */
    enterExtendBlock?: (ctx: ExtendBlockContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.extendBlock`.
     * @param ctx the parse tree
     */
    exitExtendBlock?: (ctx: ExtendBlockContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.extendBlockEntry`.
     * @param ctx the parse tree
     */
    enterExtendBlockEntry?: (ctx: ExtendBlockEntryContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.extendBlockEntry`.
     * @param ctx the parse tree
     */
    exitExtendBlockEntry?: (ctx: ExtendBlockEntryContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.serviceBlock`.
     * @param ctx the parse tree
     */
    enterServiceBlock?: (ctx: ServiceBlockContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.serviceBlock`.
     * @param ctx the parse tree
     */
    exitServiceBlock?: (ctx: ServiceBlockContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.serviceName`.
     * @param ctx the parse tree
     */
    enterServiceName?: (ctx: ServiceNameContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.serviceName`.
     * @param ctx the parse tree
     */
    exitServiceName?: (ctx: ServiceNameContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.rpcMethod`.
     * @param ctx the parse tree
     */
    enterRpcMethod?: (ctx: RpcMethodContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.rpcMethod`.
     * @param ctx the parse tree
     */
    exitRpcMethod?: (ctx: RpcMethodContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.rpcName`.
     * @param ctx the parse tree
     */
    enterRpcName?: (ctx: RpcNameContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.rpcName`.
     * @param ctx the parse tree
     */
    exitRpcName?: (ctx: RpcNameContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.rpcType`.
     * @param ctx the parse tree
     */
    enterRpcType?: (ctx: RpcTypeContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.rpcType`.
     * @param ctx the parse tree
     */
    exitRpcType?: (ctx: RpcTypeContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.messageBlock`.
     * @param ctx the parse tree
     */
    enterMessageBlock?: (ctx: MessageBlockContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.messageBlock`.
     * @param ctx the parse tree
     */
    exitMessageBlock?: (ctx: MessageBlockContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.messageName`.
     * @param ctx the parse tree
     */
    enterMessageName?: (ctx: MessageNameContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.messageName`.
     * @param ctx the parse tree
     */
    exitMessageName?: (ctx: MessageNameContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.oneof`.
     * @param ctx the parse tree
     */
    enterOneof?: (ctx: OneofContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.oneof`.
     * @param ctx the parse tree
     */
    exitOneof?: (ctx: OneofContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.oneofName`.
     * @param ctx the parse tree
     */
    enterOneofName?: (ctx: OneofNameContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.oneofName`.
     * @param ctx the parse tree
     */
    exitOneofName?: (ctx: OneofNameContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.map`.
     * @param ctx the parse tree
     */
    enterMap?: (ctx: MapContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.map`.
     * @param ctx the parse tree
     */
    exitMap?: (ctx: MapContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.mapKey`.
     * @param ctx the parse tree
     */
    enterMapKey?: (ctx: MapKeyContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.mapKey`.
     * @param ctx the parse tree
     */
    exitMapKey?: (ctx: MapKeyContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.mapValue`.
     * @param ctx the parse tree
     */
    enterMapValue?: (ctx: MapValueContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.mapValue`.
     * @param ctx the parse tree
     */
    exitMapValue?: (ctx: MapValueContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.tag`.
     * @param ctx the parse tree
     */
    enterTag?: (ctx: TagContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.tag`.
     * @param ctx the parse tree
     */
    exitTag?: (ctx: TagContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.groupBlock`.
     * @param ctx the parse tree
     */
    enterGroupBlock?: (ctx: GroupBlockContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.groupBlock`.
     * @param ctx the parse tree
     */
    exitGroupBlock?: (ctx: GroupBlockContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.groupName`.
     * @param ctx the parse tree
     */
    enterGroupName?: (ctx: GroupNameContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.groupName`.
     * @param ctx the parse tree
     */
    exitGroupName?: (ctx: GroupNameContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.extensions`.
     * @param ctx the parse tree
     */
    enterExtensions?: (ctx: ExtensionsContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.extensions`.
     * @param ctx the parse tree
     */
    exitExtensions?: (ctx: ExtensionsContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.range`.
     * @param ctx the parse tree
     */
    enterRange?: (ctx: RangeContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.range`.
     * @param ctx the parse tree
     */
    exitRange?: (ctx: RangeContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.rangeFrom`.
     * @param ctx the parse tree
     */
    enterRangeFrom?: (ctx: RangeFromContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.rangeFrom`.
     * @param ctx the parse tree
     */
    exitRangeFrom?: (ctx: RangeFromContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.rangeTo`.
     * @param ctx the parse tree
     */
    enterRangeTo?: (ctx: RangeToContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.rangeTo`.
     * @param ctx the parse tree
     */
    exitRangeTo?: (ctx: RangeToContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.reservedFieldRanges`.
     * @param ctx the parse tree
     */
    enterReservedFieldRanges?: (ctx: ReservedFieldRangesContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.reservedFieldRanges`.
     * @param ctx the parse tree
     */
    exitReservedFieldRanges?: (ctx: ReservedFieldRangesContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.reservedFieldNames`.
     * @param ctx the parse tree
     */
    enterReservedFieldNames?: (ctx: ReservedFieldNamesContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.reservedFieldNames`.
     * @param ctx the parse tree
     */
    exitReservedFieldNames?: (ctx: ReservedFieldNamesContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.reservedFieldName`.
     * @param ctx the parse tree
     */
    enterReservedFieldName?: (ctx: ReservedFieldNameContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.reservedFieldName`.
     * @param ctx the parse tree
     */
    exitReservedFieldName?: (ctx: ReservedFieldNameContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.field`.
     * @param ctx the parse tree
     */
    enterField?: (ctx: FieldContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.field`.
     * @param ctx the parse tree
     */
    exitField?: (ctx: FieldContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.fieldName`.
     * @param ctx the parse tree
     */
    enterFieldName?: (ctx: FieldNameContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.fieldName`.
     * @param ctx the parse tree
     */
    exitFieldName?: (ctx: FieldNameContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.fieldModifier`.
     * @param ctx the parse tree
     */
    enterFieldModifier?: (ctx: FieldModifierContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.fieldModifier`.
     * @param ctx the parse tree
     */
    exitFieldModifier?: (ctx: FieldModifierContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.typeReference`.
     * @param ctx the parse tree
     */
    enterTypeReference?: (ctx: TypeReferenceContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.typeReference`.
     * @param ctx the parse tree
     */
    exitTypeReference?: (ctx: TypeReferenceContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.fieldOptions`.
     * @param ctx the parse tree
     */
    enterFieldOptions?: (ctx: FieldOptionsContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.fieldOptions`.
     * @param ctx the parse tree
     */
    exitFieldOptions?: (ctx: FieldOptionsContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.option`.
     * @param ctx the parse tree
     */
    enterOption?: (ctx: OptionContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.option`.
     * @param ctx the parse tree
     */
    exitOption?: (ctx: OptionContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.fieldRerefence`.
     * @param ctx the parse tree
     */
    enterFieldRerefence?: (ctx: FieldRerefenceContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.fieldRerefence`.
     * @param ctx the parse tree
     */
    exitFieldRerefence?: (ctx: FieldRerefenceContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.standardFieldRerefence`.
     * @param ctx the parse tree
     */
    enterStandardFieldRerefence?: (ctx: StandardFieldRerefenceContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.standardFieldRerefence`.
     * @param ctx the parse tree
     */
    exitStandardFieldRerefence?: (ctx: StandardFieldRerefenceContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.customFieldReference`.
     * @param ctx the parse tree
     */
    enterCustomFieldReference?: (ctx: CustomFieldReferenceContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.customFieldReference`.
     * @param ctx the parse tree
     */
    exitCustomFieldReference?: (ctx: CustomFieldReferenceContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.optionValue`.
     * @param ctx the parse tree
     */
    enterOptionValue?: (ctx: OptionValueContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.optionValue`.
     * @param ctx the parse tree
     */
    exitOptionValue?: (ctx: OptionValueContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.textFormat`.
     * @param ctx the parse tree
     */
    enterTextFormat?: (ctx: TextFormatContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.textFormat`.
     * @param ctx the parse tree
     */
    exitTextFormat?: (ctx: TextFormatContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.textFormatOptionName`.
     * @param ctx the parse tree
     */
    enterTextFormatOptionName?: (ctx: TextFormatOptionNameContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.textFormatOptionName`.
     * @param ctx the parse tree
     */
    exitTextFormatOptionName?: (ctx: TextFormatOptionNameContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.textFormatEntry`.
     * @param ctx the parse tree
     */
    enterTextFormatEntry?: (ctx: TextFormatEntryContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.textFormatEntry`.
     * @param ctx the parse tree
     */
    exitTextFormatEntry?: (ctx: TextFormatEntryContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.textFormatOptionValue`.
     * @param ctx the parse tree
     */
    enterTextFormatOptionValue?: (ctx: TextFormatOptionValueContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.textFormatOptionValue`.
     * @param ctx the parse tree
     */
    exitTextFormatOptionValue?: (ctx: TextFormatOptionValueContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.fullIdent`.
     * @param ctx the parse tree
     */
    enterFullIdent?: (ctx: FullIdentContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.fullIdent`.
     * @param ctx the parse tree
     */
    exitFullIdent?: (ctx: FullIdentContext) => void;
    /**
     * Enter a parse tree produced by `ProtoParser.ident`.
     * @param ctx the parse tree
     */
    enterIdent?: (ctx: IdentContext) => void;
    /**
     * Exit a parse tree produced by `ProtoParser.ident`.
     * @param ctx the parse tree
     */
    exitIdent?: (ctx: IdentContext) => void;
}
/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `ProtoParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
interface ProtoParserVisitor<Result> extends ParseTreeVisitor<Result> {
    /**
     * Visit a parse tree produced by `ProtoParser.proto`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitProto?: (ctx: ProtoContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.syntaxStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSyntaxStatement?: (ctx: SyntaxStatementContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.syntaxName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitSyntaxName?: (ctx: SyntaxNameContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.packageStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPackageStatement?: (ctx: PackageStatementContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.packageName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitPackageName?: (ctx: PackageNameContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.importStatement`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitImportStatement?: (ctx: ImportStatementContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.fileReference`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFileReference?: (ctx: FileReferenceContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.optionEntry`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOptionEntry?: (ctx: OptionEntryContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.enumBlock`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEnumBlock?: (ctx: EnumBlockContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.enumName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEnumName?: (ctx: EnumNameContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.enumField`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEnumField?: (ctx: EnumFieldContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.enumFieldName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEnumFieldName?: (ctx: EnumFieldNameContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.enumFieldValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitEnumFieldValue?: (ctx: EnumFieldValueContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.extendBlock`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExtendBlock?: (ctx: ExtendBlockContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.extendBlockEntry`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExtendBlockEntry?: (ctx: ExtendBlockEntryContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.serviceBlock`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitServiceBlock?: (ctx: ServiceBlockContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.serviceName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitServiceName?: (ctx: ServiceNameContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.rpcMethod`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRpcMethod?: (ctx: RpcMethodContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.rpcName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRpcName?: (ctx: RpcNameContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.rpcType`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRpcType?: (ctx: RpcTypeContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.messageBlock`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMessageBlock?: (ctx: MessageBlockContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.messageName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMessageName?: (ctx: MessageNameContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.oneof`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOneof?: (ctx: OneofContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.oneofName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOneofName?: (ctx: OneofNameContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.map`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMap?: (ctx: MapContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.mapKey`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMapKey?: (ctx: MapKeyContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.mapValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitMapValue?: (ctx: MapValueContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.tag`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTag?: (ctx: TagContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.groupBlock`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGroupBlock?: (ctx: GroupBlockContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.groupName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitGroupName?: (ctx: GroupNameContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.extensions`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitExtensions?: (ctx: ExtensionsContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.range`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRange?: (ctx: RangeContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.rangeFrom`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRangeFrom?: (ctx: RangeFromContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.rangeTo`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitRangeTo?: (ctx: RangeToContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.reservedFieldRanges`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitReservedFieldRanges?: (ctx: ReservedFieldRangesContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.reservedFieldNames`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitReservedFieldNames?: (ctx: ReservedFieldNamesContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.reservedFieldName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitReservedFieldName?: (ctx: ReservedFieldNameContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.field`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitField?: (ctx: FieldContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.fieldName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldName?: (ctx: FieldNameContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.fieldModifier`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldModifier?: (ctx: FieldModifierContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.typeReference`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTypeReference?: (ctx: TypeReferenceContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.fieldOptions`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldOptions?: (ctx: FieldOptionsContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.option`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOption?: (ctx: OptionContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.fieldRerefence`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFieldRerefence?: (ctx: FieldRerefenceContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.standardFieldRerefence`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitStandardFieldRerefence?: (ctx: StandardFieldRerefenceContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.customFieldReference`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitCustomFieldReference?: (ctx: CustomFieldReferenceContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.optionValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitOptionValue?: (ctx: OptionValueContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.textFormat`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTextFormat?: (ctx: TextFormatContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.textFormatOptionName`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTextFormatOptionName?: (ctx: TextFormatOptionNameContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.textFormatEntry`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTextFormatEntry?: (ctx: TextFormatEntryContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.textFormatOptionValue`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitTextFormatOptionValue?: (ctx: TextFormatOptionValueContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.fullIdent`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitFullIdent?: (ctx: FullIdentContext) => Result;
    /**
     * Visit a parse tree produced by `ProtoParser.ident`.
     * @param ctx the parse tree
     * @return the visitor result
     */
    visitIdent?: (ctx: IdentContext) => Result;
}
declare class ProtoParser extends Parser {
    static readonly PACKAGE = 1;
    static readonly SYNTAX = 2;
    static readonly IMPORT = 3;
    static readonly PUBLIC = 4;
    static readonly OPTION = 5;
    static readonly MESSAGE = 6;
    static readonly GROUP = 7;
    static readonly OPTIONAL = 8;
    static readonly REQUIRED = 9;
    static readonly REPEATED = 10;
    static readonly ONEOF = 11;
    static readonly EXTEND = 12;
    static readonly EXTENSIONS = 13;
    static readonly TO = 14;
    static readonly MAX = 15;
    static readonly RESERVED = 16;
    static readonly ENUM = 17;
    static readonly SERVICE = 18;
    static readonly RPC = 19;
    static readonly RETURNS = 20;
    static readonly STREAM = 21;
    static readonly MAP = 22;
    static readonly BOOLEAN_VALUE = 23;
    static readonly DOUBLE = 24;
    static readonly FLOAT = 25;
    static readonly INT32 = 26;
    static readonly INT64 = 27;
    static readonly UINT32 = 28;
    static readonly UINT64 = 29;
    static readonly SINT32 = 30;
    static readonly SINT64 = 31;
    static readonly FIXED32 = 32;
    static readonly FIXED64 = 33;
    static readonly SFIXED32 = 34;
    static readonly SFIXED64 = 35;
    static readonly BOOL = 36;
    static readonly STRING = 37;
    static readonly BYTES = 38;
    static readonly COMMENT = 39;
    static readonly LINE_COMMENT = 40;
    static readonly PLUGIN_DEV_MARKER = 41;
    static readonly NL = 42;
    static readonly WS = 43;
    static readonly LCURLY = 44;
    static readonly RCURLY = 45;
    static readonly LPAREN = 46;
    static readonly RPAREN = 47;
    static readonly LSQUARE = 48;
    static readonly RSQUARE = 49;
    static readonly LT = 50;
    static readonly GT = 51;
    static readonly COMMA = 52;
    static readonly DOT = 53;
    static readonly COLON = 54;
    static readonly SEMICOLON = 55;
    static readonly ASSIGN = 56;
    static readonly IDENT = 57;
    static readonly STRING_VALUE = 58;
    static readonly INTEGER_VALUE = 59;
    static readonly FLOAT_VALUE = 60;
    static readonly ERRCHAR = 61;
    static readonly RULE_proto = 0;
    static readonly RULE_syntaxStatement = 1;
    static readonly RULE_syntaxName = 2;
    static readonly RULE_packageStatement = 3;
    static readonly RULE_packageName = 4;
    static readonly RULE_importStatement = 5;
    static readonly RULE_fileReference = 6;
    static readonly RULE_optionEntry = 7;
    static readonly RULE_enumBlock = 8;
    static readonly RULE_enumName = 9;
    static readonly RULE_enumField = 10;
    static readonly RULE_enumFieldName = 11;
    static readonly RULE_enumFieldValue = 12;
    static readonly RULE_extendBlock = 13;
    static readonly RULE_extendBlockEntry = 14;
    static readonly RULE_serviceBlock = 15;
    static readonly RULE_serviceName = 16;
    static readonly RULE_rpcMethod = 17;
    static readonly RULE_rpcName = 18;
    static readonly RULE_rpcType = 19;
    static readonly RULE_messageBlock = 20;
    static readonly RULE_messageName = 21;
    static readonly RULE_oneof = 22;
    static readonly RULE_oneofName = 23;
    static readonly RULE_map = 24;
    static readonly RULE_mapKey = 25;
    static readonly RULE_mapValue = 26;
    static readonly RULE_tag = 27;
    static readonly RULE_groupBlock = 28;
    static readonly RULE_groupName = 29;
    static readonly RULE_extensions = 30;
    static readonly RULE_range = 31;
    static readonly RULE_rangeFrom = 32;
    static readonly RULE_rangeTo = 33;
    static readonly RULE_reservedFieldRanges = 34;
    static readonly RULE_reservedFieldNames = 35;
    static readonly RULE_reservedFieldName = 36;
    static readonly RULE_field = 37;
    static readonly RULE_fieldName = 38;
    static readonly RULE_fieldModifier = 39;
    static readonly RULE_typeReference = 40;
    static readonly RULE_fieldOptions = 41;
    static readonly RULE_option = 42;
    static readonly RULE_fieldRerefence = 43;
    static readonly RULE_standardFieldRerefence = 44;
    static readonly RULE_customFieldReference = 45;
    static readonly RULE_optionValue = 46;
    static readonly RULE_textFormat = 47;
    static readonly RULE_textFormatOptionName = 48;
    static readonly RULE_textFormatEntry = 49;
    static readonly RULE_textFormatOptionValue = 50;
    static readonly RULE_fullIdent = 51;
    static readonly RULE_ident = 52;
    // tslint:disable:no-trailing-whitespace
    static readonly ruleNames: string[];
    private static readonly _LITERAL_NAMES;
    private static readonly _SYMBOLIC_NAMES;
    static readonly VOCABULARY: Vocabulary;
    // @Override
    // @NotNull
    get vocabulary(): Vocabulary;
    // tslint:enable:no-trailing-whitespace
    // @Override
    get grammarFileName(): string;
    // @Override
    get ruleNames(): string[];
    // @Override
    get serializedATN(): string;
    protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException;
    constructor(input: TokenStream);
    // @RuleVersion(0)
    proto(): ProtoContext;
    // @RuleVersion(0)
    syntaxStatement(): SyntaxStatementContext;
    // @RuleVersion(0)
    syntaxName(): SyntaxNameContext;
    // @RuleVersion(0)
    packageStatement(): PackageStatementContext;
    // @RuleVersion(0)
    packageName(): PackageNameContext;
    // @RuleVersion(0)
    importStatement(): ImportStatementContext;
    // @RuleVersion(0)
    fileReference(): FileReferenceContext;
    // @RuleVersion(0)
    optionEntry(): OptionEntryContext;
    // @RuleVersion(0)
    enumBlock(): EnumBlockContext;
    // @RuleVersion(0)
    enumName(): EnumNameContext;
    // @RuleVersion(0)
    enumField(): EnumFieldContext;
    // @RuleVersion(0)
    enumFieldName(): EnumFieldNameContext;
    // @RuleVersion(0)
    enumFieldValue(): EnumFieldValueContext;
    // @RuleVersion(0)
    extendBlock(): ExtendBlockContext;
    // @RuleVersion(0)
    extendBlockEntry(): ExtendBlockEntryContext;
    // @RuleVersion(0)
    serviceBlock(): ServiceBlockContext;
    // @RuleVersion(0)
    serviceName(): ServiceNameContext;
    // @RuleVersion(0)
    rpcMethod(): RpcMethodContext;
    // @RuleVersion(0)
    rpcName(): RpcNameContext;
    // @RuleVersion(0)
    rpcType(): RpcTypeContext;
    // @RuleVersion(0)
    messageBlock(): MessageBlockContext;
    // @RuleVersion(0)
    messageName(): MessageNameContext;
    // @RuleVersion(0)
    oneof(): OneofContext;
    // @RuleVersion(0)
    oneofName(): OneofNameContext;
    // @RuleVersion(0)
    map(): MapContext;
    // @RuleVersion(0)
    mapKey(): MapKeyContext;
    // @RuleVersion(0)
    mapValue(): MapValueContext;
    // @RuleVersion(0)
    tag(): TagContext;
    // @RuleVersion(0)
    groupBlock(): GroupBlockContext;
    // @RuleVersion(0)
    groupName(): GroupNameContext;
    // @RuleVersion(0)
    extensions(): ExtensionsContext;
    // @RuleVersion(0)
    range(): RangeContext;
    // @RuleVersion(0)
    rangeFrom(): RangeFromContext;
    // @RuleVersion(0)
    rangeTo(): RangeToContext;
    // @RuleVersion(0)
    reservedFieldRanges(): ReservedFieldRangesContext;
    // @RuleVersion(0)
    reservedFieldNames(): ReservedFieldNamesContext;
    // @RuleVersion(0)
    reservedFieldName(): ReservedFieldNameContext;
    // @RuleVersion(0)
    field(): FieldContext;
    // @RuleVersion(0)
    fieldName(): FieldNameContext;
    // @RuleVersion(0)
    fieldModifier(): FieldModifierContext;
    // @RuleVersion(0)
    typeReference(): TypeReferenceContext;
    // @RuleVersion(0)
    fieldOptions(): FieldOptionsContext;
    // @RuleVersion(0)
    option(): OptionContext;
    // @RuleVersion(0)
    fieldRerefence(): FieldRerefenceContext;
    // @RuleVersion(0)
    standardFieldRerefence(): StandardFieldRerefenceContext;
    // @RuleVersion(0)
    customFieldReference(): CustomFieldReferenceContext;
    // @RuleVersion(0)
    optionValue(): OptionValueContext;
    // @RuleVersion(0)
    textFormat(): TextFormatContext;
    // @RuleVersion(0)
    textFormatOptionName(): TextFormatOptionNameContext;
    // @RuleVersion(0)
    textFormatEntry(): TextFormatEntryContext;
    // @RuleVersion(0)
    textFormatOptionValue(): TextFormatOptionValueContext;
    // @RuleVersion(0)
    fullIdent(): FullIdentContext;
    // @RuleVersion(0)
    ident(): IdentContext;
    static readonly _serializedATN: string;
    static __ATN: ATN;
    static get _ATN(): ATN;
}
declare class ProtoContext extends ParserRuleContext {
    EOF(): TerminalNode;
    syntaxStatement(): SyntaxStatementContext | undefined;
    packageStatement(): PackageStatementContext[];
    packageStatement(i: number): PackageStatementContext;
    importStatement(): ImportStatementContext[];
    importStatement(i: number): ImportStatementContext;
    optionEntry(): OptionEntryContext[];
    optionEntry(i: number): OptionEntryContext;
    enumBlock(): EnumBlockContext[];
    enumBlock(i: number): EnumBlockContext;
    messageBlock(): MessageBlockContext[];
    messageBlock(i: number): MessageBlockContext;
    extendBlock(): ExtendBlockContext[];
    extendBlock(i: number): ExtendBlockContext;
    serviceBlock(): ServiceBlockContext[];
    serviceBlock(i: number): ServiceBlockContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class SyntaxStatementContext extends ParserRuleContext {
    SYNTAX(): TerminalNode;
    ASSIGN(): TerminalNode;
    syntaxName(): SyntaxNameContext;
    SEMICOLON(): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class SyntaxNameContext extends ParserRuleContext {
    STRING_VALUE(): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class PackageStatementContext extends ParserRuleContext {
    PACKAGE(): TerminalNode;
    packageName(): PackageNameContext;
    SEMICOLON(): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class PackageNameContext extends ParserRuleContext {
    fullIdent(): FullIdentContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class ImportStatementContext extends ParserRuleContext {
    IMPORT(): TerminalNode;
    fileReference(): FileReferenceContext;
    SEMICOLON(): TerminalNode;
    PUBLIC(): TerminalNode | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class FileReferenceContext extends ParserRuleContext {
    STRING_VALUE(): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class OptionEntryContext extends ParserRuleContext {
    OPTION(): TerminalNode;
    option(): OptionContext;
    SEMICOLON(): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class EnumBlockContext extends ParserRuleContext {
    ENUM(): TerminalNode;
    enumName(): EnumNameContext;
    LCURLY(): TerminalNode;
    RCURLY(): TerminalNode;
    enumField(): EnumFieldContext[];
    enumField(i: number): EnumFieldContext;
    optionEntry(): OptionEntryContext[];
    optionEntry(i: number): OptionEntryContext;
    reservedFieldRanges(): ReservedFieldRangesContext[];
    reservedFieldRanges(i: number): ReservedFieldRangesContext;
    reservedFieldNames(): ReservedFieldNamesContext[];
    reservedFieldNames(i: number): ReservedFieldNamesContext;
    SEMICOLON(): TerminalNode | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class EnumNameContext extends ParserRuleContext {
    ident(): IdentContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class EnumFieldContext extends ParserRuleContext {
    enumFieldName(): EnumFieldNameContext;
    ASSIGN(): TerminalNode;
    enumFieldValue(): EnumFieldValueContext;
    SEMICOLON(): TerminalNode;
    fieldOptions(): FieldOptionsContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class EnumFieldNameContext extends ParserRuleContext {
    ident(): IdentContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class EnumFieldValueContext extends ParserRuleContext {
    INTEGER_VALUE(): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class ExtendBlockContext extends ParserRuleContext {
    EXTEND(): TerminalNode;
    typeReference(): TypeReferenceContext;
    LCURLY(): TerminalNode;
    RCURLY(): TerminalNode;
    extendBlockEntry(): ExtendBlockEntryContext[];
    extendBlockEntry(i: number): ExtendBlockEntryContext;
    SEMICOLON(): TerminalNode | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class ExtendBlockEntryContext extends ParserRuleContext {
    field(): FieldContext | undefined;
    groupBlock(): GroupBlockContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class ServiceBlockContext extends ParserRuleContext {
    SERVICE(): TerminalNode;
    serviceName(): ServiceNameContext;
    LCURLY(): TerminalNode;
    RCURLY(): TerminalNode;
    rpcMethod(): RpcMethodContext[];
    rpcMethod(i: number): RpcMethodContext;
    optionEntry(): OptionEntryContext[];
    optionEntry(i: number): OptionEntryContext;
    SEMICOLON(): TerminalNode | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class ServiceNameContext extends ParserRuleContext {
    ident(): IdentContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class RpcMethodContext extends ParserRuleContext {
    RPC(): TerminalNode;
    rpcName(): RpcNameContext;
    LPAREN(): TerminalNode[];
    LPAREN(i: number): TerminalNode;
    rpcType(): RpcTypeContext[];
    rpcType(i: number): RpcTypeContext;
    RPAREN(): TerminalNode[];
    RPAREN(i: number): TerminalNode;
    RETURNS(): TerminalNode;
    LCURLY(): TerminalNode | undefined;
    RCURLY(): TerminalNode | undefined;
    SEMICOLON(): TerminalNode | undefined;
    optionEntry(): OptionEntryContext[];
    optionEntry(i: number): OptionEntryContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class RpcNameContext extends ParserRuleContext {
    ident(): IdentContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class RpcTypeContext extends ParserRuleContext {
    typeReference(): TypeReferenceContext;
    STREAM(): TerminalNode | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class MessageBlockContext extends ParserRuleContext {
    MESSAGE(): TerminalNode;
    messageName(): MessageNameContext;
    LCURLY(): TerminalNode;
    RCURLY(): TerminalNode;
    field(): FieldContext[];
    field(i: number): FieldContext;
    optionEntry(): OptionEntryContext[];
    optionEntry(i: number): OptionEntryContext;
    messageBlock(): MessageBlockContext[];
    messageBlock(i: number): MessageBlockContext;
    enumBlock(): EnumBlockContext[];
    enumBlock(i: number): EnumBlockContext;
    extensions(): ExtensionsContext[];
    extensions(i: number): ExtensionsContext;
    extendBlock(): ExtendBlockContext[];
    extendBlock(i: number): ExtendBlockContext;
    groupBlock(): GroupBlockContext[];
    groupBlock(i: number): GroupBlockContext;
    oneof(): OneofContext[];
    oneof(i: number): OneofContext;
    map(): MapContext[];
    map(i: number): MapContext;
    reservedFieldRanges(): ReservedFieldRangesContext[];
    reservedFieldRanges(i: number): ReservedFieldRangesContext;
    reservedFieldNames(): ReservedFieldNamesContext[];
    reservedFieldNames(i: number): ReservedFieldNamesContext;
    SEMICOLON(): TerminalNode | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class MessageNameContext extends ParserRuleContext {
    ident(): IdentContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class OneofContext extends ParserRuleContext {
    ONEOF(): TerminalNode;
    oneofName(): OneofNameContext;
    LCURLY(): TerminalNode;
    RCURLY(): TerminalNode;
    field(): FieldContext[];
    field(i: number): FieldContext;
    groupBlock(): GroupBlockContext[];
    groupBlock(i: number): GroupBlockContext;
    optionEntry(): OptionEntryContext[];
    optionEntry(i: number): OptionEntryContext;
    SEMICOLON(): TerminalNode | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class OneofNameContext extends ParserRuleContext {
    ident(): IdentContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class MapContext extends ParserRuleContext {
    MAP(): TerminalNode;
    LT(): TerminalNode;
    mapKey(): MapKeyContext;
    COMMA(): TerminalNode;
    mapValue(): MapValueContext;
    GT(): TerminalNode;
    fieldName(): FieldNameContext;
    ASSIGN(): TerminalNode;
    tag(): TagContext;
    SEMICOLON(): TerminalNode;
    fieldOptions(): FieldOptionsContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class MapKeyContext extends ParserRuleContext {
    INT32(): TerminalNode | undefined;
    INT64(): TerminalNode | undefined;
    UINT32(): TerminalNode | undefined;
    UINT64(): TerminalNode | undefined;
    SINT32(): TerminalNode | undefined;
    SINT64(): TerminalNode | undefined;
    FIXED32(): TerminalNode | undefined;
    FIXED64(): TerminalNode | undefined;
    SFIXED32(): TerminalNode | undefined;
    SFIXED64(): TerminalNode | undefined;
    BOOL(): TerminalNode | undefined;
    STRING(): TerminalNode | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class MapValueContext extends ParserRuleContext {
    typeReference(): TypeReferenceContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class TagContext extends ParserRuleContext {
    INTEGER_VALUE(): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class GroupBlockContext extends ParserRuleContext {
    GROUP(): TerminalNode;
    groupName(): GroupNameContext;
    ASSIGN(): TerminalNode;
    tag(): TagContext;
    LCURLY(): TerminalNode;
    RCURLY(): TerminalNode;
    fieldModifier(): FieldModifierContext | undefined;
    field(): FieldContext[];
    field(i: number): FieldContext;
    optionEntry(): OptionEntryContext[];
    optionEntry(i: number): OptionEntryContext;
    messageBlock(): MessageBlockContext[];
    messageBlock(i: number): MessageBlockContext;
    enumBlock(): EnumBlockContext[];
    enumBlock(i: number): EnumBlockContext;
    extensions(): ExtensionsContext[];
    extensions(i: number): ExtensionsContext;
    extendBlock(): ExtendBlockContext[];
    extendBlock(i: number): ExtendBlockContext;
    groupBlock(): GroupBlockContext[];
    groupBlock(i: number): GroupBlockContext;
    SEMICOLON(): TerminalNode | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class GroupNameContext extends ParserRuleContext {
    ident(): IdentContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class ExtensionsContext extends ParserRuleContext {
    EXTENSIONS(): TerminalNode;
    range(): RangeContext[];
    range(i: number): RangeContext;
    SEMICOLON(): TerminalNode;
    COMMA(): TerminalNode[];
    COMMA(i: number): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class RangeContext extends ParserRuleContext {
    rangeFrom(): RangeFromContext;
    TO(): TerminalNode | undefined;
    rangeTo(): RangeToContext | undefined;
    MAX(): TerminalNode | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class RangeFromContext extends ParserRuleContext {
    INTEGER_VALUE(): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class RangeToContext extends ParserRuleContext {
    INTEGER_VALUE(): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class ReservedFieldRangesContext extends ParserRuleContext {
    RESERVED(): TerminalNode;
    range(): RangeContext[];
    range(i: number): RangeContext;
    SEMICOLON(): TerminalNode;
    COMMA(): TerminalNode[];
    COMMA(i: number): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class ReservedFieldNamesContext extends ParserRuleContext {
    RESERVED(): TerminalNode;
    reservedFieldName(): ReservedFieldNameContext[];
    reservedFieldName(i: number): ReservedFieldNameContext;
    SEMICOLON(): TerminalNode;
    COMMA(): TerminalNode[];
    COMMA(i: number): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class ReservedFieldNameContext extends ParserRuleContext {
    STRING_VALUE(): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class FieldContext extends ParserRuleContext {
    typeReference(): TypeReferenceContext;
    fieldName(): FieldNameContext;
    ASSIGN(): TerminalNode;
    tag(): TagContext;
    SEMICOLON(): TerminalNode;
    fieldModifier(): FieldModifierContext | undefined;
    fieldOptions(): FieldOptionsContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class FieldNameContext extends ParserRuleContext {
    ident(): IdentContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class FieldModifierContext extends ParserRuleContext {
    OPTIONAL(): TerminalNode | undefined;
    REQUIRED(): TerminalNode | undefined;
    REPEATED(): TerminalNode | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class TypeReferenceContext extends ParserRuleContext {
    DOUBLE(): TerminalNode | undefined;
    FLOAT(): TerminalNode | undefined;
    INT32(): TerminalNode | undefined;
    INT64(): TerminalNode | undefined;
    UINT32(): TerminalNode | undefined;
    UINT64(): TerminalNode | undefined;
    SINT32(): TerminalNode | undefined;
    SINT64(): TerminalNode | undefined;
    FIXED32(): TerminalNode | undefined;
    FIXED64(): TerminalNode | undefined;
    SFIXED32(): TerminalNode | undefined;
    SFIXED64(): TerminalNode | undefined;
    BOOL(): TerminalNode | undefined;
    STRING(): TerminalNode | undefined;
    BYTES(): TerminalNode | undefined;
    ident(): IdentContext[];
    ident(i: number): IdentContext;
    DOT(): TerminalNode[];
    DOT(i: number): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class FieldOptionsContext extends ParserRuleContext {
    LSQUARE(): TerminalNode;
    RSQUARE(): TerminalNode;
    option(): OptionContext[];
    option(i: number): OptionContext;
    COMMA(): TerminalNode[];
    COMMA(i: number): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class OptionContext extends ParserRuleContext {
    fieldRerefence(): FieldRerefenceContext;
    ASSIGN(): TerminalNode;
    optionValue(): OptionValueContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class FieldRerefenceContext extends ParserRuleContext {
    standardFieldRerefence(): StandardFieldRerefenceContext[];
    standardFieldRerefence(i: number): StandardFieldRerefenceContext;
    LPAREN(): TerminalNode[];
    LPAREN(i: number): TerminalNode;
    customFieldReference(): CustomFieldReferenceContext[];
    customFieldReference(i: number): CustomFieldReferenceContext;
    RPAREN(): TerminalNode[];
    RPAREN(i: number): TerminalNode;
    DOT(): TerminalNode[];
    DOT(i: number): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class StandardFieldRerefenceContext extends ParserRuleContext {
    ident(): IdentContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class CustomFieldReferenceContext extends ParserRuleContext {
    ident(): IdentContext[];
    ident(i: number): IdentContext;
    DOT(): TerminalNode[];
    DOT(i: number): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class OptionValueContext extends ParserRuleContext {
    INTEGER_VALUE(): TerminalNode | undefined;
    FLOAT_VALUE(): TerminalNode | undefined;
    BOOLEAN_VALUE(): TerminalNode | undefined;
    STRING_VALUE(): TerminalNode | undefined;
    IDENT(): TerminalNode | undefined;
    textFormat(): TextFormatContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class TextFormatContext extends ParserRuleContext {
    LCURLY(): TerminalNode;
    RCURLY(): TerminalNode;
    textFormatEntry(): TextFormatEntryContext[];
    textFormatEntry(i: number): TextFormatEntryContext;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class TextFormatOptionNameContext extends ParserRuleContext {
    ident(): IdentContext | undefined;
    LSQUARE(): TerminalNode | undefined;
    typeReference(): TypeReferenceContext | undefined;
    RSQUARE(): TerminalNode | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class TextFormatEntryContext extends ParserRuleContext {
    textFormatOptionName(): TextFormatOptionNameContext;
    COLON(): TerminalNode | undefined;
    textFormatOptionValue(): TextFormatOptionValueContext | undefined;
    textFormat(): TextFormatContext | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class TextFormatOptionValueContext extends ParserRuleContext {
    INTEGER_VALUE(): TerminalNode | undefined;
    FLOAT_VALUE(): TerminalNode | undefined;
    BOOLEAN_VALUE(): TerminalNode | undefined;
    STRING_VALUE(): TerminalNode | undefined;
    IDENT(): TerminalNode | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class FullIdentContext extends ParserRuleContext {
    ident(): IdentContext[];
    ident(i: number): IdentContext;
    DOT(): TerminalNode[];
    DOT(i: number): TerminalNode;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare class IdentContext extends ParserRuleContext {
    IDENT(): TerminalNode | undefined;
    PACKAGE(): TerminalNode | undefined;
    SYNTAX(): TerminalNode | undefined;
    IMPORT(): TerminalNode | undefined;
    PUBLIC(): TerminalNode | undefined;
    OPTION(): TerminalNode | undefined;
    MESSAGE(): TerminalNode | undefined;
    GROUP(): TerminalNode | undefined;
    OPTIONAL(): TerminalNode | undefined;
    REQUIRED(): TerminalNode | undefined;
    REPEATED(): TerminalNode | undefined;
    ONEOF(): TerminalNode | undefined;
    EXTEND(): TerminalNode | undefined;
    EXTENSIONS(): TerminalNode | undefined;
    TO(): TerminalNode | undefined;
    MAX(): TerminalNode | undefined;
    RESERVED(): TerminalNode | undefined;
    ENUM(): TerminalNode | undefined;
    SERVICE(): TerminalNode | undefined;
    RPC(): TerminalNode | undefined;
    RETURNS(): TerminalNode | undefined;
    STREAM(): TerminalNode | undefined;
    MAP(): TerminalNode | undefined;
    BOOLEAN_VALUE(): TerminalNode | undefined;
    DOUBLE(): TerminalNode | undefined;
    FLOAT(): TerminalNode | undefined;
    INT32(): TerminalNode | undefined;
    INT64(): TerminalNode | undefined;
    UINT32(): TerminalNode | undefined;
    UINT64(): TerminalNode | undefined;
    SINT32(): TerminalNode | undefined;
    SINT64(): TerminalNode | undefined;
    FIXED32(): TerminalNode | undefined;
    FIXED64(): TerminalNode | undefined;
    SFIXED32(): TerminalNode | undefined;
    SFIXED64(): TerminalNode | undefined;
    BOOL(): TerminalNode | undefined;
    STRING(): TerminalNode | undefined;
    BYTES(): TerminalNode | undefined;
    constructor(parent: ParserRuleContext | undefined, invokingState: number);
    // @Override
    get ruleIndex(): number;
    // @Override
    enterRule(listener: ProtoParserListener): void;
    // @Override
    exitRule(listener: ProtoParserListener): void;
    // @Override
    accept<Result>(visitor: ProtoParserVisitor<Result>): Result;
}
declare function parse(proto: string): ProtoParser;
declare abstract class ProtoVisitor<Result> extends AbstractParseTreeVisitor<Result> implements ProtoParserVisitor<Result> {
}
declare class ProtoLexer extends Lexer {
    static readonly PACKAGE = 1;
    static readonly SYNTAX = 2;
    static readonly IMPORT = 3;
    static readonly PUBLIC = 4;
    static readonly OPTION = 5;
    static readonly MESSAGE = 6;
    static readonly GROUP = 7;
    static readonly OPTIONAL = 8;
    static readonly REQUIRED = 9;
    static readonly REPEATED = 10;
    static readonly ONEOF = 11;
    static readonly EXTEND = 12;
    static readonly EXTENSIONS = 13;
    static readonly TO = 14;
    static readonly MAX = 15;
    static readonly RESERVED = 16;
    static readonly ENUM = 17;
    static readonly SERVICE = 18;
    static readonly RPC = 19;
    static readonly RETURNS = 20;
    static readonly STREAM = 21;
    static readonly MAP = 22;
    static readonly BOOLEAN_VALUE = 23;
    static readonly DOUBLE = 24;
    static readonly FLOAT = 25;
    static readonly INT32 = 26;
    static readonly INT64 = 27;
    static readonly UINT32 = 28;
    static readonly UINT64 = 29;
    static readonly SINT32 = 30;
    static readonly SINT64 = 31;
    static readonly FIXED32 = 32;
    static readonly FIXED64 = 33;
    static readonly SFIXED32 = 34;
    static readonly SFIXED64 = 35;
    static readonly BOOL = 36;
    static readonly STRING = 37;
    static readonly BYTES = 38;
    static readonly COMMENT = 39;
    static readonly LINE_COMMENT = 40;
    static readonly PLUGIN_DEV_MARKER = 41;
    static readonly NL = 42;
    static readonly WS = 43;
    static readonly LCURLY = 44;
    static readonly RCURLY = 45;
    static readonly LPAREN = 46;
    static readonly RPAREN = 47;
    static readonly LSQUARE = 48;
    static readonly RSQUARE = 49;
    static readonly LT = 50;
    static readonly GT = 51;
    static readonly COMMA = 52;
    static readonly DOT = 53;
    static readonly COLON = 54;
    static readonly SEMICOLON = 55;
    static readonly ASSIGN = 56;
    static readonly IDENT = 57;
    static readonly STRING_VALUE = 58;
    static readonly INTEGER_VALUE = 59;
    static readonly FLOAT_VALUE = 60;
    static readonly ERRCHAR = 61;
    // tslint:disable:no-trailing-whitespace
    static readonly channelNames: string[];
    // tslint:disable:no-trailing-whitespace
    static readonly modeNames: string[];
    static readonly ruleNames: string[];
    private static readonly _LITERAL_NAMES;
    private static readonly _SYMBOLIC_NAMES;
    static readonly VOCABULARY: Vocabulary;
    // @Override
    // @NotNull
    get vocabulary(): Vocabulary;
    // tslint:enable:no-trailing-whitespace
    constructor(input: CharStream);
    // @Override
    get grammarFileName(): string;
    // @Override
    get ruleNames(): string[];
    // @Override
    get serializedATN(): string;
    // @Override
    get channelNames(): string[];
    // @Override
    get modeNames(): string[];
    private static readonly _serializedATNSegments;
    private static readonly _serializedATNSegment0;
    private static readonly _serializedATNSegment1;
    static readonly _serializedATN: string;
    static __ATN: ATN;
    static get _ATN(): ATN;
}
export { parse, ProtoVisitor, ProtoLexer, ProtoParser, ProtoContext, SyntaxStatementContext, SyntaxNameContext, PackageStatementContext, PackageNameContext, ImportStatementContext, FileReferenceContext, OptionEntryContext, EnumBlockContext, EnumNameContext, EnumFieldContext, EnumFieldNameContext, EnumFieldValueContext, ExtendBlockContext, ExtendBlockEntryContext, ServiceBlockContext, ServiceNameContext, RpcMethodContext, RpcNameContext, RpcTypeContext, MessageBlockContext, MessageNameContext, OneofContext, OneofNameContext, MapContext, MapKeyContext, MapValueContext, TagContext, GroupBlockContext, GroupNameContext, ExtensionsContext, RangeContext, RangeFromContext, RangeToContext, ReservedFieldRangesContext, ReservedFieldNamesContext, ReservedFieldNameContext, FieldContext, FieldNameContext, FieldModifierContext, TypeReferenceContext, FieldOptionsContext, OptionContext, FieldRerefenceContext, StandardFieldRerefenceContext, CustomFieldReferenceContext, OptionValueContext, TextFormatContext, TextFormatOptionNameContext, TextFormatEntryContext, TextFormatOptionValueContext, FullIdentContext, IdentContext, ProtoParserListener, ProtoParserVisitor };
