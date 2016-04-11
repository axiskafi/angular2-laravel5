# angular2-laravel5
Angular 2 setup with Laravel 5
You need pre installed composer, nodejs and typescript to your system

first clone the files from here, you can download and unzip it too
then open your terminal

got to your project folder

for me its
cd /Appliations/AMPPS/www/angular2-laravel5
then run below commands into your terminal/command prompt

- composer update

- npm install

- gulp bower --force-latest

- gulp

- Open file node_modules\elixir-typescript\index.js and comment out this line ".pipe($.concat(paths.output.name))" .
So the generated files won't be combine in to one single files.
The two js files will be generated to "public/js" as your configuration.

