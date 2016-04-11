'use strict';
var path = require('path');
var tsd = require('./api');
function getAPI(options) {
    var api = tsd.getAPI(options.config, options.verbose);
    if (options.cacheDir) {
        api.context.paths.cacheDir = path.resolve(options.cacheDir);
    }
    return api;
}
function getContent(options) {
    var api = getAPI(options);
    return api.readConfig(false).then(function () {
        var opts = new tsd.Options();
        opts.resolveDependencies = false;
        var query = new tsd.Query();
        query.addNamePattern('*');
        query.setVersionRange('all');
        query.parseInfo = true;
        return api.select(query, opts);
    }).then(function (selection) {
        return selection.definitions.filter(function (def) {
            return !def.isLegacy && def.isMain;
        }).sort(tsd.defUtil.defCompare).map(function (def) {
            var ret = {
                project: def.project,
                name: def.name,
                path: def.path,
                semver: (def.semver || 'latest')
            };
            if (def.head.info) {
                ret.info = def.head.info;
            }
            if (def.head.dependencies) {
                ret.dependencies = def.head.dependencies.map(function (dep) {
                    var ret = {
                        project: dep.project,
                        name: dep.name,
                        path: dep.path,
                        semver: (dep.semver || 'latest')
                    };
                    return ret;
                });
            }
            if (def.releases) {
                ret.releases = def.releases.map(function (rel) {
                    var ret = {
                        path: rel.path,
                        semver: (rel.semver || null)
                    };
                    return ret;
                });
            }
            return ret;
        });
    }).then(function (content) {
        var ret = {
            repo: api.context.config.repo,
            ref: api.context.config.ref,
            count: content.length,
            time: new Date().toISOString()
        };
        ret.urls = {
            def: 'https://github.com/' + ret.repo + '/blob/' + ret.ref + '/{path}'
        };
        ret.content = content;
        return ret;
    });
}
module.exports = getContent;
