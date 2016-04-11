'use strict';
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Promise = require('bluebird');
var collection = require('../collection');
var ActionMap = (function (_super) {
    __extends(ActionMap, _super);
    function ActionMap(data) {
        _super.call(this, data);
    }
    ActionMap.prototype.run = function (id, call, optional) {
        var _this = this;
        if (optional === void 0) { optional = false; }
        return Promise.attempt(function () {
            if (_this.has(id)) {
                return call(_this.get(id));
            }
            if (!optional) {
                throw new Error('missing action: ' + id);
            }
            return null;
        });
    };
    ActionMap.prototype.runSerial = function (queue, call, optional) {
        var _this = this;
        if (optional === void 0) { optional = false; }
        return Promise.map(queue, function (id) {
            return _this.run(id, call, optional);
        });
    };
    return ActionMap;
})(collection.Hash);
module.exports = ActionMap;
