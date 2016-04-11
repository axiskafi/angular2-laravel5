'use strict';
var semver = require('semver');
var assert = require('../../xm/assert');
var intMax = 900719925474;
var semverMax = 'v' + intMax + '.' + intMax + '.' + intMax;
var semverMin = 'v' + 0 + '.' + 0 + '.' + 0;
var VersionMatcher = (function () {
    function VersionMatcher(range) {
        if (range === VersionMatcher.latest || range === VersionMatcher.all) {
            this.range = range;
        }
        else if (range) {
            this.range = semver.validRange(range, true);
            assert(!!this.range, 'expected {a} to be a valid semver-range', range);
        }
        else {
            this.range = VersionMatcher.latest;
        }
    }
    VersionMatcher.prototype.filter = function (list) {
        var _this = this;
        if (!this.range || this.range === VersionMatcher.all) {
            return list.slice(0);
        }
        var map = list.reduce(function (map, def) {
            var id = def.project + '/' + def.name;
            if (id in map) {
                map[id].push(def);
            }
            else {
                map[id] = [def];
            }
            return map;
        }, Object.create(null));
        if (this.range === VersionMatcher.latest) {
            return Object.keys(map).map(function (key) {
                return _this.getLatest(map[key]);
            });
        }
        return Object.keys(map).reduce(function (memo, key) {
            map[key].forEach(function (def) {
                if (!def.semver) {
                    if (semver.satisfies(semverMax, _this.range)) {
                        memo.push(def);
                    }
                }
                else if (semver.satisfies(def.semver, _this.range)) {
                    memo.push(def);
                }
            });
            return memo;
        }, []);
    };
    VersionMatcher.prototype.getLatest = function (list) {
        var latest;
        for (var i = 0, ii = list.length; i < ii; i++) {
            var def = list[i];
            if (!def.semver) {
                return def;
            }
            else if (!latest) {
                latest = def;
            }
            else if (semver.gt(def.semver, latest.semver)) {
                latest = def;
            }
        }
        return latest;
    };
    VersionMatcher.latest = 'latest';
    VersionMatcher.all = 'all';
    return VersionMatcher;
})();
module.exports = VersionMatcher;
