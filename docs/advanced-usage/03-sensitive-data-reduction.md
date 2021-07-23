---
layout: default
title: Sensitive Data Redaction
parent: Advanced Usage
nav_order: 3
permalink: /advanced-usage/sensitive-data-redaction
---

# Sensitive data redaction
Version 3.0.0 and above implement a sensitive data redaction system which disables logging of sensitive fields. 
These fields will contain 'redacted' instead of the original content.

Following fields are *redacted* by default: `remote_ip`, `remote_host`, `remote_port`, `x_forwarded_for`, `remote_user` and `referer`.

In order to activate usual logging for all or some of these fields you have to set specific environment variables:

| Environment Variable                      | Optional fields                                                           |
|-------------------------------------------|---------------------------------------------------------------------------|
| ```LOG_SENSITIVE_CONNECTION_DATA: true``` | activates the fields remote_ip, remote_host, remote_port, x_forwarded_for |
| ```LOG_REMOTE_USER: true```               | activates the field remote_user                                           |
| ```LOG_REFERER: true```                   | activates the field referer                                               |


This behavior matches with the corresponding mechanism in the [CF Java Logging Support](https://github.com/SAP/cf-java-logging-support/wiki/Overview#logging-sensitive-user-data) library.