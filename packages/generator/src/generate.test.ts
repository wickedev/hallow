import { generate } from "./generator";

function stripIndent(s: string): string {
  return s.replace(/^\s+/gm, "");
}

test("generate typescript code from proto", () => {
  const result = generate(`
    syntax = "proto2";
    package greeting;
    
    message Greeting {
      required string id = 1;
      optional string service = 2;
      required string message = 3;
      optional string created = 4;
    }
    
    message GreetingRequest {}
    
    message GreetingResponse {
      repeated Greeting greeting = 1;
    }
    
    service GreetingService { 
      rpc Greeting(GreetingRequest) returns(GreetingResponse);
    }
  `);

  expect(stripIndent(result)).toBe(
    stripIndent(`
      export interface Greeting {
        id: string;
        service: string;
        message: string;
        created: string;
      }

      export interface GreetingRequest {
      }

      export interface GreetingResponse {
          greeting: Greeting[];
      }
      
      export class GreetingStub {
        greeting(greetingRequest: GreetingRequest): Promise<GreetingResponse> {
            return null;
        }
      }
    `)
  );
});
