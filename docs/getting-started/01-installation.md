---
layout: default
title: Installation
parent: Getting Started
nav_order: 1
permalink: /getting-started/installation/
---

# Installation

The latest release version can be downloaded from [npm](https://www.npmjs.com/package/cf-nodejs-logging-support) and [github](https://github.com/SAP/cf-nodejs-logging-support/releases).

## Requirements

To take full advantage of cf-nodejs-logging-support make sure to fulfill following requirements:

* Node.js app to be deployed on Cloud Foundry
* Use [node.js](https://nodejs.org/) version 14.14 or higher
* Use one of the supported server frameworks:
  * [Express](https://expressjs.com/)
  * [Connect](https://www.npmjs.com/package/connect)
  * [Fastify](https://fastify.dev/)
  * [Node.js HTTP](https://nodejs.org/api/http.html)

## Install using npm

Use following command to add cf-nodejs-logging-support and its dependencies to your app.

```bash
npm install cf-nodejs-logging-support --save
```
