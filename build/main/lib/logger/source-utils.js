"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceUtils = exports.REDACTED_PLACEHOLDER = void 0;
const config_1 = __importDefault(require("../config/config"));
const nested_var_resolver_1 = __importDefault(require("../helper/nested-var-resolver"));
const request_Accessor_1 = __importDefault(require("../middleware/request-Accessor"));
const response_accessor_1 = __importDefault(require("../middleware/response-accessor"));
const stringifySafe = require('json-stringify-safe');
const { v4: uuid } = require('uuid');
const NS_PER_MS = 1e6;
exports.REDACTED_PLACEHOLDER = "redacted";
class SourceUtils {
    constructor() {
        this.lastTimestamp = 0;
        this.requestAccessor = request_Accessor_1.default.getInstance();
        this.responseAccessor = response_accessor_1.default.getInstance();
        this.config = config_1.default.getInstance();
    }
    static getInstance() {
        if (!SourceUtils.instance) {
            SourceUtils.instance = new SourceUtils();
        }
        return SourceUtils.instance;
    }
    isCacheable(source) {
        if (!Array.isArray(source)) {
            if (["static", "env"].includes(source.type)) {
                return true;
            }
        }
        else {
            for (const object of source) {
                switch (object.type) {
                    case "static":
                        return true;
                    case "env":
                        if (this.getEnvFieldValue(object) != null) {
                            return true;
                        }
                        continue;
                    default:
                        return false;
                }
            }
        }
        return false;
    }
    getValue(field, record, origin, writtenAt, req, res) {
        let value;
        if (!Array.isArray(field.source)) {
            switch (origin) {
                case "msg-log":
                    value = this.getFieldValue(field.source, record, writtenAt);
                    break;
                case "req-log":
                    value = this.getReqFieldValue(field.source, record, writtenAt, req, res);
                    break;
                case "context":
                    value = this.getContextFieldValue(field.source, record, req);
                    break;
            }
        }
        else {
            value = this.getValueFromSources(field, record, origin, writtenAt, req, res);
        }
        // Handle default
        if (value == null && field.default != null) {
            value = field.default;
        }
        // Replaces all fields, which are marked to be reduced and do not equal to their default value to REDUCED_PLACEHOLDER.
        if (field._meta.isRedacted == true && value != null && value != field.default) {
            value = exports.REDACTED_PLACEHOLDER;
        }
        // Stringify, if necessary.
        if ((typeof value) != "string") {
            value = stringifySafe(value);
        }
        return value;
    }
    getFieldValue(source, record, writtenAt) {
        let value;
        switch (source.type) {
            case "static":
                value = source.value;
                break;
            case "env":
                value = this.getEnvFieldValue(source);
                break;
            case "config-field":
                value = record[source.fieldName];
                break;
            case "meta":
                if (writtenAt == null) {
                    return;
                }
                if (source.fieldName == "request_received_at") {
                    value = record["written_at"];
                    break;
                }
                if (source.fieldName == "response_time_ms") {
                    value = (Date.now() - writtenAt.getTime());
                    break;
                }
                if (source.fieldName == "response_sent_at") {
                    value = new Date().toJSON();
                    break;
                }
                if (source.fieldName == "written_at") {
                    value = writtenAt.toJSON();
                    break;
                }
                if (source.fieldName == "written_ts") {
                    var lower = process.hrtime()[1] % NS_PER_MS;
                    var higher = writtenAt.getTime() * NS_PER_MS;
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
    getReqFieldValue(source, record, writtenAt, req, res) {
        if (req == null || res == null) {
            throw new Error("Please pass req and res as argument to get value for req-log field.");
        }
        let value;
        switch (source.type) {
            case "req-header":
                value = this.requestAccessor.getHeaderField(req, source.fieldName);
                break;
            case "req-object":
                value = this.requestAccessor.getField(req, source.fieldName);
                break;
            case "res-header":
                value = this.responseAccessor.getHeaderField(res, source.fieldName);
                break;
            case "res-object":
                value = this.responseAccessor.getField(res, source.fieldName);
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
    getContextFieldValue(source, record, req) {
        if (req == null) {
            throw new Error("Please pass req as argument to get value for req-log field.");
        }
        let value;
        switch (source.type) {
            case "req-header":
                value = this.requestAccessor.getHeaderField(req, source.fieldName);
                break;
            case "req-object":
                value = this.requestAccessor.getField(req, source.fieldName);
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
    getValueFromSources(field, record, origin, writtenAt, req, res) {
        if (origin == "req-log" && (req == null || res == null)) {
            throw new Error("Please pass req and res as argument to get value for req-log field.");
        }
        if (origin == "context" && (req == null)) {
            throw new Error("Please pass req as argument to get value for context field.");
        }
        field.source = field.source;
        let sourceIndex = 0;
        let fieldValue;
        while (fieldValue == null) {
            sourceIndex = this.getNextValidSourceIndex(field.source, sourceIndex);
            if (sourceIndex == -1) {
                return;
            }
            let source = field.source[sourceIndex];
            fieldValue = origin == "msg-log" ? this.getFieldValue(source, record, writtenAt) :
                origin == "req-log" ? this.getReqFieldValue(source, record, writtenAt, req, res) :
                    this.getContextFieldValue(source, record, req);
            if (source.regExp && fieldValue) {
                fieldValue = this.validateRegExp(fieldValue, source.regExp);
            }
            ++sourceIndex;
        }
        return fieldValue;
    }
    getEnvFieldValue(source) {
        if (source.path) {
            // clone path to avoid deleting path in resolveNestedVariable()
            const clonedPath = [...source.path];
            return nested_var_resolver_1.default.resolveNestedVariable(process.env, clonedPath);
        }
        return process.env[source.varName];
    }
    // returns -1 when all sources were iterated
    getNextValidSourceIndex(sources, startIndex) {
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
    validateRegExp(value, regEx) {
        const regExp = new RegExp(regEx);
        const isValid = regExp.test(value);
        if (isValid) {
            return value;
        }
        return undefined;
    }
}
exports.SourceUtils = SourceUtils;
//# sourceMappingURL=source-utils.js.map