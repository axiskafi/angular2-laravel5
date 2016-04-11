'use strict';
var assert = require('../../xm/assert');
var assertVar = require('../../xm/assertVar');
var objectUtils = require('../../xm/objectUtils');
var GithubUser = require('../../git/model/GithubUser');
var GitCommitUser = require('../../git/model/GitCommitUser');
var GitCommitMessage = require('../../git/model/GitCommitMessage');
var defUtil = require('../util/defUtil');
var DefCommit = (function () {
    function DefCommit(commitSha) {
        this.hasMeta = false;
        this.message = new GitCommitMessage();
        assertVar(commitSha, 'sha1', 'commitSha');
        this.commitSha = commitSha;
        objectUtils.lockProps(this, ['commitSha']);
    }
    DefCommit.prototype.parseJSON = function (commit) {
        assertVar(commit, 'object', 'commit');
        assert((commit.sha === this.commitSha), 'not my tree: {act}, {exp}', this.commitSha, commit.sha);
        this.hubAuthor = GithubUser.fromJSON(commit.author);
        this.hubCommitter = GithubUser.fromJSON(commit.committer);
        this.gitAuthor = GitCommitUser.fromJSON(commit.commit.author);
        this.gitCommitter = GitCommitUser.fromJSON(commit.commit.committer);
        this.message.parse(commit.commit.message);
        this.hasMeta = true;
    };
    DefCommit.prototype.hasMetaData = function () {
        return this.hasMeta;
    };
    DefCommit.prototype.toString = function () {
        return this.commitSha;
    };
    Object.defineProperty(DefCommit.prototype, "changeDate", {
        get: function () {
            if (this.gitAuthor) {
                return this.gitAuthor.date;
            }
            if (this.gitCommitter) {
                return this.gitCommitter.date;
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DefCommit.prototype, "commitShort", {
        get: function () {
            return this.commitSha ? defUtil.shaShort(this.commitSha) : '<no sha>';
        },
        enumerable: true,
        configurable: true
    });
    return DefCommit;
})();
module.exports = DefCommit;
