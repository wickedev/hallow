'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var Utils = require('antlr4ts');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

// Generated from parser/ProtoLexer.g4 by ANTLR 4.7.3-SNAPSHOT
var ProtoLexer = /** @class */ (function (_super) {
    __extends(ProtoLexer, _super);
    // tslint:enable:no-trailing-whitespace
    function ProtoLexer(input) {
        var _this = _super.call(this, input) || this;
        _this._interp = new Utils.LexerATNSimulator(ProtoLexer._ATN, _this);
        return _this;
    }
    Object.defineProperty(ProtoLexer.prototype, "vocabulary", {
        // @Override
        // @NotNull
        get: function () {
            return ProtoLexer.VOCABULARY;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProtoLexer.prototype, "grammarFileName", {
        // @Override
        get: function () { return "ProtoLexer.g4"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProtoLexer.prototype, "ruleNames", {
        // @Override
        get: function () { return ProtoLexer.ruleNames; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProtoLexer.prototype, "serializedATN", {
        // @Override
        get: function () { return ProtoLexer._serializedATN; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProtoLexer.prototype, "channelNames", {
        // @Override
        get: function () { return ProtoLexer.channelNames; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProtoLexer.prototype, "modeNames", {
        // @Override
        get: function () { return ProtoLexer.modeNames; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProtoLexer, "_ATN", {
        get: function () {
            if (!ProtoLexer.__ATN) {
                ProtoLexer.__ATN = new Utils.ATNDeserializer().deserialize(Utils.toCharArray(ProtoLexer._serializedATN));
            }
            return ProtoLexer.__ATN;
        },
        enumerable: false,
        configurable: true
    });
    ProtoLexer.PACKAGE = 1;
    ProtoLexer.SYNTAX = 2;
    ProtoLexer.IMPORT = 3;
    ProtoLexer.PUBLIC = 4;
    ProtoLexer.OPTION = 5;
    ProtoLexer.MESSAGE = 6;
    ProtoLexer.GROUP = 7;
    ProtoLexer.OPTIONAL = 8;
    ProtoLexer.REQUIRED = 9;
    ProtoLexer.REPEATED = 10;
    ProtoLexer.ONEOF = 11;
    ProtoLexer.EXTEND = 12;
    ProtoLexer.EXTENSIONS = 13;
    ProtoLexer.TO = 14;
    ProtoLexer.MAX = 15;
    ProtoLexer.RESERVED = 16;
    ProtoLexer.ENUM = 17;
    ProtoLexer.SERVICE = 18;
    ProtoLexer.RPC = 19;
    ProtoLexer.RETURNS = 20;
    ProtoLexer.STREAM = 21;
    ProtoLexer.MAP = 22;
    ProtoLexer.BOOLEAN_VALUE = 23;
    ProtoLexer.DOUBLE = 24;
    ProtoLexer.FLOAT = 25;
    ProtoLexer.INT32 = 26;
    ProtoLexer.INT64 = 27;
    ProtoLexer.UINT32 = 28;
    ProtoLexer.UINT64 = 29;
    ProtoLexer.SINT32 = 30;
    ProtoLexer.SINT64 = 31;
    ProtoLexer.FIXED32 = 32;
    ProtoLexer.FIXED64 = 33;
    ProtoLexer.SFIXED32 = 34;
    ProtoLexer.SFIXED64 = 35;
    ProtoLexer.BOOL = 36;
    ProtoLexer.STRING = 37;
    ProtoLexer.BYTES = 38;
    ProtoLexer.COMMENT = 39;
    ProtoLexer.LINE_COMMENT = 40;
    ProtoLexer.PLUGIN_DEV_MARKER = 41;
    ProtoLexer.NL = 42;
    ProtoLexer.WS = 43;
    ProtoLexer.LCURLY = 44;
    ProtoLexer.RCURLY = 45;
    ProtoLexer.LPAREN = 46;
    ProtoLexer.RPAREN = 47;
    ProtoLexer.LSQUARE = 48;
    ProtoLexer.RSQUARE = 49;
    ProtoLexer.LT = 50;
    ProtoLexer.GT = 51;
    ProtoLexer.COMMA = 52;
    ProtoLexer.DOT = 53;
    ProtoLexer.COLON = 54;
    ProtoLexer.SEMICOLON = 55;
    ProtoLexer.ASSIGN = 56;
    ProtoLexer.IDENT = 57;
    ProtoLexer.STRING_VALUE = 58;
    ProtoLexer.INTEGER_VALUE = 59;
    ProtoLexer.FLOAT_VALUE = 60;
    ProtoLexer.ERRCHAR = 61;
    // tslint:disable:no-trailing-whitespace
    ProtoLexer.channelNames = [
        "DEFAULT_TOKEN_CHANNEL", "HIDDEN",
    ];
    // tslint:disable:no-trailing-whitespace
    ProtoLexer.modeNames = [
        "DEFAULT_MODE",
    ];
    ProtoLexer.ruleNames = [
        "PACKAGE", "SYNTAX", "IMPORT", "PUBLIC", "OPTION", "MESSAGE", "GROUP",
        "OPTIONAL", "REQUIRED", "REPEATED", "ONEOF", "EXTEND", "EXTENSIONS", "TO",
        "MAX", "RESERVED", "ENUM", "SERVICE", "RPC", "RETURNS", "STREAM", "MAP",
        "BOOLEAN_VALUE", "DOUBLE", "FLOAT", "INT32", "INT64", "UINT32", "UINT64",
        "SINT32", "SINT64", "FIXED32", "FIXED64", "SFIXED32", "SFIXED64", "BOOL",
        "STRING", "BYTES", "COMMENT", "LINE_COMMENT", "PLUGIN_DEV_MARKER", "NL",
        "WS", "LCURLY", "RCURLY", "LPAREN", "RPAREN", "LSQUARE", "RSQUARE", "LT",
        "GT", "COMMA", "DOT", "COLON", "SEMICOLON", "ASSIGN", "IDENT", "STRING_VALUE",
        "INTEGER_VALUE", "FLOAT_VALUE", "DOUBLE_QUOTE_STRING", "SINGLE_QUOTE_STRING",
        "EXPONENT", "FLOAT_LIT", "INF", "NAN", "EXP", "DEC_VALUE", "HEX_VALUE",
        "OCT_VALUE", "MINUS", "ALPHA", "DIGIT", "HEX_DIGIT", "OCT_DIGIT", "UNDERSCORE",
        "ESC_SEQ", "OCTAL_ESC", "UNICODE_ESC", "ERRCHAR",
    ];
    ProtoLexer._LITERAL_NAMES = [
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
    ProtoLexer._SYMBOLIC_NAMES = [
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
    ProtoLexer.VOCABULARY = new Utils.VocabularyImpl(ProtoLexer._LITERAL_NAMES, ProtoLexer._SYMBOLIC_NAMES, []);
    ProtoLexer._serializedATNSegments = 2;
    ProtoLexer._serializedATNSegment0 = "\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02?\u02E9\b\x01" +
        "\x04\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06" +
        "\x04\x07\t\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x04\r" +
        "\t\r\x04\x0E\t\x0E\x04\x0F\t\x0F\x04\x10\t\x10\x04\x11\t\x11\x04\x12\t" +
        "\x12\x04\x13\t\x13\x04\x14\t\x14\x04\x15\t\x15\x04\x16\t\x16\x04\x17\t" +
        "\x17\x04\x18\t\x18\x04\x19\t\x19\x04\x1A\t\x1A\x04\x1B\t\x1B\x04\x1C\t" +
        "\x1C\x04\x1D\t\x1D\x04\x1E\t\x1E\x04\x1F\t\x1F\x04 \t \x04!\t!\x04\"\t" +
        "\"\x04#\t#\x04$\t$\x04%\t%\x04&\t&\x04\'\t\'\x04(\t(\x04)\t)\x04*\t*\x04" +
        "+\t+\x04,\t,\x04-\t-\x04.\t.\x04/\t/\x040\t0\x041\t1\x042\t2\x043\t3\x04" +
        "4\t4\x045\t5\x046\t6\x047\t7\x048\t8\x049\t9\x04:\t:\x04;\t;\x04<\t<\x04" +
        "=\t=\x04>\t>\x04?\t?\x04@\t@\x04A\tA\x04B\tB\x04C\tC\x04D\tD\x04E\tE\x04" +
        "F\tF\x04G\tG\x04H\tH\x04I\tI\x04J\tJ\x04K\tK\x04L\tL\x04M\tM\x04N\tN\x04" +
        "O\tO\x04P\tP\x04Q\tQ\x03\x02\x03\x02\x03\x02\x03\x02\x03\x02\x03\x02\x03" +
        "\x02\x03\x02\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03\x03" +
        "\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x04\x03\x05\x03\x05\x03" +
        "\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03" +
        "\x06\x03\x06\x03\x06\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03\x07\x03" +
        "\x07\x03\x07\x03\b\x03\b\x03\b\x03\b\x03\b\x03\b\x03\t\x03\t\x03\t\x03" +
        "\t\x03\t\x03\t\x03\t\x03\t\x03\t\x03\n\x03\n\x03\n\x03\n\x03\n\x03\n\x03" +
        "\n\x03\n\x03\n\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03\v\x03" +
        "\f\x03\f\x03\f\x03\f\x03\f\x03\f\x03\r\x03\r\x03\r\x03\r\x03\r\x03\r\x03" +
        "\r\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03\x0E\x03" +
        "\x0E\x03\x0E\x03\x0E\x03\x0F\x03\x0F\x03\x0F\x03\x10\x03\x10\x03\x10\x03" +
        "\x10\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03\x11\x03" +
        "\x11\x03\x12\x03\x12\x03\x12\x03\x12\x03\x12\x03\x13\x03\x13\x03\x13\x03" +
        "\x13\x03\x13\x03\x13\x03\x13\x03\x13\x03\x14\x03\x14\x03\x14\x03\x14\x03" +
        "\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x15\x03\x16\x03" +
        "\x16\x03\x16\x03\x16\x03\x16\x03\x16\x03\x16\x03\x17\x03\x17\x03\x17\x03" +
        "\x17\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03\x18\x03" +
        "\x18\x05\x18\u0146\n\x18\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19\x03\x19" +
        "\x03\x19\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1A\x03\x1B\x03\x1B" +
        "\x03\x1B\x03\x1B\x03\x1B\x03\x1B\x03\x1C\x03\x1C\x03\x1C\x03\x1C\x03\x1C" +
        "\x03\x1C\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x03\x1D\x03\x1E" +
        "\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1E\x03\x1F\x03\x1F\x03\x1F" +
        "\x03\x1F\x03\x1F\x03\x1F\x03\x1F\x03 \x03 \x03 \x03 \x03 \x03 \x03 \x03" +
        "!\x03!\x03!\x03!\x03!\x03!\x03!\x03!\x03\"\x03\"\x03\"\x03\"\x03\"\x03" +
        "\"\x03\"\x03\"\x03#\x03#\x03#\x03#\x03#\x03#\x03#\x03#\x03#\x03$\x03$" +
        "\x03$\x03$\x03$\x03$\x03$\x03$\x03$\x03%\x03%\x03%\x03%\x03%\x03&\x03" +
        "&\x03&\x03&\x03&\x03&\x03&\x03\'\x03\'\x03\'\x03\'\x03\'\x03\'\x03(\x03" +
        "(\x03(\x03(\x07(\u01B5\n(\f(\x0E(\u01B8\v(\x03(\x03(\x03(\x03(\x03(\x03" +
        ")\x03)\x03)\x03)\x07)\u01C3\n)\f)\x0E)\u01C6\v)\x03)\x03)\x03*\x03*\x03" +
        "*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x07" +
        "*\u01DA\n*\f*\x0E*\u01DD\v*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03" +
        "*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x07*\u01F0\n*\f*\x0E*\u01F3" +
        "\v*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03*\x03" +
        "*\x03*\x03*\x07*\u0205\n*\f*\x0E*\u0208\v*\x03*\x03*\x03*\x03*\x03*\x03" +
        "*\x03*\x03*\x05*\u0212\n*\x03*\x03*\x03+\x05+\u0217\n+\x03+\x03+\x03+" +
        "\x03+\x03,\x06,\u021E\n,\r,\x0E,\u021F\x03,\x03,\x03-\x03-\x03.\x03.\x03" +
        "/\x03/\x030\x030\x031\x031\x032\x032\x033\x033\x034\x034\x035\x035\x03" +
        "6\x036\x037\x037\x038\x038\x039\x039\x03:\x03:\x05:\u0240\n:\x03:\x03" +
        ":\x03:\x07:\u0245\n:\f:\x0E:\u0248\v:\x03;\x03;\x05;\u024C\n;\x03<\x03" +
        "<\x03<\x05<\u0251\n<\x03=\x03=\x03=\x05=\u0256\n=\x03=\x03=\x05=\u025A" +
        "\n=\x03>\x03>\x03>\x07>\u025F\n>\f>\x0E>\u0262\v>\x03>\x03>\x03?\x03?" +
        "\x03?\x07?\u0269\n?\f?\x0E?\u026C\v?\x03?\x03?\x03@\x03@\x05@\u0272\n" +
        "@\x03@\x03@\x03@\x03A\x05A\u0278\nA\x03A\x06A\u027B\nA\rA\x0EA\u027C\x03" +
        "A\x03A\x07A\u0281\nA\fA\x0EA\u0284\vA\x03A\x05A\u0287\nA\x03A\x03A\x06" +
        "A\u028B\nA\rA\x0EA\u028C\x05A\u028F\nA\x03B\x03B\x03B\x03B\x03C\x03C\x03" +
        "C\x03C\x03D\x03D\x03E\x03E\x05E\u029D\nE\x03E\x03E\x07E\u02A1\nE\fE\x0E" +
        "E\u02A4\vE\x05E\u02A6\nE\x03F\x05F\u02A9\nF\x03F\x03F\x03F\x06F\u02AE" +
        "\nF\rF\x0EF\u02AF\x03G\x05G\u02B3\nG\x03G\x03G\x06G\u02B7\nG\rG\x0EG\u02B8" +
        "\x03H\x03H\x03I\x03I\x03J\x03J\x03K\x03K\x03L\x03L\x03M\x03M\x03N\x03" +
        "N\x03N\x03N\x03N\x03N\x03N\x03N\x03N\x05N\u02D0\nN\x03O\x03O\x03O\x03" +
        "O\x03O\x03O\x03O\x03O\x03O\x03O\x03O\x05O\u02DD\nO\x03P\x03P\x03P\x03" +
        "P\x03P\x03P\x03P\x03Q\x03Q\x03Q\x03Q\x06\u01B6\u01DB\u01F1\u0206\x02\x02" +
        "R\x03\x02\x03\x05\x02\x04\x07\x02\x05\t\x02\x06\v\x02\x07\r\x02\b\x0F" +
        "\x02\t\x11\x02\n\x13\x02\v\x15\x02\f\x17\x02\r\x19\x02\x0E\x1B\x02\x0F" +
        "\x1D\x02\x10\x1F\x02\x11!\x02\x12#\x02\x13%\x02\x14\'\x02\x15)\x02\x16" +
        "+\x02\x17-\x02\x18/\x02\x191\x02\x1A3\x02\x1B5\x02\x1C7\x02\x1D9\x02\x1E" +
        ";\x02\x1F=\x02 ?\x02!A\x02\"C\x02#E\x02$G\x02%I\x02&K\x02\'M\x02(O\x02" +
        ")Q\x02*S\x02+U\x02,W\x02-Y\x02.[\x02/]\x020_\x021a\x022c\x023e\x024g\x02" +
        "5i\x026k\x027m\x028o\x029q\x02:s\x02;u\x02<w\x02=y\x02>{\x02\x02}\x02" +
        "\x02\x7F\x02\x02\x81\x02\x02\x83\x02\x02\x85\x02\x02\x87\x02\x02\x89\x02" +
        "\x02\x8B\x02\x02\x8D\x02\x02\x8F\x02\x02\x91\x02\x02\x93\x02\x02\x95\x02" +
        "\x02\x97\x02\x02\x99\x02\x02\x9B\x02\x02\x9D\x02\x02\x9F\x02\x02\xA1\x02" +
        "?\x03\x02\x0E\x04\x02\f\f\x0F\x0F\x04\x02\v\v\"\"\x06\x02\f\f\x0F\x0F" +
        "$$^^\x06\x02\f\f\x0F\x0F))^^\x04\x02GGgg\x04\x02ZZzz\x04\x02C\\c|\x03" +
        "\x022;\x05\x022;CHch\x03\x0229\f\x02$$))AA^^cdhhppttvvxx\x03\x0225\x02" +
        "\u0305\x02\x03\x03\x02\x02\x02\x02\x05\x03\x02\x02\x02\x02\x07\x03\x02" +
        "\x02\x02\x02\t\x03\x02\x02\x02\x02\v\x03\x02\x02\x02\x02\r\x03\x02\x02" +
        "\x02\x02\x0F\x03\x02\x02\x02\x02\x11\x03\x02\x02\x02\x02\x13\x03\x02\x02" +
        "\x02\x02\x15\x03\x02\x02\x02\x02\x17\x03\x02\x02\x02\x02\x19\x03\x02\x02" +
        "\x02\x02\x1B\x03\x02\x02\x02\x02\x1D\x03\x02\x02\x02\x02\x1F\x03\x02\x02" +
        "\x02\x02!\x03\x02\x02\x02\x02#\x03\x02\x02\x02\x02%\x03\x02\x02\x02\x02" +
        "\'\x03\x02\x02\x02\x02)\x03\x02\x02\x02\x02+\x03\x02\x02\x02\x02-\x03" +
        "\x02\x02\x02\x02/\x03\x02\x02\x02\x021\x03\x02\x02\x02\x023\x03\x02\x02" +
        "\x02\x025\x03\x02\x02\x02\x027\x03\x02\x02\x02\x029\x03\x02\x02\x02\x02" +
        ";\x03\x02\x02\x02\x02=\x03\x02\x02\x02\x02?\x03\x02\x02\x02\x02A\x03\x02" +
        "\x02\x02\x02C\x03\x02\x02\x02\x02E\x03\x02\x02\x02\x02G\x03\x02\x02\x02" +
        "\x02I\x03\x02\x02\x02\x02K\x03\x02\x02\x02\x02M\x03\x02\x02\x02\x02O\x03" +
        "\x02\x02\x02\x02Q\x03\x02\x02\x02\x02S\x03\x02\x02\x02\x02U\x03\x02\x02" +
        "\x02\x02W\x03\x02\x02\x02\x02Y\x03\x02\x02\x02\x02[\x03\x02\x02\x02\x02" +
        "]\x03\x02\x02\x02\x02_\x03\x02\x02\x02\x02a\x03\x02\x02\x02\x02c\x03\x02" +
        "\x02\x02\x02e\x03\x02\x02\x02\x02g\x03\x02\x02\x02\x02i\x03\x02\x02\x02" +
        "\x02k\x03\x02\x02\x02\x02m\x03\x02\x02\x02\x02o\x03\x02\x02\x02\x02q\x03" +
        "\x02\x02\x02\x02s\x03\x02\x02\x02\x02u\x03\x02\x02\x02\x02w\x03\x02\x02" +
        "\x02\x02y\x03\x02\x02\x02\x02\xA1\x03\x02\x02\x02\x03\xA3\x03\x02\x02" +
        "\x02\x05\xAB\x03\x02\x02\x02\x07\xB2\x03\x02\x02\x02\t\xB9\x03\x02\x02" +
        "\x02\v\xC0\x03\x02\x02\x02\r\xC7\x03\x02\x02\x02\x0F\xCF\x03\x02\x02\x02" +
        "\x11\xD5\x03\x02\x02\x02\x13\xDE\x03\x02\x02\x02\x15\xE7\x03\x02\x02\x02" +
        "\x17\xF0\x03\x02\x02\x02\x19\xF6\x03\x02\x02\x02\x1B\xFD\x03\x02\x02\x02" +
        "\x1D\u0108\x03\x02\x02\x02\x1F\u010B\x03\x02\x02\x02!\u010F\x03\x02\x02" +
        "\x02#\u0118\x03\x02\x02\x02%\u011D\x03\x02\x02\x02\'\u0125\x03\x02\x02" +
        "\x02)\u0129\x03\x02\x02\x02+\u0131\x03\x02\x02\x02-\u0138\x03\x02\x02" +
        "\x02/\u0145\x03\x02\x02\x021\u0147\x03\x02\x02\x023\u014E\x03\x02\x02" +
        "\x025\u0154\x03\x02\x02\x027\u015A\x03\x02\x02\x029\u0160\x03\x02\x02" +
        "\x02;\u0167\x03\x02\x02\x02=\u016E\x03\x02\x02\x02?\u0175\x03\x02\x02" +
        "\x02A\u017C\x03\x02\x02\x02C\u0184\x03\x02\x02\x02E\u018C\x03\x02\x02" +
        "\x02G\u0195\x03\x02\x02\x02I\u019E\x03\x02\x02\x02K\u01A3\x03\x02\x02" +
        "\x02M\u01AA\x03\x02\x02\x02O\u01B0\x03\x02\x02\x02Q\u01BE\x03\x02\x02" +
        "\x02S\u0211\x03\x02\x02\x02U\u0216\x03\x02\x02\x02W\u021D\x03\x02\x02" +
        "\x02Y\u0223\x03\x02\x02\x02[\u0225\x03\x02\x02\x02]\u0227\x03\x02\x02" +
        "\x02_\u0229\x03\x02\x02\x02a\u022B\x03\x02\x02\x02c\u022D\x03\x02\x02" +
        "\x02e\u022F\x03\x02\x02\x02g\u0231\x03\x02\x02\x02i\u0233\x03\x02\x02" +
        "\x02k\u0235\x03\x02\x02\x02m\u0237\x03\x02\x02\x02o\u0239\x03\x02\x02" +
        "\x02q\u023B\x03\x02\x02\x02s\u023F\x03\x02\x02\x02u\u024B\x03\x02\x02" +
        "\x02w\u0250\x03\x02\x02\x02y\u0259\x03\x02\x02\x02{\u025B\x03\x02\x02" +
        "\x02}\u0265\x03\x02\x02\x02\x7F\u0271\x03\x02\x02\x02\x81\u028E\x03\x02" +
        "\x02\x02\x83\u0290\x03\x02\x02\x02\x85\u0294\x03\x02\x02\x02\x87\u0298" +
        "\x03\x02\x02\x02\x89\u02A5\x03\x02\x02\x02\x8B\u02A8\x03\x02\x02\x02\x8D" +
        "\u02B2\x03\x02\x02\x02\x8F\u02BA\x03\x02\x02\x02\x91\u02BC\x03\x02\x02" +
        "\x02\x93\u02BE\x03\x02\x02\x02\x95\u02C0\x03\x02\x02\x02\x97\u02C2\x03" +
        "\x02\x02\x02\x99\u02C4\x03\x02\x02\x02\x9B\u02CF\x03\x02\x02\x02\x9D\u02DC" +
        "\x03\x02\x02\x02\x9F\u02DE\x03\x02\x02\x02\xA1\u02E5\x03\x02\x02\x02\xA3" +
        "\xA4\x07r\x02\x02\xA4\xA5\x07c\x02\x02\xA5\xA6\x07e\x02\x02\xA6\xA7\x07" +
        "m\x02\x02\xA7\xA8\x07c\x02\x02\xA8\xA9\x07i\x02\x02\xA9\xAA\x07g\x02\x02" +
        "\xAA\x04\x03\x02\x02\x02\xAB\xAC\x07u\x02\x02\xAC\xAD\x07{\x02\x02\xAD" +
        "\xAE\x07p\x02\x02\xAE\xAF\x07v\x02\x02\xAF\xB0\x07c\x02\x02\xB0\xB1\x07" +
        "z\x02\x02\xB1\x06\x03\x02\x02\x02\xB2\xB3\x07k\x02\x02\xB3\xB4\x07o\x02" +
        "\x02\xB4\xB5\x07r\x02\x02\xB5\xB6\x07q\x02\x02\xB6\xB7\x07t\x02\x02\xB7" +
        "\xB8\x07v\x02\x02\xB8\b\x03\x02\x02\x02\xB9\xBA\x07r\x02\x02\xBA\xBB\x07" +
        "w\x02\x02\xBB\xBC\x07d\x02\x02\xBC\xBD\x07n\x02\x02\xBD\xBE\x07k\x02\x02" +
        "\xBE\xBF\x07e\x02\x02\xBF\n\x03\x02\x02\x02\xC0\xC1\x07q\x02\x02\xC1\xC2" +
        "\x07r\x02\x02\xC2\xC3\x07v\x02\x02\xC3\xC4\x07k\x02\x02\xC4\xC5\x07q\x02" +
        "\x02\xC5\xC6\x07p\x02\x02\xC6\f\x03\x02\x02\x02\xC7\xC8\x07o\x02\x02\xC8" +
        "\xC9\x07g\x02\x02\xC9\xCA\x07u\x02\x02\xCA\xCB\x07u\x02\x02\xCB\xCC\x07" +
        "c\x02\x02\xCC\xCD\x07i\x02\x02\xCD\xCE\x07g\x02\x02\xCE\x0E\x03\x02\x02" +
        "\x02\xCF\xD0\x07i\x02\x02\xD0\xD1\x07t\x02\x02\xD1\xD2\x07q\x02\x02\xD2" +
        "\xD3\x07w\x02\x02\xD3\xD4\x07r\x02\x02\xD4\x10\x03\x02\x02\x02\xD5\xD6" +
        "\x07q\x02\x02\xD6\xD7\x07r\x02\x02\xD7\xD8\x07v\x02\x02\xD8\xD9\x07k\x02" +
        "\x02\xD9\xDA\x07q\x02\x02\xDA\xDB\x07p\x02\x02\xDB\xDC\x07c\x02\x02\xDC" +
        "\xDD\x07n\x02\x02\xDD\x12\x03\x02\x02\x02\xDE\xDF\x07t\x02\x02\xDF\xE0" +
        "\x07g\x02\x02\xE0\xE1\x07s\x02\x02\xE1\xE2\x07w\x02\x02\xE2\xE3\x07k\x02" +
        "\x02\xE3\xE4\x07t\x02\x02\xE4\xE5\x07g\x02\x02\xE5\xE6\x07f\x02\x02\xE6" +
        "\x14\x03\x02\x02\x02\xE7\xE8\x07t\x02\x02\xE8\xE9\x07g\x02\x02\xE9\xEA" +
        "\x07r\x02\x02\xEA\xEB\x07g\x02\x02\xEB\xEC\x07c\x02\x02\xEC\xED\x07v\x02" +
        "\x02\xED\xEE\x07g\x02\x02\xEE\xEF\x07f\x02\x02\xEF\x16\x03\x02\x02\x02" +
        "\xF0\xF1\x07q\x02\x02\xF1\xF2\x07p\x02\x02\xF2\xF3\x07g\x02\x02\xF3\xF4" +
        "\x07q\x02\x02\xF4\xF5\x07h\x02\x02\xF5\x18\x03\x02\x02\x02\xF6\xF7\x07" +
        "g\x02\x02\xF7\xF8\x07z\x02\x02\xF8\xF9\x07v\x02\x02\xF9\xFA\x07g\x02\x02" +
        "\xFA\xFB\x07p\x02\x02\xFB\xFC\x07f\x02\x02\xFC\x1A\x03\x02\x02\x02\xFD" +
        "\xFE\x07g\x02\x02\xFE\xFF\x07z\x02\x02\xFF\u0100\x07v\x02\x02\u0100\u0101" +
        "\x07g\x02\x02\u0101\u0102\x07p\x02\x02\u0102\u0103\x07u\x02\x02\u0103" +
        "\u0104\x07k\x02\x02\u0104\u0105\x07q\x02\x02\u0105\u0106\x07p\x02\x02" +
        "\u0106\u0107\x07u\x02\x02\u0107\x1C\x03\x02\x02\x02\u0108\u0109\x07v\x02" +
        "\x02\u0109\u010A\x07q\x02\x02\u010A\x1E\x03\x02\x02\x02\u010B\u010C\x07" +
        "o\x02\x02\u010C\u010D\x07c\x02\x02\u010D\u010E\x07z\x02\x02\u010E \x03" +
        "\x02\x02\x02\u010F\u0110\x07t\x02\x02\u0110\u0111\x07g\x02\x02\u0111\u0112" +
        "\x07u\x02\x02\u0112\u0113\x07g\x02\x02\u0113\u0114\x07t\x02\x02\u0114" +
        "\u0115\x07x\x02\x02\u0115\u0116\x07g\x02\x02\u0116\u0117\x07f\x02\x02" +
        "\u0117\"\x03\x02\x02\x02\u0118\u0119\x07g\x02\x02\u0119\u011A\x07p\x02" +
        "\x02\u011A\u011B\x07w\x02\x02\u011B\u011C\x07o\x02\x02\u011C$\x03\x02" +
        "\x02\x02\u011D\u011E\x07u\x02\x02\u011E\u011F\x07g\x02\x02\u011F\u0120" +
        "\x07t\x02\x02\u0120\u0121\x07x\x02\x02\u0121\u0122\x07k\x02\x02\u0122" +
        "\u0123\x07e\x02\x02\u0123\u0124\x07g\x02\x02\u0124&\x03\x02\x02\x02\u0125" +
        "\u0126\x07t\x02\x02\u0126\u0127\x07r\x02\x02\u0127\u0128\x07e\x02\x02" +
        "\u0128(\x03\x02\x02\x02\u0129\u012A\x07t\x02\x02\u012A\u012B\x07g\x02" +
        "\x02\u012B\u012C\x07v\x02\x02\u012C\u012D\x07w\x02\x02\u012D\u012E\x07" +
        "t\x02\x02\u012E\u012F\x07p\x02\x02\u012F\u0130\x07u\x02\x02\u0130*\x03" +
        "\x02\x02\x02\u0131\u0132\x07u\x02\x02\u0132\u0133\x07v\x02\x02\u0133\u0134" +
        "\x07t\x02\x02\u0134\u0135\x07g\x02\x02\u0135\u0136\x07c\x02\x02\u0136" +
        "\u0137\x07o\x02\x02\u0137,\x03\x02\x02\x02\u0138\u0139\x07o\x02\x02\u0139" +
        "\u013A\x07c\x02\x02\u013A\u013B\x07r\x02\x02\u013B.\x03\x02\x02\x02\u013C" +
        "\u013D\x07v\x02\x02\u013D\u013E\x07t\x02\x02\u013E\u013F\x07w\x02\x02" +
        "\u013F\u0146\x07g\x02\x02\u0140\u0141\x07h\x02\x02\u0141\u0142\x07c\x02" +
        "\x02\u0142\u0143\x07n\x02\x02\u0143\u0144\x07u\x02\x02\u0144\u0146\x07" +
        "g\x02\x02\u0145\u013C\x03\x02\x02\x02\u0145\u0140\x03\x02\x02\x02\u0146" +
        "0\x03\x02\x02\x02\u0147\u0148\x07f\x02\x02\u0148\u0149\x07q\x02\x02\u0149" +
        "\u014A\x07w\x02\x02\u014A\u014B\x07d\x02\x02\u014B\u014C\x07n\x02\x02" +
        "\u014C\u014D\x07g\x02\x02\u014D2\x03\x02\x02\x02\u014E\u014F\x07h\x02" +
        "\x02\u014F\u0150\x07n\x02\x02\u0150\u0151\x07q\x02\x02\u0151\u0152\x07" +
        "c\x02\x02\u0152\u0153\x07v\x02\x02\u01534\x03\x02\x02\x02\u0154\u0155" +
        "\x07k\x02\x02\u0155\u0156\x07p\x02\x02\u0156\u0157\x07v\x02\x02\u0157" +
        "\u0158\x075\x02\x02\u0158\u0159\x074\x02\x02\u01596\x03\x02\x02\x02\u015A" +
        "\u015B\x07k\x02\x02\u015B\u015C\x07p\x02\x02\u015C\u015D\x07v\x02\x02" +
        "\u015D\u015E\x078\x02\x02\u015E\u015F\x076\x02\x02\u015F8\x03\x02\x02" +
        "\x02\u0160\u0161\x07w\x02\x02\u0161\u0162\x07k\x02\x02\u0162\u0163\x07" +
        "p\x02\x02\u0163\u0164\x07v\x02\x02\u0164\u0165\x075\x02\x02\u0165\u0166" +
        "\x074\x02\x02\u0166:\x03\x02\x02\x02\u0167\u0168\x07w\x02\x02\u0168\u0169" +
        "\x07k\x02\x02\u0169\u016A\x07p\x02\x02\u016A\u016B\x07v\x02\x02\u016B" +
        "\u016C\x078\x02\x02\u016C\u016D\x076\x02\x02\u016D<\x03\x02\x02\x02\u016E" +
        "\u016F\x07u\x02\x02\u016F\u0170\x07k\x02\x02\u0170\u0171\x07p\x02\x02" +
        "\u0171\u0172\x07v\x02\x02\u0172\u0173\x075\x02\x02\u0173\u0174\x074\x02" +
        "\x02\u0174>\x03\x02\x02\x02\u0175\u0176\x07u\x02\x02\u0176\u0177\x07k" +
        "\x02\x02\u0177\u0178\x07p\x02\x02\u0178\u0179\x07v\x02\x02\u0179\u017A" +
        "\x078\x02\x02\u017A\u017B\x076\x02\x02\u017B@\x03\x02\x02\x02\u017C\u017D" +
        "\x07h\x02\x02\u017D\u017E\x07k\x02\x02\u017E\u017F\x07z\x02\x02\u017F" +
        "\u0180\x07g\x02\x02\u0180\u0181\x07f\x02\x02\u0181\u0182\x075\x02\x02" +
        "\u0182\u0183\x074\x02\x02\u0183B\x03\x02\x02\x02\u0184\u0185\x07h\x02" +
        "\x02\u0185\u0186\x07k\x02\x02\u0186\u0187\x07z\x02\x02\u0187\u0188\x07" +
        "g\x02\x02\u0188\u0189\x07f\x02\x02\u0189\u018A\x078\x02\x02\u018A\u018B" +
        "\x076\x02\x02\u018BD\x03\x02\x02\x02\u018C\u018D\x07u\x02\x02\u018D\u018E" +
        "\x07h\x02\x02\u018E\u018F\x07k\x02\x02\u018F\u0190\x07z\x02\x02\u0190" +
        "\u0191\x07g\x02\x02\u0191\u0192\x07f\x02\x02\u0192\u0193\x075\x02\x02" +
        "\u0193\u0194\x074\x02\x02\u0194F\x03\x02\x02\x02\u0195\u0196\x07u\x02" +
        "\x02\u0196\u0197\x07h\x02\x02\u0197\u0198\x07k\x02\x02\u0198\u0199\x07" +
        "z\x02\x02\u0199\u019A\x07g\x02\x02\u019A\u019B\x07f\x02\x02\u019B\u019C" +
        "\x078\x02\x02\u019C\u019D\x076\x02\x02\u019DH\x03\x02\x02\x02\u019E\u019F" +
        "\x07d\x02\x02\u019F\u01A0\x07q\x02\x02\u01A0\u01A1\x07q\x02\x02\u01A1" +
        "\u01A2\x07n\x02\x02\u01A2J\x03\x02\x02\x02\u01A3\u01A4\x07u\x02\x02\u01A4" +
        "\u01A5\x07v\x02\x02\u01A5\u01A6\x07t\x02\x02\u01A6\u01A7\x07k\x02\x02" +
        "\u01A7\u01A8\x07p\x02\x02\u01A8\u01A9\x07i\x02\x02\u01A9L\x03\x02\x02" +
        "\x02\u01AA\u01AB\x07d\x02\x02\u01AB\u01AC\x07{\x02\x02\u01AC\u01AD\x07" +
        "v\x02\x02\u01AD\u01AE\x07g\x02\x02\u01AE\u01AF\x07u\x02\x02\u01AFN\x03" +
        "\x02\x02\x02\u01B0\u01B1\x071\x02\x02\u01B1\u01B2\x07,\x02\x02\u01B2\u01B6" +
        "\x03\x02\x02\x02\u01B3\u01B5\v\x02\x02\x02\u01B4\u01B3\x03\x02\x02\x02" +
        "\u01B5\u01B8\x03\x02\x02\x02\u01B6\u01B7\x03\x02\x02\x02\u01B6\u01B4\x03" +
        "\x02\x02\x02\u01B7\u01B9\x03\x02\x02\x02\u01B8\u01B6\x03\x02\x02\x02\u01B9" +
        "\u01BA\x07,\x02\x02\u01BA\u01BB\x071\x02\x02\u01BB\u01BC\x03\x02\x02\x02" +
        "\u01BC\u01BD\b(\x02\x02\u01BDP\x03\x02\x02\x02\u01BE\u01BF\x071\x02\x02" +
        "\u01BF\u01C0\x071\x02\x02\u01C0\u01C4\x03\x02\x02\x02\u01C1\u01C3\n\x02" +
        "\x02\x02\u01C2\u01C1\x03\x02\x02\x02\u01C3\u01C6\x03\x02\x02\x02\u01C4" +
        "\u01C2\x03\x02\x02\x02\u01C4\u01C5\x03\x02\x02\x02\u01C5\u01C7\x03\x02" +
        "\x02\x02\u01C6\u01C4\x03\x02\x02\x02\u01C7\u01C8\b)\x02\x02\u01C8R\x03" +
        "\x02\x02\x02\u01C9\u01CA\x07>\x02\x02\u01CA\u01CB\x07e\x02\x02\u01CB\u01CC" +
        "\x07c\x02\x02\u01CC\u01CD\x07t\x02\x02\u01CD\u01CE\x07g\x02\x02\u01CE" +
        "\u01CF\x07v\x02\x02\u01CF\u0212\x07@\x02\x02\u01D0\u01D1\x07>\x02\x02" +
        "\u01D1\u01D2\x07g\x02\x02\u01D2\u01D3\x07t\x02\x02\u01D3\u01D4\x07t\x02" +
        "\x02\u01D4\u01D5\x07q\x02\x02\u01D5\u01D6\x07t\x02\x02\u01D6\u01D7\x07" +
        "\"\x02\x02\u01D7\u01DB\x03\x02\x02\x02\u01D8\u01DA\v\x02\x02\x02\u01D9" +
        "\u01D8\x03\x02\x02\x02\u01DA\u01DD\x03\x02\x02\x02\u01DB\u01DC\x03\x02" +
        "\x02\x02\u01DB\u01D9\x03\x02\x02\x02\u01DC\u01DE\x03\x02\x02\x02\u01DD" +
        "\u01DB\x03\x02\x02\x02\u01DE\u0212\x07@\x02\x02\u01DF\u01E0\x07>\x02\x02" +
        "\u01E0\u01E1\x071\x02\x02\u01E1\u01E2\x07g\x02\x02\u01E2\u01E3\x07t\x02" +
        "\x02\u01E3\u01E4\x07t\x02\x02\u01E4\u01E5\x07q\x02\x02\u01E5\u01E6\x07" +
        "t\x02\x02\u01E6\u0212\x07@\x02\x02\u01E7\u01E8\x07>\x02\x02\u01E8\u01E9" +
        "\x07h\x02\x02\u01E9\u01EA\x07q\x02\x02\u01EA\u01EB\x07n\x02\x02\u01EB" +
        "\u01EC\x07f\x02\x02\u01EC\u01ED\x07\"\x02\x02\u01ED\u01F1\x03\x02\x02" +
        "\x02\u01EE\u01F0\v\x02\x02\x02\u01EF\u01EE\x03\x02\x02\x02\u01F0\u01F3" +
        "\x03\x02\x02\x02\u01F1\u01F2\x03\x02\x02\x02\u01F1\u01EF\x03\x02\x02\x02" +
        "\u01F2\u01F4\x03\x02\x02\x02\u01F3\u01F1\x03\x02\x02\x02\u01F4\u0212\x07" +
        "@\x02\x02\u01F5\u01F6\x07>\x02\x02\u01F6\u01F7\x071\x02\x02\u01F7\u01F8" +
        "\x07h\x02\x02\u01F8\u01F9\x07q\x02\x02\u01F9\u01FA\x07n\x02\x02\u01FA" +
        "\u01FB\x07f\x02\x02\u01FB\u0212\x07@\x02\x02\u01FC\u01FD\x07>\x02\x02" +
        "\u01FD\u01FE\x07V\x02\x02\u01FE\u01FF\x07[\x02\x02\u01FF\u0200\x07R\x02" +
        "\x02\u0200\u0201\x07Q\x02\x02\u0201\u0202\x07\"\x02\x02\u0202\u0206\x03" +
        "\x02\x02\x02\u0203\u0205\v\x02\x02\x02\u0204\u0203\x03\x02\x02\x02\u0205" +
        "\u0208\x03\x02\x02\x02\u0206\u0207\x03\x02\x02\x02\u0206\u0204\x03\x02" +
        "\x02\x02\u0207\u0209\x03\x02\x02\x02\u0208\u0206\x03\x02\x02\x02\u0209" +
        "\u0212\x07@\x02\x02\u020A\u020B\x07>\x02\x02\u020B\u020C\x071\x02\x02" +
        "\u020C\u020D\x07V\x02\x02\u020D\u020E\x07[\x02\x02\u020E\u020F\x07R\x02" +
        "\x02\u020F\u0210\x07Q\x02\x02\u0210\u0212\x07@\x02\x02\u0211\u01C9\x03" +
        "\x02\x02\x02\u0211\u01D0\x03\x02\x02\x02\u0211\u01DF\x03\x02\x02\x02\u0211" +
        "\u01E7\x03\x02\x02\x02\u0211\u01F5\x03\x02\x02\x02\u0211";
    ProtoLexer._serializedATNSegment1 = "\u01FC\x03\x02\x02\x02\u0211\u020A\x03\x02\x02\x02\u0212\u0213\x03\x02" +
        "\x02\x02\u0213\u0214\b*\x02\x02\u0214T\x03\x02\x02\x02\u0215\u0217\x07" +
        "\x0F\x02\x02\u0216\u0215\x03\x02\x02\x02\u0216\u0217\x03\x02\x02\x02\u0217" +
        "\u0218\x03\x02\x02\x02\u0218\u0219\x07\f\x02\x02\u0219\u021A\x03\x02\x02" +
        "\x02\u021A\u021B\b+\x02\x02\u021BV\x03\x02\x02\x02\u021C\u021E\t\x03\x02" +
        "\x02\u021D\u021C\x03\x02\x02\x02\u021E\u021F\x03\x02\x02\x02\u021F\u021D" +
        "\x03\x02\x02\x02\u021F\u0220\x03\x02\x02\x02\u0220\u0221\x03\x02\x02\x02" +
        "\u0221\u0222\b,\x02\x02\u0222X\x03\x02\x02\x02\u0223\u0224\x07}\x02\x02" +
        "\u0224Z\x03\x02\x02\x02\u0225\u0226\x07\x7F\x02\x02\u0226\\\x03\x02\x02" +
        "\x02\u0227\u0228\x07*\x02\x02\u0228^\x03\x02\x02\x02\u0229\u022A\x07+" +
        "\x02\x02\u022A`\x03\x02\x02\x02\u022B\u022C\x07]\x02\x02\u022Cb\x03\x02" +
        "\x02\x02\u022D\u022E\x07_\x02\x02\u022Ed\x03\x02\x02\x02\u022F\u0230\x07" +
        ">\x02\x02\u0230f\x03\x02\x02\x02\u0231\u0232\x07@\x02\x02\u0232h\x03\x02" +
        "\x02\x02\u0233\u0234\x07.\x02\x02\u0234j\x03\x02\x02\x02\u0235\u0236\x07" +
        "0\x02\x02\u0236l\x03\x02\x02\x02\u0237\u0238\x07<\x02\x02\u0238n\x03\x02" +
        "\x02\x02\u0239\u023A\x07=\x02\x02\u023Ap\x03\x02\x02\x02\u023B\u023C\x07" +
        "?\x02\x02\u023Cr\x03\x02\x02\x02\u023D\u0240\x05\x91I\x02\u023E\u0240" +
        "\x05\x99M\x02\u023F\u023D\x03\x02\x02\x02\u023F\u023E\x03\x02\x02\x02" +
        "\u0240\u0246\x03\x02\x02\x02\u0241\u0245\x05\x91I\x02\u0242\u0245\x05" +
        "\x93J\x02\u0243\u0245\x05\x99M\x02\u0244\u0241\x03\x02\x02\x02\u0244\u0242" +
        "\x03\x02\x02\x02\u0244\u0243\x03\x02\x02\x02\u0245\u0248\x03\x02\x02\x02" +
        "\u0246\u0244\x03\x02\x02\x02\u0246\u0247\x03\x02\x02\x02\u0247t\x03\x02" +
        "\x02\x02\u0248\u0246\x03\x02\x02\x02\u0249\u024C\x05{>\x02\u024A\u024C" +
        "\x05}?\x02\u024B\u0249\x03\x02\x02\x02\u024B\u024A\x03\x02\x02\x02\u024C" +
        "v\x03\x02\x02\x02\u024D\u0251\x05\x89E\x02\u024E\u0251\x05\x8BF\x02\u024F" +
        "\u0251\x05\x8DG\x02\u0250\u024D\x03\x02\x02\x02\u0250\u024E\x03\x02\x02" +
        "\x02\u0250\u024F\x03\x02\x02\x02\u0251x\x03\x02\x02\x02\u0252\u025A\x05" +
        "\x7F@\x02\u0253\u025A\x05\x81A\x02\u0254\u0256\x05\x8FH\x02\u0255\u0254" +
        "\x03\x02\x02\x02\u0255\u0256\x03\x02\x02\x02\u0256\u0257\x03\x02\x02\x02" +
        "\u0257\u025A\x05\x83B\x02\u0258\u025A\x05\x85C\x02\u0259\u0252\x03\x02" +
        "\x02\x02\u0259\u0253\x03\x02\x02\x02\u0259\u0255\x03\x02\x02\x02\u0259" +
        "\u0258\x03\x02\x02\x02\u025Az\x03\x02\x02\x02\u025B\u0260\x07$\x02\x02" +
        "\u025C\u025F\x05\x9BN\x02\u025D\u025F\n\x04\x02\x02\u025E\u025C\x03\x02" +
        "\x02\x02\u025E\u025D\x03\x02\x02\x02\u025F\u0262\x03\x02\x02\x02\u0260" +
        "\u025E\x03\x02\x02\x02\u0260\u0261\x03\x02\x02\x02\u0261\u0263\x03\x02" +
        "\x02\x02\u0262\u0260\x03\x02\x02\x02\u0263\u0264\x07$\x02\x02\u0264|\x03" +
        "\x02\x02\x02\u0265\u026A\x07)\x02\x02\u0266\u0269\x05\x9BN\x02\u0267\u0269" +
        "\n\x05\x02\x02\u0268\u0266\x03\x02\x02\x02\u0268\u0267\x03\x02\x02\x02" +
        "\u0269\u026C\x03\x02\x02\x02\u026A\u0268\x03\x02\x02\x02\u026A\u026B\x03" +
        "\x02\x02\x02\u026B\u026D\x03\x02\x02\x02\u026C\u026A\x03\x02\x02\x02\u026D" +
        "\u026E\x07)\x02\x02\u026E~\x03\x02\x02\x02\u026F\u0272\x05\x81A\x02\u0270" +
        "\u0272\x05\x89E\x02\u0271\u026F\x03\x02\x02\x02\u0271\u0270\x03\x02\x02" +
        "\x02\u0272\u0273\x03\x02\x02\x02\u0273\u0274\x05\x87D\x02\u0274\u0275" +
        "\x05\x89E\x02\u0275\x80\x03\x02\x02\x02\u0276\u0278\x05\x8FH\x02\u0277" +
        "\u0276\x03\x02\x02\x02\u0277\u0278\x03\x02\x02\x02\u0278\u027A\x03\x02" +
        "\x02\x02\u0279\u027B\x05\x93J\x02\u027A\u0279\x03\x02\x02\x02\u027B\u027C" +
        "\x03\x02\x02\x02\u027C\u027A\x03\x02\x02\x02\u027C\u027D\x03\x02\x02\x02" +
        "\u027D\u027E\x03\x02\x02\x02\u027E\u0282\x070\x02\x02\u027F\u0281\x05" +
        "\x93J\x02\u0280\u027F\x03\x02\x02\x02\u0281\u0284\x03\x02\x02\x02\u0282" +
        "\u0280\x03\x02\x02\x02\u0282\u0283\x03\x02\x02\x02\u0283\u028F\x03\x02" +
        "\x02\x02\u0284\u0282\x03\x02\x02\x02\u0285\u0287\x05\x8FH\x02\u0286\u0285" +
        "\x03\x02\x02\x02\u0286\u0287\x03\x02\x02\x02\u0287\u0288\x03\x02\x02\x02" +
        "\u0288\u028A\x070\x02\x02\u0289\u028B\x05\x93J\x02\u028A\u0289\x03\x02" +
        "\x02\x02\u028B\u028C\x03\x02\x02\x02\u028C\u028A\x03\x02\x02\x02\u028C" +
        "\u028D\x03\x02\x02\x02\u028D\u028F\x03\x02\x02\x02\u028E\u0277\x03\x02" +
        "\x02\x02\u028E\u0286\x03\x02\x02\x02\u028F\x82\x03\x02\x02\x02\u0290\u0291" +
        "\x07k\x02\x02\u0291\u0292\x07p\x02\x02\u0292\u0293\x07h\x02\x02\u0293" +
        "\x84\x03\x02\x02\x02\u0294\u0295\x07p\x02\x02\u0295\u0296\x07c\x02\x02" +
        "\u0296\u0297\x07p\x02\x02\u0297\x86\x03\x02\x02\x02\u0298\u0299\t\x06" +
        "\x02\x02\u0299\x88\x03\x02\x02\x02\u029A\u02A6\x072\x02\x02\u029B\u029D" +
        "\x05\x8FH\x02\u029C\u029B\x03\x02\x02\x02\u029C\u029D\x03\x02\x02\x02" +
        "\u029D\u029E\x03\x02\x02\x02\u029E\u02A2\x043;\x02\u029F\u02A1\x042;\x02" +
        "\u02A0\u029F\x03\x02\x02\x02\u02A1\u02A4\x03\x02\x02\x02\u02A2\u02A0\x03" +
        "\x02\x02\x02\u02A2\u02A3\x03\x02\x02\x02\u02A3\u02A6\x03\x02\x02\x02\u02A4" +
        "\u02A2\x03\x02\x02\x02\u02A5\u029A\x03\x02\x02\x02\u02A5\u029C\x03\x02" +
        "\x02\x02\u02A6\x8A\x03\x02\x02\x02\u02A7\u02A9\x05\x8FH\x02\u02A8\u02A7" +
        "\x03\x02\x02\x02\u02A8\u02A9\x03\x02\x02\x02\u02A9\u02AA\x03\x02\x02\x02" +
        "\u02AA\u02AB\x072\x02\x02\u02AB\u02AD\t\x07\x02\x02\u02AC\u02AE\x05\x95" +
        "K\x02\u02AD\u02AC\x03\x02\x02\x02\u02AE\u02AF\x03\x02\x02\x02\u02AF\u02AD" +
        "\x03\x02\x02\x02\u02AF\u02B0\x03\x02\x02\x02\u02B0\x8C\x03\x02\x02\x02" +
        "\u02B1\u02B3\x05\x8FH\x02\u02B2\u02B1\x03\x02\x02\x02\u02B2\u02B3\x03" +
        "\x02\x02\x02\u02B3\u02B4\x03\x02\x02\x02\u02B4\u02B6\x072\x02\x02\u02B5" +
        "\u02B7\x05\x97L\x02\u02B6\u02B5\x03\x02\x02\x02\u02B7\u02B8\x03\x02\x02" +
        "\x02\u02B8\u02B6\x03\x02\x02\x02\u02B8\u02B9\x03\x02\x02\x02\u02B9\x8E" +
        "\x03\x02\x02\x02\u02BA\u02BB\x07/\x02\x02\u02BB\x90\x03\x02\x02\x02\u02BC" +
        "\u02BD\t\b\x02\x02\u02BD\x92\x03\x02\x02\x02\u02BE\u02BF\t\t\x02\x02\u02BF" +
        "\x94\x03\x02\x02\x02\u02C0\u02C1\t\n\x02\x02\u02C1\x96\x03\x02\x02\x02" +
        "\u02C2\u02C3\t\v\x02\x02\u02C3\x98\x03\x02\x02\x02\u02C4\u02C5\x07a\x02" +
        "\x02\u02C5\x9A\x03\x02\x02\x02\u02C6\u02C7\x07^\x02\x02\u02C7\u02D0\t" +
        "\f\x02\x02\u02C8\u02C9\x07^\x02\x02\u02C9\u02CA\t\x07\x02\x02\u02CA\u02CB" +
        "\x05\x95K\x02\u02CB\u02CC\x05\x95K\x02\u02CC\u02D0\x03\x02\x02\x02\u02CD" +
        "\u02D0\x05\x9FP\x02\u02CE\u02D0\x05\x9DO\x02\u02CF\u02C6\x03\x02\x02\x02" +
        "\u02CF\u02C8\x03\x02\x02\x02\u02CF\u02CD\x03\x02\x02\x02\u02CF\u02CE\x03" +
        "\x02\x02\x02\u02D0\x9C\x03\x02\x02\x02\u02D1\u02D2\x07^\x02\x02\u02D2" +
        "\u02D3\t\r\x02\x02\u02D3\u02D4\x05\x97L\x02\u02D4\u02D5\x05\x97L\x02\u02D5" +
        "\u02DD\x03\x02\x02\x02\u02D6\u02D7\x07^\x02\x02\u02D7\u02D8\x05\x97L\x02" +
        "\u02D8\u02D9\x05\x97L\x02\u02D9\u02DD\x03\x02\x02\x02\u02DA\u02DB\x07" +
        "^\x02\x02\u02DB\u02DD\x05\x97L\x02\u02DC\u02D1\x03\x02\x02\x02\u02DC\u02D6" +
        "\x03\x02\x02\x02\u02DC\u02DA\x03\x02\x02\x02\u02DD\x9E\x03\x02\x02\x02" +
        "\u02DE\u02DF\x07^\x02\x02\u02DF\u02E0\x07w\x02\x02\u02E0\u02E1\x05\x95" +
        "K\x02\u02E1\u02E2\x05\x95K\x02\u02E2\u02E3\x05\x95K\x02\u02E3\u02E4\x05" +
        "\x95K\x02\u02E4\xA0\x03\x02\x02\x02\u02E5\u02E6\v\x02\x02\x02\u02E6\u02E7" +
        "\x03\x02\x02\x02\u02E7\u02E8\bQ\x02\x02\u02E8\xA2\x03\x02\x02\x02\'\x02" +
        "\u0145\u01B6\u01C4\u01DB\u01F1\u0206\u0211\u0216\u021F\u023F\u0244\u0246" +
        "\u024B\u0250\u0255\u0259\u025E\u0260\u0268\u026A\u0271\u0277\u027C\u0282" +
        "\u0286\u028C\u028E\u029C\u02A2\u02A5\u02A8\u02AF\u02B2\u02B8\u02CF\u02DC" +
        "\x03\x02\x03\x02";
    ProtoLexer._serializedATN = Utils.join([
        ProtoLexer._serializedATNSegment0,
        ProtoLexer._serializedATNSegment1,
    ], "");
    return ProtoLexer;
}(Utils.Lexer));

// Generated from parser/ProtoParser.g4 by ANTLR 4.7.3-SNAPSHOT
var ProtoParser = /** @class */ (function (_super) {
    __extends(ProtoParser, _super);
    function ProtoParser(input) {
        var _this = _super.call(this, input) || this;
        _this._interp = new Utils.ParserATNSimulator(ProtoParser._ATN, _this);
        return _this;
    }
    Object.defineProperty(ProtoParser.prototype, "vocabulary", {
        // @Override
        // @NotNull
        get: function () {
            return ProtoParser.VOCABULARY;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProtoParser.prototype, "grammarFileName", {
        // tslint:enable:no-trailing-whitespace
        // @Override
        get: function () { return "ProtoParser.g4"; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProtoParser.prototype, "ruleNames", {
        // @Override
        get: function () { return ProtoParser.ruleNames; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ProtoParser.prototype, "serializedATN", {
        // @Override
        get: function () { return ProtoParser._serializedATN; },
        enumerable: false,
        configurable: true
    });
    // @RuleVersion(0)
    ProtoParser.prototype.proto = function () {
        var _localctx = new ProtoContext(this._ctx, this.state);
        this.enterRule(_localctx, 0, ProtoParser.RULE_proto);
        var _la;
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
                                throw new Utils.NoViableAltException(this);
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.syntaxStatement = function () {
        var _localctx = new SyntaxStatementContext(this._ctx, this.state);
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.syntaxName = function () {
        var _localctx = new SyntaxNameContext(this._ctx, this.state);
        this.enterRule(_localctx, 4, ProtoParser.RULE_syntaxName);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 128;
                this.match(ProtoParser.STRING_VALUE);
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.packageStatement = function () {
        var _localctx = new PackageStatementContext(this._ctx, this.state);
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.packageName = function () {
        var _localctx = new PackageNameContext(this._ctx, this.state);
        this.enterRule(_localctx, 8, ProtoParser.RULE_packageName);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 134;
                this.fullIdent();
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.importStatement = function () {
        var _localctx = new ImportStatementContext(this._ctx, this.state);
        this.enterRule(_localctx, 10, ProtoParser.RULE_importStatement);
        var _la;
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.fileReference = function () {
        var _localctx = new FileReferenceContext(this._ctx, this.state);
        this.enterRule(_localctx, 12, ProtoParser.RULE_fileReference);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 143;
                this.match(ProtoParser.STRING_VALUE);
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.optionEntry = function () {
        var _localctx = new OptionEntryContext(this._ctx, this.state);
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.enumBlock = function () {
        var _localctx = new EnumBlockContext(this._ctx, this.state);
        this.enterRule(_localctx, 16, ProtoParser.RULE_enumBlock);
        var _la;
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
                        switch (this.interpreter.adaptivePredict(this._input, 4, this._ctx)) {
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.enumName = function () {
        var _localctx = new EnumNameContext(this._ctx, this.state);
        this.enterRule(_localctx, 18, ProtoParser.RULE_enumName);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 165;
                this.ident();
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.enumField = function () {
        var _localctx = new EnumFieldContext(this._ctx, this.state);
        this.enterRule(_localctx, 20, ProtoParser.RULE_enumField);
        var _la;
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.enumFieldName = function () {
        var _localctx = new EnumFieldNameContext(this._ctx, this.state);
        this.enterRule(_localctx, 22, ProtoParser.RULE_enumFieldName);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 175;
                this.ident();
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.enumFieldValue = function () {
        var _localctx = new EnumFieldValueContext(this._ctx, this.state);
        this.enterRule(_localctx, 24, ProtoParser.RULE_enumFieldValue);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 177;
                this.match(ProtoParser.INTEGER_VALUE);
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.extendBlock = function () {
        var _localctx = new ExtendBlockContext(this._ctx, this.state);
        this.enterRule(_localctx, 26, ProtoParser.RULE_extendBlock);
        var _la;
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.extendBlockEntry = function () {
        var _localctx = new ExtendBlockEntryContext(this._ctx, this.state);
        this.enterRule(_localctx, 28, ProtoParser.RULE_extendBlockEntry);
        try {
            this.state = 194;
            this._errHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this._input, 10, this._ctx)) {
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.serviceBlock = function () {
        var _localctx = new ServiceBlockContext(this._ctx, this.state);
        this.enterRule(_localctx, 30, ProtoParser.RULE_serviceBlock);
        var _la;
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
                                throw new Utils.NoViableAltException(this);
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.serviceName = function () {
        var _localctx = new ServiceNameContext(this._ctx, this.state);
        this.enterRule(_localctx, 32, ProtoParser.RULE_serviceName);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 210;
                this.ident();
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.rpcMethod = function () {
        var _localctx = new RpcMethodContext(this._ctx, this.state);
        this.enterRule(_localctx, 34, ProtoParser.RULE_rpcMethod);
        var _la;
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.rpcName = function () {
        var _localctx = new RpcNameContext(this._ctx, this.state);
        this.enterRule(_localctx, 36, ProtoParser.RULE_rpcName);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 234;
                this.ident();
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.rpcType = function () {
        var _localctx = new RpcTypeContext(this._ctx, this.state);
        this.enterRule(_localctx, 38, ProtoParser.RULE_rpcType);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 237;
                this._errHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this._input, 17, this._ctx)) {
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.messageBlock = function () {
        var _localctx = new MessageBlockContext(this._ctx, this.state);
        this.enterRule(_localctx, 40, ProtoParser.RULE_messageBlock);
        var _la;
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
                        switch (this.interpreter.adaptivePredict(this._input, 18, this._ctx)) {
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.messageName = function () {
        var _localctx = new MessageNameContext(this._ctx, this.state);
        this.enterRule(_localctx, 42, ProtoParser.RULE_messageName);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 264;
                this.ident();
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.oneof = function () {
        var _localctx = new OneofContext(this._ctx, this.state);
        this.enterRule(_localctx, 44, ProtoParser.RULE_oneof);
        var _la;
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
                        switch (this.interpreter.adaptivePredict(this._input, 21, this._ctx)) {
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.oneofName = function () {
        var _localctx = new OneofNameContext(this._ctx, this.state);
        this.enterRule(_localctx, 46, ProtoParser.RULE_oneofName);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 281;
                this.ident();
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.map = function () {
        var _localctx = new MapContext(this._ctx, this.state);
        this.enterRule(_localctx, 48, ProtoParser.RULE_map);
        var _la;
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.mapKey = function () {
        var _localctx = new MapKeyContext(this._ctx, this.state);
        this.enterRule(_localctx, 50, ProtoParser.RULE_mapKey);
        var _la;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 297;
                _la = this._input.LA(1);
                if (!(((((_la - 26)) & ~0x1F) === 0 && ((1 << (_la - 26)) & ((1 << (ProtoParser.INT32 - 26)) | (1 << (ProtoParser.INT64 - 26)) | (1 << (ProtoParser.UINT32 - 26)) | (1 << (ProtoParser.UINT64 - 26)) | (1 << (ProtoParser.SINT32 - 26)) | (1 << (ProtoParser.SINT64 - 26)) | (1 << (ProtoParser.FIXED32 - 26)) | (1 << (ProtoParser.FIXED64 - 26)) | (1 << (ProtoParser.SFIXED32 - 26)) | (1 << (ProtoParser.SFIXED64 - 26)) | (1 << (ProtoParser.BOOL - 26)) | (1 << (ProtoParser.STRING - 26)))) !== 0))) {
                    this._errHandler.recoverInline(this);
                }
                else {
                    if (this._input.LA(1) === Utils.Token.EOF) {
                        this.matchedEOF = true;
                    }
                    this._errHandler.reportMatch(this);
                    this.consume();
                }
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.mapValue = function () {
        var _localctx = new MapValueContext(this._ctx, this.state);
        this.enterRule(_localctx, 52, ProtoParser.RULE_mapValue);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 299;
                this.typeReference();
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.tag = function () {
        var _localctx = new TagContext(this._ctx, this.state);
        this.enterRule(_localctx, 54, ProtoParser.RULE_tag);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 301;
                this.match(ProtoParser.INTEGER_VALUE);
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.groupBlock = function () {
        var _localctx = new GroupBlockContext(this._ctx, this.state);
        this.enterRule(_localctx, 56, ProtoParser.RULE_groupBlock);
        var _la;
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
                        switch (this.interpreter.adaptivePredict(this._input, 26, this._ctx)) {
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.groupName = function () {
        var _localctx = new GroupNameContext(this._ctx, this.state);
        this.enterRule(_localctx, 58, ProtoParser.RULE_groupName);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 327;
                this.ident();
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.extensions = function () {
        var _localctx = new ExtensionsContext(this._ctx, this.state);
        this.enterRule(_localctx, 60, ProtoParser.RULE_extensions);
        var _la;
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.range = function () {
        var _localctx = new RangeContext(this._ctx, this.state);
        this.enterRule(_localctx, 62, ProtoParser.RULE_range);
        var _la;
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
                                throw new Utils.NoViableAltException(this);
                        }
                    }
                }
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.rangeFrom = function () {
        var _localctx = new RangeFromContext(this._ctx, this.state);
        this.enterRule(_localctx, 64, ProtoParser.RULE_rangeFrom);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 348;
                this.match(ProtoParser.INTEGER_VALUE);
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.rangeTo = function () {
        var _localctx = new RangeToContext(this._ctx, this.state);
        this.enterRule(_localctx, 66, ProtoParser.RULE_rangeTo);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 350;
                this.match(ProtoParser.INTEGER_VALUE);
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.reservedFieldRanges = function () {
        var _localctx = new ReservedFieldRangesContext(this._ctx, this.state);
        this.enterRule(_localctx, 68, ProtoParser.RULE_reservedFieldRanges);
        var _la;
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.reservedFieldNames = function () {
        var _localctx = new ReservedFieldNamesContext(this._ctx, this.state);
        this.enterRule(_localctx, 70, ProtoParser.RULE_reservedFieldNames);
        var _la;
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.reservedFieldName = function () {
        var _localctx = new ReservedFieldNameContext(this._ctx, this.state);
        this.enterRule(_localctx, 72, ProtoParser.RULE_reservedFieldName);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 374;
                this.match(ProtoParser.STRING_VALUE);
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.field = function () {
        var _localctx = new FieldContext(this._ctx, this.state);
        this.enterRule(_localctx, 74, ProtoParser.RULE_field);
        var _la;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 377;
                this._errHandler.sync(this);
                switch (this.interpreter.adaptivePredict(this._input, 34, this._ctx)) {
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.fieldName = function () {
        var _localctx = new FieldNameContext(this._ctx, this.state);
        this.enterRule(_localctx, 76, ProtoParser.RULE_fieldName);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 388;
                this.ident();
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.fieldModifier = function () {
        var _localctx = new FieldModifierContext(this._ctx, this.state);
        this.enterRule(_localctx, 78, ProtoParser.RULE_fieldModifier);
        var _la;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 390;
                _la = this._input.LA(1);
                if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ProtoParser.OPTIONAL) | (1 << ProtoParser.REQUIRED) | (1 << ProtoParser.REPEATED))) !== 0))) {
                    this._errHandler.recoverInline(this);
                }
                else {
                    if (this._input.LA(1) === Utils.Token.EOF) {
                        this.matchedEOF = true;
                    }
                    this._errHandler.reportMatch(this);
                    this.consume();
                }
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.typeReference = function () {
        var _localctx = new TypeReferenceContext(this._ctx, this.state);
        this.enterRule(_localctx, 80, ProtoParser.RULE_typeReference);
        var _la;
        try {
            this.state = 418;
            this._errHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this._input, 38, this._ctx)) {
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.fieldOptions = function () {
        var _localctx = new FieldOptionsContext(this._ctx, this.state);
        this.enterRule(_localctx, 82, ProtoParser.RULE_fieldOptions);
        var _la;
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.option = function () {
        var _localctx = new OptionContext(this._ctx, this.state);
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.fieldRerefence = function () {
        var _localctx = new FieldRerefenceContext(this._ctx, this.state);
        this.enterRule(_localctx, 86, ProtoParser.RULE_fieldRerefence);
        var _la;
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
                                            throw new Utils.NoViableAltException(this);
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
                    throw new Utils.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.standardFieldRerefence = function () {
        var _localctx = new StandardFieldRerefenceContext(this._ctx, this.state);
        this.enterRule(_localctx, 88, ProtoParser.RULE_standardFieldRerefence);
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 456;
                this.ident();
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.customFieldReference = function () {
        var _localctx = new CustomFieldReferenceContext(this._ctx, this.state);
        this.enterRule(_localctx, 90, ProtoParser.RULE_customFieldReference);
        var _la;
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.optionValue = function () {
        var _localctx = new OptionValueContext(this._ctx, this.state);
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
                    throw new Utils.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.textFormat = function () {
        var _localctx = new TextFormatContext(this._ctx, this.state);
        this.enterRule(_localctx, 94, ProtoParser.RULE_textFormat);
        var _la;
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.textFormatOptionName = function () {
        var _localctx = new TextFormatOptionNameContext(this._ctx, this.state);
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
                    throw new Utils.NoViableAltException(this);
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.textFormatEntry = function () {
        var _localctx = new TextFormatEntryContext(this._ctx, this.state);
        this.enterRule(_localctx, 98, ProtoParser.RULE_textFormatEntry);
        try {
            this.state = 500;
            this._errHandler.sync(this);
            switch (this.interpreter.adaptivePredict(this._input, 49, this._ctx)) {
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.textFormatOptionValue = function () {
        var _localctx = new TextFormatOptionValueContext(this._ctx, this.state);
        this.enterRule(_localctx, 100, ProtoParser.RULE_textFormatOptionValue);
        var _la;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 502;
                _la = this._input.LA(1);
                if (!(_la === ProtoParser.BOOLEAN_VALUE || ((((_la - 57)) & ~0x1F) === 0 && ((1 << (_la - 57)) & ((1 << (ProtoParser.IDENT - 57)) | (1 << (ProtoParser.STRING_VALUE - 57)) | (1 << (ProtoParser.INTEGER_VALUE - 57)) | (1 << (ProtoParser.FLOAT_VALUE - 57)))) !== 0))) {
                    this._errHandler.recoverInline(this);
                }
                else {
                    if (this._input.LA(1) === Utils.Token.EOF) {
                        this.matchedEOF = true;
                    }
                    this._errHandler.reportMatch(this);
                    this.consume();
                }
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.fullIdent = function () {
        var _localctx = new FullIdentContext(this._ctx, this.state);
        this.enterRule(_localctx, 102, ProtoParser.RULE_fullIdent);
        var _la;
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
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    // @RuleVersion(0)
    ProtoParser.prototype.ident = function () {
        var _localctx = new IdentContext(this._ctx, this.state);
        this.enterRule(_localctx, 104, ProtoParser.RULE_ident);
        var _la;
        try {
            this.enterOuterAlt(_localctx, 1);
            {
                this.state = 512;
                _la = this._input.LA(1);
                if (!((((_la) & ~0x1F) === 0 && ((1 << _la) & ((1 << ProtoParser.PACKAGE) | (1 << ProtoParser.SYNTAX) | (1 << ProtoParser.IMPORT) | (1 << ProtoParser.PUBLIC) | (1 << ProtoParser.OPTION) | (1 << ProtoParser.MESSAGE) | (1 << ProtoParser.GROUP) | (1 << ProtoParser.OPTIONAL) | (1 << ProtoParser.REQUIRED) | (1 << ProtoParser.REPEATED) | (1 << ProtoParser.ONEOF) | (1 << ProtoParser.EXTEND) | (1 << ProtoParser.EXTENSIONS) | (1 << ProtoParser.TO) | (1 << ProtoParser.MAX) | (1 << ProtoParser.RESERVED) | (1 << ProtoParser.ENUM) | (1 << ProtoParser.SERVICE) | (1 << ProtoParser.RPC) | (1 << ProtoParser.RETURNS) | (1 << ProtoParser.STREAM) | (1 << ProtoParser.MAP) | (1 << ProtoParser.BOOLEAN_VALUE) | (1 << ProtoParser.DOUBLE) | (1 << ProtoParser.FLOAT) | (1 << ProtoParser.INT32) | (1 << ProtoParser.INT64) | (1 << ProtoParser.UINT32) | (1 << ProtoParser.UINT64) | (1 << ProtoParser.SINT32) | (1 << ProtoParser.SINT64))) !== 0) || ((((_la - 32)) & ~0x1F) === 0 && ((1 << (_la - 32)) & ((1 << (ProtoParser.FIXED32 - 32)) | (1 << (ProtoParser.FIXED64 - 32)) | (1 << (ProtoParser.SFIXED32 - 32)) | (1 << (ProtoParser.SFIXED64 - 32)) | (1 << (ProtoParser.BOOL - 32)) | (1 << (ProtoParser.STRING - 32)) | (1 << (ProtoParser.BYTES - 32)) | (1 << (ProtoParser.IDENT - 32)))) !== 0))) {
                    this._errHandler.recoverInline(this);
                }
                else {
                    if (this._input.LA(1) === Utils.Token.EOF) {
                        this.matchedEOF = true;
                    }
                    this._errHandler.reportMatch(this);
                    this.consume();
                }
            }
        }
        catch (re) {
            if (re instanceof Utils.RecognitionException) {
                _localctx.exception = re;
                this._errHandler.reportError(this, re);
                this._errHandler.recover(this, re);
            }
            else {
                throw re;
            }
        }
        finally {
            this.exitRule();
        }
        return _localctx;
    };
    Object.defineProperty(ProtoParser, "_ATN", {
        get: function () {
            if (!ProtoParser.__ATN) {
                ProtoParser.__ATN = new Utils.ATNDeserializer().deserialize(Utils.toCharArray(ProtoParser._serializedATN));
            }
            return ProtoParser.__ATN;
        },
        enumerable: false,
        configurable: true
    });
    ProtoParser.PACKAGE = 1;
    ProtoParser.SYNTAX = 2;
    ProtoParser.IMPORT = 3;
    ProtoParser.PUBLIC = 4;
    ProtoParser.OPTION = 5;
    ProtoParser.MESSAGE = 6;
    ProtoParser.GROUP = 7;
    ProtoParser.OPTIONAL = 8;
    ProtoParser.REQUIRED = 9;
    ProtoParser.REPEATED = 10;
    ProtoParser.ONEOF = 11;
    ProtoParser.EXTEND = 12;
    ProtoParser.EXTENSIONS = 13;
    ProtoParser.TO = 14;
    ProtoParser.MAX = 15;
    ProtoParser.RESERVED = 16;
    ProtoParser.ENUM = 17;
    ProtoParser.SERVICE = 18;
    ProtoParser.RPC = 19;
    ProtoParser.RETURNS = 20;
    ProtoParser.STREAM = 21;
    ProtoParser.MAP = 22;
    ProtoParser.BOOLEAN_VALUE = 23;
    ProtoParser.DOUBLE = 24;
    ProtoParser.FLOAT = 25;
    ProtoParser.INT32 = 26;
    ProtoParser.INT64 = 27;
    ProtoParser.UINT32 = 28;
    ProtoParser.UINT64 = 29;
    ProtoParser.SINT32 = 30;
    ProtoParser.SINT64 = 31;
    ProtoParser.FIXED32 = 32;
    ProtoParser.FIXED64 = 33;
    ProtoParser.SFIXED32 = 34;
    ProtoParser.SFIXED64 = 35;
    ProtoParser.BOOL = 36;
    ProtoParser.STRING = 37;
    ProtoParser.BYTES = 38;
    ProtoParser.COMMENT = 39;
    ProtoParser.LINE_COMMENT = 40;
    ProtoParser.PLUGIN_DEV_MARKER = 41;
    ProtoParser.NL = 42;
    ProtoParser.WS = 43;
    ProtoParser.LCURLY = 44;
    ProtoParser.RCURLY = 45;
    ProtoParser.LPAREN = 46;
    ProtoParser.RPAREN = 47;
    ProtoParser.LSQUARE = 48;
    ProtoParser.RSQUARE = 49;
    ProtoParser.LT = 50;
    ProtoParser.GT = 51;
    ProtoParser.COMMA = 52;
    ProtoParser.DOT = 53;
    ProtoParser.COLON = 54;
    ProtoParser.SEMICOLON = 55;
    ProtoParser.ASSIGN = 56;
    ProtoParser.IDENT = 57;
    ProtoParser.STRING_VALUE = 58;
    ProtoParser.INTEGER_VALUE = 59;
    ProtoParser.FLOAT_VALUE = 60;
    ProtoParser.ERRCHAR = 61;
    ProtoParser.RULE_proto = 0;
    ProtoParser.RULE_syntaxStatement = 1;
    ProtoParser.RULE_syntaxName = 2;
    ProtoParser.RULE_packageStatement = 3;
    ProtoParser.RULE_packageName = 4;
    ProtoParser.RULE_importStatement = 5;
    ProtoParser.RULE_fileReference = 6;
    ProtoParser.RULE_optionEntry = 7;
    ProtoParser.RULE_enumBlock = 8;
    ProtoParser.RULE_enumName = 9;
    ProtoParser.RULE_enumField = 10;
    ProtoParser.RULE_enumFieldName = 11;
    ProtoParser.RULE_enumFieldValue = 12;
    ProtoParser.RULE_extendBlock = 13;
    ProtoParser.RULE_extendBlockEntry = 14;
    ProtoParser.RULE_serviceBlock = 15;
    ProtoParser.RULE_serviceName = 16;
    ProtoParser.RULE_rpcMethod = 17;
    ProtoParser.RULE_rpcName = 18;
    ProtoParser.RULE_rpcType = 19;
    ProtoParser.RULE_messageBlock = 20;
    ProtoParser.RULE_messageName = 21;
    ProtoParser.RULE_oneof = 22;
    ProtoParser.RULE_oneofName = 23;
    ProtoParser.RULE_map = 24;
    ProtoParser.RULE_mapKey = 25;
    ProtoParser.RULE_mapValue = 26;
    ProtoParser.RULE_tag = 27;
    ProtoParser.RULE_groupBlock = 28;
    ProtoParser.RULE_groupName = 29;
    ProtoParser.RULE_extensions = 30;
    ProtoParser.RULE_range = 31;
    ProtoParser.RULE_rangeFrom = 32;
    ProtoParser.RULE_rangeTo = 33;
    ProtoParser.RULE_reservedFieldRanges = 34;
    ProtoParser.RULE_reservedFieldNames = 35;
    ProtoParser.RULE_reservedFieldName = 36;
    ProtoParser.RULE_field = 37;
    ProtoParser.RULE_fieldName = 38;
    ProtoParser.RULE_fieldModifier = 39;
    ProtoParser.RULE_typeReference = 40;
    ProtoParser.RULE_fieldOptions = 41;
    ProtoParser.RULE_option = 42;
    ProtoParser.RULE_fieldRerefence = 43;
    ProtoParser.RULE_standardFieldRerefence = 44;
    ProtoParser.RULE_customFieldReference = 45;
    ProtoParser.RULE_optionValue = 46;
    ProtoParser.RULE_textFormat = 47;
    ProtoParser.RULE_textFormatOptionName = 48;
    ProtoParser.RULE_textFormatEntry = 49;
    ProtoParser.RULE_textFormatOptionValue = 50;
    ProtoParser.RULE_fullIdent = 51;
    ProtoParser.RULE_ident = 52;
    // tslint:disable:no-trailing-whitespace
    ProtoParser.ruleNames = [
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
    ProtoParser._LITERAL_NAMES = [
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
    ProtoParser._SYMBOLIC_NAMES = [
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
    ProtoParser.VOCABULARY = new Utils.VocabularyImpl(ProtoParser._LITERAL_NAMES, ProtoParser._SYMBOLIC_NAMES, []);
    ProtoParser._serializedATN = "\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03?\u0205\x04\x02" +
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
    return ProtoParser;
}(Utils.Parser));
var ProtoContext = /** @class */ (function (_super) {
    __extends(ProtoContext, _super);
    function ProtoContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    ProtoContext.prototype.EOF = function () { return this.getToken(ProtoParser.EOF, 0); };
    ProtoContext.prototype.syntaxStatement = function () {
        return this.tryGetRuleContext(0, SyntaxStatementContext);
    };
    ProtoContext.prototype.packageStatement = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(PackageStatementContext);
        }
        else {
            return this.getRuleContext(i, PackageStatementContext);
        }
    };
    ProtoContext.prototype.importStatement = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(ImportStatementContext);
        }
        else {
            return this.getRuleContext(i, ImportStatementContext);
        }
    };
    ProtoContext.prototype.optionEntry = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(OptionEntryContext);
        }
        else {
            return this.getRuleContext(i, OptionEntryContext);
        }
    };
    ProtoContext.prototype.enumBlock = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(EnumBlockContext);
        }
        else {
            return this.getRuleContext(i, EnumBlockContext);
        }
    };
    ProtoContext.prototype.messageBlock = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(MessageBlockContext);
        }
        else {
            return this.getRuleContext(i, MessageBlockContext);
        }
    };
    ProtoContext.prototype.extendBlock = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(ExtendBlockContext);
        }
        else {
            return this.getRuleContext(i, ExtendBlockContext);
        }
    };
    ProtoContext.prototype.serviceBlock = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(ServiceBlockContext);
        }
        else {
            return this.getRuleContext(i, ServiceBlockContext);
        }
    };
    Object.defineProperty(ProtoContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_proto; },
        enumerable: false,
        configurable: true
    });
    // @Override
    ProtoContext.prototype.enterRule = function (listener) {
        if (listener.enterProto) {
            listener.enterProto(this);
        }
    };
    // @Override
    ProtoContext.prototype.exitRule = function (listener) {
        if (listener.exitProto) {
            listener.exitProto(this);
        }
    };
    // @Override
    ProtoContext.prototype.accept = function (visitor) {
        if (visitor.visitProto) {
            return visitor.visitProto(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return ProtoContext;
}(Utils.ParserRuleContext));
var SyntaxStatementContext = /** @class */ (function (_super) {
    __extends(SyntaxStatementContext, _super);
    function SyntaxStatementContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    SyntaxStatementContext.prototype.SYNTAX = function () { return this.getToken(ProtoParser.SYNTAX, 0); };
    SyntaxStatementContext.prototype.ASSIGN = function () { return this.getToken(ProtoParser.ASSIGN, 0); };
    SyntaxStatementContext.prototype.syntaxName = function () {
        return this.getRuleContext(0, SyntaxNameContext);
    };
    SyntaxStatementContext.prototype.SEMICOLON = function () { return this.getToken(ProtoParser.SEMICOLON, 0); };
    Object.defineProperty(SyntaxStatementContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_syntaxStatement; },
        enumerable: false,
        configurable: true
    });
    // @Override
    SyntaxStatementContext.prototype.enterRule = function (listener) {
        if (listener.enterSyntaxStatement) {
            listener.enterSyntaxStatement(this);
        }
    };
    // @Override
    SyntaxStatementContext.prototype.exitRule = function (listener) {
        if (listener.exitSyntaxStatement) {
            listener.exitSyntaxStatement(this);
        }
    };
    // @Override
    SyntaxStatementContext.prototype.accept = function (visitor) {
        if (visitor.visitSyntaxStatement) {
            return visitor.visitSyntaxStatement(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return SyntaxStatementContext;
}(Utils.ParserRuleContext));
var SyntaxNameContext = /** @class */ (function (_super) {
    __extends(SyntaxNameContext, _super);
    function SyntaxNameContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    SyntaxNameContext.prototype.STRING_VALUE = function () { return this.getToken(ProtoParser.STRING_VALUE, 0); };
    Object.defineProperty(SyntaxNameContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_syntaxName; },
        enumerable: false,
        configurable: true
    });
    // @Override
    SyntaxNameContext.prototype.enterRule = function (listener) {
        if (listener.enterSyntaxName) {
            listener.enterSyntaxName(this);
        }
    };
    // @Override
    SyntaxNameContext.prototype.exitRule = function (listener) {
        if (listener.exitSyntaxName) {
            listener.exitSyntaxName(this);
        }
    };
    // @Override
    SyntaxNameContext.prototype.accept = function (visitor) {
        if (visitor.visitSyntaxName) {
            return visitor.visitSyntaxName(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return SyntaxNameContext;
}(Utils.ParserRuleContext));
var PackageStatementContext = /** @class */ (function (_super) {
    __extends(PackageStatementContext, _super);
    function PackageStatementContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    PackageStatementContext.prototype.PACKAGE = function () { return this.getToken(ProtoParser.PACKAGE, 0); };
    PackageStatementContext.prototype.packageName = function () {
        return this.getRuleContext(0, PackageNameContext);
    };
    PackageStatementContext.prototype.SEMICOLON = function () { return this.getToken(ProtoParser.SEMICOLON, 0); };
    Object.defineProperty(PackageStatementContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_packageStatement; },
        enumerable: false,
        configurable: true
    });
    // @Override
    PackageStatementContext.prototype.enterRule = function (listener) {
        if (listener.enterPackageStatement) {
            listener.enterPackageStatement(this);
        }
    };
    // @Override
    PackageStatementContext.prototype.exitRule = function (listener) {
        if (listener.exitPackageStatement) {
            listener.exitPackageStatement(this);
        }
    };
    // @Override
    PackageStatementContext.prototype.accept = function (visitor) {
        if (visitor.visitPackageStatement) {
            return visitor.visitPackageStatement(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return PackageStatementContext;
}(Utils.ParserRuleContext));
var PackageNameContext = /** @class */ (function (_super) {
    __extends(PackageNameContext, _super);
    function PackageNameContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    PackageNameContext.prototype.fullIdent = function () {
        return this.getRuleContext(0, FullIdentContext);
    };
    Object.defineProperty(PackageNameContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_packageName; },
        enumerable: false,
        configurable: true
    });
    // @Override
    PackageNameContext.prototype.enterRule = function (listener) {
        if (listener.enterPackageName) {
            listener.enterPackageName(this);
        }
    };
    // @Override
    PackageNameContext.prototype.exitRule = function (listener) {
        if (listener.exitPackageName) {
            listener.exitPackageName(this);
        }
    };
    // @Override
    PackageNameContext.prototype.accept = function (visitor) {
        if (visitor.visitPackageName) {
            return visitor.visitPackageName(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return PackageNameContext;
}(Utils.ParserRuleContext));
var ImportStatementContext = /** @class */ (function (_super) {
    __extends(ImportStatementContext, _super);
    function ImportStatementContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    ImportStatementContext.prototype.IMPORT = function () { return this.getToken(ProtoParser.IMPORT, 0); };
    ImportStatementContext.prototype.fileReference = function () {
        return this.getRuleContext(0, FileReferenceContext);
    };
    ImportStatementContext.prototype.SEMICOLON = function () { return this.getToken(ProtoParser.SEMICOLON, 0); };
    ImportStatementContext.prototype.PUBLIC = function () { return this.tryGetToken(ProtoParser.PUBLIC, 0); };
    Object.defineProperty(ImportStatementContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_importStatement; },
        enumerable: false,
        configurable: true
    });
    // @Override
    ImportStatementContext.prototype.enterRule = function (listener) {
        if (listener.enterImportStatement) {
            listener.enterImportStatement(this);
        }
    };
    // @Override
    ImportStatementContext.prototype.exitRule = function (listener) {
        if (listener.exitImportStatement) {
            listener.exitImportStatement(this);
        }
    };
    // @Override
    ImportStatementContext.prototype.accept = function (visitor) {
        if (visitor.visitImportStatement) {
            return visitor.visitImportStatement(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return ImportStatementContext;
}(Utils.ParserRuleContext));
var FileReferenceContext = /** @class */ (function (_super) {
    __extends(FileReferenceContext, _super);
    function FileReferenceContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    FileReferenceContext.prototype.STRING_VALUE = function () { return this.getToken(ProtoParser.STRING_VALUE, 0); };
    Object.defineProperty(FileReferenceContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_fileReference; },
        enumerable: false,
        configurable: true
    });
    // @Override
    FileReferenceContext.prototype.enterRule = function (listener) {
        if (listener.enterFileReference) {
            listener.enterFileReference(this);
        }
    };
    // @Override
    FileReferenceContext.prototype.exitRule = function (listener) {
        if (listener.exitFileReference) {
            listener.exitFileReference(this);
        }
    };
    // @Override
    FileReferenceContext.prototype.accept = function (visitor) {
        if (visitor.visitFileReference) {
            return visitor.visitFileReference(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return FileReferenceContext;
}(Utils.ParserRuleContext));
var OptionEntryContext = /** @class */ (function (_super) {
    __extends(OptionEntryContext, _super);
    function OptionEntryContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    OptionEntryContext.prototype.OPTION = function () { return this.getToken(ProtoParser.OPTION, 0); };
    OptionEntryContext.prototype.option = function () {
        return this.getRuleContext(0, OptionContext);
    };
    OptionEntryContext.prototype.SEMICOLON = function () { return this.getToken(ProtoParser.SEMICOLON, 0); };
    Object.defineProperty(OptionEntryContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_optionEntry; },
        enumerable: false,
        configurable: true
    });
    // @Override
    OptionEntryContext.prototype.enterRule = function (listener) {
        if (listener.enterOptionEntry) {
            listener.enterOptionEntry(this);
        }
    };
    // @Override
    OptionEntryContext.prototype.exitRule = function (listener) {
        if (listener.exitOptionEntry) {
            listener.exitOptionEntry(this);
        }
    };
    // @Override
    OptionEntryContext.prototype.accept = function (visitor) {
        if (visitor.visitOptionEntry) {
            return visitor.visitOptionEntry(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return OptionEntryContext;
}(Utils.ParserRuleContext));
var EnumBlockContext = /** @class */ (function (_super) {
    __extends(EnumBlockContext, _super);
    function EnumBlockContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    EnumBlockContext.prototype.ENUM = function () { return this.getToken(ProtoParser.ENUM, 0); };
    EnumBlockContext.prototype.enumName = function () {
        return this.getRuleContext(0, EnumNameContext);
    };
    EnumBlockContext.prototype.LCURLY = function () { return this.getToken(ProtoParser.LCURLY, 0); };
    EnumBlockContext.prototype.RCURLY = function () { return this.getToken(ProtoParser.RCURLY, 0); };
    EnumBlockContext.prototype.enumField = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(EnumFieldContext);
        }
        else {
            return this.getRuleContext(i, EnumFieldContext);
        }
    };
    EnumBlockContext.prototype.optionEntry = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(OptionEntryContext);
        }
        else {
            return this.getRuleContext(i, OptionEntryContext);
        }
    };
    EnumBlockContext.prototype.reservedFieldRanges = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(ReservedFieldRangesContext);
        }
        else {
            return this.getRuleContext(i, ReservedFieldRangesContext);
        }
    };
    EnumBlockContext.prototype.reservedFieldNames = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(ReservedFieldNamesContext);
        }
        else {
            return this.getRuleContext(i, ReservedFieldNamesContext);
        }
    };
    EnumBlockContext.prototype.SEMICOLON = function () { return this.tryGetToken(ProtoParser.SEMICOLON, 0); };
    Object.defineProperty(EnumBlockContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_enumBlock; },
        enumerable: false,
        configurable: true
    });
    // @Override
    EnumBlockContext.prototype.enterRule = function (listener) {
        if (listener.enterEnumBlock) {
            listener.enterEnumBlock(this);
        }
    };
    // @Override
    EnumBlockContext.prototype.exitRule = function (listener) {
        if (listener.exitEnumBlock) {
            listener.exitEnumBlock(this);
        }
    };
    // @Override
    EnumBlockContext.prototype.accept = function (visitor) {
        if (visitor.visitEnumBlock) {
            return visitor.visitEnumBlock(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return EnumBlockContext;
}(Utils.ParserRuleContext));
var EnumNameContext = /** @class */ (function (_super) {
    __extends(EnumNameContext, _super);
    function EnumNameContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    EnumNameContext.prototype.ident = function () {
        return this.getRuleContext(0, IdentContext);
    };
    Object.defineProperty(EnumNameContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_enumName; },
        enumerable: false,
        configurable: true
    });
    // @Override
    EnumNameContext.prototype.enterRule = function (listener) {
        if (listener.enterEnumName) {
            listener.enterEnumName(this);
        }
    };
    // @Override
    EnumNameContext.prototype.exitRule = function (listener) {
        if (listener.exitEnumName) {
            listener.exitEnumName(this);
        }
    };
    // @Override
    EnumNameContext.prototype.accept = function (visitor) {
        if (visitor.visitEnumName) {
            return visitor.visitEnumName(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return EnumNameContext;
}(Utils.ParserRuleContext));
var EnumFieldContext = /** @class */ (function (_super) {
    __extends(EnumFieldContext, _super);
    function EnumFieldContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    EnumFieldContext.prototype.enumFieldName = function () {
        return this.getRuleContext(0, EnumFieldNameContext);
    };
    EnumFieldContext.prototype.ASSIGN = function () { return this.getToken(ProtoParser.ASSIGN, 0); };
    EnumFieldContext.prototype.enumFieldValue = function () {
        return this.getRuleContext(0, EnumFieldValueContext);
    };
    EnumFieldContext.prototype.SEMICOLON = function () { return this.getToken(ProtoParser.SEMICOLON, 0); };
    EnumFieldContext.prototype.fieldOptions = function () {
        return this.tryGetRuleContext(0, FieldOptionsContext);
    };
    Object.defineProperty(EnumFieldContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_enumField; },
        enumerable: false,
        configurable: true
    });
    // @Override
    EnumFieldContext.prototype.enterRule = function (listener) {
        if (listener.enterEnumField) {
            listener.enterEnumField(this);
        }
    };
    // @Override
    EnumFieldContext.prototype.exitRule = function (listener) {
        if (listener.exitEnumField) {
            listener.exitEnumField(this);
        }
    };
    // @Override
    EnumFieldContext.prototype.accept = function (visitor) {
        if (visitor.visitEnumField) {
            return visitor.visitEnumField(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return EnumFieldContext;
}(Utils.ParserRuleContext));
var EnumFieldNameContext = /** @class */ (function (_super) {
    __extends(EnumFieldNameContext, _super);
    function EnumFieldNameContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    EnumFieldNameContext.prototype.ident = function () {
        return this.getRuleContext(0, IdentContext);
    };
    Object.defineProperty(EnumFieldNameContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_enumFieldName; },
        enumerable: false,
        configurable: true
    });
    // @Override
    EnumFieldNameContext.prototype.enterRule = function (listener) {
        if (listener.enterEnumFieldName) {
            listener.enterEnumFieldName(this);
        }
    };
    // @Override
    EnumFieldNameContext.prototype.exitRule = function (listener) {
        if (listener.exitEnumFieldName) {
            listener.exitEnumFieldName(this);
        }
    };
    // @Override
    EnumFieldNameContext.prototype.accept = function (visitor) {
        if (visitor.visitEnumFieldName) {
            return visitor.visitEnumFieldName(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return EnumFieldNameContext;
}(Utils.ParserRuleContext));
var EnumFieldValueContext = /** @class */ (function (_super) {
    __extends(EnumFieldValueContext, _super);
    function EnumFieldValueContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    EnumFieldValueContext.prototype.INTEGER_VALUE = function () { return this.getToken(ProtoParser.INTEGER_VALUE, 0); };
    Object.defineProperty(EnumFieldValueContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_enumFieldValue; },
        enumerable: false,
        configurable: true
    });
    // @Override
    EnumFieldValueContext.prototype.enterRule = function (listener) {
        if (listener.enterEnumFieldValue) {
            listener.enterEnumFieldValue(this);
        }
    };
    // @Override
    EnumFieldValueContext.prototype.exitRule = function (listener) {
        if (listener.exitEnumFieldValue) {
            listener.exitEnumFieldValue(this);
        }
    };
    // @Override
    EnumFieldValueContext.prototype.accept = function (visitor) {
        if (visitor.visitEnumFieldValue) {
            return visitor.visitEnumFieldValue(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return EnumFieldValueContext;
}(Utils.ParserRuleContext));
var ExtendBlockContext = /** @class */ (function (_super) {
    __extends(ExtendBlockContext, _super);
    function ExtendBlockContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    ExtendBlockContext.prototype.EXTEND = function () { return this.getToken(ProtoParser.EXTEND, 0); };
    ExtendBlockContext.prototype.typeReference = function () {
        return this.getRuleContext(0, TypeReferenceContext);
    };
    ExtendBlockContext.prototype.LCURLY = function () { return this.getToken(ProtoParser.LCURLY, 0); };
    ExtendBlockContext.prototype.RCURLY = function () { return this.getToken(ProtoParser.RCURLY, 0); };
    ExtendBlockContext.prototype.extendBlockEntry = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(ExtendBlockEntryContext);
        }
        else {
            return this.getRuleContext(i, ExtendBlockEntryContext);
        }
    };
    ExtendBlockContext.prototype.SEMICOLON = function () { return this.tryGetToken(ProtoParser.SEMICOLON, 0); };
    Object.defineProperty(ExtendBlockContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_extendBlock; },
        enumerable: false,
        configurable: true
    });
    // @Override
    ExtendBlockContext.prototype.enterRule = function (listener) {
        if (listener.enterExtendBlock) {
            listener.enterExtendBlock(this);
        }
    };
    // @Override
    ExtendBlockContext.prototype.exitRule = function (listener) {
        if (listener.exitExtendBlock) {
            listener.exitExtendBlock(this);
        }
    };
    // @Override
    ExtendBlockContext.prototype.accept = function (visitor) {
        if (visitor.visitExtendBlock) {
            return visitor.visitExtendBlock(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return ExtendBlockContext;
}(Utils.ParserRuleContext));
var ExtendBlockEntryContext = /** @class */ (function (_super) {
    __extends(ExtendBlockEntryContext, _super);
    function ExtendBlockEntryContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    ExtendBlockEntryContext.prototype.field = function () {
        return this.tryGetRuleContext(0, FieldContext);
    };
    ExtendBlockEntryContext.prototype.groupBlock = function () {
        return this.tryGetRuleContext(0, GroupBlockContext);
    };
    Object.defineProperty(ExtendBlockEntryContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_extendBlockEntry; },
        enumerable: false,
        configurable: true
    });
    // @Override
    ExtendBlockEntryContext.prototype.enterRule = function (listener) {
        if (listener.enterExtendBlockEntry) {
            listener.enterExtendBlockEntry(this);
        }
    };
    // @Override
    ExtendBlockEntryContext.prototype.exitRule = function (listener) {
        if (listener.exitExtendBlockEntry) {
            listener.exitExtendBlockEntry(this);
        }
    };
    // @Override
    ExtendBlockEntryContext.prototype.accept = function (visitor) {
        if (visitor.visitExtendBlockEntry) {
            return visitor.visitExtendBlockEntry(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return ExtendBlockEntryContext;
}(Utils.ParserRuleContext));
var ServiceBlockContext = /** @class */ (function (_super) {
    __extends(ServiceBlockContext, _super);
    function ServiceBlockContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    ServiceBlockContext.prototype.SERVICE = function () { return this.getToken(ProtoParser.SERVICE, 0); };
    ServiceBlockContext.prototype.serviceName = function () {
        return this.getRuleContext(0, ServiceNameContext);
    };
    ServiceBlockContext.prototype.LCURLY = function () { return this.getToken(ProtoParser.LCURLY, 0); };
    ServiceBlockContext.prototype.RCURLY = function () { return this.getToken(ProtoParser.RCURLY, 0); };
    ServiceBlockContext.prototype.rpcMethod = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(RpcMethodContext);
        }
        else {
            return this.getRuleContext(i, RpcMethodContext);
        }
    };
    ServiceBlockContext.prototype.optionEntry = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(OptionEntryContext);
        }
        else {
            return this.getRuleContext(i, OptionEntryContext);
        }
    };
    ServiceBlockContext.prototype.SEMICOLON = function () { return this.tryGetToken(ProtoParser.SEMICOLON, 0); };
    Object.defineProperty(ServiceBlockContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_serviceBlock; },
        enumerable: false,
        configurable: true
    });
    // @Override
    ServiceBlockContext.prototype.enterRule = function (listener) {
        if (listener.enterServiceBlock) {
            listener.enterServiceBlock(this);
        }
    };
    // @Override
    ServiceBlockContext.prototype.exitRule = function (listener) {
        if (listener.exitServiceBlock) {
            listener.exitServiceBlock(this);
        }
    };
    // @Override
    ServiceBlockContext.prototype.accept = function (visitor) {
        if (visitor.visitServiceBlock) {
            return visitor.visitServiceBlock(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return ServiceBlockContext;
}(Utils.ParserRuleContext));
var ServiceNameContext = /** @class */ (function (_super) {
    __extends(ServiceNameContext, _super);
    function ServiceNameContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    ServiceNameContext.prototype.ident = function () {
        return this.getRuleContext(0, IdentContext);
    };
    Object.defineProperty(ServiceNameContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_serviceName; },
        enumerable: false,
        configurable: true
    });
    // @Override
    ServiceNameContext.prototype.enterRule = function (listener) {
        if (listener.enterServiceName) {
            listener.enterServiceName(this);
        }
    };
    // @Override
    ServiceNameContext.prototype.exitRule = function (listener) {
        if (listener.exitServiceName) {
            listener.exitServiceName(this);
        }
    };
    // @Override
    ServiceNameContext.prototype.accept = function (visitor) {
        if (visitor.visitServiceName) {
            return visitor.visitServiceName(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return ServiceNameContext;
}(Utils.ParserRuleContext));
var RpcMethodContext = /** @class */ (function (_super) {
    __extends(RpcMethodContext, _super);
    function RpcMethodContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    RpcMethodContext.prototype.RPC = function () { return this.getToken(ProtoParser.RPC, 0); };
    RpcMethodContext.prototype.rpcName = function () {
        return this.getRuleContext(0, RpcNameContext);
    };
    RpcMethodContext.prototype.LPAREN = function (i) {
        if (i === undefined) {
            return this.getTokens(ProtoParser.LPAREN);
        }
        else {
            return this.getToken(ProtoParser.LPAREN, i);
        }
    };
    RpcMethodContext.prototype.rpcType = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(RpcTypeContext);
        }
        else {
            return this.getRuleContext(i, RpcTypeContext);
        }
    };
    RpcMethodContext.prototype.RPAREN = function (i) {
        if (i === undefined) {
            return this.getTokens(ProtoParser.RPAREN);
        }
        else {
            return this.getToken(ProtoParser.RPAREN, i);
        }
    };
    RpcMethodContext.prototype.RETURNS = function () { return this.getToken(ProtoParser.RETURNS, 0); };
    RpcMethodContext.prototype.LCURLY = function () { return this.tryGetToken(ProtoParser.LCURLY, 0); };
    RpcMethodContext.prototype.RCURLY = function () { return this.tryGetToken(ProtoParser.RCURLY, 0); };
    RpcMethodContext.prototype.SEMICOLON = function () { return this.tryGetToken(ProtoParser.SEMICOLON, 0); };
    RpcMethodContext.prototype.optionEntry = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(OptionEntryContext);
        }
        else {
            return this.getRuleContext(i, OptionEntryContext);
        }
    };
    Object.defineProperty(RpcMethodContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_rpcMethod; },
        enumerable: false,
        configurable: true
    });
    // @Override
    RpcMethodContext.prototype.enterRule = function (listener) {
        if (listener.enterRpcMethod) {
            listener.enterRpcMethod(this);
        }
    };
    // @Override
    RpcMethodContext.prototype.exitRule = function (listener) {
        if (listener.exitRpcMethod) {
            listener.exitRpcMethod(this);
        }
    };
    // @Override
    RpcMethodContext.prototype.accept = function (visitor) {
        if (visitor.visitRpcMethod) {
            return visitor.visitRpcMethod(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return RpcMethodContext;
}(Utils.ParserRuleContext));
var RpcNameContext = /** @class */ (function (_super) {
    __extends(RpcNameContext, _super);
    function RpcNameContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    RpcNameContext.prototype.ident = function () {
        return this.getRuleContext(0, IdentContext);
    };
    Object.defineProperty(RpcNameContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_rpcName; },
        enumerable: false,
        configurable: true
    });
    // @Override
    RpcNameContext.prototype.enterRule = function (listener) {
        if (listener.enterRpcName) {
            listener.enterRpcName(this);
        }
    };
    // @Override
    RpcNameContext.prototype.exitRule = function (listener) {
        if (listener.exitRpcName) {
            listener.exitRpcName(this);
        }
    };
    // @Override
    RpcNameContext.prototype.accept = function (visitor) {
        if (visitor.visitRpcName) {
            return visitor.visitRpcName(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return RpcNameContext;
}(Utils.ParserRuleContext));
var RpcTypeContext = /** @class */ (function (_super) {
    __extends(RpcTypeContext, _super);
    function RpcTypeContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    RpcTypeContext.prototype.typeReference = function () {
        return this.getRuleContext(0, TypeReferenceContext);
    };
    RpcTypeContext.prototype.STREAM = function () { return this.tryGetToken(ProtoParser.STREAM, 0); };
    Object.defineProperty(RpcTypeContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_rpcType; },
        enumerable: false,
        configurable: true
    });
    // @Override
    RpcTypeContext.prototype.enterRule = function (listener) {
        if (listener.enterRpcType) {
            listener.enterRpcType(this);
        }
    };
    // @Override
    RpcTypeContext.prototype.exitRule = function (listener) {
        if (listener.exitRpcType) {
            listener.exitRpcType(this);
        }
    };
    // @Override
    RpcTypeContext.prototype.accept = function (visitor) {
        if (visitor.visitRpcType) {
            return visitor.visitRpcType(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return RpcTypeContext;
}(Utils.ParserRuleContext));
var MessageBlockContext = /** @class */ (function (_super) {
    __extends(MessageBlockContext, _super);
    function MessageBlockContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    MessageBlockContext.prototype.MESSAGE = function () { return this.getToken(ProtoParser.MESSAGE, 0); };
    MessageBlockContext.prototype.messageName = function () {
        return this.getRuleContext(0, MessageNameContext);
    };
    MessageBlockContext.prototype.LCURLY = function () { return this.getToken(ProtoParser.LCURLY, 0); };
    MessageBlockContext.prototype.RCURLY = function () { return this.getToken(ProtoParser.RCURLY, 0); };
    MessageBlockContext.prototype.field = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(FieldContext);
        }
        else {
            return this.getRuleContext(i, FieldContext);
        }
    };
    MessageBlockContext.prototype.optionEntry = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(OptionEntryContext);
        }
        else {
            return this.getRuleContext(i, OptionEntryContext);
        }
    };
    MessageBlockContext.prototype.messageBlock = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(MessageBlockContext);
        }
        else {
            return this.getRuleContext(i, MessageBlockContext);
        }
    };
    MessageBlockContext.prototype.enumBlock = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(EnumBlockContext);
        }
        else {
            return this.getRuleContext(i, EnumBlockContext);
        }
    };
    MessageBlockContext.prototype.extensions = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(ExtensionsContext);
        }
        else {
            return this.getRuleContext(i, ExtensionsContext);
        }
    };
    MessageBlockContext.prototype.extendBlock = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(ExtendBlockContext);
        }
        else {
            return this.getRuleContext(i, ExtendBlockContext);
        }
    };
    MessageBlockContext.prototype.groupBlock = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(GroupBlockContext);
        }
        else {
            return this.getRuleContext(i, GroupBlockContext);
        }
    };
    MessageBlockContext.prototype.oneof = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(OneofContext);
        }
        else {
            return this.getRuleContext(i, OneofContext);
        }
    };
    MessageBlockContext.prototype.map = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(MapContext);
        }
        else {
            return this.getRuleContext(i, MapContext);
        }
    };
    MessageBlockContext.prototype.reservedFieldRanges = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(ReservedFieldRangesContext);
        }
        else {
            return this.getRuleContext(i, ReservedFieldRangesContext);
        }
    };
    MessageBlockContext.prototype.reservedFieldNames = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(ReservedFieldNamesContext);
        }
        else {
            return this.getRuleContext(i, ReservedFieldNamesContext);
        }
    };
    MessageBlockContext.prototype.SEMICOLON = function () { return this.tryGetToken(ProtoParser.SEMICOLON, 0); };
    Object.defineProperty(MessageBlockContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_messageBlock; },
        enumerable: false,
        configurable: true
    });
    // @Override
    MessageBlockContext.prototype.enterRule = function (listener) {
        if (listener.enterMessageBlock) {
            listener.enterMessageBlock(this);
        }
    };
    // @Override
    MessageBlockContext.prototype.exitRule = function (listener) {
        if (listener.exitMessageBlock) {
            listener.exitMessageBlock(this);
        }
    };
    // @Override
    MessageBlockContext.prototype.accept = function (visitor) {
        if (visitor.visitMessageBlock) {
            return visitor.visitMessageBlock(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return MessageBlockContext;
}(Utils.ParserRuleContext));
var MessageNameContext = /** @class */ (function (_super) {
    __extends(MessageNameContext, _super);
    function MessageNameContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    MessageNameContext.prototype.ident = function () {
        return this.getRuleContext(0, IdentContext);
    };
    Object.defineProperty(MessageNameContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_messageName; },
        enumerable: false,
        configurable: true
    });
    // @Override
    MessageNameContext.prototype.enterRule = function (listener) {
        if (listener.enterMessageName) {
            listener.enterMessageName(this);
        }
    };
    // @Override
    MessageNameContext.prototype.exitRule = function (listener) {
        if (listener.exitMessageName) {
            listener.exitMessageName(this);
        }
    };
    // @Override
    MessageNameContext.prototype.accept = function (visitor) {
        if (visitor.visitMessageName) {
            return visitor.visitMessageName(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return MessageNameContext;
}(Utils.ParserRuleContext));
var OneofContext = /** @class */ (function (_super) {
    __extends(OneofContext, _super);
    function OneofContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    OneofContext.prototype.ONEOF = function () { return this.getToken(ProtoParser.ONEOF, 0); };
    OneofContext.prototype.oneofName = function () {
        return this.getRuleContext(0, OneofNameContext);
    };
    OneofContext.prototype.LCURLY = function () { return this.getToken(ProtoParser.LCURLY, 0); };
    OneofContext.prototype.RCURLY = function () { return this.getToken(ProtoParser.RCURLY, 0); };
    OneofContext.prototype.field = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(FieldContext);
        }
        else {
            return this.getRuleContext(i, FieldContext);
        }
    };
    OneofContext.prototype.groupBlock = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(GroupBlockContext);
        }
        else {
            return this.getRuleContext(i, GroupBlockContext);
        }
    };
    OneofContext.prototype.optionEntry = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(OptionEntryContext);
        }
        else {
            return this.getRuleContext(i, OptionEntryContext);
        }
    };
    OneofContext.prototype.SEMICOLON = function () { return this.tryGetToken(ProtoParser.SEMICOLON, 0); };
    Object.defineProperty(OneofContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_oneof; },
        enumerable: false,
        configurable: true
    });
    // @Override
    OneofContext.prototype.enterRule = function (listener) {
        if (listener.enterOneof) {
            listener.enterOneof(this);
        }
    };
    // @Override
    OneofContext.prototype.exitRule = function (listener) {
        if (listener.exitOneof) {
            listener.exitOneof(this);
        }
    };
    // @Override
    OneofContext.prototype.accept = function (visitor) {
        if (visitor.visitOneof) {
            return visitor.visitOneof(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return OneofContext;
}(Utils.ParserRuleContext));
var OneofNameContext = /** @class */ (function (_super) {
    __extends(OneofNameContext, _super);
    function OneofNameContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    OneofNameContext.prototype.ident = function () {
        return this.getRuleContext(0, IdentContext);
    };
    Object.defineProperty(OneofNameContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_oneofName; },
        enumerable: false,
        configurable: true
    });
    // @Override
    OneofNameContext.prototype.enterRule = function (listener) {
        if (listener.enterOneofName) {
            listener.enterOneofName(this);
        }
    };
    // @Override
    OneofNameContext.prototype.exitRule = function (listener) {
        if (listener.exitOneofName) {
            listener.exitOneofName(this);
        }
    };
    // @Override
    OneofNameContext.prototype.accept = function (visitor) {
        if (visitor.visitOneofName) {
            return visitor.visitOneofName(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return OneofNameContext;
}(Utils.ParserRuleContext));
var MapContext = /** @class */ (function (_super) {
    __extends(MapContext, _super);
    function MapContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    MapContext.prototype.MAP = function () { return this.getToken(ProtoParser.MAP, 0); };
    MapContext.prototype.LT = function () { return this.getToken(ProtoParser.LT, 0); };
    MapContext.prototype.mapKey = function () {
        return this.getRuleContext(0, MapKeyContext);
    };
    MapContext.prototype.COMMA = function () { return this.getToken(ProtoParser.COMMA, 0); };
    MapContext.prototype.mapValue = function () {
        return this.getRuleContext(0, MapValueContext);
    };
    MapContext.prototype.GT = function () { return this.getToken(ProtoParser.GT, 0); };
    MapContext.prototype.fieldName = function () {
        return this.getRuleContext(0, FieldNameContext);
    };
    MapContext.prototype.ASSIGN = function () { return this.getToken(ProtoParser.ASSIGN, 0); };
    MapContext.prototype.tag = function () {
        return this.getRuleContext(0, TagContext);
    };
    MapContext.prototype.SEMICOLON = function () { return this.getToken(ProtoParser.SEMICOLON, 0); };
    MapContext.prototype.fieldOptions = function () {
        return this.tryGetRuleContext(0, FieldOptionsContext);
    };
    Object.defineProperty(MapContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_map; },
        enumerable: false,
        configurable: true
    });
    // @Override
    MapContext.prototype.enterRule = function (listener) {
        if (listener.enterMap) {
            listener.enterMap(this);
        }
    };
    // @Override
    MapContext.prototype.exitRule = function (listener) {
        if (listener.exitMap) {
            listener.exitMap(this);
        }
    };
    // @Override
    MapContext.prototype.accept = function (visitor) {
        if (visitor.visitMap) {
            return visitor.visitMap(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return MapContext;
}(Utils.ParserRuleContext));
var MapKeyContext = /** @class */ (function (_super) {
    __extends(MapKeyContext, _super);
    function MapKeyContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    MapKeyContext.prototype.INT32 = function () { return this.tryGetToken(ProtoParser.INT32, 0); };
    MapKeyContext.prototype.INT64 = function () { return this.tryGetToken(ProtoParser.INT64, 0); };
    MapKeyContext.prototype.UINT32 = function () { return this.tryGetToken(ProtoParser.UINT32, 0); };
    MapKeyContext.prototype.UINT64 = function () { return this.tryGetToken(ProtoParser.UINT64, 0); };
    MapKeyContext.prototype.SINT32 = function () { return this.tryGetToken(ProtoParser.SINT32, 0); };
    MapKeyContext.prototype.SINT64 = function () { return this.tryGetToken(ProtoParser.SINT64, 0); };
    MapKeyContext.prototype.FIXED32 = function () { return this.tryGetToken(ProtoParser.FIXED32, 0); };
    MapKeyContext.prototype.FIXED64 = function () { return this.tryGetToken(ProtoParser.FIXED64, 0); };
    MapKeyContext.prototype.SFIXED32 = function () { return this.tryGetToken(ProtoParser.SFIXED32, 0); };
    MapKeyContext.prototype.SFIXED64 = function () { return this.tryGetToken(ProtoParser.SFIXED64, 0); };
    MapKeyContext.prototype.BOOL = function () { return this.tryGetToken(ProtoParser.BOOL, 0); };
    MapKeyContext.prototype.STRING = function () { return this.tryGetToken(ProtoParser.STRING, 0); };
    Object.defineProperty(MapKeyContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_mapKey; },
        enumerable: false,
        configurable: true
    });
    // @Override
    MapKeyContext.prototype.enterRule = function (listener) {
        if (listener.enterMapKey) {
            listener.enterMapKey(this);
        }
    };
    // @Override
    MapKeyContext.prototype.exitRule = function (listener) {
        if (listener.exitMapKey) {
            listener.exitMapKey(this);
        }
    };
    // @Override
    MapKeyContext.prototype.accept = function (visitor) {
        if (visitor.visitMapKey) {
            return visitor.visitMapKey(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return MapKeyContext;
}(Utils.ParserRuleContext));
var MapValueContext = /** @class */ (function (_super) {
    __extends(MapValueContext, _super);
    function MapValueContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    MapValueContext.prototype.typeReference = function () {
        return this.getRuleContext(0, TypeReferenceContext);
    };
    Object.defineProperty(MapValueContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_mapValue; },
        enumerable: false,
        configurable: true
    });
    // @Override
    MapValueContext.prototype.enterRule = function (listener) {
        if (listener.enterMapValue) {
            listener.enterMapValue(this);
        }
    };
    // @Override
    MapValueContext.prototype.exitRule = function (listener) {
        if (listener.exitMapValue) {
            listener.exitMapValue(this);
        }
    };
    // @Override
    MapValueContext.prototype.accept = function (visitor) {
        if (visitor.visitMapValue) {
            return visitor.visitMapValue(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return MapValueContext;
}(Utils.ParserRuleContext));
var TagContext = /** @class */ (function (_super) {
    __extends(TagContext, _super);
    function TagContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    TagContext.prototype.INTEGER_VALUE = function () { return this.getToken(ProtoParser.INTEGER_VALUE, 0); };
    Object.defineProperty(TagContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_tag; },
        enumerable: false,
        configurable: true
    });
    // @Override
    TagContext.prototype.enterRule = function (listener) {
        if (listener.enterTag) {
            listener.enterTag(this);
        }
    };
    // @Override
    TagContext.prototype.exitRule = function (listener) {
        if (listener.exitTag) {
            listener.exitTag(this);
        }
    };
    // @Override
    TagContext.prototype.accept = function (visitor) {
        if (visitor.visitTag) {
            return visitor.visitTag(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return TagContext;
}(Utils.ParserRuleContext));
var GroupBlockContext = /** @class */ (function (_super) {
    __extends(GroupBlockContext, _super);
    function GroupBlockContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    GroupBlockContext.prototype.GROUP = function () { return this.getToken(ProtoParser.GROUP, 0); };
    GroupBlockContext.prototype.groupName = function () {
        return this.getRuleContext(0, GroupNameContext);
    };
    GroupBlockContext.prototype.ASSIGN = function () { return this.getToken(ProtoParser.ASSIGN, 0); };
    GroupBlockContext.prototype.tag = function () {
        return this.getRuleContext(0, TagContext);
    };
    GroupBlockContext.prototype.LCURLY = function () { return this.getToken(ProtoParser.LCURLY, 0); };
    GroupBlockContext.prototype.RCURLY = function () { return this.getToken(ProtoParser.RCURLY, 0); };
    GroupBlockContext.prototype.fieldModifier = function () {
        return this.tryGetRuleContext(0, FieldModifierContext);
    };
    GroupBlockContext.prototype.field = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(FieldContext);
        }
        else {
            return this.getRuleContext(i, FieldContext);
        }
    };
    GroupBlockContext.prototype.optionEntry = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(OptionEntryContext);
        }
        else {
            return this.getRuleContext(i, OptionEntryContext);
        }
    };
    GroupBlockContext.prototype.messageBlock = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(MessageBlockContext);
        }
        else {
            return this.getRuleContext(i, MessageBlockContext);
        }
    };
    GroupBlockContext.prototype.enumBlock = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(EnumBlockContext);
        }
        else {
            return this.getRuleContext(i, EnumBlockContext);
        }
    };
    GroupBlockContext.prototype.extensions = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(ExtensionsContext);
        }
        else {
            return this.getRuleContext(i, ExtensionsContext);
        }
    };
    GroupBlockContext.prototype.extendBlock = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(ExtendBlockContext);
        }
        else {
            return this.getRuleContext(i, ExtendBlockContext);
        }
    };
    GroupBlockContext.prototype.groupBlock = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(GroupBlockContext);
        }
        else {
            return this.getRuleContext(i, GroupBlockContext);
        }
    };
    GroupBlockContext.prototype.SEMICOLON = function () { return this.tryGetToken(ProtoParser.SEMICOLON, 0); };
    Object.defineProperty(GroupBlockContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_groupBlock; },
        enumerable: false,
        configurable: true
    });
    // @Override
    GroupBlockContext.prototype.enterRule = function (listener) {
        if (listener.enterGroupBlock) {
            listener.enterGroupBlock(this);
        }
    };
    // @Override
    GroupBlockContext.prototype.exitRule = function (listener) {
        if (listener.exitGroupBlock) {
            listener.exitGroupBlock(this);
        }
    };
    // @Override
    GroupBlockContext.prototype.accept = function (visitor) {
        if (visitor.visitGroupBlock) {
            return visitor.visitGroupBlock(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return GroupBlockContext;
}(Utils.ParserRuleContext));
var GroupNameContext = /** @class */ (function (_super) {
    __extends(GroupNameContext, _super);
    function GroupNameContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    GroupNameContext.prototype.ident = function () {
        return this.getRuleContext(0, IdentContext);
    };
    Object.defineProperty(GroupNameContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_groupName; },
        enumerable: false,
        configurable: true
    });
    // @Override
    GroupNameContext.prototype.enterRule = function (listener) {
        if (listener.enterGroupName) {
            listener.enterGroupName(this);
        }
    };
    // @Override
    GroupNameContext.prototype.exitRule = function (listener) {
        if (listener.exitGroupName) {
            listener.exitGroupName(this);
        }
    };
    // @Override
    GroupNameContext.prototype.accept = function (visitor) {
        if (visitor.visitGroupName) {
            return visitor.visitGroupName(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return GroupNameContext;
}(Utils.ParserRuleContext));
var ExtensionsContext = /** @class */ (function (_super) {
    __extends(ExtensionsContext, _super);
    function ExtensionsContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    ExtensionsContext.prototype.EXTENSIONS = function () { return this.getToken(ProtoParser.EXTENSIONS, 0); };
    ExtensionsContext.prototype.range = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(RangeContext);
        }
        else {
            return this.getRuleContext(i, RangeContext);
        }
    };
    ExtensionsContext.prototype.SEMICOLON = function () { return this.getToken(ProtoParser.SEMICOLON, 0); };
    ExtensionsContext.prototype.COMMA = function (i) {
        if (i === undefined) {
            return this.getTokens(ProtoParser.COMMA);
        }
        else {
            return this.getToken(ProtoParser.COMMA, i);
        }
    };
    Object.defineProperty(ExtensionsContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_extensions; },
        enumerable: false,
        configurable: true
    });
    // @Override
    ExtensionsContext.prototype.enterRule = function (listener) {
        if (listener.enterExtensions) {
            listener.enterExtensions(this);
        }
    };
    // @Override
    ExtensionsContext.prototype.exitRule = function (listener) {
        if (listener.exitExtensions) {
            listener.exitExtensions(this);
        }
    };
    // @Override
    ExtensionsContext.prototype.accept = function (visitor) {
        if (visitor.visitExtensions) {
            return visitor.visitExtensions(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return ExtensionsContext;
}(Utils.ParserRuleContext));
var RangeContext = /** @class */ (function (_super) {
    __extends(RangeContext, _super);
    function RangeContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    RangeContext.prototype.rangeFrom = function () {
        return this.getRuleContext(0, RangeFromContext);
    };
    RangeContext.prototype.TO = function () { return this.tryGetToken(ProtoParser.TO, 0); };
    RangeContext.prototype.rangeTo = function () {
        return this.tryGetRuleContext(0, RangeToContext);
    };
    RangeContext.prototype.MAX = function () { return this.tryGetToken(ProtoParser.MAX, 0); };
    Object.defineProperty(RangeContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_range; },
        enumerable: false,
        configurable: true
    });
    // @Override
    RangeContext.prototype.enterRule = function (listener) {
        if (listener.enterRange) {
            listener.enterRange(this);
        }
    };
    // @Override
    RangeContext.prototype.exitRule = function (listener) {
        if (listener.exitRange) {
            listener.exitRange(this);
        }
    };
    // @Override
    RangeContext.prototype.accept = function (visitor) {
        if (visitor.visitRange) {
            return visitor.visitRange(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return RangeContext;
}(Utils.ParserRuleContext));
var RangeFromContext = /** @class */ (function (_super) {
    __extends(RangeFromContext, _super);
    function RangeFromContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    RangeFromContext.prototype.INTEGER_VALUE = function () { return this.getToken(ProtoParser.INTEGER_VALUE, 0); };
    Object.defineProperty(RangeFromContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_rangeFrom; },
        enumerable: false,
        configurable: true
    });
    // @Override
    RangeFromContext.prototype.enterRule = function (listener) {
        if (listener.enterRangeFrom) {
            listener.enterRangeFrom(this);
        }
    };
    // @Override
    RangeFromContext.prototype.exitRule = function (listener) {
        if (listener.exitRangeFrom) {
            listener.exitRangeFrom(this);
        }
    };
    // @Override
    RangeFromContext.prototype.accept = function (visitor) {
        if (visitor.visitRangeFrom) {
            return visitor.visitRangeFrom(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return RangeFromContext;
}(Utils.ParserRuleContext));
var RangeToContext = /** @class */ (function (_super) {
    __extends(RangeToContext, _super);
    function RangeToContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    RangeToContext.prototype.INTEGER_VALUE = function () { return this.getToken(ProtoParser.INTEGER_VALUE, 0); };
    Object.defineProperty(RangeToContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_rangeTo; },
        enumerable: false,
        configurable: true
    });
    // @Override
    RangeToContext.prototype.enterRule = function (listener) {
        if (listener.enterRangeTo) {
            listener.enterRangeTo(this);
        }
    };
    // @Override
    RangeToContext.prototype.exitRule = function (listener) {
        if (listener.exitRangeTo) {
            listener.exitRangeTo(this);
        }
    };
    // @Override
    RangeToContext.prototype.accept = function (visitor) {
        if (visitor.visitRangeTo) {
            return visitor.visitRangeTo(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return RangeToContext;
}(Utils.ParserRuleContext));
var ReservedFieldRangesContext = /** @class */ (function (_super) {
    __extends(ReservedFieldRangesContext, _super);
    function ReservedFieldRangesContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    ReservedFieldRangesContext.prototype.RESERVED = function () { return this.getToken(ProtoParser.RESERVED, 0); };
    ReservedFieldRangesContext.prototype.range = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(RangeContext);
        }
        else {
            return this.getRuleContext(i, RangeContext);
        }
    };
    ReservedFieldRangesContext.prototype.SEMICOLON = function () { return this.getToken(ProtoParser.SEMICOLON, 0); };
    ReservedFieldRangesContext.prototype.COMMA = function (i) {
        if (i === undefined) {
            return this.getTokens(ProtoParser.COMMA);
        }
        else {
            return this.getToken(ProtoParser.COMMA, i);
        }
    };
    Object.defineProperty(ReservedFieldRangesContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_reservedFieldRanges; },
        enumerable: false,
        configurable: true
    });
    // @Override
    ReservedFieldRangesContext.prototype.enterRule = function (listener) {
        if (listener.enterReservedFieldRanges) {
            listener.enterReservedFieldRanges(this);
        }
    };
    // @Override
    ReservedFieldRangesContext.prototype.exitRule = function (listener) {
        if (listener.exitReservedFieldRanges) {
            listener.exitReservedFieldRanges(this);
        }
    };
    // @Override
    ReservedFieldRangesContext.prototype.accept = function (visitor) {
        if (visitor.visitReservedFieldRanges) {
            return visitor.visitReservedFieldRanges(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return ReservedFieldRangesContext;
}(Utils.ParserRuleContext));
var ReservedFieldNamesContext = /** @class */ (function (_super) {
    __extends(ReservedFieldNamesContext, _super);
    function ReservedFieldNamesContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    ReservedFieldNamesContext.prototype.RESERVED = function () { return this.getToken(ProtoParser.RESERVED, 0); };
    ReservedFieldNamesContext.prototype.reservedFieldName = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(ReservedFieldNameContext);
        }
        else {
            return this.getRuleContext(i, ReservedFieldNameContext);
        }
    };
    ReservedFieldNamesContext.prototype.SEMICOLON = function () { return this.getToken(ProtoParser.SEMICOLON, 0); };
    ReservedFieldNamesContext.prototype.COMMA = function (i) {
        if (i === undefined) {
            return this.getTokens(ProtoParser.COMMA);
        }
        else {
            return this.getToken(ProtoParser.COMMA, i);
        }
    };
    Object.defineProperty(ReservedFieldNamesContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_reservedFieldNames; },
        enumerable: false,
        configurable: true
    });
    // @Override
    ReservedFieldNamesContext.prototype.enterRule = function (listener) {
        if (listener.enterReservedFieldNames) {
            listener.enterReservedFieldNames(this);
        }
    };
    // @Override
    ReservedFieldNamesContext.prototype.exitRule = function (listener) {
        if (listener.exitReservedFieldNames) {
            listener.exitReservedFieldNames(this);
        }
    };
    // @Override
    ReservedFieldNamesContext.prototype.accept = function (visitor) {
        if (visitor.visitReservedFieldNames) {
            return visitor.visitReservedFieldNames(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return ReservedFieldNamesContext;
}(Utils.ParserRuleContext));
var ReservedFieldNameContext = /** @class */ (function (_super) {
    __extends(ReservedFieldNameContext, _super);
    function ReservedFieldNameContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    ReservedFieldNameContext.prototype.STRING_VALUE = function () { return this.getToken(ProtoParser.STRING_VALUE, 0); };
    Object.defineProperty(ReservedFieldNameContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_reservedFieldName; },
        enumerable: false,
        configurable: true
    });
    // @Override
    ReservedFieldNameContext.prototype.enterRule = function (listener) {
        if (listener.enterReservedFieldName) {
            listener.enterReservedFieldName(this);
        }
    };
    // @Override
    ReservedFieldNameContext.prototype.exitRule = function (listener) {
        if (listener.exitReservedFieldName) {
            listener.exitReservedFieldName(this);
        }
    };
    // @Override
    ReservedFieldNameContext.prototype.accept = function (visitor) {
        if (visitor.visitReservedFieldName) {
            return visitor.visitReservedFieldName(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return ReservedFieldNameContext;
}(Utils.ParserRuleContext));
var FieldContext = /** @class */ (function (_super) {
    __extends(FieldContext, _super);
    function FieldContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    FieldContext.prototype.typeReference = function () {
        return this.getRuleContext(0, TypeReferenceContext);
    };
    FieldContext.prototype.fieldName = function () {
        return this.getRuleContext(0, FieldNameContext);
    };
    FieldContext.prototype.ASSIGN = function () { return this.getToken(ProtoParser.ASSIGN, 0); };
    FieldContext.prototype.tag = function () {
        return this.getRuleContext(0, TagContext);
    };
    FieldContext.prototype.SEMICOLON = function () { return this.getToken(ProtoParser.SEMICOLON, 0); };
    FieldContext.prototype.fieldModifier = function () {
        return this.tryGetRuleContext(0, FieldModifierContext);
    };
    FieldContext.prototype.fieldOptions = function () {
        return this.tryGetRuleContext(0, FieldOptionsContext);
    };
    Object.defineProperty(FieldContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_field; },
        enumerable: false,
        configurable: true
    });
    // @Override
    FieldContext.prototype.enterRule = function (listener) {
        if (listener.enterField) {
            listener.enterField(this);
        }
    };
    // @Override
    FieldContext.prototype.exitRule = function (listener) {
        if (listener.exitField) {
            listener.exitField(this);
        }
    };
    // @Override
    FieldContext.prototype.accept = function (visitor) {
        if (visitor.visitField) {
            return visitor.visitField(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return FieldContext;
}(Utils.ParserRuleContext));
var FieldNameContext = /** @class */ (function (_super) {
    __extends(FieldNameContext, _super);
    function FieldNameContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    FieldNameContext.prototype.ident = function () {
        return this.getRuleContext(0, IdentContext);
    };
    Object.defineProperty(FieldNameContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_fieldName; },
        enumerable: false,
        configurable: true
    });
    // @Override
    FieldNameContext.prototype.enterRule = function (listener) {
        if (listener.enterFieldName) {
            listener.enterFieldName(this);
        }
    };
    // @Override
    FieldNameContext.prototype.exitRule = function (listener) {
        if (listener.exitFieldName) {
            listener.exitFieldName(this);
        }
    };
    // @Override
    FieldNameContext.prototype.accept = function (visitor) {
        if (visitor.visitFieldName) {
            return visitor.visitFieldName(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return FieldNameContext;
}(Utils.ParserRuleContext));
var FieldModifierContext = /** @class */ (function (_super) {
    __extends(FieldModifierContext, _super);
    function FieldModifierContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    FieldModifierContext.prototype.OPTIONAL = function () { return this.tryGetToken(ProtoParser.OPTIONAL, 0); };
    FieldModifierContext.prototype.REQUIRED = function () { return this.tryGetToken(ProtoParser.REQUIRED, 0); };
    FieldModifierContext.prototype.REPEATED = function () { return this.tryGetToken(ProtoParser.REPEATED, 0); };
    Object.defineProperty(FieldModifierContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_fieldModifier; },
        enumerable: false,
        configurable: true
    });
    // @Override
    FieldModifierContext.prototype.enterRule = function (listener) {
        if (listener.enterFieldModifier) {
            listener.enterFieldModifier(this);
        }
    };
    // @Override
    FieldModifierContext.prototype.exitRule = function (listener) {
        if (listener.exitFieldModifier) {
            listener.exitFieldModifier(this);
        }
    };
    // @Override
    FieldModifierContext.prototype.accept = function (visitor) {
        if (visitor.visitFieldModifier) {
            return visitor.visitFieldModifier(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return FieldModifierContext;
}(Utils.ParserRuleContext));
var TypeReferenceContext = /** @class */ (function (_super) {
    __extends(TypeReferenceContext, _super);
    function TypeReferenceContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    TypeReferenceContext.prototype.DOUBLE = function () { return this.tryGetToken(ProtoParser.DOUBLE, 0); };
    TypeReferenceContext.prototype.FLOAT = function () { return this.tryGetToken(ProtoParser.FLOAT, 0); };
    TypeReferenceContext.prototype.INT32 = function () { return this.tryGetToken(ProtoParser.INT32, 0); };
    TypeReferenceContext.prototype.INT64 = function () { return this.tryGetToken(ProtoParser.INT64, 0); };
    TypeReferenceContext.prototype.UINT32 = function () { return this.tryGetToken(ProtoParser.UINT32, 0); };
    TypeReferenceContext.prototype.UINT64 = function () { return this.tryGetToken(ProtoParser.UINT64, 0); };
    TypeReferenceContext.prototype.SINT32 = function () { return this.tryGetToken(ProtoParser.SINT32, 0); };
    TypeReferenceContext.prototype.SINT64 = function () { return this.tryGetToken(ProtoParser.SINT64, 0); };
    TypeReferenceContext.prototype.FIXED32 = function () { return this.tryGetToken(ProtoParser.FIXED32, 0); };
    TypeReferenceContext.prototype.FIXED64 = function () { return this.tryGetToken(ProtoParser.FIXED64, 0); };
    TypeReferenceContext.prototype.SFIXED32 = function () { return this.tryGetToken(ProtoParser.SFIXED32, 0); };
    TypeReferenceContext.prototype.SFIXED64 = function () { return this.tryGetToken(ProtoParser.SFIXED64, 0); };
    TypeReferenceContext.prototype.BOOL = function () { return this.tryGetToken(ProtoParser.BOOL, 0); };
    TypeReferenceContext.prototype.STRING = function () { return this.tryGetToken(ProtoParser.STRING, 0); };
    TypeReferenceContext.prototype.BYTES = function () { return this.tryGetToken(ProtoParser.BYTES, 0); };
    TypeReferenceContext.prototype.ident = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(IdentContext);
        }
        else {
            return this.getRuleContext(i, IdentContext);
        }
    };
    TypeReferenceContext.prototype.DOT = function (i) {
        if (i === undefined) {
            return this.getTokens(ProtoParser.DOT);
        }
        else {
            return this.getToken(ProtoParser.DOT, i);
        }
    };
    Object.defineProperty(TypeReferenceContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_typeReference; },
        enumerable: false,
        configurable: true
    });
    // @Override
    TypeReferenceContext.prototype.enterRule = function (listener) {
        if (listener.enterTypeReference) {
            listener.enterTypeReference(this);
        }
    };
    // @Override
    TypeReferenceContext.prototype.exitRule = function (listener) {
        if (listener.exitTypeReference) {
            listener.exitTypeReference(this);
        }
    };
    // @Override
    TypeReferenceContext.prototype.accept = function (visitor) {
        if (visitor.visitTypeReference) {
            return visitor.visitTypeReference(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return TypeReferenceContext;
}(Utils.ParserRuleContext));
var FieldOptionsContext = /** @class */ (function (_super) {
    __extends(FieldOptionsContext, _super);
    function FieldOptionsContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    FieldOptionsContext.prototype.LSQUARE = function () { return this.getToken(ProtoParser.LSQUARE, 0); };
    FieldOptionsContext.prototype.RSQUARE = function () { return this.getToken(ProtoParser.RSQUARE, 0); };
    FieldOptionsContext.prototype.option = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(OptionContext);
        }
        else {
            return this.getRuleContext(i, OptionContext);
        }
    };
    FieldOptionsContext.prototype.COMMA = function (i) {
        if (i === undefined) {
            return this.getTokens(ProtoParser.COMMA);
        }
        else {
            return this.getToken(ProtoParser.COMMA, i);
        }
    };
    Object.defineProperty(FieldOptionsContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_fieldOptions; },
        enumerable: false,
        configurable: true
    });
    // @Override
    FieldOptionsContext.prototype.enterRule = function (listener) {
        if (listener.enterFieldOptions) {
            listener.enterFieldOptions(this);
        }
    };
    // @Override
    FieldOptionsContext.prototype.exitRule = function (listener) {
        if (listener.exitFieldOptions) {
            listener.exitFieldOptions(this);
        }
    };
    // @Override
    FieldOptionsContext.prototype.accept = function (visitor) {
        if (visitor.visitFieldOptions) {
            return visitor.visitFieldOptions(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return FieldOptionsContext;
}(Utils.ParserRuleContext));
var OptionContext = /** @class */ (function (_super) {
    __extends(OptionContext, _super);
    function OptionContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    OptionContext.prototype.fieldRerefence = function () {
        return this.getRuleContext(0, FieldRerefenceContext);
    };
    OptionContext.prototype.ASSIGN = function () { return this.getToken(ProtoParser.ASSIGN, 0); };
    OptionContext.prototype.optionValue = function () {
        return this.getRuleContext(0, OptionValueContext);
    };
    Object.defineProperty(OptionContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_option; },
        enumerable: false,
        configurable: true
    });
    // @Override
    OptionContext.prototype.enterRule = function (listener) {
        if (listener.enterOption) {
            listener.enterOption(this);
        }
    };
    // @Override
    OptionContext.prototype.exitRule = function (listener) {
        if (listener.exitOption) {
            listener.exitOption(this);
        }
    };
    // @Override
    OptionContext.prototype.accept = function (visitor) {
        if (visitor.visitOption) {
            return visitor.visitOption(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return OptionContext;
}(Utils.ParserRuleContext));
var FieldRerefenceContext = /** @class */ (function (_super) {
    __extends(FieldRerefenceContext, _super);
    function FieldRerefenceContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    FieldRerefenceContext.prototype.standardFieldRerefence = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(StandardFieldRerefenceContext);
        }
        else {
            return this.getRuleContext(i, StandardFieldRerefenceContext);
        }
    };
    FieldRerefenceContext.prototype.LPAREN = function (i) {
        if (i === undefined) {
            return this.getTokens(ProtoParser.LPAREN);
        }
        else {
            return this.getToken(ProtoParser.LPAREN, i);
        }
    };
    FieldRerefenceContext.prototype.customFieldReference = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(CustomFieldReferenceContext);
        }
        else {
            return this.getRuleContext(i, CustomFieldReferenceContext);
        }
    };
    FieldRerefenceContext.prototype.RPAREN = function (i) {
        if (i === undefined) {
            return this.getTokens(ProtoParser.RPAREN);
        }
        else {
            return this.getToken(ProtoParser.RPAREN, i);
        }
    };
    FieldRerefenceContext.prototype.DOT = function (i) {
        if (i === undefined) {
            return this.getTokens(ProtoParser.DOT);
        }
        else {
            return this.getToken(ProtoParser.DOT, i);
        }
    };
    Object.defineProperty(FieldRerefenceContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_fieldRerefence; },
        enumerable: false,
        configurable: true
    });
    // @Override
    FieldRerefenceContext.prototype.enterRule = function (listener) {
        if (listener.enterFieldRerefence) {
            listener.enterFieldRerefence(this);
        }
    };
    // @Override
    FieldRerefenceContext.prototype.exitRule = function (listener) {
        if (listener.exitFieldRerefence) {
            listener.exitFieldRerefence(this);
        }
    };
    // @Override
    FieldRerefenceContext.prototype.accept = function (visitor) {
        if (visitor.visitFieldRerefence) {
            return visitor.visitFieldRerefence(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return FieldRerefenceContext;
}(Utils.ParserRuleContext));
var StandardFieldRerefenceContext = /** @class */ (function (_super) {
    __extends(StandardFieldRerefenceContext, _super);
    function StandardFieldRerefenceContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    StandardFieldRerefenceContext.prototype.ident = function () {
        return this.getRuleContext(0, IdentContext);
    };
    Object.defineProperty(StandardFieldRerefenceContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_standardFieldRerefence; },
        enumerable: false,
        configurable: true
    });
    // @Override
    StandardFieldRerefenceContext.prototype.enterRule = function (listener) {
        if (listener.enterStandardFieldRerefence) {
            listener.enterStandardFieldRerefence(this);
        }
    };
    // @Override
    StandardFieldRerefenceContext.prototype.exitRule = function (listener) {
        if (listener.exitStandardFieldRerefence) {
            listener.exitStandardFieldRerefence(this);
        }
    };
    // @Override
    StandardFieldRerefenceContext.prototype.accept = function (visitor) {
        if (visitor.visitStandardFieldRerefence) {
            return visitor.visitStandardFieldRerefence(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return StandardFieldRerefenceContext;
}(Utils.ParserRuleContext));
var CustomFieldReferenceContext = /** @class */ (function (_super) {
    __extends(CustomFieldReferenceContext, _super);
    function CustomFieldReferenceContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    CustomFieldReferenceContext.prototype.ident = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(IdentContext);
        }
        else {
            return this.getRuleContext(i, IdentContext);
        }
    };
    CustomFieldReferenceContext.prototype.DOT = function (i) {
        if (i === undefined) {
            return this.getTokens(ProtoParser.DOT);
        }
        else {
            return this.getToken(ProtoParser.DOT, i);
        }
    };
    Object.defineProperty(CustomFieldReferenceContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_customFieldReference; },
        enumerable: false,
        configurable: true
    });
    // @Override
    CustomFieldReferenceContext.prototype.enterRule = function (listener) {
        if (listener.enterCustomFieldReference) {
            listener.enterCustomFieldReference(this);
        }
    };
    // @Override
    CustomFieldReferenceContext.prototype.exitRule = function (listener) {
        if (listener.exitCustomFieldReference) {
            listener.exitCustomFieldReference(this);
        }
    };
    // @Override
    CustomFieldReferenceContext.prototype.accept = function (visitor) {
        if (visitor.visitCustomFieldReference) {
            return visitor.visitCustomFieldReference(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return CustomFieldReferenceContext;
}(Utils.ParserRuleContext));
var OptionValueContext = /** @class */ (function (_super) {
    __extends(OptionValueContext, _super);
    function OptionValueContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    OptionValueContext.prototype.INTEGER_VALUE = function () { return this.tryGetToken(ProtoParser.INTEGER_VALUE, 0); };
    OptionValueContext.prototype.FLOAT_VALUE = function () { return this.tryGetToken(ProtoParser.FLOAT_VALUE, 0); };
    OptionValueContext.prototype.BOOLEAN_VALUE = function () { return this.tryGetToken(ProtoParser.BOOLEAN_VALUE, 0); };
    OptionValueContext.prototype.STRING_VALUE = function () { return this.tryGetToken(ProtoParser.STRING_VALUE, 0); };
    OptionValueContext.prototype.IDENT = function () { return this.tryGetToken(ProtoParser.IDENT, 0); };
    OptionValueContext.prototype.textFormat = function () {
        return this.tryGetRuleContext(0, TextFormatContext);
    };
    Object.defineProperty(OptionValueContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_optionValue; },
        enumerable: false,
        configurable: true
    });
    // @Override
    OptionValueContext.prototype.enterRule = function (listener) {
        if (listener.enterOptionValue) {
            listener.enterOptionValue(this);
        }
    };
    // @Override
    OptionValueContext.prototype.exitRule = function (listener) {
        if (listener.exitOptionValue) {
            listener.exitOptionValue(this);
        }
    };
    // @Override
    OptionValueContext.prototype.accept = function (visitor) {
        if (visitor.visitOptionValue) {
            return visitor.visitOptionValue(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return OptionValueContext;
}(Utils.ParserRuleContext));
var TextFormatContext = /** @class */ (function (_super) {
    __extends(TextFormatContext, _super);
    function TextFormatContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    TextFormatContext.prototype.LCURLY = function () { return this.getToken(ProtoParser.LCURLY, 0); };
    TextFormatContext.prototype.RCURLY = function () { return this.getToken(ProtoParser.RCURLY, 0); };
    TextFormatContext.prototype.textFormatEntry = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(TextFormatEntryContext);
        }
        else {
            return this.getRuleContext(i, TextFormatEntryContext);
        }
    };
    Object.defineProperty(TextFormatContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_textFormat; },
        enumerable: false,
        configurable: true
    });
    // @Override
    TextFormatContext.prototype.enterRule = function (listener) {
        if (listener.enterTextFormat) {
            listener.enterTextFormat(this);
        }
    };
    // @Override
    TextFormatContext.prototype.exitRule = function (listener) {
        if (listener.exitTextFormat) {
            listener.exitTextFormat(this);
        }
    };
    // @Override
    TextFormatContext.prototype.accept = function (visitor) {
        if (visitor.visitTextFormat) {
            return visitor.visitTextFormat(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return TextFormatContext;
}(Utils.ParserRuleContext));
var TextFormatOptionNameContext = /** @class */ (function (_super) {
    __extends(TextFormatOptionNameContext, _super);
    function TextFormatOptionNameContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    TextFormatOptionNameContext.prototype.ident = function () {
        return this.tryGetRuleContext(0, IdentContext);
    };
    TextFormatOptionNameContext.prototype.LSQUARE = function () { return this.tryGetToken(ProtoParser.LSQUARE, 0); };
    TextFormatOptionNameContext.prototype.typeReference = function () {
        return this.tryGetRuleContext(0, TypeReferenceContext);
    };
    TextFormatOptionNameContext.prototype.RSQUARE = function () { return this.tryGetToken(ProtoParser.RSQUARE, 0); };
    Object.defineProperty(TextFormatOptionNameContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_textFormatOptionName; },
        enumerable: false,
        configurable: true
    });
    // @Override
    TextFormatOptionNameContext.prototype.enterRule = function (listener) {
        if (listener.enterTextFormatOptionName) {
            listener.enterTextFormatOptionName(this);
        }
    };
    // @Override
    TextFormatOptionNameContext.prototype.exitRule = function (listener) {
        if (listener.exitTextFormatOptionName) {
            listener.exitTextFormatOptionName(this);
        }
    };
    // @Override
    TextFormatOptionNameContext.prototype.accept = function (visitor) {
        if (visitor.visitTextFormatOptionName) {
            return visitor.visitTextFormatOptionName(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return TextFormatOptionNameContext;
}(Utils.ParserRuleContext));
var TextFormatEntryContext = /** @class */ (function (_super) {
    __extends(TextFormatEntryContext, _super);
    function TextFormatEntryContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    TextFormatEntryContext.prototype.textFormatOptionName = function () {
        return this.getRuleContext(0, TextFormatOptionNameContext);
    };
    TextFormatEntryContext.prototype.COLON = function () { return this.tryGetToken(ProtoParser.COLON, 0); };
    TextFormatEntryContext.prototype.textFormatOptionValue = function () {
        return this.tryGetRuleContext(0, TextFormatOptionValueContext);
    };
    TextFormatEntryContext.prototype.textFormat = function () {
        return this.tryGetRuleContext(0, TextFormatContext);
    };
    Object.defineProperty(TextFormatEntryContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_textFormatEntry; },
        enumerable: false,
        configurable: true
    });
    // @Override
    TextFormatEntryContext.prototype.enterRule = function (listener) {
        if (listener.enterTextFormatEntry) {
            listener.enterTextFormatEntry(this);
        }
    };
    // @Override
    TextFormatEntryContext.prototype.exitRule = function (listener) {
        if (listener.exitTextFormatEntry) {
            listener.exitTextFormatEntry(this);
        }
    };
    // @Override
    TextFormatEntryContext.prototype.accept = function (visitor) {
        if (visitor.visitTextFormatEntry) {
            return visitor.visitTextFormatEntry(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return TextFormatEntryContext;
}(Utils.ParserRuleContext));
var TextFormatOptionValueContext = /** @class */ (function (_super) {
    __extends(TextFormatOptionValueContext, _super);
    function TextFormatOptionValueContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    TextFormatOptionValueContext.prototype.INTEGER_VALUE = function () { return this.tryGetToken(ProtoParser.INTEGER_VALUE, 0); };
    TextFormatOptionValueContext.prototype.FLOAT_VALUE = function () { return this.tryGetToken(ProtoParser.FLOAT_VALUE, 0); };
    TextFormatOptionValueContext.prototype.BOOLEAN_VALUE = function () { return this.tryGetToken(ProtoParser.BOOLEAN_VALUE, 0); };
    TextFormatOptionValueContext.prototype.STRING_VALUE = function () { return this.tryGetToken(ProtoParser.STRING_VALUE, 0); };
    TextFormatOptionValueContext.prototype.IDENT = function () { return this.tryGetToken(ProtoParser.IDENT, 0); };
    Object.defineProperty(TextFormatOptionValueContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_textFormatOptionValue; },
        enumerable: false,
        configurable: true
    });
    // @Override
    TextFormatOptionValueContext.prototype.enterRule = function (listener) {
        if (listener.enterTextFormatOptionValue) {
            listener.enterTextFormatOptionValue(this);
        }
    };
    // @Override
    TextFormatOptionValueContext.prototype.exitRule = function (listener) {
        if (listener.exitTextFormatOptionValue) {
            listener.exitTextFormatOptionValue(this);
        }
    };
    // @Override
    TextFormatOptionValueContext.prototype.accept = function (visitor) {
        if (visitor.visitTextFormatOptionValue) {
            return visitor.visitTextFormatOptionValue(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return TextFormatOptionValueContext;
}(Utils.ParserRuleContext));
var FullIdentContext = /** @class */ (function (_super) {
    __extends(FullIdentContext, _super);
    function FullIdentContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    FullIdentContext.prototype.ident = function (i) {
        if (i === undefined) {
            return this.getRuleContexts(IdentContext);
        }
        else {
            return this.getRuleContext(i, IdentContext);
        }
    };
    FullIdentContext.prototype.DOT = function (i) {
        if (i === undefined) {
            return this.getTokens(ProtoParser.DOT);
        }
        else {
            return this.getToken(ProtoParser.DOT, i);
        }
    };
    Object.defineProperty(FullIdentContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_fullIdent; },
        enumerable: false,
        configurable: true
    });
    // @Override
    FullIdentContext.prototype.enterRule = function (listener) {
        if (listener.enterFullIdent) {
            listener.enterFullIdent(this);
        }
    };
    // @Override
    FullIdentContext.prototype.exitRule = function (listener) {
        if (listener.exitFullIdent) {
            listener.exitFullIdent(this);
        }
    };
    // @Override
    FullIdentContext.prototype.accept = function (visitor) {
        if (visitor.visitFullIdent) {
            return visitor.visitFullIdent(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return FullIdentContext;
}(Utils.ParserRuleContext));
var IdentContext = /** @class */ (function (_super) {
    __extends(IdentContext, _super);
    function IdentContext(parent, invokingState) {
        return _super.call(this, parent, invokingState) || this;
    }
    IdentContext.prototype.IDENT = function () { return this.tryGetToken(ProtoParser.IDENT, 0); };
    IdentContext.prototype.PACKAGE = function () { return this.tryGetToken(ProtoParser.PACKAGE, 0); };
    IdentContext.prototype.SYNTAX = function () { return this.tryGetToken(ProtoParser.SYNTAX, 0); };
    IdentContext.prototype.IMPORT = function () { return this.tryGetToken(ProtoParser.IMPORT, 0); };
    IdentContext.prototype.PUBLIC = function () { return this.tryGetToken(ProtoParser.PUBLIC, 0); };
    IdentContext.prototype.OPTION = function () { return this.tryGetToken(ProtoParser.OPTION, 0); };
    IdentContext.prototype.MESSAGE = function () { return this.tryGetToken(ProtoParser.MESSAGE, 0); };
    IdentContext.prototype.GROUP = function () { return this.tryGetToken(ProtoParser.GROUP, 0); };
    IdentContext.prototype.OPTIONAL = function () { return this.tryGetToken(ProtoParser.OPTIONAL, 0); };
    IdentContext.prototype.REQUIRED = function () { return this.tryGetToken(ProtoParser.REQUIRED, 0); };
    IdentContext.prototype.REPEATED = function () { return this.tryGetToken(ProtoParser.REPEATED, 0); };
    IdentContext.prototype.ONEOF = function () { return this.tryGetToken(ProtoParser.ONEOF, 0); };
    IdentContext.prototype.EXTEND = function () { return this.tryGetToken(ProtoParser.EXTEND, 0); };
    IdentContext.prototype.EXTENSIONS = function () { return this.tryGetToken(ProtoParser.EXTENSIONS, 0); };
    IdentContext.prototype.TO = function () { return this.tryGetToken(ProtoParser.TO, 0); };
    IdentContext.prototype.MAX = function () { return this.tryGetToken(ProtoParser.MAX, 0); };
    IdentContext.prototype.RESERVED = function () { return this.tryGetToken(ProtoParser.RESERVED, 0); };
    IdentContext.prototype.ENUM = function () { return this.tryGetToken(ProtoParser.ENUM, 0); };
    IdentContext.prototype.SERVICE = function () { return this.tryGetToken(ProtoParser.SERVICE, 0); };
    IdentContext.prototype.RPC = function () { return this.tryGetToken(ProtoParser.RPC, 0); };
    IdentContext.prototype.RETURNS = function () { return this.tryGetToken(ProtoParser.RETURNS, 0); };
    IdentContext.prototype.STREAM = function () { return this.tryGetToken(ProtoParser.STREAM, 0); };
    IdentContext.prototype.MAP = function () { return this.tryGetToken(ProtoParser.MAP, 0); };
    IdentContext.prototype.BOOLEAN_VALUE = function () { return this.tryGetToken(ProtoParser.BOOLEAN_VALUE, 0); };
    IdentContext.prototype.DOUBLE = function () { return this.tryGetToken(ProtoParser.DOUBLE, 0); };
    IdentContext.prototype.FLOAT = function () { return this.tryGetToken(ProtoParser.FLOAT, 0); };
    IdentContext.prototype.INT32 = function () { return this.tryGetToken(ProtoParser.INT32, 0); };
    IdentContext.prototype.INT64 = function () { return this.tryGetToken(ProtoParser.INT64, 0); };
    IdentContext.prototype.UINT32 = function () { return this.tryGetToken(ProtoParser.UINT32, 0); };
    IdentContext.prototype.UINT64 = function () { return this.tryGetToken(ProtoParser.UINT64, 0); };
    IdentContext.prototype.SINT32 = function () { return this.tryGetToken(ProtoParser.SINT32, 0); };
    IdentContext.prototype.SINT64 = function () { return this.tryGetToken(ProtoParser.SINT64, 0); };
    IdentContext.prototype.FIXED32 = function () { return this.tryGetToken(ProtoParser.FIXED32, 0); };
    IdentContext.prototype.FIXED64 = function () { return this.tryGetToken(ProtoParser.FIXED64, 0); };
    IdentContext.prototype.SFIXED32 = function () { return this.tryGetToken(ProtoParser.SFIXED32, 0); };
    IdentContext.prototype.SFIXED64 = function () { return this.tryGetToken(ProtoParser.SFIXED64, 0); };
    IdentContext.prototype.BOOL = function () { return this.tryGetToken(ProtoParser.BOOL, 0); };
    IdentContext.prototype.STRING = function () { return this.tryGetToken(ProtoParser.STRING, 0); };
    IdentContext.prototype.BYTES = function () { return this.tryGetToken(ProtoParser.BYTES, 0); };
    Object.defineProperty(IdentContext.prototype, "ruleIndex", {
        // @Override
        get: function () { return ProtoParser.RULE_ident; },
        enumerable: false,
        configurable: true
    });
    // @Override
    IdentContext.prototype.enterRule = function (listener) {
        if (listener.enterIdent) {
            listener.enterIdent(this);
        }
    };
    // @Override
    IdentContext.prototype.exitRule = function (listener) {
        if (listener.exitIdent) {
            listener.exitIdent(this);
        }
    };
    // @Override
    IdentContext.prototype.accept = function (visitor) {
        if (visitor.visitIdent) {
            return visitor.visitIdent(this);
        }
        else {
            return visitor.visitChildren(this);
        }
    };
    return IdentContext;
}(Utils.ParserRuleContext));

function parse(proto) {
    var inputStream = Utils.CharStreams.fromString(proto);
    var lexer = new ProtoLexer(inputStream);
    var tokenStream = new Utils.CommonTokenStream(lexer);
    return new ProtoParser(tokenStream);
}
var ProtoVisitor = /** @class */ (function (_super) {
    __extends(ProtoVisitor, _super);
    function ProtoVisitor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ProtoVisitor;
}(Utils.AbstractParseTreeVisitor));

exports.CustomFieldReferenceContext = CustomFieldReferenceContext;
exports.EnumBlockContext = EnumBlockContext;
exports.EnumFieldContext = EnumFieldContext;
exports.EnumFieldNameContext = EnumFieldNameContext;
exports.EnumFieldValueContext = EnumFieldValueContext;
exports.EnumNameContext = EnumNameContext;
exports.ExtendBlockContext = ExtendBlockContext;
exports.ExtendBlockEntryContext = ExtendBlockEntryContext;
exports.ExtensionsContext = ExtensionsContext;
exports.FieldContext = FieldContext;
exports.FieldModifierContext = FieldModifierContext;
exports.FieldNameContext = FieldNameContext;
exports.FieldOptionsContext = FieldOptionsContext;
exports.FieldRerefenceContext = FieldRerefenceContext;
exports.FileReferenceContext = FileReferenceContext;
exports.FullIdentContext = FullIdentContext;
exports.GroupBlockContext = GroupBlockContext;
exports.GroupNameContext = GroupNameContext;
exports.IdentContext = IdentContext;
exports.ImportStatementContext = ImportStatementContext;
exports.MapContext = MapContext;
exports.MapKeyContext = MapKeyContext;
exports.MapValueContext = MapValueContext;
exports.MessageBlockContext = MessageBlockContext;
exports.MessageNameContext = MessageNameContext;
exports.OneofContext = OneofContext;
exports.OneofNameContext = OneofNameContext;
exports.OptionContext = OptionContext;
exports.OptionEntryContext = OptionEntryContext;
exports.OptionValueContext = OptionValueContext;
exports.PackageNameContext = PackageNameContext;
exports.PackageStatementContext = PackageStatementContext;
exports.ProtoContext = ProtoContext;
exports.ProtoLexer = ProtoLexer;
exports.ProtoParser = ProtoParser;
exports.ProtoVisitor = ProtoVisitor;
exports.RangeContext = RangeContext;
exports.RangeFromContext = RangeFromContext;
exports.RangeToContext = RangeToContext;
exports.ReservedFieldNameContext = ReservedFieldNameContext;
exports.ReservedFieldNamesContext = ReservedFieldNamesContext;
exports.ReservedFieldRangesContext = ReservedFieldRangesContext;
exports.RpcMethodContext = RpcMethodContext;
exports.RpcNameContext = RpcNameContext;
exports.RpcTypeContext = RpcTypeContext;
exports.ServiceBlockContext = ServiceBlockContext;
exports.ServiceNameContext = ServiceNameContext;
exports.StandardFieldRerefenceContext = StandardFieldRerefenceContext;
exports.SyntaxNameContext = SyntaxNameContext;
exports.SyntaxStatementContext = SyntaxStatementContext;
exports.TagContext = TagContext;
exports.TextFormatContext = TextFormatContext;
exports.TextFormatEntryContext = TextFormatEntryContext;
exports.TextFormatOptionNameContext = TextFormatOptionNameContext;
exports.TextFormatOptionValueContext = TextFormatOptionValueContext;
exports.TypeReferenceContext = TypeReferenceContext;
exports.parse = parse;
