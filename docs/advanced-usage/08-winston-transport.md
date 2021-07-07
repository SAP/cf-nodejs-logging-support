---
layout: default
title: Winston Transport
parent: Advanced Usage
nav_order: 8
permalink: /advanced-usage/winston-transport
---

This logging library can be used in conjunction with Winston. 
Logging via Winston transport is limited to message logs. 
Network activity can not be tracked automatically. 
Example:
```js
var express = require('express');
var log = require('cf-nodejs-logging-support');
var winston = require('winston');

var app = express();

var logger = winston.createLogger({
    // Bind transport to winston
    transports: [log.createWinstonTransport()]
});

app.get('/', function (req, res) {
    res.send('Hello World');
});

app.listen(3000);

// Messages will now be logged exactly as demonstrated by the message logs paragraph
logger.log("info", "Server is listening on port %d", 3000);
```