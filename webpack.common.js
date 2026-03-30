const path = require('path');

module.exports = {
  entry: {
    app: './public/js/app.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    publicPath: '/',
    filename: 'js/[name].js',
  },
};
