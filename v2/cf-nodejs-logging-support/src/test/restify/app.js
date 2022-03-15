var restify = require('restify');
const importFresh = require('import-fresh');
var log = importFresh('cf-nodejs-logging-support');
var app = restify.createServer();

// Force logger to run the restify version. (default is express, forcing express is also legal)
log.forceLogger("restify");

// Add the logger middleware, so each time a request is received, it is will get logged.
app.use(log.logNetwork);

app.get('/log', (req, res) => {
  req.logger.logMessage("info", "restify-message");
  res.send();
});


app.get('/setcorrelationandtenantid', (req, res) => {
  var correlationId = "cbc2654f-1c35-45d0-96fc-f32efac20986";
  var tenantId = "abc8714f-5t15-12h0-78gt-n73jeuc01847";

  req.logger.setCorrelationId(correlationId);
  req.logger.setTenantId(tenantId);

  req.logger.logMessage("info", "restify-message");
  res.send();
});

app.get("/getcorrelationandtenantid", function (req, res) {
  var correlationId = "cbc2654f-1c35-45d0-96fc-f32efac20986";
  var tenantId = "abc8714f-5t15-12h0-78gt-n73jeuc01847";

  req.logger.setCorrelationId(correlationId);
  req.logger.setTenantId(tenantId);

  if (req.logger.getCorrelationId() == correlationId && req.logger.getTenantId() == tenantId) {
    req.logger.logMessage("info", "successful");
  }
  res.send();
});



module.exports = app;
