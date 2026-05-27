---
layout: home
title: Home
nav_order: 1
---

<div class="landing-hero">
  <h1 class="landing-title">CF Node.js Logging Support</h1>
  <p class="landing-subtitle">
    Structured logging and request metrics for Node.js applications.
    Drop-in middleware for Express, Fastify, Connect and plain Node.js HTTP servers.
  </p>
  <div class="landing-actions">
    <a href="/cf-nodejs-logging-support/getting-started/installation" class="btn btn-purple mr-2">Get started</a>
    <a href="/cf-nodejs-logging-support/migration" class="btn mr-2">Migrate to v8</a>
    <a href="https://github.com/SAP/cf-nodejs-logging-support" class="btn mr-2">GitHub</a>
    <a href="https://www.npmjs.com/package/cf-nodejs-logging-support" class="btn">npm</a>
  </div>
</div>

---

## Features

<div class="landing-features">

<div class="landing-feature">
<h3>Structured logs</h3>
Emits structured JSON log messages ready to be ingested by <a href="https://help.sap.com/docs/cloud-logging">SAP Cloud Logging</a> and <a href="https://help.sap.com/docs/application-logging-service">SAP Application Logging Service</a>. On Cloud Foundry, app, space, org and instance metadata are added automatically.
</div>

<div class="landing-feature">
<h3>Request metrics</h3>
Plug-in middleware that captures latency, status codes, correlation IDs and
tenant information for every HTTP request.
</div>

<div class="landing-feature">
<h3>Configurable fields</h3>
Add custom fields, reduce sensitive data, override field names or swap in a
completely custom log sink.
</div>

<div class="landing-feature">
<h3>Child loggers &amp; contexts</h3>
Create child loggers that inherit and extend a logging context, ideal for
tracing a single request or transaction across multiple modules.
</div>

<div class="landing-feature">
<h3>TypeScript ready</h3>
Full TypeScript typings are included.
</div>

<div class="landing-feature">
<h3>Winston transport</h3>
Use the built-in Winston transport to route existing Winston log calls through
the same structured pipeline.
</div>

</div>
