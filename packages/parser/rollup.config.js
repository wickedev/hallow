const typescript = require('@rollup/plugin-typescript');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

module.exports = {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'esm',
      sourcemap: true
    }
  ],
  external: [
    'fs',
    'path',
    'antlr4ts',
    'antlr4ts/tree/ParseTree',
    'antlr4ts/tree/AbstractParseTreeVisitor',
    'antlr4ts/tree/ParseTreeWalker',
    'antlr4ts/tree/TerminalNode',
    'antlr4ts/tree/RuleNode'
  ],
  plugins: [
    resolve({
      preferBuiltins: true
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.json',
      exclude: ['tests/**/*']
    })
  ]
};