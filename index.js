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

const VAR_REGEX = /\/\*==([_\w]*).([_\w]*)==\*\//g;

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

function withReplacedVars(siteObject, body) {
    var match,
        matchVar,
        variable
        ;
    match = VAR_REGEX.exec(body);
    matchVar = match[match.length - 1]; // Variable of this key must be replaced
    while (match) {
        variable = siteObject[matchVar];
        if (typeof variable !== 'object') {
            if (typeof variable === 'string') {
                variable = '"' + variable + '"'; // Surrounding with quote
            } else if (typeof variable === 'undefined') {
                variable = "null";
            }
            body = body.replace(match[0], "=" + variable);
        } // Adding global variables

        match = VAR_REGEX.exec(body);
        matchVar = match ? match[match.length - 1] : '';
    }
    return body;
}

module.exports = function (srcPath, destPath, daktConfig) {
    var key
        ;

    if (!(srcPath && destPath && daktConfig)) {
        throw new PluginError('gulp-dakty', 'Missing options for gulp-dakty');
    }
    for (key in daktConfig) {
        (function (key) {
            mkDir(destPath + key)
                .then(function () {
                    return readSource(srcPath + 'daktyloskop.js')
                })
                .then(function (data) {
                    data = withReplacedVars(daktConfig[key], data);
                    return writeToDest(destPath + key + '/daktyloskop.js', data);
                })
            ;
        }(key))

    }
};