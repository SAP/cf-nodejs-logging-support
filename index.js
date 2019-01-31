//loading core logger functionality
var coreLogger = require("./cf-nodejs-logging-support-core/log-core");
var effectiveLogger = null;

coreLogger.init();

effectiveLogger = require("./cf-nodejs-logging-support-express/log-express");
defaultConfig = require("./config.js");
effectiveLogger.setCoreLogger(coreLogger);
effectiveLogger.setConfig(defaultConfig.config);

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
    effectiveLogger.setConfig(defaultConfig.config);
};


exports.logNetwork = function (req, res, next) {
    effectiveLogger.logNetwork(req, res, next);
};


exports.logMessage = function (args) {
    effectiveLogger.logMessage.apply(this, arguments);
};

exports.createWinstonTransport = function (options) {
    try {
        if (!options) {
            options = {
                level: 'info'
            };
        }
        options.coreLogger = coreLogger;
        return require("./cf-nodejs-logging-support-winston/winston-transport").createTransport(options);
    } catch(e) {
        throw "Unable to create winston transport: " + e.message;
    }
};

exports.getCorrelationObject = function () {
    return effectiveLogger.getCorrelationObject();
};

exports.setLogPattern = function(args) {
    effectiveLogger.setLogPattern.apply(this, arguments);
};
exports.overrideNetworkField = function (args) {
    effectiveLogger.overrideField.apply(this, arguments);
};