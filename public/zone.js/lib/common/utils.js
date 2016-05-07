/**
 * Suppress closure compiler errors about unknown 'process' variable
 * @fileoverview
 * @suppress {undefinedVars}
 */
System.register([], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var zoneSymbol, _global, isWebWorker, isNode, isBrowser, EVENT_TASKS, ADD_EVENT_LISTENER, REMOVE_EVENT_LISTENER, SYMBOL_ADD_EVENT_LISTENER, SYMBOL_REMOVE_EVENT_LISTENER, originalInstanceKey;
    function bindArguments(args, source) {
        for (var i = args.length - 1; i >= 0; i--) {
            if (typeof args[i] === 'function') {
                args[i] = Zone.current.wrap(args[i], source + '_' + i);
            }
        }
        return args;
    }
    exports_1("bindArguments", bindArguments);
    function patchPrototype(prototype, fnNames) {
        var source = prototype.constructor['name'];
        var _loop_1 = function(i) {
            var name_1 = fnNames[i];
            var delegate = prototype[name_1];
            if (delegate) {
                prototype[name_1] = (function (delegate) {
                    return function () {
                        return delegate.apply(this, bindArguments(arguments, source + '.' + name_1));
                    };
                })(delegate);
            }
        };
        for (var i = 0; i < fnNames.length; i++) {
            _loop_1(i);
        }
    }
    exports_1("patchPrototype", patchPrototype);
    function patchProperty(obj, prop) {
        var desc = Object.getOwnPropertyDescriptor(obj, prop) || {
            enumerable: true,
            configurable: true
        };
        // A property descriptor cannot have getter/setter and be writable
        // deleting the writable and value properties avoids this error:
        //
        // TypeError: property descriptors must not specify a value or be writable when a
        // getter or setter has been specified
        delete desc.writable;
        delete desc.value;
        // substr(2) cuz 'onclick' -> 'click', etc
        var eventName = prop.substr(2);
        var _prop = '_' + prop;
        desc.set = function (fn) {
            if (this[_prop]) {
                this.removeEventListener(eventName, this[_prop]);
            }
            if (typeof fn === 'function') {
                var wrapFn = function (event) {
                    var result;
                    result = fn.apply(this, arguments);
                    if (result != undefined && !result)
                        event.preventDefault();
                };
                this[_prop] = wrapFn;
                this.addEventListener(eventName, wrapFn, false);
            }
            else {
                this[_prop] = null;
            }
        };
        desc.get = function () {
            return this[_prop];
        };
        Object.defineProperty(obj, prop, desc);
    }
    exports_1("patchProperty", patchProperty);
    function patchOnProperties(obj, properties) {
        var onProperties = [];
        for (var prop in obj) {
            if (prop.substr(0, 2) == 'on') {
                onProperties.push(prop);
            }
        }
        for (var j = 0; j < onProperties.length; j++) {
            patchProperty(obj, onProperties[j]);
        }
        if (properties) {
            for (var i = 0; i < properties.length; i++) {
                patchProperty(obj, 'on' + properties[i]);
            }
        }
    }
    exports_1("patchOnProperties", patchOnProperties);
    function findExistingRegisteredTask(target, handler, name, capture, remove) {
        var eventTasks = target[EVENT_TASKS];
        if (eventTasks) {
            for (var i = 0; i < eventTasks.length; i++) {
                var eventTask = eventTasks[i];
                var data = eventTask.data;
                if (data.handler === handler
                    && data.useCapturing === capture
                    && data.eventName === name) {
                    if (remove) {
                        eventTasks.splice(i, 1);
                    }
                    return eventTask;
                }
            }
        }
        return null;
    }
    function attachRegisteredEvent(target, eventTask) {
        var eventTasks = target[EVENT_TASKS];
        if (!eventTasks) {
            eventTasks = target[EVENT_TASKS] = [];
        }
        eventTasks.push(eventTask);
    }
    function scheduleEventListener(eventTask) {
        var meta = eventTask.data;
        attachRegisteredEvent(meta.target, eventTask);
        return meta.target[SYMBOL_ADD_EVENT_LISTENER](meta.eventName, eventTask.invoke, meta.useCapturing);
    }
    function cancelEventListener(eventTask) {
        var meta = eventTask.data;
        findExistingRegisteredTask(meta.target, eventTask.invoke, meta.eventName, meta.useCapturing, true);
        meta.target[SYMBOL_REMOVE_EVENT_LISTENER](meta.eventName, eventTask.invoke, meta.useCapturing);
    }
    function zoneAwareAddEventListener(self, args) {
        var eventName = args[0];
        var handler = args[1];
        var useCapturing = args[2] || false;
        // - Inside a Web Worker, `this` is undefined, the context is `global`
        // - When `addEventListener` is called on the global context in strict mode, `this` is undefined
        // see https://github.com/angular/zone.js/issues/190
        var target = self || _global;
        var delegate = null;
        if (typeof handler == 'function') {
            delegate = handler;
        }
        else if (handler && handler.handleEvent) {
            delegate = function (event) { return handler.handleEvent(event); };
        }
        var validZoneHandler = false;
        try {
            // In cross site contexts (such as WebDriver frameworks like Selenium),
            // accessing the handler object here will cause an exception to be thrown which
            // will fail tests prematurely.
            validZoneHandler = handler && handler.toString() === "[object FunctionWrapper]";
        }
        catch (e) {
            // Returning nothing here is fine, because objects in a cross-site context are unusable
            return;
        }
        // Ignore special listeners of IE11 & Edge dev tools, see https://github.com/angular/zone.js/issues/150
        if (!delegate || validZoneHandler) {
            return target[SYMBOL_ADD_EVENT_LISTENER](eventName, handler, useCapturing);
        }
        var eventTask = findExistingRegisteredTask(target, handler, eventName, useCapturing, false);
        if (eventTask) {
            // we already registered, so this will have noop.
            return target[SYMBOL_ADD_EVENT_LISTENER](eventName, eventTask.invoke, useCapturing);
        }
        var zone = Zone.current;
        var source = target.constructor['name'] + '.addEventListener:' + eventName;
        var data = {
            target: target,
            eventName: eventName,
            name: eventName,
            useCapturing: useCapturing,
            handler: handler
        };
        zone.scheduleEventTask(source, delegate, data, scheduleEventListener, cancelEventListener);
    }
    function zoneAwareRemoveEventListener(self, args) {
        var eventName = args[0];
        var handler = args[1];
        var useCapturing = args[2] || false;
        // - Inside a Web Worker, `this` is undefined, the context is `global`
        // - When `addEventListener` is called on the global context in strict mode, `this` is undefined
        // see https://github.com/angular/zone.js/issues/190
        var target = self || _global;
        var eventTask = findExistingRegisteredTask(target, handler, eventName, useCapturing, true);
        if (eventTask) {
            eventTask.zone.cancelTask(eventTask);
        }
        else {
            target[SYMBOL_REMOVE_EVENT_LISTENER](eventName, handler, useCapturing);
        }
    }
    function patchEventTargetMethods(obj) {
        if (obj && obj.addEventListener) {
            patchMethod(obj, ADD_EVENT_LISTENER, function () { return zoneAwareAddEventListener; });
            patchMethod(obj, REMOVE_EVENT_LISTENER, function () { return zoneAwareRemoveEventListener; });
            return true;
        }
        else {
            return false;
        }
    }
    exports_1("patchEventTargetMethods", patchEventTargetMethods);
    // wrap some native API on `window`
    function patchClass(className) {
        var OriginalClass = _global[className];
        if (!OriginalClass)
            return;
        _global[className] = function () {
            var a = bindArguments(arguments, className);
            switch (a.length) {
                case 0:
                    this[originalInstanceKey] = new OriginalClass();
                    break;
                case 1:
                    this[originalInstanceKey] = new OriginalClass(a[0]);
                    break;
                case 2:
                    this[originalInstanceKey] = new OriginalClass(a[0], a[1]);
                    break;
                case 3:
                    this[originalInstanceKey] = new OriginalClass(a[0], a[1], a[2]);
                    break;
                case 4:
                    this[originalInstanceKey] = new OriginalClass(a[0], a[1], a[2], a[3]);
                    break;
                default: throw new Error('Arg list too long.');
            }
        };
        var instance = new OriginalClass(function () { });
        var prop;
        for (prop in instance) {
            (function (prop) {
                if (typeof instance[prop] === 'function') {
                    _global[className].prototype[prop] = function () {
                        return this[originalInstanceKey][prop].apply(this[originalInstanceKey], arguments);
                    };
                }
                else {
                    Object.defineProperty(_global[className].prototype, prop, {
                        set: function (fn) {
                            if (typeof fn === 'function') {
                                this[originalInstanceKey][prop] = Zone.current.wrap(fn, className + '.' + prop);
                            }
                            else {
                                this[originalInstanceKey][prop] = fn;
                            }
                        },
                        get: function () {
                            return this[originalInstanceKey][prop];
                        }
                    });
                }
            }(prop));
        }
        for (prop in OriginalClass) {
            if (prop !== 'prototype' && OriginalClass.hasOwnProperty(prop)) {
                _global[className][prop] = OriginalClass[prop];
            }
        }
    }
    exports_1("patchClass", patchClass);
    function createNamedFn(name, delegate) {
        try {
            return (Function('f', "return function " + name + "(){return f(this, arguments)}"))(delegate);
        }
        catch (e) {
            // if we fail, we must be CSP, just return delegate.
            return function () {
                return delegate(this, arguments);
            };
        }
    }
    exports_1("createNamedFn", createNamedFn);
    function patchMethod(target, name, patchFn) {
        var proto = target;
        while (proto && !proto.hasOwnProperty(name)) {
            proto = Object.getPrototypeOf(proto);
        }
        if (!proto && target[name]) {
            // somehow we did not find it, but we can see it. This happens on IE for Window properties.
            proto = target;
        }
        var delegateName = zoneSymbol(name);
        var delegate;
        if (proto && !(delegate = proto[delegateName])) {
            delegate = proto[delegateName] = proto[name];
            proto[name] = createNamedFn(name, patchFn(delegate, delegateName, name));
        }
        return delegate;
    }
    exports_1("patchMethod", patchMethod);
    return {
        setters:[],
        execute: function() {
            exports_1("zoneSymbol", zoneSymbol = Zone['__symbol__']);
            _global = typeof window == 'undefined' ? global : window;
            ;
            ;
            exports_1("isWebWorker", isWebWorker = (typeof WorkerGlobalScope !== 'undefined' && self instanceof WorkerGlobalScope));
            exports_1("isNode", isNode = (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]'));
            exports_1("isBrowser", isBrowser = !isNode && !isWebWorker && !!(typeof window !== 'undefined' && window['HTMLElement']));
            ;
            ;
            EVENT_TASKS = zoneSymbol('eventTasks');
            ADD_EVENT_LISTENER = 'addEventListener';
            REMOVE_EVENT_LISTENER = 'removeEventListener';
            SYMBOL_ADD_EVENT_LISTENER = zoneSymbol(ADD_EVENT_LISTENER);
            SYMBOL_REMOVE_EVENT_LISTENER = zoneSymbol(REMOVE_EVENT_LISTENER);
            ;
            originalInstanceKey = zoneSymbol('originalInstance');
            ;
        }
    }
});
//# sourceMappingURL=utils.js.map