import Config from "../config/config"
import { ConfigObject, customFieldsFormat, framework } from "../config/interfaces"
import EnvService from "../helper/envService";
import Level from "./level"
import Logger from "./logger"
import Middleware from "../middleware/middleware";
import RecordWriter from "./recordWriter";
import ResponseAccessor from "../middleware/responseAccessor";
import RequestAccessor from "../middleware/requestAccessor";
import createTransport from "../winston/winstonTransport";

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

    getConfigFields(...fieldNames: string[]) {
        return this.config.getConfigFields(fieldNames);
    }

    addConfig(...configObject: ConfigObject[]) {
        return this.config.addConfig(configObject);
    }

    clearFieldsConfig() {
        return this.config.clearFieldsConfig();
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
    overrideNetworkField(field: string, value: string): boolean {
        if (field == null && typeof field != "string") {
            return false;
        }
        // get field and override config
        const configField = this.config.getConfigFields([field]);

        // if new field, then add as static field
        if (configField.length == 0) {
            this.config.addConfig([
                {
                    "fields":
                        [
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
                "fields":
                    [configField[0]]
            }
        ]);
        return true;
    }

    overrideCustomFieldFormat(value: customFieldsFormat) {
        return this.setCustomFieldsFormat(value);
    }
    setLogPattern() { } // no longer supported
}
