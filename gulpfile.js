var gulp = require("gulp");
var bower = require("gulp-bower");
var elixir = require("laravel-elixir");
var elixirTypscript = require('elixir-typescript');

gulp.task('bower', function () {
    return bower();
});

var vendors = '../../assets/vendors/';

var paths = {
    'jquery': vendors + 'jquery/dist',
    'jqueryUi': vendors + 'jquery-ui',
    'moment': vendors + 'moment',
    'bootstrap': vendors + 'bootstrap/dist',
    'fontawesome': vendors + 'font-awesome',
    'eonasdanBootstrapDatetimepicker': vendors + 'eonasdan-bootstrap-datetimepicker/build',
    'tether' : vendors + 'tether/dist'
};


elixir(function (mix) {

    mix.copy('node_modules/@angular', 'public/@angular');
    mix.copy('node_modules/rxjs', 'public/rxjs');
    mix.copy('node_modules/systemjs', 'public/systemjs');
    mix.copy('node_modules/es6-promise', 'public/es6-promise');
    mix.copy('node_modules/es6-shim', 'public/es6-shim');
    mix.copy('node_modules/zone.js', 'public/zone.js');
    mix.copy('node_modules/satellizer', 'public/satellizer');
    mix.copy('node_modules/platform', 'public/platform');
    mix.copy('node_modules/reflect-metadata', 'public/reflect-metadata');

    mix.copy('resources/assets/vendors/jquery-ui/themes/base/images', 'public/images');

    mix.copy('resources/assets/vendors/c3/c3.min.css', 'public/css');
    mix.copy('resources/assets/vendors/c3/c3.min.js', 'public/js');
    mix.copy('resources/assets/vendors/d3/d3.min.js', 'public/js');

    mix.copy('resources/assets/vendors/font-awesome/fonts', 'public/fonts');

    //CSS Libraries
    mix.styles([paths.fontawesome + "/css/font-awesome.min.css",
        paths.jqueryUi + "/themes/base/core.css",
        paths.tether + '/css/tether.css',
        paths.eonasdanBootstrapDatetimepicker + '/css/bootstrap-datetimepicker.css'
    ], 'public/css/styles.css');


    //JS Libraries
    mix.scripts([paths.jquery + "/jquery.js",
        paths.jqueryUi + "/jquery-ui.min.js",
        paths.tether + '/js/tether.js',
        paths.bootstrap + "/js/bootstrap.min.js",
        paths.moment + '/moment.js',
        paths.eonasdanBootstrapDatetimepicker + '/js/bootstrap-datetimepicker.min.js'
    ], 'public/js/scripts.js');


    mix.typescript(
        '/**/*.ts',
        'public/js',
        {
            "target": "es5",
            "module": "system",
            "moduleResolution": "node",
            "sourceMap": true,
            "emitDecoratorMetadata": true,
            "experimentalDecorators": true,
            "removeComments": false,
            "noImplicitAny": false
        }
    );

});
