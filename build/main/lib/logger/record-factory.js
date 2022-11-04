"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = __importDefault(require("util"));
const config_1 = __importDefault(require("../config/config"));
const utils_1 = require("../middleware/utils");
const cache_1 = __importDefault(require("./cache"));
const source_utils_1 = require("./source-utils");
const stacktrace_utils_1 = require("./stacktrace-utils");
const stringifySafe = require('json-stringify-safe');
class RecordFactory {
    constructor() {
        this.LOG_TYPE = "log";
        this.config = config_1.default.getInstance();
        this.stacktraceUtils = stacktrace_utils_1.StacktraceUtils.getInstance();
        this.sourceUtils = source_utils_1.SourceUtils.getInstance();
        this.cache = cache_1.default.getInstance();
    }
    static getInstance() {
        if (!RecordFactory.instance) {
            RecordFactory.instance = new RecordFactory();
        }
        return RecordFactory.instance;
    }
    // init a new record and assign fields with output "msg-log"
    buildMsgRecord(registeredCustomFields, loggerCustomFields, level, args, context) {
        var customFieldsFromArgs = {};
        var lastArg = args[args.length - 1];
        let record = { "level": level };
        if (typeof lastArg === "object") {
            if (this.stacktraceUtils.isErrorWithStacktrace(lastArg)) {
                record.stacktrace = this.stacktraceUtils.prepareStacktrace(lastArg.stack);
            }
            else if ((0, utils_1.isValidObject)(lastArg)) {
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
        record = this.addDynamicFields(record, "msg-log");
        // read and copy values from context
        if (context) {
            record = this.addContext(record, context);
        }
        record = this.addCustomFields(record, registeredCustomFields, loggerCustomFields, customFieldsFromArgs);
        record["msg"] = util_1.default.format.apply(util_1.default, args);
        record["type"] = this.LOG_TYPE;
        return record;
    }
    // init a new record and assign fields with output "req-log"
    buildReqRecord(req, res, context) {
        const reqLoggingLevel = this.config.getReqLoggingLevel();
        let record = { "level": reqLoggingLevel };
        // assign cache
        const cacheFields = this.config.getCacheReqFields();
        const cacheReqRecord = this.cache.getCacheReqRecord(cacheFields, req, res);
        record = Object.assign(record, cacheReqRecord);
        // assign dynamic fields
        record = this.addDynamicFields(record, "req-log", req, res);
        record = this.addContext(record, context);
        const loggerCustomFields = Object.assign({}, req.logger.extractCustomFieldsFromLogger(req.logger));
        record = this.addCustomFields(record, req.logger.registeredCustomFields, loggerCustomFields, {});
        return record;
    }
    addCustomFields(record, registeredCustomFields, loggerCustomFields, customFieldsFromArgs) {
        var providedFields = Object.assign({}, loggerCustomFields, customFieldsFromArgs);
        const customFieldsFormat = this.config.getConfig().customFieldsFormat;
        // if format "disabled", do not log any custom fields
        if (customFieldsFormat == "disabled") {
            return record;
        }
        var customFields = {};
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
            let res = {};
            res.string = [];
            let key;
            for (var i = 0; i < registeredCustomFields.length; i++) {
                key = registeredCustomFields[i];
                if (customFields[key]) {
                    var value = customFields[key];
                    res.string.push({
                        "k": key,
                        "v": value,
                        "i": i
                    });
                }
            }
            if (res.string.length > 0)
                record["#cf"] = res;
        }
        return record;
    }
    // read and copy values from context
    addContext(record, context) {
        const contextFields = context.getProps();
        for (let key in contextFields) {
            if (contextFields[key] != null) {
                record[key] = contextFields[key];
            }
        }
        return record;
    }
    addDynamicFields(record, output, req, res) {
        const writtenAt = new Date();
        // assign dynamic fields
        const fields = (output == "msg-log") ? this.config.noCacheMsgFields : this.config.noCacheReqFields;
        fields.forEach(field => {
            var _a;
            // ignore context fields because they are handled in addContext()
            if (((_a = field._meta) === null || _a === void 0 ? void 0 : _a.isContext) == true) {
                return;
            }
            record[field.name] = this.sourceUtils.getValue(field, record, output, writtenAt, req, res);
        });
        return record;
    }
}
exports.default = RecordFactory;
//# sourceMappingURL=record-factory.js.map