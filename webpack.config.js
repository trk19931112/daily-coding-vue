const webpack = require('webpack')
const path = require('path')
const vueLoaderPlugin = require('vue-loader/lib/plugin')
const miniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebackPlugin = require('copy-webpack-plugin')

module.exports = /* SPA config */(env) => {
    const isProduction = env.production
    return {
        mode: isProduction ? 'production' : 'development',
        entry: {
            main: './index.js',
            mock: './mock.js'
        },
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: isProduction ? "[chunkhash:8].file.js" : "[name].file.js", //[chunkhash:8]等于output.hashDigestLength:8
            chunkFilename: isProduction ? "[id].[chunkhash:8].js" : "[name].chunkFile.js",
            sourceMapFilename: 'sourceMap/[file].map',
            jsonpFunction: 'vueProject',
            /* 
            publicPath: 'statics/' //导出的html内部所有的资源连接将会加上statics/前缀（相对于index.html页面的位置）
                                //也可以是绝对路径，如使用CDN资源 
            */
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src')
            }
        },
        devtool: isProduction ? '' : 'source-map',
        devServer: {
            contentBase: path.join(__dirname, 'dist/public'),
            contentBasePublicPath: '/static',
            open: 'chrome',
            compress: true,
            writeToDisk: true,
            historyApiFallback: true,
            /* openPage: ['', 'three'] */
            openPage: 'three',
            overlay: true
        },
        optimization: {
            /* runtimeChunk: {
                name: 'webpackRuntime'
            } */
            splitChunks: {
                /* { automaticNameDelimiter?, automaticNameMaxLength?, cacheGroups?, chunks?, fallbackCacheGroup?, filename?, hidePathInfo?, maxAsyncRequests?, maxInitialRequests?, maxSize?, minChunks?, minSize?, name? } */
                //automaticNameDelimiter: 'dependence-', 
                //⬇⬇⬇可以定义通过import()等方式动态导入的文件中分离出的包的名称（如当动态导入的某个文件依赖另外一个非常大的包时就会自动分离出一个单独的包）
                //后面cacheGroups里面单独定义的name值会覆盖这里的定义
                //注意：当name返回一个固定值（如name:<string>或者name:<function返回一个固定的字符串>），那么除了下面cacheGroup定义之外的所有分离的包都会合并在一起。当然也可以返回不同的name已生成多个包
                /* name(module, chunks, cacheGroupKey) {
                    let a = module.identifier().split('/').reduceRight(item => item)
                    return `vendor~${a}`
                }, */
                name: true,                 
                cacheGroups: {                 
                    'vue-x': {
                        name(module, chunks, cacheGroupKey) {
                            return cacheGroupKey
                        },
                        test: /[\\/]node_modules[\\/](vue|vuex)[\\/]/,
                        filename: 'vendors/dependence-[name].js',
                        chunks: 'all'
                    },
                    vueRouter: {
                        name(module, chunks, cacheGroupKey) {
                            return cacheGroupKey
                        },
                        test: /[\\/]node_modules[\\/]vue-router[\\/]/,
                        filename: 'vendors/dependence-[name].js',
                        chunks: 'all'
                    },
                    style: {
                        name(module, chunks, cacheGroupKey) {
                            return cacheGroupKey
                        },
                        test:/[\\/][0-9]+\.vue[\\/]/,
                        filename: '[name].css',
                        chunks: 'all'
                    }
                   /*  './src/router/index.js'里需要修改Three的引用方式为非动态导入才能成功split
                    three: {
                        test: /[\\/]node_modules[\\/]three[\\/]/,
                        chunks: 'all',
                        filename: 'vendors/[name].js'
                    } */
                }
            }
        },
        module: {
            rules: [
                {
                    test: /\.vue$/,
                    use: 'vue-loader'
                },
                {
                    test: /\.css$/,
                    use: [!isProduction ? miniCssExtractPlugin.loader : 'vue-style-loader', 'css-loader']
                },
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: ['babel-loader', "eslint-loader"]
                }
            ]
        },
        plugins: [
            new vueLoaderPlugin(),
            new miniCssExtractPlugin({
                filename: 'index.css',
                chunkFilename: '[name].css',
                ignoreOrder: true
            }),
            new HtmlWebpackPlugin({
                title: 'threeJS project',
                template: path.resolve(__dirname, './index.html'),
                favicon: './public/resume.jpg',
                inject: 'body'
            }),
            new CleanWebpackPlugin(),
            new webpack.ProvidePlugin({
                TWEEN: ['@tweenjs/tween.js', 'default'],
                COLORS: [path.resolve(path.join(__dirname, 'utils/colors.js')), 'default']
            }),
            new CopyWebackPlugin({
                patterns: [
                    {
                        from: './public',//from的上下文是__dirname
                        to: './public', //to的上下文是OUTPUT.PATH
                        toType: 'dir'
                    }
                ]
            })
        ]
    }
}