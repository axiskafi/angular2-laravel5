'use strict';
var path = require('path');
var assertVar = require('../../xm/assertVar');
var HTTPCache = require('../../http/HTTPCache');
var CacheOpts = require('../../http/CacheOpts');
var JSONPointer = require('../../xm/lib/JSONPointer');
var GithubURLs = require('../GithubURLs');
var GithubLoader = (function () {
    function GithubLoader(urls, options, shared, storeDir, label) {
        this.label = 'github-loader';
        this.formatVersion = '0.0.0';
        this.headers = {};
        assertVar(urls, GithubURLs, 'urls');
        assertVar(options, JSONPointer, 'options');
        assertVar(shared, JSONPointer, 'shared');
        assertVar(storeDir, 'string', 'storeDir');
        this.urls = urls;
        this.options = options;
        this.shared = shared;
        this.storeDir = storeDir;
        this.label = label;
    }
    GithubLoader.prototype._initGithubLoader = function () {
        var cache = new CacheOpts();
        cache.allowClean = this.options.getBoolean('allowClean', cache.allowClean);
        cache.cleanInterval = this.options.getDurationSecs('cacheCleanInterval', cache.cleanInterval / 1000) * 1000;
        cache.splitDirLevel = this.options.getNumber('splitDirLevel', cache.splitDirLevel);
        cache.splitDirChunk = this.options.getNumber('splitDirChunk', cache.splitDirChunk);
        cache.jobTimeout = this.options.getDurationSecs('jobTimeout', cache.jobTimeout / 1000) * 1000;
        cache.storeDir = path.join(this.storeDir, this.getCacheKey());
        var opts = {
            cache: cache,
            concurrent: this.shared.getNumber('concurrent', 20),
            oath: this.shared.getString('oath', null),
            strictSSL: this.shared.getBoolean('strictSSL', true)
        };
        opts.proxy = (this.shared.getString('proxy')
            || process.env.HTTPS_PROXY
            || process.env.https_proxy
            || process.env.HTTP_PROXY
            || process.env.http_proxy);
        this.cache = new HTTPCache(opts);
        this.headers['user-agent'] = this.label + '-v' + this.formatVersion;
    };
    GithubLoader.prototype.getCacheKey = function () {
        return 'loader';
    };
    GithubLoader.prototype.copyHeadersTo = function (target, source) {
        source = (source || this.headers);
        Object.keys(source).forEach(function (name) {
            target[name] = source[name];
        });
    };
    Object.defineProperty(GithubLoader.prototype, "verbose", {
        set: function (verbose) {
        },
        enumerable: true,
        configurable: true
    });
    return GithubLoader;
})();
module.exports = GithubLoader;
