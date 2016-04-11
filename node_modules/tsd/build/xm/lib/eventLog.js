'use strict';
var StatCounter = require('./StatCounter');
var typeOf = require('../typeOf');
var inspect = require('../inspect');
var encode = require('../encode');
function padL(input, len, char) {
    char = String(char).charAt(0);
    input = String(input);
    while (input.length < len) {
        input = char + input;
    }
    return input;
}
function valueMap(data) {
    return Object.keys(data).reduce(function (memo, key) {
        if (typeOf.isValueType(data[key])) {
            memo[key] = data[key];
        }
        return memo;
    }, Object.create(null));
}
exports.valueMap = valueMap;
exports.EventLevel = {
    start: 'start',
    complete: 'complete',
    failure: 'failure',
    skip: 'skip',
    share: 'share',
    event: 'event',
    error: 'error',
    warning: 'warning',
    success: 'success',
    status: 'status',
    promise: 'promise',
    resolve: 'resolve',
    reject: 'reject',
    notify: 'notify',
    debug: 'debug',
    log: 'log'
};
exports.EventLevel = valueMap(exports.EventLevel);
Object.freeze(exports.EventLevel);
exports.startTime = Date.now();
var EventLog = (function () {
    function EventLog(prefix, label, log) {
        if (prefix === void 0) { prefix = ''; }
        if (label === void 0) { label = ''; }
        if (log === void 0) { log = false; }
        this._items = [];
        this._logEnabled = false;
        this._trackEnabled = false;
        this._trackLimit = 100;
        this._trackPrune = 30;
        this._mutePromises = [exports.EventLevel.notify, exports.EventLevel.promise, exports.EventLevel.resolve, exports.EventLevel.reject];
        this._label = label;
        this._prefix = (prefix ? prefix + ':' : '');
        this._logEnabled = log;
        this._startAt = Date.now();
    }
    EventLog.prototype.promise = function (promise, type, message, data) {
        var _this = this;
        if (!this.isMuted(exports.EventLevel.notify)) {
            promise.progressed(function (note) {
                _this.track(exports.EventLevel.notify, type, message, note);
            });
        }
        if (!this.isMuted(exports.EventLevel.reject)) {
            promise.catch(function (err) {
                _this.track(exports.EventLevel.reject, type, message, err);
            });
        }
        if (!this.isMuted(exports.EventLevel.resolve)) {
            promise.then(function () {
                _this.track(exports.EventLevel.resolve, type, message);
            });
        }
        if (!this.isMuted(exports.EventLevel.promise)) {
            return this.track(exports.EventLevel.promise, type, message);
        }
        return null;
    };
    EventLog.prototype.start = function (type, message, data) {
        return this.track(exports.EventLevel.start, type, message, data);
    };
    EventLog.prototype.complete = function (type, message, data) {
        return this.track(exports.EventLevel.complete, type, message, data);
    };
    EventLog.prototype.failure = function (type, message, data) {
        return this.track(exports.EventLevel.complete, type, message, data);
    };
    EventLog.prototype.event = function (type, message, data) {
        return this.track(exports.EventLevel.event, type, message, data);
    };
    EventLog.prototype.skip = function (type, message, data) {
        return this.track(exports.EventLevel.skip, type, message, data);
    };
    EventLog.prototype.share = function (type, message, data) {
        return this.track(exports.EventLevel.share, type, message, data);
    };
    EventLog.prototype.error = function (type, message, data) {
        return this.track(exports.EventLevel.error, type, message, data);
    };
    EventLog.prototype.warning = function (type, message, data) {
        return this.track(exports.EventLevel.warning, type, message, data);
    };
    EventLog.prototype.success = function (type, message, data) {
        return this.track(exports.EventLevel.success, type, message, data);
    };
    EventLog.prototype.status = function (type, message, data) {
        return this.track(exports.EventLevel.status, type, message, data);
    };
    EventLog.prototype.log = function (type, message, data) {
        return this.track(exports.EventLevel.log, type, message, data);
    };
    EventLog.prototype.debug = function (type, message, data) {
        return this.track(exports.EventLevel.debug, type, message, data);
    };
    EventLog.prototype.track = function (action, type, message, data, group) {
        var item = new EventLogItem();
        item.type = this._prefix + type;
        item.action = action;
        item.message = message;
        item.data = data;
        item.time = (Date.now() - exports.startTime);
        item.group = group;
        Object.freeze(item);
        if (this._trackEnabled) {
            this._items.push(item);
            this.trim();
        }
        if (this._logEnabled) {
            console.log(this.getItemString(item, true));
        }
        return item;
    };
    EventLog.prototype.trim = function (all) {
        if (all === void 0) { all = false; }
        if (all) {
            this._items.splice(0, this._items.length);
        }
        else if (this._trackLimit > 0 && this._items.length > this._trackLimit + this._trackPrune) {
            this._items.splice(this._trackLimit, this._items.length - this._trackPrune);
        }
    };
    EventLog.prototype.reset = function () {
        this._startAt = Date.now();
        this._items.splice(0, this._items.length);
    };
    EventLog.prototype.isMuted = function (action) {
        return this._mutePromises.indexOf(action) > -1;
    };
    EventLog.prototype.muteActions = function (actions) {
        var _this = this;
        actions.forEach(function (action) {
            if (_this._mutePromises.indexOf(action) < 0) {
                _this._mutePromises.push(action);
            }
        });
    };
    EventLog.prototype.unmuteActions = function (actions) {
        var _this = this;
        if (!actions) {
            this._mutePromises = [];
            return;
        }
        actions.forEach(function (action) {
            for (var i = _this._mutePromises.length - 1; i > -1; i--) {
                if (actions.indexOf(action) > -1) {
                    _this._mutePromises.splice(i, 1);
                }
            }
        });
    };
    EventLog.prototype.unmuteAll = function () {
        this._mutePromises = [];
    };
    EventLog.prototype.setTrack = function (enabled, limit, prune) {
        if (limit === void 0) { limit = NaN; }
        if (prune === void 0) { prune = NaN; }
        this._trackEnabled = enabled;
        this._trackLimit = (isNaN(limit) ? this._trackLimit : limit);
        this._trackPrune = (isNaN(prune) ? this._trackPrune : prune);
    };
    EventLog.prototype.getItemString = function (item, multiline) {
        if (multiline === void 0) { multiline = false; }
        var msg = '';
        msg += item.action + ' -> ' + item.type;
        if (typeOf.isValid(item.message) && item.message.length > 0) {
            msg += (multiline ? '\n      ' : ': ') + encode.trimWrap(item.message, 200, true);
        }
        if (typeOf.isValid(item.data)) {
            msg += (multiline ? '\n      ' : ': ') + inspect.toValueStrim(item.data, 4, 200);
        }
        return msg;
    };
    EventLog.prototype.getHistory = function () {
        var _this = this;
        var memo = [];
        if (this._label) {
            memo.push(this._label + '(' + this._items.length + ')');
        }
        return this._items.reduce(function (memo, item) {
            memo.push(_this.getItemString(item));
            return memo;
        }, memo).join('\n');
    };
    EventLog.prototype.getStats = function () {
        var ret = new StatCounter();
        this._items.forEach(function (item) {
            ret.count(item.action);
        });
        return ret;
    };
    EventLog.prototype.getItems = function () {
        return (this._trackLimit > 0 ? this._items.slice(0, this._trackLimit) : this._items.slice(0));
    };
    EventLog.prototype.getReport = function (label) {
        return this.getStats().getReport(label);
    };
    return EventLog;
})();
exports.EventLog = EventLog;
var itemCounter = 0;
var EventLogItem = (function () {
    function EventLogItem() {
        this.index = (++itemCounter);
    }
    EventLogItem.prototype.toString = function () {
        return this.action + ':' + this.type + ' #' + this.index;
    };
    return EventLogItem;
})();
exports.EventLogItem = EventLogItem;
