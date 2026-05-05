---
layout: default
title: Server Framework
parent: Advanced Configuration
nav_order: 5
permalink: /configuration/framework
---

# Set server framework

By default the library will be configured to run with express. If you are going to use another server framework, you have to change the configuration accordingly. There are 2 ways to do this:

 1. Set the key-value pair `"framework": "$frameworkName"` in a configuration file:

    ```js
    {
        "framework": "fastify"
    }
    ```

 2. Set the server framework from a logger instance by calling:

    ```js
    import log, { Framework } from "cf-nodejs-logging-support";

    log.setFramework(Framework.Fastify);
    ```

Our supported server frameworks are:

* [Express](https://expressjs.com/): declare as `express` or use `Framework.Express`
* [Connect](https://www.npmjs.com/package/connect): declare as `connect` or use `Framework.Connect`
* [Fastify](https://fastify.dev/): declare as `fastify` or use `Framework.Fastify`
* [Node.js HTTP](https://nodejs.org/api/http.html): declare as `plainhttp` or use `Framework.PlainHttp`
