const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'js/[name].[chunkhash:8].js',
    path: path.resolve(__dirname, 'dist'),
    assetModuleFilename: 'img/[name].[hash:8][ext]', // 资源模块打包文件名
    // 模块打包不使用箭头函数
    environment: {
      arrowFunction: false
    }
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        use: 'html-loader'
      },
      {
        test: /\.js$/,
        use: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'eslint-loader',
        enforce: 'pre',
        include: path.resolve(__dirname, 'src'),
        options: {
          formatter: require('eslint-friendly-formatter')
        }
      },
      {
        test: /\.(png|svg|jp?eg|gif)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024
          }
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'index.html', // 用于编译的模板文件
      filename: 'index.html'  // 编译后输出的文件名
    })
  ]
}