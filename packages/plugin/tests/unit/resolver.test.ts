/**
 * Unit tests for ProtoResolver
 *
 * Tests the proto file path resolution logic including:
 * - Constructor initialization
 * - Search path ordering and priority
 * - Path validation and security checks
 *
 * @packageDocumentation
 */

import { ProtoResolver } from '../../src/resolver';
import { ResolverOptions } from '../../src/types';

describe('ProtoResolver', () => {
  describe('constructor', () => {
    it('should initialize with provided options', () => {
      const options: ResolverOptions = {
        protoRoot: '/project/protos',
        importPaths: ['/shared/protos', '/vendor/protos'],
        projectRoot: '/project',
      };

      const resolver = new ProtoResolver(options);

      expect(resolver).toBeInstanceOf(ProtoResolver);
    });

    it('should resolve relative paths to absolute paths', () => {
      const options: ResolverOptions = {
        protoRoot: './protos',
        importPaths: ['./shared', './vendor'],
        projectRoot: '.',
      };

      const resolver = new ProtoResolver(options);

      // Should not throw and should normalize paths internally
      expect(resolver).toBeInstanceOf(ProtoResolver);
    });

    it('should handle empty import paths', () => {
      const options: ResolverOptions = {
        protoRoot: '/project/protos',
        importPaths: [],
        projectRoot: '/project',
      };

      const resolver = new ProtoResolver(options);

      expect(resolver).toBeInstanceOf(ProtoResolver);
    });
  });

  describe('getSearchPaths', () => {
    let resolver: ProtoResolver;

    beforeEach(() => {
      const options: ResolverOptions = {
        protoRoot: '/project/protos',
        importPaths: ['/shared/protos', '/vendor/protos'],
        projectRoot: '/project',
      };
      resolver = new ProtoResolver(options);
    });

    it('should return search paths in correct priority order', () => {
      const fromFile = '/project/src/api/service.proto';
      const searchPaths = resolver.getSearchPaths(fromFile);

      expect(searchPaths).toEqual([
        '/project/src/api', // Directory of importing file
        '/project', // Project root
        '/project/protos', // Proto root
        '/shared/protos', // First import path
        '/vendor/protos', // Second import path
        '/project/node_modules', // node_modules
      ]);
    });

    it('should include importing file directory as first search path', () => {
      const fromFile = '/project/src/api/v1/service.proto';
      const searchPaths = resolver.getSearchPaths(fromFile);

      expect(searchPaths[0]).toBe('/project/src/api/v1');
    });

    it('should include project root in search paths', () => {
      const fromFile = '/project/src/service.proto';
      const searchPaths = resolver.getSearchPaths(fromFile);

      expect(searchPaths).toContain('/project');
    });

    it('should include proto root in search paths', () => {
      const fromFile = '/project/src/service.proto';
      const searchPaths = resolver.getSearchPaths(fromFile);

      expect(searchPaths).toContain('/project/protos');
    });

    it('should include all configured import paths in order', () => {
      const fromFile = '/project/src/service.proto';
      const searchPaths = resolver.getSearchPaths(fromFile);

      const importPathsIndex = [
        searchPaths.indexOf('/shared/protos'),
        searchPaths.indexOf('/vendor/protos'),
      ];

      // Both should be present
      expect(importPathsIndex[0]).toBeGreaterThan(-1);
      expect(importPathsIndex[1]).toBeGreaterThan(-1);

      // Should be in configured order
      expect(importPathsIndex[0]).toBeLessThan(importPathsIndex[1]);
    });

    it('should include node_modules directory', () => {
      const fromFile = '/project/src/service.proto';
      const searchPaths = resolver.getSearchPaths(fromFile);

      expect(searchPaths).toContain('/project/node_modules');
    });

    it('should place node_modules last in search order', () => {
      const fromFile = '/project/src/service.proto';
      const searchPaths = resolver.getSearchPaths(fromFile);

      const lastPath = searchPaths[searchPaths.length - 1];
      expect(lastPath).toBe('/project/node_modules');
    });

    it('should not duplicate project root if it matches importing directory', () => {
      const fromFile = '/project/service.proto';
      const searchPaths = resolver.getSearchPaths(fromFile);

      const projectRootCount = searchPaths.filter((p) => p === '/project').length;
      expect(projectRootCount).toBe(1);
    });

    it('should not duplicate proto root if it matches project root', () => {
      const options: ResolverOptions = {
        protoRoot: '/project', // Same as project root
        importPaths: [],
        projectRoot: '/project',
      };
      const resolverSameRoot = new ProtoResolver(options);

      const fromFile = '/project/src/service.proto';
      const searchPaths = resolverSameRoot.getSearchPaths(fromFile);

      const projectRootCount = searchPaths.filter((p) => p === '/project').length;
      expect(projectRootCount).toBe(1);
    });

    it('should not duplicate import paths that are already in the list', () => {
      const fromFile = '/project/src/service.proto';
      const searchPaths = resolver.getSearchPaths(fromFile);

      // Check for duplicates
      const uniquePaths = [...new Set(searchPaths)];
      expect(searchPaths.length).toBe(uniquePaths.length);
    });

    it('should handle deeply nested file paths', () => {
      const fromFile = '/project/src/api/v1/services/grpc/service.proto';
      const searchPaths = resolver.getSearchPaths(fromFile);

      expect(searchPaths[0]).toBe('/project/src/api/v1/services/grpc');
      expect(searchPaths).toContain('/project');
      expect(searchPaths).toContain('/project/protos');
    });

    it('should handle file at project root', () => {
      const fromFile = '/project/service.proto';
      const searchPaths = resolver.getSearchPaths(fromFile);

      // First path should be project root (which is also importing dir)
      expect(searchPaths[0]).toBe('/project');
      // Should still include proto root if different
      expect(searchPaths).toContain('/project/protos');
    });
  });

  describe('validatePath', () => {
    let resolver: ProtoResolver;

    beforeEach(() => {
      const options: ResolverOptions = {
        protoRoot: '/project/protos',
        importPaths: [],
        projectRoot: '/project',
      };
      resolver = new ProtoResolver(options);
    });

    describe('valid paths', () => {
      it('should accept simple relative paths', () => {
        expect(resolver.validatePath('./service.proto')).toBe(true);
        expect(resolver.validatePath('service.proto')).toBe(true);
        expect(resolver.validatePath('api/service.proto')).toBe(true);
      });

      it('should accept relative paths with subdirectories', () => {
        expect(resolver.validatePath('common/types.proto')).toBe(true);
        expect(resolver.validatePath('./api/v1/service.proto')).toBe(true);
        expect(resolver.validatePath('deeply/nested/path/file.proto')).toBe(true);
      });

      it('should accept absolute paths within project', () => {
        expect(resolver.validatePath('/project/protos/service.proto')).toBe(true);
        expect(resolver.validatePath('/project/src/api/service.proto')).toBe(true);
      });

      it('should accept absolute paths outside project', () => {
        // Absolute paths are allowed, validation is for relative path traversal
        expect(resolver.validatePath('/shared/protos/common.proto')).toBe(true);
        expect(resolver.validatePath('/vendor/protos/api.proto')).toBe(true);
      });

      it('should accept paths with normalized single dots', () => {
        expect(resolver.validatePath('./service.proto')).toBe(true);
        expect(resolver.validatePath('./api/./service.proto')).toBe(true);
      });
    });

    describe('invalid paths - directory traversal prevention', () => {
      it('should reject paths with .. that traverse upward', () => {
        expect(resolver.validatePath('../service.proto')).toBe(false);
        expect(resolver.validatePath('../../service.proto')).toBe(false);
        expect(resolver.validatePath('../../../etc/passwd')).toBe(false);
      });

      it('should reject paths that escape project root', () => {
        expect(resolver.validatePath('../../outside/file.proto')).toBe(false);
        expect(resolver.validatePath('../../../etc/passwd')).toBe(false);
      });

      it('should reject paths with .. in the middle', () => {
        expect(resolver.validatePath('api/../../../etc/passwd')).toBe(false);
        expect(resolver.validatePath('./api/../../outside/file.proto')).toBe(false);
      });

      it('should reject complex traversal attempts', () => {
        expect(resolver.validatePath('api/v1/../../../etc/passwd')).toBe(false);
        expect(resolver.validatePath('./valid/../../invalid/file.proto')).toBe(false);
      });

      it('should reject paths that normalize to contain ..', () => {
        expect(resolver.validatePath('a/b/../../c/../../../etc/passwd')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle empty string', () => {
        expect(resolver.validatePath('')).toBe(true);
      });

      it('should handle single dot (current directory)', () => {
        expect(resolver.validatePath('.')).toBe(true);
      });

      it('should handle paths with multiple slashes', () => {
        expect(resolver.validatePath('api//service.proto')).toBe(true);
        expect(resolver.validatePath('./api///v1/service.proto')).toBe(true);
      });

      it('should handle Windows-style paths on Windows', () => {
        if (process.platform === 'win32') {
          expect(resolver.validatePath('C:\\project\\protos\\service.proto')).toBe(true);
          expect(resolver.validatePath('api\\service.proto')).toBe(true);
        }
      });

      it('should reject Windows-style traversal on Windows', () => {
        if (process.platform === 'win32') {
          expect(resolver.validatePath('..\\..\\etc\\passwd')).toBe(false);
          expect(resolver.validatePath('api\\..\\..\\outside\\file.proto')).toBe(false);
        }
      });
    });

    describe('security validation', () => {
      it('should prevent access to system files via traversal', () => {
        const maliciousPaths = [
          '../../../etc/passwd',
          '../../../../../../etc/shadow',
          '../../../../../../../root/.ssh/id_rsa',
          '../../../../Windows/System32/config/sam',
        ];

        maliciousPaths.forEach((maliciousPath) => {
          expect(resolver.validatePath(maliciousPath)).toBe(false);
        });
      });

      it('should prevent access to parent project directories', () => {
        expect(resolver.validatePath('../../other-project/secrets.txt')).toBe(false);
        expect(resolver.validatePath('../sibling-project/config.json')).toBe(false);
      });

      it('should allow same-level or deeper paths only', () => {
        expect(resolver.validatePath('service.proto')).toBe(true);
        expect(resolver.validatePath('api/service.proto')).toBe(true);
        expect(resolver.validatePath('api/v1/service.proto')).toBe(true);
        expect(resolver.validatePath('./api/service.proto')).toBe(true);
      });
    });
  });

  describe('resolve', () => {
    let resolver: ProtoResolver;
    const mockFs = require('fs');

    beforeEach(() => {
      const options: ResolverOptions = {
        protoRoot: '/project/protos',
        importPaths: ['/shared/protos'],
        projectRoot: '/project',
      };
      resolver = new ProtoResolver(options);

      // Reset mocks
      jest.clearAllMocks();
    });

    describe('relative import resolution', () => {
      it('should resolve relative import from same directory', () => {
        const fromFile = '/project/src/api/service.proto';
        const importPath = 'types.proto';

        // Mock file exists in same directory
        jest.spyOn(mockFs, 'existsSync').mockImplementation((...args: unknown[]) => {
          const path = args[0] as string;
          return path === '/project/src/api/types.proto';
        });
        jest.spyOn(mockFs, 'statSync').mockReturnValue({ isFile: () => true } as any);

        const result = resolver.resolve(importPath, fromFile);

        expect(result).toEqual({
          absolutePath: '/project/src/api/types.proto',
          originalImport: 'types.proto',
          isWellKnown: false,
          packagePath: undefined,
        });
      });

      it('should resolve relative import with ./ prefix', () => {
        const fromFile = '/project/src/service.proto';
        const importPath = './common/types.proto';

        jest.spyOn(mockFs, 'existsSync').mockImplementation((...args: unknown[]) => {
          const path = args[0] as string;
          return path === '/project/src/common/types.proto';
        });
        jest.spyOn(mockFs, 'statSync').mockReturnValue({ isFile: () => true } as any);

        const result = resolver.resolve(importPath, fromFile);

        expect(result.absolutePath).toBe('/project/src/common/types.proto');
        expect(result.isWellKnown).toBe(false);
      });

      it('should resolve nested relative import', () => {
        const fromFile = '/project/src/api/v1/service.proto';
        const importPath = 'models/user.proto';

        jest.spyOn(mockFs, 'existsSync').mockImplementation((...args: unknown[]) => {
          const path = args[0] as string;
          return path === '/project/src/api/v1/models/user.proto';
        });
        jest.spyOn(mockFs, 'statSync').mockReturnValue({ isFile: () => true } as any);

        const result = resolver.resolve(importPath, fromFile);

        expect(result.absolutePath).toBe('/project/src/api/v1/models/user.proto');
      });
    });

    describe('absolute import resolution', () => {
      it('should resolve from project root', () => {
        const fromFile = '/project/src/api/service.proto';
        const importPath = 'common/types.proto';

        jest.spyOn(mockFs, 'existsSync').mockImplementation((...args: unknown[]) => {
          const path = args[0] as string;
          return path === '/project/common/types.proto';
        });
        jest.spyOn(mockFs, 'statSync').mockReturnValue({ isFile: () => true } as any);

        const result = resolver.resolve(importPath, fromFile);

        expect(result.absolutePath).toBe('/project/common/types.proto');
        expect(result.isWellKnown).toBe(false);
      });

      it('should resolve from protoRoot', () => {
        const fromFile = '/project/src/api/service.proto';
        const importPath = 'shared/base.proto';

        jest.spyOn(mockFs, 'existsSync').mockImplementation((...args: unknown[]) => {
          const path = args[0] as string;
          return path === '/project/protos/shared/base.proto';
        });
        jest.spyOn(mockFs, 'statSync').mockReturnValue({ isFile: () => true } as any);

        const result = resolver.resolve(importPath, fromFile);

        expect(result.absolutePath).toBe('/project/protos/shared/base.proto');
      });

      it('should resolve from configured import paths', () => {
        const fromFile = '/project/src/api/service.proto';
        const importPath = 'vendor/api.proto';

        jest.spyOn(mockFs, 'existsSync').mockImplementation((...args: unknown[]) => {
          const path = args[0] as string;
          return path === '/shared/protos/vendor/api.proto';
        });
        jest.spyOn(mockFs, 'statSync').mockReturnValue({ isFile: () => true } as any);

        const result = resolver.resolve(importPath, fromFile);

        expect(result.absolutePath).toBe('/shared/protos/vendor/api.proto');
      });
    });

    describe('node_modules resolution', () => {
      it('should resolve proto from node_modules package', () => {
        const fromFile = '/project/src/service.proto';
        const importPath = 'some-package/api.proto';

        jest.spyOn(mockFs, 'existsSync').mockImplementation((...args: unknown[]) => {
          const path = args[0] as string;
          return path === '/project/node_modules/some-package/api.proto';
        });
        jest.spyOn(mockFs, 'statSync').mockReturnValue({ isFile: () => true } as any);

        const result = resolver.resolve(importPath, fromFile);

        expect(result.absolutePath).toBe('/project/node_modules/some-package/api.proto');
        expect(result.isWellKnown).toBe(false);
        expect(result.packagePath).toBe('some-package');
      });

      it('should resolve proto from scoped package in node_modules', () => {
        const fromFile = '/project/src/service.proto';
        const importPath = '@grpc/proto-loader/types.proto';

        jest.spyOn(mockFs, 'existsSync').mockImplementation((...args: unknown[]) => {
          const path = args[0] as string;
          return path === '/project/node_modules/@grpc/proto-loader/types.proto';
        });
        jest.spyOn(mockFs, 'statSync').mockReturnValue({ isFile: () => true } as any);

        const result = resolver.resolve(importPath, fromFile);

        expect(result.absolutePath).toBe('/project/node_modules/@grpc/proto-loader/types.proto');
        expect(result.packagePath).toBe('@grpc/proto-loader');
      });
    });

    describe('well-known type resolution', () => {
      it('should delegate to resolveWellKnownType for google/protobuf imports', () => {
        const fromFile = '/project/src/service.proto';
        const importPath = 'google/protobuf/timestamp.proto';

        jest.spyOn(mockFs, 'existsSync').mockReturnValue(true);
        jest.spyOn(mockFs, 'statSync').mockReturnValue({ isFile: () => true } as any);

        const result = resolver.resolve(importPath, fromFile);

        expect(result.isWellKnown).toBe(true);
        expect(result.originalImport).toBe('google/protobuf/timestamp.proto');
      });
    });

    describe('resolution priority', () => {
      it('should prefer local file over protoRoot', () => {
        const fromFile = '/project/src/api/service.proto';
        const importPath = 'types.proto';

        // File exists in both local directory and protoRoot
        jest.spyOn(mockFs, 'existsSync').mockImplementation((...args: unknown[]) => {
          const path = args[0] as string;
          return (
            path === '/project/src/api/types.proto' || path === '/project/protos/types.proto'
          );
        });
        jest.spyOn(mockFs, 'statSync').mockReturnValue({ isFile: () => true } as any);

        const result = resolver.resolve(importPath, fromFile);

        // Should resolve from local directory (first in search order)
        expect(result.absolutePath).toBe('/project/src/api/types.proto');
      });

      it('should prefer protoRoot over node_modules', () => {
        const fromFile = '/project/src/service.proto';
        const importPath = 'common/base.proto';

        // File exists in both protoRoot and node_modules
        jest.spyOn(mockFs, 'existsSync').mockImplementation((...args: unknown[]) => {
          const path = args[0] as string;
          return (
            path === '/project/protos/common/base.proto' ||
            path === '/project/node_modules/common/base.proto'
          );
        });
        jest.spyOn(mockFs, 'statSync').mockReturnValue({ isFile: () => true } as any);

        const result = resolver.resolve(importPath, fromFile);

        // Should resolve from protoRoot (higher priority than node_modules)
        expect(result.absolutePath).toBe('/project/protos/common/base.proto');
      });
    });

    describe('error handling', () => {
      it('should throw error when proto file not found', () => {
        const fromFile = '/project/src/service.proto';
        const importPath = 'nonexistent.proto';

        jest.spyOn(mockFs, 'existsSync').mockReturnValue(false);

        expect(() => {
          resolver.resolve(importPath, fromFile);
        }).toThrow('[Hallow Plugin] Import resolution failed');
      });

      it('should include searched paths in error message', () => {
        const fromFile = '/project/src/service.proto';
        const importPath = 'missing.proto';

        jest.spyOn(mockFs, 'existsSync').mockReturnValue(false);

        try {
          resolver.resolve(importPath, fromFile);
          fail('Should have thrown error');
        } catch (error: any) {
          expect(error.message).toContain('Searched in:');
          expect(error.message).toContain('/project/src/missing.proto');
          expect(error.message).toContain('/project/missing.proto');
          expect(error.message).toContain('/project/protos/missing.proto');
        }
      });

      it('should include helpful suggestion in error message', () => {
        const fromFile = '/project/src/service.proto';
        const importPath = 'missing.proto';

        jest.spyOn(mockFs, 'existsSync').mockReturnValue(false);

        expect(() => {
          resolver.resolve(importPath, fromFile);
        }).toThrow('Suggestion: Check if the file exists and the path is correct');
      });

      it('should reject path with directory traversal', () => {
        const fromFile = '/project/src/service.proto';
        const importPath = '../../../etc/passwd';

        expect(() => {
          resolver.resolve(importPath, fromFile);
        }).toThrow('[Hallow Plugin] Path validation failed');
      });

      it('should skip directories when resolving', () => {
        const fromFile = '/project/src/service.proto';
        const importPath = 'api';

        jest.spyOn(mockFs, 'existsSync').mockReturnValue(true);
        jest.spyOn(mockFs, 'statSync').mockReturnValue({ isFile: () => false } as any);

        expect(() => {
          resolver.resolve(importPath, fromFile);
        }).toThrow('[Hallow Plugin] Import resolution failed');
      });
    });
  });

  describe('resolveWellKnownType', () => {
    let resolver: ProtoResolver;
    const mockFs = require('fs');

    beforeEach(() => {
      const options: ResolverOptions = {
        protoRoot: '/project/protos',
        importPaths: [],
        projectRoot: '/project',
      };
      resolver = new ProtoResolver(options);

      jest.clearAllMocks();
    });

    it('should resolve google/protobuf/timestamp.proto', () => {
      const typePath = 'google/protobuf/timestamp.proto';

      jest.spyOn(mockFs, 'existsSync').mockReturnValue(true);
      jest.spyOn(mockFs, 'statSync').mockReturnValue({ isFile: () => true } as any);

      const result = resolver.resolveWellKnownType(typePath);

      expect(result).toEqual({
        absolutePath: '/project/node_modules/google-protobuf/google/protobuf/timestamp.proto',
        originalImport: 'google/protobuf/timestamp.proto',
        isWellKnown: true,
        packagePath: 'google-protobuf',
      });
    });

    it('should resolve google/protobuf/duration.proto', () => {
      const typePath = 'google/protobuf/duration.proto';

      jest.spyOn(mockFs, 'existsSync').mockReturnValue(true);
      jest.spyOn(mockFs, 'statSync').mockReturnValue({ isFile: () => true } as any);

      const result = resolver.resolveWellKnownType(typePath);

      expect(result.absolutePath).toBe(
        '/project/node_modules/google-protobuf/google/protobuf/duration.proto'
      );
      expect(result.isWellKnown).toBe(true);
      expect(result.packagePath).toBe('google-protobuf');
    });

    it('should resolve google/protobuf/empty.proto', () => {
      const typePath = 'google/protobuf/empty.proto';

      jest.spyOn(mockFs, 'existsSync').mockReturnValue(true);
      jest.spyOn(mockFs, 'statSync').mockReturnValue({ isFile: () => true } as any);

      const result = resolver.resolveWellKnownType(typePath);

      expect(result.isWellKnown).toBe(true);
      expect(result.packagePath).toBe('google-protobuf');
    });

    it('should throw error when google-protobuf is not installed', () => {
      const typePath = 'google/protobuf/timestamp.proto';

      jest.spyOn(mockFs, 'existsSync').mockReturnValue(false);

      expect(() => {
        resolver.resolveWellKnownType(typePath);
      }).toThrow('[Hallow Plugin] Well-known type resolution failed');
    });

    it('should include installation suggestion in error message', () => {
      const typePath = 'google/protobuf/timestamp.proto';

      jest.spyOn(mockFs, 'existsSync').mockReturnValue(false);

      expect(() => {
        resolver.resolveWellKnownType(typePath);
      }).toThrow('Install google-protobuf package: npm install google-protobuf');
    });

    it('should include searched path in error message', () => {
      const typePath = 'google/protobuf/timestamp.proto';

      jest.spyOn(mockFs, 'existsSync').mockReturnValue(false);

      try {
        resolver.resolveWellKnownType(typePath);
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.message).toContain('Searched in:');
        expect(error.message).toContain(
          '/project/node_modules/google-protobuf/google/protobuf/timestamp.proto'
        );
      }
    });

    it('should reject if path exists but is not a file', () => {
      const typePath = 'google/protobuf/timestamp.proto';

      jest.spyOn(mockFs, 'existsSync').mockReturnValue(true);
      jest.spyOn(mockFs, 'statSync').mockReturnValue({ isFile: () => false } as any);

      expect(() => {
        resolver.resolveWellKnownType(typePath);
      }).toThrow('[Hallow Plugin] Well-known type resolution failed');
    });
  });
});
