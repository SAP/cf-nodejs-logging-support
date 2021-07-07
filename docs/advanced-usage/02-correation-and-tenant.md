---
layout: default
title: Correlation and Tenant Data
parent: Advanced Usage
nav_order: 2
permalink: /advanced-usage/correlation-and-tenant-data
---



# Getting and setting correlation and tenant data
{: .no_toc }
To further propagate correlation and tenant information to subsequent requests or processes you can extract them from the request context.  

<details open markdown="block">
  <summary>
    Table of contents
  </summary>
  {: .text-delta }
1. TOC
{:toc}
</details>

## Correlation ID
In order to get the `correlation_id` of a request you can use the following method:
```js
app.get('/', function (req, res) {
    // Get correlation_id from logger bound to request
    var id = req.logger.getCorrelationId();
    
    res.send('Hello World');
});
```

It is also possible to change the `correlation_id` to a valid UUIDv4:
```js
app.get('/', function (req, res) {
    // Set correlation_id via logger bound to request
    req.logger.setCorrelationId("cbc2654f-1c35-45d0-96fc-f32efac20986");
    
    res.send('Hello World');
});
```

## Tenant ID
In order to get the `tenant_id` of a request you can use the following method:
```js
app.get('/', function (req, res) {
    // Get tenant_id from logger bound to request
    var tenantId = req.logger.getTenantId();
    
    res.send('Hello World');
});
```

It is also possible to change the `tenant_id` to any string value:
```js
app.get('/', function (req, res) {
    // Set tenant_id via logger bound to request
    req.logger.setTenantId("cbc2654f-1c35-45d0-96fc-f32efac20986");
    
    res.send('Hello World');
});
```

Be aware that changing the tenant_id for a logger will also affect ancestor and descendant loggers within the same request context, especially the network log for this request will contain the new `tenant_id`.


## Tenant Subdomain
The `tenant_subdomain` does **not** get determined automatically.
However, you can set it per request as follows:

```js
app.get('/', function (req, res) {
    // Set tenant_subdomain via logger bound to request
    req.logger.setTenantSubdomain("my-subdomain");
    
    res.send('Hello World');
});
```

Be aware that changing the tenant_subdomain for a logger will also affect ancestor and descendant loggers within the same request context, especially the network log for this request will contain the new tenant_subdomain.