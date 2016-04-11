'use strict';
var path = require('path');
var Promise = require('bluebird');
var FS = require('../../xm/fileIO');
var typeOf = require('../../xm/typeOf');
var PackageDefinition = require('../support/PackageDefinition');
var PackageType = (function () {
    function PackageType(name, folderName, packageGlob, infoJson) {
        this.name = name;
        this.folderName = folderName;
        this.packageGlob = packageGlob;
        this.infoJson = infoJson;
    }
    return PackageType;
})();
function getStringArray(elem) {
    if (!typeOf.isArray(elem)) {
        if (typeOf.isString(elem)) {
            return [elem];
        }
        return [];
    }
    return elem.filter(typeOf.isString);
}
var PackageLinker = (function () {
    function PackageLinker() {
        this.managers = [];
        this.managers.push(new PackageType('node', 'node_modules', '{*/,@*/*/}', 'package.json'));
        this.managers.push(new PackageType('bower', 'bower_components', '*/', 'bower.json'));
    }
    PackageLinker.prototype.scanDefinitions = function (baseDir) {
        var _this = this;
        var memo = [];
        return Promise.all(this.managers.map(function (type) {
            return _this.scanFolder(memo, type, baseDir);
        })).return(memo);
    };
    PackageLinker.prototype.scanFolder = function (memo, type, baseDir) {
        var scanDir = path.resolve(baseDir, type.folderName);
        var pattern = type.packageGlob + type.infoJson;
        return FS.glob(pattern, {
            cwd: scanDir
        }).map(function (infoPath) {
            var packageName = path.dirname(infoPath);
            infoPath = path.join(scanDir, infoPath);
            return FS.readJSON(infoPath).then(function (info) {
                var use = new PackageDefinition(packageName, [], type.name);
                return Promise.all(PackageLinker.extractDefLinks(info).map(function (ref) {
                    ref = path.resolve(path.dirname(infoPath), ref);
                    return FS.exists(ref).then(function (exists) {
                        if (exists) {
                            use.definitions.push(ref);
                        }
                    });
                })).then(function () {
                    if (use.definitions.length > 0) {
                        memo.push(use);
                    }
                });
            }).return();
        }).catch(function (err) {
        });
    };
    PackageLinker.extractDefLinks = function (object) {
        var ret = [];
        if (!typeOf.isObject(object)) {
            return ret;
        }
        if (!typeOf.hasOwnProp(object, 'typescript')) {
            return ret;
        }
        var ts = object.typescript;
        if (!typeOf.isObject(ts)) {
            return ret;
        }
        if (typeOf.hasOwnProp(ts, 'definition')) {
            return getStringArray(ts.definition);
        }
        if (typeOf.hasOwnProp(ts, 'definitions')) {
            return getStringArray(ts.definitions);
        }
        return ret;
    };
    return PackageLinker;
})();
module.exports = PackageLinker;
