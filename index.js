'use strict';

var through = require('through2'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError,
    File = gutil.File,
    fs = require('fs'),
    path = require('path'),
    stream = require('stream'),
    mkdirp = require('mkdirp')
    ;

function writeToDest(filename, body, resolve, reject) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(filename, body, function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });


    });
}

function readSource(filename) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filename, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}

function mkDir(dir) {
    return new Promise(function (resolve, reject) {
        mkdirp(dir, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve()
            }
        });
    });
}

module.exports = function (srcPath, destPath, daktConfig) {
    var key,
        fullPath
        ;
    if (!(srcPath && destPath && daktConfig)) {
        throw new PluginError('gulp-dakty', 'Missing options for gulp-dakty');
    }

    for (key in daktConfig) {
        fullPath = destPath + key;
        console.log(fullPath);
        (function (path) {
            mkDir(path)
                .then(function () {
                    return readSource(srcPath + '/utils.js')
                })
                .then(function (data) {
                    return writeToDest(path + '/utils.js', data);
                })
                .then(function () {
                })
            ;
        }(fullPath))

    }

    return;
};