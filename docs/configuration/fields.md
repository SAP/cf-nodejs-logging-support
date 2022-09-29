---
layout: default
title: Configuration Fields
parent: Advanced Configuration
nav_order: 2
permalink: /configuration/fields
---

# Configuration of logging fields

You can write a configuration file to add new fields or override the behaviour of already existing ones. If a field name already exist in your configuration, this will override the previous field´s configuration.

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

## Config field properties

* ### name (required)

  * **Type:** string
  * **Description:** Assign fields key.

---

* ### source (required)

  * **Type:** Source \| Source[]
  * **Description:** Configures how the value of the field is assigned. You can assign one or many sources to a field.

Each source is defined by the property "type". Allowed values for each type of source are:

* ["static"](/cf-nodejs-logging-support/configuration/fields#type---static)
* ["env"](/cf-nodejs-logging-support/configuration/fields#type---env)
* ["config-field"](/cf-nodejs-logging-support/configuration/fields#type---config-field)
* ["req-header"](/cf-nodejs-logging-support/configuration/fields#type---req-header)
* ["req-body"](/cf-nodejs-logging-support/configuration/fields#type---req-body)
* ["res-header"](/cf-nodejs-logging-support/configuration/fields#type---res-header)
* ["res-body"](/cf-nodejs-logging-support/configuration/fields#type---res-body)
* ["uuid"](/cf-nodejs-logging-support/configuration/fields#type---uuid)

### type - "static"

Return always a static value. Declare this value as string in the property "value".

Example:

  ```ts
    {
        "name": "test-field",
        "type": "static",
        "value": "my_value",
        "output": ["msg-log", "req-log"]
    }
  ```

### type - "env"

Read value from environment variable. Declare the environment variable as string in the property "name".

Example:

```ts
    {
        "name": "test-field",
        "type": "env",
        "path": "ENV_VAR",
        "output": ["msg-log"]
    }
```

If you need to access a subproperty of the environemt variable, declare the property "path" with the path as an array of strings.

Example:

```ts
    {
        "name": "test-field",
        "type": "env",
        "path": ["ENV_VAR", "application_id"],
        "output": ["msg-log"]
    }
```

### type - "config-field"

Copy value from another configured field. Declare the name of the field to copy in the property "name".

Example:

  ```ts
    {
        "name": "test-field",
        "type": "config-field",
        "name": "field-a",
        "output": ["msg-log"]
    }
  ```

### type - "req-header"

Read value from request header. Declare the property to be accesed in the property "name".

Example:

  ```ts
    {
        "name": "test-field",
        "type": "req-header",
        "name": "access-control-request-method",
        "output": ["req-log"]
    }
  ```

### type - "req-body"

Read value from request object. Declare the property to be accesed in the property "name".

### type - "res-header"

Read value from response header. Declare the property to be accesed in the property "name".

### type - "res-body"

Read value from response object. Declare the property to be accesed in the property "name".

### type - "uuid"

 Create a random uuid and assign to value.

```ts
    {
        "name": "test-field",
        "type": "uuid",
        "output": ["msg-log","req-log"]
    }
```

## Multiple sources

You can attach multiple sources to a field. In this case, the library will iterate each source until one delivers a value.
You can also bind each source to a specific framework. If the framework assigned to the source is not running, then this source will be ignored. To do this just declare the property "framework": $framework in the respected source. Our supported frameworks are:

* [Express](https://expressjs.com/): declare as "express"
* [Restify](http://restify.com/): declare as "restify"
* [Connect](https://www.npmjs.com/package/connect): declare as "connect"
* [Node.js HTTP](https://nodejs.org/api/http.html): declare as "nodejs-http"

Example of field with multiple framework specific sources:

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

---

* ### output (required)

  * **Type:** Array
  * **Description:** Define output of field (msg-log, req-log or both).
  * Allowed values:
    * msg-log
    * req-log

---

* ### envVarSwitch (optional)

  * **Type:** string
  * **Description:** Only log this field, if specified environment variable is set to "true". If specified environment variable is not set to "true" or not present, field gets omitted. This is also affects fields with default values.

---

* ### envVarRedact (optional)

  * **Type:** string
  * **Description:** Only log this field, if specified environment variable is set to "true". If specified environment variable is not set to "true" or not present, field gets set to "redacted" if it is not set to its default value or null.

---

* ### disable (optional)

  * **Type:** boolean
  * **Description:** If true, ommit field.

---

* ### default (optional)

  * **Type:** string
  * **Description:** If returned value from source is null, then assign this value.

---

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
