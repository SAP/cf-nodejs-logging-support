---
layout: default
title: Configuration
parent: Advanced Usage
nav_order: 1
permalink: /advanced-usage/configuration
---

# Configuration
You can customize the default configuration by writing a JSON file and adding it to the library. You can add new fields or already existing ones. If a field name in your configuration already exist this will overrided the previous configuration field.
Make sure to declare the configuration of your fields as a list in the property "fields".


## Write a JSON file and declare fields configuration
Example:
```ts
{
    "fields": [
        {
            "name": "organization_id",
            "mandatory": true,
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
            "mandatory": false,
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
            "mandatory": false,
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
            "mandatory": true,
            "source": {
                "type": "req-object",
                "name": "originalUrl"
            },
            "output": [
                "req-log".
                "msg-log"
            ]
        },
    ],
    "reqLoggingLevel": "info",
    "customFieldsFormat": "cloud-logging",
    "outputStartupMsg": true,
    "framework": "express"
}
```

```ts
export interface ConfigField {
    name: string;
    envVarRedact?: string;
    envVarSwitch?: string;
    source: Source | Source[];
    output?: outputs[];
    disable?: boolean;
    default?: string;
}
```

## Multiple sources
Each field can have one or many sources declared in its configuration. If the field has a list of sources assigned, the library will iterate each source until one delivers a value. 
You can also assign each source to work only with a specific framework using the property "framework". Our supported frameworks are:
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
},
```

## Sensitive data redaction
To handle sensitive data redaction you can use you can assign a field with the properties '"envVarSwitch":<ENV-VARIABLE>' or '"envVarRedact":<ENV-VARIABLE>'.

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

## Resume config field properties:
* name: assigns the key of the field.
* envVarSwitch: Only log this field, if specified environment variable is set to "true". If specified environment variable is not set to "true" or not present, field gets omitted. This is also affects fields with default values.
* envVarRedact: Only log this field, if specified environment variable is set to "true". If specified environment variable is not set to "true" or not present, field gets set to "redacted" if it is not set to its default value or null.
* source: configures how the value of the field is assigned. You can assign one or more sources to a field.
    -  type: One of
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
* output: define output of field (msg-log or req-log).
* disable: if true, ommit field.
* default: if value from sources is null, then assign this value.


## Set default request loging level
Change the default logging level for all request by setting the property "reqLoggingLevel": <level>. For example:
* "reqLoggingLevel": "warn"
* "reqLoggingLevel": "debug"

## Set framework
Set the framework used by setting the property "framework": <frameworkName>. The default framework is express.
Our supported frameworks are:
* "express"
* "restify"
* "connect"
* "nodejs-http"

## Custom fields format
Set the custom field format by setting the property "customFieldsFormat": <format>.
Supported values are:
* "application-logs"
* "cloud-logging"

## Add custom configuration
Once you have a JSON file with your configuration, you can add this to the logger using the addConfig method:
```ts
log.addConfig(configFile);
```

