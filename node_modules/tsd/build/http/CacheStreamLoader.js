'use strict';
var path = require('path');
var crypto = require('crypto');
var Promise = require('bluebird');
var joiAssert = require('joi-assert');
var zlib = require('zlib');
var request = require('request');
var es = require('event-stream');
var BufferList = require('bl');
var typeOf = require('../xm/typeOf');
var assert = require('../xm/assert');
var assertVar = require('../xm/assertVar');
var dateUtils = require('../xm/dateUtils');
var hash = require('../xm/hash');
var fileIO = require('../xm/fileIO');
var CacheObject = require('./CacheObject');
var ResponseInfo = require('./ResponseInfo');
var types = require('./types');
var CacheStreamLoader = (function () {
    function CacheStreamLoader(opts, request) {
        assertVar(opts, 'object', 'opts');
        assertVar(request, 'object', 'request');
        this.opts = opts;
        this.request = request;
        this.object = new CacheObject(this.request);
        this.object.storeDir = fileIO.distributeDir(this.opts.cache.storeDir, this.request.key, this.opts.cache.splitDirLevel, this.opts.cache.splitDirChunk);
        this.object.bodyFile = path.join(this.object.storeDir, this.request.key + '.raw');
        this.object.infoFile = path.join(this.object.storeDir, this.request.key + '.json');
    }
    CacheStreamLoader.prototype.dropContent = function () {
        this._promise = null;
        var obj = new CacheObject(this.object.request);
        obj.storeDir = this.object.storeDir;
        obj.bodyFile = this.object.bodyFile;
        obj.infoFile = this.object.infoFile;
        this.object = obj;
    };
    Object.defineProperty(CacheStreamLoader.prototype, "url", {
        get: function () {
            return this.request ? this.request.url : null;
        },
        enumerable: true,
        configurable: true
    });
    CacheStreamLoader.prototype.destruct = function () {
        this._promise = null;
    };
    CacheStreamLoader.prototype.canUpdate = function () {
        if (this.opts.cache.cacheRead && this.opts.cache.remoteRead && this.opts.cache.cacheWrite) {
            return true;
        }
        return false;
    };
    CacheStreamLoader.prototype.getObject = function () {
        var _this = this;
        if (this._promise) {
            return this._promise;
        }
        return this._promise = this.cacheRead().then(function () {
            var useCached = false;
            if (_this.object.body && _this.object.info) {
                useCached = !_this.request.forceRefresh;
                if (useCached && typeOf.isNumber(_this.request.httpInterval) && _this.opts.cache.cacheWrite) {
                    if (new Date(_this.object.info.cacheUpdated).getTime() < Date.now() - _this.request.httpInterval) {
                        useCached = false;
                    }
                }
            }
            if (useCached) {
                return _this.cacheTouch().then(function () {
                    return _this.object;
                });
            }
            return _this.httpLoad(!_this.request.forceRefresh).then(function () {
                if (!typeOf.isValid(_this.object.body)) {
                    throw new Error('no result body: ' + _this.request.url + ' -> ' + _this.request.key);
                }
                return _this.object;
            });
        }).then(function () {
            return _this.object;
        }, function (err) {
            _this.dropContent();
            throw err;
        });
    };
    CacheStreamLoader.prototype.cacheRead = function () {
        var _this = this;
        if (!this.opts.cache.cacheRead) {
            return Promise.resolve();
        }
        return this.readInfo().then(function () {
            if (!_this.object.info) {
                throw new Error('no or invalid info object');
            }
            if (_this.opts.cache.remoteRead) {
                if (typeOf.isNumber(_this.request.localMaxAge)) {
                    var date = new Date(_this.object.info.cacheUpdated);
                    var compare = new Date();
                    assert(date.getTime() < compare.getTime() + _this.request.localMaxAge, 'date {a} vs {e}', date.toISOString(), compare.toISOString());
                }
            }
            return fileIO.read(_this.object.bodyFile).then(function (buffer) {
                if (buffer.length === 0) {
                    throw new Error('empty body file');
                }
                _this.object.bodyChecksum = hash.sha1(buffer);
                _this.object.body = buffer;
            });
        }).then(function () {
            joiAssert(_this.object, types.objectSchema);
            assert(_this.object.bodyChecksum === _this.object.info.contentChecksum, 'checksum {a} vs {e}', _this.object.info.contentChecksum, _this.object.bodyChecksum);
            return _this.object;
        }).catch(function (err) {
            _this.dropContent();
            return _this.cacheRemove().return(null);
        });
    };
    CacheStreamLoader.prototype.httpLoad = function (httpCache) {
        var _this = this;
        if (httpCache === void 0) { httpCache = true; }
        if (!this.opts.cache.remoteRead) {
            return Promise.resolve();
        }
        return new Promise(function (resolve, reject) {
            var req = {
                url: _this.request.url,
                headers: {}
            };
            if (_this.opts.proxy) {
                req.proxy = _this.opts.proxy;
            }
            req.strictSSL = _this.opts.strictSSL;
            Object.keys(_this.request.headers).forEach(function (key) {
                req.headers[key] = String(_this.request.headers[key]);
            });
            if (_this.object.info && _this.object.body && httpCache) {
                if (_this.object.info.httpETag) {
                    req.headers['if-none-match'] = _this.object.info.httpETag;
                }
                if (_this.object.info.httpModified) {
                    req.headers['if-modified-since'] = new Date(_this.object.info.httpModified).toUTCString();
                }
            }
            req.headers['accept-encoding'] = 'gzip, deflate';
            var pause = es.pause();
            pause.pause();
            var checkSha = crypto.createHash('sha1');
            var r = request.get(req);
            r.pipe(pause).on('error', function (err) {
                reject(err);
            });
            r.on('response', function (res) {
                _this.object.response = new ResponseInfo();
                _this.object.response.status = res.statusCode;
                _this.object.response.headers = res.headers;
                if (res.statusCode < 200 || res.statusCode >= 400) {
                    var errMsg = 'unexpected status code: ' + res.statusCode + ' on: ' + _this.request.url;
                    if (res.statusCode === 403) {
                        errMsg = 'EGITIHAPI, ' + errMsg;
                    }
                    reject(new Error(errMsg));
                    return;
                }
                if (res.statusCode === 304) {
                    if (!_this.object.body) {
                        reject(new Error('flow error: http 304 but no local content on: ' + _this.request.url));
                        return;
                    }
                    if (!_this.object.info) {
                        reject(new Error('flow error: http 304 but no local info on: ' + _this.request.url));
                        return;
                    }
                    _this.updateInfo(res, _this.object.info.contentChecksum);
                    _this.cacheWrite(true).then(resolve, reject);
                    return;
                }
                var writer = new BufferList(function (err, body) {
                    if (!body) {
                        throw new Error('flow error: http 304 but no local info on: ' + _this.request.url);
                    }
                    if (body.length === 0) {
                        throw new Error('loaded zero bytes ' + _this.request.url);
                    }
                    var checksum = checkSha.digest('hex');
                    if (_this.object.info) {
                        _this.updateInfo(res, checksum);
                    }
                    else {
                        _this.copyInfo(res, checksum);
                    }
                    _this.object.body = body;
                    _this.cacheWrite(false).done(resolve, reject);
                });
                var decoded;
                switch (res.headers['content-encoding']) {
                    case 'gzip':
                        decoded = pause.pipe(zlib.createGunzip());
                        break;
                    case 'deflate':
                        decoded = pause.pipe(zlib.createInflate());
                        break;
                    default:
                        decoded = pause;
                        break;
                }
                decoded.on('data', function (chunk) {
                    checkSha.update(chunk);
                });
                decoded.pipe(writer);
                pause.resume();
            });
        });
    };
    CacheStreamLoader.prototype.cacheWrite = function (cacheWasFresh) {
        var _this = this;
        if (!this.opts.cache.cacheWrite) {
            return Promise.resolve();
        }
        return Promise.try(function () {
            if (_this.object.body.length === 0) {
                throw new Error('wont write empty file to ' + _this.object.bodyFile);
            }
            var write = [];
            if (!cacheWasFresh) {
                write.push(fileIO.write(_this.object.bodyFile, _this.object.body));
            }
            write.push(fileIO.writeJSON(_this.object.infoFile, _this.object.info));
            return Promise.all(write).then(function () {
                return Promise.all([
                    _this.checkExists(_this.object.bodyFile, 'body'),
                    _this.checkExists(_this.object.infoFile, 'info')
                ]);
            }).then(function () {
                return _this.cacheTouch();
            });
        });
    };
    CacheStreamLoader.prototype.checkExists = function (file, label) {
        return fileIO.exists(file).then(function (exist) {
            if (!exist) {
                return Promise.resolve(false);
            }
            return fileIO.stat(file).then(function (stat) {
                if (stat.size === 0) {
                    return false;
                }
                return true;
            }, function (e) { return false; });
        });
    };
    CacheStreamLoader.prototype.cacheRemove = function () {
        if (!this.canUpdate()) {
            return Promise.resolve();
        }
        return Promise.all([
            fileIO.removeFile(this.object.infoFile),
            fileIO.removeFile(this.object.bodyFile),
        ]).catch(function (e) { return null; }).return();
    };
    CacheStreamLoader.prototype.cacheTouch = function () {
        if (!this.canUpdate()) {
            return Promise.resolve();
        }
        return Promise.all([
            fileIO.touchFile(this.object.infoFile),
            fileIO.touchFile(this.object.bodyFile)
        ]).catch(function (e) { return null; }).return();
    };
    CacheStreamLoader.prototype.readInfo = function () {
        var _this = this;
        return fileIO.isFile(this.object.infoFile).then(function (isFile) {
            if (!isFile) {
                return null;
            }
            return fileIO.readJSON(_this.object.infoFile).then(function (info) {
                info = joiAssert(info, types.infoSchema);
                assert((info.url === _this.request.url), 'info.url {a} is not {e}', info.url, _this.request.url);
                assert((info.key === _this.request.key), 'info.key {a} is not {e}', info.key, _this.request.key);
                _this.object.info = info;
            });
        });
    };
    CacheStreamLoader.prototype.copyInfo = function (res, checksum) {
        var info = {};
        info.url = this.request.url;
        info.key = this.request.key;
        info.contentType = res.headers['content-type'];
        info.cacheCreated = dateUtils.getISOString(Date.now());
        info.cacheUpdated = info.cacheCreated;
        this.object.info = info;
        this.updateInfo(res, checksum);
    };
    CacheStreamLoader.prototype.updateInfo = function (res, checksum) {
        var info = this.object.info;
        info.httpETag = (res.headers['etag'] || info.httpETag);
        info.httpModified = dateUtils.getISOString((res.headers['last-modified'] ? new Date(res.headers['last-modified']) : new Date()));
        info.cacheUpdated = dateUtils.getISOString(Date.now());
        info.contentChecksum = checksum;
    };
    CacheStreamLoader.prototype.toString = function () {
        return this.request ? this.request.url : '<no request>';
    };
    return CacheStreamLoader;
})();
module.exports = CacheStreamLoader;
