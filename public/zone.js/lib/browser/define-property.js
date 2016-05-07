System.register(["../common/utils"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var utils_1;
    var _defineProperty, _getOwnPropertyDescriptor, _create, unconfigurablesKey;
    function propertyPatch() {
        Object.defineProperty = function (obj, prop, desc) {
            if (isUnconfigurable(obj, prop)) {
                throw new TypeError('Cannot assign to read only property \'' + prop + '\' of ' + obj);
            }
            if (prop !== 'prototype') {
                desc = rewriteDescriptor(obj, prop, desc);
            }
            return _defineProperty(obj, prop, desc);
        };
        Object.defineProperties = function (obj, props) {
            Object.keys(props).forEach(function (prop) {
                Object.defineProperty(obj, prop, props[prop]);
            });
            return obj;
        };
        Object.create = function (obj, proto) {
            if (typeof proto === 'object') {
                Object.keys(proto).forEach(function (prop) {
                    proto[prop] = rewriteDescriptor(obj, prop, proto[prop]);
                });
            }
            return _create(obj, proto);
        };
        Object.getOwnPropertyDescriptor = function (obj, prop) {
            var desc = _getOwnPropertyDescriptor(obj, prop);
            if (isUnconfigurable(obj, prop)) {
                desc.configurable = false;
            }
            return desc;
        };
    }
    exports_1("propertyPatch", propertyPatch);
    function _redefineProperty(obj, prop, desc) {
        desc = rewriteDescriptor(obj, prop, desc);
        return _defineProperty(obj, prop, desc);
    }
    exports_1("_redefineProperty", _redefineProperty);
    function isUnconfigurable(obj, prop) {
        return obj && obj[unconfigurablesKey] && obj[unconfigurablesKey][prop];
    }
    function rewriteDescriptor(obj, prop, desc) {
        desc.configurable = true;
        if (!desc.configurable) {
            if (!obj[unconfigurablesKey]) {
                _defineProperty(obj, unconfigurablesKey, { writable: true, value: {} });
            }
            obj[unconfigurablesKey][prop] = true;
        }
        return desc;
    }
    return {
        setters:[
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }],
        execute: function() {
            /*
             * This is necessary for Chrome and Chrome mobile, to enable
             * things like redefining `createdCallback` on an element.
             */
            _defineProperty = Object.defineProperty;
            _getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
            _create = Object.create;
            unconfigurablesKey = utils_1.zoneSymbol('unconfigurables');
            ;
            ;
        }
    }
});
//# sourceMappingURL=define-property.js.map