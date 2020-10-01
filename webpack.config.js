const path = require('path')

module.exports = {
  entry: './src/js/scroll.js',
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: 'scrollIE.bundle.js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]

  }
}
