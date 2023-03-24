const importFresh = require('import-fresh');
const connect = importFresh('connect');
const log = importFresh('../../../../build/main/index');
const http = importFresh('http');
const app = connect();

// Force logger to run the connect version. (default is express, forcing express is also legal)
log.forceLogger("connect");

// Add the logger middleware, so each time a request is received, it is will get logged.
app.use(log.logNetwork);

app.use("/log", function (req, res) {
  req.logger.setLoggingLevel("info");
  req.logger.logMessage("info", "connect-message");
  res.end();
});

app.use("/setcorrelationandtenantid", function (req, res) {
  req.logger.setCorrelationId("cbc2654f-1c35-45d0-96fc-f32efac20986");
  req.logger.setTenantId("abc8714f-5t15-12h0-78gt-n73jeuc01847");
  req.logger.logMessage("info", "connect-message");
  res.end();
});

app.use("/getcorrelationandtenantid", function (req, res) {
  var correlationId = "cbc2654f-1c35-45d0-96fc-f32efac20986";
  var tenantId = "abc8714f-5t15-12h0-78gt-n73jeuc01847";

  req.logger.setCorrelationId(correlationId);
  req.logger.setTenantId(tenantId);

  if (req.logger.getCorrelationId() == correlationId && req.logger.getTenantId() == tenantId) {
    req.logger.logMessage("info", "successful");
  }
  res.end();
});

module.exports = http.createServer(app);
