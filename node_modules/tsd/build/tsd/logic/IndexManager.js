'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var pointer = require('json-pointer');
var VError = require('verror');
var Promise = require('bluebird');
var CoreModule = require('./CoreModule');
var DefIndex = require('../data/DefIndex');
var branch_tree = '/commit/commit/tree/sha';
var IndexManager = (function (_super) {
    __extends(IndexManager, _super);
    function IndexManager(core) {
        _super.call(this, core, 'IndexManager');
        this._promise = null;
    }
    IndexManager.prototype.getIndex = function () {
        var _this = this;
        if (this._promise) {
            return this._promise;
        }
        return this._promise = this.core.repo.api.getBranch(this.core.context.config.ref).then(function (branchData) {
            if (!branchData) {
                throw new VError('loaded empty branch data');
            }
            var sha = pointer.get(branchData, branch_tree);
            if (!sha) {
                throw new VError('missing sha');
            }
            return _this.core.repo.api.getTree(sha, true).then(function (data) {
                var index = new DefIndex();
                index.init(branchData, data);
                return index;
            });
        });
    };
    IndexManager.prototype.procureDef = function (path) {
        return this.getIndex().then(function (index) {
            var def = index.procureDef(path);
            if (!def) {
                throw new VError('cannot get def for path %s', path);
            }
            return def;
        });
    };
    IndexManager.prototype.procureFile = function (path, commitSha) {
        return this.getIndex().then(function (index) {
            var file = index.procureVersionFromSha(path, commitSha);
            if (!file) {
                throw new VError('cannot get file for path %s', path);
            }
            return file;
        });
    };
    IndexManager.prototype.procureCommit = function (commitSha) {
        return this.getIndex().then(function (index) {
            var commit = index.procureCommit(commitSha);
            if (!commit) {
                throw new VError('cannot commit def for commitSha %s', commitSha);
            }
            return commit;
        });
    };
    IndexManager.prototype.findFile = function (path, commitShaFragment) {
        return Promise.reject(new Error('implement me!'));
    };
    return IndexManager;
})(CoreModule);
module.exports = IndexManager;
