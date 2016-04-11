'use strict';
var assertVar = require('../../xm/assertVar');
var typeOf = require('../../xm/typeOf');
var CacheMode = require('../../http/CacheMode');
var GithubRepo = require('../../git/GithubRepo');
var Context = require('../context/Context');
var IndexManager = require('./IndexManager');
var SelectorQuery = require('./SelectorQuery');
var ConfigIO = require('./ConfigIO');
var ContentLoader = require('./ContentLoader');
var InfoParser = require('./InfoParser');
var Installer = require('./Installer');
var Resolver = require('./Resolver');
var Core = (function () {
    function Core(context) {
        this._apiCacheMode = CacheMode[CacheMode.allowUpdate];
        this._rawCacheMode = CacheMode[CacheMode.allowUpdate];
        assertVar(context, Context, 'context');
        this.context = context;
        this.index = new IndexManager(this);
        this.config = new ConfigIO(this);
        this.selector = new SelectorQuery(this);
        this.content = new ContentLoader(this);
        this.parser = new InfoParser(this);
        this.installer = new Installer(this);
        this.resolver = new Resolver(this);
        this.updateConfig();
    }
    Core.prototype.updateConfig = function () {
        this.repo = new GithubRepo(this.context.config, this.context.paths.cacheDir, this.context.settings);
        this.repo.api.headers['user-agent'] = this.context.packageInfo.getNameVersion();
        this.repo.raw.headers['user-agent'] = this.context.packageInfo.getNameVersion();
        var token = process.env.TSD_GITHUB_TOKEN || this.context.settings.getValue('/token');
        if (typeOf.isString(token)) {
            this.repo.api.headers['authorization'] = 'token ' + token;
        }
        else {
            delete this.repo.api.headers['authorization'];
        }
        this.useCacheMode(this._apiCacheMode, this._rawCacheMode);
    };
    Core.prototype.useCacheMode = function (modeName, rawMode) {
        if (!(modeName in CacheMode)) {
            throw new Error('invalid CacheMode' + modeName);
        }
        if (rawMode && !(rawMode in CacheMode)) {
            throw new Error('invalid CacheMode ' + rawMode);
        }
        this._apiCacheMode = modeName;
        this._rawCacheMode = (rawMode || modeName);
        this.repo.api.cache.opts.cache.applyCacheMode(CacheMode[this._apiCacheMode]);
        this.repo.raw.cache.opts.cache.applyCacheMode(CacheMode[this._rawCacheMode]);
    };
    return Core;
})();
module.exports = Core;
