'use strict';
var typeOf = require('../../xm/typeOf');
var assert = require('../../xm/assert');
var assertVar = require('../../xm/assertVar');
var dateUtils = require('../../xm/dateUtils');
var DateComp = require('../util/DateComp');
var defUtil = require('../util/defUtil');
var termExp = /(>=?|<=?|==) *(\d+[\d:;_ \-]+\d)/g;
var comparators = {
    '<=': function lte(date1, date2) {
        return dateUtils.isBeforeDate(date1, date2) || dateUtils.isEqualDate(date1, date2);
    },
    '<': dateUtils.isBeforeDate,
    '>=': function gte(date1, date2) {
        return dateUtils.isAfterDate(date1, date2) || dateUtils.isEqualDate(date1, date2);
    },
    '>': dateUtils.isAfterDate,
    '==': dateUtils.isEqualDate
};
var DateMatcher = (function () {
    function DateMatcher(pattern) {
        this.comparators = [];
        if (pattern) {
            this.extractSelector(pattern);
        }
    }
    DateMatcher.prototype.filter = function (list) {
        if (this.comparators.length === 0) {
            return list;
        }
        return list.filter(this.getFilterFunc());
    };
    DateMatcher.prototype.best = function (list) {
        return this.latest(this.filter(list));
    };
    DateMatcher.prototype.latest = function (list) {
        if (this.comparators.length > 0) {
            var list = this.filter(list).sort(defUtil.fileCommitCompare);
            if (list.length > 0) {
                return list[list.length - 1];
            }
        }
        return null;
    };
    DateMatcher.prototype.extractSelector = function (pattern) {
        assertVar(pattern, 'string', 'pattern');
        this.comparators = [];
        if (!pattern) {
            return;
        }
        termExp.lastIndex = 0;
        var match;
        while ((match = termExp.exec(pattern))) {
            termExp.lastIndex = match.index + match[0].length;
            assert(typeOf.hasOwnProp(comparators, match[1]), 'not a valid date comparator in filter {a}', match[0]);
            var comp = new DateComp();
            comp.date = new Date(match[2].replace(/;_/g, ' '));
            assert(!!comp.date, 'not a valid date in filter {a}', match[0]);
            comp.operator = match[1];
            comp.comparator = comparators[match[1]];
            this.comparators.push(comp);
        }
    };
    DateMatcher.prototype.getFilterFunc = function () {
        var _this = this;
        var len = this.comparators.length;
        return function (file) {
            var date = file.commit.changeDate;
            if (!date) {
                return false;
            }
            for (var i = 0; i < len; i++) {
                if (!_this.comparators[i].satisfies(date)) {
                    return false;
                }
            }
            return true;
        };
    };
    return DateMatcher;
})();
module.exports = DateMatcher;
