'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var request = require('request');
var Promise = require('bluebird');
var typeOf = require('../../xm/typeOf');
var CacheRequest = require('../../http/CacheRequest');
var GithubLoader = require('./GithubLoader');
var GithubRateInfo = require('../model/GithubRateInfo');
var GithubAPI = (function (_super) {
    __extends(GithubAPI, _super);
    function GithubAPI(urls, options, shared, storeDir) {
        _super.call(this, urls, options, shared, storeDir, 'GithubAPI');
        this.apiVersion = '3.0.0';
        this.formatVersion = '1.0';
        this._initGithubLoader();
    }
    GithubAPI.prototype.getBranches = function () {
        return this.getCachableURL(this.urls.apiBranches());
    };
    GithubAPI.prototype.getBranch = function (branch) {
        return this.getCachableURL(this.urls.apiBranch(branch));
    };
    GithubAPI.prototype.getTree = function (sha, recursive) {
        return this.getCachableURL(this.urls.apiTree(sha, (recursive ? 1 : undefined)));
    };
    GithubAPI.prototype.getCommit = function (sha) {
        return this.getCachableURL(this.urls.apiCommit(sha));
    };
    GithubAPI.prototype.getBlob = function (sha) {
        return this.getCachableURL(this.urls.apiBlob(sha));
    };
    GithubAPI.prototype.getPathCommits = function (path) {
        return this.getCachableURL(this.urls.apiPathCommits(path));
    };
    GithubAPI.prototype.getCachableURL = function (url) {
        var request = new CacheRequest(url);
        return this.getCachable(request);
    };
    GithubAPI.prototype.getCachable = function (request) {
        if (!typeOf.isNumber(request.localMaxAge)) {
            request.localMaxAge = this.options.getDurationSecs('localMaxAge') * 1000;
        }
        if (!typeOf.isNumber(request.httpInterval)) {
            request.httpInterval = this.options.getDurationSecs('httpInterval') * 1000;
        }
        this.copyHeadersTo(request.headers);
        request.headers['accept'] = 'application/vnd.github.beta+json';
        request.lock();
        return this.cache.getObject(request).then(function (object) {
            var res = JSON.parse(object.body.toString('utf8'));
            if (object.response) {
                var rate = new GithubRateInfo(object.response.headers);
                if (typeOf.isObject(res)) {
                    res.meta = { rate: rate };
                }
            }
            return res;
        });
    };
    GithubAPI.prototype.getRateInfo = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var url = _this.urls.rateLimit();
            var req = {
                url: url,
                headers: {}
            };
            _this.copyHeadersTo(req.headers);
            if (_this.cache.opts.proxy) {
                req.proxy = _this.cache.opts.proxy;
            }
            request.get(req, function (err, res, body) {
                if (err) {
                    reject(err);
                }
                else {
                    var rate = new GithubRateInfo(res.headers);
                    resolve(rate);
                }
            });
        });
    };
    GithubAPI.prototype.getCacheKey = function () {
        return 'git-api-v' + this.apiVersion + '-fmt' + this.formatVersion;
    };
    return GithubAPI;
})(GithubLoader);
module.exports = GithubAPI;
