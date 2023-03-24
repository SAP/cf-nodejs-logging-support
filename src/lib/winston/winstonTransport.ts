import TripleBeam from 'triple-beam';
import TransportStream from 'winston-transport';
import Logger from '../logger/logger';

class CfNodejsLoggingSupportLogger extends TransportStream {

    logger: Logger

    constructor(options: any) {
        super(options);
        this.level = options.level || "info";
        this.logger = options.rootLogger;
    }

    log(info: any, callback: () => void) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        if (info[TripleBeam.SPLAT]) {
            this.logger.logMessage.apply(this.logger, [info.level, info.message, ...info[TripleBeam.SPLAT]]);
        } else {
            this.logger.logMessage(info.level, info.message);
        }

        callback();
    }
}

export default function createTransport(options: any) {
    return new CfNodejsLoggingSupportLogger(options);
}
