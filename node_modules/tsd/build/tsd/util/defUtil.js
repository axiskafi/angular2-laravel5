'use strict';
var VError = require('verror');
var semver = require('semver');
var dateUtils = require('../../xm/dateUtils');
var Const = require('../context/Const');
var referenceTagExp = /<reference[ \t]*path=["']?([\w\.\/_-]*)["']?[ \t]*\/>/g;
function shaShort(sha) {
    if (!sha) {
        return '<no sha>';
    }
    return sha.substr(0, Const.shaShorten);
}
exports.shaShort = shaShort;
function getDefs(list) {
    return list.map(function (def) {
        return def.def;
    });
}
exports.getDefs = getDefs;
function getHeads(list) {
    return list.map(function (def) {
        return def.head;
    });
}
exports.getHeads = getHeads;
function getHistoryTop(list) {
    return list.map(function (def) {
        if (def.history.length === 1) {
            return def.history[0];
        }
        else if (def.history.length > 0) {
            return def.history.sort(fileCompare)[0];
        }
        return def.head;
    });
}
exports.getHistoryTop = getHistoryTop;
function getHistoryBottom(list) {
    return list.map(function (def) {
        if (def.history.length === 1) {
            return def.history[0];
        }
        else if (def.history.length > 0) {
            return def.history.sort(fileCompare)[def.history.length - 1];
        }
        return def.head;
    });
}
exports.getHistoryBottom = getHistoryBottom;
function getLatest(list) {
    if (list.length === 1) {
        return list[0];
    }
    else if (list.length > 1) {
        return list.sort(fileCompare)[0];
    }
    return null;
}
exports.getLatest = getLatest;
function getRecent(list) {
    if (list.length === 1) {
        return list[0];
    }
    else if (list.length > 1) {
        return list.sort(fileCompare)[list.length - 1];
    }
    return null;
}
exports.getRecent = getRecent;
function getPaths(list) {
    return list.map(function (def) {
        return def.path;
    });
}
exports.getPaths = getPaths;
function getPathsOf(list) {
    return list.map(function (file) {
        return file.def.path;
    });
}
exports.getPathsOf = getPathsOf;
function uniqueDefVersion(list) {
    var ret = [];
    outer: for (var i = 0, ii = list.length; i < ii; i++) {
        var check = list[i];
        for (var j = 0, jj = ret.length; j < jj; j++) {
            if (check.def.path === ret[j].def.path) {
                continue outer;
            }
        }
        ret.push(check);
    }
    return ret;
}
exports.uniqueDefVersion = uniqueDefVersion;
function uniqueDefs(list) {
    var ret = [];
    outer: for (var i = 0, ii = list.length; i < ii; i++) {
        var check = list[i];
        for (var j = 0, jj = ret.length; j < jj; j++) {
            if (check.path === ret[j].path) {
                continue outer;
            }
        }
        ret.push(check);
    }
    return ret;
}
exports.uniqueDefs = uniqueDefs;
function extractReferenceTags(source) {
    var ret = [];
    var match;
    if (!referenceTagExp.global) {
        throw new VError('referenceTagExp RegExp must have global flag');
    }
    referenceTagExp.lastIndex = 0;
    while ((match = referenceTagExp.exec(source))) {
        if (match.length > 0 && match[1].length > 0) {
            ret.push(match[1]);
        }
    }
    return ret;
}
exports.extractReferenceTags = extractReferenceTags;
var externalModules = /(?:^|\r?\n)declare module *(['"])(\w+)\1\s*{/g;
function extractExternals(source) {
    var ret = [];
    var match;
    if (!externalModules.global) {
        throw new VError('referenceTagExp RegExp must have global flag');
    }
    externalModules.lastIndex = 0;
    while ((match = externalModules.exec(source))) {
        if (match.length >= 2 && match[2].length > 0) {
            ret.push(match[2]);
        }
    }
    return ret;
}
exports.extractExternals = extractExternals;
function contains(list, file) {
    var p = file.def.path;
    for (var i = 0, ii = list.length; i < ii; i++) {
        if (list[i].def.path === p) {
            return true;
        }
    }
    return false;
}
exports.contains = contains;
function containsDef(list, def) {
    var p = def.path;
    for (var i = 0, ii = list.length; i < ii; i++) {
        if (list[i].path === p) {
            return true;
        }
    }
    return false;
}
exports.containsDef = containsDef;
function mergeDependencies(list, target) {
    target = target || [];
    for (var i = 0, ii = list.length; i < ii; i++) {
        var file = list[i];
        if (!contains(target, file)) {
            target.push(file);
            mergeDependenciesOf(file.dependencies, target);
        }
    }
    return target;
}
exports.mergeDependencies = mergeDependencies;
function mergeDependenciesOf(list, target) {
    target = target || [];
    for (var i = 0, ii = list.length; i < ii; i++) {
        var file = list[i].head;
        if (!contains(target, file)) {
            target.push(file);
            mergeDependenciesOf(file.dependencies, target);
        }
    }
    return target;
}
exports.mergeDependenciesOf = mergeDependenciesOf;
function matchCommit(list, commitSha) {
    var ret = [];
    for (var i = 0, ii = list.length; i < ii; i++) {
        var file = list[i];
        if (file.commit && file.commit.commitSha === commitSha) {
            ret.push(file);
        }
    }
    return ret;
}
exports.matchCommit = matchCommit;
function fileCompare(aa, bb) {
    if (!bb) {
        return 1;
    }
    if (!aa) {
        return -1;
    }
    if (aa.def.path < bb.def.path) {
        return -1;
    }
    else if (aa.def.path > bb.def.path) {
        return 1;
    }
    if (aa.blobSha < bb.blobSha) {
        return -1;
    }
    else if (aa.blobSha > bb.blobSha) {
        return 1;
    }
    return 0;
}
exports.fileCompare = fileCompare;
function defCompare(aa, bb) {
    if (!bb) {
        return 1;
    }
    if (!aa) {
        return -1;
    }
    if (aa.path < bb.path) {
        return -1;
    }
    else if (aa.path > bb.path) {
        return 1;
    }
    return 0;
}
exports.defCompare = defCompare;
function defSemverCompare(aa, bb) {
    if (!bb) {
        return 1;
    }
    if (!aa) {
        return -1;
    }
    if (aa.semver && !bb.semver) {
        return -1;
    }
    else if (!aa.semver && bb.semver) {
        return 1;
    }
    return semver.compare(aa.semver, bb.semver);
}
exports.defSemverCompare = defSemverCompare;
function fileCommitCompare(aa, bb) {
    var aaDate = aa.commit && aa.commit.changeDate;
    var bbDate = bb.commit && bb.commit.changeDate;
    if (!bbDate) {
        return 1;
    }
    if (!aaDate) {
        return -1;
    }
    return dateUtils.compare(aaDate, bbDate);
}
exports.fileCommitCompare = fileCommitCompare;
