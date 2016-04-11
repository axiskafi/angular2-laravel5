'use strict';
var stringUtils = require('./stringUtils');
var typeOf = require('./typeOf');
function getISOString(input) {
    var date;
    if (typeOf.isDate(input)) {
        date = input;
    }
    else if (typeOf.isString(input) || typeOf.isNumber(input)) {
        date = new Date(input);
    }
    return (date ? date.toISOString() : null);
}
exports.getISOString = getISOString;
function toNiceUTC(date) {
    return date.getUTCFullYear()
        + '-' + stringUtils.padLeftZero(date.getUTCMonth() + 1)
        + '-' + stringUtils.padLeftZero(date.getUTCDate())
        + ' ' + stringUtils.padLeftZero(date.getUTCHours())
        + ':' + stringUtils.padLeftZero(date.getUTCMinutes());
}
exports.toNiceUTC = toNiceUTC;
function isBeforeDate(actual, base) {
    return actual.getUTCFullYear() < base.getUTCFullYear()
        || actual.getUTCMonth() < base.getUTCMonth()
        || actual.getUTCDate() < base.getUTCDate();
}
exports.isBeforeDate = isBeforeDate;
function isAfterDate(actual, base) {
    return actual.getUTCFullYear() > base.getUTCFullYear()
        || actual.getUTCMonth() > base.getUTCMonth()
        || actual.getUTCDate() > base.getUTCDate();
}
exports.isAfterDate = isAfterDate;
function isEqualDate(actual, base) {
    return actual.toDateString() === base.toDateString();
}
exports.isEqualDate = isEqualDate;
function compare(date1, date2) {
    return date1.getTime() - date2.getTime();
}
exports.compare = compare;
