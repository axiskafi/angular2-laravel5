'use strict';

var Joi = require('joi');
var AssertionError = require('assertion-error');

var hasOwnProp= Object.prototype.hasOwnProperty;

// helper
function getTotal(err) {
	if (err.details.length > 1) {
		return '(' + err.details.length + ') ';
	}
	return ': ';
}

// helper
function getLabel(describe, err) {
	if (describe.description) {
		return describe.description + getTotal(err);
	}
	return describe.type + getTotal(err);
}

// main assertino logic
function assertion(value, schema, message, vars, ssf) {
	return Joi.validate(value, schema, function(err, value) {
		// fast way
		if (!err) {
			return value;
		}

		// assemble message
		var msg = '';

		// process message (if any)
		var mtype = typeof message;
		if (mtype === 'string') {
			if (vars && typeof vars === 'object') {
				// mini template
				message = message.replace(/\{([\w]+)\}/gi, function (match, key) {
					if (hasOwnProp.call(vars, key)) {
						return vars[key];
					}
				});
			}
			msg += message + ': ';
		}

		// append schema label
		msg += getLabel(schema.describe(), err);

		// append some of the errors
		var maxDetails = 4;

		msg += err.details.slice(0, maxDetails).map(function(det) {
			if (/^\w+\.\w/.test(det.path)) {
				return '[' + det.path + '] ' + det.message;
			}
			return det.message;
		}).join(', ');

		if (err.details.length > maxDetails) {
			var hidden = (err.details.length - maxDetails);
			msg += '... (showing ' + (err.details.length - hidden) + ' of ' + err.details.length + ')';
		}

		// booya
		throw new AssertionError(msg, {
			details: err.details,
			value: value
		}, ssf);
	});
}

module.exports = assertion;
