var core;

var setCoreLogger = function (coreLogger) {
    core = coreLogger;
};
var getWinstonTransport = function () {
    var winston;
    try {
        winston = require("winston");
    } catch (e) {
        return null
    }
    var winstonTransport = new(winston.transports.Console)({
        timestamp: function () {
            return Date.now();
        },
        level: "info",
        formatter: function (options) {
            // Return string will be passed to winston logger.
            var logObject = core.initLog();
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
    return winstonTransport;
}

exports.setCoreLogger = setCoreLogger;
exports.getWinstonTransport = getWinstonTransport;