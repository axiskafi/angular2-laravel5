'use strict';
var typeOf = require('../../xm/typeOf');
var dateUtils = require('../../xm/dateUtils');
var GithubRateInfo = require('../../git/model/GithubRateInfo');
var defUtil = require('../util/defUtil');
var lineSplitExp = /[ \t]*[\r\n][ \t]*/g;
var CLIPrinter = (function () {
    function CLIPrinter(output, indent) {
        if (indent === void 0) { indent = 0; }
        this.indent = 0;
        this.skipProgress = [
            /^(?:\w+: )?written zero \w+ bytes/,
            /^(?:\w+: )?missing \w+ file/,
            /^(?:\w+: )?remote:/,
            /^(?:\w+: )?dropped from cache:/,
            /^(?:\w+: )?local:/,
            /^(?:\w+: )?update:/
        ];
        this._remainingPrev = -1;
        this.output = output;
        this.indent = indent;
        this.reportProgress = this.reportProgress.bind(this);
    }
    CLIPrinter.prototype.fmtSortKey = function (key) {
        return String(key).substr(0, 6);
    };
    CLIPrinter.prototype.fmtGitURI = function (str) {
        var _this = this;
        return String(str).replace(/https:\/\/[a-z]+\.github\.com\/(?:repos\/)?/g, '').replace(/([0-9a-f]{40})/g, function (match, p1) {
            return _this.fmtSortKey(p1);
        });
    };
    CLIPrinter.prototype.file = function (file, sep) {
        if (sep === void 0) { sep = ' : '; }
        if (file.def) {
            this.output.tweakPath(file.def.path);
        }
        else {
            this.output.accent('<no def>');
        }
        return this.output.accent(sep).glue(this.fileEnd(file, sep));
    };
    CLIPrinter.prototype.fileEnd = function (file, sep) {
        if (sep === void 0) { sep = ' | '; }
        if (file.def && file.def.head === file) {
            this.output.span('<head>');
            if (file.commit.changeDate) {
                this.output.accent(sep).span(dateUtils.toNiceUTC(file.commit.changeDate));
            }
        }
        else {
            if (file.commit) {
                this.output.span(file.commit.commitShort);
                if (file.commit.changeDate) {
                    this.output.accent(sep).span(dateUtils.toNiceUTC(file.commit.changeDate));
                }
            }
            else {
                this.output.accent(sep).accent('<no commit>');
            }
        }
        return this.output;
    };
    CLIPrinter.prototype.fileCommit = function (file, skipNull) {
        var _this = this;
        if (skipNull === void 0) { skipNull = false; }
        var sep = '  |  ';
        if (file.commit) {
            this.output.indent(1).glue(this.fileEnd(file, sep));
            this.output.accent(sep).span(file.commit.gitAuthor.name);
            if (file.commit.hubAuthor) {
                this.output.accent('  @  ').span(file.commit.hubAuthor.login);
            }
            this.output.ln().ln();
            this.output.indent(1).edge(true).line(file.commit.message.subject);
            if (file.commit.message.body) {
                this.output.indent(1).edge(true).ln();
                file.commit.message.body.split(lineSplitExp).every(function (line, index, lines) {
                    _this.output.indent(1).edge(true).line(line);
                    if (index < 10) {
                        return true;
                    }
                    _this.output.indent(1).edge(true).line('<...>');
                    return false;
                });
            }
        }
        else if (!skipNull) {
            this.output.indent(1).accent('<no commmit>').ln();
        }
        return this.output;
    };
    CLIPrinter.prototype.fileHead = function (file) {
        return this.output.indent(0).bullet(true).glue(this.file(file)).ln();
    };
    CLIPrinter.prototype.fileInfo = function (file, skipNull) {
        var _this = this;
        if (skipNull === void 0) { skipNull = false; }
        if (file.info) {
            this.output.line();
            if (file.info.isValid()) {
                this.output.indent(1).tweakPunc(file.info.toString());
                file.info.projects.forEach(function (url) {
                    _this.output.space().tweakURI(url, true, true);
                });
                this.output.ln();
                if (file.info.authors) {
                    this.output.ln();
                    file.info.authors.forEach(function (author) {
                        _this.output.indent(1).bullet(true).span(author.name);
                        if (author.url) {
                            _this.output.space().tweakURI(author.url, true, true);
                        }
                        _this.output.ln();
                    });
                }
            }
            else {
                this.output.indent(1).accent('<invalid info>').line();
            }
        }
        else if (!skipNull) {
            this.output.line();
            this.output.indent(1).accent('<no info>').line();
        }
        return this.output;
    };
    CLIPrinter.prototype.dependencies = function (file) {
        var _this = this;
        if (file.dependencies.length > 0) {
            this.output.line();
            var deps = defUtil.mergeDependenciesOf(file.dependencies).filter(function (refer) {
                return refer.def.path !== file.def.path;
            });
            if (deps.length > 0) {
                deps.filter(function (refer) {
                    return refer.def.path !== file.def.path;
                }).sort(defUtil.fileCompare).forEach(function (refer) {
                    _this.output.indent(1).report(true).glue(_this.file(refer)).ln();
                });
            }
        }
        return this.output;
    };
    CLIPrinter.prototype.history = function (file) {
        var _this = this;
        if (file.def.history.length > 0) {
            this.output.line();
            file.def.history.slice(0).reverse().forEach(function (file, i) {
                _this.fileCommit(file);
                _this.output.cond(i < file.def.history.length - 1, '\n');
            });
        }
        return this.output;
    };
    CLIPrinter.prototype.installResult = function (result) {
        var _this = this;
        var keys = result.written.keys();
        if (keys.length === 0) {
            this.output.ln().report(true).span('written ').accent('zero').span(' files').ln();
        }
        else if (keys.length === 1) {
            this.output.ln().report(true).span('written ').accent(keys.length).span(' file:').ln().ln();
        }
        else {
            this.output.ln().report(true).span('written ').accent(keys.length).span(' files:').ln().ln();
        }
        keys.sort().forEach(function (path) {
            _this.output.indent().bullet(true);
            var file = result.written.get(path);
            if (file.def) {
                _this.output.tweakPath(file.def.path);
            }
            else {
                _this.output.accent('<no def>');
            }
            _this.output.ln();
        });
        return this.output;
    };
    CLIPrinter.prototype.rateInfo = function (info, note, force) {
        if (note === void 0) { note = false; }
        if (force === void 0) { force = false; }
        var warnLim = 10;
        var goodLim = 30;
        var stealthLim = 45;
        if (info.remaining === this._remainingPrev && !force) {
            return this.output;
        }
        this._remainingPrev = info.remaining;
        if (info.remaining === info.limit && !force) {
            return this.output;
        }
        if (info.remaining > stealthLim && !force) {
            return this.output;
        }
        if (note) {
            this.output.indent(1);
        }
        else {
            this.output.line();
        }
        this.output.note(true).span('rate-limit').sp();
        if (info.limit > 0) {
            if (info.remaining === 0) {
                this.output.error(info.remaining).span(' / ').error(info.limit).span(' -> ').error(info.getResetString());
            }
            else if (info.remaining <= warnLim) {
                this.output.warning(info.remaining).span(' / ').warning(info.limit).span(' -> ').warning(info.getResetString());
            }
            else if (info.remaining <= goodLim) {
                this.output.success(info.remaining).span(' / ').success(info.limit).span(' -> ').success(info.getResetString());
            }
            else {
                this.output.accent(info.remaining).span(' / ').accent(info.limit);
                if (force) {
                    this.output.span(' -> ').success(info.getResetString());
                }
            }
        }
        else {
            this.output.success(info.getResetString());
        }
        return this.output.ln();
    };
    CLIPrinter.prototype.reportError = function (err, head) {
        if (head === void 0) { head = true; }
        if (head) {
            this.output.ln().info().error('an error occured!').clear();
        }
        this.output.line(err.message);
        if (err.stack) {
            return this.output.block(err.stack);
        }
        return this.output.line(err);
    };
    CLIPrinter.prototype.reportProgress = function (obj) {
        var _this = this;
        if (obj instanceof GithubRateInfo) {
            return this.rateInfo(obj, true);
        }
        if (typeOf.isObject(obj)) {
            if (obj.data instanceof GithubRateInfo) {
                return this.rateInfo(obj.data, true);
            }
            if (obj.message) {
                if (this.skipProgress.some(function (exp) {
                    return exp.test(obj.message);
                })) {
                    return this.output;
                }
            }
            this.output.indent().note(true);
            if (typeOf.isValid(obj.code)) {
                this.output.label(obj.code);
            }
            if (obj.message) {
                var msg = this.fmtGitURI(String(obj.message));
                msg = msg.replace(/([\w\\\/])(: )([\w\\\/\.-])/g, function (match, p1, p2, p3) {
                    return p1 + _this.output.getStyle().accent(p2) + p3;
                });
                msg = msg.replace(' -> ', this.output.getStyle().accent(' -> '));
                this.output.write(msg);
            }
            else {
                this.output.span('<no message>');
            }
            if (obj.data) {
                this.output.sp().inspect(obj, 3);
            }
            else {
                this.output.ln();
            }
            return this.output;
        }
        else {
            return this.output.indent().note(true).span(String(obj)).ln();
        }
        return this.output.indent().note(true).label(typeOf.get(obj)).inspect(obj, 3);
    };
    return CLIPrinter;
})();
module.exports = CLIPrinter;
