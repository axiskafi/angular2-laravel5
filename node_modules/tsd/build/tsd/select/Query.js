'use strict';
var assertVar = require('../../xm/assertVar');
var NameMatcher = require('./NameMatcher');
var VersionMatcher = require('./VersionMatcher');
var Query = (function () {
    function Query(pattern) {
        this.patterns = [];
        this.parseInfo = false;
        this.loadHistory = false;
        assertVar(pattern, 'string', 'pattern', true);
        if (pattern) {
            this.patterns.push(new NameMatcher(pattern));
        }
    }
    Query.prototype.addNamePattern = function (pattern) {
        assertVar(pattern, 'string', 'pattern');
        this.patterns.push(new NameMatcher(pattern));
    };
    Query.prototype.setVersionRange = function (range) {
        assertVar(range, 'string', 'range');
        this.versionMatcher = new VersionMatcher(range);
    };
    Object.defineProperty(Query.prototype, "requiresHistory", {
        get: function () {
            return !!(this.dateMatcher || this.commitMatcher || this.loadHistory);
        },
        enumerable: true,
        configurable: true
    });
    Query.prototype.toString = function () {
        return this.patterns.map(function (matcher) {
            return matcher.pattern;
        }).join(', ');
    };
    return Query;
})();
module.exports = Query;
