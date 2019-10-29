const util = require("util");
const os = require("os");
const uuid = require("uuid/v4");
const jwt = require("jsonwebtoken");

const ENV_DYN_LOG_HEADER = "DYN_LOG_HEADER";
const ENV_DYN_LOG_KEY = "DYN_LOG_LEVEL_KEY";
const DEFAULT_DYN_LOG_LEVEL_HEADER = "SAP-LOG-LEVEL";

const REDUCED_PLACEHOLDER = "redacted";

const NS_PER_SEC = 1e9;

const LOG_TYPE = "log";
const LOGGING_LEVELS = {
    "error": 0,
    "warn": 1,
    "info": 2,
    "verbose": 3,
    "debug": 4,
    "silly": 5
};

var logLevelInt = 2;

var initDummy = "{}";

var fixedValues = {};
var globalCustomFields = {};

var pattern = null;
var patternDivider = /((?:\{\{)([^\}\{]+)(?:\}\}))/g;
var stdout = process.stdout;
var uuidCheck = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}/;

var preLogConfig = [];
var postLogConfig = [];

var dynLogLevelHeader;
var dynLogLevelKey;

var customSinkFunc;
var convenientLogFunctions = [];


// Initializes the core logger, including setup of environment var defined settings
var init = function () {
    // Read dyn. log level header name from environment var
    var headerName = process.env[ENV_DYN_LOG_HEADER];
    if (headerName != null && headerName != "null" && headerName != "") {
        dynLogLevelHeader = headerName;
    } else {
        dynLogLevelHeader = DEFAULT_DYN_LOG_LEVEL_HEADER;
    }

    // Read dyn log level key from environment var.
    dynLogLevelKey = process.env[ENV_DYN_LOG_KEY];

    // initialize convenient log level functions (e.g. log.info(...))
    for (var key in LOGGING_LEVELS) {
        convenientLogFunctions[key] = function (bKey) {
            return function () {
                var args = [bKey, ...arguments];
                logMessage.apply(this, args);
            };
        }(key);
    }
};

var setConfig = function (config) {
    precompileConfig(config);
};


// Seperate core configuration (processed once, included in network and message logs) and
// pre and post configuration (processed before and after request handling)
var precompileConfig = function (config) {
    var coreConfig = [];
    preLogConfig = [];
    postLogConfig = [];

    for (var i = 0; i < config.length; i++) {
        var obj = config[i];

        // Check if config field needs a set env var to be enabled. If specified env var does not exist, the resulting log field will be replaced by REDUCED_PLACEHOLDER
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

// Configuration values, which result in log fields (processed before request handling)
var getPreLogConfig = function () {
    return preLogConfig;
};

// Configuration values, which result in log fields (processed after request handling)
var getPostLogConfig = function () {
    return postLogConfig;
};

// Assigns default values to empty fields, if defined, OR adds a reference to a configured fallback
// method otherwise.
var handleConfigDefaults = function (configEntry, logObject, fallbacks) {
    if (configEntry.mandatory && logObject[configEntry.name] == null) {
        if (configEntry.default != null) {
            logObject[configEntry.name] = configEntry.default;
        } else {
            fallbacks[configEntry.name] = configEntry.fallback;
        }
    }
};

// Replaces all fields, which are marked to be reduced and do not equal to their default value, empty or "-", to REDUCED_PLACEHOLDER.
var reduceFields = function (config, logObject) {
    for (var i = 0; i < config.length; i++) {
        var configEntry = config[i];

        if (configEntry.reduce) {
            var value = logObject[configEntry.name];
            var defaultValue = configEntry.default != null ? configEntry.default : "-";
            if (value == null || value == "" || value == defaultValue) {
                continue;
            }
            logObject[configEntry.name] = REDUCED_PLACEHOLDER;
        }
    }
};

// Stringifies and logs given object to console. If a custom pattern is set, the referenced object fields are used to replace the references.
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
        if (logObject !== undefined && isValidObject(logObject)) {
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
    if (LOGGING_LEVELS[level] != undefined) {
        logLevelInt = LOGGING_LEVELS[level];
        return true;
    }
    return false;
};

// Gets the minimum logging level. (Levels: error, warn, info, verbose, debug, silly)
var getLoggingLevel = function () {
    for (var key in LOGGING_LEVELS) {
        if (LOGGING_LEVELS[key] == logLevelInt) {
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
    logObject.written_ts = time[0] * NS_PER_SEC + time[1];

    return logObject;

};

// Creates a base log object, which contains all static and env var based fields.
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

// Checks wether the given level passes the global logging level threshold. If a dynamic log level threshold 
// is provided, it will be used instead of the global logging level threshold
var checkLoggingLevel = function (level, dynamicLogLevelInt) {
    var threshold;

    if (dynamicLogLevelInt != null) {
        threshold = dynamicLogLevelInt; // use dynamic log level
    } else {
        threshold = logLevelInt; // use global log level
    }
    return (threshold >= LOGGING_LEVELS[level]);
};

// Writes the given log file to stdout/sink
var sendLog = function (logObject) {
    writeLogToConsole(logObject);
};

// Sets a pattern, which is used to format the log output
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

    if (!checkLoggingLevel(level, this.dynamicLogLevelInt)) {
        return false;
    } else {
        logObject = initLog();
        logObject.level = level;
    }

    args.shift();


    var customFieldsFromArgs = {};
    if (typeof args[args.length - 1] === "object") {
        if (isValidObject(args[args.length - 1])) {
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
    logObject.type = LOG_TYPE;

    writeCustomFields(logObject, logger, customFieldsFromArgs);

    sendLog(logObject);
    return true;
};

// Read custom fields from provided logger and add them to the provided logObject.
// If additionalFields contains fields, that already exist, these fields will be overwritten.
var writeCustomFields = function (logObject, logger, additionalFields) {
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

// Recursive method, which reads provided custom fields from the given logger, its parent loggers
// and global custom fields variable, with descending priority
var extractCustomFieldsFromLogger = function (logger) {
    var fields = {};

    if (logger.parent) {
        fields = extractCustomFieldsFromLogger(logger.parent);
    } else {
        fields = Object.assign(fields, globalCustomFields);
    }

    if (isValidObject(logger.customFields)) {
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
    if (isValidObject(customFields)) {
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
    logger.dynamicLogLevelInt = getLogLevelFromName(levelName);
};

// Adds a logger instance to the provided request and assigns all required fields and api methods
var bindLoggerToRequest = function (req, logObject) {
    req.logger = {
        logObject: logObject,
        customFields: {}
    };

    bindLogFunctions(req.logger);
    bindConvenienceMethods(req.logger);

    req.getLogger = function () {
        return this.logger;
    };

    req.createLogger = function (customFields) {
        return this.logger.createLogger(customFields)
    };
};

// Add api methods to logger object
var bindLogFunctions = function (logger) {
    logger.logMessage = logMessage;
    logger.getCorrelationId = getCorrelationId;
    logger.setCorrelationId = setCorrelationId;
    logger.setDynamicLoggingLevel = setDynamicLoggingLevel;
    logger.setCustomFields = setCustomFields;
    logger.createLogger = createLogger;
};

// Add convenience methods to logger object
var bindConvenienceMethods = function (logger) {
    for (var key in convenientLogFunctions) {
        logger[key] = convenientLogFunctions[key];
    }
};

// Create a new logger for message logs
var createLogger = function (customFields) {
    var logger = {};

    // Check if the method was call on a logger instance
    if (this.logObject != null) {
        logger.customFields = {};

        // assign reference to logObject of parent logger
        logger.logObject = this.logObject;

        // assign parent (required to inherit custom fields)
        logger.parent = this;
    } else {
        logger.customFields = {};

        // create a new logObject including a correlation id and assign
        // it to the logger.
        logger.logObject = {
            correlation_id: uuid()
        };
    }

    // bind api functions
    bindConvenienceMethods(logger);
    bindLogFunctions(logger);

    // assign custom fields, if provided
    if (customFields) {
        logger.setCustomFields(customFields);
    }

    return logger;
};

// checks if the given argument is a non-empty instance of Object
var isValidObject = function (obj) {
    if (obj === null || obj === undefined) {
        return false;
    } else if (Object.keys(obj).length === 0 && obj.constructor === Object) {
        return false;
    } else if (typeof obj !== "object") {
        return false;
    }
    return true;
};

// writes static field values to the given logObject
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
    return (LOGGING_LEVELS[levelName.toLowerCase()] != undefined) ? LOGGING_LEVELS[levelName.toLowerCase()] : null;
};

// Binds the Loglevel extracted from JWT token to the given request logger
var bindDynLogLevel = function (token, logger) {
    var payload = verifyAndDecodeJWT(token, dynLogLevelKey);

    if (payload) {
        logger.dynamicLogLevelInt = getLogLevelFromName(payload.level);
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

// internal api methods used by effective loggers
exports.bindConvenienceMethods = bindConvenienceMethods;
exports.bindDynLogLevel = bindDynLogLevel;
exports.bindLoggerToRequest = bindLoggerToRequest;
exports.checkLoggingLevel = checkLoggingLevel;
exports.getDynLogLevelHeaderName = getDynLogLevelHeaderName;
exports.getPostLogConfig = getPostLogConfig;
exports.getPreLogConfig = getPreLogConfig;
exports.handleConfigDefaults = handleConfigDefaults;
exports.init = init;
exports.initLog = initLog;
exports.reduceFields = reduceFields;
exports.sendLog = sendLog;
exports.writeCustomFields = writeCustomFields;
exports.writeStaticFields = writeStaticFields;

// external api methods
exports.createLogger = createLogger;
exports.logMessage = logMessage;
exports.getLoggingLevel = getLoggingLevel;
exports.setConfig = setConfig;
exports.setCustomFields = setCustomFields;
exports.setLoggingLevel = setLoggingLevel;
exports.setLogPattern = setLogPattern;
exports.setSinkFunction = setSinkFunction;
exports.overrideField = overrideField;