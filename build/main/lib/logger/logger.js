"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const level_1 = __importDefault(require("./level"));
const level_utils_1 = __importDefault(require("./level-utils"));
const record_writer_1 = __importDefault(require("./record-writer"));
const record_factory_1 = __importDefault(require("./record-factory"));
const utils_1 = require("../middleware/utils");
class Logger {
    constructor(parent, reqContext) {
        this.parent = undefined;
        this.registeredCustomFields = [];
        this.customFields = new Map();
        this.loggingLevelThreshold = level_1.default.INHERIT;
        if (parent) {
            this.parent = parent;
            this.registeredCustomFields = parent.registeredCustomFields;
        }
        if (reqContext) {
            this.context = reqContext;
        }
        this.recordFactory = record_factory_1.default.getInstance();
        this.recordWriter = record_writer_1.default.getInstance();
    }
    createLogger(customFields) {
        let logger = new Logger(this);
        // assign custom fields, if provided
        if (customFields) {
            logger.setCustomFields(customFields);
        }
        return logger;
    }
    setLoggingLevel(name) {
        this.loggingLevelThreshold = level_utils_1.default.getLevel(name);
    }
    getLoggingLevel() {
        if (this.loggingLevelThreshold == level_1.default.INHERIT) {
            return this.parent.getLoggingLevel();
        }
        return level_utils_1.default.getName(this.loggingLevelThreshold);
    }
    isLoggingLevel(name) {
        if (this.loggingLevelThreshold == level_1.default.INHERIT) {
            return this.parent.isLoggingLevel(name);
        }
        const level = level_utils_1.default.getLevel(name);
        return level_utils_1.default.isLevelEnabled(this.loggingLevelThreshold, level);
    }
    logMessage(levelName, ..._args) {
        if (!this.isLoggingLevel(levelName))
            return;
        const loggerCustomFields = Object.assign({}, this.extractCustomFieldsFromLogger(this));
        const record = this.recordFactory.buildMsgRecord(this.registeredCustomFields, loggerCustomFields, levelName, _args, this.context);
        this.recordWriter.writeLog(record);
    }
    error() {
        this.logMessage("error", ...arguments);
    }
    warn() {
        this.logMessage("warn", ...arguments);
    }
    info() {
        this.logMessage("info", ...arguments);
    }
    verbose() {
        this.logMessage("verbose", ...arguments);
    }
    debug() {
        this.logMessage("debug", ...arguments);
    }
    silly() {
        this.logMessage("silly", ...arguments);
    }
    isError() {
        return this.isLoggingLevel("error");
    }
    isWarn() {
        return this.isLoggingLevel("warn");
    }
    isInfo() {
        return this.isLoggingLevel("info");
    }
    isVerbose() {
        return this.isLoggingLevel("verbose");
    }
    isDebug() {
        return this.isLoggingLevel("debug");
    }
    isSilly() {
        return this.isLoggingLevel("silly");
    }
    registerCustomFields(fieldNames) {
        this.registeredCustomFields.splice(0, this.registeredCustomFields.length);
        this.registeredCustomFields.push(...fieldNames);
    }
    setCustomFields(customFields) {
        this.customFields = customFields;
    }
    getCustomFields() {
        if (this.parent) {
            return new Map([...this.parent.getCustomFields(), ...this.customFields.entries()]);
        }
        else {
            return new Map(...this.customFields.entries());
        }
    }
    getCorrelationId() {
        var _a;
        return (_a = this.context) === null || _a === void 0 ? void 0 : _a.getProp("correlation_id");
    }
    setCorrelationId(value) {
        var _a;
        (_a = this.context) === null || _a === void 0 ? void 0 : _a.setProp("correlation_id", value);
    }
    getTenantId() {
        var _a;
        return (_a = this.context) === null || _a === void 0 ? void 0 : _a.getProp("tenant_id");
    }
    setTenantId(value) {
        var _a;
        (_a = this.context) === null || _a === void 0 ? void 0 : _a.setProp("tenant_id", value);
    }
    getTenantSubdomain() {
        var _a;
        return (_a = this.context) === null || _a === void 0 ? void 0 : _a.getProp("tenant_subdomain");
    }
    setTenantSubdomain(value) {
        var _a;
        (_a = this.context) === null || _a === void 0 ? void 0 : _a.setProp("tenant_subdomain", value);
    }
    extractCustomFieldsFromLogger(logger) {
        let fields = {};
        if (logger.parent && logger.parent !== this) {
            fields = this.extractCustomFieldsFromLogger(logger.parent);
        }
        if ((0, utils_1.isValidObject)(logger.customFields)) {
            fields = Object.assign(fields, logger.customFields);
        }
        return fields;
    }
}
exports.default = Logger;
//# sourceMappingURL=logger.js.map