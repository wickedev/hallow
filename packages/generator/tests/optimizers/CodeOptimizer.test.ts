import { CodeOptimizer } from '../../src/optimizers/CodeOptimizer';
import { GeneratedFile } from '../../src/core/types';
import { ProtoFile } from '../../src/core/proto-types';

describe('CodeOptimizer', () => {
  let optimizer: CodeOptimizer;

  beforeEach(() => {
    optimizer = new CodeOptimizer();
  });

  describe('Dead Code Elimination', () => {
    beforeEach(() => {
      // Enable dead code elimination for these tests
      optimizer = new CodeOptimizer({
        deadCodeElimination: true,
      });
    });

    it('should remove unreachable code after return statements', () => {
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `
function test() {
  return true;
  console.log('unreachable');
  const unused = 'code';
}`,
      };

      const optimized = optimizer.optimizeFile(file);
      expect(optimized.content).not.toContain('unreachable');
      expect(optimized.content).not.toContain('unused');
    });

    it('should remove empty functions', () => {
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `
class Test {
  public emptyMethod() {}
  private anotherEmpty() {}
  public validMethod() {
    return 'valid';
  }
}`,
      };

      const optimized = optimizer.optimizeFile(file);
      expect(optimized.content).not.toContain('emptyMethod');
      expect(optimized.content).not.toContain('anotherEmpty');
      expect(optimized.content).toContain('validMethod');
    });

    it('should remove unused private methods', () => {
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `
class Test {
  public doSomething() {
    this.used();
  }
  private used() {
    return 'used';
  }
  private unused() {
    return 'unused';
  }
}`,
      };

      const optimized = optimizer.optimizeFile(file);
      expect(optimized.content).toContain('used');
      expect(optimized.content).not.toContain('private unused()');
    });
  });
  
  describe('Tree-Shaking Optimizations', () => {
    it('should add pure annotations to classes', () => {
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `export class ServiceStub {}`,
      };
      
      const optimized = optimizer.optimizeFile(file);
      expect(optimized.content).toContain('/*#__PURE__*/ export class ServiceStub');
    });
    
    it('should add pure annotations to functions', () => {
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `export function createService() {}`,
      };
      
      const optimized = optimizer.optimizeFile(file);
      expect(optimized.content).toContain('/*#__PURE__*/ export function createService');
    });
    
    it('should convert default exports to named exports', () => {
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `export default class ServiceStub {}`,
      };
      
      const optimized = optimizer.optimizeFile(file);
      expect(optimized.content).not.toContain('export default');
      expect(optimized.content).toContain('export class ServiceStub');
    });
    
    it('should add no-side-effects comment', () => {
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `export class Test {}`,
      };
      
      const optimized = optimizer.optimizeFile(file);
      expect(optimized.content).toContain('/*#__NO_SIDE_EFFECTS__*/');
    });
  });
  
  describe('Import Optimization', () => {
    it('should combine multiple imports from same source', () => {
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `
import { A } from 'lib';
import { B } from 'lib';
import { C } from 'lib';`,
      };
      
      const optimized = optimizer.optimizeFile(file);
      expect(optimized.content).toContain('import { A, B, C } from \'lib\'');
      expect(optimized.content.match(/import.*from 'lib'/g)?.length).toBe(1);
    });
    
    it('should remove duplicate imports', () => {
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `
import { A } from 'lib';
import { A } from 'lib';
import { B } from 'lib';`,
      };
      
      const optimized = optimizer.optimizeFile(file);
      expect(optimized.content.match(/\bA\b/g)?.length).toBe(1);
    });
    
    it('should sort imports alphabetically', () => {
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `
import { Z, A, M } from 'lib';`,
      };
      
      const optimized = optimizer.optimizeFile(file);
      expect(optimized.content).toContain('import { A, M, Z } from \'lib\'');
    });
  });
  
  describe('Conditional Generation', () => {
    it('should remove unused services', () => {
      const optimizer = new CodeOptimizer({
        conditionalGeneration: true,
        usageTracking: {
          usedServices: new Set(['UserService']),
        },
      });
      
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `
export class UserServiceStub {
  getUser() {}
}
export class PostServiceStub {
  getPost() {}
}`,
      };
      
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'test',
        imports: [],
        services: [
          { name: 'UserService', methods: [], options: {} },
          { name: 'PostService', methods: [], options: {} },
        ],
        messages: [],
        enums: [],
        options: {},
      };
      
      const optimized = optimizer.optimizeFile(file, protoFile);
      expect(optimized.content).toContain('UserServiceStub');
      expect(optimized.content).not.toContain('PostServiceStub');
    });
    
    it.skip('should remove unused methods', () => {
      const optimizer = new CodeOptimizer({
        conditionalGeneration: true,
        deadCodeElimination: true,
        usageTracking: {
          usedMethods: new Map([
            ['UserService', new Set(['getUser'])],
          ]),
        },
      });
      
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `
class UserServiceStub {
  public getUser() {
    return 'user';
  }
  public updateUser() {
    return 'update';
  }
  public deleteUser() {
    return 'delete';
  }
}`,
      };
      
      const optimized = optimizer.optimizeFile(file);
      expect(optimized.content).toContain('getUser');
      expect(optimized.content).not.toContain('updateUser');
      expect(optimized.content).not.toContain('deleteUser');
    });
  });
  
  describe('Minification', () => {
    it('should remove whitespace in production mode', () => {
      const optimizer = new CodeOptimizer({
        production: true,
      });
      
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `
export   class   Test   {
  public   method   (   )   {
    return   true   ;
  }
}`,
      };
      
      const optimized = optimizer.optimizeFile(file);
      expect(optimized.content).not.toMatch(/\s{2,}/);
    });
    
    it('should compress boolean values', () => {
      const optimizer = new CodeOptimizer({
        minify: true,
      });
      
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `const a = true; const b = false;`,
      };
      
      const optimized = optimizer.optimizeFile(file);
      expect(optimized.content).toContain('!0'); // true -> !0
      expect(optimized.content).toContain('!1'); // false -> !1
    });
    
    it('should remove comments in production', () => {
      const optimizer = new CodeOptimizer({
        production: true,
      });
      
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `
// Single line comment
/* Multi-line
   comment */
/** JSDoc comment */
export class Test {}`,
      };
      
      const optimized = optimizer.optimizeFile(file);
      expect(optimized.content).not.toContain('comment');
    });
  });
  
  describe('ES Module Conversion', () => {
    it('should convert CommonJS exports to ES modules', () => {
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `module.exports = { Test, Service };`,
      };
      
      const optimized = optimizer.optimizeFile(file);
      expect(optimized.content).toContain('export { Test }');
      expect(optimized.content).toContain('export { Service }');
    });
    
    it('should convert require to import', () => {
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `const lib = require('library');`,
      };
      
      const optimized = optimizer.optimizeFile(file);
      expect(optimized.content).toContain('import lib from \'library\'');
    });
  });
  
  describe('Code Splitting', () => {
    it('should generate code split configuration', () => {
      // Create optimizer with code splitting enabled
      const splittingOptimizer = new CodeOptimizer({
        codeSplitting: true,
      });

      const services = [
        { name: 'UserService', methods: [], options: {} },
        { name: 'UserProfileService', methods: [], options: {} },
        { name: 'PostService', methods: [], options: {} },
      ];

      const config = splittingOptimizer.generateCodeSplitConfig(services);

      // Each service gets its own chunk based on name prefix
      expect(config.get('chunk-user')).toEqual(['UserService']);
      expect(config.get('chunk-userprofile')).toEqual(['UserProfileService']);
      expect(config.get('chunk-post')).toEqual(['PostService']);
    });
  });
  
  describe('Lazy Loading', () => {
    it('should generate lazy loading wrapper', () => {
      // Create optimizer with lazy loading enabled
      const lazyOptimizer = new CodeOptimizer({
        lazyLoading: true,
      });

      const wrapper = lazyOptimizer.generateLazyLoadWrapper('UserService', './user.service');

      expect(wrapper).toContain('UserServiceStub');
      expect(wrapper).toContain('async load()');
      expect(wrapper).toContain('import(\'./user.service\')');
      expect(wrapper).toContain('_loaded');
      expect(wrapper).toContain('_loading');
    });
  });
  
  describe('Metrics', () => {
    it('should track optimization metrics', () => {
      const file: GeneratedFile = {
        path: 'test.ts',
        content: `
// Comment to remove
export class Test {
  private unused() {}
  public used() {}
}
export class Unused {}`,
      };
      
      const protoFile: ProtoFile = {
        fileName: 'test.proto',
        package: 'test',
        imports: [],
        services: [],
        messages: [
          { name: 'Test', fields: [], nestedMessages: [], nestedEnums: [], oneofs: [], options: {} },
          { name: 'Unused', fields: [], nestedMessages: [], nestedEnums: [], oneofs: [], options: {} },
        ],
        enums: [],
        options: {},
      };
      
      const optimizer = new CodeOptimizer({
        conditionalGeneration: true,
        removeComments: true,
        deadCodeElimination: true,
        usageTracking: {
          usedMessages: new Set(['Test']),
        },
      });
      
      optimizer.optimizeFile(file, protoFile);
      const metrics = optimizer.getMetrics();
      
      expect(metrics.originalSize).toBeGreaterThan(0);
      expect(metrics.optimizedSize).toBeLessThan(metrics.originalSize);
      expect(metrics.reductionPercentage).toBeGreaterThan(0);
      expect(metrics.unusedExportsRemoved).toBeGreaterThan(0);
    });
  });
  
  describe('Analyze Optimization Opportunities', () => {
    it('should identify optimization opportunities', () => {
      const content = `
import { A } from 'lib';
import { A } from 'lib';
export class Service1 {}
export class Service2 {}
export class Service3 {
  private method() {
    // 600 characters of code here
    ${'x'.repeat(600)}
  }
}`;
      
      const opportunities = optimizer.analyzeOptimizationOpportunities(content);
      
      expect(opportunities).toContainEqual(expect.stringContaining('duplicate imports'));
      expect(opportunities).toContainEqual(expect.stringContaining('tree-shaken'));
      expect(opportunities).toContainEqual(expect.stringContaining('large methods'));
    });
  });
});