// Reflect.defineMetadata ( metadataKey, metadataValue, target, propertyKey )
// - https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#reflectdefinemetadata--metadatakey-metadatavalue-target-propertykey-    
System.register(["../../Reflect", "assert"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var assert;
    function ReflectDefineMetadataInvalidTarget() {
        assert.throws(function () { return Reflect.defineMetadata("key", "value", undefined, undefined); }, TypeError);
    }
    exports_1("ReflectDefineMetadataInvalidTarget", ReflectDefineMetadataInvalidTarget);
    function ReflectDefineMetadataValidTargetWithoutTargetKey() {
        assert.doesNotThrow(function () { return Reflect.defineMetadata("key", "value", {}, undefined); });
    }
    exports_1("ReflectDefineMetadataValidTargetWithoutTargetKey", ReflectDefineMetadataValidTargetWithoutTargetKey);
    function ReflectDefineMetadataValidTargetWithTargetKey() {
        assert.doesNotThrow(function () { return Reflect.defineMetadata("key", "value", {}, "name"); });
    }
    exports_1("ReflectDefineMetadataValidTargetWithTargetKey", ReflectDefineMetadataValidTargetWithTargetKey);
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
//# sourceMappingURL=reflect-definemetadata.js.map