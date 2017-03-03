# Node.js Logging Support for Cloud Foundry   

[![Version npm](https://img.shields.io/npm/v/cf-nodejs-logging-support.svg?style=flat-square)](https://www.npmjs.com/package/cf-nodejs-logging-support)[![npm Downloads](https://img.shields.io/npm/dm/cf-nodejs-logging-support.svg?style=flat-square)](https://www.npmjs.com/package/cf-nodejs-logging-support)[![Build Status](https://img.shields.io/travis/SAP/cf-nodejs-logging-support/master.svg?style=flat-square)](https://travis-ci.org/SAP/cf-nodejs-logging-support)

## Features

  * Network logging (http requests) for CloudFoundry
  * Custom message logging
  * Logging levels
  * Can be bound to [Winston](https://github.com/winstonjs/winston) as transport 

## Installation

```bashp
npm install cf-nodejs-logging-support
```
    
## Usage

### Minimal Example
```js
var express = require('express');
var log = require('cf-nodejs-logging-support');
var app = express();

// Set the minimum logging level (Levels: error, warn, info, verbose, debug, silly)
log.setLoggingLevel("info");

// Bind to express app
app.use(log.logNetwork);

app.get('/', function (req, res) {
    // Context bound custom message
    req.logMessage("info", "Hello World will be send");
    
    res.send('Hello World');
});
app.listen(3000);

// Formatted log message free of request context
log.logMessage("info", "Server is listening on port %d", 3000);
```
### Custom Messages

Use the logMessage(...) function to log custom messages with a given logging level. It is also possible to use the standard format placeholders equivalent to the [util.format](https://nodejs.org/api/util.html#util_util_format_format) method.

Custom messages may be called on two objects:
- If you want to keep track of a request with custom messages, you want to call req.logMessage(...) so the correct correlation_id and request_id will be added to this log.
- If you want to write request independent custom messages, you want to call log.logMessage(...) so no further context tracking will be added.

Simple message
```js
logMessage("info", "Hello World"); 
// ... "msg":"Hello World" ...
```

With addtional numeric value
```js
logMessage("info", "Listening on port %d", 5000); 
// ... "msg":"Listening on port 5000" ...
```

With additional string values
```js
logMessage("info", "This %s a %s", "is", "test"); 
// ... "msg":"This is a test" ...
```

With custom fields added to custom_fields field. Keep in mind, that the last argument is handled as custom fields object, if it is an object.
```js
logMessage("info", "Test data %j", {"field" :"value"}); 
// ... "msg":"Test data %j" 
// ... "custom_fields": {"field": "value"} ...
```

With json object forced to be embedded in to the message (nothing will be added to custom_fields).
```js
logMessage("info", "Test data %j", {"field" :"value"}, {}); 
// ... "msg":"Test data {\"field\": \"value\"}" ...
```

### Winston Transport
This logging tool can be used in conjunction with Winston. Example:
```js
var express = require('express');
var log = require('cf-nodejs-logging-support');
var winston = require('winston');

var app = express();

var logger = new(winston.Logger)({
    // Bind transport to winston
    transports: [log.winstonTransport]
});

app.get('/', function (req, res) {
    res.send('Hello World');
});

app.listen(3000);

// Messages will now be logged exactly as demonstrated by the Custom Messages paragraph
logger.log("info", "Server is listening on port %d", 3000);
```

### Request correlation_id
In order to get the correlation_id of an request, you can use the following call.
```js
app.get('/', function (req, res) {
    // Call to context bound function
    var id = req.getCorrelationId();
    
    res.send('Hello World');
});
```

### Human readable output
Setup an output pattern to get a human-readable output instead of json. Use '{{' and '}}' to print log parameters.
```js
log.setLogPattern("{{written_at}} - {{msg}}");
```


## Sample Apps

  * [Express Sample](https://github.com/SAP/cf-nodejs-logging-support/blob/master/sample/cf-nodejs-shoutboard-express)
  * [Restify Sample](https://github.com/SAP/cf-nodejs-logging-support/blob/master/sample/cf-nodejs-shoutboard-restify)
