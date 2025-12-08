---
layout: default
title: Custom Fields Format
parent: Advanced Configuration
nav_order: 4
permalink: /configuration/custom-fields-format
---

# Custom fields format and type conversion



As described in [Custom Fields](/cf-nodejs-logging-support/general-usage/custom-fields), the library supports different formats for logging custom fields to ensure compatibility with SAP logging services.
When using user-provided services or running in environments without service bindings, you might want to explicitly set the custom fields format.
Besides programmatic configuration, this can also be achieved via by adding the following settings to your configuration file.

Example:

```js
{
    "customFieldsFormat": "application-logging"
}
```

Supported format values:

* `application-logging`: to be used with SAP Application Logging
* `cloud-logging`: to be used with SAP Cloud Logging
* `all`: use application-logging and cloud-logging format in parallel.
* `disabled`: do not log any custom fields.
* `default`: set default format cloud-logging.

Additionally, the `customFieldsTypeConversion` setting can be set when logging in cloud-logging format:

* `stringify`: convert all custom field values to strings
* `retain`: keep the original custom field value types

