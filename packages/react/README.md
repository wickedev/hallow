# @hallow/react

React hooks for Hallow gRPC client with automatic adapter selection.

## Overview

This package provides React hooks for consuming gRPC services with automatic adapter selection based on the runtime environment:

- **Browser**: Uses `@improbable-eng/grpc-web` (grpc-web)
- **Node.js**: Uses `@grpc/grpc-js` (native gRPC)

The hooks handle loading states, error handling, stream lifecycle management, and provide TypeScript type safety.

## Installation

```bash
yarn add @hallow/react
```

## Hooks

### useGrpc

For unary RPC calls with loading and error state management.

```typescript
import { useGrpc } from '@hallow/react';
import { UserServiceStub } from './user.proto';

function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error, refetch } = useGrpc({
    serverUrl: 'https://api.example.com',
    StubClass: UserServiceStub,
    stubMethod: (stub) => stub.getUser({ userId }),
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### useSuspenseGrpc

For unary RPC calls with React Suspense integration.

```typescript
import { Suspense } from 'react';
import { useSuspenseGrpc } from '@hallow/react';
import { UserServiceStub } from './user.proto';

function UserProfile({ userId }: { userId: string }) {
  const user = useSuspenseGrpc({
    serverUrl: 'https://api.example.com',
    StubClass: UserServiceStub,
    stubMethod: (stub) => stub.getUser({ userId }),
  });

  return <div>{user.name}</div>;
}

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UserProfile userId="123" />
    </Suspense>
  );
}
```

### useGrpcStream

For server streaming RPC calls with message accumulation.

```typescript
import { useGrpcStream } from '@hallow/react';
import { ChatServiceStub } from './chat.proto';

function ChatMessages({ roomId }: { roomId: string }) {
  const {
    messages,
    latestMessage,
    streaming,
    completed,
    error,
    cancel,
    restart,
  } = useGrpcStream({
    serverUrl: 'https://api.example.com',
    StubClass: ChatServiceStub,
    stubMethod: (stub) => stub.streamMessages({ roomId }),
    maxMessages: 100, // Keep last 100 messages
  });

  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className="message">
            {msg.text}
          </div>
        ))}
      </div>
      {streaming && <div>Loading more...</div>}
      {completed && <div>Stream complete</div>}
      <button onClick={cancel} disabled={!streaming}>
        Stop
      </button>
      <button onClick={restart}>Restart</button>
    </div>
  );
}
```

## Configuration

All hooks accept adapter configuration:

```typescript
const config = {
  // Required: Server URL
  serverUrl: 'https://api.example.com',

  // Optional: Force specific adapter
  adapterType: 'auto', // 'auto' | 'grpc-web' | 'native'

  // Optional: Enable/disable native gRPC in Node.js
  enableNativeGrpc: true,

  // Optional: Use TLS/SSL
  secure: true,

  // Optional: Debug mode
  debug: false,

  // Optional: Default call options
  defaultCallOptions: {
    timeout: 5000,
    metadata: {
      authorization: 'Bearer token',
    },
  },
};
```

## Usage Patterns

### Method Descriptor Pattern

Use method descriptors directly:

```typescript
import { useGrpc } from '@hallow/react';
import { getUserMethod } from './user.proto';

const { data, loading } = useGrpc({
  serverUrl: 'https://api.example.com',
  method: getUserMethod,
  request: { userId: '123' },
});
```

### Stub-Based Pattern

Use generated stub classes (recommended):

```typescript
import { useGrpc } from '@hallow/react';
import { UserServiceStub } from './user.proto';

const { data, loading } = useGrpc({
  serverUrl: 'https://api.example.com',
  StubClass: UserServiceStub,
  stubMethod: (stub) => stub.getUser({ userId: '123' }),
});
```

## Features

### Automatic Adapter Selection

The hooks automatically select the best adapter for the environment:

- **Browser**: Always uses grpc-web
- **Node.js**: Uses native gRPC if available, falls back to grpc-web

### Loading State Management

`useGrpc` provides loading and error states:

```typescript
const { data, loading, error } = useGrpc(config);

if (loading) return <Loading />;
if (error) return <Error message={error.message} />;
return <Data value={data} />;
```

### Suspense Integration

`useSuspenseGrpc` integrates with React Suspense:

```typescript
<Suspense fallback={<Loading />}>
  <UserProfile userId="123" />
</Suspense>
```

### Stream Lifecycle Management

`useGrpcStream` manages stream lifecycle automatically:

- Starts stream on mount (configurable with `immediate: false`)
- Accumulates messages
- Provides latest message access
- Handles errors and completion
- Cleans up on unmount

### Manual Control

All hooks provide manual control:

```typescript
// useGrpc
const { refetch } = useGrpc(config);
refetch(); // Manually refetch data

// useGrpcStream
const { cancel, restart } = useGrpcStream(config);
cancel(); // Stop stream
restart(); // Restart stream
```

### TypeScript Support

All hooks are fully typed:

```typescript
interface GetUserRequest {
  userId: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

const { data } = useGrpc<GetUserRequest, User>({
  serverUrl: 'https://api.example.com',
  method: getUserMethod,
  request: { userId: '123' },
});

// data is typed as User | undefined
```

## Advanced Usage

### Preloading with Suspense

Preload data before rendering:

```typescript
import { preloadGrpc } from '@hallow/react';

// Preload in event handler
function handleMouseEnter() {
  preloadGrpc({
    serverUrl: 'https://api.example.com',
    StubClass: UserServiceStub,
    stubMethod: (stub) => stub.getUser({ userId: '123' }),
  });
}

// Component will not suspend if data is already loaded
function UserProfile() {
  const user = useSuspenseGrpc({
    serverUrl: 'https://api.example.com',
    StubClass: UserServiceStub,
    stubMethod: (stub) => stub.getUser({ userId: '123' }),
  });
  return <div>{user.name}</div>;
}
```

### Cache Control

Clear Suspense cache when needed:

```typescript
import { clearSuspenseCache } from '@hallow/react';

// Clear specific cache entry
clearSuspenseCache('my-cache-key');

// Clear all cache
clearSuspenseCache();
```

### Stream Message Limiting

Limit the number of messages kept in memory:

```typescript
const { messages } = useGrpcStream({
  serverUrl: 'https://api.example.com',
  StubClass: ChatServiceStub,
  stubMethod: (stub) => stub.streamMessages({ roomId: 'general' }),
  maxMessages: 50, // Keep only last 50 messages
});
```

### Stream Callbacks

React to stream events:

```typescript
const stream = useGrpcStream({
  serverUrl: 'https://api.example.com',
  StubClass: ChatServiceStub,
  stubMethod: (stub) => stub.streamMessages({ roomId: 'general' }),
  onMessage: (msg) => console.log('New message:', msg),
  onComplete: () => console.log('Stream complete'),
  onError: (err) => console.error('Stream error:', err),
});
```

## License

MIT
