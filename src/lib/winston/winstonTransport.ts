import TripleBeam from 'triple-beam';
import TransportStream from 'winston-transport';

class CfNodejsLoggingSupportLogger extends TransportStream {

    logMessage: Function

    constructor(options: any) {
        super(options);
        this.level = options.level || "info";
        this.logMessage = options.logMessage;
    }

    log(info: any, callback: any) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        if (info[TripleBeam.SPLAT]) {
            this.logMessage.apply(this, [info.level, info.message, ...info[TripleBeam.SPLAT]]);
        } else {
            this.logMessage(info.level, info.message);
        }

        callback();
    }
}

export default function createTransport(options: any) {
    return new CfNodejsLoggingSupportLogger(options);
}
