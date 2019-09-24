var express = require('express');
var log = require("cf-nodejs-logging-support");
var winston = require('winston');

var app = express();

var logger = winston.createLogger({
    // Bind transport to winston
    transports: [log.createWinstonTransport()]
});

app.get('/', function (req, res) {
    res.send('Hello World');
    logger.log("info", "Received request");
});

app.listen(3000);

// Messages will now be logged exactly as demonstrated by the Custom Messages paragraph
logger.log("info", "Server is listening on port %d", 3000);