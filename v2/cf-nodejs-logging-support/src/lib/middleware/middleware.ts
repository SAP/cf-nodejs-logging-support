import LevelUtils from "../logger/level-utils";
import RecordFactory from "../logger/record-factory";
import ResponseAccessor from "./response-accessor";
import RootLogger from "../logger/root-logger";
import { JWTService } from "../config/jwt-service";
import RequestAccessor from "./request-Accessor";

export default class Middleware {

    static logNetwork(req: any, res: any, next?: any) {
        let logSent = false;

        let networkLogger = RootLogger.getInstance().createLogger();
        let jwtService = JWTService.getInstance();
        const context = networkLogger.initContext(req);

        var dynLogLevelHeader = jwtService.getDynLogLevelHeaderName();
        var token = RequestAccessor.getInstance().getHeaderField(req, dynLogLevelHeader);
        if (token) {
            let dynLevel = jwtService.getDynLogLevel(token);
            if (dynLevel != null) {
                networkLogger.setLoggingLevel(dynLevel);
            }
        }
        req.logger = networkLogger;


        const finishLog = () => {

            if (!logSent) {
                const record = RecordFactory.getInstance().buildReqRecord(req, res, context);
                const reqLoggingLevel = LevelUtils.getLevel(record.level);
                const loggingLevelThreshold = LevelUtils.getLevel(req.logger.getLoggingLevel());
                if (LevelUtils.isLevelEnabled(loggingLevelThreshold, reqLoggingLevel)) {
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
