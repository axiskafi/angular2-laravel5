'use strict';
var crypto = require('crypto');
var typeDetect = require('type-detect');
function md5(data) {
    return crypto.createHash('md5').update(data).digest('hex');
}
exports.md5 = md5;
function sha1(data) {
    return crypto.createHash('sha1').update(data).digest('hex');
}
exports.sha1 = sha1;
var hashNormExp = /[\r\n]+/g;
var hashNew = '\n';
function hashNormalines(input) {
    return sha1(input.replace(hashNormExp, hashNew));
}
exports.hashNormalines = hashNormalines;
function hashStep(hasher, obj) {
    var sep = ';';
    var type = typeDetect(obj);
    switch (type) {
        case 'number':
        case 'boolean':
        case 'null':
            hasher.update(String(obj) + sep);
            break;
        case 'string':
            hasher.update(JSON.stringify(obj) + sep);
            break;
        case 'array':
            hasher.update('[');
            obj.forEach(function (value) {
                hashStep(hasher, value);
            });
            hasher.update(']' + sep);
            break;
        case 'object':
            var keys = Object.keys(obj);
            keys.sort();
            hasher.update('{');
            keys.forEach(function (key) {
                hasher.update(JSON.stringify(key) + ':');
                hashStep(hasher, obj[key]);
            });
            hasher.update('}' + sep);
            break;
        case 'date':
            hasher.update('<Date>' + obj.getTime() + sep);
            break;
        case 'buffer':
            hasher.update('<Buffer>');
            hasher.update(obj);
            hasher.update(sep);
            break;
        case 'regexp':
            throw (new Error('jsonToIdent: cannot serialise regexp'));
        case 'function':
            throw (new Error('jsonToIdent: cannot serialise function'));
        default:
            throw (new Error('jsonToIdent: cannot serialise value: ' + String(obj)));
    }
}
function jsonToIdentHash(obj, length) {
    if (length === void 0) { length = 0; }
    var hash = crypto.createHash('sha1');
    hashStep(hash, obj);
    if (length > 0) {
        return hash.digest('hex').substr(0, Math.min(length, 40));
    }
    return hash.digest('hex');
}
exports.jsonToIdentHash = jsonToIdentHash;
