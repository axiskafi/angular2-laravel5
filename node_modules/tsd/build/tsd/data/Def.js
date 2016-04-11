'use strict';
var semver = require('semver');
var VError = require('verror');
var assertVar = require('../../xm/assertVar');
var objectUtils = require('../../xm/objectUtils');
var defExp = /^[a-z_](?:[\._-]?[a-z0-9_])*(?:\/[a-z_](?:[\._-]?[a-z0-9_])*)+\.d\.ts$/i;
var versionEnd = /(?:-v?)(\d+(?:\.\d+)*)(-[a-z](?:[_-]?[a-z0-9])*(?:\.\d+)*)?$/i;
var twoNums = /^\d+\.\d+$/;
var lockProps = [
    'path',
    'project',
    'name',
    'semver',
    'label',
    'isLegacy',
    'isMain',
];
var legacyFolders = [
    'legacy',
    'releases'
];
var Def = (function () {
    function Def(path) {
        this.path = null;
        this.project = null;
        this.name = null;
        this.semver = null;
        this.label = null;
        this.isLegacy = false;
        this.isMain = true;
        this.head = null;
        this.history = [];
        this.releases = [];
        assertVar(path, 'string', 'path');
        if (!defExp.test(path)) {
            throw new VError('cannot part path %s to Def', path);
        }
        this.path = path;
        var parts = this.path.replace(/\.d\.ts$/, '').split(/\//g);
        this.project = parts[0];
        this.name = parts.slice(1).join(':');
        this.isMain = (parts.length === 2);
        this.isLegacy = false;
        if (parts.length > 2 && legacyFolders.indexOf(parts[1]) > -1) {
            this.isLegacy = true;
            this.name = parts.slice(2).join(':');
            this.isMain = (parts.length === 3);
        }
        versionEnd.lastIndex = 0;
        var semMatch = versionEnd.exec(this.name);
        if (semMatch) {
            var sem = semMatch[1];
            if (twoNums.test(sem)) {
                sem += '.0';
            }
            if (semMatch.length > 2 && typeof semMatch[2] !== 'undefined') {
                sem += semMatch[2];
            }
            var valid = semver.valid(sem, true);
            if (valid) {
                this.semver = valid;
                this.isLegacy = true;
                this.name = this.name.substr(0, semMatch.index);
            }
            else {
            }
        }
        this.label = this.project + '/' + this.name + (this.semver ? '-v' + this.semver : '');
        objectUtils.lockProps(this, lockProps);
    }
    Def.prototype.toString = function () {
        return this.path;
    };
    Object.defineProperty(Def.prototype, "pathTerm", {
        get: function () {
            return this.path.replace(/\.d\.ts$/, '');
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Def.prototype, "nameTerm", {
        get: function () {
            return this.name + (this.semver ? '-v' + this.semver : '');
        },
        enumerable: true,
        configurable: true
    });
    Def.isDefPath = function (path) {
        return defExp.test(path);
    };
    Def.getFrom = function (path) {
        if (!defExp.test(path)) {
            return null;
        }
        return new Def(path);
    };
    return Def;
})();
module.exports = Def;
