'use strict';

var through = require('through2'),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError,
    File = gutil.File,
    fs = require('fs'),
    path = require('path'),
    stream = require('stream'),
    mkdirp = require('mkdirp'),
    buildify = require('buildify'),
    concat = require('concat')
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
        if (typeof variable === 'object') {
            variable = JSON.stringify(variable);
        }
        else if (typeof variable === 'string') {
            variable = '"' + variable + '"'; // Surrounding with quote
        } else if (typeof variable === 'undefined') {
            variable = "null";
        }
        body = body.replace(match[0], "=" + variable);
        // Adding global variables

        match = VAR_REGEX.exec(body);
        matchVar = match ? match[match.length - 1] : '';
    }
    return body;
}

function prependModules(filename, srcPath, siteObject) {
    var modules = siteObject.modules,
        moduleName,
        modulePaths = []
        ;

    for (moduleName in modules) {
        modulePaths.push(srcPath + modules[moduleName]);
    }
    modulePaths.unshift(filename);
    concat(modulePaths, filename.replace('.tmp', ''), function () {
    });
}

module.exports = function (srcPath, destPath, daktConfig) {
    var siteName,
        sitePromises = []
        ;

    if (!(srcPath && destPath && daktConfig)) {
        throw new PluginError('gulp-dakty', 'Missing options for gulp-dakty');
    }

    for (siteName in daktConfig) {
        sitePromises.push(
            (function (siteName) {
                return mkDir(destPath + siteName)
                    .then(function () {
                        return readSource(srcPath + 'daktyloskop.js')
                    })
                    .then(function (data) {
                        data = withReplacedVars(daktConfig[siteName], data);
                        return writeToDest(destPath + siteName + '/daktyloskop.tmp.js', data);
                    })
                    .then(function () {
                        prependModules(destPath + siteName + '/daktyloskop.tmp.js', srcPath, daktConfig[siteName]);
                    })
                    .then(function () {
                        console.log(siteName)
                    })
                ;
            }(siteName))
        )
    }
    return Promise.all(sitePromises);
};