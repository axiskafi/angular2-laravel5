'use strict';
var assert = require('../../xm/assert');
var fullSha = /^[0-9a-f]{40}$/;
var hex = /^[0-9a-f]+$/;
var CommitMatcher = (function () {
    function CommitMatcher(commitSha) {
        this.minimumShaLen = 2;
        if (commitSha) {
            this.commitSha = String(commitSha).toLowerCase();
        }
    }
    CommitMatcher.prototype.filter = function (list) {
        if (!this.commitSha) {
            return list;
        }
        return list.filter(this.getFilterFunc(this.commitSha));
    };
    CommitMatcher.prototype.getFilterFunc = function (commitSha) {
        if (fullSha.test(commitSha)) {
            return function (file) {
                return (file.commit && file.commit.commitSha === commitSha);
            };
        }
        assert(hex.test(commitSha), 'parameter not a hex {a}', commitSha);
        var len = commitSha.length;
        assert((len >= this.minimumShaLen), 'parameter hex too short: expected {e}, got {a}', this.minimumShaLen, len);
        return function (file) {
            return (file.commit && file.commit.commitSha.substr(0, len) === commitSha);
        };
    };
    return CommitMatcher;
})();
module.exports = CommitMatcher;
