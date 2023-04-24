---
layout: default
title: Introduction
parent: Advanced Configuration
nav_order: 1
has_children: false
---

# Introduction

You can extend or replace the default configuration by defining and loading JSON config files.
Refer to the following sections to get a better understanding of configuration options:

* [Configuration of logging fields](/cf-nodejs-logging-support/configuration/fields/)
* [Default request logging level](/cf-nodejs-logging-support/configuration/default-request-level/)
* [Custom fields format](/cf-nodejs-logging-support/configuration/custom-fields-format/)
* [Server Framework](/cf-nodejs-logging-support/configuration/framework/)

## Add custom configuration

Once you have a JSON file with your configuration, you can add it to the logger as follows:

```js
const configFile = './config.json';

log.addConfig(configFile);
```

Alternatively, you can provide and load multiple configuration files:

```js
const configFile1 = require('./config1.json');
const configFile2 = require('./config2.json');
const configFile3 = require('./config3.json');

log.addConfig(configFile1, configFile2, configFile3);
```

Configuration files can be added iteratively.
This means that in case of collisions latter configuration files will override previous ones.

## Get configuration as JSON object

For local testing purposes you can get the full library configuration as JSON object from any logger instance as follows:

```js
log.getConfig();
```

Alternatively, you can get the configuration for one or multiple desired fields as follows:

```js
log.getConfigFields("organization_id","request_id")
```

## Clear fields configuration

You can clear the all default and configured fields as follows:

```js
log.clearFieldsConfig();
```

This might come in handy when aiming for a fully customized field configuration.
