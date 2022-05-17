import LevelUtils from "../logger/level-utils";
import RecordFactory from "../logger/record-factory";
import ResponseAccessor from "./response-accessor";
import RootLogger from "../logger/root-logger";

export default class Middleware {

    static logNetwork(req: any, res: any, next?: any) {
        let logSent = false;

        const networkLogger = RootLogger.getInstance().createLogger();
        const context = networkLogger.initContext(req);
        req.logger = networkLogger;

        const finishLog = () => {

            if (!logSent) {
                const record = RecordFactory.buildReqRecord(req, res, context);
                const level = LevelUtils.getLevel(record.level);
                const loggingLevelThreshold = LevelUtils.getLevel(req.logger.getLoggingLevel());
                if (LevelUtils.isLevelEnabled(loggingLevelThreshold, level)) {
                    const res = ResponseAccessor.getInstance();
                    res.finishLog(record);
                }
                logSent = true;
            }
        }

        res.on("finish", finishLog);

        res.on("header", finishLog);

        next ? next() : null;
    }
}
