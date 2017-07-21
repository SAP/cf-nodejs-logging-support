//loading core logger functionality
var coreLogger = require("./cf-nodejs-logging-support-core/log-core");
var effectiveLogger = null;

effectiveLogger = require("./cf-nodejs-logging-support-express/log-express");
effectiveLogger.setCoreLogger(coreLogger);

exports.setLoggingLevel = function (level) {
    effectiveLogger.setLoggingLevel(level);
};

exports.forceLogger = function (name) {
    switch (name) {
        //insert your custom framework logger here
        case "restify":
            effectiveLogger = require("./cf-nodejs-logging-support-restify/log-restify");
            break;
        case "plainhttp":
            effectiveLogger = require("./cf-nodejs-logging-support-plainhttp/log-plainhttp");
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

exports.winstonTransport = function () {
    var transport = require("./cf-nodejs-logging-support-winston/winston-transport");


    transport.setCoreLogger(coreLogger);
    return transport.getWinstonTransport();
}();

exports.getCorrelationObject = function () {
    return effectiveLogger.getCorrelationObject();
}

exports.setLogPattern = effectiveLogger.setLogPattern;