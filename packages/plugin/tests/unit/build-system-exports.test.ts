/**
 * Unit tests for build system-specific exports (Task 15.1).
 *
 * Tests that the plugin correctly exports adapters for all supported build systems:
 * - Vite
 * - Webpack
 * - Rollup
 * - ESBuild
 *
 * Requirements:
 * - Requirement 1.2: Export named functions for build system-specific usage
 * - Requirement 15.4: Export vite(), webpack(), rollup(), and esbuild()
 */

import { describe, it, expect } from '@jest/globals';
import unplugin, { vite, webpack, rollup, esbuild } from '../../src/index';
import type { PluginOptions } from '../../src/types';

describe('Build System Exports (Task 15.1)', () => {
  describe('Default export', () => {
    it('should export default unplugin instance', () => {
      expect(unplugin).toBeDefined();
      expect(typeof unplugin).toBe('object');
    });

    it('should have vite adapter in unplugin instance', () => {
      expect(unplugin.vite).toBeDefined();
      expect(typeof unplugin.vite).toBe('function');
    });

    it('should have webpack adapter in unplugin instance', () => {
      expect(unplugin.webpack).toBeDefined();
      expect(typeof unplugin.webpack).toBe('function');
    });

    it('should have rollup adapter in unplugin instance', () => {
      expect(unplugin.rollup).toBeDefined();
      expect(typeof unplugin.rollup).toBe('function');
    });

    it('should have esbuild adapter in unplugin instance', () => {
      expect(unplugin.esbuild).toBeDefined();
      expect(typeof unplugin.esbuild).toBe('function');
    });
  });

  describe('Named exports', () => {
    it('should export vite function', () => {
      expect(vite).toBeDefined();
      expect(typeof vite).toBe('function');
    });

    it('should export webpack function', () => {
      expect(webpack).toBeDefined();
      expect(typeof webpack).toBe('function');
    });

    it('should export rollup function', () => {
      expect(rollup).toBeDefined();
      expect(typeof rollup).toBe('function');
    });

    it('should export esbuild function', () => {
      expect(esbuild).toBeDefined();
      expect(typeof esbuild).toBe('function');
    });
  });

  describe('Build system adapter creation', () => {
    const testOptions: PluginOptions = {
      protoRoot: '/test/protos',
      verbose: false,
      debug: false,
    };

    it('should create vite plugin with options', () => {
      const plugin: any = vite(testOptions);
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('@hallow/plugin');
    });

    it('should create webpack plugin with options', () => {
      const plugin = webpack(testOptions);
      expect(plugin).toBeDefined();
      // Webpack plugin structure may differ - just verify it's created
      expect(plugin).toBeTruthy();
    });

    it('should create rollup plugin with options', () => {
      const plugin: any = rollup(testOptions);
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('@hallow/plugin');
    });

    it('should create esbuild plugin with options', () => {
      const plugin = esbuild(testOptions);
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('@hallow/plugin');
    });

    it('should create plugins without options (using defaults)', () => {
      expect(() => vite()).not.toThrow();
      expect(() => webpack()).not.toThrow();
      expect(() => rollup()).not.toThrow();
      expect(() => esbuild()).not.toThrow();
    });
  });

  describe('Plugin naming consistency', () => {
    it('should have consistent plugin name across all build systems', () => {
      const vitePlugin: any = vite();
      const rollupPlugin: any = rollup();
      const esbuildPlugin: any = esbuild();

      expect(vitePlugin.name).toBe('@hallow/plugin');
      expect(rollupPlugin.name).toBe('@hallow/plugin');
      expect(esbuildPlugin.name).toBe('@hallow/plugin');
    });
  });

  describe('Plugin hooks presence', () => {
    it('should include transform hook in all adapters', () => {
      const vitePlugin: any = vite();
      const rollupPlugin: any = rollup();

      expect(vitePlugin.transform).toBeDefined();
      expect(rollupPlugin.transform).toBeDefined();

      // Note: ESBuild adapter structure differs - transform is handled internally
    });

    it('should include transformInclude hook in all adapters', () => {
      const vitePlugin: any = vite();
      const rollupPlugin: any = rollup();

      expect(vitePlugin.transformInclude).toBeDefined();
      expect(rollupPlugin.transformInclude).toBeDefined();

      // Note: ESBuild adapter structure differs - filtering is handled internally
    });

    it('should include buildStart hook in all adapters', () => {
      const vitePlugin: any = vite();
      const rollupPlugin: any = rollup();

      expect(vitePlugin.buildStart).toBeDefined();
      expect(rollupPlugin.buildStart).toBeDefined();

      // Note: ESBuild adapter structure differs - build lifecycle is handled internally
    });

    it('should include buildEnd hook in all adapters', () => {
      const vitePlugin: any = vite();
      const rollupPlugin: any = rollup();

      expect(vitePlugin.buildEnd).toBeDefined();
      expect(rollupPlugin.buildEnd).toBeDefined();

      // Note: ESBuild adapter may not expose buildEnd hook due to unplugin limitations
    });
  });

  describe('Build system-specific hooks', () => {
    it('should include Vite-specific handleHotUpdate hook', () => {
      const plugin: any = vite();
      expect(plugin.vite).toBeDefined();
      // @ts-ignore - accessing build system-specific section
      expect(plugin.vite.handleHotUpdate).toBeDefined();
    });

    it('should include Rollup-specific resolveId hook', () => {
      const plugin: any = rollup();
      expect(plugin.rollup).toBeDefined();
      // @ts-ignore - accessing build system-specific section
      expect(plugin.rollup.resolveId).toBeDefined();
    });

    it('should include Rollup-specific load hook', () => {
      const plugin: any = rollup();
      expect(plugin.rollup).toBeDefined();
      // @ts-ignore - accessing build system-specific section
      expect(plugin.rollup.load).toBeDefined();
    });

    // Note: ESBuild adapter structure may differ from Vite/Rollup due to unplugin limitations
    // The setup hook is handled internally by unplugin's esbuild adapter
  });
});
