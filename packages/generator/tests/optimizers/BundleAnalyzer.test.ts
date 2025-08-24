import { BundleAnalyzer } from '../../src/optimizers/BundleAnalyzer';
import { GeneratedFile } from '../../src/core/types';
import { ProtoFile } from '../../src/core/proto-types';

describe('BundleAnalyzer', () => {
  let analyzer: BundleAnalyzer;
  
  beforeEach(() => {
    analyzer = new BundleAnalyzer();
  });
  
  describe('Bundle Metrics', () => {
    it('should calculate basic bundle metrics', () => {
      const files: GeneratedFile[] = [
        {
          path: 'service.ts',
          content: 'export class Service { method() {} }',
        },
        {
          path: 'types.ts',
          content: 'export interface User { id: string; }',
        },
      ];
      
      const metrics = analyzer.analyzeBundle(files);
      
      expect(metrics.totalSize).toBeGreaterThan(0);
      expect(metrics.fileCount).toBe(2);
      expect(metrics.exportCount).toBe(2);
      expect(metrics.gzippedSize).toBeLessThan(metrics.totalSize);
      expect(metrics.brotliSize).toBeLessThan(metrics.gzippedSize);
    });
    
    it('should calculate tree-shakeable percentage', () => {
      const files: GeneratedFile[] = [
        {
          path: 'service.ts',
          content: `
/*#__PURE__*/ export class Service {}
export function helper() {}
export const constant = 'value';`,
        },
      ];
      
      const analyzer = new BundleAnalyzer({ analyzeTreeShaking: true });
      const metrics = analyzer.analyzeBundle(files);
      
      expect(metrics.treeShakeablePercentage).toBeGreaterThan(0);
    });
    
    it('should provide detailed file metrics when requested', () => {
      const analyzer = new BundleAnalyzer({ detailed: true });
      
      const files: GeneratedFile[] = [
        {
          path: 'service.ts',
          content: `
import { grpc } from '@improbable-eng/grpc-web';
export class Service {
  method() {}
}`,
        },
      ];
      
      const metrics = analyzer.analyzeBundle(files);
      
      expect(metrics.fileMetrics).toBeDefined();
      expect(metrics.fileMetrics?.size).toBe(1);
      
      const fileMetric = metrics.fileMetrics?.get('service.ts');
      expect(fileMetric).toBeDefined();
      expect(fileMetric?.exports).toBe(1);
      expect(fileMetric?.imports).toBe(1);
      expect(fileMetric?.lines).toBeGreaterThan(0);
    });
  });
  
  describe('Dependency Analysis', () => {
    it('should track file dependencies', () => {
      const analyzer = new BundleAnalyzer({ trackDependencies: true });
      
      const files: GeneratedFile[] = [
        {
          path: 'a.ts',
          content: `import { B } from './b';`,
        },
        {
          path: 'b.ts',
          content: `import { C } from './c';`,
        },
        {
          path: 'c.ts',
          content: `export const C = 'c';`,
        },
      ];
      
      const metrics = analyzer.analyzeBundle(files);
      
      expect(metrics.dependencies).toBeDefined();
      expect(metrics.dependencies?.fileDependencies.size).toBe(3);
      expect(metrics.dependencies?.maxDepth).toBe(2);
    });
    
    it('should detect circular dependencies', () => {
      const analyzer = new BundleAnalyzer({ trackDependencies: true });
      
      const files: GeneratedFile[] = [
        {
          path: 'a.ts',
          content: `import { B } from './b';`,
        },
        {
          path: 'b.ts',
          content: `import { C } from './c';`,
        },
        {
          path: 'c.ts',
          content: `import { A } from './a';`,
        },
      ];
      
      const metrics = analyzer.analyzeBundle(files);
      
      expect(metrics.dependencies?.circularDependencies.length).toBeGreaterThan(0);
    });
    
    it('should track external dependencies', () => {
      const analyzer = new BundleAnalyzer({ trackDependencies: true });
      
      const files: GeneratedFile[] = [
        {
          path: 'service.ts',
          content: `
import { grpc } from '@improbable-eng/grpc-web';
import { Message } from 'google-protobuf';
import { local } from './local';`,
        },
      ];
      
      const metrics = analyzer.analyzeBundle(files);
      
      expect(metrics.dependencies?.externalDependencies.size).toBe(2);
      expect(metrics.dependencies?.externalDependencies).toContain('@improbable-eng/grpc-web');
      expect(metrics.dependencies?.externalDependencies).toContain('google-protobuf');
    });
  });
  
  describe('Optimization Suggestions', () => {
    it('should suggest optimizations for large bundles', () => {
      const analyzer = new BundleAnalyzer({ 
        sizeWarningThreshold: 0.001, // 1 byte to trigger warning
        sizeErrorThreshold: 0.01, // 10 bytes to trigger error
      });
      
      const files: GeneratedFile[] = [
        {
          path: 'large.ts',
          content: 'x'.repeat(100), // 100 bytes
        },
      ];
      
      const metrics = analyzer.analyzeBundle(files);
      
      expect(metrics.suggestions.length).toBeGreaterThan(0);
      expect(metrics.suggestions.some(s => s.severity === 'error')).toBe(true);
    });
    
    it('should suggest tree-shaking improvements', () => {
      const files: GeneratedFile[] = [
        {
          path: 'service.ts',
          content: `
export default class Service {} // Not tree-shakeable
module.exports = { test: 'value' }; // CommonJS`,
        },
      ];
      
      const metrics = analyzer.analyzeBundle(files);
      
      expect(metrics.suggestions.some(s => 
        s.message.includes('tree-shaking')
      )).toBe(true);
    });
    
    it('should warn about circular dependencies', () => {
      const analyzer = new BundleAnalyzer({ trackDependencies: true });
      
      const files: GeneratedFile[] = [
        {
          path: 'a.ts',
          content: `import './b';`,
        },
        {
          path: 'b.ts',
          content: `import './a';`,
        },
      ];
      
      const metrics = analyzer.analyzeBundle(files);
      
      expect(metrics.suggestions.some(s => 
        s.severity === 'error' && s.message.includes('Circular')
      )).toBe(true);
    });
    
    it('should suggest minification when not applied', () => {
      const files: GeneratedFile[] = [
        {
          path: 'service.ts',
          content: `
export class Service {
  method() {
    return 'result';
  }
}`.repeat(100), // Large unminified file
        },
      ];
      
      const metrics = analyzer.analyzeBundle(files);
      
      expect(metrics.suggestions.some(s => 
        s.message.includes('minification')
      )).toBe(true);
    });
    
    it('should warn about deep dependency chains', () => {
      const analyzer = new BundleAnalyzer({ trackDependencies: true });
      
      const files: GeneratedFile[] = Array.from({ length: 10 }, (_, i) => ({
        path: `file${i}.ts`,
        content: i < 9 ? `import './file${i + 1}';` : 'export const last = true;',
      }));
      
      const metrics = analyzer.analyzeBundle(files);
      
      expect(metrics.dependencies?.maxDepth).toBeGreaterThan(5);
      expect(metrics.suggestions.some(s => 
        s.message.includes('Deep dependency')
      )).toBe(true);
    });
  });
  
  describe('File Metrics', () => {
    it('should identify tree-shakeable exports', () => {
      const analyzer = new BundleAnalyzer({ detailed: true });
      
      const files: GeneratedFile[] = [
        {
          path: 'exports.ts',
          content: `
/*#__PURE__*/ export class PureClass {}
export function namedFunction() {}
export const namedConst = 'value';
export default class DefaultClass {}`,
        },
      ];
      
      const metrics = analyzer.analyzeBundle(files);
      const fileMetric = metrics.fileMetrics?.get('exports.ts');
      
      expect(fileMetric?.treeShakeableExports).toContain('PureClass');
      expect(fileMetric?.treeShakeableExports).toContain('namedFunction');
      expect(fileMetric?.treeShakeableExports).toContain('namedConst');
    });
    
    it('should calculate non-tree-shakeable percentage', () => {
      const analyzer = new BundleAnalyzer({ detailed: true });
      
      const files: GeneratedFile[] = [
        {
          path: 'mixed.ts',
          content: `
export default class DefaultExport {}
module.exports = { test: 'value' };
export const treeshakeable = 'value';
globalThis.sideEffect = true;`,
        },
      ];
      
      const metrics = analyzer.analyzeBundle(files);
      const fileMetric = metrics.fileMetrics?.get('mixed.ts');
      
      expect(fileMetric?.nonTreeShakeablePercentage).toBeGreaterThan(0);
    });
  });
  
  describe('Report Generation', () => {
    it('should generate a comprehensive report', () => {
      const analyzer = new BundleAnalyzer({
        detailed: true,
        trackDependencies: true,
        generateReport: true,
      });
      
      const files: GeneratedFile[] = [
        {
          path: 'service.ts',
          content: `
import { grpc } from '@improbable-eng/grpc-web';
export class UserService {
  getUser() {}
}`,
        },
        {
          path: 'types.ts',
          content: `export interface User { id: string; }`,
        },
      ];
      
      const metrics = analyzer.analyzeBundle(files);
      const report = analyzer.generateReport(metrics);
      
      expect(report).toContain('Bundle Analysis Report');
      expect(report).toContain('Overall Metrics');
      expect(report).toContain('File Breakdown');
      expect(report).toContain('service.ts');
      expect(report).toContain('types.ts');
      expect(report).toContain('Dependencies');
    });
    
    it('should format sizes correctly', () => {
      const analyzer = new BundleAnalyzer();
      
      const files: GeneratedFile[] = [
        {
          path: 'small.ts',
          content: 'x'.repeat(500), // 500 bytes
        },
        {
          path: 'medium.ts',
          content: 'x'.repeat(5000), // ~5KB
        },
      ];
      
      const metrics = analyzer.analyzeBundle(files);
      const report = analyzer.generateReport(metrics);
      
      expect(report).toMatch(/\d+\.\d+ KB/); // Should show KB
      expect(report).toMatch(/\d+ B/); // Should show bytes for small values
    });
    
    it('should group suggestions by severity', () => {
      const analyzer = new BundleAnalyzer({
        sizeWarningThreshold: 0.001,
        sizeErrorThreshold: 0.01,
      });
      
      const files: GeneratedFile[] = [
        {
          path: 'large.ts',
          content: 'x'.repeat(100),
        },
      ];
      
      const metrics = analyzer.analyzeBundle(files);
      const report = analyzer.generateReport(metrics);
      
      expect(report).toContain('ERRORS');
      expect(report).toContain('Optimization Suggestions');
    });
  });
  
  describe('Proto Integration', () => {
    it('should use proto information for better analysis', () => {
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'test',
        imports: [],
        services: [
          { name: 'UserService', methods: [], options: {} },
          { name: 'PostService', methods: [], options: {} },
        ],
        messages: [
          { name: 'User', fields: [], nestedMessages: [], nestedEnums: [], oneofs: [], options: {} },
          { name: 'Post', fields: [], nestedMessages: [], nestedEnums: [], oneofs: [], options: {} },
        ],
        enums: [],
        options: {},
      };
      
      const files: GeneratedFile[] = [
        {
          path: 'test.service.ts',
          content: `
export class UserServiceStub {}
export class PostServiceStub {}`,
        },
      ];
      
      const metrics = analyzer.analyzeBundle(files, protoFile);
      
      expect(metrics.exportCount).toBe(2);
      expect(metrics.suggestions).toBeDefined();
    });
  });
});