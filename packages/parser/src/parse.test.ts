import { AbstractParseTreeVisitor } from 'antlr4ts/tree'
import { MessageNameContext, parse } from './index'

class Visitor extends AbstractParseTreeVisitor<MessageNameContext> {
    protected defaultResult(): MessageNameContext {
        return null as any
    }

    visitMessageName(ctx: MessageNameContext): MessageNameContext {
        console.log(ctx)
        return ctx
    }
}

export const parser = parse(`
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
`)
export const visitor = new Visitor()

test("test", ()=> {
    // @ts-ignore
    visitor.visit(parser.proto())
    expect(1 + 1).toEqual(2)
})
