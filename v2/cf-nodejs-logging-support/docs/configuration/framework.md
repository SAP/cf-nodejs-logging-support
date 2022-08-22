---
layout: default
title: Framework
parent: Configuration
nav_order: 4
permalink: /configuration/framework
---

## Set framework
Set the framework used by setting the property "framework": <frameworkName> in the configuration file. The default framework is express. Alternatively, you can also set the framework from the logger instance by calling the method:
```ts 
setFramework(<frameworkName>) 
```
Our supported frameworks are:
* "express"
* "restify"
* "connect"
* "nodejs-http"

Example:
```ts
{
    "framework": "express"
}
```
