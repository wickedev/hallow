/**
 * Tests for improved Suspense-compatible React Hook generation
 */

import { ReactHookGenerator, createReactHookGenerator } from '../../src/generators/ReactHookGenerator';
import { ServiceDefinition, ProtoFile, MethodDefinition } from '../../src/core/proto-types';

describe('ReactHookGenerator - Suspense Integration', () => {
  let generator: ReactHookGenerator;
  
  const mockMethod: MethodDefinition = {
    name: 'GetUser',
    inputType: 'GetUserRequest',
    outputType: 'GetUserResponse',
    clientStreaming: false,
    serverStreaming: false,
    options: {},
  };
  
  const mockStreamMethod: MethodDefinition = {
    name: 'StreamUsers',
    inputType: 'StreamUsersRequest',
    outputType: 'User',
    clientStreaming: false,
    serverStreaming: true,
    options: {},
  };
  
  const mockService: ServiceDefinition = {
    name: 'UserService',
    methods: [mockMethod, mockStreamMethod],
    options: {},
  };
  
  const mockProtoFile: ProtoFile = {
    fileName: 'user.proto',
    package: 'com.example.user',
    services: [mockService],
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
    imports: [],
    options: {},
    syntax: 'proto3',
  };
  
  beforeEach(() => {
    generator = createReactHookGenerator({
      generateRegularHooks: true,
      generateSuspenseHooks: true,
      generateComments: true,
      includeRefetch: true,
      memoizeRequests: true,
    });
  });
  
  describe('Suspense Hook Generation', () => {
    it('should generate proper Suspense hooks with caching', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      expect(result.content).toContain('promiseCache');
      expect(result.content).toContain('resultCache');
      expect(result.content).toContain('errorCache');
      expect(result.content).toContain('UserServiceSuspenseHooks');
      expect(result.content).toContain('useSuspenseGetUser');
    });
    
    it('should include cache invalidation methods', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      expect(result.content).toContain('clearGetUserCache');
      expect(result.content).toContain('clearAllCache');
      expect(result.content).toContain('clearAllServiceCaches');
    });
    
    it('should generate React 19 use hook implementation', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      expect(result.content).toContain('UserServiceUseHooks');
      expect(result.content).toContain('import { use } from \'react\'');
      expect(result.content).toContain('return use(promise)');
    });
    
    it('should include cache statistics function', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      expect(result.content).toContain('getCacheStats');
      expect(result.content).toContain('promiseCacheSize');
      expect(result.content).toContain('resultCacheSize');
      expect(result.content).toContain('errorCacheSize');
    });
    
    it('should generate proper cache keys with service and method names', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      // Check that cache keys include service and method names  
      // The template escapes backticks as \\`
      expect(result.content).toContain('\\`UserService.GetUser:\\${JSON.stringify(request)}\\`');
    });
    
    it('should handle promise deduplication correctly', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      // Check promise caching logic
      expect(result.content).toContain('let promise = promiseCache.get(cacheKey)');
      expect(result.content).toContain('if (!promise)');
      expect(result.content).toContain('promiseCache.set(cacheKey, promise)');
    });
    
    it('should handle error caching properly', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      // Check error handling
      expect(result.content).toContain('if (errorCache.has(cacheKey))');
      expect(result.content).toContain('throw errorCache.get(cacheKey)');
      expect(result.content).toContain('errorCache.set(cacheKey, error)');
    });
    
    it('should generate factory functions for all hook types', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      expect(result.content).toContain('createUserServiceHooks');
      expect(result.content).toContain('createUserServiceSuspenseHooks');
      expect(result.content).toContain('createUserServiceUseHooks');
    });
  });
  
  describe('Regular Hook Improvements', () => {
    it('should use useRef for request memoization', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      expect(result.content).toContain('import { useState, useEffect, useCallback, useRef }');
      expect(result.content).toContain('const requestRef = useRef<string>()');
    });
    
    it('should optimize request comparison with memoization', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      expect(result.content).toContain('const requestKey = JSON.stringify(request)');
      expect(result.content).toContain('if (requestRef.current !== requestKey)');
      expect(result.content).toContain('requestRef.current = requestKey');
    });
  });
  
  describe('Documentation and Comments', () => {
    it('should include comprehensive JSDoc comments for Suspense hooks', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      // Updated to match the new simpler comment format
      expect(result.content).toContain('Usage: Wrap component with Suspense');
      expect(result.content).toContain('ErrorBoundary to handle errors');
      expect(result.content).toContain('@throws Promise while loading');
      expect(result.content).toContain('@throws Error on failure');
    });
    
    it('should document cache invalidation methods', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      expect(result.content).toContain('Useful for invalidating cache after mutations');
      expect(result.content).toContain('@param request - Optional specific request to clear');
    });
    
    it('should include React 19 use hook documentation', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      expect(result.content).toContain('React 19+ \'use\' hook');
      expect(result.content).toContain('uses React 19\'s \'use\' API for optimal Suspense integration');
    });
  });
  
  describe('Error Boundary Integration', () => {
    it('should properly throw errors for Error Boundary catching', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      // Check that errors are properly thrown
      expect(result.content).toContain('throw error');
      expect(result.content).toContain('err instanceof Error ? err : new Error(String(err))');
    });
    
    it('should maintain error state across re-renders', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      // Check error caching for consistent behavior
      expect(result.content).toContain('errorCache.set(cacheKey, error)');
      expect(result.content).toContain('if (errorCache.has(cacheKey))');
    });
  });
  
  describe('Performance Optimizations', () => {
    it('should implement proper cleanup for React 19 use hooks', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      // Check cleanup logic
      expect(result.content).toContain('promise.finally(() =>');
      expect(result.content).toContain('setTimeout(() => this.promiseCache.delete(cacheKey), 100)');
    });
    
    it('should use class-level cache for React 19 hooks', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      // Check that UseHooks has its own cache
      expect(result.content).toContain('private readonly promiseCache = new Map<string, Promise<any>>()');
    });
    
    it('should implement efficient cache key generation', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      // Check cache key pattern - accounting for escaped backticks
      // The pattern should match: const cacheKey = \\`ServiceName.MethodName:\\${JSON.stringify(request)}\\`;
      expect(result.content).toContain('const cacheKey = \\`UserService.GetUser:\\${JSON.stringify(request)}\\`');
    });
  });
  
  describe('Configuration Options', () => {
    it('should not generate UseHooks when generateSuspenseHooks is false', () => {
      const genNoSuspense = createReactHookGenerator({ 
        generateRegularHooks: true,
        generateSuspenseHooks: false,
        generateComments: true,
        includeRefetch: true,
        memoizeRequests: true,
      });
      const result = genNoSuspense.generateHooks(mockService, mockProtoFile);
      
      expect(result.content).not.toContain('UserServiceUseHooks');
      expect(result.content).not.toContain('import { use }');
    });
    
    it('should handle refetch option correctly in regular hooks', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      expect(result.content).toContain('refetch: fetchData');
      expect(result.content).toContain('refetch: () => void');
    });
    
    it('should handle memoization option correctly', () => {
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      // With memoization enabled
      expect(result.content).toContain('JSON.stringify(request)');
      expect(result.content).toContain('requestRef.current !== requestKey');
      
      // Without memoization
      const genNoMemo = createReactHookGenerator({ 
        generateRegularHooks: true,
        generateSuspenseHooks: true,
        generateComments: true,
        includeRefetch: true,
        memoizeRequests: false,
      });
      const resultNoMemo = genNoMemo.generateHooks(mockService, mockProtoFile);
      expect(resultNoMemo.content).not.toContain('requestRef.current !== requestKey');
    });
  });
  
  describe('Multi-Service Support', () => {
    it('should generate hooks for multiple services with proper namespacing', async () => {
      const multiServiceProto: ProtoFile = {
        ...mockProtoFile,
        services: [
          mockService,
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
      };
      
      const results = await generator.generateAllHooks(multiServiceProto);
      
      expect(results).toHaveLength(1);
      const content = results[0].content;
      
      // Check both services are generated
      expect(content).toContain('UserServiceSuspenseHooks');
      expect(content).toContain('ProductServiceSuspenseHooks');
      expect(content).toContain('UserServiceUseHooks');
      expect(content).toContain('ProductServiceUseHooks');
      
      // Check cache keys include service names
      expect(content).toContain('UserService.GetUser');
      expect(content).toContain('ProductService.GetProduct');
    });
  });
  
  describe('Streaming Support', () => {
    it('should warn about streaming methods but still generate hooks', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const result = generator.generateHooks(mockService, mockProtoFile);
      
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Streaming method "StreamUsers"'),
      );
      
      // Should still generate hooks for streaming methods
      expect(result.content).toContain('useSuspenseStreamUsers');
      
      warnSpy.mockRestore();
    });
  });
});
