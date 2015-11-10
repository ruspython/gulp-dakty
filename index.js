'use strict';

var gutil = require('gulp-util'),
    PluginError = gutil.PluginError,
    fs = require('fs')
    ;

function writeToDest(filename, body, resolve, reject) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(filename, body, function (err,data) {
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
    return new Promise(function(resolve, reject) {
        fs.readFile(filename, 'utf8', function (err,data) {
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
}

module.exports = function (srcPath, destPath, daktConfig) {
    var key
        ;
    if (!(srcPath && destPath && daktConfig)) {
        throw new PluginError('gulp-dakty', 'Missing options for gulp-dakty');
    }

    readSource(srcPath + 'utils.js')
        .then(function (data) {
            return writeToDest(destPath + 'utils.js', data);
        })
        .then(function () {
            console.log('success');
        })
    ;

    console.log('end of module');

    return 'hey there'
};