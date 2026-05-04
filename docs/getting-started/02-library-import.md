---
layout: default
title: Import Options
parent: Getting Started
nav_order: 2
permalink: /getting-started/import/
---

# Import Options

The library can be imported in different ways depending on the module system you are using (CommonJS and ES Modules).

## CommonJS

When using CommonJS, the default export is the logger instance itself, so you can import it directly:

```js
const log = require("cf-nodejs-logging-support");
```

If needed, you can also import named exports by destructuring the required module:

```js
const { default: log, Level } = require("cf-nodejs-logging-support");

log.setLoggingLevel(Level.Info);
```

## ESM (ES Modules)

You can import the default logger instance like this:

```js
import log from "cf-nodejs-logging-support";
```

Named exports can be imported alongside the default logger:

```js
import log, { Level } from "cf-nodejs-logging-support";

log.setLoggingLevel(Level.Info);
```
