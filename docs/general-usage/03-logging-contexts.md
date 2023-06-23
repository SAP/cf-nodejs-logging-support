---
layout: default
title: Logging Contexts
parent: General Usage
nav_order: 3
permalink: /general-usage/logging-contexts
---

# Logging Contexts
{: .no_toc }

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Concept
Logging contexts are an essential concept of this library to extend the metadata attached to each log message.
It offers correlation of log messages by enriching them with shared properties, such as the `correlation_id` of a request, class names or even details on the method being executed.
While all log messages contain various information on the runtime environment or various request/response details for request logs, logging contexts are more flexible and allow extension at runtime.

You can create [Child Loggers](/cf-nodejs-logging-support/advanced-usage/child-loggers) to inherit or create new logging contexts.

There are three *kinds* of contexts:

* global context
* request context
* custom context

## Global Context

As messages written in *global* context are considered uncorrelated, it is always empty and immutable.
Use the imported `log` object to log messages in *global* context:

```js
var log = require("cf-nodejs-logging-support");
...
log.info("Message logged in global context"); 
```

Adding context properties is not possible, which is indicated by the return value of the setter methods:

```js
var log = require("cf-nodejs-logging-support");
...
var result = log.setContextProperty("my-property", "my-value")
// result: false
```

## Request context

The library adds context bound functions to request objects in case it has been [attached as middleware](/cf-nodejs-logging-support/general-usage/request-logs#attaching-to-server-frameworks).
Use the provided `req.logger` object to log messages in *request* contexts:

```js
app.get('/', function (req, res) {
    var reqLogger = req.logger; // reqLogger logs in request context
    ...
    reqLogger.info("Message logged in request context"); 
});
```

By default, *request* contexts provide following additional request related fields to logs:

* `correlation_id`
* `request_id`
* `tenant_id`
* `tenant_subdomain`

## Custom context

Child loggers can also be equipped with a newly created context, including an auto-generated `correlation_id`.
This can be useful when log messages should be correlated without being in context of an HTTP request.
Switch over to the [Child loggers with custom context](/cf-nodejs-logging-support/advanced-usage/child-loggers#child-loggers-with-custom-context) section to learn more about this topic.
