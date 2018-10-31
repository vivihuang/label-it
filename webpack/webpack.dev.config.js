const webpackConfig = require('./webpack.config');
const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    historyApiFallback: true,
    port: 40021,
    host: '0.0.0.0',
    disableHostCheck: true
  },
  ...webpackConfig,
};
