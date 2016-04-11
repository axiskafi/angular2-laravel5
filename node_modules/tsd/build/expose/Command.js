'use strict';
var Command = (function () {
    function Command() {
        this.options = [];
        this.variadic = [];
        this.groups = [];
        this.examples = [];
        this.note = [];
    }
    return Command;
})();
module.exports = Command;
