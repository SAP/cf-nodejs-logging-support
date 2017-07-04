var winston = require("winston");
var util = require('util');
var initDummy = null;
const nsPerSec = 1e9;
const logType = "log";
var logLevelInt = 2;

var pattern = null;



// Customized transport, which specifies the correct logging format and logs to stdout
var consoleTransport = new(winston.transports.Console)({
    timestamp: function () {
        return Date.now();
    },
    level: "info",
    formatter: function (options) {
        // Return string will be passed to winston logger.
        if (null !== pattern) {
            if (undefined !== options.meta) {
                var output = pattern;

                for (var key in options.meta) {
                    if (typeof (options.meta[key]) === "object" && validObject(options.meta[key])) {
                        output = output.replace('{{' + key + '}}', JSON.stringify(options.meta[key]));
                    } else {
                        output = output.replace('{{' + key + '}}', options.meta[key]);
                    }
                }

                return output;
            }
            return "";
        } else {
            return (undefined !== options.meta && validObject(options.meta)) ? JSON.stringify(options.meta) : '';
        }
    }
});

var winstonLogger = new(winston.Logger)({
    transports: [consoleTransport]
});

// Sets the minimum logging level. Messages with a lower level will not be forwarded. (Levels: error, warn, info, verbose, debug, silly)
var setLoggingLevel = function (level) {
    consoleTransport.level = level;
    logLevelInt = winstonLogger.levels[level];
    console.log(winstonLogger.levels);
};

// Gets the minimum logging level. (Levels: error, warn, info, verbose, debug, silly)
var getLoggingLevel = function () {
    return consoleTransport.level;
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
    // Write log to console to be parsed by logstash
    winstonLogger.log(level, '', logObject);
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
    if (logLevelInt < winstonLogger.levels[level]) {
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
        logObject.request_id = req.logObject.request_id;
    }

    logObject.msg = msg;

    logObject.type = logType;

    if (customFields != null) {
        for (var key in customFields) {
            if(!((typeof customFields[key]) == "string")) {
                customFields[key] = JSON.stringify(customFields[key]);
            }
        }
        logObject.custom_fields = customFields;
    }

    sendLog(level, logObject);
    return true;
};

var getCorrelationId = function () {
    var req = this;
    if (req.logObject != null) {
        if (req.logObject.correlation_id != null) {
            return req.logObject.correlation_id;
        }
    }
    return null;
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


exports.setLoggingLevel = setLoggingLevel;
exports.getLoggingLevel = getLoggingLevel;
exports.initLog = initLog;
exports.sendLog = sendLog;
exports.logMessage = logMessage;
exports.validObject = validObject;
exports.getCorrelationId = getCorrelationId;
exports.setLogPattern = setLogPattern;
