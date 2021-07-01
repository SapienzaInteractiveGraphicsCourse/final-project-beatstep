const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    //mode: 'production',
    mode: 'development',
    entry: {
        app: './src/app.js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Interactive Graphics Project',
            template: './src/index.html',
        }),
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    {
                      loader: "style-loader",
                      options: { injectType: "singletonStyleTag" },
                    },
                    "css-loader",
                  ],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'textures/[hash][ext]'
                },
            },
            {
                test: /\.(obj|stl|gltf|babylon)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'models/[hash][ext]'
                },
            },
        ],
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    devtool: "eval-cheap-module-source-map",
    devServer: {
      contentBase: './dist',
      liveReload: true,
      watchContentBase: true,
      watchOptions: {
        poll: true,
      },
    },
    // watch: true,
    // watchOptions: {
    //     ignored: /node_modules/,
    //     aggregateTimeout: 1000,
    // },
};