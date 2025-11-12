/**
 * Common test utilities for plugin tests
 */

import type { UnpluginOptions, UnpluginContextMeta } from 'unplugin';
import type { PluginOptions } from '../../src/types';

/**
 * Creates a mock UnpluginContextMeta for testing
 */
export function createMockMeta(framework: 'vite' | 'webpack' | 'rollup' | 'esbuild' = 'vite'): UnpluginContextMeta {
  return {
    framework,
    vite: framework === 'vite' ? {} : undefined,
    webpack: framework === 'webpack' ? { compiler: {} as any } : undefined,
    rollup: framework === 'rollup' ? {} : undefined,
    esbuild: framework === 'esbuild' ? {} : undefined,
  } as UnpluginContextMeta;
}

/**
 * Type guard to ensure we have a single UnpluginOptions object
 */
export function getSinglePlugin(plugin: UnpluginOptions | UnpluginOptions[]): UnpluginOptions {
  if (Array.isArray(plugin)) {
    if (plugin.length === 0) {
      throw new Error('Plugin array is empty');
    }
    return plugin[0];
  }
  return plugin;
}

/**
 * Creates a plugin instance for testing with proper meta context
 */
export function createTestPlugin(
  createPlugin: (options: PluginOptions, meta: UnpluginContextMeta) => UnpluginOptions | UnpluginOptions[],
  options: PluginOptions,
  framework: 'vite' | 'webpack' | 'rollup' | 'esbuild' = 'vite'
): UnpluginOptions {
  const meta = createMockMeta(framework);
  const plugin = createPlugin(options, meta);
  return getSinglePlugin(plugin);
}

/**
 * Creates a mock transform context
 */
export function createMockTransformContext(): any {
  return {
    addWatchFile: jest.fn(),
    getWatchFiles: jest.fn(() => []),
    meta: createMockMeta(),
  };
}
