'use strict';
var assertVar = require('../../xm/assertVar');
var GitCommitUser = (function () {
    function GitCommitUser() {
    }
    GitCommitUser.prototype.toString = function () {
        return (this.name ? this.name : '<no name>') + ' ' + (this.email ? '<' + this.email + '>' : '<no email>');
    };
    GitCommitUser.fromJSON = function (json) {
        if (!json) {
            return null;
        }
        assertVar(json.name, 'string', ' json.name');
        assertVar(json.email, 'string', ' json.email');
        var ret = new GitCommitUser();
        ret.name = json.name;
        ret.email = json.email;
        ret.date = new Date(Date.parse(json.date));
        return ret;
    };
    return GitCommitUser;
})();
module.exports = GitCommitUser;
