import util from "util";
import Config from "../config/config";
import { isValidObject } from "../middleware/utils";
import ReqContext from "./context";
import { SourceUtils } from "./source-utils";
import { StacktraceUtils } from "./stacktrace-utils";
const stringifySafe = require('json-stringify-safe');

export default class RecordFactory {

    private static instance: RecordFactory;
    private REDACTED_PLACEHOLDER = "redacted";
    private LOG_TYPE = "log";

    private constructor() { }

    public static getInstance(): RecordFactory {
        if (!RecordFactory.instance) {
            RecordFactory.instance = new RecordFactory();
        }

        return RecordFactory.instance;
    }

    // init a new record and assign fields with output "msg-log"
    buildMsgRecord(registeredCustomFields: Array<string>, loggerCustomFields: Map<string, any>, level: string, args: Array<any>, context?: ReqContext): any {

        const stacktraceUtils = StacktraceUtils.getInstance();
        const timestamp = new Date();
        const configInstance = Config.getInstance();
        const sourceUtils = SourceUtils.getInstance();
        const msgLogFields = configInstance.getMsgFields();
        let record: any = {
            "level": level,
        };

        var customFieldsFromArgs = {};
        var lastArg = args[args.length - 1];

        if (typeof lastArg === "object") {
            if (stacktraceUtils.isErrorWithStacktrace(lastArg)) {
                record.stacktrace = stacktraceUtils.prepareStacktrace(lastArg.stack);
            } else if (isValidObject(lastArg)) {
                if (stacktraceUtils.isErrorWithStacktrace(lastArg._error)) {
                    record.stacktrace = stacktraceUtils.prepareStacktrace(lastArg._error.stack);
                    delete lastArg._error;
                }
                customFieldsFromArgs = lastArg;
            }
            args.pop();
        }

        msgLogFields.forEach(field => {

            // Assign value
            if (!Array.isArray(field.source)) {
                record[field.name] = sourceUtils.getFieldValue(field.name, field.source, record, timestamp);
            } else {
                record[field.name] = sourceUtils.getValueFromSources(field, record, "msg-log", timestamp);
            }

            // Handle default
            if (record[field.name] == null && field.default != null) {
                record[field.name] = field.default;
            }

            // Replaces all fields, which are marked to be reduced and do not equal to their default value to REDUCED_PLACEHOLDER.
            if (field._meta!.isRedacted == true && record[field.name] != null && record[field.name] != field.default) {
                record[field.name] = this.REDACTED_PLACEHOLDER;
            }
        });

        // read and copy values from context
        if (context) {
            record = this.addContext(record, context);
        }

        record = this.addCustomFields(record, registeredCustomFields, loggerCustomFields, customFieldsFromArgs);
        record["msg"] = util.format.apply(util, args);
        record["type"] = this.LOG_TYPE;
        return record;
    }

    // init a new record and assign fields with output "req-log"
    buildReqRecord(req: any, res: any, context: ReqContext): any {

        const timestamp = new Date();
        const configInstance = Config.getInstance();
        const reqLogFields = configInstance.getReqFields();
        const reqLoggingLevel = configInstance.getReqLoggingLevel();
        let record: any = { "level": reqLoggingLevel };

        const sourceUtils = SourceUtils.getInstance();

        reqLogFields.forEach(field => {
            if (field._meta!.isEnabled == false) {
                return;
            }

            // Assign value
            if (!Array.isArray(field.source)) {
                record[field.name] = sourceUtils.getReqFieldValue(field.name, field.source, record, timestamp, req, res);
            } else {
                record[field.name] = sourceUtils.getValueFromSources(field, record, "req-log", timestamp, req, res);
            }

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
        const config = Config.getInstance();
        const customFieldsFormat = config.getConfig().customFieldsFormat;

        for (var key in providedFields) {
            var value = providedFields[key];

            if (customFieldsFormat == "cloud-logging" || record[key] != null || config.isSettable(key)) {
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
