'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tree = require('antlr4ts/tree');
var parser$1 = require('@suited-grpc/parser');

class Visitor extends tree.AbstractParseTreeVisitor {
    defaultResult() {
        return null;
    }
    visitMessageName(ctx) {
        console.log(ctx);
        return ctx;
    }
}
const parser = parser$1.parse(`
    syntax = "proto2";
    package greeting;
    
    message Greeting {
        string id = 1;
        string service = 2;
        string message = 3;
        string created = 4;
    }
    
    message GreetingRequest {
    }
    
    message GreetingResponse {
        repeated Greeting greeting = 1;
    }
    
    service GreetingService {
        rpc Greeting (GreetingRequest) returns (GreetingResponse)
    }
`);
const visitor = new Visitor();
visitor.visit(parser.proto());

exports.parser = parser;
exports.visitor = visitor;
