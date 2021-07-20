---
layout: default
title: Child Loggers
parent: Advanced Usage
nav_order: 1
permalink: /advanced-usage/child-loggers
---

# Child loggers
You can create child loggers sharing the [Logging Context](/cf-nodejs-logging-support/general-usage/logging-contexts) of their parent (*global* or *request* context):
```js
app.get('/', function (req, res) {
    var logger = req.logger.createLogger(); // equivalent to req.createLogger();
    ...
    logger.logMessage("This message is request correlated, but logged with a child logger");
});
```

There are two reasons why you probably want to use child loggers:
- Each child logger can have its own set of custom fields, which will be added to each messages:
```js
var logger = req.logger.createLogger(); 
logger.setCustomFields({"field-a" :"value"})
// OR
var logger = req.logger.createLogger({"field-a" :"value"}); 
```
- Child loggers can have a different logging threshold, so you can customize your log output with them:
```js
var logger = req.logger.createLogger(); 
logger.setLoggingLevel("info");
```


You can also create child loggers inheriting from the global logging context like this:
```js
var log = require("cf-nodejs-logging-support");
...
var subLogger = log.createLogger(); 
subLogger.setCustomFields({"field-a" :"value"})
// OR
var subLogger = log.createLogger({"field-a" :"value"}); 
```

When using [child loggers](/cf-nodejs-logging-support/advanced-usage/child-loggers) the custom fields of the parent logger will be inherited.
In case you have set a field for a child logger, which is already set for the parent logger, the value set to the child logger will be used.

Example for custom field inheritance:
```js
// Register all custom fields that can occur.
log.registerCustomFields(["field-a", "field-b", "field-c"]);

// Set some fields which should be added to all messages
log.setCustomFields({"field-a": "1"});
log.info("test");
// ... "custom_fields": {"field-a": "1"} ...


// Define a child logger which adds another field
var loggerA = log.createLogger({"field-b": "2"});
loggerA.info("test");
// ... "custom_fields": {"field-a": "1", "field-b": "2"} ...

// Define a child logger which overwrites one field
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