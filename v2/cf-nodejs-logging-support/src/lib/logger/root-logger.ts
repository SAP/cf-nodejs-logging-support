import Config from "../config/config"
import { ConfigObject, customFieldsFormat } from "../config/interfaces"
import EnvService from "../core/env-service";
import Level from "./level"
import Logger from "./logger"
import RecordWriter from "./record-writer";
import Middleware from "../middleware/middleware";

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

    enableTracing() {
        return this.config.enableTracing();
    }

    logNetwork(req: any, res: any, next: any) {
        Middleware.logNetwork(req, res, next);
    }

    registerCustomFields(object: Object) { }

    getBoundServices() {
        return EnvService.getBoundServices()
    }

    // legacy methods
    overrideNetworkField(field: string, value: string) { }
    overrideCustomFieldFormat(value: string) { }
    setLogPattern() { }
    createWinstonTransport() { }
    forceLogger(logger: string) {
    }
}
