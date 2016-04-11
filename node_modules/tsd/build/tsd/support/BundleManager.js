'use strict';
var path = require('path');
var Promise = require('bluebird');
var VError = require('verror');
var fileIO = require('../../xm/fileIO');
var Bundle = require('../support/Bundle');
var BundleChange = require('../support/BundleChange');
var BundleManager = (function () {
    function BundleManager(typingsDir) {
        this.typingsDir = typingsDir;
    }
    BundleManager.prototype.addToBundle = function (target, refs, save) {
        var _this = this;
        return this.readBundle(target, true).then(function (bundle) {
            var change = new BundleChange(bundle);
            refs.forEach(function (ref) {
                change.add(bundle.append(ref));
            });
            if (save && change.someAdded()) {
                return _this.saveBundle(bundle).return(change);
            }
            return Promise.resolve(change);
        });
    };
    BundleManager.prototype.readBundle = function (target, optional) {
        target = path.resolve(target);
        var bundle = new Bundle(target, this.typingsDir);
        return fileIO.exists(target).then(function (exists) {
            if (!exists) {
                if (!optional) {
                    throw new VError('cannot locate file %s', target);
                }
                return Promise.resolve(bundle);
            }
            return fileIO.read(target, { flags: 'rb' }).then(function (buffer) {
                bundle.parse(buffer.toString('utf8'));
            }).return(bundle);
        });
    };
    BundleManager.prototype.cleanupBundle = function (target, save) {
        var _this = this;
        target = path.resolve(target);
        return this.readBundle(target, true).then(function (bundle) {
            var change = new BundleChange(bundle);
            return Promise.map(bundle.toArray(), function (full) {
                return fileIO.exists(full).then(function (exists) {
                    if (!exists) {
                        change.remove(bundle.remove(full));
                    }
                });
            }).then(function () {
                if (save && change.someRemoved()) {
                    return _this.saveBundle(bundle);
                }
                return Promise.resolve();
            }).return(change);
        });
    };
    BundleManager.prototype.updateBundle = function (target, save) {
        var _this = this;
        target = path.resolve(target);
        return this.cleanupBundle(target, false).then(function (change) {
            return fileIO.glob('*/*.d.ts', {
                cwd: change.bundle.baseDir
            }).then(function (paths) {
                paths.forEach(function (def) {
                    var full = path.resolve(change.bundle.baseDir, def);
                    change.add(change.bundle.append(full));
                });
                if (save && change.someChanged()) {
                    return _this.saveBundle(change.bundle);
                }
                return Promise.resolve();
            }).return(change);
        });
    };
    BundleManager.prototype.saveBundle = function (bundle) {
        var target = path.resolve(bundle.target);
        return fileIO.write(target, bundle.stringify());
    };
    BundleManager.prototype.saveEmptyBundle = function (target) {
        target = path.resolve(target);
        return fileIO.exists(target).then(function (exists) {
            if (!exists) {
                return fileIO.write(target, '\n');
            }
        });
    };
    return BundleManager;
})();
module.exports = BundleManager;
