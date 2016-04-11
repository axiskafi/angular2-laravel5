'use strict';
var CacheMode = require('./CacheMode');
var CacheOpts = (function () {
    function CacheOpts(mode) {
        this.compressStore = false;
        this.splitDirLevel = 0;
        this.splitDirChunk = 1;
        this.cacheRead = true;
        this.cacheWrite = true;
        this.remoteRead = true;
        this.allowClean = false;
        this.jobTimeout = 0;
        if (mode) {
            this.applyCacheMode(mode);
        }
    }
    CacheOpts.prototype.applyCacheMode = function (mode) {
        switch (mode) {
            case CacheMode.forceRemote:
                this.cacheRead = false;
                this.remoteRead = true;
                this.cacheWrite = false;
                this.allowClean = false;
                break;
            case CacheMode.forceUpdate:
                this.cacheRead = false;
                this.remoteRead = true;
                this.cacheWrite = true;
                this.allowClean = true;
                break;
            case CacheMode.allowUpdate:
                this.cacheRead = true;
                this.remoteRead = true;
                this.cacheWrite = true;
                this.allowClean = true;
                break;
            case CacheMode.forceLocal:
                this.cacheRead = true;
                this.remoteRead = false;
                this.cacheWrite = false;
                this.allowClean = false;
                break;
            case CacheMode.allowRemote:
            default:
                this.cacheRead = true;
                this.remoteRead = true;
                this.cacheWrite = false;
                this.allowClean = false;
                break;
        }
    };
    return CacheOpts;
})();
module.exports = CacheOpts;
