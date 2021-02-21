# Hallow GRPC


## Usage

```tsx
import { Client } from "@hallow/grpc-web"
import { GreetingStub } from './greeting.proto'

// Setup
const client = new Client({ baseURL: "/api" })
const greeter = new GreetingStub(client)

// Promise
const res = await greeter.greeting()
console.log(JSON.stringify(res))

// React Hooks with Suspense
const hooks = greeter.createHooks()

function Greeter() {
    const res = hooks.useGreeting()
    return <div>{JSON.stringify(res.read())}</div>
}

function App() {
    return <Suspense fallback={'loading'}>
        <ErrorBoundary>
            <Greeter />
        </ErrorBoundary>
    </Suspense>
}
```

## Dependency

- google-protobuf
- @improbable-eng/grpc-web

## Setup

```js
// webpack.config.js
module.exports = {
    ...
    module: {
        rules: [{
            test: /\.proto$/,
            loader: '@hallow/grpc-loader',
        }]
    }
    ...
};

// tsconfig.json
{
    ...
    "compilerOptions": {
        "plugins": [{
            "name": "@hallow/ts-language-service-plugin",
            "option": {
                "grpc": true,
            }
        }]
    }
    ...
}
```
