'use strict';
var uriTemplates = require('uri-templates');
var typeOf = require('../typeOf');
var URLManager = (function () {
    function URLManager(common) {
        this._templates = Object.create(null);
        this._vars = Object.create(null);
        if (common) {
            this.setVars(common);
        }
    }
    URLManager.prototype.addTemplate = function (id, url) {
        if (id in this._templates) {
            throw (new Error('cannot redefine template: ' + id));
        }
        this._templates[id] = uriTemplates(url);
    };
    URLManager.prototype.setVar = function (id, value) {
        this._vars[id] = value;
    };
    URLManager.prototype.getVar = function (id) {
        return (id in this._vars ? this._vars[id] : null);
    };
    URLManager.prototype.setVars = function (map) {
        var _this = this;
        Object.keys(map).forEach(function (id) {
            if (typeOf.isValid(map[id])) {
                _this._vars[id] = map[id];
            }
            else {
                delete _this._vars[id];
            }
        });
    };
    URLManager.prototype.getTemplate = function (id) {
        if (id in this._templates) {
            return this._templates[id];
        }
        throw (new Error('undefined url template: ' + id));
    };
    URLManager.prototype.getURL = function (id, vars) {
        if (vars) {
            var obj = Object.create(this._vars);
            Object.keys(vars).forEach(function (id) {
                if (typeOf.isValid(vars[id])) {
                    obj[id] = vars[id];
                }
            });
            return this.getTemplate(id).fillFromObject(obj);
        }
        return this.getTemplate(id).fillFromObject(this._vars);
    };
    return URLManager;
})();
module.exports = URLManager;
