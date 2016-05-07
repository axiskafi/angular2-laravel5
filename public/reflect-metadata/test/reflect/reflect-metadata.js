// Reflect.metadata ( metadataKey, metadataValue )
// - https://github.com/jonathandturner/decorators/blob/master/specs/metadata.md#reflectmetadata--metadatakey-metadatavalue-
System.register(["../../Reflect", "assert"], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var assert;
    function ReflectMetadataReturnsDecoratorFunction() {
        var result = Reflect.metadata("key", "value");
        assert.equal(typeof result, "function");
    }
    exports_1("ReflectMetadataReturnsDecoratorFunction", ReflectMetadataReturnsDecoratorFunction);
    function ReflectMetadataDecoratorThrowsWithInvalidTargetWithTargetKey() {
        var decorator = Reflect.metadata("key", "value");
        assert.throws(function () { return decorator(undefined, "name"); }, TypeError);
    }
    exports_1("ReflectMetadataDecoratorThrowsWithInvalidTargetWithTargetKey", ReflectMetadataDecoratorThrowsWithInvalidTargetWithTargetKey);
    function ReflectMetadataDecoratorThrowsWithInvalidTargetWithoutTargetKey() {
        var decorator = Reflect.metadata("key", "value");
        assert.throws(function () { return decorator({}, undefined); }, TypeError);
    }
    exports_1("ReflectMetadataDecoratorThrowsWithInvalidTargetWithoutTargetKey", ReflectMetadataDecoratorThrowsWithInvalidTargetWithoutTargetKey);
    function ReflectMetadataDecoratorSetsMetadataOnTargetWithoutTargetKey() {
        var decorator = Reflect.metadata("key", "value");
        var target = function () { };
        decorator(target);
        var result = Reflect.hasOwnMetadata("key", target, undefined);
        assert.equal(result, true);
    }
    exports_1("ReflectMetadataDecoratorSetsMetadataOnTargetWithoutTargetKey", ReflectMetadataDecoratorSetsMetadataOnTargetWithoutTargetKey);
    function ReflectMetadataDecoratorSetsMetadataOnTargetWithTargetKey() {
        var decorator = Reflect.metadata("key", "value");
        var target = {};
        decorator(target, "name");
        var result = Reflect.hasOwnMetadata("key", target, "name");
        assert.equal(result, true);
    }
    exports_1("ReflectMetadataDecoratorSetsMetadataOnTargetWithTargetKey", ReflectMetadataDecoratorSetsMetadataOnTargetWithTargetKey);
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
//# sourceMappingURL=reflect-metadata.js.map