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
* Use [node.js](https://nodejs.org/) version 22 or newer
* Use one of the supported server frameworks:
  * [Express](https://expressjs.com/)
  * [Fastify](https://fastify.dev/)
  * [Node.js HTTP](https://nodejs.org/api/http.html)
  * [Connect](https://www.npmjs.com/package/connect) 

> Note on Connect: The Connect framework appears to have limited recent maintenance activity. 
Because it is still widely used in existing projects, cf-nodejs-logging-support continues to support it for now. 
This may change in a future major version.

## Install using npm

Use following command to add cf-nodejs-logging-support and its dependencies to your app.

```bash
npm install cf-nodejs-logging-support --save
```
