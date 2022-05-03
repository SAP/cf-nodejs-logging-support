import EnvService from '../core/env-service';
import appLoggingConfig from './config-app-logging.json';
import cfConfig from './config-cf.json';
import cloudLoggingConfig from './config-cloud-logging.json';
import coreConfig from './config-core.json';
import kymaConfig from './config-kyma.json';
import requestConfig from './config-request.json';
import ConfigValidator from './config-validator';
import { ConfigField, ConfigObject, customFieldsFormat, framework, Source } from './interfaces';

export default class Config {

    private static instance: Config;

    private config: ConfigObject = {
        "fields": [],
        "customFieldsFormat": "cloud-logging",
        "outputStartupMsg": false,
        "framework": "express"
    }

    private constructor() { }

    public static getInstance(): Config {
        if (!Config.instance) {
            const configFiles: ConfigObject[] = [
                coreConfig as ConfigObject,
                requestConfig as ConfigObject
            ];

            const env = EnvService.getRuntimeName();
            const boundServices = EnvService.getBoundServices();

            if (env == "Kyma") {
                configFiles.push(kymaConfig as ConfigObject);
            } else {
                configFiles.push(cfConfig as ConfigObject);
            }

            if (boundServices["application-logging"]) {
                configFiles.push(appLoggingConfig as ConfigObject);
            } else {
                configFiles.push(cloudLoggingConfig as ConfigObject);
            }

            Config.instance = new Config();

            Config.instance.addConfig(configFiles);
        }

        return Config.instance;
    }

    public getConfig(): ConfigObject {
        return Config.instance.config;
    }

    public getFields(fieldNames?: string[]): ConfigField[] {

        if (fieldNames && fieldNames.length > 0) {
            const result: ConfigField[] = [];
            fieldNames.forEach(name => {
                const index = this.getIndex(name);
                const configField = Config.instance.config.fields![index];
                result.push(configField);
            });
            return result;
        }

        return Config.instance.config.fields!;
    }

    public getMsgFields(): ConfigField[] {
        const filtered = Config.instance.config.fields!.filter(
            key => {
                if (key.output?.includes('msg-log') || key.context == true) {
                    return true;
                }
                return false;
            }
        );
        return filtered;
    }

    public getReqFields(): ConfigField[] {
        const filtered = Config.instance.config.fields!.filter(
            key => {
                return key.output?.includes("req-log")
            }
        );
        return filtered;
    }

    public getContextFields(): ConfigField[] {
        const filtered = Config.instance.config.fields!.filter(
            key => {
                return key.context;
            }
        );
        return filtered;
    }

    public getDisabledFields(): ConfigField[] {
        const filtered = Config.instance.config.fields!.filter(
            key => {
                return key.disable === true
            }
        );
        return filtered;
    }

    public getFramework(): framework {
        const framework = Config.instance.config.framework!;
        return framework;
    }

    public addConfig(configs: ConfigObject[]) {

        configs.forEach(file => {
            const validation = ConfigValidator.isValid(file);
            if (validation != true) {
                const error = JSON.stringify(validation[1]);
                throw new Error("Configuration file is not valid. Please check error: " + error);
            }

            file.fields?.forEach(field => {

                // check if response fields marked as context fields
                if (field.context) {
                    if (Array.isArray(field.source)) {
                        field.source.forEach(source => {
                            if (source.type == ("res-header" || "res-object")) {
                                throw new Error("Configuration file is not valid. Field '" + field.name + "' is declared as context field and has a response source.");
                            }
                        });
                    } else if (field.source.type == 'res-header' || 'res-object') {
                        throw new Error("Configuration file is not valid. Field '" + field.name + "' is declared as context field and has a response source.");
                    }
                }

                const index = Config.instance.getIndex(field.name);

                // if new config field
                if (index === -1) {
                    Config.instance.config.fields!.push(field);
                    return;
                }

                // replace object in array with new field
                Config.instance.config.fields!.splice(index, 1, field);
            })

            if (file.outputStartupMsg != undefined) {
                Config.instance.config.outputStartupMsg = file.outputStartupMsg;
            }

            if (file.customFieldsFormat) {
                Config.instance.config.customFieldsFormat = file.customFieldsFormat;
            }

            if (file.framework) {
                Config.instance.config.framework = file.framework;
            }

            return;
        });
    }

    public setCustomFieldsFormat(format: customFieldsFormat) {
        Config.instance.config.customFieldsFormat = format;
    }

    public setStartupMessageEnabled(enabled: boolean) {
        Config.instance.config.outputStartupMsg = enabled;
    }

    // delete framework specific fields that are not supported
    public compressFields(framework: framework): void {
        Config.instance.config.fields!.forEach(field => {
            if (field.source && Array.isArray(field.source) && field.source.length > 0) {
                let i = 0
                while (i < field.source.length) {
                    if (field.source[i].framework !== undefined && !field.source[i].framework!.includes(framework)) {
                        field.source.shift();
                    } else {
                        i++;
                    }
                }
            }
        });
    }

    // get index of field in config
    private getIndex(name: string): number {

        const index = Config.instance.config.fields!.findIndex(
            field => field.name == name
        );

        return index;
    }
}
