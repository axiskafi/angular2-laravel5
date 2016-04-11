'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var assertVar = require('../xm/assertVar');
var URLManager = require('../xm/lib/URLManager');
var GithubURLs = (function (_super) {
    __extends(GithubURLs, _super);
    function GithubURLs(repo) {
        _super.call(this);
        this._base = 'https://github.com/{owner}/{project}';
        this._apiBase = 'https://api.github.com';
        this._api = 'https://api.github.com/repos/{owner}/{project}';
        this._raw = 'https://raw.githubusercontent.com/{owner}/{project}';
        assertVar(repo, 'object', 'repo');
        this._repo = repo;
        this.addTemplate('base', this._base);
        this.addTemplate('raw', this._raw);
        this.addTemplate('rawFile', this._raw + '/{+ref}/{+path}');
        this.addTemplate('htmlFile', this._base + '/blob/{ref}/{+path}');
        this.addTemplate('api', this._api);
        this.addTemplate('apiTree', this._api + '/git/trees/{tree}?recursive={recursive}');
        this.addTemplate('apiBranch', this._api + '/branches/{branch}');
        this.addTemplate('apiBranches', this._api + '/branches');
        this.addTemplate('apiCommit', this._api + '/commits/{commit}');
        this.addTemplate('apiPathCommits', this._api + '/commits?path={path}');
        this.addTemplate('apiBlob', this._api + '/git/blobs/{blob}');
        this.addTemplate('rateLimit', this._apiBase + '/rate_limit');
    }
    GithubURLs.prototype.getURL = function (id, vars) {
        this.setVars({
            owner: this._repo.config.repoOwner,
            project: this._repo.config.repoProject
        });
        return _super.prototype.getURL.call(this, id, vars);
    };
    GithubURLs.prototype.api = function () {
        return this.getURL('api');
    };
    GithubURLs.prototype.base = function () {
        return this.getURL('base');
    };
    GithubURLs.prototype.raw = function () {
        return this.getURL('raw');
    };
    GithubURLs.prototype.rawFile = function (ref, path) {
        assertVar(ref, 'string', 'ref');
        assertVar(path, 'string', 'path');
        return this.getURL('rawFile', {
            ref: ref,
            path: path
        });
    };
    GithubURLs.prototype.htmlFile = function (ref, path) {
        assertVar(ref, 'string', 'ref');
        assertVar(path, 'string', 'path');
        return this.getURL('htmlFile', {
            ref: ref,
            path: path
        });
    };
    GithubURLs.prototype.apiBranches = function () {
        return this.getURL('apiBranches');
    };
    GithubURLs.prototype.apiBranch = function (name) {
        assertVar(name, 'string', 'name');
        return this.getURL('apiBranch', {
            branch: name
        });
    };
    GithubURLs.prototype.apiTree = function (tree, recursive) {
        assertVar(tree, 'sha1', 'tree');
        return this.getURL('apiTree', {
            tree: tree,
            recursive: (recursive ? 1 : 0)
        });
    };
    GithubURLs.prototype.apiPathCommits = function (path) {
        assertVar(path, 'string', 'path');
        return this.getURL('apiPathCommits', {
            path: path
        });
    };
    GithubURLs.prototype.apiCommit = function (commit, recursive) {
        assertVar(commit, 'sha1', 'commit');
        return this.getURL('apiCommit', {
            commit: commit,
            recursive: recursive
        });
    };
    GithubURLs.prototype.apiBlob = function (sha) {
        assertVar(sha, 'sha1', 'sha');
        return this.getURL('apiBlob', {
            blob: sha
        });
    };
    GithubURLs.prototype.rateLimit = function () {
        return this.getURL('rateLimit');
    };
    return GithubURLs;
})(URLManager);
module.exports = GithubURLs;
