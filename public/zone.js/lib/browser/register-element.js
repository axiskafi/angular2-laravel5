System.register(['./define-property', '../common/utils'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var define_property_1, utils_1;
    function registerElementPatch(_global) {
        if (!utils_1.isBrowser || !('registerElement' in _global.document)) {
            return;
        }
        var _registerElement = document.registerElement;
        var callbacks = [
            'createdCallback',
            'attachedCallback',
            'detachedCallback',
            'attributeChangedCallback'
        ];
        document.registerElement = function (name, opts) {
            if (opts && opts.prototype) {
                callbacks.forEach(function (callback) {
                    var source = 'Document.registerElement::' + callback;
                    if (opts.prototype.hasOwnProperty(callback)) {
                        var descriptor = Object.getOwnPropertyDescriptor(opts.prototype, callback);
                        if (descriptor && descriptor.value) {
                            descriptor.value = Zone.current.wrap(descriptor.value, source);
                            define_property_1._redefineProperty(opts.prototype, callback, descriptor);
                        }
                        else {
                            opts.prototype[callback] = Zone.current.wrap(opts.prototype[callback], source);
                        }
                    }
                    else if (opts.prototype[callback]) {
                        opts.prototype[callback] = Zone.current.wrap(opts.prototype[callback], source);
                    }
                });
            }
            return _registerElement.apply(document, [name, opts]);
        };
    }
    exports_1("registerElementPatch", registerElementPatch);
    return {
        setters:[
            function (define_property_1_1) {
                define_property_1 = define_property_1_1;
            },
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }],
        execute: function() {
        }
    }
});
//# sourceMappingURL=register-element.js.map