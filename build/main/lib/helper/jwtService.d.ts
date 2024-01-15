export default class JWTService {
    private static instance;
    private dynLogLevelHeader;
    private constructor();
    static getInstance(): JWTService;
    getDynLogLevelHeaderName(): string;
    getDynLogLevel(token: string): string | null;
    private verifyAndDecodeJWT;
}
