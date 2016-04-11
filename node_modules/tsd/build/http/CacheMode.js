'use strict';
var CacheMode;
(function (CacheMode) {
    CacheMode[CacheMode["forceLocal"] = 1] = "forceLocal";
    CacheMode[CacheMode["forceRemote"] = 2] = "forceRemote";
    CacheMode[CacheMode["forceUpdate"] = 3] = "forceUpdate";
    CacheMode[CacheMode["allowRemote"] = 4] = "allowRemote";
    CacheMode[CacheMode["allowUpdate"] = 5] = "allowUpdate";
})(CacheMode || (CacheMode = {}));
module.exports = CacheMode;
