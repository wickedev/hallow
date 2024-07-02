// Generated from parser/ProtoParser.g4 by ANTLR 4.9.0-SNAPSHOT


import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";

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
 * This interface defines a complete listener for a parse tree produced by
 * `ProtoParser`.
 */
export interface ProtoParserListener extends ParseTreeListener {
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

