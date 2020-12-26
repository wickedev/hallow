import { AbstractParseTreeVisitor } from 'antlr4ts/tree';
import { parse } from '@suited-grpc/parser';

class Visitor extends AbstractParseTreeVisitor {
    defaultResult() {
        return null;
    }
    visitMessageName(ctx) {
        console.log(ctx);
        return ctx;
    }
}
const parser = parse(`
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

export { parser, visitor };
