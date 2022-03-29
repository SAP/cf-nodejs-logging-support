import { MergedConfig, ConfigObject, ConfigField, customFieldsFormat } from './interfaces';
import * as coreConfig from './config-core.json';
import * as requestConfig from './config-request.json';
import * as cfConfig from './config-cf.json';
import * as kymaConfig from './config-kyma.json';
import * as appLoggingConfig from './config-app-logging.json';
import * as cloudLoggingConfig from './config-cloud-logging.json';
import EnvService from '../core/env-service';

export default class Config {

    private static instance: Config;

    private config: MergedConfig = {
        "fields": [],
        "customFieldsFormat": "cloud-logging",
        "outputStartupMsg": false
    }

    private constructor() {}

    public static getInstance(): Config {
        if (!Config.instance) {
            let env = EnvService.getRuntimeName();
            let boundServices = EnvService.getBoundServices();
            let envConfig = () => {
                if (env == "Kyma") {
                    return kymaConfig as ConfigObject;
                }
                return cfConfig as ConfigObject;
            }
            let boundServiceConfig = () => {
                if (boundServices["application-logging"]) {
                    return appLoggingConfig as ConfigObject;
                }

                return cloudLoggingConfig as ConfigObject;
            }

            Config.instance = new Config();

            Config.instance.addConfig([
                coreConfig as ConfigObject,
                requestConfig as ConfigObject,
                envConfig(),
                boundServiceConfig()
            ]);
        }

        return Config.instance;
    }

    public getConfig(): ConfigObject {
        return Config.instance.config;
    }

    public getFields(fieldNames: string[]): ConfigField[] {

        if (fieldNames.length > 0) {
            let result: ConfigField[] = [];
            fieldNames.forEach(name => {
                let index = this.getIndex(name);
                let configField = Config.instance.config.fields[index];
                result.push(configField);
            });
            return result;
        }

        return Config.instance.config.fields!;
    }

    public getMsgFields(): ConfigField[] {
        const filtered = Config.instance.config.fields.filter(
            key => {
                return key.output?.includes('msg-log');
            }
        );
        return filtered;
    }

    public getReqFields(): ConfigField[] {
        const filtered = Config.instance.config.fields.filter(
            key => {
                return key.output?.includes("req-log")
            }
        );
        return filtered;
    }

    public getDisabledFields(): ConfigField[] {
        const filtered = Config.instance.config.fields.filter(
            key => {
                return key.disable === true
            }
        );
        return filtered;
    }

    public addConfig(configs: ConfigObject[]) {

        configs.forEach(file => {
            file.fields?.forEach(field => {

                let index = Config.instance.getIndex(field.name);

                // if new config field
                if (index === -1) {
                    Config.instance.config.fields.push(field);
                    return;
                }

                // replace object in array with new field
                Config.instance.config.fields.splice(index, 1, field);
            })

            if (file.outputStartupMsg != undefined) {
                Config.instance.config.outputStartupMsg = file.outputStartupMsg;
            }

            if (file.customFieldsFormat) {
                Config.instance.config.customFieldsFormat = file.customFieldsFormat;
            }
        });
    }

    public setCustomFieldsFormat(format: customFieldsFormat) {
        Config.instance.config.customFieldsFormat = format;
    }

    public setStartupMessageEnabled(enabled: boolean) {
        Config.instance.config.outputStartupMsg = enabled;
    }

    // get index of field in config
    private getIndex(name: string): number {

        let index = Config.instance.config.fields.findIndex(
            field => field.name == name
        );

        return index;
    }
}
