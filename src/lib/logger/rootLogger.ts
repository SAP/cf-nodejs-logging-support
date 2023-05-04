import Config from '../config/config';
import {
    ConfigObject, CustomFieldsFormat, Framework, Output, SourceType
} from '../config/interfaces';
import EnvService from '../helper/envService';
import Middleware from '../middleware/middleware';
import RequestAccessor from '../middleware/requestAccessor';
import ResponseAccessor from '../middleware/responseAccessor';
import createTransport from '../winston/winstonTransport';
import { Level } from './level';
import Logger from './logger';
import RecordWriter from './recordWriter';

export default class RootLogger extends Logger {
    private static instance: RootLogger;
    private config = Config.getInstance();

    private constructor() {
        super()
        this.loggingLevelThreshold = Level.Info
    }

    static getInstance(): RootLogger {
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

    setCustomFieldsFormat(format: CustomFieldsFormat) {
        return this.config.setCustomFieldsFormat(format);
    }

    setStartupMessageEnabled(enabled: boolean) {
        return this.config.setStartupMessageEnabled(enabled);
    }

    setSinkFunction(func: (level: string, payload: string) => any) {
        RecordWriter.getInstance().setSinkFunction(func);
    }

    enableTracing(input: string | string[]) {
        return this.config.enableTracing(input);
    }

    logNetwork(req: any, res: any, next: any) {
        Middleware.logNetwork(req, res, next);
    }

    getBoundServices() {
        return EnvService.getInstance().getBoundServices()
    }

    createWinstonTransport(options: any) {
        if (!options) {
            options = {
                level: 'info',
                rootLogger: this
            };
        }
        return createTransport(options);
    }

    setFramework(framework: Framework) {
        Config.getInstance().setFramework(framework);
        RequestAccessor.getInstance().setFrameworkService();
        ResponseAccessor.getInstance().setFrameworkService();
    }

    // legacy methods

    forceLogger(framework: Framework) {
        this.setFramework(framework)
    }

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
                                    "type": SourceType.Static,
                                    "value": value
                                },
                                "output": [
                                    Output.ReqLog
                                ]
                            },
                        ]
                }
            ]);
            return true;
        }

        // set static source and override
        configField[0].source = {
            "type": SourceType.Static,
            "value": value
        };
        this.config.addConfig([
            {
                "fields": [configField[0]]
            }
        ]);
        return true;
    }

    overrideCustomFieldFormat(format: CustomFieldsFormat) {
        return this.setCustomFieldsFormat(format);
    }

    setLogPattern() { } // no longer supported
}
