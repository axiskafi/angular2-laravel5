'use strict';
var subjectMessageExp = /^\s*(\S.*?\S?)(?:\s*[\r\n]\s*([\s\S]*?))?\s*$/;
var GitCommitMessage = (function () {
    function GitCommitMessage(text) {
        if (text === void 0) { text = null; }
        if (text) {
            this.parse(text);
        }
    }
    GitCommitMessage.prototype.parse = function (text) {
        this.text = String(text).trim();
        this.subject = '';
        this.body = '';
        subjectMessageExp.lastIndex = 0;
        var match = subjectMessageExp.exec(this.text);
        if (match && match.length > 1) {
            this.subject = String(match[1]).trim();
            if (match.length > 2 && typeof match[2] === 'string' && match[2] !== '') {
                this.body = match[2].replace(/\r\n/g, '\n').trim();
            }
        }
    };
    GitCommitMessage.prototype.toString = function () {
        return (typeof this.subject === 'string' ? this.subject : '<no subject>');
    };
    return GitCommitMessage;
})();
module.exports = GitCommitMessage;
