---
layout: default
title: Logging Stack Traces
parent: General Usage
nav_order: 5
permalink: /general-usage/stacktraces
---

# Stack Traces

Stack traces can be written to the `stacktrace` field of the log and are represented as an array of strings.

If a stack trace exceeds a total size of 55kB, it will not be logged entirely.
The library removes as few lines as necessary from the middle of the stack trace since the relevant parts are usually at the start and the end.
We use following strategy to do so:

- Take one line from the top and two lines from the bottom of the stacktrace until the limit is reached.

For writing stack traces as part of a message log you can append the `Error` object as follows:

```js
try {
  // Code throwing an Error
} catch (e) {
  logger.error("Error occurred", e)
}
// ... "msg":"Error occurred", "stacktrace": [...] ...
```

In case you want to a log stack traces along with custom fields you can attach it as follows:

```js
try {
  // Code throwing an Error
} catch (e) {
  logger.error("Error occurred", {"custom-field" :"value", "_error": e})
}
// ... "msg":"Error occurred", "stacktrace": [...] ...
```

The `_error` field gets handled separately and its stack trace gets written to the `stacktrace` field.
The given custom fields get handled as described in [Custom Fields](/cf-nodejs-logging-support/general-usage/custom-fields).
