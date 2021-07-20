---
layout: default
title: Dynamic Logging Level Threshold
parent: Advanced Usage
nav_order: 4
permalink: /advanced-usage/dynamic-logging-level-threshold
---

# Dynamic Logging Level Threshold
{: .no_toc }
Sometimes it is useful to change the logging level threshold for a specific request. 
This can be achieved using a special header field or setting directly within the corresponding request handler. 
Changing the logging level threshold affects if logs with a specific level are written. 
It has no effect on the level reported as part of the logs.

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Change logging level threshold via header field
You can change the logging level threshold for a specific request by providing a JSON Web Token ([JWT](https://de.wikipedia.org/wiki/JSON_Web_Token)) via the request header. 
Using this feature allows you to change the logging level threshold dynamically without the need to redeploy your app.

### 1 Creating a JWT
JWTs are signed claims, which consist of a header, a payload and a signature. 
You can create JWTs by using the [TokenCreator](https://github.com/SAP/cf-nodejs-logging-support/tree/master/tools/token-creator) from the tools folder.

Basically, JWTs are signed using RSA or HMAC signing algorithms. 
But we decided to support RSA algorithms (RS256, RS384 and RS512) only. 
In contrast to HMAC algorithms (HS256, HS384 and HS512), RSA algorithms are asymmetric and therefore require key pairs (public and private key).

The tool mentioned above takes a log level, creates a key pair and signs the resulting JWT with the private key. 
The payload of a JWT looks like this:
```js
{
  "issuer": "<valid e-mail address>",
  "level": "debug",
  "iat": 1506016127,
  "exp": 1506188927
}
```

This library supports seven logging levels: *off*, *error*, *warn*, *info*, *verbose*, *debug* and *silly*. 
Make sure that your JWT specifies one of them in order to work correctly. 
It is also important to make sure that the JWT has not been expired, when using it. 

### 2 Providing the public key
The logging library will verify JWTs attached to incoming requests. 
In order to do so, the public key (from above) needs to be provided via an environment variable called *DYN_LOG_LEVEL_KEY*:
```
DYN_LOG_LEVEL_KEY: <your public key>
```

Redeploy your app after setting up the environment variable. 

### 3 Attaching JWTs to requests
Provide the created JWTs via a header field named 'SAP-LOG-LEVEL'. The logging level threshold will be set to the provided level for this request and corresponding custom log messages. 

Note: If the provided JWT cannot be verified, is expired or contains an invalid logging level, the library ignores it and uses the global logging level threshold.

If you want to use another header name for the JWT, you can specify it using an environment variable:
```
DYN_LOG_HEADER: MY-HEADER-FIELD
```

## Change logging level threshold within request handlers
You can also change the logging level threshold for all requests of a specific request handler by calling:
```js
req.setLoggingLevel("verbose");
```
This feature is also available for [Child Loggers](/cf-nodejs-logging-support/advanced-usage/child-loggers#).
