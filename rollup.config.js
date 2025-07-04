const typescript = require('@rollup/plugin-typescript');
const dts = require('rollup-plugin-dts').default;

const config = [
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
        format: 'es',
        sourcemap: true,
      },
    ],
    plugins: [
      typescript({
        typescript: require('typescript'),
        tsconfig: './tsconfig.json',
      }),
    ],
    external: [
      'google-protobuf',
      '@improbable-eng/grpc-web',
      'react',
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es',
    },
    plugins: [dts()],
  },
];

module.exports = config;