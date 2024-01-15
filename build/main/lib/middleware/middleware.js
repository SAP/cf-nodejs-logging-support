"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwtService_1 = __importDefault(require("../helper/jwtService"));
const level_1 = require("../logger/level");
const logger_1 = require("../logger/logger");
const recordFactory_1 = __importDefault(require("../logger/recordFactory"));
const context_1 = __importDefault(require("../logger/context"));
const rootLogger_1 = __importDefault(require("../logger/rootLogger"));
const requestAccessor_1 = __importDefault(require("./requestAccessor"));
const config_1 = __importDefault(require("../config/config"));
const pluginProvider_1 = __importDefault(require("../helper/pluginProvider"));
class Middleware {
    static logNetwork(req, res, next) {
        let logSent = false;
        const context = new context_1.default(req);
        const parentLogger = rootLogger_1.default.getInstance();
        const reqReceivedAt = Date.now();
        // initialize Logger with parent to set registered fields
        const networkLogger = new logger_1.Logger(parentLogger, context);
        const jwtService = jwtService_1.default.getInstance();
        const dynLogLevelHeader = jwtService.getDynLogLevelHeaderName();
        const token = requestAccessor_1.default.getInstance().getHeaderField(req, dynLogLevelHeader);
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
                res._sentAt = Date.now();
                const levelName = config_1.default.getInstance().getReqLoggingLevel();
                const level = level_1.LevelUtils.getLevel(levelName);
                const threshold = level_1.LevelUtils.getLevel(req.logger.getLoggingLevel());
                if (level_1.LevelUtils.isLevelEnabled(threshold, level)) {
                    const record = recordFactory_1.default.getInstance().buildReqRecord(level, req, res, context);
                    pluginProvider_1.default.getInstance().getOutputPlugins().forEach(output => { output.writeRecord(record); });
                }
                logSent = true;
            }
        };
        res.on("finish", finishLog);
        res.on("header", finishLog);
        next ? next() : null;
    }
}
exports.default = Middleware;
//# sourceMappingURL=middleware.js.map