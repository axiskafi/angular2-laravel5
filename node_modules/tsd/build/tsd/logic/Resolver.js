'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var path = require('path');
var Promise = require('bluebird');
var collection = require('../../xm/collection');
var Def = require('../data/Def');
var defUtil = require('../util/defUtil');
var CoreModule = require('./CoreModule');
var localExp = /^\.\//;
var leadingExp = /^\.\.\//;
var Resolver = (function (_super) {
    __extends(Resolver, _super);
    function Resolver(core) {
        _super.call(this, core, 'Resolver');
        this._active = new collection.Hash();
    }
    Resolver.prototype.resolveBulk = function (list) {
        var _this = this;
        list = defUtil.uniqueDefVersion(list);
        return Promise.map(list, function (file) {
            return _this.resolveDeps(file);
        }).return(list);
    };
    Resolver.prototype.resolveDeps = function (file) {
        var _this = this;
        if (file.solved) {
            return Promise.resolve(file);
        }
        if (this._active.has(file.key)) {
            return this._active.get(file.key);
        }
        var promise = Promise.all([
            this.core.index.getIndex(),
            this.core.content.loadContent(file)
        ]).spread(function (index, blob) {
            file.dependencies.splice(0, file.dependencies.length);
            var queued = _this.applyResolution(index, file, blob.content.toString());
            file.solved = true;
            return Promise.all(queued);
        }).finally(function () {
            _this._active.delete(file.key);
        }).return(file);
        this._active.set(file.key, promise);
        return promise;
    };
    Resolver.prototype.applyResolution = function (index, file, content) {
        var _this = this;
        var refs = this.extractPaths(file, content);
        return refs.reduce(function (memo, refPath) {
            if (index.hasDef(refPath)) {
                var dep = index.getDef(refPath);
                file.dependencies.push(dep);
                if (!dep.head.solved && !_this._active.has(dep.head.key)) {
                    memo.push(_this.resolveDeps(dep.head));
                }
            }
            else {
                console.log('path reference not in index: ' + refPath);
            }
            return memo;
        }, []);
    };
    Resolver.prototype.extractPaths = function (file, content) {
        return defUtil.extractReferenceTags(content).reduce(function (memo, refPath) {
            refPath = path.normalize(path.dirname(file.def.path) + '/' + refPath).replace(/\\/g, '/');
            if (Def.isDefPath(refPath) && memo.indexOf(refPath) < 0) {
                memo.push(refPath);
            }
            return memo;
        }, []);
    };
    return Resolver;
})(CoreModule);
module.exports = Resolver;
