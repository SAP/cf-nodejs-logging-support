---
layout: default
title: Custom Fields Format
parent: Advanced Configuration
nav_order: 4
permalink: /configuration/customfieldsformat
---

# Custom fields format
As described in [Custom Fields](/cf-nodejs-logging-support/general-usage/custom-fields), the library will automatically detect which logging service you are bound to and will set the logging format accordingly. However, it is also possible to force the logging format by setting the property "customFieldsFormat": $format in a configuration file.

Example:
```ts
{
    "customFieldsFormat": "cloud-logging"
}
```

Supported format values are:
* "application-logging"
* "cloud-logging"
* "all": use application-logging and cloud-logging format in parallel.
* "disabled": do not log any custom fields
* "default": set default format cloud-logging
