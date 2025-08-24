import { ImportOptimizer } from '../../src/optimizers/ImportOptimizer';

describe('ImportOptimizer', () => {
  let optimizer: ImportOptimizer;
  
  beforeEach(() => {
    optimizer = new ImportOptimizer();
  });
  
  describe('Import Parsing', () => {
    it('should parse named imports', () => {
      const code = `
import { A, B, C } from 'library';
import { D } from 'another';`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized).toContain("import { A, B, C } from 'library'");
      expect(optimized).toContain("import { D } from 'another'");
    });
    
    it('should parse default imports', () => {
      const code = `import React from 'react';`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized).toContain("import React from 'react'");
    });
    
    it('should parse namespace imports', () => {
      const code = `import * as utils from './utils';`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized).toContain("import * as utils from './utils'");
    });
    
    it('should parse type imports', () => {
      const code = `import type { User } from './types';`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized).toContain("import type { User } from './types'");
    });
    
    it('should parse side-effect imports', () => {
      const code = `import './styles.css';`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized).toContain("import './styles.css'");
    });
  });
  
  describe('Unused Import Removal', () => {
    it('should remove completely unused imports', () => {
      const code = `
import { Unused } from 'library';
import { Used } from 'another';

const result = Used();`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized).not.toContain('Unused');
      expect(optimized).toContain('Used');
    });
    
    it('should remove unused named imports but keep used ones', () => {
      const code = `
import { Used, Unused } from 'library';

const result = Used();`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized).toContain("import { Used } from 'library'");
      expect(optimized).not.toContain('Unused');
    });
    
    it('should remove unused default imports', () => {
      const code = `
import DefaultUnused from 'library';
import { Named } from 'library';

const result = Named();`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized).not.toContain('DefaultUnused');
      expect(optimized).toContain('Named');
    });
    
    it('should keep side-effect imports even if unused', () => {
      const code = `
import './polyfill';
import { Unused } from 'library';`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized).toContain("import './polyfill'");
      expect(optimized).not.toContain('Unused');
    });
  });
  
  describe('Named Import Preference', () => {
    it('should convert namespace imports to named imports when possible', () => {
      const code = `
import * as utils from './utils';

const result = utils.formatDate(new Date());
const name = utils.formatName('test');`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized).toContain('import { formatDate, formatName } from \'./utils\'');
      expect(optimized).not.toContain('* as utils');
    });
    
    it('should keep namespace imports when too many members are used', () => {
      const code = `
import * as utils from './utils';

${Array.from({ length: 15 }, (_, i) => `const v${i} = utils.fn${i}();`).join('\n')}`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized).toContain('* as utils');
    });
  });
  
  describe('Import Combining', () => {
    it('should combine multiple imports from same source', () => {
      const code = `
import { A } from 'library';
import { B } from 'library';
import { C } from 'library';

const a = A();
const b = B();
const c = C();`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized.match(/from 'library'/g)?.length).toBe(1);
      expect(optimized).toContain('import { A, B, C } from \'library\'');
    });
    
    it('should combine default and named imports', () => {
      const code = `
import React from 'react';
import { useState } from 'react';

const Component = () => {
  const [state] = useState();
  return React.createElement('div');
};`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized).toContain('import React, { useState } from \'react\'');
    });
  });
  
  describe('Import Sorting', () => {
    it('should sort imports alphabetically within groups', () => {
      const code = `
import { Z, A, M } from 'library';

const a = A();
const m = M();
const z = Z();`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized).toContain('import { A, M, Z } from \'library\'');
    });
    
    it('should sort import sources alphabetically', () => {
      const code = `
import { Z } from 'z-library';
import { A } from 'a-library';

const a = A();
const z = Z();`;
      
      const optimized = optimizer.optimizeImports(code);
      const lines = optimized.split('\n').filter(l => l.includes('import'));
      expect(lines[0]).toContain('a-library');
      expect(lines[1]).toContain('z-library');
    });
  });
  
  describe('Import Grouping', () => {
    it('should group imports by type', () => {
      const optimizer = new ImportOptimizer({ groupImports: true });
      
      const code = `
import './side-effect';
import { external } from 'external-package';
import { internal } from './internal';
import type { Type } from './types';

const e = external();
const i = internal();`;
      
      const optimized = optimizer.optimizeImports(code);
      const lines = optimized.split('\n');
      
      // Side effects should come first
      const sideEffectIndex = lines.findIndex(l => l.includes('side-effect'));
      const externalIndex = lines.findIndex(l => l.includes('external-package'));
      const internalIndex = lines.findIndex(l => l.includes('./internal'));
      
      expect(sideEffectIndex).toBeLessThan(externalIndex);
      expect(externalIndex).toBeLessThan(internalIndex);
    });
    
    it('should add blank lines between groups', () => {
      const optimizer = new ImportOptimizer({ groupImports: true });
      
      const code = `
import { external } from 'package';
import { internal } from './file';

const e = external();
const i = internal();`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized).toMatch(/package';\n\nimport.*file'/);
    });
  });
  
  describe('Dynamic Import Detection', () => {
    it('should identify candidates for dynamic imports', () => {
      const code = `
import { heavyLibrary } from 'lodash';

async function loadFeature() {
  if (condition) {
    const result = heavyLibrary();
  }
}`;
      
      const optimizer = new ImportOptimizer({ useDynamicImports: true });
      const optimized = optimizer.optimizeImports(code);
      
      // The optimizer should identify lodash as a candidate
      // but not automatically convert (that requires explicit action)
      expect(optimized).toBeDefined();
    });
    
    it('should convert to dynamic imports when requested', () => {
      const code = `
import { feature } from 'heavy-library';

const result = feature();`;
      
      const candidates = new Set(['heavy-library']);
      const converted = optimizer.convertToDynamicImports(code, candidates);
      
      expect(converted).toContain('await import(\'heavy-library\')');
      expect(converted).not.toContain('import { feature } from \'heavy-library\'');
    });
  });
  
  describe('Tree-Shakeable Imports', () => {
    it('should prefer named imports for tree-shaking', () => {
      const optimizer = new ImportOptimizer({ 
        treeShakeableImports: true,
        preferNamedImports: true,
      });
      
      const code = `
import * as lib from 'library';
import { specific } from 'library';

const a = lib.method();
const b = specific();`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized).toContain('import { method, specific } from \'library\'');
      expect(optimized).not.toContain('* as lib');
    });
  });
  
  describe('Complex Import Scenarios', () => {
    it('should handle mixed import types correctly', () => {
      const code = `
import React, { useState, useEffect } from 'react';
import * as ReactDOM from 'react-dom';
import type { FC } from 'react';
import './styles.css';

const Component: FC = () => {
  const [state] = useState();
  useEffect(() => {}, []);
  ReactDOM.render(React.createElement('div'), document.body);
};`;
      
      const optimized = optimizer.optimizeImports(code);
      
      expect(optimized).toContain("import './styles.css'");
      expect(optimized).toContain('React');
      expect(optimized).toContain('useState');
      expect(optimized).toContain('useEffect');
      expect(optimized).toContain('ReactDOM');
      expect(optimized).toContain('type { FC }');
    });
    
    it('should handle imports with aliases', () => {
      const code = `
import { original as renamed } from 'library';

const result = renamed();`;
      
      const optimized = optimizer.optimizeImports(code);
      expect(optimized).toContain('original as renamed');
    });
    
    it('should preserve import order when not sorting', () => {
      const optimizer = new ImportOptimizer({ sortImports: false });
      
      const code = `
import { Z } from 'z';
import { A } from 'a';

const z = Z();
const a = A();`;
      
      const optimized = optimizer.optimizeImports(code);
      const lines = optimized.split('\n').filter(l => l.includes('import'));
      
      expect(lines[0]).toContain('z');
      expect(lines[1]).toContain('a');
    });
  });
});