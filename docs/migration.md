---
layout: default
title: Migrate to Version 7
permalink: /migration/
nav_order: 2
---

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

Typescript typings are available now.

## Omit default values

The new version no longer writes default values (e.g. `-`) for unresolved values but omits the fields instead.

## Discontinued log pattern feature

The log pattern feature (`log.setLogPattern(<pattern>)`) has been removed. 
It was used to set a custom formatting pattern for printing logs in a human-readable format.
A similar behavior can be achieved by configuring a custom sink function that outputs the logs in the desired format.
