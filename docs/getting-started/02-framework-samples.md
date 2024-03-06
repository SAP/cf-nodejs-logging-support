---
layout: default
title: Framework Samples
parent: Getting Started
nav_order: 1
permalink: /getting-started/framework-samples/
---

# Samples for supported Server Frameworks
{: .no_toc }

This library can be used in combination with several different server frameworks.
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
const app = require('express')()
const log = require('cf-nodejs-logging-support')

// Configure logger for working with Express framework
log.setFramework(log.Framework.Express)

// Add the logger middleware to write access logs
app.use(log.logNetwork)

// Handle '/' path
app.get("/", (req, res) => {
    // Write a log message bound to request context
    req.logger.info(`Sending a greeting`)
    res.send("Hello Express")
})

// Listen on specified port
const listener = app.listen(3000, () => {
  // Formatted log message
  log.info("Server is listening on port %d", listener.address().port)
})
```

## Connect

```js
const app = require('connect')()
const http = require('http')
const log = require('cf-nodejs-logging-support')

// Configure logger for working with Connect framework
log.setFramework(log.Framework.Connect)

// Add the logger middleware to write access logs
app.use(log.logNetwork)

// Handle '/' path
app.use("/", (req, res) => {
    // Write a log message bound to request context
    req.logger.info(`Sending a greeting`)
    res.end("Hello Connect")
})

// Listen on specified port
const server = http.createServer(app).listen(3000, () => {
    // Formatted log message
    log.info("Server is listening on port %d", server.address().port)
})
```

## Restify

```js
const restify = require('restify')
const log = require('cf-nodejs-logging-support')
const app = restify.createServer()

// Configure logger for working with Restify framework
log.setFramework(log.Framework.Restify)

// Add the logger middleware to write access logs
app.use(log.logNetwork)

// Handle '/' path
app.get("/", (req, res, next) => {
    // Write a log message bound to request context
    req.logger.info(`Sending a greeting`)
    res.send("Hello Restify")
    next()
})

// Listen on specified port
app.listen(3000, () => {
  // Formatted log message
  log.info("Server is listening on port %d", app.address().port)
})
```

## Fastify

```js
const log = require('cf-nodejs-logging-support')
const app = require('fastify')()

// Configure logger for working with Fastify framework
log.setFramework(log.Framework.Fastify)

// Add the logger middleware to write access logs
app.addHook("onRequest", log.logNetwork)

// Handle '/' path
app.get("/", (request, reply) => {
    // Write a log message bound to request context
    request.logger.info(`Sending a greeting`)
    reply.send("Hello Fastify")
})

// Listen on specified port
app.listen({ port: 3000 }, (err, address) => {
    if (err) {
        // Formatted error message
        log.error("Failed to run server", err.message)
        process.exit(1)
    }
    // Formatted log message
    log.info(`Server is listening on ${address}`)
})
```

## Node.js HTTP

```js
const log = require('cf-nodejs-logging-support')
const http = require('http')

// Configure logger for working with Node.js http framework
log.setFramework(log.Framework.NodeJsHttp)

const server = http.createServer((req, res) => {
    // Call logger middleware to write access logs
    log.logNetwork(req, res)

    // Write a log message bound to request context
    req.logger.info(`Sending a greeting`)
    res.send("Hello Node.js HTTP")
})

// Listen on specified port
server.listen(3000, () => {
    // Formatted log message
    log.info("Server is listening on port %d", server.address().port)
})
```
