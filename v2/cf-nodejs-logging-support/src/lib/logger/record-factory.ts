import util from "util";
import Config from "../config/config";
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
    private cacheMsgRecord: any;
    private cacheReqRecord: any;


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

    updateCacheMsg() {
        this.cacheMsgRecord = {};

        const writtenAt = new Date();

        const cachedFields = this.config.getCacheMsgFields();
        let cache: any = {};
        cachedFields.forEach(
            field => {
                if (!Array.isArray(field.source)) {
                    cache[field.name] = this.sourceUtils.getFieldValue(field.source, cache, writtenAt);
                } else {
                    const value = this.sourceUtils.getValueFromSources(field, cache, "msg-log", writtenAt);

                    if (value != null) {
                        cache[field.name] = value;
                    }
                }

                // Handle default
                if (cache[field.name] == null && field.default != null) {
                    cache[field.name] = field.default;
                }

                // Replaces all fields, which are marked to be reduced and do not equal to their default value to REDUCED_PLACEHOLDER.
                if (field._meta!.isRedacted == true && cache[field.name] != null && cache[field.name] != field.default) {
                    cache[field.name] = this.REDACTED_PLACEHOLDER;
                }
            }
        );
        this.cacheMsgRecord = cache;
    }

    updateCacheReq(req: any, res: any) {

        const writtenAt = new Date();
        const cachedFields = this.config.getCacheReqFields();
        let cache: any = {};
        cachedFields.forEach(
            field => {
                if (!Array.isArray(field.source)) {
                    cache[field.name] = this.sourceUtils.getReqFieldValue(field.source, cache, writtenAt, req, res);
                } else {
                    const value = this.sourceUtils.getValueFromSources(field, cache, "req-log", writtenAt, req, res);

                    if (value != null) {
                        cache[field.name] = value;
                    }
                }

                // Handle default
                if (cache[field.name] == null && field.default != null) {
                    cache[field.name] = field.default;
                }

                // Replaces all fields, which are marked to be reduced and do not equal to their default value to REDUCED_PLACEHOLDER.
                if (field._meta!.isRedacted == true && cache[field.name] != null && cache[field.name] != field.default) {
                    cache[field.name] = this.REDACTED_PLACEHOLDER;
                }
            }
        );
        this.cacheReqRecord = cache;
    }

    // init a new record and assign fields with output "msg-log"
    buildMsgRecord(registeredCustomFields: Array<string>, loggerCustomFields: Map<string, any>, level: string, args: Array<any>, context?: ReqContext): any {

        const writtenAt = new Date();

        var customFieldsFromArgs = {};
        var lastArg = args[args.length - 1];

        let record: any = {};

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

        // if config has changed, rebuild cache of record
        if (this.config.updateCacheMsgRecord == true) {
            this.updateCacheMsg();
            this.config.updateCacheMsgRecord = false;
        }

        // assign cache to record
        Object.assign(record, this.cacheMsgRecord);

        // assign dynamic fields
        this.config.noCacheMsgFields.forEach(
            field => {
                // ignore context fields because they are handled after forEach loop in addContext()
                if (field._meta?.isContext == true) {
                    return;
                }

                if (!Array.isArray(field.source)) {
                    record[field.name] = this.sourceUtils.getFieldValue(field.source, record, writtenAt);
                } else {
                    const value = this.sourceUtils.getValueFromSources(field, record, "msg-log", writtenAt);
                    if (value != null) {
                        record[field.name] = value;
                    }
                }

                // Handle default
                if (record[field.name] == null && field.default != null) {
                    record[field.name] = field.default;
                }

                // Replaces all fields, which are marked to be reduced and do not equal to their default value to REDUCED_PLACEHOLDER.
                if (field._meta!.isRedacted == true && record[field.name] != null && record[field.name] != field.default) {
                    record[field.name] = this.REDACTED_PLACEHOLDER;
                }
            }
        );

        // read and copy values from context
        if (context) {
            record = this.addContext(record, context);
        }

        record = this.addCustomFields(record, registeredCustomFields, loggerCustomFields, customFieldsFromArgs);

        record["level"] = level;
        record["msg"] = util.format.apply(util, args);
        record["type"] = this.LOG_TYPE;

        return record;
    }

    // init a new record and assign fields with output "req-log"
    buildReqRecord(req: any, res: any, context: ReqContext): any {

        const writtenAt = new Date();
        const reqLoggingLevel = this.config.getReqLoggingLevel();
        let record: any = { "level": reqLoggingLevel };


        // if config has changed, rebuild cache of record
        if (this.config.updateCacheReqRecord == true) {
            this.updateCacheReq(req, res);
            this.config.updateCacheReqRecord = false;
        }

        // assign cache to record
        record = Object.assign(record, this.cacheReqRecord);

        // assign dynamic fields
        this.config.noCacheReqFields.forEach(
            field => {
                // ignore context fields because they are handled after forEach loop in addContext()
                if (field._meta?.isContext == true) {
                    return;
                }

                if (!Array.isArray(field.source)) {
                    record[field.name] = this.sourceUtils.getReqFieldValue(field.source, record, writtenAt, req, res);
                } else {
                    const value = this.sourceUtils.getValueFromSources(field, record, "req-log", writtenAt);
                    if (value != null) {
                        record[field.name] = value;
                    }
                }

                // Handle default
                if (record[field.name] == null && field.default != null) {
                    record[field.name] = field.default;
                }

                // Replaces all fields, which are marked to be reduced and do not equal to their default value to REDUCED_PLACEHOLDER.
                if (field._meta!.isRedacted == true && record[field.name] != null && record[field.name] != field.default) {
                    record[field.name] = this.REDACTED_PLACEHOLDER;
                }
            }
        );

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
