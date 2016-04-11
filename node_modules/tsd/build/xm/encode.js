'use strict';
var typeOf = require('./typeOf');
var stringExp = /^[a-z](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
var stringQuote = '"';
var identExp = /^[a-z](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
var identAnyExp = /^[a-z0-9](?:[a-z0-9_\-]*?[a-z0-9])?$/i;
var intExp = /^\d+$/;
var escapeRep = '\\$&';
var escapeAdd = '\\$&$&';
exports.singleQuoteExp = /([^'\\]*(?:\\.[^'\\]*)*)'/g;
exports.doubleQuoteExp = /([^"\\]*(?:\\.[^"\\]*)*)"/g;
function getEscaper(vars) {
    var values = (typeOf.isString(vars.values) ? vars.values.split('') : vars.values);
    var matches = (typeOf.isString(vars.matches) ? vars.matches.split('') : vars.matches);
    var replacer = function (match) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var i = matches.indexOf(match);
        if (i > -1 && i < values.length) {
            return '\\' + values[i];
        }
        return match;
    };
    var exp = new RegExp('[' + values.map(function (char) {
        return '\\' + char;
    }).join('') + ']', 'g');
    return function (input) {
        return input.replace(exp, replacer);
    };
}
exports.getEscaper = getEscaper;
function getMultiReplacer(vars) {
    var values = vars.values;
    var matches = vars.matches;
    var replacer = function (match) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var i = matches.indexOf(match);
        if (i > -1 && i < values.length) {
            return values[i];
        }
        return match;
    };
    var exp = new RegExp(vars.exps.map(function (char) {
        return '(?:' + char + ')';
    }).join('|'), 'g');
    return function (input) {
        return input.replace(exp, replacer);
    };
}
exports.getMultiReplacer = getMultiReplacer;
exports.unprintCC = getEscaper({
    matches: '\b\f\n\r\t\v\0',
    values: 'bfnrtv0'
});
exports.unprintNL = getEscaper({
    matches: '\r\n',
    values: 'rn'
});
exports.unprintNotNL = getEscaper({
    matches: '\b\f\t\v\0',
    values: 'bftv0'
});
exports.unprintNLS = getMultiReplacer({
    exps: ['\\r\\n', '\\n', '\\r'],
    matches: ['\r\n', '\n', '\r'],
    values: ['\\r\\n\r\n', '\\n\n', '\\r\r']
});
function quoteSingle(input) {
    return input.replace(exports.singleQuoteExp, '$1\\\'');
}
exports.quoteSingle = quoteSingle;
function quoteDouble(input) {
    return input.replace(exports.doubleQuoteExp, '$1\\"');
}
exports.quoteDouble = quoteDouble;
function quoteSingleWrap(input) {
    return '\'' + input.replace(exports.singleQuoteExp, '$1\\\'') + '\'';
}
exports.quoteSingleWrap = quoteSingleWrap;
function quoteDoubleWrap(input) {
    return '"' + input.replace(exports.doubleQuoteExp, '$1\\"') + '"';
}
exports.quoteDoubleWrap = quoteDoubleWrap;
function escapeControl(input, reAddNewlines) {
    if (reAddNewlines === void 0) { reAddNewlines = false; }
    input = String(input);
    if (reAddNewlines) {
        return exports.unprintNLS(exports.unprintNotNL(input));
    }
    return exports.unprintCC(input);
}
exports.escapeControl = escapeControl;
function wrapQuotes(input, double) {
    input = escapeControl(input);
    if (double) {
        return quoteDoubleWrap(input);
    }
    return quoteSingleWrap(input);
}
exports.wrapQuotes = wrapQuotes;
function wrapIfComplex(input, double) {
    input = String(input);
    if (!identAnyExp.test(input)) {
        return wrapQuotes(exports.unprintCC(input), double);
    }
    return input;
}
exports.wrapIfComplex = wrapIfComplex;
function trim(value, cutoff) {
    if (cutoff === void 0) { cutoff = 60; }
    if (cutoff && value.length > cutoff) {
        return value.substr(0, cutoff) + '...';
    }
    return value;
}
exports.trim = trim;
function trimWrap(value, cutoff, double) {
    if (cutoff === void 0) { cutoff = 60; }
    value = String(value);
    if (cutoff && value.length > cutoff) {
        return wrapQuotes(value.substr(0, cutoff), double) + '...';
    }
    return wrapQuotes(value, double);
}
exports.trimWrap = trimWrap;
