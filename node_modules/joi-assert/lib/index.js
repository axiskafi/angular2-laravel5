'use strict';

var assertion = require('./assertion');

// export API

// core assertion method
var internals = function assert(value, schema, message, vars) {
	return assertion(value, schema, message, vars, (internals.debug ? null : assert));
};

// enables debug (disables stack trimming)
internals.debug = false;

// return a closure that curries schema and message
internals.bake = function (schema, message) {
	var f = function (value, vars) {
		return assertion(value, schema, message, vars, (internals.debug ? null : f));
	};
	return f;
};

module.exports = internals;
