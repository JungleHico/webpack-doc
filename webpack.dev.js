const { merge } = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = merge(common, {
  module: {
    rules: [
      {
        test: /\.css/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  },
  devtool: 'eval-cheap-module-source-map',
  mode: 'development'
})