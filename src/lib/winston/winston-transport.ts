const Transport = require("winston-transport");
const { SPLAT } = require("triple-beam");

const CfNodejsLoggingSupportLogger = class CfNodejsLoggingSupportLogger extends Transport {
    constructor(options: any) {
        super(options);
        this.name = "CfNodejsLoggingSupportLogger";
        this.level = options.level || "info";
        this.logMessage = options.logMessage;
    }

    log(info: any, callback: any) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        if (info[SPLAT]) {
            this.logMessage.apply(this, [info.level, info.message, ...info[SPLAT]]);
        } else {
            this.logMessage(info.level, info.message);
        }

        callback();
    }
};

export default function createTransport(options: any) {
    return new CfNodejsLoggingSupportLogger(options);
};
