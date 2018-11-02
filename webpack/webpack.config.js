const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const home = path.resolve(__dirname, '../');

module.exports = {
  entry: path.resolve(home, 'src/app/index.js'),
  output: {
    path: path.resolve(home, 'dist'),
    filename: 'index.js',
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.(png|jpg)$/,
        loader: 'url-loader',
      },
      { enforce: 'pre', test: /\.js$/, loader: 'source-map-loader' },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(home, 'assets/index.html'),
    }),
  ],
  target: 'web',
  node: {
    __dirname: true,
    fs: 'empty',
    module: 'empty',
  },
};