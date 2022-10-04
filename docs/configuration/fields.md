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

Use the following properties to configurate a field:

1. [name](/cf-nodejs-logging-support/configuration/fields#name-required) (required)
1. [source](/cf-nodejs-logging-support/configuration/fields#source-required) (required)
1. [output](/cf-nodejs-logging-support/configuration/fields#output-required) (required)
1. [disable](/cf-nodejs-logging-support/configuration/fields#disable-optional) (optional)
1. [default](/cf-nodejs-logging-support/configuration/fields#default-optional) (optional)
1. [envVarRedact](/cf-nodejs-logging-support/configuration/fields#sensitive-data-redaction) (optional)
1. [envVarSwitch](/cf-nodejs-logging-support/configuration/fields#sensitive-data-redaction) (optional)

---

## Config field properties

### 1. name (required)

  * **Type:** string
  * **Description:** Assign fields key.


### 2. source (required)

  * **Type:** Source \| Source[]
  * **Description:** Configures how the value of the field is assigned. You can assign one or many sources to a field.

Each Source is defined by the property "type". Allowed values for each type of source are:

1. ["static"](/cf-nodejs-logging-support/configuration/fields#static)
1. ["env"](/cf-nodejs-logging-support/configuration/fields#env)
1. ["config-field"](/cf-nodejs-logging-support/configuration/fields#config-field)
1. ["req-header"](/cf-nodejs-logging-support/configuration/fields#req-header)
1. ["req-body"](/cf-nodejs-logging-support/configuration/fields#req-body)
1. ["res-header"](/cf-nodejs-logging-support/configuration/fields#res-header)
1. ["res-body"](/cf-nodejs-logging-support/configuration/fields#res-body)
1. ["uuid"](/cf-nodejs-logging-support/configuration/fields#uuid)

To get more information about each type of source go to [source types](/cf-nodejs-logging-support/configuration/fields#source-types).

To get more information about assigning multiple sources to a field go to [multiple sources](/cf-nodejs-logging-support/configuration/fields#source-types).

### 3. output (required)

  * **Type:** Array
  * **Description:** Define output of field (msg-log, req-log or both).
  * Allowed values:
    * msg-log
    * req-log

### 4. disable (optional)

  * **Type:** boolean
  * **Description:** If true, ommit field.

### 5. default (optional)

  * **Type:** string
  * **Description:** If returned value from source is null, then assign this value.

---

## Source types

### 1. "static"

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

### 2. "env"

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

### 3. "config-field"

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

### 4. "req-header"

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

### 5. "req-body"

Read value from request object. Declare the property to be accesed in the property "name".

### 6. "res-header"

Read value from response header. Declare the property to be accesed in the property "name".

### 7. "res-body"

Read value from response object. Declare the property to be accesed in the property "name".

### 8. "uuid"

 Create a random uuid and assign to value.

```ts
    {
        "name": "test-field",
        "type": "uuid",
        "output": ["msg-log","req-log"]
    }
```

---

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

## Sensitive data redaction

To handle sensitive data redaction you can assign a field with the properties "envVarSwitch" or "envVarRedact".

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
