// Log network activity for express applications

var uuid = require("uuid/v4");
var core;
var fixedValues = [];

var setCoreLogger = function (coreLogger) {
    core = coreLogger;
};

var setConfig = function (config) {
    core.setConfig(config);
}

// Set the minimum logging level. Messages with a lower level, will not be forwarded. (Levels: error, warn, info, verbose, debug, silly)
var setLoggingLevel = function (level) {
    core.setLoggingLevel(level);
};

// Logs requests and responses
var logNetwork = function (req, res, next) {
    var logSent = false;

    var logObject = core.initLog();

    //rendering the given arguments failsave against missing fields
    if (typeof req.header != "function") {
        req.header = function () {
            return "";
        };
    }
    if (req.connection == null) {
        req.connection = {};
    }
    if (req.headers == null) {
        req.headers = {};
    }

    if (req.url == null) {
        req.url = req.originalUrl;
    }
    if (res.get == null) {
        res.get = function () {
            return "";
        };
    }

    var token = req.header(core.getDynLogLevelHeaderName());

    if(token != null) {
        req.dynamicLogLevel = core.getLogLevelFromJWT(token);
    } else {
        req.dynamicLogLevel = null;
    }
    
    var fallbacks = [];
    var selfReferences = [];
    var configEntry;
    var preConfig = core.getPreLogConfig();
    for (var i = 0; i < preConfig.length; i++) {
        configEntry = preConfig[i];

        switch (configEntry.source.type) {
            case "header":
                logObject[configEntry.name] = req.header(configEntry.source.name);
                break;
            case "static":
                logObject[configEntry.name] = configEntry.source.value;
                break;
            case "field":
                logObject[configEntry.name] = req[configEntry.source.name];
                break;
            case "self":
                selfReferences[configEntry.name] = configEntry.source.name;
                break;
            case "time":
                if (configEntry.source.pre != null)
                    logObject[configEntry.name] = configEntry.source.pre(req, res, logObject);
                else
                    logObject[configEntry.name] = -1 //defaulting for time fields
                break;
            case "special":
                fallbacks[configEntry.name] = configEntry.fallback;
                break;
        }
        
        core.handleConfigDefaults(configEntry, logObject, fallbacks);
    }

    for (var key in fallbacks) {
        logObject[key] = fallbacks[key](req, res, logObject);
    }
    
    for (var key in selfReferences) {
        logObject[key] = logObject[selfReferences[key]];
    }

    // Replace all set fields, which are marked to be reduced, with a placeholder (defined in log-core.js)
    core.reduceFields(preConfig, logObject);

    req.logObject = logObject;
    core.bindLogFunctions(req);

    res.on('finish', function () {
        finishLog();
    });

    res.on('header', function () {
        finishLog();
    });

    var finishLog = function () {
        if (!logSent) {

            var postConfig = core.getPostLogConfig();
            var fallbacks = [];
            var selfReferences = [];

            for (var i = 0; i < postConfig.length; i++) {
                configEntry = postConfig[i];

                switch (configEntry.source.type) {
                    case "header":
                        logObject[configEntry.name] = res.get(configEntry.source.name);
                        break;
                    case "field":
                        logObject[configEntry.name] = res[configEntry.source.name];
                        break;
                    case "self":
                        selfReferences[configEntry.name] = configEntry.source.name;
                        break;
                    case "time":
                        if (configEntry.source.post != null)
                            logObject[configEntry.name] = configEntry.source.post(req, res, logObject);
                        break;
                    case "special":
                        fallbacks[configEntry.name] = configEntry.fallback;
                        break;
                }

                core.handleConfigDefaults(configEntry, logObject, fallbacks);
            }

            for (var key in fallbacks) {
                logObject[key] = fallbacks[key](req, res, logObject);
            }

            for (var key in selfReferences) {
                logObject[key] = logObject[selfReferences[key]];
            }

            //override values with predefined values
            core.writeStaticFields(logObject);

            // Replace all set fields, which are marked to be reduced, with a placeholder (defined in log-core.js)
            core.reduceFields(postConfig, logObject);

            core.sendLog('info', logObject, req.dynamicLogLevel);
            logSent = true;
        }
    };

    next();
};

// Logs message and custom fields
var logMessage = function () {
    core.logMessage.apply(this, arguments);
};

var setLogPattern = function (pattern) {
    core.setLogPattern(pattern);
};

// Provides a context object, which allows message logging and uses correlationId from its parent request.
var getCorrelationObject = function () {
    return core.getCorrelationObject();
}

var overrideField = function (field, value) {
    return core.overrideField(field, value);
}

exports.overrideField = overrideField;
exports.setCoreLogger = setCoreLogger;
exports.setLoggingLevel = setLoggingLevel;
exports.logNetwork = logNetwork;
exports.logMessage = logMessage;
exports.setLogPattern = setLogPattern;
exports.getCorrelationObject = getCorrelationObject;
exports.overrideField = overrideField;
exports.setConfig = setConfig;