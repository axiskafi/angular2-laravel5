// Reflect.getMetadata ( metadataKey, target [, propertyKey] )
// - https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#reflectgetmetadata--metadatakey-target--propertykey-
System.register(["../../Reflect", "assert"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var assert;
    function ReflectGetMetadataInvalidTarget() {
        assert.throws(function () { return Reflect.getMetadata("key", undefined, undefined); }, TypeError);
    }
    exports_1("ReflectGetMetadataInvalidTarget", ReflectGetMetadataInvalidTarget);
    function ReflectGetMetadataWithoutTargetKeyWhenNotDefined() {
        var obj = {};
        var result = Reflect.getMetadata("key", obj, undefined);
        assert.equal(result, undefined);
    }
    exports_1("ReflectGetMetadataWithoutTargetKeyWhenNotDefined", ReflectGetMetadataWithoutTargetKeyWhenNotDefined);
    function ReflectGetMetadataWithoutTargetKeyWhenDefined() {
        var obj = {};
        Reflect.defineMetadata("key", "value", obj, undefined);
        var result = Reflect.getMetadata("key", obj, undefined);
        assert.equal(result, "value");
    }
    exports_1("ReflectGetMetadataWithoutTargetKeyWhenDefined", ReflectGetMetadataWithoutTargetKeyWhenDefined);
    function ReflectGetMetadataWithoutTargetKeyWhenDefinedOnPrototype() {
        var prototype = {};
        var obj = Object.create(prototype);
        Reflect.defineMetadata("key", "value", prototype, undefined);
        var result = Reflect.getMetadata("key", obj, undefined);
        assert.equal(result, "value");
    }
    exports_1("ReflectGetMetadataWithoutTargetKeyWhenDefinedOnPrototype", ReflectGetMetadataWithoutTargetKeyWhenDefinedOnPrototype);
    function ReflectGetMetadataWithTargetKeyWhenNotDefined() {
        var obj = {};
        var result = Reflect.getMetadata("key", obj, "name");
        assert.equal(result, undefined);
    }
    exports_1("ReflectGetMetadataWithTargetKeyWhenNotDefined", ReflectGetMetadataWithTargetKeyWhenNotDefined);
    function ReflectGetMetadataWithTargetKeyWhenDefined() {
        var obj = {};
        Reflect.defineMetadata("key", "value", obj, "name");
        var result = Reflect.getMetadata("key", obj, "name");
        assert.equal(result, "value");
    }
    exports_1("ReflectGetMetadataWithTargetKeyWhenDefined", ReflectGetMetadataWithTargetKeyWhenDefined);
    function ReflectGetMetadataWithTargetKeyWhenDefinedOnPrototype() {
        var prototype = {};
        var obj = Object.create(prototype);
        Reflect.defineMetadata("key", "value", prototype, "name");
        var result = Reflect.getMetadata("key", obj, "name");
        assert.equal(result, "value");
    }
    exports_1("ReflectGetMetadataWithTargetKeyWhenDefinedOnPrototype", ReflectGetMetadataWithTargetKeyWhenDefinedOnPrototype);
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
//# sourceMappingURL=reflect-getmetadata.js.map