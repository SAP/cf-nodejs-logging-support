import Logger from "../logger/logger";

const jwt = require("jsonwebtoken");
const ENV_DYN_LOG_HEADER = "DYN_LOG_HEADER";
const ENV_DYN_LOG_KEY = "DYN_LOG_LEVEL_KEY";
const DEFAULT_DYN_LOG_LEVEL_HEADER = "SAP-LOG-LEVEL";

export class JWTService {
    // Read dyn. log level header name from environment var
    headerName = process.env[ENV_DYN_LOG_HEADER];
    private static dynLogLevelHeader = "";

    // Read dyn log level key from environment var.
    private static dynLogLevelKey = process.env[ENV_DYN_LOG_KEY];

    constructor() {

    }

    static getDynLogLevelHeaderName() {
        return this.dynLogLevelHeader;
    }

    setDynLogLevelHeader() {
        JWTService.dynLogLevelHeader = this.headerName ? this.headerName : DEFAULT_DYN_LOG_LEVEL_HEADER;
    }

    // Binds the Loglevel extracted from JWT token to the given request logger
    static bindDynLogLevel(token: any, logger: Logger): Logger {
        var payload = this.verifyAndDecodeJWT(token, JWTService.dynLogLevelKey);

        if (payload) {
            logger.setLoggingLevel(payload.level);
        }
        return logger;
    };

    private static verifyAndDecodeJWT(token: any, pubKey: any) {
        if (!token || !pubKey) {
            return null; // no public key or jwt provided
        }

        try {
            if (pubKey.match(/BEGIN PUBLIC KEY/))
                return jwt.verify(token, pubKey, { algorithms: ["RS256", "RS384", "RS512"] });
            else
                return jwt.verify(token, "-----BEGIN PUBLIC KEY-----\n" + pubKey + "\n-----END PUBLIC KEY-----", { algorithms: ["RS256", "RS384", "RS512"] });
        } catch (err) {
            return null; // token expired or invalid
        }
    }
}
