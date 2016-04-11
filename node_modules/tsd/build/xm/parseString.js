'use strict';
var typeOf = require('./typeOf');
exports.parseStringMap = Object.create(null);
var splitSV = /[\t ]*[,][\t ]*/g;
exports.parseStringMap.number = function (input) {
    var num = parseFloat(input);
    if (typeOf.isNaN(num)) {
        throw new Error('input is NaN and not float');
    }
    return num;
};
exports.parseStringMap.int = function (input) {
    var num = parseInt(input, 10);
    if (typeOf.isNaN(num)) {
        throw new Error('input is NaN and not integer');
    }
    return num;
};
exports.parseStringMap.string = function (input) {
    return String(input);
};
exports.parseStringMap.boolean = function (input) {
    input = ('' + input).toLowerCase();
    if (input === '' || input === '0') {
        return false;
    }
    switch (input) {
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
};
exports.parseStringMap.flag = function (input) {
    if (typeOf.isUndefined(input) || input === '') {
        return true;
    }
    return exports.parseStringMap.boolean(input);
};
exports.parseStringMap['number[]'] = function (input) {
    if (!typeOf.isString(input)) {
        return [];
    }
    return input.split(splitSV).map(function (value) {
        return exports.parseStringMap.number(value);
    });
};
exports.parseStringMap['int[]'] = function (input) {
    if (!typeOf.isString(input)) {
        return [];
    }
    return input.split(splitSV).map(function (value) {
        return exports.parseStringMap.int(value);
    });
};
exports.parseStringMap['string[]'] = function (input) {
    if (!typeOf.isString(input)) {
        return [];
    }
    return input.split(splitSV);
};
exports.parseStringMap.json = function (input) {
    if (!typeOf.isString(input)) {
        return null;
    }
    return JSON.parse(input);
};
function parseStringTo(input, type) {
    if (typeOf.hasOwnProp(exports.parseStringMap, type)) {
        return exports.parseStringMap[type](input);
    }
    return String(input);
}
exports.parseStringTo = parseStringTo;
