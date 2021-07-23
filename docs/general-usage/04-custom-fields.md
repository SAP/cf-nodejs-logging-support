---
layout: default
title: Custom Fields
parent: General Usage
nav_order: 4
permalink: /general-usage/custom-fields
---

# Custom Fields

You can use the custom field feature to add custom fields to your logs.

In case you want to use this library with SAP Application Logging Service you need to register your custom fields.
This is necessary since custom fields will be reported in a fixed order so they can be ingested correctly in elasticsearch.

```js
log.registerCustomFields(["field"]);
info("Test data", {"field" :"value"}); 
// ... "msg":"Test data" 
// ... "#cf": {"string": [{"k":"field","v":"value","i":"0"}]}...
```
As of version 6.5.0 this library will automatically detect which logging service you are bound to and will set the logging format accordingly.

For local testing purposes you can still enforce a specific format like this:
```js
log.overrideCustomFieldFormat("application-logging");
// possible values: "disabled", "all", "application-logging", "cloud-logging", "default"
```

In addition to logging messages as described in [Message Logs](/cf-nodejs-logging-support/general-usage/message-logs) you can attach custom fields as an object of key-value pairs as last parameter:
```js
logger.info("My log message", {"field-a" :"value"}); 
```

Another way of adding custom fields to messages is to set them for (child) loggers in *global* or *request* context.
In result messages will contain the custom fields specified to the logger instance in use.
```js
logger.setCustomFields({"field-a": "value"})
logger.info("My log message"); 
```

You can also set custom fields globally by calling the same function on the global `log` instance. 
All logs, including request logs and logs by child loggers, will now contain the specified custom fields and values.
```js
log.setCustomFields({"field-b": "test"});
```

In case you want to remove custom fields from a logger instance you can provide an empty object:
```js
logger.setCustomFields({});
```