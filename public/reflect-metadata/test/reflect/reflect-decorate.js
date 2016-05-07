// Reflect.decorate ( decorators, target [, propertyKey [, descriptor] ] )
System.register(["../../Reflect", "assert"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var assert;
    function ReflectDecorateThrowsIfDecoratorsArgumentNotArrayForFunctionOverload() {
        var target = function () { };
        assert.throws(function () { return Reflect.decorate(undefined, target, undefined, undefined); }, TypeError);
    }
    exports_1("ReflectDecorateThrowsIfDecoratorsArgumentNotArrayForFunctionOverload", ReflectDecorateThrowsIfDecoratorsArgumentNotArrayForFunctionOverload);
    function ReflectDecorateThrowsIfTargetArgumentNotFunctionForFunctionOverload() {
        var decorators = [];
        var target = {};
        assert.throws(function () { return Reflect.decorate(decorators, target, undefined, undefined); }, TypeError);
    }
    exports_1("ReflectDecorateThrowsIfTargetArgumentNotFunctionForFunctionOverload", ReflectDecorateThrowsIfTargetArgumentNotFunctionForFunctionOverload);
    function ReflectDecorateThrowsIfDecoratorsArgumentNotArrayForPropertyOverload() {
        var target = {};
        var name = "name";
        assert.throws(function () { return Reflect.decorate(undefined, target, name, undefined); }, TypeError);
    }
    exports_1("ReflectDecorateThrowsIfDecoratorsArgumentNotArrayForPropertyOverload", ReflectDecorateThrowsIfDecoratorsArgumentNotArrayForPropertyOverload);
    function ReflectDecorateThrowsIfTargetArgumentNotObjectForPropertyOverload() {
        var decorators = [];
        var target = 1;
        var name = "name";
        assert.throws(function () { return Reflect.decorate(decorators, target, name, undefined); }, TypeError);
    }
    exports_1("ReflectDecorateThrowsIfTargetArgumentNotObjectForPropertyOverload", ReflectDecorateThrowsIfTargetArgumentNotObjectForPropertyOverload);
    function ReflectDecorateThrowsIfDecoratorsArgumentNotArrayForPropertyDescriptorOverload() {
        var target = {};
        var name = "name";
        var descriptor = {};
        assert.throws(function () { return Reflect.decorate(undefined, target, name, descriptor); }, TypeError);
    }
    exports_1("ReflectDecorateThrowsIfDecoratorsArgumentNotArrayForPropertyDescriptorOverload", ReflectDecorateThrowsIfDecoratorsArgumentNotArrayForPropertyDescriptorOverload);
    function ReflectDecorateThrowsIfTargetArgumentNotObjectForPropertyDescriptorOverload() {
        var decorators = [];
        var target = 1;
        var name = "name";
        var descriptor = {};
        assert.throws(function () { return Reflect.decorate(decorators, target, name, descriptor); }, TypeError);
    }
    exports_1("ReflectDecorateThrowsIfTargetArgumentNotObjectForPropertyDescriptorOverload", ReflectDecorateThrowsIfTargetArgumentNotObjectForPropertyDescriptorOverload);
    function ReflectDecorateExecutesDecoratorsInReverseOrderForFunctionOverload() {
        var order = [];
        var decorators = [
            function (target) { order.push(0); },
            function (target) { order.push(1); }
        ];
        var target = function () { };
        Reflect.decorate(decorators, target);
        assert.deepEqual(order, [1, 0]);
    }
    exports_1("ReflectDecorateExecutesDecoratorsInReverseOrderForFunctionOverload", ReflectDecorateExecutesDecoratorsInReverseOrderForFunctionOverload);
    function ReflectDecorateExecutesDecoratorsInReverseOrderForPropertyOverload() {
        var order = [];
        var decorators = [
            function (target, name) { order.push(0); },
            function (target, name) { order.push(1); }
        ];
        var target = {};
        var name = "name";
        Reflect.decorate(decorators, target, name, undefined);
        assert.deepEqual(order, [1, 0]);
    }
    exports_1("ReflectDecorateExecutesDecoratorsInReverseOrderForPropertyOverload", ReflectDecorateExecutesDecoratorsInReverseOrderForPropertyOverload);
    function ReflectDecorateExecutesDecoratorsInReverseOrderForPropertyDescriptorOverload() {
        var order = [];
        var decorators = [
            function (target, name) { order.push(0); },
            function (target, name) { order.push(1); }
        ];
        var target = {};
        var name = "name";
        var descriptor = {};
        Reflect.decorate(decorators, target, name, descriptor);
        assert.deepEqual(order, [1, 0]);
    }
    exports_1("ReflectDecorateExecutesDecoratorsInReverseOrderForPropertyDescriptorOverload", ReflectDecorateExecutesDecoratorsInReverseOrderForPropertyDescriptorOverload);
    function ReflectDecoratorPipelineForFunctionOverload() {
        var A = function A() { };
        var B = function B() { };
        var decorators = [
            function (target) { return undefined; },
            function (target) { return A; },
            function (target) { return B; }
        ];
        var target = function () { };
        var result = Reflect.decorate(decorators, target);
        assert.strictEqual(result, A);
    }
    exports_1("ReflectDecoratorPipelineForFunctionOverload", ReflectDecoratorPipelineForFunctionOverload);
    function ReflectDecoratorPipelineForPropertyOverload() {
        var A = {};
        var B = {};
        var decorators = [
            function (target, name) { return undefined; },
            function (target, name) { return A; },
            function (target, name) { return B; }
        ];
        var target = {};
        var result = Reflect.decorate(decorators, target, "name", undefined);
        assert.strictEqual(result, undefined);
    }
    exports_1("ReflectDecoratorPipelineForPropertyOverload", ReflectDecoratorPipelineForPropertyOverload);
    function ReflectDecoratorPipelineForPropertyDescriptorOverload() {
        var A = {};
        var B = {};
        var C = {};
        var decorators = [
            function (target, name) { return undefined; },
            function (target, name) { return A; },
            function (target, name) { return B; }
        ];
        var target = {};
        var result = Reflect.decorate(decorators, target, "name", C);
        assert.strictEqual(result, A);
    }
    exports_1("ReflectDecoratorPipelineForPropertyDescriptorOverload", ReflectDecoratorPipelineForPropertyDescriptorOverload);
    function ReflectDecoratorCorrectTargetInPipelineForFunctionOverload() {
        var sent = [];
        var A = function A() { };
        var B = function B() { };
        var decorators = [
            function (target) { sent.push(target); return undefined; },
            function (target) { sent.push(target); return undefined; },
            function (target) { sent.push(target); return A; },
            function (target) { sent.push(target); return B; }
        ];
        var target = function () { };
        Reflect.decorate(decorators, target);
        assert.deepEqual(sent, [target, B, A, A]);
    }
    exports_1("ReflectDecoratorCorrectTargetInPipelineForFunctionOverload", ReflectDecoratorCorrectTargetInPipelineForFunctionOverload);
    function ReflectDecoratorCorrectTargetInPipelineForPropertyOverload() {
        var sent = [];
        var decorators = [
            function (target, name) { sent.push(target); },
            function (target, name) { sent.push(target); },
            function (target, name) { sent.push(target); },
            function (target, name) { sent.push(target); }
        ];
        var target = {};
        Reflect.decorate(decorators, target, "name");
        assert.deepEqual(sent, [target, target, target, target]);
    }
    exports_1("ReflectDecoratorCorrectTargetInPipelineForPropertyOverload", ReflectDecoratorCorrectTargetInPipelineForPropertyOverload);
    function ReflectDecoratorCorrectNameInPipelineForPropertyOverload() {
        var sent = [];
        var decorators = [
            function (target, name) { sent.push(name); },
            function (target, name) { sent.push(name); },
            function (target, name) { sent.push(name); },
            function (target, name) { sent.push(name); }
        ];
        var target = {};
        Reflect.decorate(decorators, target, "name");
        assert.deepEqual(sent, ["name", "name", "name", "name"]);
    }
    exports_1("ReflectDecoratorCorrectNameInPipelineForPropertyOverload", ReflectDecoratorCorrectNameInPipelineForPropertyOverload);
    function ReflectDecoratorCorrectTargetInPipelineForPropertyDescriptorOverload() {
        var sent = [];
        var A = {};
        var B = {};
        var C = {};
        var decorators = [
            function (target, name) { sent.push(target); return undefined; },
            function (target, name) { sent.push(target); return undefined; },
            function (target, name) { sent.push(target); return A; },
            function (target, name) { sent.push(target); return B; }
        ];
        var target = {};
        Reflect.decorate(decorators, target, "name", C);
        assert.deepEqual(sent, [target, target, target, target]);
    }
    exports_1("ReflectDecoratorCorrectTargetInPipelineForPropertyDescriptorOverload", ReflectDecoratorCorrectTargetInPipelineForPropertyDescriptorOverload);
    function ReflectDecoratorCorrectNameInPipelineForPropertyDescriptorOverload() {
        var sent = [];
        var A = {};
        var B = {};
        var C = {};
        var decorators = [
            function (target, name) { sent.push(name); return undefined; },
            function (target, name) { sent.push(name); return undefined; },
            function (target, name) { sent.push(name); return A; },
            function (target, name) { sent.push(name); return B; }
        ];
        var target = {};
        Reflect.decorate(decorators, target, "name", C);
        assert.deepEqual(sent, ["name", "name", "name", "name"]);
    }
    exports_1("ReflectDecoratorCorrectNameInPipelineForPropertyDescriptorOverload", ReflectDecoratorCorrectNameInPipelineForPropertyDescriptorOverload);
    function ReflectDecoratorCorrectDescriptorInPipelineForPropertyDescriptorOverload() {
        var sent = [];
        var A = {};
        var B = {};
        var C = {};
        var decorators = [
            function (target, name, descriptor) { sent.push(descriptor); return undefined; },
            function (target, name, descriptor) { sent.push(descriptor); return undefined; },
            function (target, name, descriptor) { sent.push(descriptor); return A; },
            function (target, name, descriptor) { sent.push(descriptor); return B; }
        ];
        var target = {};
        Reflect.decorate(decorators, target, "name", C);
        assert.deepEqual(sent, [C, B, A, A]);
    }
    exports_1("ReflectDecoratorCorrectDescriptorInPipelineForPropertyDescriptorOverload", ReflectDecoratorCorrectDescriptorInPipelineForPropertyDescriptorOverload);
    return {
        setters:[
            function (_1) {},
            function (assert_1) {
                assert = assert_1;
            }],
        execute: function() {
        }
    }
});
//# sourceMappingURL=reflect-decorate.js.map