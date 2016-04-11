'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VError = require('verror');
var defUtil = require('../util/defUtil');
var Selection = require('../select/Selection');
var VersionMatcher = require('../select/VersionMatcher');
var CoreModule = require('./CoreModule');
var SelectorQuery = (function (_super) {
    __extends(SelectorQuery, _super);
    function SelectorQuery(core) {
        _super.call(this, core, 'Select');
    }
    SelectorQuery.prototype.select = function (query, options) {
        var _this = this;
        var res = new Selection(query);
        return this.core.index.getIndex().then(function (index) {
            res.definitions = query.patterns.reduce(function (memo, names) {
                names.filter(index.list).forEach(function (def) {
                    if (!defUtil.containsDef(memo, def)) {
                        memo.push(def);
                    }
                });
                return memo;
            }, []);
            if (query.versionMatcher) {
                res.definitions = query.versionMatcher.filter(res.definitions);
            }
            else {
                res.definitions = new VersionMatcher().filter(res.definitions);
            }
            res.selection = defUtil.getHeads(res.definitions);
            if (options.minMatches > 0 && res.definitions.length < options.minMatches) {
                throw new VError('expected more matches %s < %s', res.definitions.length, options.minMatches);
            }
            if (options.maxMatches > 0 && res.definitions.length > options.maxMatches) {
                throw new VError('expected less matches %s > %s', res.definitions.length, options.maxMatches);
            }
        }).then(function () {
            if (query.requiresHistory) {
                if (options.limitApi > 0 && res.definitions.length > options.limitApi) {
                    throw new VError('match count %s over api limit %s', res.definitions.length, options.limitApi);
                }
                return _this.core.content.loadHistoryBulk(res.definitions).then(function () {
                    if (query.commitMatcher) {
                        res.selection = [];
                        res.definitions.forEach(function (def) {
                            def.history = query.commitMatcher.filter(def.history);
                            if (def.history.length > 0) {
                                res.selection.push(defUtil.getLatest(def.history));
                            }
                        });
                        res.definitions = defUtil.getDefs(res.selection);
                    }
                    if (query.dateMatcher) {
                        res.selection = [];
                        res.definitions.forEach(function (def) {
                            def.history = query.dateMatcher.filter(def.history);
                            if (def.history.length > 0) {
                                res.selection.push(defUtil.getLatest(def.history));
                            }
                        });
                        res.definitions = defUtil.getDefs(res.selection);
                    }
                });
            }
            return null;
        }).then(function () {
            if (query.parseInfo || query.infoMatcher) {
                return _this.core.parser.parseDefInfoBulk(res.selection);
            }
            return null;
        }).then(function () {
            if (query.infoMatcher) {
                res.selection = query.infoMatcher.filter(res.selection);
                res.definitions = defUtil.getDefs(res.selection);
            }
        }).then(function () {
            if (options.resolveDependencies) {
                return _this.core.resolver.resolveBulk(res.selection);
            }
            return null;
        }).return(res);
    };
    return SelectorQuery;
})(CoreModule);
module.exports = SelectorQuery;
