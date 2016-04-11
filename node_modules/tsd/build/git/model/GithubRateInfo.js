'use strict';
var typeOf = require('../../xm/typeOf');
function pad(input) {
    var r = String(input);
    if (r.length === 1) {
        r = '0' + r;
    }
    return r;
}
var GithubRateInfo = (function () {
    function GithubRateInfo(map) {
        this.limit = 0;
        this.remaining = 0;
        this.resetAt = '';
        this.readFromRes(map);
    }
    GithubRateInfo.prototype.readFromRes = function (map) {
        if (typeOf.isObject(map)) {
            if (map['x-ratelimit-limit']) {
                this.limit = parseInt(map['x-ratelimit-limit'], 10);
            }
            if (map['x-ratelimit-remaining']) {
                this.remaining = parseInt(map['x-ratelimit-remaining'], 10);
            }
            if (map['x-ratelimit-reset']) {
                this.reset = parseInt(map['x-ratelimit-reset'], 10) * 1000;
            }
        }
        this.lastUpdate = Date.now();
        this.resetAt = this.getResetString();
    };
    GithubRateInfo.prototype.toString = function () {
        return this.remaining + ' of ' + this.limit + (this.remaining < this.limit ? ' @ ' + this.getResetString() : '');
    };
    GithubRateInfo.prototype.getResetString = function () {
        var time = this.getTimeToReset();
        if (time > 0) {
            time = time / 1000;
            var hours = Math.floor(time / 3600);
            time -= (hours * 3600);
            var mins = Math.floor(time / 60);
            var secs = Math.floor(time - (mins * 60));
            return (hours) + ':' + pad(mins) + ':' + pad(secs);
        }
        if (this.limit > 0) {
            return '<limit expired>';
        }
        return '<no known limit>';
    };
    GithubRateInfo.prototype.getTimeToReset = function () {
        if (this.reset) {
            return Math.max(0, this.reset - Date.now());
        }
        return 0;
    };
    GithubRateInfo.prototype.getMinutesToReset = function () {
        if (this.reset) {
            return Math.floor(this.getTimeToReset() / 1000 / 60);
        }
        return 0;
    };
    GithubRateInfo.prototype.isBlocked = function () {
        return this.remaining === 0;
    };
    GithubRateInfo.prototype.isLimited = function () {
        return this.limit > 0 && this.remaining < this.limit;
    };
    GithubRateInfo.prototype.hasRemaining = function () {
        return this.remaining > 0;
    };
    return GithubRateInfo;
})();
module.exports = GithubRateInfo;
