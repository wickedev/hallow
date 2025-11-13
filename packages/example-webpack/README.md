# @hallow/example-webpack

> Complete example demonstrating Hallow gRPC integration with Webpack 5, React 18, and TypeScript

This package showcases how to use `@hallow/plugin` to seamlessly import and use `.proto` files in a React application with Webpack, featuring a working gRPC server and three different API patterns (Promise, Hook, and Suspense).

## Features

- ✨ **Zero Code Generation**: Import `.proto` files directly in TypeScript
- ⚡ **Hot Module Replacement**: Fast development experience with HMR
- 🎯 **Type Safety**: Full TypeScript support with auto-generated types
- 🔄 **Three API Patterns**: Promise, React Hook, and Suspense examples
- 🖥️ **Complete Server**: Working gRPC server with middleware
- 📦 **Production Ready**: Optimized build with code splitting
- 🧪 **Fully Tested**: Comprehensive unit and integration tests

## Quick Start

### Installation

```bash
# Install dependencies
yarn install

# Start development server (client + gRPC server)
yarn dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Available Scripts

- `yarn dev` - Start development server (client + gRPC server concurrently)
- `yarn client:dev` - Start only the client development server
- `yarn server` - Start only the gRPC server with watch mode
- `yarn build` - Build for production
- `yarn serve` - Serve production build
- `yarn test` - Run all tests
- `yarn test:watch` - Run tests in watch mode
- `yarn lint` - Lint source code
- `yarn format` - Format code with Prettier
- `yarn clean` - Clean build artifacts

## Project Structure

```
example-webpack/
├── src/                        # React application source
│   ├── components/            # React components
│   │   ├── ErrorBoundary.tsx # Error boundary component
│   │   ├── Navigation.tsx    # Tab navigation
│   │   ├── PromiseExample.tsx # Promise API example
│   │   ├── HookExample.tsx   # Hook API example
│   │   └── SuspenseExample.tsx # Suspense API example
│   ├── proto/                 # Protocol buffer definitions
│   │   └── greeting.proto    # Greeting service definition
│   ├── __tests__/            # Test files
│   ├── App.tsx               # Main application component
│   ├── App.css               # Application styles
│   └── index.tsx             # Application entry point
├── server/                    # gRPC server implementation
│   └── src/
│       ├── middleware/       # Server middleware
│       ├── services/         # gRPC service implementations
│       ├── config.ts         # Server configuration
│       ├── server.ts         # Server setup
│       └── index.ts          # Server entry point
├── public/                    # Static assets
│   └── index.html           # HTML template
├── webpack.common.js         # Webpack base configuration
├── webpack.dev.js            # Webpack development configuration
├── webpack.prod.js           # Webpack production configuration
├── jest.config.js            # Jest test configuration
└── tsconfig.json             # TypeScript configuration
```

## API Examples

### 1. Promise API (Imperative)

Direct async/await pattern for full control over request timing:

```typescript
import { GreetingServiceStub } from './proto/greeting.proto';

const stub = new GreetingServiceStub('http://localhost:3000');

const response = await stub.methods.greet({
  name: 'World',
  language: 'en',
  options: { style: 1 }
});

console.log(response.reply); // "Hello, World!"
```

**Use Cases:**
- Event handlers (button clicks, form submissions)
- One-off requests
- Sequential operations with complex logic

### 2. Hook API (Declarative)

React hook for declarative data fetching with automatic state management:

```typescript
import { useGrpc } from '@hallow/react';
import { GreetingServiceStub } from './proto/greeting.proto';

function Component() {
  const { data, loading, error } = useGrpc(
    () => GreetingServiceStub,
    serverUrl,
    (stub) => stub.methods.greet({ name: 'World' }),
    [name] // Dependencies
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <div>{data.reply}</div>;
}
```

**Use Cases:**
- Component-level data fetching
- Automatic refetch on dependency changes
- Simple loading/error state management

### 3. Suspense API (Concurrent)

React Suspense integration for concurrent rendering:

```typescript
import { Suspense } from 'react';
import { useSuspenseGrpc } from '@hallow/react';
import { GreetingServiceStub } from './proto/greeting.proto';

function Content() {
  const data = useSuspenseGrpc(
    () => GreetingServiceStub,
    serverUrl,
    (stub) => stub.methods.greet({ name: 'World' })
  );

  return <div>{data.reply}</div>;
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Content />
    </Suspense>
  );
}
```

**Use Cases:**
- React 18 concurrent features
- Coordinated loading states
- Server-side rendering (future)

## Protocol Buffer Definition

The example uses a comprehensive proto definition with multiple RPC types:

```protobuf
service GreetingService {
  // Unary: Single request, single response
  rpc Greet(GreetRequest) returns (GreetResponse);

  // Server streaming: Single request, multiple responses
  rpc StreamGreetings(StreamGreetingsRequest) returns (stream GreetResponse);

  // Client streaming: Multiple requests, single response
  rpc AccumulateGreetings(stream GreetRequest) returns (AccumulatedResponse);

  // Bidirectional streaming: Multiple requests and responses
  rpc Chat(stream ChatMessage) returns (stream ChatMessage);
}
```

## Server Implementation

The gRPC server includes:

- **Logger Middleware**: Request/response logging with timing
- **Error Handler**: Automatic error mapping to gRPC status codes
- **Greeting Service**: Complete implementation of all RPC methods
- **Graceful Shutdown**: Proper cleanup on termination

### Starting the Server

```bash
yarn server
```

The server runs on `http://localhost:3000` by default.

## Configuration

### Environment Variables

Create `.env` or `.env.production` files:

```bash
# Server configuration
GRPC_SERVER_HOST=0.0.0.0
GRPC_SERVER_PORT=3000

# Client configuration
GRPC_SERVER_URL=http://localhost:3000
NODE_ENV=development
```

### Webpack Configuration

The Hallow plugin is configured in `webpack.common.js`:

```javascript
const { HallowPlugin } = require('@hallow/plugin');

module.exports = {
  plugins: [
    HallowPlugin({
      protoRoot: path.resolve(__dirname, 'proto'),
      generateReactHooks: true,
      generateSuspenseHooks: true,
      sourceMaps: true,
      cacheDir: path.resolve(__dirname, '.cache/hallow')
    })
  ]
};
```

## Development

### Hot Module Replacement

The development server includes:
- React Fast Refresh for instant component updates
- Webpack HMR for proto file changes
- Source maps for debugging

### Testing

Run the test suite:

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run tests with coverage
yarn test --coverage
```

Test coverage includes:
- React component unit tests
- Server integration tests
- Middleware tests
- Service implementation tests

## Building for Production

```bash
# Create optimized production build
yarn build

# Serve the production build
yarn serve
```

Production build includes:
- Code splitting (vendor and runtime chunks)
- Minification with Terser
- CSS optimization
- Bundle analysis
- Source maps

## Troubleshooting

### Server Connection Issues

If the client cannot connect to the server:

1. Verify the server is running: `yarn server`
2. Check the server URL in `.env`: `GRPC_SERVER_URL=http://localhost:3000`
3. Ensure CORS is properly configured on the server

### Proto Import Errors

If TypeScript reports errors on `.proto` imports:

1. Check that `proto.d.ts` exists in `src/types/`
2. Verify `tsconfig.json` includes the path mapping
3. Restart the TypeScript server in your IDE

### Build Errors

If the build fails:

1. Clean build artifacts: `yarn clean`
2. Delete `node_modules` and reinstall: `rm -rf node_modules && yarn install`
3. Check Webpack configuration for syntax errors

## Architecture

### How It Works

1. **Build Time**: Webpack + Hallow plugin processes `.proto` files
2. **Code Generation**: TypeScript stubs are generated with type safety
3. **Runtime**: `@hallow/grpc-web` handles gRPC-web communication
4. **React Integration**: `@hallow/react` provides hooks for seamless integration

### Technology Stack

- **React 18**: Concurrent features, Suspense, Fast Refresh
- **TypeScript**: Full type safety and IntelliSense
- **Webpack 5**: Module bundling with HMR
- **gRPC-web**: Browser-compatible gRPC protocol
- **Protocol Buffers**: Efficient serialization
- **Jest**: Testing framework
- **Testing Library**: React component testing

## Learn More

- [Hallow Documentation](../../README.md)
- [Protocol Buffers Guide](https://developers.google.com/protocol-buffers)
- [gRPC Web](https://github.com/grpc/grpc-web)
- [React 18](https://react.dev/)
- [Webpack](https://webpack.js.org/)

## License

MIT
