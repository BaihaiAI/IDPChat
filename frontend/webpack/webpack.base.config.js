const webpack = require('webpack'); // 用于访问内置插件
const path = require('path');
const WebpackBar = require('webpackbar');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const baseConfig = {
    entry: {
        index: './src/index.js'
    },
    output: {
        publicPath: '/',
        path: path.join(__dirname, "../dist"),
        filename: `js/[name].[hash].js`,
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, '../src'),
            "@components": path.resolve(__dirname, '../src/components'),
            "@store": path.resolve(__dirname, '../src/store'),
        },
        extensions: [".ts", ".js", ".tsx", ".jsx", ".json", '.css', '.less']
    },
    performance: {
        hints: false, // 性能提示开关 false | "error" | "warning"
    },
    module: {
        rules: [
            { test: /\.(j|t)sx?$/, use: ['cache-loader', 'thread-loader', 'babel-loader'], exclude: /node_modules/ },
            { test: /\.js$/, use: ['babel-loader'], exclude: /node_modules/ },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            publicPath: '/',
                        }
                    }]
            },
            {
                test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: 10240,
                        name: path.join('../dist/font/[name].[hash:7].[ext]')
                    }
                }]
            },
            { test: /\.css$/, use: ['style-loader', 'css-loader'] },
            {
                test: /\.less$/,
                exclude: /\.module\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    {
                        loader: "less-loader",
                        options: {
                            lessOptions: {
                                javascriptEnabled: true,
                            },
                        },
                    }
                ]
            },
            {
                test: /\.module\.(less)$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: '[name]_[local]-[hash:6]'
                            }
                        }
                    },
                    'less-loader'
                ]
            },
        ]
    },
    plugins: [
        new WebpackBar(),
        new CopyWebpackPlugin({
            patterns: [
                { from: path.resolve(__dirname, '../static'), to: path.resolve(__dirname, '../dist/static') },
            ],
        }),
        new webpack.DefinePlugin({
            'process.env': {
                'NODE': JSON.stringify(process.env.NODE_ENV),
            }
        }),
    ]
};

module.exports = baseConfig;
