---
layout: default
title: Configuration Fields
parent: Advanced Configuration
nav_order: 2
permalink: /configuration/fields
---

# Configuration of logging fields

All fields logged by the library are defined by a default set of field configurations.
You can add new fields or override the behavior of already existing ones by adding field configurations.

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Write a JSON file and declare fields configuration

Make sure to declare the configuration of your fields as a list in the property `fields`.

Example:

```js
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
            "name": "request",
            "source": {
                "type": "req-object",
                "fieldName": "originalUrl"
            },
            "output": [
                "req-log".
                "msg-log"
            ]
        }
    ]
}
```

Read more about the available field properties in the next section.

## Config field properties

Each field, i.e., its source, format and behavior is defined by a set required and optional of properties:

1. [name](/cf-nodejs-logging-support/configuration/fields#property-name-required) (required)
1. [source](/cf-nodejs-logging-support/configuration/fields#property-source-required) (optional)
1. [output](/cf-nodejs-logging-support/configuration/fields#property-output-required) (required)
1. [isContext](/cf-nodejs-logging-support/configuration/fields#property-default-optional) (optional)
1. [disable](/cf-nodejs-logging-support/configuration/fields#property-disable-optional) (optional)
1. [settable](/cf-nodejs-logging-support/configuration/fields#property-default-optional) (optional)
1. [default](/cf-nodejs-logging-support/configuration/fields#property-default-optional) (optional)
1. [convert](/cf-nodejs-logging-support/configuration/fields#property-default-optional) (optional)
1. [envVarRedact](/cf-nodejs-logging-support/configuration/fields#sensitive-data-redaction) (optional)
1. [envVarSwitch](/cf-nodejs-logging-support/configuration/fields#sensitive-data-redaction) (optional)

Read more on each available property below.

### Property: name (required)

  * **Type:** `string`
  * **Description:** Assign field name.

### Property: `source` (optional)

  * **Type:** `Source` or `Source[]`
  * **Description:** Configures how the value of the field is determined.
    You can assign one or multiple sources to a field.
    Find more details on each type of source in the [source types](/cf-nodejs-logging-support/configuration/fields#source-types) section.

    The [multiple sources](/cf-nodejs-logging-support/configuration/fields#source-types) section gives more information on assigning multiple sources to a field.

### Property: `output` (required)

  * **Type:** `Output[]`
  * **Description:** Defines if the field is included in message logs, request logs or both.
  * **Allowed values:**
    * `["msg-log"]`: Log in [message logs](/cf-nodejs-logging-support/general-usage/message-logs)
    * `["req-log"]`: Log in  [request logs](/cf-nodejs-logging-support/general-usage/request-logs)
    * `["msg-log","req-log"]`: Log in both [message](/cf-nodejs-logging-support/general-usage/message-logs) and [request logs](/cf-nodejs-logging-support/general-usage/request-logs)

### Property: `disable` (optional)

  * **Type:** `boolean`
  * **Description:** If `true`, omit field.

### Property: `default` (optional)

  * **Type:** `string`
  * **Description:** If returned value from source is `null`, then assign this value.


### Property: `convert` (optional)

  * **Type:** `Conversion`
  * **Description:** Applies the selection conversion to the field value.
    This can be useful if, for example, a numerical value should be printed as string or vice versa.
  * **Allowed values:**
    * `toString`: calls the `toString()` method for the value, if available.
    * `parseInt`: calls JS parseFloat, if the value has type `string`. For boolean values it evaluates to `0` (false) and `1` (true).
    * `parseFloat`: calls JS parseInt, if the value has type `string`. For boolean values it evaluates to `0` (false) and `1` (true).
    * `parseBoolean`: evaluates to `true`, if the value matches `"true"`, `"True"`, `"TRUE"`, `1` (number) or `true` (boolean). Otherwise, `false`.

### Property: `settable` (optional)

  * **Type:** `boolean`
  * **Description:** If `true`, the field value can be set using the [Custom Fields](/cf-nodejs-logging-support/general-usage/custom-fields) feature independent of the selected custom fields format.

### Property: `isContext` (optional)

  * **Type:** `boolean`
  * **Description:** If `true`, the field is part of the request context. This has following impact:
    * It will only be present in the logs if the respective message got logged within the context of a request.
    * It can rely on sources which read from the request object or headers.
    * It can be added to both, request and message logs.
  
---

## Source types

There are various source types available which can be used to define how the library should resolve a certain field value.
The source type is selected by the `type` property.

### Type: `static`

Provides a static `string` value read from the configured `value` property.

Example:

  ```js
    {
        "type": "static",
        "value": "my_value",
    }
  ```

### Type: `env`

Read value from environment variable.
Declare the environment variable as `string` in the property `varName`.

Example:

```js
    {
        "type": "env",
        "varName": "ENV_VAR"
    }
```

If you need to access a value present in a JSON object stored in the environment variable, declare the `path` property.

Example:

```js
    {
        "type": "env",
        "path": ["ENV_VAR", "application_id"]
    }
```

### Type: `config-field`

Resolve the value from another configured field.
Declare the name of the field to copy in the `fieldName` property.

Example:

  ```js
    {
        "type": "config-field",
        "fieldName": "field-a"
    }
  ```

### Type: `req-header`

Read value from the request header.
Declare the property to be accessed in the `fieldName` property.

Example:

  ```js
    {
        "type": "req-header",
        "fieldName": "access-control-request-method"
    }
  ```

### Type: `req-object`

Read value from request object properties.
Declare the property to be accessed in the `fieldName` property.
The available properties depend on the server framework in use.

### Type: `res-header`

Read value from response header.
Declare the property to be accessed in the `fieldName` property.

### Type: `res-object`

Read value from response object.
Declare the property to be accessed in the `fieldName` property.
The available properties depend on the server framework in use.

### Type: `uuid`

Generate a random uuid.

```js
    {
        "type": "uuid"
    }
```

---

## Multiple sources

You can define multiple sources for a field.
The library will iterate each source until one delivers a value.

Additionally, sources can also be bound to a specific server framework.
If the framework assigned to the source is not in use, then this source will be ignored. Declare the property `framework` in the respective source.
Our supported server frameworks are:

* [Express](https://expressjs.com/): declare as `express`
* [Restify](http://restify.com/): declare as `restify`
* [Connect](https://www.npmjs.com/package/connect): declare as `connect`
* [Fastify](https://fastify.dev/): declare as `fastify`
* [Node.js HTTP](https://nodejs.org/api/http.html): declare as `plainhttp`

Example of field with multiple framework specific sources:

```js
{
    "fields": [
        {
            "name": "my_field",
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

To handle sensitive data redaction you can assign a field with the properties `envVarSwitch` or `envVarRedact`.

* `envVarSwitch`: Only log this field, if the specified environment variable is set to `true`.
    If the specified environment variable is not set to `true` or not present, the field gets omitted.
    This is also affects fields with default values.
* `envVarRedact`: Only log this field, if specified environment variable is set to `true`.
    If specified environment variable is not set to `true` or not present, field gets set to `redacted` if it is not set to its default value or null.

Example:

```js
    {
        "fields": [
            {
                "name": "remote_ip",
                "envVarRedact": "LOG_SENSITIVE_CONNECTION_DATA",
                "source": {
                    "type": "req-object",
                    "fieldName": "remote_host"
                },
                "output": [
                    "req-log"
                ]
            }
        ] 
    }
```

To see which fields are configured as sensitive by default go to [Sensitive Data Redaction](/cf-nodejs-logging-support/advanced-usage/sensitive-data-redaction).
