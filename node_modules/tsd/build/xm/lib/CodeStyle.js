'use strict';
var CodeStyle = (function () {
    function CodeStyle() {
        this.eol = '\n';
        this.indent = '  ';
        this.trailingEOL = true;
    }
    CodeStyle.prototype.clone = function () {
        var style = new CodeStyle();
        style.eol = this.eol;
        style.indent = this.indent;
        style.trailingEOL = this.trailingEOL;
        return style;
    };
    return CodeStyle;
})();
module.exports = CodeStyle;
