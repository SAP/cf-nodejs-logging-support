---
layout: default
title: Configuration Fields
parent: Advanced Configuration
nav_order: 2
permalink: /configuration/fields
---

# Configuration of logging fields
You can write a configuration file to add new fields or override the behaviour of already existing ones. If a field name already exist in your configuration, this will override the previous configuration field. 


## Write a JSON file and declare fields configuration
Make sure to declare the configuration of your fields as a list in the property "fields".

Example:
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
            "name": "component_id",
            "source": {
                "type": "env",
                "path": [
                    "VCAP_APPLICATION",
                    "application_id"
                ]
            },
            "output": [
                "msg-log"
            ]
        },
        {
            "name": "source_instance",
            "source": {
                "type": "config-field",
                "name": "component_instance"
            },
            "output": [
                "msg-log"
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
    ]
}
```

The configuration of each field must implement the ConfigField interface:

```ts
interface ConfigField {
    name: string;
    envVarRedact?: string;
    envVarSwitch?: string;
    source: Source | Source[];
    output: outputs[];
    disable?: boolean;
    default?: string;
}
```

## Description config field properties:

* name: assigns the key of the field.
* envVarSwitch: Only log this field, if specified environment variable is set to "true". If specified environment variable is not set to "true" or not present, field gets omitted. This is also affects fields with default values.
* envVarRedact: Only log this field, if specified environment variable is set to "true". If specified environment variable is not set to "true" or not present, field gets set to "redacted" if it is not set to its default value or null.
* source: configures how the value of the field is assigned. You can assign one or many sources to a field.
    -type: One of
        + "static": use value from value field.
        + "env": read value from environment variable.
        + "config-field": copy value from another configured field.
        + "req-header": read value from request header.
        + "req-body": read value from request object.
        + "res-header": read value from response header.
        + "res-body": read value from response object.
        + "uuid": create a random uuid and assign to value.
    - value: declare value for sources of type static.
    - path: declare environment variable path to read value.
    - name: declare name of environment variable.
    - framework: only use this sources if declared framework is running.
* output: define output of field (msg-log, req-log or both).
* disable: if true, ommit field.
* default: if value from sources is null, then assign this value.

## Multiple sources

You can attach multiple sources to a field. In this case, the library will iterate each source until one delivers a value.
You can also bind each source to a specific framework. If the framework assigned to the source is not running, then this source will be ignored. To do this just declare the property "framework": $framework in the respected source. Our supported frameworks are:

* [Express](https://expressjs.com/): declare as "express"
* [Restify](http://restify.com/): declare as "restify"
* [Connect](https://www.npmjs.com/package/connect): declare as "connect"
* [Node.js HTTP](https://nodejs.org/api/http.html): declare as "nodejs-http"

Exmaple of field with multiple sources:

```ts
{
    "fields": [
        {
            "name": "component_type",
            "source": [
                {
                    "type": "static",
                    "value": "express-is-running",
                    "framework": "express"
                },
                {
                    "type": "static",
                    "value": "restify-is-running",
                    "framework": "restify"
                },
                {
                    "type": "static",
                    "value": "default",
                }
            ],
            "output": [
                "msg-log"
            ]
        }
    ]
}
```

## Sensitive data redaction

To handle sensitive data redaction you can assign a field with the properties '"envVarSwitch":$ENV-VARIABLE' or '"envVarRedact":$ENV-VARIABLE'.

* envVarSwitch:
                      Only log this field, if specified environment variable is set to "true". 
                      If specified environment variable is not set to "true" or not present, field gets omitted. This is also affects fields with default values.
* envVarRedact:
                      Only log this field, if specified environment variable is set to "true". 
                      If specified environment variable is not set to "true" or not present, field gets set to "redacted" if it is not set to its default value or null.

Example:

```ts
    {
        "fields": [
            {
                "name": "remote_ip",
                "envVarRedact": "LOG_SENSITIVE_CONNECTION_DATA",
                "source": {
                    "type": "config-field",
                    "name": "remote_host"
                },
                "output": [
                    "req-log"
                ]
            }
        ] 
    }
```

To see which fields are configured as sensitive by default go to [Sensitive Data Redaction](/cf-nodejs-logging-support/advanced-usage/sensitive-data-redaction).
