const webpackConfig = require('./webpack.config');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  ...webpackConfig
}
