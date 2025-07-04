import { ProtoParser } from '../src/parser/ProtoParser';
import * as fs from 'fs';
import * as path from 'path';

describe('ProtoParser', () => {
  let parser: ProtoParser;

  beforeEach(() => {
    parser = new ProtoParser();
  });

  describe('parseFromString', () => {
    it('should parse a simple proto file from string', async () => {
      const protoContent = `
syntax = "proto3";

package greeting;

message GreetingRequest {
  string name = 1;
  int32 age = 2;
}

message GreetingResponse {
  string message = 1;
  int64 timestamp = 2;
}

service GreetingService {
  rpc Greeting(GreetingRequest) returns (GreetingResponse);
  rpc StreamGreeting(GreetingRequest) returns (stream GreetingResponse);
}
      `;

      const result = await parser.parseFromString(protoContent);

      expect(result.errors).toHaveLength(0);
      expect(result.package.services).toBeDefined();
      expect(result.package.messages).toBeDefined();

      const greetingService = result.package.services['GreetingService'];
      expect(greetingService).toBeDefined();
      expect(greetingService.methods).toHaveLength(2);

      const greetingMethod = greetingService.methods.find(
        m => m.name === 'Greeting'
      );
      expect(greetingMethod).toBeDefined();
      expect(greetingMethod?.requestType).toBe('GreetingRequest');
      expect(greetingMethod?.responseType).toBe('GreetingResponse');
      expect(greetingMethod?.responseStream).toBe(false);

      const streamMethod = greetingService.methods.find(
        m => m.name === 'StreamGreeting'
      );
      expect(streamMethod).toBeDefined();
      expect(streamMethod?.responseStream).toBe(true);

      expect(result.package.messages['GreetingRequest']).toBeDefined();
      expect(result.package.messages['GreetingResponse']).toBeDefined();

      const requestMessage = result.package.messages['GreetingRequest'];
      expect(requestMessage.fields).toHaveLength(2);
      expect(requestMessage.fields[0].name).toBe('name');
      expect(requestMessage.fields[0].type).toBe('string');
      expect(requestMessage.fields[1].name).toBe('age');
      expect(requestMessage.fields[1].type).toBe('int32');
    });

    it('should handle parse errors gracefully', async () => {
      const invalidProto = 'invalid proto content';

      const result = await parser.parseFromString(invalidProto);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.package.services).toEqual({});
      expect(result.package.messages).toEqual({});
    });
  });

  describe('parseFromFile', () => {
    it('should parse a proto file from file system', async () => {
      const protoPath = path.join(__dirname, 'sample.proto');

      const result = await parser.parseFromFile(protoPath);

      expect(result.errors).toHaveLength(0);
      expect(result.package.services['GreetingService']).toBeDefined();
      expect(result.package.messages['GreetingRequest']).toBeDefined();
      expect(result.package.messages['GreetingResponse']).toBeDefined();
    });
  });

  describe('utility methods', () => {
    it('should extract service names', async () => {
      const protoContent = `
syntax = "proto3";
service TestService {
  rpc Test(TestRequest) returns (TestResponse);
}
message TestRequest {}
message TestResponse {}
      `;

      const result = await parser.parseFromString(protoContent);
      const serviceNames = parser.extractServiceNames(result.package);

      expect(serviceNames).toContain('TestService');
    });

    it('should extract message names', async () => {
      const protoContent = `
syntax = "proto3";
message TestMessage {
  string test = 1;
}
      `;

      const result = await parser.parseFromString(protoContent);
      const messageNames = parser.extractMessageNames(result.package);

      expect(messageNames).toContain('TestMessage');
    });

    it('should get service methods', async () => {
      const protoContent = `
syntax = "proto3";
service TestService {
  rpc Method1(TestRequest) returns (TestResponse);
  rpc Method2(TestRequest) returns (TestResponse);
}
message TestRequest {}
message TestResponse {}
      `;

      const result = await parser.parseFromString(protoContent);
      const methods = parser.getServiceMethods(result.package, 'TestService');

      expect(methods).toHaveLength(2);
      expect(methods.map(m => m.name)).toContain('Method1');
      expect(methods.map(m => m.name)).toContain('Method2');
    });
  });
});
