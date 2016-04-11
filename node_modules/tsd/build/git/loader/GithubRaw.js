'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var assertVar = require('../../xm/assertVar');
var typeOf = require('../../xm/typeOf');
var CacheRequest = require('../../http/CacheRequest');
var GithubLoader = require('./GithubLoader');
var GithubRaw = (function (_super) {
    __extends(GithubRaw, _super);
    function GithubRaw(urls, options, shared, storeDir) {
        _super.call(this, urls, options, shared, storeDir, 'GithubRaw');
        this.formatVersion = '1.0';
        this._initGithubLoader();
    }
    GithubRaw.prototype.getText = function (ref, filePath) {
        return this.getFile(ref, filePath).then(function (buffer) {
            return buffer.toString('utf8');
        });
    };
    GithubRaw.prototype.getJSON = function (ref, filePath) {
        return this.getFile(ref, filePath).then(function (buffer) {
            return JSON.parse(buffer.toString('utf8'));
        });
    };
    GithubRaw.prototype.getBinary = function (ref, filePath) {
        return this.getFile(ref, filePath);
    };
    GithubRaw.prototype.getFile = function (ref, filePath) {
        assertVar(filePath, 'string', 'filePath');
        assertVar(ref, 'string', 'ref', true);
        var url = this.urls.rawFile(ref, filePath);
        var headers = {};
        var request = new CacheRequest(url, headers);
        if (typeOf.isSha(ref)) {
            request.localMaxAge = this.options.getDurationSecs('localMaxAge') * 1000;
            request.httpInterval = this.options.getDurationSecs('httpInterval') * 1000;
        }
        else {
            request.localMaxAge = this.options.getDurationSecs('localMaxAge') * 1000;
            request.httpInterval = this.options.getDurationSecs('httpIntervalRef') * 1000;
        }
        request.lock();
        return this.cache.getObject(request).then(function (object) {
            return object.body;
        });
    };
    GithubRaw.prototype.getCacheKey = function () {
        return 'git-raw-fmt' + this.formatVersion;
    };
    return GithubRaw;
})(GithubLoader);
module.exports = GithubRaw;
