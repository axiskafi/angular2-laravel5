'use strict';
var trim = /\/$/;
var AuthorInfo = (function () {
    function AuthorInfo(name, url, email) {
        if (name === void 0) { name = ''; }
        if (url === void 0) { url = null; }
        if (email === void 0) { email = null; }
        this.name = name;
        this.url = url;
        this.email = email;
        if (this.url) {
            this.url = this.url.replace(trim, '');
        }
    }
    AuthorInfo.prototype.toString = function () {
        return this.name + (this.email ? ' @ ' + this.email : '') + (this.url ? ' <' + this.url + '>' : '');
    };
    AuthorInfo.prototype.toJSON = function () {
        var obj = {
            name: this.name
        };
        if (this.url) {
            obj.url = this.url;
        }
        if (this.email) {
            obj.email = this.email;
        }
        return obj;
    };
    return AuthorInfo;
})();
module.exports = AuthorInfo;
