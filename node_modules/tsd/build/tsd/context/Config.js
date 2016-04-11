'use strict';
var path = require('path');
var Joi = require('joi');
var typeOf = require('../../xm/typeOf');
var assertVar = require('../../xm/assertVar');
var collection = require('../../xm/collection');
var JSONStabilizer = require('../../xm/lib/JSONStabilizer');
var Const = require('../context/Const');
var InstalledDef = require('../context/InstalledDef');
var DefVersion = require('../data/DefVersion');
var DefCommit = require('../data/DefCommit');
var Def = require('../data/Def');
var tsdSchema = require('../schema/config');
var Config = (function () {
    function Config() {
        this._installed = new collection.Hash();
        this._stable = new JSONStabilizer();
        this.reset();
    }
    Config.prototype.reset = function () {
        this.path = Const.typingsDir;
        this.version = Const.configVersion;
        this.repo = Const.definitelyRepo;
        this.ref = Const.mainBranch;
        this.stats = Const.statsDefault;
        this.otherFields = {};
        this.bundle = Const.typingsDir + '/' + Const.bundleFile;
        this._installed.clear();
    };
    Config.prototype.resolveTypingsPath = function (baseDir) {
        var cfgFull = path.resolve(baseDir);
        var typings = this.path.replace(/[\\\/]/g, path.sep);
        if (/^([\\\/]|\w:)/.test(this.path)) {
            return typings;
        }
        return path.resolve(cfgFull, typings);
    };
    Object.defineProperty(Config.prototype, "repoOwner", {
        get: function () {
            return this.repo.split('/')[0];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "repoProject", {
        get: function () {
            return this.repo.split('/')[1];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Config.prototype, "repoRef", {
        get: function () {
            return this.repo + '#' + this.ref;
        },
        enumerable: true,
        configurable: true
    });
    Config.prototype.addFile = function (file) {
        assertVar(file, DefVersion, 'file');
        var def;
        if (this._installed.has(file.def.path)) {
            def = this._installed.get(file.def.path);
        }
        else {
            def = new InstalledDef(file.def.path);
        }
        def.update(file);
        this._installed.set(file.def.path, def);
    };
    Config.prototype.hasFile = function (filePath) {
        assertVar(filePath, 'string', 'filePath');
        return this._installed.has(filePath);
    };
    Config.prototype.getFile = function (filePath) {
        assertVar(filePath, 'string', 'filePath');
        return this._installed.get(filePath);
    };
    Config.prototype.removeFile = function (filePath) {
        assertVar(filePath, 'string', 'filePath');
        this._installed.delete(filePath);
    };
    Config.prototype.getInstalled = function () {
        return this._installed.values();
    };
    Config.prototype.getInstalledPaths = function () {
        return this._installed.values().map(function (value) {
            return value.path;
        });
    };
    Config.prototype.getInstalledAsDefVersionList = function () {
        var defs = [];
        this.getInstalled().forEach(function (installed) {
            defs.push(new DefVersion(new Def(installed.path), new DefCommit(installed.commitSha)));
        });
        return defs;
    };
    Config.prototype.toJSON = function () {
        var json = this.otherFields;
        json.version = this.version;
        json.repo = this.repo;
        json.ref = this.ref;
        json.path = this.path;
        if (this.bundle) {
            json.bundle = this.bundle;
        }
        if (this.stats !== Const.statsDefault) {
            json.stats = this.stats;
        }
        json.installed = {};
        this._installed.forEach(function (file) {
            json.installed[file.path] = {
                commit: file.commitSha
            };
        });
        this.validateJSON(json);
        return json;
    };
    Config.prototype.toJSONString = function () {
        return this._stable.toJSONString(this.toJSON(), false);
    };
    Config.prototype.parseJSONString = function (input, label) {
        if (label === void 0) { label = null; }
        assertVar(input, 'string', 'input');
        this.parseJSON(this._stable.parseString(input), label);
    };
    Config.prototype.parseJSON = function (json, label) {
        var _this = this;
        if (label === void 0) { label = null; }
        assertVar(json, 'object', 'json');
        this.validateJSON(json, label);
        this._installed.clear();
        this.path = json.path;
        this.version = json.version;
        this.repo = json.repo;
        this.ref = json.ref;
        this.bundle = json.bundle;
        this.stats = (typeOf.isBoolean(json.stats) ? json.stats : Const.statsDefault);
        if (json.installed) {
            Object.keys(json.installed).forEach(function (filePath) {
                var data = json.installed[filePath];
                var installed = new InstalledDef(filePath);
                installed.commitSha = data.commit;
                _this._installed.set(filePath, installed);
            });
        }
        var reservedFields = ['path', 'version', 'repo', 'ref', 'bundle', 'stats', 'installed'];
        var otherFieldKeys = Object.keys(json).filter(function (key) { return reservedFields.indexOf(key) === -1; });
        this.otherFields = otherFieldKeys.reduce(function (fields, key) {
            fields[key] = json[key];
            return fields;
        }, {});
    };
    Config.prototype.validateJSON = function (json, label) {
        if (label === void 0) { label = null; }
        Joi.assert(json, tsdSchema);
        return json;
    };
    return Config;
})();
module.exports = Config;
