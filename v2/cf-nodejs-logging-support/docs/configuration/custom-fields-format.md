---
layout: default
title: Custom Fields Format
parent: Configuration
nav_order: 3
permalink: /configuration/customfieldsformat
---

# Custom fields format
Set the custom field format by setting the property "customFieldsFormat": <format> in the configuration file.
Supported values are:
* "application-logging"
* "cloud-logging"
* "all": use application-logging and cloud-logging format in parallel.
* "disabled": do not log any custom fields
* "default": set default format cloud-logging

Example:
```ts
{
    "customFieldsFormat": "cloud-logging"
}
```
