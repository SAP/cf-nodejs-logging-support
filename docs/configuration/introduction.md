---
layout: default
title: Introduction
parent: Advanced Configuration
nav_order: 1
has_children: false
---

# Introduction

You can customize the default configuration by writing a JSON file and adding it to the library. Take a look at the following sections to get a better understanding of what you can configure and how:

* [Configuration of logging fields](/cf-nodejs-logging-support/configuration/fields/)
* [Default request logging level](/cf-nodejs-logging-support/configuration/defaultrequestlevel/)
* [Custom fields format](/cf-nodejs-logging-support/configuration/customfieldsformat/)
* [Server Framework](/cf-nodejs-logging-support/configuration/framework/)

## Add custom configuration

Once you have a JSON file with your configuration, you can add it to the logger as follows:

```js
import configFile from './config.json';

log.addConfig(configFile);
```

Alternatively, you can provide and load multiple configuration files:

```js
import configFile1 from './config1.json';
import configFile2 from './config2.json';
import configFile3 from './config3.json';

log.addConfig(configFile1, configFile2, configFile3);
```

Configuration files will be added iteratively. This means that in case of collisions latter configuration files will override previous ones.

## Reset fields configuration

You can reset the fields configuration as follows:

```js
log.clearFieldsConfig();
```

This will delete all fields except `level`, `msg` and `type`.

## Get configuration as JSON object

For local testing purposes you can get the setted library configuration as JSON object from any logger instance as follows:

```js
log.getConfig();
```

You can find a sample result below:

```js
{
    "fields": [
        {
            "name": "organization_id",
            "source": [
                {
                    "type": "req-object",
                    "field-name": "orgId",
                    "framework": "restify"
                },
                {
                    "type": "static",
                    "value": "1111",
                }
            ],
            "output": [
                "msg-log"
            ]
        },
        {
            "name": "organization_name",
            "source": {
                "type": "env",
                "path": [
                    "VCAP_APPLICATION",
                    "organization_name"
                ]
            },
            "output": [
                "msg-log",
                "req-log"
            ]
        },
        {
            ...
        }
    ],
    "reqLoggingLevel": "info",
    "customFieldsFormat": "cloud-logging",
    "outputStartupMsg": true,
    "framework": "express"
}
```

Alternatively, you can get the configuration for one or multiple desired fields as follows:

```js
log.getConfigFields("organization_id","request_id")
```
