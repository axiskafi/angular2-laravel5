'use strict';
var sorter = require('./sorter');
var Group = (function () {
    function Group() {
        this.sorter = sorter.sortCommand;
        this.options = [];
    }
    return Group;
})();
module.exports = Group;
