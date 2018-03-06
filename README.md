# Node.js Logging Support for Cloud Foundry   

[![Version npm](https://img.shields.io/npm/v/cf-nodejs-logging-support.svg?style=flat-square)](https://www.npmjs.com/package/cf-nodejs-logging-support)[![npm Downloads](https://img.shields.io/npm/dm/cf-nodejs-logging-support.svg?style=flat-square)](https://www.npmjs.com/package/cf-nodejs-logging-support)[![Build Status](https://img.shields.io/travis/SAP/cf-nodejs-logging-support/master.svg?style=flat-square)](https://travis-ci.org/SAP/cf-nodejs-logging-support)

## Summary

This is a collection of support libraries for node.js applications running on Cloud Foundry that serve two main purposes: It provides (a) means to emit *structured application log messages* and (b) instrument parts of your application stack to *collect request metrics*.

For details on the concepts and log formats, please look at the sibling project for [java logging support](https://github.com/SAP/cf-java-logging-support).

#### Version 2.0 introduced logging without Winston and changed custom fields to be parsed and reported as strings regardless of original type.
#### Version 3.0 introduced dynamic log levels, sensitive data reduction and a redesigned field configuration system

## Features

  * Network logging (http requests) for CloudFoundry
  * Custom message logging
  * Logging levels
  * Dynamic logging level (per request)
  * Extendable field configuration
  * Sensitive data reduction
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

### Other Server Libraries

The logging library defaults to express middleware behaviour, but it can be forced to work with other Server libraries as well:
#### With restify:
```js
var restify = require('restify');
var log = require('cf-nodejs-logging-support');
var app = restify.createServer();
//forces logger to run the restify version. (default is express, forcing express is also legal)
log.forceLogger("restify");

//insert the logger in the server network queue, so each time a https request is recieved, it is will get logged.
app.use(log.logNetwork);

//same usage as express logger, see minimal example above
```
#### With nodejs http:
```js
var log = require("cf-nodejs-logging-support");
const http = require('http');

//forces logger to run the http version.
log.forceLogger("plainhttp");

const server = http.createServer((req, res) => {
    //binds logging to the given request for request tracking
    log.logNetwork(req, res);
    
    // Context bound custom message
    req.logMessage("info", "request bound information:", {
        "some": "info"
    });
    res.end('ok');
});
server.listen(3000);
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

With custom fields added to custom_fields field. Keep in mind, that the last argument is handled as custom_fields object, if it is an object.
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

### Sensitive data reduction
Version 3.0.0 and above implements a sensitive data reduction system, which deactivates the logging of sensitive fields. The field will contain 'reducted' instead of the original content.

Following fields will be *reduced* by default: remote_ip, remote_host, remote_port, x_forwarded_for, remote_user, referer.

In order to activate normal logging for all or some of these fields, you have to setup environment variables with the following names:

| Environment Variable                      | Optional fields                                                           |
|-------------------------------------------|---------------------------------------------------------------------------|
| ```LOG_SENSITIVE_CONNECTION_DATA: true``` | activates the fields remote_ip, remote_host, remote_port, x_forwarded_for |
| ```LOG_REMOTE_USER: true```               | activates the field remote_user                                           |
| ```LOG_REFERER: true```                   | activates the field referer                                               |

This behavior matches with the corresponding mechanism in the [CF Java Logging Support](https://github.com/SAP/cf-java-logging-support/wiki/Overview#logging-sensitive-user-data) library.

### Dynamic log levels
Sometimes it is useful to change the logging level for a specific request. This can be achieved by dynamic log levels set by a special header field or directly inside the corresponding request handler. 

#### Change log level via header field
You can change the log level for a specific request by providing a JSON Web Token ([JWT](https://de.wikipedia.org/wiki/JSON_Web_Token)) via the request header. This way it is not necessary to redeploy your app for every log level change.

##### 1 Preparation
JWTs are signed objects, which can be verified with a preprovided key. Create a key and setup a environment variable:
```
DYN_LOG_LEVEL_KEY: <your JWT key>
```

Redeploy your app in order to load the key from environment variables.

##### 2 Creating JWTs
Create a JWT token with the TokenCreator following payload:
```
{
  "issuer": "<valid e-mail address>",
  "level": "debug",
  "iat": 1506016127,
  "exp": 1506188927
}
```
Setup the *level* field with your prefered logging level (error, warn, info, verbose, debug or silly).
Make sure to set valid *Issued At (iat)* and *Expiration Date (exp)* timestamps.

##### 3 Using JWTs
Provide your created JWT via the header field 'SAP-LOG-LEVEL'. The logging level will be set to the provided level for the resulting request (and also corresponding custom log messages).  

If you want to use another header name for the JWT, you can specify it via a enviroment variable:
```
DYN_LOG_HEADER: MY-HEADER-FIELD
```

#### Change log level within request handler
You can also change the log level for all requests of a specific request handler by calling:
```js
req.setDynamicLoggingLevel("verbose");
```

### Winston Transport
This logging tool can be used in conjunction with Winston. Logging via Winston transport is limited to custom logs. Network activity can not be tracked automatically. Example:
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

### Fixed Values for Network Logging (will impact log parsing if used incorrectly)
Possibility to tailor logs to your needs, you can for example change the msg field for Network-logs to a find them in Human readable format:
```js
log.overrideNetworkField("msg", YOUR_CUSTOM_MSG);
```
This will replace the value of the previously empty msg field for network logs with YOUR_CUSTOM_MSG.


## Sample Apps

  * [Express Sample](https://github.com/SAP/cf-nodejs-logging-support/blob/master/sample/cf-nodejs-shoutboard-express)
  * [Restify Sample](https://github.com/SAP/cf-nodejs-logging-support/blob/master/sample/cf-nodejs-shoutboard-restify)
