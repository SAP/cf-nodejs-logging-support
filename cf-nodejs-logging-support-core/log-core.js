var util = require('util');
var os = require('os');
var uuid = require('uuid/v4');

const nsPerSec = 1e9;
const logType = "log";
const loggingLevels = {
    'error': 0,
    'warn': 1,
    'info': 2,
    'verbose': 3,
    'debug': 4,
    'silly': 5
};

var fixedValues = {};
var initDummy = null;
var logLevelInt = 2;
var pattern = null;
var stdout = process.stdout;
var patternDivider = /((?:\{\{)([^\}\{]+)(?:\}\}))/g;
var uuidCheck = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}/;
var prelogconfig =[];
var postlogconfig =[];

var setConfig = function (config) {
    precompileConfig(config);
}

var precompileConfig = function(config) {
    var coreConfig = [];
    for(var i = 0; i < config.length; i++) {
        var obj = config[i];
        if(obj.core){
            coreConfig.push(obj);
        } else if (obj.source.parent != null && obj.source.parent.equals("req")) {
            postlogconfig.push(obj);
        } else {
            prelogconfig.push(obj);
        }
    }
}

var getPreLogConfig = function() {
    return prelogconfig;
}

var getPostLogConfig = function() {
    return postlogconfig;
}

// Stringify and log given object to console. If a custom pattern is set, the referenced object fields are used to replace the references.
var writeLogToConsole = function (logObject) {
    var output = "";
    if (null != pattern) {
        if (undefined !== logObject && logObject != null) {
            output = "";
            var rest = pattern.split(patternDivider);
            var value;
            //iterates over split custom pattern, where n%3=0 is text outside the marked fields and n%3=2 are the fields to be replaced (inside {{}}), n elem rest.
            for (i = 0; i < (rest.length - 1) / 3; i++) {
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
        output = (undefined !== logObject && validObject(logObject)) ? JSON.stringify(logObject) : '';
    }

    stdout.write(output + os.EOL);
}

// Sets the minimum logging level. Messages with a lower level will not be forwarded. (Levels: error, warn, info, verbose, debug, silly)
var setLoggingLevel = function (level) {
    if (loggingLevels[level] != undefined) {
        logLevelInt = loggingLevels[level];
        return true;
    }
    return false
}
// Gets the minimum logging level. (Levels: error, warn, info, verbose, debug, silly)
var getLoggingLevel = function () {
    for (var key in loggingLevels) {
        if (loggingLevels[key] == logLevelInt) {
            return key;
        }
    }
};

// Initializes an empty log object
var initLog = function () {

    var time = process.hrtime();
    var logObject = {};
    if (initDummy == null) {
        logObject = prepareInitDummy();
        initDummy = JSON.stringify(logObject);
    } else {
        logObject = JSON.parse(initDummy);
    }

    logObject.written_at = (new Date()).toJSON();
    logObject.written_ts = time[0] * nsPerSec + time[1];

    return logObject;

};

var prepareInitDummy = function () {
    var obj = {};
    var vcapEnvironment = ("VCAP_APPLICATION" in process.env) ? JSON.parse(process.env.VCAP_APPLICATION) : {};

    obj.component_type = "application";
    obj.component_id = !("application_id" in vcapEnvironment) ? "-" : vcapEnvironment.application_id;
    obj.component_name = !("application_name" in vcapEnvironment) ? "-" : vcapEnvironment.application_name;
    obj.component_instance = !("instance_index" in vcapEnvironment) ? "0" : vcapEnvironment.instance_index.toString();
    obj.source_instance = obj.component_instance;

    obj.layer = "[NODEJS]";

    obj.organisation_id = "-";
    obj.organisation_name = "-";

    obj.space_name = !("space_name" in vcapEnvironment) ? "-" : vcapEnvironment.space_name;
    obj.space_id = !("space_id" in vcapEnvironment) ? "-" : vcapEnvironment.space_id;

    obj.container_id = !("CF_INSTANCE_IP" in process.env) ? "-" : process.env.CF_INSTANCE_IP;

    obj.logger = "nodejs-logger";
    return obj;
};

// Writes the given log file to stdout
var sendLog = function (level, logObject) {
    //Attach level to logobject
    logObject.level = level;

    // Write log to console
    if (logLevelInt >= loggingLevels[level]) {
        writeLogToConsole(logObject);
    }
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

    var level = args[0];
    if (logLevelInt < loggingLevels[level]) {
        return false;
    }
    var customFields = null;

    args.shift();

    if (typeof args[args.length - 1] === 'object') {
        if (validObject(args[args.length - 1])) {
            customFields = args[args.length - 1];
        }
        args.pop();
    }

    var msg = util.format.apply(util, args);

    var logObject = initLog();

    var req = this;
    if (req.logObject != null) {
        logObject.correlation_id = req.logObject.correlation_id;
        if (req.logObject.request_id != null) {
            logObject.request_id = req.logObject.request_id;
        }
    }

    logObject.msg = msg;

    logObject.type = logType;

    if (customFields != null) {
        for (var key in customFields) {
            if (!((typeof customFields[key]) == "string")) {
                customFields[key] = JSON.stringify(customFields[key]);
            }
        }
        logObject.custom_fields = customFields;
    }

    sendLog(level, logObject);
    return true;
};

//getCorrelationId returns the current correlation id for the req this is called on
var getCorrelationId = function () {
    var req = this;
    if (req.logObject != null) {
        if (req.logObject.correlation_id != null) {
            return req.logObject.correlation_id;
        }
    }
    return null;
};

//setCorrelationId sets the Correlation_id for the request this is called on. Checks i the id is a correct uuid-v4. Returns true if set, false otherwise
var setCorrelationId = function (correlationId) {
    var req = this;
    if (req.logObject != null) {
        if (uuidCheck.exec(correlationId)) {
            req.logObject.correlation_id = correlationId;
            return true;
        }
    }
    return false;
}

var bindLogFunctions = function (req) {
    req.logMessage = logMessage;
    req.getCorrelationId = getCorrelationId;
    req.setCorrelationId = setCorrelationId;
    req.getCorrelationObject = getCorrelationObject;
}

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

var getCorrelationObject = function () {
    var context = this;
    var newContext = {};
    newContext.logObject = {};
    if (context.logObject != null) {
        newContext.logObject.correlation_id = context.logObject.correlation_id;
    } else {
        newContext.logObject.correlation_id = uuid();
    }
    bindLogFunctions(newContext);
    return newContext;

}

var writeStaticFields = function (logObject) {
    for (var key in fixedValues) {
        logObject[key] = fixedValues[key];
    }
}

// overrides Values in ALL Network logs (will impact log parsing, so use with caution!), returns true if field is set.
var overrideField = function (field, value) {
    if (field != null && typeof field == "string") {
        if (value == undefined || value == null) {
            fixedValues[field] = null;
            return true;
        } else {
            fixedValues[field] = value;
            return true;
        }
    }
    return false;
}

exports.overrideField = overrideField;
exports.writeStaticFields = writeStaticFields;
exports.setLoggingLevel = setLoggingLevel;
exports.getLoggingLevel = getLoggingLevel;
exports.initLog = initLog;
exports.sendLog = sendLog;
exports.logMessage = logMessage;
exports.validObject = validObject;
exports.setLogPattern = setLogPattern;
exports.bindLogFunctions = bindLogFunctions;
exports.getCorrelationObject = getCorrelationObject;