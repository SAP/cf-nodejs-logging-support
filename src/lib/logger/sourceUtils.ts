import { v4 as uuid } from 'uuid';

import Config from '../config/config';
import { ConfigField, Output, Source, SourceType } from '../config/interfaces';
import EnvVarHelper from '../helper/envVarHelper';
import RequestAccessor from '../middleware/requestAccessor';
import ResponseAccessor from '../middleware/responseAccessor';

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

    isCacheable(source: Source | Source[]): boolean {
        if (!Array.isArray(source)) {
            if ([SourceType.static, SourceType.env].includes(source.type)) {
                return true;
            }
        } else {
            for (const object of source) {
                switch (object.type) {
                    case SourceType.static:
                        return true;
                    case SourceType.env:
                        if (this.getEnvFieldValue(object) != null) {
                            return true;
                        }
                        continue;
                    default:
                        return false;
                }
            }
        }
        return false;
    }

    getValue(field: ConfigField, record: any, output: Output, req?: any, res?: any): string | number | boolean | undefined {
        let sources = Array.isArray(field.source) ? field.source : [field.source]
        let value: string | number | boolean | undefined;

        let sourceIndex = 0;

        while (value == null) {
            sourceIndex = this.getNextValidSourceIndex(sources, output, sourceIndex);
            if (sourceIndex == -1) {
                break;
            }

            let source = sources[sourceIndex];

            value = this.getValueFromSource(source, record, req, res)
            sourceIndex++;
        }

        // Handle default
        if (value == null && field.default != null) {
            value = field.default;
        }

        // Replaces all fields, which are marked to be reduced and do not equal to their default value to REDUCED_PLACEHOLDER.
        if (field._meta!.isRedacted == true && value != null && value != field.default) {
            value = REDACTED_PLACEHOLDER;
        }

        return value
    }

    private getValueFromSource(source: Source, record: any, req?: any, res?: any): string | number | boolean | undefined {
        let value: string | number | boolean | undefined;
        switch (source.type) {
            case SourceType.reqHeader:
                value = req ? this.requestAccessor.getHeaderField(req, source.fieldName!) : undefined;
                break;
            case SourceType.reqObject:
                value = req ? this.requestAccessor.getField(req, source.fieldName!) : undefined;
                break;
            case SourceType.resHeader:
                value = res ? this.responseAccessor.getHeaderField(res, source.fieldName!) : undefined;
                break;
            case SourceType.resObject:
                value = res ? this.responseAccessor.getField(res, source.fieldName!) : undefined;
                break;
            case SourceType.static:
                value = source.value;
                break;
            case SourceType.env:
                value = this.getEnvFieldValue(source);
                break;
            case SourceType.configField:
                value = record[source.fieldName!];
                break;
            case SourceType.meta:
                switch (source.fieldName) {
                    case "requestReceivedAt":
                        value = req ? new Date(req._receivedAt).toJSON() : undefined;
                        break;
                    case "responseSentAt":
                        value = res ? new Date(res._sentAt).toJSON() : undefined;
                        break;
                    case "responseTimeMs":
                        value = req && res ? (res._sentAt - req._receivedAt) : undefined;
                        break;
                    case "writtenAt":
                        value = new Date().toJSON();
                        break;
                    case "writtenTs":
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
                    case "message":
                        value = record.metadata.message
                        break;
                    case "stacktrace":
                        value = record.metadata.stacktrace
                        break;
                    case "level":
                        value = record.metadata.level
                        break;
                }
                break;
            case SourceType.uuid:
                value = uuid();
                break;
        }

        if (source.regExp && value != null && typeof value == "string") {
            value = this.validateRegExp(value, source.regExp);
        }

        return value
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
}
