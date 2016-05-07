// Reflect.hasOwnMetadata ( metadataKey, target [, propertyKey] )
// - https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#reflecthasownmetadata--metadatakey-target--propertykey-
System.register(["../../Reflect", "assert"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var assert;
    function ReflectHasOwnMetadataInvalidTarget() {
        assert.throws(function () { return Reflect.hasOwnMetadata("key", undefined, undefined); }, TypeError);
    }
    exports_1("ReflectHasOwnMetadataInvalidTarget", ReflectHasOwnMetadataInvalidTarget);
    function ReflectHasOwnMetadataWithoutTargetKeyWhenNotDefined() {
        var obj = {};
        var result = Reflect.hasOwnMetadata("key", obj, undefined);
        assert.equal(result, false);
    }
    exports_1("ReflectHasOwnMetadataWithoutTargetKeyWhenNotDefined", ReflectHasOwnMetadataWithoutTargetKeyWhenNotDefined);
    function ReflectHasOwnMetadataWithoutTargetKeyWhenDefined() {
        var obj = {};
        Reflect.defineMetadata("key", "value", obj, undefined);
        var result = Reflect.hasOwnMetadata("key", obj, undefined);
        assert.equal(result, true);
    }
    exports_1("ReflectHasOwnMetadataWithoutTargetKeyWhenDefined", ReflectHasOwnMetadataWithoutTargetKeyWhenDefined);
    function ReflectHasOwnMetadataWithoutTargetKeyWhenDefinedOnPrototype() {
        var prototype = {};
        var obj = Object.create(prototype);
        Reflect.defineMetadata("key", "value", prototype, undefined);
        var result = Reflect.hasOwnMetadata("key", obj, undefined);
        assert.equal(result, false);
    }
    exports_1("ReflectHasOwnMetadataWithoutTargetKeyWhenDefinedOnPrototype", ReflectHasOwnMetadataWithoutTargetKeyWhenDefinedOnPrototype);
    function ReflectHasOwnMetadataWithTargetKeyWhenNotDefined() {
        var obj = {};
        var result = Reflect.hasOwnMetadata("key", obj, "name");
        assert.equal(result, false);
    }
    exports_1("ReflectHasOwnMetadataWithTargetKeyWhenNotDefined", ReflectHasOwnMetadataWithTargetKeyWhenNotDefined);
    function ReflectHasOwnMetadataWithTargetKeyWhenDefined() {
        var obj = {};
        Reflect.defineMetadata("key", "value", obj, "name");
        var result = Reflect.hasOwnMetadata("key", obj, "name");
        assert.equal(result, true);
    }
    exports_1("ReflectHasOwnMetadataWithTargetKeyWhenDefined", ReflectHasOwnMetadataWithTargetKeyWhenDefined);
    function ReflectHasOwnMetadataWithTargetKeyWhenDefinedOnPrototype() {
        var prototype = {};
        var obj = Object.create(prototype);
        Reflect.defineMetadata("key", "value", prototype, "name");
        var result = Reflect.hasOwnMetadata("key", obj, "name");
        assert.equal(result, false);
    }
    exports_1("ReflectHasOwnMetadataWithTargetKeyWhenDefinedOnPrototype", ReflectHasOwnMetadataWithTargetKeyWhenDefinedOnPrototype);
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
//# sourceMappingURL=reflect-hasownmetadata.js.map