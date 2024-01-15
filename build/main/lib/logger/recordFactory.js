"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const json_stringify_safe_1 = __importDefault(require("json-stringify-safe"));
const util_1 = __importDefault(require("util"));
const config_1 = __importDefault(require("../config/config"));
const interfaces_1 = require("../config/interfaces");
const stacktraceUtils_1 = __importDefault(require("../helper/stacktraceUtils"));
const utils_1 = require("../middleware/utils");
const cache_1 = __importDefault(require("./cache"));
const record_1 = require("./record");
const sourceUtils_1 = __importDefault(require("./sourceUtils"));
class RecordFactory {
    constructor() {
        this.config = config_1.default.getInstance();
        this.sourceUtils = sourceUtils_1.default.getInstance();
        this.cache = cache_1.default.getInstance();
        this.stacktraceUtils = stacktraceUtils_1.default.getInstance();
    }
    static getInstance() {
        if (!RecordFactory.instance) {
            RecordFactory.instance = new RecordFactory();
        }
        return RecordFactory.instance;
    }
    // init a new record and assign fields with output "msg-log"
    buildMsgRecord(registeredCustomFields, loggerCustomFields, level, args, context) {
        const lastArg = args[args.length - 1];
        let customFieldsFromArgs = new Map();
        let record = new record_1.Record(record_1.RecordType.Message, level);
        if (typeof lastArg === "object") {
            if (this.stacktraceUtils.isErrorWithStacktrace(lastArg)) {
                record.metadata.stacktrace = this.stacktraceUtils.prepareStacktrace(lastArg.stack);
            }
            else if ((0, utils_1.isValidObject)(lastArg)) {
                if (this.stacktraceUtils.isErrorWithStacktrace(lastArg._error)) {
                    record.metadata.stacktrace = this.stacktraceUtils.prepareStacktrace(lastArg._error.stack);
                    delete lastArg._error;
                }
                customFieldsFromArgs = new Map(Object.entries(lastArg));
            }
            else if (lastArg instanceof Map) {
                customFieldsFromArgs = lastArg;
            }
            args.pop();
        }
        // assign static fields from cache
        const cacheFields = this.config.getCacheMsgFields();
        const cacheMsgRecord = this.cache.getCacheMsgRecord(cacheFields);
        Object.assign(record.payload, cacheMsgRecord);
        record.metadata.message = util_1.default.format.apply(util_1.default, args);
        // assign dynamic fields
        this.addDynamicFields(record, interfaces_1.Output.MsgLog);
        // assign values from request context if present
        if (context) {
            this.addContext(record, context);
        }
        // assign custom fields
        this.addCustomFields(record, registeredCustomFields, loggerCustomFields, customFieldsFromArgs);
        return record;
    }
    // init a new record and assign fields with output "req-log"
    buildReqRecord(level, req, res, context) {
        let record = new record_1.Record(record_1.RecordType.Request, level);
        // assign static fields from cache
        const cacheFields = this.config.getCacheReqFields();
        const cacheReqRecord = this.cache.getCacheReqRecord(cacheFields, req, res);
        Object.assign(record.payload, cacheReqRecord);
        // assign dynamic fields
        this.addDynamicFields(record, interfaces_1.Output.ReqLog, req, res);
        // assign values request context
        this.addContext(record, context);
        // assign custom fields
        const loggerCustomFields = req.logger.getCustomFieldsFromLogger(req.logger);
        this.addCustomFields(record, req.logger.registeredCustomFields, loggerCustomFields);
        return record;
    }
    addCustomFields(record, registeredCustomFields, loggerCustomFields, customFieldsFromArgs = new Map()) {
        const providedFields = new Map([...loggerCustomFields, ...customFieldsFromArgs]);
        const customFieldsFormat = this.config.getConfig().customFieldsFormat;
        // if format "disabled", do not log any custom fields
        if (customFieldsFormat == interfaces_1.CustomFieldsFormat.Disabled) {
            return;
        }
        let indexedCustomFields = {};
        providedFields.forEach((value, key) => {
            // Stringify, if necessary.
            if ((typeof value) != "string") {
                value = (0, json_stringify_safe_1.default)(value);
            }
            if ([interfaces_1.CustomFieldsFormat.CloudLogging, interfaces_1.CustomFieldsFormat.All, interfaces_1.CustomFieldsFormat.Default].includes(customFieldsFormat)
                || record.payload[key] != null || this.config.isSettable(key)) {
                record.payload[key] = value;
            }
            if ([interfaces_1.CustomFieldsFormat.ApplicationLogging, interfaces_1.CustomFieldsFormat.All].includes(customFieldsFormat)) {
                indexedCustomFields[key] = value;
            }
        });
        //writes custom fields in the correct order and correlates i to the place in registeredCustomFields
        if (Object.keys(indexedCustomFields).length > 0) {
            let res = {};
            res.string = [];
            let key;
            for (let i = 0; i < registeredCustomFields.length; i++) {
                key = registeredCustomFields[i];
                if (indexedCustomFields[key]) {
                    let value = indexedCustomFields[key];
                    res.string.push({
                        "k": key,
                        "v": value,
                        "i": i
                    });
                }
            }
            if (res.string.length > 0) {
                record.payload["#cf"] = res;
            }
        }
    }
    // read and copy values from context
    addContext(record, context) {
        const contextFields = context.getProperties();
        for (let key in contextFields) {
            if (contextFields[key] != null) {
                record.payload[key] = contextFields[key];
            }
        }
    }
    addDynamicFields(record, output, req, res) {
        // assign dynamic fields
        const fields = (output == interfaces_1.Output.MsgLog) ? this.config.noCacheMsgFields : this.config.noCacheReqFields;
        fields.forEach(field => {
            var _a;
            // ignore context fields because they are handled in addContext()
            if (((_a = field._meta) === null || _a === void 0 ? void 0 : _a.isContext) == true) {
                return;
            }
            record.payload[field.name] = this.sourceUtils.getValue(field, record, output, req, res);
        });
    }
}
exports.default = RecordFactory;
//# sourceMappingURL=recordFactory.js.map