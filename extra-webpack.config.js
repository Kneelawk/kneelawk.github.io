const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const IndexTreePlugin = require('./index-tree-plugin');

const docsDir = path.resolve(__dirname, 'src', 'docs');
const mavenDir = path.resolve(__dirname, 'src', 'maven');
const genDir = path.resolve(__dirname, 'build', 'gen');

module.exports = {
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'github') }
      ]
    }),
    new IndexTreePlugin({
      toIndex: docsDir,
      output: path.resolve(genDir, 'docs.index'),
      exclude: /\.gitkeep/,
      basePath: '',
      baseName: 'docs'
    }),
    new IndexTreePlugin({
      toIndex: mavenDir,
      output: path.resolve(genDir, 'maven.index'),
      exclude: /\.gitkeep/,
      basePath: '',
      baseName: 'maven'
    })
  ]
};
