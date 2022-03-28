import Level from "./level"
import Logger from "./logger"
import Config from "../config/config"
import { ConfigObject, customFieldsFormat } from "../config/interfaces"
import EnvManagement from "../core/env-management";

export default class RootLogger extends Logger {
    private config = Config.getInstance();

    constructor() {
        super()
        this.loggingLevelThreshold = Level.INFO
    }

    getConfig() {
        return this.config.getConfig();
    }

    getFields(...fieldNames: string[]) {
        return this.config.getFields(fieldNames);
    }

    getMsgFields() {
        return this.config.getMsgFields();
    }

    getReqFields() {
        return this.config.getReqFields();
    }

    getDeactivatedFields() {
        return this.config.getDeactivatedFields();
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

    setSinkFunction(_f: Function) { }

    enableTracing() { }

    logNetwork(_req: any, _res: any, _next: any) { }

    registerCustomFields(_object: Object) { }

    getBoundServices() { 
        return EnvManagement.getBoundServices()
    }

    // legacy methods
    overrideNetworkField(_field: string, _value: string) { }
    overrideCustomFieldFormat(_value: string) { }
    setLogPattern() { }
    createWinstonTransport() { }
    forceLogger(_logger: string) { }
}
