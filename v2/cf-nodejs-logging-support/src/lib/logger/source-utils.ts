import Config from "../config/config";
import { ConfigField, Source } from "../config/interfaces";
import NestedVarResolver from "../helper/nested-var-resolver";
import RequestAccessor from "../middleware/request-Accessor";
import ResponseAccessor from "../middleware/response-accessor";

const { v4: uuid } = require('uuid');

type origin = "msg-log" | "req-log" | "context";

const NS_PER_MS = 1e6;


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

    getFieldValue(source: Source, record: any, writtenAt: Date): string | number | undefined {
        let value;
        switch (source.type) {
            case "static":
                value = source.value;
                break;
            case "env":
                if (source.path) {
                    // clone path to avoid deleting path in resolveNestedVariable()
                    const clonedPath = [...source.path];
                    value = NestedVarResolver.resolveNestedVariable(process.env, clonedPath);
                    break;
                }
                value = process.env[source.name!];
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

        if (source.regExp) {
            const isValid = this.validateRegExp(value, source.regExp);
            if (!isValid) {
                value = undefined;
            }
        }

        return value;
    }

    getReqFieldValue(source: Source, record: any, writtenAt: Date, req: any, res: any): string | number | undefined {
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

        if (source.regExp) {
            const isValid = this.validateRegExp(value, source.regExp);
            if (!isValid) {
                value = undefined;
            }
        }

        return value;
    }

    // if source is request, then assign to context. If not, then ignore.
    getContextFieldValue(source: Source, record: any, req: any) {
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

        if (source.regExp) {
            const isValid = this.validateRegExp(value, source.regExp);
            if (!isValid) {
                value = undefined;
            }
        }

        return value;
    }

    // iterate through sources until one source returns a value 
    getValueFromSources(field: ConfigField, record: any, origin: origin, writtenAt: Date, req?: any, res?: any) {

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

            // idea: validate regExp of source, if not valid then ignore source
            if (source.regExp && fieldValue) {
                const isValid = this.validateRegExp(fieldValue, source.regExp);
                if (!isValid) fieldValue = undefined;
            }

            ++sourceIndex;
        }
        return fieldValue;
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

    private validateRegExp(value: string, regEx: string) {
        if (value == null) {
            return false;
        }
        const regExp = new RegExp(regEx);
        return regExp.test(value);
    }
}
