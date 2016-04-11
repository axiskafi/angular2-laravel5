'use strict';
var GithubUser = (function () {
    function GithubUser() {
    }
    GithubUser.prototype.toString = function () {
        return (this.login ? this.login : '<no login>') + (this.id ? '[' + this.id + ']' : '<no id>');
    };
    GithubUser.fromJSON = function (json) {
        if (!json) {
            return null;
        }
        var ret = new GithubUser();
        ret.id = parseInt(json.id, 10);
        ret.login = json.login;
        ret.avatar_url = json.avatar_url;
        return ret;
    };
    return GithubUser;
})();
module.exports = GithubUser;
