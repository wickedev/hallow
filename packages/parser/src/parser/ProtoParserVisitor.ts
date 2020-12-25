// Generated from parser/ProtoParser.g4 by ANTLR 4.7.3-SNAPSHOT


import { ParseTreeVisitor } from "antlr4ts";

import { ProtoContext } from "./ProtoParser";
import { SyntaxStatementContext } from "./ProtoParser";
import { SyntaxNameContext } from "./ProtoParser";
import { PackageStatementContext } from "./ProtoParser";
import { PackageNameContext } from "./ProtoParser";
import { ImportStatementContext } from "./ProtoParser";
import { FileReferenceContext } from "./ProtoParser";
import { OptionEntryContext } from "./ProtoParser";
import { EnumBlockContext } from "./ProtoParser";
import { EnumNameContext } from "./ProtoParser";
import { EnumFieldContext } from "./ProtoParser";
import { EnumFieldNameContext } from "./ProtoParser";
import { EnumFieldValueContext } from "./ProtoParser";
import { ExtendBlockContext } from "./ProtoParser";
import { ExtendBlockEntryContext } from "./ProtoParser";
import { ServiceBlockContext } from "./ProtoParser";
import { ServiceNameContext } from "./ProtoParser";
import { RpcMethodContext } from "./ProtoParser";
import { RpcNameContext } from "./ProtoParser";
import { RpcTypeContext } from "./ProtoParser";
import { MessageBlockContext } from "./ProtoParser";
import { MessageNameContext } from "./ProtoParser";
import { OneofContext } from "./ProtoParser";
import { OneofNameContext } from "./ProtoParser";
import { MapContext } from "./ProtoParser";
import { MapKeyContext } from "./ProtoParser";
import { MapValueContext } from "./ProtoParser";
import { TagContext } from "./ProtoParser";
import { GroupBlockContext } from "./ProtoParser";
import { GroupNameContext } from "./ProtoParser";
import { ExtensionsContext } from "./ProtoParser";
import { RangeContext } from "./ProtoParser";
import { RangeFromContext } from "./ProtoParser";
import { RangeToContext } from "./ProtoParser";
import { ReservedFieldRangesContext } from "./ProtoParser";
import { ReservedFieldNamesContext } from "./ProtoParser";
import { ReservedFieldNameContext } from "./ProtoParser";
import { FieldContext } from "./ProtoParser";
import { FieldNameContext } from "./ProtoParser";
import { FieldModifierContext } from "./ProtoParser";
import { TypeReferenceContext } from "./ProtoParser";
import { FieldOptionsContext } from "./ProtoParser";
import { OptionContext } from "./ProtoParser";
import { FieldRerefenceContext } from "./ProtoParser";
import { StandardFieldRerefenceContext } from "./ProtoParser";
import { CustomFieldReferenceContext } from "./ProtoParser";
import { OptionValueContext } from "./ProtoParser";
import { TextFormatContext } from "./ProtoParser";
import { TextFormatOptionNameContext } from "./ProtoParser";
import { TextFormatEntryContext } from "./ProtoParser";
import { TextFormatOptionValueContext } from "./ProtoParser";
import { FullIdentContext } from "./ProtoParser";
import { IdentContext } from "./ProtoParser";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `ProtoParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface ProtoParserVisitor<Result> extends ParseTreeVisitor<Result> {
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

