System.register(['./utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var utils_1;
    function patchTimer(window, setName, cancelName, nameSuffix) {
        var setNative = null;
        var clearNative = null;
        setName += nameSuffix;
        cancelName += nameSuffix;
        function scheduleTask(task) {
            var data = task.data;
            data.args[0] = task.invoke;
            data.handleId = setNative.apply(window, data.args);
            return task;
        }
        function clearTask(task) {
            return clearNative(task.data.handleId);
        }
        setNative = utils_1.patchMethod(window, setName, function (delegate) { return function (self, args) {
            if (typeof args[0] === 'function') {
                var zone = Zone.current;
                var options = {
                    handleId: null,
                    isPeriodic: nameSuffix === 'Interval',
                    delay: (nameSuffix === 'Timeout' || nameSuffix === 'Interval') ? args[1] || 0 : null,
                    args: args
                };
                return zone.scheduleMacroTask(setName, args[0], options, scheduleTask, clearTask);
            }
            else {
                // cause an error by calling it directly.
                return delegate.apply(window, args);
            }
        }; });
        clearNative = utils_1.patchMethod(window, cancelName, function (delegate) { return function (self, args) {
            var task = args[0];
            if (task && typeof task.type === 'string') {
                if (task.cancelFn && task.data.isPeriodic || task.runCount === 0) {
                    // Do not cancel already canceled functions
                    task.zone.cancelTask(task);
                }
            }
            else {
                // cause an error by calling it directly.
                delegate.apply(window, args);
            }
        }; });
    }
    exports_1("patchTimer", patchTimer);
    return {
        setters:[
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }],
        execute: function() {
        }
    }
});
//# sourceMappingURL=timers.js.map