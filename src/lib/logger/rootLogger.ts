import Config from '../config/config';
import {
    ConfigObject, CustomFieldsFormat, CustomFieldsTypeConversion, Framework, Output, SourceType
} from '../config/interfaces';
import EnvService from '../helper/envService';
import Middleware from '../middleware/middleware';
import RequestAccessor from '../middleware/requestAccessor';
import ResponseAccessor from '../middleware/responseAccessor';
import { DefaultOutput } from '../plugins/defaultOutput';
import { OutputPlugin } from '../plugins/interfaces';
import PluginProvider from '../helper/pluginProvider';
import createTransport from '../winston/winstonTransport';
import { Level } from './level';
import { Logger } from './logger';

export default class RootLogger extends Logger {
    private static instance: RootLogger;
    private defaultOutput: DefaultOutput;
    private config = Config.getInstance();

    private constructor() {
        super()
        this.loggingLevelThreshold = Level.Info
        this.defaultOutput = new DefaultOutput();
        PluginProvider.getInstance().setOutputPlugins([this.defaultOutput]);
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

    setCustomFieldsTypeConversion(conversion: CustomFieldsTypeConversion) {
        return this.config.setCustomFieldsTypeConversion(conversion);
    }

    setStartupMessageEnabled(enabled: boolean) {
        return this.config.setStartupMessageEnabled(enabled);
    }

    setSinkFunction(func: (level: string, payload: string) => any) {
        this.defaultOutput.setSinkFunction(func);
    }

    addOutputPlugin(outputPlugin: OutputPlugin) {
        PluginProvider.getInstance().addOutputPlugin(outputPlugin);
    }

    setOutputPlugins(...outputPlugin: OutputPlugin[]) {
        PluginProvider.getInstance().setOutputPlugins(outputPlugin);
    }

    getOutputPlugins(): OutputPlugin[] {
        return PluginProvider.getInstance().getOutputPlugins();
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

    createWinstonTransport(options?: any) {
        if (!options) {
            options = {};
        }
        if (!options.rootLogger) {
            options.rootLogger = this;
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
