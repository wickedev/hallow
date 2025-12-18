/**
 * Tests for ServiceGenerator
 */

import { ServiceGenerator } from '../../src/generators/ServiceGenerator';
import { 
  ServiceDefinition, 
  MethodDefinition, 
  ProtoFile 
} from '../../src/core/proto-types';
import { GenerationError, GenerationErrorCode } from '../../src/core/types';

describe('ServiceGenerator', () => {
  let generator: ServiceGenerator;
  
  beforeEach(() => {
    generator = new ServiceGenerator({
      serverUrl: 'http://localhost:8080',
      generateComments: true,
      generateReactHooks: false,
      generateSuspenseHooks: false,
    });
  });
  
  describe('constructor', () => {
    it('should create generator with default options', () => {
      const gen = new ServiceGenerator();
      const options = gen.getOptions();
      
      expect(options.serverUrl).toBe('');
      expect(options.generateReactHooks).toBe(false);
      expect(options.generateSuspenseHooks).toBe(false);
      expect(options.generateComments).toBe(true);
    });
    
    it('should create generator with custom options', () => {
      const gen = new ServiceGenerator({
        serverUrl: 'https://api.example.com',
        generateReactHooks: true,
        generateSuspenseHooks: true,
        generateComments: false,
      });
      const options = gen.getOptions();
      
      expect(options.serverUrl).toBe('https://api.example.com');
      expect(options.generateReactHooks).toBe(true);
      expect(options.generateSuspenseHooks).toBe(true);
      expect(options.generateComments).toBe(false);
    });
  });
  
  describe('generateStub', () => {
    const createTestService = (): ServiceDefinition => ({
      name: 'TestService',
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
      ],
      options: {},
    });
    
    const createTestProtoFile = (): ProtoFile => ({
      fileName: 'test.proto',
      package: 'test.package',
      syntax: 'proto3',
      imports: [],
      services: [createTestService()],
      messages: [
        {
          name: 'GetUserRequest',
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
              name: 'user',
              number: 1,
              type: 'User',
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
    
    it('should generate service stub for valid service', async () => {
      const service = createTestService();
      const protoFile = createTestProtoFile();
      
      const result = await generator.generateStub(service, protoFile);
      
      expect(result).toBeDefined();
      expect(result.path).toBe('test.service.ts');
      expect(result.content).toContain('export class TestServiceStub');
      // Check getUser method signature (formatted across multiple lines)
      expect(result.content).toContain('public async getUser(');
      expect(result.content).toContain('request: GetUserRequest');
      expect(result.content).toContain('options?: CallOptions');
      expect(result.content).toContain('): Promise<GetUserResponse>');
      // ListUsers is a server streaming method, so it should return Observable
      expect(result.content).toContain('public listUsers(');
      expect(result.content).toContain('request: ListUsersRequest');
      expect(result.content).toContain('): Observable<ListUsersResponse>');
    });
    
    it('should include React hooks when option is enabled', async () => {
      generator.updateOptions({ generateReactHooks: true });
      
      const service = createTestService();
      const protoFile = createTestProtoFile();
      
      const result = await generator.generateStub(service, protoFile);
      
      // Hooks should now be methods on the main Stub
      expect(result.content).toContain('public useGetUser(');
      expect(result.content).toContain('request: GetUserRequest');
      // Should import useGrpc
      expect(result.content).toContain('import {');
      expect(result.content).toContain('useGrpc');
      expect(result.content).toContain('} from \'@hallow/react\'');
    });
    
    it('should include Suspense hooks when option is enabled', async () => {
      generator.updateOptions({ generateSuspenseHooks: true });
      
      const service = createTestService();
      const protoFile = createTestProtoFile();
      
      const result = await generator.generateStub(service, protoFile);
      
      // Suspense hooks should be methods on the main Stub
      expect(result.content).toContain('public useGetUserSuspense(');
      expect(result.content).toContain('request: GetUserRequest');
      expect(result.content).toContain('): GetUserResponse');
      // Should import useSuspenseGrpc
      expect(result.content).toContain('import {');
      expect(result.content).toContain('useSuspenseGrpc');
      expect(result.content).toContain('} from \'@hallow/react\'');
    });
    
    it('should throw error for service without name', () => {
      const invalidService: ServiceDefinition = {
        name: '',
        methods: [],
        options: {},
      };
      const protoFile = createTestProtoFile();
      
      expect(() => generator.generateStub(invalidService, protoFile))
        .toThrow(GenerationError);
    });
    
    it('should throw error for service without methods', () => {
      const invalidService: ServiceDefinition = {
        name: 'EmptyService',
        methods: [],
        options: {},
      };
      const protoFile = createTestProtoFile();
      
      expect(() => generator.generateStub(invalidService, protoFile))
        .toThrow('Service "EmptyService" has no methods');
    });
    
    it('should throw error for method without input type', () => {
      const invalidService: ServiceDefinition = {
        name: 'TestService',
        methods: [
          {
            name: 'TestMethod',
            inputType: '',
            outputType: 'Response',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile();
      
      expect(() => generator.generateStub(invalidService, protoFile))
        .toThrow('Method "TestMethod" in service "TestService" has no input type');
    });
    
    it('should throw error for method without output type', () => {
      const invalidService: ServiceDefinition = {
        name: 'TestService',
        methods: [
          {
            name: 'TestMethod',
            inputType: 'Request',
            outputType: '',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile();
      
      expect(() => generator.generateStub(invalidService, protoFile))
        .toThrow('Method "TestMethod" in service "TestService" has no output type');
    });
    
    it('should handle streaming methods correctly', () => {
      const streamingService: ServiceDefinition = {
        name: 'StreamingService',
        methods: [
          {
            name: 'ClientStream',
            inputType: 'Request',
            outputType: 'Response',
            clientStreaming: true,
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
      protoFile.services = [streamingService];
      
      const result = generator.generateStub(streamingService, protoFile);
      
      // Check for streaming imports (Observable only - Subject/Subscription are in GrpcWebAdapter)
      expect(result.content).toContain('import { Observable }');
      expect(result.content).toContain('from \'rxjs\'');

      // Check client streaming method signature - now returns ClientStreamingCall
      expect(result.content).toContain('public clientStream(options?: CallOptions): ClientStreamingCall<Request, Response>');
      expect(result.content).toContain('this.adapter.clientStream');

      // Check server streaming method signature
      expect(result.content).toContain('public serverStream(');
      expect(result.content).toContain('request: Request');
      expect(result.content).toContain('): Observable<Response>');
      expect(result.content).toContain('this.adapter.serverStream');

      // Check bidirectional streaming method signature - now returns BidiStreamingCall
      expect(result.content).toContain('public bidiStream(options?: CallOptions): BidiStreamingCall<Request, Response>');
      expect(result.content).toContain('this.adapter.bidiStream');
    });
    
    it('should include streaming-specific error handling', () => {
      const streamingService: ServiceDefinition = {
        name: 'StreamService',
        methods: [
          {
            name: 'StreamData',
            inputType: 'StreamRequest',
            outputType: 'StreamResponse',
            clientStreaming: false,
            serverStreaming: true,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile();
      protoFile.services = [streamingService];
      
      const result = generator.generateStub(streamingService, protoFile);

      // Check for Observable return type
      expect(result.content).toContain('Observable<StreamResponse>');

      // Check that method delegates to adapter.serverStream
      expect(result.content).toContain('this.adapter.serverStream');
      expect(result.content).toContain('StreamDataDescriptor');

      // Observable error handling and cancellation are now handled internally by GrpcWebAdapter
      // The generated code is simpler and just calls adapter.serverStream()
    });
    
    it('should handle React hooks for streaming methods', () => {
      generator.updateOptions({ generateReactHooks: true });
      
      const streamingService: ServiceDefinition = {
        name: 'HookStreamService',
        methods: [
          {
            name: 'StreamUpdates',
            inputType: 'UpdateRequest',
            outputType: 'UpdateResponse',
            clientStreaming: false,
            serverStreaming: true,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile();
      protoFile.services = [streamingService];
      
      const result = generator.generateStub(streamingService, protoFile);
      
      // Check for React Hook with streaming support on the main stub
      expect(result.content).toContain('public useStreamUpdates(');
      expect(result.content).toContain('): UseGrpcStreamResult<UpdateResponse>');
      expect(result.content).toContain('import {');
      expect(result.content).toContain('useGrpcStream');
      expect(result.content).toContain('} from \'@hallow/react\'');
    });
    
    it('should handle mixed streaming and unary methods in same service', () => {
      const mixedService: ServiceDefinition = {
        name: 'MixedService',
        methods: [
          {
            name: 'UnaryCall',
            inputType: 'UnaryRequest',
            outputType: 'UnaryResponse',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
          {
            name: 'StreamingCall',
            inputType: 'StreamRequest',
            outputType: 'StreamResponse',
            clientStreaming: false,
            serverStreaming: true,
            options: {},
          },
        ],
        options: {},
      };
      const protoFile = createTestProtoFile();
      protoFile.services = [mixedService];
      
      const result = generator.generateStub(mixedService, protoFile);
      
      // Should include Observable import when there are streaming methods
      expect(result.content).toContain('import { Observable }');
      
      // Check unary method signature
      expect(result.content).toContain('public async unaryCall(');
      expect(result.content).toContain('request: UnaryRequest');
      expect(result.content).toContain('): Promise<UnaryResponse>');

      // Check streaming method signature
      expect(result.content).toContain('public streamingCall(');
      expect(result.content).toContain('request: StreamRequest');
      expect(result.content).toContain('): Observable<StreamResponse>');
    });

    describe('Client and Bidirectional Streaming Templates (Task 2.3)', () => {
      describe('Client Streaming Template', () => {
        it('should generate correct method signature for client streaming', () => {
          const clientStreamingService: ServiceDefinition = {
            name: 'UploadService',
            methods: [
              {
                name: 'UploadFile',
                inputType: 'FileChunk',
                outputType: 'UploadResult',
                clientStreaming: true,
                serverStreaming: false,
                options: {},
              },
            ],
            options: {},
          };
          const protoFile = createTestProtoFile();
          protoFile.services = [clientStreamingService];

          const result = generator.generateStub(clientStreamingService, protoFile);

          // Verify method signature structure - now returns ClientStreamingCall
          expect(result.content).toContain('public uploadFile(options?: CallOptions): ClientStreamingCall<FileChunk, UploadResult>');
          expect(result.content).toContain('this.adapter.clientStream');
        });

        it('should include HTTP/1.1 limitation error message', () => {
          const clientStreamingService: ServiceDefinition = {
            name: 'UploadService',
            methods: [
              {
                name: 'UploadFile',
                inputType: 'FileChunk',
                outputType: 'UploadResult',
                clientStreaming: true,
                serverStreaming: false,
                options: {},
              },
            ],
            options: {},
          };
          const protoFile = createTestProtoFile();

          const result = generator.generateStub(clientStreamingService, protoFile);

          // Verify JSDoc mentions HTTP/1.1 limitation
          expect(result.content).toContain('Client streaming requires HTTP/2 transport');
          expect(result.content).toContain('gRPC-web adapter: ✗ Not supported (HTTP/1.1 limitation)');
          expect(result.content).toContain('https://github.com/grpc/grpc-web#streaming-support');
        });

        it('should include comprehensive JSDoc documentation', () => {
          const clientStreamingService: ServiceDefinition = {
            name: 'UploadService',
            methods: [
              {
                name: 'UploadFile',
                inputType: 'FileChunk',
                outputType: 'UploadResult',
                clientStreaming: true,
                serverStreaming: false,
                options: {},
              },
            ],
            options: {},
          };
          const protoFile = createTestProtoFile();

          const result = generator.generateStub(clientStreamingService, protoFile);

          // Verify JSDoc elements
          expect(result.content).toContain('/**');
          expect(result.content).toContain('@returns Client streaming call with send/complete capabilities');
          expect(result.content).toContain('@throws {Error} If using gRPC-web adapter');
          expect(result.content).toContain('@see https://github.com/grpc/grpc-web#streaming-support');
          expect(result.content).toContain('**IMPORTANT**:');
        });

        it('should throw descriptive error in method body', () => {
          const clientStreamingService: ServiceDefinition = {
            name: 'UploadService',
            methods: [
              {
                name: 'UploadFile',
                inputType: 'FileChunk',
                outputType: 'UploadResult',
                clientStreaming: true,
                serverStreaming: false,
                options: {},
              },
            ],
            options: {},
          };
          const protoFile = createTestProtoFile();

          const result = generator.generateStub(clientStreamingService, protoFile);

          // Verify method delegates to adapter (adapter will throw if using grpc-web)
          expect(result.content).toContain('this.adapter.clientStream');
          expect(result.content).toContain('UploadFileDescriptor');
        });
      });

      describe('Bidirectional Streaming Template', () => {
        it('should generate correct method signature for bidirectional streaming', () => {
          const bidiStreamingService: ServiceDefinition = {
            name: 'ChatService',
            methods: [
              {
                name: 'Chat',
                inputType: 'ChatMessage',
                outputType: 'ChatMessage',
                clientStreaming: true,
                serverStreaming: true,
                options: {},
              },
            ],
            options: {},
          };
          const protoFile = createTestProtoFile();
          protoFile.services = [bidiStreamingService];

          const result = generator.generateStub(bidiStreamingService, protoFile);

          // Verify method signature structure - now returns BidiStreamingCall
          expect(result.content).toContain('public chat(options?: CallOptions): BidiStreamingCall<ChatMessage, ChatMessage>');
          expect(result.content).toContain('this.adapter.bidiStream');
        });

        it('should include HTTP/1.1 limitation error message', () => {
          const bidiStreamingService: ServiceDefinition = {
            name: 'ChatService',
            methods: [
              {
                name: 'Chat',
                inputType: 'ChatMessage',
                outputType: 'ChatMessage',
                clientStreaming: true,
                serverStreaming: true,
                options: {},
              },
            ],
            options: {},
          };
          const protoFile = createTestProtoFile();

          const result = generator.generateStub(bidiStreamingService, protoFile);

          // Verify JSDoc mentions HTTP/1.1 limitation
          expect(result.content).toContain('Bidirectional streaming requires HTTP/2 transport');
          expect(result.content).toContain('gRPC-web adapter: ✗ Not supported (HTTP/1.1 limitation)');
          expect(result.content).toContain('https://github.com/grpc/grpc-web#streaming-support');
        });

        it('should include comprehensive JSDoc documentation', () => {
          const bidiStreamingService: ServiceDefinition = {
            name: 'ChatService',
            methods: [
              {
                name: 'Chat',
                inputType: 'ChatMessage',
                outputType: 'ChatMessage',
                clientStreaming: true,
                serverStreaming: true,
                options: {},
              },
            ],
            options: {},
          };
          const protoFile = createTestProtoFile();

          const result = generator.generateStub(bidiStreamingService, protoFile);

          // Verify JSDoc elements
          expect(result.content).toContain('/**');
          expect(result.content).toContain('@returns Bidirectional streaming call with send/receive capabilities');
          expect(result.content).toContain('@throws {Error} If using gRPC-web adapter');
          expect(result.content).toContain('@see https://github.com/grpc/grpc-web#streaming-support');
          expect(result.content).toContain('**IMPORTANT**:');
        });

        it('should throw descriptive error in method body', () => {
          const bidiStreamingService: ServiceDefinition = {
            name: 'ChatService',
            methods: [
              {
                name: 'Chat',
                inputType: 'ChatMessage',
                outputType: 'ChatMessage',
                clientStreaming: true,
                serverStreaming: true,
                options: {},
              },
            ],
            options: {},
          };
          const protoFile = createTestProtoFile();

          const result = generator.generateStub(bidiStreamingService, protoFile);

          // Verify method delegates to adapter (adapter will throw if using grpc-web)
          expect(result.content).toContain('this.adapter.bidiStream');
          expect(result.content).toContain('ChatDescriptor');
        });

        it('should include Observable type for responses property', () => {
          const bidiStreamingService: ServiceDefinition = {
            name: 'ChatService',
            methods: [
              {
                name: 'Chat',
                inputType: 'ChatMessage',
                outputType: 'ChatMessage',
                clientStreaming: true,
                serverStreaming: true,
                options: {},
              },
            ],
            options: {},
          };
          const protoFile = createTestProtoFile();

          const result = generator.generateStub(bidiStreamingService, protoFile);

          // Verify Observable import and BidiStreamingCall type usage
          expect(result.content).toContain('import { Observable }');
          expect(result.content).toContain('BidiStreamingCall<ChatMessage, ChatMessage>');
        });
      });

      describe('Mixed Streaming Service', () => {
        it('should correctly handle service with all streaming types', () => {
          const mixedService: ServiceDefinition = {
            name: 'MixedService',
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
          protoFile.services = [mixedService];

          const result = generator.generateStub(mixedService, protoFile);

          // Verify unary method (functional)
          expect(result.content).toContain('public async unary(');
          expect(result.content).toContain('request: Request');
          expect(result.content).toContain('options?: CallOptions');
          expect(result.content).toContain('): Promise<Response>');
          expect(result.content).toContain('this.adapter.unary');

          // Verify server streaming method (functional)
          expect(result.content).toContain('public serverStream(');
          expect(result.content).toContain('): Observable<Response>');
          expect(result.content).toContain('this.adapter.serverStream');

          // Verify client streaming method (now functional)
          expect(result.content).toContain('public clientStream(');
          expect(result.content).toContain('): ClientStreamingCall<Request, Response>');
          expect(result.content).toContain('this.adapter.clientStream');

          // Verify bidirectional streaming method (now functional)
          expect(result.content).toContain('public bidiStream(');
          expect(result.content).toContain('): BidiStreamingCall<Request, Response>');
          expect(result.content).toContain('this.adapter.bidiStream');

          // Verify Observable import is included (for server and bidi streaming)
          expect(result.content).toContain('import { Observable }');
        });
      });
    });
  });

  describe('generateStubs', () => {
    it('should generate stubs for all services in proto file', async () => {
      const protoFile: ProtoFile = {
        fileName: 'multi.proto',
        package: 'multi',
        syntax: 'proto3',
        imports: [],
        services: [
          {
            name: 'ServiceOne',
            methods: [
              {
                name: 'MethodOne',
                inputType: 'Request',
                outputType: 'Response',
                clientStreaming: false,
                serverStreaming: false,
                options: {},
              },
            ],
            options: {},
          },
          {
            name: 'ServiceTwo',
            methods: [
              {
                name: 'MethodTwo',
                inputType: 'Request',
                outputType: 'Response',
                clientStreaming: false,
                serverStreaming: false,
                options: {},
              },
            ],
            options: {},
          },
        ],
        messages: [],
        enums: [],
        options: {},
      };
      
      const results = await generator.generateStubs(protoFile);
      
      expect(results).toHaveLength(2);
      expect(results[0].content).toContain('ServiceOneStub');
      expect(results[1].content).toContain('ServiceTwoStub');
    });
    
    it('should return empty array for proto file without services', async () => {
      const protoFile: ProtoFile = {
        fileName: 'empty.proto',
        package: 'empty',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };
      
      const results = await generator.generateStubs(protoFile);
      
      expect(results).toHaveLength(0);
    });
  });
  
  describe('updateOptions', () => {
    it('should update generator options', () => {
      generator.updateOptions({
        serverUrl: 'https://new.example.com',
        generateReactHooks: true,
      });
      
      const options = generator.getOptions();
      
      expect(options.serverUrl).toBe('https://new.example.com');
      expect(options.generateReactHooks).toBe(true);
      expect(options.generateSuspenseHooks).toBe(false); // Should remain unchanged
    });
    
    it('should update type mapping options', () => {
      generator.updateOptions({
        typeMapping: {
          strictNullChecks: false,
          useBigInt: true,
        },
      });

      const options = generator.getOptions();

      expect(options.typeMapping).toEqual({
        strictNullChecks: false,
        useBigInt: true,
      });
    });
  });
});
