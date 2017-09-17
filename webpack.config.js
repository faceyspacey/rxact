const path = require('path')
const srcPath = path.resolve(__dirname, 'src')

module.exports = {
  entry: './src/index.js',
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
      include: srcPath,
    }],
  },
  output: {
    library: 'rxcat',
    libraryTarget: 'umd',
  },
}
