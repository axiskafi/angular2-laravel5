'use strict';
var fs = require('fs');
var path = require('path');
var assertVar = require('../assertVar');
var fileIO = require('../fileIO');
function findInfo(pmodule, dir) {
    if (!dir) {
        dir = path.dirname(pmodule.filename);
    }
    var file = path.join(dir, 'package.json');
    if (fs.existsSync(file)) {
        return file;
    }
    if (dir === '/') {
        throw new Error('Could not find package.json up from: ' + dir);
    }
    else if (!dir || dir === '.') {
        throw new Error('Cannot find package.json from unspecified directory');
    }
    return findInfo(pmodule, path.dirname(dir));
}
var PackageJSON = (function () {
    function PackageJSON(pkg, path) {
        if (path === void 0) { path = null; }
        this.path = path;
        assertVar(pkg, 'object', 'pkg');
        this._pkg = pkg;
    }
    Object.defineProperty(PackageJSON.prototype, "raw", {
        get: function () {
            return this._pkg;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PackageJSON.prototype, "name", {
        get: function () {
            return this._pkg.name || null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PackageJSON.prototype, "description", {
        get: function () {
            return this._pkg.description || '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PackageJSON.prototype, "version", {
        get: function () {
            return this._pkg.version || '0.0.0';
        },
        enumerable: true,
        configurable: true
    });
    PackageJSON.prototype.getNameVersion = function () {
        return this.name + ' ' + this.version;
    };
    PackageJSON.prototype.getKey = function () {
        return this.name + '-' + this.version;
    };
    PackageJSON.prototype.getHomepage = function (short) {
        if (short === void 0) { short = false; }
        var homepage = this._pkg.homepage;
        if (homepage) {
            if (short) {
                return homepage.replace(/(^https?:\/\/)|(\/?$)/g, '');
            }
            return homepage;
        }
        if (short) {
            return '<no homepage>';
        }
        return '';
    };
    PackageJSON.find = function () {
        if (!PackageJSON._localPath) {
            PackageJSON._localPath = findInfo((module));
        }
        return PackageJSON._localPath;
    };
    PackageJSON.getLocal = function () {
        if (!PackageJSON._local) {
            var src = PackageJSON.find();
            if (!src) {
                throw (new Error('cannot find local package.json'));
            }
            PackageJSON._local = new PackageJSON(fileIO.readJSONSync(src), src);
        }
        return PackageJSON._local;
    };
    return PackageJSON;
})();
module.exports = PackageJSON;
