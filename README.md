# Hallow GRPC

A gRPC web client library with TypeScript/JavaScript interface and React Hooks support.

## Monorepo Structure

This project uses pnpm workspaces for managing multiple packages:

```
hallow/
├── packages/
│   ├── core/           # Core gRPC web client library
│   └── swc-plugin/     # SWC plugin for code generation
├── pnpm-workspace.yaml
└── package.json
```

## Requirements

- Node.js >= 16.0.0
- pnpm >= 8.0.0

## Installation

```bash
pnpm install
```

## Development

```bash
# Build all packages
pnpm build

# Run tests for all packages
pnpm test

# Type check all packages
pnpm typecheck

# Lint all packages
pnpm lint

# Development mode (watch)
pnpm dev

# Clean all build artifacts
pnpm clean
```

## Package-specific Commands

```bash
# Build only core package
pnpm --filter @hallow/grpc-web build

# Test only core package
pnpm --filter @hallow/grpc-web test
```

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

## Dependencies

- google-protobuf
- @improbable-eng/grpc-web
- protobufjs (for proto parsing)

## Architecture

The library provides:
- A `Client` class for gRPC web connections
- Protocol buffer parser for service definitions
- Generated stubs from protobuf definitions
- React Hooks integration with Suspense support
- Error boundary compatibility