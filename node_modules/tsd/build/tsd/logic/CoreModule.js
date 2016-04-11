'use strict';
var CoreModule = (function () {
    function CoreModule(core, label) {
        this.core = core;
        this.label = label;
    }
    return CoreModule;
})();
module.exports = CoreModule;
