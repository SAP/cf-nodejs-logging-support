---
layout: default
title: Framework
parent: Advanced Configuration
nav_order: 5
permalink: /configuration/framework
---

## Set framework
By default the library will be configured to run with express. If you are going to use another server framework, you have to change the configuration explicity. There are 2 ways to do this: 
1. Set the key-value pair "framework": "$frameworkName" in a configuration file:
```ts 
{
    "framework": "restify"
}
```
2. Set the framework from the logger instance by calling the method forceLogger:
```ts 
log.forceLogger("connect") 
```

Our supported frameworks are:
* "express"
* "restify"
* "connect"
* "nodejs-http"
