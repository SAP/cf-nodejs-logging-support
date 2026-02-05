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
    log.setFramework("fastify") 
    ```

Our supported server frameworks are:

* [Express](https://expressjs.com/): declare as `express`
* [Connect](https://www.npmjs.com/package/connect): declare as `connect`
* [Fastify](https://fastify.dev/): declare as `fastify`
* [Node.js HTTP](https://nodejs.org/api/http.html): declare as `plainhttp`
