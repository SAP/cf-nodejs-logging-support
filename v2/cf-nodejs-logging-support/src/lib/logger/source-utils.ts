import Config from "../config/config";
import { ConfigField, Source } from "../config/interfaces";
import NestedVarResolver from "../helper/nested-var-resolver";
import RequestAccessor from "../middleware/request-Accessor";
import ResponseAccessor from "../middleware/response-accessor";

const { v4: uuid } = require('uuid');

type origin = "msg-log" | "req-log" | "context";

const NS_PER_MS = 1e6;

export var REDACTED_PLACEHOLDER = "redacted";

export class SourceUtils {
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

    public static getInstance(): SourceUtils {
        if (!SourceUtils.instance) {
            SourceUtils.instance = new SourceUtils();
        }

        return SourceUtils.instance;
    }

    isCacheable(source: Source | Source[]): boolean {
        if (!Array.isArray(source)) {
            if (["static", "env"].includes(source.type)) {
                return true;
            }
        } else {
            for (const object of source) {
                if (["static"].includes(object.type)) {
                    return true;
                }
                if (object.type == "env") {
                    if (this.getEnvFieldValue(object) != null) {
                        return true;
                    }
                    continue;
                }
                return false;
            }
        }
        return false;
    }

    getValue(field: ConfigField, record: any, origin: origin, writtenAt: Date, req?: any, res?: any): string | number | boolean | undefined {
        let value: string | number | boolean | undefined;
        if (!Array.isArray(field.source)) {
            switch (origin) {
                case "msg-log":
                    value = this.getFieldValue(field.source, record, writtenAt);
                    break;
                case "req-log":
                    value = this.getReqFieldValue(field.source, record, writtenAt, req, res,);
                    break;
                case "context":
                    value = this.getContextFieldValue(field.source, record, req);
                    break;
            }
        } else {
            value = this.getValueFromSources(field, record, origin, writtenAt, req, res);
        }

        // Handle default
        if (value == null && field.default != null) {
            value = field.default;
        }

        // Replaces all fields, which are marked to be reduced and do not equal to their default value to REDUCED_PLACEHOLDER.
        if (field._meta!.isRedacted == true && value != null && value != field.default) {
            value = REDACTED_PLACEHOLDER;
        }

        return value;
    }

    private getFieldValue(source: Source, record: any, writtenAt: Date): string | number | undefined {
        let value;
        switch (source.type) {
            case "static":
                value = source.value;
                break;
            case "env":
                value = this.getEnvFieldValue(source);
                break;
            case "config-field":
                value = record[source.name!];
                break;
            case "meta":
                if (writtenAt == null) {
                    return;
                }
                if (source.name == "request_received_at") {
                    value = record["written_at"];
                    break;
                }
                if (source.name == "response_time_ms") {
                    value = (Date.now() - writtenAt.getTime());
                    break;
                }
                if (source.name == "response_sent_at") {
                    value = new Date().toJSON();
                    break;
                }
                if (source.name == "written_at") {
                    value = writtenAt.toJSON();
                    break;
                }
                if (source.name == "written_ts") {
                    var lower = process.hrtime()[1] % NS_PER_MS
                    var higher = writtenAt.getTime() * NS_PER_MS

                    let written_ts = higher + lower;
                    //This reorders written_ts, if the new timestamp seems to be smaller
                    // due to different rollover times for process.hrtime and writtenAt.getTime
                    if (written_ts < this.lastTimestamp) {
                        written_ts += NS_PER_MS;
                    }
                    this.lastTimestamp = written_ts;
                    value = written_ts;
                    break;
                }
                break;
            default:
                value = undefined;
        }

        if (source.regExp && value) {
            value = this.validateRegExp(value, source.regExp);
        }

        return value;
    }

    private getReqFieldValue(source: Source, record: any, writtenAt: Date, req: any, res: any): string | number | undefined {
        if (req == null || res == null) {
            throw new Error("Please pass req and res as argument to get value for req-log field.");
        }
        let value;
        switch (source.type) {
            case "req-header":
                value = this.requestAccessor.getHeaderField(req, source.name!);
                break;
            case "req-object":
                value = this.requestAccessor.getField(req, source.name!);
                break;
            case "res-header":
                value = this.responseAccessor.getHeaderField(res, source.name!);
                break;
            case "res-object":
                value = this.responseAccessor.getField(res, source.name!);
                break;
            default:
                value = this.getFieldValue(source, record, writtenAt);
        }

        if (source.regExp && value) {
            value = this.validateRegExp(value, source.regExp);
        }

        return value;
    }

    // if source is request, then assign to context. If not, then ignore.
    private getContextFieldValue(source: Source, record: any, req: any) {
        if (req == null) {
            throw new Error("Please pass req as argument to get value for req-log field.");
        }
        let value;
        switch (source.type) {
            case "req-header":
                value = this.requestAccessor.getHeaderField(req, source.name!);
                break;
            case "req-object":
                value = this.requestAccessor.getField(req, source.name!);
                break;
            case "config-field":
                const writtenAt = new Date();
                value = this.getFieldValue(source, record, writtenAt);
                break;
            case "uuid":
                value = uuid();
                break;
        }

        if (source.regExp && value) {
            value = this.validateRegExp(value, source.regExp);
        }

        return value;
    }

    // iterate through sources until one source returns a value 
    private getValueFromSources(field: ConfigField, record: any, origin: origin, writtenAt: Date, req?: any, res?: any) {

        if (origin == "req-log" && (req == null || res == null)) {
            throw new Error("Please pass req and res as argument to get value for req-log field.");
        }

        if (origin == "context" && (req == null)) {
            throw new Error("Please pass req as argument to get value for context field.");
        }

        field.source = field.source as Source[];

        let sourceIndex = 0;
        let fieldValue;
        while (fieldValue == null) {
            sourceIndex = this.getNextValidSourceIndex(field.source, sourceIndex);

            if (sourceIndex == -1) {
                return;
            }

            let source = field.source[sourceIndex];

            fieldValue = origin == "msg-log" ? this.getFieldValue(source, record, writtenAt) :
                origin == "req-log" ? this.getReqFieldValue(source, record, writtenAt, req, res,) :
                    this.getContextFieldValue(source, record, req);

            if (source.regExp && fieldValue) {
                fieldValue = this.validateRegExp(fieldValue, source.regExp);
            }

            ++sourceIndex;
        }
        return fieldValue;
    }

    private getEnvFieldValue(source: Source): string | number | undefined {
        if (source.path) {
            // clone path to avoid deleting path in resolveNestedVariable()
            const clonedPath = [...source.path];
            return NestedVarResolver.resolveNestedVariable(process.env, clonedPath);
        }
        return process.env[source.name!];
    }

    // returns -1 when all sources were iterated
    private getNextValidSourceIndex(sources: Source[], startIndex: number): number {
        const framework = this.config.getFramework();

        for (let i = startIndex; i < sources.length; i++) {
            if (!sources[i].framework) {
                return i;
            }
            if (sources[i].framework == framework) {
                return i;
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
