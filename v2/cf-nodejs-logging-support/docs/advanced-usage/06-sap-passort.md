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

You can activate the SAP Passport by calling the method enableTracing:

```ts
log.enableTracing("sap_passport") 
```

After activating the SAP Passport you will be able to add the whole SAP Passport or its constituents related fields by calling setCustomFields. These fields will always be attached directly in the log object as normal fields regardless of the custom fields format.:

Example for adding whole SAP Passport:
```ts
log.setCustomFields({"sap_passport":"2a54482a0300e60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002a54482a"}) 
```

Example for adding only some SAP Passport related fields:
```ts
log.setCustomFields({"sap_passport_Action":"value", "sap_passport_ClientNumber":"1234"}) 
```
