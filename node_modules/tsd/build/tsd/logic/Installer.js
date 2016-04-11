'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var path = require('path');
var Promise = require('bluebird');
var collection = require('../../xm/collection');
var fileIO = require('../../xm/fileIO');
var CoreModule = require('./CoreModule');
var defUtil = require('../util/defUtil');
var Installer = (function (_super) {
    __extends(Installer, _super);
    function Installer(core) {
        _super.call(this, core, 'Installer');
    }
    Installer.prototype.getInstallPath = function (def) {
        return path.join(this.core.context.getTypingsDir(), def.path.replace(/[//\/]/g, path.sep));
    };
    Installer.prototype.installFile = function (file, addToConfig, overwrite) {
        var _this = this;
        if (addToConfig === void 0) { addToConfig = true; }
        if (overwrite === void 0) { overwrite = false; }
        return this.useFile(file, overwrite).then(function (targetPath) {
            if (targetPath) {
                if (_this.core.context.config.hasFile(file.def.path)) {
                    _this.core.context.config.getFile(file.def.path).update(file);
                }
                else if (addToConfig) {
                    _this.core.context.config.addFile(file);
                }
            }
            return targetPath;
        });
    };
    Installer.prototype.installFileBulk = function (list, addToConfig, overwrite) {
        var _this = this;
        if (addToConfig === void 0) { addToConfig = true; }
        if (overwrite === void 0) { overwrite = true; }
        var written = new collection.Hash();
        return Promise.map(list, function (file) {
            return _this.installFile(file, addToConfig, overwrite).then(function (targetPath) {
                if (targetPath) {
                    written.set(file.def.path, file);
                }
            });
        }).return(written);
    };
    Installer.prototype.reinstallBulk = function (list, overwrite) {
        var _this = this;
        if (overwrite === void 0) { overwrite = false; }
        var written = new collection.Hash();
        return Promise.map(list, function (installed) {
            return _this.core.index.procureFile(installed.path, installed.commitSha).then(function (file) {
                return _this.installFile(file, true, overwrite).then(function (targetPath) {
                    if (targetPath) {
                        written.set(file.def.path, file);
                    }
                    return file;
                });
            });
        }).return(written);
    };
    Installer.prototype.removeUnusedReferences = function (list, typingsPath) {
        var removed = [];
        var fnFoundDefDir = function (dir) {
            for (var i = 0; i < list.length; i++) {
                var baseName = path.dirname(list[i].path).split('/')[0];
                if (baseName === dir) {
                    return true;
                }
            }
            return false;
        };
        fileIO.getDirNameList(typingsPath).forEach(function (dir) {
            if (!fnFoundDefDir(dir)) {
                fileIO.removeDirSync(path.join(typingsPath, dir));
                removed.push(path.join(typingsPath, dir));
            }
        });
        fileIO.removeAllFilesFromDir(typingsPath);
        return Promise.all([]).return(removed);
    };
    Installer.prototype.useFile = function (file, overwrite) {
        var _this = this;
        var targetPath = this.getInstallPath(file.def);
        return fileIO.canWriteFile(targetPath, overwrite).then(function (canWrite) {
            if (!canWrite) {
                if (!overwrite) {
                }
                return null;
            }
            return _this.core.content.loadContent(file).then(function (blob) {
                return fileIO.write(targetPath, blob.content);
            }).return(targetPath);
        });
    };
    Installer.prototype.useFileBulk = function (list, overwrite) {
        var _this = this;
        if (overwrite === void 0) { overwrite = true; }
        list = defUtil.uniqueDefVersion(list);
        var written = new collection.Hash();
        return Promise.map(list, function (file) {
            return _this.useFile(file, overwrite).then(function (targetPath) {
                if (targetPath) {
                    written.set(file.def.path, file);
                }
            });
        }).return(written);
    };
    return Installer;
})(CoreModule);
module.exports = Installer;
