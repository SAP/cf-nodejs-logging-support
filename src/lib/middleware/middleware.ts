import LevelUtils from "../logger/level-utils";
import RecordFactory from "../logger/record-factory";
import RootLogger from "../logger/root-logger";
import { JWTService } from "../config/jwt-service";
import RequestAccessor from "./request-Accessor";
import RecordWriter from "../logger/record-writer";
import ReqContext from "../logger/context";
import Logger from "../logger/logger";

export default class Middleware {

    static logNetwork(req: any, res: any, next?: any) {
        let logSent = false;

        const context = new ReqContext(req);
        const parent = RootLogger.getInstance();
        // initialize Logger with parent to set registered fields
        let networkLogger = new Logger(parent, context);
        let jwtService = JWTService.getInstance();

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
                    RecordWriter.getInstance().writeLog(record);
                }
                logSent = true;
            }
        }

        res.on("finish", finishLog);

        res.on("header", finishLog);

        next ? next() : null;
    }
}
