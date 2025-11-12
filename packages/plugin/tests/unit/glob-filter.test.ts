/**
 * Unit tests for GlobFilter.
 *
 * Tests glob pattern matching for include/exclude filtering of proto files.
 * Covers requirements 4.3 and 4.4 from the design document.
 */

import { GlobFilter } from '../../src/utils/glob-filter';

describe('GlobFilter', () => {
  describe('Task 23.1: Include/Exclude Pattern Matching', () => {
    describe('Default patterns', () => {
      it('should use default patterns when none provided', () => {
        const filter = new GlobFilter();

        expect(filter.getIncludePatterns()).toEqual(['**/*.proto']);
        expect(filter.getExcludePatterns()).toEqual(['**/node_modules/**', 'node_modules/**']);
      });

      it('should match .proto files with default include pattern', () => {
        const filter = new GlobFilter();

        expect(filter.shouldInclude('src/api/service.proto')).toBe(true);
        expect(filter.shouldInclude('api.proto')).toBe(true);
        expect(filter.shouldInclude('deep/nested/path/file.proto')).toBe(true);
      });

      it('should exclude node_modules with default exclude pattern', () => {
        const filter = new GlobFilter();

        expect(filter.shouldInclude('node_modules/package/test.proto')).toBe(false);
        expect(filter.shouldInclude('node_modules/test.proto')).toBe(false);
        expect(filter.shouldInclude('deep/node_modules/test.proto')).toBe(false);
      });

      it('should work with baseDir', () => {
        const baseDir = '/project';
        const filter = new GlobFilter({ baseDir });

        expect(filter.getBaseDir()).toBe(baseDir);
      });
    });

    describe('Custom include patterns', () => {
      it('should match files in specific directories only', () => {
        const filter = new GlobFilter({
          include: ['src/**/*.proto', 'api/**/*.proto'],
          exclude: [],
        });

        expect(filter.shouldInclude('src/service.proto')).toBe(true);
        expect(filter.shouldInclude('src/v1/service.proto')).toBe(true);
        expect(filter.shouldInclude('api/service.proto')).toBe(true);
        expect(filter.shouldInclude('api/v2/service.proto')).toBe(true);

        // Should not match other directories
        expect(filter.shouldInclude('lib/service.proto')).toBe(false);
        expect(filter.shouldInclude('test/service.proto')).toBe(false);
      });

      it('should support single star wildcard', () => {
        const filter = new GlobFilter({
          include: ['src/*.proto'],
          exclude: [],
        });

        // Should match direct children only
        expect(filter.shouldInclude('src/service.proto')).toBe(true);
        expect(filter.shouldInclude('src/api.proto')).toBe(true);

        // Should not match nested files
        expect(filter.shouldInclude('src/v1/service.proto')).toBe(false);
        expect(filter.shouldInclude('src/nested/api.proto')).toBe(false);
      });

      it('should support double star wildcard', () => {
        const filter = new GlobFilter({
          include: ['**/*.proto'],
          exclude: [],
        });

        // Should match all .proto files at any depth
        expect(filter.shouldInclude('service.proto')).toBe(true);
        expect(filter.shouldInclude('src/service.proto')).toBe(true);
        expect(filter.shouldInclude('src/v1/api/service.proto')).toBe(true);
        expect(filter.shouldInclude('deep/nested/path/file.proto')).toBe(true);
      });

      it('should support brace expansion patterns', () => {
        const filter = new GlobFilter({
          include: ['{src,api}/**/*.proto'],
          exclude: [],
        });

        expect(filter.shouldInclude('src/service.proto')).toBe(true);
        expect(filter.shouldInclude('api/service.proto')).toBe(true);
        expect(filter.shouldInclude('src/v1/service.proto')).toBe(true);
        expect(filter.shouldInclude('api/v2/service.proto')).toBe(true);

        expect(filter.shouldInclude('lib/service.proto')).toBe(false);
      });

      it('should require matching at least one include pattern', () => {
        const filter = new GlobFilter({
          include: ['src/**/*.proto', 'api/**/*.proto'],
          exclude: [],
        });

        // Matches first pattern
        expect(filter.shouldInclude('src/service.proto')).toBe(true);

        // Matches second pattern
        expect(filter.shouldInclude('api/service.proto')).toBe(true);

        // Matches neither pattern
        expect(filter.shouldInclude('lib/service.proto')).toBe(false);
      });
    });

    describe('Custom exclude patterns', () => {
      it('should exclude files matching exclude patterns', () => {
        const filter = new GlobFilter({
          include: ['**/*.proto'],
          exclude: ['**/*.test.proto', '**/*.spec.proto'],
        });

        expect(filter.shouldInclude('src/service.proto')).toBe(true);
        expect(filter.shouldInclude('src/service.test.proto')).toBe(false);
        expect(filter.shouldInclude('api/service.spec.proto')).toBe(false);
      });

      it('should support multiple exclude patterns', () => {
        const filter = new GlobFilter({
          include: ['**/*.proto'],
          exclude: [
            'node_modules/**',
            'dist/**',
            'build/**',
            '**/*.test.proto',
          ],
        });

        expect(filter.shouldInclude('src/service.proto')).toBe(true);
        expect(filter.shouldInclude('node_modules/pkg/test.proto')).toBe(false);
        expect(filter.shouldInclude('dist/output.proto')).toBe(false);
        expect(filter.shouldInclude('build/generated.proto')).toBe(false);
        expect(filter.shouldInclude('src/api.test.proto')).toBe(false);
      });

      it('should exclude takes precedence over include', () => {
        const filter = new GlobFilter({
          include: ['src/**/*.proto'],
          exclude: ['src/deprecated/**'],
        });

        expect(filter.shouldInclude('src/api/service.proto')).toBe(true);
        expect(filter.shouldInclude('src/deprecated/old.proto')).toBe(false);
        expect(filter.shouldInclude('src/deprecated/v1/old.proto')).toBe(false);
      });

      it('should handle specific file exclusions', () => {
        const filter = new GlobFilter({
          include: ['**/*.proto'],
          exclude: ['**/internal.proto', '**/private.proto'],
        });

        expect(filter.shouldInclude('src/public.proto')).toBe(true);
        expect(filter.shouldInclude('src/internal.proto')).toBe(false);
        expect(filter.shouldInclude('api/v2/internal.proto')).toBe(false);
        expect(filter.shouldInclude('src/private.proto')).toBe(false);
      });
    });

    describe('Combined include and exclude patterns', () => {
      it('should apply both include and exclude patterns', () => {
        const filter = new GlobFilter({
          include: ['src/**/*.proto', 'api/**/*.proto'],
          exclude: ['**/*.test.proto', 'node_modules/**'],
        });

        // Matches include, not excluded
        expect(filter.shouldInclude('src/service.proto')).toBe(true);
        expect(filter.shouldInclude('api/service.proto')).toBe(true);

        // Matches include but also excluded
        expect(filter.shouldInclude('src/service.test.proto')).toBe(false);
        expect(filter.shouldInclude('api/service.test.proto')).toBe(false);

        // Doesn't match include
        expect(filter.shouldInclude('lib/service.proto')).toBe(false);

        // Matches include but in node_modules
        expect(filter.shouldInclude('node_modules/src/test.proto')).toBe(false);
      });

      it('should handle complex real-world scenarios', () => {
        const filter = new GlobFilter({
          include: [
            'protos/**/*.proto',
            'src/grpc/**/*.proto',
          ],
          exclude: [
            'node_modules/**',
            '**/*.test.proto',
            '**/*.generated.proto',
            'protos/deprecated/**',
          ],
        });

        // Valid proto files
        expect(filter.shouldInclude('protos/api/v1/service.proto')).toBe(true);
        expect(filter.shouldInclude('src/grpc/client.proto')).toBe(true);

        // Excluded patterns
        expect(filter.shouldInclude('protos/api/v1/service.test.proto')).toBe(false);
        expect(filter.shouldInclude('src/grpc/types.generated.proto')).toBe(false);
        expect(filter.shouldInclude('protos/deprecated/old.proto')).toBe(false);
        expect(filter.shouldInclude('node_modules/@grpc/proto/test.proto')).toBe(false);

        // Not in include patterns
        expect(filter.shouldInclude('lib/service.proto')).toBe(false);
      });
    });

    describe('Path normalization', () => {
      it('should handle absolute paths', () => {
        const baseDir = '/project';
        const filter = new GlobFilter({
          include: ['src/**/*.proto'],
          exclude: ['node_modules/**'],
          baseDir,
        });

        expect(filter.shouldInclude('/project/src/service.proto')).toBe(true);
        expect(filter.shouldInclude('/project/node_modules/test.proto')).toBe(false);
      });

      it('should handle relative paths', () => {
        const filter = new GlobFilter({
          include: ['src/**/*.proto'],
          exclude: [],
        });

        expect(filter.shouldInclude('src/service.proto')).toBe(true);
        expect(filter.shouldInclude('./src/service.proto')).toBe(true);
      });

      it('should handle mixed path separators', () => {
        const filter = new GlobFilter({
          include: ['src/**/*.proto'],
          exclude: [],
        });

        // Should normalize both forward and back slashes
        expect(filter.shouldInclude('src/api/service.proto')).toBe(true);
        expect(filter.shouldInclude('src\\api\\service.proto')).toBe(true);
      });

      it('should remove leading ./ from paths', () => {
        const filter = new GlobFilter({
          include: ['src/**/*.proto'],
          exclude: [],
        });

        expect(filter.shouldInclude('./src/service.proto')).toBe(true);
        expect(filter.shouldInclude('src/service.proto')).toBe(true);
      });
    });

    describe('Edge cases', () => {
      it('should handle empty include patterns', () => {
        const filter = new GlobFilter({
          include: [],
          exclude: [],
        });

        // With no include patterns, nothing should match
        expect(filter.shouldInclude('src/service.proto')).toBe(false);
        expect(filter.shouldInclude('api/service.proto')).toBe(false);
      });

      it('should handle empty exclude patterns', () => {
        const filter = new GlobFilter({
          include: ['**/*.proto'],
          exclude: [],
        });

        // Should match all .proto files with no exclusions
        expect(filter.shouldInclude('src/service.proto')).toBe(true);
        expect(filter.shouldInclude('node_modules/test.proto')).toBe(true);
        expect(filter.shouldInclude('anywhere/file.proto')).toBe(true);
      });

      it('should handle invalid glob patterns gracefully', () => {
        // Minimatch should handle most patterns, but test error handling
        const filter = new GlobFilter({
          include: ['**/*.proto', '[invalid'],
          exclude: [],
        });

        // Valid pattern should still work
        expect(filter.shouldInclude('src/service.proto')).toBe(true);
      });

      it('should handle dot files when dot option is enabled', () => {
        const filter = new GlobFilter({
          include: ['**/*.proto'],
          exclude: [],
        });

        // Should match hidden files
        expect(filter.shouldInclude('.hidden/service.proto')).toBe(true);
        expect(filter.shouldInclude('src/.config.proto')).toBe(true);
      });
    });

    describe('Pattern getters', () => {
      it('should return copy of include patterns', () => {
        const include = ['src/**/*.proto'];
        const filter = new GlobFilter({ include });

        const patterns = filter.getIncludePatterns();
        expect(patterns).toEqual(include);

        // Modifying returned array should not affect filter
        patterns.push('api/**/*.proto');
        expect(filter.getIncludePatterns()).toEqual(include);
      });

      it('should return copy of exclude patterns', () => {
        const exclude = ['node_modules/**'];
        const filter = new GlobFilter({ exclude });

        const patterns = filter.getExcludePatterns();
        expect(patterns).toEqual(exclude);

        // Modifying returned array should not affect filter
        patterns.push('dist/**');
        expect(filter.getExcludePatterns()).toEqual(exclude);
      });

      it('should return base directory', () => {
        const baseDir = '/custom/path';
        const filter = new GlobFilter({ baseDir });

        expect(filter.getBaseDir()).toBe(baseDir);
      });
    });
  });

  describe('Performance considerations', () => {
    it('should efficiently match against many patterns', () => {
      const manyPatterns = Array.from({ length: 100 }, (_, i) => `dir${i}/**/*.proto`);
      const filter = new GlobFilter({
        include: manyPatterns,
        exclude: [],
      });

      const start = Date.now();
      for (let i = 0; i < 1000; i++) {
        filter.shouldInclude(`dir${i % 100}/service.proto`);
      }
      const duration = Date.now() - start;

      // Should complete 1000 checks in reasonable time (<1000ms)
      // Threshold increased to account for system load variance
      expect(duration).toBeLessThan(1000);
    });

    it('should efficiently handle many exclude patterns', () => {
      const manyExcludes = Array.from({ length: 50 }, (_, i) => `**/excluded${i}/**`);
      const filter = new GlobFilter({
        include: ['**/*.proto'],
        exclude: manyExcludes,
      });

      const start = Date.now();
      for (let i = 0; i < 500; i++) {
        filter.shouldInclude('src/service.proto');
      }
      const duration = Date.now() - start;

      // Should complete 500 checks in reasonable time (<250ms, accounting for system load)
      expect(duration).toBeLessThan(250);
    });
  });
});
