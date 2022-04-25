// import ExpressService from './framework-services/express';
// import HttpService from './framework-services/plainhttp';
// import RestifyService from './framework-services/restify';
// import ConnectService from './framework-services/connect';

import LevelUtils from "../logger/level-utils";
import RecordFactory from "../logger/record-factory";
import RecordWriter from "../logger/record-writer";
import RequestAccesor from "./request-accesor";
import ResponseAccesor from "./response-accessor";
import RootLogger from "../logger/root-logger";

interface IMiddleware {
    //logNetwork: (req: any, res: any, next?: any) => void
}

export default class Middleware implements IMiddleware {

    constructor() {
    }

    static logNetwork(_req: any, _res: any, next?: any) {
        let logSent = false;

        let req = RequestAccesor.getInstance();

        _req.logger = RootLogger.getInstance().createLogger();

        let record = RecordFactory.buildReqRecord(_req);

        req.bindDynLogLevel();

        let res = ResponseAccesor.getInstance();

        const finishLog = () => {
            if (!logSent) {
                const level = LevelUtils.getLevel(record.level);
                const loggingLevelThreshold = LevelUtils.getLevel(_req.logger.getLoggingLevel());
                if (LevelUtils.isLevelEnabled(loggingLevelThreshold, level)) {
                    res.finishLog(record);
                }
                logSent = true;
            }
        }

        _res.on("finish", finishLog);

        _res.on("header", finishLog);

        next ? next() : null;
    }
}
