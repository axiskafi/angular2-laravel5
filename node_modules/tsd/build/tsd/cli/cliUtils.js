'use strict';
var tty = require('tty');
function getViewWidth(width, max) {
    if (width === void 0) { width = 80; }
    if (max === void 0) { max = 0; }
    var isatty = (tty.isatty(1) && tty.isatty(2));
    if (isatty) {
        if (typeof process.stdout['getWindowSize'] === 'function') {
            width = process.stdout['getWindowSize'](1)[0];
        }
        else {
            width = tty['getWindowSize']()[1];
        }
    }
    if (max > 0) {
        width = Math.min(max, width);
    }
    return width;
}
exports.getViewWidth = getViewWidth;
