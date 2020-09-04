const path = require('path');

const rules = [
    {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        enforce: 'pre',
        loader: 'eslint-loader',
        options: {
            eslintPath: 'eslint',
        },
    },
    {
        test: /\.woff2$/i,
        use: {
            loader: 'file-loader',
            options: {
                name: '[name].[ext]',
                outputPath: 'fonts',
            },
        },
    },
    {
        test: /\.svg$/,
        use: ['@svgr/webpack'],
    },
    {
        test: /\.s[ac]ss$/,
        use: [
            'style-loader',
            'css-loader',
            {
                loader: 'sass-loader',
                options: {
                    sourceMap: true,
                },
            },
        ],
    },
    {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
    },
];

module.exports = {
    entry: path.resolve(__dirname, '..', 'src', 'index.tsx'),
    resolve: { extensions: ['.ts', '.tsx', '.js', 'jsx'] },
    module: { rules },
};
