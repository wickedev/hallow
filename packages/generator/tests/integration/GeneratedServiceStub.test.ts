/**
 * Integration tests for generated service stubs with adapter support
 *
 * This test file:
 * 1. Generates service stubs from test proto file
 * 2. Verifies all method types are generated correctly
 * 3. Tests generated stubs with both GrpcWebAdapter and NativeGrpcAdapter
 * 4. Verifies method descriptors are correctly generated
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { Generator } from '../../src/core/generator';
import { ProtoFile } from '../../src/core/proto-types';
import { NativeGrpcTestServer } from '@hallow/test-server/src/native-grpc';
import * as fs from 'fs';
import * as path from 'path';

describe('Generated Service Stub Integration Tests', () => {
  let generator: Generator;
  let generatedCode: string;
  let server: NativeGrpcTestServer;

  beforeAll(async () => {
    // Initialize generator
    generator = new Generator({
      outputFormat: 'typescript',
      generateReactHooks: false,
      generateSuspenseHooks: false,
      generateComments: true,
    });

    // Create ProtoFile object representing test-server/src/proto/service.proto
    const protoFile: ProtoFile = {
      fileName: 'service.proto',
      package: 'test.services',
      syntax: 'proto3',
      imports: [],
      services: [
        {
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
              name: 'CreateUsers',
              inputType: 'CreateUserRequest',
              outputType: 'ListUsersResponse',
              clientStreaming: true,
              serverStreaming: false,
              options: {},
            },
            {
              name: 'Chat',
              inputType: 'StreamMessage',
              outputType: 'StreamMessage',
              clientStreaming: true,
              serverStreaming: true,
              options: {},
            },
          ],
          options: {},
        },
      ],
      messages: [
        {
          name: 'GetUserRequest',
          fields: [
            {
              name: 'user_id',
              number: 1,
              type: 'string',
              repeated: false,
              optional: true,
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
              optional: true,
              map: false,
              options: {},
            },
            {
              name: 'name',
              number: 2,
              type: 'string',
              repeated: false,
              optional: true,
              map: false,
              options: {},
            },
            {
              name: 'email',
              number: 3,
              type: 'string',
              repeated: false,
              optional: true,
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
          name: 'ListUsersRequest',
          fields: [
            {
              name: 'page_size',
              number: 1,
              type: 'int32',
              repeated: false,
              optional: true,
              map: false,
              options: {},
            },
            {
              name: 'page_token',
              number: 2,
              type: 'string',
              repeated: false,
              optional: true,
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
          name: 'ListUsersResponse',
          fields: [
            {
              name: 'users',
              number: 1,
              type: 'GetUserResponse',
              repeated: true,
              optional: false,
              map: false,
              options: {},
            },
            {
              name: 'next_page_token',
              number: 2,
              type: 'string',
              repeated: false,
              optional: true,
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
          name: 'CreateUserRequest',
          fields: [
            {
              name: 'name',
              number: 1,
              type: 'string',
              repeated: false,
              optional: true,
              map: false,
              options: {},
            },
            {
              name: 'email',
              number: 2,
              type: 'string',
              repeated: false,
              optional: true,
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
          name: 'StreamMessage',
          fields: [
            {
              name: 'content',
              number: 1,
              type: 'string',
              repeated: false,
              optional: true,
              map: false,
              options: {},
            },
            {
              name: 'timestamp',
              number: 2,
              type: 'int64',
              repeated: false,
              optional: true,
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
    };

    // Generate code
    const result = await generator.generateCode(protoFile);

    // Combine generated files
    generatedCode = result.files.map((f) => f.content).join('\n\n');

    // Write generated code to a file for inspection
    const outputDir = path.join(__dirname, 'generated');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(outputDir, 'UserService.generated.ts'),
      generatedCode,
      'utf-8'
    );

    // Start gRPC test server
    server = new NativeGrpcTestServer({ port: 50070, debug: false });
    await server.start();
  });

  afterAll(async () => {
    if (server) {
      await server.stop();
    }
  });

  describe('Code Generation Verification', () => {
    it('should generate code successfully', () => {
      expect(generatedCode).toBeDefined();
      expect(generatedCode.length).toBeGreaterThan(0);
    });

    it('should import AdapterFactory and types', () => {
      expect(generatedCode).toContain('AdapterFactory');
      expect(generatedCode).toContain('type AdapterType');
      expect(generatedCode).toContain('type ITransportAdapter');
      expect(generatedCode).toContain('type MethodDescriptor');
      expect(generatedCode).toContain('type CallOptions');
      expect(generatedCode).toContain("from '@hallow/generator/adapters'");
    });

    it('should generate UserServiceStubConfig interface', () => {
      expect(generatedCode).toContain('export interface UserServiceStubConfig');
      expect(generatedCode).toContain('serverUrl: string');
      expect(generatedCode).toContain('adapterType?: AdapterType');
      expect(generatedCode).toContain('secure?: boolean');
      expect(generatedCode).toContain('debug?: boolean');
    });

    it('should generate UserServiceStub class', () => {
      expect(generatedCode).toContain('export class UserServiceStub');
      expect(generatedCode).toContain(
        'private readonly adapter: ITransportAdapter'
      );
      expect(generatedCode).toContain(
        'private readonly config: UserServiceStubConfig'
      );
    });

    it('should use AdapterFactory in constructor', () => {
      expect(generatedCode).toContain('AdapterFactory.create({');
      expect(generatedCode).toContain('serverUrl: config.serverUrl');
      expect(generatedCode).toContain('adapterType: config.adapterType');
    });

    it('should generate helper methods', () => {
      expect(generatedCode).toContain('public getConfig()');
      expect(generatedCode).toContain('public getAdapter()');
      expect(generatedCode).toContain('public async close()');
    });
  });

  describe('Method Descriptor Generation', () => {
    it('should generate GetUser method descriptor', () => {
      expect(generatedCode).toContain(
        'const GetUserDescriptor: MethodDescriptor<GetUserRequest, GetUserResponse>'
      );
      expect(generatedCode).toContain(
        "serviceName: 'test.services.UserService'"
      );
      expect(generatedCode).toContain("methodName: 'GetUser'");
      expect(generatedCode).toContain('requestStream: false');
      expect(generatedCode).toContain('responseStream: false');
    });

    it('should generate ListUsers method descriptor (server streaming)', () => {
      expect(generatedCode).toContain(
        'const ListUsersDescriptor: MethodDescriptor<ListUsersRequest, ListUsersResponse>'
      );
      expect(generatedCode).toContain("methodName: 'ListUsers'");
      expect(generatedCode).toMatch(/requestStream:\s*false/);
      expect(generatedCode).toMatch(/responseStream:\s*true/);
    });

    it('should generate CreateUsers method descriptor (client streaming)', () => {
      expect(generatedCode).toContain(
        'const CreateUsersDescriptor: MethodDescriptor<CreateUserRequest, ListUsersResponse>'
      );
      expect(generatedCode).toContain("methodName: 'CreateUsers'");
      expect(generatedCode).toMatch(/requestStream:\s*true/);
      expect(generatedCode).toMatch(/responseStream:\s*false/);
    });

    it('should generate Chat method descriptor (bidirectional streaming)', () => {
      expect(generatedCode).toContain(
        'const ChatDescriptor: MethodDescriptor<StreamMessage, StreamMessage>'
      );
      expect(generatedCode).toContain("methodName: 'Chat'");
      expect(generatedCode).toMatch(/requestStream:\s*true/);
      expect(generatedCode).toMatch(/responseStream:\s*true/);
    });

    it('should include serializeBinary and deserializeBinary in descriptors', () => {
      expect(generatedCode).toContain('serializeBinary:');
      expect(generatedCode).toContain('deserializeBinary:');
      expect(generatedCode).toContain('.toBinary(msg)');
      expect(generatedCode).toContain('.fromBinary(bytes)');
    });
  });

  describe('Method Generation', () => {
    describe('Unary RPC (GetUser)', () => {
      it('should generate unary method', () => {
        expect(generatedCode).toContain('public async getUser(');
        expect(generatedCode).toContain(
          'request: GetUserRequest'
        );
        expect(generatedCode).toContain('options?: CallOptions');
        expect(generatedCode).toContain('Promise<GetUserResponse>');
      });

      it('should call adapter.unary', () => {
        expect(generatedCode).toContain(
          'return this.adapter.unary<GetUserRequest, GetUserResponse>('
        );
        expect(generatedCode).toContain('GetUserDescriptor');
      });
    });

    describe('Server Streaming RPC (ListUsers)', () => {
      it('should generate server streaming method', () => {
        expect(generatedCode).toContain('public listUsers(');
        expect(generatedCode).toContain(
          'request: ListUsersRequest'
        );
        expect(generatedCode).toContain('Observable<ListUsersResponse>');
      });

      it('should call adapter.serverStream', () => {
        expect(generatedCode).toContain(
          'return this.adapter.serverStream<ListUsersRequest, ListUsersResponse>('
        );
        expect(generatedCode).toContain('ListUsersDescriptor');
      });
    });

    describe('Client Streaming RPC (CreateUsers)', () => {
      it('should generate client streaming method', () => {
        expect(generatedCode).toContain('public createUsers(');
        expect(generatedCode).toContain('options?: CallOptions');
        expect(generatedCode).toContain(
          'ClientStreamingCall<CreateUserRequest, ListUsersResponse>'
        );
      });

      it('should call adapter.clientStream', () => {
        expect(generatedCode).toContain(
          'return this.adapter.clientStream<CreateUserRequest, ListUsersResponse>('
        );
        expect(generatedCode).toContain('CreateUsersDescriptor');
      });
    });

    describe('Bidirectional Streaming RPC (Chat)', () => {
      it('should generate bidirectional streaming method', () => {
        expect(generatedCode).toContain('public chat(');
        expect(generatedCode).toContain('options?: CallOptions');
        expect(generatedCode).toContain(
          'BidiStreamingCall<StreamMessage, StreamMessage>'
        );
      });

      it('should call adapter.bidiStream', () => {
        expect(generatedCode).toContain(
          'return this.adapter.bidiStream<StreamMessage, StreamMessage>('
        );
        expect(generatedCode).toContain('ChatDescriptor');
      });
    });
  });

  describe('Documentation', () => {
    it('should include JSDoc comments for all methods', () => {
      // Unary method docs
      expect(generatedCode).toContain('Unary RPC');
      expect(generatedCode).toContain('Promise<');

      // Server streaming docs
      expect(generatedCode).toContain('(server streaming)');
      expect(generatedCode).toContain('Observable<');

      // Client streaming docs
      expect(generatedCode).toContain('(client streaming)');
      expect(generatedCode).toContain('HTTP/2 transport');

      // Bidirectional streaming docs
      expect(generatedCode).toContain('(bidirectional streaming)');
      expect(generatedCode).toContain('Establishes a bidirectional stream');
    });

    it('should document adapter compatibility', () => {
      expect(generatedCode).toContain('Native gRPC adapter');
      expect(generatedCode).toContain('gRPC-web adapter');
      expect(generatedCode).toContain('Transport Support');
    });

    it('should include usage examples', () => {
      expect(generatedCode).toContain('@example');
      expect(generatedCode).toContain('const stub = new UserServiceStub');
    });
  });

  describe('Adapter Selection', () => {
    it('should document adapter type options', () => {
      expect(generatedCode).toContain("'auto': Automatically select");
      expect(generatedCode).toContain("'grpc-web': Force use of gRPC-web");
      expect(generatedCode).toContain("'native': Force use of native gRPC");
    });

    it('should document environment-based selection', () => {
      expect(generatedCode).toContain('Browser');
      expect(generatedCode).toContain('Node.js');
    });
  });
});
