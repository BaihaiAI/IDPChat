const { merge } = require('webpack-merge');
const webpack = require('webpack');
const path = require('path');
const webpackBaseConfig = require('./webpack.base.config');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require("script-ext-html-webpack-plugin");
const AddAssetHtmlWebpackPlugin = require('add-asset-html-webpack-plugin');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');

const proConfig = {
    mode: 'production',
    devtool: false, // source-map
    plugins: [
        new CleanWebpackPlugin(),
        new UglifyJsPlugin(),
        new HtmlWebpackPlugin({
            template: 'index.html',
            filename: 'index.html',
            inject: true,
            minify: { // 压缩HTML文件
                removeComments: true, // 移除HTML中的注释
                collapseWhitespace: true, // 删除空白符与换行符
                minifyCSS: true,// 压缩内联css
                removeAttributeQuotes: true, // 去掉一些属性的引号，例如id="moo" => id=moo
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
            chunks: ['index']
        }),
        new AntdDayjsWebpackPlugin(),
        new ScriptExtHtmlWebpackPlugin({
            inline: /runtime\..*\.js$/
        }),
        new webpack.DllReferencePlugin({
            context: path.join(__dirname),
            manifest: path.join(__dirname, `../dll/vendor.manifest.json`)
        }),
        new AddAssetHtmlWebpackPlugin({
            filepath: path.resolve(__dirname, '../dll/vendor.dll.js'),
            outputPath: '../dist/js',
            publicPath: `/js`
        })
    ]
};

module.exports = merge(webpackBaseConfig, proConfig);