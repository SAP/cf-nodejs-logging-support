"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config/config"));
const env_service_1 = __importDefault(require("../core/env-service"));
const level_1 = __importDefault(require("./level"));
const logger_1 = __importDefault(require("./logger"));
const middleware_1 = __importDefault(require("../middleware/middleware"));
const record_writer_1 = __importDefault(require("./record-writer"));
const response_accessor_1 = __importDefault(require("../middleware/response-accessor"));
const request_Accessor_1 = __importDefault(require("../middleware/request-Accessor"));
const winston_transport_1 = __importDefault(require("../winston/winston-transport"));
class RootLogger extends logger_1.default {
    constructor() {
        super();
        this.config = config_1.default.getInstance();
        this.loggingLevelThreshold = level_1.default.INFO;
    }
    static getInstance() {
        if (!RootLogger.instance) {
            RootLogger.instance = new RootLogger();
        }
        return RootLogger.instance;
    }
    getConfig() {
        return this.config.getConfig();
    }
    getConfigFields(...fieldNames) {
        return this.config.getConfigFields(fieldNames);
    }
    addConfig(...configObject) {
        return this.config.addConfig(configObject);
    }
    clearFieldsConfig() {
        return this.config.clearFieldsConfig();
    }
    setCustomFieldsFormat(format) {
        return this.config.setCustomFieldsFormat(format);
    }
    setStartupMessageEnabled(enabled) {
        return this.config.setStartupMessageEnabled(enabled);
    }
    setSinkFunction(f) {
        record_writer_1.default.getInstance().setSinkFunction(f);
    }
    enableTracing(...input) {
        return this.config.enableTracing(input);
    }
    logNetwork(req, res, next) {
        middleware_1.default.logNetwork(req, res, next);
    }
    getBoundServices() {
        return env_service_1.default.getBoundServices();
    }
    createWinstonTransport(options) {
        if (!options) {
            options = {
                level: 'info'
            };
        }
        options.logMessage = this.logMessage;
        return (0, winston_transport_1.default)(options);
    }
    ;
    forceLogger(logger) {
        config_1.default.getInstance().setFramework(logger);
        request_Accessor_1.default.getInstance().setFrameworkService();
        response_accessor_1.default.getInstance().setFrameworkService();
    }
    // legacy methods
    overrideNetworkField(field, value) {
        if (field == null && typeof field != "string") {
            return false;
        }
        // get field and override config
        const configField = this.config.getConfigFields([field]);
        // if new field, then add as static field
        if (configField.length == 0) {
            this.config.addConfig([
                {
                    "fields": [
                        {
                            "name": field,
                            "source": {
                                "type": "static",
                                "value": value
                            },
                            "output": [
                                "req-log"
                            ]
                        },
                    ]
                }
            ]);
            return true;
        }
        // set static source and override
        configField[0].source = {
            "type": "static",
            "value": value
        };
        this.config.addConfig([
            {
                "fields": [configField[0]]
            }
        ]);
        return true;
    }
    overrideCustomFieldFormat(value) {
        return this.setCustomFieldsFormat(value);
    }
    setLogPattern() { } // no longer supported
}
exports.default = RootLogger;
//# sourceMappingURL=root-logger.js.map