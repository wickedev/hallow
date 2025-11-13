# API Documentation

Complete API reference for the Hallow gRPC Example application.

## Table of Contents

- [Client API](#client-api)
  - [Promise API](#promise-api)
  - [Hook API](#hook-api)
  - [Suspense API](#suspense-api)
- [Server API](#server-api)
  - [gRPC Service](#grpc-service)
  - [Middleware](#middleware)
- [Type Definitions](#type-definitions)

## Client API

### Promise API

Direct import and use of generated gRPC stubs.

#### Import

```typescript
import { GreetingServiceStub } from './proto/greeting.proto';
```

#### Constructor

```typescript
new GreetingServiceStub(serverUrl: string): GreetingServiceStub
```

**Parameters:**
- `serverUrl` - URL of the gRPC server (e.g., `http://localhost:3000`)

#### Methods

##### greet()

Unary RPC call to greet a user.

```typescript
stub.methods.greet(request: GreetRequest): Promise<GreetResponse>
```

**Request:**
```typescript
interface GreetRequest {
  name: string;              // User's name (required)
  language?: string;         // Language code (default: 'en')
  options?: {
    style?: number;          // 1=CASUAL, 2=FORMAL, 3=FRIENDLY
    include_timestamp?: boolean;
    metadata?: Record<string, string>;
  };
}
```

**Response:**
```typescript
interface GreetResponse {
  reply: string;             // Greeting message
  timestamp: string;         // ISO timestamp
  metadata?: {
    server_version?: string;
    request_id?: string;
  };
}
```

**Example:**
```typescript
const stub = new GreetingServiceStub('http://localhost:3000');

const response = await stub.methods.greet({
  name: 'Alice',
  language: 'en',
  options: {
    style: 1,
    include_timestamp: true
  }
});

console.log(response.reply); // "Hi Alice!"
```

---

### Hook API

React hook for declarative data fetching.

#### useGrpc

```typescript
function useGrpc<TStub, TResponse>(
  stubLoader: () => Promise<TStub> | TStub,
  serverUrl: string,
  query: (stub: TStub) => Promise<TResponse>,
  deps: any[]
): {
  data: TResponse | null;
  loading: boolean;
  error: Error | null;
}
```

**Parameters:**
- `stubLoader` - Function that returns or imports the stub class
- `serverUrl` - URL of the gRPC server
- `query` - Function that uses the stub to make the gRPC call
- `deps` - Dependency array (triggers refetch when changed)

**Returns:**
- `data` - Response data (null while loading or on error)
- `loading` - True during request
- `error` - Error object if request failed

**Example:**
```typescript
import { useGrpc } from '@hallow/react';
import { GreetingServiceStub } from './proto/greeting.proto';

function MyComponent() {
  const [name, setName] = useState('World');

  const { data, loading, error } = useGrpc(
    async () => {
      const { GreetingServiceStub } = await import('./proto/greeting.proto');
      return GreetingServiceStub;
    },
    'http://localhost:3000',
    (stub) => stub.methods.greet({ name }),
    [name]  // Refetch when name changes
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return <div>{data.reply}</div>;
}
```

**Best Practices:**
- Always include relevant state in the dependency array
- Handle all three states (loading, error, data)
- Use dynamic imports for better code splitting

---

### Suspense API

React Suspense integration for concurrent rendering.

#### useSuspenseGrpc

```typescript
function useSuspenseGrpc<TStub, TResponse>(
  stubLoader: () => Promise<TStub> | TStub,
  serverUrl: string,
  query: (stub: TStub) => Promise<TResponse>
): TResponse
```

**Parameters:**
- `stubLoader` - Function that returns or imports the stub class
- `serverUrl` - URL of the gRPC server
- `query` - Function that uses the stub to make the gRPC call

**Returns:**
- Response data directly (suspends during loading, throws on error)

**Example:**
```typescript
import { Suspense } from 'react';
import { useSuspenseGrpc } from '@hallow/react';
import { GreetingServiceStub } from './proto/greeting.proto';

function GreetingContent({ name }: { name: string }) {
  const data = useSuspenseGrpc(
    () => GreetingServiceStub,
    'http://localhost:3000',
    (stub) => stub.methods.greet({ name })
  );

  return <div>{data.reply}</div>;
}

function App() {
  return (
    <ErrorBoundary fallback={<div>Error occurred</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <GreetingContent name="World" />
      </Suspense>
    </ErrorBoundary>
  );
}
```

**Requirements:**
- Must be wrapped in `<Suspense>` boundary
- Should be wrapped in error boundary for error handling
- Works best with React 18+ concurrent features

---

## Server API

### gRPC Service

The server implements the GreetingService defined in `greeting.proto`.

#### Configuration

```typescript
interface ServerConfig {
  host: string;        // Bind host (default: '0.0.0.0')
  port: number;        // Server port (default: 3000)
  protoPath: string;   // Path to proto file
}
```

#### Methods

##### Greet (Unary)

Single request, single response.

**Implementation:**
```typescript
greet(
  call: ServerUnaryCall<GreetRequest, GreetResponse>,
  callback: sendUnaryData<GreetResponse>
): void
```

##### StreamGreetings (Server Streaming)

Single request, multiple responses.

**Implementation:**
```typescript
streamGreetings(
  call: ServerWritableStream<StreamGreetingsRequest, GreetResponse>
): void
```

##### AccumulateGreetings (Client Streaming)

Multiple requests, single response.

**Implementation:**
```typescript
accumulateGreetings(
  call: ServerReadableStream<GreetRequest, AccumulatedResponse>,
  callback: sendUnaryData<AccumulatedResponse>
): void
```

##### Chat (Bidirectional Streaming)

Multiple requests, multiple responses.

**Implementation:**
```typescript
chat(
  call: ServerDuplexStream<ChatMessage, ChatMessage>
): void
```

---

### Middleware

#### Logger Middleware

Logs all requests and responses with timing information.

```typescript
function loggerMiddleware<TRequest, TResponse>(
  handler: UnaryHandler<TRequest, TResponse>
): UnaryHandler<TRequest, TResponse>
```

**Features:**
- Colorized console output
- Request/response logging
- Execution time measurement
- Error logging

#### Error Handler Middleware

Converts JavaScript errors to gRPC status codes.

```typescript
function errorHandlerMiddleware<TRequest, TResponse>(
  handler: UnaryHandler<TRequest, TResponse>
): UnaryHandler<TRequest, TResponse>
```

**Error Mapping:**
- `TypeError` → `INVALID_ARGUMENT`
- `RangeError` → `OUT_OF_RANGE`
- Validation errors → `INVALID_ARGUMENT`
- Unknown errors → `INTERNAL`

---

## Type Definitions

### GreetingStyle

```typescript
enum GreetingStyle {
  UNSPECIFIED = 0,
  CASUAL = 1,
  FORMAL = 2,
  FRIENDLY = 3
}
```

### GreetRequest

```typescript
interface GreetRequest {
  name: string;
  language?: string;
  options?: GreetingOptions;
}
```

### GreetingOptions

```typescript
interface GreetingOptions {
  style?: GreetingStyle;
  include_timestamp?: boolean;
  metadata?: Record<string, string>;
}
```

### GreetResponse

```typescript
interface GreetResponse {
  reply: string;
  timestamp?: string;
  metadata?: ResponseMetadata;
}
```

### ResponseMetadata

```typescript
interface ResponseMetadata {
  server_version?: string;
  request_id?: string;
  [key: string]: string | undefined;
}
```

### StreamGreetingsRequest

```typescript
interface StreamGreetingsRequest {
  name: string;
  count?: number;
  language?: string;
  options?: GreetingOptions;
}
```

### AccumulatedResponse

```typescript
interface AccumulatedResponse {
  total_greetings: number;
  names: string[];
  summary: string;
  metadata?: ResponseMetadata;
}
```

### ChatMessage

```typescript
interface ChatMessage {
  message: string;
  sender?: string;
  timestamp?: string;
  metadata?: Record<string, string>;
}
```

---

## Error Handling

### Client-Side Errors

```typescript
try {
  const response = await stub.methods.greet({ name: '' });
} catch (error) {
  if (error.code === grpc.status.INVALID_ARGUMENT) {
    console.error('Invalid request:', error.message);
  } else if (error.code === grpc.status.UNAVAILABLE) {
    console.error('Server unavailable');
  } else {
    console.error('Unknown error:', error);
  }
}
```

### Common gRPC Status Codes

- `OK` (0) - Success
- `CANCELLED` (1) - Operation cancelled
- `INVALID_ARGUMENT` (3) - Invalid request parameters
- `NOT_FOUND` (5) - Resource not found
- `INTERNAL` (13) - Internal server error
- `UNAVAILABLE` (14) - Service unavailable

### React Error Boundaries

```typescript
class ErrorBoundary extends Component {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Error: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}
```

---

## Best Practices

### Performance

1. **Use Dynamic Imports** for code splitting:
   ```typescript
   const { GreetingServiceStub } = await import('./proto/greeting.proto');
   ```

2. **Memoize Stubs** to avoid recreation:
   ```typescript
   const stub = useMemo(
     () => new GreetingServiceStub(serverUrl),
     [serverUrl]
   );
   ```

3. **Batch Requests** when possible using streaming RPCs

### Error Handling

1. **Always Handle Errors**:
   ```typescript
   const { data, error } = useGrpc(...);
   if (error) return <ErrorDisplay error={error} />;
   ```

2. **Use Error Boundaries** for Suspense:
   ```typescript
   <ErrorBoundary>
     <Suspense fallback={<Loading />}>
       <Component />
     </Suspense>
   </ErrorBoundary>
   ```

3. **Provide User-Friendly Messages**:
   ```typescript
   const getErrorMessage = (error: Error) => {
     if (error.code === grpc.status.UNAVAILABLE) {
       return 'Server is temporarily unavailable';
     }
     return error.message;
   };
   ```

### Type Safety

1. **Use Generated Types**:
   ```typescript
   import type { GreetRequest, GreetResponse } from './proto/greeting.proto';
   ```

2. **Validate Input**:
   ```typescript
   if (!name.trim()) {
     throw new Error('Name is required');
   }
   ```

3. **Type Guards** for runtime safety:
   ```typescript
   function isValidResponse(res: any): res is GreetResponse {
     return res && typeof res.reply === 'string';
   }
   ```
