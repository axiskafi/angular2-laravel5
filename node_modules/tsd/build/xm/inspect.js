'use strict';
var typeDetect = require('type-detect');
var encode = require('./encode');
function getFuncLabel(func) {
    var match = /^\s?function ([^( ]*) *\( *([^(]*?) *\)/.exec(String(func));
    if (match && match.length >= 3) {
        return match[1] + '(' + match[2] + ')';
    }
    if (func.name) {
        return func.name;
    }
    return '<anonymous>';
}
exports.getFuncLabel = getFuncLabel;
function toValueStrim(obj, depth, cutoff) {
    if (depth === void 0) { depth = 4; }
    if (cutoff === void 0) { cutoff = 80; }
    var type = typeDetect(obj);
    depth--;
    switch (type) {
        case 'boolean':
        case 'regexp':
            return obj.toString();
        case 'null':
        case 'undefined':
            return type;
        case 'number':
            return obj.toString(10);
        case 'string':
            return encode.trimWrap(obj, cutoff, true);
        case 'date':
            return obj.toISOString();
        case 'function':
            return getFuncLabel(obj);
        case 'arguments':
        case 'array':
            {
                if (depth <= 0) {
                    return '<maximum recursion>';
                }
                return '[' + encode.trim(obj.map(function (value) {
                    return encode.trim(value, depth);
                }).join(','), cutoff) + ']';
            }
        case 'object':
            {
                if (depth <= 0) {
                    return '<maximum recursion>';
                }
                return encode.trim(String(obj) + ' {' + Object.keys(obj).sort().map(function (key) {
                    return encode.trim(key) + ':' + toValueStrim(obj[key], depth);
                }).join(','), cutoff) + '}';
            }
        default:
            throw (new Error('toValueStrim: cannot serialise type: ' + type));
    }
}
exports.toValueStrim = toValueStrim;
