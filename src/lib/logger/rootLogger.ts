import Config from '../config/config.js';
import {
    ConfigObject, CustomFieldsFormat, CustomFieldsTypeConversion, Framework
} from '../config/interfaces.js';
import EnvService from '../helper/envService.js';
import Middleware from '../middleware/middleware.js';
import RequestAccessor from '../middleware/requestAccessor.js';
import ResponseAccessor from '../middleware/responseAccessor.js';
import { StdoutOutputPlugin } from '../plugins/stdoutOutput.js';
import { OutputPlugin } from '../plugins/interfaces.js';
import PluginProvider from '../helper/pluginProvider.js';
import createTransport from '../winston/winstonTransport.js';
import { Level } from './level.js';
import { Logger } from './logger.js';

export default class RootLogger extends Logger {
    private static instance: RootLogger;
    private stdoutOutput: StdoutOutputPlugin;
    private config = Config.getInstance();

    private constructor() {
        super()
        this.loggingLevelThreshold = Level.Info
        this.stdoutOutput = new StdoutOutputPlugin();
        PluginProvider.getInstance().setOutputPlugins([this.stdoutOutput]);
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
        this.stdoutOutput.setSinkFunction(func);
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

    /**
     * Migration note (since v8.0.0):
     *
     * The following legacy APIs were removed and are intentionally unavailable:
     * - forceLogger(framework: Framework) -> use setFramework(framework)
     * - overrideNetworkField(field: string, value: string) -> use custom field instead
     * - overrideCustomFieldFormat(format: CustomFieldsFormat) -> use setCustomFieldsFormat(format)
     * - setLogPattern() -> use setSinkFunction(...) for custom output formatting
     *
     * See the upgrade guide:
     * - docs/migration.md
     * - https://sap.github.io/cf-nodejs-logging-support/migration/
     */
}
