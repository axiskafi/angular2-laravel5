'use strict';
var StatCounter = (function () {
    function StatCounter() {
        this.stats = Object.create(null);
    }
    StatCounter.prototype.count = function (id, label) {
        var value = (id in this.stats ? this.stats[id] + 1 : 1);
        this.stats[id] = value;
        return value;
    };
    StatCounter.prototype.get = function (id) {
        if (id in this.stats) {
            return this.stats[id];
        }
        return 0;
    };
    StatCounter.prototype.has = function (id) {
        return (id in this.stats);
    };
    StatCounter.prototype.zero = function () {
        var _this = this;
        Object.keys(this.stats).forEach(function (id) {
            _this.stats[id] = 0;
        });
    };
    StatCounter.prototype.total = function () {
        var _this = this;
        return Object.keys(this.stats).reduce(function (memo, id) {
            return memo + _this.stats[id];
        }, 0);
    };
    StatCounter.prototype.counterNames = function () {
        return Object.keys(this.stats);
    };
    StatCounter.prototype.hasAllZero = function () {
        var _this = this;
        return !Object.keys(this.stats).some(function (id) {
            return _this.stats[id] !== 0;
        });
    };
    StatCounter.prototype.clear = function () {
        this.stats = Object.create(null);
    };
    StatCounter.prototype.getReport = function (label) {
        var _this = this;
        return (label ? label + ':\n' : '') + Object.keys(this.stats).sort().reduce(function (memo, id) {
            memo.push(id + ': ' + _this.stats[id]);
            return memo;
        }, []).join('\n');
    };
    StatCounter.prototype.getObject = function () {
        var _this = this;
        return Object.keys(this.stats).sort().reduce(function (memo, id) {
            memo[id] = _this.stats[id];
            return memo;
        }, Object.create(null));
    };
    return StatCounter;
})();
module.exports = StatCounter;
