import { generate } from "./generator";

function stripIndent(s: string): string {
  return s.replace(/^\s+/gm, "");
}

test("visitor test in generator", () => {
  const result = generate(`
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
    `)
  );
});
