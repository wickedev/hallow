# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a gRPC web client library called "Hallow GRPC" that provides a TypeScript/JavaScript interface for gRPC web services. The library offers both Promise-based and React Hooks APIs with Suspense support.

## Key Dependencies

- google-protobuf
- @improbable-eng/grpc-web

## Architecture

The library provides:
- A `Client` class for gRPC web connections
- Generated stubs from protobuf definitions
- React Hooks integration with Suspense support
- Error boundary compatibility

## Development Status

This repository is in early development phase with only documentation present. The actual implementation has not been started yet.

## Usage Pattern

Based on the README, the intended API follows this pattern:
```tsx
import { Client } from "@hallow/grpc-web"
import { GreetingStub } from './greeting.proto'

const client = new Client({ baseURL: "/api" })
const greeter = new GreetingStub(client)

// Promise API
const res = await greeter.greeting()

// React Hooks API
const hooks = greeter.createHooks()
const res = hooks.useGreeting()
```

## Build System

No build system is currently configured. The `.gitignore` indicates a potential Rust target directory, suggesting mixed language development may be planned.

## Development Workflow

**Important**: Always commit changes after making code modifications. Follow these steps:

1. Make code changes
2. Run tests if available
3. Commit changes with descriptive messages
4. Never leave uncommitted changes in the working directory

This ensures proper version control and enables easy rollback if needed.