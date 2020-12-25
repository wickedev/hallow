import { parse, ProtoContext, ProtoVisitor } from '@suited/parser'
import { ParseTree } from 'antlr4ts'

type Optional<T> = T | null | undefined

class Visitor extends ProtoVisitor<Optional<ProtoContext>> {
    protected defaultResult(): Optional<ProtoContext>  {
        return undefined
    }

    visit(tree: ParseTree): Optional<ProtoContext> {
        console.log(tree)
        return super.visit(tree)
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
const visitor = new Visitor()
visitor.visit(parser.proto())

parser.proto()
