"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_service_1 = __importDefault(require("../core/env-service"));
const cache_1 = __importDefault(require("../logger/cache"));
const source_utils_1 = require("../logger/source-utils");
const config_cf_json_1 = __importDefault(require("./config-cf.json"));
const config_core_json_1 = __importDefault(require("./config-core.json"));
const config_kyma_json_1 = __importDefault(require("./config-kyma.json"));
const config_request_json_1 = __importDefault(require("./config-request.json"));
const config_sap_passport_json_1 = __importDefault(require("./config-sap-passport.json"));
const config_validator_1 = __importDefault(require("./config-validator"));
const utils_1 = require("./utils");
class Config {
    constructor() {
        this.config = {
            "fields": [],
            "settableFields": [],
            "customFieldsFormat": "cloud-logging",
            "reqLoggingLevel": "info",
            "outputStartupMsg": false,
            "framework": "express"
        };
        this.msgFields = [];
        this.reqFields = [];
        this.contextFields = [];
        this.noCacheMsgFields = [];
        this.noCacheReqFields = [];
    }
    static getInstance() {
        if (!Config.instance) {
            const configFiles = [
                config_core_json_1.default,
                config_request_json_1.default
            ];
            const env = env_service_1.default.getRuntimeName();
            const boundServices = env_service_1.default.getBoundServices();
            if (env == "Kyma") {
                configFiles.push(config_kyma_json_1.default);
            }
            else {
                configFiles.push(config_cf_json_1.default);
            }
            Config.instance = new Config();
            if (boundServices["application-logs"] && boundServices["cloud-logging"]) {
                Config.instance.setCustomFieldsFormat("all");
            }
            else if (boundServices["application-logs"]) {
                Config.instance.setCustomFieldsFormat("application-logging");
                // configFiles.push(appLoggingConfig as ConfigObject);
            }
            else {
                Config.instance.setCustomFieldsFormat("cloud-logging");
                // configFiles.push(cloudLoggingConfig as ConfigObject);
            }
            Config.instance.addConfig(configFiles);
        }
        return Config.instance;
    }
    getConfig() {
        return Config.instance.config;
    }
    getConfigFields(fieldNames) {
        if (fieldNames && fieldNames.length > 0) {
            const result = [];
            fieldNames.forEach(name => {
                const index = this.getIndex(name);
                if (index === -1) {
                    return;
                }
                const configField = Config.instance.config.fields[index];
                result.push(configField);
            });
            return result;
        }
        return Config.instance.config.fields;
    }
    getContextFields() {
        return Config.instance.contextFields;
    }
    getDisabledFields() {
        const filtered = Config.instance.config.fields.filter(key => {
            return key.disable === true;
        });
        return filtered;
    }
    getCacheMsgFields() {
        const filtered = Config.instance.msgFields.filter(key => {
            var _a;
            return ((_a = key._meta) === null || _a === void 0 ? void 0 : _a.isCache) === true;
        });
        return filtered;
    }
    getCacheReqFields() {
        const filtered = Config.instance.reqFields.filter(key => {
            var _a;
            return ((_a = key._meta) === null || _a === void 0 ? void 0 : _a.isCache) === true;
        });
        return filtered;
    }
    getFramework() {
        const framework = Config.instance.config.framework;
        return framework;
    }
    getReqLoggingLevel() {
        return Config.instance.config.reqLoggingLevel;
    }
    addConfig(configs) {
        configs.forEach(file => {
            var _a;
            const validation = config_validator_1.default.isValid(file);
            if (validation != true) {
                const error = JSON.stringify(validation[1]);
                throw new Error("Configuration file is not valid. Please check error: " + error);
            }
            (_a = file.fields) === null || _a === void 0 ? void 0 : _a.forEach(field => {
                var _a, _b, _c, _d;
                if (field.settable) {
                    this.config.settableFields.push(field.name);
                    return;
                }
                field._meta = {
                    isEnabled: true,
                    isRedacted: false,
                    isCache: false,
                    isContext: false
                };
                if (field.envVarSwitch) {
                    field._meta.isEnabled = (0, utils_1.isEnvVarEnabled)(field.envVarSwitch);
                }
                if (field.envVarRedact) {
                    field._meta.isRedacted = !(0, utils_1.isEnvVarEnabled)(field.envVarRedact); // if the env var is actually set to true, we do not redact => invert result
                }
                if (field.disable) {
                    field._meta.isEnabled = false;
                }
                // check if cache field
                if (source_utils_1.SourceUtils.getInstance().isCacheable(field.source)) {
                    field._meta.isCache = true;
                }
                if ((_a = field.output) === null || _a === void 0 ? void 0 : _a.includes('msg-log')) {
                    this.addToList(this.msgFields, field);
                }
                if ((_b = field.output) === null || _b === void 0 ? void 0 : _b.includes('req-log')) {
                    this.addToList(this.reqFields, field);
                }
                // check if context field, if true, then save field in list
                if (field.isContext) {
                    field._meta.isContext = true;
                    this.addToList(this.contextFields, field);
                }
                if (field._meta.isCache == false) {
                    if ((_c = field.output) === null || _c === void 0 ? void 0 : _c.includes("msg-log")) {
                        this.addToList(this.noCacheMsgFields, field);
                    }
                    if ((_d = field.output) === null || _d === void 0 ? void 0 : _d.includes("req-log")) {
                        this.addToList(this.noCacheReqFields, field);
                    }
                }
                const index = Config.instance.getIndex(field.name);
                // if new config field
                if (index === -1) {
                    Config.instance.config.fields.push(field);
                }
                // replace object in array with new field
                Config.instance.config.fields.splice(index, 1, field);
            });
            if (file.outputStartupMsg != undefined) {
                Config.instance.config.outputStartupMsg = file.outputStartupMsg;
            }
            if (file.customFieldsFormat) {
                Config.instance.config.customFieldsFormat = file.customFieldsFormat;
            }
            if (file.framework) {
                Config.instance.config.framework = file.framework;
            }
            if (file.reqLoggingLevel) {
                Config.instance.config.reqLoggingLevel = file.reqLoggingLevel;
            }
            return;
        });
        // if config has changed, cache will have to be updated
        const cache = cache_1.default.getInstance();
        cache.markCacheDirty();
    }
    setCustomFieldsFormat(format) {
        Config.instance.config.customFieldsFormat = format;
    }
    setStartupMessageEnabled(enabled) {
        Config.instance.config.outputStartupMsg = enabled;
    }
    setFramework(framework) {
        Config.instance.config.framework = framework;
    }
    setRequestLogLevel(name) {
        Config.instance.config.reqLoggingLevel = name;
    }
    enableTracing(input) {
        for (var i in input) {
            switch (i.toLowerCase()) {
                case "sap_passport":
                    this.addConfig([config_sap_passport_json_1.default]);
                    break;
                default:
            }
        }
    }
    isSettable(key) {
        if (this.config.settableFields.length == 0)
            return false;
        return this.config.settableFields.includes(key);
    }
    clearFieldsConfig() {
        this.config.fields = [];
        this.config.settableFields = [];
        this.msgFields = [];
        this.reqFields = [];
        this.contextFields = [];
        this.noCacheMsgFields = [];
        this.noCacheReqFields = [];
        const cache = cache_1.default.getInstance();
        cache.markCacheDirty();
    }
    // get index of field in config
    getIndex(name) {
        const index = Config.instance.config.fields.findIndex(field => field.name == name);
        return index;
    }
    addToList(list, field) {
        const index = list.findIndex(element => element.name == field.name);
        if (index === -1) {
            list.push(field);
        }
        else {
            list.splice(index, 1, field);
        }
    }
}
exports.default = Config;
//# sourceMappingURL=config.js.map