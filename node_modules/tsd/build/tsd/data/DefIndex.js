'use strict';
var pointer = require('json-pointer');
var Lazy = require('lazy.js');
var VError = require('verror');
var assertVar = require('../../xm/assertVar');
var collection = require('../../xm/collection');
var Def = require('./Def');
var DefCommit = require('./DefCommit');
var DefVersion = require('./DefVersion');
var commit_sha = '/commit/sha';
var branch_tree_sha = '/commit/commit/tree/sha';
var DefIndex = (function () {
    function DefIndex() {
        this._branchName = null;
        this._hasIndex = false;
        this._indexCommit = null;
        this._definitions = new collection.Hash();
        this._commits = new collection.Hash();
        this._versions = new collection.Hash();
    }
    DefIndex.prototype.hasIndex = function () {
        return this._hasIndex;
    };
    DefIndex.prototype.init = function (branch, tree) {
        var _this = this;
        assertVar(branch, 'object', 'branch');
        assertVar(tree, 'object', 'tree');
        if (this._hasIndex) {
            return;
        }
        this._commits.clear();
        this._versions.clear();
        this._definitions.clear();
        assertVar(branch, 'object', 'branch');
        assertVar(tree, 'object', 'tree');
        var commitSha = pointer.get(branch, commit_sha);
        var treeSha = tree.sha;
        var sha = pointer.get(branch, branch_tree_sha);
        assertVar(sha, 'string', 'sha');
        assertVar(treeSha, 'string', 'treeSha');
        assertVar(commitSha, 'string', 'commitSha');
        if (sha !== treeSha) {
            throw new VError('branch and tree sha mismatch');
        }
        this._branchName = branch.name;
        this._indexCommit = this.procureCommit(commitSha);
        this._indexCommit.parseJSON(branch.commit);
        var def;
        var file;
        var releases = [];
        Lazy(tree.tree).each(function (elem) {
            var char = elem.path.charAt(0);
            if (elem.type === 'blob' && char !== '.' && Def.isDefPath(elem.path)) {
                def = _this.procureDef(elem.path);
                if (!def) {
                    return;
                }
                file = _this.procureVersion(def, _this._indexCommit);
                if (!file) {
                    return;
                }
                def.head = file;
                file.setBlob(elem.sha);
                if (def.isLegacy) {
                    releases.push(def);
                }
            }
        });
        var defs = this._definitions.values();
        releases.forEach(function (legacy) {
            defs.some(function (def) {
                if (def.project === legacy.project && def.name === legacy.name && def.isLegacy === false) {
                    def.releases.push(legacy);
                    return true;
                }
            });
        });
        this._hasIndex = true;
    };
    DefIndex.prototype.setHistory = function (def, commitJsonArray) {
        var _this = this;
        assertVar(def, Def, 'def');
        assertVar(commitJsonArray, 'array', 'commits');
        def.history = [];
        Lazy(commitJsonArray).each(function (json) {
            if (!json || !json.sha) {
                console.dir(json, 'weird: json no sha', 1);
            }
            var commit = _this.procureCommit(json.sha);
            if (!commit) {
                console.dir('weird: no commit for sha ' + json.sha);
                throw new VError('huh?');
            }
            if (!commit.hasMeta) {
                commit.parseJSON(json);
            }
            def.history.push(_this.procureVersion(def, commit));
        });
    };
    DefIndex.prototype.procureCommit = function (commitSha) {
        assertVar(commitSha, 'sha1', 'commitSha');
        var commit;
        if (this._commits.has(commitSha)) {
            commit = this._commits.get(commitSha);
        }
        else {
            commit = new DefCommit(commitSha);
            this._commits.set(commitSha, commit);
        }
        return commit;
    };
    DefIndex.prototype.procureDef = function (path) {
        assertVar(path, 'string', 'path');
        var def = null;
        if (this._definitions.has(path)) {
            def = this._definitions.get(path);
        }
        else {
            def = new Def(path);
            if (!def) {
                throw new VError('cannot parse path to def %s', path);
            }
            this._definitions.set(path, def);
        }
        return def;
    };
    DefIndex.prototype.procureVersion = function (def, commit) {
        assertVar(def, Def, 'def');
        assertVar(commit, DefCommit, 'commit');
        var file;
        var key = def.path + '|' + commit.commitSha;
        if (this._versions.has(key)) {
            file = this._versions.get(key);
            if (file.def !== def) {
                throw new VError('weird: internal data mismatch: version does not belong to file %s -> %s', file.def, commit);
            }
        }
        else {
            file = new DefVersion(def, commit);
            this._versions.set(key, file);
        }
        return file;
    };
    DefIndex.prototype.procureVersionFromSha = function (path, commitSha) {
        assertVar(path, 'string', 'path');
        assertVar(commitSha, 'sha1', 'commitSha');
        var def = this.getDef(path);
        if (!def) {
            console.log('path not in index, attempt-adding: ' + path);
            def = this.procureDef(path);
        }
        if (!def) {
            throw new VError('cannot procure definition for %s', path);
        }
        var commit = this.procureCommit(commitSha);
        if (!commit) {
            throw new VError('cannot procure commit for %s -> %s', path, commitSha);
        }
        if (!commit.hasMetaData()) {
        }
        var file = this.procureVersion(def, commit);
        if (!file) {
            throw new VError('cannot procure definition version for %s -> %s', path, commit.commitSha);
        }
        return file;
    };
    DefIndex.prototype.getDef = function (path) {
        return this._definitions.get(path);
    };
    DefIndex.prototype.hasDef = function (path) {
        return this._definitions.has(path);
    };
    DefIndex.prototype.getCommit = function (sha) {
        return this._commits.get(sha);
    };
    DefIndex.prototype.hasCommit = function (sha) {
        return this._commits.has(sha);
    };
    DefIndex.prototype.getPaths = function () {
        return this._definitions.values().map(function (file) {
            return file.path;
        });
    };
    DefIndex.prototype.toDump = function () {
        var ret = [];
        ret.push(this.toString());
        this._definitions.forEach(function (def) {
            ret.push('  ' + def.toString());
        });
        return ret.join('\n') + '\n' + 'total ' + this._definitions.size + ' definitions';
    };
    Object.defineProperty(DefIndex.prototype, "branchName", {
        get: function () {
            return this._branchName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DefIndex.prototype, "list", {
        get: function () {
            return this._definitions.values();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DefIndex.prototype, "indexCommit", {
        get: function () {
            return this._indexCommit;
        },
        enumerable: true,
        configurable: true
    });
    DefIndex.prototype.toString = function () {
        return '[' + this._branchName + ']';
    };
    return DefIndex;
})();
module.exports = DefIndex;
