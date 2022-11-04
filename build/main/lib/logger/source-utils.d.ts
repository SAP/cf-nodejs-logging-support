import { ConfigField, Source } from "../config/interfaces";
declare type origin = "msg-log" | "req-log" | "context";
export declare var REDACTED_PLACEHOLDER: string;
export declare class SourceUtils {
    private static instance;
    private requestAccessor;
    private responseAccessor;
    private config;
    private lastTimestamp;
    private constructor();
    static getInstance(): SourceUtils;
    isCacheable(source: Source | Source[]): boolean;
    getValue(field: ConfigField, record: any, origin: origin, writtenAt: Date, req?: any, res?: any): string | number | boolean | undefined;
    private getFieldValue;
    private getReqFieldValue;
    private getContextFieldValue;
    private getValueFromSources;
    private getEnvFieldValue;
    private getNextValidSourceIndex;
    private validateRegExp;
}
export {};
