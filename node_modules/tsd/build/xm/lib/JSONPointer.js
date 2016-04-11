'use strict';
var pointer = require('json-pointer');
var typeOf = require('../typeOf');
var JSONPointer = (function () {
    function JSONPointer(object, prefix) {
        if (prefix === void 0) { prefix = ''; }
        this.prefix = '';
        this.objects = object ? [object] : [];
        if (prefix && !/^\//.test(prefix)) {
            prefix = '/' + prefix;
        }
        this.prefix = prefix;
    }
    JSONPointer.prototype.hasValue = function (path) {
        if (!/^\//.test(path)) {
            path = '/' + path;
        }
        path = this.prefix + path;
        for (var i = 0, ii = this.objects.length; i < ii; i++) {
            if (pointer.has(this.objects[i], path)) {
                return true;
            }
        }
        return false;
    };
    JSONPointer.prototype.getValue = function (path, alt) {
        if (alt === void 0) { alt = null; }
        if (!/^\//.test(path)) {
            path = '/' + path;
        }
        path = this.prefix + path;
        for (var i = 0, ii = this.objects.length; i < ii; i++) {
            var obj = this.objects[i];
            if (pointer.has(obj, path)) {
                return pointer.get(obj, path);
            }
        }
        return alt;
    };
    JSONPointer.prototype.addSource = function (object) {
        this.objects.unshift(object);
    };
    JSONPointer.prototype.setValue = function (path, value) {
        if (!/^\//.test(path)) {
            path = '/' + path;
        }
        path = this.prefix + path;
        pointer.set(this.objects[0], path, value);
    };
    JSONPointer.prototype.getChild = function (path, alt) {
        if (alt === void 0) { alt = null; }
        if (!/^\//.test(path)) {
            path = '/' + path;
        }
        if (this.hasValue(path)) {
            var p = new JSONPointer();
            p.objects = this.objects.slice(0);
            p.prefix = this.prefix + path;
            return p;
        }
        return alt;
    };
    JSONPointer.prototype.getNumber = function (path, alt) {
        if (alt === void 0) { alt = NaN; }
        var value = this.getValue(path);
        if (typeof value === 'number') {
            return value;
        }
        return alt;
    };
    JSONPointer.prototype.getBoolean = function (path, alt) {
        if (alt === void 0) { alt = false; }
        return typeOf.isFlagOn(this.getValue(path, alt));
    };
    JSONPointer.prototype.getString = function (path, alt) {
        if (alt === void 0) { alt = null; }
        var value = this.getValue(path);
        if (typeof value === 'string') {
            return value;
        }
        else if (typeof value === 'number') {
            return String(value);
        }
        return alt;
    };
    JSONPointer.prototype.getDate = function (path, alt) {
        if (alt === void 0) { alt = null; }
        var value = this.getValue(path);
        if (typeof value === 'string' || typeof value === 'number') {
            return new Date(value.toString());
        }
        return alt;
    };
    JSONPointer.prototype.getDurationSecs = function (path, alt) {
        if (alt === void 0) { alt = 0; }
        var value = this.getValue(path);
        if (typeof value === 'object') {
            var d = 0;
            if (typeof value.years === 'number') {
                d += value.years * 31557600;
            }
            if (typeof value.months === 'number') {
                d += value.months * 31557600 / 12;
            }
            if (typeof value.weeks === 'number') {
                d += value.weeks * 7 * 24 * 3600;
            }
            if (typeof value.days === 'number') {
                d += value.days * 24 * 3600;
            }
            if (typeof value.hours === 'number') {
                d += value.hours * 3600;
            }
            if (typeof value.minutes === 'number') {
                d += value.minutes * 60;
            }
            if (typeof value.seconds === 'number') {
                d += value.seconds;
            }
            return d;
        }
        return alt;
    };
    return JSONPointer;
})();
module.exports = JSONPointer;
