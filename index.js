//loading core logger functionality
var coreLogger = require("./cf-nodejs-logging-support-core/log-core");
var effectiveLogger = null;

coreLogger.init();

effectiveLogger = require("./cf-nodejs-logging-support-express/log-express");
defaultConfig = require("./config.js");
effectiveLogger.setCoreLogger(coreLogger);

coreLogger.setConfig(defaultConfig.config);

// Set the minimum logging level. Messages with a lower level, will not be forwarded. (Levels: error, warn, info, verbose, debug, silly)
exports.setLoggingLevel = function (level) {
    coreLogger.setLoggingLevel(level);
};

exports.getLoggingLevel = function() {
    return coreLogger.getLoggingLevel();
}

// Sets the given function as log sink. Following arguments will be passed to the sink function: level, output
exports.setSinkFunction = function (func) {
    coreLogger.setSinkFunction(func);
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


exports.logMessage = function () {
    coreLogger.logMessage.apply(this, arguments);
};

exports.isLoggingLevel = function (level) {
    return coreLogger.isLoggingLevel(level);
};

coreLogger.bindConvenienceMethods(exports);

exports.createWinstonTransport = function (options) {
    if (!options) {
        options = {
            level: 'info'
        };
    }
    options.logMessage = coreLogger.logMessage;
    return require("./cf-nodejs-logging-support-winston/winston-transport").createTransport(options);
};

exports.createLogger = function (customFields) {
    return coreLogger.createLogger(customFields);
};

exports.registerCustomFields = function(fieldNames) {
    return coreLogger.registerCustomFields(fieldNames)
};

exports.setCustomFields = function (customFields) {
    return coreLogger.setCustomFields(customFields);
};

exports.setLogPattern = function (args) {
    coreLogger.setLogPattern.apply(this, arguments);
};
exports.overrideNetworkField = function (field, value) {
    return coreLogger.overrideField(field, value);
};