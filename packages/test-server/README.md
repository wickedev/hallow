# Hallow gRPC Test Server

NestJS-based gRPC server with gRPC-Web support for integration testing.

## Features

- ✅ Full gRPC service implementation
- ✅ All RPC types supported (unary, server streaming, client streaming, bidirectional)
- ✅ gRPC-Web support via Envoy proxy
- ✅ Docker containerization for consistent testing
- ✅ NestJS framework for clean architecture

## Services

### UserService

Located at `test.services.UserService`, implements all four gRPC RPC patterns:

#### GetUser (Unary RPC)
Get a single user by ID.

**Request**: `GetUserRequest { user_id: string }`
**Response**: `GetUserResponse { id, name, email }`

**Error Scenarios**:
- `user_id="error-not-found"` → `NOT_FOUND` error
- `user_id="error-internal"` → `INTERNAL` error
- `user_id="error-unavailable"` → `UNAVAILABLE` error
- `user_id="error-deadline"` → `DEADLINE_EXCEEDED` error
- Non-existent user ID → `NOT_FOUND` error

**Example**:
```typescript
const response = await stub.GetUser({ user_id: '1' });
console.log(response.name); // "Alice"
```

#### ListUsers (Server Streaming RPC)
Stream paginated user lists from the server.

**Request**: `ListUsersRequest { page_size: number, page_token?: string }`
**Response Stream**: `ListUsersResponse { users: User[], next_page_token: string }`

**Behavior**:
- Chunks users based on `page_size`
- Sends each chunk as a separate message
- 10ms delay between chunks (simulates real-world streaming)
- Empty `next_page_token` on last chunk

**Error Scenarios**:
- `page_size=-1` → `INVALID_ARGUMENT` error
- `page_size=-2` → `UNAVAILABLE` error

**Example**:
```typescript
const stream = stub.ListUsers({ page_size: 2 });
for await (const response of stream) {
  console.log('Received users:', response.users);
}
```

#### CreateUsers (Client Streaming RPC)
Create multiple users by streaming requests to the server.

**Request Stream**: `CreateUserRequest { name: string, email: string }`
**Response**: `ListUsersResponse { users: User[], next_page_token: string }`

**Behavior**:
- Accepts multiple `CreateUserRequest` messages
- Auto-generates user IDs
- Stores users in-memory
- Returns all created users after stream ends
- Supports empty stream (0 users)

**Error Scenarios**:
- `name="error"` → `INVALID_ARGUMENT` error with message "Cannot create user with name 'error'"

**Example**:
```typescript
const call = adapter.clientStream(createUsersDescriptor);
call.write({ name: 'Alice', email: 'alice@example.com' });
call.write({ name: 'Bob', email: 'bob@example.com' });
call.end();
const response = await call.getResponse();
console.log('Created users:', response.users);
```

#### Chat (Bidirectional Streaming RPC)
Real-time bidirectional chat functionality.

**Request/Response**: `StreamMessage { content: string, timestamp: number }`

**Behavior**:
- Echoes each received message with "Echo: " prefix
- Client and server can send/receive concurrently
- Server sends final "Chat session ended" message when client ends
- Timestamps are updated by server

**Error Scenarios**:
- `content="error-internal"` → `INTERNAL` error, stream terminated
- `content="error-unavailable"` → `UNAVAILABLE` error, stream terminated

**Example**:
```typescript
const call = adapter.bidiStream(chatDescriptor);

// Subscribe to responses
call.responses().subscribe({
  next: (msg) => console.log('Received:', msg.content),
  complete: () => console.log('Chat ended')
});

// Send messages
call.write({ content: 'Hello', timestamp: Date.now() });
call.write({ content: 'World', timestamp: Date.now() });
call.end();
```

## Quick Start

### Using Docker (Recommended)

```bash
# Start all services
./scripts/start-test-server.sh

# Or manually with docker-compose
docker-compose up --build
```

### Local Development

```bash
# Install dependencies
yarn install

# Start in development mode
yarn start:dev

# Build for production
yarn build
yarn start:prod
```

## Endpoints

- **gRPC**: `localhost:50051`
- **gRPC-Web**: `http://localhost:8080` (via Envoy proxy)
- **HTTP/Health**: `http://localhost:3000`
- **Envoy Admin**: `http://localhost:9901`

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  gRPC-Web   │────▶│    Envoy    │────▶│   NestJS     │
│   Client    │     │    Proxy    │     │  gRPC Server │
└─────────────┘     └─────────────┘     └──────────────┘
     :8080              :8080→:50051         :50051
```

## Testing with Hallow

This server is designed to test the Hallow gRPC-Web client library and NativeGrpcAdapter:

```typescript
import { UserServiceStub } from './service.proto';

// Connect to test server via Envoy (gRPC-Web)
const stub = new UserServiceStub('http://localhost:8080');

// Test unary RPC
const user = await stub.methods.GetUser({ user_id: '1' });

// Test server streaming
const stream = stub.methods.ListUsers({ page_size: 5 });
for await (const response of stream) {
  console.log('Received users:', response.users);
}

// Test client streaming
const call = stub.methods.CreateUsers();
call.write({ name: 'Alice', email: 'alice@example.com' });
call.write({ name: 'Bob', email: 'bob@example.com' });
call.end();
const response = await call.getResponse();

// Test bidirectional streaming
const chat = stub.methods.Chat();
chat.responses().subscribe({
  next: (msg) => console.log('Received:', msg.content),
  error: (err) => console.error('Error:', err),
  complete: () => console.log('Chat ended')
});
chat.write({ content: 'Hello', timestamp: Date.now() });
chat.end();
```

## Programmatic Server Management (Integration Tests)

The `TestGrpcServer` class provides programmatic lifecycle management for automated tests:

```typescript
import { TestGrpcServer } from '@hallow/test-server';

describe('My Integration Tests', () => {
  let server: TestGrpcServer;

  beforeAll(async () => {
    // Start test server with custom ports
    server = new TestGrpcServer({
      httpPort: 3001,
      grpcPort: 50052,
      debug: true
    });
    await server.start();
  });

  afterAll(async () => {
    // Clean up server resources
    await server.stop();
  });

  it('should connect to test server', async () => {
    // Server is automatically ready
    expect(await server.isHealthy()).toBe(true);

    // Use server URLs for client connections
    const stub = new UserServiceStub(`http://localhost:${server.getHttpPort()}`);
    // ... your tests
  });
});
```

### TestGrpcServer Features

- **Automatic Lifecycle**: Starts/stops server with proper cleanup
- **Port Conflict Detection**: Clear error messages if ports are in use
- **Health Verification**: Waits for server readiness before tests run
- **Configurable Ports**: Avoid conflicts with multiple test suites
- **Debug Logging**: Optional verbose output for troubleshooting

### Native gRPC Test Server

The `NativeGrpcTestServer` class provides native gRPC (not gRPC-Web) support for testing `NativeGrpcAdapter`:

```typescript
import { NativeGrpcTestServer } from '@hallow/test-server';
import { NativeGrpcAdapter } from '@hallow/generator';

describe('Native gRPC Tests', () => {
  let server: NativeGrpcTestServer;
  let adapter: NativeGrpcAdapter;

  beforeAll(async () => {
    // Start native gRPC server
    server = new NativeGrpcTestServer({
      port: 50052,
      host: '127.0.0.1',
      debug: false
    });
    await server.start();

    // Create adapter
    adapter = new NativeGrpcAdapter({
      serverUrl: '127.0.0.1:50052',
      secure: false
    });
  });

  afterAll(async () => {
    adapter.close();
    await server.stop();
  });

  it('should test all streaming patterns', async () => {
    // Test unary
    const user = await adapter.unary(getUserDescriptor, { user_id: '1' });

    // Test server streaming
    const stream = adapter.serverStream(listUsersDescriptor, { page_size: 2 });
    stream.subscribe({
      next: (response) => console.log('Users:', response.users),
      complete: () => console.log('Stream complete')
    });

    // Test client streaming
    const call = adapter.clientStream(createUsersDescriptor);
    call.write({ name: 'Alice', email: 'alice@test.com' });
    call.end();
    const response = await call.getResponse();

    // Test bidirectional streaming
    const chat = adapter.bidiStream(chatDescriptor);
    chat.responses().subscribe({
      next: (msg) => console.log('Message:', msg.content)
    });
    chat.write({ content: 'Hello', timestamp: Date.now() });
    chat.end();
  });
});
```

## Docker Services

### nestjs-server
- NestJS application with gRPC server
- Exposes ports 3000 (HTTP) and 50051 (gRPC)
- Health check on gRPC port

### envoy
- Envoy proxy for gRPC-Web translation
- Configured with CORS for browser access
- Handles all gRPC-Web protocol requirements

## Development

### Adding New Services

1. Define proto file in `src/proto/`
2. Create service interface in `src/<service>/<service>.interface.ts`
3. Implement service in `src/<service>/<service>.service.ts`
4. Create controller in `src/<service>/<service>.controller.ts`
5. Register in module

### Configuration

- Proto files: `src/proto/`
- Envoy config: `envoy/envoy.yaml`
- Docker setup: `docker-compose.yml`

## Test Coverage

### Supported Test Scenarios

#### Unary RPC
- ✅ Successful single request/response
- ✅ NOT_FOUND errors
- ✅ INTERNAL errors
- ✅ UNAVAILABLE errors
- ✅ DEADLINE_EXCEEDED errors
- ✅ Custom metadata handling

#### Server Streaming RPC
- ✅ Multiple response messages
- ✅ Chunked data streaming
- ✅ Empty streams (no data)
- ✅ Single response streams
- ✅ INVALID_ARGUMENT errors
- ✅ UNAVAILABLE errors
- ✅ Stream cancellation
- ✅ Concurrent streams
- ✅ Metadata and trailers

#### Client Streaming RPC
- ✅ Single request streaming
- ✅ Multiple request streaming
- ✅ Empty streams (no requests)
- ✅ Large batch streaming (50+ messages)
- ✅ INVALID_ARGUMENT errors (name="error")
- ✅ Stream cancellation
- ✅ Timeout handling
- ✅ Multiple sequential calls
- ✅ Concurrent calls

#### Bidirectional Streaming RPC
- ✅ Concurrent send/receive
- ✅ Rapid message exchange
- ✅ Client ending while receiving
- ✅ Server continuing after client end
- ✅ Empty streams
- ✅ INTERNAL errors (content="error-internal")
- ✅ UNAVAILABLE errors (content="error-unavailable")
- ✅ Stream cancellation
- ✅ Multiple concurrent streams
- ✅ Multiple subscribers to same stream

### Known Edge Cases and Limitations

#### General
- Server uses in-memory storage (not persistent)
- Pre-populated with 5 test users (IDs 1-5)
- Auto-generated IDs start from current user count + 1
- All string fields support UTF-8 characters
- No authentication/authorization (test server only)

#### Error Handling
- Error scenarios are triggered by specific input values (see RPC documentation above)
- Errors are deterministic and repeatable
- Network-level errors (connection refused, etc.) are handled by gRPC layer
- Timeout errors require explicit deadline/timeout configuration

#### Streaming Behavior
- Server streaming uses 10ms delays between chunks (configurable via server implementation)
- Client streaming accumulates all requests in memory before processing
- Bidirectional streaming echoes messages immediately
- All streams support graceful shutdown and cancellation
- Stream metadata is properly propagated

#### Performance
- Test server is optimized for correctness, not performance
- Suitable for functional testing, not load testing
- Memory usage scales with number of users created
- Concurrent stream limit depends on gRPC channel configuration

## Troubleshooting

### Port Already in Use
```bash
# Stop all services
docker-compose down

# Check for processes using ports
lsof -i :8080 -i :50051 -i :3000
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f nestjs-server
docker-compose logs -f envoy
```

### Reset Environment
```bash
# Stop and remove all containers
docker-compose down -v

# Rebuild and start fresh
docker-compose up --build
```