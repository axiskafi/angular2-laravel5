'use strict';
var path = require('path');
var Const = require('./Const');
var Paths = (function () {
    function Paths() {
        this.startCwd = path.resolve(process.cwd());
        this.configFile = path.resolve(this.startCwd, Const.configFile);
        this.cacheDir = path.resolve(this.startCwd, Const.cacheDir);
    }
    Paths.getCacheDirName = function () {
        return (process.platform === 'win32' ? Const.cacheDir : '.' + Const.cacheDir);
    };
    Paths.getUserHome = function () {
        return (process.env.HOME || process.env.USERPROFILE);
    };
    Paths.getUserRoot = function () {
        return (process.platform === 'win32' ? process.env.APPDATA : Paths.getUserHome());
    };
    Paths.getUserCacheDir = function () {
        return path.resolve(Paths.getUserRoot(), Paths.getCacheDirName());
    };
    return Paths;
})();
module.exports = Paths;
