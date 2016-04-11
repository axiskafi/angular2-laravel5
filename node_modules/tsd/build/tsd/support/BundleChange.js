'use strict';
var path = require('path');
var collection = require('../../xm/collection');
var BundleChange = (function () {
    function BundleChange(bundle) {
        this._added = new collection.Set();
        this._removed = new collection.Set();
        this.bundle = bundle;
    }
    BundleChange.prototype.add = function (target) {
        if (!target) {
            return;
        }
        this._added.add(target);
        this._removed.delete(target);
    };
    BundleChange.prototype.remove = function (target) {
        if (!target) {
            return;
        }
        this._added.delete(target);
        this._removed.add(target);
    };
    BundleChange.prototype.someRemoved = function () {
        return this._removed.size > 0;
    };
    BundleChange.prototype.someAdded = function () {
        return this._added.size > 0;
    };
    BundleChange.prototype.someChanged = function () {
        return this._added.size > 0 || this._removed.size > 0;
    };
    BundleChange.prototype.getRemoved = function (relative, canonical) {
        var _this = this;
        if (canonical === void 0) { canonical = false; }
        var arr = this._removed.values();
        if (!relative) {
            arr = arr.map(function (p) { return path.resolve(_this.bundle.baseDir, p); });
        }
        else {
            arr = arr.map(function (p) { return path.relative(_this.bundle.baseDir, p); });
        }
        if (canonical) {
            return arr.map(function (p) { return p.replace(/\\/g, '/'); });
        }
        return arr;
    };
    BundleChange.prototype.getAdded = function (relative, canonical) {
        var _this = this;
        if (canonical === void 0) { canonical = false; }
        var arr = this._added.values();
        if (!relative) {
            arr = arr.map(function (p) { return path.resolve(_this.bundle.baseDir, p); });
        }
        else {
            arr = arr.map(function (p) { return path.relative(_this.bundle.baseDir, p); });
        }
        if (canonical) {
            return arr.map(function (p) { return p.replace(/\\/g, '/'); });
        }
        return arr;
    };
    return BundleChange;
})();
module.exports = BundleChange;
