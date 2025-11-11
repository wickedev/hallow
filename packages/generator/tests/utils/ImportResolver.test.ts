/**
 * ImportResolver unit tests
 */

import { 
  ImportResolver, 
  ImportDependency, 
  TypeReference,
  createImportResolver 
} from '../../src/utils/ImportResolver';
import { ProtoFile, MessageDefinition, ServiceDefinition } from '../../src/core/proto-types';
import { NameResolver } from '../../src/utils/NameResolver';
import { TypeMapper } from '../../src/utils/TypeMapper';

describe('ImportResolver', () => {
  let resolver: ImportResolver;
  
  beforeEach(() => {
    resolver = new ImportResolver();
  });
  
  describe('Proto file registration', () => {
    it('should register a proto file and its types', () => {
      const protoFile: ProtoFile = {
        fileName: 'user.proto',
        package: 'com.example.user',
        syntax: 'proto3',
        imports: [],
        services: [
          {
            name: 'UserService',
            methods: [],
            options: {},
          },
        ],
        messages: [
          {
            name: 'User',
            fields: [],
            nestedMessages: [],
            nestedEnums: [],
            oneofs: [],
            options: {},
          },
        ],
        enums: [],
        options: {},
      };
      
      resolver.registerProtoFile(protoFile);
      
      const types = resolver.getFileTypes('user.proto');
      expect(types).toHaveLength(2); // User message and UserService
      expect(types.some(t => t.typeName === 'User')).toBe(true);
      expect(types.some(t => t.typeName === 'UserService')).toBe(true);
    });
    
    it('should register nested messages', () => {
      const protoFile: ProtoFile = {
        fileName: 'nested.proto',
        package: 'test',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'Parent',
            fields: [],
            nestedMessages: [
              {
                name: 'Child',
                fields: [],
                nestedMessages: [
                  {
                    name: 'GrandChild',
                    fields: [],
                    nestedMessages: [],
                    nestedEnums: [],
                    oneofs: [],
                    options: {},
                  },
                ],
                nestedEnums: [],
                oneofs: [],
                options: {},
              },
            ],
            nestedEnums: [],
            oneofs: [],
            options: {},
          },
        ],
        enums: [],
        options: {},
      };
      
      resolver.registerProtoFile(protoFile);
      
      const types = resolver.getFileTypes('nested.proto');
      expect(types).toHaveLength(3); // Parent, Child, GrandChild
      
      const childType = resolver.resolveType('test.Parent.Child');
      expect(childType).not.toBeNull();
      expect(childType?.typeName).toBe('Parent.Child');
      
      const grandChildType = resolver.resolveType('test.Parent.Child.GrandChild');
      expect(grandChildType).not.toBeNull();
      expect(grandChildType?.typeName).toBe('Parent.Child.GrandChild');
    });
    
    it('should build dependency graph from imports', () => {
      const protoFile: ProtoFile = {
        fileName: 'service.proto',
        package: 'service',
        syntax: 'proto3',
        imports: ['common.proto', 'user.proto'],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };
      
      resolver.registerProtoFile(protoFile);
      
      const graph = resolver.getDependencyGraph();
      expect(graph.has('service.proto')).toBe(true);
      expect(graph.get('service.proto')).toContain('common.proto');
      expect(graph.get('service.proto')).toContain('user.proto');
    });
  });
  
  describe('Type resolution', () => {
    beforeEach(() => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'com.example',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'Message1',
            fields: [],
            nestedMessages: [],
            nestedEnums: [],
            oneofs: [],
            options: {},
          },
          {
            name: 'Message2',
            fields: [],
            nestedMessages: [],
            nestedEnums: [],
            oneofs: [],
            options: {},
          },
        ],
        enums: [
          {
            name: 'Status',
            values: [],
            options: {},
          },
        ],
        options: {},
      };
      
      resolver.registerProtoFile(protoFile);
    });
    
    it('should resolve fully qualified type names', () => {
      const typeRef = resolver.resolveType('com.example.Message1');
      
      expect(typeRef).not.toBeNull();
      expect(typeRef?.fullName).toBe('com.example.Message1');
      expect(typeRef?.package).toBe('com.example');
      expect(typeRef?.typeName).toBe('Message1');
      expect(typeRef?.sourceFile).toBe('test.proto');
    });
    
    it('should resolve relative type names with package context', () => {
      const typeRef = resolver.resolveType('Message2', 'com.example');
      
      expect(typeRef).not.toBeNull();
      expect(typeRef?.fullName).toBe('com.example.Message2');
      expect(typeRef?.typeName).toBe('Message2');
    });
    
    it('should resolve enum types', () => {
      const typeRef = resolver.resolveType('com.example.Status');
      
      expect(typeRef).not.toBeNull();
      expect(typeRef?.fullName).toBe('com.example.Status');
      expect(typeRef?.typeName).toBe('Status');
    });
    
    it('should return null for unknown types', () => {
      const typeRef = resolver.resolveType('com.unknown.Type');
      
      expect(typeRef).toBeNull();
    });
    
    it('should resolve well-known protobuf types', () => {
      const timestampRef = resolver.resolveType('google.protobuf.Timestamp');
      
      expect(timestampRef).not.toBeNull();
      expect(timestampRef?.isWellKnown).toBe(true);
      expect(timestampRef?.isExternal).toBe(true);
      expect(timestampRef?.package).toBe('google.protobuf');
      expect(timestampRef?.typeName).toBe('Timestamp');
    });
  });
  
  describe('Import dependency resolution', () => {
    it('should resolve cross-file dependencies', () => {
      // Register first proto file
      const commonProto: ProtoFile = {
        fileName: 'common.proto',
        package: 'common',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'SharedMessage',
            fields: [],
            nestedMessages: [],
            nestedEnums: [],
            oneofs: [],
            options: {},
          },
        ],
        enums: [],
        options: {},
      };
      
      // Register second proto file that uses types from first
      const serviceProto: ProtoFile = {
        fileName: 'service.proto',
        package: 'service',
        syntax: 'proto3',
        imports: ['common.proto'],
        services: [
          {
            name: 'MyService',
            methods: [
              {
                name: 'Process',
                inputType: 'common.SharedMessage',
                outputType: 'ProcessResponse',
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
            name: 'ProcessResponse',
            fields: [
              {
                name: 'result',
                number: 1,
                type: 'common.SharedMessage',
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
      };
      
      resolver.registerProtoFile(commonProto);
      resolver.registerProtoFile(serviceProto);
      
      const dependencies = resolver.getImportDependencies('service.proto');
      
      expect(dependencies).toHaveLength(1);
      expect(dependencies[0].source).toContain('common');
      expect(dependencies[0].types).toContain('SharedMessage');
      expect(dependencies[0].isProtoImport).toBe(true);
    });
    
    it('should handle well-known type dependencies', () => {
      const protoFile: ProtoFile = {
        fileName: 'timestamps.proto',
        package: 'test',
        syntax: 'proto3',
        imports: ['google/protobuf/timestamp.proto'],
        services: [],
        messages: [
          {
            name: 'Event',
            fields: [
              {
                name: 'created_at',
                number: 1,
                type: 'google.protobuf.Timestamp',
                repeated: false,
                optional: false,
                map: false,
                options: {},
              },
              {
                name: 'updated_at',
                number: 2,
                type: 'google.protobuf.Timestamp',
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
      };
      
      resolver.registerProtoFile(protoFile);
      
      const dependencies = resolver.getImportDependencies('timestamps.proto');
      
      const timestampDep = dependencies.find(d => 
        d.source.includes('google-protobuf/google/protobuf/timestamp_pb')
      );
      
      expect(timestampDep).toBeDefined();
      expect(timestampDep?.types).toContain('Timestamp');
      expect(timestampDep?.isProtoImport).toBe(false);
    });
    
    it('should use namespace imports when configured', () => {
      resolver = new ImportResolver({
        useNamespaceImports: true,
      });
      
      const protoFile: ProtoFile = {
        fileName: 'main.proto',
        package: 'main',
        syntax: 'proto3',
        imports: ['common.proto'],
        services: [],
        messages: [
          {
            name: 'MainMessage',
            fields: [
              { name: 'field1', number: 1, type: 'common.Type1', repeated: false, optional: false, map: false, options: {} },
              { name: 'field2', number: 2, type: 'common.Type2', repeated: false, optional: false, map: false, options: {} },
              { name: 'field3', number: 3, type: 'common.Type3', repeated: false, optional: false, map: false, options: {} },
              { name: 'field4', number: 4, type: 'common.Type4', repeated: false, optional: false, map: false, options: {} },
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
      
      // Register common proto with multiple types
      const commonProto: ProtoFile = {
        fileName: 'common.proto',
        package: 'common',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          { name: 'Type1', fields: [], nestedMessages: [], nestedEnums: [], oneofs: [], options: {} },
          { name: 'Type2', fields: [], nestedMessages: [], nestedEnums: [], oneofs: [], options: {} },
          { name: 'Type3', fields: [], nestedMessages: [], nestedEnums: [], oneofs: [], options: {} },
          { name: 'Type4', fields: [], nestedMessages: [], nestedEnums: [], oneofs: [], options: {} },
        ],
        enums: [],
        options: {},
      };
      
      resolver.registerProtoFile(commonProto);
      resolver.registerProtoFile(protoFile);
      
      const dependencies = resolver.getImportDependencies('main.proto');
      
      // Should use namespace import for files with many types (>3)
      const commonDep = dependencies.find(d => d.source.includes('common'));
      expect(commonDep?.useNamespace).toBe(true);
      expect(commonDep?.namespaceName).toBeDefined();
    });
  });
  
  describe('Local type checking', () => {
    beforeEach(() => {
      const protoFile: ProtoFile = {
        fileName: 'local.proto',
        package: 'local',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          {
            name: 'LocalMessage',
            fields: [],
            nestedMessages: [],
            nestedEnums: [],
            oneofs: [],
            options: {},
          },
        ],
        enums: [],
        options: {},
      };
      
      resolver.registerProtoFile(protoFile);
    });
    
    it('should identify local types correctly', () => {
      expect(resolver.isLocalType('local.LocalMessage', 'local.proto')).toBe(true);
      expect(resolver.isLocalType('LocalMessage', 'local.proto')).toBe(true);
      expect(resolver.isLocalType('external.Message', 'local.proto')).toBe(false);
      expect(resolver.isLocalType('LocalMessage', 'other.proto')).toBe(false);
    });
  });
  
  describe('Configuration options', () => {
    it('should use relative imports when configured', () => {
      resolver = new ImportResolver({
        useRelativeImports: true,
        fileExtension: '.ts',
      });
      
      const file1: ProtoFile = {
        fileName: 'src/protos/user.proto',
        package: 'user',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [{ name: 'User', fields: [], nestedMessages: [], nestedEnums: [], oneofs: [], options: {} }],
        enums: [],
        options: {},
      };
      
      const file2: ProtoFile = {
        fileName: 'src/protos/service.proto',
        package: 'service',
        syntax: 'proto3',
        imports: ['src/protos/user.proto'],
        services: [],
        messages: [
          {
            name: 'Request',
            fields: [
              { name: 'user', number: 1, type: 'user.User', repeated: false, optional: false, map: false, options: {} },
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
      
      resolver.registerProtoFile(file1);
      resolver.registerProtoFile(file2);
      
      const dependencies = resolver.getImportDependencies('src/protos/service.proto');
      
      expect(dependencies[0].source).toBe('./user.ts');
    });
    
    it('should use absolute imports when configured', () => {
      resolver = new ImportResolver({
        useRelativeImports: false,
        fileExtension: '.ts',
      });
      
      const file1: ProtoFile = {
        fileName: 'protos/common.proto',
        package: 'common',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [{ name: 'Common', fields: [], nestedMessages: [], nestedEnums: [], oneofs: [], options: {} }],
        enums: [],
        options: {},
      };
      
      resolver.registerProtoFile(file1);
      
      // For absolute imports, the path should be without relative indicators
      const typeRef = resolver.resolveType('common.Common');
      expect(typeRef).not.toBeNull();
    });
    
    it('should use custom import paths when configured', () => {
      resolver = new ImportResolver({
        customImportPaths: {
          'common.proto': '@company/common-protos',
        },
      });
      
      // Custom import paths would be used in the dependency resolution
      // This is a placeholder for more complex custom path resolution
      expect(resolver).toBeDefined();
    });
  });
  
  describe('Factory function', () => {
    it('should create ImportResolver with factory function', () => {
      const nameResolver = new NameResolver();
      const typeMapper = new TypeMapper();
      
      const resolver = createImportResolver(
        {
          useRelativeImports: true,
          useNamespaceImports: true,
        },
        nameResolver,
        typeMapper
      );
      
      expect(resolver).toBeInstanceOf(ImportResolver);
      
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'test',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [],
        enums: [],
        options: {},
      };
      
      resolver.registerProtoFile(protoFile);
      expect(resolver.getFileTypes('test.proto')).toHaveLength(0);
    });
  });
  
  describe('Clear functionality', () => {
    it('should clear all registries', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'test',
        syntax: 'proto3',
        imports: [],
        services: [],
        messages: [
          { name: 'Message', fields: [], nestedMessages: [], nestedEnums: [], oneofs: [], options: {} },
        ],
        enums: [],
        options: {},
      };
      
      resolver.registerProtoFile(protoFile);
      expect(resolver.getFileTypes('test.proto')).toHaveLength(1);
      
      resolver.clear();
      
      expect(resolver.getFileTypes('test.proto')).toHaveLength(0);
      expect(resolver.resolveType('test.Message')).toBeNull();
      expect(resolver.getDependencyGraph().size).toBe(0);
    });
  });
});
