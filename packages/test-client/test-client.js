/**
 * This is an example of what the Hallow generator would produce.
 * It demonstrates gRPC-Web client code that communicates with the test server.
 */

const { grpc } = require('@improbable-eng/grpc-web');
const { NodeHttpTransport } = require('@improbable-eng/grpc-web-node-http-transport');

// Set up transport for Node.js
grpc.setDefaultTransport(NodeHttpTransport());

// Simple message serialization (normally would use google-protobuf)
class GetUserRequest {
  constructor(data = {}) {
    this.user_id = data.user_id || '';
  }

  serializeBinary() {
    // Simplified protobuf serialization
    // Field 1 (user_id) as string
    const encoder = new TextEncoder();
    const userIdBytes = encoder.encode(this.user_id);

    // Create buffer with field tag and length
    const buffer = new Uint8Array(2 + userIdBytes.length);
    buffer[0] = 0x0a; // Field 1, wire type 2 (length-delimited)
    buffer[1] = userIdBytes.length;
    buffer.set(userIdBytes, 2);

    return buffer;
  }

  static deserializeBinary(bytes) {
    // Simplified deserialization
    const request = new GetUserRequest();
    if (bytes.length > 2) {
      const decoder = new TextDecoder();
      request.user_id = decoder.decode(bytes.slice(2));
    }
    return request;
  }
}

class GetUserResponse {
  constructor(data = {}) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.email = data.email || '';
  }

  static deserializeBinary(bytes) {
    // Simplified protobuf deserialization
    const response = new GetUserResponse();
    const decoder = new TextDecoder();
    let offset = 0;

    while (offset < bytes.length) {
      const tag = bytes[offset];
      const fieldNumber = tag >> 3;
      offset++;

      if (offset >= bytes.length) break;
      const length = bytes[offset];
      offset++;

      if (offset + length > bytes.length) break;
      const value = decoder.decode(bytes.slice(offset, offset + length));
      offset += length;

      switch (fieldNumber) {
        case 1: response.id = value; break;
        case 2: response.name = value; break;
        case 3: response.email = value; break;
      }
    }

    return response;
  }
}

// Service definition
const UserService = {
  serviceName: "test.services.UserService",
  GetUser: {
    methodName: "GetUser",
    service: null, // Will be set below
    requestStream: false,
    responseStream: false,
    requestType: GetUserRequest,
    responseType: GetUserResponse
  }
};

UserService.GetUser.service = UserService;

// Client Stub (what the generator would create)
class UserServiceClient {
  constructor(hostname, credentials, options) {
    this.hostname = hostname;
    this.credentials = credentials || {};
    this.options = options || {};
  }

  getUser(request, metadata) {
    return new Promise((resolve, reject) => {
      grpc.unary(UserService.GetUser, {
        request: request,
        host: this.hostname,
        metadata: metadata || new grpc.Metadata(),
        transport: grpc.CrossBrowserHttpTransport ? undefined : NodeHttpTransport(),
        debug: true, // Enable debug to see what's happening
        onEnd: function (response) {
          if (response.status === grpc.Code.OK) {
            resolve(response.message);
          } else {
            reject({
              code: response.status,
              message: response.statusMessage,
              trailers: response.trailers
            });
          }
        }
      });
    });
  }
}

// Test the client
async function testGrpcClient() {
  console.log('🚀 Testing gRPC-Web Client Generated Code\n');
  console.log('Connecting to test-server at http://localhost:3000...\n');

  try {
    // Create client instance
    const client = new UserServiceClient('http://localhost:3000');

    // Test GetUser (Unary RPC)
    console.log('📍 Testing Unary RPC: GetUser');
    console.log('   Request: { user_id: "user-1" }');

    const request = new GetUserRequest({ user_id: 'user-1' });
    const response = await client.getUser(request);

    console.log('   ✅ Response:');
    console.log(`      - ID: ${response.id}`);
    console.log(`      - Name: ${response.name}`);
    console.log(`      - Email: ${response.email}`);
    console.log();

    // Test with different user IDs
    console.log('📍 Testing with user-2:');
    const request2 = new GetUserRequest({ user_id: 'user-2' });
    const response2 = await client.getUser(request2);
    console.log(`   ✅ Got user: ${response2.name} (${response2.email})`);
    console.log();

    console.log('📍 Testing with user-3:');
    const request3 = new GetUserRequest({ user_id: 'user-3' });
    const response3 = await client.getUser(request3);
    console.log(`   ✅ Got user: ${response3.name} (${response3.email})`);
    console.log();

    console.log('✨ All tests passed! The generator-style code works correctly with the test server.');
    console.log('\n📝 Summary:');
    console.log('   - gRPC-Web client successfully connected to NestJS server');
    console.log('   - Unary RPC calls working correctly');
    console.log('   - Message serialization/deserialization working');
    console.log('   - This demonstrates how Hallow generator output would work');

  } catch (error) {
    console.error('❌ Error during testing:', error);
    console.error('\nMake sure the test-server is running on port 3000');
    console.error('You can start it with: cd packages/test-server && yarn start');
  }
}

// Add NodeHttpTransport for Node.js environment
if (typeof window === 'undefined') {
  const { NodeHttpTransport } = require('@improbable-eng/grpc-web-node-http-transport');
  grpc.setDefaultTransport(NodeHttpTransport());
}

// Run the test
testGrpcClient();