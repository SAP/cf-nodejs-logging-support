---
layout: default
title: Framework
parent: Advanced Configuration
nav_order: 5
permalink: /configuration/framework
---

## Set framework

By default the library will be configured to run with express. If you are going to use another server framework, you have to change the configuration accordingly. There are 2 ways to do this:

### 1. Set the key-value pair "framework": "$frameworkName" in a configuration file:

```ts
{
    "framework": "restify"
}
```

### 2. Set the framework from a logger instance by calling:

```ts
log.forceLogger("connect") 
```

Our supported frameworks are:

* [Express](https://expressjs.com/): declare as "express"
* [Restify](http://restify.com/): declare as "restify"
* [Connect](https://www.npmjs.com/package/connect): declare as "connect"
* [Node.js HTTP](https://nodejs.org/api/http.html): declare as "nodejs-http"
