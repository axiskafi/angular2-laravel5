'use strict';
var miniwrite = require('miniwrite');
var ministyle = require('ministyle');
var assertVar = require('../../xm/assertVar');
var collection = require('../../xm/collection');
var StyledOut = require('../../xm/lib/StyledOut');
var StyleMap = (function () {
    function StyleMap(output) {
        var _this = this;
        this._outputs = new collection.Set();
        assertVar(output, StyledOut, 'output');
        this.addOutput(output);
        this._styleMap = new collection.Hash();
        this._styleMap.set('no', function (ctx) {
            _this._outputs.forEach(function (output) {
                output.useStyle(ministyle.plain());
            });
        });
        this._styleMap.set('plain', function (ctx) {
            _this._outputs.forEach(function (output) {
                output.useStyle(ministyle.plain());
            });
        });
        this._styleMap.set('ansi', function (ctx) {
            _this._outputs.forEach(function (output) {
                output.useStyle(ministyle.ansi());
            });
        });
        this._styleMap.set('html', function (ctx) {
            _this._outputs.forEach(function (output) {
                output.useStyle(ministyle.html(true));
                output.useWrite(miniwrite.htmlString(miniwrite.log(), null, null, '<br/>'));
            });
        });
        this._styleMap.set('css', function (ctx) {
            _this._outputs.forEach(function (output) {
                output.useStyle(ministyle.css('', true));
                output.useWrite(miniwrite.htmlString(miniwrite.log(), 'span', { 'class': 'cli' }, '<br/>'));
            });
        });
        this._styleMap.set('dev', function (ctx) {
            _this._outputs.forEach(function (output) {
                output.useStyle(ministyle.dev());
            });
        });
    }
    StyleMap.prototype.addOutput = function (output) {
        this._outputs.add(output);
    };
    StyleMap.prototype.getStyles = function () {
        return this._styleMap.keys();
    };
    StyleMap.prototype.useStyle = function (color, ctx) {
        if (this._styleMap.has(color)) {
            this._styleMap.get(color)(ctx);
        }
        else {
            this._styleMap.get('plain')(ctx);
        }
    };
    return StyleMap;
})();
module.exports = StyleMap;
