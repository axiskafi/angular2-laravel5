'use strict';
var Promise = require('bluebird');
Promise.onPossiblyUnhandledRejection(function (error) {
    console.log('---');
    console.log(error.message);
    throw error;
});
try {
    require('source-map-support').install();
    Promise.longStackTraces();
}
catch (e) {
}
process.setMaxListeners(20);
