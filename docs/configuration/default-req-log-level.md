---
layout: default
title: Default Req Level
parent: Configuration
nav_order: 2
permalink: /configuration/defaultreqlevel
---

# Set default request loging level
Change the default request logging level by setting the property "reqLoggingLevel": $level. For example:
```ts
{
 "reqLoggingLevel": "info"
}
```

Following common logging levels are supported:

- `error`
- `warn`
- `info`
- `verbose`
- `debug`
- `silly`
