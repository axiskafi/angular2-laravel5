'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VError = require('verror');
var fileIO = require('../../xm/fileIO');
var CoreModule = require('./CoreModule');
var ConfigIO = (function (_super) {
    __extends(ConfigIO, _super);
    function ConfigIO(core) {
        _super.call(this, core, 'ConfigIO');
    }
    ConfigIO.prototype.initConfig = function (overwrite) {
        var _this = this;
        var target = this.core.context.paths.configFile;
        return fileIO.exists(target).then(function (exists) {
            if (exists) {
                if (!overwrite) {
                    throw new VError('cannot overwrite file %s', target);
                }
                return fileIO.remove(target);
            }
            return;
        }).then(function () {
            _this.core.context.config.reset();
            return _this.saveConfig();
        }).return(target);
    };
    ConfigIO.prototype.readConfig = function (optional) {
        var _this = this;
        if (optional === void 0) { optional = false; }
        var target = this.core.context.paths.configFile;
        return fileIO.exists(target).then(function (exists) {
            if (!exists) {
                if (!optional) {
                    throw new VError('cannot locate file %s', target);
                }
                return;
            }
            return fileIO.read(target, { flags: 'r' }).then(function (json) {
                _this.core.context.config.parseJSONString(String(json), target);
                _this.core.updateConfig();
            });
        }).return();
    };
    ConfigIO.prototype.saveConfig = function (target) {
        target = target || this.core.context.paths.configFile;
        var output = this.core.context.config.toJSONString();
        return fileIO.write(target, output).return(target);
    };
    return ConfigIO;
})(CoreModule);
module.exports = ConfigIO;
