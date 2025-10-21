/**
 * Test client using native gRPC (what the Hallow generator would produce for Node.js)
 * This demonstrates direct gRPC communication without gRPC-Web proxy
 */

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

// Load proto file dynamically (simulating what generator does internally)
const PROTO_PATH = path.join(__dirname, '../test-server/src/proto/service.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const UserService = protoDescriptor.test.services.UserService;

// Test functions
async function testUnaryCall(client) {
  console.log('📍 Testing Unary RPC: GetUser');
  console.log('   Request: { user_id: "user-1" }');

  return new Promise((resolve, reject) => {
    client.GetUser({ user_id: 'user-1' }, (error, response) => {
      if (error) {
        reject(error);
      } else {
        console.log('   ✅ Response:');
        console.log(`      - ID: ${response.id}`);
        console.log(`      - Name: ${response.name}`);
        console.log(`      - Email: ${response.email}`);
        resolve(response);
      }
    });
  });
}

async function testServerStreaming(client) {
  console.log('\n📍 Testing Server Streaming RPC: ListUsers');
  console.log('   Request: { page_size: 10 }');

  return new Promise((resolve, reject) => {
    const call = client.ListUsers({ page_size: 10 });
    const users = [];

    call.on('data', (user) => {
      console.log(`   ✅ Received user: ${user.name} (${user.email})`);
      users.push(user);
    });

    call.on('end', () => {
      console.log(`   Total users received: ${users.length}`);
      resolve(users);
    });

    call.on('error', (error) => {
      reject(error);
    });
  });
}

async function testClientStreaming(client) {
  console.log('\n📍 Testing Client Streaming RPC: CreateUsers');

  return new Promise((resolve, reject) => {
    const call = client.CreateUsers((error, response) => {
      if (error) {
        reject(error);
      } else {
        console.log('   ✅ Response:');
        console.log(`      - Users created: ${response.count}`);
        console.log(`      - Message: ${response.message}`);
        resolve(response);
      }
    });

    // Send multiple users
    const users = [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
      { name: 'Charlie', email: 'charlie@example.com' }
    ];

    users.forEach((user, index) => {
      console.log(`   Sending user ${index + 1}: ${user.name}`);
      call.write(user);
    });

    call.end();
  });
}

async function testBidirectionalStreaming(client) {
  console.log('\n📍 Testing Bidirectional Streaming RPC: Chat');

  return new Promise((resolve, reject) => {
    const call = client.Chat();
    const messages = [];

    call.on('data', (response) => {
      console.log(`   ✅ Received: ${response.message} (from ${response.user_id})`);
      messages.push(response);
    });

    call.on('end', () => {
      console.log(`   Chat ended. Total messages: ${messages.length}`);
      resolve(messages);
    });

    call.on('error', (error) => {
      reject(error);
    });

    // Send chat messages
    const chatMessages = [
      { user_id: 'user1', message: 'Hello from Node.js!' },
      { user_id: 'user1', message: 'This is a test message.' },
      { user_id: 'user1', message: 'Testing bidirectional streaming!' }
    ];

    chatMessages.forEach((msg, index) => {
      setTimeout(() => {
        console.log(`   Sending: ${msg.message}`);
        call.write(msg);

        if (index === chatMessages.length - 1) {
          setTimeout(() => call.end(), 100);
        }
      }, index * 500);
    });
  });
}

// Main test function
async function testGrpcNative() {
  console.log('🚀 Testing Native gRPC Client (Hallow Generator Style)\n');
  console.log('Connecting to test-server at localhost:50051...\n');

  // Create client (what the generator would produce)
  const client = new UserService(
    'localhost:50051',
    grpc.credentials.createInsecure()
  );

  try {
    // Test all RPC patterns
    await testUnaryCall(client);
    await testServerStreaming(client);
    await testClientStreaming(client);
    await testBidirectionalStreaming(client);

    console.log('\n✨ All tests passed! The generator-style code works correctly with the test server.');
    console.log('\n📝 Summary:');
    console.log('   - Native gRPC client successfully connected to NestJS server');
    console.log('   - Unary RPC calls working correctly');
    console.log('   - Server streaming working correctly');
    console.log('   - Client streaming working correctly');
    console.log('   - Bidirectional streaming working correctly');
    console.log('   - This demonstrates how Hallow generator output would work');

  } catch (error) {
    console.error('\n❌ Error during testing:', error);
    console.error('\nMake sure the test-server is running on port 50051');
    console.error('You can start it with: cd packages/test-server && yarn start');
  }
}

// Run the test
testGrpcNative();