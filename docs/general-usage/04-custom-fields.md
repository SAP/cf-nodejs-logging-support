---
layout: default
title: Custom Fields
parent: General Usage
nav_order: 4
permalink: /general-usage/custom-fields
---

# Custom Fields

Custom fields allow you to enrich your log messages with additional context by attaching key-value pairs.
This is particularly useful for adding metadata that can help with filtering, searching, and analyzing logs.

## Format and type transformation for SAP logging services

While the library can be used independently of SAP logging services, it provides built-in support for logging custom fields compatible with [SAP Application Logging Service](https://help.sap.com/docs/application-logging-service) and [SAP Cloud Logging](https://help.sap.com/docs/cloud-logging).
This includes proper formatting and type conversion of custom fields to ensure compatibility with the respective logging service:

- **SAP Application Logging**: Custom fields are formatted as key-value pairs within a special `#cf` field in the log message. The values are converted to strings to ensure compatibility with the service's field type requirements.
- **SAP Cloud Logging**: Custom fields are added as top-level fields in the log message. By default, values are also converted to strings to prevent type mismatches during indexing. However, you can configure the library to retain the original types of custom field values if needed.

When deploying your application to SAP BTP Cloud Foundry, the library automatically detects logging service bindings and sets the custom field format accordingly.

### Overriding the custom fields format

There are cases where you might want to override the default behavior:
- When using the library in an environment without a logging service binding, e.g., on Kubernetes.
- When using a user-provided service where the logging service type cannot be detected correctly.
- When you want to disable custom fields logging entirely.

In such cases, you can explicitly set the desired custom fields format programmatically:

```js
import { CustomFieldsFormat } from "@sap/cf-nodejs-logging-support";

log.setCustomFieldsFormat(CustomFieldsFormat.ApplicationLogging);
// or
log.setCustomFieldsFormat("application-logging");
```

Available formats are:

| Format Constant | String Value | Description |
|-----------------|--------------|-------------|
| `CustomFieldsFormat.ApplicationLogging` | `application-logging` | Use this format to log custom fields compatible with SAP Application Logging Service. |
| `CustomFieldsFormat.CloudLogging` | `cloud-logging` | Use this format to log custom fields compatible with SAP Cloud Logging. |
| `CustomFieldsFormat.All` | `all` | Use this format to log custom fields compatible with both SAP Application Logging Service and SAP Cloud Logging. |
| `CustomFieldsFormat.Disabled` | `disabled` | Disable custom fields logging. |
| `CustomFieldsFormat.Default` | `default` |  Same as `cloud-logging` format. |

Alternatively, you can force the logging format setting using a configuration file as explained in [Advanced Configuration](/cf-nodejs-logging-support/configuration).

### Overriding the custom fields type conversion

By default, custom field values are converted to strings to avoid type mismatches during indexing.
While this behavior cannot be changed for the custom fields format used for SAP Application Logging, it can be adjusted for SAP Cloud Logging as follows:

```js
import { CustomFieldsTypeConversion } from "@sap/cf-nodejs-logging-support";

log.setCustomFieldsTypeConversion(CustomFieldsTypeConversion.Retain);
```

Available type conversion options are:
| Type Conversion Constant | Description |
|--------------------------|-------------|
| `CustomFieldsTypeConversion.Stringify` | Convert all custom field values to strings. This is the default behavior. |
| `CustomFieldsTypeConversion.Retain` | Retain the original types of custom field values. |

Alternatively, you can force the field type conversion setting using a configuration file as explained in [Advanced Configuration](/cf-nodejs-logging-support/configuration).

Keep in mind that retaining original types may lead to indexing issues if the same custom field is logged with different types across log entries.

### Registering custom fields for SAP Application Logging

When using SAP Application Logging Service, it is necessary to register custom fields before logging them.
Please make sure to do the registration exactly once globally before logging any custom fields.
Registered fields will be indexed based on the order given by the provided field array.

```js
log.registerCustomFields(["field"]);
info("Test data", {"field": 42}); 
// ... "msg":"Test data" 
// ... "#cf": {"string": [{"k":"field","v":"42","i":0}]}...
```

## Logging custom fields

In addition to logging messages as described in [Message Logs](/cf-nodejs-logging-support/general-usage/message-logs), you can attach custom fields by passing an object of key-value pairs as the last parameter.
This allows enriching log messages with additional context information.

```js
logger.info("My log message", {"field-a" :"value"}); 
```

Another way to add custom fields is by setting them on (child) logger instances, either globally or within a request context.
When you do this, all messages logged by that logger will automatically include the specified custom fields, providing consistent context information across your logs.

```js
logger.setCustomFields({"field-a": "value"})
logger.info("My log message"); 
```

You can also define custom fields globally by invoking the same method on the global `log` instance. 
This ensures that all logs, including request logs and those emitted by child loggers, will automatically include the specified custom fields and their values.

```js
log.setCustomFields({"field-b": "test"});
```

In case you want to remove custom fields from a logger instance you can provide an empty object:

```js
logger.setCustomFields({});
```
