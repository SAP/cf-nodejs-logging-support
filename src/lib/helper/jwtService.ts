const jwt = require("jsonwebtoken");
const ENV_DYN_LOG_HEADER = "DYN_LOG_HEADER";
const ENV_DYN_LOG_KEY = "DYN_LOG_LEVEL_KEY";
const DEFAULT_DYN_LOG_LEVEL_HEADER = "SAP-LOG-LEVEL";

export default class JWTService {
    private static instance: JWTService;
    private dynLogLevelHeader: string;

    private constructor() {
        // Read dynamic log level header name from environment var
        const headerName = process.env[ENV_DYN_LOG_HEADER];
        this.dynLogLevelHeader = headerName ? headerName : DEFAULT_DYN_LOG_LEVEL_HEADER;
    }

    static getInstance(): JWTService {
        if (!JWTService.instance) {
            JWTService.instance = new JWTService();
        }

        return JWTService.instance;
    }

    getDynLogLevelHeaderName(): string {
        return this.dynLogLevelHeader;
    }

    getDynLogLevel(token: string): string | null {
        // Read dynamic log level key from environment var.
        const dynLogLevelKey = process.env[ENV_DYN_LOG_KEY];
        const payload = dynLogLevelKey ? this.verifyAndDecodeJWT(token, dynLogLevelKey) : null;
        if (payload) {
            return payload.level;
        }
        return null;
    };

    private verifyAndDecodeJWT(token: string, pubKey: string) {
        if (!token || !pubKey || typeof pubKey !== "string") {
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
