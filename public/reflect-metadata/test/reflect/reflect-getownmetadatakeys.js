// Reflect.getOwnMetadataKeysKeys ( target [, propertyKey] )
// - https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#reflectgetownmetadatakeyskeys--target--propertykey-
System.register(["../../Reflect", "assert"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var assert;
    function ReflectGetOwnMetadataKeysKeysInvalidTarget() {
        // 1. If Type(target) is not Object, throw a TypeError exception.
        assert.throws(function () { return Reflect.getOwnMetadataKeys(undefined, undefined); }, TypeError);
    }
    exports_1("ReflectGetOwnMetadataKeysKeysInvalidTarget", ReflectGetOwnMetadataKeysKeysInvalidTarget);
    function ReflectGetOwnMetadataKeysWithoutTargetKeyWhenNotDefined() {
        var obj = {};
        var result = Reflect.getOwnMetadataKeys(obj, undefined);
        assert.deepEqual(result, []);
    }
    exports_1("ReflectGetOwnMetadataKeysWithoutTargetKeyWhenNotDefined", ReflectGetOwnMetadataKeysWithoutTargetKeyWhenNotDefined);
    function ReflectGetOwnMetadataKeysWithoutTargetKeyWhenDefined() {
        var obj = {};
        Reflect.defineMetadata("key", "value", obj, undefined);
        var result = Reflect.getOwnMetadataKeys(obj, undefined);
        assert.deepEqual(result, ["key"]);
    }
    exports_1("ReflectGetOwnMetadataKeysWithoutTargetKeyWhenDefined", ReflectGetOwnMetadataKeysWithoutTargetKeyWhenDefined);
    function ReflectGetOwnMetadataKeysWithoutTargetKeyWhenDefinedOnPrototype() {
        var prototype = {};
        var obj = Object.create(prototype);
        Reflect.defineMetadata("key", "value", prototype, undefined);
        var result = Reflect.getOwnMetadataKeys(obj, undefined);
        assert.deepEqual(result, []);
    }
    exports_1("ReflectGetOwnMetadataKeysWithoutTargetKeyWhenDefinedOnPrototype", ReflectGetOwnMetadataKeysWithoutTargetKeyWhenDefinedOnPrototype);
    function ReflectGetOwnMetadataKeysOrderWithoutTargetKey() {
        var obj = {};
        Reflect.defineMetadata("key1", "value", obj, undefined);
        Reflect.defineMetadata("key0", "value", obj, undefined);
        var result = Reflect.getOwnMetadataKeys(obj, undefined);
        assert.deepEqual(result, ["key1", "key0"]);
    }
    exports_1("ReflectGetOwnMetadataKeysOrderWithoutTargetKey", ReflectGetOwnMetadataKeysOrderWithoutTargetKey);
    function ReflectGetOwnMetadataKeysOrderAfterRedefineWithoutTargetKey() {
        var obj = {};
        Reflect.defineMetadata("key1", "value", obj, undefined);
        Reflect.defineMetadata("key0", "value", obj, undefined);
        Reflect.defineMetadata("key1", "value", obj, undefined);
        var result = Reflect.getOwnMetadataKeys(obj, undefined);
        assert.deepEqual(result, ["key1", "key0"]);
    }
    exports_1("ReflectGetOwnMetadataKeysOrderAfterRedefineWithoutTargetKey", ReflectGetOwnMetadataKeysOrderAfterRedefineWithoutTargetKey);
    function ReflectGetOwnMetadataKeysWithTargetKeyWhenNotDefined() {
        var obj = {};
        var result = Reflect.getOwnMetadataKeys(obj, "name");
        assert.deepEqual(result, []);
    }
    exports_1("ReflectGetOwnMetadataKeysWithTargetKeyWhenNotDefined", ReflectGetOwnMetadataKeysWithTargetKeyWhenNotDefined);
    function ReflectGetOwnMetadataKeysWithTargetKeyWhenDefined() {
        var obj = {};
        Reflect.defineMetadata("key", "value", obj, "name");
        var result = Reflect.getOwnMetadataKeys(obj, "name");
        assert.deepEqual(result, ["key"]);
    }
    exports_1("ReflectGetOwnMetadataKeysWithTargetKeyWhenDefined", ReflectGetOwnMetadataKeysWithTargetKeyWhenDefined);
    function ReflectGetOwnMetadataKeysWithTargetKeyWhenDefinedOnPrototype() {
        var prototype = {};
        var obj = Object.create(prototype);
        Reflect.defineMetadata("key", "value", prototype, "name");
        var result = Reflect.getOwnMetadataKeys(obj, "name");
        assert.deepEqual(result, []);
    }
    exports_1("ReflectGetOwnMetadataKeysWithTargetKeyWhenDefinedOnPrototype", ReflectGetOwnMetadataKeysWithTargetKeyWhenDefinedOnPrototype);
    function ReflectGetOwnMetadataKeysOrderAfterRedefineWithTargetKey() {
        var obj = {};
        Reflect.defineMetadata("key1", "value", obj, "name");
        Reflect.defineMetadata("key0", "value", obj, "name");
        Reflect.defineMetadata("key1", "value", obj, "name");
        var result = Reflect.getOwnMetadataKeys(obj, "name");
        assert.deepEqual(result, ["key1", "key0"]);
    }
    exports_1("ReflectGetOwnMetadataKeysOrderAfterRedefineWithTargetKey", ReflectGetOwnMetadataKeysOrderAfterRedefineWithTargetKey);
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
//# sourceMappingURL=reflect-getownmetadatakeys.js.map