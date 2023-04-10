const path = require('path');
const { merge } = require('webpack-merge');
const webpack = require('webpack'); // 用于访问内置插件
const webpackBaseConfig = require('./webpack.base.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const devConfig = {
    mode: 'development',
    devtool: 'eval-source-map',
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html'
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
};

module.exports = merge(webpackBaseConfig, devConfig);