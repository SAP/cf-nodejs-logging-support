---
layout: default
title: Sensitive Data Redaction
parent: Advanced Usage
nav_order: 3
permalink: /advanced-usage/sensitive-data-redaction
---

# Sensitive data redaction

Version 3.0.0 and above implement a sensitive data redaction system which disables logging of sensitive fields.
These fields will contain 'redacted' instead of the original content or are omitted.

Following fields are *redacted* by default:

- `remote_ip`
- `remote_host`
- `remote_port`
- `x_forwarded_for`
- `x_forwarded_host`
- `x_forwarded_proto`
- `x_custom_host`
- `remote_user`
- `referer`

Following fields are *omitted* by default:

- `x_ssl_client`
- `x_ssl_client_verify`
- `x_ssl_client_subject_dn`
- `x_ssl_client_subject_cn`
- `x_ssl_client_issuer_dn`
- `x_ssl_client_notbefore`
- `x_ssl_client_notafter`
- `x_ssl_client_session_id`

In order to activate usual logging for all or some of these fields you have to set specific environment variables:

| Environment Variable                      | Optional fields                                                                                      |
|-------------------------------------------|------------------------------------------------------------------------------------------------------|
| ```LOG_SENSITIVE_CONNECTION_DATA: true``` | activates the fields `remote_ip`, `remote_host`, `remote_port`, `x_forwarded_*` and `x_custom_host`  |
| ```LOG_REMOTE_USER: true```               | activates the field `remote_user`                                                                    |
| ```LOG_REFERER: true```                   | activates the field `referer`                                                                        |
| ```LOG_SSL_HEADERS: true```               | activates the ssl header fields `x_ssl_*`                                                            |

This behavior matches with the corresponding mechanism in the [CF Java Logging Support](https://github.com/SAP/cf-java-logging-support/wiki/Overview#logging-sensitive-user-data) library.
