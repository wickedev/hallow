import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const external = [
  'react',
  'rxjs',
  'rxjs/operators',
  '@hallow/generator',
];

const plugins = [
  nodeResolve(),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    compilerOptions: {
      module: 'esnext',
      rootDir: undefined,
    },
    declaration: false,
    declarationMap: false,
  }),
];

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true,
    },
  ],
  external,
  plugins,
};
