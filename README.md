# Node.js Logging Support for Cloud Foundry   

[![Version npm](https://img.shields.io/npm/v/cf-nodejs-logging-support.svg?style=flat-square)](https://www.npmjs.com/package/cf-nodejs-logging-support)[![npm Downloads](https://img.shields.io/npm/dm/cf-nodejs-logging-support.svg?style=flat-square)](https://www.npmjs.com/package/cf-nodejs-logging-support)[![Build Status](https://img.shields.io/travis/SAP/cf-nodejs-logging-support/v4.0.0.svg?style=flat-square)](https://travis-ci.org/SAP/cf-nodejs-logging-support)

## Summary

This is a collection of support libraries for node.js applications running on Cloud Foundry that serve two main purposes: It provides (a) means to emit *structured application log messages* and (b) instrument parts of your application stack to *collect request metrics*.

For details on the concepts and log formats, please look at the sibling project for [java logging support](https://github.com/SAP/cf-java-logging-support).

#### Version 2.0 introduced logging without Winston and changed custom fields to be parsed and reported as strings regardless of original type.
#### Version 3.0 introduced dynamic log level thresholds, sensitive data redaction and a redesigned field configuration system
#### Version 4.0 changed winston transport api
#### Version 5.0 introduced convenient logging methods
#### Version 6.0 added contextual loggers and custom field registration


## Features

  * Network logging (http requests) for CloudFoundry
  * Custom message logging
  * Logging levels
  * Dynamic logging level threshold (per request)
  * Extendable field configuration
  * Sensitive data redaction
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

// Set the minimum logging level (Levels: off, error, warn, info, verbose, debug, silly)
log.setLoggingLevel("info");

// Bind to express app
app.use(log.logNetwork);

app.get('/', function (req, res) {
    // Context bound custom message
    req.logger.info("Hello World will be sent");
    
    res.send('Hello World');
});
app.listen(3000);

// Formatted log message free of request context
log.info("Server is listening on port %d", 3000);
```

### Other Server Libraries

The logging library defaults to express middleware behaviour, but it can be forced to work with other server libraries as well:
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
    req.logger.info("request bound information:");
    res.end('ok');
});
server.listen(3000);
// Formatted log message free of request context
log.info("Server is listening on port %d", 3000);
```

### Request logs

The library can be attached as middleware to log all incoming requests as follows:
```js
app.use(log.logNetwork);
```

When using a plain Node.js http server it is necessary to call the middleware method directly:
```js
http.createServer((req, res) => {
  log.logNetwork(req, res);
  ...
});
```


### Message logs

In addition to request logging this library also supports logging application messages. Following common node.js logging levels are supported:

- error
- warn
- info
- verbose
- debug
- silly

In addition there is an *off* logging level available, which disables logging output completely. This can come in handy for testing. There are so called *convenient methods* for all supported logging levels, which can be called to log a message using the corresponding level. It is also possible to use standard format placeholders equivalent to the [util.format](https://nodejs.org/api/util.html#util_util_format_format_args) method.

Simple message
```js
info("Hello World"); 
// ... "msg":"Hello World" ...
```

With additional numeric value
```js
info("Listening on port %d", 5000); 
// ... "msg":"Listening on port 5000" ...
```

With additional string values
```js
info("This %s a %s", "is", "test"); 
// ... "msg":"This is a test" ...
```

With custom fields added to custom_fields field. Keep in mind that the last argument is handled as custom_fields object, if it is an object. As version 6.0.0 custom fields have to registered before writing them. See Custom fields section.

*NOTE: The logged format for custom_fields changed with version 6.4.0 to adopt to changes made to our handling of custom fields*
```js
info("Test data %j", {"field" :"value"}); 
// ... "msg":"Test data %j" 
// ... "#cf": {"string": [{"k":"field","v":"value","i":"0"}]}...
```

With json object forced to be embedded in to the message (nothing will be added to custom_fields).
```js
info("Test data %j", {"field" :"value"}, {}); 
// ... "msg":"Test data {\"field\": \"value\"}" ...
```

In some cases you might want to set the actual logging level from a variable. Instead of using conditional expressions you can simply use following method, which also supports format features described above.
```js
var level = "debug";
logMessage(level, "Hello World"); 
// ... "msg":"Hello World" ...
```
### Logging contexts

In general there are two types of logging contexts: *global* and *request* contexts.

#### Global context
Each application has a *global* context, which has no correlation to specific requests. Use the globally defined ```log``` object to log messages in *global* context:

```js
var log = require("cf-nodejs-logging-support");
...
log.info("Server is listening on port %d", 3000);
```

#### Request context
The library adds context bound functions to request objects, if the library has been attached as middleware. Use the locally defined ```req.logger``` object to log messages in *request* context:

```js
app.get('/', function (req, res) {
    req.logger.info("This message is request correlated");
    ...
});
```

In addition to a message logged using the *global* context these messages will automatically include following request correlated fields:
- correlation_id
- request_id
- tenant_id
- tenant_subdomain

### Child loggers
You can create child loggers, which share the context of their parent (global or reqest).
```js
app.get('/', function (req, res) {
    var logger = req.logger.createLogger(); // equivalent to req.createLogger();
    ...
    logger.logMessage("This message is request correlated, but logged with a child logger");
});
```

The main reason why you probably want to use child loggers is, that they can have their own set of custom fields, which will be added to each message.
```js
var logger = req.logger.createLogger(); 
logger.setCustomFields({"field-a" :"value"})
// OR
var logger = req.logger.createLogger({"field-a" :"value"}); 
```

### Check log severity levels
In some cases it can be useful to check if messages with a specific severity level would be logged. You can check if a logging level is active as follows:

```js
var isInfoActive = log.isLoggingLevel("info");
if (isInfoActive) {
 log.info("message logged with severity 'info'");
}
```

There are convenient methods available for this feature:
```js
var isDebugActive = log.isDebug();
```

### Custom fields
Custom fields are basically additional key-value pairs added to the logs. As of version 6.0.0 you have to register custom fields, before you can write them. This can be done, by calling following global method:
```js
log.registerCustomFields(["field-a", "field-b", "field-c"]);
```

You can now log messages and attach a key-value object as stated in the message logs section.
```js
logger.info("My log message", {"field-a" :"value"}); 
```

Another way of adding custom fields to log messages, is to set them for a logger instance. All logs, that are logged by this logger, contain the specified custom fields and values. 
```js
logger.setCustomFields({"field-a": "value"})
logger.info("My log message"); 
```

You can also set custom fields globally, by calling the same function on the global `log` instance. All logs, including request logs, will now contain the specified custom fields and values.
```js
log.setCustomFields({"field-b": "test"});
```

When using child loggers, the custom fields of the parent logger will be inherited. In case you have set a field for a child logger, that is already set for the parent logger, the value of the child logger will be used.

Example for custom field inheritance:
```js
// Register all custom fields, that can occure.
log.registerCustomFields(["field-a", "field-b", "field-c"]);

// Set some fields, that should be added to all messages
log.setCustomFields({"field-a": "1"});
log.info("test");
// ... "custom_fields": {"field-a": "1"} ...


// Define a child logger, that adds another field
var loggerA = log.createLogger({"field-b": "2"});
loggerA.info("test");
// ... "custom_fields": {"field-a": "1", "field-b": "2"} ...

// Define a child logger, that overwrites one field
var loggerB = log.createLogger({"field-a": "3"});
loggerB.info("test");
// ... "custom_fields": {"field-a": "3", "field-b": "2"} ...

// Request correlated logger instances inherit global custom fields and can overwrite them as well.
app.get('/', function (req, res) {
    req.logger.setCustomFields({"field-b": "4", "field-c": "5"});
    req.logger.info("test");
    // ... "custom_fields": {"field-a": "1", "field-b": "4", "field-c": "5"} ...
});

```



### Sensitive data redaction
Version 3.0.0 and above implements a sensitive data redaction system, which deactivates the logging of sensitive fields. The field will contain 'redacted' instead of the original content.

Following fields will be *redacted* by default: remote_ip, remote_host, remote_port, x_forwarded_for, remote_user, referer.

In order to activate normal logging for all or some of these fields, you have to setup environment variables with the following names:

| Environment Variable                      | Optional fields                                                           |
|-------------------------------------------|---------------------------------------------------------------------------|
| ```LOG_SENSITIVE_CONNECTION_DATA: true``` | activates the fields remote_ip, remote_host, remote_port, x_forwarded_for |
| ```LOG_REMOTE_USER: true```               | activates the field remote_user                                           |
| ```LOG_REFERER: true```                   | activates the field referer                                               |


This behavior matches with the corresponding mechanism in the [CF Java Logging Support](https://github.com/SAP/cf-java-logging-support/wiki/Overview#logging-sensitive-user-data) library.

### Dynamic logging level threshold
Sometimes it is useful to change the logging level threshold for a specific request. This can be achieved using a special header field or setting directly within the corresponding request handler. Changing the logging level threshold only affects the presence of logs but not their individual logging levels.

#### Change logging level threshold via header field
You can change the logging level threshold for a specific request by providing a JSON Web Token ([JWT](https://de.wikipedia.org/wiki/JSON_Web_Token)) via the request header. This way it is not necessary to redeploy your app for every logging level threshold change.

##### 1 Creating a JWT
JWTs are signed claims, which consist of a header, a payload and a signature. You can create JWTs by using the [TokenCreator](https://github.com/SAP/cf-nodejs-logging-support/tree/master/tools/token-creator) from the tools folder.

Basically, JWTs are signed using RSA or HMAC signing algorithms. But we decided to support RSA algorithms (RS256, RS384 and RS512) only. In contrast to HMAC algorithms (HS256, HS384 and HS512), RSA algorithms are asymmetric and therefore require key pairs (public and private key).

The tool mentioned above takes a log level, creates a key pair and signs the resulting JWT with the private key. The payload of a JWT looks like this:
```js
{
  "issuer": "<valid e-mail address>",
  "level": "debug",
  "iat": 1506016127,
  "exp": 1506188927
}
```

This library supports seven logging levels: *off*, *error*, *warn*, *info*, *verbose*, *debug* and *silly*. Make sure that your JWT specifies one of them in order to work correctly. It is also important to make sure that the JWT has not been expired, when using it. 

##### 2 Providing the public key
The logging library will try to verify JWTs attached to incoming requests. In order to do so, the public key (from above) needs to be provided via an environment variable called *DYN_LOG_LEVEL_KEY*:
```
DYN_LOG_LEVEL_KEY: <your public key>
```

Redeploy your app after setting up the environment variable. 

##### 3 Attaching JWTs to requests
Provide the created JWTs via a header field named 'SAP-LOG-LEVEL'. The logging level threshold will be set to the provided level for the request (and also corresponding custom log messages). 

Note: If the provided JWT cannot be verified, is expired or contains an invalid logging level, the library ignores it and uses the global logging level threshold.

If you want to use another header name for the JWT, you can specify it using an enviroment variable:
```
DYN_LOG_HEADER: MY-HEADER-FIELD
```

#### Change logging level threshold within request handlers
You can also change the log level for all requests of a specific request handler by calling:
```js
req.setDynamicLoggingLevel("verbose");
```

### Request correlation_id
In order to get the correlation_id of a request, you can use the following method:
```js
app.get('/', function (req, res) {
    // Get correlation_id from logger bound to request
    var id = req.logger.getCorrelationId();
    
    res.send('Hello World');
});
```

It is also possible to change the correlation_id to a valid UUIDv4:
```js
app.get('/', function (req, res) {
    // Set correlation_id via logger bound to request
    req.logger.setCorrelationId("cbc2654f-1c35-45d0-96fc-f32efac20986");
    
    res.send('Hello World');
});
```

Be aware that changing the correlation_id for a logger, will also affect ancestor and descendant loggers within the same request context, especially the network log for this request will contain the new correlation_id.

### Request tenant_id
In order to get the tenant_id of a request, you can use the following method:
```js
app.get('/', function (req, res) {
    // Get tenant_id from logger bound to request
    var tenantId = req.logger.getTenantId();
    
    res.send('Hello World');
});
```

It is also possible to change the tenant_id to any value:
```js
app.get('/', function (req, res) {
    // Set tenant_id via logger bound to request
    req.logger.setTenantId("cbc2654f-1c35-45d0-96fc-f32efac20986");
    
    res.send('Hello World');
});
```

Be aware that changing the tenant_id for a logger, will also affect ancestor and descendant loggers within the same request context, especially the network log for this request will contain the new tenant_id.

### Request tenant_subdomain
The tenant_subdomain is not determined automatically, instead you can set it per request as follows:
```js
app.get('/', function (req, res) {
    // Set tenant_subdomain via logger bound to request
    req.logger.setTenantSubdomain("my-subdomain");
    
    res.send('Hello World');
});
```

Be aware that changing the tenant_subdomain for a logger, will also affect ancestor and descendant loggers within the same request context, especially the network log for this request will contain the new tenant_subdomain.

### Human readable output
Setup an output pattern to get a human-readable output instead of json. Use '{{' and '}}' to print log parameters.
```js
log.setLogPattern("{{written_at}} - {{msg}}");
```

### Fixed Values for Network Logging (will impact log parsing if used incorrectly)
Possibility to tailor logs to your needs, you can for example change the msg field for Network-logs to find them in the Human readable format:
```js
log.overrideNetworkField("msg", YOUR_CUSTOM_MSG);
```
This will replace the value of the previously not existing msg field for network logs with YOUR_CUSTOM_MSG.
If the overridden field is already existing, it will be overridden by YOUR_CUSTOM_MSG for ALL subsequent network logs, until you 
remove the override with:
```js
log.overrideNetworkField("msg", null);
```
If you use this override feature in conjunction with a log parser, make sure you will not violate any parsing rules.

### Custom sink function
Per default the library writes output messages to `stdout`. For debugging purposes it can be useful to redirect the output of the library to another sink (e.g. `console.log()`). You can set a custom sink method as follows:
```js
log.setSinkFunction(function(level, output) {
 console.log(output);
});
```
A custom sink function should have two arguments: `level` und `output`. You can redirect or filter output messages based on their logging level.

Note: If a custom sink function is set, the library will no longer output messages to the default sink (stdout).

### Winston Transport
This logging library can be used in conjunction with Winston. Logging via Winston transport is limited to message logs. Network activity can not be tracked automatically. Example:
```js
var express = require('express');
var log = require('cf-nodejs-logging-support');
var winston = require('winston');

var app = express();

var logger = winston.createLogger({
    // Bind transport to winston
    transports: [log.createWinstonTransport()]
});

app.get('/', function (req, res) {
    res.send('Hello World');
});

app.listen(3000);

// Messages will now be logged exactly as demonstrated by the message logs paragraph
logger.log("info", "Server is listening on port %d", 3000);
```

## Sample Apps

  * [Express & Restify Sample](https://github.com/SAP/cf-nodejs-logging-support/blob/master/sample/cf-nodejs-shoutboard)
  * [Winston Sample](https://github.com/SAP/cf-nodejs-logging-support/blob/master/sample/winston)
