// import ExpressService from './framework-services/express';
// import HttpService from './framework-services/plainhttp';
// import RestifyService from './framework-services/restify';
// import ConnectService from './framework-services/connect';

import LevelUtils from "../logger/level-utils";
import RecordFactory from "../logger/record-factory";
import RecordWriter from "../logger/record-writer";
import RequestAccesor from "./request-accesor";

interface IMiddleware {
    //logNetwork: (req: any, res: any, next?: any) => void
}

export default class Middleware implements IMiddleware {

    constructor() {
    }

    logNetwork(_networkLogger: any, _req: any, _res: any, next?: any) {
        let logSent = false;

        // implement RequestAccesor als singleton
        let req = RequestAccesor.getInstance();

        let record = RecordFactory.buildReqRecord(req);

        req.bindDynLogLevel();

        const finishLog = () => {
            if (!logSent) {
                const level = LevelUtils.getLevel(record.level);
                const loggingLevelThreshold = LevelUtils.getLevel(req.logger.getLoggingLevel());
                if (LevelUtils.isLevelEnabled(loggingLevelThreshold, level)) {
                    RecordWriter.writeLog(record);
                }
                logSent = true;
            }
        }

        _res.on("finish", finishLog);

        _res.on("header", finishLog);

        next ? next() : null;
    }
}
