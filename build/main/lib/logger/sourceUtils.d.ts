import { ConfigField, Output } from '../config/interfaces';
import { Record, RecordFieldValue } from './record';
export default class SourceUtils {
    private static instance;
    private requestAccessor;
    private responseAccessor;
    private config;
    private lastTimestamp;
    private constructor();
    static getInstance(): SourceUtils;
    getValue(field: ConfigField, record: Record, output: Output, req?: any, res?: any): RecordFieldValue | undefined;
    private getValueFromSource;
    private getDetail;
    private getEnvFieldValue;
    private getNextValidSourceIndex;
    private validateRegExp;
    private parseIntValue;
    private parseFloatValue;
    private parseBooleanValue;
}
