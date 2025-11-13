const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const path = require('path');

module.exports = merge(common, {
  mode: 'development',
  devtool: 'eval-source-map',

  output: {
    filename: '[name].js',
  },

  devServer: {
    port: process.env.DEV_SERVER_PORT || 8080,
    hot: true,
    historyApiFallback: true,

    // Proxy gRPC requests to server
    proxy: {
      '/grpc': {
        target: `http://localhost:${process.env.GRPC_SERVER_PORT || 3000}`,
        pathRewrite: { '^/grpc': '' },
        changeOrigin: false, // Set to false to preserve Host header
        ws: false,
        secure: false,
        // Don't buffer the response - important for gRPC-web binary data
        buffer: false,
        // Preserve all headers exactly as received
        xfwd: true,
        // Log proxy requests for debugging
        onProxyReq: (proxyReq, req, res) => {
          console.log(`[Proxy] ${req.method} ${req.url} -> ${proxyReq.path}`);
        },
        onProxyRes: (proxyRes, req, res) => {
          console.log(`[Proxy] ${req.url} <- ${proxyRes.statusCode}`);
          console.log(`[Proxy Headers] ${JSON.stringify(proxyRes.headers)}`);
        },
        onError: (err, req, res) => {
          console.error('[Proxy Error]', err);
        },
      },
    },
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'public/index.html'),
      inject: true,
    }),

    // React Fast Refresh for HMR
    new ReactRefreshWebpackPlugin(),
  ],
});
