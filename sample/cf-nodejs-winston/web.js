var express = require('express');
var log = require('cf-nodejs-logging-support');
var winston = require('winston');

var app = express();
var logger = new(winston.Logger)({
    // Bind transport to winston
    transports: [log.winstonTransport]
});

app.get('/', function (req, res) {
    res.send('Hello World');
    logger.log("info", "request received");
});

app.listen(3000);

// Messages will now be logged exactly as demonstrated by the Custom Messages paragraph
winston.log("info", "Server is listening on port %d", 3000, {});
logger.log("info", "Server is listening on port %d", 3000, {});

log.logMessage("info", "Server is listening on port %d", 3000, {});
