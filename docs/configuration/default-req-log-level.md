---
layout: default
title: Default Request Level
parent: Advanced Configuration
nav_order: 3
permalink: /configuration/defaultrequestlevel
---

# Set default request loging level

Change the default request logging level by setting the property ```"reqLoggingLevel": $level``` in your configuration file. For example:

```js
{
    "reqLoggingLevel": "info"
}
```

Alternatively, you can set the default request logging level as mentioned in [Dynamic Logging Level Threshold](/cf-nodejs-logging-support/advanced-usage/dynamic-logging-level-threshold)

Following common logging levels are supported:

- `error`
- `warn`
- `info`
- `verbose`
- `debug`
- `silly`
