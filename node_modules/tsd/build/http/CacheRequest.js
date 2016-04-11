'use strict';
var deepFreeze = require('deep-freeze');
var hash = require('../xm/hash');
var Request = (function () {
    function Request(url, headers) {
        var _this = this;
        this.url = url;
        this.headers = {};
        if (headers) {
            Object.keys(headers).forEach(function (key) {
                _this.headers[key] = headers[key];
            });
        }
    }
    Request.prototype.lock = function () {
        var _this = this;
        this.locked = true;
        var keyHash = {
            url: this.url,
            headers: Object.keys(this.headers).reduce(function (memo, key) {
                if (Request.keyHeaders.indexOf(key) > -1) {
                    memo[key] = _this.headers[key];
                }
                return memo;
            }, Object.create(null))
        };
        this.key = hash.jsonToIdentHash(keyHash);
        deepFreeze(this.headers);
        Object.freeze(this);
        return this;
    };
    Request.lockProps = [
        'key',
        'url',
        'headers',
        'localMaxAge',
        'httpInterval',
        'forceRefresh',
        'locked'
    ];
    Request.keyHeaders = [
        'accept',
        'accept-charset',
        'accept-language',
        'content-md5',
        'content-type',
        'cookie',
        'host'
    ];
    return Request;
})();
module.exports = Request;
