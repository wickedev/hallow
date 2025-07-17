# Hallow gRPC

A Seamless gRPC web client library without code generation by plugin system

## Usage

### Example Protobuf
```protobuf
syntax = "proto3";

package greeting;

service Greeting {
    rpc Greeting (GreetingRequest) returns (GreetingResponse);
}

message GreetingRequest {
    string name = 1;
}

message GreetingResponse {
    string message = 1;
}
```

### Promise API

```tsx
import { Client } from "@hallow/grpc-web"
import { GreetingStub } from './greeting.proto'

const client = new Client({ baseURL: "/api" })
const greeter = new GreetingStub(client)

const res = await greeter.greeting({message: "Hello, Ryan!"})
console.log(`hello from server: ${res.message}`)
```

### React Hook API (with Suspense)

```tsx
import { Client } from "@hallow/grpc-web"
import { GreetingHookStub } from './greeting.proto'
import { ErrorBoundary } from "react-error-boundary";

const client = new Client({ baseURL: "/api" })
const greeter = new GreetingHookStub(client)

function Greeter() {
    const res = greeter.useGreeting({message: "Hello, Ryan!"})
    return <div>{`hello from server: ${res.message}`}</div>
}

function App() {
    return <Suspense fallback={"loading"}>
        <ErrorBoundary fallback={"Something went wrong"}>
            <Greeter />
        </ErrorBoundary>
    </Suspense>
}
```

## Dependencies

- google-protobuf
- @improbable-eng/grpc-web
