import JWTService from '../helper/jwtService';
import LevelUtils from '../helper/levelUtils';
import Logger from '../logger/logger';
import RecordFactory from '../logger/recordFactory';
import RecordWriter from '../logger/recordWriter';
import Context from '../logger/context';
import RootLogger from '../logger/rootLogger';
import RequestAccessor from './requestAccessor';
import Config from '../config/config';

export default class Middleware {

    static logNetwork(req: any, res: any, next?: any) {
        let logSent = false;

        const context = new Context(req);
        const parentLogger = RootLogger.getInstance();
        const reqReceivedAt = Date.now();

        // initialize Logger with parent to set registered fields
        const networkLogger = new Logger(parentLogger, context);
        const jwtService = JWTService.getInstance();
        
        const dynLogLevelHeader = jwtService.getDynLogLevelHeaderName();
        const token = RequestAccessor.getInstance().getHeaderField(req, dynLogLevelHeader);
        if (token) {
            const dynLevel = jwtService.getDynLogLevel(token);
            if (dynLevel != null) {
                networkLogger.setLoggingLevel(dynLevel);
            }
        }
        req.logger = networkLogger;
        req._receivedAt = reqReceivedAt;

        const finishLog = () => {
            if (!logSent) {
                res._sentAt = Date.now()
                const levelName = Config.getInstance().getReqLoggingLevel()
                const level = LevelUtils.getLevel(levelName);
                const threshold = LevelUtils.getLevel(req.logger.getLoggingLevel());
                if (LevelUtils.isLevelEnabled(threshold, level)) {
                    const record = RecordFactory.getInstance().buildReqRecord(levelName, req, res, context);
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
