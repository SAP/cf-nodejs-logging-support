import util from "util";
import Config from "../config/config";
import ReqContext from "./context";
import { SourceUtils } from "./source-utils";
const stringifySafe = require('json-stringify-safe');

export default class RecordFactory {

    private static instance: RecordFactory;
    private MAX_STACKTRACE_SIZE = 55 * 1024;
    private REDACTED_PLACEHOLDER = "redacted";

    private constructor() { }

    public static getInstance(): RecordFactory {
        if (!RecordFactory.instance) {
            RecordFactory.instance = new RecordFactory();
        }

        return RecordFactory.instance;
    }

    // init a new record and assign fields with output "msg-log"
    buildMsgRecord(registeredCustomFields: Array<string>, loggerCustomFields: Map<string, any>, level: string, args: Array<any>, context?: ReqContext): any {

        const configInstance = Config.getInstance();
        const sourceUtils = SourceUtils.getInstance();
        const msgLogFields = configInstance.getMsgFields();
        let record: any = {
            "level": level,
        };

        var customFieldsFromArgs = {};
        var lastArg = args[args.length - 1];

        if (typeof lastArg === "object") {
            if (this.isErrorWithStacktrace(lastArg)) {
                record.stacktrace = this.prepareStacktrace(lastArg.stack);
            } else if (this.isValidObject(lastArg)) {
                if (this.isErrorWithStacktrace(lastArg._error)) {
                    record.stacktrace = this.prepareStacktrace(lastArg._error.stack);
                    delete lastArg._error;
                }
                customFieldsFromArgs = lastArg;
            }
            args.pop();
        }
        msgLogFields.forEach(field => {

            if (!Array.isArray(field.source)) {
                record[field.name] = sourceUtils.getFieldValue(field.source, record);
            } else {
                record[field.name] = sourceUtils.getValueFromSources(record, field, "msg-log");
            }

            if (record[field.name] == null && field.default != null) {
                record[field.name] = field.default;
            }

            if (field._meta!.isRedacted == true && record[field.name] != null) {
                record[field.name] = this.REDACTED_PLACEHOLDER;
            }
        });

        // read and copy values from context
        if (context) {
            const contextFields = context.getProps();
            for (let key in contextFields) {
                record[key] = contextFields[key];
            }
        }

        record = this.addCustomFields(record, registeredCustomFields, loggerCustomFields, customFieldsFromArgs);
        record["msg"] = util.format.apply(util, args);
        return record;
    }

    // init a new record and assign fields with output "req-log"
    buildReqRecord(req: any, res: any, context: ReqContext): any {

        const sourceUtils = SourceUtils.getInstance();
        const reqLogFields = Config.getInstance().getReqFields();
        let record: any = { "level": "info" };

        reqLogFields.forEach(field => {
            if (field._meta!.isEnabled == false) {
                return;
            }

            if (!Array.isArray(field.source)) {
                record[field.name] = sourceUtils.getReqFieldValue(field.source, record, req, res);
            } else {
                record[field.name] = sourceUtils.getValueFromSources(record, field, "req-log", req, res);
            }

            if (record[field.name] == null && field.default != null) {
                record[field.name] = field.default;
            }

            if (field._meta!.isRedacted == true && record[field.name] != null) {
                record[field.name] = this.REDACTED_PLACEHOLDER;
            }
        });

        // read and copy values from context
        const contextFields = context.getProps();
        for (let key in contextFields) {
            record[key] = contextFields[key];
        }


        return record;
    }

    // check if the given object is an Error with stacktrace using duck typing
    private isErrorWithStacktrace(obj: any): boolean {
        if (obj && obj.stack && obj.message && typeof obj.stack === "string" && typeof obj.message === "string") {
            return true;
        }
        return false;
    }

    // Split stacktrace into string array and truncate lines if required by size limitation
    // Truncation strategy: Take one line from the top and two lines from the bottom of the stacktrace until limit is reached.
    private prepareStacktrace(stacktraceStr: any): any {
        var fullStacktrace = stacktraceStr.split('\n');
        var totalLineLength = fullStacktrace.reduce((acc: any, line: any) => acc + line.length, 0);

        if (totalLineLength > this.MAX_STACKTRACE_SIZE) {
            var truncatedStacktrace = [];
            var stackA = [];
            var stackB = [];
            var indexA = 0;
            var indexB = fullStacktrace.length - 1;
            var currentLength = 73; // set to approx. character count for "truncated" and "omitted" labels

            for (let i = 0; i < fullStacktrace.length; i++) {
                if (i % 3 == 0) {
                    let line = fullStacktrace[indexA++];
                    if (currentLength + line.length > this.MAX_STACKTRACE_SIZE) {
                        break;
                    }
                    currentLength += line.length;
                    stackA.push(line);
                } else {
                    let line = fullStacktrace[indexB--];
                    if (currentLength + line.length > this.MAX_STACKTRACE_SIZE) {
                        break;
                    }
                    currentLength += line.length;
                    stackB.push(line);
                }
            }

            truncatedStacktrace.push("-------- STACK TRACE TRUNCATED --------");
            truncatedStacktrace = [...truncatedStacktrace, ...stackA];
            truncatedStacktrace.push(`-------- OMITTED ${fullStacktrace.length - (stackA.length + stackB.length)} LINES --------`);
            truncatedStacktrace = [...truncatedStacktrace, ...stackB.reverse()];
            return truncatedStacktrace;
        }
        return fullStacktrace;
    }

    private isValidObject(obj: any, canBeEmpty?: any): boolean {
        if (!obj) {
            return false;
        } else if (typeof obj !== "object") {
            return false;
        } else if (!canBeEmpty && Object.keys(obj).length === 0) {
            return false;
        }
        return true;
    }

    private addCustomFields(record: any, registeredCustomFields: Array<string>, loggerCustomFields: Map<string, any>, customFieldsFromArgs: any): any {
        var providedFields = Object.assign({}, loggerCustomFields, customFieldsFromArgs);
        const customFieldsFormat = Config.getInstance().getConfig().customFieldsFormat;

        for (var key in providedFields) {
            var value = providedFields[key];

            // Stringify, if necessary.
            if ((typeof value) != "string") {
                value = stringifySafe(value);
            }

            if (customFieldsFormat == "cloud-logging" || record[key] != null) {
                record[key] = value;
            }
        }

        if (customFieldsFormat == "application-logging") {
            let res: any = {};
            res.string = [];
            let key;
            for (var i = 0; i < registeredCustomFields.length; i++) {
                key = registeredCustomFields[i]
                if (providedFields[key])
                    res.string.push({
                        "k": key,
                        "v": providedFields[key],
                        "i": i
                    })
            }
            if (res.string.length > 0)
                record["#cf"] = res;
        }
        return record;
    }
}
