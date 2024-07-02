// Generated from parser/ProtoParser.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { ProtoParserListener } from "./ProtoParserListener";
import { ProtoParserVisitor } from "./ProtoParserVisitor";


export class ProtoParser extends Parser {
	public static readonly PACKAGE = 1;
	public static readonly SYNTAX = 2;
	public static readonly IMPORT = 3;
	public static readonly PUBLIC = 4;
	public static readonly OPTION = 5;
	public static readonly MESSAGE = 6;
	public static readonly GROUP = 7;
	public static readonly OPTIONAL = 8;
	public static readonly REQUIRED = 9;
	public static readonly REPEATED = 10;
	public static readonly ONEOF = 11;
	public static readonly EXTEND = 12;
	public static readonly EXTENSIONS = 13;
	public static readonly TO = 14;
	public static readonly MAX = 15;
	public static readonly RESERVED = 16;
	public static readonly ENUM = 17;
	public static readonly SERVICE = 18;
	public static readonly RPC = 19;
	public static readonly RETURNS = 20;
	public static readonly STREAM = 21;
	public static readonly MAP = 22;
	public static readonly BOOLEAN_VALUE = 23;
	public static readonly DOUBLE = 24;
	public static readonly FLOAT = 25;
	public static readonly INT32 = 26;
	public static readonly INT64 = 27;
	public static readonly UINT32 = 28;
	public static readonly UINT64 = 29;
	public static readonly SINT32 = 30;
	public static readonly SINT64 = 31;
	public static readonly FIXED32 = 32;
	public static readonly FIXED64 = 33;
	public static readonly SFIXED32 = 34;
	public static readonly SFIXED64 = 35;
	public static readonly BOOL = 36;
	public static readonly STRING = 37;
	public static readonly BYTES = 38;
	public static readonly COMMENT = 39;
	public static readonly LINE_COMMENT = 40;
	public static readonly PLUGIN_DEV_MARKER = 41;
	public static readonly NL = 42;
	public static readonly WS = 43;
	public static readonly LCURLY = 44;
	public static readonly RCURLY = 45;
	public static readonly LPAREN = 46;
	public static readonly RPAREN = 47;
	public static readonly LSQUARE = 48;
	public static readonly RSQUARE = 49;
	public static readonly LT = 50;
	public static readonly GT = 51;
	public static readonly COMMA = 52;
	public static readonly DOT = 53;
	public static readonly COLON = 54;
	public static readonly SEMICOLON = 55;
	public static readonly ASSIGN = 56;
	public static readonly IDENT = 57;
	public static readonly STRING_VALUE = 58;
	public static readonly INTEGER_VALUE = 59;
	public static readonly FLOAT_VALUE = 60;
	public static readonly ERRCHAR = 61;
	public static readonly RULE_proto = 0;
	public static readonly RULE_syntaxStatement = 1;
	public static readonly RULE_syntaxName = 2;
	public static readonly RULE_packageStatement = 3;
	public static readonly RULE_packageName = 4;
	public static readonly RULE_importStatement = 5;
	public static readonly RULE_fileReference = 6;
	public static readonly RULE_optionEntry = 7;
	public static readonly RULE_enumBlock = 8;
	public static readonly RULE_enumName = 9;
	public static readonly RULE_enumField = 10;
	public static readonly RULE_enumFieldName = 11;
	public static readonly RULE_enumFieldValue = 12;
	public static readonly RULE_extendBlock = 13;
	public static readonly RULE_extendBlockEntry = 14;
	public static readonly RULE_serviceBlock = 15;
	public static readonly RULE_serviceName = 16;
	public static readonly RULE_rpcMethod = 17;
	public static readonly RULE_rpcName = 18;
	public static readonly RULE_rpcType = 19;
	public static readonly RULE_messageBlock = 20;
	public static readonly RULE_messageName = 21;
	public static readonly RULE_oneof = 22;
	public static readonly RULE_oneofName = 23;
	public static readonly RULE_map = 24;
	public static readonly RULE_mapKey = 25;
	public static readonly RULE_mapValue = 26;
	public static readonly RULE_tag = 27;
	public static readonly RULE_groupBlock = 28;
	public static readonly RULE_groupName = 29;
	public static readonly RULE_extensions = 30;
	public static readonly RULE_range = 31;
	public static readonly RULE_rangeFrom = 32;
	public static readonly RULE_rangeTo = 33;
	public static readonly RULE_reservedFieldRanges = 34;
	public static readonly RULE_reservedFieldNames = 35;
	public static readonly RULE_reservedFieldName = 36;
	public static readonly RULE_field = 37;
	public static readonly RULE_fieldName = 38;
	public static readonly RULE_fieldModifier = 39;
	public static readonly RULE_typeReference = 40;
	public static readonly RULE_fieldOptions = 41;
	public static readonly RULE_option = 42;
	public static readonly RULE_fieldRerefence = 43;
	public static readonly RULE_standardFieldRerefence = 44;
	public static readonly RULE_customFieldReference = 45;
	public static readonly RULE_optionValue = 46;
	public static readonly RULE_textFormat = 47;
	public static readonly RULE_textFormatOptionName = 48;
	public static readonly RULE_textFormatEntry = 49;
	public static readonly RULE_textFormatOptionValue = 50;
	public static readonly RULE_fullIdent = 51;
	public static readonly RULE_ident = 52;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"proto", "syntaxStatement", "syntaxName", "packageStatement", "packageName", 
		"importStatement", "fileReference", "optionEntry", "enumBlock", "enumName", 
		"enumField", "enumFieldName", "enumFieldValue", "extendBlock", "extendBlockEntry", 
		"serviceBlock", "serviceName", "rpcMethod", "rpcName", "rpcType", "messageBlock", 
		"messageName", "oneof", "oneofName", "map", "mapKey", "mapValue", "tag", 
		"groupBlock", "groupName", "extensions", "range", "rangeFrom", "rangeTo", 
		"reservedFieldRanges", "reservedFieldNames", "reservedFieldName", "field", 
		"fieldName", "fieldModifier", "typeReference", "fieldOptions", "option", 
		"fieldRerefence", "standardFieldRerefence", "customFieldReference", "optionValue", 
		"textFormat", "textFormatOptionName", "textFormatEntry", "textFormatOptionValue", 
		"fullIdent", "ident",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'package'", "'syntax'", "'import'", "'public'", "'option'", 
		"'message'", "'group'", "'optional'", "'required'", "'repeated'", "'oneof'", 
		"'extend'", "'extensions'", "'to'", "'max'", "'reserved'", "'enum'", "'service'", 
		"'rpc'", "'returns'", "'stream'", "'map'", undefined, "'double'", "'float'", 
		"'int32'", "'int64'", "'uint32'", "'uint64'", "'sint32'", "'sint64'", 
		"'fixed32'", "'fixed64'", "'sfixed32'", "'sfixed64'", "'bool'", "'string'", 
		"'bytes'", undefined, undefined, undefined, undefined, undefined, "'{'", 
		"'}'", "'('", "')'", "'['", "']'", "'<'", "'>'", "','", "'.'", "':'", 
		"';'", "'='",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, "PACKAGE", "SYNTAX", "IMPORT", "PUBLIC", "OPTION", "MESSAGE", 
		"GROUP", "OPTIONAL", "REQUIRED", "REPEATED", "ONEOF", "EXTEND", "EXTENSIONS", 
		"TO", "MAX", "RESERVED", "ENUM", "SERVICE", "RPC", "RETURNS", "STREAM", 
		"MAP", "BOOLEAN_VALUE", "DOUBLE", "FLOAT", "INT32", "INT64", "UINT32", 
		"UINT64", "SINT32", "SINT64", "FIXED32", "FIXED64", "SFIXED32", "SFIXED64", 
		"BOOL", "STRING", "BYTES", "COMMENT", "LINE_COMMENT", "PLUGIN_DEV_MARKER", 
		"NL", "WS", "LCURLY", "RCURLY", "LPAREN", "RPAREN", "LSQUARE", "RSQUARE", 
		"LT", "GT", "COMMA", "DOT", "COLON", "SEMICOLON", "ASSIGN", "IDENT", "STRING_VALUE", 
		"INTEGER_VALUE", "FLOAT_VALUE", "ERRCHAR",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(ProtoParser._LITERAL_NAMES, ProtoParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return ProtoParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "ProtoParser.g4"; }

	// @Override
	public get ruleNames(): string[] { return ProtoParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return ProtoParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(ProtoParser._ATN, this);
	}
	// @RuleVersion(0)
	public proto(): ProtoContext {
		let _localctx: ProtoContext = new ProtoContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, ProtoParser.RULE_proto);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 107;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === ProtoParser.SYNTAX) {
				{
				this.state = 106;
				this.syntaxStatement();
				}
			}

			this.state = 118;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ProtoParser.PACKAGE) | (1 << ProtoParser.IMPORT) | (1 << ProtoParser.OPTION) | (1 << ProtoParser.MESSAGE) | (1 << ProtoParser.EXTEND) | (1 << ProtoParser.ENUM) | (1 << ProtoParser.SERVICE))) !== 0)) {
				{
				this.state = 116;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case ProtoParser.PACKAGE:
					{
					this.state = 109;
					this.packageStatement();
					}
					break;
				case ProtoParser.IMPORT:
					{
					this.state = 110;
					this.importStatement();
					}
					break;
				case ProtoParser.OPTION:
					{
					this.state = 111;
					this.optionEntry();
					}
					break;
				case ProtoParser.ENUM:
					{
					this.state = 112;
					this.enumBlock();
					}
					break;
				case ProtoParser.MESSAGE:
					{
					this.state = 113;
					this.messageBlock();
					}
					break;
				case ProtoParser.EXTEND:
					{
					this.state = 114;
					this.extendBlock();
					}
					break;
				case ProtoParser.SERVICE:
					{
					this.state = 115;
					this.serviceBlock();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 120;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 121;
			this.match(ProtoParser.EOF);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public syntaxStatement(): SyntaxStatementContext {
		let _localctx: SyntaxStatementContext = new SyntaxStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, ProtoParser.RULE_syntaxStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 123;
			this.match(ProtoParser.SYNTAX);
			this.state = 124;
			this.match(ProtoParser.ASSIGN);
			this.state = 125;
			this.syntaxName();
			this.state = 126;
			this.match(ProtoParser.SEMICOLON);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public syntaxName(): SyntaxNameContext {
		let _localctx: SyntaxNameContext = new SyntaxNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, ProtoParser.RULE_syntaxName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 128;
			this.match(ProtoParser.STRING_VALUE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public packageStatement(): PackageStatementContext {
		let _localctx: PackageStatementContext = new PackageStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, ProtoParser.RULE_packageStatement);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 130;
			this.match(ProtoParser.PACKAGE);
			this.state = 131;
			this.packageName();
			this.state = 132;
			this.match(ProtoParser.SEMICOLON);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public packageName(): PackageNameContext {
		let _localctx: PackageNameContext = new PackageNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, ProtoParser.RULE_packageName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 134;
			this.fullIdent();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public importStatement(): ImportStatementContext {
		let _localctx: ImportStatementContext = new ImportStatementContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, ProtoParser.RULE_importStatement);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 136;
			this.match(ProtoParser.IMPORT);
			this.state = 138;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === ProtoParser.PUBLIC) {
				{
				this.state = 137;
				this.match(ProtoParser.PUBLIC);
				}
			}

			this.state = 140;
			this.fileReference();
			this.state = 141;
			this.match(ProtoParser.SEMICOLON);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public fileReference(): FileReferenceContext {
		let _localctx: FileReferenceContext = new FileReferenceContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, ProtoParser.RULE_fileReference);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 143;
			this.match(ProtoParser.STRING_VALUE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public optionEntry(): OptionEntryContext {
		let _localctx: OptionEntryContext = new OptionEntryContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, ProtoParser.RULE_optionEntry);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 145;
			this.match(ProtoParser.OPTION);
			this.state = 146;
			this.option();
			this.state = 147;
			this.match(ProtoParser.SEMICOLON);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public enumBlock(): EnumBlockContext {
		let _localctx: EnumBlockContext = new EnumBlockContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, ProtoParser.RULE_enumBlock);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 149;
			this.match(ProtoParser.ENUM);
			this.state = 150;
			this.enumName();
			this.state = 151;
			this.match(ProtoParser.LCURLY);
			this.state = 158;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ProtoParser.PACKAGE) | (1 << ProtoParser.SYNTAX) | (1 << ProtoParser.IMPORT) | (1 << ProtoParser.PUBLIC) | (1 << ProtoParser.OPTION) | (1 << ProtoParser.MESSAGE) | (1 << ProtoParser.GROUP) | (1 << ProtoParser.OPTIONAL) | (1 << ProtoParser.REQUIRED) | (1 << ProtoParser.REPEATED) | (1 << ProtoParser.ONEOF) | (1 << ProtoParser.EXTEND) | (1 << ProtoParser.EXTENSIONS) | (1 << ProtoParser.TO) | (1 << ProtoParser.MAX) | (1 << ProtoParser.RESERVED) | (1 << ProtoParser.ENUM) | (1 << ProtoParser.SERVICE) | (1 << ProtoParser.RPC) | (1 << ProtoParser.RETURNS) | (1 << ProtoParser.STREAM) | (1 << ProtoParser.MAP) | (1 << ProtoParser.BOOLEAN_VALUE) | (1 << ProtoParser.DOUBLE) | (1 << ProtoParser.FLOAT) | (1 << ProtoParser.INT32) | (1 << ProtoParser.INT64) | (1 << ProtoParser.UINT32) | (1 << ProtoParser.UINT64) | (1 << ProtoParser.SINT32) | (1 << ProtoParser.SINT64))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (ProtoParser.FIXED32 - 32)) | (1 << (ProtoParser.FIXED64 - 32)) | (1 << (ProtoParser.SFIXED32 - 32)) | (1 << (ProtoParser.SFIXED64 - 32)) | (1 << (ProtoParser.BOOL - 32)) | (1 << (ProtoParser.STRING - 32)) | (1 << (ProtoParser.BYTES - 32)) | (1 << (ProtoParser.IDENT - 32)))) !== 0)) {
				{
				this.state = 156;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 4, this._ctx) ) {
				case 1:
					{
					this.state = 152;
					this.enumField();
					}
					break;

				case 2:
					{
					this.state = 153;
					this.optionEntry();
					}
					break;

				case 3:
					{
					this.state = 154;
					this.reservedFieldRanges();
					}
					break;

				case 4:
					{
					this.state = 155;
					this.reservedFieldNames();
					}
					break;
				}
				}
				this.state = 160;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 161;
			this.match(ProtoParser.RCURLY);
			this.state = 163;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === ProtoParser.SEMICOLON) {
				{
				this.state = 162;
				this.match(ProtoParser.SEMICOLON);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public enumName(): EnumNameContext {
		let _localctx: EnumNameContext = new EnumNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, ProtoParser.RULE_enumName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 165;
			this.ident();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public enumField(): EnumFieldContext {
		let _localctx: EnumFieldContext = new EnumFieldContext(this._ctx, this.state);
		this.enterRule(_localctx, 20, ProtoParser.RULE_enumField);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 167;
			this.enumFieldName();
			this.state = 168;
			this.match(ProtoParser.ASSIGN);
			this.state = 169;
			this.enumFieldValue();
			this.state = 171;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === ProtoParser.LSQUARE) {
				{
				this.state = 170;
				this.fieldOptions();
				}
			}

			this.state = 173;
			this.match(ProtoParser.SEMICOLON);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public enumFieldName(): EnumFieldNameContext {
		let _localctx: EnumFieldNameContext = new EnumFieldNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 22, ProtoParser.RULE_enumFieldName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 175;
			this.ident();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public enumFieldValue(): EnumFieldValueContext {
		let _localctx: EnumFieldValueContext = new EnumFieldValueContext(this._ctx, this.state);
		this.enterRule(_localctx, 24, ProtoParser.RULE_enumFieldValue);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 177;
			this.match(ProtoParser.INTEGER_VALUE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public extendBlock(): ExtendBlockContext {
		let _localctx: ExtendBlockContext = new ExtendBlockContext(this._ctx, this.state);
		this.enterRule(_localctx, 26, ProtoParser.RULE_extendBlock);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 179;
			this.match(ProtoParser.EXTEND);
			this.state = 180;
			this.typeReference();
			this.state = 181;
			this.match(ProtoParser.LCURLY);
			this.state = 185;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ProtoParser.PACKAGE) | (1 << ProtoParser.SYNTAX) | (1 << ProtoParser.IMPORT) | (1 << ProtoParser.PUBLIC) | (1 << ProtoParser.OPTION) | (1 << ProtoParser.MESSAGE) | (1 << ProtoParser.GROUP) | (1 << ProtoParser.OPTIONAL) | (1 << ProtoParser.REQUIRED) | (1 << ProtoParser.REPEATED) | (1 << ProtoParser.ONEOF) | (1 << ProtoParser.EXTEND) | (1 << ProtoParser.EXTENSIONS) | (1 << ProtoParser.TO) | (1 << ProtoParser.MAX) | (1 << ProtoParser.RESERVED) | (1 << ProtoParser.ENUM) | (1 << ProtoParser.SERVICE) | (1 << ProtoParser.RPC) | (1 << ProtoParser.RETURNS) | (1 << ProtoParser.STREAM) | (1 << ProtoParser.MAP) | (1 << ProtoParser.BOOLEAN_VALUE) | (1 << ProtoParser.DOUBLE) | (1 << ProtoParser.FLOAT) | (1 << ProtoParser.INT32) | (1 << ProtoParser.INT64) | (1 << ProtoParser.UINT32) | (1 << ProtoParser.UINT64) | (1 << ProtoParser.SINT32) | (1 << ProtoParser.SINT64))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (ProtoParser.FIXED32 - 32)) | (1 << (ProtoParser.FIXED64 - 32)) | (1 << (ProtoParser.SFIXED32 - 32)) | (1 << (ProtoParser.SFIXED64 - 32)) | (1 << (ProtoParser.BOOL - 32)) | (1 << (ProtoParser.STRING - 32)) | (1 << (ProtoParser.BYTES - 32)) | (1 << (ProtoParser.DOT - 32)) | (1 << (ProtoParser.IDENT - 32)))) !== 0)) {
				{
				{
				this.state = 182;
				this.extendBlockEntry();
				}
				}
				this.state = 187;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 188;
			this.match(ProtoParser.RCURLY);
			this.state = 190;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === ProtoParser.SEMICOLON) {
				{
				this.state = 189;
				this.match(ProtoParser.SEMICOLON);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public extendBlockEntry(): ExtendBlockEntryContext {
		let _localctx: ExtendBlockEntryContext = new ExtendBlockEntryContext(this._ctx, this.state);
		this.enterRule(_localctx, 28, ProtoParser.RULE_extendBlockEntry);
		try {
			this.state = 194;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 10, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 192;
				this.field();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 193;
				this.groupBlock();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public serviceBlock(): ServiceBlockContext {
		let _localctx: ServiceBlockContext = new ServiceBlockContext(this._ctx, this.state);
		this.enterRule(_localctx, 30, ProtoParser.RULE_serviceBlock);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 196;
			this.match(ProtoParser.SERVICE);
			this.state = 197;
			this.serviceName();
			this.state = 198;
			this.match(ProtoParser.LCURLY);
			this.state = 203;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === ProtoParser.OPTION || _la === ProtoParser.RPC) {
				{
				this.state = 201;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case ProtoParser.RPC:
					{
					this.state = 199;
					this.rpcMethod();
					}
					break;
				case ProtoParser.OPTION:
					{
					this.state = 200;
					this.optionEntry();
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
				this.state = 205;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 206;
			this.match(ProtoParser.RCURLY);
			this.state = 208;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === ProtoParser.SEMICOLON) {
				{
				this.state = 207;
				this.match(ProtoParser.SEMICOLON);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public serviceName(): ServiceNameContext {
		let _localctx: ServiceNameContext = new ServiceNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 32, ProtoParser.RULE_serviceName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 210;
			this.ident();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public rpcMethod(): RpcMethodContext {
		let _localctx: RpcMethodContext = new RpcMethodContext(this._ctx, this.state);
		this.enterRule(_localctx, 34, ProtoParser.RULE_rpcMethod);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 212;
			this.match(ProtoParser.RPC);
			this.state = 213;
			this.rpcName();
			this.state = 214;
			this.match(ProtoParser.LPAREN);
			this.state = 215;
			this.rpcType();
			this.state = 216;
			this.match(ProtoParser.RPAREN);
			this.state = 217;
			this.match(ProtoParser.RETURNS);
			this.state = 218;
			this.match(ProtoParser.LPAREN);
			this.state = 219;
			this.rpcType();
			this.state = 220;
			this.match(ProtoParser.RPAREN);
			this.state = 229;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === ProtoParser.LCURLY) {
				{
				this.state = 221;
				this.match(ProtoParser.LCURLY);
				this.state = 225;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === ProtoParser.OPTION) {
					{
					{
					this.state = 222;
					this.optionEntry();
					}
					}
					this.state = 227;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				this.state = 228;
				this.match(ProtoParser.RCURLY);
				}
			}

			this.state = 232;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === ProtoParser.SEMICOLON) {
				{
				this.state = 231;
				this.match(ProtoParser.SEMICOLON);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public rpcName(): RpcNameContext {
		let _localctx: RpcNameContext = new RpcNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 36, ProtoParser.RULE_rpcName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 234;
			this.ident();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public rpcType(): RpcTypeContext {
		let _localctx: RpcTypeContext = new RpcTypeContext(this._ctx, this.state);
		this.enterRule(_localctx, 38, ProtoParser.RULE_rpcType);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 237;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 17, this._ctx) ) {
			case 1:
				{
				this.state = 236;
				this.match(ProtoParser.STREAM);
				}
				break;
			}
			this.state = 239;
			this.typeReference();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public messageBlock(): MessageBlockContext {
		let _localctx: MessageBlockContext = new MessageBlockContext(this._ctx, this.state);
		this.enterRule(_localctx, 40, ProtoParser.RULE_messageBlock);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 241;
			this.match(ProtoParser.MESSAGE);
			this.state = 242;
			this.messageName();
			this.state = 243;
			this.match(ProtoParser.LCURLY);
			this.state = 257;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ProtoParser.PACKAGE) | (1 << ProtoParser.SYNTAX) | (1 << ProtoParser.IMPORT) | (1 << ProtoParser.PUBLIC) | (1 << ProtoParser.OPTION) | (1 << ProtoParser.MESSAGE) | (1 << ProtoParser.GROUP) | (1 << ProtoParser.OPTIONAL) | (1 << ProtoParser.REQUIRED) | (1 << ProtoParser.REPEATED) | (1 << ProtoParser.ONEOF) | (1 << ProtoParser.EXTEND) | (1 << ProtoParser.EXTENSIONS) | (1 << ProtoParser.TO) | (1 << ProtoParser.MAX) | (1 << ProtoParser.RESERVED) | (1 << ProtoParser.ENUM) | (1 << ProtoParser.SERVICE) | (1 << ProtoParser.RPC) | (1 << ProtoParser.RETURNS) | (1 << ProtoParser.STREAM) | (1 << ProtoParser.MAP) | (1 << ProtoParser.BOOLEAN_VALUE) | (1 << ProtoParser.DOUBLE) | (1 << ProtoParser.FLOAT) | (1 << ProtoParser.INT32) | (1 << ProtoParser.INT64) | (1 << ProtoParser.UINT32) | (1 << ProtoParser.UINT64) | (1 << ProtoParser.SINT32) | (1 << ProtoParser.SINT64))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (ProtoParser.FIXED32 - 32)) | (1 << (ProtoParser.FIXED64 - 32)) | (1 << (ProtoParser.SFIXED32 - 32)) | (1 << (ProtoParser.SFIXED64 - 32)) | (1 << (ProtoParser.BOOL - 32)) | (1 << (ProtoParser.STRING - 32)) | (1 << (ProtoParser.BYTES - 32)) | (1 << (ProtoParser.DOT - 32)) | (1 << (ProtoParser.IDENT - 32)))) !== 0)) {
				{
				this.state = 255;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 18, this._ctx) ) {
				case 1:
					{
					this.state = 244;
					this.field();
					}
					break;

				case 2:
					{
					this.state = 245;
					this.optionEntry();
					}
					break;

				case 3:
					{
					this.state = 246;
					this.messageBlock();
					}
					break;

				case 4:
					{
					this.state = 247;
					this.enumBlock();
					}
					break;

				case 5:
					{
					this.state = 248;
					this.extensions();
					}
					break;

				case 6:
					{
					this.state = 249;
					this.extendBlock();
					}
					break;

				case 7:
					{
					this.state = 250;
					this.groupBlock();
					}
					break;

				case 8:
					{
					this.state = 251;
					this.oneof();
					}
					break;

				case 9:
					{
					this.state = 252;
					this.map();
					}
					break;

				case 10:
					{
					this.state = 253;
					this.reservedFieldRanges();
					}
					break;

				case 11:
					{
					this.state = 254;
					this.reservedFieldNames();
					}
					break;
				}
				}
				this.state = 259;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 260;
			this.match(ProtoParser.RCURLY);
			this.state = 262;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === ProtoParser.SEMICOLON) {
				{
				this.state = 261;
				this.match(ProtoParser.SEMICOLON);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public messageName(): MessageNameContext {
		let _localctx: MessageNameContext = new MessageNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 42, ProtoParser.RULE_messageName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 264;
			this.ident();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public oneof(): OneofContext {
		let _localctx: OneofContext = new OneofContext(this._ctx, this.state);
		this.enterRule(_localctx, 44, ProtoParser.RULE_oneof);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 266;
			this.match(ProtoParser.ONEOF);
			this.state = 267;
			this.oneofName();
			this.state = 268;
			this.match(ProtoParser.LCURLY);
			this.state = 274;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ProtoParser.PACKAGE) | (1 << ProtoParser.SYNTAX) | (1 << ProtoParser.IMPORT) | (1 << ProtoParser.PUBLIC) | (1 << ProtoParser.OPTION) | (1 << ProtoParser.MESSAGE) | (1 << ProtoParser.GROUP) | (1 << ProtoParser.OPTIONAL) | (1 << ProtoParser.REQUIRED) | (1 << ProtoParser.REPEATED) | (1 << ProtoParser.ONEOF) | (1 << ProtoParser.EXTEND) | (1 << ProtoParser.EXTENSIONS) | (1 << ProtoParser.TO) | (1 << ProtoParser.MAX) | (1 << ProtoParser.RESERVED) | (1 << ProtoParser.ENUM) | (1 << ProtoParser.SERVICE) | (1 << ProtoParser.RPC) | (1 << ProtoParser.RETURNS) | (1 << ProtoParser.STREAM) | (1 << ProtoParser.MAP) | (1 << ProtoParser.BOOLEAN_VALUE) | (1 << ProtoParser.DOUBLE) | (1 << ProtoParser.FLOAT) | (1 << ProtoParser.INT32) | (1 << ProtoParser.INT64) | (1 << ProtoParser.UINT32) | (1 << ProtoParser.UINT64) | (1 << ProtoParser.SINT32) | (1 << ProtoParser.SINT64))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (ProtoParser.FIXED32 - 32)) | (1 << (ProtoParser.FIXED64 - 32)) | (1 << (ProtoParser.SFIXED32 - 32)) | (1 << (ProtoParser.SFIXED64 - 32)) | (1 << (ProtoParser.BOOL - 32)) | (1 << (ProtoParser.STRING - 32)) | (1 << (ProtoParser.BYTES - 32)) | (1 << (ProtoParser.DOT - 32)) | (1 << (ProtoParser.IDENT - 32)))) !== 0)) {
				{
				this.state = 272;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 21, this._ctx) ) {
				case 1:
					{
					this.state = 269;
					this.field();
					}
					break;

				case 2:
					{
					this.state = 270;
					this.groupBlock();
					}
					break;

				case 3:
					{
					this.state = 271;
					this.optionEntry();
					}
					break;
				}
				}
				this.state = 276;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 277;
			this.match(ProtoParser.RCURLY);
			this.state = 279;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === ProtoParser.SEMICOLON) {
				{
				this.state = 278;
				this.match(ProtoParser.SEMICOLON);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public oneofName(): OneofNameContext {
		let _localctx: OneofNameContext = new OneofNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 46, ProtoParser.RULE_oneofName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 281;
			this.ident();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public map(): MapContext {
		let _localctx: MapContext = new MapContext(this._ctx, this.state);
		this.enterRule(_localctx, 48, ProtoParser.RULE_map);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 283;
			this.match(ProtoParser.MAP);
			this.state = 284;
			this.match(ProtoParser.LT);
			this.state = 285;
			this.mapKey();
			this.state = 286;
			this.match(ProtoParser.COMMA);
			this.state = 287;
			this.mapValue();
			this.state = 288;
			this.match(ProtoParser.GT);
			this.state = 289;
			this.fieldName();
			this.state = 290;
			this.match(ProtoParser.ASSIGN);
			this.state = 291;
			this.tag();
			this.state = 293;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === ProtoParser.LSQUARE) {
				{
				this.state = 292;
				this.fieldOptions();
				}
			}

			this.state = 295;
			this.match(ProtoParser.SEMICOLON);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public mapKey(): MapKeyContext {
		let _localctx: MapKeyContext = new MapKeyContext(this._ctx, this.state);
		this.enterRule(_localctx, 50, ProtoParser.RULE_mapKey);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 297;
			_la = this._input.LA(1);
			if (!(((((_la - 26)) & ~0x1F) === 0 && ((1 << (_la - 26)) & ((1 << (ProtoParser.INT32 - 26)) | (1 << (ProtoParser.INT64 - 26)) | (1 << (ProtoParser.UINT32 - 26)) | (1 << (ProtoParser.UINT64 - 26)) | (1 << (ProtoParser.SINT32 - 26)) | (1 << (ProtoParser.SINT64 - 26)) | (1 << (ProtoParser.FIXED32 - 26)) | (1 << (ProtoParser.FIXED64 - 26)) | (1 << (ProtoParser.SFIXED32 - 26)) | (1 << (ProtoParser.SFIXED64 - 26)) | (1 << (ProtoParser.BOOL - 26)) | (1 << (ProtoParser.STRING - 26)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public mapValue(): MapValueContext {
		let _localctx: MapValueContext = new MapValueContext(this._ctx, this.state);
		this.enterRule(_localctx, 52, ProtoParser.RULE_mapValue);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 299;
			this.typeReference();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public tag(): TagContext {
		let _localctx: TagContext = new TagContext(this._ctx, this.state);
		this.enterRule(_localctx, 54, ProtoParser.RULE_tag);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 301;
			this.match(ProtoParser.INTEGER_VALUE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public groupBlock(): GroupBlockContext {
		let _localctx: GroupBlockContext = new GroupBlockContext(this._ctx, this.state);
		this.enterRule(_localctx, 56, ProtoParser.RULE_groupBlock);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 304;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ProtoParser.OPTIONAL) | (1 << ProtoParser.REQUIRED) | (1 << ProtoParser.REPEATED))) !== 0)) {
				{
				this.state = 303;
				this.fieldModifier();
				}
			}

			this.state = 306;
			this.match(ProtoParser.GROUP);
			this.state = 307;
			this.groupName();
			this.state = 308;
			this.match(ProtoParser.ASSIGN);
			this.state = 309;
			this.tag();
			this.state = 310;
			this.match(ProtoParser.LCURLY);
			this.state = 320;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ProtoParser.PACKAGE) | (1 << ProtoParser.SYNTAX) | (1 << ProtoParser.IMPORT) | (1 << ProtoParser.PUBLIC) | (1 << ProtoParser.OPTION) | (1 << ProtoParser.MESSAGE) | (1 << ProtoParser.GROUP) | (1 << ProtoParser.OPTIONAL) | (1 << ProtoParser.REQUIRED) | (1 << ProtoParser.REPEATED) | (1 << ProtoParser.ONEOF) | (1 << ProtoParser.EXTEND) | (1 << ProtoParser.EXTENSIONS) | (1 << ProtoParser.TO) | (1 << ProtoParser.MAX) | (1 << ProtoParser.RESERVED) | (1 << ProtoParser.ENUM) | (1 << ProtoParser.SERVICE) | (1 << ProtoParser.RPC) | (1 << ProtoParser.RETURNS) | (1 << ProtoParser.STREAM) | (1 << ProtoParser.MAP) | (1 << ProtoParser.BOOLEAN_VALUE) | (1 << ProtoParser.DOUBLE) | (1 << ProtoParser.FLOAT) | (1 << ProtoParser.INT32) | (1 << ProtoParser.INT64) | (1 << ProtoParser.UINT32) | (1 << ProtoParser.UINT64) | (1 << ProtoParser.SINT32) | (1 << ProtoParser.SINT64))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (ProtoParser.FIXED32 - 32)) | (1 << (ProtoParser.FIXED64 - 32)) | (1 << (ProtoParser.SFIXED32 - 32)) | (1 << (ProtoParser.SFIXED64 - 32)) | (1 << (ProtoParser.BOOL - 32)) | (1 << (ProtoParser.STRING - 32)) | (1 << (ProtoParser.BYTES - 32)) | (1 << (ProtoParser.DOT - 32)) | (1 << (ProtoParser.IDENT - 32)))) !== 0)) {
				{
				this.state = 318;
				this._errHandler.sync(this);
				switch ( this.interpreter.adaptivePredict(this._input, 26, this._ctx) ) {
				case 1:
					{
					this.state = 311;
					this.field();
					}
					break;

				case 2:
					{
					this.state = 312;
					this.optionEntry();
					}
					break;

				case 3:
					{
					this.state = 313;
					this.messageBlock();
					}
					break;

				case 4:
					{
					this.state = 314;
					this.enumBlock();
					}
					break;

				case 5:
					{
					this.state = 315;
					this.extensions();
					}
					break;

				case 6:
					{
					this.state = 316;
					this.extendBlock();
					}
					break;

				case 7:
					{
					this.state = 317;
					this.groupBlock();
					}
					break;
				}
				}
				this.state = 322;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 323;
			this.match(ProtoParser.RCURLY);
			this.state = 325;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === ProtoParser.SEMICOLON) {
				{
				this.state = 324;
				this.match(ProtoParser.SEMICOLON);
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public groupName(): GroupNameContext {
		let _localctx: GroupNameContext = new GroupNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 58, ProtoParser.RULE_groupName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 327;
			this.ident();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public extensions(): ExtensionsContext {
		let _localctx: ExtensionsContext = new ExtensionsContext(this._ctx, this.state);
		this.enterRule(_localctx, 60, ProtoParser.RULE_extensions);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 329;
			this.match(ProtoParser.EXTENSIONS);
			this.state = 330;
			this.range();
			this.state = 335;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === ProtoParser.COMMA) {
				{
				{
				this.state = 331;
				this.match(ProtoParser.COMMA);
				this.state = 332;
				this.range();
				}
				}
				this.state = 337;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 338;
			this.match(ProtoParser.SEMICOLON);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public range(): RangeContext {
		let _localctx: RangeContext = new RangeContext(this._ctx, this.state);
		this.enterRule(_localctx, 62, ProtoParser.RULE_range);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 340;
			this.rangeFrom();
			this.state = 346;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === ProtoParser.TO) {
				{
				this.state = 341;
				this.match(ProtoParser.TO);
				this.state = 344;
				this._errHandler.sync(this);
				switch (this._input.LA(1)) {
				case ProtoParser.INTEGER_VALUE:
					{
					this.state = 342;
					this.rangeTo();
					}
					break;
				case ProtoParser.MAX:
					{
					this.state = 343;
					this.match(ProtoParser.MAX);
					}
					break;
				default:
					throw new NoViableAltException(this);
				}
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public rangeFrom(): RangeFromContext {
		let _localctx: RangeFromContext = new RangeFromContext(this._ctx, this.state);
		this.enterRule(_localctx, 64, ProtoParser.RULE_rangeFrom);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 348;
			this.match(ProtoParser.INTEGER_VALUE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public rangeTo(): RangeToContext {
		let _localctx: RangeToContext = new RangeToContext(this._ctx, this.state);
		this.enterRule(_localctx, 66, ProtoParser.RULE_rangeTo);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 350;
			this.match(ProtoParser.INTEGER_VALUE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public reservedFieldRanges(): ReservedFieldRangesContext {
		let _localctx: ReservedFieldRangesContext = new ReservedFieldRangesContext(this._ctx, this.state);
		this.enterRule(_localctx, 68, ProtoParser.RULE_reservedFieldRanges);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 352;
			this.match(ProtoParser.RESERVED);
			this.state = 353;
			this.range();
			this.state = 358;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === ProtoParser.COMMA) {
				{
				{
				this.state = 354;
				this.match(ProtoParser.COMMA);
				this.state = 355;
				this.range();
				}
				}
				this.state = 360;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 361;
			this.match(ProtoParser.SEMICOLON);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public reservedFieldNames(): ReservedFieldNamesContext {
		let _localctx: ReservedFieldNamesContext = new ReservedFieldNamesContext(this._ctx, this.state);
		this.enterRule(_localctx, 70, ProtoParser.RULE_reservedFieldNames);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 363;
			this.match(ProtoParser.RESERVED);
			this.state = 364;
			this.reservedFieldName();
			this.state = 369;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === ProtoParser.COMMA) {
				{
				{
				this.state = 365;
				this.match(ProtoParser.COMMA);
				this.state = 366;
				this.reservedFieldName();
				}
				}
				this.state = 371;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 372;
			this.match(ProtoParser.SEMICOLON);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public reservedFieldName(): ReservedFieldNameContext {
		let _localctx: ReservedFieldNameContext = new ReservedFieldNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 72, ProtoParser.RULE_reservedFieldName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 374;
			this.match(ProtoParser.STRING_VALUE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public field(): FieldContext {
		let _localctx: FieldContext = new FieldContext(this._ctx, this.state);
		this.enterRule(_localctx, 74, ProtoParser.RULE_field);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 377;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 34, this._ctx) ) {
			case 1:
				{
				this.state = 376;
				this.fieldModifier();
				}
				break;
			}
			this.state = 379;
			this.typeReference();
			this.state = 380;
			this.fieldName();
			this.state = 381;
			this.match(ProtoParser.ASSIGN);
			this.state = 382;
			this.tag();
			this.state = 384;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === ProtoParser.LSQUARE) {
				{
				this.state = 383;
				this.fieldOptions();
				}
			}

			this.state = 386;
			this.match(ProtoParser.SEMICOLON);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public fieldName(): FieldNameContext {
		let _localctx: FieldNameContext = new FieldNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 76, ProtoParser.RULE_fieldName);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 388;
			this.ident();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public fieldModifier(): FieldModifierContext {
		let _localctx: FieldModifierContext = new FieldModifierContext(this._ctx, this.state);
		this.enterRule(_localctx, 78, ProtoParser.RULE_fieldModifier);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 390;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ProtoParser.OPTIONAL) | (1 << ProtoParser.REQUIRED) | (1 << ProtoParser.REPEATED))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public typeReference(): TypeReferenceContext {
		let _localctx: TypeReferenceContext = new TypeReferenceContext(this._ctx, this.state);
		this.enterRule(_localctx, 80, ProtoParser.RULE_typeReference);
		let _la: number;
		try {
			this.state = 418;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 38, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 392;
				this.match(ProtoParser.DOUBLE);
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 393;
				this.match(ProtoParser.FLOAT);
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 394;
				this.match(ProtoParser.INT32);
				}
				break;

			case 4:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 395;
				this.match(ProtoParser.INT64);
				}
				break;

			case 5:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 396;
				this.match(ProtoParser.UINT32);
				}
				break;

			case 6:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 397;
				this.match(ProtoParser.UINT64);
				}
				break;

			case 7:
				this.enterOuterAlt(_localctx, 7);
				{
				this.state = 398;
				this.match(ProtoParser.SINT32);
				}
				break;

			case 8:
				this.enterOuterAlt(_localctx, 8);
				{
				this.state = 399;
				this.match(ProtoParser.SINT64);
				}
				break;

			case 9:
				this.enterOuterAlt(_localctx, 9);
				{
				this.state = 400;
				this.match(ProtoParser.FIXED32);
				}
				break;

			case 10:
				this.enterOuterAlt(_localctx, 10);
				{
				this.state = 401;
				this.match(ProtoParser.FIXED64);
				}
				break;

			case 11:
				this.enterOuterAlt(_localctx, 11);
				{
				this.state = 402;
				this.match(ProtoParser.SFIXED32);
				}
				break;

			case 12:
				this.enterOuterAlt(_localctx, 12);
				{
				this.state = 403;
				this.match(ProtoParser.SFIXED64);
				}
				break;

			case 13:
				this.enterOuterAlt(_localctx, 13);
				{
				this.state = 404;
				this.match(ProtoParser.BOOL);
				}
				break;

			case 14:
				this.enterOuterAlt(_localctx, 14);
				{
				this.state = 405;
				this.match(ProtoParser.STRING);
				}
				break;

			case 15:
				this.enterOuterAlt(_localctx, 15);
				{
				this.state = 406;
				this.match(ProtoParser.BYTES);
				}
				break;

			case 16:
				this.enterOuterAlt(_localctx, 16);
				{
				this.state = 408;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				if (_la === ProtoParser.DOT) {
					{
					this.state = 407;
					this.match(ProtoParser.DOT);
					}
				}

				this.state = 410;
				this.ident();
				this.state = 415;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === ProtoParser.DOT) {
					{
					{
					this.state = 411;
					this.match(ProtoParser.DOT);
					this.state = 412;
					this.ident();
					}
					}
					this.state = 417;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public fieldOptions(): FieldOptionsContext {
		let _localctx: FieldOptionsContext = new FieldOptionsContext(this._ctx, this.state);
		this.enterRule(_localctx, 82, ProtoParser.RULE_fieldOptions);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 420;
			this.match(ProtoParser.LSQUARE);
			this.state = 429;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ProtoParser.PACKAGE) | (1 << ProtoParser.SYNTAX) | (1 << ProtoParser.IMPORT) | (1 << ProtoParser.PUBLIC) | (1 << ProtoParser.OPTION) | (1 << ProtoParser.MESSAGE) | (1 << ProtoParser.GROUP) | (1 << ProtoParser.OPTIONAL) | (1 << ProtoParser.REQUIRED) | (1 << ProtoParser.REPEATED) | (1 << ProtoParser.ONEOF) | (1 << ProtoParser.EXTEND) | (1 << ProtoParser.EXTENSIONS) | (1 << ProtoParser.TO) | (1 << ProtoParser.MAX) | (1 << ProtoParser.RESERVED) | (1 << ProtoParser.ENUM) | (1 << ProtoParser.SERVICE) | (1 << ProtoParser.RPC) | (1 << ProtoParser.RETURNS) | (1 << ProtoParser.STREAM) | (1 << ProtoParser.MAP) | (1 << ProtoParser.BOOLEAN_VALUE) | (1 << ProtoParser.DOUBLE) | (1 << ProtoParser.FLOAT) | (1 << ProtoParser.INT32) | (1 << ProtoParser.INT64) | (1 << ProtoParser.UINT32) | (1 << ProtoParser.UINT64) | (1 << ProtoParser.SINT32) | (1 << ProtoParser.SINT64))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (ProtoParser.FIXED32 - 32)) | (1 << (ProtoParser.FIXED64 - 32)) | (1 << (ProtoParser.SFIXED32 - 32)) | (1 << (ProtoParser.SFIXED64 - 32)) | (1 << (ProtoParser.BOOL - 32)) | (1 << (ProtoParser.STRING - 32)) | (1 << (ProtoParser.BYTES - 32)) | (1 << (ProtoParser.LPAREN - 32)) | (1 << (ProtoParser.IDENT - 32)))) !== 0)) {
				{
				this.state = 421;
				this.option();
				this.state = 426;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === ProtoParser.COMMA) {
					{
					{
					this.state = 422;
					this.match(ProtoParser.COMMA);
					this.state = 423;
					this.option();
					}
					}
					this.state = 428;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
			}

			this.state = 431;
			this.match(ProtoParser.RSQUARE);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public option(): OptionContext {
		let _localctx: OptionContext = new OptionContext(this._ctx, this.state);
		this.enterRule(_localctx, 84, ProtoParser.RULE_option);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 433;
			this.fieldRerefence();
			this.state = 434;
			this.match(ProtoParser.ASSIGN);
			this.state = 435;
			this.optionValue();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public fieldRerefence(): FieldRerefenceContext {
		let _localctx: FieldRerefenceContext = new FieldRerefenceContext(this._ctx, this.state);
		this.enterRule(_localctx, 86, ProtoParser.RULE_fieldRerefence);
		let _la: number;
		try {
			this.state = 454;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case ProtoParser.PACKAGE:
			case ProtoParser.SYNTAX:
			case ProtoParser.IMPORT:
			case ProtoParser.PUBLIC:
			case ProtoParser.OPTION:
			case ProtoParser.MESSAGE:
			case ProtoParser.GROUP:
			case ProtoParser.OPTIONAL:
			case ProtoParser.REQUIRED:
			case ProtoParser.REPEATED:
			case ProtoParser.ONEOF:
			case ProtoParser.EXTEND:
			case ProtoParser.EXTENSIONS:
			case ProtoParser.TO:
			case ProtoParser.MAX:
			case ProtoParser.RESERVED:
			case ProtoParser.ENUM:
			case ProtoParser.SERVICE:
			case ProtoParser.RPC:
			case ProtoParser.RETURNS:
			case ProtoParser.STREAM:
			case ProtoParser.MAP:
			case ProtoParser.BOOLEAN_VALUE:
			case ProtoParser.DOUBLE:
			case ProtoParser.FLOAT:
			case ProtoParser.INT32:
			case ProtoParser.INT64:
			case ProtoParser.UINT32:
			case ProtoParser.UINT64:
			case ProtoParser.SINT32:
			case ProtoParser.SINT64:
			case ProtoParser.FIXED32:
			case ProtoParser.FIXED64:
			case ProtoParser.SFIXED32:
			case ProtoParser.SFIXED64:
			case ProtoParser.BOOL:
			case ProtoParser.STRING:
			case ProtoParser.BYTES:
			case ProtoParser.IDENT:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 437;
				this.standardFieldRerefence();
				}
				break;
			case ProtoParser.LPAREN:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 438;
				this.match(ProtoParser.LPAREN);
				this.state = 439;
				this.customFieldReference();
				this.state = 440;
				this.match(ProtoParser.RPAREN);
				this.state = 451;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
				while (_la === ProtoParser.DOT) {
					{
					{
					this.state = 441;
					this.match(ProtoParser.DOT);
					this.state = 447;
					this._errHandler.sync(this);
					switch (this._input.LA(1)) {
					case ProtoParser.PACKAGE:
					case ProtoParser.SYNTAX:
					case ProtoParser.IMPORT:
					case ProtoParser.PUBLIC:
					case ProtoParser.OPTION:
					case ProtoParser.MESSAGE:
					case ProtoParser.GROUP:
					case ProtoParser.OPTIONAL:
					case ProtoParser.REQUIRED:
					case ProtoParser.REPEATED:
					case ProtoParser.ONEOF:
					case ProtoParser.EXTEND:
					case ProtoParser.EXTENSIONS:
					case ProtoParser.TO:
					case ProtoParser.MAX:
					case ProtoParser.RESERVED:
					case ProtoParser.ENUM:
					case ProtoParser.SERVICE:
					case ProtoParser.RPC:
					case ProtoParser.RETURNS:
					case ProtoParser.STREAM:
					case ProtoParser.MAP:
					case ProtoParser.BOOLEAN_VALUE:
					case ProtoParser.DOUBLE:
					case ProtoParser.FLOAT:
					case ProtoParser.INT32:
					case ProtoParser.INT64:
					case ProtoParser.UINT32:
					case ProtoParser.UINT64:
					case ProtoParser.SINT32:
					case ProtoParser.SINT64:
					case ProtoParser.FIXED32:
					case ProtoParser.FIXED64:
					case ProtoParser.SFIXED32:
					case ProtoParser.SFIXED64:
					case ProtoParser.BOOL:
					case ProtoParser.STRING:
					case ProtoParser.BYTES:
					case ProtoParser.IDENT:
						{
						this.state = 442;
						this.standardFieldRerefence();
						}
						break;
					case ProtoParser.LPAREN:
						{
						this.state = 443;
						this.match(ProtoParser.LPAREN);
						this.state = 444;
						this.customFieldReference();
						this.state = 445;
						this.match(ProtoParser.RPAREN);
						}
						break;
					default:
						throw new NoViableAltException(this);
					}
					}
					}
					this.state = 453;
					this._errHandler.sync(this);
					_la = this._input.LA(1);
				}
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public standardFieldRerefence(): StandardFieldRerefenceContext {
		let _localctx: StandardFieldRerefenceContext = new StandardFieldRerefenceContext(this._ctx, this.state);
		this.enterRule(_localctx, 88, ProtoParser.RULE_standardFieldRerefence);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 456;
			this.ident();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public customFieldReference(): CustomFieldReferenceContext {
		let _localctx: CustomFieldReferenceContext = new CustomFieldReferenceContext(this._ctx, this.state);
		this.enterRule(_localctx, 90, ProtoParser.RULE_customFieldReference);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 459;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === ProtoParser.DOT) {
				{
				this.state = 458;
				this.match(ProtoParser.DOT);
				}
			}

			this.state = 461;
			this.ident();
			this.state = 466;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === ProtoParser.DOT) {
				{
				{
				this.state = 462;
				this.match(ProtoParser.DOT);
				this.state = 463;
				this.ident();
				}
				}
				this.state = 468;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public optionValue(): OptionValueContext {
		let _localctx: OptionValueContext = new OptionValueContext(this._ctx, this.state);
		this.enterRule(_localctx, 92, ProtoParser.RULE_optionValue);
		try {
			this.state = 475;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case ProtoParser.INTEGER_VALUE:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 469;
				this.match(ProtoParser.INTEGER_VALUE);
				}
				break;
			case ProtoParser.FLOAT_VALUE:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 470;
				this.match(ProtoParser.FLOAT_VALUE);
				}
				break;
			case ProtoParser.BOOLEAN_VALUE:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 471;
				this.match(ProtoParser.BOOLEAN_VALUE);
				}
				break;
			case ProtoParser.STRING_VALUE:
				this.enterOuterAlt(_localctx, 4);
				{
				this.state = 472;
				this.match(ProtoParser.STRING_VALUE);
				}
				break;
			case ProtoParser.IDENT:
				this.enterOuterAlt(_localctx, 5);
				{
				this.state = 473;
				this.match(ProtoParser.IDENT);
				}
				break;
			case ProtoParser.LCURLY:
				this.enterOuterAlt(_localctx, 6);
				{
				this.state = 474;
				this.textFormat();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public textFormat(): TextFormatContext {
		let _localctx: TextFormatContext = new TextFormatContext(this._ctx, this.state);
		this.enterRule(_localctx, 94, ProtoParser.RULE_textFormat);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 477;
			this.match(ProtoParser.LCURLY);
			this.state = 481;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while ((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ProtoParser.PACKAGE) | (1 << ProtoParser.SYNTAX) | (1 << ProtoParser.IMPORT) | (1 << ProtoParser.PUBLIC) | (1 << ProtoParser.OPTION) | (1 << ProtoParser.MESSAGE) | (1 << ProtoParser.GROUP) | (1 << ProtoParser.OPTIONAL) | (1 << ProtoParser.REQUIRED) | (1 << ProtoParser.REPEATED) | (1 << ProtoParser.ONEOF) | (1 << ProtoParser.EXTEND) | (1 << ProtoParser.EXTENSIONS) | (1 << ProtoParser.TO) | (1 << ProtoParser.MAX) | (1 << ProtoParser.RESERVED) | (1 << ProtoParser.ENUM) | (1 << ProtoParser.SERVICE) | (1 << ProtoParser.RPC) | (1 << ProtoParser.RETURNS) | (1 << ProtoParser.STREAM) | (1 << ProtoParser.MAP) | (1 << ProtoParser.BOOLEAN_VALUE) | (1 << ProtoParser.DOUBLE) | (1 << ProtoParser.FLOAT) | (1 << ProtoParser.INT32) | (1 << ProtoParser.INT64) | (1 << ProtoParser.UINT32) | (1 << ProtoParser.UINT64) | (1 << ProtoParser.SINT32) | (1 << ProtoParser.SINT64))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (ProtoParser.FIXED32 - 32)) | (1 << (ProtoParser.FIXED64 - 32)) | (1 << (ProtoParser.SFIXED32 - 32)) | (1 << (ProtoParser.SFIXED64 - 32)) | (1 << (ProtoParser.BOOL - 32)) | (1 << (ProtoParser.STRING - 32)) | (1 << (ProtoParser.BYTES - 32)) | (1 << (ProtoParser.LSQUARE - 32)) | (1 << (ProtoParser.IDENT - 32)))) !== 0)) {
				{
				{
				this.state = 478;
				this.textFormatEntry();
				}
				}
				this.state = 483;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 484;
			this.match(ProtoParser.RCURLY);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public textFormatOptionName(): TextFormatOptionNameContext {
		let _localctx: TextFormatOptionNameContext = new TextFormatOptionNameContext(this._ctx, this.state);
		this.enterRule(_localctx, 96, ProtoParser.RULE_textFormatOptionName);
		try {
			this.state = 491;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case ProtoParser.PACKAGE:
			case ProtoParser.SYNTAX:
			case ProtoParser.IMPORT:
			case ProtoParser.PUBLIC:
			case ProtoParser.OPTION:
			case ProtoParser.MESSAGE:
			case ProtoParser.GROUP:
			case ProtoParser.OPTIONAL:
			case ProtoParser.REQUIRED:
			case ProtoParser.REPEATED:
			case ProtoParser.ONEOF:
			case ProtoParser.EXTEND:
			case ProtoParser.EXTENSIONS:
			case ProtoParser.TO:
			case ProtoParser.MAX:
			case ProtoParser.RESERVED:
			case ProtoParser.ENUM:
			case ProtoParser.SERVICE:
			case ProtoParser.RPC:
			case ProtoParser.RETURNS:
			case ProtoParser.STREAM:
			case ProtoParser.MAP:
			case ProtoParser.BOOLEAN_VALUE:
			case ProtoParser.DOUBLE:
			case ProtoParser.FLOAT:
			case ProtoParser.INT32:
			case ProtoParser.INT64:
			case ProtoParser.UINT32:
			case ProtoParser.UINT64:
			case ProtoParser.SINT32:
			case ProtoParser.SINT64:
			case ProtoParser.FIXED32:
			case ProtoParser.FIXED64:
			case ProtoParser.SFIXED32:
			case ProtoParser.SFIXED64:
			case ProtoParser.BOOL:
			case ProtoParser.STRING:
			case ProtoParser.BYTES:
			case ProtoParser.IDENT:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 486;
				this.ident();
				}
				break;
			case ProtoParser.LSQUARE:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 487;
				this.match(ProtoParser.LSQUARE);
				this.state = 488;
				this.typeReference();
				this.state = 489;
				this.match(ProtoParser.RSQUARE);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public textFormatEntry(): TextFormatEntryContext {
		let _localctx: TextFormatEntryContext = new TextFormatEntryContext(this._ctx, this.state);
		this.enterRule(_localctx, 98, ProtoParser.RULE_textFormatEntry);
		try {
			this.state = 500;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 49, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 493;
				this.textFormatOptionName();
				this.state = 494;
				this.match(ProtoParser.COLON);
				this.state = 495;
				this.textFormatOptionValue();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 497;
				this.textFormatOptionName();
				this.state = 498;
				this.textFormat();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public textFormatOptionValue(): TextFormatOptionValueContext {
		let _localctx: TextFormatOptionValueContext = new TextFormatOptionValueContext(this._ctx, this.state);
		this.enterRule(_localctx, 100, ProtoParser.RULE_textFormatOptionValue);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 502;
			_la = this._input.LA(1);
			if (!(_la === ProtoParser.BOOLEAN_VALUE || ((((_la - 57)) & ~0x1F) === 0 && ((1 << (_la - 57)) & ((1 << (ProtoParser.IDENT - 57)) | (1 << (ProtoParser.STRING_VALUE - 57)) | (1 << (ProtoParser.INTEGER_VALUE - 57)) | (1 << (ProtoParser.FLOAT_VALUE - 57)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public fullIdent(): FullIdentContext {
		let _localctx: FullIdentContext = new FullIdentContext(this._ctx, this.state);
		this.enterRule(_localctx, 102, ProtoParser.RULE_fullIdent);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 504;
			this.ident();
			this.state = 509;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === ProtoParser.DOT) {
				{
				{
				this.state = 505;
				this.match(ProtoParser.DOT);
				this.state = 506;
				this.ident();
				}
				}
				this.state = 511;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public ident(): IdentContext {
		let _localctx: IdentContext = new IdentContext(this._ctx, this.state);
		this.enterRule(_localctx, 104, ProtoParser.RULE_ident);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 512;
			_la = this._input.LA(1);
			if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ProtoParser.PACKAGE) | (1 << ProtoParser.SYNTAX) | (1 << ProtoParser.IMPORT) | (1 << ProtoParser.PUBLIC) | (1 << ProtoParser.OPTION) | (1 << ProtoParser.MESSAGE) | (1 << ProtoParser.GROUP) | (1 << ProtoParser.OPTIONAL) | (1 << ProtoParser.REQUIRED) | (1 << ProtoParser.REPEATED) | (1 << ProtoParser.ONEOF) | (1 << ProtoParser.EXTEND) | (1 << ProtoParser.EXTENSIONS) | (1 << ProtoParser.TO) | (1 << ProtoParser.MAX) | (1 << ProtoParser.RESERVED) | (1 << ProtoParser.ENUM) | (1 << ProtoParser.SERVICE) | (1 << ProtoParser.RPC) | (1 << ProtoParser.RETURNS) | (1 << ProtoParser.STREAM) | (1 << ProtoParser.MAP) | (1 << ProtoParser.BOOLEAN_VALUE) | (1 << ProtoParser.DOUBLE) | (1 << ProtoParser.FLOAT) | (1 << ProtoParser.INT32) | (1 << ProtoParser.INT64) | (1 << ProtoParser.UINT32) | (1 << ProtoParser.UINT64) | (1 << ProtoParser.SINT32) | (1 << ProtoParser.SINT64))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (ProtoParser.FIXED32 - 32)) | (1 << (ProtoParser.FIXED64 - 32)) | (1 << (ProtoParser.SFIXED32 - 32)) | (1 << (ProtoParser.SFIXED64 - 32)) | (1 << (ProtoParser.BOOL - 32)) | (1 << (ProtoParser.STRING - 32)) | (1 << (ProtoParser.BYTES - 32)) | (1 << (ProtoParser.IDENT - 32)))) !== 0))) {
			this._errHandler.recoverInline(this);
			} else {
				if (this._input.LA(1) === Token.EOF) {
					this.matchedEOF = true;
				}

				this._errHandler.reportMatch(this);
				this.consume();
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03?\u0205\x04\x02" +
		"\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07" +
		"\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r\t\r\x04" +
		"\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t\x12\x04" +
		"\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t\x17\x04" +
		"\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t\x1C\x04" +
		"\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04\"\t\"\x04#" +
		"\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(\x04)\t)\x04*\t*\x04+\t+" +
		"\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x040\t0\x041\t1\x042\t2\x043\t3\x044" +
		"\t4\x045\t5\x046\t6\x03\x02\x05\x02n\n\x02\x03\x02\x03\x02\x03\x02\x03" +
		"\x02\x03\x02\x03\x02\x03\x02\x07\x02w\n\x02\f\x02\x0E\x02z\v\x02\x03\x02" +
		"\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x04\x03\x04\x03\x05" +
		"\x03\x05\x03\x05\x03\x05\x03\x06\x03\x06\x03\x07\x03\x07\x05\x07\x8D\n" +
		"\x07\x03\x07\x03\x07\x03\x07\x03\b\x03\b\x03\t\x03\t\x03\t\x03\t\x03\n" +
		"\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x07\n\x9F\n\n\f\n\x0E\n\xA2\v\n\x03" +
		"\n\x03\n\x05\n\xA6\n\n\x03\v\x03\v\x03\f\x03\f\x03\f\x03\f\x05\f\xAE\n" +
		"\f\x03\f\x03\f\x03\r\x03\r\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x0F\x03" +
		"\x0F\x07\x0F\xBA\n\x0F\f\x0F\x0E\x0F\xBD\v\x0F\x03\x0F\x03\x0F\x05\x0F" +
		"\xC1\n\x0F\x03\x10\x03\x10\x05\x10\xC5\n\x10\x03\x11\x03\x11\x03\x11\x03" +
		"\x11\x03\x11\x07\x11\xCC\n\x11\f\x11\x0E\x11\xCF\v\x11\x03\x11\x03\x11" +
		"\x05\x11\xD3\n\x11\x03\x12\x03\x12\x03\x13\x03\x13\x03\x13\x03\x13\x03" +
		"\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x13\x07\x13\xE2\n\x13" +
		"\f\x13\x0E\x13\xE5\v\x13\x03\x13\x05\x13\xE8\n\x13\x03\x13\x05\x13\xEB" +
		"\n\x13\x03\x14\x03\x14\x03\x15\x05\x15\xF0\n\x15\x03\x15\x03\x15\x03\x16" +
		"\x03\x16\x03\x16\x03\x16\x03\x16\x03\x16\x03\x16\x03\x16\x03\x16\x03\x16" +
		"\x03\x16\x03\x16\x03\x16\x03\x16\x07\x16\u0102\n\x16\f\x16\x0E\x16\u0105" +
		"\v\x16\x03\x16\x03\x16\x05\x16\u0109\n\x16\x03\x17\x03\x17\x03\x18\x03" +
		"\x18\x03\x18\x03\x18\x03\x18\x03\x18\x07\x18\u0113\n\x18\f\x18\x0E\x18" +
		"\u0116\v\x18\x03\x18\x03\x18\x05\x18\u011A\n\x18\x03\x19\x03\x19\x03\x1A" +
		"\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A" +
		"\x05\x1A\u0128\n\x1A\x03\x1A\x03\x1A\x03\x1B\x03\x1B\x03\x1C\x03\x1C\x03" +
		"\x1D\x03\x1D\x03\x1E\x05\x1E\u0133\n\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E" +
		"\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x07\x1E" +
		"\u0141\n\x1E\f\x1E\x0E\x1E\u0144\v\x1E\x03\x1E\x03\x1E\x05\x1E\u0148\n" +
		"\x1E\x03\x1F\x03\x1F\x03 \x03 \x03 \x03 \x07 \u0150\n \f \x0E \u0153\v" +
		" \x03 \x03 \x03!\x03!\x03!\x03!\x05!\u015B\n!\x05!\u015D\n!\x03\"\x03" +
		"\"\x03#\x03#\x03$\x03$\x03$\x03$\x07$\u0167\n$\f$\x0E$\u016A\v$\x03$\x03" +
		"$\x03%\x03%\x03%\x03%\x07%\u0172\n%\f%\x0E%\u0175\v%\x03%\x03%\x03&\x03" +
		"&\x03\'\x05\'\u017C\n\'\x03\'\x03\'\x03\'\x03\'\x03\'\x05\'\u0183\n\'" +
		"\x03\'\x03\'\x03(\x03(\x03)\x03)\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03" +
		"*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x05*\u019B\n*\x03*\x03*\x03" +
		"*\x07*\u01A0\n*\f*\x0E*\u01A3\v*\x05*\u01A5\n*\x03+\x03+\x03+\x03+\x07" +
		"+\u01AB\n+\f+\x0E+\u01AE\v+\x05+\u01B0\n+\x03+\x03+\x03,\x03,\x03,\x03" +
		",\x03-\x03-\x03-\x03-\x03-\x03-\x03-\x03-\x03-\x03-\x05-\u01C2\n-\x07" +
		"-\u01C4\n-\f-\x0E-\u01C7\v-\x05-\u01C9\n-\x03.\x03.\x03/\x05/\u01CE\n" +
		"/\x03/\x03/\x03/\x07/\u01D3\n/\f/\x0E/\u01D6\v/\x030\x030\x030\x030\x03" +
		"0\x030\x050\u01DE\n0\x031\x031\x071\u01E2\n1\f1\x0E1\u01E5\v1\x031\x03" +
		"1\x032\x032\x032\x032\x032\x052\u01EE\n2\x033\x033\x033\x033\x033\x03" +
		"3\x033\x053\u01F7\n3\x034\x034\x035\x035\x035\x075\u01FE\n5\f5\x0E5\u0201" +
		"\v5\x036\x036\x036\x02\x02\x027\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f" +
		"\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x18\x02\x1A\x02\x1C\x02\x1E" +
		"\x02 \x02\"\x02$\x02&\x02(\x02*\x02,\x02.\x020\x022\x024\x026\x028\x02" +
		":\x02<\x02>\x02@\x02B\x02D\x02F\x02H\x02J\x02L\x02N\x02P\x02R\x02T\x02" +
		"V\x02X\x02Z\x02\\\x02^\x02`\x02b\x02d\x02f\x02h\x02j\x02\x02\x06\x03\x02" +
		"\x1C\'\x03\x02\n\f\x04\x02\x19\x19;>\x04\x02\x03(;;\x02\u022A\x02m\x03" +
		"\x02\x02\x02\x04}\x03\x02\x02\x02\x06\x82\x03\x02\x02\x02\b\x84\x03\x02" +
		"\x02\x02\n\x88\x03\x02\x02\x02\f\x8A\x03\x02\x02\x02\x0E\x91\x03\x02\x02" +
		"\x02\x10\x93\x03\x02\x02\x02\x12\x97\x03\x02\x02\x02\x14\xA7\x03\x02\x02" +
		"\x02\x16\xA9\x03\x02\x02\x02\x18\xB1\x03\x02\x02\x02\x1A\xB3\x03\x02\x02" +
		"\x02\x1C\xB5\x03\x02\x02\x02\x1E\xC4\x03\x02\x02\x02 \xC6\x03\x02\x02" +
		"\x02\"\xD4\x03\x02\x02\x02$\xD6\x03\x02\x02\x02&\xEC\x03\x02\x02\x02(" +
		"\xEF\x03\x02\x02\x02*\xF3\x03\x02\x02\x02,\u010A\x03\x02\x02\x02.\u010C" +
		"\x03\x02\x02\x020\u011B\x03\x02\x02\x022\u011D\x03\x02\x02\x024\u012B" +
		"\x03\x02\x02\x026\u012D\x03\x02\x02\x028\u012F\x03\x02\x02\x02:\u0132" +
		"\x03\x02\x02\x02<\u0149\x03\x02\x02\x02>\u014B\x03\x02\x02\x02@\u0156" +
		"\x03\x02\x02\x02B\u015E\x03\x02\x02\x02D\u0160\x03\x02\x02\x02F\u0162" +
		"\x03\x02\x02\x02H\u016D\x03\x02\x02\x02J\u0178\x03\x02\x02\x02L\u017B" +
		"\x03\x02\x02\x02N\u0186\x03\x02\x02\x02P\u0188\x03\x02\x02\x02R\u01A4" +
		"\x03\x02\x02\x02T\u01A6\x03\x02\x02\x02V\u01B3\x03\x02\x02\x02X\u01C8" +
		"\x03\x02\x02\x02Z\u01CA\x03\x02\x02\x02\\\u01CD\x03\x02\x02\x02^\u01DD" +
		"\x03\x02\x02\x02`\u01DF\x03\x02\x02\x02b\u01ED\x03\x02\x02\x02d\u01F6" +
		"\x03\x02\x02\x02f\u01F8\x03\x02\x02\x02h\u01FA\x03\x02\x02\x02j\u0202" +
		"\x03\x02\x02\x02ln\x05\x04\x03\x02ml\x03\x02\x02\x02mn\x03\x02\x02\x02" +
		"nx\x03\x02\x02\x02ow\x05\b\x05\x02pw\x05\f\x07\x02qw\x05\x10\t\x02rw\x05" +
		"\x12\n\x02sw\x05*\x16\x02tw\x05\x1C\x0F\x02uw\x05 \x11\x02vo\x03\x02\x02" +
		"\x02vp\x03\x02\x02\x02vq\x03\x02\x02\x02vr\x03\x02\x02\x02vs\x03\x02\x02" +
		"\x02vt\x03\x02\x02\x02vu\x03\x02\x02\x02wz\x03\x02\x02\x02xv\x03\x02\x02" +
		"\x02xy\x03\x02\x02\x02y{\x03\x02\x02\x02zx\x03\x02\x02\x02{|\x07\x02\x02" +
		"\x03|\x03\x03\x02\x02\x02}~\x07\x04\x02\x02~\x7F\x07:\x02\x02\x7F\x80" +
		"\x05\x06\x04\x02\x80\x81\x079\x02\x02\x81\x05\x03\x02\x02\x02\x82\x83" +
		"\x07<\x02\x02\x83\x07\x03\x02\x02\x02\x84\x85\x07\x03\x02\x02\x85\x86" +
		"\x05\n\x06\x02\x86\x87\x079\x02\x02\x87\t\x03\x02\x02\x02\x88\x89\x05" +
		"h5\x02\x89\v\x03\x02\x02\x02\x8A\x8C\x07\x05\x02\x02\x8B\x8D\x07\x06\x02" +
		"\x02\x8C\x8B\x03\x02\x02\x02\x8C\x8D\x03\x02\x02\x02\x8D\x8E\x03\x02\x02" +
		"\x02\x8E\x8F\x05\x0E\b\x02\x8F\x90\x079\x02\x02\x90\r\x03\x02\x02\x02" +
		"\x91\x92\x07<\x02\x02\x92\x0F\x03\x02\x02\x02\x93\x94\x07\x07\x02\x02" +
		"\x94\x95\x05V,\x02\x95\x96\x079\x02\x02\x96\x11\x03\x02\x02\x02\x97\x98" +
		"\x07\x13\x02\x02\x98\x99\x05\x14\v\x02\x99\xA0\x07.\x02\x02\x9A\x9F\x05" +
		"\x16\f\x02\x9B\x9F\x05\x10\t\x02\x9C\x9F\x05F$\x02\x9D\x9F\x05H%\x02\x9E" +
		"\x9A\x03\x02\x02\x02\x9E\x9B\x03\x02\x02\x02\x9E\x9C\x03\x02\x02\x02\x9E" +
		"\x9D\x03\x02\x02\x02\x9F\xA2\x03\x02\x02\x02\xA0\x9E\x03\x02\x02\x02\xA0" +
		"\xA1\x03\x02\x02\x02\xA1\xA3\x03\x02\x02\x02\xA2\xA0\x03\x02\x02\x02\xA3" +
		"\xA5\x07/\x02\x02\xA4\xA6\x079\x02\x02\xA5\xA4\x03\x02\x02\x02\xA5\xA6" +
		"\x03\x02\x02\x02\xA6\x13\x03\x02\x02\x02\xA7\xA8\x05j6\x02\xA8\x15\x03" +
		"\x02\x02\x02\xA9\xAA\x05\x18\r\x02\xAA\xAB\x07:\x02\x02\xAB\xAD\x05\x1A" +
		"\x0E\x02\xAC\xAE\x05T+\x02\xAD\xAC\x03\x02\x02\x02\xAD\xAE\x03\x02\x02" +
		"\x02\xAE\xAF\x03\x02\x02\x02\xAF\xB0\x079\x02\x02\xB0\x17\x03\x02\x02" +
		"\x02\xB1\xB2\x05j6\x02\xB2\x19\x03\x02\x02\x02\xB3\xB4\x07=\x02\x02\xB4" +
		"\x1B\x03\x02\x02\x02\xB5\xB6\x07\x0E\x02\x02\xB6\xB7\x05R*\x02\xB7\xBB" +
		"\x07.\x02\x02\xB8\xBA\x05\x1E\x10\x02\xB9\xB8\x03\x02\x02\x02\xBA\xBD" +
		"\x03\x02\x02\x02\xBB\xB9\x03\x02\x02\x02\xBB\xBC\x03\x02\x02\x02\xBC\xBE" +
		"\x03\x02\x02\x02\xBD\xBB\x03\x02\x02\x02\xBE\xC0\x07/\x02\x02\xBF\xC1" +
		"\x079\x02\x02\xC0\xBF\x03\x02\x02\x02\xC0\xC1\x03\x02\x02\x02\xC1\x1D" +
		"\x03\x02\x02\x02\xC2\xC5\x05L\'\x02\xC3\xC5\x05:\x1E\x02\xC4\xC2\x03\x02" +
		"\x02\x02\xC4\xC3\x03\x02\x02\x02\xC5\x1F\x03\x02\x02\x02\xC6\xC7\x07\x14" +
		"\x02\x02\xC7\xC8\x05\"\x12\x02\xC8\xCD\x07.\x02\x02\xC9\xCC\x05$\x13\x02" +
		"\xCA\xCC\x05\x10\t\x02\xCB\xC9\x03\x02\x02\x02\xCB\xCA\x03\x02\x02\x02" +
		"\xCC\xCF\x03\x02\x02\x02\xCD\xCB\x03\x02\x02\x02\xCD\xCE\x03\x02\x02\x02" +
		"\xCE\xD0\x03\x02\x02\x02\xCF\xCD\x03\x02\x02\x02\xD0\xD2\x07/\x02\x02" +
		"\xD1\xD3\x079\x02\x02\xD2\xD1\x03\x02\x02\x02\xD2\xD3\x03\x02\x02\x02" +
		"\xD3!\x03\x02\x02\x02\xD4\xD5\x05j6\x02\xD5#\x03\x02\x02\x02\xD6\xD7\x07" +
		"\x15\x02\x02\xD7\xD8\x05&\x14\x02\xD8\xD9\x070\x02\x02\xD9\xDA\x05(\x15" +
		"\x02\xDA\xDB\x071\x02\x02\xDB\xDC\x07\x16\x02\x02\xDC\xDD\x070\x02\x02" +
		"\xDD\xDE\x05(\x15\x02\xDE\xE7\x071\x02\x02\xDF\xE3\x07.\x02\x02\xE0\xE2" +
		"\x05\x10\t\x02\xE1\xE0\x03\x02\x02\x02\xE2\xE5\x03\x02\x02\x02\xE3\xE1" +
		"\x03\x02\x02\x02\xE3\xE4\x03\x02\x02\x02\xE4\xE6\x03\x02\x02\x02\xE5\xE3" +
		"\x03\x02\x02\x02\xE6\xE8\x07/\x02\x02\xE7\xDF\x03\x02\x02\x02\xE7\xE8" +
		"\x03\x02\x02\x02\xE8\xEA\x03\x02\x02\x02\xE9\xEB\x079\x02\x02\xEA\xE9" +
		"\x03\x02\x02\x02\xEA\xEB\x03\x02\x02\x02\xEB%\x03\x02\x02\x02\xEC\xED" +
		"\x05j6\x02\xED\'\x03\x02\x02\x02\xEE\xF0\x07\x17\x02\x02\xEF\xEE\x03\x02" +
		"\x02\x02\xEF\xF0\x03\x02\x02\x02\xF0\xF1\x03\x02\x02\x02\xF1\xF2\x05R" +
		"*\x02\xF2)\x03\x02\x02\x02\xF3\xF4\x07\b\x02\x02\xF4\xF5\x05,\x17\x02" +
		"\xF5\u0103\x07.\x02\x02\xF6\u0102\x05L\'\x02\xF7\u0102\x05\x10\t\x02\xF8" +
		"\u0102\x05*\x16\x02\xF9\u0102\x05\x12\n\x02\xFA\u0102\x05> \x02\xFB\u0102" +
		"\x05\x1C\x0F\x02\xFC\u0102\x05:\x1E\x02\xFD\u0102\x05.\x18\x02\xFE\u0102" +
		"\x052\x1A\x02\xFF\u0102\x05F$\x02\u0100\u0102\x05H%\x02\u0101\xF6\x03" +
		"\x02\x02\x02\u0101\xF7\x03\x02\x02\x02\u0101\xF8\x03\x02\x02\x02\u0101" +
		"\xF9\x03\x02\x02\x02\u0101\xFA\x03\x02\x02\x02\u0101\xFB\x03\x02\x02\x02" +
		"\u0101\xFC\x03\x02\x02\x02\u0101\xFD\x03\x02\x02\x02\u0101\xFE\x03\x02" +
		"\x02\x02\u0101\xFF\x03\x02\x02\x02\u0101\u0100\x03\x02\x02\x02\u0102\u0105" +
		"\x03\x02\x02\x02\u0103\u0101\x03\x02\x02\x02\u0103\u0104\x03\x02\x02\x02" +
		"\u0104\u0106\x03\x02\x02\x02\u0105\u0103\x03\x02\x02\x02\u0106\u0108\x07" +
		"/\x02\x02\u0107\u0109\x079\x02\x02\u0108\u0107\x03\x02\x02\x02\u0108\u0109" +
		"\x03\x02\x02\x02\u0109+\x03\x02\x02\x02\u010A\u010B\x05j6\x02\u010B-\x03" +
		"\x02\x02\x02\u010C\u010D\x07\r\x02\x02\u010D\u010E\x050\x19\x02\u010E" +
		"\u0114\x07.\x02\x02\u010F\u0113\x05L\'\x02\u0110\u0113\x05:\x1E\x02\u0111" +
		"\u0113\x05\x10\t\x02\u0112\u010F\x03\x02\x02\x02\u0112\u0110\x03\x02\x02" +
		"\x02\u0112\u0111\x03\x02\x02\x02\u0113\u0116\x03\x02\x02\x02\u0114\u0112" +
		"\x03\x02\x02\x02\u0114\u0115\x03\x02\x02\x02\u0115\u0117\x03\x02\x02\x02" +
		"\u0116\u0114\x03\x02\x02\x02\u0117\u0119\x07/\x02\x02\u0118\u011A\x07" +
		"9\x02\x02\u0119\u0118\x03\x02\x02\x02\u0119\u011A\x03\x02\x02\x02\u011A" +
		"/\x03\x02\x02\x02\u011B\u011C\x05j6\x02\u011C1\x03\x02\x02\x02\u011D\u011E" +
		"\x07\x18\x02\x02\u011E\u011F\x074\x02\x02\u011F\u0120\x054\x1B\x02\u0120" +
		"\u0121\x076\x02\x02\u0121\u0122\x056\x1C\x02\u0122\u0123\x075\x02\x02" +
		"\u0123\u0124\x05N(\x02\u0124\u0125\x07:\x02\x02\u0125\u0127\x058\x1D\x02" +
		"\u0126\u0128\x05T+\x02\u0127\u0126\x03\x02\x02\x02\u0127\u0128\x03\x02" +
		"\x02\x02\u0128\u0129\x03\x02\x02\x02\u0129\u012A\x079\x02\x02\u012A3\x03" +
		"\x02\x02\x02\u012B\u012C\t\x02\x02\x02\u012C5\x03\x02\x02\x02\u012D\u012E" +
		"\x05R*\x02\u012E7\x03\x02\x02\x02\u012F\u0130\x07=\x02\x02\u01309\x03" +
		"\x02\x02\x02\u0131\u0133\x05P)\x02\u0132\u0131\x03\x02\x02\x02\u0132\u0133" +
		"\x03\x02\x02\x02\u0133\u0134\x03\x02\x02\x02\u0134\u0135\x07\t\x02\x02" +
		"\u0135\u0136\x05<\x1F\x02\u0136\u0137\x07:\x02\x02\u0137\u0138\x058\x1D" +
		"\x02\u0138\u0142\x07.\x02\x02\u0139\u0141\x05L\'\x02\u013A\u0141\x05\x10" +
		"\t\x02\u013B\u0141\x05*\x16\x02\u013C\u0141\x05\x12\n\x02\u013D\u0141" +
		"\x05> \x02\u013E\u0141\x05\x1C\x0F\x02\u013F\u0141\x05:\x1E\x02\u0140" +
		"\u0139\x03\x02\x02\x02\u0140\u013A\x03\x02\x02\x02\u0140\u013B\x03\x02" +
		"\x02\x02\u0140\u013C\x03\x02\x02\x02\u0140\u013D\x03\x02\x02\x02\u0140" +
		"\u013E\x03\x02\x02\x02\u0140\u013F\x03\x02\x02\x02\u0141\u0144\x03\x02" +
		"\x02\x02\u0142\u0140\x03\x02\x02\x02\u0142\u0143\x03\x02\x02\x02\u0143" +
		"\u0145\x03\x02\x02\x02\u0144\u0142\x03\x02\x02\x02\u0145\u0147\x07/\x02" +
		"\x02\u0146\u0148\x079\x02\x02\u0147\u0146\x03\x02\x02\x02\u0147\u0148" +
		"\x03\x02\x02\x02\u0148;\x03\x02\x02\x02\u0149\u014A\x05j6\x02\u014A=\x03" +
		"\x02\x02\x02\u014B\u014C\x07\x0F\x02\x02\u014C\u0151\x05@!\x02\u014D\u014E" +
		"\x076\x02\x02\u014E\u0150\x05@!\x02\u014F\u014D\x03\x02\x02\x02\u0150" +
		"\u0153\x03\x02\x02\x02\u0151\u014F\x03\x02\x02\x02\u0151\u0152\x03\x02" +
		"\x02\x02\u0152\u0154\x03\x02\x02\x02\u0153\u0151\x03\x02\x02\x02\u0154" +
		"\u0155\x079\x02\x02\u0155?\x03\x02\x02\x02\u0156\u015C\x05B\"\x02\u0157" +
		"\u015A\x07\x10\x02\x02\u0158\u015B\x05D#\x02\u0159\u015B\x07\x11\x02\x02" +
		"\u015A\u0158\x03\x02\x02\x02\u015A\u0159\x03\x02\x02\x02\u015B\u015D\x03" +
		"\x02\x02\x02\u015C\u0157\x03\x02\x02\x02\u015C\u015D\x03\x02\x02\x02\u015D" +
		"A\x03\x02\x02\x02\u015E\u015F\x07=\x02\x02\u015FC\x03\x02\x02\x02\u0160" +
		"\u0161\x07=\x02\x02\u0161E\x03\x02\x02\x02\u0162\u0163\x07\x12\x02\x02" +
		"\u0163\u0168\x05@!\x02\u0164\u0165\x076\x02\x02\u0165\u0167\x05@!\x02" +
		"\u0166\u0164\x03\x02\x02\x02\u0167\u016A\x03\x02\x02\x02\u0168\u0166\x03" +
		"\x02\x02\x02\u0168\u0169\x03\x02\x02\x02\u0169\u016B\x03\x02\x02\x02\u016A" +
		"\u0168\x03\x02\x02\x02\u016B\u016C\x079\x02\x02\u016CG\x03\x02\x02\x02" +
		"\u016D\u016E\x07\x12\x02\x02\u016E\u0173\x05J&\x02\u016F\u0170\x076\x02" +
		"\x02\u0170\u0172\x05J&\x02\u0171\u016F\x03\x02\x02\x02\u0172\u0175\x03" +
		"\x02\x02\x02\u0173\u0171\x03\x02\x02\x02\u0173\u0174\x03\x02\x02\x02\u0174" +
		"\u0176\x03\x02\x02\x02\u0175\u0173\x03\x02\x02\x02\u0176\u0177\x079\x02" +
		"\x02\u0177I\x03\x02\x02\x02\u0178\u0179\x07<\x02\x02\u0179K\x03\x02\x02" +
		"\x02\u017A\u017C\x05P)\x02\u017B\u017A\x03\x02\x02\x02\u017B\u017C\x03" +
		"\x02\x02\x02\u017C\u017D\x03\x02\x02\x02\u017D\u017E\x05R*\x02\u017E\u017F" +
		"\x05N(\x02\u017F\u0180\x07:\x02\x02\u0180\u0182\x058\x1D\x02\u0181\u0183" +
		"\x05T+\x02\u0182\u0181\x03\x02\x02\x02\u0182\u0183\x03\x02\x02\x02\u0183" +
		"\u0184\x03\x02\x02\x02\u0184\u0185\x079\x02\x02\u0185M\x03\x02\x02\x02" +
		"\u0186\u0187\x05j6\x02\u0187O\x03\x02\x02\x02\u0188\u0189\t\x03\x02\x02" +
		"\u0189Q\x03\x02\x02\x02\u018A\u01A5\x07\x1A\x02\x02\u018B\u01A5\x07\x1B" +
		"\x02\x02\u018C\u01A5\x07\x1C\x02\x02\u018D\u01A5\x07\x1D\x02\x02\u018E" +
		"\u01A5\x07\x1E\x02\x02\u018F\u01A5\x07\x1F\x02\x02\u0190\u01A5\x07 \x02" +
		"\x02\u0191\u01A5\x07!\x02\x02\u0192\u01A5\x07\"\x02\x02\u0193\u01A5\x07" +
		"#\x02\x02\u0194\u01A5\x07$\x02\x02\u0195\u01A5\x07%\x02\x02\u0196\u01A5" +
		"\x07&\x02\x02\u0197\u01A5\x07\'\x02\x02\u0198\u01A5\x07(\x02\x02\u0199" +
		"\u019B\x077\x02\x02\u019A\u0199\x03\x02\x02\x02\u019A\u019B\x03\x02\x02" +
		"\x02\u019B\u019C\x03\x02\x02\x02\u019C\u01A1\x05j6\x02\u019D\u019E\x07" +
		"7\x02\x02\u019E\u01A0\x05j6\x02\u019F\u019D\x03\x02\x02\x02\u01A0\u01A3" +
		"\x03\x02\x02\x02\u01A1\u019F\x03\x02\x02\x02\u01A1\u01A2\x03\x02\x02\x02" +
		"\u01A2\u01A5\x03\x02\x02\x02\u01A3\u01A1\x03\x02\x02\x02\u01A4\u018A\x03" +
		"\x02\x02\x02\u01A4\u018B\x03\x02\x02\x02\u01A4\u018C\x03\x02\x02\x02\u01A4" +
		"\u018D\x03\x02\x02\x02\u01A4\u018E\x03\x02\x02\x02\u01A4\u018F\x03\x02" +
		"\x02\x02\u01A4\u0190\x03\x02\x02\x02\u01A4\u0191\x03\x02\x02\x02\u01A4" +
		"\u0192\x03\x02\x02\x02\u01A4\u0193\x03\x02\x02\x02\u01A4\u0194\x03\x02" +
		"\x02\x02\u01A4\u0195\x03\x02\x02\x02\u01A4\u0196\x03\x02\x02\x02\u01A4" +
		"\u0197\x03\x02\x02\x02\u01A4\u0198\x03\x02\x02\x02\u01A4\u019A\x03\x02" +
		"\x02\x02\u01A5S\x03\x02\x02\x02\u01A6\u01AF\x072\x02\x02\u01A7\u01AC\x05" +
		"V,\x02\u01A8\u01A9\x076\x02\x02\u01A9\u01AB\x05V,\x02\u01AA\u01A8\x03" +
		"\x02\x02\x02\u01AB\u01AE\x03\x02\x02\x02\u01AC\u01AA\x03\x02\x02\x02\u01AC" +
		"\u01AD\x03\x02\x02\x02\u01AD\u01B0\x03\x02\x02\x02\u01AE\u01AC\x03\x02" +
		"\x02\x02\u01AF\u01A7\x03\x02\x02\x02\u01AF\u01B0\x03\x02\x02\x02\u01B0" +
		"\u01B1\x03\x02\x02\x02\u01B1\u01B2\x073\x02\x02\u01B2U\x03\x02\x02\x02" +
		"\u01B3\u01B4\x05X-\x02\u01B4\u01B5\x07:\x02\x02\u01B5\u01B6\x05^0\x02" +
		"\u01B6W\x03\x02\x02\x02\u01B7\u01C9\x05Z.\x02\u01B8\u01B9\x070\x02\x02" +
		"\u01B9\u01BA\x05\\/\x02\u01BA\u01C5\x071\x02\x02\u01BB\u01C1\x077\x02" +
		"\x02\u01BC\u01C2\x05Z.\x02\u01BD\u01BE\x070\x02\x02\u01BE\u01BF\x05\\" +
		"/\x02\u01BF\u01C0\x071\x02\x02\u01C0\u01C2\x03\x02\x02\x02\u01C1\u01BC" +
		"\x03\x02\x02\x02\u01C1\u01BD\x03\x02\x02\x02\u01C2\u01C4\x03\x02\x02\x02" +
		"\u01C3\u01BB\x03\x02\x02\x02\u01C4\u01C7\x03\x02\x02\x02\u01C5\u01C3\x03" +
		"\x02\x02\x02\u01C5\u01C6\x03\x02\x02\x02\u01C6\u01C9\x03\x02\x02\x02\u01C7" +
		"\u01C5\x03\x02\x02\x02\u01C8\u01B7\x03\x02\x02\x02\u01C8\u01B8\x03\x02" +
		"\x02\x02\u01C9Y\x03\x02\x02\x02\u01CA\u01CB\x05j6\x02\u01CB[\x03\x02\x02" +
		"\x02\u01CC\u01CE\x077\x02\x02\u01CD\u01CC\x03\x02\x02\x02\u01CD\u01CE" +
		"\x03\x02\x02\x02\u01CE\u01CF\x03\x02\x02\x02\u01CF\u01D4\x05j6\x02\u01D0" +
		"\u01D1\x077\x02\x02\u01D1\u01D3\x05j6\x02\u01D2\u01D0\x03\x02\x02\x02" +
		"\u01D3\u01D6\x03\x02\x02\x02\u01D4\u01D2\x03\x02\x02\x02\u01D4\u01D5\x03" +
		"\x02\x02\x02\u01D5]\x03\x02\x02\x02\u01D6\u01D4\x03\x02\x02\x02\u01D7" +
		"\u01DE\x07=\x02\x02\u01D8\u01DE\x07>\x02\x02\u01D9\u01DE\x07\x19\x02\x02" +
		"\u01DA\u01DE\x07<\x02\x02\u01DB\u01DE\x07;\x02\x02\u01DC\u01DE\x05`1\x02" +
		"\u01DD\u01D7\x03\x02\x02\x02\u01DD\u01D8\x03\x02\x02\x02\u01DD\u01D9\x03" +
		"\x02\x02\x02\u01DD\u01DA\x03\x02\x02\x02\u01DD\u01DB\x03\x02\x02\x02\u01DD" +
		"\u01DC\x03\x02\x02\x02\u01DE_\x03\x02\x02\x02\u01DF\u01E3\x07.\x02\x02" +
		"\u01E0\u01E2\x05d3\x02\u01E1\u01E0\x03\x02\x02\x02\u01E2\u01E5\x03\x02" +
		"\x02\x02\u01E3\u01E1\x03\x02\x02\x02\u01E3\u01E4\x03\x02\x02\x02\u01E4" +
		"\u01E6\x03\x02\x02\x02\u01E5\u01E3\x03\x02\x02\x02\u01E6\u01E7\x07/\x02" +
		"\x02\u01E7a\x03\x02\x02\x02\u01E8\u01EE\x05j6\x02\u01E9\u01EA\x072\x02" +
		"\x02\u01EA\u01EB\x05R*\x02\u01EB\u01EC\x073\x02\x02\u01EC\u01EE\x03\x02" +
		"\x02\x02\u01ED\u01E8\x03\x02\x02\x02\u01ED\u01E9\x03\x02\x02\x02\u01EE" +
		"c\x03\x02\x02\x02\u01EF\u01F0\x05b2\x02\u01F0\u01F1\x078\x02\x02\u01F1" +
		"\u01F2\x05f4\x02\u01F2\u01F7\x03\x02\x02\x02\u01F3\u01F4\x05b2\x02\u01F4" +
		"\u01F5\x05`1\x02\u01F5\u01F7\x03\x02\x02\x02\u01F6\u01EF\x03\x02\x02\x02" +
		"\u01F6\u01F3\x03\x02\x02\x02\u01F7e\x03\x02\x02\x02\u01F8\u01F9\t\x04" +
		"\x02\x02\u01F9g\x03\x02\x02\x02\u01FA\u01FF\x05j6\x02\u01FB\u01FC\x07" +
		"7\x02\x02\u01FC\u01FE\x05j6\x02\u01FD\u01FB\x03\x02\x02\x02\u01FE\u0201" +
		"\x03\x02\x02\x02\u01FF\u01FD\x03\x02\x02\x02\u01FF\u0200\x03\x02\x02\x02" +
		"\u0200i\x03\x02\x02\x02\u0201\u01FF\x03\x02\x02\x02\u0202\u0203\t\x05" +
		"\x02\x02\u0203k\x03\x02\x02\x025mvx\x8C\x9E\xA0\xA5\xAD\xBB\xC0\xC4\xCB" +
		"\xCD\xD2\xE3\xE7\xEA\xEF\u0101\u0103\u0108\u0112\u0114\u0119\u0127\u0132" +
		"\u0140\u0142\u0147\u0151\u015A\u015C\u0168\u0173\u017B\u0182\u019A\u01A1" +
		"\u01A4\u01AC\u01AF\u01C1\u01C5\u01C8\u01CD\u01D4\u01DD\u01E3\u01ED\u01F6" +
		"\u01FF";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!ProtoParser.__ATN) {
			ProtoParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(ProtoParser._serializedATN));
		}

		return ProtoParser.__ATN;
	}

}

export class ProtoContext extends ParserRuleContext {
	public EOF(): TerminalNode { return this.getToken(ProtoParser.EOF, 0); }
	public syntaxStatement(): SyntaxStatementContext | undefined {
		return this.tryGetRuleContext(0, SyntaxStatementContext);
	}
	public packageStatement(): PackageStatementContext[];
	public packageStatement(i: number): PackageStatementContext;
	public packageStatement(i?: number): PackageStatementContext | PackageStatementContext[] {
		if (i === undefined) {
			return this.getRuleContexts(PackageStatementContext);
		} else {
			return this.getRuleContext(i, PackageStatementContext);
		}
	}
	public importStatement(): ImportStatementContext[];
	public importStatement(i: number): ImportStatementContext;
	public importStatement(i?: number): ImportStatementContext | ImportStatementContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ImportStatementContext);
		} else {
			return this.getRuleContext(i, ImportStatementContext);
		}
	}
	public optionEntry(): OptionEntryContext[];
	public optionEntry(i: number): OptionEntryContext;
	public optionEntry(i?: number): OptionEntryContext | OptionEntryContext[] {
		if (i === undefined) {
			return this.getRuleContexts(OptionEntryContext);
		} else {
			return this.getRuleContext(i, OptionEntryContext);
		}
	}
	public enumBlock(): EnumBlockContext[];
	public enumBlock(i: number): EnumBlockContext;
	public enumBlock(i?: number): EnumBlockContext | EnumBlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(EnumBlockContext);
		} else {
			return this.getRuleContext(i, EnumBlockContext);
		}
	}
	public messageBlock(): MessageBlockContext[];
	public messageBlock(i: number): MessageBlockContext;
	public messageBlock(i?: number): MessageBlockContext | MessageBlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(MessageBlockContext);
		} else {
			return this.getRuleContext(i, MessageBlockContext);
		}
	}
	public extendBlock(): ExtendBlockContext[];
	public extendBlock(i: number): ExtendBlockContext;
	public extendBlock(i?: number): ExtendBlockContext | ExtendBlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExtendBlockContext);
		} else {
			return this.getRuleContext(i, ExtendBlockContext);
		}
	}
	public serviceBlock(): ServiceBlockContext[];
	public serviceBlock(i: number): ServiceBlockContext;
	public serviceBlock(i?: number): ServiceBlockContext | ServiceBlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ServiceBlockContext);
		} else {
			return this.getRuleContext(i, ServiceBlockContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_proto; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterProto) {
			listener.enterProto(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitProto) {
			listener.exitProto(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitProto) {
			return visitor.visitProto(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SyntaxStatementContext extends ParserRuleContext {
	public SYNTAX(): TerminalNode { return this.getToken(ProtoParser.SYNTAX, 0); }
	public ASSIGN(): TerminalNode { return this.getToken(ProtoParser.ASSIGN, 0); }
	public syntaxName(): SyntaxNameContext {
		return this.getRuleContext(0, SyntaxNameContext);
	}
	public SEMICOLON(): TerminalNode { return this.getToken(ProtoParser.SEMICOLON, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_syntaxStatement; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterSyntaxStatement) {
			listener.enterSyntaxStatement(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitSyntaxStatement) {
			listener.exitSyntaxStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitSyntaxStatement) {
			return visitor.visitSyntaxStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class SyntaxNameContext extends ParserRuleContext {
	public STRING_VALUE(): TerminalNode { return this.getToken(ProtoParser.STRING_VALUE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_syntaxName; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterSyntaxName) {
			listener.enterSyntaxName(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitSyntaxName) {
			listener.exitSyntaxName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitSyntaxName) {
			return visitor.visitSyntaxName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PackageStatementContext extends ParserRuleContext {
	public PACKAGE(): TerminalNode { return this.getToken(ProtoParser.PACKAGE, 0); }
	public packageName(): PackageNameContext {
		return this.getRuleContext(0, PackageNameContext);
	}
	public SEMICOLON(): TerminalNode { return this.getToken(ProtoParser.SEMICOLON, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_packageStatement; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterPackageStatement) {
			listener.enterPackageStatement(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitPackageStatement) {
			listener.exitPackageStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitPackageStatement) {
			return visitor.visitPackageStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class PackageNameContext extends ParserRuleContext {
	public fullIdent(): FullIdentContext {
		return this.getRuleContext(0, FullIdentContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_packageName; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterPackageName) {
			listener.enterPackageName(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitPackageName) {
			listener.exitPackageName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitPackageName) {
			return visitor.visitPackageName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ImportStatementContext extends ParserRuleContext {
	public IMPORT(): TerminalNode { return this.getToken(ProtoParser.IMPORT, 0); }
	public fileReference(): FileReferenceContext {
		return this.getRuleContext(0, FileReferenceContext);
	}
	public SEMICOLON(): TerminalNode { return this.getToken(ProtoParser.SEMICOLON, 0); }
	public PUBLIC(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.PUBLIC, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_importStatement; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterImportStatement) {
			listener.enterImportStatement(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitImportStatement) {
			listener.exitImportStatement(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitImportStatement) {
			return visitor.visitImportStatement(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FileReferenceContext extends ParserRuleContext {
	public STRING_VALUE(): TerminalNode { return this.getToken(ProtoParser.STRING_VALUE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_fileReference; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterFileReference) {
			listener.enterFileReference(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitFileReference) {
			listener.exitFileReference(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitFileReference) {
			return visitor.visitFileReference(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OptionEntryContext extends ParserRuleContext {
	public OPTION(): TerminalNode { return this.getToken(ProtoParser.OPTION, 0); }
	public option(): OptionContext {
		return this.getRuleContext(0, OptionContext);
	}
	public SEMICOLON(): TerminalNode { return this.getToken(ProtoParser.SEMICOLON, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_optionEntry; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterOptionEntry) {
			listener.enterOptionEntry(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitOptionEntry) {
			listener.exitOptionEntry(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitOptionEntry) {
			return visitor.visitOptionEntry(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class EnumBlockContext extends ParserRuleContext {
	public ENUM(): TerminalNode { return this.getToken(ProtoParser.ENUM, 0); }
	public enumName(): EnumNameContext {
		return this.getRuleContext(0, EnumNameContext);
	}
	public LCURLY(): TerminalNode { return this.getToken(ProtoParser.LCURLY, 0); }
	public RCURLY(): TerminalNode { return this.getToken(ProtoParser.RCURLY, 0); }
	public enumField(): EnumFieldContext[];
	public enumField(i: number): EnumFieldContext;
	public enumField(i?: number): EnumFieldContext | EnumFieldContext[] {
		if (i === undefined) {
			return this.getRuleContexts(EnumFieldContext);
		} else {
			return this.getRuleContext(i, EnumFieldContext);
		}
	}
	public optionEntry(): OptionEntryContext[];
	public optionEntry(i: number): OptionEntryContext;
	public optionEntry(i?: number): OptionEntryContext | OptionEntryContext[] {
		if (i === undefined) {
			return this.getRuleContexts(OptionEntryContext);
		} else {
			return this.getRuleContext(i, OptionEntryContext);
		}
	}
	public reservedFieldRanges(): ReservedFieldRangesContext[];
	public reservedFieldRanges(i: number): ReservedFieldRangesContext;
	public reservedFieldRanges(i?: number): ReservedFieldRangesContext | ReservedFieldRangesContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ReservedFieldRangesContext);
		} else {
			return this.getRuleContext(i, ReservedFieldRangesContext);
		}
	}
	public reservedFieldNames(): ReservedFieldNamesContext[];
	public reservedFieldNames(i: number): ReservedFieldNamesContext;
	public reservedFieldNames(i?: number): ReservedFieldNamesContext | ReservedFieldNamesContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ReservedFieldNamesContext);
		} else {
			return this.getRuleContext(i, ReservedFieldNamesContext);
		}
	}
	public SEMICOLON(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SEMICOLON, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_enumBlock; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterEnumBlock) {
			listener.enterEnumBlock(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitEnumBlock) {
			listener.exitEnumBlock(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitEnumBlock) {
			return visitor.visitEnumBlock(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class EnumNameContext extends ParserRuleContext {
	public ident(): IdentContext {
		return this.getRuleContext(0, IdentContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_enumName; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterEnumName) {
			listener.enterEnumName(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitEnumName) {
			listener.exitEnumName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitEnumName) {
			return visitor.visitEnumName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class EnumFieldContext extends ParserRuleContext {
	public enumFieldName(): EnumFieldNameContext {
		return this.getRuleContext(0, EnumFieldNameContext);
	}
	public ASSIGN(): TerminalNode { return this.getToken(ProtoParser.ASSIGN, 0); }
	public enumFieldValue(): EnumFieldValueContext {
		return this.getRuleContext(0, EnumFieldValueContext);
	}
	public SEMICOLON(): TerminalNode { return this.getToken(ProtoParser.SEMICOLON, 0); }
	public fieldOptions(): FieldOptionsContext | undefined {
		return this.tryGetRuleContext(0, FieldOptionsContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_enumField; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterEnumField) {
			listener.enterEnumField(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitEnumField) {
			listener.exitEnumField(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitEnumField) {
			return visitor.visitEnumField(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class EnumFieldNameContext extends ParserRuleContext {
	public ident(): IdentContext {
		return this.getRuleContext(0, IdentContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_enumFieldName; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterEnumFieldName) {
			listener.enterEnumFieldName(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitEnumFieldName) {
			listener.exitEnumFieldName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitEnumFieldName) {
			return visitor.visitEnumFieldName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class EnumFieldValueContext extends ParserRuleContext {
	public INTEGER_VALUE(): TerminalNode { return this.getToken(ProtoParser.INTEGER_VALUE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_enumFieldValue; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterEnumFieldValue) {
			listener.enterEnumFieldValue(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitEnumFieldValue) {
			listener.exitEnumFieldValue(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitEnumFieldValue) {
			return visitor.visitEnumFieldValue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExtendBlockContext extends ParserRuleContext {
	public EXTEND(): TerminalNode { return this.getToken(ProtoParser.EXTEND, 0); }
	public typeReference(): TypeReferenceContext {
		return this.getRuleContext(0, TypeReferenceContext);
	}
	public LCURLY(): TerminalNode { return this.getToken(ProtoParser.LCURLY, 0); }
	public RCURLY(): TerminalNode { return this.getToken(ProtoParser.RCURLY, 0); }
	public extendBlockEntry(): ExtendBlockEntryContext[];
	public extendBlockEntry(i: number): ExtendBlockEntryContext;
	public extendBlockEntry(i?: number): ExtendBlockEntryContext | ExtendBlockEntryContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExtendBlockEntryContext);
		} else {
			return this.getRuleContext(i, ExtendBlockEntryContext);
		}
	}
	public SEMICOLON(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SEMICOLON, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_extendBlock; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterExtendBlock) {
			listener.enterExtendBlock(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitExtendBlock) {
			listener.exitExtendBlock(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitExtendBlock) {
			return visitor.visitExtendBlock(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExtendBlockEntryContext extends ParserRuleContext {
	public field(): FieldContext | undefined {
		return this.tryGetRuleContext(0, FieldContext);
	}
	public groupBlock(): GroupBlockContext | undefined {
		return this.tryGetRuleContext(0, GroupBlockContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_extendBlockEntry; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterExtendBlockEntry) {
			listener.enterExtendBlockEntry(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitExtendBlockEntry) {
			listener.exitExtendBlockEntry(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitExtendBlockEntry) {
			return visitor.visitExtendBlockEntry(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ServiceBlockContext extends ParserRuleContext {
	public SERVICE(): TerminalNode { return this.getToken(ProtoParser.SERVICE, 0); }
	public serviceName(): ServiceNameContext {
		return this.getRuleContext(0, ServiceNameContext);
	}
	public LCURLY(): TerminalNode { return this.getToken(ProtoParser.LCURLY, 0); }
	public RCURLY(): TerminalNode { return this.getToken(ProtoParser.RCURLY, 0); }
	public rpcMethod(): RpcMethodContext[];
	public rpcMethod(i: number): RpcMethodContext;
	public rpcMethod(i?: number): RpcMethodContext | RpcMethodContext[] {
		if (i === undefined) {
			return this.getRuleContexts(RpcMethodContext);
		} else {
			return this.getRuleContext(i, RpcMethodContext);
		}
	}
	public optionEntry(): OptionEntryContext[];
	public optionEntry(i: number): OptionEntryContext;
	public optionEntry(i?: number): OptionEntryContext | OptionEntryContext[] {
		if (i === undefined) {
			return this.getRuleContexts(OptionEntryContext);
		} else {
			return this.getRuleContext(i, OptionEntryContext);
		}
	}
	public SEMICOLON(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SEMICOLON, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_serviceBlock; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterServiceBlock) {
			listener.enterServiceBlock(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitServiceBlock) {
			listener.exitServiceBlock(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitServiceBlock) {
			return visitor.visitServiceBlock(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ServiceNameContext extends ParserRuleContext {
	public ident(): IdentContext {
		return this.getRuleContext(0, IdentContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_serviceName; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterServiceName) {
			listener.enterServiceName(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitServiceName) {
			listener.exitServiceName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitServiceName) {
			return visitor.visitServiceName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RpcMethodContext extends ParserRuleContext {
	public RPC(): TerminalNode { return this.getToken(ProtoParser.RPC, 0); }
	public rpcName(): RpcNameContext {
		return this.getRuleContext(0, RpcNameContext);
	}
	public LPAREN(): TerminalNode[];
	public LPAREN(i: number): TerminalNode;
	public LPAREN(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ProtoParser.LPAREN);
		} else {
			return this.getToken(ProtoParser.LPAREN, i);
		}
	}
	public rpcType(): RpcTypeContext[];
	public rpcType(i: number): RpcTypeContext;
	public rpcType(i?: number): RpcTypeContext | RpcTypeContext[] {
		if (i === undefined) {
			return this.getRuleContexts(RpcTypeContext);
		} else {
			return this.getRuleContext(i, RpcTypeContext);
		}
	}
	public RPAREN(): TerminalNode[];
	public RPAREN(i: number): TerminalNode;
	public RPAREN(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ProtoParser.RPAREN);
		} else {
			return this.getToken(ProtoParser.RPAREN, i);
		}
	}
	public RETURNS(): TerminalNode { return this.getToken(ProtoParser.RETURNS, 0); }
	public LCURLY(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.LCURLY, 0); }
	public RCURLY(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.RCURLY, 0); }
	public SEMICOLON(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SEMICOLON, 0); }
	public optionEntry(): OptionEntryContext[];
	public optionEntry(i: number): OptionEntryContext;
	public optionEntry(i?: number): OptionEntryContext | OptionEntryContext[] {
		if (i === undefined) {
			return this.getRuleContexts(OptionEntryContext);
		} else {
			return this.getRuleContext(i, OptionEntryContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_rpcMethod; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterRpcMethod) {
			listener.enterRpcMethod(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitRpcMethod) {
			listener.exitRpcMethod(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitRpcMethod) {
			return visitor.visitRpcMethod(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RpcNameContext extends ParserRuleContext {
	public ident(): IdentContext {
		return this.getRuleContext(0, IdentContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_rpcName; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterRpcName) {
			listener.enterRpcName(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitRpcName) {
			listener.exitRpcName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitRpcName) {
			return visitor.visitRpcName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RpcTypeContext extends ParserRuleContext {
	public typeReference(): TypeReferenceContext {
		return this.getRuleContext(0, TypeReferenceContext);
	}
	public STREAM(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.STREAM, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_rpcType; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterRpcType) {
			listener.enterRpcType(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitRpcType) {
			listener.exitRpcType(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitRpcType) {
			return visitor.visitRpcType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class MessageBlockContext extends ParserRuleContext {
	public MESSAGE(): TerminalNode { return this.getToken(ProtoParser.MESSAGE, 0); }
	public messageName(): MessageNameContext {
		return this.getRuleContext(0, MessageNameContext);
	}
	public LCURLY(): TerminalNode { return this.getToken(ProtoParser.LCURLY, 0); }
	public RCURLY(): TerminalNode { return this.getToken(ProtoParser.RCURLY, 0); }
	public field(): FieldContext[];
	public field(i: number): FieldContext;
	public field(i?: number): FieldContext | FieldContext[] {
		if (i === undefined) {
			return this.getRuleContexts(FieldContext);
		} else {
			return this.getRuleContext(i, FieldContext);
		}
	}
	public optionEntry(): OptionEntryContext[];
	public optionEntry(i: number): OptionEntryContext;
	public optionEntry(i?: number): OptionEntryContext | OptionEntryContext[] {
		if (i === undefined) {
			return this.getRuleContexts(OptionEntryContext);
		} else {
			return this.getRuleContext(i, OptionEntryContext);
		}
	}
	public messageBlock(): MessageBlockContext[];
	public messageBlock(i: number): MessageBlockContext;
	public messageBlock(i?: number): MessageBlockContext | MessageBlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(MessageBlockContext);
		} else {
			return this.getRuleContext(i, MessageBlockContext);
		}
	}
	public enumBlock(): EnumBlockContext[];
	public enumBlock(i: number): EnumBlockContext;
	public enumBlock(i?: number): EnumBlockContext | EnumBlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(EnumBlockContext);
		} else {
			return this.getRuleContext(i, EnumBlockContext);
		}
	}
	public extensions(): ExtensionsContext[];
	public extensions(i: number): ExtensionsContext;
	public extensions(i?: number): ExtensionsContext | ExtensionsContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExtensionsContext);
		} else {
			return this.getRuleContext(i, ExtensionsContext);
		}
	}
	public extendBlock(): ExtendBlockContext[];
	public extendBlock(i: number): ExtendBlockContext;
	public extendBlock(i?: number): ExtendBlockContext | ExtendBlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExtendBlockContext);
		} else {
			return this.getRuleContext(i, ExtendBlockContext);
		}
	}
	public groupBlock(): GroupBlockContext[];
	public groupBlock(i: number): GroupBlockContext;
	public groupBlock(i?: number): GroupBlockContext | GroupBlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(GroupBlockContext);
		} else {
			return this.getRuleContext(i, GroupBlockContext);
		}
	}
	public oneof(): OneofContext[];
	public oneof(i: number): OneofContext;
	public oneof(i?: number): OneofContext | OneofContext[] {
		if (i === undefined) {
			return this.getRuleContexts(OneofContext);
		} else {
			return this.getRuleContext(i, OneofContext);
		}
	}
	public map(): MapContext[];
	public map(i: number): MapContext;
	public map(i?: number): MapContext | MapContext[] {
		if (i === undefined) {
			return this.getRuleContexts(MapContext);
		} else {
			return this.getRuleContext(i, MapContext);
		}
	}
	public reservedFieldRanges(): ReservedFieldRangesContext[];
	public reservedFieldRanges(i: number): ReservedFieldRangesContext;
	public reservedFieldRanges(i?: number): ReservedFieldRangesContext | ReservedFieldRangesContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ReservedFieldRangesContext);
		} else {
			return this.getRuleContext(i, ReservedFieldRangesContext);
		}
	}
	public reservedFieldNames(): ReservedFieldNamesContext[];
	public reservedFieldNames(i: number): ReservedFieldNamesContext;
	public reservedFieldNames(i?: number): ReservedFieldNamesContext | ReservedFieldNamesContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ReservedFieldNamesContext);
		} else {
			return this.getRuleContext(i, ReservedFieldNamesContext);
		}
	}
	public SEMICOLON(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SEMICOLON, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_messageBlock; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterMessageBlock) {
			listener.enterMessageBlock(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitMessageBlock) {
			listener.exitMessageBlock(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitMessageBlock) {
			return visitor.visitMessageBlock(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class MessageNameContext extends ParserRuleContext {
	public ident(): IdentContext {
		return this.getRuleContext(0, IdentContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_messageName; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterMessageName) {
			listener.enterMessageName(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitMessageName) {
			listener.exitMessageName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitMessageName) {
			return visitor.visitMessageName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OneofContext extends ParserRuleContext {
	public ONEOF(): TerminalNode { return this.getToken(ProtoParser.ONEOF, 0); }
	public oneofName(): OneofNameContext {
		return this.getRuleContext(0, OneofNameContext);
	}
	public LCURLY(): TerminalNode { return this.getToken(ProtoParser.LCURLY, 0); }
	public RCURLY(): TerminalNode { return this.getToken(ProtoParser.RCURLY, 0); }
	public field(): FieldContext[];
	public field(i: number): FieldContext;
	public field(i?: number): FieldContext | FieldContext[] {
		if (i === undefined) {
			return this.getRuleContexts(FieldContext);
		} else {
			return this.getRuleContext(i, FieldContext);
		}
	}
	public groupBlock(): GroupBlockContext[];
	public groupBlock(i: number): GroupBlockContext;
	public groupBlock(i?: number): GroupBlockContext | GroupBlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(GroupBlockContext);
		} else {
			return this.getRuleContext(i, GroupBlockContext);
		}
	}
	public optionEntry(): OptionEntryContext[];
	public optionEntry(i: number): OptionEntryContext;
	public optionEntry(i?: number): OptionEntryContext | OptionEntryContext[] {
		if (i === undefined) {
			return this.getRuleContexts(OptionEntryContext);
		} else {
			return this.getRuleContext(i, OptionEntryContext);
		}
	}
	public SEMICOLON(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SEMICOLON, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_oneof; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterOneof) {
			listener.enterOneof(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitOneof) {
			listener.exitOneof(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitOneof) {
			return visitor.visitOneof(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OneofNameContext extends ParserRuleContext {
	public ident(): IdentContext {
		return this.getRuleContext(0, IdentContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_oneofName; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterOneofName) {
			listener.enterOneofName(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitOneofName) {
			listener.exitOneofName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitOneofName) {
			return visitor.visitOneofName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class MapContext extends ParserRuleContext {
	public MAP(): TerminalNode { return this.getToken(ProtoParser.MAP, 0); }
	public LT(): TerminalNode { return this.getToken(ProtoParser.LT, 0); }
	public mapKey(): MapKeyContext {
		return this.getRuleContext(0, MapKeyContext);
	}
	public COMMA(): TerminalNode { return this.getToken(ProtoParser.COMMA, 0); }
	public mapValue(): MapValueContext {
		return this.getRuleContext(0, MapValueContext);
	}
	public GT(): TerminalNode { return this.getToken(ProtoParser.GT, 0); }
	public fieldName(): FieldNameContext {
		return this.getRuleContext(0, FieldNameContext);
	}
	public ASSIGN(): TerminalNode { return this.getToken(ProtoParser.ASSIGN, 0); }
	public tag(): TagContext {
		return this.getRuleContext(0, TagContext);
	}
	public SEMICOLON(): TerminalNode { return this.getToken(ProtoParser.SEMICOLON, 0); }
	public fieldOptions(): FieldOptionsContext | undefined {
		return this.tryGetRuleContext(0, FieldOptionsContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_map; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterMap) {
			listener.enterMap(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitMap) {
			listener.exitMap(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitMap) {
			return visitor.visitMap(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class MapKeyContext extends ParserRuleContext {
	public INT32(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.INT32, 0); }
	public INT64(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.INT64, 0); }
	public UINT32(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.UINT32, 0); }
	public UINT64(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.UINT64, 0); }
	public SINT32(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SINT32, 0); }
	public SINT64(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SINT64, 0); }
	public FIXED32(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.FIXED32, 0); }
	public FIXED64(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.FIXED64, 0); }
	public SFIXED32(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SFIXED32, 0); }
	public SFIXED64(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SFIXED64, 0); }
	public BOOL(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.BOOL, 0); }
	public STRING(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.STRING, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_mapKey; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterMapKey) {
			listener.enterMapKey(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitMapKey) {
			listener.exitMapKey(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitMapKey) {
			return visitor.visitMapKey(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class MapValueContext extends ParserRuleContext {
	public typeReference(): TypeReferenceContext {
		return this.getRuleContext(0, TypeReferenceContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_mapValue; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterMapValue) {
			listener.enterMapValue(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitMapValue) {
			listener.exitMapValue(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitMapValue) {
			return visitor.visitMapValue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TagContext extends ParserRuleContext {
	public INTEGER_VALUE(): TerminalNode { return this.getToken(ProtoParser.INTEGER_VALUE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_tag; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterTag) {
			listener.enterTag(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitTag) {
			listener.exitTag(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitTag) {
			return visitor.visitTag(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class GroupBlockContext extends ParserRuleContext {
	public GROUP(): TerminalNode { return this.getToken(ProtoParser.GROUP, 0); }
	public groupName(): GroupNameContext {
		return this.getRuleContext(0, GroupNameContext);
	}
	public ASSIGN(): TerminalNode { return this.getToken(ProtoParser.ASSIGN, 0); }
	public tag(): TagContext {
		return this.getRuleContext(0, TagContext);
	}
	public LCURLY(): TerminalNode { return this.getToken(ProtoParser.LCURLY, 0); }
	public RCURLY(): TerminalNode { return this.getToken(ProtoParser.RCURLY, 0); }
	public fieldModifier(): FieldModifierContext | undefined {
		return this.tryGetRuleContext(0, FieldModifierContext);
	}
	public field(): FieldContext[];
	public field(i: number): FieldContext;
	public field(i?: number): FieldContext | FieldContext[] {
		if (i === undefined) {
			return this.getRuleContexts(FieldContext);
		} else {
			return this.getRuleContext(i, FieldContext);
		}
	}
	public optionEntry(): OptionEntryContext[];
	public optionEntry(i: number): OptionEntryContext;
	public optionEntry(i?: number): OptionEntryContext | OptionEntryContext[] {
		if (i === undefined) {
			return this.getRuleContexts(OptionEntryContext);
		} else {
			return this.getRuleContext(i, OptionEntryContext);
		}
	}
	public messageBlock(): MessageBlockContext[];
	public messageBlock(i: number): MessageBlockContext;
	public messageBlock(i?: number): MessageBlockContext | MessageBlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(MessageBlockContext);
		} else {
			return this.getRuleContext(i, MessageBlockContext);
		}
	}
	public enumBlock(): EnumBlockContext[];
	public enumBlock(i: number): EnumBlockContext;
	public enumBlock(i?: number): EnumBlockContext | EnumBlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(EnumBlockContext);
		} else {
			return this.getRuleContext(i, EnumBlockContext);
		}
	}
	public extensions(): ExtensionsContext[];
	public extensions(i: number): ExtensionsContext;
	public extensions(i?: number): ExtensionsContext | ExtensionsContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExtensionsContext);
		} else {
			return this.getRuleContext(i, ExtensionsContext);
		}
	}
	public extendBlock(): ExtendBlockContext[];
	public extendBlock(i: number): ExtendBlockContext;
	public extendBlock(i?: number): ExtendBlockContext | ExtendBlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ExtendBlockContext);
		} else {
			return this.getRuleContext(i, ExtendBlockContext);
		}
	}
	public groupBlock(): GroupBlockContext[];
	public groupBlock(i: number): GroupBlockContext;
	public groupBlock(i?: number): GroupBlockContext | GroupBlockContext[] {
		if (i === undefined) {
			return this.getRuleContexts(GroupBlockContext);
		} else {
			return this.getRuleContext(i, GroupBlockContext);
		}
	}
	public SEMICOLON(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SEMICOLON, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_groupBlock; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterGroupBlock) {
			listener.enterGroupBlock(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitGroupBlock) {
			listener.exitGroupBlock(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitGroupBlock) {
			return visitor.visitGroupBlock(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class GroupNameContext extends ParserRuleContext {
	public ident(): IdentContext {
		return this.getRuleContext(0, IdentContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_groupName; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterGroupName) {
			listener.enterGroupName(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitGroupName) {
			listener.exitGroupName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitGroupName) {
			return visitor.visitGroupName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExtensionsContext extends ParserRuleContext {
	public EXTENSIONS(): TerminalNode { return this.getToken(ProtoParser.EXTENSIONS, 0); }
	public range(): RangeContext[];
	public range(i: number): RangeContext;
	public range(i?: number): RangeContext | RangeContext[] {
		if (i === undefined) {
			return this.getRuleContexts(RangeContext);
		} else {
			return this.getRuleContext(i, RangeContext);
		}
	}
	public SEMICOLON(): TerminalNode { return this.getToken(ProtoParser.SEMICOLON, 0); }
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ProtoParser.COMMA);
		} else {
			return this.getToken(ProtoParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_extensions; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterExtensions) {
			listener.enterExtensions(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitExtensions) {
			listener.exitExtensions(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitExtensions) {
			return visitor.visitExtensions(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RangeContext extends ParserRuleContext {
	public rangeFrom(): RangeFromContext {
		return this.getRuleContext(0, RangeFromContext);
	}
	public TO(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.TO, 0); }
	public rangeTo(): RangeToContext | undefined {
		return this.tryGetRuleContext(0, RangeToContext);
	}
	public MAX(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.MAX, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_range; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterRange) {
			listener.enterRange(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitRange) {
			listener.exitRange(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitRange) {
			return visitor.visitRange(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RangeFromContext extends ParserRuleContext {
	public INTEGER_VALUE(): TerminalNode { return this.getToken(ProtoParser.INTEGER_VALUE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_rangeFrom; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterRangeFrom) {
			listener.enterRangeFrom(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitRangeFrom) {
			listener.exitRangeFrom(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitRangeFrom) {
			return visitor.visitRangeFrom(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RangeToContext extends ParserRuleContext {
	public INTEGER_VALUE(): TerminalNode { return this.getToken(ProtoParser.INTEGER_VALUE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_rangeTo; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterRangeTo) {
			listener.enterRangeTo(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitRangeTo) {
			listener.exitRangeTo(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitRangeTo) {
			return visitor.visitRangeTo(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ReservedFieldRangesContext extends ParserRuleContext {
	public RESERVED(): TerminalNode { return this.getToken(ProtoParser.RESERVED, 0); }
	public range(): RangeContext[];
	public range(i: number): RangeContext;
	public range(i?: number): RangeContext | RangeContext[] {
		if (i === undefined) {
			return this.getRuleContexts(RangeContext);
		} else {
			return this.getRuleContext(i, RangeContext);
		}
	}
	public SEMICOLON(): TerminalNode { return this.getToken(ProtoParser.SEMICOLON, 0); }
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ProtoParser.COMMA);
		} else {
			return this.getToken(ProtoParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_reservedFieldRanges; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterReservedFieldRanges) {
			listener.enterReservedFieldRanges(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitReservedFieldRanges) {
			listener.exitReservedFieldRanges(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitReservedFieldRanges) {
			return visitor.visitReservedFieldRanges(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ReservedFieldNamesContext extends ParserRuleContext {
	public RESERVED(): TerminalNode { return this.getToken(ProtoParser.RESERVED, 0); }
	public reservedFieldName(): ReservedFieldNameContext[];
	public reservedFieldName(i: number): ReservedFieldNameContext;
	public reservedFieldName(i?: number): ReservedFieldNameContext | ReservedFieldNameContext[] {
		if (i === undefined) {
			return this.getRuleContexts(ReservedFieldNameContext);
		} else {
			return this.getRuleContext(i, ReservedFieldNameContext);
		}
	}
	public SEMICOLON(): TerminalNode { return this.getToken(ProtoParser.SEMICOLON, 0); }
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ProtoParser.COMMA);
		} else {
			return this.getToken(ProtoParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_reservedFieldNames; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterReservedFieldNames) {
			listener.enterReservedFieldNames(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitReservedFieldNames) {
			listener.exitReservedFieldNames(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitReservedFieldNames) {
			return visitor.visitReservedFieldNames(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ReservedFieldNameContext extends ParserRuleContext {
	public STRING_VALUE(): TerminalNode { return this.getToken(ProtoParser.STRING_VALUE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_reservedFieldName; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterReservedFieldName) {
			listener.enterReservedFieldName(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitReservedFieldName) {
			listener.exitReservedFieldName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitReservedFieldName) {
			return visitor.visitReservedFieldName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FieldContext extends ParserRuleContext {
	public typeReference(): TypeReferenceContext {
		return this.getRuleContext(0, TypeReferenceContext);
	}
	public fieldName(): FieldNameContext {
		return this.getRuleContext(0, FieldNameContext);
	}
	public ASSIGN(): TerminalNode { return this.getToken(ProtoParser.ASSIGN, 0); }
	public tag(): TagContext {
		return this.getRuleContext(0, TagContext);
	}
	public SEMICOLON(): TerminalNode { return this.getToken(ProtoParser.SEMICOLON, 0); }
	public fieldModifier(): FieldModifierContext | undefined {
		return this.tryGetRuleContext(0, FieldModifierContext);
	}
	public fieldOptions(): FieldOptionsContext | undefined {
		return this.tryGetRuleContext(0, FieldOptionsContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_field; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterField) {
			listener.enterField(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitField) {
			listener.exitField(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitField) {
			return visitor.visitField(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FieldNameContext extends ParserRuleContext {
	public ident(): IdentContext {
		return this.getRuleContext(0, IdentContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_fieldName; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterFieldName) {
			listener.enterFieldName(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitFieldName) {
			listener.exitFieldName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitFieldName) {
			return visitor.visitFieldName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FieldModifierContext extends ParserRuleContext {
	public OPTIONAL(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.OPTIONAL, 0); }
	public REQUIRED(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.REQUIRED, 0); }
	public REPEATED(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.REPEATED, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_fieldModifier; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterFieldModifier) {
			listener.enterFieldModifier(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitFieldModifier) {
			listener.exitFieldModifier(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitFieldModifier) {
			return visitor.visitFieldModifier(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TypeReferenceContext extends ParserRuleContext {
	public DOUBLE(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.DOUBLE, 0); }
	public FLOAT(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.FLOAT, 0); }
	public INT32(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.INT32, 0); }
	public INT64(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.INT64, 0); }
	public UINT32(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.UINT32, 0); }
	public UINT64(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.UINT64, 0); }
	public SINT32(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SINT32, 0); }
	public SINT64(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SINT64, 0); }
	public FIXED32(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.FIXED32, 0); }
	public FIXED64(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.FIXED64, 0); }
	public SFIXED32(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SFIXED32, 0); }
	public SFIXED64(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SFIXED64, 0); }
	public BOOL(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.BOOL, 0); }
	public STRING(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.STRING, 0); }
	public BYTES(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.BYTES, 0); }
	public ident(): IdentContext[];
	public ident(i: number): IdentContext;
	public ident(i?: number): IdentContext | IdentContext[] {
		if (i === undefined) {
			return this.getRuleContexts(IdentContext);
		} else {
			return this.getRuleContext(i, IdentContext);
		}
	}
	public DOT(): TerminalNode[];
	public DOT(i: number): TerminalNode;
	public DOT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ProtoParser.DOT);
		} else {
			return this.getToken(ProtoParser.DOT, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_typeReference; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterTypeReference) {
			listener.enterTypeReference(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitTypeReference) {
			listener.exitTypeReference(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitTypeReference) {
			return visitor.visitTypeReference(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FieldOptionsContext extends ParserRuleContext {
	public LSQUARE(): TerminalNode { return this.getToken(ProtoParser.LSQUARE, 0); }
	public RSQUARE(): TerminalNode { return this.getToken(ProtoParser.RSQUARE, 0); }
	public option(): OptionContext[];
	public option(i: number): OptionContext;
	public option(i?: number): OptionContext | OptionContext[] {
		if (i === undefined) {
			return this.getRuleContexts(OptionContext);
		} else {
			return this.getRuleContext(i, OptionContext);
		}
	}
	public COMMA(): TerminalNode[];
	public COMMA(i: number): TerminalNode;
	public COMMA(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ProtoParser.COMMA);
		} else {
			return this.getToken(ProtoParser.COMMA, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_fieldOptions; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterFieldOptions) {
			listener.enterFieldOptions(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitFieldOptions) {
			listener.exitFieldOptions(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitFieldOptions) {
			return visitor.visitFieldOptions(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OptionContext extends ParserRuleContext {
	public fieldRerefence(): FieldRerefenceContext {
		return this.getRuleContext(0, FieldRerefenceContext);
	}
	public ASSIGN(): TerminalNode { return this.getToken(ProtoParser.ASSIGN, 0); }
	public optionValue(): OptionValueContext {
		return this.getRuleContext(0, OptionValueContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_option; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterOption) {
			listener.enterOption(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitOption) {
			listener.exitOption(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitOption) {
			return visitor.visitOption(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FieldRerefenceContext extends ParserRuleContext {
	public standardFieldRerefence(): StandardFieldRerefenceContext[];
	public standardFieldRerefence(i: number): StandardFieldRerefenceContext;
	public standardFieldRerefence(i?: number): StandardFieldRerefenceContext | StandardFieldRerefenceContext[] {
		if (i === undefined) {
			return this.getRuleContexts(StandardFieldRerefenceContext);
		} else {
			return this.getRuleContext(i, StandardFieldRerefenceContext);
		}
	}
	public LPAREN(): TerminalNode[];
	public LPAREN(i: number): TerminalNode;
	public LPAREN(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ProtoParser.LPAREN);
		} else {
			return this.getToken(ProtoParser.LPAREN, i);
		}
	}
	public customFieldReference(): CustomFieldReferenceContext[];
	public customFieldReference(i: number): CustomFieldReferenceContext;
	public customFieldReference(i?: number): CustomFieldReferenceContext | CustomFieldReferenceContext[] {
		if (i === undefined) {
			return this.getRuleContexts(CustomFieldReferenceContext);
		} else {
			return this.getRuleContext(i, CustomFieldReferenceContext);
		}
	}
	public RPAREN(): TerminalNode[];
	public RPAREN(i: number): TerminalNode;
	public RPAREN(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ProtoParser.RPAREN);
		} else {
			return this.getToken(ProtoParser.RPAREN, i);
		}
	}
	public DOT(): TerminalNode[];
	public DOT(i: number): TerminalNode;
	public DOT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ProtoParser.DOT);
		} else {
			return this.getToken(ProtoParser.DOT, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_fieldRerefence; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterFieldRerefence) {
			listener.enterFieldRerefence(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitFieldRerefence) {
			listener.exitFieldRerefence(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitFieldRerefence) {
			return visitor.visitFieldRerefence(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class StandardFieldRerefenceContext extends ParserRuleContext {
	public ident(): IdentContext {
		return this.getRuleContext(0, IdentContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_standardFieldRerefence; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterStandardFieldRerefence) {
			listener.enterStandardFieldRerefence(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitStandardFieldRerefence) {
			listener.exitStandardFieldRerefence(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitStandardFieldRerefence) {
			return visitor.visitStandardFieldRerefence(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class CustomFieldReferenceContext extends ParserRuleContext {
	public ident(): IdentContext[];
	public ident(i: number): IdentContext;
	public ident(i?: number): IdentContext | IdentContext[] {
		if (i === undefined) {
			return this.getRuleContexts(IdentContext);
		} else {
			return this.getRuleContext(i, IdentContext);
		}
	}
	public DOT(): TerminalNode[];
	public DOT(i: number): TerminalNode;
	public DOT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ProtoParser.DOT);
		} else {
			return this.getToken(ProtoParser.DOT, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_customFieldReference; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterCustomFieldReference) {
			listener.enterCustomFieldReference(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitCustomFieldReference) {
			listener.exitCustomFieldReference(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitCustomFieldReference) {
			return visitor.visitCustomFieldReference(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class OptionValueContext extends ParserRuleContext {
	public INTEGER_VALUE(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.INTEGER_VALUE, 0); }
	public FLOAT_VALUE(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.FLOAT_VALUE, 0); }
	public BOOLEAN_VALUE(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.BOOLEAN_VALUE, 0); }
	public STRING_VALUE(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.STRING_VALUE, 0); }
	public IDENT(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.IDENT, 0); }
	public textFormat(): TextFormatContext | undefined {
		return this.tryGetRuleContext(0, TextFormatContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_optionValue; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterOptionValue) {
			listener.enterOptionValue(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitOptionValue) {
			listener.exitOptionValue(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitOptionValue) {
			return visitor.visitOptionValue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TextFormatContext extends ParserRuleContext {
	public LCURLY(): TerminalNode { return this.getToken(ProtoParser.LCURLY, 0); }
	public RCURLY(): TerminalNode { return this.getToken(ProtoParser.RCURLY, 0); }
	public textFormatEntry(): TextFormatEntryContext[];
	public textFormatEntry(i: number): TextFormatEntryContext;
	public textFormatEntry(i?: number): TextFormatEntryContext | TextFormatEntryContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TextFormatEntryContext);
		} else {
			return this.getRuleContext(i, TextFormatEntryContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_textFormat; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterTextFormat) {
			listener.enterTextFormat(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitTextFormat) {
			listener.exitTextFormat(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitTextFormat) {
			return visitor.visitTextFormat(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TextFormatOptionNameContext extends ParserRuleContext {
	public ident(): IdentContext | undefined {
		return this.tryGetRuleContext(0, IdentContext);
	}
	public LSQUARE(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.LSQUARE, 0); }
	public typeReference(): TypeReferenceContext | undefined {
		return this.tryGetRuleContext(0, TypeReferenceContext);
	}
	public RSQUARE(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.RSQUARE, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_textFormatOptionName; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterTextFormatOptionName) {
			listener.enterTextFormatOptionName(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitTextFormatOptionName) {
			listener.exitTextFormatOptionName(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitTextFormatOptionName) {
			return visitor.visitTextFormatOptionName(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TextFormatEntryContext extends ParserRuleContext {
	public textFormatOptionName(): TextFormatOptionNameContext {
		return this.getRuleContext(0, TextFormatOptionNameContext);
	}
	public COLON(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.COLON, 0); }
	public textFormatOptionValue(): TextFormatOptionValueContext | undefined {
		return this.tryGetRuleContext(0, TextFormatOptionValueContext);
	}
	public textFormat(): TextFormatContext | undefined {
		return this.tryGetRuleContext(0, TextFormatContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_textFormatEntry; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterTextFormatEntry) {
			listener.enterTextFormatEntry(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitTextFormatEntry) {
			listener.exitTextFormatEntry(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitTextFormatEntry) {
			return visitor.visitTextFormatEntry(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class TextFormatOptionValueContext extends ParserRuleContext {
	public INTEGER_VALUE(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.INTEGER_VALUE, 0); }
	public FLOAT_VALUE(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.FLOAT_VALUE, 0); }
	public BOOLEAN_VALUE(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.BOOLEAN_VALUE, 0); }
	public STRING_VALUE(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.STRING_VALUE, 0); }
	public IDENT(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.IDENT, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_textFormatOptionValue; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterTextFormatOptionValue) {
			listener.enterTextFormatOptionValue(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitTextFormatOptionValue) {
			listener.exitTextFormatOptionValue(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitTextFormatOptionValue) {
			return visitor.visitTextFormatOptionValue(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class FullIdentContext extends ParserRuleContext {
	public ident(): IdentContext[];
	public ident(i: number): IdentContext;
	public ident(i?: number): IdentContext | IdentContext[] {
		if (i === undefined) {
			return this.getRuleContexts(IdentContext);
		} else {
			return this.getRuleContext(i, IdentContext);
		}
	}
	public DOT(): TerminalNode[];
	public DOT(i: number): TerminalNode;
	public DOT(i?: number): TerminalNode | TerminalNode[] {
		if (i === undefined) {
			return this.getTokens(ProtoParser.DOT);
		} else {
			return this.getToken(ProtoParser.DOT, i);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_fullIdent; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterFullIdent) {
			listener.enterFullIdent(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitFullIdent) {
			listener.exitFullIdent(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitFullIdent) {
			return visitor.visitFullIdent(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class IdentContext extends ParserRuleContext {
	public IDENT(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.IDENT, 0); }
	public PACKAGE(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.PACKAGE, 0); }
	public SYNTAX(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SYNTAX, 0); }
	public IMPORT(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.IMPORT, 0); }
	public PUBLIC(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.PUBLIC, 0); }
	public OPTION(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.OPTION, 0); }
	public MESSAGE(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.MESSAGE, 0); }
	public GROUP(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.GROUP, 0); }
	public OPTIONAL(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.OPTIONAL, 0); }
	public REQUIRED(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.REQUIRED, 0); }
	public REPEATED(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.REPEATED, 0); }
	public ONEOF(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.ONEOF, 0); }
	public EXTEND(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.EXTEND, 0); }
	public EXTENSIONS(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.EXTENSIONS, 0); }
	public TO(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.TO, 0); }
	public MAX(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.MAX, 0); }
	public RESERVED(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.RESERVED, 0); }
	public ENUM(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.ENUM, 0); }
	public SERVICE(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SERVICE, 0); }
	public RPC(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.RPC, 0); }
	public RETURNS(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.RETURNS, 0); }
	public STREAM(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.STREAM, 0); }
	public MAP(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.MAP, 0); }
	public BOOLEAN_VALUE(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.BOOLEAN_VALUE, 0); }
	public DOUBLE(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.DOUBLE, 0); }
	public FLOAT(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.FLOAT, 0); }
	public INT32(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.INT32, 0); }
	public INT64(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.INT64, 0); }
	public UINT32(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.UINT32, 0); }
	public UINT64(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.UINT64, 0); }
	public SINT32(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SINT32, 0); }
	public SINT64(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SINT64, 0); }
	public FIXED32(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.FIXED32, 0); }
	public FIXED64(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.FIXED64, 0); }
	public SFIXED32(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SFIXED32, 0); }
	public SFIXED64(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.SFIXED64, 0); }
	public BOOL(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.BOOL, 0); }
	public STRING(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.STRING, 0); }
	public BYTES(): TerminalNode | undefined { return this.tryGetToken(ProtoParser.BYTES, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return ProtoParser.RULE_ident; }
	// @Override
	public enterRule(listener: ProtoParserListener): void {
		if (listener.enterIdent) {
			listener.enterIdent(this);
		}
	}
	// @Override
	public exitRule(listener: ProtoParserListener): void {
		if (listener.exitIdent) {
			listener.exitIdent(this);
		}
	}
	// @Override
	public accept<Result>(visitor: ProtoParserVisitor<Result>): Result {
		if (visitor.visitIdent) {
			return visitor.visitIdent(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


