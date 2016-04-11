'use strict';
var typeOf = require('./typeOf');
function defineProp(object, property, settings) {
    Object.defineProperty(object, property, settings);
}
exports.defineProp = defineProp;
function defineProps(object, propertyNames, settings) {
    propertyNames.forEach(function (property) {
        defineProp(object, property, settings);
    });
}
exports.defineProps = defineProps;
function lockProps(object, props, ownOnly) {
    if (ownOnly === void 0) { ownOnly = true; }
    if (!props) {
        Object.keys(object).forEach(function (property) {
            Object.defineProperty(object, property, { writable: false });
        });
    }
    else {
        props.forEach(function (property) {
            if (!ownOnly || typeOf.hasOwnProp(object, property)) {
                Object.defineProperty(object, property, { writable: false });
            }
        });
    }
}
exports.lockProps = lockProps;
function lockPrimitives(object) {
    Object.keys(object).forEach(function (property) {
        if (typeOf.isPrimitive(object[property])) {
            Object.defineProperty(object, property, { writable: false });
        }
    });
}
exports.lockPrimitives = lockPrimitives;
