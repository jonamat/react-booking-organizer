const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

const common = require('./webpack.common');

const rules = [
    {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
                comments: true, // Preserve webpack config comments
                sourceMaps: true,
                presets: ['@babel/preset-env', '@babel/react', '@babel/typescript'],
                plugins: [
                    [
                        '@babel/plugin-proposal-class-properties',
                        {
                            loose: true,
                        },
                    ],
                    'babel-plugin-typescript-to-proptypes', // transform static to runtime type checking
                    '@babel/transform-runtime',
                ],
            },
        },
    },
];

module.exports = merge(common, {
    mode: 'development',
    devtool: 'source-map',
    plugins: [
        // Override process.env with custom vars defined in .env
        new webpack.DefinePlugin(
            Object.fromEntries(
                Object.entries({
                    ...dotenv.config({ debug: true, path: path.resolve(__dirname, '..', 'sandbox.env') }).parsed,
                    NODE_ENV: 'development',
                    TARGET_DB: 'sandbox',
                }).map(([key, value]) => ['process.env.' + key, JSON.stringify(value)]),
            ),
        ),

        // Generate views
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, '../', 'src', 'templates', 'index.ejs'),
            templateParameters: {
                companyName: dotenv.config({ path: path.resolve(__dirname, '..', 'sandbox.env') }).parsed.COMPANY_NAME,
            },
            minify: false,
        }),
    ],
    module: { rules },
    devServer: {
        contentBase: path.resolve(__dirname, '../', 'public'),
        host: '0.0.0.0',
        public: '127.0.0.1:8080',
        port: 8080,
        disableHostCheck: true,
        compress: true,
        historyApiFallback: true,
    },
});
