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

    static logNetwork(_req: any, _res: any, next?: any) {
        let logSent = false;

        let req = new RequestAccesor(_req);

        let logObject = RecordFactory.buildReqRecord(req);

        req.bindDynLogLevel();

        const finishLog = () => {
            if (!logSent) {
                const loggingLevelThreshold = LevelUtils.getLevel(logObject.level);
                const level = LevelUtils.getLevel(req.logger.getLoggingLevel());
                if (LevelUtils.isLevelEnabled(loggingLevelThreshold, level)) {
                    RecordWriter.writeLog(logObject);
                }
                logSent = true;
            }
        }

        _res.on("finish", finishLog);

        _res.on("header", finishLog);

        next ? next() : null;
    }
}
