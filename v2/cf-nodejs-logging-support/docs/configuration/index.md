---
layout: default
title: Configuration
nav_order: 6
has_children: true
---

# Configuration

You can customize the default configuration by writing a JSON file and adding it to the library. Take a look at the following sections to get a better understanding of what you can configure and how:
* [Configuration of logging fields](/cf-nodejs-logging-support/configuration/fields/)
* [Default request logging level](/cf-nodejs-logging-support/configuration/defaultreqlevel/)
* [Custom fields format](/cf-nodejs-logging-support/configuration/customfieldsformat/)
* [Framework](/cf-nodejs-logging-support/configuration/framework/)


## Add custom configuration
Once you have a JSON file with your configuration, you can add it to the logger by calling the addConfig method:
```ts
log.addConfig(configFile);
```

Alternatively you can set your configuration into differentes JSON files and add them using the same function.
```ts
log.addConfig(configFile1, configFile2, configFile3);
```
Notice that in this case, the configuration files will be added interatively. This means that in case of collisions, the latest configuration file will override the previous one.

## Get configuration as JSON object

For local testing purposes you can get the setted library configuration as JSON object by calling getConfig from any logging instance:

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
            "source": {
                "type": "static",
                "value": "my_organization"
            },
            "output": [
                "msg-log",
                "req-log"
            ]
        },
        {
            "name": "request",
            "source": {
                "type": "req-object",
                "name": "originalUrl"
            },
            "output": [
                "req-log".
                "msg-log"
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
