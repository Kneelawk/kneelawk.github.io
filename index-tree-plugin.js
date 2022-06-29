// Copyright (c) 2022 Kneelawk
//
// This code is licensed under the MIT license.

const FS = require('fs');
const PATH = require('path');

module.exports = class IndexTreePlugin {
  constructor(options) {
    this._toIndex = options.toIndex;
    this._output = options.output;
    this._exclude = options.exclude;
    this._basePath = options.basePath;
    this._baseName = options.baseName;
  }

  apply(compiler) {
    compiler.hooks.beforeCompile.tap('DirectoryTreeWebpackPlugin', this._buildTree.bind(this));
  }

  _buildTree() {
    _indexDir(this._toIndex, this._basePath, this._baseName, this._output, this._exclude);
  }
}

function _indexDir(readFrom, namePath, name, writeTo, exclude) {
  FS.readdir(readFrom, (err, files) => {
    if (err) {
      console.error(`Error reading directory '${readFrom}' :`, err);
      return;
    }

    let index = {
      name: name,
      path: namePath,
      children: []
    };

    let pending = files.length;

    files.forEach(child => {
      let childPath = PATH.resolve(readFrom, child);

      if (exclude.test(childPath)) {
        // we're excluding this file
        if (!--pending) {
          _writeIndex(writeTo, index);
        }
        return;
      }

      let childNamePath = PATH.join(namePath, child);
      let childWriteTo = PATH.resolve(writeTo, child);
      FS.stat(childPath, (err1, stats) => {
        index.children.push(_buildStats(stats, child, childNamePath));

        // do index write
        if (!--pending) {
          _writeIndex(writeTo, index);
        }

        // recurse
        if (stats.isDirectory()) {
          _indexDir(childPath, childNamePath, child, childWriteTo, exclude);
        }
      });
    });
  });
}

function _buildStats(stats, name, namePath) {
  if (stats.isDirectory()) {
    return {
      name: name,
      path: namePath,
      type: 'directory'
    };
  } else {
    return {
      name: name,
      path: namePath,
      type: 'file',
      size: stats.size
    };
  }
}

function _writeIndex(writeTo, index) {
  let indexFile = PATH.resolve(writeTo, 'index.json');

  // keep entry order consistent
  index.children.sort(_childCompare);

  _mkIfNotExists(writeTo, err => {
    if (err != null) {
      console.error(`Error creating index-tree dir '${writeTo}' :`, err);
      return;
    }

    let indexStr = JSON.stringify(index);

    _checkDifferent(indexFile, indexStr, (err1, curStr) => {
      if (err1 == null) {
        FS.writeFile(indexFile, indexStr, err2 => {
          if (err2 != null) {
            console.error(`Error writing to index file '${indexFile}' :`, err2);
          } else {
            // console.log(`CHANGES APPLIED for ${indexFile}\nDifference:\n+${indexStr}\n-${curStr}`)
          }
        });
      } else if (err1.code === '_ESAME') {
        // console.log(`No changes applied for ${indexFile}`);
        // the file should remain unchanged
      } else {
        console.error(`Error checking for existing index file '${indexFile}' :`, err1)
      }
    });
  });
}

function _childCompare(a, b) {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
}

function _mkIfNotExists(dir, callback) {
  FS.stat(dir, err => {
    if (err == null) {
      callback(null);
    } else if (err.code === 'ENOENT') {
      FS.mkdir(dir, { recursive: true }, err1 => {
        callback(err1);
      });
    } else {
      callback(err);
    }
  });
}

function _checkDifferent(file, contents, callback) {
  FS.stat(file, err => {
    if (err == null) {
      // file exists
      FS.readFile(file, (err1, buffer) => {
        if (err1 != null) {
          callback(err1, null);
        } else {
          let curContents = buffer.toString();
          if (curContents === contents) {
            callback({ code: '_ESAME' }, curContents);
          } else {
            callback(null, curContents);
          }
        }
      });
    } else if (err.code === 'ENOENT') {
      callback(null, null);
    } else {
      callback(err, null);
    }
  })
}
