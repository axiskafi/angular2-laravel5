# angular2-laravel5
Angular 2 setup with Laravel 5

<strong>Step1</strong>
You need pre installed composer, nodejs and typescript to your system

<strong>Step2</strong>

clone the repository files from here to your local server, you can download and unzip it too to a local project folder
[if you change the project folder name angular2-laravel5 to a different project then open the package.json file
"name": "angular2-laravel5", replace this to "name": "yourProjectFolder",
]

<strong>Step3</strong>
then open your terminal

got to your project folder

for me its
cd /Appliations/AMPPS/www/angular2-laravel5
then run below commands into your terminal/command prompt

- composer update

- npm install

<strong>step4</strong>
pen file node_modules\elixir-typescript\index.js and comment out this line ".pipe($.concat(paths.output.name))" .
So the generated files won't be combine in to one single files.
The two js files will be generated to "public/js" as your configuration.

<strong>Step 5</strong>
now in the terminal run these commands

- gulp bower --force-latest

- gulp

<strong>Step 6</strong>

now you are ready to go

