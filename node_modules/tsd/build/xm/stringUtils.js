'use strict';
function padLeftZero(input, length) {
    if (length === void 0) { length = 2; }
    var r = String(input);
    while (r.length < length) {
        r = '0' + r;
    }
    return r;
}
exports.padLeftZero = padLeftZero;
function wordWrap(input, length) {
    if (length === void 0) { length = 80; }
    var lines = [];
    var broken = input.split(/\r?\n/);
    broken.forEach(function (line, index) {
        var parts = line.trim().split(/[ \t]+/g);
        var accumulator = [];
        var len = 0;
        var next = parts.shift();
        accumulator.push(next);
        len += next.length + 1;
        while (parts.length > 0) {
            next = parts.shift();
            if (len + next.length + 1 > length) {
                lines.push(accumulator.join(' '));
                accumulator = [];
                len = 0;
            }
            accumulator.push(next);
            len += next.length + 1;
        }
        if (accumulator.length > 0) {
            lines.push(accumulator.join(' '));
        }
    });
    return lines;
}
exports.wordWrap = wordWrap;
