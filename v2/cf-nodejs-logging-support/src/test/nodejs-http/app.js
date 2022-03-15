const importFresh = require('import-fresh');
const http = importFresh('http');
var log = importFresh('cf-nodejs-logging-support');;

// Force logger to run the http version.
log.forceLogger("plainhttp");

const server = http.createServer((req, res) => {
    // Binds logging to the given request for request tracking
    log.logNetwork(req, res);

    var correlationId = "cbc2654f-1c35-45d0-96fc-f32efac20986";
    var tenantId = "abc8714f-5t15-12h0-78gt-n73jeuc01847";

    if (req.url == '/setcorrelationandtenantid') {
        req.logger.setCorrelationId(correlationId);
        req.logger.setTenantId(tenantId);
    }

    if (req.url == '/testget') {
        req.logger.setCorrelationId(correlationId);
        req.logger.setTenantId(tenantId);

        if (req.logger.getCorrelationId() == correlationId && req.logger.getTenantId() == tenantId) {
            req.logger.logMessage("info", "successful");
        }
        res.end();
    }
    // Context bound custom message
    req.logger.logMessage("info", "http-message");
    res.end();
});

module.exports = server;
