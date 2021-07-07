---
layout: default
title: Framework Samples
parent: Getting Started
nav_order: 1
permalink: /getting-started/framework-samples/
---

# Samples for supported Server Frameworks
{: .no_toc }
This library can be used in combination with different server frameworks: 
[express](https://expressjs.com/), [connect](https://www.npmjs.com/package/connect), [restify](http://restify.com/) and also pure [Node.js HTTP](https://nodejs.org/api/http.html).
You can find small code samples for each supported framework below.

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>


## Express
```js
const HTTP_PORT = 3000;
var express = require('express');
var log = require('cf-nodejs-logging-support');
var app = express();

// Set the minimum logging level (Levels: off, error, warn, info, verbose, debug, silly)
log.setLoggingLevel("info");

// Bind to express app
app.use(log.logNetwork);

app.get('/', function (req, res) {
    // Context bound custom message
    req.logger.info("Hello World will be sent");
    
    res.send('Hello World');
});

// Listen on specified port
app.listen(HTTP_PORT);

// Formatted log message
log.info("Server is listening on port %d", HTTP_PORT);
```

## Connect
```js
const HTTP_PORT = 3000;
var connect = require('connect');
var http = require('http');
var log = require('cf-nodejs-logging-support');
var app = connect();

// Force logger to run the connect version. (default is express, forcing express is also legal)
log.forceLogger("connect");

// Add the logger middleware, so each time a request is received, it is will get logged.
app.use(log.logNetwork);

// Create node.js http server and listen on port
http.createServer(app).listen(HTTP_PORT, () => {
  // Formatted log message
  log.info("Server is listening on port %d", HTTP_PORT);
});
```

## Restify
```js
const HTTP_PORT = 3000;
var restify = require('restify');
var log = require('cf-nodejs-logging-support');
var app = restify.createServer();

// Force logger to run the restify version. (default is express, forcing express is also legal)
log.forceLogger("restify");

// Add the logger middleware, so each time a request is received, it is will get logged.
app.use(log.logNetwork);

// Listen on specified port
server.listen(HTTP_PORT, () => {
  // Formatted log message
  log.info("Server is listening on port %d", HTTP_PORT);
});
```

## Node.js HTTP
```js
const HTTP_PORT = 3000;
const http = require('http');
var log = require("cf-nodejs-logging-support");

// Force logger to run the http version.
log.forceLogger("plainhttp");

const server = http.createServer((req, res) => {
    // Binds logging to the given request for request tracking
    log.logNetwork(req, res);
    
    // Context bound custom message
    req.logger.info("Hello World will be sent");
    res.end('Hello World');
});

// Listen on specified port
server.listen(HTTP_PORT, () => {
  // Formatted log message
  log.info("Server is listening on port %d", HTTP_PORT);
});
```