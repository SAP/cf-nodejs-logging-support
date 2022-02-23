# cf-nodejs-logging-support-sample
This app demonstrates the logging functionality of the library cf-nodejs-logging-support by providing a simple UI with buttons that send HTTP requests. 

## Installation on CloudFoundry
 * Make sure to choose a unique name by editing the ```name``` field in manifest.yml
 * Execute  ```cf push ``` in cf-nodejs-logging-support/sample/cf-logging-support-sample folder
 * Visit the endpoint of the app provided by CloudFoundry

## Running locally
 * Install dependencies by running ```npm install``` 
 * Execute ```node app.js``` to run the app
 * Visit the endpoint of the app (usually http://localhost:8080)