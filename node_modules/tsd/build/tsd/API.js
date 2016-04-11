'use strict';
require('../bootstrap');
var path = require('path');
var Promise = require('bluebird');
var openInApp = require('open');
var assertVar = require('../xm/assertVar');
var Context = require('./context/Context');
var Def = require('./data/Def');
var defUtil = require('./util/defUtil');
var Query = require('./select/Query');
var Selection = require('./select/Selection');
var VersionMatcher = require('./select/VersionMatcher');
var InstallResult = require('./logic/InstallResult');
var Options = require('./Options');
var Core = require('./logic/Core');
var PackageLinker = require('./support/PackageLinker');
var BundleManager = require('./support/BundleManager');
var API = (function () {
    function API(context) {
        this.context = context;
        assertVar(context, Context, 'context');
        this.core = new Core(this.context);
    }
    API.prototype.initConfig = function (overwrite) {
        var _this = this;
        return this.core.config.initConfig(overwrite).then(function (configPath) {
            configPath = path.relative(process.cwd(), configPath);
            if (!_this.context.config.bundle) {
                return Promise.resolve([configPath]);
            }
            var manager = new BundleManager(_this.core.context.getTypingsDir());
            return manager.saveEmptyBundle(_this.context.config.bundle).then(function () {
                return [configPath, path.relative(process.cwd(), _this.context.config.bundle)];
            }, function () {
                return [configPath];
            });
        });
    };
    API.prototype.readConfig = function (optional) {
        return this.core.config.readConfig(optional);
    };
    API.prototype.saveConfig = function () {
        return this.core.config.saveConfig();
    };
    API.prototype.select = function (query, options) {
        assertVar(query, Query, 'query');
        assertVar(options, Options, 'options', true);
        options = options || Options.main;
        return this.core.selector.select(query, options);
    };
    API.prototype.install = function (selection, options) {
        var _this = this;
        assertVar(selection, Selection, 'selection');
        assertVar(options, Options, 'options', true);
        options = options || Options.main;
        var res = new InstallResult(options);
        var files = defUtil.mergeDependencies(selection.selection);
        return this.core.installer.installFileBulk(files, options.saveToConfig, options.overwriteFiles)
            .then(function (written) {
            if (!written) {
                throw new Error('expected install paths');
            }
            res.written = written;
        }).then(function () {
            if (options.saveToConfig) {
                return _this.core.config.saveConfig();
            }
            return null;
        }).then(function () {
            return _this.saveBundles(res.written.values(), options);
        }).return(res);
    };
    API.prototype.saveBundles = function (files, options) {
        assertVar(files, 'array', 'files');
        assertVar(options, Options, 'options', true);
        options = options || Options.main;
        if (files.length === 0) {
            return Promise.resolve();
        }
        var refs = [];
        files.forEach(function (file) {
            refs.push(file.def.path);
        });
        refs.sort();
        var basePath = path.dirname(this.context.paths.configFile);
        var manager = new BundleManager(this.core.context.getTypingsDir());
        var bundles = [];
        if (options.addToBundles) {
            options.addToBundles.forEach(function (bundle) {
                bundle = path.resolve(basePath, bundle);
                if (!/\.ts$/.test(bundle)) {
                    bundle += '.d.ts';
                }
                bundles.push(bundle);
            });
        }
        if ((options.saveToConfig || options.saveBundle) && this.context.config.bundle) {
            bundles.push(path.resolve(basePath, this.context.config.bundle));
        }
        return Promise.map(bundles, function (target) {
            return manager.addToBundle(target, refs, true);
        }).return();
    };
    API.prototype.reinstall = function (options) {
        var _this = this;
        var res = new InstallResult(options);
        return this.core.installer.reinstallBulk(this.context.config.getInstalled(), options.overwriteFiles)
            .then(function (map) {
            res.written = map;
        }).then(function () {
            if (options.saveToConfig) {
                return _this.core.config.saveConfig();
            }
            return null;
        }).then(function () {
            return _this.saveBundles(res.written.values(), options);
        }).then(function () {
            if (options.reinstallClean) {
                var typingsPath = path.join(path.dirname(_this.core.context.paths.configFile), _this.core.context.config.toJSON().path);
                _this.core.installer.removeUnusedReferences(_this.context.config.getInstalled(), typingsPath).then(function (removedList) {
                    options.overwriteFiles = options.saveBundle = true;
                    return _this.saveBundles(_this.context.config.getInstalledAsDefVersionList(), options);
                });
            }
            else {
                options.overwriteFiles = options.saveBundle = true;
                return _this.saveBundles(_this.context.config.getInstalledAsDefVersionList(), options);
            }
            return null;
        }).return(res);
    };
    API.prototype.update = function (options, version) {
        var _this = this;
        if (version === void 0) { version = 'latest'; }
        var query = new Query();
        this.context.config.getInstalled().forEach(function (inst) {
            query.addNamePattern(new Def(inst.path).pathTerm);
        });
        query.versionMatcher = new VersionMatcher(version);
        return this.select(query, options).then(function (selection) {
            return _this.install(selection, options);
        });
    };
    API.prototype.link = function (baseDir) {
        assertVar(baseDir, 'string', 'baseDir');
        var linker = new PackageLinker();
        var manager = new BundleManager(this.core.context.getTypingsDir());
        var bundlePath = path.join(path.dirname(this.core.context.paths.configFile), this.core.context.config.toJSON().bundle);
        return linker.scanDefinitions(baseDir).then(function (packages) {
            return Promise.reduce(packages, function (memo, packaged) {
                return manager.addToBundle(bundlePath, packaged.definitions, true).then(function (change) {
                    if (change.someAdded()) {
                        memo.push(packaged);
                    }
                    return memo;
                });
            }, []);
        });
    };
    API.prototype.addToBundle = function (target, refs, save) {
        var manager = new BundleManager(this.core.context.getTypingsDir());
        return manager.addToBundle(target, refs, save);
    };
    API.prototype.cleanupBundle = function (target, save) {
        var manager = new BundleManager(this.core.context.getTypingsDir());
        return manager.cleanupBundle(target, save);
    };
    API.prototype.updateBundle = function (target, save) {
        var manager = new BundleManager(this.core.context.getTypingsDir());
        return manager.updateBundle(target, save);
    };
    API.prototype.getRateInfo = function () {
        return this.core.repo.api.getRateInfo();
    };
    API.prototype.compare = function (query) {
        assertVar(query, Query, 'query');
        return Promise.reject(new Error('not implemented yet'));
    };
    API.prototype.browse = function (list) {
        var _this = this;
        assertVar(list, 'array', 'list');
        if (list.length > 2) {
            return Promise.reject(new Error('to many results to open in browser'));
        }
        return Promise.resolve(list.map(function (file) {
            var ref = file.commit.commitSha;
            if (file.def.head && file.commit.commitSha === file.def.head.commit.commitSha) {
                ref = _this.core.context.config.ref;
            }
            var url = _this.core.repo.urls.htmlFile(ref, file.def.path);
            openInApp(url);
            return url;
        }));
    };
    API.prototype.visit = function (list) {
        var _this = this;
        assertVar(list, 'array', 'list');
        if (list.length > 2) {
            return Promise.reject(new Error('to many results to open in browser'));
        }
        return Promise.map(list, function (file) {
            if (!file.info) {
                return _this.core.parser.parseDefInfo(file);
            }
            return Promise.resolve(file);
        }).then(function (list) {
            return list.reduce(function (memo, file) {
                var urls;
                if (file.info && file.info.projects) {
                    urls = file.info.projects;
                }
                else if (file.def.head.info && file.def.head.info.projects) {
                    urls = file.def.head.info.projects;
                }
                if (urls) {
                    urls.forEach(function (url) {
                        memo.push(url);
                        openInApp(url);
                    });
                }
                return memo;
            }, []);
        });
    };
    API.prototype.purge = function (raw, api) {
        var queue = [];
        if (raw) {
            queue.push(this.core.repo.raw.cache.cleanupCacheAge(0));
        }
        if (api) {
            queue.push(this.core.repo.api.cache.cleanupCacheAge(0));
        }
        return Promise.all(queue).return();
    };
    return API;
})();
module.exports = API;
