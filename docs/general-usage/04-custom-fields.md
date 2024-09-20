---
layout: default
title: Custom Fields
parent: General Usage
nav_order: 4
permalink: /general-usage/custom-fields
---

# Custom Fields

You can use the custom field feature to add custom fields to your logs.


## Format and type transformation for SAP logging services

The library will automatically detect which logging service is bound to your app and will set the custom field format accordingly.

For local testing purposes you can enforce a specific format like this:

```js
log.setCustomFieldsFormat("application-logging");
// possible values: "disabled", "all", "application-logging", "cloud-logging", "default"
```

Alternatively, you can force the logging format by setting a configuration file as explained in [Custom Fields Format](/cf-nodejs-logging-support/configuration/custom-fields-format).

### SAP Application Logging

In case you want to use this library with SAP Application Logging Service you need to register your custom fields.
Please make sure to call the registration exactly once globally before logging any custom fields.
Registered fields will be indexed based on the order given by the provided field array.

Custom fields are converted and printed as string values independent of their original type.

```js
log.registerCustomFields(["field"]);
info("Test data", {"field": 42}); 
// ... "msg":"Test data" 
// ... "#cf": {"string": [{"k":"field","v":"42","i":"0"}]}...
```

### SAP Cloud Logging

When using the library with SAP Cloud Logging, custom fields get added as top-level fields.
Registering custom fields is not required in this case.

By default all custom field values get stringified, which can help to prevent field type mismatches when indexing to SAP Cloud Logging.
However, if you want to retain the original type of your custom fields, you can change the type conversion configuration accordingly:

```js
log.setCustomFieldsTypeConversion(CustomFieldsTypeConversion.Retain)
info("Test data", {"field": 42}); 
// ... "msg":"Test data" 
// ... "field": 42
```

## Adding custom fields

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
