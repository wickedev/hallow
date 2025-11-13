import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

const external = [
  '@hallow/parser',
  'google-protobuf',
  '@improbable-eng/grpc-web',
  '@grpc/grpc-js',
  'rxjs',
  'path',
  'fs',
];

const plugins = [
  nodeResolve(),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    compilerOptions: {
      module: 'esnext',
    },
  }),
];

export default [
  // Main package
  {
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
  },
  // Adapters subpackage
  {
    input: 'src/adapters/index.ts',
    output: [
      {
        file: 'dist/adapters/index.js',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    external,
    plugins,
  },
];