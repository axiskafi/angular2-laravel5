'use strict';
var typeOf = require('../xm/typeOf');
var assertVar = require('../xm/assertVar');
var Options = (function () {
    function Options() {
        this.minMatches = 0;
        this.maxMatches = 0;
        this.limitApi = 5;
        this.resolveDependencies = false;
        this.overwriteFiles = false;
        this.saveToConfig = false;
        this.saveBundle = false;
        this.reinstallClean = false;
        this.addToBundles = [];
    }
    Options.fromJSON = function (json) {
        var opts = new Options();
        if (json) {
            Object.keys(opts).forEach(function (key) {
                if (key in json) {
                    assertVar(json[key], typeOf.get(opts[key]), 'json[' + key + ']');
                    opts[key] = json[key];
                }
            });
        }
        return opts;
    };
    Options.main = Object.freeze(new Options());
    return Options;
})();
module.exports = Options;
