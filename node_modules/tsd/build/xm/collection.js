'use strict';
function dict() {
    return Object.create(null);
}
exports.dict = dict;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var Set = (function () {
    function Set(d) {
        this.list = [];
        this.list = d || [];
    }
    Set.prototype.has = function (value) {
        return this.list.indexOf(value) > -1;
    };
    Set.prototype.add = function (value) {
        var i = this.list.indexOf(value);
        if (i < 0) {
            this.list.push(value);
        }
    };
    Set.prototype.delete = function (value) {
        var i = this.list.indexOf(value);
        if (i > -1) {
            this.list.splice(i, 1);
        }
    };
    Set.prototype.values = function () {
        return this.list.slice(0);
    };
    Set.prototype.forEach = function (iterator) {
        var arr = this.list.slice(0);
        for (var i = 0, ii = arr.length; i < ii; i++) {
            iterator(arr[i], i);
        }
    };
    Object.defineProperty(Set.prototype, "size", {
        get: function () {
            return this.list.length;
        },
        enumerable: true,
        configurable: true
    });
    return Set;
})();
exports.Set = Set;
var Hash = (function () {
    function Hash(d) {
        var _this = this;
        this.dict = dict();
        if (d) {
            Object.keys(d).forEach(function (key) {
                _this.dict[key] = d[key];
            });
        }
    }
    Hash.prototype.has = function (key) {
        return key in this.dict;
    };
    Hash.prototype.get = function (key) {
        if (key in this.dict) {
            return this.dict[key];
        }
        return null;
    };
    Hash.prototype.set = function (key, value) {
        this.dict[key] = value;
    };
    Hash.prototype.delete = function (key) {
        delete this.dict[key];
    };
    Hash.prototype.clear = function () {
        this.dict = dict();
    };
    Hash.prototype.merge = function (d) {
        for (var key in d) {
            this.dict[key] = d[key];
        }
    };
    Hash.prototype.keys = function () {
        var keys = [];
        for (var key in this.dict) {
            keys.push(key);
        }
        return keys;
    };
    Hash.prototype.values = function () {
        var values = [];
        for (var key in this.dict) {
            values.push(this.dict[key]);
        }
        return values;
    };
    Hash.prototype.forEach = function (iterator) {
        var arr = this.keys();
        for (var i = 0, ii = arr.length; i < ii; i++) {
            var key = arr[i];
            iterator(this.dict[key], key);
        }
    };
    Object.defineProperty(Hash.prototype, "size", {
        get: function () {
            var size = 0;
            for (var key in this.dict) {
                size++;
            }
            return size;
        },
        enumerable: true,
        configurable: true
    });
    return Hash;
})();
exports.Hash = Hash;
function enumNames(enumer) {
    return Object.keys(enumer).filter(function (value) {
        return !/^\d+$/.test(value);
    });
}
exports.enumNames = enumNames;
