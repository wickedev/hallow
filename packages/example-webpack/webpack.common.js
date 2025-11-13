const path = require('path');
const webpack = require('webpack');
const HallowPlugin = require('@hallow/plugin').webpack;

module.exports = {
  entry: './src/index.tsx',

  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.proto'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    fallback: {
      // Node.js core modules not available in browser - use empty modules
      '@grpc/grpc-js': false,
      'fs': false,
      'net': false,
      'tls': false,
      'dns': false,
      'http2': false,
      'stream': false,
      'zlib': false,
      'http': false,
      'https': false,
      'url': false,
      'util': path.resolve(__dirname, 'stubs/util.js'),
      'os': false,
      'process': false,
      'path': false,
      'crypto': false,
    },
  },

  module: {
    rules: [
      // TypeScript files
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      // CSS files
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },

  plugins: [
    // Hallow plugin for proto file transformation
    HallowPlugin({
      // Root directory for proto files
      protoRoot: path.resolve(__dirname, 'proto'),

      // Generate React hooks for gRPC methods
      generateReactHooks: true,

      // Generate React Suspense hooks
      generateSuspenseHooks: true,

      // Enable source maps for debugging
      sourceMaps: true,

      // Cache directory for faster rebuilds
      cacheDir: path.resolve(__dirname, '.cache/hallow'),

      // Verbose logging in development
      verbose: process.env.NODE_ENV === 'development',
    }),

    // Define environment variables for the browser
    new webpack.DefinePlugin({
      'process.env.GRPC_SERVER_URL': JSON.stringify(process.env.GRPC_SERVER_URL || ''),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    }),

    // Replace NativeGrpcAdapter with empty stub for browser builds
    new webpack.NormalModuleReplacementPlugin(
      /NativeGrpcAdapter/,
      require.resolve('./stubs/empty.js')
    ),

    // Replace @grpc/grpc-js with empty stub for browser builds
    new webpack.NormalModuleReplacementPlugin(
      /@grpc\/grpc-js/,
      require.resolve('./stubs/empty.js')
    ),
  ],
};
