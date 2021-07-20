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
Logging contexts are an essential concept of this library. 
Consider a context as a set of information related to the environment, processes, thread and/or function call code gets executed in.
More specifically a logging context stores metadata which get written along with the raw log messages.

There are three important rules that apply to this concept:
- There is exactly one *global* root context.
- All other contexts inherit from their parent context.
- Sub-contexts can extend and override the provided metadata.

Besides the *global* context each request handled by your application has its own *request* context, directly inheriting from the *global* context.

You can create [Child Loggers](/cf-nodejs-logging-support/general-usage/logging-contexts) to inherit and extend the *global* context or *request* contexts.

## Global context
The *global* context has no correlation to specific requests but provides metadata about the application itself and its environment. Use the imported `log` object to log messages in *global* context:

```js
var log = require("cf-nodejs-logging-support");
...
log.info("Message logged in global context"); 
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

In addition to the *global* context *request* contexts provide following request related fields to logs:
- `correlation_id`
- `request_id`
- `tenant_id`
- `tenant_subdomain`