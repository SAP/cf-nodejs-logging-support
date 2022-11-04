export declare class JWTService {
    private static instance;
    private headerName;
    private dynLogLevelHeader;
    private constructor();
    static getInstance(): JWTService;
    getDynLogLevelHeaderName(): string;
    setDynLogLevelHeader(): void;
    getDynLogLevel(token: string): string | null;
    private verifyAndDecodeJWT;
}
