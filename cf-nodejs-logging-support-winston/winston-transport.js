const Transport = require('winston-transport');
const { SPLAT } = require('triple-beam');

const CfNodejsLoggingSupportLogger = class CfNodejsLoggingSupportLogger extends Transport {
    constructor(options) {
        super(options);
        this.name = 'CfNodejsLoggingSupportLogger';
        this.level = options.level || 'info';
        this.coreLogger = options.coreLogger;
      }
    
    log(info) {
        if (!!info[SPLAT]) {
            this.coreLogger.logMessage.apply(this, [info.level, info.message, ...info[SPLAT]]);
        } else {
            this.coreLogger.logMessage(info.level, info.message);
        }
    }
}

exports.createTransport = function (options) {
    return new CfNodejsLoggingSupportLogger(options);
}