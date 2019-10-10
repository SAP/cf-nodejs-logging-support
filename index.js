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

exports.setSinkFunction = function (func) {
    effectiveLogger.setSinkFunction(func);
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

coreLogger.bindConvenienceMethods(exports);

exports.createWinstonTransport = function (options) {
    if (!options) {
        options = {
            level: 'info'
        };
    }
    options.logMessage = effectiveLogger.logMessage;
    return require("./cf-nodejs-logging-support-winston/winston-transport").createTransport(options);
};

exports.getCorrelationObject = function () {
    return effectiveLogger.getCorrelationObject();
};

exports.createCorrelationObject = function () {
    return coreLogger.createCorrelationObject();
};

exports.setLogPattern = function (args) {
    effectiveLogger.setLogPattern.apply(this, arguments);
};
exports.overrideNetworkField = function (args) {
    effectiveLogger.overrideField.apply(this, arguments);
};