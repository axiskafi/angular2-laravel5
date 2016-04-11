'use strict';
var DateComp = (function () {
    function DateComp() {
    }
    DateComp.prototype.satisfies = function (date) {
        return this.comparator(date, this.date);
    };
    return DateComp;
})();
module.exports = DateComp;
