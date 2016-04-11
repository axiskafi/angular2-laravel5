'use strict';
var fs = require('fs');
var path = require('path');
var assertVar = require('../../xm/assertVar');
var fileIO = require('../../xm/fileIO');
var JSONPointer = require('../../xm/lib/JSONPointer');
var PackageJSON = require('../../xm/lib/PackageJSON');
var Config = require('./Config');
var Paths = require('./Paths');
var Const = require('./Const');
var Context = (function () {
    function Context(configFile, verbose) {
        if (configFile === void 0) { configFile = null; }
        if (verbose === void 0) { verbose = false; }
        assertVar(configFile, 'string', 'configFile', true);
        assertVar(verbose, 'boolean', 'verbose');
        this.packageInfo = PackageJSON.getLocal();
        this.settings = new JSONPointer(fileIO.readJSONSync(path.resolve(path.dirname(PackageJSON.find()), 'conf', 'settings.json')));
        this.stackSettings(path.resolve(Paths.getUserHome(), Const.rc));
        this.stackSettings(path.resolve(process.cwd(), Const.rc));
        this.verbose = verbose;
        this.paths = new Paths();
        if (configFile) {
            this.paths.configFile = path.resolve(configFile);
        }
        this.paths.cacheDir = Paths.getUserCacheDir();
        this.config = new Config();
    }
    Context.prototype.stackSettings = function (src) {
        if (fs.existsSync(src)) {
            if (this.verbose) {
                console.log('using rc: ' + src);
            }
            this.settings.addSource(fileIO.readJSONSync(src));
        }
        else {
            if (this.verbose) {
                console.log('cannot find rc: ' + src);
            }
        }
    };
    Context.prototype.getTypingsDir = function () {
        return this.config.resolveTypingsPath(path.dirname(this.paths.configFile));
    };
    Context.prototype.getInfo = function (details) {
        if (details === void 0) { details = false; }
        var info = {
            version: this.packageInfo.getNameVersion(),
            repo: 'https://github.com/' + this.config.repo + ' #' + this.config.ref
        };
        if (details) {
            info.paths = this.paths;
            info.typings = this.config.resolveTypingsPath(path.dirname(this.paths.configFile));
            info.config = this.config.toJSON();
        }
        return info;
    };
    return Context;
})();
module.exports = Context;
