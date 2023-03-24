// saves public key
process.env.DYN_LOG_LEVEL_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2fzU8StO511QYoC+BZp4riR2eVQM8FPPB2mF4I78WBDzloAVTaz0Z7hkMog1rAy8+Xva+fLiMuxDmN7kQZKBc24O4VeKNjOt8ZtNhz3vlMTZrNQ7bi+j8TS8ycUgKqe4/hSmjJBfXoduZ8Ye90u8RRfPLzbuutctLfCnL/ZhEehqfilt1iQb/CRCEsJou5XahmvOO5Gt+9kTBmY+2rS/+HKKdAhI3OpxwvXXNi8m9LrdHosMD7fTUpLUgdcIp8k3ACp9wCIIxbv1ssDeWKy7bKePihTl7vJq6RkopS6GvhO6yiD1IAJF/iDOrwrJAWzanrtavUc1RJZvbOvD0DFFOwIDAQAB";

const importFresh = require('import-fresh');
const express = importFresh("express");
const log = importFresh('../../../../build/main/index');
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
