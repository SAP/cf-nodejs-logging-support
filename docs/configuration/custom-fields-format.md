---
layout: default
title: Custom Fields Format
parent: Advanced Configuration
nav_order: 4
permalink: /configuration/custom-fields-format
---

# Custom fields format

As described in [Custom Fields](/cf-nodejs-logging-support/general-usage/custom-fields), the library will automatically detect which logging service your app is bound to and set the logging format accordingly.
However, it is also possible to force the logging format by setting the property `customFieldsFormat`.

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

