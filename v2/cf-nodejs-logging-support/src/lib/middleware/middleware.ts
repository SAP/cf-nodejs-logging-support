import LevelUtils from "../logger/level-utils";
import RecordFactory from "../logger/record-factory";
import ResponseAccessor from "./response-accessor";
import RootLogger from "../logger/root-logger";

export default class Middleware {

    static logNetwork(_req: any, _res: any, next?: any) {
        let logSent = false;

        const networkLogger = RootLogger.getInstance().createLogger();
        networkLogger.initContext(_req);
        _req.logger = networkLogger;

        const finishLog = () => {

            if (!logSent) {
                const record = RecordFactory.buildReqRecord(_req, _res);
                const level = LevelUtils.getLevel(record.level);
                const loggingLevelThreshold = LevelUtils.getLevel(_req.logger.getLoggingLevel());
                if (LevelUtils.isLevelEnabled(loggingLevelThreshold, level)) {
                    const res = ResponseAccessor.getInstance();
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
