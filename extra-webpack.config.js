const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const DirectoryTreePlugin = require('directory-tree-webpack-plugin');

const docsDir = path.resolve(__dirname, 'src', 'docs');
const mavenDir = path.resolve(__dirname, 'src', 'maven');

// Make a custom version of the DirectoryTreePlugin that runs when we need it to
class AfterBuildDirectoryTreePlugin extends DirectoryTreePlugin {
  constructor(options) {
    super(options);
  }

  apply(compiler) {
    // The DirectoryTreePlugin uses hooks.compile here, we need hooks.afterEmit
    compiler.hooks.afterEmit.tap('DirectoryTreeWebpackPlugin', this._buildTree.bind(this));
  }
}

module.exports = {
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: path.resolve(__dirname, 'github') }
      ]
    }),
    new AfterBuildDirectoryTreePlugin({
      dir: docsDir,
      path: path.resolve(__dirname, 'dist', 'docs.index.json'),
      exclude: /\.gitkeep/,
      enhance: (item, _) => {
        item.path = item.path.substring(docsDir.length + 1);
      }
    }),
    new AfterBuildDirectoryTreePlugin({
      dir: mavenDir,
      path: path.resolve(__dirname, 'dist', 'maven.index.json'),
      exclude: /\.gitkeep/,
      enhance: (item, _) => {
        item.path = item.path.substring(mavenDir.length + 1);
      }
    })
  ]
};
