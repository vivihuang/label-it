const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const home = path.resolve(__dirname, '../');
const webpackConfig = require('./webpack.config');

const config = {
  plugins: webpackConfig.plugins.concat(
    new HtmlWebpackPlugin({
      template: path.resolve(home, 'assets/index.html'),
      filename: '404.html',
    }),
  ),
};

module.exports = {
  mode: 'production',
  ...webpackConfig,
  ...config,
};
