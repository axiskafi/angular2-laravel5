'use strict';
var Option = (function () {
    function Option() {
        this.global = false;
        this.hidden = false;
        this.optional = true;
        this.enum = [];
        this.note = [];
    }
    return Option;
})();
module.exports = Option;
