'use strict';
var assertVar = require('../xm/assertVar');
var crypto = require('crypto');
function decodeBlobJson(blobJSON) {
    if (!blobJSON || !blobJSON.encoding) {
        return null;
    }
    switch (blobJSON.encoding) {
        case 'base64':
            return new Buffer(blobJSON.content, 'base64');
        case 'utf-8':
        case 'utf8':
        default:
            return new Buffer(blobJSON.content, 'utf8');
    }
}
exports.decodeBlobJson = decodeBlobJson;
function blobShaHex(data) {
    assertVar(data, Buffer, 'data');
    return crypto.createHash('sha1').update('blob ' + data.length + '\0').update(data).digest('hex');
}
exports.blobShaHex = blobShaHex;
