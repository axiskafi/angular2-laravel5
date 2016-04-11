# ministyle

[![Build Status](https://secure.travis-ci.org/Bartvds/ministyle.png?branch=master)](http://travis-ci.org/Bartvds/ministyle) [![Dependency Status](https://gemnasium.com/Bartvds/ministyle.png)](https://gemnasium.com/Bartvds/ministyle) [![NPM version](https://badge.fury.io/js/ministyle.png)](http://badge.fury.io/js/ministyle)

> Minimal semantic output styler API with default implementations.

A pluggable output styler/coloriser interface to embed in (development) tools and reporters. Offers a standard interface for customisable styled text output. The minimalistic API allows for overwrites to suit any environment.

Intend as companion to [miniwrite](https://github.com/Bartvds/miniwrite) (et al).

## API

Main usage:
````js
// standard console colors
var ms = ministyle.ansi();

// semantic stylers (and color conventions)
var str = ms.muted('ignorable grey');
var str = ms.plain('plain main');
var str = ms.accent('flashy cyan');
var str = ms.signal('bright magenta');
var str = ms.success('good green');
var str = ms.warning('annoying yellow');
var str = ms.error('bad red');

// usage
console.log('this is ' + ms.success('very amaze'));
````

Bundled implementations:

````js
// default
var ms = ministyle.base();
// return as-is
var ms = ministyle.plain();
// ansi terminal codes
var ms = ministyle.ansi();

// html spans with default colors
var ms = ministyle.html();
// html spans with css class
var ms = ministyle.css();

// colors.js getters
var ms = ministyle.colorjs();
// grunt v0.4.x
var ms = ministyle.grunt();

// blank chars
var ms = ministyle.empty();

// dev style wraps with [style:names])
var ms = ministyle.dev();
````

### Advanced sub types

Apply each style in-order
````js
// standard methods will pass the value though each sub-style and return the result
var ms = ministyle.stack(styles);
ms.enabled = true;
ms.stack = [];
````

Peek and update string:
````js
// standard methods pass value through callback
var ms = ministyle.peek(callback, main, alt?);
ms.enabled = true;
ms.callback = function(str, type, main, alt); //return new string, or false to send input to alt
ms.target = otherStyleA;
ms.alt = otherStyleB;
````

Toggle to alternative:
````js
// standard methods will use main if enabled, otherwise alt
var ms = ministyle.toggle(main, alt?);
ms.main = otherStyleA;
ms.alt = otherStyleB;
ms.enabled = true;
ms.toggle();
// hacky
ms.active = otherStyleC; 
````


### Build your own

````js
var obj = {
	plain: function (str) {
		return str;
	},
	success: function (str) {
		return str;
	},
	accent: function (str) {
		return str;
	},
	signal: function (str) {
		return str;
	},
	warning: function (str) {
		return str;
	},
	error: function (str) {
		return str;
	},
	muted: function (str) {
		return str;
	}
};
````

### Examples

Make it bigger:
````js
var ms = ministyle.plain();
ms.error = ms.success = function(str) {
	return str.toUpperCase();
};
````

Safe html:
````js
var ms = ministyle.peek(ministyle.escapeHTML, ministyle.css());
````

## Installation

```shell
$ npm install ministyle --save
```

## Future

1. Code/style generator to replicate style-type logic (needs to be efficient though).

## History

* 0.1.4 - Update to fix npm's README
* 0.1.2 - Added signal colour, enabled strict mode, split in internal modules
* 0.1.0 - Added tests, publishing to npm.
* 0.0.1 - Extracted styling from [miniwrite](https://github.com/Bartvds/miniwrite).

## Build

Install development dependencies in your git checkout:

    $ npm install

Build and run tests:

    $ grunt

See the `Gruntfile.js` for additional commands.

## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

*Note:* this is an opinionated module: please create a [ticket](https://github.com/Bartvds/ministyle/issues) to discuss any big ideas. Pull requests for bug fixes are of course always welcome. 

## License

Copyright (c) 2013 Bart van der Schoor

Licensed under the MIT license.
