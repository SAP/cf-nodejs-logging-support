# cf-nodejs-shoutboard
This app demonstrates the logging functionality by providing an online shoutbox, which synchronizes messages between clients. There is an express and a restify implementation available.

## Installation on CloudFoundry
 * Make sure to choose a unique name by editing the ```name``` field in manifest.yml
 * Change the ```command``` field to run ```web-express.js``` or ```web-restify```
 * Execute  ```cf push ``` in cf-nodejs-logging-support/sample/cf-nodejs-shoutboard folder
 * Visit the endpoint of the app provided by CloudFoundry

## Running locally
 * Install dependencies by running ```npm install``` 
 * Execute ```node web-express.js``` or ```node web-restify.js``` to run the express or restify version of the app
 * Visit the endpoint of the app (usually http://localhost:8080)
