---
layout: default
title: Migrate to Version 7
permalink: /migration/
nav_order: 2
---

# Migrate from Version 6.x to Version 7.x

Version 7.x introduces a redesigned architecture based on TypeScript.
We aimed for seamless migration from Version 6.x to Version 7.x for most users.
However, we also use this major version increment to get rid of some outdated concepts and features.
On the other hand we also introduce a new configuration concepts, which allow full customization of the generated fields and field contents.
Below, you can find a description of discontinued, changed and new features.
Please let us know if you experience any unexpected behavior or problems that are not listed yet.

## New Configuration Concept

We redesigned the libraries configuration concept.
While the v6 configuration was an internal feature, v7 makes the configuration changeable without the need to rebuild it from source.
Similar to the previous version, v7 loads default field configurations automatically based on the detected runtime environment and bound logging services without any further configuration.
See [Advanced Configuration](/cf-nodejs-logging-support/configuration) to learn more about the new configuration concept.

## Typescript Typings

Typescript typings are available now.

## Omit default values

The new version no longer writes default values (e.g. `-`) for unresolved values but omits the fields instead.

## Discontinued log pattern feature

We decided to remove the log pattern feature (`log.setLogPattern(<pattern>)`), which used to allow setting a custom formatting pattern for printing logs in a human-readable format.
A similar result can be achieved by configuring a custom sink function, printing the logs in the preferred format.
