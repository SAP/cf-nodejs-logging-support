# cf-nodejs-logging-support-sample
This app serves to test the performance of the library cf-nodejs-logging-support. 


## Test performance with built-in node profiler
 * Install dependencies by running ```npm install``` 
 * Execute ```npm start``` to run the app in production mode with the built-in profiler.
 * Send http requests to trigger operations and then use the tick processor bundled with the Node.js binary to create a readable .txt file (See https://nodejs.org/en/docs/guides/simple-profiling/).
