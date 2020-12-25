'use strict';

var parser$1 = require('@suited/parser');

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

var Visitor = /** @class */ (function (_super) {
    __extends(Visitor, _super);
    function Visitor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Visitor.prototype.defaultResult = function () {
        return undefined;
    };
    Visitor.prototype.visit = function (tree) {
        console.log(tree);
        return _super.prototype.visit.call(this, tree);
    };
    return Visitor;
}(parser$1.ProtoVisitor));
var parser = parser$1.parse("\n    syntax = \"proto2\";\n    package greeting;\n    \n    message Greeting {\n        string id = 1;\n        string service = 2;\n        string message = 3;\n        string created = 4;\n    }\n    \n    \n    message GreetingRequest {\n    }\n    \n    message GreetingResponse {\n        repeated Greeting greeting = 1;\n    }\n    \n    service GreetingService {\n        rpc Greeting (GreetingRequest) returns (GreetingResponse)\n    }\n");
var visitor = new Visitor();
visitor.visit(parser.proto());
parser.proto();
