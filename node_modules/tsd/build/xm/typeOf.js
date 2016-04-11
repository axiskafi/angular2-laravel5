'use strict';
var typeDetect = require('type-detect');
var toString = Object.prototype.toString;
function get(value) {
    return typeDetect(value);
}
exports.get = get;
exports.jsonTypes = [
    'array',
    'object',
    'boolean',
    'number',
    'string',
    'null'
];
exports.primitiveTypes = [
    'boolean',
    'number',
    'string'
];
exports.valueTypes = [
    'boolean',
    'number',
    'string',
    'null'
];
var hasOwnProperty = Object.prototype.hasOwnProperty;
function hasOwnProp(value, prop) {
    return hasOwnProperty.call(value, prop);
}
exports.hasOwnProp = hasOwnProp;
function isType(value, type) {
    if (hasOwnProp(exports.typeMap, type)) {
        return exports.typeMap[type].call(null, value);
    }
    return false;
}
exports.isType = isType;
function isArguments(value) {
    return typeDetect(value) === 'arguments';
}
exports.isArguments = isArguments;
function isArray(value) {
    return typeDetect(value) === 'array';
}
exports.isArray = isArray;
function isDate(value) {
    return typeDetect(value) === 'date';
}
exports.isDate = isDate;
function isFunction(value) {
    return typeDetect(value) === 'function';
}
exports.isFunction = isFunction;
function isNumber(value) {
    return typeDetect(value) === 'number';
}
exports.isNumber = isNumber;
function isRegExp(value) {
    return typeDetect(value) === 'regexp';
}
exports.isRegExp = isRegExp;
function isString(value) {
    return typeDetect(value) === 'string';
}
exports.isString = isString;
function isNull(value) {
    return typeDetect(value) === 'null';
}
exports.isNull = isNull;
function isUndefined(value) {
    return typeDetect(value) === 'undefined';
}
exports.isUndefined = isUndefined;
function isObject(value) {
    return typeDetect(value) === 'object';
}
exports.isObject = isObject;
function isBoolean(value) {
    return typeDetect(value) === 'boolean';
}
exports.isBoolean = isBoolean;
function isArrayLike(value) {
    return (typeDetect(value) === 'array' || typeDetect(value) === 'arguments');
}
exports.isArrayLike = isArrayLike;
function isOk(value) {
    return !!value;
}
exports.isOk = isOk;
function isFlagOn(value) {
    if (!isValid(value)) {
        return false;
    }
    value = String(value).trim().toLowerCase();
    if (value === '' || value === '0') {
        return false;
    }
    switch (value) {
        case 'false':
        case 'null':
        case 'nan':
        case 'undefined':
        case 'no':
        case 'off':
        case 'disabled':
            return false;
    }
    return true;
}
exports.isFlagOn = isFlagOn;
function isValid(value) {
    var type = typeDetect(value);
    return !(type === 'undefined' || type === 'null' || (type === 'number' && isNaN(value)));
}
exports.isValid = isValid;
function isNaN(value) {
    return value !== value;
}
exports.isNaN = isNaN;
function isJSONValue(value) {
    return exports.jsonTypes.indexOf(typeDetect(value)) > -1;
}
exports.isJSONValue = isJSONValue;
function isPrimitive(value) {
    return exports.primitiveTypes.indexOf(typeDetect(value)) > -1;
}
exports.isPrimitive = isPrimitive;
function isValueType(value) {
    return exports.valueTypes.indexOf(typeDetect(value)) > -1;
}
exports.isValueType = isValueType;
function isSha(value) {
    if (typeof value !== 'string') {
        return false;
    }
    return /^[0-9a-f]{40}$/.test(value);
}
exports.isSha = isSha;
function isShaShort(value) {
    if (typeof value !== 'string') {
        return false;
    }
    return /^[0-9a-f]{6,40}$/.test(value);
}
exports.isShaShort = isShaShort;
function isMd5(value) {
    if (typeof value !== 'string') {
        return false;
    }
    return /^[0-9a-f]{32}$/.test(value);
}
exports.isMd5 = isMd5;
exports.typeMap = {
    arguments: isArguments,
    array: isArray,
    date: isDate,
    function: isFunction,
    number: isNumber,
    regexp: isRegExp,
    string: isString,
    null: isNull,
    undefined: isUndefined,
    object: isObject,
    boolean: isBoolean,
    ok: isOk,
    valid: isValid,
    sha1: isSha,
    md5: isMd5,
    jsonValue: isJSONValue
};
function getTypeOfMap(add) {
    var name;
    var value = Object.create(null);
    for (name in exports.typeMap) {
        if (hasOwnProp(exports.typeMap, name)) {
            if (!isFunction(exports.typeMap[name])) {
                throw new Error('bad typeOf function ' + name);
            }
            value[name] = exports.typeMap[name];
        }
    }
    if (add) {
        for (name in add) {
            if (hasOwnProp(add, name) && isFunction(add[name])) {
                value[name] = add[name];
            }
        }
    }
    return value;
}
exports.getTypeOfMap = getTypeOfMap;
function getTypeOfWrap(add) {
    var typeMap = getTypeOfMap(add);
    return function isTypeWrap(value, type) {
        if (hasOwnProp(typeMap, type)) {
            return typeMap[type].call(null, value);
        }
        return false;
    };
}
exports.getTypeOfWrap = getTypeOfWrap;
