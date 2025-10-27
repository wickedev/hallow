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

Located at `test.services.UserService`, implements:

- **GetUser** (Unary RPC): Get a single user by ID
- **ListUsers** (Server Streaming): Stream paginated user lists
- **CreateUsers** (Client Streaming): Create multiple users from stream
- **Chat** (Bidirectional Streaming): Real-time chat functionality

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

This server is designed to test the Hallow gRPC-Web client library:

```typescript
import { UserServiceStub } from './service.proto';

// Connect to test server via Envoy
const stub = new UserServiceStub('http://localhost:8080');

// Test unary RPC
const user = await stub.methods.GetUser({ user_id: 'user-1' });

// Test server streaming
const stream = stub.methods.ListUsers({ page_size: 5 });
for await (const response of stream) {
  console.log('Received users:', response.users);
}
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