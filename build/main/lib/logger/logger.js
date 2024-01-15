"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const utils_1 = require("../middleware/utils");
const level_1 = require("./level");
const recordFactory_1 = __importDefault(require("./recordFactory"));
const context_1 = __importDefault(require("./context"));
const pluginProvider_1 = __importDefault(require("../helper/pluginProvider"));
class Logger {
    constructor(parent, context) {
        this.parent = undefined;
        this.registeredCustomFields = [];
        this.customFields = new Map();
        this.loggingLevelThreshold = level_1.Level.Inherit;
        if (parent) {
            this.parent = parent;
            this.registeredCustomFields = parent.registeredCustomFields;
        }
        if (context) {
            this.context = context;
        }
        this.recordFactory = recordFactory_1.default.getInstance();
    }
    createLogger(customFields, createNewContext) {
        let context = createNewContext == true ? new context_1.default() : this.context;
        let logger = new Logger(this, context);
        // assign custom fields, if provided
        if (customFields) {
            logger.setCustomFields(customFields);
        }
        return logger;
    }
    setLoggingLevel(level) {
        this.loggingLevelThreshold = level_1.LevelUtils.getLevel(level);
    }
    getLoggingLevel() {
        if (this.loggingLevelThreshold == level_1.Level.Inherit) {
            return this.parent.getLoggingLevel();
        }
        return level_1.LevelUtils.getName(this.loggingLevelThreshold);
    }
    isLoggingLevel(level) {
        if (this.loggingLevelThreshold == level_1.Level.Inherit) {
            return this.parent.isLoggingLevel(level);
        }
        return level_1.LevelUtils.isLevelEnabled(this.loggingLevelThreshold, level_1.LevelUtils.getLevel(level));
    }
    logMessage(level, ...args) {
        if (!this.isLoggingLevel(level))
            return;
        const loggerCustomFields = this.getCustomFieldsFromLogger(this);
        const record = this.recordFactory.buildMsgRecord(this.registeredCustomFields, loggerCustomFields, level_1.LevelUtils.getLevel(level), args, this.context);
        pluginProvider_1.default.getInstance().getOutputPlugins().forEach(output => { output.writeRecord(record); });
    }
    error(...args) {
        this.logMessage("error", ...args);
    }
    warn(...args) {
        this.logMessage("warn", ...args);
    }
    info(...args) {
        this.logMessage("info", ...args);
    }
    verbose(...args) {
        this.logMessage("verbose", ...args);
    }
    debug(...args) {
        this.logMessage("debug", ...args);
    }
    silly(...args) {
        this.logMessage("silly", ...args);
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
        if (customFields instanceof Map) {
            this.customFields = customFields;
        }
        else if ((0, utils_1.isValidObject)(customFields)) {
            this.customFields = new Map(Object.entries(customFields));
        }
    }
    getCustomFields() {
        return this.getCustomFieldsFromLogger(this);
    }
    getContextProperty(name) {
        var _a;
        return (_a = this.context) === null || _a === void 0 ? void 0 : _a.getProperty(name);
    }
    setContextProperty(name, value) {
        if (this.context) {
            this.context.setProperty(name, value);
            return true;
        }
        return false;
    }
    getCorrelationId() {
        return this.getContextProperty("correlation_id");
    }
    setCorrelationId(value) {
        return this.setContextProperty("correlation_id", value);
    }
    getTenantId() {
        return this.getContextProperty("tenant_id");
    }
    setTenantId(value) {
        return this.setContextProperty("tenant_id", value);
    }
    getTenantSubdomain() {
        return this.getContextProperty("tenant_subdomain");
    }
    setTenantSubdomain(value) {
        return this.setContextProperty("tenant_subdomain", value);
    }
    getCustomFieldsFromLogger(logger) {
        if (logger.parent && logger.parent !== this) {
            let parentFields = this.getCustomFieldsFromLogger(logger.parent);
            return new Map([...parentFields, ...logger.customFields]);
        }
        return logger.customFields;
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map