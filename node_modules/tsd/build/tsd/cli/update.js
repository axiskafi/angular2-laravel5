'use strict';
var Promise = require('bluebird');
var updateNotifier = require('update-notifier');
var notifier;
function runNotifier(context, waitForIt) {
    if (waitForIt === void 0) { waitForIt = false; }
    var opts = context.settings.getChild('update-notifier');
    return new Promise(function (resolve, reject) {
        if (notifier || !opts.getBoolean('enabled', true)) {
            resolve(notifier);
            return;
        }
        var callback;
        if (waitForIt) {
            callback = function (err, update) {
                if (err) {
                    notifier = null;
                    reject(err);
                }
                else {
                    notifier.update = update;
                    resolve(notifier);
                }
            };
        }
        ;
        var settings = {
            packageName: context.packageInfo.name,
            packageVersion: context.packageInfo.version,
            updateCheckInterval: opts.getDurationSecs('updateCheckInterval', 24 * 3600) * 1000,
            updateCheckTimeout: opts.getDurationSecs('updateCheckTimeout', 10) * 1000,
            registryUrl: opts.getString('registryUrl'),
            callback: callback
        };
        notifier = updateNotifier(settings);
        if (!callback) {
            resolve(notifier);
        }
    });
}
exports.runNotifier = runNotifier;
function showNotifier(output) {
    return Promise.attempt(function () {
        if (notifier && notifier.update) {
            if (notifier.update.type === 'major' || notifier.update.type === 'minor') {
                output.ln();
                output.report(true).span('update available: ');
                output.tweakPunc(notifier.update.current).accent(' -> ').tweakPunc(notifier.update.latest);
                output.ln().ln();
                output.indent().shell(true).span('npm update ' + notifier.update.name + ' -g');
                output.ln();
            }
            notifier = null;
        }
    });
}
exports.showNotifier = showNotifier;
