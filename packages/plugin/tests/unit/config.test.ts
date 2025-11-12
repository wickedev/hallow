/**
 * Unit tests for ConfigValidator
 *
 * Tests configuration validation, default merging, error detection,
 * and suggestion generation for the plugin configuration system.
 */

import { ConfigValidator, DEFAULT_OPTIONS } from '../../src/config';
import type { PluginOptions } from '../../src/types';

describe('ConfigValidator', () => {
  let validator: ConfigValidator;

  beforeEach(() => {
    validator = new ConfigValidator();
  });

  // ============================================================================
  // Valid Configuration Tests
  // ============================================================================

  describe('validate - valid configurations', () => {
    it('should validate empty configuration', () => {
      const result = validator.validate({});

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate complete valid configuration', () => {
      const config: PluginOptions = {
        include: ['**/*.proto'],
        exclude: ['node_modules/**'],
        protoRoot: '/path/to/protos',
        importPaths: ['/path/to/imports'],
        generateReactHooks: true,
        generateSuspenseHooks: true,
        serverUrl: 'https://api.example.com',
        sourceMaps: true,
        optimization: {
          production: true,
          minify: true,
          removeComments: true,
          deadCodeElimination: true,
          treeshaking: true,
          codeSplitting: true,
          lazyLoading: true,
          bundleSizeTarget: 100000,
        },
        cacheDir: '.cache',
        maxCacheSize: 200,
        enablePersistentCache: true,
        enablePerformanceMonitoring: true,
        performanceThreshold: 2000,
        verbose: true,
        debug: false,
      };

      const result = validator.validate(config);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate partial configuration with only React hooks enabled', () => {
      const result = validator.validate({
        generateReactHooks: true,
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate configuration with optimization options', () => {
      const result = validator.validate({
        optimization: {
          production: true,
          minify: true,
          bundleSizeTarget: 50000,
        },
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate configuration with arrays', () => {
      const result = validator.validate({
        include: ['src/**/*.proto', 'api/**/*.proto'],
        exclude: ['node_modules/**', 'dist/**'],
        importPaths: ['/proto/common', '/proto/types'],
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // ============================================================================
  // Invalid Type Detection Tests
  // ============================================================================

  describe('validate - invalid types', () => {
    it('should detect invalid type for boolean field', () => {
      const result = validator.validate({
        generateReactHooks: 'true' as any, // Should be boolean
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('generateReactHooks');
      expect(result.errors[0].message).toContain('Must be boolean');
      expect(result.errors[0].suggestion).toContain('true or');
    });

    it('should detect invalid type for number field', () => {
      const result = validator.validate({
        maxCacheSize: '100' as any, // Should be number
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('maxCacheSize');
      expect(result.errors[0].message).toContain('Must be number');
    });

    it('should detect invalid type for string field', () => {
      const result = validator.validate({
        protoRoot: 123 as any, // Should be string
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('protoRoot');
      expect(result.errors[0].message).toContain('Must be string');
    });

    it('should detect invalid type for array field', () => {
      const result = validator.validate({
        include: 'pattern' as any, // Should be array
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('include');
      expect(result.errors[0].message).toContain('Must be array');
    });

    it('should detect invalid type for nested object field', () => {
      const result = validator.validate({
        optimization: 'production' as any, // Should be object
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('optimization');
      expect(result.errors[0].message).toContain('Must be object');
    });

    it('should detect negative number for positive-only field', () => {
      const result = validator.validate({
        maxCacheSize: -50,
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('maxCacheSize');
      expect(result.errors[0].message).toContain('positive');
    });

    it('should detect invalid URL format', () => {
      const result = validator.validate({
        serverUrl: 'not-a-valid-url',
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('serverUrl');
      expect(result.errors[0].message).toContain('valid URL');
    });

    it('should detect multiple type errors', () => {
      const result = validator.validate({
        generateReactHooks: 'yes' as any,
        maxCacheSize: 'large' as any,
        verbose: 1 as any,
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ============================================================================
  // Unknown Option Detection Tests
  // ============================================================================

  describe('validate - unknown options', () => {
    it('should detect unknown top-level option', () => {
      const result = validator.validate({
        unknownOption: true,
      } as any);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      const unknownError = result.errors.find((e) =>
        e.field.includes('unknownOption')
      );
      expect(unknownError).toBeDefined();
      expect(unknownError?.message).toContain('Unknown option');
    });

    it('should detect unknown option with typo and suggest correction', () => {
      const result = validator.validate({
        maxCachSize: 100, // Typo: should be maxCacheSize
      } as any);

      expect(result.valid).toBe(false);
      const error = result.errors.find((e) => e.field.includes('maxCachSize'));
      expect(error).toBeDefined();
      expect(error?.suggestion).toContain('maxCacheSize');
    });

    it('should detect unknown option in nested object', () => {
      const result = validator.validate({
        optimization: {
          invalidOption: true,
        } as any,
      });

      expect(result.valid).toBe(false);
      const error = result.errors.find((e) =>
        e.field.includes('invalidOption')
      );
      expect(error).toBeDefined();
    });

    it('should suggest correction for verbos typo', () => {
      const result = validator.validate({
        verbos: true, // Typo: should be verbose
      } as any);

      expect(result.valid).toBe(false);
      const error = result.errors.find((e) => e.field.includes('verbos'));
      expect(error).toBeDefined();
      expect(error?.suggestion).toContain('verbose');
    });

    it('should suggest correction for generateReacHooks typo', () => {
      const result = validator.validate({
        generateReacHooks: true, // Typo: should be generateReactHooks
      } as any);

      expect(result.valid).toBe(false);
      const error = result.errors.find((e) =>
        e.field.includes('generateReacHooks')
      );
      expect(error).toBeDefined();
      expect(error?.suggestion).toContain('generateReactHooks');
    });
  });

  // ============================================================================
  // Conflict Detection Tests
  // ============================================================================

  describe('detectConflicts', () => {
    it('should warn about source maps enabled with minification in production', () => {
      const config: PluginOptions = {
        ...DEFAULT_OPTIONS,
        sourceMaps: true,
        optimization: {
          production: true,
          minify: true,
        },
      };

      const warnings = validator.detectConflicts(config);

      expect(warnings.length).toBeGreaterThan(0);
      const sourceMapsWarning = warnings.find((w) => w.field === 'sourceMaps');
      expect(sourceMapsWarning).toBeDefined();
      expect(sourceMapsWarning?.message).toContain('production');
      expect(sourceMapsWarning?.suggestion).toContain('disabling source maps');
    });

    it('should warn about very low cache size', () => {
      const config: PluginOptions = {
        ...DEFAULT_OPTIONS,
        maxCacheSize: 5, // Very low
      };

      const warnings = validator.detectConflicts(config);

      const cacheSizeWarning = warnings.find((w) => w.field === 'maxCacheSize');
      expect(cacheSizeWarning).toBeDefined();
      expect(cacheSizeWarning?.message).toContain('very low');
      expect(cacheSizeWarning?.suggestion).toContain('50MB');
    });

    it('should warn about very low performance threshold', () => {
      const config: PluginOptions = {
        ...DEFAULT_OPTIONS,
        enablePerformanceMonitoring: true,
        performanceThreshold: 50, // Very low
      };

      const warnings = validator.detectConflicts(config);

      const thresholdWarning = warnings.find(
        (w) => w.field === 'performanceThreshold'
      );
      expect(thresholdWarning).toBeDefined();
      expect(thresholdWarning?.message).toContain('very low');
      expect(thresholdWarning?.suggestion).toContain('500ms');
    });

    it('should warn about Suspense hooks without React hooks', () => {
      const config: PluginOptions = {
        ...DEFAULT_OPTIONS,
        generateSuspenseHooks: true,
        generateReactHooks: false,
      };

      const warnings = validator.detectConflicts(config);

      const suspenseWarning = warnings.find(
        (w) => w.field === 'generateSuspenseHooks'
      );
      expect(suspenseWarning).toBeDefined();
      expect(suspenseWarning?.message).toContain('require React hooks');
      expect(suspenseWarning?.suggestion).toContain('generateReactHooks: true');
    });

    it('should warn about empty include patterns', () => {
      const config: PluginOptions = {
        ...DEFAULT_OPTIONS,
        include: [],
      };

      const warnings = validator.detectConflicts(config);

      const includeWarning = warnings.find((w) => w.field === 'include');
      expect(includeWarning).toBeDefined();
      expect(includeWarning?.message).toContain('no proto files');
    });

    it('should not warn for valid configuration without conflicts', () => {
      const config: PluginOptions = {
        ...DEFAULT_OPTIONS,
        sourceMaps: false,
        maxCacheSize: 100,
        performanceThreshold: 1000,
        generateReactHooks: true,
        generateSuspenseHooks: true,
      };

      const warnings = validator.detectConflicts(config);

      // Should only have warnings from defaults, not from conflicts
      expect(warnings.length).toBe(0);
    });

    it('should detect multiple conflicts', () => {
      const config: PluginOptions = {
        ...DEFAULT_OPTIONS,
        sourceMaps: true,
        maxCacheSize: 3,
        enablePerformanceMonitoring: true, // Need to enable monitoring for threshold warning
        performanceThreshold: 20,
        generateSuspenseHooks: true,
        generateReactHooks: false,
        optimization: {
          production: true,
          minify: true,
        },
      };

      const warnings = validator.detectConflicts(config);

      expect(warnings.length).toBeGreaterThanOrEqual(4);
    });
  });

  // ============================================================================
  // Merge with Defaults Tests
  // ============================================================================

  describe('mergeWithDefaults', () => {
    it('should use all defaults when options are empty', () => {
      const merged = validator.mergeWithDefaults({});

      expect(merged).toEqual(DEFAULT_OPTIONS);
    });

    it('should override specific fields while keeping defaults', () => {
      const merged = validator.mergeWithDefaults({
        generateReactHooks: true,
        maxCacheSize: 200,
      });

      expect(merged.generateReactHooks).toBe(true);
      expect(merged.maxCacheSize).toBe(200);
      expect(merged.include).toEqual(DEFAULT_OPTIONS.include);
      expect(merged.exclude).toEqual(DEFAULT_OPTIONS.exclude);
      expect(merged.protoRoot).toBe(DEFAULT_OPTIONS.protoRoot);
    });

    it('should deep merge optimization options', () => {
      const merged = validator.mergeWithDefaults({
        optimization: {
          minify: true,
        },
      });

      expect(merged.optimization?.minify).toBe(true);
      expect(merged.optimization?.production).toBe(
        DEFAULT_OPTIONS.optimization.production
      );
      expect(merged.optimization?.removeComments).toBe(
        DEFAULT_OPTIONS.optimization.removeComments
      );
    });

    it('should replace arrays completely, not merge them', () => {
      const merged = validator.mergeWithDefaults({
        include: ['custom/**/*.proto'],
      });

      expect(merged.include).toEqual(['custom/**/*.proto']);
      expect(merged.include).not.toContain('**/*.proto');
    });

    it('should handle all fields being overridden', () => {
      const customConfig: PluginOptions = {
        include: ['src/**/*.proto'],
        exclude: ['build/**'],
        protoRoot: '/custom/protos',
        importPaths: ['/custom/imports'],
        generateReactHooks: true,
        generateSuspenseHooks: true,
        serverUrl: 'https://custom.example.com',
        sourceMaps: false,
        optimization: {
          production: true,
          minify: true,
          removeComments: true,
        },
        cacheDir: '.custom-cache',
        maxCacheSize: 500,
        enablePersistentCache: true,
        enablePerformanceMonitoring: true,
        performanceThreshold: 3000,
        verbose: true,
        debug: true,
      };

      const merged = validator.mergeWithDefaults(customConfig);

      expect(merged.include).toEqual(customConfig.include);
      expect(merged.generateReactHooks).toBe(true);
      expect(merged.maxCacheSize).toBe(500);
      expect(merged.optimization?.minify).toBe(true);
    });
  });

  // ============================================================================
  // Suggestion Generation Tests
  // ============================================================================

  describe('suggestCorrection', () => {
    it('should suggest correction for single character typo', () => {
      const validKeys = ['verbose', 'debug', 'sourceMaps'];
      const suggestion = validator.suggestCorrection('verbos', validKeys);

      expect(suggestion).toBe('verbose');
    });

    it('should suggest correction for swapped characters', () => {
      const validKeys = ['maxCacheSize', 'cacheDir'];
      const suggestion = validator.suggestCorrection('maxCachSize', validKeys);

      expect(suggestion).toBe('maxCacheSize');
    });

    it('should suggest correction for missing character', () => {
      const validKeys = ['generateReactHooks', 'generateSuspenseHooks'];
      const suggestion = validator.suggestCorrection(
        'generateReacHooks',
        validKeys
      );

      expect(suggestion).toBe('generateReactHooks');
    });

    it('should return empty string for completely unrelated key', () => {
      const validKeys = ['verbose', 'debug', 'sourceMaps'];
      const suggestion = validator.suggestCorrection(
        'completelyDifferent',
        validKeys
      );

      expect(suggestion).toBe('');
    });

    it('should handle case-insensitive matching', () => {
      const validKeys = ['protoRoot', 'importPaths'];
      const suggestion = validator.suggestCorrection('PROTOROOT', validKeys);

      expect(suggestion).toBe('protoRoot');
    });

    it('should return closest match when multiple similar keys exist', () => {
      const validKeys = ['include', 'exclude', 'includes'];
      const suggestion = validator.suggestCorrection('includ', validKeys);

      expect(suggestion).toBe('include');
    });

    it('should handle empty valid keys array', () => {
      const suggestion = validator.suggestCorrection('anything', []);

      expect(suggestion).toBe('');
    });
  });

  // ============================================================================
  // Integration Tests
  // ============================================================================

  describe('validate - integration', () => {
    it('should validate and merge in single workflow', () => {
      const userConfig: Partial<PluginOptions> = {
        generateReactHooks: true,
        maxCacheSize: 150,
      };

      const validationResult = validator.validate(userConfig);
      expect(validationResult.valid).toBe(true);

      const merged = validator.mergeWithDefaults(userConfig);
      expect(merged.generateReactHooks).toBe(true);
      expect(merged.maxCacheSize).toBe(150);
      expect(merged.include).toEqual(DEFAULT_OPTIONS.include);
    });

    it('should catch errors and suggest corrections in workflow', () => {
      const userConfig = {
        generateReacHooks: true, // Typo
        maxCachSize: 150, // Typo
      } as any;

      const validationResult = validator.validate(userConfig);
      expect(validationResult.valid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThanOrEqual(2);

      const reactError = validationResult.errors.find((e) =>
        e.field.includes('generateReacHooks')
      );
      expect(reactError?.suggestion).toContain('generateReactHooks');

      const cacheError = validationResult.errors.find((e) =>
        e.field.includes('maxCachSize')
      );
      expect(cacheError?.suggestion).toContain('maxCacheSize');
    });
  });

  // ============================================================================
  // DEFAULT_OPTIONS Tests
  // ============================================================================

  describe('DEFAULT_OPTIONS', () => {
    it('should have all required fields', () => {
      expect(DEFAULT_OPTIONS.include).toBeDefined();
      expect(DEFAULT_OPTIONS.exclude).toBeDefined();
      expect(DEFAULT_OPTIONS.protoRoot).toBeDefined();
      expect(DEFAULT_OPTIONS.importPaths).toBeDefined();
      expect(DEFAULT_OPTIONS.generateReactHooks).toBeDefined();
      expect(DEFAULT_OPTIONS.generateSuspenseHooks).toBeDefined();
      expect(DEFAULT_OPTIONS.sourceMaps).toBeDefined();
      expect(DEFAULT_OPTIONS.optimization).toBeDefined();
      expect(DEFAULT_OPTIONS.cacheDir).toBeDefined();
      expect(DEFAULT_OPTIONS.maxCacheSize).toBeDefined();
      expect(DEFAULT_OPTIONS.enablePersistentCache).toBeDefined();
      expect(DEFAULT_OPTIONS.enablePerformanceMonitoring).toBeDefined();
      expect(DEFAULT_OPTIONS.performanceThreshold).toBeDefined();
      expect(DEFAULT_OPTIONS.verbose).toBeDefined();
      expect(DEFAULT_OPTIONS.debug).toBeDefined();
    });

    it('should have sensible default values', () => {
      expect(DEFAULT_OPTIONS.include).toEqual(['**/*.proto']);
      expect(DEFAULT_OPTIONS.exclude).toEqual(['node_modules/**']);
      expect(DEFAULT_OPTIONS.generateReactHooks).toBe(false);
      expect(DEFAULT_OPTIONS.sourceMaps).toBe(true);
      expect(DEFAULT_OPTIONS.maxCacheSize).toBe(100);
      expect(DEFAULT_OPTIONS.performanceThreshold).toBe(1000);
      expect(DEFAULT_OPTIONS.verbose).toBe(false);
      expect(DEFAULT_OPTIONS.debug).toBe(false);
    });

    it('should have complete optimization defaults', () => {
      expect(DEFAULT_OPTIONS.optimization.deadCodeElimination).toBe(false);
      expect(DEFAULT_OPTIONS.optimization.treeshaking).toBe(false);
      expect(DEFAULT_OPTIONS.optimization.codeSplitting).toBe(false);
      expect(DEFAULT_OPTIONS.optimization.lazyLoading).toBe(false);
    });
  });
});
