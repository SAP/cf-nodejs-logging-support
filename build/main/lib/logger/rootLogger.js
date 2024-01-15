"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config/config"));
const interfaces_1 = require("../config/interfaces");
const envService_1 = __importDefault(require("../helper/envService"));
const middleware_1 = __importDefault(require("../middleware/middleware"));
const requestAccessor_1 = __importDefault(require("../middleware/requestAccessor"));
const responseAccessor_1 = __importDefault(require("../middleware/responseAccessor"));
const defaultOutput_1 = require("../plugins/defaultOutput");
const pluginProvider_1 = __importDefault(require("../helper/pluginProvider"));
const winstonTransport_1 = __importDefault(require("../winston/winstonTransport"));
const level_1 = require("./level");
const logger_1 = require("./logger");
class RootLogger extends logger_1.Logger {
    constructor() {
        super();
        this.config = config_1.default.getInstance();
        this.loggingLevelThreshold = level_1.Level.Info;
        this.defaultOutput = new defaultOutput_1.DefaultOutput();
        pluginProvider_1.default.getInstance().setOutputPlugins([this.defaultOutput]);
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
    setSinkFunction(func) {
        this.defaultOutput.setSinkFunction(func);
    }
    addOutputPlugin(outputPlugin) {
        pluginProvider_1.default.getInstance().addOutputPlugin(outputPlugin);
    }
    setOutputPlugins(...outputPlugin) {
        pluginProvider_1.default.getInstance().setOutputPlugins(outputPlugin);
    }
    getOutputPlugins() {
        return pluginProvider_1.default.getInstance().getOutputPlugins();
    }
    enableTracing(input) {
        return this.config.enableTracing(input);
    }
    logNetwork(req, res, next) {
        middleware_1.default.logNetwork(req, res, next);
    }
    getBoundServices() {
        return envService_1.default.getInstance().getBoundServices();
    }
    createWinstonTransport(options) {
        if (!options) {
            options = {};
        }
        if (!options.rootLogger) {
            options.rootLogger = this;
        }
        return (0, winstonTransport_1.default)(options);
    }
    setFramework(framework) {
        config_1.default.getInstance().setFramework(framework);
        requestAccessor_1.default.getInstance().setFrameworkService();
        responseAccessor_1.default.getInstance().setFrameworkService();
    }
    // legacy methods
    forceLogger(framework) {
        this.setFramework(framework);
    }
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
                                "type": interfaces_1.SourceType.Static,
                                "value": value
                            },
                            "output": [
                                interfaces_1.Output.ReqLog
                            ]
                        },
                    ]
                }
            ]);
            return true;
        }
        // set static source and override
        configField[0].source = {
            "type": interfaces_1.SourceType.Static,
            "value": value
        };
        this.config.addConfig([
            {
                "fields": [configField[0]]
            }
        ]);
        return true;
    }
    overrideCustomFieldFormat(format) {
        return this.setCustomFieldsFormat(format);
    }
    setLogPattern() { } // no longer supported
}
exports.default = RootLogger;
//# sourceMappingURL=rootLogger.js.map