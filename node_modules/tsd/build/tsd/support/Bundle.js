'use strict';
var path = require('path');
var Lazy = require('lazy.js');
var assertVar = require('../../xm/assertVar');
var splitExp = /(?:(.*)(\r?\n))|(?:(.+)($))/g;
var referenceTagExp = /\/\/\/[ \t]+<reference[ \t]*path=["']?([\w\.\/@_-]*)["']?[ \t]*\/>/g;
function fixWinDrive(ref) {
    return ref.replace(/^[a-z]:/, function (str) {
        return str.toUpperCase();
    });
}
var Bundle = (function () {
    function Bundle(target, baseDir) {
        this.lines = [];
        this.last = null;
        this.map = Object.create(null);
        this.eol = '\n';
        assertVar(target, 'string', 'target');
        this.target = fixWinDrive(target.replace(/^\.\//, ''));
        this.baseDir = fixWinDrive(baseDir || path.dirname(this.target));
    }
    Bundle.prototype.parse = function (content) {
        this.eol = '\n';
        var lineMatch;
        var refMatch;
        var line;
        var eolWin = 0;
        var eolNix = 0;
        splitExp.lastIndex = 0;
        while ((lineMatch = splitExp.exec(content))) {
            splitExp.lastIndex = lineMatch.index + lineMatch[0].length;
            line = new BundleLine(lineMatch[1]);
            this.lines.push(line);
            if (/\r\n/.test(lineMatch[2])) {
                eolWin++;
            }
            else {
                eolNix++;
            }
            referenceTagExp.lastIndex = 0;
            refMatch = referenceTagExp.exec(lineMatch[1]);
            if (refMatch && refMatch.length > 1) {
                line.ref = fixWinDrive(path.resolve(this.baseDir, refMatch[1]));
                this.map[line.ref] = line;
                this.last = line;
            }
        }
        this.eol = (eolWin > eolNix ? '\r\n' : '\n');
    };
    Bundle.prototype.has = function (ref) {
        ref = fixWinDrive(path.resolve(this.baseDir, ref));
        return (ref in this.map);
    };
    Bundle.prototype.append = function (ref) {
        ref = fixWinDrive(path.resolve(this.baseDir, ref));
        if (!(ref in this.map)) {
            var line = new BundleLine('', ref);
            this.map[ref] = line;
            if (this.last) {
                var i = this.lines.indexOf(this.last);
                if (i > -1) {
                    this.lines.splice(i + 1, 0, line);
                    this.last = line;
                    return ref;
                }
            }
            this.lines.push(line);
            this.last = line;
            return ref;
        }
        return null;
    };
    Bundle.prototype.remove = function (ref) {
        ref = fixWinDrive(path.resolve(this.baseDir, ref));
        if (ref in this.map) {
            var line = this.map[ref];
            var i = this.lines.indexOf(line);
            if (i > -1) {
                this.lines.splice(i, 1);
            }
            delete this.map[ref];
            if (line === this.last) {
                for (i -= 1; i >= 0; i--) {
                    if (this.lines[i].ref) {
                        this.last = this.lines[i];
                        return ref;
                    }
                }
            }
            this.last = null;
            return ref;
        }
        return null;
    };
    Bundle.prototype.toArray = function (relative, canonical) {
        if (relative === void 0) { relative = false; }
        if (canonical === void 0) { canonical = false; }
        var base = (relative ? path.dirname(this.target) : null);
        return Lazy(this.lines)
            .filter(function (line) { return !!line.ref; })
            .map(function (line) { return line.getRef(base, canonical); })
            .toArray();
    };
    Bundle.prototype.stringify = function () {
        var _this = this;
        var base = path.dirname(this.target);
        return this.lines.map(function (line) {
            return line.getValue(base) + _this.eol;
        }).join('');
    };
    return Bundle;
})();
var BundleLine = (function () {
    function BundleLine(value, ref) {
        this.value = value;
        this.ref = ref;
    }
    BundleLine.prototype.getRef = function (base, canonical) {
        var ref = this.ref;
        if (base) {
            ref = path.relative(base, ref);
        }
        if (canonical && path.sep === '\\') {
            ref = ref.replace(/\\/g, '/');
        }
        return ref;
    };
    BundleLine.prototype.getValue = function (base) {
        if (this.ref) {
            return '/// <reference path="' + this.getRef(base, true) + '" />';
        }
        return this.value;
    };
    return BundleLine;
})();
module.exports = Bundle;
