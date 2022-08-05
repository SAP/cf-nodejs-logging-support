import { performance } from "perf_hooks";
import util from "util";
import Config from "../config/config";
import { Source } from "../config/interfaces";
import { isValidObject } from "../middleware/utils";
import ReqContext from "./context";
import { SourceUtils } from "./source-utils";
import { StacktraceUtils } from "./stacktrace-utils";
const stringifySafe = require('json-stringify-safe');

export default class RecordFactory {

    private static instance: RecordFactory;
    private config: Config;
    private stacktraceUtils: StacktraceUtils;
    private sourceUtils: SourceUtils;
    private REDACTED_PLACEHOLDER = "redacted";
    private LOG_TYPE = "log";

    private constructor() {
        this.config = Config.getInstance();
        this.stacktraceUtils = StacktraceUtils.getInstance();
        this.sourceUtils = SourceUtils.getInstance();
    }

    public static getInstance(): RecordFactory {
        if (!RecordFactory.instance) {
            RecordFactory.instance = new RecordFactory();
        }

        return RecordFactory.instance;
    }

    // init a new record and assign fields with output "msg-log"
    buildMsgRecord(registeredCustomFields: Array<string>, loggerCustomFields: Map<string, any>, level: string, args: Array<any>, context?: ReqContext): any {

        const writtenAt = new Date();
        // var startTimeGetMsgFields = performance.now();
        const msgLogFields = this.config.getMsgFields();
        // var endTimeGetMsgFields = performance.now();
        // console.log(`Config.getMsgFields: ${endTimeGetMsgFields - startTimeGetMsgFields} milliseconds`)

        let record: any = {
            "level": level,
        };

        var customFieldsFromArgs = {};
        var lastArg = args[args.length - 1];

        if (typeof lastArg === "object") {
            if (this.stacktraceUtils.isErrorWithStacktrace(lastArg)) {
                record.stacktrace = this.stacktraceUtils.prepareStacktrace(lastArg.stack);
            } else if (isValidObject(lastArg)) {
                if (this.stacktraceUtils.isErrorWithStacktrace(lastArg._error)) {
                    record.stacktrace = this.stacktraceUtils.prepareStacktrace(lastArg._error.stack);
                    delete lastArg._error;
                }
                customFieldsFromArgs = lastArg;
            }
            args.pop();
        }

        // var startTimeForEach = performance.now();
        msgLogFields.forEach(field => {

            // Assign value
            // var startTimeGetValue = performance.now();
            // if (!Array.isArray(field.source)) {
            //     record[field.name] = this.sourceUtils.getFieldValue(field.source, record, writtenAt);
            // } else {
            const value = this.sourceUtils.getValueFromSources(field, record, "msg-log", writtenAt);
            if (value != null) {
                record[field.name] = value;
            }
            // }
            // var endTimeGetValue = performance.now();
            // console.log(`msgLogFields.forEach => get source value: ${endTimeGetValue - startTimeGetValue} milliseconds`)

            // Handle default
            if (record[field.name] == null && field.default != null) {
                record[field.name] = field.default;
            }

            // Replaces all fields, which are marked to be reduced and do not equal to their default value to REDUCED_PLACEHOLDER.
            if (field._meta!.isRedacted == true && record[field.name] != null && record[field.name] != field.default) {
                record[field.name] = this.REDACTED_PLACEHOLDER;
            }
        });
        // var endTimeBuildForEach = performance.now();
        // console.log(`msgLogFields.forEach: ${endTimeBuildForEach - startTimeForEach} milliseconds`)


        // read and copy values from context
        // var startTimeAddContext = performance.now();
        if (context) {
            // var startTimeAddContext = performance.now();
            record = this.addContext(record, context);
            // var endTimeAddContext = performance.now();
            // console.log(`RecordFactory.addContext: ${endTimeAddContext - startTimeAddContext} milliseconds`)
        }

        // var startTimeAddCustomFields = performance.now();
        record = this.addCustomFields(record, registeredCustomFields, loggerCustomFields, customFieldsFromArgs);
        // var endTimeAddCustomFields = performance.now();
        // console.log(`RecordFactory.addCustomFields: ${endTimeAddCustomFields - startTimeAddCustomFields} milliseconds`)

        record["msg"] = util.format.apply(util, args);
        record["type"] = this.LOG_TYPE;
        return record;
    }

    // init a new record and assign fields with output "req-log"
    buildReqRecord(req: any, res: any, context: ReqContext): any {

        const writtenAt = new Date();
        const reqLogFields = this.config.getReqFields();
        const reqLoggingLevel = this.config.getReqLoggingLevel();
        let record: any = { "level": reqLoggingLevel };

        reqLogFields.forEach(field => {
            if (field._meta!.isEnabled == false) {
                return;
            }

            // Assign value
            // if (!Array.isArray(field.source)) {
            //     record[field.name] = sourceUtils.getReqFieldValue(field.source, record, writtenAt, req, res);
            // } else {
            record[field.name] = this.sourceUtils.getValueFromSources(field, record, "req-log", writtenAt, req, res);
            // }

            // Handle default
            if (record[field.name] == null && field.default != null) {
                record[field.name] = field.default;
            }

            // Replaces all fields, which are marked to be reduced and do not equal to their default value to REDUCED_PLACEHOLDER.
            if (field._meta!.isRedacted == true && record[field.name] != null && record[field.name] != field.default) {
                record[field.name] = this.REDACTED_PLACEHOLDER;
            }

        });

        record = this.addContext(record, context);

        const loggerCustomFields = Object.assign({}, req.logger.extractCustomFieldsFromLogger(req.logger));
        record = this.addCustomFields(record, req.logger.registeredCustomFields, loggerCustomFields, {});
        return record;
    }

    private addCustomFields(record: any, registeredCustomFields: Array<string>, loggerCustomFields: Map<string, any>, customFieldsFromArgs: any): any {
        var providedFields = Object.assign({}, loggerCustomFields, customFieldsFromArgs);
        const customFieldsFormat = this.config.getConfig().customFieldsFormat;

        for (var key in providedFields) {
            var value = providedFields[key];

            if (customFieldsFormat == "cloud-logging" || record[key] != null || this.config.isSettable(key)) {
                record[key] = value;
            }

            if (customFieldsFormat == "application-logs") {

                let res: any = {};
                res.string = [];
                let key;
                for (var i = 0; i < registeredCustomFields.length; i++) {
                    key = registeredCustomFields[i]
                    if (providedFields[key]) {
                        var value = providedFields[key];
                        // Stringify, if necessary.
                        if ((typeof value) != "string") {
                            value = stringifySafe(value);
                        }
                        res.string.push({
                            "k": key,
                            "v": value,
                            "i": i
                        })
                    }
                }
                if (res.string.length > 0)
                    record["#cf"] = res;
            }
        }
        return record;
    }

    // read and copy values from context
    private addContext(record: any, context: ReqContext): object {
        const contextFields = context.getProps();
        for (let key in contextFields) {
            if (contextFields[key] != null) {
                record[key] = contextFields[key];
            }
        }
        return record;
    }
}
