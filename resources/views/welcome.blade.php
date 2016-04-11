<!DOCTYPE html>
<html>
    <head>
        <title>Laravel</title>

        <link href="https://fonts.googleapis.com/css?family=Lato:100" rel="stylesheet" type="text/css">

        <style>
            html, body {
                height: 100%;
            }

            body {
                margin: 0;
                padding: 0;
                width: 100%;
                display: table;
                font-weight: 100;
                font-family: 'Lato';
            }

            .container {
                text-align: center;
                display: table-cell;
                vertical-align: middle;
            }

            .content {
                text-align: center;
                display: inline-block;
            }

            .title {
                font-size: 96px;
            }
        </style>
        <base href="./public/">
        {{ Html::style('public/css/styles.css') }}
    <!-- Load libraries -->
    <!-- IE required polyfills, in this exact order -->
    {{ Html::script('public/es6-shim/es6-shim.min.js') }}
    {{ Html::script('public/angular2/es6/dev/src/testing/shims_for_IE.js') }}
    {{ Html::script('public/angular2/bundles/angular2-polyfills.js') }}
    {{ Html::script('public/systemjs/dist/system.js') }}
    {{ Html::script('public/rxjs/bundles/Rx.js') }}
    {{ Html::script('public/angular2/bundles/angular2.dev.js') }}
    {{ Html::script('public/angular2/bundles/router.dev.js') }}
    {{ Html::script('public/angular2/bundles/http.dev.js') }}

    {{ Html::script('public/js/d3.min.js') }}
    {{ Html::script('public/js/c3.min.js') }}
    {{ Html::script('public/js/scripts.js') }}

    <script>
        System.config({
            "defaultJSExtensions": true,
            packages: {
                app: {
                    format: 'register',
                    defaultExtension: 'js'
                }
            }
        });

        System.import('js/boot')
                .then(null, console.error.bind(console));
    </script>
    </head>
    <body>
        <div class="container">
            <div class="content">
                <my-app>Loading...</my-app>
                <div class="title">Laravel 5</div>
            </div>
        </div>
    </body>
</html>
