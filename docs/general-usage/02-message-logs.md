---
layout: default
title: Message Logs
parent: General Usage
nav_order: 2
permalink: /general-usage/message-logs
---

# Message Logs
{: .no_toc }

In addition to request logging this library also supports logging of application messages. 
Message logs contain at least some message and also CF metadata. 

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Logging levels
Following common logging levels are supported:

- `error`
- `warn`
- `info`
- `verbose`
- `debug`
- `silly`

Set the minimum logging level for logs as follows:
```js
log.setLoggingLevel("info");
```

In addition there is an off logging level available to disable log output completely.

## Writing message logs
There are so called *convenience methods* available for all supported logging levels.
These can be called to log a message using the corresponding level. 
It is also possible to use standard format placeholders equivalent to the [util.format](https://nodejs.org/api/util.html#util_util_format_format_args) method.

You can find several usage examples below demonstrating options to be specified when calling a log method. 
All methods get called on a `logger` object, which provides a so called *logging context*. 
You can find more information about logging contexts in the [Logging Contexts](/cf-nodejs-logging-support/general-usage/logging-contexts) chapter.
In the simplest case, `logger` is an instance of imported `log` module. 

- Simple message
```js
logger.info("Hello World"); 
// ... "msg":"Hello World" ...
```

- Message with additional numeric value
```js
logger.info("Listening on port %d", 5000); 
// ... "msg":"Listening on port 5000" ...
```

- Message with additional string values
```js
logger.info("This %s a %s", "is", "test"); 
// ... "msg":"This is a test" ...
```

- Message with additional json object to be embedded in to the message
```js
logger.info("Test data %j", {"field" :"value"}, {}); 
// ... "msg":"Test data {\"field\": \"value\"}" ...
```

In some cases you might want to set the actual logging level from a variable. 
Instead of using conditional expressions you can simply use following method, which also supports format features described above.
```js
var level = "debug";
logger.logMessage(level, "Hello World"); 
// ... "msg":"Hello World" ...
```

## Checking log severity levels
It can be useful to check if messages with a specific severity level would be logged. 
You can check if a logging level is active as follows:

```js
var isInfoActive = log.isLoggingLevel("info");
if (isInfoActive) {
 log.info("message logged with severity 'info'");
}
```

There are convenience methods available for this feature:
```js
var isDebugActive = log.isDebug();
```