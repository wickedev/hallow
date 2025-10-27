/**
 * VersionLoader unit tests
 *
 * Tests for automatic version loading from package.json with edge case handling
 */

import * as fs from 'fs';
import * as path from 'path';
import { loadVersion, clearVersionCache, getVersionInfo } from '../../src/utils/VersionLoader';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('VersionLoader', () => {
  // Clear cache before each test to ensure isolation
  beforeEach(() => {
    clearVersionCache();
    jest.clearAllMocks();
  });

  afterEach(() => {
    clearVersionCache();
  });

  describe('loadVersion', () => {
    it('should load version from package.json successfully', () => {
      const mockPackageJson = {
        name: '@hallow/generator',
        version: '1.2.3',
        description: 'Test package',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const version = loadVersion();

      expect(version).toBe('1.2.3');
      expect(mockFs.existsSync).toHaveBeenCalled();
      expect(mockFs.readFileSync).toHaveBeenCalled();
    });

    it('should cache version on subsequent calls', () => {
      const mockPackageJson = {
        name: '@hallow/generator',
        version: '2.0.0',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      // First call
      const version1 = loadVersion();
      expect(version1).toBe('2.0.0');

      // Second call should use cache
      const version2 = loadVersion();
      expect(version2).toBe('2.0.0');

      // readFileSync should only be called once due to caching
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(1);
    });

    it('should allow disabling cache', () => {
      const mockPackageJson = {
        name: '@hallow/generator',
        version: '3.0.0',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      // First call with cache disabled
      const version1 = loadVersion({ cache: false });
      expect(version1).toBe('3.0.0');

      // Second call with cache disabled - should read again
      const version2 = loadVersion({ cache: false });
      expect(version2).toBe('3.0.0');

      // readFileSync should be called twice when cache is disabled
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(2);
    });

    it('should throw error when package.json does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);

      expect(() => loadVersion()).toThrow('Version loading failed: package.json not found');
      expect(() => loadVersion()).toThrow('Please ensure the package.json file exists');
    });

    it('should throw error when package.json is invalid JSON', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{ invalid json }');

      expect(() => loadVersion()).toThrow('Version loading failed: Unable to read or parse package.json');
      expect(() => loadVersion()).toThrow('Error:');
    });

    it('should throw error when package.json has no version field', () => {
      const mockPackageJson = {
        name: '@hallow/generator',
        description: 'No version field',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      expect(() => loadVersion()).toThrow('Version loading failed');
      expect(() => loadVersion()).toThrow('does not contain a "version" field');
      expect(() => loadVersion()).toThrow('Please ensure package.json has a valid semver version');
    });

    it('should throw error when version is not valid semver', () => {
      const mockPackageJson = {
        name: '@hallow/generator',
        version: 'invalid-version',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      expect(() => loadVersion()).toThrow('Version loading failed: Invalid version format');
      expect(() => loadVersion()).toThrow('Expected valid semver format');
    });

    it('should accept valid semver versions', () => {
      const validVersions = [
        '0.0.1',
        '1.0.0',
        '1.2.3',
        '10.20.30',
        '1.0.0-alpha',
        '1.0.0-beta.1',
        '1.0.0-rc.1',
        '2.0.0-alpha.1+build.123',
        '1.0.0+20130313144700',
      ];

      validVersions.forEach(version => {
        clearVersionCache();
        const mockPackageJson = {
          name: '@hallow/generator',
          version,
        };

        mockFs.existsSync.mockReturnValue(true);
        mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

        expect(() => loadVersion()).not.toThrow();
        expect(loadVersion()).toBe(version);
      });
    });

    it('should reject invalid semver versions', () => {
      const invalidVersions = [
        'abc',
        '1',
        '1.2',
        '1.2.3.4',
        'v1.2.3',
        '1.2.3-',
        '1.2.3+',
        '01.2.3',
        '1.02.3',
        '1.2.03',
      ];

      invalidVersions.forEach(version => {
        clearVersionCache();
        const mockPackageJson = {
          name: '@hallow/generator',
          version,
        };

        mockFs.existsSync.mockReturnValue(true);
        mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

        expect(() => loadVersion()).toThrow('Invalid version format');
      });
    });

    it('should use custom package.json path when provided', () => {
      const customPath = '/custom/path/package.json';
      const mockPackageJson = {
        name: '@hallow/custom',
        version: '5.0.0',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const version = loadVersion({ packageJsonPath: customPath });

      expect(version).toBe('5.0.0');
      expect(mockFs.existsSync).toHaveBeenCalledWith(customPath);
      expect(mockFs.readFileSync).toHaveBeenCalledWith(customPath, 'utf8');
    });

    it('should handle file read errors gracefully', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('Permission denied');
      });

      expect(() => loadVersion()).toThrow('Version loading failed: Unable to read or parse package.json');
      expect(() => loadVersion()).toThrow('Permission denied');
    });
  });

  describe('clearVersionCache', () => {
    it('should clear the cached version', () => {
      const mockPackageJson = {
        name: '@hallow/generator',
        version: '1.0.0',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      // Load version and cache it
      loadVersion();
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(1);

      // Clear cache
      clearVersionCache();

      // Load version again - should read from file
      loadVersion();
      expect(mockFs.readFileSync).toHaveBeenCalledTimes(2);
    });
  });

  describe('getVersionInfo', () => {
    it('should parse version components correctly', () => {
      const mockPackageJson = {
        name: '@hallow/generator',
        version: '2.5.8',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const versionInfo = getVersionInfo();

      expect(versionInfo).toEqual({
        version: '2.5.8',
        major: 2,
        minor: 5,
        patch: 8,
        prerelease: undefined,
        build: undefined,
      });
    });

    it('should parse prerelease version correctly', () => {
      const mockPackageJson = {
        name: '@hallow/generator',
        version: '1.0.0-beta.1',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const versionInfo = getVersionInfo();

      expect(versionInfo).toEqual({
        version: '1.0.0-beta.1',
        major: 1,
        minor: 0,
        patch: 0,
        prerelease: 'beta.1',
        build: undefined,
      });
    });

    it('should parse version with build metadata correctly', () => {
      const mockPackageJson = {
        name: '@hallow/generator',
        version: '3.2.1-alpha+build.123',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const versionInfo = getVersionInfo();

      expect(versionInfo).toEqual({
        version: '3.2.1-alpha+build.123',
        major: 3,
        minor: 2,
        patch: 1,
        prerelease: 'alpha',
        build: 'build.123',
      });
    });

    it('should parse version with only build metadata', () => {
      const mockPackageJson = {
        name: '@hallow/generator',
        version: '1.0.0+20230101',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      const versionInfo = getVersionInfo();

      expect(versionInfo).toEqual({
        version: '1.0.0+20230101',
        major: 1,
        minor: 0,
        patch: 0,
        prerelease: undefined,
        build: '20230101',
      });
    });

    it('should throw error for invalid version format', () => {
      const mockPackageJson = {
        name: '@hallow/generator',
        version: 'invalid',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      expect(() => getVersionInfo()).toThrow('Invalid version format');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty package.json', () => {
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue('{}');

      expect(() => loadVersion()).toThrow('does not contain a "version" field');
    });

    it('should handle package.json with null version', () => {
      const mockPackageJson = {
        name: '@hallow/generator',
        version: null,
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      expect(() => loadVersion()).toThrow('does not contain a "version" field');
    });

    it('should handle package.json with empty string version', () => {
      const mockPackageJson = {
        name: '@hallow/generator',
        version: '',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      expect(() => loadVersion()).toThrow('does not contain a "version" field');
    });

    it('should handle version with leading/trailing whitespace', () => {
      const mockPackageJson = {
        name: '@hallow/generator',
        version: '  1.0.0  ',
      };

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockPackageJson));

      // The version loader doesn't trim whitespace, so this should be considered invalid
      expect(() => loadVersion()).toThrow('Invalid version format');
    });
  });
});
