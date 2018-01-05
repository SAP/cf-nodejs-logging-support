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
    fallbacks = [];
    selfReferences = [];
    resDependent = [];
    for (var i = 0; i < config.length; i++) {
        switch (config[i].source.type) {
            case "header":
                logObject[config[i].name] = req.header(config[i].source.name);
                break;
            case "static":
                logObject[config[i].name] = config[i].source.value;
                break;
            case "field":
                logObject[config[i].name] = req[config[i].source.name];
                break;
            case "self":
                selfReferences[config[i].name] = config[i].source.name;
                break;
            case "resDep":
                if(config[i].source.pre != null)
                    logObject[config[i].name] = config[i].source.pre(req, res, logObject);
                else 
                    logObject[config[i].name] = "-1";
                resDependent[config[i].name] = config[i].source.post;
                break;
            case "special":
                fallbacks[config[i].name] = config[i].fallback;
                break;
        }
        if (config[i].mandatory && logObject[config[i].name] == null) {
            if (config[i].default != null) {
                logObject[config[i].name] = config[i].default;
            } else  {
                console.log("falling back for: " + config[i].name);
                fallbacks[config[i].name] = config[i].fallback;
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