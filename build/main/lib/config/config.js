"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const envService_1 = __importDefault(require("../helper/envService"));
const envVarHelper_1 = __importDefault(require("../helper/envVarHelper"));
const cache_1 = __importDefault(require("../logger/cache"));
const configValidator_1 = __importDefault(require("./configValidator"));
const config_cf_json_1 = __importDefault(require("./default/config-cf.json"));
const config_core_json_1 = __importDefault(require("./default/config-core.json"));
const config_kyma_json_1 = __importDefault(require("./default/config-kyma.json"));
const config_request_json_1 = __importDefault(require("./default/config-request.json"));
const config_sap_passport_json_1 = __importDefault(require("./default/config-sap-passport.json"));
const interfaces_1 = require("./interfaces");
class Config {
    constructor() {
        this.msgFields = [];
        this.reqFields = [];
        this.contextFields = [];
        this.config = {
            "fields": [],
            "customFieldsFormat": interfaces_1.CustomFieldsFormat.Default,
            "reqLoggingLevel": "info",
            "outputStartupMsg": false,
            "framework": interfaces_1.Framework.Express
        };
        this.validator = new configValidator_1.default();
        this.envVarHelper = envVarHelper_1.default.getInstance();
        this.noCacheMsgFields = [];
        this.noCacheReqFields = [];
    }
    static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config();
            const configFiles = [
                config_core_json_1.default,
                config_request_json_1.default
            ];
            const envService = envService_1.default.getInstance();
            const env = envService.getRuntimeName();
            const boundServices = envService.getBoundServices();
            if (env == "Kyma") {
                configFiles.push(config_kyma_json_1.default);
            }
            else {
                configFiles.push(config_cf_json_1.default);
            }
            if (boundServices["application-logs"] && boundServices["cloud-logging"]) {
                Config.instance.setCustomFieldsFormat(interfaces_1.CustomFieldsFormat.All);
            }
            else if (boundServices["application-logs"]) {
                Config.instance.setCustomFieldsFormat(interfaces_1.CustomFieldsFormat.ApplicationLogging);
            }
            else {
                Config.instance.setCustomFieldsFormat(interfaces_1.CustomFieldsFormat.CloudLogging);
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
        let level = Config.instance.config.reqLoggingLevel;
        return level ? level : "info";
    }
    addConfig(configs) {
        configs.forEach(file => {
            var _a;
            const validation = this.validator.isValid(file);
            if (validation != true) {
                const error = JSON.stringify(validation[1]);
                throw new Error("Configuration file is not valid. Please check error: " + error);
            }
            (_a = file.fields) === null || _a === void 0 ? void 0 : _a.forEach(field => {
                var _a, _b, _c, _d;
                const index = Config.instance.getIndex(field.name);
                // if new config field
                if (index === -1) {
                    Config.instance.config.fields.push(field);
                }
                // replace object in array with new field
                Config.instance.config.fields.splice(index, 1, field);
                if (field.settable || !field.source) {
                    return;
                }
                field._meta = {
                    isEnabled: true,
                    isRedacted: false,
                    isCache: false,
                    isContext: false
                };
                if (field.envVarSwitch) {
                    field._meta.isEnabled = this.envVarHelper.isVarEnabled(field.envVarSwitch);
                }
                if (field.envVarRedact) {
                    // if the env var is actually set to true, we do not redact => invert result
                    field._meta.isRedacted = !this.envVarHelper.isVarEnabled(field.envVarRedact);
                }
                if (field.disable) {
                    field._meta.isEnabled = false;
                }
                // check if cache field
                if (this.isCacheable(field.source)) {
                    field._meta.isCache = true;
                }
                if ((_a = field.output) === null || _a === void 0 ? void 0 : _a.includes(interfaces_1.Output.MsgLog)) {
                    this.addToList(this.msgFields, field);
                }
                if ((_b = field.output) === null || _b === void 0 ? void 0 : _b.includes(interfaces_1.Output.ReqLog)) {
                    this.addToList(this.reqFields, field);
                }
                // check if context field, if true, then save field in list
                if (field.isContext) {
                    field._meta.isContext = true;
                    this.addToList(this.contextFields, field);
                }
                if (field._meta.isCache == false) {
                    if ((_c = field.output) === null || _c === void 0 ? void 0 : _c.includes(interfaces_1.Output.MsgLog)) {
                        this.addToList(this.noCacheMsgFields, field);
                    }
                    if ((_d = field.output) === null || _d === void 0 ? void 0 : _d.includes(interfaces_1.Output.ReqLog)) {
                        this.addToList(this.noCacheReqFields, field);
                    }
                }
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
        cache.markDirty();
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
        let names = [];
        if (typeof input == "string")
            names.push(input);
        else
            names = input;
        for (let i in names) {
            switch (names[i].toLowerCase()) {
                case "sap_passport":
                    this.addConfig([config_sap_passport_json_1.default]);
                    break;
                default:
            }
        }
    }
    isSettable(name) {
        const index = this.getIndex(name);
        if (index === -1) {
            return false;
        }
        const configField = Config.instance.config.fields[index];
        return configField.settable === true;
    }
    clearFieldsConfig() {
        this.config.fields = [];
        this.msgFields = [];
        this.reqFields = [];
        this.contextFields = [];
        this.noCacheMsgFields = [];
        this.noCacheReqFields = [];
        const cache = cache_1.default.getInstance();
        cache.markDirty();
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
    isCacheable(s) {
        let sources = Array.isArray(s) ? s : [s];
        for (let i in sources) {
            let source = sources[i];
            switch (source.type) {
                case interfaces_1.SourceType.Static:
                    return true;
                case interfaces_1.SourceType.Env:
                    // if this is the last source it does not matter, if the env var exists
                    if (i == (sources.length - 1).toString())
                        return true;
                    // otherwise we have to check if there is a value to be sure that the field can be cached.
                    let value;
                    if (source.path) {
                        value = envVarHelper_1.default.getInstance().resolveNestedVar(source.path);
                    }
                    else {
                        value = process.env[source.varName];
                    }
                    if (value != null)
                        return true;
                    break;
                default:
                    return false;
            }
        }
        return false;
    }
}
exports.default = Config;
//# sourceMappingURL=config.js.map