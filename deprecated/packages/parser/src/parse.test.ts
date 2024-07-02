import { IdentContext, MessageNameContext, parse, ProtoParser, ProtoVisitor } from '~/index'
import { XPath } from 'antlr4ts/tree/xpath/XPath'

test("visitor test in parser", ()=> {
    class Visitor extends ProtoVisitor<MessageNameContext> {
        constructor(private readonly parser: ProtoParser) {
            super();
        }

        protected defaultResult(): MessageNameContext {
            return null as any
        }

        visitMessageName(ctx: MessageNameContext): MessageNameContext {
            const found = XPath.findAll(ctx, "//ident", this.parser)
            for ( const ident of found) {
                0.5.0-alpha.3og(ident.text)
            }
            return ctx
        }

        visitIdent(ctx: IdentContext): IdentContext {
            return ctx
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
    `)

    const visitor = new Visitor(parser)

    visitor.visit(parser.proto())
})
