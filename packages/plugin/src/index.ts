/**
 * @hallow/plugin - Universal proto file plugin for Vite, Webpack, ESBuild, and Rollup
 *
 * This plugin enables seamless importing of .proto files as first-class TypeScript modules
 * without manual code generation. It orchestrates @hallow/parser and @hallow/generator
 * to provide type-safe gRPC-web client code at build time.
 *
 * @example
 * ```typescript
 * // vite.config.ts
 * import { vite as hallow } from '@hallow/plugin';
 *
 * export default {
 *   plugins: [
 *     hallow({
 *       protoRoot: './protos',
 *       generateReactHooks: true,
 *     }),
 *   ],
 * };
 * ```
 *
 * @packageDocumentation
 */

import { createUnplugin } from 'unplugin';
import type { PluginOptions } from './types';
import { createHallowPlugin } from './plugin';

/**
 * Creates the Hallow plugin instance for proto file transformation.
 *
 * This is the core unplugin factory that orchestrates configuration validation,
 * component initialization, and proto file transformation.
 *
 * @param options - Plugin configuration options
 * @returns Unplugin instance
 */
const unplugin = createUnplugin<PluginOptions | undefined>(createHallowPlugin);

/**
 * Default export - the unplugin factory
 */
export default unplugin;

/**
 * Vite plugin adapter
 *
 * @example
 * ```typescript
 * import { vite as hallow } from '@hallow/plugin';
 *
 * export default {
 *   plugins: [hallow()],
 * };
 * ```
 */
export const vite = unplugin.vite;

/**
 * Webpack plugin adapter
 *
 * @example
 * ```typescript
 * const { webpack: hallow } = require('@hallow/plugin');
 *
 * module.exports = {
 *   plugins: [hallow()],
 * };
 * ```
 */
export const webpack = unplugin.webpack;

/**
 * Rollup plugin adapter
 *
 * @example
 * ```typescript
 * import { rollup as hallow } from '@hallow/plugin';
 *
 * export default {
 *   plugins: [hallow()],
 * };
 * ```
 */
export const rollup = unplugin.rollup;

/**
 * ESBuild plugin adapter
 *
 * @example
 * ```typescript
 * const { esbuild: hallow } = require('@hallow/plugin');
 *
 * require('esbuild').build({
 *   plugins: [hallow()],
 * });
 * ```
 */
export const esbuild = unplugin.esbuild;

// Re-export types for consumer convenience
export type { PluginOptions } from './types';

// Re-export utilities for advanced use cases
export { ErrorCollector } from './utils/error-collector';
export type { CollectedError } from './utils/error-collector';
export { ErrorFormatter } from './utils/error';
export type { FormattedError } from './types';

// Re-export sanitization utilities (Task 22.2)
export {
  sanitizeFilePath,
  sanitizeErrorMessage,
  validateAndSanitizeInput,
  sanitizePathList,
  isSafeInput,
  sanitizeStackTrace,
} from './utils/sanitization';

// Re-export logging utilities (Tasks 21.1, 21.2)
export { Logger, createLogger } from './utils/logger';
export type { LogLevel, LoggerConfig } from './utils/logger';

// Re-export glob filtering utilities (Tasks 23.1, 23.2)
export { GlobFilter } from './utils/glob-filter';
export type { GlobFilterOptions } from './utils/glob-filter';
