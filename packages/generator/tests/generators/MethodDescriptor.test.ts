/**
 * Tests for Method Descriptor Generation (Task 2.4)
 *
 * This test suite verifies that ServiceGenerator correctly generates:
 * 1. Service descriptor constants with fully qualified service names
 * 2. Method descriptors for each RPC with complete metadata
 * 3. Proper TypeScript typing for method descriptors
 */

import { ServiceGenerator } from '../../src/generators/ServiceGenerator';
import {
  ServiceDefinition,
  MethodDefinition,
  ProtoFile
} from '../../src/core/proto-types';

describe('Method Descriptor Generation (Task 2.4)', () => {
  let generator: ServiceGenerator;

  beforeEach(() => {
    generator = new ServiceGenerator({
      serverUrl: 'http://localhost:8080',
      generateComments: true,
      generateReactHooks: false,
      generateSuspenseHooks: false,
    });
  });

  /**
   * Helper function to create a test proto file
   */
  const createTestProtoFile = (packageName?: string): ProtoFile => ({
    fileName: 'test.proto',
    package: packageName || 'test.services',
    syntax: 'proto3',
    imports: [],
    services: [],
    messages: [
      {
        name: 'GetUserRequest',
        fields: [
          {
            name: 'user_id',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {},
          },
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {},
      },
      {
        name: 'GetUserResponse',
        fields: [
          {
            name: 'id',
            number: 1,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {},
          },
          {
            name: 'name',
            number: 2,
            type: 'string',
            repeated: false,
            optional: false,
            map: false,
            options: {},
          },
        ],
        nestedMessages: [],
        nestedEnums: [],
        oneofs: [],
        options: {},
      },
    ],
    enums: [],
    options: {},
  });

  describe('MethodDescriptor Interface', () => {
    it('should generate MethodDescriptor interface definition', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [
          {
            name: 'GetUser',
            inputType: 'GetUserRequest',
            outputType: 'GetUserResponse',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile();
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify method descriptor structure is present in generated code
      expect(result.content).toContain('Service descriptor for');
      expect(result.content).toContain('Method descriptor for');
      expect(result.content).toContain('methodName:');
      expect(result.content).toContain('requestStream:');
      expect(result.content).toContain('responseStream:');
    });
  });

  describe('Service Descriptor Constant', () => {
    it('should generate service descriptor constant with service name', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [],
        options: {},
      };
      const protoFile = createTestProtoFile('test.services');
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify service descriptor constant exists
      expect(result.content).toContain('export const UserServiceService');
      expect(result.content).toContain("serviceName: 'UserService'");
    });

    it('should generate fully qualified service name with package', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [],
        options: {},
      };
      const protoFile = createTestProtoFile('test.services');
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify fully qualified service name includes package
      expect(result.content).toContain("fullServiceName: 'test.services.UserService'");
    });

    it('should generate fully qualified service name without package when no package is defined', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [],
        options: {},
      };
      const protoFile = createTestProtoFile('');
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify fully qualified service name is just the service name when no package
      expect(result.content).toContain("fullServiceName: 'UserService'");
    });

    it('should generate service descriptor with methods object', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [
          {
            name: 'GetUser',
            inputType: 'GetUserRequest',
            outputType: 'GetUserResponse',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile();
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify methods object exists in service descriptor
      expect(result.content).toContain('methods: {');
    });
  });

  describe('Method Descriptor Generation', () => {
    it('should generate method descriptor for unary RPC', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [
          {
            name: 'GetUser',
            inputType: 'GetUserRequest',
            outputType: 'GetUserResponse',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile('test.services');
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify method descriptor structure
      expect(result.content).toContain('GetUserDescriptor: {');
      expect(result.content).toContain("methodName: 'GetUser'");
      expect(result.content).toContain('requestStream: false');
      expect(result.content).toContain('responseStream: false');
    });

    it('should generate method descriptor for server streaming RPC', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [
          {
            name: 'ListUsers',
            inputType: 'ListUsersRequest',
            outputType: 'ListUsersResponse',
            clientStreaming: false,
            serverStreaming: true,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile('test.services');
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify server streaming flags
      expect(result.content).toContain('ListUsers: {');
      expect(result.content).toContain("methodName: 'ListUsers'");
      expect(result.content).toContain('requestStream: false');
      expect(result.content).toContain('responseStream: true');
    });

    it('should generate method descriptor for client streaming RPC', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [
          {
            name: 'UploadUsers',
            inputType: 'UploadUserRequest',
            outputType: 'UploadUserResponse',
            clientStreaming: true,
            serverStreaming: false,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile('test.services');
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify client streaming flags
      expect(result.content).toContain('UploadUsers: {');
      expect(result.content).toContain("methodName: 'UploadUsers'");
      expect(result.content).toContain('requestStream: true');
      expect(result.content).toContain('responseStream: false');
    });

    it('should generate method descriptor for bidirectional streaming RPC', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [
          {
            name: 'SyncUsers',
            inputType: 'SyncUserRequest',
            outputType: 'SyncUserResponse',
            clientStreaming: true,
            serverStreaming: true,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile('test.services');
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify bidirectional streaming flags
      expect(result.content).toContain('SyncUsers: {');
      expect(result.content).toContain("methodName: 'SyncUsers'");
      expect(result.content).toContain('requestStream: true');
      expect(result.content).toContain('responseStream: true');
    });

    it('should generate typed method descriptors with generic types', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [
          {
            name: 'GetUser',
            inputType: 'GetUserRequest',
            outputType: 'GetUserResponse',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile();
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify generic type annotation
      expect(result.content).toContain('as MethodDescriptor<GetUserRequest, GetUserResponse>');
    });
  });

  describe('Multiple Methods', () => {
    it('should generate descriptors for all methods in a service', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [
          {
            name: 'GetUser',
            inputType: 'GetUserRequest',
            outputType: 'GetUserResponse',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
          {
            name: 'ListUsers',
            inputType: 'ListUsersRequest',
            outputType: 'ListUsersResponse',
            clientStreaming: false,
            serverStreaming: true,
            options: {},
          },
          {
            name: 'CreateUser',
            inputType: 'CreateUserRequest',
            outputType: 'CreateUserResponse',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile('test.services');
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify all method descriptors are present
      expect(result.content).toContain('GetUser: {');
      expect(result.content).toContain('ListUsers: {');
      expect(result.content).toContain('CreateUser: {');

      // Verify each has correct metadata
      expect(result.content).toContain("methodName: 'GetUser'");
      expect(result.content).toContain("methodName: 'ListUsers'");
      expect(result.content).toContain("methodName: 'CreateUser'");
    });

    it('should generate descriptors for all four RPC types in one service', () => {
      const service: ServiceDefinition = {
        name: 'CompleteService',
        methods: [
          {
            name: 'Unary',
            inputType: 'Request',
            outputType: 'Response',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
          {
            name: 'ServerStream',
            inputType: 'Request',
            outputType: 'Response',
            clientStreaming: false,
            serverStreaming: true,
            options: {},
          },
          {
            name: 'ClientStream',
            inputType: 'Request',
            outputType: 'Response',
            clientStreaming: true,
            serverStreaming: false,
            options: {},
          },
          {
            name: 'BidiStream',
            inputType: 'Request',
            outputType: 'Response',
            clientStreaming: true,
            serverStreaming: true,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile();
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify all four RPC types have descriptors
      expect(result.content).toContain('Unary: {');
      expect(result.content).toContain('ServerStream: {');
      expect(result.content).toContain('ClientStream: {');
      expect(result.content).toContain('BidiStream: {');

      // Verify correct streaming flags for each type
      const unarySection = result.content.substring(
        result.content.indexOf('Unary: {'),
        result.content.indexOf('ServerStream: {')
      );
      expect(unarySection).toContain('requestStream: false');
      expect(unarySection).toContain('responseStream: false');

      const serverStreamSection = result.content.substring(
        result.content.indexOf('ServerStream: {'),
        result.content.indexOf('ClientStream: {')
      );
      expect(serverStreamSection).toContain('requestStream: false');
      expect(serverStreamSection).toContain('responseStream: true');

      const clientStreamSection = result.content.substring(
        result.content.indexOf('ClientStream: {'),
        result.content.indexOf('BidiStream: {')
      );
      expect(clientStreamSection).toContain('requestStream: true');
      expect(clientStreamSection).toContain('responseStream: false');
    });
  });

  describe('JSDoc Comments', () => {
    it('should include JSDoc comments for service descriptor', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [],
        options: {},
      };
      const protoFile = createTestProtoFile();
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify JSDoc comment above service descriptor
      expect(result.content).toContain('/**');
      expect(result.content).toContain('* Service descriptor for UserService');
      expect(result.content).toContain('*/');
    });

    it('should include JSDoc comments for method descriptors', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [
          {
            name: 'GetUser',
            inputType: 'GetUserRequest',
            outputType: 'GetUserResponse',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile();
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify JSDoc comment above method descriptor
      const getUserSection = result.content.substring(
        result.content.indexOf('methods: {'),
        result.content.indexOf('} as const;')
      );
      expect(getUserSection).toContain('/**');
      expect(getUserSection).toContain('* GetUser method descriptor');
      expect(getUserSection).toContain('*/');
    });
  });

  describe('TypeScript Compilation', () => {
    it('should generate valid TypeScript with const assertion', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [
          {
            name: 'GetUser',
            inputType: 'GetUserRequest',
            outputType: 'GetUserResponse',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile();
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify const assertion for type narrowing
      expect(result.content).toContain('} as const;');
    });

    it('should generate descriptors that can be used as constants', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [
          {
            name: 'GetUser',
            inputType: 'GetUserRequest',
            outputType: 'GetUserResponse',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile();
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify exported const declaration
      expect(result.content).toContain('export const UserServiceServiceDescriptor');
    });
  });

  describe('Edge Cases', () => {
    it('should handle service with no methods', () => {
      const service: ServiceDefinition = {
        name: 'EmptyService',
        methods: [],
        options: {},
      };
      const protoFile = createTestProtoFile();
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify service descriptor is still generated
      expect(result.content).toContain('export const EmptyServiceServiceDescriptor');
      expect(result.content).toContain('methods: {');
      expect(result.content).toContain('}');
    });

    it('should handle method names with different casing conventions', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [
          {
            name: 'getUser',
            inputType: 'GetUserRequest',
            outputType: 'GetUserResponse',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
          {
            name: 'GET_ALL_USERS',
            inputType: 'GetAllUsersRequest',
            outputType: 'GetAllUsersResponse',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile();
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify method names are preserved exactly as defined
      expect(result.content).toContain("methodName: 'getUser'");
      expect(result.content).toContain("methodName: 'GET_ALL_USERS'");
    });

    it('should handle complex message type names', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [
          {
            name: 'GetUser',
            inputType: 'com.example.user.v1.GetUserRequest',
            outputType: 'com.example.user.v1.GetUserResponse',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile();
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify fully qualified message type names
      expect(result.content).toContain("requestType: 'com.example.user.v1.GetUserRequest'");
      expect(result.content).toContain("responseType: 'com.example.user.v1.GetUserResponse'");
    });
  });

  describe('Integration with gRPC-Web', () => {
    it('should generate descriptors compatible with @improbable-eng/grpc-web', () => {
      const service: ServiceDefinition = {
        name: 'UserService',
        methods: [
          {
            name: 'GetUser',
            inputType: 'GetUserRequest',
            outputType: 'GetUserResponse',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile('test.services');
      protoFile.services = [service];

      const result = generator.generateStub(service, protoFile);

      // Verify descriptor has all required fields for gRPC-web integration
      expect(result.content).toContain('methodName');
      expect(result.content).toContain('serviceName');
      expect(result.content).toContain('requestType');
      expect(result.content).toContain('responseType');
      expect(result.content).toContain('requestStream');
      expect(result.content).toContain('responseStream');
    });
  });
});
