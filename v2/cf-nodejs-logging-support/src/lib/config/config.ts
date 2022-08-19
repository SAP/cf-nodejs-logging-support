import EnvService from '../core/env-service';
import Level from '../logger/level';
import appLoggingConfig from './config-app-logging.json';
import cfConfig from './config-cf.json';
import cloudLoggingConfig from './config-cloud-logging.json';
import coreConfig from './config-core.json';
import kymaConfig from './config-kyma.json';
import requestConfig from './config-request.json';
import sapPassportConfig from './config-sap-passport.json';
import ConfigValidator from './config-validator';
import { ConfigField, ConfigObject, customFieldsFormat, framework, Source } from './interfaces';
import { isEnvVarEnabled } from './utils';

export default class Config {

    private static instance: Config;

    private config: ConfigObject = {
        "fields": [],
        "settableFields": [],
        "customFieldsFormat": "cloud-logging",
        "reqLoggingLevel": "info",
        "outputStartupMsg": false,
        "framework": "express"
    }

    private msgFields: ConfigField[] = [];
    private reqFields: ConfigField[] = [];
    private contextFields: ConfigField[] = [];
    public updateCacheMsgRecord: boolean;
    public updateCacheReqRecord: boolean;
    public noCacheMsgFields: ConfigField[];
    public noCacheReqFields: ConfigField[];



    private constructor() {
        // this.configHasChanged = true;
        this.updateCacheMsgRecord = true;
        this.updateCacheReqRecord = true;
        this.noCacheMsgFields = [];
        this.noCacheReqFields = [];
    }

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

            Config.instance = new Config();

            if (boundServices["application-logs"] && boundServices["cloud-logs"]) {
                Config.instance.setCustomFieldsFormat("all");
            } else if (boundServices["application-logs"]) {
                Config.instance.setCustomFieldsFormat("application-logging");
                // configFiles.push(appLoggingConfig as ConfigObject);
            } else {
                Config.instance.setCustomFieldsFormat("cloud-logging");
                // configFiles.push(cloudLoggingConfig as ConfigObject);
            }

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

    public getContextFields(): ConfigField[] {
        return Config.instance.contextFields;
    }

    public getDisabledFields(): ConfigField[] {
        const filtered = Config.instance.config.fields!.filter(
            key => {
                return key.disable === true
            }
        );
        return filtered;
    }

    public getCacheMsgFields(): ConfigField[] {
        const filtered = Config.instance.msgFields.filter(
            key => {
                return key._meta?.isCache === true
            }
        );
        return filtered;
    }

    public getCacheReqFields(): ConfigField[] {
        const filtered = Config.instance.reqFields.filter(
            key => {
                return key._meta?.isCache === true
            }
        );
        return filtered;
    }

    public getFramework(): framework {
        const framework = Config.instance.config.framework!;
        return framework;
    }

    public getReqLoggingLevel() {
        return Config.instance.config.reqLoggingLevel;
    }

    public addConfig(configs: ConfigObject[]) {

        configs.forEach(file => {
            const validation = ConfigValidator.isValid(file);
            if (validation != true) {
                const error = JSON.stringify(validation[1]);
                throw new Error("Configuration file is not valid. Please check error: " + error);
            }

            file.fields?.forEach(field => {
                if (field.settable) {
                    this.config.settableFields!.push(field.name);
                    return;
                }

                field._meta = {
                    isEnabled: true,
                    isRedacted: false,
                    isCache: false,
                    isContext: false
                }

                if (field.envVarSwitch) {
                    field._meta.isEnabled = isEnvVarEnabled(field.envVarSwitch)
                }

                if (field.envVarRedact) {
                    field._meta.isRedacted = !isEnvVarEnabled(field.envVarRedact) // if the env var is actually set to true, we do not redact => invert result
                }

                if (field.disable) {
                    field._meta.isEnabled = false;
                }

                // check if cache field
                if (!Array.isArray(field.source)) {
                    if (["static", "env"].includes(field.source.type)) {
                        field._meta.isCache = true;
                    }
                } else {
                    // if Sources[] then only check first source
                    if (["static", "env"].includes(field.source[0].type)) {
                        field._meta.isCache = true;
                    }
                }

                if (field.output?.includes('msg-log')) {
                    this.addToList(this.msgFields, field);

                }

                if (field.output?.includes('req-log')) {
                    this.addToList(this.reqFields, field);

                }

                // check if context field, if true, then save field in list
                if (field.output?.includes("msg-log") && field.output?.includes("req-log")) {
                    if (Array.isArray(field.source)) {
                        const sources = field.source as Source[];
                        for (let index = 0; index < sources.length; index++) {
                            const source = sources[index];
                            if (["req-header", "req-object"].includes((source.type))) {
                                field._meta.isContext = true;
                                this.addToList(this.contextFields, field);
                                break;
                            }
                        }
                    } else {
                        if (["req-header", "req-object"].includes((field.source.type))) {
                            field._meta.isContext = true;
                            this.addToList(this.contextFields, field);
                        }
                    }

                    if (["correlation_id", "tenant_id"].includes(field.name)) {
                        field._meta.isContext = true;
                        this.addToList(this.contextFields, field);
                    }
                }

                if (field._meta.isCache == false) {
                    if (field.output?.includes("msg-log")) {
                        this.addToList(this.noCacheMsgFields, field);
                    }
                    if (field.output?.includes("req-log")) {
                        this.addToList(this.noCacheReqFields, field);
                    }
                }

                const index = Config.instance.getIndex(field.name);

                // if new config field
                if (index === -1) {
                    Config.instance.config.fields!.push(field);
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

            if (file.reqLoggingLevel) {
                Config.instance.config.reqLoggingLevel = file.reqLoggingLevel;
            }

            return;
        });

        this.updateCacheMsgRecord = true;
        this.updateCacheReqRecord = true;
    }

    public setCustomFieldsFormat(format: customFieldsFormat) {
        Config.instance.config.customFieldsFormat = format;
    }

    public setStartupMessageEnabled(enabled: boolean) {
        Config.instance.config.outputStartupMsg = enabled;
    }

    public setFramework(framework: framework): void {
        Config.instance.config.framework = framework;
    }

    public setRequestLogLevel(name: string): void {
        Config.instance.config.reqLoggingLevel = name;
    }

    public enableTracing(input: string[]) {
        for (var i in input) {
            switch (i.toLowerCase()) {
                case "sap_passport":
                    this.addConfig([sapPassportConfig as ConfigObject]);
                    break;
                default:
            }
        }
    }

    public isSettable(key: string) {
        if (this.config.settableFields!.length == 0) return false;
        return this.config.settableFields!.includes(key);
    }

    // get index of field in config
    private getIndex(name: string): number {

        const index = Config.instance.config.fields!.findIndex(
            field => field.name == name
        );

        return index;
    }

    private addToList(list: ConfigField[], field: ConfigField) {
        const index = list.findIndex(
            element => element.name == field.name
        );

        if (index === -1) {
            list.push(field);
        } else {
            list.splice(index, 1, field);
        }
    }
}
