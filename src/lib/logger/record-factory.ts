import util from "util";
import Config from "../config/config";
import { isValidObject } from "../middleware/utils";
import Cache from "./cache";
import ReqContext from "./context";
import { SourceUtils } from "./source-utils";
import { StacktraceUtils } from "./stacktrace-utils";
import { outputs } from "../config/interfaces";
const stringifySafe = require('json-stringify-safe');

export default class RecordFactory {

    private static instance: RecordFactory;
    private config: Config;
    private stacktraceUtils: StacktraceUtils;
    private sourceUtils: SourceUtils;
    private LOG_TYPE = "log";
    private cache: Cache;

    private constructor() {
        this.config = Config.getInstance();
        this.stacktraceUtils = StacktraceUtils.getInstance();
        this.sourceUtils = SourceUtils.getInstance();
        this.cache = Cache.getInstance();
    }

    public static getInstance(): RecordFactory {
        if (!RecordFactory.instance) {
            RecordFactory.instance = new RecordFactory();
        }

        return RecordFactory.instance;
    }

    // init a new record and assign fields with output "msg-log"
    buildMsgRecord(registeredCustomFields: Array<string>, loggerCustomFields: Map<string, any>, level: string, args: Array<any>, context?: ReqContext): any {

        var customFieldsFromArgs = {};
        var lastArg = args[args.length - 1];

        let record: any = { "level": level };

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

        // assign cache
        const cacheFields = this.config.getCacheMsgFields();
        const cacheMsgRecord = this.cache.getCacheMsgRecord(cacheFields);
        record = Object.assign(record, cacheMsgRecord);

        // assign dynamic fields
        record = this.addDynamicFields(record, "msg-log", 0);

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
    buildReqRecord(req: any, res: any, context: ReqContext, writtenAt: number): any {
        console.log("buildReqRecord writtenAt:" + writtenAt);
        const reqLoggingLevel = this.config.getReqLoggingLevel();
        let record: any = { "level": reqLoggingLevel };

        // assign cache
        const cacheFields = this.config.getCacheReqFields();
        const cacheReqRecord = this.cache.getCacheReqRecord(cacheFields, req, res);
        record = Object.assign(record, cacheReqRecord);

        // assign dynamic fields
        record = this.addDynamicFields(record, "req-log", writtenAt, req, res);

        record = this.addContext(record, context);

        const loggerCustomFields = Object.assign({}, req.logger.extractCustomFieldsFromLogger(req.logger));
        record = this.addCustomFields(record, req.logger.registeredCustomFields, loggerCustomFields, {});
        return record;
    }

    private addCustomFields(record: any, registeredCustomFields: Array<string>, loggerCustomFields: Map<string, any>, customFieldsFromArgs: any): any {
        var providedFields = Object.assign({}, loggerCustomFields, customFieldsFromArgs);
        const customFieldsFormat = this.config.getConfig().customFieldsFormat!;

        // if format "disabled", do not log any custom fields
        if (customFieldsFormat == "disabled") {
            return record;
        }

        var customFields: any = {};
        var value;
        for (var key in providedFields) {
            var value = providedFields[key];

            // Stringify, if necessary.
            if ((typeof value) != "string") {
                value = stringifySafe(value);
            }

            if (["cloud-logging", "all", "default"].includes(customFieldsFormat) || record[key] != null || this.config.isSettable(key)) {
                record[key] = value;
            }

            if (["application-logging", "all"].includes(customFieldsFormat)) {
                customFields[key] = value;
            }
        }

        //writes custom fields in the correct order and correlates i to the place in registeredCustomFields
        if (Object.keys(customFields).length > 0) {
            let res: any = {};
            res.string = [];
            let key;
            for (var i = 0; i < registeredCustomFields.length; i++) {
                key = registeredCustomFields[i]
                if (customFields[key]) {
                    var value = customFields[key];
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
        return record;
    }

    // read and copy values from context
    private addContext(record: any, context: ReqContext): any {
        const contextFields = context.getProps();
        for (let key in contextFields) {
            if (contextFields[key] != null) {
                record[key] = contextFields[key];
            }
        }
        return record;
    }

    private addDynamicFields(record: any, output: outputs, writtenAt: number, req?: any, res?: object) {
        // assign dynamic fields
        const fields = (output == "msg-log") ? this.config.noCacheMsgFields : this.config.noCacheReqFields;
        fields.forEach(
            field => {
                // ignore context fields because they are handled in addContext()
                if (field._meta?.isContext == true) {
                    return;
                }

                record[field.name] = this.sourceUtils.getValue(field, record, output, writtenAt, req, res);
            }
        );
        return record;
    }
}
