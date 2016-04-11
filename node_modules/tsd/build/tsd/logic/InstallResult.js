'use strict';
var collection = require('../../xm/collection');
var assertVar = require('../../xm/assertVar');
var Options = require('../Options');
var InstallResult = (function () {
    function InstallResult(options) {
        this.written = new collection.Hash();
        this.removed = new collection.Hash();
        this.skipped = new collection.Hash();
        assertVar(options, Options, 'options');
        this.options = options;
    }
    return InstallResult;
})();
module.exports = InstallResult;
