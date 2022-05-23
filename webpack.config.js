const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const outputDirectory = 'public';

module.exports = (env, argv) => {
  const devMode = argv.mode !== 'production';
  return {
    entry: './src/client/index.js',
    devtool: 'source-map',
    output: {
      path: path.join(__dirname, outputDirectory),
      filename: 'bundle.js',
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
          ],
        },
        {
          test: /\.scss$/,
          use: [
            devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
            'css-loader',
            'sass-loader',
          ],
        },
        {
          test: require.resolve('jquery'),
          loader: 'expose-loader',
          options: {
            exposes: ['$'],
          },
        },
      ],
    },
    devServer: {
      port: 3000,
      open: true,
      proxy: {
        '/api': 'http://localhost:8080',
      },
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './public/index.html',
        inject: 'head',
        //            favicon: "./favicon.ico"
      }),
    ].concat(devMode ? [] : [new MiniCssExtractPlugin()]),
  };
};
