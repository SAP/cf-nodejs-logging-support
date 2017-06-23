var winston = require("winston");

var core;

var setCoreLogger = function (coreLogger) {
    core = coreLogger;
};

// Customized transport, which specifies the correct logging format and logs to stdout
var winstonTransport = new(winston.transports.Console)({
    timestamp: function () {
        return Date.now();
    },
    level: "info",
    formatter: function (options) {
        // Return string will be passed to winston logger.
        var logObject = {};
        var time = process.hrtime();

        core.initLog(logObject, time);
        if (options != null) {
            if (options.level != null) {
                logObject.level = options.level;
            }
            logObject.msg = (undefined !== options.message ? options.message : '');

            logObject.type = "log";

            if (core.validObject(options.meta)) {
                logObject.custom_fields = options.meta;
            }
        }
        return JSON.stringify(logObject);
    }
});

exports.setCoreLogger = setCoreLogger;
exports.winstonTransport = winstonTransport;
