import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  external: [
    'unplugin',
    '@hallow/parser',
    '@hallow/generator',
    '@hallow/react',
    'fast-glob',
    'zod',
    'chalk',
    'minimatch',
    'crypto',
    'fs',
    'fs/promises',
    'path',
    'perf_hooks',
    'process',
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      compilerOptions: {
        rootDir: './src',
        declaration: false,  // Disable declaration to avoid issues with external packages
        declarationMap: false,
      },
    }),
    nodeResolve({
      preferBuiltins: true,
    }),
    commonjs(),
  ],
};
