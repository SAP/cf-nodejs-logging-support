---
layout: default
title: Output Plugins
parent: Advanced Usage
nav_order: 7
permalink: /advanced-usage/output-plugins
---

# Output Plugins

Output plugins define where and how log records are emitted. The library supports multiple active plugins simultaneously and ships with two built-in implementations.

## Plugin Management

Output plugins can be managed at runtime using the following methods:

| Method | Description |
|---|---|
| `log.addOutputPlugin(plugin)` | Adds a plugin alongside any existing ones. |
| `log.setOutputPlugins(...plugins)` | Replaces all existing plugins with the given one(s). |
| `log.getOutputPlugins()` | Returns the list of currently registered plugins. |

## StdoutOutputPlugin

The default plugin, registered automatically on startup.
It writes log records to stdout or a configured [sink function](/cf-nodejs-logging-support/advanced-usage/custom-sink-function). 
It remains active unless explicitly replaced via `setOutputPlugins()`.

## OpenTelemetryLogsOutputPlugin <span class="label label-yellow">Experimental</span>

> **Note:** This plugin relies on [`@opentelemetry/api-logs`](https://www.npmjs.com/package/@opentelemetry/api-logs), which is marked as experimental by the OpenTelemetry project. Therefore consider this plugin experimental as well and be prepared for potential breaking changes in future releases.

Available since version 8.1.0. Emits log records via the [OpenTelemetry Logs API](https://opentelemetry.io/docs/specs/otel/logs/).
By default only message logs are forwarded; request logs can be enabled via [`setEmitRequestLogs()`](#emitting-request-logs).
It requires a configured OTel SDK with a `LoggerProvider` and appropriate exporters, either via the global OTel SDK (e.g. `@opentelemetry/sdk-node`) or passed explicitly to the constructor. 
The plugin itself does not initialize any OTel SDK components.

### Registering the Plugin

```js
import log, { OpenTelemetryLogsOutputPlugin } from 'cf-nodejs-logging-support';

// Keep stdout output and also emit via OTel:
log.addOutputPlugin(new OpenTelemetryLogsOutputPlugin());

// Emit via OTel only:
log.setOutputPlugins(new OpenTelemetryLogsOutputPlugin());
```

The constructor accepts the following optional parameters:

| Parameter | Type | Description |
|---|---|---|
| `loggerProvider` | `LoggerProvider` | OTel `LoggerProvider` to use. Defaults to the global provider. |
| `context` | `Context` or `(record) => Context | undefined` | OTel context to attach to emitted log records. Can be a static `Context` or a resolver function that receives the log record and returns a context. |

### Including Fields as Attributes

By default, only custom fields are forwarded as OTel log attributes. This can be changed with `setIncludeFieldsAsAttributes()`:

```js
import log, { OpenTelemetryLogsOutputPlugin, FieldInclusionMode } from 'cf-nodejs-logging-support';

const plugin = new OpenTelemetryLogsOutputPlugin();
plugin.setIncludeFieldsAsAttributes(FieldInclusionMode.AllFields);

log.addOutputPlugin(plugin);
```

| Mode | Description |
|---|---|
| `FieldInclusionMode.CustomFieldsOnly` | Only custom fields are added as attributes (default) |
| `FieldInclusionMode.AllFields` | All log record fields are added as attributes |
| `FieldInclusionMode.None` | No fields are added as attributes |

### Emitting Request Logs

By default the plugin ignores request logs and only emits message logs. To emit request logs as OTel log records, enable it with `setEmitRequestLogs()`:

```js
import log, { OpenTelemetryLogsOutputPlugin, FieldInclusionMode } from 'cf-nodejs-logging-support';

const plugin = new OpenTelemetryLogsOutputPlugin();
plugin.setEmitRequestLogs(true);
// Optional: forward all request fields as attributes
plugin.setIncludeFieldsAsAttributes(FieldInclusionMode.AllFields);

log.addOutputPlugin(plugin);
```

| Method | Description |
|---|---|
| `plugin.setEmitRequestLogs(enabled)` | Enables (`true`) or disables (`false`, default) emitting request logs as OTel log records. |

Request logs have no message, so their OTel log body is a short summary of the `method`, `request` and `response_status` fields (e.g. `GET /hello 200`), falling back to `"request"`. All request fields are forwarded as attributes according to the configured [field inclusion mode](#including-fields-as-attributes).

### Exception Attributes

When logging an error, the plugin automatically maps error information to the standard OTel exception attributes:

| OTel Attribute | Source |
|---|---|
| `exception.type` | Error name |
| `exception.message` | Error message |
| `exception.stacktrace` | Stack trace |

### Logging Level Mapping

The plugin maps the library's log levels to OTel severity levels as follows:

| Logging Level | OTel Severity Text | OTel Severity Number |
|---|---|---|
| `error` | `ERROR` | 17 |
| `warn` | `WARN` | 13 |
| `info` | `INFO` | 9 |
| `verbose` | `DEBUG2` | 6 |
| `debug` | `DEBUG` | 5 |
| `silly` | `TRACE` | 1 |
