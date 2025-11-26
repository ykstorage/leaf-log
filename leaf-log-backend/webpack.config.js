const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const ZipPlugin = require('zip-webpack-plugin');

module.exports = {
  entry: './src/lambda.ts',
  target: 'node',
  mode: 'production',
  externals: [
    nodeExternals({
      allowlist: ['@vendia/serverless-express'],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'dist'),
    filename: 'lambda.js',
  },
  plugins: [
    new webpack.IgnorePlugin({
      resourceRegExp: /^pg-native$/,
    }),
    new ZipPlugin({
      path: path.resolve(__dirname, 'dist'),
      filename: 'api.zip',
      include: [/\.js$/, /\.node$/],
      exclude: [/\.zip$/],
    }),
  ],
  optimization: {
    minimize: false, // Prisma 호환성을 위해 minification 비활성화
  },
};
