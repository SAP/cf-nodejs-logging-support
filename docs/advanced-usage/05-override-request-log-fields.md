---
layout: default
title: Override Request Log Fields
parent: Advanced Usage
nav_order: 5
permalink: /advanced-usage/override-request-log-fields
---

# Override Request Log Fields
Possibility to tailor logs to your needs, you can for example change the msg field for request logs to find them in the Human readable format:
```js
log.overrideNetworkField("msg", YOUR_CUSTOM_MSG);
```
This will replace the value of the previously not existing msg field for request logs with YOUR_CUSTOM_MSG.
If the overridden field is already existing, it will be overridden by YOUR_CUSTOM_MSG for ALL subsequent request logs, until you 
remove the override with:
```js
log.overrideNetworkField("msg", null);
```
If you use this override feature in conjunction with a log parser, make sure you will not violate any parsing rules.