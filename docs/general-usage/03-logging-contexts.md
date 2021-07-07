---
layout: default
title: Logging Contexts
parent: General Usage
nav_order: 3
permalink: /general-usage/logging-contexts
---

# Logging Contexts
{: .no_toc }

In general there are two types of logging contexts: *global* and *request* contexts.

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Global context
Each application has a *global* context with no correlation to specific requests. Use the imported ```log``` object to log messages in *global* context:

```js
var log = require("cf-nodejs-logging-support");
...
log.info("Message logged in global context"); 
```

## Request context
The library adds context bound functions to request objects in case it has been [attached as middleware](/cf-nodejs-logging-support/general-usage/request-logs#attaching-to-server-frameworks). Use the provided `req.logger` object to log messages in *request* context:

```js
app.get('/', function (req, res) {
    var logger = req.logger; // logger logs in request context
    ...
    logger.info("Message logged in request context"); 
});
```

In addition to messages logged in *global* context these messages contain following request related fields:
- `correlation_id`
- `request_id`
- `tenant_id`
- `tenant_subdomain`