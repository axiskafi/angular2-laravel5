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
        <base href="./">
        {{ Html::style('css/styles.css') }}

    

    <!-- Load libraries -->
    <!-- IE required polyfills, in this exact order -->
    {{ Html::script('es6-shim/es6-shim.min.js') }}
    {{ Html::script('zone.js/dist/zone.js') }}
    {{ Html::script('reflect-metadata/Reflect.js') }}
    {{ Html::script('systemjs/dist/system.src.js') }}
    {{ Html::script('systemjs.config.js') }}
    
    


 <!--   


    {{ Html::script('@angular/es6/dev/src/testing/shims_for_IE.js') }}
    {{ Html::script('@angular/bundles/angular2-polyfills.js') }}
    {{ Html::script('systemjs/dist/system.js') }}
    {{ Html::script('rxjs/bundles/Rx.js') }}
    {{ Html::script('angular2/bundles/angular2.dev.js') }}
    {{ Html::script('angular2/bundles/router.dev.js') }}
    {{ Html::script('angular2/bundles/http.dev.js') }}

    {{ Html::script('js/d3.min.js') }}
    {{ Html::script('js/c3.min.js') }}
    {{ Html::script('js/scripts.js') }}-->
<!--
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
    -->

 
    <script>
      System.import('app').catch(function(err){ console.error(err); });
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
