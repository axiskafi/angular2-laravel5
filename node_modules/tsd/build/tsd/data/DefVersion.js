'use strict';
var VError = require('verror');
var assertVar = require('../../xm/assertVar');
var objectUtils = require('../../xm/objectUtils');
var defUtil = require('../util/defUtil');
var Def = require('./Def');
var DefCommit = require('./DefCommit');
var DefVersion = (function () {
    function DefVersion(def, commit) {
        this.def = null;
        this.commit = null;
        this._blobSha = null;
        this.dependencies = [];
        this.solved = false;
        this.info = null;
        assertVar(def, Def, 'def');
        assertVar(commit, DefCommit, 'commit');
        this.def = def;
        this.commit = commit;
        objectUtils.lockProps(this, ['def', 'commit']);
    }
    DefVersion.prototype.setBlob = function (sha) {
        assertVar(sha, 'sha1', 'blob');
        if (this._blobSha && this._blobSha !== sha) {
            throw new VError('already got a blob but %s != %s', this._blobSha, sha);
        }
        this._blobSha = sha;
    };
    Object.defineProperty(DefVersion.prototype, "key", {
        get: function () {
            if (!this.def || !this.commit) {
                return null;
            }
            return this.def.path + '-' + this.commit.commitSha;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DefVersion.prototype, "blobSha", {
        get: function () {
            return this._blobSha;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DefVersion.prototype, "blobShaShort", {
        get: function () {
            return this._blobSha ? defUtil.shaShort(this._blobSha) : '<no sha>';
        },
        enumerable: true,
        configurable: true
    });
    DefVersion.prototype.toString = function () {
        var str = '';
        str += (this.def ? this.def.path : '<no def>');
        str += ' : ' + (this.commit ? this.commit.commitShort : '<no commit>');
        str += ' : ' + (this._blobSha ? this.blobShaShort : '<no blob>');
        return str;
    };
    return DefVersion;
})();
module.exports = DefVersion;
