// Reflect.getOwnMetadata ( metadataKey, target [, propertyKey] )
// - https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#reflectgetownmetadata--metadatakey-target--propertykey-
System.register(["../../Reflect", "assert"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var assert;
    function ReflectGetOwnMetadataInvalidTarget() {
        assert.throws(function () { return Reflect.getOwnMetadata("key", undefined, undefined); }, TypeError);
    }
    exports_1("ReflectGetOwnMetadataInvalidTarget", ReflectGetOwnMetadataInvalidTarget);
    function ReflectGetOwnMetadataWithoutTargetKeyWhenNotDefined() {
        var obj = {};
        var result = Reflect.getOwnMetadata("key", obj, undefined);
        assert.equal(result, undefined);
    }
    exports_1("ReflectGetOwnMetadataWithoutTargetKeyWhenNotDefined", ReflectGetOwnMetadataWithoutTargetKeyWhenNotDefined);
    function ReflectGetOwnMetadataWithoutTargetKeyWhenDefined() {
        var obj = {};
        Reflect.defineMetadata("key", "value", obj, undefined);
        var result = Reflect.getOwnMetadata("key", obj, undefined);
        assert.equal(result, "value");
    }
    exports_1("ReflectGetOwnMetadataWithoutTargetKeyWhenDefined", ReflectGetOwnMetadataWithoutTargetKeyWhenDefined);
    function ReflectGetOwnMetadataWithoutTargetKeyWhenDefinedOnPrototype() {
        var prototype = {};
        var obj = Object.create(prototype);
        Reflect.defineMetadata("key", "value", prototype, undefined);
        var result = Reflect.getOwnMetadata("key", obj, undefined);
        assert.equal(result, undefined);
    }
    exports_1("ReflectGetOwnMetadataWithoutTargetKeyWhenDefinedOnPrototype", ReflectGetOwnMetadataWithoutTargetKeyWhenDefinedOnPrototype);
    function ReflectGetOwnMetadataWithTargetKeyWhenNotDefined() {
        var obj = {};
        var result = Reflect.getOwnMetadata("key", obj, "name");
        assert.equal(result, undefined);
    }
    exports_1("ReflectGetOwnMetadataWithTargetKeyWhenNotDefined", ReflectGetOwnMetadataWithTargetKeyWhenNotDefined);
    function ReflectGetOwnMetadataWithTargetKeyWhenDefined() {
        var obj = {};
        Reflect.defineMetadata("key", "value", obj, "name");
        var result = Reflect.getOwnMetadata("key", obj, "name");
        assert.equal(result, "value");
    }
    exports_1("ReflectGetOwnMetadataWithTargetKeyWhenDefined", ReflectGetOwnMetadataWithTargetKeyWhenDefined);
    function ReflectGetOwnMetadataWithTargetKeyWhenDefinedOnPrototype() {
        var prototype = {};
        var obj = Object.create(prototype);
        Reflect.defineMetadata("key", "value", prototype, "name");
        var result = Reflect.getOwnMetadata("key", obj, "name");
        assert.equal(result, undefined);
    }
    exports_1("ReflectGetOwnMetadataWithTargetKeyWhenDefinedOnPrototype", ReflectGetOwnMetadataWithTargetKeyWhenDefinedOnPrototype);
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
//# sourceMappingURL=reflect-getownmetadata.js.map