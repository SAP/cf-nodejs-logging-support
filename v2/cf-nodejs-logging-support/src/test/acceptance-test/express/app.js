// saves public key
process.env.DYN_LOG_LEVEL_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAt7uui2vozE3QJATnSaFcargZ6av9NPWd1wFTJmvKLMfWaGNsdSMkjULjdzTnvVLoQ25NlD0EYcZB68ME/5X/oqRuV/x/Kh37ksqsSkMJYyVRtaGiAILBgWTl5pPEwZsXRa4DDRFGYX271copYcA+FGriSHIfMR6S2Rz647y+rbL8KFJ3vp1hinU7M4qg+z3hYHZTJTfvkzbaTnTKKgRFSt0rxlcfWE6urj43cUprgBHeS4Rn0w0Dl8RhwxKGJmOIxExyn7THZmqFOwouEXlQaaJKL1uqOR+HEnqyca9zwRotJAs5JG0qhgj8Lq11TXzjZyMtvEyAhOeD8FXxVZ9AOQIDAQAB";

const importFresh = require('import-fresh');
const express = importFresh("express");
var log = importFresh('../../../../build/main/index');
const app = express();

// add logger to the server network queue to log all incoming requests.
app.use(log.logNetwork);

app.get("/simplelog", function (req, res) {
  req.logger.logMessage("info", "test-message");
  res.send();
});

app.get("/requestcontext", function (req, res) {
  req.headers["referer"] = "test-referer";
  req.user = {
    id: "test-user"
  };
  var reqLogger = req.logger;
  reqLogger.logMessage("debug", "debug-message");
  reqLogger.logMessage("info", "test-message");
  res.send();
});

app.get("/setloglevel", function (req, res) {
  req.logger.setLoggingLevel("warn");
  req.logger.logMessage("info", "test-message");
  res.send();
});

app.get("/setcorrelationandtenantid", function (req, res) {
  req.logger.setCorrelationId("cbc2654f-1c35-45d0-96fc-f32efac20986");
  req.logger.setTenantId("abc2654f-5t15-12h0-78gt-n73jeuc01847");
  req.logger.setTenantSubdomain("test-subdomain");
  req.logger.logMessage("info", "test-message");
  res.send();
});

app.get("/getcorrelationandtenantid", function (req, res) {
  var correlationId = "cbc2654f-1c35-45d0-96fc-f32efac20986";
  var tenantId = "abc2654f-5t15-12h0-78gt-n73jeuc01847";
  var tenantSubdomain = "test-subdomain";

  req.logger.setCorrelationId(correlationId);
  req.logger.setTenantId(tenantId);
  req.logger.setTenantSubdomain(tenantSubdomain);

  if (req.logger.getCorrelationId() == correlationId && req.logger.getTenantId() == tenantId && req.logger.getTenantSubdomain() == tenantSubdomain) {
    req.logger.logMessage("info", "successful");
  }
  res.send();
});

module.exports = app;
