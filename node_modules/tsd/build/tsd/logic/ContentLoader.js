'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Promise = require('bluebird');
var LRU = require('lru-cache');
var VError = require('verror');
var DefBlob = require('../data/DefBlob');
var defUtil = require('../util/defUtil');
var gitUtil = require('../../git/gitUtil');
var CoreModule = require('./CoreModule');
var ContentLoader = (function (_super) {
    __extends(ContentLoader, _super);
    function ContentLoader(core) {
        _super.call(this, core, 'ContentLoader');
        this.cache = LRU({
            stale: true,
            max: 10 * 1024 * 1024,
            maxAge: 1000 * 60,
            length: function (buffer) {
                return buffer.length;
            }
        });
    }
    ContentLoader.prototype.loadCommitMetaData = function (commit) {
        if (commit.hasMetaData()) {
            return Promise.resolve(commit);
        }
        return this.core.repo.api.getCommit(commit.commitSha).then(function (json) {
            commit.parseJSON(json);
            return commit;
        });
    };
    ContentLoader.prototype.loadContent = function (file, tryHead) {
        var _this = this;
        if (tryHead === void 0) { tryHead = true; }
        if (file.blobSha && this.cache.has(file.blobSha)) {
            return Promise.resolve(new DefBlob(file, this.cache.get(file.blobSha)));
        }
        var ref = file.commit.commitSha;
        if (tryHead && file.def.head && file.commit.commitSha === file.def.head.commit.commitSha) {
            ref = this.core.context.config.ref;
        }
        return this.core.repo.raw.getBinary(ref, file.def.path).then(function (content) {
            var sha = gitUtil.blobShaHex(content);
            if (file.blobSha) {
                if (sha !== file.blobSha) {
                    throw new VError('bad blob sha1 for %s, expected %s, got %s', file.def.path, file.blobSha, sha);
                }
            }
            else {
                file.setBlob(sha);
            }
            _this.cache.set(sha, content);
            return new DefBlob(file, content);
        });
    };
    ContentLoader.prototype.loadContentBulk = function (list) {
        var _this = this;
        return Promise.map(list, function (file) {
            return _this.loadContent(file);
        });
    };
    ContentLoader.prototype.loadHistory = function (def) {
        if (def.history.length > 0) {
            return Promise.resolve(def);
        }
        return Promise.all([
            this.core.index.getIndex(),
            this.core.repo.api.getPathCommits(def.path)
        ]).spread(function (index, content) {
            index.setHistory(def, content);
        }).return(def);
    };
    ContentLoader.prototype.loadHistoryBulk = function (list) {
        var _this = this;
        list = defUtil.uniqueDefs(list);
        return Promise.map(list, function (file) {
            return _this.loadHistory(file);
        });
    };
    return ContentLoader;
})(CoreModule);
module.exports = ContentLoader;
