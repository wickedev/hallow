# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hallow gRPC is a seamless gRPC web client library that enables importing `.proto` files directly in TypeScript without code generation. It uses an Unplugin-based approach to integrate with various build systems (Vite, Webpack, ESBuild).

## Architecture

The project consists of six main components:

### Parser

- Uses ANTLR4TS to parse `.proto` files based on the official Protobuf3 grammar (`Protobuf3.g4`)
- Generates AST for code generation

### Generator

- Traverses parsed `.proto` files to generate gRPC Stub TypeScript code
- Uses `google-protobuf` for runtime protobuf serialization/deserialization
- Generates type-safe TypeScript interfaces and client stubs

### Client (gRPC Web)

- Provides the actual gRPC-web client functionality (`@hallow/grpc-web`)
- Uses `@improbable-eng/grpc-web` for server communication
- Handles request/response serialization

### React (Core)

- Common code for React Hook and Suspense integration
- Reusable components for generated React hooks

### Unplugin

- Build system integration plugin for Vite, Webpack, ESBuild, and other bundlers
- Enables seamless proto file imports during build time

### Example

- Working examples demonstrating the library usage as shown in README.md
- gRPC Web protocol example server for testing

## Development Setup

### Project Structure (Planned)

```
packages/
  parser/        # ANTLR-based protobuf parser
  generator/     # Code generation from proto AST
  client/        # gRPC-web client implementation
  react/         # React hooks and utilities
  unplugin/      # Build system integrations
  example/       # Example applications and server
```

### Build Tools

- **Monorepo**: Yarn workspaces
- **Build**: Rollup
- **Test**: Jest with ts-morph
- **Parser**: antlr4ts

### Key Dependencies

- `google-protobuf`: Protocol buffer runtime
- `@improbable-eng/grpc-web`: gRPC-web implementation
- `antlr4ts`: ANTLR TypeScript runtime

## Usage Patterns

### Promise API

```typescript
import { GreetingStub } from './greeting.proto';

const stub = new GreetingStub('https://localhost:3000');
const { reply } = await stub.methods.greet({ name: 'Baba' });
```

### React Hook API

```typescript
import { GreetingStub } from './greeting.proto';

function App() {
  const { data, error } = useGrpc(GreetingStub, client => client.methods.greet({ name: 'Baba' }));
}
```

### Suspense API

```typescript
function App() {
  const { reply } = useSuspenseGrpc(GreetingStub, client => client.methods.greet({ name: 'Baba' }));
}
```

## Development Commands

### Global Commands (from root directory)

```bash
# Install dependencies
yarn install

# Build all packages
yarn build

# Run tests for all packages
yarn test

# Lint all packages
yarn lint

# Type check all packages
yarn typecheck
```

### Parser Package Commands

```bash
cd packages/parser

# Generate ANTLR parser from grammar
yarn generate

# Build parser package
yarn build

# Run tests
yarn test

# Run specific test
yarn jest --no-coverage -t "test name"

# Clean build artifacts
yarn clean
```

## Important Notes

- The project uses Unplugin to support multiple build systems without requiring users to run code generation commands
- Proto files are imported directly and processed at build time
- Type safety is maintained throughout the compilation process
- The parser is based on the official Protobuf3 grammar for accuracy
