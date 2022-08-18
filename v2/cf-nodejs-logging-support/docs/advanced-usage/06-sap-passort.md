---
layout: default
title: SAP Passport
parent: Advanced Usage
nav_order: 6
permalink: /advanced-usage/sap-passport
---

# SAP Passport
SAP Passport is an end to end tracing technology used in many SAP products.
It is a binary format encoded in hex notation. 
Example:

```
2a54482a0300e60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a54482a
```

Applications can add the whole SAP Passport in this field or give its constituents in the respective fields.

To read up on the possible fields, please look at [fields](https://github.com/SAP/cf-java-logging-support/blob/master/cf-java-logging-support-core/beats/app-logs/docs/fields.asciidoc).