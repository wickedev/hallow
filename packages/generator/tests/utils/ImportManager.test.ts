/**
 * ImportManager unit tests
 */

import { ImportManager, ImportType, createImportManager } from '../../src/utils/ImportManager';
import { ImportDependency } from '../../src/utils/ImportResolver';

describe('ImportManager', () => {
  let importManager: ImportManager;
  
  beforeEach(() => {
    importManager = new ImportManager();
  });
  
  describe('Named imports', () => {
    it('should add named imports correctly', () => {
      importManager.addNamedImport('react', 'useState');
      importManager.addNamedImport('react', 'useEffect');
      
      const imports = importManager.generateImports();
      // ImportManager sorts imports alphabetically by default
      expect(imports).toContain("import { useEffect, useState } from 'react';");
    });
    
    it('should deduplicate named imports', () => {
      importManager.addNamedImport('react', 'useState');
      importManager.addNamedImport('react', 'useState');
      importManager.addNamedImport('react', 'useEffect');
      
      const imports = importManager.generateImports();
      expect(imports).toContain("import { useEffect, useState } from 'react';");
      expect(imports.match(/useState/g)?.length).toBe(1);
    });
    
    it('should handle multiple named imports at once', () => {
      importManager.addNamedImports('lodash', ['debounce', 'throttle', 'merge']);
      
      const imports = importManager.generateImports();
      expect(imports).toContain("import { debounce, merge, throttle } from 'lodash';");
    });
    
    it('should sort named imports alphabetically when configured', () => {
      importManager = new ImportManager({ sortAlphabetically: true });
      importManager.addNamedImports('utils', ['zebra', 'apple', 'banana']);
      
      const imports = importManager.generateImports();
      expect(imports).toContain("import { apple, banana, zebra } from 'utils';");
    });
  });
  
  describe('Type imports', () => {
    it('should add type-only imports correctly', () => {
      importManager.addNamedImport('./types', 'User', true);
      importManager.addNamedImport('./types', 'Post', true);
      
      const imports = importManager.generateImports();
      expect(imports).toContain("import type { Post, User } from './types';");
    });
    
    it('should separate type imports from regular imports', () => {
      importManager.addNamedImport('./utils', 'helper', false);
      importManager.addNamedImport('./types', 'User', true);
      
      const imports = importManager.generateImports();
      expect(imports).toContain("import { helper } from './utils';");
      expect(imports).toContain("import type { User } from './types';");
    });
  });
  
  describe('Default imports', () => {
    it('should add default imports correctly', () => {
      importManager.addDefaultImport('react', 'React');
      
      const imports = importManager.generateImports();
      expect(imports).toContain("import React from 'react';");
    });
    
    it('should warn when overwriting default imports', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      importManager.addDefaultImport('react', 'React');
      importManager.addDefaultImport('react', 'ReactOverride');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Default import from "react" already exists')
      );
      
      const imports = importManager.generateImports();
      expect(imports).toContain("import ReactOverride from 'react';");
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Namespace imports', () => {
    it('should add namespace imports correctly', () => {
      importManager.addNamespaceImport('lodash', '_');
      
      const imports = importManager.generateImports();
      expect(imports).toContain("import * as _ from 'lodash';");
    });
    
    it('should warn when overwriting namespace imports', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      importManager.addNamespaceImport('lodash', '_');
      importManager.addNamespaceImport('lodash', 'lodash');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Namespace import from "lodash" already exists')
      );
      
      consoleSpy.mockRestore();
    });
  });
  
  describe('Side-effect imports', () => {
    it('should add side-effect imports correctly', () => {
      importManager.addSideEffectImport('./polyfills');
      importManager.addSideEffectImport('./styles.css');
      
      const imports = importManager.generateImports();
      expect(imports).toContain("import './polyfills';");
      expect(imports).toContain("import './styles.css';");
    });
  });
  
  describe('gRPC and Protobuf imports', () => {
    it('should add gRPC imports correctly', () => {
      importManager.addGrpcImports();
      
      const imports = importManager.generateImports();
      expect(imports).toContain('@improbable-eng/grpc-web');
      expect(imports).toContain('grpc');
      expect(imports).toContain('Code');
      expect(imports).toContain('Metadata');
      expect(imports).toContain("import * as pb from 'google-protobuf';");
    });
    
    it('should add protobuf message imports', () => {
      importManager.addProtobufMessageImports(['User', 'Post', 'Comment']);
      
      const imports = importManager.generateImports();
      expect(imports).toContain("import { Comment, Post, User } from './messages';");
    });
    
    it('should add protobuf message imports with custom source', () => {
      importManager.addProtobufMessageImports(['User', 'Post'], '../protos/messages');
      
      const imports = importManager.generateImports();
      expect(imports).toContain("import { Post, User } from '../protos/messages';");
    });
  });
  
  describe('React imports', () => {
    it('should add default React hooks', () => {
      importManager.addReactImports();
      
      const imports = importManager.generateImports();
      expect(imports).toContain('useState');
      expect(imports).toContain('useEffect');
      expect(imports).toContain('useCallback');
      expect(imports).toContain('useMemo');
    });
    
    it('should add custom React hooks', () => {
      importManager.addReactImports(['useContext', 'useReducer']);
      
      const imports = importManager.generateImports();
      expect(imports).toContain('useContext');
      expect(imports).toContain('useReducer');
      // Should also include defaults
      expect(imports).toContain('useState');
    });
    
    it('should add Suspense imports', () => {
      importManager.addSuspenseImports();
      
      const imports = importManager.generateImports();
      expect(imports).toContain('Suspense');
      expect(imports).toContain('use');
    });
  });
  
  describe('Cross-file imports', () => {
    it('should add cross-file proto imports', () => {
      importManager.addCrossFileImport('UserMessage', './user.proto');
      importManager.addCrossFileImport('PostMessage', './post.proto');
      
      const imports = importManager.generateImports();
      expect(imports).toContain("import { UserMessage } from './user';");
      expect(imports).toContain("import { PostMessage } from './post';");
    });
    
    it('should handle well-known type imports', () => {
      importManager.addWellKnownTypeImport('Timestamp', 'google-protobuf/google/protobuf/timestamp_pb');
      importManager.addWellKnownTypeImport('Duration', 'google-protobuf/google/protobuf/duration_pb');
      
      const imports = importManager.generateImports();
      expect(imports).toContain("import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';");
      expect(imports).toContain("import { Duration } from 'google-protobuf/google/protobuf/duration_pb';");
    });
  });
  
  describe('Import dependencies integration', () => {
    it('should add imports from ImportResolver dependencies', () => {
      const dependencies: ImportDependency[] = [
        {
          source: './user',
          types: ['User', 'UserProfile'],
          isProtoImport: true,
        },
        {
          source: 'google-protobuf/google/protobuf/timestamp_pb',
          types: ['Timestamp'],
          isProtoImport: false,
        },
      ];
      
      importManager.addFromDependencies(dependencies);
      
      const imports = importManager.generateImports();
      expect(imports).toContain("import { User, UserProfile } from './user';");
      expect(imports).toContain("import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';");
    });
    
    it('should handle namespace imports from dependencies', () => {
      const dependencies: ImportDependency[] = [
        {
          source: './common',
          types: ['Type1', 'Type2', 'Type3', 'Type4'],
          isProtoImport: true,
          useNamespace: true,
          namespaceName: 'Common',
        },
      ];
      
      importManager.addFromDependencies(dependencies);
      
      const imports = importManager.generateImports();
      expect(imports).toContain("import * as Common from './common';");
    });
  });
  
  describe('Import grouping and organization', () => {
    it('should group imports by category', () => {
      importManager = new ImportManager({
        groupByCategory: true,
        addBlankLinesBetweenGroups: true,
      });
      
      // Add various types of imports
      importManager.addSideEffectImport('./polyfills');
      importManager.addNamedImport('react', 'useState');
      importManager.addNamedImport('./utils', 'helper');
      importManager.addNamespaceImport('lodash', '_');
      
      const imports = importManager.generateImports();
      const lines = imports.split('\n');
      
      // Check that there are blank lines between groups
      expect(lines.some(line => line === '')).toBe(true);
      
      // Check order: side-effects, external, internal
      const sideEffectIndex = lines.findIndex(line => line.includes('./polyfills'));
      const externalIndex = lines.findIndex(line => line.includes('react'));
      const internalIndex = lines.findIndex(line => line.includes('./utils'));
      
      expect(sideEffectIndex).toBeLessThan(externalIndex);
      expect(externalIndex).toBeLessThan(internalIndex);
    });
    
    it('should use generateProtoImports for organized proto imports', () => {
      importManager.addGrpcImports();
      importManager.addNamedImport('react', 'useState');
      importManager.addNamedImport('./messages', 'User');
      
      const imports = importManager.generateProtoImports();
      const lines = imports.split('\n');
      
      // Check that google-protobuf comes before other externals
      const protobufIndex = lines.findIndex(line => line.includes('google-protobuf'));
      const reactIndex = lines.findIndex(line => line.includes('react'));
      const messagesIndex = lines.findIndex(line => line.includes('./messages'));
      
      expect(protobufIndex).toBeLessThan(reactIndex);
      expect(reactIndex).toBeLessThan(messagesIndex);
    });
  });
  
  describe('Import utilities', () => {
    it('should check if imports are present', () => {
      expect(importManager.hasImports()).toBe(false);
      
      importManager.addNamedImport('react', 'useState');
      
      expect(importManager.hasImports()).toBe(true);
    });
    
    it('should count imports correctly', () => {
      expect(importManager.getImportCount()).toBe(0);
      
      importManager.addNamedImport('react', 'useState');
      importManager.addDefaultImport('lodash', '_');
      importManager.addSideEffectImport('./styles');
      
      expect(importManager.getImportCount()).toBe(3);
    });
    
    it('should check if specific type exists', () => {
      importManager.addNamedImport('react', 'useState');
      importManager.addNamedImport('./types', 'User', true);
      
      expect(importManager.hasType('useState')).toBe(true);
      expect(importManager.hasType('User')).toBe(true);
      expect(importManager.hasType('NonExistent')).toBe(false);
    });
    
    it('should get source for specific type', () => {
      importManager.addNamedImport('react', 'useState');
      importManager.addNamedImport('./types', 'User', true);
      
      expect(importManager.getTypeSource('useState')).toBe('react');
      expect(importManager.getTypeSource('User')).toBe('./types');
      expect(importManager.getTypeSource('NonExistent')).toBeNull();
    });
    
    it('should clear all imports', () => {
      importManager.addNamedImport('react', 'useState');
      importManager.addDefaultImport('lodash', '_');
      
      expect(importManager.hasImports()).toBe(true);
      
      importManager.clear();
      
      expect(importManager.hasImports()).toBe(false);
      expect(importManager.getImportCount()).toBe(0);
    });
    
    it('should merge imports from another ImportManager', () => {
      const other = new ImportManager();
      other.addNamedImport('react', 'useState');
      other.addDefaultImport('lodash', '_');
      
      importManager.addNamedImport('vue', 'ref');
      importManager.merge(other);
      
      const imports = importManager.generateImports();
      expect(imports).toContain('react');
      expect(imports).toContain('lodash');
      expect(imports).toContain('vue');
    });
    
    it('should clone ImportManager', () => {
      importManager.addNamedImport('react', 'useState');
      importManager.addDefaultImport('lodash', '_');
      
      const cloned = importManager.clone();
      
      // Original and clone should have same imports
      expect(cloned.generateImports()).toBe(importManager.generateImports());
      
      // Modifying clone shouldn't affect original
      cloned.addNamedImport('vue', 'ref');
      expect(cloned.generateImports()).toContain('vue');
      expect(importManager.generateImports()).not.toContain('vue');
    });
  });
  
  describe('Factory function', () => {
    it('should create ImportManager with factory function', () => {
      const manager = createImportManager({
        sortAlphabetically: true,
        addBlankLinesBetweenGroups: true,
      });
      
      expect(manager).toBeInstanceOf(ImportManager);
      
      manager.addNamedImports('utils', ['zebra', 'apple']);
      const imports = manager.generateImports();
      
      expect(imports).toContain('apple, zebra');
    });
  });
});