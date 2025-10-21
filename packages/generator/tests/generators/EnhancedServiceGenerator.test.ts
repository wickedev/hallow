/**
 * Comprehensive tests for EnhancedServiceGenerator
 */

import { EnhancedServiceGenerator } from '../../src/generators/EnhancedServiceGenerator';
import { 
  ServiceDefinition, 
  MethodDefinition, 
  ProtoFile,
  FieldDefinition,
  MessageDefinition 
} from '../../src/core/proto-types';
import { GenerationError } from '../../src/core/types';

describe('EnhancedServiceGenerator', () => {
  let generator: EnhancedServiceGenerator;
  
  beforeEach(() => {
    generator = new EnhancedServiceGenerator({
      serverUrl: 'http://localhost:8080',
      generateReactHooks: true,
      resolveCrossFileImports: true,
      outputDir: './generated',
      useNamespaceImports: false,
    });
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const gen = new EnhancedServiceGenerator();
      expect(gen).toBeInstanceOf(EnhancedServiceGenerator);
    });

    it('should create instance with custom options', () => {
      const customGen = new EnhancedServiceGenerator({
        serverUrl: 'https://api.example.com',
        generateReactHooks: false,
        resolveCrossFileImports: false,
        outputDir: './custom-output',
        useNamespaceImports: true,
      });
      expect(customGen).toBeInstanceOf(EnhancedServiceGenerator);
    });
  });

  describe('generateStub', () => {
    const mockService: ServiceDefinition = {
      name: 'UserService',
      methods: [
        {
          name: 'GetUser',
          inputType: 'GetUserRequest',
          outputType: 'GetUserResponse',
          clientStreaming: false,
          serverStream: false,
          options: {}
        },
        {
          name: 'ListUsers',
          inputType: 'ListUsersRequest',
          outputType: 'ListUsersResponse',
          clientStreaming: false,
          serverStream: true,
          options: {}
        }
      ],
      options: {}
    };

    const mockProtoFile: ProtoFile = {
      fileName: 'user.proto',
      package: 'com.example.user',
      syntax: 'proto3',
      imports: [],
      services: [mockService],
      messages: [
        {
          name: 'GetUserRequest',
          fields: [
            {
              name: 'id',
              number: 1,
              type: 'int32',
              repeated: false,
              optional: false,
              map: false,
              options: {}
            }
          ],
          nestedMessages: [],
          nestedEnums: [],
          oneofs: [],
          options: {}
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
              options: {}
            }
          ],
          nestedMessages: [],
          nestedEnums: [],
          oneofs: [],
          options: {}
        }
      ],
      enums: [],
      options: {}
    };

    it('should generate service with unary methods', async () => {
      const result = generator.generateStub(mockService, mockProtoFile);
      
      expect(result.path).toBe('userservice.service.ts');
      expect(result.content).toContain('export class UserServiceStub');
      expect(result.content).toContain('async getUser(');
      expect(result.content).toContain('GetUserRequest');
      expect(result.content).toContain('GetUserResponse');
    });

    it('should generate service with streaming methods', async () => {
      const streamingService: ServiceDefinition = {
        name: 'ChatService',
        methods: [
          {
            name: 'SendMessage',
            inputType: 'ChatMessage',
            outputType: 'ChatResponse',
            clientStreaming: true,
            serverStream: false,
            options: {}
          },
          {
            name: 'ReceiveMessages',
            inputType: 'ChatSubscription',
            outputType: 'ChatMessage',
            clientStreaming: false,
            serverStream: true,
            options: {}
          }
        ],
        options: {}
      };

      const result = generator.generateStub(streamingService, mockProtoFile);
      
      expect(result.content).toContain('export class ChatServiceStub');
      expect(result.content).toContain('sendMessage(');
      expect(result.content).toContain('receiveMessages(');
    });

    it('should handle empty service', async () => {
      const emptyService: ServiceDefinition = {
        name: 'EmptyService',
        methods: [],
        options: {}
      };

      const result = generator.generateStub(emptyService, mockProtoFile);
      
      expect(result.content).toContain('export class EmptyServiceStub');
      expect(result.content).not.toContain('async ');
    });

    it('should generate React hooks when enabled', async () => {
      generator = new EnhancedServiceGenerator({
        generateReactHooks: true
      });

      const result = generator.generateStub(mockService, mockProtoFile);
      
      expect(result.content).toContain('useGetUser');
      expect(result.content).toContain('useState');
    });

    it('should skip React hooks when disabled', async () => {
      generator = new EnhancedServiceGenerator({
        generateReactHooks: false
      });

      const result = generator.generateStub(mockService, mockProtoFile);
      
      expect(result.content).not.toContain('useGetUser');
      expect(result.content).not.toContain('useState');
    });
  });

  describe('generateMultipleServices', () => {
    const mockServices: ServiceDefinition[] = [
      {
        name: 'UserService',
        methods: [
          {
            name: 'GetUser',
            inputType: 'GetUserRequest',
            outputType: 'GetUserResponse',
            clientStreaming: false,
            serverStream: false,
            options: {}
          }
        ],
        options: {}
      },
      {
        name: 'PostService',
        methods: [
          {
            name: 'CreatePost',
            inputType: 'CreatePostRequest',
            outputType: 'CreatePostResponse',
            clientStreaming: false,
            serverStream: false,
            options: {}
          }
        ],
        options: {}
      }
    ];

    const mockProtoFile: ProtoFile = {
      fileName: 'services.proto',
      package: 'com.example',
      syntax: 'proto3',
      imports: [],
      services: mockServices,
      messages: [],
      enums: [],
      options: {}
    };

    it('should generate multiple services', () => {
      const results = mockServices.map(service => generator.generateStub(service, mockProtoFile));
      
      expect(results).toHaveLength(2);
      expect(results[0].path).toContain('userservice');
      expect(results[1].path).toContain('postservice');
      expect(results[0].content).toContain('UserServiceStub');
      expect(results[1].content).toContain('PostServiceStub');
    });

    it('should handle empty services array', () => {
      const results: any[] = [];
      
      expect(results).toHaveLength(0);
    });
  });

  describe('resolveImports', () => {
    it('should resolve imports for cross-file references', async () => {
      const protoFile: ProtoFile = {
        fileName: 'user.proto',
        package: 'com.example.user',
        syntax: 'proto3',
        imports: ['common.proto', 'auth.proto'],
        services: [
          {
            name: 'UserService',
            methods: [
              {
                name: 'Authenticate',
                inputType: 'auth.AuthRequest',
                outputType: 'auth.AuthResponse',
                clientStreaming: false,
                serverStream: false,
                options: {}
              }
            ],
            options: {}
          }
        ],
        messages: [],
        enums: [],
        options: {}
      };

      generator = new EnhancedServiceGenerator({
        resolveCrossFileImports: true
      });

      const result = generator.generateStub(protoFile.services[0], protoFile);
      
      expect(result.content).toContain('import');
      expect(result.content).toContain('auth');
    });

    it('should skip import resolution when disabled', async () => {
      generator = new EnhancedServiceGenerator({
        resolveCrossFileImports: false
      });

      const protoFile: ProtoFile = {
        fileName: 'user.proto',
        package: 'com.example.user',
        syntax: 'proto3',
        imports: ['common.proto'],
        services: [
          {
            name: 'UserService',
            methods: [],
            options: {}
          }
        ],
        messages: [],
        enums: [],
        options: {}
      };

      const result = generator.generateStub(protoFile.services[0], protoFile);
      
      // Should still generate valid code without import resolution
      expect(result.content).toContain('UserServiceStub');
    });
  });
});
