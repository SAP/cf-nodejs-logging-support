// Log network activity for express applications

var uuid = require("uuid/v4");
var core;
var fixedValues = [];
var config = [];

var setCoreLogger = function (coreLogger) {
    core = coreLogger;
};

var setConfig = function (newConfig) {
    config = newConfig;
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
    if (res.get == null) {
        res.get = function () {
            return "";
        };
    }
    var fallbacks = [];
    var selfReferences = [];
    var resDependent = [];
    var configEntry;
    for (var i = 0; i < config.length; i++) {
        configEntry = config[i];

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
            case "resDep":
                if(configEntry.source.pre != null)
                    logObject[configEntry.name] = configEntry.source.pre(req, res, logObject);
                else 
                    logObject[configEntry.name] = "-1";
                resDependent[configEntry.name] = configEntry.source.post;
                break;
            case "special":
                fallbacks[configEntry.name] = configEntry.fallback;
                break;
        }
        if (configEntry.mandatory && logObject[configEntry.name] == null) {
            if (configEntry.default != null) {
                logObject[configEntry.name] = configEntry.default;
            } else  {
                console.log("falling back for: " + configEntry.name);
                fallbacks[configEntry.name] = configEntry.fallback;
            }

        }
    }
    for (var key in fallbacks) {
        logObject[key] = fallbacks[key](req, res, logObject);
    }
    for (var key in selfReferences) 
    {
        logObject[key] = logObject[selfReferences[key]];
    }

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

            for(var key in resDependent) {
                logObject[key] = resDependent[key](req, res, logObject);
            }

            //override values with predefined values
            core.writeStaticFields(logObject);
            core.sendLog('info', logObject);
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