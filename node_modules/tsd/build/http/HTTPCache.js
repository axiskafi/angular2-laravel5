'use strict';
var path = require('path');
var Promise = require('bluebird');
var joiAssert = require('joi-assert');
var fileIO = require('../xm/fileIO');
var assert = require('../xm/assert');
var assertVar = require('../xm/assertVar');
var typeOf = require('../xm/typeOf');
var collection = require('../xm/collection');
var CacheRequest = require('./CacheRequest');
var CacheStreamLoader = require('./CacheStreamLoader');
var types = require('./types');
var QueueItem = (function () {
    function QueueItem(job) {
        this.job = job;
        this.defer = Promise.defer();
    }
    QueueItem.prototype.run = function () {
        var _this = this;
        this.job.getObject().then(function (object) {
            _this.defer.resolve(object);
        }, function (err) {
            _this.defer.reject(err);
        });
        return this.defer.promise;
    };
    Object.defineProperty(QueueItem.prototype, "promise", {
        get: function () {
            return this.defer.promise;
        },
        enumerable: true,
        configurable: true
    });
    return QueueItem;
})();
var HTTPCache = (function () {
    function HTTPCache(opts) {
        this.jobs = new collection.Hash();
        this.jobTimers = new collection.Hash();
        this.queue = [];
        this.active = [];
        assertVar(opts, 'object', 'opts');
        this.opts = opts;
        this.setStoreDir(this.opts.cache.storeDir);
    }
    HTTPCache.prototype.setStoreDir = function (dir) {
        assertVar(dir, 'string', 'dir');
        this.manageFile = path.join(dir, '_info.json');
    };
    HTTPCache.prototype.getObject = function (request) {
        var _this = this;
        assertVar(request, CacheRequest, 'request');
        assert(request.locked, 'request must be lock()-ed {a}', request.url);
        return this.init().then(function () {
            if (_this.jobs.has(request.key)) {
                return _this.jobs.get(request.key);
            }
            else {
                var job = new CacheStreamLoader(_this.opts, request);
                var item = new QueueItem(job);
                _this.jobs.set(request.key, item.promise);
                _this.queue.push(item);
                _this.checkQueue();
                return item.promise;
            }
        }).then(function (res) {
            _this.scheduleRelease(request.key);
            _this.checkCleanCache();
            return res;
        });
    };
    HTTPCache.prototype.checkQueue = function () {
        var max = (this.opts.concurrent || 20);
        while (this.active.length < max && this.queue.length > 0) {
            this.step(this.queue.shift());
        }
    };
    HTTPCache.prototype.step = function (item) {
        var _this = this;
        this.active.push(item);
        item.run().then(function () {
            var i = _this.active.indexOf(item);
            if (i > -1) {
                _this.active.splice(i);
            }
            _this.checkQueue();
        });
    };
    HTTPCache.prototype.scheduleRelease = function (key) {
        var _this = this;
        if (!this.jobs.has(key)) {
            return;
        }
        if (this.jobTimers.has(key)) {
            clearTimeout(this.jobTimers.get(key));
        }
        if (this.opts.cache.jobTimeout <= 0) {
            this.jobs.delete(key);
        }
        else {
            var timer = setTimeout(function () {
                _this.jobs.delete(key);
            }, this.opts.cache.jobTimeout);
            timer.unref();
            this.jobTimers.set(key, timer);
        }
    };
    HTTPCache.prototype.init = function () {
        if (this._init) {
            return this._init;
        }
        return this._init = fileIO.mkdirCheck(this.opts.cache.storeDir, true).return();
    };
    HTTPCache.prototype.checkCleanCache = function () {
        var _this = this;
        if (this._cleaning) {
            return this._cleaning;
        }
        if (!this._init || !this.opts.cache.allowClean || !typeOf.isNumber(this.opts.cache.cleanInterval)) {
            return Promise.resolve();
        }
        if (this.cacheSweepLast && this.cacheSweepLast.getTime() > Date.now() - this.opts.cache.cleanInterval) {
            return Promise.resolve();
        }
        var now = new Date();
        return this._cleaning = fileIO.exists(this.manageFile).then(function (exists) {
            if (!exists) {
                return null;
            }
            return fileIO.read(_this.manageFile).then(function (buffer) {
                return joiAssert(JSON.parse(buffer.toString('utf8')), types.manageSchema);
            }, function (err) {
                return fileIO.removeFile(_this.manageFile).catch(function (err) {
                    return null;
                });
            });
        }).then(function (manageInfo) {
            if (manageInfo) {
                var date = new Date(manageInfo.lastSweep);
                if (date.getTime() > now.getTime() - _this.opts.cache.cleanInterval) {
                    return;
                }
            }
            return _this.cleanupCacheAge(_this.opts.cache.cleanInterval).then(function () {
                if (!manageInfo) {
                    manageInfo = {
                        lastSweep: now.toISOString()
                    };
                }
                else {
                    manageInfo.lastSweep = now.toISOString();
                }
                return fileIO.write(_this.manageFile, new Buffer(JSON.stringify(manageInfo, null, 2), 'utf8'));
            });
        }).finally(function () {
            _this.cacheSweepLast = new Date();
            _this._cleaning = null;
        });
    };
    HTTPCache.prototype.cleanupCacheAge = function (maxAge) {
        var _this = this;
        assertVar(maxAge, 'number', 'maxAge');
        return this.init().then(function () {
            var ageLimit = Date.now() - maxAge;
            var dirs = Object.create(null);
            var files = [];
            var baseDir = path.resolve(_this.opts.cache.storeDir);
            var hexStartExp = /^[0-9a-f]+/;
            return fileIO.listTree(baseDir).map(function (target) {
                var first = path.relative(baseDir, target).match(hexStartExp);
                if (first && first.length > 0) {
                    if (!(first[0] in dirs)) {
                        dirs[first[0]] = path.join(baseDir, first[0]);
                    }
                }
                return fileIO.stat(target).then(function (stat) {
                    if (stat.isFile()) {
                        files.push({
                            atime: stat.atime.getTime(),
                            path: target
                        });
                    }
                    return target;
                });
            }).then(function () {
                var removeFiles = files.filter(function (obj) {
                    var ext = path.extname(obj.path);
                    var first = path.relative(baseDir, obj.path).match(hexStartExp);
                    if (!first || first.length === 0) {
                        return false;
                    }
                    var name = path.basename(obj.path, ext);
                    if (!typeOf.isSha(name)) {
                        delete dirs[first[0]];
                        return false;
                    }
                    if (ext !== '.json' && ext !== '.raw') {
                        delete dirs[first[0]];
                        return false;
                    }
                    if (maxAge > 0 && obj.atime > ageLimit) {
                        delete dirs[first[0]];
                        return false;
                    }
                    return true;
                }).map(function (obj) { return obj.path; });
                var removeDirs = Object.keys(dirs).map(function (key) { return dirs[key]; });
                removeFiles = removeFiles.filter(function (file) {
                    return removeDirs.every(function (dir) {
                        return file.indexOf(dir) !== 0;
                    });
                });
                return Promise.map(removeFiles, function (target) {
                    return fileIO.removeFile(target);
                }).then(function () {
                    return Promise.map(removeDirs, function (dir) {
                        return fileIO.rimraf(dir);
                    });
                }).catch(function (e) {
                    console.log('\n-removeFile error-\n');
                    console.log(e);
                });
            });
        }).return();
    };
    return HTTPCache;
})();
module.exports = HTTPCache;
