---
layout: default
title: Migrate to Version 7
permalink: /migration/
nav_order: 2
---


# Migrate from Version 7.x to Version 8.x

## Removed Restify support

Restify is no longer supported as a server framework. 
If you are using restify, please switch to one of the other supported server frameworks (e.g. express or fastify) and adjust your configuration accordingly. 
See [Server Framework](/cf-nodejs-logging-support/configuration/framework) for more details on how to set the server framework.

## Removed legacy methods

Following methods have been removed in version 8.x:

- `forceLogger()` has been removed.
    Use `setFramework` to set the server framework instead.
- `overrideCustomFieldFormat()` has been removed.
    Use `setCustomFieldsFormat` instead.
- `overrideNetworkField()` has been removed.
    Please use the custom fields feature to achieve a similar behavior. 
    See [Custom Fields](/cf-nodejs-logging-support/configuration/custom-fields) for more details. 
    Alternatively, you can also configure a static field via advanced configuration. 
    See [Advanced Configuration](/cf-nodejs-logging-support/configuration) for more details.
- `setLogPattern()` has been removed. 
    The features was already discontinued in version 7 and is not supported anymore. 
    Use a custom sink function to achieve a similar behavior.

## Minimum Node.js version is now 20

As of version 8.x, the minimum supported Node.js version is 20. 
If you are using an older version of Node.js, please upgrade to version 20 or later to use the latest version of the library.



# Migrate from Version 6.x to Version 7.x

Version 7.x introduces a redesigned architecture based on TypeScript.
This enables the customization of generated fields and field contents and get rid of obsolete features.
Below, you can find a description of discontinued, changed, and new features.
Please let us know if you experience any unexpected behavior or problems that are not listed yet.

## New Configuration Concept

Switching to v7 allows you to change the configuration without having to rebuild from source.
Similar to the previous version, v7 loads default field configurations automatically based on the detected runtime environment and bound logging services without any further configuration.
See [Advanced Configuration](/cf-nodejs-logging-support/configuration) to learn more about the new configuration concept.

## Typescript Typings

Typescript typings are available for log levels and configuration types.
Typings can be imported in addition to the default import:

```ts
import log, { Level, Framework } from "cf-nodejs-logging-support";

log.setLoggingLevel(Level.Info)
log.setFramework(Framework.Express)
```


## Omit default values

The new version no longer writes default values (e.g. `-`) for unresolved values but omits the fields instead.

## Discontinued log pattern feature

The log pattern feature (`log.setLogPattern(<pattern>)`) has been removed. 
It was used to set a custom formatting pattern for printing logs in a human-readable format.
A similar behavior can be achieved by configuring a custom sink function that outputs the logs in the desired format.
