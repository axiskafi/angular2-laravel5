'use strict';
function sortCommandIndex(one, two) {
    if (one.index < two.index) {
        return -1;
    }
    else if (one.index > two.index) {
        return 1;
    }
    if (one.name < two.name) {
        return -1;
    }
    else if (one.name > two.name) {
        return 1;
    }
    return 0;
}
exports.sortCommandIndex = sortCommandIndex;
function sortHasElem(one, two, elem) {
    var oneI = one.indexOf(elem) > -1;
    var twoI = two.indexOf(elem) > -1;
    if (oneI && !twoI) {
        return -1;
    }
    else if (!oneI && twoI) {
        return 1;
    }
    return 0;
}
exports.sortHasElem = sortHasElem;
function sortCommand(one, two) {
    if (one.name < two.name) {
        return -1;
    }
    else if (one.name > two.name) {
        return 1;
    }
    if (one.index < two.index) {
        return -1;
    }
    else if (one.index > two.index) {
        return 1;
    }
    return 0;
}
exports.sortCommand = sortCommand;
function sortGroup(one, two) {
    if (one.index < two.index) {
        return -1;
    }
    else if (one.index > two.index) {
        return 1;
    }
    if (one.name < two.name) {
        return -1;
    }
    else if (one.name > two.name) {
        return 1;
    }
    return 0;
}
exports.sortGroup = sortGroup;
function sortOption(one, two) {
    if (one.short && !two.short) {
        return -1;
    }
    if (!one.short && two.short) {
        return 1;
    }
    if (one.short && two.short) {
        if (one.short.toLowerCase() < two.short.toLowerCase()) {
            return -1;
        }
        else if (one.short.toLowerCase() > two.short.toLowerCase()) {
            return 1;
        }
    }
    if (one.name.toLowerCase() < two.name.toLowerCase()) {
        return -1;
    }
    else if (one.name.toLowerCase() > two.name.toLowerCase()) {
        return 1;
    }
    return 0;
}
exports.sortOption = sortOption;
