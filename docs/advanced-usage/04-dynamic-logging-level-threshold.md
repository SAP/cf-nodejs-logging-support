---
layout: default
title: Dynamic Logging Level Threshold
parent: Advanced Usage
nav_order: 4
permalink: /advanced-usage/dynamic-logging-level-threshold
---

# Dynamic Logging Level Threshold
{: .no_toc }
For debugging purposes it can be useful to change the logging level threshold for specific requests.
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
Using this feature allows changing the logging level threshold dynamically without the need to redeploy your app.

### 1 Creating a key-pair

To sign and verify JWTs a PEM encoded private key and a matching public key is required.

You can create a private key using the following command:

```sh
openssl genrsa -out private.pem 2048
```

To create a public key from a private key use following command:

```sh
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
```

The generated key-pair can be found in `private.pem` and `public.pem` files.

### 2 Creating a JWT

JWTs are signed claims, which consist of a header, a payload, and a signature.
They can be signed using RSA or HMAC signing algorithms.
For this use-case we decided to support RSA algorithms (RS256, RS384 and RS512) only.
In contrast to HMAC algorithms (HS256, HS384 and HS512), RSA algorithms are asymmetric and therefore require key pairs (public and private key).

You can create JWTs by using the provided [TokenCreator](https://github.com/SAP/cf-nodejs-logging-support/tree/master/tools/token-creator):

```sh
cd tools/token-creator/
npm install
node token-creator.js -f <path private.pem> -v <validity period> -i <issuer> <level>
```

The `<validity period>` sets the number of days the JWT will be valid.
Once the created JWT expired, it can no longer be used for setting logging level threshold.
Provide a numeric input for this placeholder.

Provide a valid e-mail address for the `<issuer>` parameter.

Specify one of the seven supported logging levels for the `<level>` argument: *off*, *error*, *warn*, *info*, *verbose*, *debug*, and *silly*.

The payload of the created JWT has the following structure:

```js
{
  "issuer": "<e-mail address>",
  "level": "debug",
  "iat": 1506016127,
  "exp": 1506188927
}
```

### 3 Providing the public key

The logging library will verify JWTs attached to incoming requests.
In order to do so, the public key (from `public.pem` file) needs to be provided via an environment variable called DYN_LOG_LEVEL_KEY:

```text
DYN_LOG_LEVEL_KEY: <encoded public key>
```

Typically your public key file should have following structure:

```text
-----BEGIN PUBLIC KEY-----
<encoded public key>
-----END PUBLIC KEY-----
```

Instead of using the whole content of the `public.pem` file, you can also only provide the `<encoded key>` section to the environment variable.

Redeploy your app after setting the environment variable.

### 4 Attaching JWTs to requests

Provide the created JWT via a header field named 'SAP-LOG-LEVEL'. The logging level threshold will be set to the provided level for this request and corresponding custom log messages.

**Note**: If the provided JWT cannot be verified, is expired, or contains an invalid logging level, the library ignores it and uses the global logging level threshold.

If you want to use another header name for the JWT, you can specify it using an environment variable:

```text
DYN_LOG_HEADER: MY-HEADER-FIELD
```

## Change logging level threshold within request handlers

You can also change the logging level threshold for all requests of a specific request handler by calling:

```js
req.setLoggingLevel("verbose");
```

This feature is also available for [Child Loggers](/cf-nodejs-logging-support/advanced-usage/child-loggers#).
