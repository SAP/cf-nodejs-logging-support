import Config from "../config/config";
import { ConfigField, Source } from "../config/interfaces";
import NestedVarResolver from "../helper/nested-var-resolver";
import RequestAccessor from "../middleware/request-Accessor";
import ResponseAccessor from "../middleware/response-accessor";
const { v4: uuid } = require('uuid');
var uuidCheck = /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[0-9a-f]{4}-[0-9a-f]{12}/;

type origin = "msg-log" | "req-log" | "context";

const NS_PER_MS = 1e6;


export class SourceUtils {
    private static instance: SourceUtils;
    private requestAccessor: RequestAccessor = RequestAccessor.getInstance();
    private responseAccessor = ResponseAccessor.getInstance();
    private lastTimestamp = 0;

    private constructor() { }

    public static getInstance(): SourceUtils {
        if (!SourceUtils.instance) {
            SourceUtils.instance = new SourceUtils();
        }

        return SourceUtils.instance;
    }

    getFieldValue(fieldName: string, source: Source, record: any, now: Date): string | undefined {
        switch (source.type) {
            case "static":
                return source.value;
            case "env":
                if (source.path) {
                    // clone path to avoid deleting path in resolveNestedVariable()
                    const clonedPath = [...source.path];
                    return NestedVarResolver.resolveNestedVariable(process.env, clonedPath);
                }
                return process.env[source.name!];
            case "config-field":
                if (fieldName == "correlation_id" && !uuidCheck.exec(record[source.name!])) {
                    return;
                }
                return record[source.name!];
            case "meta":
                if (now == null) {
                    return;
                }
                if (fieldName == "request_received_at") {
                    return record["written_at"];
                }
                if (fieldName == "response_time_ms") {
                    return (Date.now() - now.getTime()).toString();;
                }
                if (fieldName == "response_sent_at") {
                    return new Date().toJSON();
                }
                if (fieldName == "written_at") {
                    return now.toJSON();
                }
                if (fieldName == "written_ts") {
                    var lower = process.hrtime()[1] % NS_PER_MS
                    var higher = now.getTime() * NS_PER_MS

                    let written_ts = higher + lower;
                    //This reorders written_ts, if the new timestamp seems to be smaller
                    // due to different rollover times for process.hrtime and now.getTime
                    if (written_ts < this.lastTimestamp) {
                        written_ts += NS_PER_MS;
                    }
                    this.lastTimestamp = written_ts;
                    return written_ts.toString();
                }
                return;
            default:
                return undefined;
        }
    }

    getReqFieldValue(fieldName: string, source: Source, record: any, now: Date, req: any, res: any): string | undefined {
        switch (source.type) {
            case "req-header":
                return this.requestAccessor.getHeaderField(req, source.name!);
            case "req-object":
                return this.requestAccessor.getField(req, source.name!);
            case "res-header":
                return this.responseAccessor.getHeaderField(res, source.name!);
            case "res-object":
                return this.responseAccessor.getField(res, source.name!);
            default:
                return this.getFieldValue(fieldName, source, record, now);
        }
    }

    // if source is request, then assign to context. If not, then ignore.
    getContextFieldValue(source: Source, req: any) {
        switch (source.type) {
            case "req-header":
                return this.requestAccessor.getHeaderField(req, source.name!);
            case "req-object":
                return this.requestAccessor.getField(req, source.name!);
            case "uuid":
                return uuid();
        }
    }

    // iterate through sources until one source returns a value 
    getValueFromSources(field: ConfigField, record: any, origin: origin, now: Date, req?: any, res?: any) {

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
            sourceIndex = SourceUtils.getInstance().getNextValidSourceIndex(field.source, sourceIndex);

            if (sourceIndex == -1) {
                return;
            }

            let source = field.source[sourceIndex];

            fieldValue = origin == "msg-log" ? this.getFieldValue(field.name, source, record, now) :
                origin == "req-log" ? this.getReqFieldValue(field.name, source, record, req, res, now) :
                    this.getContextFieldValue(source, req);

            ++sourceIndex;
        }
        return fieldValue;
    }

    // returns -1 when all sources were iterated
    private getNextValidSourceIndex(sources: Source[], startIndex: number): number {
        const framework = Config.getInstance().getFramework();

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
}
