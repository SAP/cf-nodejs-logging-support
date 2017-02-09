//loading core logger functionality
var coreLogger = require("./cf-nodejs-logging-support-core/log-core");
var effectiveLogger = null;
var transport = require("./cf-nodejs-logging-support-winston/winston-transport");

effectiveLogger = require("./cf-nodejs-logging-support-express/log-express");
effectiveLogger.setCoreLogger(coreLogger);

transport.setCoreLogger(coreLogger);

exports.setLoggingLevel = function (level) {
    effectiveLogger.setLoggingLevel(level);
};

exports.forceLogger = function (name) {
    switch (name) {
        //insert your custom framework logger here
        case "restify":
            effectiveLogger = require("./cf-nodejs-logging-support-restify/log-restify");
            break;
        default:
            effectiveLogger = require("./cf-nodejs-logging-support-express/log-express");
    }
    effectiveLogger.setCoreLogger(coreLogger);
};


exports.logNetwork = function (req, res, next) {
    effectiveLogger.logNetwork(req, res, next);
};


exports.logMessage = function (args) {
    effectiveLogger.logMessage.apply(this, arguments);
};

exports.winstonTransport = transport.winstonTransport;

exports.setLogPattern = effectiveLogger.setLogPattern;
