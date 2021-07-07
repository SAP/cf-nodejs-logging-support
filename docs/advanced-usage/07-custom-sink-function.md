---
layout: default
title: Custom Sink Function
parent: Advanced Usage
nav_order: 7
permalink: /advanced-usage/custom-sink-function
---

# Custom Sink Function
Per default the library writes output messages to `stdout`. 
For debugging purposes it can be useful to redirect the output of the library to another sink (e.g. `console.log()`). 
You can set a custom sink method as follows:
```js
log.setSinkFunction(function(level, output) {
 console.log(output);
});
```
A custom sink function should have two arguments: `level` und `output`. 
You can redirect or filter output messages based on their logging level.

Note: If a custom sink function is set, the library will no longer output messages to the default sink (stdout).