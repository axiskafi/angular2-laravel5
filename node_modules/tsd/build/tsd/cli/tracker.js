'use strict';
var ua = require('universal-analytics');
var uuid = require('uuid');
var urlMod = require('url');
var VError = require('verror');
var assertVar = require('../../xm/assertVar');
var Context = require('../context/Context');
var Tracker = (function () {
    function Tracker() {
        this._client = getDummy();
        this._eventQueue = [];
        this._workers = [];
        this._workersMax = 50;
        this._workersGrow = 10;
    }
    Tracker.prototype.init = function (context, enabled, debug) {
        if (enabled === void 0) { enabled = true; }
        if (debug === void 0) { debug = false; }
        assertVar(context, Context, 'context');
        assertVar(enabled, 'boolean', 'enabled');
        this._context = context;
        this._enabled = enabled;
        this._debug = debug;
        this._accountID = context.settings.getString('tracker/accountID');
        this._enabled = context.settings.getBoolean('tracker/enabled');
        this._minor = this._context.packageInfo.version.match(/^\d+\.\d+/)[0];
        this._page = [
            '',
            this._context.packageInfo.name,
            this._context.packageInfo.version,
            this._context.config.repoOwner,
            this._context.config.repoProject,
            this._context.config.ref
        ].join('/');
        if (!this._enabled) {
            return;
        }
        if (!this._accountID || !/^UA-\d+-\d+$/.test(this._accountID)) {
            throw new VError('invalid accountID $s', this._accountID);
        }
        this._client = ua(this._accountID, uuid.v4());
        if (this._debug) {
            this._client = this._client.debug();
        }
    };
    Tracker.prototype.getPage = function (parts) {
        return this._page + (parts && parts.length > 0 ? '/' + parts.join('/') : '');
    };
    Tracker.prototype.pageview = function () {
        var parts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            parts[_i - 0] = arguments[_i];
        }
        this._client.pageview(this.getPage(parts)).send();
    };
    Tracker.prototype.query = function (query) {
        this.sendEvent({
            ec: 'query',
            ea: query.patterns.map(function (matcher) {
                return matcher.pattern;
            }).join(' '),
            dp: this.getPage()
        });
    };
    Tracker.prototype.install = function (action, result) {
        var _this = this;
        result.written.forEach(function (value) {
            _this.sendEvent({
                ec: action,
                ea: value.def.path,
                dp: _this.getPage()
            });
        });
    };
    Tracker.prototype.browser = function (url) {
        var parts = urlMod.parse(url);
        this.sendEvent({
            ec: 'browser',
            ea: (parts.path + (parts.hash || '')),
            dp: this.getPage()
        });
    };
    Tracker.prototype.visit = function (url) {
        this.sendEvent({
            ec: 'visit',
            ea: url,
            dp: this.getPage()
        });
    };
    Tracker.prototype.link = function (packg) {
        this.sendEvent({
            ec: 'link',
            ea: packg,
            dp: this.getPage()
        });
    };
    Tracker.prototype.error = function (err) {
        if (err) {
            if (err.message) {
                this._client.exception(err.message).send();
            }
            else {
                this._client.exception(String(err)).send();
            }
        }
    };
    Tracker.prototype.sendEvent = function (event) {
        if (!this._enabled) {
            return;
        }
        if (event) {
            this._eventQueue.push(event);
        }
        var grow = 0;
        while (this._eventQueue.length > 0 && this._workers.length < this._workersMax && grow < this._workersGrow) {
            this.doEvent(this._eventQueue.pop());
            grow++;
        }
    };
    Tracker.prototype.doEvent = function (event) {
        var _this = this;
        this._workers.push(event);
        if (this._debug) {
            console.log('event', event);
        }
        this._client.event(event, function (err) {
            var i = _this._workers.indexOf(event);
            if (i > -1) {
                _this._workers.splice(i, 1);
            }
            if (!err) {
                _this.sendEvent();
            }
        });
    };
    Tracker.prototype.getTimer = function (variable, label) {
        var _this = this;
        if (!this._enabled) {
            return function (err) {
            };
        }
        var start = Date.now();
        return function (err) {
            if (!err) {
                var duration = Date.now() - start;
                if (_this._debug) {
                    console.log('timer', duration + 'ms');
                }
                _this._client.timing(_this.getPage(), variable, duration, label).send();
            }
        };
    };
    Object.defineProperty(Tracker.prototype, "client", {
        get: function () {
            return this._client;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Tracker.prototype, "enabled", {
        get: function () {
            return this._enabled;
        },
        set: function (enabled) {
            if (enabled !== this._enabled) {
                this._enabled = enabled;
                if (this._debug) {
                    console.log('Tracker ' + (this._enabled ? 'enabled' : 'disabled'));
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    return Tracker;
})();
function getDummy() {
    var dummy = {
        debug: function () {
            return dummy;
        },
        send: function () {
            return dummy;
        },
        pageview: function () {
            return dummy;
        },
        event: function () {
            return dummy;
        },
        transaction: function () {
            return dummy;
        },
        item: function () {
            return dummy;
        },
        exception: function () {
            return dummy;
        },
        timing: function () {
            return dummy;
        }
    };
    return dummy;
}
module.exports = Tracker;
