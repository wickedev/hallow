/**
 * Tests for ReactHookGenerator
 */

import { ReactHookGenerator, createReactHookGenerator } from '../../src/generators/ReactHookGenerator';
import { ServiceDefinition, ProtoFile, MethodDefinition } from '../../src/core/proto-types';

describe('ReactHookGenerator', () => {
  let generator: ReactHookGenerator;
  
  beforeEach(() => {
    generator = createReactHookGenerator({
      generateRegularHooks: true,
      generateSuspenseHooks: true,
      generateComments: true,
      includeRefetch: true,
    });
  });
  
  describe('constructor', () => {
    it('should create instance with default options', () => {
      const gen = new ReactHookGenerator();
      const options = gen.getOptions();
      
      expect(options.generateRegularHooks).toBe(true);
      expect(options.generateSuspenseHooks).toBe(true);
      expect(options.generateComments).toBe(true);
      expect(options.includeRefetch).toBe(true);
      expect(options.memoizeRequests).toBe(false);
    });
    
    it('should create instance with custom options', () => {
      const gen = new ReactHookGenerator({
        generateRegularHooks: false,
        generateSuspenseHooks: true,
        generateComments: false,
        includeRefetch: false,
        memoizeRequests: true,
      });
      const options = gen.getOptions();
      
      expect(options.generateRegularHooks).toBe(false);
      expect(options.generateSuspenseHooks).toBe(true);
      expect(options.generateComments).toBe(false);
      expect(options.includeRefetch).toBe(false);
      expect(options.memoizeRequests).toBe(true);
    });
  });
  
  describe('generateHooks', () => {
    const mockMethod: MethodDefinition = {
      name: 'GetUser',
      inputType: 'GetUserRequest',
      outputType: 'GetUserResponse',
      clientStreaming: false,
      serverStreaming: false,
      options: {},
    };
    
    const mockService: ServiceDefinition = {
      name: 'UserService',
      methods: [mockMethod],
      options: {},
    };
    
    const mockProtoFile: ProtoFile = {
      fileName: 'user.proto',
      package: 'com.example.user',
      services: [mockService],
      messages: [],
      enums: [],
      imports: [],
      options: {},
      syntax: 'proto3',
    };
    
    it('should generate hooks for a service', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      expect(result).toBeDefined();
      expect(result.path).toBe('user.hooks.ts');
      expect(result.content).toContain('UserServiceHooks');
      expect(result.content).toContain('UserServiceSuspenseHooks');
      expect(result.content).toContain('useGetUser');
      expect(result.content).toContain('useSuspenseGetUser');
    });
    
    it('should generate only regular hooks when suspense is disabled', () => {
      generator.updateOptions({ generateSuspenseHooks: false });
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      expect(result.content).toContain('UserServiceHooks');
      expect(result.content).not.toContain('UserServiceSuspenseHooks');
    });
    
    it('should generate only suspense hooks when regular is disabled', () => {
      generator.updateOptions({ generateRegularHooks: false });
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      expect(result.content).not.toContain('class UserServiceHooks');
      expect(result.content).toContain('UserServiceSuspenseHooks');
    });
    
    it('should throw error when both hook types are disabled', () => {
      generator.updateOptions({ 
        generateRegularHooks: false,
        generateSuspenseHooks: false,
      });
      
      expect(() => {
        generator.generateHooks(mockService, mockProtoFile);
      }).toThrow('At least one hook type must be enabled');
    });
    
    it('should include refetch when enabled', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      expect(result.content).toContain('refetch');
      expect(result.content).toContain('useCallback');
    });
    
    it('should not include refetch when disabled', () => {
      generator.updateOptions({ includeRefetch: false });
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      expect(result.content).not.toContain('refetch');
      expect(result.content).not.toContain('useCallback');
    });
    
    it('should handle streaming methods with warning', () => {
      const streamingMethod: MethodDefinition = {
        name: 'StreamUsers',
        inputType: 'StreamUsersRequest',
        outputType: 'User',
        clientStreaming: false,
        serverStreaming: true,
        options: {},
      };
      
      const streamingService: ServiceDefinition = {
        name: 'UserService',
        methods: [streamingMethod],
        options: {},
      };
      
      // Spy on console.warn
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const result = generator.generateHooks(streamingService, mockProtoFile);
      
      expect(result).toBeDefined();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Streaming method "StreamUsers"'),
      );
      
      warnSpy.mockRestore();
    });
  });
  
  describe('generateAllHooks', () => {
    const mockProtoFile: ProtoFile = {
      fileName: 'services.proto',
      package: 'com.example',
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
          ],
          options: {},
        },
        {
          name: 'ProductService',
          methods: [
            {
              name: 'GetProduct',
              inputType: 'GetProductRequest',
              outputType: 'GetProductResponse',
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
      imports: [],
      options: {},
      syntax: 'proto3',
    };
    
    it('should generate hooks for all services in one file', async () => {
      const results = await generator.generateAllHooks(mockProtoFile);
      
      expect(results).toHaveLength(1);
      expect(results[0].path).toBe('services.hooks.ts');
      expect(results[0].content).toContain('UserServiceHooks');
      expect(results[0].content).toContain('ProductServiceHooks');
    });
    
    it('should return empty array when no services', async () => {
      const emptyProtoFile: ProtoFile = {
        ...mockProtoFile,
        services: [],
      };
      
      const results = await generator.generateAllHooks(emptyProtoFile);
      
      expect(results).toHaveLength(0);
    });
    
    it('should return empty array when hooks are disabled', async () => {
      generator.updateOptions({
        generateRegularHooks: false,
        generateSuspenseHooks: false,
      });
      
      const results = await generator.generateAllHooks(mockProtoFile);
      
      expect(results).toHaveLength(0);
    });
  });
  
  describe('validation', () => {
    const mockProtoFile: ProtoFile = {
      fileName: 'test.proto',
      package: 'test',
      services: [],
      messages: [],
      enums: [],
      imports: [],
      options: {},
      syntax: 'proto3',
    };
    
    it('should throw error for service without name', () => {
      const invalidService: ServiceDefinition = {
        name: '',
        methods: [],
        options: {},
      };
      
      expect(() => {
        generator.generateHooks(invalidService, mockProtoFile);
      }).toThrow('Service name is required');
    });
    
    it('should throw error for service without methods', () => {
      const invalidService: ServiceDefinition = {
        name: 'TestService',
        methods: [],
        options: {},
      };
      
      expect(() => {
        generator.generateHooks(invalidService, mockProtoFile);
      }).toThrow('Service "TestService" has no methods');
    });
    
    it('should throw error for method without name', () => {
      const invalidService: ServiceDefinition = {
        name: 'TestService',
        methods: [
          {
            name: '',
            inputType: 'Request',
            outputType: 'Response',
            clientStreaming: false,
            serverStreaming: false,
            options: {},
          },
        ],
        options: {},
      };
      
      expect(() => {
        generator.generateHooks(invalidService, mockProtoFile);
      }).toThrow('Method in service "TestService" has no name');
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
      
      expect(() => {
        generator.generateHooks(invalidService, mockProtoFile);
      }).toThrow('Method "TestMethod" in service "TestService" has no input type');
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
      
      expect(() => {
        generator.generateHooks(invalidService, mockProtoFile);
      }).toThrow('Method "TestMethod" in service "TestService" has no output type');
    });
  });
  
  describe('updateOptions', () => {
    it('should update generator options', () => {
      generator.updateOptions({
        generateComments: false,
        memoizeRequests: true,
      });
      
      const options = generator.getOptions();
      expect(options.generateComments).toBe(false);
      expect(options.memoizeRequests).toBe(true);
      expect(options.generateRegularHooks).toBe(true); // Unchanged
    });
  });
});
