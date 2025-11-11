/**
 * Integration test for ReactHookGenerator
 * 
 * Tests the complete flow of generating React hooks from proto definitions
 */

import { ReactHookGenerator } from '../../src/generators';
import { ProtoFile, ServiceDefinition } from '../../src/core/proto-types';

describe('ReactHookGenerator Integration', () => {
  it('should generate complete React hooks file with all features', async () => {
    // Create a complete proto file with multiple services
    const protoFile: ProtoFile = {
      fileName: 'example.proto',
      package: 'com.example.api',
      syntax: 'proto3',
      services: [
        {
          name: 'UserService',
          methods: [
            {
              name: 'GetUser',
              inputType: 'GetUserRequest',
              outputType: 'User',
              clientStreaming: false,
              serverStreaming: false,
              options: {},
            },
            {
              name: 'ListUsers',
              inputType: 'ListUsersRequest',
              outputType: 'ListUsersResponse',
              clientStreaming: false,
              serverStreaming: false,
              options: {},
            },
            {
              name: 'CreateUser',
              inputType: 'CreateUserRequest',
              outputType: 'User',
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
              outputType: 'Product',
              clientStreaming: false,
              serverStreaming: false,
              options: {},
            },
          ],
          options: {},
        },
      ],
      messages: [
        {
          name: 'User',
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
    };
    
    // Create generator with all features enabled
    const generator = new ReactHookGenerator({
      generateRegularHooks: true,
      generateSuspenseHooks: true,
      generateComments: true,
      includeRefetch: true,
      memoizeRequests: true,
      serviceImportPath: './example.service',
    });
    
    // Generate hooks for all services
    const files = await generator.generateAllHooks(protoFile);
    
    // Verify we got one hooks file
    expect(files).toHaveLength(1);
    expect(files[0].path).toBe('example.hooks.ts');
    
    const content = files[0].content;
    
    // Verify imports - now includes useRef for memoization
    expect(content).toContain("import { useState, useEffect, useCallback, useRef } from 'react'");
    
    // Verify UserService hooks are generated
    expect(content).toContain('class UserServiceHooks');
    expect(content).toContain('class UserServiceSuspenseHooks');
    expect(content).toContain('useGetUser');
    expect(content).toContain('useListUsers');
    expect(content).toContain('useCreateUser');
    expect(content).toContain('useSuspenseGetUser');
    expect(content).toContain('useSuspenseListUsers');
    expect(content).toContain('useSuspenseCreateUser');
    
    // Verify ProductService hooks are generated
    expect(content).toContain('class ProductServiceHooks');
    expect(content).toContain('class ProductServiceSuspenseHooks');
    expect(content).toContain('useGetProduct');
    expect(content).toContain('useSuspenseGetProduct');
    
    // Verify factory functions
    expect(content).toContain('createUserServiceHooks');
    expect(content).toContain('createUserServiceSuspenseHooks');
    expect(content).toContain('createProductServiceHooks');
    expect(content).toContain('createProductServiceSuspenseHooks');
    
    // Verify refetch functionality
    expect(content).toContain('refetch: fetchData');
    expect(content).toContain('refetch: () => void');
    
    // Verify memoization with JSON.stringify
    expect(content).toContain('JSON.stringify(request)');
    
    // Verify JSDoc comments
    expect(content).toContain('React hooks for UserService');
    expect(content).toContain('Suspense-compatible hooks for ProductService');
  });
  
  it('should generate minimal hooks when options are restricted', async () => {
    const protoFile: ProtoFile = {
      fileName: 'minimal.proto',
      package: 'com.example.minimal',
      syntax: 'proto3',
      services: [
        {
          name: 'MinimalService',
          methods: [
            {
              name: 'DoSomething',
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
      imports: [],
      options: {},
    };
    
    // Create generator with minimal features
    const generator = new ReactHookGenerator({
      generateRegularHooks: true,
      generateSuspenseHooks: false,
      generateComments: false,
      includeRefetch: false,
      memoizeRequests: false,
    });
    
    const files = await generator.generateAllHooks(protoFile);
    
    expect(files).toHaveLength(1);
    const content = files[0].content;
    
    // Should have regular hooks but not suspense
    expect(content).toContain('class MinimalServiceHooks');
    expect(content).not.toContain('class MinimalServiceSuspenseHooks');
    
    // Should not have refetch
    expect(content).not.toContain('refetch');
    expect(content).not.toContain('useCallback');
    
    // Should not have memoization
    expect(content).not.toContain('JSON.stringify');
    
    // With generateComments: false, the service description should be minimal
    // The template still generates basic structural comments
    expect(content).toContain('React hooks for MinimalService'); // This comes from template structure
  });
  
  it('should handle empty proto file gracefully', async () => {
    const emptyProtoFile: ProtoFile = {
      fileName: 'empty.proto',
      package: 'com.example.empty',
      syntax: 'proto3',
      services: [],
      messages: [],
      enums: [],
      imports: [],
      options: {},
    };
    
    const generator = new ReactHookGenerator();
    const files = await generator.generateAllHooks(emptyProtoFile);
    
    expect(files).toHaveLength(0);
  });
});
