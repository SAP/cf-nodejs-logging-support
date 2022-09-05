import Config from "../config/config"
import { ConfigObject, customFieldsFormat, framework } from "../config/interfaces"
import EnvService from "../core/env-service";
import Level from "./level"
import Logger from "./logger"
import Middleware from "../middleware/middleware";
import RecordWriter from "./record-writer";
import ResponseAccessor from "../middleware/response-accessor";
import RequestAccessor from "../middleware/request-Accessor";
import createTransport from "../winston/winston-transport";

export default class RootLogger extends Logger {
    private static instance: RootLogger;
    private config = Config.getInstance();

    private constructor() {
        super()
        this.loggingLevelThreshold = Level.INFO
    }

    public static getInstance(): RootLogger {
        if (!RootLogger.instance) {
            RootLogger.instance = new RootLogger();
        }

        return RootLogger.instance;
    }

    getConfig() {
        return this.config.getConfig();
    }

    getFields(...fieldNames: string[]) {
        return this.config.getFields(fieldNames);
    }

    addConfig(...configObject: ConfigObject[]) {
        return this.config.addConfig(configObject);
    }

    setCustomFieldsFormat(format: customFieldsFormat) {
        return this.config.setCustomFieldsFormat(format);
    }

    setStartupMessageEnabled(enabled: boolean) {
        return this.config.setStartupMessageEnabled(enabled);
    }

    setSinkFunction(f: Function) {
        RecordWriter.getInstance().setSinkFunction(f);
    }

    enableTracing(...input: string[]) {
        return this.config.enableTracing(input);
    }

    logNetwork(req: any, res: any, next: any) {
        Middleware.logNetwork(req, res, next);
    }

    getBoundServices() {
        return EnvService.getBoundServices()
    }

    createWinstonTransport(options: any) {
        if (!options) {
            options = {
                level: 'info'
            };
        }
        options.logMessage = this.logMessage;
        return createTransport(options);
    };

    forceLogger(logger: framework) {
        Config.getInstance().setFramework(logger);
        RequestAccessor.getInstance().setFrameworkService();
        ResponseAccessor.getInstance().setFrameworkService();
    }

    // legacy methods
    overrideNetworkField() {
        //to do: create a config file and override in config
    }
    overrideCustomFieldFormat(value: customFieldsFormat) {
        return this.setCustomFieldsFormat(value);
    }
    setLogPattern() { } // no longer supported
}
