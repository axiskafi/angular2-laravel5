// Reflect.hasMetadata ( metadataKey, target [, propertyKey] )
// - https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#reflecthasmetadata--metadatakey-target--propertykey-
System.register(["../../Reflect", "assert"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var assert;
    function ReflectHasMetadataInvalidTarget() {
        assert.throws(function () { return Reflect.hasMetadata("key", undefined, undefined); }, TypeError);
    }
    exports_1("ReflectHasMetadataInvalidTarget", ReflectHasMetadataInvalidTarget);
    function ReflectHasMetadataWithoutTargetKeyWhenNotDefined() {
        var obj = {};
        var result = Reflect.hasMetadata("key", obj, undefined);
        assert.equal(result, false);
    }
    exports_1("ReflectHasMetadataWithoutTargetKeyWhenNotDefined", ReflectHasMetadataWithoutTargetKeyWhenNotDefined);
    function ReflectHasMetadataWithoutTargetKeyWhenDefined() {
        var obj = {};
        Reflect.defineMetadata("key", "value", obj, undefined);
        var result = Reflect.hasMetadata("key", obj, undefined);
        assert.equal(result, true);
    }
    exports_1("ReflectHasMetadataWithoutTargetKeyWhenDefined", ReflectHasMetadataWithoutTargetKeyWhenDefined);
    function ReflectHasMetadataWithoutTargetKeyWhenDefinedOnPrototype() {
        var prototype = {};
        var obj = Object.create(prototype);
        Reflect.defineMetadata("key", "value", prototype, undefined);
        var result = Reflect.hasMetadata("key", obj, undefined);
        assert.equal(result, true);
    }
    exports_1("ReflectHasMetadataWithoutTargetKeyWhenDefinedOnPrototype", ReflectHasMetadataWithoutTargetKeyWhenDefinedOnPrototype);
    function ReflectHasMetadataWithTargetKeyWhenNotDefined() {
        var obj = {};
        var result = Reflect.hasMetadata("key", obj, "name");
        assert.equal(result, false);
    }
    exports_1("ReflectHasMetadataWithTargetKeyWhenNotDefined", ReflectHasMetadataWithTargetKeyWhenNotDefined);
    function ReflectHasMetadataWithTargetKeyWhenDefined() {
        var obj = {};
        Reflect.defineMetadata("key", "value", obj, "name");
        var result = Reflect.hasMetadata("key", obj, "name");
        assert.equal(result, true);
    }
    exports_1("ReflectHasMetadataWithTargetKeyWhenDefined", ReflectHasMetadataWithTargetKeyWhenDefined);
    function ReflectHasMetadataWithTargetKeyWhenDefinedOnPrototype() {
        var prototype = {};
        var obj = Object.create(prototype);
        Reflect.defineMetadata("key", "value", prototype, "name");
        var result = Reflect.hasMetadata("key", obj, "name");
        assert.equal(result, true);
    }
    exports_1("ReflectHasMetadataWithTargetKeyWhenDefinedOnPrototype", ReflectHasMetadataWithTargetKeyWhenDefinedOnPrototype);
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
//# sourceMappingURL=reflect-hasmetadata.js.map