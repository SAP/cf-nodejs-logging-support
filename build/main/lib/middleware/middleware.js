"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const level_utils_1 = __importDefault(require("../logger/level-utils"));
const record_factory_1 = __importDefault(require("../logger/record-factory"));
const root_logger_1 = __importDefault(require("../logger/root-logger"));
const jwt_service_1 = require("../config/jwt-service");
const request_Accessor_1 = __importDefault(require("./request-Accessor"));
const record_writer_1 = __importDefault(require("../logger/record-writer"));
const context_1 = __importDefault(require("../logger/context"));
const logger_1 = __importDefault(require("../logger/logger"));
class Middleware {
    static logNetwork(req, res, next) {
        let logSent = false;
        const context = new context_1.default(req);
        const parent = root_logger_1.default.getInstance();
        // initialize Logger with parent to set registered fields
        let networkLogger = new logger_1.default(parent, context);
        let jwtService = jwt_service_1.JWTService.getInstance();
        var dynLogLevelHeader = jwtService.getDynLogLevelHeaderName();
        var token = request_Accessor_1.default.getInstance().getHeaderField(req, dynLogLevelHeader);
        if (token) {
            let dynLevel = jwtService.getDynLogLevel(token);
            if (dynLevel != null) {
                networkLogger.setLoggingLevel(dynLevel);
            }
        }
        req.logger = networkLogger;
        const finishLog = () => {
            if (!logSent) {
                const record = record_factory_1.default.getInstance().buildReqRecord(req, res, context);
                const reqLoggingLevel = level_utils_1.default.getLevel(record.level);
                const loggingLevelThreshold = level_utils_1.default.getLevel(req.logger.getLoggingLevel());
                if (level_utils_1.default.isLevelEnabled(loggingLevelThreshold, reqLoggingLevel)) {
                    record_writer_1.default.getInstance().writeLog(record);
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