'use strict';
var minitable = require('minitable');
var cliUtils = require('./cliUtils');
var dateUtils = require('../../xm/dateUtils');
var stringUtils = require('../../xm/stringUtils');
var defUtil = require('../util/defUtil');
var TablePrinter = (function () {
    function TablePrinter(output, indent) {
        if (indent === void 0) { indent = 0; }
        this.indent = 0;
        this.output = output;
        this.indent = indent;
    }
    TablePrinter.prototype.outTweakURI = function (uri, out) {
        uri = uri.replace(/^\w+?:\/\//, '').replace(/\/$/g, '');
        out.plain(uri);
    };
    TablePrinter.prototype.fileTable = function (files) {
        var _this = this;
        var builder = minitable.getBuilder(this.output.getWrite(), this.output.getStyle());
        var filePrint = builder.createType('results', [
            { name: 'project' },
            { name: 'slash' },
            { name: 'name' },
            { name: 'sep1' },
            { name: 'commit' },
            { name: 'sep2' },
            { name: 'date' }
        ], {
            inner: ' ',
            rowSpace: 0
        });
        var infoPrint = builder.createType('label', [
            { name: 'label' },
            { name: 'url' }
        ], {
            inner: ' ',
            rowSpace: 0
        });
        var commitPrint = builder.createType('label', [
            { name: 'block' }
        ], {
            outer: '   ',
            rowSpace: 0
        });
        filePrint.init();
        infoPrint.init();
        commitPrint.init();
        files.sort(defUtil.fileCompare).forEach(function (file, i) {
            filePrint.next();
            filePrint.row.project.out.accent(' - ').plain(file.def.project);
            filePrint.row.slash.out.accent('/');
            filePrint.row.name.out.plain(file.def.nameTerm);
            if (file.def.head !== file && file.commit) {
                filePrint.row.sep1.out.accent(':');
                filePrint.row.commit.out.plain(file.commit.commitShort);
                filePrint.row.sep2.out.accent(':');
                filePrint.row.date.out.plain(dateUtils.toNiceUTC(file.commit.changeDate));
            }
            if (file.dependencies && file.dependencies.length > 0) {
                var deps = defUtil.mergeDependenciesOf(file.dependencies).filter(function (refer) {
                    return refer.def.path !== file.def.path;
                });
                deps.forEach(function (file) {
                    filePrint.next();
                    filePrint.row.project.out.indent().accent('-> ').plain(file.def.project);
                    filePrint.row.slash.out.accent('>');
                    filePrint.row.name.out.plain(file.def.nameTerm);
                });
            }
            filePrint.close();
            if (file.info) {
                if (file.info.partial) {
                    infoPrint.next();
                    infoPrint.row.label.out.indent().accent(' ! ').plain('partial').ln();
                }
                else {
                    if (file.def.releases && file.def.releases.length > 0) {
                        infoPrint.next();
                        infoPrint.row.label.out.indent().accent(' v ').plain('latest');
                        file.def.releases.sort(defUtil.defSemverCompare).forEach(function (def) {
                            infoPrint.next();
                            infoPrint.row.label.out.indent().accent(' v ').plain(def.semver).ln();
                        });
                    }
                    infoPrint.next();
                    infoPrint.row.label.out.indent().accent('>> ').plain(file.info.name);
                    if (file.info.version) {
                        infoPrint.row.label.out.plain(' ').plain(file.info.version);
                    }
                    file.info.projects.forEach(function (url) {
                        infoPrint.row.url.out.accent(': ');
                        _this.outTweakURI(url, infoPrint.row.url.out);
                        infoPrint.next();
                    });
                    if (file.info.authors && file.info.authors.length > 0) {
                        file.info.authors.forEach(function (author) {
                            infoPrint.next();
                            infoPrint.row.label.out.indent().accent(' @ ').plain(author.name);
                            if (author.url) {
                                infoPrint.row.url.out.accent(': ');
                                _this.outTweakURI(author.url, infoPrint.row.url.out);
                            }
                        });
                    }
                    if (file.info.externals && file.info.externals.length > 0) {
                        file.info.externals.forEach(function (external) {
                            infoPrint.next();
                            infoPrint.row.label.out.indent().accent(' < ').plain(external + ' (external module)');
                        });
                    }
                }
                infoPrint.close();
            }
            if (file.def.history.length > 0) {
                var textWidth = cliUtils.getViewWidth(76, 96);
                var out = commitPrint.row.block.out;
                out.ln();
                file.def.history.slice(0).reverse().forEach(function (file, i) {
                    commitPrint.next();
                    out.plain(file.commit.commitShort);
                    if (file.commit.changeDate) {
                        out.accent(' | ').plain(dateUtils.toNiceUTC(file.commit.changeDate));
                    }
                    out.accent(' | ').plain(file.commit.gitAuthor.name);
                    if (file.commit.hubAuthor) {
                        out.accent(' @ ').plain(file.commit.hubAuthor.login);
                    }
                    out.ln();
                    stringUtils.wordWrap(file.commit.message.subject, textWidth).forEach(function (line, index) {
                        out.accent(' | ').line(line);
                    });
                    if (file.commit.message.body) {
                        out.accent(' | ').ln();
                        stringUtils.wordWrap(file.commit.message.body, textWidth).every(function (line, index) {
                            out.accent(' | ').line(line);
                            if (index < 10) {
                                return true;
                            }
                            out.accent(' | ').line('<...>');
                            return false;
                        });
                    }
                    if (i < file.def.history.length - 1) {
                        out.ln();
                    }
                    commitPrint.close();
                });
            }
            if (file.info || file.def.history.length > 0) {
                if (i < files.length - 1) {
                    filePrint.next();
                    filePrint.row.project.out.ln();
                    filePrint.close();
                }
            }
        });
        builder.flush();
    };
    return TablePrinter;
})();
module.exports = TablePrinter;
