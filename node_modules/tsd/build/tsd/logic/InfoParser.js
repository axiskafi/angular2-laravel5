'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Promise = require('bluebird');
var header = require('definition-header');
var CoreModule = require('./CoreModule');
var DefInfo = require('../data/DefInfo');
var defUtil = require('../util/defUtil');
var AuthorInfo = require('../support/AuthorInfo');
var InfoParser = (function (_super) {
    __extends(InfoParser, _super);
    function InfoParser(core) {
        _super.call(this, core, 'InfoParser');
    }
    InfoParser.prototype.parseDefInfo = function (file) {
        return this.core.content.loadContent(file).then(function (blob) {
            var source = blob.content.toString('utf8');
            if (file.info) {
                file.info.resetFields();
            }
            else {
                file.info = new DefInfo();
            }
            file.info.externals = defUtil.extractExternals(source);
            if (header.isPartial(source)) {
                file.info.partial = true;
                return file;
            }
            var res = header.parse(source);
            if (res.success) {
                var head = res.value;
                file.info.name = head.label.name;
                file.info.version = (head.label.version || '');
                file.info.projects = head.project.map(function (p) { return p.url; });
                file.info.authors = head.authors.map(function (a) {
                    return new AuthorInfo(a.name, a.url);
                });
            }
            return file;
        });
    };
    InfoParser.prototype.parseDefInfoBulk = function (list) {
        var _this = this;
        list = defUtil.uniqueDefVersion(list);
        return Promise.map(list, function (file) {
            return _this.parseDefInfo(file);
        });
    };
    return InfoParser;
})(CoreModule);
module.exports = InfoParser;
