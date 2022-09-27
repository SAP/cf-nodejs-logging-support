---
layout: default
title: Introduction
parent: Advanced Configuration
nav_order: 1
has_children: true
---

## Introduction

You can customize the default configuration by writing a JSON file and adding it to the library. Take a look at the following sections to get a better understanding of what you can configure and how:

* [Configuration of logging fields](/cf-nodejs-logging-support/configuration/fields/)
* [Default request logging level](/cf-nodejs-logging-support/configuration/defaultreqlevel/)
* [Custom fields format](/cf-nodejs-logging-support/configuration/customfieldsformat/)
* [Framework](/cf-nodejs-logging-support/configuration/framework/)

## Add custom configuration

Once you have a JSON file with your configuration, you can add it to the logger as follows:

```ts
import configFile from './config.json';

log.addConfig(configFile);
```

Alternatively you can set your configuration into differentes JSON files and add them using the same function.

```ts
import configFile1 from './config1.json';
import configFile2 from './config2.json';
import configFile3 from './config3.json';

log.addConfig(configFile1, configFile2, configFile3);
```

Notice that in this case, the configuration files will be added interatively. This means that in case of collisions, the latest configuration file will override the previous one.

## Get configuration as JSON object

For local testing purposes you can get the setted library configuration as JSON object from any logging instance as follows:

Example:

```ts
log.getConfig();
```

Which will return something like:

```ts
{
    "fields": [
        {
            "name": "organization_id",
            "source": [
                {
                    "type": "req-object",
                    "name": "orgId",
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

Alternatively you can also use the method getFields(name: string) to get the configuration of only one or many desired fields.

Example:

```ts
log.getFields("organization_id","request_id")
```
