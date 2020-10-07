# Webpack

webpack 是一个现代 JavaScript 应用程序的静态模块打包器。

## 快速上手

### 安装

首先，创建项目并初始化 NPM（如果需要）：

```bash
npm init -y
```

本地安装 webpack（推荐）：

```bash
npm install --save-dev webpack
# 或指定版本
npm install --save-dev webpack@<version>
```

如果使用 webpack4+，还需要安装 CLI：

```
npm install --save-dev webpack-cli
```

### 配置

首先创建目录及文件。

创建 `index.html`：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webpack</title>
</head>
<body>
    
    <script src="./src/index.js"></script>
</body>
</html>
```

创建 `src` 目录，并创建 `src/index.js` 文件：

```js
console.log('Hello Webpack');
``` 

创建配置文件 `webpack.config.js`：

```js
const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    mode: 'development'
};
```

`entry` 配置入口起点，`output` 配置输出路径以及输出文件名，`mode` 是 webpack4+ 针对目标环境的模式，可选值为 `development` 和 `production`。

### 运行

在 `packjage.json` 的 `scripts` 中配置运行命令：

```json
{
    "scripts": {
        "build": "webpack"
    }
}
```

运行命令：

```bash
npm run build
```

可以看到编译后生成了 `dist` 目录，以及 `dist/bundle.js` 文件。

替换 `index.html` 中的引用的脚本文件，并在浏览器中打开，打开调试器，正常运行。

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Webpack</title>
</head>
<body>
    
    <script src="./dist/bundle.js"></script>
</body>
</html>
```

## 多入口文件（详解entry和output）

## modules 和 loader

webpack 通过 loader 可以支持各种语言和预处理器编写模块。loader 描述了 webpack 如何处理非 JavaScript 模块。

> 注意：使用 loader 解析文件之前，请先查看 plugins-HtmlWebpackPlugin 部分，并使用 `html-webpack-plugin` 插件。

### 加载css

安装 `style-loader` 和 `css-loader`：

```bash
npm install --save-dev style-loader css-loader
```

修改 `webpack.config.js`：

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
        })
    ],
    mode: 'development'
};
```

添加样式文件 `src/style.css`：

```css
.color-red {
    color: #ff0000;
}
```

修改 `index.html`：

```html
<body>
    <h1 class="color-red">Webpack</h1>
</body>
```

在 `src/index.js` 中导入样式：

```js
import './style.css';

console.log('Hello Webpack');
```

运行 `npm run build`，编译后打开 `dist/index.html`，打开后样式表被加载。如果打开调试器，能够看到在 `<head>` 标签里边注入了样式。

![图片](./images/webpack/01.png)

> 优化：使用 `MiniCssExtractPlugin` 分离 css 文件，参考后面 `plugins`

### sass/less

### images（url-loader/file-loader + html-loader）

#### url-loader/file-loader

`url-loader` 可以将图片资源转化为 base64 并引用，性能会优于直接引用图片。但是，当图片较大时，编码的性能下降，就需要改成引用图片，此时 `url-loader` 会调用 `file-loader` （需安装）加载图片。

详细用法参考官方文档：[https://webpack.js.org/loaders/url-loader/](https://webpack.js.org/loaders/url-loader/)

安装 `url-loader` 和 `file-loader`：

```bash
npm install --save-dev url-loader file-loader
```

修改 `webpack.config.js`：

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.(png|svg|jpe?g|gif)$/,
                loader: 'url-loader',
                options: {
                    limit: 10240,
                    name: '[name].[hash:7].[ext]'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
        }),
        new MiniCssExtractPlugin()
    ],
    mode: 'development'
};
```

当图片不超过10240Bytes，即10KB时，图片会被转成base64，当超过10KB时，则会在构建目录生成文件名追加哈希值的图片。

修改 `index.html` 和 `rc/style.css`：

```html
<body>
    <h1 class="color-red">Webpack</h1>

    <div class="logo"></div>
</body>
```

```css
.color-red {
    color: #ff0000;
}

.logo {
    width: 50px;
    height: 50px;
    background-image: url('logo.png');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
}
```

编译后页面显示图片，在 `dist/main.css` 中，背景图片已被转换成base64（本例使用图片小于10KB）。

#### html-loader

使用 `url-loader` 或者 `file-loader`，只能处理 css 文件中的背景图片，或者 js文件中 `Image` 对象的 `src` 属性，对于 html 文件中 `<img>` 的 `src` 属性引用的图片，需要使用 `html-loader`。

`html-loader`的详细用法参考官方文档：[https://webpack.js.org/loaders/html-loader/](https://webpack.js.org/loaders/html-loader/)

安装 `html-loader`（解析图片需要先安装 `url-loader` 或 `file-loader`）：

```bash
npm install --save-dev html-loader
```

修改 `webpack.config.js`：

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.(png|svg|jpe?g|gif)$/,
                loader: 'url-loader',
                options: {
                    limit: 10240,
                    name: '[name].[hash:7].[ext]'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
        }),
        new MiniCssExtractPlugin()
    ],
    mode: 'development'
};
```

在 `index.html` 中使用 `<img>`：

```html
<body>
    <h1 class="color-red">Webpack</h1>

    <div class="logo"></div>
    <img src="./src/logo.png" />
</body>
```

编译后 `dist/index.html` 中的 `<img>` 的 `src` 属性引用了 base64 格式的图片（不超过10KB），或者引用在 `dist` 中生成的图片。


### babel

Babel是一个JavaScript的编译器，可以将ES6的代码转化为浏览器支持的JavaScript代码（通常是ES5），从而在现有环境中运行。这就意味着，我们可以使用ES6编写程序，而不依赖于浏览器是否支持。

安装 babel：

```bash
npm install --save-dev babel-loader @babel/core @babel/preset-env
```

修改 `webpack.config.js`：

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // ...
    module: {
        rules: [
            // ...
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,    // 排除node_modules目录
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html'
        })
    ]
};
```
创建 `.babelrc` 或者 `.bable.config.json`：

```json
{
    "presets": [
        [
            "@babel/env",
            {
                "debug": true,
                "targets": "> 1%, last 2 versions, not ie <= 8",
                "useBuiltIns": "usage",
                "corejs": 3
            }
        ]
    ]
}
```

babel 的详细用法参考后面的 Babel 文档或者官方文档：[https://www.babeljs.cn/](https://www.babeljs.cn/)

### eslint

### vue

## plugins

插件是 webpack 的支柱功能，用于解决 loader 无法实现的其他事。

### HtmlWebpackPlugin

`HtmlWebpackPlugin` 用于打包 html 文件。

安装：

```bash
npm install --save-dev html-webpack-plugin
```

修改 `webpack.config.js`：

```js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    // ...
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',    // 编译后输出的文件名
            template: 'index.html'     // 用于编译的模板文件
        })
    ]
};
```

修改 `index.html`：

```html
<body>
    <h1>Webpack</h1>
</body>
```

添加了标题，并且去掉了原先脚本的引用，因为编译后会自动在 `<body>` 标签的底部注入脚本。

运行 `npm run build`，在 `dist` 目录下生成了 `index.html`，打开后显示“Webpack”标题。

### MiniCssExtractPlugin

之前使用 `style-loader` 和 `css-loader`加载 css 文件的方法， 将 css 文件内嵌到 `bundle.js` 中，只有加载脚本文件的时候，才会将样式表插入到页面中。这就意味着，当样式表或者脚本文件较大时，需要花时间等待脚本文件下载完，样式表才会生效。优化的办法是使用 `MiniCssExtractPlugin`， 分离 css 文件和 js 文件，让浏览器可以并发下载资源，不过也会增加请求数量（webpack3 使用 `ExtractTextWebpackPlugin`分离 css 文件，webpack4 以后使用 `MiniCssExtractPlugin` ）。

参考文档：[https://webpack.js.org/plugins/mini-css-extract-plugin](https://webpack.js.org/plugins/mini-css-extract-plugin)

安装 `mini-css-extract-plugin`：

```bash
npm install --save-dev mini-css-extract-plugin
```

修改 `webpack.config.js`：

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    // ...
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.(png|svg|jpe?g|gif)$/,
                loader: 'url-loader',
                options: {
                    limit: 10240,
                    name: '[name].[hash:7].[ext]'
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
        }),
        new MiniCssExtractPlugin()
    ],
    mode: 'development'
};
```

运行 `npm run build`，在 `dist`目录下生成 `main.css`，`dist/index.html` 文件在 `<head>` 标签中以 `<link>` 引入了样式表。

## 开发环境和生产环境

开发环境（development）和生产环境（production）的构建目标差异很大。在开发环境中，我们需要具有强大的、具有实时重新加载（live reloading）或热模块替换（hot module replacement）能力的 source map 和 localhost server。而在生产环境中，我们的目标则转向于关注更小的 bundle，更轻量的 source map，以及更优化的资源，以改善加载时间。由于要遵循逻辑分离，我们通常建议为每个环境编写彼此独立的 webpack 配置。

以上涉及的概念会在接下来逐个详解。

### 区分开发环境和生产环境

删除之前的 `webpack.config.js`，然后安装 `webpack-merge`：

```bash
npm install --save-dev webpack-merge
```

`webpack-merge` 用于提取公用的 webpack 配置内容。


为了规范项目的目录，做，如下处理，`src/css` 存放原始 css 文件，`src/js` 存放原始 js 文件，`src/img` 存放静态图片，相关资源的引入和打包输出，也作出相应修改。

创建通用 webpack 配置文件 `webpack.common.js`：

```js
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: './src/js/index.js',
    output: {
        filename: 'js/[name].[hash:7].js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.html$/,
                use: 'html-loader'
            },
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader'
                ]
            },
            {
                test: /\.(png|svg|jpe?g|gif)$/,
                loaders: 'url-loader',
                options: {
                    limit: 10240,
                    name: 'img/[name].[hash:7].[ext]'
                }
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].[hash:7].css'
        })
    ]
};
```

通用配置包括入口文件，输出配置，加载 css，加载图片等。


创建开发环境配置文件 `webpack.dev.js`：

```js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
        })
    ],
    mode: 'development'
});
```

创建生产环境配置文件 `webpack.prod.js`：

```js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
        })
    ],
    mode: 'production'
});
```

### mode

`'production' | 'development' | none`， 默认为 `production`

webpack4 以后，可以通过 `mode` 来指定目标环境是开发环境，还是生产环境。`mode` 属性可以指定 `process.env.NODE_ENV`，这个值之前需要通过 `DefinePlugin` 来定义，许多 `library` 会根据这个变量的不同，来引用不同的代码。除此之外，配置 `mode`，webpack 还会根据目标环境自动添加和设置一些插件。

> mode 启用的插件

### web 服务器以及 NPM 命令

在开发环境中，每次修改代码，都要手动运行 `npm run build` 命令编译代码是比较麻烦的，为此可以配置 web 服务器，在代码修改时自动编译。

安装 `webpack-dev-server`：

```bash
npm install --save-dev webpack-dev-server
```

修改开发环境的配置文件 `webpack.dev.js`，告诉开发服务器在哪里查找文件：

```js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
        })
    ],
    devServer: {
        contentBase: './dist'
    },
    mode: 'production'
});
```

更多 `webpack-dev-server` 的配置参考官方文档：[https://webpack.js.org/configuration/dev-server/](https://webpack.js.org/configuration/dev-server/)

修改 `package.json`，为开发环境和生产环境配置不同的 NPM 命令：
```json
"scripts": {
    "dev": "webpack-dev-server --open --config webpack.dev.js",
    "build": "webpack --config webpack.prod.js"
},
```

* 使用 `npm run dev` 命令启用开发环境，启用 `webpack-dev-server`，编译后会自动在浏览器中打开，再次修改代码并保存，浏览器会自动更新。
* 使用 `npm run build` 命令构建生产环境，会创建 `dist` 目录并编译到此目录，上线前交付此目录即可。


### source-map(devtool)

当 webpack 打包源代码时，可能会很难追踪到错误和警告在源代码中的原始位置。为了更容易地追踪错误和警告，JavaScript 提供了 source map 功能，将编译后的代码映射回原始源代码。webpack 通过 `devtool` 属性来配置不同的 `source-map` 值。

![图片](./images/webpack/02.png)

具体的 `source-map` 值可参考官方文档：[https://webpack.js.org/configuration/devtool/](https://webpack.js.org/configuration/devtool/)

使用不同的 `source-map` 值，代码的构建速度和代码映射是不一样的。对于开发环境，通常希望以增加编译后包的体积为代价获取更快速的 source map，但是对于生产环境，则希望分离和压缩模块，获得精确的 source map。

修改开发环境配置文件 `webpack.dev.js`：

```js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
        })
    ],
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        contentBase: './dist'
    },
    mode: 'development'
});
```

修改生产环境配置文件 `webpack.prod.js`：

```js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(common, {
    plugins: [
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
        })
    ],
    devtool: 'source-map',
    mode: 'production'
});
```

### 清理 dist 文件夹

在构建生产环境时，会在 `dist` 目录下生成编译后的文件。假如我们删除 `src` 目录下的某些文件，再次编译后之前的代码仍会遗留在 `dist` 文件夹中，导致 `dist` 文件夹相当杂乱。比较推荐的做法是使用 `clean-webpack-plugin` 插件，每次构建前清理 `dist` 文件夹。

安装 `clean-webpack-plugin` 插件：

```bash
npm install --save-dev clean-webpack-plugin
```

修改生产环境配置文件 `webpack.prod.dev`：

```js
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(common, {
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'index.html'
        })
    ],
    devtool: 'source-map',
    mode: 'production'
});
```

`clean-webpack-plugin` 的详细配置参考：[https://www.npmjs.com/package/clean-webpack-plugin](https://www.npmjs.com/package/clean-webpack-plugin)。