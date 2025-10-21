# gRPC Test Server Services

## Server Information
- **gRPC Port**: 50051
- **gRPC-Web Port**: 8080 (via Envoy proxy)
- **HTTP Health**: http://localhost:3000/health
- **Proto Package**: `test.services`

## Available Services

### UserService

**Proto file**: `src/proto/service.proto`

#### Methods

##### 1. GetUser (Unary RPC)
```protobuf
rpc GetUser(GetUserRequest) returns (GetUserResponse);
```
- **Request**: `{"user_id": "user-1"}`
- **Response**: `{"id": "user-1", "name": "Alice Johnson", "email": "alice@example.com"}`

**Test with grpcurl**:
```bash
grpcurl -plaintext -proto src/proto/service.proto \
  -d '{"user_id": "user-1"}' \
  localhost:50051 test.services.UserService/GetUser
```

##### 2. ListUsers (Server Streaming RPC)
```protobuf
rpc ListUsers(ListUsersRequest) returns (stream ListUsersResponse);
```
- **Request**: `{"page_size": 3, "page_token": "0"}`
- **Response**: Multiple messages with user batches

**Test with grpcurl**:
```bash
grpcurl -plaintext -proto src/proto/service.proto \
  -d '{"page_size": 3}' \
  localhost:50051 test.services.UserService/ListUsers
```

##### 3. CreateUsers (Client Streaming RPC)
```protobuf
rpc CreateUsers(stream CreateUserRequest) returns (ListUsersResponse);
```
- **Request**: Stream of `{"name": "John", "email": "john@example.com"}`
- **Response**: List of created users

**Test with grpcurl**:
```bash
echo '{"name":"John","email":"john@example.com"}
{"name":"Jane","email":"jane@example.com"}' | \
grpcurl -plaintext -proto src/proto/service.proto \
  -d @ \
  localhost:50051 test.services.UserService/CreateUsers
```

##### 4. Chat (Bidirectional Streaming RPC)
```protobuf
rpc Chat(stream StreamMessage) returns (stream StreamMessage);
```
- **Request/Response**: `{"content": "Hello", "timestamp": "1234567890"}`

**Test with grpcurl**:
```bash
echo '{"content":"Hello","timestamp":"'$(date +%s)'"}' | \
grpcurl -plaintext -proto src/proto/service.proto \
  -d @ \
  localhost:50051 test.services.UserService/Chat
```

## Using Without Reflection API

Since gRPC reflection is not enabled, you need to provide the proto file when using `grpcurl`:

```bash
# Always include -proto flag
grpcurl -plaintext -proto src/proto/service.proto \
  localhost:50051 list

# List specific service
grpcurl -plaintext -proto src/proto/service.proto \
  localhost:50051 list test.services.UserService
```

## Testing with gRPC-Web

When using Envoy proxy (port 8080), you can test with gRPC-Web clients:

```javascript
import { UserServiceStub } from './service.proto';

const stub = new UserServiceStub('http://localhost:8080');
const response = await stub.methods.GetUser({ user_id: 'user-1' });
```

## Health Check

HTTP endpoint provides service information:

```bash
curl http://localhost:3000/health
```

Returns:
```json
{
  "status": "healthy",
  "services": ["UserService"],
  "grpc": {
    "port": 50051,
    "methods": [
      "test.services.UserService/GetUser",
      "test.services.UserService/ListUsers",
      "test.services.UserService/CreateUsers",
      "test.services.UserService/Chat"
    ]
  },
  "timestamp": "2025-10-21T00:00:00.000Z"
}
```