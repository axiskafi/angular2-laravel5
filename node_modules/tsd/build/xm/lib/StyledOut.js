'use strict';
var util = require('util');
var miniwrite = require('miniwrite');
var ministyle = require('ministyle');
var encode = require('../encode');
var typeOf = require('../typeOf');
var StyledOut = (function () {
    function StyledOut(write, style) {
        this._tabSize = 3;
        this.nibs = {
            arrow: '-> ',
            double: '>> ',
            single: ' > ',
            bullet: ' - ',
            edge: ' | ',
            ruler: '---',
            shell: ' $ ',
            dash: '-- ',
            decl: ' : ',
            none: '   '
        };
        if (style) {
            ministyle.assertMiniStyle(style);
        }
        if (write) {
            miniwrite.assertMiniWrite(write);
        }
        this._style = (style || ministyle.ansi());
        this._line = miniwrite.chars((write || miniwrite.log()));
    }
    StyledOut.prototype.write = function (str) {
        this._line.write(str);
        return this;
    };
    StyledOut.prototype.line = function (str) {
        if (arguments.length < 1 || typeof str === 'undefined') {
            this._line.writeln('');
        }
        else {
            this._line.writeln(this._style.plain(str));
        }
        return this;
    };
    StyledOut.prototype.ln = function () {
        this._line.writeln('');
        return this;
    };
    StyledOut.prototype.span = function (str) {
        this._line.write(this._style.plain(str));
        return this;
    };
    StyledOut.prototype.block = function (str) {
        this._line.writeln(this._style.plain(str));
        return this;
    };
    StyledOut.prototype.clear = function () {
        this._line.writeln('');
        this._line.writeln('');
        return this;
    };
    StyledOut.prototype.ruler = function (levels) {
        if (levels === void 0) { levels = 1; }
        var str = '';
        for (var i = 0; i < levels; i++) {
            str += this.nibs.ruler;
        }
        this._line.writeln(str);
        return this;
    };
    StyledOut.prototype.heading = function (str, level) {
        if (level === void 0) { level = 1; }
        this._line.writeln(this._style.accent(str));
        var l = Math.max(0, 3 - level);
        if (l > 0) {
            this.ruler(l);
        }
        return this;
    };
    StyledOut.prototype.plain = function (str) {
        this._line.writeln(this._style.plain(str));
        return this;
    };
    StyledOut.prototype.accent = function (str) {
        this._line.write(this._style.accent(str));
        return this;
    };
    StyledOut.prototype.signal = function (str) {
        this._line.write(this._style.signal(str));
        return this;
    };
    StyledOut.prototype.muted = function (str) {
        this._line.write(this._style.muted(str));
        return this;
    };
    StyledOut.prototype.space = function () {
        this._line.write(this._style.plain(' '));
        return this;
    };
    StyledOut.prototype.sp = function () {
        this._line.write(this._style.plain(' '));
        return this;
    };
    StyledOut.prototype.success = function (str) {
        this._line.write(this._style.success(str));
        return this;
    };
    StyledOut.prototype.warning = function (str) {
        this._line.write(this._style.warning(str));
        return this;
    };
    StyledOut.prototype.error = function (str) {
        this._line.write(this._style.error(str));
        return this;
    };
    StyledOut.prototype.cond = function (condition, str, alt) {
        if (condition) {
            this._line.write(this._style.plain(str));
        }
        else if (arguments.length > 2) {
            this._line.write(this._style.plain(alt));
        }
        return this;
    };
    StyledOut.prototype.alt = function (str, alt) {
        if (typeOf.isValid(str) && !/^\s$/.test(str)) {
            this._line.write(this._style.plain(str));
        }
        else if (arguments.length > 1) {
            this._line.write(this._style.plain(alt));
        }
        return this;
    };
    StyledOut.prototype.inspect = function (value, depth, showHidden) {
        if (depth === void 0) { depth = 4; }
        if (showHidden === void 0) { showHidden = false; }
        this._line.writeln(this._style.plain(util.inspect(value, { showHidden: showHidden, depth: depth })));
        return this;
    };
    StyledOut.prototype.stringWrap = function (str) {
        this._line.write(this._style.plain(encode.wrapIfComplex(str)));
        return this;
    };
    StyledOut.prototype.glue = function (out) {
        return this;
    };
    StyledOut.prototype.swap = function (out) {
        return out;
    };
    StyledOut.prototype.label = function (label) {
        this._line.write(this._style.plain(encode.wrapIfComplex(label) + ': '));
        return this;
    };
    StyledOut.prototype.indent = function (levels) {
        if (levels === void 0) { levels = 1; }
        if (levels > 0) {
            var str = '';
            for (var i = 0; i < levels; i++) {
                str += this.nibs.none;
            }
            this._line.write(str);
        }
        return this;
    };
    StyledOut.prototype.bullet = function (accent) {
        if (accent === void 0) { accent = false; }
        if (accent) {
            this._line.write(this._style.accent(this.nibs.bullet));
        }
        else {
            this._line.write(this._style.plain(this.nibs.bullet));
        }
        return this;
    };
    StyledOut.prototype.index = function (num) {
        this._line.write(this._style.plain(String(num) + ': '));
        return this;
    };
    StyledOut.prototype.info = function (accent) {
        if (accent === void 0) { accent = false; }
        if (accent) {
            this._line.write(this._style.accent(this.nibs.arrow));
        }
        else {
            this._line.write(this._style.plain(this.nibs.arrow));
        }
        return this;
    };
    StyledOut.prototype.report = function (accent) {
        if (accent === void 0) { accent = false; }
        if (accent) {
            this._line.write(this._style.accent(this.nibs.double));
        }
        else {
            this._line.write(this._style.plain(this.nibs.double));
        }
        return this;
    };
    StyledOut.prototype.note = function (accent) {
        if (accent === void 0) { accent = false; }
        if (accent) {
            this._line.write(this._style.accent(this.nibs.single));
        }
        else {
            this._line.write(this._style.plain(this.nibs.single));
        }
        return this;
    };
    StyledOut.prototype.shell = function (accent) {
        if (accent === void 0) { accent = false; }
        if (accent) {
            this._line.write(this._style.accent(this.nibs.shell));
        }
        else {
            this._line.write(this._style.plain(this.nibs.shell));
        }
        return this;
    };
    StyledOut.prototype.dash = function (accent) {
        if (accent === void 0) { accent = false; }
        if (accent) {
            this._line.write(this._style.accent(this.nibs.dash));
        }
        else {
            this._line.write(this._style.plain(this.nibs.dash));
        }
        return this;
    };
    StyledOut.prototype.edge = function (accent) {
        if (accent === void 0) { accent = false; }
        if (accent) {
            this._line.write(this._style.accent(this.nibs.edge));
        }
        else {
            this._line.write(this._style.plain(this.nibs.edge));
        }
        return this;
    };
    StyledOut.prototype.tweakURI = function (str, trimHttp, wrapAngles) {
        if (trimHttp === void 0) { trimHttp = false; }
        if (wrapAngles === void 0) { wrapAngles = false; }
        var repAccent = this._style.accent('/');
        if (wrapAngles) {
            this._line.write(this._style.muted('<'));
        }
        if (trimHttp) {
            this._line.write(str.replace(/^\w+?:\/\//, '').replace(/\//g, repAccent));
        }
        else {
            this._line.write(str.split(/:\/\//).map(function (str) {
                return str.replace(/\//g, repAccent);
            }).join(this._style.accent('://')));
        }
        if (wrapAngles) {
            this._line.write(this._style.muted('>'));
        }
        return this;
    };
    StyledOut.prototype.tweakPath = function (str, muted) {
        if (muted === void 0) { muted = false; }
        return this.tweakExp(str, /\//g, muted);
    };
    StyledOut.prototype.tweakPunc = function (str, muted) {
        if (muted === void 0) { muted = false; }
        return this.tweakExp(str, /[\/\.,_-]/g, muted);
    };
    StyledOut.prototype.tweakBraces = function (str, muted) {
        if (muted === void 0) { muted = false; }
        return this.tweakExp(str, /[\[\{\(\<>\)\}\]]/g, muted);
    };
    StyledOut.prototype.tweakExp = function (str, expr, muted) {
        var _this = this;
        if (muted === void 0) { muted = false; }
        if (muted) {
            this._line.write(str.replace(expr, function (value) {
                return _this._style.muted(value);
            }));
            return this;
        }
        this._line.write(str.replace(expr, function (value) {
            return _this._style.accent(value);
        }));
        return this;
    };
    StyledOut.prototype.unfunk = function () {
        this._line.flush();
        this._style = ministyle.plain();
        return this;
    };
    StyledOut.prototype.finalise = function () {
        this._line.flush();
    };
    StyledOut.prototype.useStyle = function (mini) {
        ministyle.assertMiniStyle(mini);
        this._style = mini;
        return this;
    };
    StyledOut.prototype.useWrite = function (mini) {
        miniwrite.assertMiniWrite(mini);
        this._line.useTarget(mini);
        return this;
    };
    StyledOut.prototype.getWrite = function () {
        return this._line;
    };
    StyledOut.prototype.getStyle = function () {
        return this._style;
    };
    return StyledOut;
})();
module.exports = StyledOut;
