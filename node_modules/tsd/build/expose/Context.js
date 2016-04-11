'use strict';
var typeOf = require('../xm/typeOf');
var parse = require('../xm/parseString');
var Context = (function () {
    function Context(expose, argv, command) {
        this.expose = expose;
        this.command = command;
        this.argv = argv;
        this.out = this.expose.reporter.output;
    }
    Context.prototype.hasOpt = function (name, strict) {
        if (strict === void 0) { strict = false; }
        if (typeOf.hasOwnProp(this.argv, name)) {
            if (strict && !this.expose.options.has(name)) {
                return false;
            }
            return true;
        }
        return false;
    };
    Context.prototype.getOptRaw = function (name, alt) {
        if (typeOf.hasOwnProp(this.argv, name)) {
            return this.argv[name];
        }
        return alt;
    };
    Context.prototype.getOpt = function (name, alt) {
        if (this.hasOpt(name)) {
            var option = this.expose.options.get(name);
            if (option && option.type) {
                try {
                    return parse.parseStringTo(this.argv[name], option.type);
                }
                catch (e) {
                }
            }
            else {
                return this.argv[name];
            }
        }
        return this.getDefault(name, alt);
    };
    Context.prototype.getOptAs = function (name, type, alt) {
        if (this.hasOpt(name)) {
            return parse.parseStringTo(this.argv[name], type);
        }
        return this.getDefault(name, alt);
    };
    Context.prototype.getOptNames = function (strict) {
        var _this = this;
        if (strict === void 0) { strict = false; }
        return Object.keys(this.argv).filter(function (name) {
            return (name !== '_' && _this.hasOpt(name, strict));
        });
    };
    Context.prototype.getOptEnum = function (name, alt) {
        if (this.hasOpt(name)) {
            if (this.expose.options.has(name)) {
                var option = this.expose.options.get(name);
                var value = this.getOpt(name);
                if (option.enum && option.enum.indexOf(value) > -1) {
                    return value;
                }
            }
        }
        return alt;
    };
    Context.prototype.getDefault = function (name, alt) {
        var option = this.expose.options.get(name);
        if (option && !typeOf.isUndefined(option.default)) {
            return option.default;
        }
        return alt;
    };
    Context.prototype.isDefault = function (name) {
        if (this.hasOpt(name, true)) {
            var def = this.expose.options.get(name).default;
            if (!typeOf.isUndefined(def)) {
                return (def === this.getOpt(name));
            }
        }
        return false;
    };
    Context.prototype.getArgAt = function (index, alt) {
        if (index >= 0 && index < this.argv._.length) {
            return this.argv._[index];
        }
        return alt;
    };
    Context.prototype.getArgAtAs = function (index, type, alt) {
        if (index >= 0 && index < this.argv._.length) {
            return parse.parseStringTo(this.argv._[index], type);
        }
        return alt;
    };
    Context.prototype.getArgsAs = function (type) {
        return this.argv._.map(function (value) {
            return parse.parseStringTo(value, type);
        });
    };
    Context.prototype.shiftArg = function (alt) {
        if (this.argv._.length > 0) {
            return this.argv._.shift();
        }
        return alt;
    };
    Context.prototype.shiftArgAs = function (type, alt) {
        if (this.argv._.length > 0) {
            return parse.parseStringTo(this.argv._.shift(), type);
        }
        return alt;
    };
    Context.prototype.getArgs = function (alt) {
        if (this.argv._.length > 0) {
            return this.argv._.shift();
        }
        return alt;
    };
    Object.defineProperty(Context.prototype, "numArgs", {
        get: function () {
            return this.argv._.length;
        },
        enumerable: true,
        configurable: true
    });
    return Context;
})();
module.exports = Context;
