import EnvService from '../helper/envService';
import EnvVarHelper from '../helper/envVarHelper';
import Cache from '../logger/cache';
import ConfigValidator from './configValidator';
import cfConfig from './default/config-cf.json';
import coreConfig from './default/config-core.json';
import kymaConfig from './default/config-kyma.json';
import requestConfig from './default/config-request.json';
import sapPassportConfig from './default/config-sap-passport.json';
import { ConfigField, ConfigObject, CustomFieldsFormat, CustomFieldsTypeConversion, Framework, Output, Source, SourceType } from './interfaces';

export default class Config {

    private static instance: Config;
    private validator: ConfigValidator;
    private envVarHelper: EnvVarHelper;

    private msgFields: ConfigField[] = [];
    private reqFields: ConfigField[] = [];
    private contextFields: ConfigField[] = [];
    noCacheMsgFields: ConfigField[];
    noCacheReqFields: ConfigField[];

    private config: ConfigObject = {
        "fields": [],
        "customFieldsFormat": CustomFieldsFormat.Default,
        "reqLoggingLevel": "info",
        "outputStartupMsg": false,
        "framework": Framework.Express
    }

    private constructor() {
        this.validator = new ConfigValidator()
        this.envVarHelper = EnvVarHelper.getInstance()
        this.noCacheMsgFields = [];
        this.noCacheReqFields = [];
    }

    static getInstance(): Config {
        if (!Config.instance) {
            Config.instance = new Config();

            const configFiles: ConfigObject[] = [
                coreConfig as ConfigObject,
                requestConfig as ConfigObject
            ];

            const envService = EnvService.getInstance();
            const env = envService.getRuntimeName();
            const boundServices = envService.getBoundServices();

            if (env == "Kyma") {
                configFiles.push(kymaConfig as ConfigObject);
            } else {
                configFiles.push(cfConfig as ConfigObject);
            }

            if (boundServices["application-logs"] && boundServices["cloud-logging"]) {
                Config.instance.setCustomFieldsFormat(CustomFieldsFormat.All);
            } else if (boundServices["application-logs"]) {
                Config.instance.setCustomFieldsFormat(CustomFieldsFormat.ApplicationLogging);
            } else {
                Config.instance.setCustomFieldsFormat(CustomFieldsFormat.CloudLogging);
            }

            Config.instance.setCustomFieldsTypeConversion(CustomFieldsTypeConversion.Stringify)
            Config.instance.addConfig(configFiles);
        }

        return Config.instance;
    }

    getConfig(): ConfigObject {
        return Config.instance.config;
    }

    getConfigFields(fieldNames?: string[]): ConfigField[] {
        if (fieldNames && fieldNames.length > 0) {
            const result: ConfigField[] = [];
            fieldNames.forEach(name => {
                const index = this.getIndex(name);
                if (index === -1) {
                    return;
                }
                const configField = Config.instance.config.fields![index];
                result.push(configField);
            });
            return result;
        }

        return Config.instance.config.fields!;
    }

    getContextFields(): ConfigField[] {
        return Config.instance.contextFields;
    }

    getDisabledFields(): ConfigField[] {
        const filtered = Config.instance.config.fields!.filter(
            key => {
                return key.disable === true
            }
        );
        return filtered;
    }

    getCacheMsgFields(): ConfigField[] {
        const filtered = Config.instance.msgFields.filter(
            key => {
                return key._meta?.isCache === true
            }
        );
        return filtered;
    }

    getCacheReqFields(): ConfigField[] {
        const filtered = Config.instance.reqFields.filter(
            key => {
                return key._meta?.isCache === true
            }
        );
        return filtered;
    }

    getFramework(): Framework {
        const framework = Config.instance.config.framework!;
        return framework;
    }

    getReqLoggingLevel(): string {
        let level = Config.instance.config.reqLoggingLevel
        return level ? level : "info";
    }

    addConfig(configs: ConfigObject[]) {
        configs.forEach(file => {
            const validation = this.validator.isValid(file);
            if (validation != true) {
                const error = JSON.stringify(validation[1]);
                throw new Error("Configuration file is not valid. Please check error: " + error);
            }

            file.fields?.forEach(field => {

                const index = Config.instance.getIndex(field.name);

                // if new config field
                if (index === -1) {
                    Config.instance.config.fields!.push(field);
                }

                // replace object in array with new field
                Config.instance.config.fields!.splice(index, 1, field);


                if (field.settable || !field.source) {
                    return;
                }

                field._meta = {
                    isEnabled: true,
                    isRedacted: false,
                    isCache: false,
                    isContext: false
                }

                if (field.envVarSwitch) {
                    field._meta.isEnabled = this.envVarHelper.isVarEnabled(field.envVarSwitch)
                }

                if (field.envVarRedact) {
                    // if the env var is actually set to true, we do not redact => invert result
                    field._meta.isRedacted = !this.envVarHelper.isVarEnabled(field.envVarRedact)
                }

                if (field.disable) {
                    field._meta.isEnabled = false;
                }

                // check if cache field
                if (this.isCacheable(field.source)) {
                    field._meta.isCache = true;
                }

                if (field.output?.includes(Output.MsgLog)) {
                    this.addToList(this.msgFields, field);
                }

                if (field.output?.includes(Output.ReqLog)) {
                    this.addToList(this.reqFields, field);
                }

                // check if context field, if true, then save field in list
                if (field.isContext) {
                    field._meta.isContext = true;
                    this.addToList(this.contextFields, field);
                }

                if (field._meta.isCache == false) {
                    if (field.output?.includes(Output.MsgLog)) {
                        this.addToList(this.noCacheMsgFields, field);
                    }
                    if (field.output?.includes(Output.ReqLog)) {
                        this.addToList(this.noCacheReqFields, field);
                    }
                }
            })

            if (file.outputStartupMsg != undefined) {
                Config.instance.config.outputStartupMsg = file.outputStartupMsg;
            }

            if (file.customFieldsFormat) {
                Config.instance.config.customFieldsFormat = file.customFieldsFormat;
            }

            if (file.customFieldsTypeConversion) {
                Config.instance.config.customFieldsTypeConversion = file.customFieldsTypeConversion;
            }

            if (file.framework) {
                Config.instance.config.framework = file.framework;
            }

            if (file.reqLoggingLevel) {
                Config.instance.config.reqLoggingLevel = file.reqLoggingLevel;
            }

            return;
        });

        // if config has changed, cache will have to be updated
        const cache = Cache.getInstance();
        cache.markDirty();
    }

    setCustomFieldsFormat(format: CustomFieldsFormat) {
        Config.instance.config.customFieldsFormat = format;
    }

    setCustomFieldsTypeConversion(conversion: CustomFieldsTypeConversion) {
        Config.instance.config.customFieldsTypeConversion = conversion;
    }

    setStartupMessageEnabled(enabled: boolean) {
        Config.instance.config.outputStartupMsg = enabled;
    }

    setFramework(framework: Framework) {
        Config.instance.config.framework = framework;
    }

    setRequestLogLevel(name: string) {
        Config.instance.config.reqLoggingLevel = name;
    }

    enableTracing(input: string | string[]) {
        let names = [];
        if (typeof input == "string")
            names.push(input);
        else
            names = input;
        for (let i in names) {
            switch (names[i].toLowerCase()) {
                case "sap_passport":
                    this.addConfig([sapPassportConfig as ConfigObject]);
                    break;
                default:
            }
        }
    }

    isSettable(name: string) {
        const index = this.getIndex(name);
        if (index === -1) {
            return false;
        }
        const configField = Config.instance.config.fields![index];
        return configField.settable === true;
    }

    clearFieldsConfig() {
        this.config.fields = [];
        this.msgFields = [];
        this.reqFields = [];
        this.contextFields = [];
        this.noCacheMsgFields = [];
        this.noCacheReqFields = [];
        const cache = Cache.getInstance();
        cache.markDirty();
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

    private isCacheable(s: Source | Source[]): boolean {
        let sources = Array.isArray(s) ? s : [s]

        for (let i in sources) {
            let source = sources[i]
            switch (source.type) {
                case SourceType.Static:
                    return true;
                case SourceType.Env:
                    // if this is the last source it does not matter, if the env var exists
                    if (i == (sources.length - 1).toString()) return true

                    // otherwise we have to check if there is a value to be sure that the field can be cached.
                    let value;
                    if (source.path) {
                        value = EnvVarHelper.getInstance().resolveNestedVar(source.path);
                    } else {
                        value = process.env[source.varName!];
                    }
                    if (value != null) return true;
                    break;
                default:
                    return false;
            }
        }
        return false;
    }
}
