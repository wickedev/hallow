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
      exports: 'named'
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  external: (id) => {
    // Keep all Node.js built-ins and antlr4ts modules external
    return id.startsWith('antlr4ts') || ['fs', 'path', 'assert', 'util'].includes(id);
  },
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['tests/**/*'],
      compilerOptions: {
        rootDir: './src'
      }
    }),
    nodeResolve({
      preferBuiltins: true
    }),
    commonjs()
  ]
};