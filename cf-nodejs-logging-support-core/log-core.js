var util = require("util");
var os = require("os");
var uuid = require("uuid/v4");
var jwt = require("jsonwebtoken");

const envDynLogHeader = "DYN_LOG_HEADER";
const envDynLogKey = "DYN_LOG_LEVEL_KEY";
const dynLogLevelDefaultHeader = "SAP-LOG-LEVEL";

const reductedPlaceholder = "redacted";

const nsPerSec = 1e9;

const logType = "log";
const loggingLevels = {
    "error": 0,
    "warn": 1,
    "info": 2,
    "verbose": 3,
    "debug": 4,
    "silly": 5
};
var logLevelInt = 2;
var convinientLogFunctions = [];
for (var key in loggingLevels) {
    convinientLogFunctions[key] = function (bKey) {
        return function () {
            var args = [bKey, ...arguments];
            logMessage.apply(this, args);
        };
    }(key);
}

var fixedValues = {};
var globalCustomFields = {};
var initDummy = "{}";
var pattern = null;
var stdout = process.stdout;
var patternDivider = /((?:\{\{)([^\}\{]+)(?:\}\}))/g;
var uuidCheck = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}/;

var preLogConfig = [];
var postLogConfig = [];

var dynLogLevelHeader = dynLogLevelDefaultHeader;
var dynLogLevelKey = null;

var customSinkFunc = null;


// Initializes the core logger, including setup of environment var defined settings
var init = function () {
    // Read dyn. log level header name from environment var
    var headerName = process.env[envDynLogHeader];
    if (headerName != null && headerName != "null" && headerName != "") {
        dynLogLevelHeader = headerName;
    } else {
        dynLogLevelHeader = dynLogLevelDefaultHeader;
    }

    // Read dyn log level key from environment var.
    dynLogLevelKey = process.env[envDynLogKey];
};

var setConfig = function (config) {
    precompileConfig(config);
};

var precompileConfig = function (config) {
    var coreConfig = [];
    preLogConfig = [];
    postLogConfig = [];

    for (var i = 0; i < config.length; i++) {
        var obj = config[i];

        // Check if config field needs a set env var to be enabled. If specified env var does not exist, the resulting log field will be replaced by reductedPlaceholder
        if (obj.envVarSwitch != null) {
            var val = process.env[obj.envVarSwitch];
            var pass = (val == "true" || val == "True" || val == "TRUE");
            if (!pass) {
                obj.reduce = true;
            }
        }

        if (obj.core) {
            coreConfig.push(obj);
        } else if (obj.source.type == "time") {
            if (obj.source.pre)
                preLogConfig.push(obj);
            if (obj.source.post)
                postLogConfig.push(obj);
            if (!obj.source.pre && !obj.source.post) {
                obj.source.type = "static";
                obj.source.value = -1;
                preLogConfig.push(obj);
            }
        } else if ((obj.source.parent != null && obj.source.parent == "res")) {
            postLogConfig.push(obj);
        } else {
            preLogConfig.push(obj);
        }
    }

    var logObject = prepareInitDummy(coreConfig);
    initDummy = JSON.stringify(logObject);
};

var getPreLogConfig = function () {
    return preLogConfig;
};

var getPostLogConfig = function () {
    return postLogConfig;
};

var handleConfigDefaults = function (configEntry, logObject, fallbacks) {
    if (configEntry.mandatory && logObject[configEntry.name] == null) {
        if (configEntry.default != null) {
            logObject[configEntry.name] = configEntry.default;
        } else {
            fallbacks[configEntry.name] = configEntry.fallback;
        }
    }
};

// Replace all fields, which are marked to be reduced and do not equal to their default value, empty or "-", to reductedPlaceholder.
var reduceFields = function (config, logObject) {
    for (var i = 0; i < config.length; i++) {
        var configEntry = config[i];

        if (configEntry.reduce) {
            var value = logObject[configEntry.name];
            var defaultValue = configEntry.default != null ? configEntry.default : "-";
            if (value == null || value == "" || value == defaultValue) {
                continue;
            }
            logObject[configEntry.name] = reductedPlaceholder;
        }
    }
};

// Stringify and log given object to console. If a custom pattern is set, the referenced object fields are used to replace the references.
var writeLogToConsole = function (logObject) {
    var output = "";
    var level = "";
    if (pattern != null) {
        if (logObject !== undefined && logObject != null) {
            output = "";
            level = logObject.level;

            var rest = pattern.split(patternDivider);
            var value;
            //iterates over split custom pattern, where n%3=0 is text outside the marked fields and n%3=2 are the fields to be replaced (inside {{}}), n elem rest.
            for (var i = 0; i < (rest.length - 1) / 3; i++) {
                output += rest[i * 3];
                value = logObject[rest[2 + i * 3]];
                if (value != null) {
                    if (typeof value == "string") {
                        output += value;
                    } else {
                        output += JSON.stringify(value);
                    }
                }

            }
            output += rest[rest.length - 1];
        }
    } else {
        if (logObject !== undefined && validObject(logObject)) {
            output = JSON.stringify(logObject);
            level = logObject.level;
        }
    }

    if (customSinkFunc) {
        // call custom sink function
        customSinkFunc(level, output);
    } else {
        // default to stdout
        stdout.write(output + os.EOL);
    }
};

// Sets the minimum logging level. Messages with a lower level will not be forwarded. (Levels: error, warn, info, verbose, debug, silly)
var setLoggingLevel = function (level) {
    if (loggingLevels[level] != undefined) {
        logLevelInt = loggingLevels[level];
        return true;
    }
    return false;
};

// Gets the minimum logging level. (Levels: error, warn, info, verbose, debug, silly)
var getLoggingLevel = function () {
    for (var key in loggingLevels) {
        if (loggingLevels[key] == logLevelInt) {
            return key;
        }
    }
};

// Sets the given function as log sink. Following arguments will be passed to the sink function: level, output
var setSinkFunction = function (f) {
    if (f && typeof f === "function") {
        customSinkFunc = f;
    } else {
        customSinkFunc = null;
    }
};

// Initializes an empty log object
var initLog = function () {

    var time = process.hrtime();
    var logObject = JSON.parse(initDummy);

    logObject.written_at = (new Date()).toJSON();
    logObject.written_ts = time[0] * nsPerSec + time[1];

    return logObject;

};

var prepareInitDummy = function (coreConfig) {
    var obj = {};
    var fallbacks = [];
    var selfReferences = [];
    var configEntry;

    for (var i = 0; i < coreConfig.length; i++) {
        configEntry = coreConfig[i];
        switch (configEntry.source.type) {
            case "env":
                obj[configEntry.name] = process.env[configEntry.source.name];
                break;
            case "nested-env":
                obj[configEntry.name] = resolveNestedVariable(process.env, configEntry.source.path.slice());
                break;
            case "static":
                obj[configEntry.name] = configEntry.source.value;
                break;
            case "self":
                selfReferences[configEntry.name] = configEntry.source.name;
                break;
        }
        handleConfigDefaults(configEntry, obj, fallbacks);
    }

    for (var kFallback in fallbacks) {
        obj[kFallback] = fallbacks[kFallback](obj);
    }

    for (var kSelfReference in selfReferences) {
        obj[kSelfReference] = obj[selfReferences[kSelfReference]];
    }

    reduceFields(coreConfig, obj);
    return obj;
};

// Resolves a path to a variable in a structure of objects to its value. Parts of the object hierarchy that are represented as strings will be parsed.
var resolveNestedVariable = function (root, path) {

    // return, if path is empty.
    if (path == null || path.length == 0) {
        return null;
    }

    var rootObj;

    // if root is a string => parse it to an object. Otherwise => use it directly as object.
    if (typeof root === "string") {
        rootObj = JSON.parse(root);
    } else if (typeof root === "object") {
        rootObj = root;
    } else {
        return null;
    }

    // get value from root object
    var value = rootObj[path[0]];

    // cut first entry of the object path
    path.shift();

    // if the path is not empty, recursively resolve the remaining waypoints.
    if (path.length >= 1) {
        return resolveNestedVariable(value, path);
    }

    // return the resolved value, if path is empty.
    return value;
};

var checkLoggingLevel = function (level, dynamicLogLevel) {
    var threshold;

    if (dynamicLogLevel != null) {
        threshold = dynamicLogLevel; // use dynamic log level
    } else {
        threshold = logLevelInt; // use global log level
    }
    return (threshold >= loggingLevels[level]);
};

// Writes the given log file to stdout
var sendLog = function (logObject) {
    writeLogToConsole(logObject);
};

var setLogPattern = function (p) {
    pattern = p;
};

// Logs message and custom fields
//
// Simple
// logMessage("info", "Hello World"); >> ... "msg":"Hello World" ...
//
// With addtional numeric value
// logMessage("info", "Listening on port %d", 5000); >> ... "msg":"Listening on port 5000" ...
//
// With additional string values
// logMessage("info", "This %s a %s", "is", "test"); >> ... "msg":"This is a test" ...
//
// With custom fields (Added to custom_fields field) 
// logMessage("info", "Test data %j", {"field" :"value"}); >> ... "msg":"Test data %j" ... "custom_fields": {"field": "value"} ...
//
// With json object embedded in the message (nothing will be added to custom_fields)
// logMessage("info", "Test data %j", {"field" :"value"}, null); >> ... "msg":"Test data {\"field\": \"value\"}" ...
var logMessage = function () {
    var args = Array.prototype.slice.call(arguments);

    var logObject;
    var level = args[0];

    if (!checkLoggingLevel(level, this.dynamicLogLevel)) {
        return false;
    } else {
        logObject = initLog();
        logObject.level = level;
    }

    args.shift();


    var customFieldsFromArgs = {};
    if (typeof args[args.length - 1] === "object") {
        if (validObject(args[args.length - 1])) {
            customFieldsFromArgs = args[args.length - 1];
        }
        args.pop();
    }

    var msg = util.format.apply(util, args);

    var logger = this;

    if (logger.logObject != null) {
        logObject.correlation_id = logger.logObject.correlation_id;
        if (logger.logObject.tenant_id != null) {
            logObject.tenant_id = logger.logObject.tenant_id;
        }
        if (logger.logObject.request_id != null) {
            logObject.request_id = logger.logObject.request_id;
        }
    }


    logObject.msg = msg;
    logObject.type = logType;

    writeCustomFields(logObject, logger, customFieldsFromArgs);

    sendLog(logObject);
    return true;
};

var writeCustomFields = function(logObject, logger, additionalFields) {
    var fieldsFromLogger = extractCustomFieldsFromLogger(logger);
    var customFields = Object.assign({}, fieldsFromLogger, additionalFields);

    if (Object.keys(customFields).length > 0) {
        logObject.custom_fields = {};
        for (var key in customFields) {
            if ((typeof customFields[key]) == "string") {
                logObject.custom_fields[key] = customFields[key];
            } else {
                logObject.custom_fields[key] = JSON.stringify(customFields[key]);
            }
        }
    }

}

var extractCustomFieldsFromLogger = function(logger) {
    var fields = {};

    if (logger.parent) {
        fields = extractCustomFieldsFromLogger(logger.parent);
    } else {
        fields = globalCustomFields;
    }

    if (validObject(logger.customFields)) {
        fields = Object.assign(fields, logger.customFields);
    }

    return fields;
}


//getCorrelationId returns the current correlation id for the req this is called on
var getCorrelationId = function () {
    var logger = this;
    if (logger.logObject != null) {
        if (logger.logObject.correlation_id != null) {
            return logger.logObject.correlation_id;
        }
    }
    return null;
};

//setCorrelationId sets the Correlation_id for the request this is called on. Checks i the id is a correct uuid-v4. Returns true if set, false otherwise
var setCorrelationId = function (correlationId) {
    var logger = this;
    if (logger.logObject != null) {
        if (uuidCheck.exec(correlationId)) {
            logger.logObject.correlation_id = correlationId;
            return true;
        }
    }
    return false;
};

// setCustomFields sets custom fields, which will be added to each message logged using the corresponding context.
var setCustomFields = function (customFields) {
    var logger = this;
    if (validObject(customFields)) {
        if (logger.logObject != null) {
            logger.customFields = customFields;
        } else {
            globalCustomFields = customFields;
        }
        return true;
    }
    return false;
};

// Sets the dynamic log level to the given level
var setDynamicLoggingLevel = function (levelName) {
    var logger = this;
    logger.dynamicLogLevel = getLogLevelFromName(levelName);
};

var bindLoggerToReq = function (req, logObject) {
    req.logger = {
        logObject: logObject,
        customFields: {}
    };

    bindLogFunctions(req.logger);
    bindConvenienceMethods(req.logger);

    req.getLogger = function() {
        return this.logger;
    };

    req.createLogger = function(customFields) {
        return req.logger.createLogger(customFields)
    };
};

var bindLogFunctionsToCorrelationObj = function (logObj) {
    bindConvenienceMethods(logObj);
    bindLogFunctions(logObj);
};

var bindLogFunctions = function (logObj) {
    logObj.logMessage = logMessage;
    logObj.getCorrelationId = getCorrelationId;
    logObj.setCorrelationId = setCorrelationId;
    logObj.setDynamicLoggingLevel = setDynamicLoggingLevel;
    logObj.setCustomFields = setCustomFields;
    logObj.createLogger = createLogger;
};

var bindConvenienceMethods = function (logObj) {
    for (var key in convinientLogFunctions) {
        logObj[key] = convinientLogFunctions[key];
    }
};

var createLogger = function (customFields) {
    var logger = {};

    if (this.logObject != null) {
        logger.logObject = this.logObject;
        logger.customFields = {};
        logger.parent = this;
    } else {
        logger.logObject = {
            correlation_id: uuid()
        };
        logger.customFields = {};
    }

    bindLogFunctionsToCorrelationObj(logger);

    if (customFields) {
        logger.setCustomFields(customFields);
    }

    return logger;
};

var validObject = function (obj) {
    if (obj === null || obj === undefined) {
        return false;
    } else if (Object.keys(obj).length === 0 && obj.constructor === Object) {
        return false;
    } else if (typeof obj !== "object") {
        return false;
    }
    return true;
};

var writeStaticFields = function (logObject) {
    for (var key in fixedValues) {
        logObject[key] = fixedValues[key];
    }
};

// overrides Values in ALL Network logs (will impact log parsing, so use with caution!), returns true if field is set.
var overrideField = function (field, value) {
    if (field != null && typeof field == "string") {
        if (value == undefined || value == null) {
            fixedValues[field] = undefined;
            return true;
        } else {
            fixedValues[field] = value;
            return true;
        }
    }
    return false;
};

// Get the name of the dynamic log level header
var getDynLogLevelHeaderName = function () {
    return dynLogLevelHeader;
};

// Gets the log level number from a given level name
var getLogLevelFromName = function (levelName) {
    if (levelName == null) return null;
    return (loggingLevels[levelName.toLowerCase()] != undefined) ? loggingLevels[levelName.toLowerCase()] : null;
};

// Binds the Loglevel extracted from JWT token to the given request logger
var bindDynLogLevel = function (token, logger) {
    var payload = verifyAndDecodeJWT(token, dynLogLevelKey);

    if (payload) {
        logger.dynamicLogLevel = getLogLevelFromName(payload.level);
    }
};

// Verifies the given JWT and returns its payload.
var verifyAndDecodeJWT = function (token, key) {
    if (key == null || !token) {
        return null; // no public key or jwt provided
    }

    try {
        if (key.match(/BEGIN PUBLIC KEY/))
            return jwt.verify(token, key, { algorithms: ["RS256", "RS384", "RS512"] });
        else
            return jwt.verify(token, "-----BEGIN PUBLIC KEY-----\n" + key + "\n-----END PUBLIC KEY-----", { algorithms: ["RS256", "RS384", "RS512"] });
    } catch (err) {
        return null; // token expired or invalid
    }
};

exports.checkLoggingLevel = checkLoggingLevel;
exports.init = init;
exports.overrideField = overrideField;
exports.writeStaticFields = writeStaticFields;
exports.reduceFields = reduceFields;
exports.setLoggingLevel = setLoggingLevel;
exports.getLoggingLevel = getLoggingLevel;
exports.initLog = initLog;
exports.sendLog = sendLog;
exports.logMessage = logMessage;
exports.validObject = validObject;
exports.setLogPattern = setLogPattern;
exports.bindLoggerToReq = bindLoggerToReq;
exports.createLogger = createLogger;
exports.setConfig = setConfig;
exports.setCustomFields = setCustomFields;
exports.getPostLogConfig = getPostLogConfig;
exports.getPreLogConfig = getPreLogConfig;
exports.handleConfigDefaults = handleConfigDefaults;
exports.getDynLogLevelHeaderName = getDynLogLevelHeaderName;
exports.bindDynLogLevel = bindDynLogLevel;
exports.bindConvenienceMethods = bindConvenienceMethods;
exports.setSinkFunction = setSinkFunction;
exports.writeCustomFields = writeCustomFields;