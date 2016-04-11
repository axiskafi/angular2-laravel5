'use strict';
var assertVar = require('../../xm/assertVar');
var DefVersion = require('../data/DefVersion');
var DefCommit = require('../data/DefCommit');
var InstalledDef = (function () {
    function InstalledDef(path) {
        if (path) {
            assertVar(path, 'string', 'path');
            this.path = path;
        }
    }
    InstalledDef.prototype.update = function (file) {
        assertVar(file, DefVersion, 'file');
        assertVar(file.commit, DefCommit, 'commit');
        assertVar(file.commit.commitSha, 'sha1', 'commit.sha');
        this.path = file.def.path;
        this.commitSha = file.commit.commitSha;
    };
    InstalledDef.prototype.toString = function () {
        return this.path;
    };
    return InstalledDef;
})();
module.exports = InstalledDef;
