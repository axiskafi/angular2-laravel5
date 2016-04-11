'use strict';
var AssertionError = require('assertion-error');
var typeOf = require('./typeOf');
var inspect = require('./inspect');
var typeOfAssert = typeOf.getTypeOfMap();
function assert(pass, message, actual, expected, showDiff, ssf) {
    if (showDiff === void 0) { showDiff = true; }
    if (!!pass) {
        return;
    }
    if (typeOf.isString(message)) {
        message = message.replace(/\{([\w]+)\}/gi, function (match, id) {
            switch (id) {
                case 'a':
                case 'act':
                case 'actual':
                    if (arguments.length > 2) {
                        return inspect.toValueStrim(actual);
                    }
                    break;
                case 'e':
                case 'exp':
                case 'expected':
                    if (arguments.length > 3) {
                        return inspect.toValueStrim(expected);
                    }
                    break;
                default:
                    return match;
            }
        });
    }
    else {
        message = '';
    }
    throw new AssertionError(message, { actual: actual, expected: expected, showDiff: showDiff }, ssf);
}
module.exports = assert;
