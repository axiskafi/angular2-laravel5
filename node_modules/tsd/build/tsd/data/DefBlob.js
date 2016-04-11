'use strict';
var assertVar = require('../../xm/assertVar');
var DefVersion = require('./DefVersion');
var DefBlob = (function () {
    function DefBlob(file, buffer) {
        assertVar(file, DefVersion, 'file');
        assertVar(buffer, Buffer, 'buffer');
        this.file = file;
        this.content = buffer;
        Object.freeze(this);
    }
    return DefBlob;
})();
module.exports = DefBlob;
