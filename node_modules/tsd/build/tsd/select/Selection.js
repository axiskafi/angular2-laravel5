'use strict';
var assertVar = require('../../xm/assertVar');
var Query = require('./Query');
var Selection = (function () {
    function Selection(query) {
        if (query === void 0) { query = null; }
        assertVar(query, Query, 'query', true);
        this.query = query;
    }
    return Selection;
})();
module.exports = Selection;
