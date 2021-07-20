---
layout: default
title: Request Logs
parent: General Usage
nav_order: 1
permalink: /general-usage/request-logs
---

# Request Logs
{: .no_toc }
Logging so called 'request logs' is the main feature of this logging library. 
Request logs get issued for each handled http/s request and contain information about the request itself, its response and also CF metadata.

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Attaching to server frameworks
The library can be provided as middleware to log requests as follows:
```js
app.use(log.logNetwork);
```

When using a plain Node.js http server it is necessary to call the network logging function directly:
```js
http.createServer((req, res) => {
  log.logNetwork(req, res);
  ...
});
```

You can find code samples for supported server frameworks in the [Framework Samples](/cf-nodejs-logging-support/getting-started/framework-samples/) section.

## Setting the log level for requests

You can set the [level](/cf-nodejs-logging-support/general-usage/message-logs#logging-levels) to be assigned to request logs as follows:
```js
log.setRequestLogLevel("verbose");
```
The default log level for request logs is ``info``.
