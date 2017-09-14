const path = require('path')
const srcPath = path.resolve(__dirname, 'src')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
  resolve: {
    modules: [
      'node_modules',
      srcPath,
    ],
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
        {
          loader: 'eslint-loader',
          options: {
            failOnError: false,
          }
        },
      ],
      include: './src',
    }],
  },
}
