import Logger from "../logger/logger";
import RecordFactory from "../logger/record-factory";

const jwt = require("jsonwebtoken");
const ENV_DYN_LOG_HEADER = "DYN_LOG_HEADER";
const ENV_DYN_LOG_KEY = "DYN_LOG_LEVEL_KEY";
const DEFAULT_DYN_LOG_LEVEL_HEADER = "SAP-LOG-LEVEL";

export class JWTService {
    // Read dyn. log level header name from environment var
    private static instance: JWTService;
    private headerName = process.env[ENV_DYN_LOG_HEADER];
    private dynLogLevelHeader = this.headerName ? this.headerName : DEFAULT_DYN_LOG_LEVEL_HEADER;

    private constructor() { }

    public static getInstance(): JWTService {
        if (!JWTService.instance) {
            JWTService.instance = new JWTService();
        }

        return JWTService.instance;
    }

    getDynLogLevelHeaderName() {
        return this.dynLogLevelHeader;
    }

    setDynLogLevelHeader() {
        this.dynLogLevelHeader = this.headerName ? this.headerName : DEFAULT_DYN_LOG_LEVEL_HEADER;
    }

    getDynLogLevel(token: string): string {
        // Read dyn log level key from environment var.
        const dynLogLevelKey = process.env[ENV_DYN_LOG_KEY];
        const payload = dynLogLevelKey ? this.verifyAndDecodeJWT(token, dynLogLevelKey) : null;
        return payload?.level;
    };

    private verifyAndDecodeJWT(token: string, pubKey: string) {
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
