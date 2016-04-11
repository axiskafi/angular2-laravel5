'use strict';
var detectIndent = require('detect-indent');
var CodeStyle = require('../lib/CodeStyle');
var collection = require('../collection');
var assertVar = require('../assertVar');
var typeOf = require('../typeOf');
var sniffExp = /([ \t]*).*((?:\r?\n)|$)/g;
var lastEnd = /(\r?\n)$/;
var JSONStabilizer = (function () {
    function JSONStabilizer(depth, style) {
        if (depth === void 0) { depth = 2; }
        if (style === void 0) { style = null; }
        this.keys = [];
        this.parent = null;
        this.children = new collection.Hash();
        this.depth = depth;
        this.style = style || new CodeStyle();
    }
    Object.defineProperty(JSONStabilizer.prototype, "root", {
        get: function () {
            if (this.parent) {
                return this.parent.root;
            }
            return this;
        },
        enumerable: true,
        configurable: true
    });
    JSONStabilizer.prototype.parseString = function (jsonString) {
        var object = JSON.parse(jsonString.trim());
        this.style = new CodeStyle();
        this.sniff(jsonString);
        this.snapshot(object);
        return object;
    };
    JSONStabilizer.prototype.sniff = function (jsonString) {
        assertVar(jsonString, 'string', 'jsonString');
        var eolWin = 0;
        var eolNix = 0;
        var sampleLines = 10;
        var match;
        sniffExp.lastIndex = 0;
        while (sampleLines > 0 && (match = sniffExp.exec(jsonString))) {
            sniffExp.lastIndex = match.index + (match[0].length || 1);
            sampleLines--;
            if (match[2].length > 0) {
                if (match[2] === '\r\n') {
                    eolWin++;
                }
                else {
                    eolNix++;
                }
            }
        }
        this.style.trailingEOL = false;
        if (jsonString.length > 2) {
            lastEnd.lastIndex = 0;
            match = lastEnd.exec(jsonString);
            if (match && match[1].length > 0) {
                this.style.trailingEOL = true;
                if (match[1] === '\r\n') {
                    eolWin++;
                }
                else {
                    eolNix++;
                }
            }
        }
        this.style.indent = detectIndent(jsonString, '  ');
        this.style.eol = (eolWin > eolNix ? '\r\n' : '\n');
    };
    JSONStabilizer.prototype.snapshot = function (object) {
        var _this = this;
        assertVar(object, 'object', 'object');
        this.keys = Object.keys(object);
        this.children = new collection.Hash();
        if (this.depth > 0) {
            this.keys.forEach(function (key) {
                if (typeOf.isObject(object[key])) {
                    var child = new JSONStabilizer(_this.depth - 1);
                    child.parent = _this;
                    _this.children[key] = child;
                    child.snapshot(object[key]);
                }
            });
        }
    };
    JSONStabilizer.prototype.getStablized = function (json) {
        var _this = this;
        assertVar(json, 'object', 'json');
        var ret = {};
        var have = Object.keys(json);
        this.keys.forEach(function (key) {
            var i = have.indexOf(key);
            if (i > -1) {
                have.splice(i, 1);
                if (key in _this.children && typeOf.isObject(json[key])) {
                    ret[key] = _this.children[key].getStablized(json[key]);
                }
                else {
                    ret[key] = json[key];
                }
            }
        });
        have.forEach(function (key) {
            _this.keys.push(key);
            ret[key] = json[key];
        });
        return ret;
    };
    JSONStabilizer.prototype.toJSONString = function (json, assumeStable) {
        if (assumeStable === void 0) { assumeStable = false; }
        assertVar(json, 'object', 'json');
        if (!assumeStable) {
            json = this.getStablized(json);
        }
        var str = JSON.stringify(json, null, this.style.indent);
        if (this.style.eol !== '\n') {
            str = str.replace(/\r?\n/g, this.style.eol);
        }
        if (this.style.trailingEOL) {
            str += this.style.eol;
        }
        return str;
    };
    return JSONStabilizer;
})();
module.exports = JSONStabilizer;
