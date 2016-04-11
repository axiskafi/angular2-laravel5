'use strict';
var Promise = require('bluebird');
var exitProcess = require('exit');
var assert = require('../xm/assert');
var assertVar = require('../xm/assertVar');
var typeOf = require('../xm/typeOf');
var collection = require('../xm/collection');
var objectUtils = require('../xm/objectUtils');
var Command = require('./Command');
var Group = require('./Group');
var Option = require('./Option');
var Context = require('./Context');
var Formatter = require('./Formatter');
var minimist = require('minimist');
var Expose = (function () {
    function Expose(output) {
        if (output === void 0) { output = null; }
        this.commands = new collection.Hash();
        this.options = new collection.Hash();
        this.groups = new collection.Hash();
        this.mainGroup = new Group();
        this._isInit = false;
        this._index = 0;
        this.reporter = new Formatter(this, output);
        objectUtils.defineProps(this, ['commands', 'options', 'groups', 'mainGroup'], {
            writable: false,
            enumerable: false
        });
    }
    Expose.prototype.defineOption = function (build) {
        var opt = new Option();
        build(opt);
        if (opt.type === 'flag' && typeOf.isUndefined(opt.default)) {
            opt.default = false;
        }
        assertVar(opt.name, 'string', 'opt.name');
        if (this.options.has(opt.name)) {
            throw new Error('opt.name collision on ' + opt.name);
        }
        this.options.set(opt.name, opt);
    };
    Expose.prototype.defineCommand = function (build) {
        var cmd = new Command();
        build(cmd);
        cmd.index = (++this._index);
        assertVar(cmd.name, 'string', 'build.name');
        if (this.commands.has(cmd.name)) {
            throw new Error('cmd.name collision on ' + cmd.name);
        }
        this.commands.set(cmd.name, cmd);
    };
    Expose.prototype.defineGroup = function (build) {
        var group = new Group();
        build(group);
        group.index = (++this._index);
        assertVar(group.name, 'string', 'group.name');
        if (this.groups.has(group.name)) {
            throw new Error('group.name collision on ' + group.name);
        }
        this.groups.set(group.name, group);
    };
    Expose.prototype.applyOptions = function (argv) {
        var _this = this;
        var opts = {
            string: [],
            boolean: [],
            alias: {},
            default: {}
        };
        this.options.forEach(function (option) {
            if (option.short) {
                opts.alias[option.name] = [option.short];
            }
            if (option.default) {
                opts.default[option.name] = option.default;
            }
            if (option.type !== 'number') {
                opts.string.push(option.name);
            }
        });
        argv = minimist(argv, opts);
        var ctx = new Context(this, argv, null);
        ctx.getOptNames(true).forEach(function (name) {
            var opt = _this.options.get(name);
            if (opt.apply) {
                opt.apply(ctx.getOpt(name), ctx);
            }
        });
        return ctx;
    };
    Expose.prototype.init = function () {
        var _this = this;
        if (this._isInit) {
            return;
        }
        this._isInit = true;
        this.groups.forEach(function (group) {
            _this.validateOptions(group.options);
        });
        this.commands.forEach(function (cmd) {
            _this.validateOptions(cmd.options);
        });
    };
    Expose.prototype.validateOptions = function (opts) {
        var _this = this;
        opts.forEach(function (name) {
            assert(_this.options.has(name), 'undefined option {a}', name);
        });
    };
    Expose.prototype.exit = function (code) {
        if (code !== 0) {
            this.reporter.output.ln().error('Closing with exit code ' + code).clear();
            exitProcess(code);
        }
        else {
        }
    };
    Expose.prototype.executeArgv = function (argvRaw, alt, exitAfter) {
        var _this = this;
        if (exitAfter === void 0) { exitAfter = true; }
        this.executeRaw(argvRaw, alt).then(function (res) {
            if (_this.end) {
                return Promise.resolve(_this.end.call(null, res)).then(function (over) {
                    return over || res;
                });
            }
            return Promise.resolve(res);
        }).then(function (res) {
            if (res.error) {
                throw (res.error);
            }
            if (exitAfter) {
                _this.exit(res.code);
            }
        }).catch(function (err) {
            if (err.stack) {
                _this.reporter.output.span(err.stack).clear();
            }
            else {
                _this.reporter.output.error(err.toString()).clear();
            }
            _this.exit(1);
        });
    };
    Expose.prototype.executeRaw = function (argvRaw, alt) {
        this.init();
        if (!alt || !this.commands.has(alt)) {
            alt = 'help';
        }
        var options = this.options.values();
        var opt;
        var i, ii;
        var ctx = this.applyOptions(argvRaw);
        if (!ctx) {
            return this.executeCommand(alt);
        }
        for (i = 0, ii = options.length; i < ii; i++) {
            opt = options[i];
            if (opt.command && ctx.hasOpt(opt.name, true)) {
                return this.executeCommand(opt.command, ctx);
            }
        }
        var cmd = ctx.shiftArg();
        cmd = ctx.shiftArg();
        if (ctx.numArgs === 0) {
            return this.executeCommand(alt, ctx);
        }
        cmd = ctx.shiftArg();
        if (this.commands.has(cmd)) {
            return this.executeCommand(cmd, ctx);
        }
        else {
            this.reporter.output.ln().warning('command not found: ' + cmd).clear();
            return this.executeCommand('help', ctx);
        }
    };
    Expose.prototype.executeCommand = function (name, ctx) {
        var _this = this;
        if (ctx === void 0) { ctx = null; }
        this.init();
        if (!this.commands.has(name)) {
            return Promise.resolve({
                ctx: ctx,
                code: 1,
                error: new Error('unknown command ' + name)
            });
        }
        var cmd = this.commands.get(name);
        return Promise.attempt(function () {
            if (_this.before) {
                return Promise.resolve(_this.before(ctx));
            }
        }).then(function () {
            return Promise.resolve(cmd.execute(ctx));
        }).then(function () {
            if (_this.after) {
                return Promise.resolve(_this.after(ctx));
            }
            return null;
        }).then(function () {
            return {
                code: 0,
                ctx: ctx
            };
        }).catch(function (err) {
            return {
                code: (err.code && err.code !== 0 ? err.code : 1),
                error: err,
                ctx: ctx
            };
        });
    };
    return Expose;
})();
module.exports = Expose;
