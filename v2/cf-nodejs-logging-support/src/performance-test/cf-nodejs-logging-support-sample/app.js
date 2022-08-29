process.env.VCAP_SERVICES = "CF";
process.env.VCAP_APPLICATION = JSON.stringify(
  {
    "cf_api": "test-value",
    "limits": {
      "fds": 32768
    },
    "application_name": "test-value",
    "application_uris": [
      "test-value"
    ],
    "name": "test-value",
    "space_name": "dev",
    "space_id": "test-value",
    "organization_id": "test-value",
    "organization_name": "test-value",
    "uris": [
      "test-value"
    ],
    "users": null,
    "application_id": "test-value"
  }
);
process.env.LOG_SENSITIVE_CONNECTION_DATA = false;
process.env.LOG_REMOTE_USER = false;
process.env.LOG_REFERER = false;

process.env.TEST_SENSITIVE_DATA = false;
// saves public key
process.env.DYN_LOG_LEVEL_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2fzU8StO511QYoC+BZp4riR2eVQM8FPPB2mF4I78WBDzloAVTaz0Z7hkMog1rAy8+Xva+fLiMuxDmN7kQZKBc24O4VeKNjOt8ZtNhz3vlMTZrNQ7bi+j8TS8ycUgKqe4/hSmjJBfXoduZ8Ye90u8RRfPLzbuutctLfCnL/ZhEehqfilt1iQb/CRCEsJou5XahmvOO5Gt+9kTBmY+2rS/+HKKdAhI3OpxwvXXNi8m9LrdHosMD7fTUpLUgdcIp8k3ACp9wCIIxbv1ssDeWKy7bKePihTl7vJq6RkopS6GvhO6yiD1IAJF/iDOrwrJAWzanrtavUc1RJZvbOvD0DFFOwIDAQAB";

const express = require("express");
// var log = require("cf-nodejs-logging-support");
var log = require("../../../build/main/index");
const app = express();
// log.addConfig(require("./config-test.json"));
// roots the views directory to public
app.set('views', 'public');

app.set('view engine', 'html');

// tells express that the public folder is the static folder
app.use(express.static(__dirname + "/public"));

// add logger to the server network queue to log all incoming requests.
app.use(log.logNetwork);

// set the logging level threshold
log.setLoggingLevel("info");

// register names of custom fields
log.registerCustomFields(["global-field-a", "node_version", "pid", "platform", "custom-field-a", "custom-field-b", "new-field"]);

// set a custom field globally, so that it will be logged for all following messages independent of their request/child context.
log.setCustomFields({ "global-field-a": "value" });

// log some custom fields
var stats = {
  node_version: process.version,
  pid: process.pid,
  platform: process.platform,
};
// home route
app.get("/", function (req, res) {
  res.send();
});

// demonstrate log in global context
// https://sap.github.io/cf-nodejs-logging-support/general-usage/logging-contexts#global-context
app.get("/globalcontext", function (req, res) {

  for (let index = 0; index < 10000; index++) {
    log.logMessage("info", "Message logged in global context");
  }
  res.send();
});

// demonstrate log in global context
// https://sap.github.io/cf-nodejs-logging-support/general-usage/logging-contexts#global-context
app.get("/testlognetwork", function (req, res) {
  res.send();
});

// demonstrate log in request context
// https://sap.github.io/cf-nodejs-logging-support/general-usage/logging-contexts#request-context
app.get("/requestcontext", function (req, res) {
  var reqLogger = req.logger; // reqLogger logs in request context


  for (let index = 0; index < 100000; index++) {
    reqLogger.logMessage("info", "Message logged in request context");
  }

  res.send();
});

// log message with some custom fields in global context 
// https://sap.github.io/cf-nodejs-logging-support/general-usage/custom-fields
app.get("/customfields", function (req, res) {
  log.setCustomFieldsFormat("application-logging");
  log.logMessage("info", "Message logged in global context with some custom fields", { "custom-field-a": "value-a", "custom-field-b": "value-b" });
  res.send();
});

// demonstrate an error stack trace logging
// https://sap.github.io/cf-nodejs-logging-support/general-usage/stacktraces
app.get("/stacktrace", function (req, res) {
  try {
    alwaysError();
    res.send("request succesful");
  } catch (e) {
    log.logMessage("error", "Error occurred", e)
    res.status(500).send("error ocurred");
  }
});

function alwaysError() {
  throw new Error("An error happened. Stacktrace will be displayed.");
}

// create a new child from the logger object and overide/create new fields
// https://sap.github.io/cf-nodejs-logging-support/advanced-usage/child-loggers
app.get("/childlogger", function (req, res) {
  var subLogger = log.createLogger({ "new-field": "value" });
  subLogger.setLoggingLevel("warn");
  subLogger.logMessage("warn", "Message logged from child logger.");
  res.send();
});

// get the correlation and tenant ID by calling req.logger.getCorrelationId() and .getTenantId()
// https://sap.github.io/cf-nodejs-logging-support/advanced-usage/correlation-and-tenant-data
app.get("/correlationandtenantid", function (req, res) {
  var reqLogger = req.logger; // reqLogger logs in request context
  var correlationId = reqLogger.getCorrelationId();
  var tenantId = reqLogger.getTenantId();
  reqLogger.logMessage("info", "Correlation ID: %s Tenant ID: %s", correlationId, tenantId);
  res.send();
});


// binds the express module to 'app', set port and run server
var port = Number(process.env.VCAP_APP_PORT || 8081);
app.listen(port, function () {
  log.logMessage("info", "listening on port: %d", port);
});
