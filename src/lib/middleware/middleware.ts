import LevelUtils from "../helper/levelUtils";
import RecordFactory from "../logger/recordFactory";
import RootLogger from "../logger/rootLogger";
import { JWTService } from "../core/jwtService";
import RequestAccessor from "./requestAccessor";
import RecordWriter from "../logger/recordWriter";
import ReqContext from "../logger/requestContext";
import Logger from "../logger/logger";

export default class Middleware {

    static logNetwork(req: any, res: any, next?: any) {
        const reqReceivedAt = Date.now();
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
                const record = RecordFactory.getInstance().buildReqRecord(req, res, context, reqReceivedAt);
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
