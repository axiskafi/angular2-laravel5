System.register(['./harness', "./spec"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var harness_1, spec;
    var results;
    return {
        setters:[
            function (harness_1_1) {
                harness_1 = harness_1_1;
            },
            function (spec_1) {
                spec = spec_1;
            }],
        execute: function() {
            results = harness_1.runTests(spec);
            harness_1.printResults(results);
        }
    }
});
//# sourceMappingURL=run.js.map