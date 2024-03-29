const express = require("express");
const log = require("cf-nodejs-logging-support");
const app = express();
var lastMessage = null;

// roots the views directory to public
app.set('views', 'public');

app.set('view engine', 'html');

// tells express that the public folder is the static folder
app.use(express.static(__dirname + "/public"));

// add logger to the server network queue to log all incoming requests.
app.use(log.logNetwork);

log.setSinkFunction((_, msg) => {
  lastMessage = msg
  console.log(msg)
});

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
log.info("Message logged in global context with custom fields", stats);

// home route
app.get("/", function (req, res) {
  res.send();
});

// demonstrate log in global context
// https://sap.github.io/cf-nodejs-logging-support/general-usage/logging-contexts#global-context
app.get("/globalcontext", function (req, res) {
  log.info("Message logged in global context");
  res.send(lastMessage);
});

// demonstrate log in request context
// https://sap.github.io/cf-nodejs-logging-support/general-usage/logging-contexts#request-context
app.get("/requestcontext", function (req, res) {
  var reqLogger = req.logger; // reqLogger logs in request context
  reqLogger.info("Message logged in request context");
  res.send(lastMessage);
});

// log message with some custom fields in global context 
// https://sap.github.io/cf-nodejs-logging-support/general-usage/custom-fields
app.get("/customfields", function (req, res) {
  log.info("Message logged in global context with some custom fields", { "custom-field-a": "value-a", "custom-field-b": "value-b" });
  res.send(lastMessage);
});

// log message with some custom fields in global context 
// https://sap.github.io/cf-nodejs-logging-support/general-usage/custom-fields
app.get("/passport", function (req, res) {
  log.info("Message with passport", { "sap_passport": "2A54482A0300E60000756E64657465726D696E6564202020202020202020202020202020202020202000005341505F4532455F54415F557365722020202020202020202020202020202020756E64657465726D696E65645F737461727475705F302020202020202020202020202020202020200005756E64657465726D696E6564202020202020202020202020202020202020202034323946383939424439414334374342393330314345463933443144453039432020200007793BCF7D8152423B8A7FD073109C45CE0000000000000000000000000000000000000000000000E22A54482A" });
  res.send(lastMessage);
});

// demonstrate an error stack trace logging
// https://sap.github.io/cf-nodejs-logging-support/general-usage/stacktraces
app.get("/stacktrace", function (req, res) {
  try {
    alwaysError();
    res.send("request succesful");
  } catch (e) {
    log.error("Error occurred", e)
    res.status(500).send(lastMessage);
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
  subLogger.warn("Message logged from child logger.");
  res.send(lastMessage);
});

// get the correlation and tenant ID by calling req.logger.getCorrelationId() and .getTenantId()
// https://sap.github.io/cf-nodejs-logging-support/advanced-usage/correlation-and-tenant-data
app.get("/correlationandtenantid", function (req, res) {
  var reqLogger = req.logger; // reqLogger logs in request context
  var correlationId = reqLogger.getCorrelationId();
  var tenantId = reqLogger.getTenantId();
  reqLogger.info("Correlation ID: %s Tenant ID: %s", correlationId, tenantId);
  res.send(lastMessage);
});

app.get("/binding_information", function (_, res) {
  result = "There are the following bindings: <br>"
  var services
  if (process.env.VCAP_SERVICES)
    services = JSON.parse(process.env.VCAP_SERVICES)
  if (services == undefined)
    res.send("There are no bindings present for this application")
  else {
    for (var service in services)
      result += service + "<br>"
    res.send(result)
  }
})


// binds the express module to 'app', set port and run server
var port = Number(process.env.VCAP_APP_PORT || 8080);
app.listen(port, function () {
  log.info("listening on port: %d", port);
});
