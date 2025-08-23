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
      expect(result.content).toContain('async getUser(request: GetUserRequest): Promise<GetUserResponse>');
      // ListUsers is a server streaming method, so it should return Observable
      expect(result.content).toContain('listUsers(request: ListUsersRequest): Observable<ListUsersResponse>');
    });
    
    it('should include React hooks when option is enabled', async () => {
      generator.updateOptions({ generateReactHooks: true });
      
      const service = createTestService();
      const protoFile = createTestProtoFile();
      
      const result = await generator.generateStub(service, protoFile);
      
      expect(result.content).toContain('export class TestServiceHookStub');
      expect(result.content).toContain('useGetUser(request: GetUserRequest)');
    });
    
    it('should include Suspense hooks when option is enabled', async () => {
      generator.updateOptions({ generateSuspenseHooks: true });
      
      const service = createTestService();
      const protoFile = createTestProtoFile();
      
      const result = await generator.generateStub(service, protoFile);
      
      expect(result.content).toContain('export class TestServiceSuspenseStub');
      expect(result.content).toContain('useGetUser(request: GetUserRequest): GetUserResponse');
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
      
      // Check for streaming imports
      expect(result.content).toContain('import { Observable, Subject, Subscription }');
      expect(result.content).toContain('from \'rxjs\'');
      
      // Check for cancellation token
      expect(result.content).toContain('export interface CancellationToken');
      expect(result.content).toContain('class CancellationTokenImpl');
      
      // Check client streaming method signature
      expect(result.content).toContain('public clientStream(): {');
      expect(result.content).toContain('send: (request: Request) => void');
      expect(result.content).toContain('complete: () => Promise<Response>');
      expect(result.content).toContain('cancel: () => void');
      
      // Check server streaming method signature  
      expect(result.content).toContain('public serverStream(request: Request): Observable<Response>');
      
      // Check bidirectional streaming method signature
      expect(result.content).toContain('public bidiStream(): {');
      expect(result.content).toContain('responses: Observable<Response>');
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
      
      // Check for Observable error handling
      expect(result.content).toContain('Observable<StreamResponse>');
      expect(result.content).toContain('observer =>');
      expect(result.content).toContain('observer.next');
      expect(result.content).toContain('observer.complete');
      expect(result.content).toContain('observer.error');
      
      // Check for cancellation token usage
      expect(result.content).toContain('cancellationToken');
      expect(result.content).toContain('cancellationToken.cancel()');
      expect(result.content).toContain('cancellationToken.isCancelled');
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
      
      // Check for React Hook with streaming support
      expect(result.content).toContain('export class HookStreamServiceHookStub');
      expect(result.content).toContain('data: UpdateResponse[]');
      expect(result.content).toContain('subscription?: Subscription');
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
      
      // Should include streaming imports even with unary methods
      expect(result.content).toContain('import { Observable, Subject, Subscription }');
      
      // Check unary method signature
      expect(result.content).toContain('public async unaryCall(request: UnaryRequest): Promise<UnaryResponse>');
      
      // Check streaming method signature
      expect(result.content).toContain('public streamingCall(request: StreamRequest): Observable<StreamResponse>');
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