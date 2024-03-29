import { v4 as uuid } from 'uuid';

import Config from '../config/config';
import { ConfigField, Conversion, DetailName, Output, Source, SourceType } from '../config/interfaces';
import EnvVarHelper from '../helper/envVarHelper';
import RequestAccessor from '../middleware/requestAccessor';
import ResponseAccessor from '../middleware/responseAccessor';
import Record from './record';

const NS_PER_MS = 1e6;
const REDACTED_PLACEHOLDER = "redacted";

export default class SourceUtils {
    private static instance: SourceUtils;
    private requestAccessor: RequestAccessor;
    private responseAccessor: ResponseAccessor;
    private config: Config;
    private lastTimestamp = 0;

    private constructor() {
        this.requestAccessor = RequestAccessor.getInstance();
        this.responseAccessor = ResponseAccessor.getInstance();
        this.config = Config.getInstance();
    }

    static getInstance(): SourceUtils {
        if (!SourceUtils.instance) {
            SourceUtils.instance = new SourceUtils();
        }

        return SourceUtils.instance;
    }

    getValue(field: ConfigField, record: Record, output: Output, req?: any, res?: any): string | number | boolean | undefined {
        if (!field.source) return undefined

        let sources = Array.isArray(field.source) ? field.source : [field.source]
        let value: string | number | boolean | undefined;

        let sourceIndex = 0;

        while (value == null) {
            sourceIndex = this.getNextValidSourceIndex(sources, output, sourceIndex);
            if (sourceIndex == -1) {
                break;
            }

            let source = sources[sourceIndex];

            value = this.getValueFromSource(source, record, output, req, res)
            sourceIndex++;
        }

        // Handle default
        if (value == null && field.default != null) {
            value = field.default;
        }

        if (value != null && field.convert != null) {
            switch(field.convert) {
                case Conversion.ToString:
                    value = value.toString ? value.toString() : undefined
                break;
                case Conversion.ParseBoolean:
                    value = this.parseBooleanValue(value)
                break;
                case Conversion.ParseInt:
                    value = this.parseIntValue(value)
                break;
                case Conversion.ParseFloat:
                    value = this.parseFloatValue(value)
                break;
            }
        }

        // Replaces all fields, which are marked to be reduced and do not equal to their default value to REDUCED_PLACEHOLDER.
        if (field._meta!.isRedacted == true && value != null && value != field.default) {
            value = REDACTED_PLACEHOLDER;
        }

        return value
    }

    private getValueFromSource(source: Source, record: Record, output: Output, req?: any, res?: any): string | number | boolean | undefined {
        let value: string | number | boolean | undefined;
        switch (source.type) {
            case SourceType.ReqHeader:
                value = req ? this.requestAccessor.getHeaderField(req, source.fieldName!) : undefined;
                break;
            case SourceType.ReqObject:
                value = req ? this.requestAccessor.getField(req, source.fieldName!) : undefined;
                break;
            case SourceType.ResHeader:
                value = res ? this.responseAccessor.getHeaderField(res, source.fieldName!) : undefined;
                break;
            case SourceType.ResObject:
                value = res ? this.responseAccessor.getField(res, source.fieldName!) : undefined;
                break;
            case SourceType.Static:
                value = source.value;
                break;
            case SourceType.Env:
                value = this.getEnvFieldValue(source);
                break;
            case SourceType.ConfigField:
                let fields = this.config.getConfigFields([source.fieldName!])
                value = fields.length >= 1 ? this.getValue(fields[0], record, output, req, res) : undefined
                break;
            case SourceType.Detail:
                value = this.getDetail(source.detailName!, record, req, res)
                break;
            case SourceType.UUID:
                value = uuid();
                break;
        }

        if (source.regExp && value != null && typeof value == "string") {
            value = this.validateRegExp(value, source.regExp);
        }

        return value
    }

    private getDetail(detailName: DetailName, record: Record, req?: any, res?: any) : string | number | undefined {
        let value: string | number | undefined;
        switch (detailName as DetailName) {
            case DetailName.RequestReceivedAt:
                value = req ? new Date(req._receivedAt).toJSON() : undefined;
                break;
            case DetailName.ResponseSentAt:
                value = res ? new Date(res._sentAt).toJSON() : undefined;
                break;
            case DetailName.ResponseTimeMs:
                value = req && res ? (res._sentAt - req._receivedAt) : undefined;
                break;
            case DetailName.WrittenAt:
                value = new Date().toJSON();
                break;
            case DetailName.WrittenTs:
                const lower = process.hrtime()[1] % NS_PER_MS
                const higher = Date.now() * NS_PER_MS
                let writtenTs = higher + lower;

                // This reorders written_ts, if the new timestamp seems to be smaller
                // due to different rollover times for process.hrtime and reqReceivedAt.getTime
                if (writtenTs < this.lastTimestamp) {
                    writtenTs += NS_PER_MS;
                }
                this.lastTimestamp = writtenTs;
                value = writtenTs;
                break;
            case DetailName.Message:
                value = record.metadata.message
                break;
            case DetailName.Stacktrace:
                value = record.metadata.stacktrace
                break;
            case DetailName.Level:
                value = record.metadata.level
                break;
        }
        return value;
    }

    private getEnvFieldValue(source: Source): string | number | undefined {
        if (source.path) {
            return EnvVarHelper.getInstance().resolveNestedVar(source.path);
        } else {
            return process.env[source.varName!];
        }
    }

    // returns -1 when all sources were iterated
    private getNextValidSourceIndex(sources: Source[], output: Output, startIndex: number): number {
        const framework = this.config.getFramework();

        for (let i = startIndex; i < sources.length; i++) {
            let source = sources[i];
            if (!source.framework || source.framework == framework) {
                if (!source.output || source.output == output) {
                    return i;
                }
            }
        }
        return -1;
    }

    private validateRegExp(value: string, regEx: string): string | undefined {
        const regExp = new RegExp(regEx);
        const isValid = regExp.test(value);
        if (isValid) {
            return value;
        }
        return undefined;
    }

    private parseIntValue(value: string | number | boolean): number {
        switch (typeof value) {
            case 'string':
                return parseInt(value, 0)
            case 'number':
                return value
            case 'boolean':
                return value ? 1 : 0
        }
    }

    private parseFloatValue(value: string | number | boolean): number {
        switch (typeof value) {
            case 'string':
                return parseFloat(value)
            case 'number':
                return value
            case 'boolean':
                return value ? 1 : 0
        }
    }

    private parseBooleanValue(value: string | number | boolean) : boolean {
        return value === 'true' || value === 'TRUE' || value === 'True' || value === 1 || value === true
    }
}
