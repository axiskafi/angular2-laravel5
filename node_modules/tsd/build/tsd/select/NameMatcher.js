'use strict';
var VError = require('verror');
var minimatch = require('minimatch');
var assertVar = require('../../xm/assertVar');
var NameMatcher = (function () {
    function NameMatcher(pattern) {
        assertVar(pattern, 'string', 'pattern');
        this.pattern = pattern;
    }
    NameMatcher.prototype.filter = function (list) {
        return list.filter(this.getFilterFunc());
    };
    NameMatcher.prototype.toString = function () {
        return this.pattern;
    };
    NameMatcher.prototype.getFilterFunc = function () {
        if (!this.pattern) {
            throw (new VError('NameMatcher undefined pattern'));
        }
        var parts = this.pattern.split(/\//g);
        var projectPattern;
        var namePattern;
        var miniopts = {
            nocase: true
        };
        if (parts.length === 1) {
            if (parts[0].length > 0 && parts[0] !== '*') {
                namePattern = minimatch.filter(parts[0], miniopts);
            }
        }
        else {
            if (parts[0].length > 0 && parts[0] !== '*') {
                projectPattern = minimatch.filter(parts[0], miniopts);
            }
            if (parts[1].length > 0 && parts[1] !== '*') {
                namePattern = minimatch.filter(parts.slice(1).join(':'), miniopts);
            }
        }
        if (namePattern) {
            if (projectPattern) {
                return function (file) {
                    return projectPattern(file.project) && namePattern(file.name);
                };
            }
            else {
                return function (file) {
                    return namePattern(file.name);
                };
            }
        }
        else if (projectPattern) {
            return function (file) {
                return projectPattern(file.project);
            };
        }
        else {
            return function (file) {
                return true;
            };
        }
    };
    return NameMatcher;
})();
module.exports = NameMatcher;
