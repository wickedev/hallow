import { Generator } from '../../src/core/generator';
import { ProtoFile } from '../../src/core/proto-types';

describe('Optimization Integration Tests', () => {
  describe('Production Build Optimization', () => {
    it('should apply all optimizations in production mode', async () => {
      const generator = new Generator({
        optimization: {
          production: true,
        },
      });
      
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'test',
        imports: [],
        services: [
          {
            name: 'UserService',
            methods: [
              {
                name: 'GetUser',
                inputType: 'GetUserRequest',
                outputType: 'User',
                clientStreaming: false,
                serverStream: false,
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
      
      const result = await generator.generateCode(protoFile);
      
      expect(result.files.length).toBeGreaterThan(0);
      
      const serviceFile = result.files.find(f => f.path.includes('service'));
      expect(serviceFile).toBeDefined();
      
      if (serviceFile) {
        // Check for optimization markers
        expect(serviceFile.content).toContain('/*#__PURE__*/');
        expect(serviceFile.content).toContain('/*#__NO_SIDE_EFFECTS__*/');
        
        // Check that comments are removed in production
        expect(serviceFile.content).not.toMatch(/\/\/\s+Single line comment/);
        
        // Check for minification (no excessive whitespace)
        expect(serviceFile.content).not.toMatch(/\s{3,}/);
      }
      
      // Check for bundle report in production
      const report = result.files.find(f => f.path === 'bundle-report.md');
      expect(report).toBeDefined();
    });
  });
  
  describe('Conditional Generation', () => {
    it('should only generate used services and methods', async () => {
      const generator = new Generator({
        optimization: {
          conditionalGeneration: true,
        },
        usageTracking: {
          usedServices: ['UserService'],
          usedMethods: {
            UserService: ['GetUser'],
          },
        },
      });
      
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'test',
        imports: [],
        services: [
          {
            name: 'UserService',
            methods: [
              {
                name: 'GetUser',
                inputType: 'GetUserRequest',
                outputType: 'User',
                clientStreaming: false,
                serverStream: false,
                options: {},
              },
              {
                name: 'UpdateUser',
                inputType: 'UpdateUserRequest',
                outputType: 'User',
                clientStreaming: false,
                serverStream: false,
                options: {},
              },
            ],
            options: {},
          },
          {
            name: 'PostService',
            methods: [
              {
                name: 'GetPost',
                inputType: 'GetPostRequest',
                outputType: 'Post',
                clientStreaming: false,
                serverStream: false,
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
      
      const result = await generator.generateCode(protoFile);
      
      const serviceFile = result.files.find(f => f.path.includes('service'));
      expect(serviceFile).toBeDefined();
      
      if (serviceFile) {
        // Should include UserService
        expect(serviceFile.content).toContain('UserServiceStub');
        // Should include GetUser method
        expect(serviceFile.content).toContain('GetUser');
        // Should NOT include UpdateUser method
        expect(serviceFile.content).not.toContain('UpdateUser');
        // Should NOT include PostService
        expect(serviceFile.content).not.toContain('PostServiceStub');
      }
    });
  });
  
  describe('Tree-Shaking Support', () => {
    it('should generate tree-shakeable code', async () => {
      const generator = new Generator({
        treeShaking: true,
        optimization: {
          optimizeImports: true,
        },
      });
      
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'test',
        imports: [],
        services: [
          {
            name: 'TestService',
            methods: [],
            options: {},
          },
        ],
        messages: [],
        enums: [],
        options: {},
      };
      
      const result = await generator.generateCode(protoFile);
      
      const serviceFile = result.files.find(f => f.path.includes('service'));
      expect(serviceFile).toBeDefined();
      
      if (serviceFile) {
        // Check for ES modules (not CommonJS)
        expect(serviceFile.content).toContain('export');
        expect(serviceFile.content).not.toContain('module.exports');
        expect(serviceFile.content).not.toContain('require(');
        
        // Check for tree-shaking annotations
        expect(serviceFile.content).toContain('/*#__PURE__*/');
        expect(serviceFile.content).toContain('/*#__NO_SIDE_EFFECTS__*/');
      }
    });
  });
  
  describe('Code Splitting and Lazy Loading', () => {
    it('should generate lazy loading wrappers when enabled', async () => {
      const generator = new Generator({
        optimization: {
          codeSplitting: true,
          lazyLoading: true,
        },
      });
      
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'test',
        imports: [],
        services: [
          {
            name: 'UserService',
            methods: [],
            options: {},
          },
          {
            name: 'PostService',
            methods: [],
            options: {},
          },
        ],
        messages: [],
        enums: [],
        options: {},
      };
      
      const result = await generator.generateCode(protoFile);
      
      // Should generate an index file with lazy loading
      const indexFile = result.files.find(f => f.path === 'index.ts');
      expect(indexFile).toBeDefined();
      
      if (indexFile) {
        expect(indexFile.content).toContain('async load()');
        expect(indexFile.content).toContain('import(');
        expect(indexFile.content).toContain('UserServiceStub');
        expect(indexFile.content).toContain('PostServiceStub');
      }
    });
  });
  
  describe('Bundle Size Optimization', () => {
    it('should optimize for bundle size target', async () => {
      const generator = new Generator({
        optimization: {
          bundleSizeTarget: 10, // 10KB target
          deadCodeElimination: true,
          minify: true,
          removeComments: true,
        },
      });
      
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'test',
        imports: [],
        services: [
          {
            name: 'Service',
            methods: Array.from({ length: 10 }, (_, i) => ({
              name: `Method${i}`,
              inputType: `Request${i}`,
              outputType: `Response${i}`,
              clientStreaming: false,
              serverStream: false,
              options: {},
            })),
            options: {},
          },
        ],
        messages: [],
        enums: [],
        options: {},
      };
      
      const result = await generator.generateCode(protoFile);
      
      const serviceFile = result.files.find(f => f.path.includes('service'));
      expect(serviceFile).toBeDefined();
      
      if (serviceFile) {
        // File should be minified
        expect(serviceFile.content).not.toMatch(/\n\s*\n/); // No empty lines
        expect(serviceFile.content).not.toMatch(/\s{2,}/); // No multiple spaces
        
        // Should have optimization applied
        const originalLength = serviceFile.content.length;
        
        // Generate without optimization for comparison
        const unoptimizedGenerator = new Generator({
          optimization: {
            production: false,
            deadCodeElimination: false,
            minify: false,
          },
        });
        
        const unoptimizedResult = await unoptimizedGenerator.generateCode(protoFile);
        const unoptimizedFile = unoptimizedResult.files.find(f => f.path.includes('service'));
        
        if (unoptimizedFile) {
          // Optimized should be significantly smaller
          expect(originalLength).toBeLessThan(unoptimizedFile.content.length * 0.8);
        }
      }
    });
  });
  
  describe('Import Optimization', () => {
    it('should optimize and combine imports', async () => {
      const generator = new Generator({
        optimization: {
          optimizeImports: true,
        },
      });
      
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'test',
        imports: [],
        services: [
          {
            name: 'StreamingService',
            methods: [
              {
                name: 'ServerStream',
                inputType: 'Request',
                outputType: 'Response',
                clientStreaming: false,
                serverStream: true,
                options: {},
              },
              {
                name: 'ClientStream',
                inputType: 'Request',
                outputType: 'Response',
                clientStreaming: true,
                serverStream: false,
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
      
      const result = await generator.generateCode(protoFile);
      
      const serviceFile = result.files.find(f => f.path.includes('service'));
      expect(serviceFile).toBeDefined();
      
      if (serviceFile) {
        // Should have combined imports from same source
        const grpcImports = serviceFile.content.match(/import.*from '@improbable-eng\/grpc-web'/g);
        expect(grpcImports?.length).toBe(1);
        
        // Should have sorted imports
        const importLines = serviceFile.content
          .split('\n')
          .filter(line => line.startsWith('import'));
        
        // External imports should come before internal
        const externalIndex = importLines.findIndex(l => l.includes('@improbable-eng'));
        const internalIndex = importLines.findIndex(l => l.includes('./'));
        
        if (internalIndex !== -1) {
          expect(externalIndex).toBeLessThan(internalIndex);
        }
      }
    });
  });
});
