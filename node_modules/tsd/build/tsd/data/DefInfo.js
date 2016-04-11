'use strict';
var DefInfo = (function () {
    function DefInfo() {
        this.externals = [];
        this.resetAll();
    }
    DefInfo.prototype.resetFields = function () {
        this.name = '';
        this.version = '';
        this.projects = [];
        this.authors = [];
    };
    DefInfo.prototype.resetAll = function () {
        this.resetFields();
    };
    DefInfo.prototype.toString = function () {
        return this.name;
    };
    DefInfo.prototype.isValid = function () {
        if (!this.name) {
            return false;
        }
        return true;
    };
    return DefInfo;
})();
module.exports = DefInfo;
