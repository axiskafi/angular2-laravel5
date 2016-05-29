# Angular 2-Laravel5
Angular 2 setup with Laravel 5

<strong>Step1</strong>

You need pre installed `composer`, `nodejs` and `typescript` to your system

<strong>Step2</strong>

Clone the repository

`git clone git@github.com:YourAccount/angular2-laravel5.git`

<strong>Step3</strong>

`cd angular2-laravel5`

`composer update`

`npm install`

`gulp bower --force-latest`

`gulp`

<strong>Step 4</strong>

<h2>Running the project from the local server</h2>

`php artisan serve --port=8080`

<strong>Stept 5</strong>

open a new terminal and type this command

`gulp watch`

<strong>Step 6</strong>

now open a browser and type this

`http://localhost:8080/`

You will write your angular code to the resources/assets/typescript folder
whenever you will write a new code the elixir type script will automatically compile it via gulp watch
and you have to refresh yuour browser to see the changes.



