const { createParser } = require('./dist');

const parser = createParser();

const simpleProto = `
syntax = "proto3";

service Greeter {
  rpc SayHello (HelloRequest) returns (HelloReply);
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}
`;

console.log('Parsing simple proto...');
const result = parser.parseContent(simpleProto);
console.log('Result:', JSON.stringify(result, null, 2));
console.log('Errors:', parser.getErrors());