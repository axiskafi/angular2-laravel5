'use strict';
var path = require('path');
var assertVar = require('../xm/assertVar');
var JSONPointer = require('../xm/lib/JSONPointer');
var GithubURLs = require('./GithubURLs');
var GithubAPI = require('./loader/GithubAPI');
var GithubRaw = require('./loader/GithubRaw');
var GithubRepo = (function () {
    function GithubRepo(config, storeDir, opts) {
        assertVar(config, 'object', 'config');
        assertVar(storeDir, 'string', 'storeDir');
        assertVar(opts, JSONPointer, 'opts');
        this.config = config;
        this.urls = new GithubURLs(this);
        this.storeDir = path.join(storeDir.replace(/[\\\/]+$/, ''), this.getCacheKey());
        this.api = new GithubAPI(this.urls, opts.getChild('git/api'), opts, this.storeDir);
        this.raw = new GithubRaw(this.urls, opts.getChild('git/raw'), opts, this.storeDir);
    }
    GithubRepo.prototype.getCacheKey = function () {
        return this.config.repoOwner + '-' + this.config.repoProject;
    };
    GithubRepo.prototype.toString = function () {
        return this.config.repoOwner + '/' + this.config.repoProject;
    };
    Object.defineProperty(GithubRepo.prototype, "verbose", {
        set: function (verbose) {
            this.api.verbose = verbose;
            this.raw.verbose = verbose;
        },
        enumerable: true,
        configurable: true
    });
    return GithubRepo;
})();
module.exports = GithubRepo;
