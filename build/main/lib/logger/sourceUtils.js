"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const config_1 = __importDefault(require("../config/config"));
const interfaces_1 = require("../config/interfaces");
const envVarHelper_1 = __importDefault(require("../helper/envVarHelper"));
const requestAccessor_1 = __importDefault(require("../middleware/requestAccessor"));
const responseAccessor_1 = __importDefault(require("../middleware/responseAccessor"));
const level_1 = require("../logger/level");
const NS_PER_MS = 1e6;
const REDACTED_PLACEHOLDER = "redacted";
class SourceUtils {
    constructor() {
        this.lastTimestamp = 0;
        this.requestAccessor = requestAccessor_1.default.getInstance();
        this.responseAccessor = responseAccessor_1.default.getInstance();
        this.config = config_1.default.getInstance();
    }
    static getInstance() {
        if (!SourceUtils.instance) {
            SourceUtils.instance = new SourceUtils();
        }
        return SourceUtils.instance;
    }
    getValue(field, record, output, req, res) {
        if (!field.source)
            return undefined;
        let sources = Array.isArray(field.source) ? field.source : [field.source];
        let value;
        let sourceIndex = 0;
        while (value == null) {
            sourceIndex = this.getNextValidSourceIndex(sources, output, sourceIndex);
            if (sourceIndex == -1) {
                break;
            }
            let source = sources[sourceIndex];
            value = this.getValueFromSource(source, record, output, req, res);
            sourceIndex++;
        }
        // Handle default
        if (value == null && field.default != null) {
            value = field.default;
        }
        if (value != null && field.convert != null) {
            switch (field.convert) {
                case interfaces_1.Conversion.ToString:
                    value = value.toString ? value.toString() : undefined;
                    break;
                case interfaces_1.Conversion.ParseBoolean:
                    value = this.parseBooleanValue(value);
                    break;
                case interfaces_1.Conversion.ParseInt:
                    value = this.parseIntValue(value);
                    break;
                case interfaces_1.Conversion.ParseFloat:
                    value = this.parseFloatValue(value);
                    break;
            }
        }
        // Replaces all fields, which are marked to be reduced and do not equal to their default value to REDUCED_PLACEHOLDER.
        if (field._meta.isRedacted == true && value != null && value != field.default) {
            value = REDACTED_PLACEHOLDER;
        }
        return value;
    }
    getValueFromSource(source, record, output, req, res) {
        let value;
        switch (source.type) {
            case interfaces_1.SourceType.ReqHeader:
                value = req ? this.requestAccessor.getHeaderField(req, source.fieldName) : undefined;
                break;
            case interfaces_1.SourceType.ReqObject:
                value = req ? this.requestAccessor.getField(req, source.fieldName) : undefined;
                break;
            case interfaces_1.SourceType.ResHeader:
                value = res ? this.responseAccessor.getHeaderField(res, source.fieldName) : undefined;
                break;
            case interfaces_1.SourceType.ResObject:
                value = res ? this.responseAccessor.getField(res, source.fieldName) : undefined;
                break;
            case interfaces_1.SourceType.Static:
                value = source.value;
                break;
            case interfaces_1.SourceType.Env:
                value = this.getEnvFieldValue(source);
                break;
            case interfaces_1.SourceType.ConfigField:
                let fields = this.config.getConfigFields([source.fieldName]);
                value = fields.length >= 1 ? this.getValue(fields[0], record, output, req, res) : undefined;
                break;
            case interfaces_1.SourceType.Detail:
                value = this.getDetail(source.detailName, record, req, res);
                break;
            case interfaces_1.SourceType.UUID:
                value = (0, uuid_1.v4)();
                break;
        }
        if (source.regExp && value != null && typeof value == "string") {
            value = this.validateRegExp(value, source.regExp);
        }
        return value;
    }
    getDetail(detailName, record, req, res) {
        let value;
        switch (detailName) {
            case interfaces_1.DetailName.RequestReceivedAt:
                value = req ? new Date(req._receivedAt).toJSON() : undefined;
                break;
            case interfaces_1.DetailName.ResponseSentAt:
                value = res ? new Date(res._sentAt).toJSON() : undefined;
                break;
            case interfaces_1.DetailName.ResponseTimeMs:
                value = req && res ? (res._sentAt - req._receivedAt) : undefined;
                break;
            case interfaces_1.DetailName.WrittenAt:
                value = new Date().toJSON();
                break;
            case interfaces_1.DetailName.WrittenTs:
                const lower = process.hrtime()[1] % NS_PER_MS;
                const higher = Date.now() * NS_PER_MS;
                let writtenTs = higher + lower;
                // This reorders written_ts, if the new timestamp seems to be smaller
                // due to different rollover times for process.hrtime and reqReceivedAt.getTime
                if (writtenTs < this.lastTimestamp) {
                    writtenTs += NS_PER_MS;
                }
                this.lastTimestamp = writtenTs;
                value = writtenTs;
                break;
            case interfaces_1.DetailName.Message:
                value = record.metadata.message;
                break;
            case interfaces_1.DetailName.Stacktrace:
                value = record.metadata.stacktrace;
                break;
            case interfaces_1.DetailName.Level:
                value = level_1.LevelUtils.getName(record.metadata.level);
                break;
        }
        return value;
    }
    getEnvFieldValue(source) {
        if (source.path) {
            return envVarHelper_1.default.getInstance().resolveNestedVar(source.path);
        }
        else {
            return process.env[source.varName];
        }
    }
    // returns -1 when all sources were iterated
    getNextValidSourceIndex(sources, output, startIndex) {
        const framework = this.config.getFramework();
        for (let i = startIndex; i < sources.length; i++) {
            let source = sources[i];
            if (!source.framework || source.framework == framework) {
                if (!source.output || source.output == output) {
                    return i;
                }
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
    parseIntValue(value) {
        switch (typeof value) {
            case 'string':
                return parseInt(value, 0);
            case 'number':
                return value;
            case 'boolean':
                return value ? 1 : 0;
        }
        return 0;
    }
    parseFloatValue(value) {
        switch (typeof value) {
            case 'string':
                return parseFloat(value);
            case 'number':
                return value;
            case 'boolean':
                return value ? 1 : 0;
        }
        return 0;
    }
    parseBooleanValue(value) {
        return value === 'true' || value === 'TRUE' || value === 'True' || value === 1 || value === true;
    }
}
exports.default = SourceUtils;
//# sourceMappingURL=sourceUtils.js.map