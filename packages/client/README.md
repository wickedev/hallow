# @hallow/grpc-web

gRPC-web client runtime library for Hallow.

## Overview

This package provides the runtime library for gRPC-web communication in browser environments. It wraps `@improbable-eng/grpc-web` and provides a clean, type-safe interface for making gRPC calls from the browser.

## Installation

```bash
yarn add @hallow/grpc-web
```

## Usage

This package is typically used through generated stub classes from `@hallow/plugin`. You don't usually import it directly.

### Generated Stub Usage

```typescript
import { GreetingServiceStub } from './greeting.proto';

const stub = new GreetingServiceStub('http://localhost:3000');

const response = await stub.methods.greet({
  name: 'World'
});

console.log(response.reply);
```

### Direct Usage (Advanced)

```typescript
import { GrpcWebClient } from '@hallow/grpc-web';

class MyServiceStub extends GrpcWebClient {
  constructor(serverUrl: string) {
    super(serverUrl);
  }

  async myMethod(request: MyRequest): Promise<MyResponse> {
    return this.unaryCall(methodDescriptor, request);
  }
}
```

## Features

- ✅ Unary calls
- ✅ Server streaming
- 🚧 Client streaming (in progress)
- 🚧 Bidirectional streaming (in progress)
- ✅ Type-safe error handling
- ✅ Promise-based API
- ✅ AsyncIterable for streams

## License

MIT
