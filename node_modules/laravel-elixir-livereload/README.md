# laravel-elixir-livereload
> laravel-elixir-livereload plugin for [larvel-elixir](https://github.com/laravel/elixir) and [gulp](https://github.com/wearefractal/gulp)

[![npm](https://img.shields.io/npm/v/laravel-elixir-livereload.svg)](https://www.npmjs.com/package/laravel-elixir-livereload)
[![npm](https://img.shields.io/npm/dm/laravel-elixir-livereload.svg)](https://www.npmjs.com/package/laravel-elixir-livereload)
[![GitHub issues](https://img.shields.io/github/issues/EHLOVader/laravel-elixir-livereload.svg)](https://github.com/EHLOVader/laravel-elixir-livereload/issues)
[![GitHub stars](https://img.shields.io/github/stars/EHLOVader/laravel-elixir-livereload.svg)](https://github.com/EHLOVader/laravel-elixir-livereload/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/EHLOVader/laravel-elixir-livereload.svg)](https://github.com/EHLOVader/laravel-elixir-livereload/network)
[![GitHub license](https://img.shields.io/github/license/ehlovader/laravel-elixir-livereload.svg)](https://github.com/ehlovader/laravel-elixir-livereload)

## Installation

Using NPM to install Laravel Elixir Livereload and save your `packages.json`
 
**For laravel-elixir >v3.x**
```
npm install --save-dev laravel-elixir-livereload
```

**For laravel-elixir < v2.x**
```
npm install --save-dev laravel-elixir-livereload@"^0.0"
```

Or you can manually update your `packages.json` to include Laravel Elixir Livereload

```
{
  "devDependencies": {
    "gulp": "^3.8.8",
    "laravel-elixir": "^3.0",
    "laravel-elixir-livereload": "^1.0"
  }
}
```

and then run `npm install`

Next, add it to your Elixir-enhanced Gulpfile, like so:

```js
var elixir = require('laravel-elixir');

require('laravel-elixir-livereload');

elixir(function(mix) {
   mix.livereload();
});
```

Live reload also uses a script file so add the following to your blade templates.

```php
@if ( Config::get('app.debug') )
  <script type="text/javascript">
    document.write('<script src="//localhost:35729/livereload.js?snipver=1" type="text/javascript"><\/script>')
  </script>
@endif
```

That's it! You're all set to go!

## Usage


## API

You can change the src glob used for the stream or pass options to the `livereload` task to customize behavior.

### laravel-elixir-livereload(src, options)

#### src _(optional)_
Type: `array` or `string`  
Default: `[
              'app/**/*',
              'public/**/*',
              'resources/views/**/*'
          ]`

#### options _(optional)_
Type: `object`

Default: `{}`

###livereload options
larvel-elixir-livereload passes its options on to [livereload](https://github.com/vohof/gulp-livereload).

```
port                     Server port
host                     Server host
basePath                 Path to prepend all given paths
start                    Automatically start
quiet        false       Disable console logging
reloadPage   index.html  Path to the page the browsers on for a full page reload
```

###tiny-lr options
livereload also passes its options through to the [tiny-lr](https://github.com/mklabs/tiny-lr) server.

```
livereload        Path to the client side lib (defaults to path.join(__dirname, '../node_modules/livereload-js/dist/livereload.js'))
port              Livereload port (defaults to 35729)
errorListener     A callback to invoke when an error occurs (otherwise, fallbacks to standard error output)
app               An express or other middleware based HTTP server
key               Option to pass in to create an https server
cert              Option to pass in to create an https server
pfx               Can also be used to create an https server instead of key & cert
liveCSS           LiveReload option to enable live CSS reloading (defaults to true)
liveJs            LiveReload option to enable live JS reloading (defaults to true)
liveImg           LiveReload option to enable live images reloading (defaults to true)
```

## License

[The MIT License (MIT)](http://en.wikipedia.org/wiki/MIT_License)

Copyright (c) 2015 Joseph Richardson

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


