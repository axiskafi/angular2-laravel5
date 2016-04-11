'use strict';
var errHandler = require('./util/error-handler');
var path = require('path');
var fs = require('fs');
var Promise = require('bluebird');
var VError = require('verror');
var ministyle = require('ministyle');
var assertVar = require('../xm/assertVar');
var PackageJSON = require('../xm/lib/PackageJSON');
var StyledOut = require('../xm/lib/StyledOut');
var ActionMap = require('../xm/lib/ActionMap');
var API = require('./API');
var Options = require('./Options');
var Context = require('./context/Context');
var Const = require('./context/Const');
var Paths = require('./context/Paths');
var Query = require('./select/Query');
var VersionMatcher = require('./select/VersionMatcher');
var CommitMatcher = require('./select/CommitMatcher');
var DateMatcher = require('./select/DateMatcher');
var Expose = require('../expose/Expose');
var ExposeContext = require('../expose/Context');
var sorter = require('../expose/sorter');
var CliConst = require('./cli/const');
var Opt = CliConst.Opt;
var Group = CliConst.Group;
var Action = CliConst.Action;
var Printer = require('./cli/CLIPrinter');
var TablePrinter = require('./cli/TablePrinter');
var StyleMap = require('./cli/StyleMap');
var Tracker = require('./cli/tracker');
var addCommon = require('./cli/addCommon');
var update = require('./cli/update');
var Job = (function () {
    function Job() {
    }
    return Job;
})();
exports.Job = Job;
function getExpose() {
    var output = new StyledOut();
    if (!process.stdout['isTTY']) {
        output.useStyle(ministyle.plain());
    }
    var print = new Printer(output);
    var table = new TablePrinter(output);
    var styles = new StyleMap(output);
    var tracker = new Tracker();
    function init(ctx) {
        return Promise.resolve();
    }
    function showHeader() {
        var pkg = PackageJSON.getLocal();
        output.ln().report(true).tweakPunc(pkg.getNameVersion()).ln();
        return Promise.resolve();
    }
    function runUpdateNotifier(ctx, context) {
        if (ctx.getOpt(Opt.services)) {
            return update.runNotifier(context, false);
        }
        return Promise.resolve();
    }
    function getContext(ctx) {
        assertVar(ctx, ExposeContext, 'ctx');
        var context = new Context(ctx.getOpt(Opt.config), ctx.getOpt(Opt.verbose));
        tracker.init(context, (ctx.getOpt(Opt.services) && context.config.stats), ctx.getOpt(Opt.verbose));
        if (ctx.getOpt(Opt.dev)) {
            context.paths.cacheDir = path.resolve(path.dirname(PackageJSON.find()), Const.cacheDir);
        }
        else if (ctx.hasOpt(Opt.cacheDir)) {
            context.paths.cacheDir = path.resolve(ctx.getOpt(Opt.cacheDir));
        }
        else if (!context.paths.cacheDir) {
            context.paths.cacheDir = Paths.getUserCacheDir();
        }
        return Promise.resolve(context);
    }
    var defaultJobOptions = [Opt.config];
    function jobOptions(merge) {
        if (merge === void 0) { merge = []; }
        return defaultJobOptions.concat(merge);
    }
    function getAPIJob(ctx) {
        return init(ctx).then(function () {
            return getContext(ctx).then(function (context) {
                var job = new Job();
                job.context = context;
                job.ctx = ctx;
                job.api = new API(job.context);
                job.options = new Options();
                job.options.limitApi = ctx.getOpt(Opt.limit);
                job.options.minMatches = ctx.getOpt(Opt.min);
                job.options.maxMatches = ctx.getOpt(Opt.max);
                job.options.saveToConfig = ctx.getOpt(Opt.save);
                job.options.saveBundle = ctx.getOpt(Opt.save);
                job.options.overwriteFiles = ctx.getOpt(Opt.overwrite);
                job.options.resolveDependencies = ctx.getOpt(Opt.resolve);
                job.options.addToBundles = ctx.getOpt(Opt.bundle);
                job.options.reinstallClean = ctx.getOpt(Opt.reinstallClean);
                if (ctx.hasOpt(Opt.cacheMode)) {
                    job.api.core.useCacheMode(ctx.getOpt(Opt.cacheMode));
                }
                return job.api.readConfig(true).then(function () {
                    tracker.enabled = (tracker.enabled && job.context.config.stats);
                    return runUpdateNotifier(ctx, job.context);
                }).return(job);
            });
        });
    }
    function getSelectorJob(ctx) {
        return getAPIJob(ctx).then(function (job) {
            if (ctx.numArgs < 1) {
                throw new VError('pass at least one query pattern');
            }
            job.query = new Query();
            for (var i = 0, ii = ctx.numArgs; i < ii; i++) {
                job.query.addNamePattern(ctx.getArgAt(i));
            }
            job.query.versionMatcher = new VersionMatcher(ctx.getOpt(Opt.semver));
            if (ctx.hasOpt(Opt.commit)) {
                job.query.commitMatcher = new CommitMatcher(ctx.getOpt(Opt.commit));
            }
            if (ctx.hasOpt(Opt.date)) {
                job.query.dateMatcher = new DateMatcher(ctx.getOpt(Opt.date));
            }
            job.query.parseInfo = ctx.getOpt(Opt.info);
            job.query.loadHistory = ctx.getOpt(Opt.history);
            if (ctx.getOptAs(Opt.verbose, 'boolean')) {
                output.span('CLI job.query').info().inspect(job.query, 3);
            }
            return job;
        });
    }
    var expose = new Expose(output);
    function reportError(err, head) {
        if (head === void 0) { head = true; }
        tracker.error(err);
        errHandler.handler(err);
    }
    ;
    function link(job) {
        return job.api.link(job.api.context.paths.startCwd).then(function (packages) {
            if (packages.length > 0) {
                packages.forEach(function (linked) {
                    tracker.link(linked.name + ' (' + linked.manager + ')');
                    output.indent(1).report(true).line(linked.name + ' (' + linked.manager + ')');
                });
            }
            return packages;
        });
    }
    expose.before = function (ctx) {
        return null;
    };
    expose.end = function (ctx) {
        if (!ctx.error) {
            return update.showNotifier(output);
        }
        return null;
    };
    expose.defineGroup(function (group) {
        group.name = Group.query;
        group.label = 'main';
        group.options = [Opt.config, Opt.cacheDir, Opt.min, Opt.max, Opt.limit];
        group.sorter = function (one, two) {
            var sort;
            sort = sorter.sortHasElem(one.groups, two.groups, Group.query);
            if (sort !== 0) {
                return sort;
            }
            return sorter.sortCommandIndex(one, two);
        };
    });
    expose.defineGroup(function (group) {
        group.name = Group.manage;
        group.label = 'manage';
        group.options = [];
        group.sorter = function (one, two) {
            var sort;
            sort = sorter.sortHasElem(one.groups, two.groups, Group.manage);
            if (sort !== 0) {
                return sort;
            }
            return sorter.sortCommandIndex(one, two);
        };
    });
    expose.defineGroup(function (group) {
        group.name = Group.support;
        group.label = 'support';
        group.options = [];
        group.sorter = function (one, two) {
            var sort;
            sort = sorter.sortHasElem(one.groups, two.groups, Group.support);
            if (sort !== 0) {
                return sort;
            }
            return sorter.sortCommandIndex(one, two);
        };
    });
    expose.defineGroup(function (group) {
        group.name = Group.help;
        group.label = 'help';
    });
    addCommon(expose, print, styles);
    function executeReinstall(ctx, cmd) {
        return getAPIJob(ctx).then(function (job) {
            output.line();
            output.info(true).span('running').space().accent(cmd.name).ln();
            return job.api.reinstall(job.options).then(function (result) {
                print.installResult(result);
                tracker.install('reinstall', result);
            });
        }).catch(reportError);
    }
    expose.defineCommand(function (cmd) {
        cmd.name = 'help';
        cmd.label = 'display usage help';
        cmd.groups = [Group.support];
        cmd.execute = function (ctx) {
            return showHeader().then(function () {
                return getContext(ctx);
            }).then(function (context) {
                ctx.out.ln();
                ctx.expose.reporter.printCommands();
                return runUpdateNotifier(ctx, context);
            }).catch(reportError);
        };
    });
    expose.defineCommand(function (cmd) {
        cmd.name = 'version';
        cmd.label = 'display tsd version info';
        cmd.groups = [Group.support];
        cmd.execute = function (ctx) {
            return showHeader().then(function () {
                return getContext(ctx);
            }).then(function (context) {
                return runUpdateNotifier(ctx, context);
            }).catch(reportError);
        };
    });
    expose.defineCommand(function (cmd) {
        cmd.name = 'init';
        cmd.label = 'create empty config file';
        cmd.options = [Opt.config, Opt.overwrite];
        cmd.groups = [Group.support];
        cmd.execute = function (ctx) {
            return getAPIJob(ctx).then(function (job) {
                return job.api.initConfig(ctx.getOpt(Opt.overwrite)).then(function (targets) {
                    output.ln();
                    targets.forEach(function (dest) {
                        output.info().accent('written').sp().span(dest).ln();
                    });
                });
            }).catch(reportError);
        };
    });
    expose.defineCommand(function (cmd) {
        cmd.name = 'settings';
        cmd.label = 'display config settings';
        cmd.options = [Opt.config, Opt.cacheDir];
        cmd.groups = [Group.support];
        cmd.execute = function (ctx) {
            return getAPIJob(ctx).then(function (job) {
                output.ln().plain(JSON.stringify(job.api.context.getInfo(true), null, 3));
            }).catch(reportError);
        };
    });
    expose.defineCommand(function (cmd) {
        cmd.name = 'purge';
        cmd.label = 'clear local caches';
        cmd.options = [Opt.cacheDir];
        cmd.groups = [Group.support];
        cmd.execute = function (ctx) {
            return getAPIJob(ctx).then(function (job) {
                return job.api.purge(true, true).then(function () {
                    output.ln().info().success('purged cache').ln();
                });
            }).catch(reportError);
        };
    });
    var queryActions = new ActionMap();
    queryActions.set(Action.install, function (ctx, job, selection) {
        return job.api.install(selection, job.options).then(function (result) {
            print.installResult(result);
            tracker.install('install', result);
        });
    });
    queryActions.set(Action.browse, function (ctx, job, selection) {
        return job.api.browse(selection.selection).then(function (opened) {
            if (opened.length > 0) {
                print.output.ln();
                opened.forEach(function (url) {
                    print.output.note(true).line(url);
                    tracker.browser(url);
                });
            }
        });
    });
    queryActions.set(Action.visit, function (ctx, job, selection) {
        return job.api.visit(selection.selection).then(function (opened) {
            if (opened.length > 0) {
                print.output.ln();
                opened.forEach(function (url) {
                    print.output.note(true).line(url);
                    tracker.visit(url);
                });
            }
        });
    });
    expose.defineCommand(function (cmd) {
        cmd.name = 'install';
        cmd.label = 'install definitions using one or more globbing patterns.';
        cmd.examples = [
            ['tsd install mocha', 'install mocha'],
            ['tsd install angularjs/', 'install full angularjs bundle'],
            ['tsd install', 'perform reinstall command']
        ];
        cmd.variadic = ['...pattern'];
        cmd.groups = [Group.query];
        cmd.options = [
            Opt.semver, Opt.date, Opt.commit,
            Opt.overwrite, Opt.save, Opt.bundle
        ];
        cmd.execute = function (ctx) {
            if (ctx.numArgs === 0) {
                return executeReinstall(ctx, cmd);
            }
            ctx.argv[Opt.resolve] = true;
            return getSelectorJob(ctx).then(function (job) {
                tracker.query(job.query);
                if (job.options.saveToConfig) {
                    job.options.overwriteFiles = true;
                }
                return job.api.select(job.query, job.options).then(function (selection) {
                    if (selection.selection.length === 0) {
                        output.ln().report().signal('zero results').ln();
                        return;
                    }
                    output.line();
                    table.fileTable(selection.selection);
                    output.ln().report(true).span('running').space().accent('install').span('..').ln();
                    return job.api.install(selection, job.options).then(function (result) {
                        print.installResult(result);
                        tracker.install('install', result);
                    }).catch(function (err) {
                        output.report().span('install').space().error('error!').ln();
                        reportError(err, false);
                    });
                });
            }).catch(reportError);
        };
    });
    expose.defineCommand(function (cmd) {
        cmd.name = 'query';
        cmd.label = 'search definitions using one or more globbing patterns';
        cmd.examples = [
            ['tsd query d3 --info --history', 'view d3 info & history'],
            ['tsd query mocha --action install', 'install mocha'],
            ['tsd query jquery.*/*', 'search jquery plugins'],
            ['tsd query angularjs/ --resolve', 'list full angularjs bundle']
        ];
        cmd.variadic = ['...pattern'];
        cmd.groups = [Group.query];
        cmd.options = [
            Opt.info, Opt.history,
            Opt.semver, Opt.date, Opt.commit,
            Opt.action,
            Opt.resolve, Opt.overwrite, Opt.save, Opt.bundle
        ];
        cmd.execute = function (ctx) {
            return getSelectorJob(ctx).then(function (job) {
                tracker.query(job.query);
                if (job.options.saveToConfig) {
                    job.options.overwriteFiles = true;
                }
                return job.api.select(job.query, job.options).then(function (selection) {
                    if (selection.selection.length === 0) {
                        output.ln().report().signal('zero results').ln();
                        return;
                    }
                    output.line();
                    table.fileTable(selection.selection);
                    return Promise.attempt(function () {
                        var action = ctx.getOpt(Opt.action);
                        if (!action) {
                            return;
                        }
                        if (!queryActions.has(action)) {
                            output.ln().report().signal('unknown action:').space().span(action).ln();
                            return;
                        }
                        output.ln().report(true).span('running').space().accent(action).span('..').ln();
                        return queryActions.run(action, function (run) {
                            return run(ctx, job, selection);
                        }, true).catch(function (err) {
                            output.report().span(action).space().error('error!').ln();
                            reportError(err, false);
                        });
                    });
                });
            }).catch(reportError);
        };
    });
    expose.defineCommand(function (cmd) {
        cmd.name = 'reinstall';
        cmd.label = 're-install definitions from config';
        cmd.options = [Opt.overwrite, Opt.save, Opt.reinstallClean];
        cmd.groups = [Group.manage];
        cmd.execute = function (ctx) {
            return executeReinstall(ctx, cmd);
        };
    });
    expose.defineCommand(function (cmd) {
        cmd.name = 'update';
        cmd.label = 'update definitions from config';
        cmd.options = [Opt.overwrite, Opt.save];
        cmd.groups = [Group.manage];
        cmd.execute = function (ctx) {
            return getAPIJob(ctx).then(function (job) {
                output.line();
                output.info(true).span('running').space().accent(cmd.name).ln();
                return job.api.update(job.options).then(function (result) {
                    print.installResult(result);
                    tracker.install('update', result);
                });
            }).catch(reportError);
        };
    });
    expose.defineCommand(function (cmd) {
        cmd.name = 'rebundle';
        cmd.label = 'update & clean reference bundle';
        cmd.groups = [Group.manage];
        cmd.execute = function (ctx) {
            return getAPIJob(ctx).then(function (job) {
                return Promise.attempt(function () {
                    if (!job.api.context.config.bundle) {
                        output.line();
                        output.report(true).line('no bundle configured').ln();
                        return null;
                    }
                    output.line();
                    return job.api.updateBundle(job.api.context.config.bundle, true).then(function (changes) {
                        if (changes.someRemoved()) {
                            output.report(true).line('removed:');
                            changes.getRemoved(true, true).sort().forEach(function (file) {
                                output.indent(1).bullet(true).tweakPath(file).ln();
                            });
                        }
                        if (changes.someAdded()) {
                            output.report(true).line('added:');
                            changes.getAdded(true, true).sort().forEach(function (file) {
                                output.indent(1).bullet(true).tweakPath(file).ln();
                            });
                        }
                        if (!changes.someAdded() && !changes.someRemoved()) {
                            output.report(true).span('nothing rebundled').ln();
                        }
                    });
                });
            }).catch(reportError);
        };
    });
    expose.defineCommand(function (cmd) {
        cmd.name = 'link';
        cmd.label = 'link definitions from package managers';
        cmd.groups = [Group.manage];
        cmd.execute = function (ctx) {
            return getAPIJob(ctx).then(function (job) {
                output.line();
                return link(job).then(function (packages) {
                    if (packages.length === 0) {
                        output.report(true).line('no (new) packages to link');
                    }
                });
            }).catch(reportError);
        };
    });
    expose.defineCommand(function (cmd) {
        cmd.name = 'rate';
        cmd.label = 'check github rate-limit';
        cmd.groups = [Group.support];
        cmd.execute = function (ctx) {
            return getAPIJob(ctx).then(function (job) {
                return job.api.getRateInfo().then(function (info) {
                    print.rateInfo(info, false, true);
                });
            }).catch(reportError);
        };
    });
    return expose;
}
exports.getExpose = getExpose;
try {
    if (fs.existsSync(path.resolve(process.cwd(), 'tsd-debug.log'))) {
        fs.unlinkSync(path.resolve(process.cwd(), 'tsd-debug.log'));
    }
}
catch (e) { }
function runARGV(argvRaw) {
    getExpose().executeArgv(argvRaw, 'help');
}
exports.runARGV = runARGV;
